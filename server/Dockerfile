# Start from the official Golang image for building
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install git (required for go mod) and ca-certificates
RUN apk add --no-cache git ca-certificates

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go app (static binary)
RUN CGO_ENABLED=0 GOOS=linux go build -o tracker main.go

# Start a minimal image for running
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/tracker .

# Copy .env if you want to provide defaults (optional)
COPY .env .env

# Expose the default port
EXPOSE 8090

# Run the binary
CMD ["./tracker"]
