# Tracker

![Showcase](./image/showcase.png)

Tracker is real-time collaborative infrastructure event tracking system.

## Features

- Create issue on infrastructure events
- Real-time event tracking
- Playbook integration

## Setup

1. Setup Yorkie bcakend if you are not using Yorkie SaaS:

```bash
docker-compose -f ./docker/docker-compose.yml up -d
```

2. Setup Tracker backend:

```bash
go run ./backend/main.go
```

3. Install Tracker frontend dependencies:
 
```bash
npm install
```

4. Start the Tracker frontend development server:

```bash
npm run dev
```

## Roadmap

- [x] Real-time collaborative event feed (Yorkie integration)
- [x] Backend API for issue management
- [ ] Playbook creation and editing UI
- [ ] Markdown support for event messages (TBD)
- [ ] Image embedding in event feed (MinIO/S3 integration)
- [ ] LLM-powered summary: Link issues to playbooks (Ollama integration)
- [ ] GitHub OAuth authentication and authorization
- [ ] Health check for infrastructure events
- [ ] Notification and paging system
- [ ] Automatic issue creation from infrastructure events (webhooks/integrations)
