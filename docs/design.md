# FloodMap: Design (v2)

Status: Reviewed 2026-10-08. Replaces v1. Based on `2026-10-08_floodmap_requirements_v2.md` (here `docs/requirements.md`).

> Repo copy. Sections 1–12 are the reviewed v2 text. Section 13 lists the M3 deviations and section 14 the M2 decisions; where they differ from sections 1–12, sections 13–14 win.

## 1. Architecture

A static site with no server, no database and no build step. It is hosted on GitHub Pages from the `main` branch.

```
floodmap/
├── index.html
├── css/styles.css             # mobile-first, design tokens on :root, dark mode
├── js/
│   ├── app.js                 # map setup, bounds, UI wiring, state
│   ├── risk.js                # depth class + frequency → risk (shared with validator)
│   ├── spots.js               # load GeoJSON, filters, render lines/points/polygons
│   ├── search.js              # local index + Nominatim on submit
│   └── i18n.js                # VI / EN strings and toggle
├── data/
│   ├── hcmc-flood-spots.geojson
│   └── i18n.json
├── scripts/validate.mjs       # imports js/risk.js, so there is one source of truth
├── docs/                      # requirements + design
└── README.md                  # how to add, edit or retire a spot
```

`js/risk.js` is a plain ES module. The browser and `scripts/validate.mjs` (run with Node) both import it, so the site and the validator cannot disagree on a spot's risk.

## 2. Libraries and services

| Need | Choice | Notes |
|---|---|---|
| Map | Leaflet 1.9.x | Pinned version from cdnjs, with an SRI hash. |
| Tiles | OpenStreetMap standard tiles | Attribution always visible. Switch to a commercial provider if traffic grows. |
| Address search | Nominatim (public) | **Runs on submit only. No autocomplete**, as Nominatim's usage policy requires. At most 1 request per second. Results limited to the v1 area with `viewbox` + `bounded=1` and `countrycodes=vn`. Results are cached in memory. The browser sends the Referer header automatically. |
| Instant suggestions | Local index | Built in the browser from spot names, street names, wards and former districts. Matching ignores Vietnamese accents ("quan 4" matches "Quận 4"). |
| Analytics | None | Not in v1. |

## 3. Map setup

- **Bounds:** `maxBounds` set to the v1 area, roughly lat 10.68–10.92, lon 106.58–106.86. The exact box is tuned in M2 and kept in one constant in `app.js`.
- **Zoom:** minimum about 11 (whole v1 area), maximum 18.
- **Why the limits:** they keep the map focused on the data, and they avoid showing national borders at low zoom, which is a sensitive issue for maps published in Vietnam.

## 4. Data model

`data/hcmc-flood-spots.geojson` is a FeatureCollection. The default geometry is a **LineString** for a stretch of street. A **Point** is used for a single spot, such as an intersection or underpass, and a **Polygon** only for a real area, such as a residential block.

```json
{
  "type": "Feature",
  "geometry": { "type": "LineString", "coordinates": [[106.7050, 10.7580], [106.7068, 10.7562]] },
  "properties": {
    "id": "hcmc-0001",
    "name_vi": "Đường Tôn Đản (đoạn ...)",
    "name_en": "Ton Dan Street (section ...)",
    "street": "Tôn Đản",
    "ward": "Phường Khánh Hội",
    "legacy_district": "Quận 4",
    "cause": "both",
    "depth_cm": { "min": 20, "max": 40 },
    "frequency": "frequent",
    "status": "active",
    "past_events": [
      { "date": "2025-10-07", "cause": "tide", "depth_cm": 35, "description_vi": "...", "description_en": "...", "source": "https://..." }
    ],
    "sources": ["https://..."],
    "notes": "",
    "last_verified": "2026-10-08"
  }
}
```

The values above are for illustration only, not real data.

**Field rules (enforced by `validate.mjs`):**

| Field | Rule |
|---|---|
| `id` | `hcmc-NNNN`, unique, never reused |
| `name_vi`, `name_en`, `ward` | Required, not empty |
| `street`, `legacy_district`, `notes` | Optional |
| `cause` | `rain`, `tide` or `both` |
| `depth_cm` | `min` ≤ `max`, both from 0 to 200 |
| `frequency` | `rare`, `occasional` or `frequent` |
| `status` | `active`, `improved` or `resolved` |
| `past_events` | Up to 5 shown. Each has an ISO date and a source URL. |
| `sources` | At least 1 valid http(s) URL |
| `last_verified` | ISO date, not in the future |
| geometry | Valid, and inside the v1 bounds |
| `risk` | **Must not appear.** It is always computed. |

The validator also warns when `last_verified` is more than 12 months old.

**Risk computation (`js/risk.js`):**

```js
depthClass(max)  // < 10 → "shallow", 10–30 → "moderate", > 30 → "deep"
RISK = {
  shallow:  { rare: "low",    occasional: "low",    frequent: "medium" },
  moderate: { rare: "low",    occasional: "medium", frequent: "high"   },
  deep:     { rare: "medium", occasional: "high",   frequent: "high"   }
}
```

