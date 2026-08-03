# MemoNest

A full-stack note-taking application.

## Repository structure

```
backend/   — Express, Sequelize and PostgreSQL API
frontend/  — Next.js, Tailwind CSS and TanStack Query client
```

## Backend setup

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend URL:
```
http://localhost:5000
```

Notes API:
```
http://localhost:5000/api/note
```

## Frontend setup

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend URL:
```
http://localhost:3000
```

## Required environment variables

| Variable                 | Used by    | Description                                    |
| ------------------------ | ---------- | ---------------------------------------------- |
| `PORT`                   | backend    | Port the API server listens on (default 5000)  |
| `DB_HOST`                | backend    | PostgreSQL host (default localhost)            |
| `DB_PORT`                | backend    | PostgreSQL port (default 5432)                 |
| `DB_NAME`                | backend    | PostgreSQL database name                       |
| `DB_USER`                | backend    | PostgreSQL username                            |
| `DB_PASSWORD`            | backend    | PostgreSQL password                            |
| `DB_DIALECT`             | backend    | Database dialect (default postgres)            |
| `NODE_ENV`               | backend    | Node environment (default development)         |
| `FRONTEND_URL`           | backend    | Allowed CORS origin (default http://localhost:3000) |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | API base URL (default http://localhost:5000/api) |

Never commit real secrets — use the `.env.example` templates and keep real values in local `.env` / `.env.local` files.

## Main technologies

Backend:
- Node.js
- Express
- PostgreSQL
- Sequelize
- Joi

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Lucide React
