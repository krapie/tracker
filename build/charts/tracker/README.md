# tracker

> Do not use this Helm chart as it is currently not working correctly. It is under development and may not function as expected.

Installs Tracker, a real-time collaborative infrastructure event tracking system.

## Prerequisites

- Kubernetes 1.24+
- Helm 3+

## Architecture

This Helm chart deploys a complete tracker stack including:

- **Tracker API Server**: Main application server (Go)
- **Yorkie Server**: Real-time collaboration backend
- **MongoDB**: Database
- **MinIO**: S3-compatible object storage

## Install Helm Chart

```bash
helm install tracker ./charts/tracker -n tracker --create-namespace
```

## Uninstall Helm Chart

```bash
helm uninstall tracker -n tracker
```

## Upgrading Chart

```bash
helm upgrade tracker ./charts/tracker -n tracker
```

## Configuration

See `values.yaml` for all configurable options.

### Tracker Application Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `tracker.env.port` | Server port | `"8090"` |
| `tracker.env.mongoUri` | MongoDB connection URI | `"mongodb://mongodb.mongodb.cluster.local:27017"` |
| `tracker.env.mongoDb` | MongoDB database name | `"tracker"` |
| `tracker.env.discordWebhookUrl` | Discord webhook URL for notifications | `""` |
| `tracker.env.frontendUrl` | Frontend URL for CORS | `"http://localhost:5173"` |
| `tracker.env.minioEndpoint` | MinIO endpoint | `"minio.minio.cluster.local:9000"` |
| `tracker.env.minioAccessKey` | MinIO access key | `"minioadmin"` |
| `tracker.env.minioSecretKey` | MinIO secret key | `"minioadmin"` |
| `tracker.env.minioBucket` | MinIO bucket name | `"default-storage"` |

### Yorkie Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `yorkie.enabled` | Enable Yorkie server deployment | `true` |
| `yorkie.deployment.image.repository` | Yorkie Docker image repository | `"yorkieteam/yorkie"` |
| `yorkie.deployment.image.tag` | Yorkie Docker image tag | `"0.5.7"` |
| `yorkie.deployment.args.dbConnectionUri` | MongoDB connection URI for Yorkie | `"mongodb://mongodb.mongodb.svc.cluster.local:27017/yorkie"` |
| `yorkie.deployment.args.dbName` | Yorkie database name | `"yorkie"` |

### MongoDB Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `mongodb.enabled` | Enable MongoDB deployment | `true` |
| `mongodb.auth.enabled` | Enable MongoDB authentication | `false` |
| `mongodb.auth.rootUser` | MongoDB root user | `"admin"` |
| `mongodb.auth.rootPassword` | MongoDB root password | `"adminpassword"` |
| `mongodb.persistence.enabled` | Enable persistence | `true` |
| `mongodb.persistence.size` | PVC size | `1Gi` |

### MinIO Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `minio.enabled` | Enable MinIO deployment | `true` |
| `minio.auth.rootUser` | MinIO root username | `"minioadmin"` |
| `minio.auth.rootPassword` | MinIO root password | `"minioadmin"` |
| `minio.persistence.enabled` | Enable persistence | `true` |
| `minio.persistence.size` | PVC size | `1Gi` |

### Ingress Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.ingressClassName` | Ingress class name | `"nginx"` |
| `ingress.hosts.enabled` | Enable hostname-based routing | `false` |
| `ingress.hosts.trackerHost` | Tracker API hostname | `"tracker-api.yorkie.dev"` |

## Examples

### Basic Installation

```bash
helm install tracker ./charts/tracker -n tracker --create-namespace
```

### Installation with Custom Values

```bash
helm install tracker ./charts/tracker -n tracker --create-namespace \
  --set tracker.env.discordWebhookUrl="https://discord.com/api/webhooks/your-webhook" \
  --set tracker.env.frontendUrl="https://tracker.yourcompany.com" \
  --set ingress.enabled=true \
  --set ingress.hosts.enabled=true \
  --set ingress.hosts.trackerHost="tracker-api.yourcompany.com"
```

### Installation with External MongoDB

```bash
helm install tracker ./charts/tracker -n tracker --create-namespace \
  --set mongodb.enabled=false \
  --set tracker.env.mongoUri="mongodb://your-external-mongodb:27017"
```

### Installation with External MinIO

```bash
helm install tracker ./charts/tracker -n tracker --create-namespace \
  --set minio.enabled=false \
  --set tracker.env.minioEndpoint="your-external-minio:9000" \
  --set tracker.env.minioAccessKey="your-access-key" \
  --set tracker.env.minioSecretKey="your-secret-key"
```

## Accessing Services

### Port Forwarding (Development)

```bash
# Tracker API
kubectl port-forward svc/tracker -n tracker 8090:8090

# Yorkie API  
kubectl port-forward svc/yorkie -n yorkie 8080:8080

# MinIO Console
kubectl port-forward svc/minio -n minio 9001:9001

# MongoDB (if needed)
kubectl port-forward svc/mongodb -n mongodb 27017:27017
```

### Production Access

For production deployments, enable ingress:

```yaml
ingress:
  enabled: true
  hosts:
    enabled: true
    trackerHost: "tracker-api.yourcompany.com"
```

## Monitoring and Health Checks

The chart includes health check endpoints:

- Tracker API: `GET /healthz`
- Yorkie API: `GET /healthz`

Liveness and readiness probes are configured automatically.

## Security Considerations

1. **Change default credentials**: Update MinIO credentials for production
2. **Enable MongoDB authentication**: Set `mongodb.auth.enabled=true`
3. **Use secrets**: Store sensitive values in Kubernetes secrets
4. **Network policies**: Implement network policies to restrict traffic
5. **TLS certificates**: Configure proper TLS certificates for ingress

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n tracker
```

### View Logs
```bash
kubectl logs -f deployment/tracker -n tracker
kubectl logs -f deployment/yorkie -n yorkie
```

### Common Issues

1. **MongoDB Connection Issues**: Ensure MongoDB is ready before tracker starts
2. **MinIO Bucket Creation**: Check if default bucket was created successfully
3. **Service Discovery**: Verify service names match configuration

## Development

### Local Development Setup

```bash
# Install with NodePort services for local access
helm install tracker-dev ./charts/tracker -n tracker-dev --create-namespace \
  --set tracker.service.type=NodePort \
  --set yorkie.service.type=NodePort \
  --set ingress.enabled=false
```

### Testing

```bash
# Run chart tests
helm test tracker -n tracker
```
