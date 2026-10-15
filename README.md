# Cancún Events

Event feed and calendar for Cancún, Quintana Roo: the Teatro de Cancún in the
Hotel Zone, the Plaza de Toros concert bowl, the Teatro de la Ciudad, Teatro
Alamos and the STOA auditorium, the Estadio Beto Ávila, the Estadio Andrés
Quintana Roo and the Poliforum, Playa del Carmen's municipal theatre an hour
down the coast — with the home clubs' seasons (the Tigres de Quintana Roo,
Cancún FC, El Calor) in a Teams view.

Live at **https://cancun.here.events/** (GitHub Pages, built by the Actions
workflow once a day at noon — Quintana Roo keeps no daylight time).

A sister of lqa-events, the first city outside the US and the first with no
Ticketmaster: everything that makes this Cancún's is `site/city.js` (every
team, venue, type, default, share-code registry, string and Mexico's
holidays), `site/index.html`, `scripts/fetch-events.mjs` (the sources),
`scripts/lnbp.mjs` (El Calor's league), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, the manifest and icons.
`scripts/feeds.mjs` (the ticketer and venue-feed adapters) is shared with the
sister sites and lqa-events is its source of truth. Everything else is
lqa-events' own, byte for byte — copy from there, never edit here.

## Embed

```html
<div id="cancun-events"></div>
<script src="https://cancun.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **TusBoletos** (tusboletos.mx, the peninsula's ticketer) — its city-wide
  listing through `scripts/feeds.mjs` (city.js `feeds`, kind `tusboletos`):
  the Teatro de Cancún, Teatro Alamos, STOA, Playa's theatre and the odd
  hotel ballroom; the clock and the showings are read from each event page.
  Rooms fold onto their rows by alias; anything else lands in "Elsewhere in
  Cancún".
- **eticket** (eticket.mx) — its Cancún listing's schema.org Event markup
  (kind `jsonld`): the Plaza de Toros and the touring Mexican acts; sold-out
  and cancelled states come with it.
- **Seasons** — MLB's stats API (sportId 23, the Mexican League) for the
  Tigres, ESPN for Cancún FC (Liga de Expansión), the LNBP's own site for El
  Calor (`scripts/lnbp.mjs`); the clubs' home games are injected into the
  listing under their box-office links, since no ticketer lists them.
- Church events are left out (`isChurch`). There is no Ticketmaster call and
  no key to set.

## Local run

```sh
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
