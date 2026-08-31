# Hosting and test sharing

## Production hosting

Ironpath is prepared for a Cloudflare-compatible Worker deployment with a D1 database binding. Build the site before saving or deploying a release.

```bash
pnpm build
```

Deployments need:

- A Worker-compatible host.
- A configured D1 database binding.
- Applied database migrations.
- Public access if community testers should be able to open the site without an account.

## Temporary testing links

For short-term testing from another device, use a temporary Cloudflare tunnel connected to the production-style local runtime, not the development preview. The development preview can render the app but may not reliably support all server features for external visitors.

The host machine must remain online and keep both the local runtime and tunnel running. Temporary tunnel addresses are not permanent and should not be presented as production URLs.

## Pre-release checklist

- Build completes successfully.
- Group lookup returns valid JSON.
- Character activity and quest sync fail gracefully when profiles are unavailable.
- Workspace creation and saved settings work.
- Public access does not require a ChatGPT account.
- Mobile navigation and desktop layouts remain readable.
- The deployed URL, not only localhost, is tested for API responses.
