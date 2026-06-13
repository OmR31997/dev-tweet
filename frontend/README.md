# DevTweetHub (Web)

The DevTweetHub web client — a developer community feed: posts, profiles,
follows, direct messages, and notifications.

Built with **Next.js** (App Router) + **Zustand** (client state) +
**TanStack Query** (server state) + **Tailwind CSS**, talking to the
DevTweetHub **NestJS** backend.

## Getting started

```bash
npm install --legacy-peer-deps
npm run dev
```

The app runs on http://localhost:3000 and proxies `/api/*` to the backend
(`http://localhost:4000` by default — see `.env`). Realtime DMs and
notifications connect over socket.io to `NEXT_PUBLIC_SOCKET_URL`.

Make sure the backend (`../backend`) is running first:

```bash
cd ../backend && npm run start:dev
```

## Environment

| Variable                 | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `API_URL`                | Upstream NestJS backend origin (proxy target).  |
| `NEXT_PUBLIC_API_PREFIX` | Browser-side API prefix (default `/api`).        |
| `NEXT_PUBLIC_SOCKET_URL` | socket.io server URL for realtime features.      |

## App structure

- `src/lib/api` — typed REST client, services, and React Query hooks.
- `src/components/features/*` — feed, explore, profile, messages, notifications,
  settings, auth.
- `src/app/(auth)` — login / register / password reset.
- `src/app/(protected)` — the authenticated app shell + screens.
