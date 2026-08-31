# Data sources and limitations

## RuneScape data

Ironpath uses public RuneScape services for Group Ironman Hiscores, individual Hiscores, and public Adventurer's Log activity. The app may also reference RuneScape Wiki material when presenting curated informational content.

## Expected limitations

- Public settings control whether a character can be read.
- A display name must match exactly, including spaces and special characters.
- Activity availability can differ between members despite apparently similar public settings.
- RuneScape endpoints can rate-limit requests, be unavailable, or change their response format.
- Public activity feeds are not a complete account-completion record.
- Quest completion and unlock state can only be as accurate as the connected public source allows.

## How Ironpath responds

Ironpath caches selected lookup responses to reduce unnecessary requests and can show a recent saved result when a refresh fails. A missing log entry should be presented as unavailable data, not as proof that a player has not completed content.

## Responsible use

Please use reasonable lookup frequency, respect RuneScape and community-site terms, and avoid entering private account details into Ironpath.
