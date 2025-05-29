# Tracker Server

## Setup

1. Install dependencies:
 
```bash
go mod tidy
```

2. Start the development server:

```bash
go run main.go
```

## Endpoints

- `GET /api/issues/` — List all notes
- `POST /api/issues/` — Create a new note (JSON: `{ "name": "tracker-event name-date" }`)
