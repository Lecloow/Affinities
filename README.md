# Affinities — comitedepromo2026.fr

> Full-stack matchmaking platform built for my high school's Valentine's Day event — **300+ students** participated.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)](https://golang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat&logo=render&logoColor=white)](https://comitedepromo2026.fr)


## What is this?

My school committee (Comite de promo) wanted to organize a Valentine's Day matchmaking event. So I designed and built the platform from scratch.

Deployed under real constraints — actual deadline, actual users, actual consequences if it broke.


## Architecture

```
┌─────────────────┐        ┌──────────────────────┐
│  React Frontend  │ ──────▶│   Go Backend (v2)    │
│  (TypeScript)    │        │   Gin + PostgreSQL   │
└─────────────────┘        └──────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │   PostgreSQL   │
                              │  (production)  │
                              └────────────────┘
```

- **Frontend:** React + TypeScript, deployed on Render
- **Backend v1:** Python (FastAPI) — shipped fast for the initial event
- **Backend v2 (in progress):** Go (Gin) — full rewrite
- **CI/CD:** GitHub Actions
- **API Testing:** Bruno


## Why the Go Rewrite?

The Python backend did the job, but had real issues: slow response times, minimal security, and it was partially AI-generated.
I'm not interested in deploying AI spaghetti code, I am here to learn.

| | Python v1 | Go v2 |
|---|---|---|
| **Code ownership** | Partially AI-generated | 100% hand-written |
| **Database** | Unoptimized queries | Indexing & connection pooling |
| **Performance** | ~50ms avg response | ~10ms avg response |
| **Security** | Minimal input validation | Strict validation, rate limiting, proper auth |
| **Concurrency** | Single-threaded ASGI | Native goroutines |

Same logic on the frontend: original HTML/CSS → React + TypeScript rewrite, currently in progress.


## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend (v2) | Go, Gin |
| Database | PostgreSQL |
| CI/CD | GitHub Actions |
| Deployment | Render |
| API Testing | Bruno |


## Running Locally

### Backend (Go)

Dev:
```bash
cd backend-go
cp ../.env.example .env   # fill in your DB credentials
go run .
```

Prod:
Build command
```bash
cd backend-go && go build
```
Start command
```bash
cd backend-go && ./backend
```

A Bruno collection covering all API endpoints is available in the `/bruno` folder — import it directly to test the API without setup. (You may need to fill the baseUrl)

### Frontend

Rewrite in progress.


## Impact

- **330 students** participated
- Live at [comitedepromo2026.fr](https://comitedepromo2026.fr)


## What I Learned

- Don't forget date conversion, because the server was based in UTC when Paris was in UTC+1
- You can run as many test as you want something will break in prod
- Tradeoffs between shipping fast and owning your code
- Debugging in production when real users are affected (I don't recommend it)
- CI/CD, environment management, cloud deployment


## License

GPL-3.0 — see [LICENSE](./LICENSE)

---

Made with ❤️ by [Thomas Conchon](https://github.com/Lecloow)