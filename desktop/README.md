# Ironpath Desktop

Ironpath Desktop packages the web experience as a focused macOS or Windows program. It loads the public Ironpath test site by default, so live group data and updates are available without a separate local server.

## Development

Run `pnpm desktop:dev` to open the installed app shell.

To point it at a local preview instead, start Ironpath locally and set `IRONPATH_DESKTOP_URL` to its address before launching the desktop shell.

## Installers

Run `pnpm desktop:mac` on macOS to make a `.dmg` installer. Windows installers are built natively by the included GitHub Actions workflow and downloaded from its build artifacts. Finished local installers are placed in `release/`.
