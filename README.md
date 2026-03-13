# Lankoping Web

Official web application for lankoping.se.

Built with TanStack Start, React 19, TypeScript, and PostgreSQL.

## Features

- Public and protected route structure
- Admin pages for content and operations
- Authentication and access control
- Ticketing and blog/news sections
- Server-side runtime with Nitro output

## Tech Stack

- Frontend: React 19 + TanStack Router/Start
- Runtime/Build: Vite + Vinxi
- Styling: Tailwind CSS v4 + Radix UI components
- Data: PostgreSQL + Drizzle ORM (with migrations)
- Tooling: TypeScript, ESLint, Prettier, Vitest

## Requirements

- Node.js 22+
- npm 10+
- PostgreSQL (local or remote)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

If no `.env.example` exists yet, create `.env` manually using the variables below.

3. Start development server:

```bash
npm run dev
```

The app runs on http://localhost:3000.

## Environment Variables

Minimum required variables:

```env
DATABASE_URL=postgres://user:password@host:5432/dbname
GEMINI_API_KEY=your_key
GOOGLE_API_KEY=your_key
```

Optional:

```env
VITE_INSTRUMENTATION_SCRIPT_SRC=https://example.com/script.js
AUTO_INIT=true
PORT=3000
NITRO_HOST=0.0.0.0
NODE_ENV=production
```

Demo admin account defaults:

```env
DEMO_TESTER_EMAIL=tester@lankoping.se
DEMO_TESTER_PASSWORD=TesterDemo2026!
DEMO_TESTER_NAME=Tester
```

The server ensures this account exists on startup and applies demo scoping rules for it.

## Demo Tester Account (Locked Admin)

This project includes a built-in demo admin account intended for safe demonstrations.

- Account name: `Tester`
- Account role: `organizer`
- Auto-provisioned on server start (created only if missing)

### What Tester can do

- Access admin routes and features
- Use normal admin workflows for tickets, agreements, and departures
- Update own profile and own password

### What Tester cannot do

- View other users or list full user data
- Create, delete, lock, or update other user accounts
- Change passwords for other users
- Access or mutate records outside Tester-owned/demo-scoped data
- View activity logs for other users

### Disable/enable from normal admin UI

You can manage demo account availability directly in the regular admin interface:

1. Go to `/admin/users`
2. Use the `Demo-konton` panel
3. Click `Inaktivera demo` or `Aktivera demo`

This updates account `active` state server-side for configured demo accounts.

### Scope model used for Tester

The restrictions are enforced server-side (not only in UI):

- User listings are scoped to Tester only
- Ticket operations are scoped to tickets issued by Tester
- Agreements are scoped to agreements created by Tester
- Departure (`avgang`) requests are scoped to records created by or targeting Tester
- Logs are scoped to entries where Tester is the actor

### Environment overrides

You can override the demo account credentials with:

- `DEMO_TESTER_EMAIL`
- `DEMO_TESTER_PASSWORD`
- `DEMO_TESTER_NAME`

If you change `DEMO_TESTER_EMAIL`, the server will ensure that email exists as the demo user on startup.

## Available Scripts

- `npm run dev`: Start local dev server on port 3000
- `npm run build`: Generate routes, type-check, and build production output
- `npm run build:docker`: Build optimized Docker-targeted output
- `npm run start`: Run production server from `.output/server/index.mjs`
- `npm run serve`: Preview a production build
- `npm run test`: Run Vitest test suite
- `npm run lint`: Run ESLint
- `npm run format`: Format files with Prettier
- `npm run format:check`: Check formatting
- `npm run generate:routes`: Regenerate TanStack route tree

## Database (Drizzle)

Drizzle is configured in `drizzle.config.ts` with schema at `src/server/db/schema.ts` and migrations in `drizzle/migrations`.

Common workflow:

```bash
# generate SQL migration files from schema changes
npx drizzle-kit generate

# apply migrations using your preferred migration runner
# (project-specific migration execution depends on your deploy/runtime flow)
```

## Docker Deployment

This repository includes:

- `Dockerfile`: multi-stage build using Node 22
- `docker-compose.yml`: production service config, healthcheck, and Traefik labels

Build and run with Docker Compose:

```bash
docker compose up -d --build
```

Container serves on internal port `3000`.

## Project Structure

```text
src/
	routes/          Route tree and page modules
	components/      Shared UI and feature components
	server/          Server-side modules, DB schema, functions
server/
	plugins/         Nitro startup plugin(s)
drizzle/
	migrations/      SQL migrations
public/            Static assets
```

## Security Notes

- Do not commit real credentials to this repository.
- Keep secrets only in environment variables or secret managers.
- Rotate any credential that may have been exposed previously.

### Flavortown Reviewer Note

Flavortown reviewers will not be granted access to the admin interfaces at https://lankoping.se/admin.
This area contains personal data, and granting external access would be a major breach of Lankoping's data-sharing policies.

## License

Source-available only. This project is public for transparency and security review, but redistribution or reuse is not permitted without explicit written permission.