## 5. Screens and layout

### Mobile (under 768 px)

- Full-screen map.
- **Top bar:** search field and a VI / EN toggle.
- **Filter row:** risk chips (High, Medium, Low) and a cause menu (rain, tide, both). It scrolls sideways if needed.
- **Floating buttons:** locate me and legend.
- **Bottom sheet** with spot details. It opens half-height and can be dragged to full height.
- The disclaimer appears on first visit and as a footer link.

### Desktop (768 px and up)

A left panel, about 360 px wide, holds search, filters, legend and details. The map fills the rest.

### Details panel order

1. Name, risk badge and status badge
2. Depth, for example "20–40 cm · half a wheel to knee-deep"
3. Frequency and cause
4. Ward, with the former district below it
5. Past events, newest first
6. Sources and the last-verified date

### Empty and error states

- **No search match:** "No flood data for this place. This doesn't mean it never floods."
- **Nominatim error or rate limit:** "Address search is busy, try again in a moment." Local suggestions keep working.
- **Location denied:** a short note. Nothing else changes.
- **Tiles fail:** the spots still render, with a notice.

## 6. Visual design

The visual reference is `2026-10-08_floodmap_map-visual-mockup_v1.html`.

**Risk styles.** Colours are checked for colour blindness and for 3:1 contrast against the OSM tiles. The pattern always shows the risk, so colour is never needed to read it.

| Risk | Colour | Street (line) | Area (shaded zone) | Spot (point) |
|---|---|---|---|---|
| High | Deep red `#c62828` | Solid | 22% fill, solid 2 px outline | Triangle |
| Medium | Amber `#e08a00` | Dashed 10/6 | 22% fill, dashed 2 px outline | Diamond |
| Low | Dark blue `#1565c0` | Round dots | 18% fill, dotted 2 px outline | Circle |

Low uses a dark blue so it does not blend with the light blue of water on the map.

**Streets (lines)**

- A white casing, 3 px wider than the line, sits under every line.
- Width changes with zoom: 4 px at zoom 11–13, 6 px at 14–15, and 8 px at 16 and above.
- An invisible 20 px tap target sits over every line.

**Areas (shaded zones):** a semi-transparent fill with an outline in the risk pattern. Areas are always drawn under streets, so the streets stay readable.

**Spots (points):** the risk icon on a white disc with a risk-coloured ring. The disc is 24 px and the tap target is 44 px.

**Draw order:** areas first, then streets, then points, with the selected item on top. Within each layer, High is drawn over Medium, and Medium over Low.

**States**

| State | Style |
|---|---|
| Selected | 8 px line with a soft glow in the risk colour (25% opacity, 18 px). Areas get a 3 px outline and 35% fill. |
| Improved | The normal style at 60% opacity |
| Resolved | Grey `#9e9e9e`, dashed. Hidden by default. |

**Type and layout:** system font stack, Vietnamese diacritics tested, 16 px minimum text, 44 px touch targets. The UI follows `prefers-color-scheme`, but the map tiles stay light, so the risk colours only need to be checked against light tiles.

## 7. Behaviour

- The map renders first. Spots load asynchronously.
- **Tapping a spot:** highlights it, opens the details and updates the URL hash (`#hcmc-0001`) so a spot can be linked to and shared.
- **Search:**
  1. Typing shows local matches instantly (accent-insensitive, up to 5).
  2. Pressing Enter with no local match sends one Nominatim request.
  3. When an address is chosen, the map centres there and shows the nearest spot within 300 m (distance to the line, point or polygon), or the empty-state message.
- **Filters** apply instantly. Resolved spots get their own toggle, off by default.
- **Language choice** is saved in `localStorage` (wrapped in try/catch) as a convenience only.
- **Locate me** uses the browser's geolocation. The position is never sent anywhere.

## 8. Data workflow

### Seeding (M1)

1. Start from the Department of Construction flood hotspot lists, then add news reports of specific events.
2. Record each spot in a review table: name, street, ward, former district, cause, depth, frequency and sources.
3. Draw the geometry in geojson.io, following the street on the OSM layer.
4. Trong reviews the table and confirms each spot.

### Ongoing (M3 onwards)

1. Edit the GeoJSON file.
2. Run `node scripts/validate.mjs`.
3. Commit and push. GitHub Pages redeploys.

To retire a spot, set `status` to `resolved` and add a source showing it was fixed. Never delete a spot.

## 9. Delivery plan

| Milestone | Where | Notes |
|---|---|---|
| M1 Seed data | Cowork (research and web search) | Output to `OUTPUTS/FloodMap/` |
| M2 Prototype | Cowork, as a single self-contained HTML file | Uses the M1 data. Iterate until approved. |
| M3 Build | Claude Code on the GitHub repo | Port the approved prototype and add the validator. |
| M4 Beta | GitHub Pages link, shared with a small group | About 2 weeks |
| M5 Launch | Public | Recheck the data and the disclaimer first |

