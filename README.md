# Ironpath

Ironpath is a community-made companion for RuneScape 3 Group Ironman groups. It brings group lookup, shared planning, progression references, repeatables, farming routes, shop runs, invention resources, and task ideas into one responsive web app.

> Ironpath is an unofficial fan project. It is not affiliated with or endorsed by Jagex or RuneScape.

## What it does

- Look up a Group Ironman team and view member standings.
- Keep the selected member consistent throughout relevant parts of the app.
- Read public RuneScape Hiscores and public Adventurer's Log activity.
- Browse a group drop archive and historic HiScore snapshots.
- Track repeatable daily, weekly, and monthly activities.
- Use group-specific shared settings and task completion states.
- Browse progression, skill training, familiars, invention components, farming routes, shop runs, and general Ironman references.
- Generate focused, practical Ironman task ideas.

## Before you begin

Ironpath relies on publicly available RuneScape information. Results can be unavailable when a profile is private, a display name is entered incorrectly, RuneScape temporarily limits requests, or a public source changes its format.

For the best experience, make each group member's public RuneMetrics/Adventurer's Log visibility available in-game and confirm the exact display-name spelling.

## Run locally

### Requirements

- Node.js 22 or later
- pnpm

### Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

### Production-style local run

```bash
pnpm build
pnpm start
```

This project uses a Cloudflare-compatible runtime. Use the production-style command when validating API-powered features such as group lookup, workspace saving, Adventurer's Log activity, and character sync.

## Data and privacy

Ironpath uses publicly available RuneScape data only when you request a lookup. Group preferences and shared tracking information are stored in the application's workspace database. Review the in-app Privacy and Data page before sharing a workspace with others.

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Hosting and test sharing](docs/hosting.md)
- [Data sources and limitations](docs/data-sources.md)
- [Contributing](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)

## Project status

Ironpath is under active community testing. Feedback on accuracy, useful Ironman workflows, visual clarity, and mobile usability is especially welcome.

## Credits

Concept created by Justjay btw, with AI-assisted development and community feedback.
