# Christian's Jazz Library — Master Plan

Master plan for curated playlists. Each playlist will be filled with real,
verified tracks (no invented titles) pulled from the per-artist "Top 15"
files below. Goal: minimal duplication across playlists, best single
performance of over-covered standards, and a bias toward Piano / Guitar / Sax
trios & small groups over big band / avant-garde / bebop (unless beautiful).

**Status legend:** ✅ artist file created · 🔲 not yet created · ❓ needs a decision

**Per-artist target: Top 15** verified tracks (title, album, year), sourced
via web search — not memory — to avoid invented songs.

**TuneMyMusic export format:** Final CSVs will be **3-column**
(`Artist,Title,Album`) rather than just `Artist,Title`. Album is included
deliberately because several tracks have multiple recorded versions (studio
vs. live, different sessions) and we want the *specific* performance to match,
not a generic substitute. TuneMyMusic's file-upload source supports Album as
an extra matching hint. Year is dropped from the CSV (not used for matching)
but stays in the markdown tables for our own reference.

**Folder structure** (all at the root of `Jazz-Playlists/`):
- `./solo-artists/` — one Top 15 file per individual artist/leader
- `./duos/` — collaborative recordings (2+ artists), each a
  standalone recording distinct from either artist's solo discography;
  `00-duos-index.md` catalogs thinner single-track pairings, dedicated
  `duo-*.md` files hold full-album treatments
- `./latin/` — the **Best of Latin** discovery playlist artists
  (Cuban/Dominican jazz piano + Brazilian bossa nova guitar/vocals + salsa)
- `./moods/` — mixed-artist Mood playlists (see below), each a `.md` file
  with tracks pulled from the artist files above, organized by mood/vibe

---

## 🎹 Piano

### Piano After Dark
Bill Evans, Keith Jarrett, Fred Hersch, Michel Petrucciani, Brad Mehldau, Ahmad Jamal, Oscar Peterson, Lyle Mays

### Friends & Conversations
Oscar Peterson, Ahmad Jamal, Gene Harris, Monty Alexander, Bill Evans, Vince Guaraldi, Ray Bryant, Cyrus Chestnut

### Audiophile Piano
Bill Evans, Keith Jarrett, Brad Mehldau, Michel Petrucciani, Fred Hersch, Lyle Mays, Esbjörn Svensson Trio, Oscar Peterson

---

## 🎷 Saxophone

### Velvet & Smoke
Ben Webster, Stan Getz, Paul Desmond, Dexter Gordon, Coleman Hawkins, Johnny Hodges

### Cool Jazz Classics
Stan Getz, Paul Desmond, Gerry Mulligan, Zoot Sims, Art Pepper, Lee Konitz

### Audiophile Sax
Ben Webster, Stan Getz, Paul Desmond, Joe Henderson, Jan Garbarek, Houston Person

---

## 🎸 Guitar

### Strings & Wood
Joe Pass, Jim Hall, Russell Malone, Emily Remler, Pat Metheny, Martin Taylor

### Guitar After Hours
Joe Pass, Jim Hall, Ed Bickert, Barney Kessel, John Abercrombie

### Audiophile Guitar
Pat Metheny, Joe Pass, Larry Carlton, Martin Taylor, Earl Klugh

---

## 🎺 Trumpet

### Gold & Brass
Chet Baker, Art Farmer, Roy Hargrove, Clifford Brown, Miles Davis

### Cool Trumpets
Chet Baker, Art Farmer, Blue Mitchell, Kenny Dorham, Tom Harrell

### Audiophile Trumpet
Miles Davis, Chet Baker, Roy Hargrove, Chris Botti, Wynton Marsalis

---

## 🎤 Vocals

### Female Jazz Voices
Ella Fitzgerald, Sarah Vaughan, Diana Krall, Stacey Kent, Carmen McRae, Melody Gardot, Jane Monheit

### Male Jazz Voices
Johnny Hartman, Nat King Cole, Mel Tormé, Frank Sinatra, Kurt Elling

