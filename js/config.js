// FloodMap settings shared by the site (js/app.js) and the validator (scripts/validate.mjs).
// Pure data: no DOM, safe to import in Node.

// v1 area, design §3. [[south, west], [north, east]]
export const BOUNDS = [[10.68, 106.58], [10.92, 106.86]];

export const CONFIG = {
  BOUNDS,
  CENTER: [10.785, 106.695],        // central HCMC
  START_ZOOM: 12,
  MIN_ZOOM: 11,                     // raised automatically so the view never shows more than the whole v1 area
  MAX_ZOOM: 18,
  TILES: {                          // OpenStreetMap standard tiles only (tile usage policy: attribution always visible)
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19
  },
  NOMINATIM_URL: "https://nominatim.openstreetmap.org/search",
  NOMINATIM_MIN_INTERVAL_MS: 1000,  // usage policy: max 1 request per second
  NEAREST_SPOT_M: 300,
  SUGGEST_MAX: 5,
  STORAGE_LANG: "floodmap.lang",
  STORAGE_DISCLAIMER: "floodmap.disclaimerSeen",
  DESKTOP_MQ: "(min-width: 768px)",
  DATA_URL: "data/hcmc-flood-spots.geojson",
  I18N_URL: "data/i18n.json",
  DISTRICTS_URL: "data/districts.json"
};

/** True when [lat, lon] lies inside the v1 bounds (edges included). */
export function inBounds(lat, lon) {
  const [[s, w], [n, e]] = BOUNDS;
  return lat >= s && lat <= n && lon >= w && lon <= e;
}
