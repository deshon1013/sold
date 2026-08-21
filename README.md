# Sold

Monorepo with an npm-workspaces layout:

```
apps/
  frontend/   React + TypeScript + Vite
  backend/    Express + TypeScript
```

## Getting started

```sh
npm install
```

## Development

Run both apps together (frontend on http://localhost:5173, backend on http://localhost:4000):

```sh
npm run dev
```

Or run one at a time:

```sh
npm run dev:frontend
npm run dev:backend
```

The frontend dev server proxies `/api/*` requests to the backend, so calls like
`fetch('/api/health')` work without CORS setup during development.

## Build

```sh
npm run build
```

## Lint

```sh
npm run lint
```

## Workspaces

Each app is its own npm workspace under `apps/`, with its own `package.json`.
Run a script in just one workspace with `npm run <script> -w frontend` or
`-w backend`, or add a dependency to one with `npm install <pkg> -w backend`.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the dev/staging/production setup
(Vercel + AWS Lambda + per-environment Supabase/R2).