### Vocal Intimacy
Johnny Hartman, Stacey Kent, Diana Krall, Chet Baker, Madeleine Peyroux, Jane Monheit

---

## 🥁 Small Groups

### Piano Trios
Bill Evans Trio, Keith Jarrett Trio, Oscar Peterson Trio, Ahmad Jamal Trio, Brad Mehldau Trio

### Quartets
Dave Brubeck Quartet, Modern Jazz Quartet, Gerry Mulligan Quartet, Branford Marsalis Quartet

### Coffeehouse Jazz
Bill Evans, Vince Guaraldi, Gene Harris, Jim Hall, Paul Desmond

---

## 🌙 Mood
*(mixed-artist playlists — will draw from the unique-song pool built after
artist files exist, not from a single-artist source list)*

- Midnight Jazz — mixed lyrical artists
- Sunday Morning — warm acoustic jazz
- Rainy Day — reflective piano & sax
- Reading — quiet instrumental jazz
- Observatory Nights — spacious atmospheric jazz
- Poolside Evenings — light Latin & cool jazz
- Fireplace — warm intimate jazz
- First Time Jazz — accessible jazz classics

---

## 🔊 Audiophile
*(cross-artist reference playlists — built last, from the verified pool)*

- Audiophile Jazz — cross-instrument reference tracks
- Audiophile Vocal Jazz — Diana Krall, Patricia Barber, Stacey Kent, Johnny Hartman
- Audiophile Acoustic — Lyle Mays, Pat Metheny, Bill Evans, Joe Pass
- Reference Recordings — best engineered recordings

---

## 🌎 Best of Latin ✨ NEW (replaces "Latin & Crossover Piano")

A discovery playlist spanning Cuban/Dominican jazz piano, Brazilian bossa
nova (guitar + vocals), and salsa — genres Christian is less familiar with,
per his request. Lito Vitale was removed (discography too thin/unverifiable
in English-language sources); replaced with much better-documented artists.

- **Chucho Valdés** (Cuban jazz piano — Irakere) — `latin/chucho-valdes.md`
- **Michel Camilo** (Dominican jazz piano) — `latin/michel-camilo.md`
- **João Gilberto** (Brazilian bossa nova guitar/vocals) — `latin/joao-gilberto.md`
- **Antônio Carlos Jobim** (Brazilian bossa nova composer/piano/guitar) — `latin/antonio-carlos-jobim.md`
- **Luiz Bonfá** (Brazilian bossa nova guitar) — `latin/luiz-bonfa.md`
- **Rubén Blades** (salsa vocals — incl. "Pedro Navaja," per direct request) — `latin/ruben-blades.md`

---

## 🤝 Legendary Duos & Collaborations

A dedicated playlist for tracks/albums where two (or more) artists from *any*
category above recorded together — exempt from the "minimize duplication"
rule, since the whole point is celebrating specific pairings. Lives entirely
in `./duos/`, separate from solo artist files.

**Dedicated full-album files** (`./duos/duo-*.md`):
- Ben Webster & Coleman Hawkins (1959, two albums)
- Bill Evans & Jim Hall — *Undercurrent* (1962) + *Intermodulation* (1966)
- Stan Getz & João/Astrud Gilberto — *Getz/Gilberto* (1964) + *#2* (1966)
- John Coltrane & Johnny Hartman (1963)
- Frank Sinatra & Count Basie (three albums, 1962-66)
- Ella Fitzgerald & Louis Armstrong — two albums (1956-57)
- Oscar Peterson & Joe Pass — *Porgy and Bess* (1976) + more

**Consolidated single/few-track pairings** — see `./duos/00-duos-index.md`
for the remaining ~20 thinner cross-references (Getz/Barron, Mulligan/Monk,
Camilo/Tomatito, Jobim/Elis Regina, Blades/Colón, etc.).

---

## Unique Artist Roster & Execution Checklist

Working checklist of every artist across all playlists above. Check off as
each `<slug>.md` file is created with a verified Top 15.

