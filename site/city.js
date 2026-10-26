// The city — every fact that makes this calendar Cancún's rather than another
// town's, in one place (2026-10-13: a sister of lqa-events, built the way
// Port Angeles and Everett were — the first city outside the United States).
// The browser (filter.js, app.js) and the build (scripts/*.mjs) both read it;
// nothing else names a venue or a team. The shared files (app.js, filter.js,
// styles.css bar its --v-* hues, scripts/*.mjs bar fetch-events.mjs and
// sources.mjs) are lqa-events' own, byte for byte — see README "Sister sites".
//
// Cancún: pop. 900,000 on the Caribbean coast of Quintana Roo, the resort
// city. Its ticketed rooms are the Teatro de Cancún in the Hotel Zone, the
// Plaza de Toros (the old bullring, now the city's concert bowl), the
// Teatro de la Ciudad, the Teatro Alamos and the STOA on the mainland, and
// the two grounds — the Beto Ávila ballpark and the Andrés Quintana Roo
// stadium. Nothing here sells through Ticketmaster: the ticketers are
// TusBoletos (the peninsula's) and eticket (the bullring's), read city-wide
// through scripts/feeds.mjs. Playa del Carmen, forty-five minutes south, is
// the second group. Clocks are Eastern Standard all year (no daylight time).
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Per team:
  //   re        the title match
  //   venue     the home building, as VENUES spells it; schedule = the club's
  //             own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   season    where the season comes from (schedules.mjs): MLB's stats API
  //             serves the Mexican League (sportId 23) as it does the minors;
  //             ESPN carries the Liga de Expansión MX (mex.2)
  //   form      the record and standing: statsapi standings by league id for
  //             the Tigres, ESPN for Cancún FC
  //   inject    the club's home games enter the listing from the league's
  //             schedule (neither ground has a ticket feed here), linking to
  //             the club's ticket page
  //   club      the club's full name; wiki the article; opens when the
  //             season usually starts
  var TEAMS = [
    // Tigres de Quintana Roo, Liga Mexicana de Béisbol (Zona Sur), Estadio Beto Ávila — the season runs April to August, the playoffs into September
    { slug: 'tigres', label: 'Tigres', name: 'Tigres de Quintana Roo', abbr: 'QR', re: /\btigres\b/i, sport: 'baseball', venue: 'Estadio Beto Ávila', colors: ['#f47a20', '#1d1d1b'],
      season: { kind: 'mlb', id: 569, sportId: 23 }, form: { kind: 'milb', id: 569, league: 125, leagueName: 'Mexican League' },
      inject: { url: 'https://www.tigresqr.com/' }, // no ticket feed carries the ballpark; the league's schedule supplies the home stands
      logo: 'https://www.mlbstatic.com/team-logos/569.svg', schedule: 'https://www.tigresqr.com/',
      club: 'Tigres de Quintana Roo', opens: 'April', wiki: { title: 'Tigres de Quintana Roo', club: true } },
    // Cancún FC, Liga de Expansión MX (the second division; Apertura August–December, Clausura January–May), Estadio Andrés Quintana Roo
    { slug: 'cancunfc', label: 'Cancún FC', name: 'Cancún FC', abbr: 'CAN', re: /canc[uú]n fc/i, sport: 'soccer', venue: 'Estadio Andrés Quintana Roo', colors: ['#c60000', '#111111'],
      espn: { sport: 'soccer', league: 'mex.2', id: '20724' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.cancunfc.mx/' },
      logo: 'https://www.cancunfc.mx/cdn/shop/files/LOGO_CANCUN_FC_e4b405fa-468d-460e-9b72-eec145293eaf.png', schedule: 'https://www.cancunfc.mx/', // ESPN has no crest for the club; this is its own
      club: 'Cancún FC', opens: 'August', wiki: { title: 'Cancún F.C.', club: true } },
    // El Calor de Cancún, LNBP (Liga Nacional de Baloncesto Profesional, the national league, 14 clubs; the season runs August to October, the playoffs into November), Poliforum Benito Juárez — the league's backend, read with the site's own ajax headers (scripts/lnbp.mjs)
    { slug: 'elcalor', label: 'El Calor', name: 'El Calor de Cancún', abbr: 'CAL', re: /\bel calor\b/i, sport: 'basketball', venue: 'Poliforum Benito Juárez', colors: ['#f7941d', '#b5121b'],
      season: { kind: 'lnbp', id: 47 }, form: { kind: 'lnbp', id: 47 },
      inject: { url: 'https://www.facebook.com/profile.php?id=61557431365955' }, // no ticketer carries the arena; the club sells through its Facebook page
      logo: 'https://lnbpback.truewisdom.co/uploads/team/logo/e90600851abba86ac6fd7f6ecfa065b5.png', schedule: 'https://lnbp.mx/calendar.html', // the league's crest for the club (the backend serves it)
      club: 'El Calor de Cancún', opens: 'August', wiki: { title: 'El Calor de Cancún', club: true } },
  ];

  // The venues. Keys are the display names the feeds are folded to. Per venue:
  //   area     'town' = Playa del Carmen, forty-five minutes south (the
  //            panel's second group); unmarked = Cancún itself, Hotel Zone
  //            and mainland alike
  //   capacity the Capacity rows' thresholds (the share-code 'cap' bits)
  //   type     the default event type when the feed names none
  //   cssVar   the hue in styles.css (light and dark values live there);
  //            color is the light one for the places that read it directly
  //   url      the room's own page (the sheet's venue link)
  //   icon     the favicon, through Google's cache
  //   alias    the spellings the ticketers use for it, folded to this name
  //            (the TusBoletos cards say "Teatro Alamos Cancún"; a Playa del
  //            Carmen room carries ", Playa del Carmen" from the feed)
  // No `tm` blocks: Ticketmaster has nothing within fifty miles. The listings
  // come from the city-wide FEEDS below and fold onto these rows by alias;
  // a room with no row of its own lands in 'Elsewhere in Cancún'.
  var VENUES = {
    'Teatro de Cancún': { // the city's theatre, 856 seats, in the Hotel Zone at km 4.5 beside the Embarcadero — comedy, tributes, ballet, the touring plays; its own site is a front for TusBoletos
      geo: [21.16959, -86.82709],
      capacity: 856,
      type: 'arts',
      cssVar: '--v-tdc',
      color: '#2e8f9e',
      url: 'https://www.teatrodecancun.com.mx/',
      icon: 'https://www.google.com/s2/favicons?domain=www.teatrodecancun.com.mx&sz=128',
      alias: /teatro de canc[uú]n/i,
    },
    'Plaza de Toros Cancún': { // the 1988 bullring on Avenida Bonampak, now the concert bowl (about 6,000) — the touring Mexican acts, lucha libre; sells on eticket
      geo: [21.15012, -86.82108],
      capacity: 6000,
      type: 'concert',
      cssVar: '--v-toros',
      color: '#9e2e3e',
      url: 'https://plazadetoroscancun.com.mx/',
      icon: 'https://www.google.com/s2/favicons?domain=plazadetoroscancun.com.mx&sz=128',
      alias: /plaza de toros/i,
    },
    'Teatro de la Ciudad': { // the city's own hall on Avenida Tulum, 650 seats, opened September 2024 (Instituto de la Cultura y las Artes)
      geo: [21.1592, -86.8318],
      capacity: 650,
      type: 'arts',
      cssVar: '--v-ciudad',
      color: '#6a2e9e',
      url: 'https://iculturacancun.com/teatro-de-la-ciudad/',
      icon: 'https://www.google.com/s2/favicons?domain=iculturacancun.com&sz=128',
      alias: /^teatro de la ciudad(?: canc[uú]n)?$/i, // Playa del Carmen has a Teatro de la Ciudad too — its row is below
    },
    'Teatro Alamos': { // a private hall in the Álamos district, about 800 — rock and pop tours, stand-up
      capacity: 800,
      type: 'concert',
      cssVar: '--v-alamos',
      color: '#9e6b2e',
      url: 'https://www.facebook.com/TeatroAlamos/',
      icon: 'https://www.google.com/s2/favicons?domain=www.facebook.com&sz=128',
      alias: /teatro [aá]lamos/i,
    },
    'STOA Auditorio': { // a 650-seat auditorium on Avenida Álamos — plays, children's shows
      capacity: 650,
      type: 'arts',
      cssVar: '--v-stoa',
      color: '#9e2e7a',
      url: 'https://x.com/auditoriostoa',
      icon: 'https://www.google.com/s2/favicons?domain=x.com&sz=128',
      alias: /\bstoa\b/i,
    },
    'Estadio Beto Ávila': { // the Tigres' ballpark on Avenida Kabah, about 9,000, rebuilt after Wilma — the LMB season April to August
      geo: [21.15248, -86.83676],
      capacity: 9000,
      type: 'sports',
      cssVar: '--v-beto',
      color: '#c2521f',
      url: 'https://www.tigresqr.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.tigresqr.com&sz=128',
      alias: /beto [aá]vila/i,
    },
    'Estadio Andrés Quintana Roo': { // the 17,000-seat football stadium — Cancún FC in the Liga de Expansión
      geo: [21.15095, -86.83842],
      capacity: 17289,
      type: 'sports',
      cssVar: '--v-aqr',
      color: '#2e9e4a',
      url: 'https://www.cancunfc.mx/',
      icon: 'https://www.google.com/s2/favicons?domain=www.cancunfc.mx&sz=128',
      alias: /andr[eé]s quintana roo/i,
    },
    'Poliforum Benito Juárez': { // the city arena on the airport road (basketball 4,800, concerts 6,000) — El Calor's home; the LNBP schedule supplies the home games, nothing else lists the room yet
      geo: [20.63493, -87.09554],
      capacity: 6000,
      type: 'sports',
      cssVar: '--v-poli',
      color: '#2e5a9e',
      url: 'https://www.facebook.com/332517270166314/',
      icon: 'https://www.google.com/s2/favicons?domain=www.facebook.com&sz=128',
      alias: /polif[oó]rum/i,
    },
    'Elsewhere in Cancún': { // every room the ticketers name that has no row of its own (a hotel ballroom, a club, a one-off hall) folds here — one row, not one per room (the Everett pattern, Steve 2026-10-10)
      geo: [21.161, -86.851],
      type: 'concert',
      cssVar: '--v-else',
      color: '#7c8a96',
    },
    'Teatro de la Ciudad, Playa del Carmen': { // Playa's municipal theatre on 8a Norte — the same touring comedies and tributes a day after Cancún
      geo: [20.65266, -87.08279],
      area: 'town',
      capacity: 500,
      type: 'arts',
      cssVar: '--v-playa',
      color: '#2e9e8b',
      url: 'https://www.tusboletos.mx/eventos',
      icon: 'https://www.google.com/s2/favicons?domain=www.tusboletos.mx&sz=128',
      alias: /teatro de la ciudad.*playa/i,
    },
  };

  // City-wide feeds (scripts/feeds.mjs `feeds`): the ticketers that list the
  // whole town. Each listing keeps the room the ticketer names and folds onto
  // a row above by alias, or into 'Elsewhere in Cancún'.
  var FEEDS = [
    { kind: 'tusboletos', label: 'TusBoletos', url: 'https://www.tusboletos.mx/eventos', // Teatro de Cancún, Teatro Alamos, STOA, Playa's theatre; the clock is on each event page
      cities: [{ match: /^canc[uú]n,/i }, { match: /^playa del carmen,/i, suffix: ', Playa del Carmen' }] }, // Mérida and Chetumal are hours away
    { kind: 'jsonld', label: 'eticket', url: 'https://www.eticket.mx/eventos.aspx?idciudad=42' }, // eticket's Cancún listing (the Plaza de Toros), schema.org Event markup
  ];

  // The filter panel's starting state: every room on, nothing off.
  var DEFAULT_ON = ['Teatro de Cancún', 'Plaza de Toros Cancún', 'Teatro de la Ciudad', 'Teatro Alamos', 'STOA Auditorio', 'Estadio Beto Ávila', 'Estadio Andrés Quintana Roo', 'Poliforum Benito Juárez', 'Elsewhere in Cancún', 'Teatro de la Ciudad, Playa del Carmen'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // The event types (the panel's Event Type rows; badges.mjs assigns them).
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the bullring, Teatro Alamos, the tributes at the Teatro de Cancún' },
    { key: 'sports', label: 'Sports', title: 'Tigres baseball, Cancún FC, lucha libre, boxing' },
    { key: 'arts', label: 'Arts & Theater', title: 'Plays, comedy, ballet, dance, the children\'s shows' },
    { key: 'community', label: 'Community', title: 'Fairs, festivals, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema listed

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 20 slots from the first build (2026-10-13): four base-36 digits.
  var CODE_LENGTH = 4;
  var REGISTRY = [
    ['venue', 'Teatro de Cancún'], ['venue', 'Plaza de Toros Cancún'], ['venue', 'Teatro de la Ciudad'], ['venue', 'Teatro Alamos'], ['venue', 'STOA Auditorio'], ['venue', 'Estadio Beto Ávila'], ['venue', 'Estadio Andrés Quintana Roo'], ['venue', 'Poliforum Benito Juárez'], ['venue', 'Elsewhere in Cancún'], ['venue', 'Teatro de la Ciudad, Playa del Carmen'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'tigres'], ['team', 'cancunfc'], ['team', 'elcalor'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  var WORDS = {
    teamCity: 'Cancún', // the board drops it from the clubs' names ("Cancún FC" keeps its own two words — the regex is a whole-word match)
    presetDefault: 'Every room — Cancún and Playa del Carmen — every team and type',
    presetNeighborhood: 'Cancún only — the Hotel Zone theatre, the bullring, the mainland halls and the two grounds',
    presetBig: 'Only the places that hold 2,000 or more — the bullring, the arena and the two grounds',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Cancún only.', big: 'Showing the big rooms only — the bullring, the arena and the two grounds.' },
  };

  // Mexico's public holidays (app.js holidaysFor reads this instead of its US
  // list): the statutory days, the civic Monday observances, and the two
  // observances the whole town keeps. Semana Santa moves with Easter and is
  // left out.
  function nthMonday(y, month, n) { var d = new Date(y, month, 1); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; }
  var HOLIDAYS = function (y) {
    return [
      [new Date(y, 0, 1), 'Año Nuevo'],
      [new Date(y, 0, 6), 'Día de Reyes'],
      [nthMonday(y, 1, 1), 'Día de la Constitución'],
      [nthMonday(y, 2, 3), 'Natalicio de Benito Juárez'],
      [new Date(y, 4, 1), 'Día del Trabajo'],
      [new Date(y, 4, 10), 'Día de las Madres'],
      [new Date(y, 8, 16), 'Día de la Independencia'],
      [new Date(y, 10, 1), 'Día de Todos los Santos'],
      [new Date(y, 10, 2), 'Día de Muertos'],
      [nthMonday(y, 10, 3), 'Día de la Revolución'],
      [new Date(y, 11, 12), 'Día de la Virgen de Guadalupe'],
      [new Date(y, 11, 25), 'Navidad'],
    ];
  };

  global.LQACity = {
    key: 'cancun',
    name: 'Cancún',
    site: 'https://cancun.here.events/', // a city-wide site is <city>.here.events (Steve, 2026-10-11); not wired yet — the memory dir's deploy checklist
    userAgent: 'Mozilla/5.0 (compatible; cancun-events/1.0; +https://cancun.here.events/)',
    tz: 'America/Cancun', tzName: 'Cancún time (UTC−5, no daylight saving)', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer; Quintana Roo left daylight time in 2015
    state: 'Quintana Roo', stateOutline: null, // no state drawing (the masthead's state strip went away 2026-10-13; scripts/state-outline.mjs draws US states only)
    ics: { name: 'Cancún Events', short: 'Cancún Events', teams: 'Cancún home teams — every season', prodid: '-//here.events//cancun-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around Cancún\\, Quintana Roo — the theatres\\, the bullring\\, the two grounds and Playa del Carmen\\, with the Tigres\' and Cancún FC\'s seasons' },
    teams: TEAMS,
    map: { // the Map view (local-map.js; the ground drawn once by scripts/build-local-map.mjs from OpenStreetMap, committed as site/local-map.json) — every city gets one, Steve, 2026-10-26
      kind: 'urban',
      bbox: [20.555, -87.137, 21.25, -86.78], // south, west, north, east — every room, with a margin
      home: [21.145, -86.86, 21.175, -86.812], // the view at first: the city's own rooms; the fit button shows the whole frame
      roads: ['motorway', 'trunk', 'primary'],
      tolerance: 0.8,
      labels: [
        { name: 'Cancún', lat: 21.161, lon: -86.851, anchor: 'middle' },
        { name: 'Playa del Carmen', lat: 20.64628, lon: -87.08079, anchor: 'middle' },
      ],
    },
    distanceUnit: 'km', // the mileage signs on the map read kilometres here
    venues: VENUES,
    feeds: FEEDS,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: 'Elsewhere in Cancún', // a venue with no row of its own folds here (aliases are tried first)
    holidays: HOLIDAYS,
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
