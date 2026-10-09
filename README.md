# FloodMap TP.HCM

A static website that maps streets and places in Ho Chi Minh City that flood in heavy rain or at high tide, so people can check a place before they go. Vietnamese and English. Informational only: it is not an official flood warning.

**Live:** https://strongo97.github.io/floodmap/

- Requirements: [docs/requirements.md](docs/requirements.md) · Design: [docs/design.md](docs/design.md) · Sources: [docs/seed-sources.md](docs/seed-sources.md) · M2 notes: [docs/m2-prototype-notes.md](docs/m2-prototype-notes.md)
- Plain HTML, CSS and ES modules. No framework, no build step, no npm dependencies. Leaflet 1.9.4 from cdnjs, OpenStreetMap tiles, Nominatim address search.

## Add, edit or retire a spot (about 15 minutes)

All spots live in one file: [`data/hcmc-flood-spots.geojson`](data/hcmc-flood-spots.geojson). Field rules are in [docs/design.md §4](docs/design.md#4-data-model).

1. **Branch:** `git switch -c data/<short-name>`.
2. **Edit the GeoJSON.**
   - **Add:** copy an existing feature and give it the next free id (`hcmc-NNNN`; never reuse an id). Fill in `name_vi`, `name_en`, `ward` (new ward), `legacy_district` (former district), `cause` (`rain` / `tide` / `both`), `depth_cm` `{min, max}`, `frequency` (`rare` / `occasional` / `frequent`), `status` (`active`), `sources` (at least one URL), `past_events` (date + source each) and `last_verified` (today, `YYYY-MM-DD`).
   - **Never add a `risk` field.** Risk is computed from `depth_cm.max` and `frequency`.
   - **Edit:** change the fields, add the new source, and update `last_verified`.
   - **Retire:** **never delete a spot.** Set `status` to `resolved` (or `improved`) and add a source that shows the fix.
3. **Draw the geometry** in [geojson.io](https://geojson.io): turn on the OSM layer, trace the flooded stretch of street (a LineString by default; a Point for a single spot such as an underpass; a Polygon only for a real area), then copy the `geometry` object into the feature. Coordinates are `[lon, lat]`.
4. **Validate:** `node scripts/validate.mjs`. It prints each spot's computed risk and fails on any rule break. A warning means `last_verified` is more than 12 months old.
5. **Open a PR.** CI runs the validator with `--base` (it fails if any spot id was deleted) and the tests. Merge when it is green; GitHub Pages redeploys in a minute or two.

## Run locally

Needs Python 3 (for the local server) and Node 20 or later (for the validator and tests).

```sh
python -m http.server 8000
# open http://localhost:8000/
```

Opening `index.html` as a file does not work: the page fetches its data. To check the "locate me" button, use `localhost`, not your LAN IP, because geolocation needs a secure context.

## Tests

```sh
node scripts/validate.mjs        # data rules; add --base origin/main to check no spot was deleted
node --test                      # risk table, validator fixtures, search helpers, i18n keys
```

Test fixtures live in `tests/fixtures/`. `tests/fixtures/styles-demo.geojson` is **altered test data** for checking the Medium/Low and improved/resolved styles; never copy it into `data/`.

## Licence

Code: MIT ([LICENSE](LICENSE)). Data: ODbL 1.0 ([data/LICENSE-ODbL.md](data/LICENSE-ODbL.md)); the geometry was traced on OpenStreetMap, © OpenStreetMap contributors.
