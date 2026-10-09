# FloodMap M2 — prototype test notes (v2, 2026-10-09)

Files (in `OUTPUTS/FloodMap/`):

- `2026-10-09_floodmap_prototype_v2.html`: the prototype. Real M1 data (`seed-spots_m1-final.geojson`, embedded unchanged).
- `2026-10-09_floodmap_prototype-TESTDATA_v2.html`: same code, **altered data** for checking Medium/Low and improved/resolved styles. Red "TEST DATA — NOT REAL" banner. Never use in M3.
- v1 files are kept for reference.

## Changes since v1

| Change | Why |
|---|---|
| Risk badge for a **resolved** spot is now grey and reads "High risk (before)" / "Nguy cơ Cao (trước đây)". New i18n key `riskBadgeBefore` (VI and EN). | Trong's answer to Q-2 (2026-10-09) |

v2 re-check (test-data file, 360 px, VI, EN and dark mode): the resolved spots hcmc-0023 and hcmc-0024 show the grey badge with the right text in both languages. Active spots keep their coloured badge (hcmc-0028 Medium). Both languages still have the same 120 i18n keys. The embedded data is still identical to m1-final. Trong's phone test of v1 (over the LAN) looked good.

## How it was tested

- **Headless Chromium (session sandbox), served over http.** Leaflet loaded from npm files byte-identical to cdnjs. Tiles, Nominatim and the CDN were mocked, because the sandbox has no access to those hosts. Mobile tests used 360×740 with touch; desktop tests used 1280×800. Both in light and dark mode.
- **Built-in browser (your PC, live network).** This browser can't open local files or a local server, so the full page couldn't run there. I used it to check:
  - The SRI hashes match the files cdnjs serves today (leaflet.js and leaflet.css 1.9.4, sha512).
  - OSM tiles load from an https page; you see real tiles, not "Access blocked".
  - Esri tiles load.
  - Nominatim answers our exact request (`viewbox` + `bounded=1` + `countrycodes=vn`) with CORS: "Nguyễn Văn Khối" returned 5 results in Phường Thông Tây Hội. I sent one request.
- **Data.** The embedded GeoJSON is identical to `m1-final`. `seed-check_v2.mjs` gives no errors on both the embedded data and the test copy.
- **Risk function.** Passes all 9 table cells and the boundaries at 9/10, 30/31 and 0 cm.

## FR checklist