**Phase 1 — Piano**
- [x] Bill Evans
- [x] Keith Jarrett
- [x] Fred Hersch
- [x] Michel Petrucciani
- [x] Brad Mehldau
- [x] Ahmad Jamal
- [x] Oscar Peterson
- [x] Lyle Mays
- [x] Gene Harris
- [x] Monty Alexander
- [x] Vince Guaraldi
- [x] Ray Bryant
- [x] Cyrus Chestnut
- [x] Esbjörn Svensson Trio

**Phase 2 — Saxophone**
- [x] Ben Webster
- [x] Stan Getz
- [x] Paul Desmond
- [x] Dexter Gordon
- [x] Coleman Hawkins
- [x] Johnny Hodges
- [x] Gerry Mulligan
- [x] Zoot Sims
- [x] Art Pepper
- [x] Lee Konitz
- [x] Joe Henderson
- [x] Jan Garbarek
- [x] Houston Person

**Phase 3 — Guitar**
- [x] Joe Pass
- [x] Jim Hall
- [x] Russell Malone
- [x] Emily Remler
- [x] Pat Metheny
- [x] Martin Taylor
- [x] Ed Bickert
- [x] Barney Kessel
- [x] John Abercrombie
- [x] Larry Carlton
- [x] Earl Klugh

**Phase 4 — Trumpet**
- [x] Chet Baker
- [x] Art Farmer
- [x] Roy Hargrove
- [x] Clifford Brown
- [x] Miles Davis
- [x] Blue Mitchell
- [x] Kenny Dorham
- [x] Tom Harrell
- [x] Chris Botti
- [x] Wynton Marsalis

**Phase 5 — Vocals**
- [x] Ella Fitzgerald
- [x] Sarah Vaughan
- [x] Diana Krall
- [x] Stacey Kent
- [x] Carmen McRae
- [x] Melody Gardot
- [x] Jane Monheit ✨ NEW
- [x] Johnny Hartman
- [x] Nat King Cole
- [x] Mel Tormé
- [x] Frank Sinatra
- [x] Kurt Elling
- [x] Madeleine Peyroux
- [x] Patricia Barber

**Phase 6 — Groups** *(no separate artist file needed for most; Dave Brubeck
Quartet got its own file since "Take Five" needed correct group credit)*
- [x] Dave Brubeck Quartet → `solo-artists/dave-brubeck-quartet.md` (dedicated file, incl. Take Five/Time Out)
- [ ] Modern Jazz Quartet *(no dedicated file yet — not yet built)*
- [ ] Branford Marsalis Quartet *(no dedicated file yet — not yet built)*

**Phase 7 — Best of Latin** *(discovery bucket — replaces "Latin & Crossover
Piano"; Lito Vitale removed for insufficient documentation)*
- [x] Chucho Valdés → `latin/chucho-valdes.md`
- [x] Michel Camilo → `latin/michel-camilo.md`
- [x] João Gilberto → `latin/joao-gilberto.md`
- [x] Antônio Carlos Jobim → `latin/antonio-carlos-jobim.md`
- [x] Luiz Bonfá → `latin/luiz-bonfa.md`
- [x] Rubén Blades → `latin/ruben-blades.md` (incl. Pedro Navaja, per request)
- [x] ~~Lito Vitale~~ — REMOVED, file deleted (2026-07-23)

**Phase 8 — Legendary Duos & Collaborations** *(folder: `./duos/`)*
- [x] Ben Webster & Coleman Hawkins → `duo-webster-hawkins.md` (10 tracks, 2 albums)
- [x] Bill Evans & Jim Hall → `duo-evans-hall.md` (full: Undercurrent + Intermodulation)
- [x] Stan Getz & João/Astrud Gilberto → `duo-getz-gilberto.md` (full: 2 albums)
- [x] John Coltrane & Johnny Hartman → `duo-coltrane-hartman.md` (full album, 7 tracks)
- [x] Frank Sinatra & Count Basie → `duo-sinatra-basie.md` (full: 3 albums)
- [x] Ella Fitzgerald & Louis Armstrong → `duo-ella-louis.md` (full: 2 albums)
- [x] Oscar Peterson & Joe Pass → `duo-peterson-pass.md` (full: Porgy and Bess + more)
- [x] All remaining thinner pairings → consolidated in `duos/00-duos-index.md`
      (~20 single/few-track pairings, incl. newly added Camilo/Tomatito,
      Jobim/Elis Regina, Blades/Colón cross-references from the Latin roster)

---

## Status as of 2026-07-24 — LOWER-PRIORITY FLAGS RESOLVED ✅

Following a verification pass on every remaining flagged item:

### Fixes applied (this pass)
- **Oscar Peterson #10** — corrected fabricated "Blues for Big Scotia" (not
  a real *Night Train* track) → replaced with genuine "Bags' Groove."
