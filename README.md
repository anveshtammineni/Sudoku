# Sudoku Web Application

A full-stack Sudoku experience with a React + Vite + Tailwind frontend, an Express API, JWT auth, and optional MongoDB persistence.

## Project Structure

```text
client/   React + Vite app
server/   Express API, auth, Sudoku generation, persistence
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
copy .env.example .env
```

3. Start development mode:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.

## Production Build

```bash
npm run build
npm run start
```

## Features

- Random Sudoku puzzle generation with difficulty modes
- Backtracking solver and validation API
- JWT auth with protected routes
- Dashboard with recent games and leaderboard data
- Dark/light theme toggle
- Keyboard controls, mobile keypad, hints, undo/redo, timer, pause/resume
- Responsive glassmorphism UI with Tailwind CSS

## Environment

The app runs without MongoDB, but if `MONGODB_URI` is set and reachable, user and game data are persisted in MongoDB.