| ID | Result | Notes |
|---|---|---|
| FR-1 Map, pan/zoom, locate | **Pass** (locate partly) | Opens on central HCMC (10.785, 106.695) at zoom 12. `maxBounds` uses the v1 box with viscosity 1. A pan to (10.3, 106.2) snapped back. The minimum zoom is the zoom at which the whole v1 box just fits: 11 on a 360 px phone, 12 on a 1280 px desktop. A zoom-8 attempt stayed at 11. On a tall phone at zoom 11, Leaflet centres the box, so a strip above and below it shows; you can't pan into it. **Locate me:** the code path was checked (insecure-context, denied and outside-area messages). A real position fix still needs a desktop browser or HTTPS (M3). |
| FR-2 Lines, points, polygons, tappable | **Pass** | 24 lines, 5 points and 2 polygons. In touch tests, these all selected the spot: a tap 8 px off a line (20 px hit line), a tap 18 px from a point centre (44 px target), and a tap inside a polygon. |
| FR-3 Colour + label + icon, greyscale | **Pass** | Greyscale screenshots of the test-data file show solid, dashed and dotted lines; solid, dashed and dotted area outlines; and triangle, diamond and circle icons. Chips and badges also carry text. See observation O-1. |
| FR-4 Spot details | **Pass** | Order follows design §5. A resolved spot shows a grey risk badge with "(before)" (v2). Depth is shown as cm + words in both languages. Up to 5 past events, newest first. Sources open in a new tab (`rel="noopener noreferrer"`). The last-verified date is shown. Empty `past_events` hides that section (hcmc-0022). `notes` is hidden, as agreed. |
| FR-5 Search | **Pass** | Typing "quan 4", "Quận 4", "q4" or "district 4" gives "Quận 4 cũ · no data". "phan huy" gives the street (2 spots) and both spots. "Thông Tây Hội" gives the ward. **No Nominatim request while typing** (count checked = 0). Enter with no local match, or the "Search address" row, sends one request. The 1 s spacing and the in-memory cache are in place. |
| FR-6 Filters | **Pass** | Risk chips, plus a cause menu (All / Rain = rain + both / High tide = tide + both). Counts were checked against the data with no reload: tide 17/31, rain 24/31 on the test copy. |
| FR-7 Legend | **Pass** | Desktop: in the panel, expanded until a spot is selected, then collapsed to one row. Mobile: the (i) button opens a legend sheet. It covers risk styles, states, the risk table, frequency, depth words and causes. |
| FR-8 Disclaimer | **Pass** | Modal on first visit; `localStorage` flag in try/catch. Reachable from the attribution bar ("Lưu ý / Disclaimer") on every screen, the desktop panel footer and the mobile legend. |
| FR-9 VI/EN | **Pass** | Both languages have the same i18n keys. Automated scan: no Vietnamese UI text in EN and no English UI words in VI, outside spot names marked with `lang`. Ward and district names are translated per your choice ("Bến Thành Ward", "Formerly District 1", "Formerly Thủ Đức City"). The Leaflet zoom-button titles are translated too. |
| FR-10 Attribution | **Pass** | Over http(s): "© OpenStreetMap contributors" + "Address search: Nominatim". As a file: Esri attribution (it includes © OpenStreetMap contributors) + Nominatim. |
| FR-11 Status | **Pass** | Resolved spots are hidden until "Show resolved" is on (29/31 → 31/31 on the test copy). Improved spots are shown at 60% opacity. A shared link to a resolved spot turns "Show resolved" on; Trong confirmed this behaviour. |
| FR-12 Empty result | **Pass** | Message: "No flood data for this place. This doesn't mean it never floods." (also in VI). Shown when a former district has no spots, when Nominatim finds nothing, and when an address has no spot within 300 m. A Nominatim error or 429 shows "Address search is busy…", and local search keeps working. |

## Other checks

| Check | Result |
|---|---|
| No horizontal scroll | Pass at 360 px and 1280 px (`scrollWidth` = viewport). |
| Console errors | None from the page. The only console errors are network lines for deliberately failed requests (mocked 429, blocked tiles). |
| Keyboard-only | Pass. Tab order: language → search → search button → risk chips → cause → show resolved → legend → disclaimer → map → each spot (lines, areas and points are focusable, with labels) → zoom → locate. Enter or Space on a spot opens its details and moves focus to the title. Esc closes the details and returns focus to the spot. Search works with ↑/↓/Enter. |
| Greyscale | Pass (see FR-3). |
| Tiles fail | Pass: notice "The map background couldn't load. Flood spots are still shown."; all 31 spots still render. |
| Page weight | HTML 152 KB (data ~80 KB) + Leaflet JS 148 KB + CSS 15 KB ≈ **315 KB**, not counting tiles. Under 1 MB. |
| Line widths | 4 px at zoom ≤13, 6 px at 14–15, 8 px at ≥16. Casing is the line width + 3 px. The selected line is 8 px with an 18 px glow at 25%. |
| Not tested here | Lighthouse (performance and accessibility score), a screen reader on a real device, Safari/iOS, real geolocation. These belong in your phone test now and in M3. |

## Prototype-only choices that M3 must change

