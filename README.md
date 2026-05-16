# IFWF Study Workspace

A browser-local productivity workspace built with React, Vite, and Tailwind CSS.

## Features

- Dashboard with boards, tasks, study sessions, and progress.
- Kanban board view with drag-and-drop card status updates.
- Pomodoro timer with session logging.
- Goal tracker for daily and weekly objectives.
- AI assistant for study suggestions and quick guidance.
- LocalStorage persistence only — no authentication or server required.

## Pages

- `/` — Dashboard
- `/boards` — Boards list
- `/board/:id` — Board detail and kanban view
- `/pomodoro` — Pomodoro timer
- `/goals` — Goals tracker
- `/ai` — AI assistant

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- This app is intentionally simplified for quick local productivity.
- All data stays in the browser via LocalStorage.
- Authentication has been removed for a simpler workflow.
