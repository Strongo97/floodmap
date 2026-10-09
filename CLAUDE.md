# FloodMap: repo working agreement

Static site (GitHub Pages, `main` / root) mapping flood-prone streets in Ho Chi Minh City. Read this before changing anything.

## Sources of truth

- `docs/requirements.md`: FR-1 to FR-12, non-functional requirements, milestones.
- `docs/design.md`: architecture, data model and field rules (§4), visual design (§6), behaviour (§7). Sections 13 (M3 deviations) and 14 (M2 decisions) override earlier sections where they differ.
- `docs/m2-prototype-notes.md`: decisions and observations from the approved prototype. The prototype's look and behaviour are the spec wherever the docs are silent.
- `docs/seed-sources.md`: source list and depth-word table.
- `data/hcmc-flood-spots.geojson`: the data. `scripts/validate.mjs` enforces its rules.

## Hard rules

1. **Risk is computed, never stored.** `js/risk.js` (pure, shared by the site and the validator) derives it from `depth_cm.max` and `frequency`. No `risk` key anywhere in the data, and no code reads one.
2. **Spots are never deleted.** Retire a spot by setting `status` to `resolved`. Ids are never reused. CI enforces this with `validate.mjs --base`.
3. **Every UI string goes in `data/i18n.json`, in both `vi` and `en`, with identical keys.** No hard-coded UI text in HTML or JS. The one exception is the static VI + EN fallback in `index.html`, shown only if `i18n.json` itself fails to load.
4. **Nominatim:** submit only (Enter or the search button), never autocomplete, at most 1 request per second, `viewbox` + `bounded=1` + `countrycodes=vn`, results cached in memory. Instant suggestions are local only.
5. **No runtime dependencies and no build step.** Plain ES modules, Leaflet 1.9.4 from cdnjs with SRI. No npm packages, no bundler.
6. **`node scripts/validate.mjs` and `node --test` must pass before any commit.**
7. Never put altered data in `data/`. Test copies live in `tests/fixtures/` only.
8. Bounds, zoom limits, tile URL and Nominatim settings live only in `js/config.js`.
9. Keep the Content-Security-Policy in `index.html` tight: add a host only when a feature needs it, and note why in `docs/design.md` §13.

## Layout

`index.html`, `css/styles.css`, `js/{app,config,risk,spots,search,i18n}.js`, `data/{hcmc-flood-spots.geojson,i18n.json,districts.json}`, `scripts/validate.mjs`, `tests/` (node:test), `docs/`.

## Workflow

- Work on a branch and open a PR. CI (Node 20) runs the validator (with `--base` on PRs) and the tests. Trong reviews and merges.
- Ask Trong before any push, repo creation or settings change.
- Check locally with `python -m http.server 8000`: 360 px and desktop widths, no console errors, both languages.
