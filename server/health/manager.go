package health

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/krapie/tracker/db"
	"github.com/krapie/tracker/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	checkerMu sync.Mutex
	running   = map[string]chan struct{}{} // endpointID -> stop channel
)

// StopHealthChecker stops the checker goroutine for a given endpointID.
func StopHealthChecker(endpointID string) {
	checkerMu.Lock()
	defer checkerMu.Unlock()
	if stop, exists := running[endpointID]; exists {
		close(stop)
		delete(running, endpointID)
	}
}

func StartAllHealthCheckers() {
	collection := db.GetHealthCollection()
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return
	}
	var endpoints []models.HealthEndpoint
	if err := cursor.All(context.Background(), &endpoints); err != nil {
		return
	}
	for _, ep := range endpoints {
		StartHealthChecker(ep.ID.Hex(), ep.URL, ep.Threshold, ep.Interval)
	}
}

// RestartHealthChecker stops and starts the checker for a given endpoint.
func RestartHealthChecker(endpointID, url string, threshold int, interval int) {
	StopHealthChecker(endpointID)
	StartHealthChecker(endpointID, url, threshold, interval)
}

func getDiscordWebhookURL() string {
	url := os.Getenv("DISCORD_WEBHOOK_URL")
	if url == "" {
		// fallback or log warning if needed
	}
	return url
}

func getFrontendURL() string {
	url := os.Getenv("FRONTEND_URL")
	if url == "" {
		// fallback or log warning if needed
	}
	return url
}

// Create an issue in MongoDB and return its ID as a string
func createIssueForDown(endpointName, endpointURL string) (string, error) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	issue := models.Issue{
		Name:      fmt.Sprintf("Down: %s (%s)", endpointName, timestamp),
		CreatedAt: time.Now().UnixMilli(),
		Status:    1, // Ongoing
	}
	collection := db.GetIssuesCollection()
	res, err := collection.InsertOne(context.Background(), issue)
	if err != nil {
		return "", err
	}
	oid, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", fmt.Errorf("failed to get issue ID")
	}
	return oid.Hex(), nil
}

// Send Discord notification with issue URL
func sendDownNotification(endpointName, issueID string, errMsg string) {
	webhookURL := getDiscordWebhookURL()
	if webhookURL == "" {
		log.Printf("Discord webhook not configured, cannot send DOWN notification for %s (issueID=%s)", endpointName, issueID)
		return // No webhook configured
	}

	frontendURL := getFrontendURL()
	if frontendURL == "" {
		log.Printf("Frontend URL not configured, cannot send DOWN notification for %s (issueID=%s)", endpointName, issueID)
		return // No frontend URL configured
	}
	issueURL := fmt.Sprintf("%s/issues/%s", frontendURL, issueID)
	payload := map[string]string{
		"content": fmt.Sprintf(
			"🚨 **Health Check DOWN** 🚨\n"+
				"- **Endpoint:** `%s`\n"+
				"- **Issue:** [View Issue](%s)\n"+
				"- **Error:** `%s`",
			endpointName, issueURL, errMsg,
		),
	}
	body, _ := json.Marshal(payload)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Failed to send Discord notification for %s (%s): %v", endpointName, issueURL, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("Discord webhook returned status %d for %s (%s)", resp.StatusCode, endpointName, issueURL)
	}
}

func StartHealthChecker(endpointID, url string, threshold int, interval int) {
	checkerMu.Lock()
	defer checkerMu.Unlock()
	if _, exists := running[endpointID]; exists {
		return // already running
	}
	stop := make(chan struct{})
	running[endpointID] = stop
	go func() {
		failCount := 0
		if interval <= 0 {
			interval = 30 // default to 30 seconds if not set
		}
		wasDown := false
		for {
			select {
			case <-stop:
				return
			default:
				status := -1 // unknown by default
				client := http.Client{Timeout: 5 * time.Second}
				resp, clientErr := client.Get(url)

				// compute status and errMsg (reason)
				var reason string
				if clientErr == nil && resp != nil && resp.StatusCode >= 200 && resp.StatusCode < 400 {
					status = 1 // up
					failCount = 0
					wasDown = false
					reason = ""
				} else {
					failCount++
					log.Printf("Health check failed for %s: %v (failCount=%d)", url, clientErr, failCount)
					if failCount >= threshold {
						status = 0 // down
						if !wasDown {
							// Fetch endpoint name for notification
							objIDTmp, errObj := primitive.ObjectIDFromHex(endpointID)
							endpointName := url
							if errObj == nil {
								var ep models.HealthEndpoint
								coll := db.GetHealthCollection()
								if err := coll.FindOne(context.Background(), bson.M{"_id": objIDTmp}).Decode(&ep); err == nil {
									endpointName = ep.Name
								}
							}
							// build error message to both persist and notify
							errMsg := ""
							if clientErr != nil {
								errMsg = clientErr.Error()
							} else if resp != nil {
								errMsg = fmt.Sprintf("HTTP %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
							}
							// Create issue and then send notification with issue URL
							go func() {
								issueID, issueErr := createIssueForDown(endpointName, url)
								if issueErr != nil {
									log.Printf("Failed to create issue for %s: %v", endpointName, issueErr)
									return
								}
								sendDownNotification(endpointName, issueID, errMsg)
							}()
							reason = errMsg
							wasDown = true
						} else {
							// already down, try to set a reason if available
							if clientErr != nil {
								reason = clientErr.Error()
							} else if resp != nil {
								reason = fmt.Sprintf("HTTP %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
							}
						}
					} else {
						status = 1 // still considered up until threshold reached
						reason = ""
					}
				}

				// Convert endpointID string to ObjectID and persist status/failCount/reason
				objID, oidErr := primitive.ObjectIDFromHex(endpointID)
				if oidErr == nil {
					update := bson.M{"status": status, "failCount": failCount}
					update["reason"] = reason

					db.GetHealthCollection().UpdateByID(
						context.Background(),
						objID,
						bson.M{"$set": update},
					)
				}
				time.Sleep(time.Duration(interval) * time.Second)
			}
		}
	}()
}
