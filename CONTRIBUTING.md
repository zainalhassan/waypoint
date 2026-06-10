# Contributing

## Development setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Clone the repo
3. `cp .env.example .env` and set `AUTH_SECRET`
4. `docker compose up --build`

## Making schema changes

```bash
# Edit prisma/schema.prisma, then:
docker compose exec app npx prisma migrate dev --name describe_change
```

## Seed data

```bash
docker compose exec app npm run db:seed
```

## Linting

```bash
docker compose exec app npm run lint
```

## Design changes

1. Update `design/tokens.json` first
2. Sync Figma Variables (see `docs/DESIGN_SYSTEM.md`)
3. Update `app/globals.css` CSS variables
4. Update components — do not hardcode colors

## Pull request checklist

- [ ] Migrations included if schema changed
- [ ] Server actions validate input with Zod
- [ ] User data scoped by `session.user.id`
- [ ] README/docs updated if behavior changed
- [ ] `docker compose up --build` works from clean state

## Branch naming

- `feature/short-description`
- `fix/short-description`

## Commit messages

Use imperative mood, focused on why:

- `Add grad school pipeline template`
- `Fix Sankey empty state on new pipelines`
