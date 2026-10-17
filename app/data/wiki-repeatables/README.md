# RuneScape Wiki repeatable activity cache

Reviewed October 16, 2026 using live MediaWiki revisions, rather than older search-engine snippets. `manifest.json` records source authorship, revision IDs, timestamps, permanent links, exclusions, and the reviewed checklist's scope. Wikitext snapshots preserve the source tables, requirements, and reset exceptions for offline review. Source text belongs to RuneScape Wiki contributors and retains the Wiki's licensing terms.

The app and dashboard both import `../repeatable-activities.json`. It is a curated Ironman checklist: related claims and shop packs are grouped, Daily Challenges and Ports are supported by their own source pages, and existing monthly entries are retained. Passive farm/base-camp routines are not represented as daily resets. Wiki tables themselves mix timed resets, accumulating stock, growth, and recommended collection schedules; descriptions preserve those distinctions. Checkmarks remain manual and do not automatically reset or imply an in-game reward is available.

Run `node scripts/refresh-wiki-repeatables.mjs` from the repository root to refresh the source cache. Review the source diff and reconcile the curated JSON before updating `checkedOn` in the manifest. Fetching alone updates `fetchedOn`, never the verified date. Run `node --test tests/repeatable-activities.test.mjs` and the app build after changes.

Guthixian Cache now opens after 800 deposited memories, has no timed reset, and requires 35 Divination. It belongs outside the daily/weekly checklists. The Gorajo hoardstalker's daily card claim is historical following Dungeoneering Remastered.
