# DevTweetHub

Developer community platform — social feed, profiles, direct messages, and notifications.

## Project structure

```
DevTweetHub-V1/
├── backend/          # NestJS REST API + WebSocket (MongoDB)
│   └── src/
│       ├── auth/         # JWT login, register, password reset
│       ├── users/        # Profiles and follow graph
│       ├── posts/        # Feed posts
│       ├── comments/     # Post comments
│       ├── messages/     # Direct messages
│       ├── notifications/
│       ├── uploads/      # GridFS file uploads
│       ├── email/        # Transactional email + cron digests
│       ├── events/       # Realtime event bus (Socket.IO)
│       ├── ws/           # WebSocket gateway
│       └── common/       # Shared guards and decorators
│
└── frontend/         # Next.js web client
    ├── messages/     # i18n locale files (en, hi)
    ├── public/       # Static assets
    └── src/
        ├── app/          # App Router pages
        ├── components/   # UI, layout, and feature components
        ├── config/       # App, auth, and env config
        ├── i18n/         # Internationalization
        ├── lib/          # API client, hooks, utilities
        ├── provider/     # React context providers
        ├── store/        # Zustand state
        ├── styles/       # Global CSS modules
        └── types/        # Shared TypeScript types
```

## Quick start

### Backend (port 4000)

```bash
cd backend
npm install
# configure .env with MONGODB_URI, JWT_SECRET, etc.
npm run start:dev
```

### Frontend (port 3000)

```bash
cd frontend
npm install
# configure .env with API_URL if needed
npm run dev
```

## Scripts

| Location   | Command           | Description              |
|------------|-------------------|--------------------------|
| `backend/` | `npm run start:dev` | API with hot reload    |
| `backend/` | `npm run test:e2e`  | End-to-end tests       |
| `frontend/`| `npm run dev`       | Next.js dev server     |
| `frontend/`| `npm run build`     | Production build       |
| `frontend/`| `npm test`          | Jest unit tests        |
