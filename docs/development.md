# Development

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Starts the local development preview. |
| `pnpm build` | Creates the deployable application build. |
| `pnpm start` | Starts the Cloudflare-compatible local runtime from the build output. |
| `pnpm test` | Runs the project test suite. |
| `pnpm lint` | Runs static checks. |
| `pnpm format` | Formats supported source files. |
| `pnpm db:generate` | Generates database migrations after schema changes. |

## Recommended verification

1. Run the local preview and check the affected feature.
2. Run `pnpm build`.
3. For API-related changes, run the production-style local server with `pnpm start`.
4. Verify group lookup, workspace saving, and any changed API route.
5. Run tests when changing data processing or persistence behavior.

## Development notes

- Keep user-facing messaging clear about data availability and profile privacy.
- Avoid treating unavailable public profiles as missing accounts.
- Keep source data, cache behavior, and fallback behavior explicit in feature changes.
- Preserve mobile accessibility and readable text sizing when changing UI.

## Database changes

When changing `db/schema.ts`:

1. Generate a migration with `pnpm db:generate`.
2. Review the generated migration in `drizzle/`.
3. Test against a fresh local database when possible.
4. Include the migration in the same change as the schema update.
