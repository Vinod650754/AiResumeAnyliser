# AI Resume Builder + ATS Analyzer

Production-grade MERN stack application with JWT auth, AI-assisted resume authoring, ATS analysis, PDF generation, email delivery, analytics, version history, live job matching, interview prep, and premium animated UI.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express, MongoDB Atlas, JWT, Nodemailer
- AI: OpenAI-compatible API

## Workspace Commands

```bash
npm install
npm run dev:server
npm run dev --workspace client -- --host 127.0.0.1
```

## Environment

Copy:

- `server/.env.example` to `server/.env`
- `client/.env.example` to `client/.env`

## Deploy

- Frontend: Vercel using `client`
- Backend: Render or Railway using `server`
