# DOODLZ — "Draw. Guess. Repeat."

> A production-grade, real-time multiplayer drawing and guessing web application engineered with an authoritative Node.js/Socket.IO backend, HTML5 Canvas engine, React frontend, and MySQL persistence.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-black.svg)](https://socket.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange.svg)](https://www.mysql.com/)

---

## 📖 Overview

**DOODLZ** is an online multiplayer party game designed with a modern SaaS/game hybrid aesthetic. One player draws an assigned secret word in real time on an interactive HTML5 canvas while opponents submit guesses through a live chat feed. The server acts as the authoritative source of truth for all game mechanics—managing room lifecycles, timer countdowns, secret word secrecy, stroke relaying, and dynamic speed-based scoring.

Designed for high polish, responsiveness, and zero client-side cheating.

---

## 🏗️ System Architecture

DOODLZ implements a strict **authoritative client-server architecture**. Non-drawers never receive the secret word, scores and timers are computed on the backend, and drawing actions are converted to lightweight vector coordinate events rather than heavy raster base64 frames.

```mermaid
flowchart TD
    subgraph Client["React Client (Vite)"]
        UI[Modern SaaS/Game UI]
        Canvas[HTML5 Canvas Engine]
        Chat[Live Guess & Chat Feed]
        SocketClient[Socket.IO Client Hook]
    end

    subgraph Server["Node.js + Express Backend"]
        SocketServer[Socket.IO Server]
        RoomMgr[Room Manager]
        GameMgr[Authoritative Game Manager]
        ScoreMgr[Speed-Weighted Scoring Engine]
        WordMgr[Curated Word Repository]
    end

    subgraph Database["MySQL Persistence"]
        DB[(MySQL Database)]
        Pool[mysql2 Connection Pool]
    end

    UI --> SocketClient
    Canvas -->|Drawing Events (x, y, color, size)| SocketClient
    Chat -->|Guesses & Messages| SocketClient
    SocketClient <-->|WebSocket Bi-directional| SocketServer

    SocketServer --> RoomMgr
    SocketServer --> GameMgr
    GameMgr --> ScoreMgr
    GameMgr --> WordMgr

    GameMgr -.->|Match History & Leaderboard| Pool
    Pool -.-> DB
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, HTML5 Canvas API, Vanilla CSS Design System, Lucide Icons |
| **Real-Time Layer** | Socket.IO Client / Server (WebSockets + Polling fallback) |
| **Backend** | Node.js, Express.js (ES Modules), Authoritative State Engines |
| **Database** | MySQL (with `mysql2/promise` pooled connection and graceful offline standby) |
| **Configuration** | `dotenv` for environment isolation |
| **VCS & Workflow** | Git, GitHub, Conventional Commits |

---

## 📁 Repository Structure

```
DOODLZ/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets & favicon
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── canvas/          # HTML5 Canvas & toolbars
│   │   │   ├── chat/            # Real-time chat & guess box
│   │   │   ├── common/          # Navbar, badges, modal dialogs
│   │   │   ├── game/            # Game layout, round indicators
│   │   │   ├── lobby/           # Create / Join forms
│   │   │   └── scoreboard/      # Live player scores & final podium
│   │   ├── context/             # Global GameContext & providers
│   │   ├── hooks/               # useSocket, useCanvas, useGameState
│   │   ├── pages/               # Home, Lobby, Room, Game, Results
│   │   ├── services/            # socket.js singleton, api.js
│   │   ├── utils/               # Coordinate scaling, validation, scoring helpers
│   │   ├── App.jsx              # React Router setup
│   │   ├── index.css            # Modern CSS tokens & design system
│   │   └── main.jsx             # React entrypoint
│   ├── .env.example             # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend Authority (Node.js + Express)
│   ├── src/
│   │   ├── config/              # db.js (MySQL pool with graceful fallback)
│   │   ├── game/                # GameManager, RoomManager, ScoreManager, WordManager
│   │   ├── socket/              # Modular handlers (room, game, drawing, chat)
│   │   ├── utils/               # Sanitization & input validation
│   │   └── server.js            # Express + HTTP + Socket.IO server entry
│   ├── .env.example             # Backend environment template
│   └── package.json
│
├── .gitignore                   # Root gitignore protecting secrets & build artifacts
├── package.json                 # Monorepo convenience scripts
└── README.md                    # Project documentation
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```ini
PORT=5000
CLIENT_URL=http://localhost:5173

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=doodlz
```

> **Note**: Transient multiplayer gameplay functions authoritatively in-memory. If MySQL is not running or not configured, the backend starts in graceful standby mode and logs diagnostic guidance.

### Client (`client/.env`)
Copy `client/.env.example` to `client/.env`:

```ini
VITE_SERVER_URL=http://localhost:5000
```

---

## 🚀 Installation & Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/swarnamithra14/DOODLZ.git
cd DOODLZ
```

### 2. Install Dependencies
You can install dependencies for both client and server from the root directory:
```bash
npm run install:all
```
*(Or individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Start the Authoritative Backend Server
In a dedicated terminal:
```bash
npm run dev:server
```
*(Or inside `server/`: `npm run dev`)*
- Server runs at: `http://localhost:5000`
- REST Health Check: `http://localhost:5000/api/health`

### 4. Start the React Frontend
In a second terminal:
```bash
npm run dev:client
```
*(Or inside `client/`: `npm run dev`)*
- Open your browser at: `http://localhost:5173`

---

## 🧪 Testing the Connection

1. Start both the backend server and frontend client.
2. Visit `http://localhost:5173`.
3. The **Navbar** will show `Server Online (x ms)`.
4. Click **"Test Real-Time Socket Ping"** to verify sub-millisecond bidirectional WebSocket communication.
5. Click **"Refresh Backend Status"** to inspect server uptime and MySQL status.
6. Check `http://localhost:5000/api/health` in your browser or with `curl` for JSON health status.

---

## 🎨 UI / UX Principles

- **SaaS / Game Hybrid**: Clean typography (`Outfit` + `Plus Jakarta Sans`), off-white neutrals, crisp dark text, and subtle vibrant indigo/rose accents.
- **Intentional Spacing**: Generous padding, rounded cards (`border-radius: 16px`), and soft layered box shadows.
- **Responsive**: Desktop-first with fluid canvas coordinate normalization for tablet and mobile screens.
- **Anti-Cheat by Design**: Non-drawers never receive secret word data over the wire.

---

## 🗺️ Roadmap & Implementation Phases

- [x] **Module 0**: Project Foundation, React/Vite, Express/Socket.IO, MySQL pooled setup, Git repo structure
- [ ] **Module 1 & Phase 2**: Frontend UI Design (Landing page, Lobby, Waiting room, Game UI, Results)
- [ ] **Phase 3**: Local Canvas Engine & Drawing Tools
- [ ] **Phase 4**: Authoritative Room and Game State Engines
- [ ] **Phase 5**: Real-Time Multiplayer Relay (Drawing sync, Chat/Guesses, Speed Scoring, Timers)
- [ ] **Phase 6**: UI Polish, Animations, Reconnection Handling
- [ ] **Phase 7**: End-to-End Multi-Tab Testing, Production Build & Deployment

---

## 👤 Author & Contributor

- **Swarna Mithra** ([@swarnamithra14](https://github.com/swarnamithra14))