## 10. Testing

- **Automated:** `validate.mjs` on every data change. Unit tests for `risk.js` covering all 9 table cells and the boundaries at 10 and 30 cm.
- **Manual, each release:** an Android phone and an iPhone; desktop Chrome and Safari; both languages; locate me allowed and denied; search with a local match, an address and no result; every filter combination; a shared spot link.
- **Accessibility:** a Lighthouse or axe audit, and a greyscale check of the risk styles.
- **Performance:** Lighthouse mobile score of 90 or more.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Wrong or outdated data that someone relies on | Disclaimer, last-verified date, sources on every spot, and a stale-data warning in the validator |
| Ward names that are new or missing from OSM | Ward is stored in our own data, so search does not depend on OSM's admin boundaries |
| Hitting Nominatim or tile usage limits | Submit-only search, caching, and a provider switch if traffic grows |
| Thin coverage | An honest no-data message. Seed the best-known hotspots first. |
| Lines too thin to tap on a phone | 20 px invisible hit area |
| Spots fixed by drainage works | `status` field. Spots are retired, not deleted. |

## 12. Future options

User reports with moderation (needs a backend such as PostgreSQL with PostGIS), live tide and rain feeds, coverage of the rest of the merged city, alerts, and a custom domain.

## 13. Deviations in M3

| Change | Why |
|---|---|
| **`js/config.js`** holds the bounds, zoom limits, tile URL and Nominatim settings (§3 said "one constant in `app.js`"). | `app.js` and `scripts/validate.mjs` both import it, so the v1 bounds live in one place. |
| **`data/districts.json`** holds the 17 former-district search entries (name, centre, zoom, aliases). | Moved out of the prototype code. Centres were checked in M3; see the M3 build PR. |
| **`tests/`** (`node --test`, no dependencies), `.github/workflows/ci.yml`, `CLAUDE.md`, `.editorconfig`, `.gitattributes`, `.nojekyll` | Added for CI and maintenance. |
| **Tiles: OSM only.** The prototype's Esri fallback for `file://` is removed. | Prototype-only choice (M2 notes). |
| **Content-Security-Policy** meta tag: self, cdnjs, `tile.openstreetmap.org`, `nominatim.openstreetmap.org`. No `'unsafe-inline'`: the prototype's inline `style=` attributes became CSS classes or SVG attributes. `img-src` also allows `data:`. | M2 notes, item 7. Leaflet sets a `data:` GIF as the `src` of tiles it removes while zooming; without `data:` every zoom logs CSP errors. |
| **`<meta name="robots" content="noindex">`** | Until the M5 public launch. |
| If `data/i18n.json` itself fails to load, `index.html` holds one static VI + EN fallback message. | That message cannot come from the file that failed. All other UI strings live in `data/i18n.json`. |
| New strings `loading` and `dataFailed` (both languages). If the spots or districts fail to load, the message shows in VI and EN at once. | Spots load asynchronously after the map. |
| Legend table cells may wrap long words (`overflow-wrap:anywhere`). | The table was 5 px wider than the 360 px desktop panel, which showed a horizontal scrollbar (same in the prototype). |
| `favicon.svg` | Avoids a 404 console error for `/favicon.ico`. |
| Licences: MIT for code (`LICENSE`), ODbL 1.0 for `data/hcmc-flood-spots.geojson` (`data/LICENSE-ODbL.md`). | The geometry was traced on OpenStreetMap. |

## 14. M2 decisions

Taken during the M2 prototype (details in `docs/m2-prototype-notes.md`):

- Search covers all 17 in-scope former districts (with no-data handling) plus the wards in the data. Other wards are found through Nominatim.
- Cause filter: All / Rain (includes "both") / High tide (includes "both").
- Depth words extend the M1 table: ≤10 ankle-deep · 11–30 half a motorbike wheel · 31–40 wheel-deep (nearly knee) · 41–50 knee-deep · 51–70 above the knee · >70 waist-deep or more. A range shows "min word to max word".
- EN place names translate the prefix and keep diacritics ("Bến Thành Ward", "Formerly District 1", "Formerly Thủ Đức City").
- `notes` stays internal and is not shown.
- Desktop: the details card sits below a fixed search + filter header; the legend collapses while details are open.
- Language toggle is a single "VI | EN" button. Default language: the saved choice, otherwise VI if the browser language is Vietnamese, else EN.
- A shared link to a resolved spot turns "Show resolved" on.
- A resolved spot's risk badge is grey and reads "High risk (before)" / "Nguy cơ Cao (trước đây)".
- Disclaimer wording (VI and EN) confirmed.
- Kept as designed: O-1 (resolved and Medium lines both read as dashed in greyscale) and O-2 (low-contrast Low icon on dark chips in dark mode).