- **Oscar Peterson #12/#14/#15** — corrected mis-titled *Porgy and Bess*
  entries ("Line for Lyons," "Blues for Basie," "Honeysuckle Rose" are not
  on that album) → replaced with genuine tracks ("Sophisticated Lady" from
  *Trio + One*, "I Loves You, Porgy" from the real Peterson/Pass *Porgy and
  Bess* tracklist, "Falling in Love with Love" from *We Get Requests*).
- **`duo-peterson-pass.md`** — corrected the *Porgy and Bess* (1976)
  tracklist to match the verified Wikipedia listing (removed invented
  "Overture," "Here Come de Honey Man," "O Lawd, I'm on My Way"; added the
  real "Oh Bess, Oh Where's My Bess?" and "Strawberry Woman").
- **Rubén Blades "El Cantante"** — confirmed via Wikipedia: the song is
  definitively Héctor Lavoe's signature recording (Blades only wrote it).
  The file already correctly excludes it with an explanatory note — no
  change needed.
- **Folder path references** — `00-Master-Plan.md` incorrectly referenced
  `./artists/solo-artists/`, `./artists/duos/`, `./artists/latin/` throughout;
  corrected to the actual root-level paths `./solo-artists/`, `./duos/`,
  `./latin/` (the folders themselves were already correctly placed at the
  root — only the documentation was stale).

### ✅ Spot-checked and confirmed accurate (no changes needed)
- **Ben Webster** — all albums cross-checked against Wikipedia discography
  (Music for Loving, King of the Tenors, Soulville, The Soul of Ben Webster,
  Ben Webster Meets Coleman Hawkins, The Warm Moods, See You at the Fair) —
  all genuine releases.
- Michel Petrucciani, Brad Mehldau, Gene Harris, Ray Bryant, Russell Malone,
  Ed Bickert, Barney Kessel, John Abercrombie, Tom Harrell, Houston Person —
  reviewed each file; all albums are genuine real releases from each
  artist's documented discography, no duplicate/fabricated tracks found.

### 🌙 New: Moods folder
- Added `./moods/` — mixed-artist mood playlists, assembled by pulling
  verified tracks from `solo-artists/`, `duos/`, and `latin/` files
  according to mood/vibe (not genre/instrument). All 8 mood playlists
  drafted with 10-12 tracks each (`00-moods-index.md`, `midnight-jazz.md`,
  `sunday-morning.md`, `rainy-day.md`, `reading.md`, `observatory-nights.md`,
  `poolside-evenings.md`, `fireplace.md`, `first-time-jazz.md`). A few
  entries reference artists without dedicated files yet (Herbie Hancock,
  Duke Ellington, Charlie Byrd) — flagged in each file's Notes section.

## Next Steps

1. **Finalize Mood playlists** — cross-check every flagged entry in
   `./moods/*.md` against its source file, decide whether Hancock/
   Ellington/Byrd need dedicated `solo-artists/` files, then expand each
   mood playlist toward a target track count (suggest 15-20 each).
2. **Tally unique songs & build the instrument-based playlists** — assemble
   actual playlist track lists (pulling from these files, minimizing
   duplication per the original goal — except Duos, which is exempt) and
   generate final `Artist,Title,Album` CSVs for TuneMyMusic import.
3. **Decide sequencing/length per playlist** — confirm target track counts
   (e.g., 60 for the three Piano playlists, per the original Phase 1 request).


