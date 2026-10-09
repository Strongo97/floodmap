# FloodMap: Requirements (v2)

Status: Reviewed 2026-10-08. Replaces v1. Decisions from the review are folded in; nothing is left marked [confirm].

## 1. Purpose

A public, mobile-friendly website that shows which streets and places in Ho Chi Minh City usually flood during heavy rain or high tides, so residents, commuters and visitors can check a place before they go there.

## 2. Scope (v1)

- **Area:** the former core urban area of HCMC: former Districts 1, 3, 4, 5, 6, 7, 8, 10, 11 and 12, plus Bình Thạnh, Phú Nhuận, Gò Vấp, Tân Bình, Tân Phú, Bình Tân and Thủ Đức. The rest of the merged city (former Bình Dương, Bà Rịa–Vũng Tàu, and outer districts) is out of scope.
- **Administrative units:** since 1 July 2025, HCMC has no districts. It has wards and communes only. The new ward is the main location field. The former district name is kept as a secondary field, because people still search with it.
- **Flood causes:** rain, tide, or both.
- **Languages:** Vietnamese and English, with a toggle.
- **Audience:** public, with no login and no user submissions. The site launches to a small group first, then to the public.
- **Address:** free GitHub Pages address (`<user>.github.io/floodmap`).
- **Priority:** mobile first.
- **Data:** curated by hand from public sources and updated manually.

## 3. Users and key tasks

| User | Task |
|---|---|
| Resident | Check whether their street floods, how deep, and how often. |
| Commuter | Check a destination or a street on the way before leaving in rain or at high tide. |
| Visitor / expat | See which areas to avoid in the rainy season. |
| Maintainer (Trong) | Add, correct or retire flood spots and their sources. |

## 4. Risk model

Risk is **worked out from two stored values**, never typed in by hand.

**Depth class**, from the typical maximum depth (`depth_cm.max`):

| Class | Depth | Everyday description |
|---|---|---|
| Shallow | under 10 cm | Ankle-deep |
| Moderate | 10 to 30 cm | Up to half a motorbike wheel, enough to stall some engines |
| Deep | over 30 cm | Knee-deep or more |

**Frequency**, during the rainy or high-tide season:

| Value | Meaning |
|---|---|
| Rare | Less than once a season |
| Occasional | A few times a season |
| Frequent | During most heavy rains or high tides |

**Risk table:**

|  | Rare | Occasional | Frequent |
|---|---|---|---|
| **Shallow** | Low | Low | Medium |
| **Moderate** | Low | Medium | High |
| **Deep** | Medium | High | High |

## 5. Functional requirements and acceptance criteria

| ID | Requirement | Accepted when |
|---|---|---|
| FR-1 | Interactive map of the v1 area, with pan, zoom and a "locate me" button. | The map opens centred on central HCMC. It cannot be panned or zoomed out beyond the v1 area. |
| FR-2 | Flood spots drawn as lines (street stretches, the default), points (single spots) or polygons (areas), coloured by risk. | All three shapes render with the risk colour and are tappable on a phone. |
| FR-3 | Risk shown with colour, text label and icon. | Risk can be identified in greyscale. |
| FR-4 | Spot details: name (VI and EN), ward, former district, cause, risk, depth (in cm and everyday words), frequency, status, up to 5 past events, sources and last-verified date. | Every field shows, or is hidden cleanly when empty. Sources open in a new tab. |
| FR-5 | Search: instant suggestions from the site's own data (spot names, streets, wards, former districts). Address search through Nominatim runs only when the user presses Enter or the search button. | Typing "Quận 4" or a new ward name gives instant matches. No request goes to Nominatim while typing. |
| FR-6 | Filters by risk level and by cause (rain, tide, both). | Toggling a filter hides or shows spots with no reload. |
| FR-7 | Legend explaining colours, icons, depth words and causes. | Visible on desktop, one tap away on mobile. |
| FR-8 | Disclaimer: informational only, not an official warning. | Visible on first load and reachable from every screen. |
| FR-9 | VI / EN toggle for all UI text and spot names. | No untranslated string in either language. |
| FR-10 | Attribution for map tiles and geocoding. | OSM attribution is visible on the map. |
| FR-11 | Spot status: active, improved or resolved. Resolved spots are hidden by default, with an option to show them. | A resolved spot does not show until the user turns that option on. |
| FR-12 | Empty search result message. | The message says the area has no data, not that it is safe. |

## 6. Out of scope for v1

User accounts or submissions, live rainfall, tide or sensor feeds, forecasts and alerts, areas outside the v1 scope, native apps, route planning, and rainfall-trigger (mm) values.

## 7. Data requirements

- Spots are stored in one GeoJSON file in the repository. Field definitions are in the design doc.
- Every spot has at least one source URL. No source means no spot.
- Risk is never stored. It is computed from depth and frequency by both the validator and the site.
- IDs are stable and never reused, even when a spot is resolved.
- Resolved spots are kept with their history and never deleted.
- Preferred sources, in order: Department of Construction (Sở Xây dựng) flood hotspot lists, other official city reports, then reputable news reports of specific flood events.

## 8. Non-functional requirements

- **Performance:** first usable map within 3 seconds on 4G. Page weight under 1 MB, not counting map tiles. Lighthouse mobile performance score of 90 or more.
- **Responsive:** works from 360 px wide upwards, with a 16 px side gutter and no horizontal scrolling.
- **Accessibility:** meets WCAG 2.1 AA. Risk is never shown by colour alone. All controls work with keyboard and screen reader.
- **Browsers:** current Chrome, Safari, Edge and Firefox, on iOS and Android.
- **Privacy:** no cookies, no analytics in v1. Location is used only in the browser.
- **Usage policies:** follows the OSM tile and Nominatim usage policies, including no autocomplete through Nominatim and no more than 1 request per second.
- **Maintainability:** editing one data file and running one command is enough to add or change a spot.

## 9. Milestones

| Milestone | Output | Done when |
|---|---|---|
| M0 Baseline | These requirements and the design doc | Reviewed (done 2026-10-08) |
| M1 Seed data | 20 to 30 sourced spots as GeoJSON, plus a review table | Trong confirms every spot |
| M2 Prototype | Single-file HTML with the M1 data | Trong approves it on a phone and a desktop |
| M3 Build | GitHub repo, validator, site on GitHub Pages | All acceptance criteria pass |
| M4 Beta | Link shared with a small group for about 2 weeks | Feedback triaged, blocking issues fixed |
| M5 Launch | Public announcement | Disclaimer and data checked again |

## 10. Success criteria (v1 launch)

- At least 50 sourced spots across the v1 area, with every former district in scope having at least one spot or a note explaining why not.
- Every spot has a source and a last-verified date from the past 12 months.
- Tested on a mid-range Android phone and an iPhone, in both languages.
- Trong can add or update a spot in under 15 minutes.
