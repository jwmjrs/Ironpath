# Architecture

Ironpath is a React application built with Vinext and Vite. It is designed for deployment to a Cloudflare-compatible Worker environment.

## Application layers

| Layer | Responsibility |
| --- | --- |
| `app/` | Pages, UI state, feature views, and API routes. |
| `app/api/` | Server-side endpoints for Hiscores, activities, drops, quest access, familiars, and workspaces. |
| `app/data/` | Curated static references, such as task and progression content. |
| `db/` | Database connection details and Drizzle schema definitions. |
| `drizzle/` | Database migrations. |
| `public/` | Images, web manifest, service-worker assets, and static files. |

## Data flow

1. A visitor searches for a Group Ironman group.
2. The server reads the public group Hiscores page and individual public Hiscores data.
3. Relevant public activity and progression data is requested for each selected member.
4. The interface combines the results with locally curated Ironman guidance.
5. Shared workspace preferences and tracking states are stored in the workspace database.

## Storage

The application uses a D1-compatible SQLite database for:

- Workspace records and shared settings.
- Cached Hiscore responses.
- HiScore snapshots.
- Rate-limit counters.
- Group drop archive records.

Local development uses a local database. A deployed environment needs a configured database binding and migrations.

## API routes

| Route | Purpose |
| --- | --- |
| `/api/hiscores` | Looks up Group Ironman standings and member skills. |
| `/api/hiscores/history` | Returns stored group snapshots. |
| `/api/activities` | Reads public Adventurer's Log activity. |
| `/api/drops` | Builds and searches the group drop archive. |
| `/api/quests` | Retrieves quest-access information used by progression-aware features. |
| `/api/familiars` | Provides Summoning familiar data and filtering. |
| `/api/workspace` | Creates, reads, and updates group workspaces. |

## External sources

RuneScape data is public-source dependent. Ironpath does not control the availability, format, completeness, or freshness of third-party RuneScape endpoints.
