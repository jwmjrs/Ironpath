# Quest rewards prototype

Local review route: `/prototypes/quest-rewards`. Also available from the main app's Progression menu as **Quest Rewards**, replacing the old Unlocks entry.

The catalogue is a saved, attributed snapshot of https://runescape.wiki/w/Quests/Rewards retrieved 2026-10-17: 295 quest entries and 1,877 reward bullets, including indented follow-up conditions. The Wiki page revision is 36812543 and the reward template revision is 36812524. This table does not cover every miniquest or necessarily every newer quest returned by RuneMetrics; unmatched entries never imply completion. Rewards are read from the bundled JSON without repeat Wiki requests.

A quest opens a persistent detail panel. A search covers titles and reward text. Status and experience-skill filters narrow the list. Completed entries retain a green background and remain fully selectable. At small widths, choosing a quest scrolls the details into view.

The first visit shows **explicit example progress**, not actual account data. Sync reads Ironpath's existing `/api/quests?player=…` public RuneMetrics endpoint. Only exact complete/completed statuses count as completed. Started, not started, and unknown stay separate. Progress snapshots are saved per character in this browser; they do not sync browser storage between devices. Resyncing a character on another device retrieves that character's public statuses again. A failed sync preserves the previous successful snapshot. The prototype does not change any existing roadmap checkboxes or shared workspace records.

Regenerate the reward catalogue from a MediaWiki `action=parse` JSON response containing `text|revid`:

```
python3 scripts/reference/extract-quest-rewards.py INPUT.json TEMPLATE.json OUTPUT.json
```

`TEMPLATE.json` is the MediaWiki query response for `Template:Quest rewards table` with `prop=revisions&rvprop=ids`. Attribution and licence links are displayed in the prototype. No publishing or source push was performed for this prototype.
