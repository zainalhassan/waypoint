# Waypoint

**Mark every milestone on the path** — track job applications, grad school, sales leads, and more. Visualize stage flows with Sankey diagrams.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** + Prisma
- **Auth.js** (credentials)
- **ECharts** (Sankey)
- **shadcn/ui** + Tailwind CSS v4
- **Docker** (primary dev & deploy path)

## Quick start (Docker)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
cp .env.example .env
# Edit AUTH_SECRET in .env (min 32 chars): openssl rand -base64 32

docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

### Seed demo data

```bash
docker compose exec app npm run db:seed
```

Demo login: `demo@waypoint.app` / `demo12345`

## Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Dev: Postgres + hot reload |
| `docker compose --profile prod up --build` | Production-like build |
| `docker compose exec app npm run db:migrate` | Create migration (dev) |
| `docker compose exec app npm run db:seed` | Seed demo data |
| `docker compose down -v` | Stop and wipe database |

## Project structure

```
app/           Next.js routes
components/    UI components (aligned with design/figma)
design/        Stack-agnostic tokens + Figma map
lib/           Auth, Prisma, pipelines, Sankey
actions/       Server actions
prisma/        Schema, migrations, seed
docker/        Entrypoint scripts
docs/          Architecture, deployment, contributing
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Design system & Figma](docs/DESIGN_SYSTEM.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## Environment variables

See [.env.example](.env.example).

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js secret (32+ chars) |
| `AUTH_URL` | Public app URL |

## License

Private — all rights reserved.
