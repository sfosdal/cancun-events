# Port Angeles Events

Event feed and calendar for Port Angeles, WA and the north Olympic Peninsula:
the Clallam County Fairgrounds, Civic Field (the Lefties' ballpark), the Port
Angeles High School Performing Arts Center, 7 Cedars Casino in Sequim, and in
Port Townsend Fort Worden and the Jefferson County Fairgrounds — with the
Seattle clubs' seasons (Seahawks, Mariners, Kraken, Storm, Reign, Sounders) in
a Teams view.

Live at **https://portangeles.here.events/** once the domain is wired (GitHub
Pages, built by the Actions workflow once a day at noon Pacific).

A sister of lqa-events, built the way Forks and Everett were: everything
that makes this Port Angeles's is `site/city.js` (every team, venue, type,
default, share-code registry and string), `site/index.html`,
`scripts/fetch-events.mjs` (the sources), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, `scripts/feeds.mjs` (shared: the venue-feed adapters), the manifest and icons (the
Olympic ridge over the strait, rendered from `favicon.svg`). Everything else is
lqa-events' own, byte for byte — copy from there, never edit here.

## Embed

```html
<div id="portangeles-events"></div>
<script src="https://portangeles.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Field Arts & Events Hall** — its own calendar (WordPress, The Events Calendar REST at
  fieldhallevents.org/wp-json/tribe/events/v1/events) through `scripts/feeds.mjs` (city.js `feed`):
  every show in the Donna M. Morris Theater and the Sunset Lounge; the daily 'Box Office Open'
  and gallery-hours rows are left out. Tickets sell on Ludus (fieldhall.ludus.com); sold-out
  status is not read yet.
- **Ticketmaster Discovery API** — every room by its venue id (every page):
  six rooms, in town to an hour east. The peninsula rooms carry only the odd
  tour date — the first build (2026-10-13) found nothing upcoming at any of
  them. There is no city sweep (a radius search from here reaches Victoria
  across the strait first). Church events are left out (`isChurch`). Calls are
  paced 1.5 s apart with a 429 back-off, since the sister builds share the key.
- **Seasons** — ESPN for the Seahawks, Storm, Reign and Sounders; MLB's stats
  API for the Mariners; the NHL's for the Kraken (`scripts/schedules.mjs`,
  shared with lqa). The clubs are Teams-view-only: their grounds are not rooms
  here and nothing of theirs enters the listing.

Next to add: the Juan de Fuca Festival, the Port Angeles Symphony and the
Lefties' West Coast League schedule, once one of them publishes something
parseable.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