1. **Tiles.** `CONFIG.TILE_PROVIDER` picks OSM over http(s) and Esri on `file://`. M3: OSM only. Delete the Esri entry and the protocol switch.
2. **Embedded data.** The GeoJSON is inline in `<script type="application/json" id="fm-data">`. M3: fetch `data/hcmc-flood-spots.geojson`.
3. **One file.** The script is already split into marked sections: CONFIG, RISK, DEPTH WORDS, I18N, DATA, SEARCH, GEOMETRY, STYLES, APP/MAP, DETAILS, SHEET, LEGEND, SEARCH UI, FILTERS/LANG/LOCATE/DISCLAIMER, BOOT. Move them into `js/app.js`, `js/risk.js`, `js/spots.js`, `js/search.js` and `js/i18n.js` (strings to `data/i18n.json`); the CSS goes to `css/styles.css`. `depthClass` / `RISK_TABLE` / `computeRisk` have no DOM dependencies; export them as-is so `validate.mjs` can import them.
4. **District gazetteer.** The `DISTRICTS` list holds approximate centres I set by hand, not surveyed points. Move it to a data file in M3 and check the centres. Quận 2 and Quận 9 are aliases of Thủ Đức.
5. **Nominatim from `file://`.** The browser sends no Referer from a file, so Nominatim may refuse; the "busy" message then shows. This is expected. Don't work around it: it goes away once the site is served (LAN test or GitHub Pages).
6. **Build script.** A scratch Node script injected the data and the test banner. It isn't shipped; M3 has no build step.
7. **Add in M3:** a Content-Security-Policy meta tag (cdnjs, OSM tiles, Nominatim only), Lighthouse ≥ 90, and `risk.js` unit tests in the repo.

## Decisions made in this session (for the design doc)

- Search covers all 17 in-scope former districts (with no-data handling) plus the wards in the data. Other wards are found through Nominatim.
- The cause filter is All / Rain (incl. both) / High tide (incl. both).
- Depth words extend the M1 table: ≤10 ankle-deep · 11–30 half a motorbike wheel · 31–40 wheel-deep (nearly knee) · 41–50 knee-deep · 51–70 above the knee · >70 waist-deep or more. A range shows "min word to max word".
- EN place names translate the prefix and keep diacritics.
- `notes` stays internal.
- Desktop: the details card sits below a fixed search + filter header, and the legend collapses while details are open.
- The language toggle is a single "VI | EN" button (64 px, as in the mockup). A two-button version didn't leave room for the search placeholder at 360 px.
- The default language is the saved choice; otherwise VI if the browser language is Vietnamese, else EN.

## Observations

Trong decided to keep O-1 and O-2 as designed (2026-10-09).

- **O-1.** In greyscale, a resolved line (grey, dash 4/4) and a Medium line (amber, dash 10/6) both read as dashed grey. Resolved spots are hidden by default and their details say "Resolved", so I left it as designed. It could be fixed with a thinner resolved line or a different dash.
- **O-2.** In dark mode, the dark-blue Low icon on a dark chip has low contrast. The "Low" text label still carries the meaning. Could use a lighter blue for chip icons in dark mode only.
- **O-3.** Selecting a spot on a phone zooms to it (max zoom 16–17) when it isn't already well inside the visible area above the sheet. Tell me if that feels too jumpy.
- **O-4.** A depth range starting at 10 cm reads "ankle-deep to …" (e.g. hcmc-0014 "10–100 cm · ankle-deep to waist-deep or more"). That is correct by the table, but the range is very wide. Worth a data review rather than a code change.

## Answered questions (Trong, 2026-10-09)

- **Q-1.** A shared link to a resolved spot turns "Show resolved" on: **keep it**.
- **Q-2.** Risk badge for a resolved spot: **grey with "(before)"**. Done in v2.
- **Q-3.** Disclaimer wording in both languages: **confirmed**.

## How to open it on your phone

1. On the PC, open a terminal in `C:\Cowork\OUTPUTS\FloodMap` and run `python -m http.server 8000`.
2. Find the PC's Wi-Fi IP with `ipconfig` (IPv4 Address, e.g. 192.168.1.23).
3. On the phone, using the same Wi-Fi, open `http://192.168.1.23:8000/2026-10-09_floodmap_prototype_v2.html`.
4. If the phone can't connect, allow Python through Windows Firewall for **Private** networks.

Over the LAN, the page is served over http, so it uses OSM tiles and Nominatim, the same as M3. "Locate me" shows the https message on the phone; that's expected. To see the test styles, open `…prototype-TESTDATA_v2.html` the same way.
