// Search: accent-insensitive local index (instant suggestions) and Nominatim (on submit only).
// Pure helpers, no DOM: imported by js/app.js and by the tests.
import { CONFIG } from "./config.js";

export function norm(s) {
  return String(s).replace(/[đĐ]/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function districtAliases(name) {
  const m = /^Quận\s+(\d+)$/u.exec(name);
  if (m) { const n = m[1]; return [name, `q${n}`, `q ${n}`, `district ${n}`, `quan ${n}`]; }
  return [name, "quận " + name, name + " district"];
}
/**
 * Build the local search index from the spots ({ id, p }) and the former districts
 * (data/districts.json entries: { name, center, zoom, aliases }).
 */
export function buildIndex(spots, districts) {
  const idx = [];
  const streets = new Map(), wards = new Map(), dists = new Map();
  for (const s of spots) {
    idx.push({ type: "spot", key: s.id, ids: [s.id], terms: [norm(s.p.name_vi), norm(s.p.name_en), s.id] });
    for (const st of (s.p.street || "").split(";").map((x) => x.trim()).filter(Boolean)) {
      if (!streets.has(st)) streets.set(st, []); streets.get(st).push(s.id);
    }
    for (const w of s.p.ward.split("/").map((x) => x.trim()).filter(Boolean)) {
      if (!wards.has(w)) wards.set(w, []); wards.get(w).push(s.id);
    }
    if (s.p.legacy_district) { if (!dists.has(s.p.legacy_district)) dists.set(s.p.legacy_district, []); dists.get(s.p.legacy_district).push(s.id); }
  }
  for (const [st, ids] of streets) idx.push({ type: "street", key: st, ids, terms: [norm(st), norm("đường " + st), norm(st + " street")] });
  for (const [w, ids] of wards) idx.push({ type: "ward", key: w, ids, terms: [norm(w), norm(w.replace(/^Phường\s+/u, "") + " ward")] });
  for (const d of districts) {
    const terms = districtAliases(d.name).concat(d.aliases || []).map(norm);
    idx.push({ type: "district", key: d.name, ids: dists.get(d.name) || [], terms, district: d });
  }
  return idx;
}
const TYPE_ORDER = { district: 0, ward: 1, street: 2, spot: 3 };
/** Instant local suggestions (accent-insensitive, best first, at most `max`). */
export function localSearch(index, q, max = CONFIG.SUGGEST_MAX) {
  const qn = norm(q);
  if (qn.length < 2) return [];
  const qt = qn.split(" ");
  const out = [];
  for (const e of index) {
    let best = Infinity;
    for (const term of e.terms) {
      const words = term.split(" ");
      let ok = true, exact = 0;
      for (const tok of qt) {
        const w = words.find((x) => x.startsWith(tok));
        if (!w) { ok = false; break; }
        if (w === tok) exact++;
      }
      if (!ok) continue;
      let score = (term === qn ? 0 : term.startsWith(qn) ? 1 : term.includes(qn) ? 2 : 3) * 10 + (qt.length - exact);
      best = Math.min(best, score);
    }
    if (best < Infinity) out.push({ e, score: best });
  }
  out.sort((a, b) => a.score - b.score || TYPE_ORDER[a.e.type] - TYPE_ORDER[b.e.type] || a.e.key.localeCompare(b.e.key, "vi"));
  return out.slice(0, max).map((x) => x.e);
}

/* Nominatim: submit-only (never called while typing), ≤1 req/s, bounded to the v1 area, cached in memory. */
const geoCache = new Map();
let geoLast = 0, geoInFlight = null;
export async function geocode(q, lang) {
  const key = lang + "|" + norm(q);
  if (geoCache.has(key)) return geoCache.get(key);
  if (geoInFlight) throw new Error("busy");
  const wait = geoLast + CONFIG.NOMINATIM_MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const [[s, w], [n, e]] = CONFIG.BOUNDS;
  const params = new URLSearchParams({ q, format: "jsonv2", limit: "5", countrycodes: "vn", viewbox: `${w},${n},${e},${s}`, bounded: "1", "accept-language": lang === "vi" ? "vi" : "en" });
  geoLast = Date.now();
  geoInFlight = fetch(`${CONFIG.NOMINATIM_URL}?${params}`, { headers: { Accept: "application/json" } })
    .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  try {
    const res = await geoInFlight;
    const list = (Array.isArray(res) ? res : []).map((r) => ({ name: r.display_name, lat: +r.lat, lon: +r.lon }));
    geoCache.set(key, list);
    return list;
  } finally { geoInFlight = null; }
}

/* Geometry helpers: distance from a point to a spot's line / point / polygon, in metres. */
export function projector(lat0) {
  const k = Math.PI / 180, R = 6371008.8, c = Math.cos(lat0 * k);
  return ([lon, lat]) => [lon * k * R * c, lat * k * R];
}
export function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
  let u = L2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0;
  u = Math.max(0, Math.min(1, u));
  return Math.hypot(p[0] - (a[0] + u * dx), p[1] - (a[1] + u * dy));
}
export function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function distanceToSpot(spot, lat, lon) {
  const P = projector(lat), p = P([lon, lat]), g = spot.f.geometry;
  if (g.type === "Point") { const q = P(g.coordinates); return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  const lineMin = (coords) => { let m = Infinity; const pts = coords.map(P); for (let i = 1; i < pts.length; i++) m = Math.min(m, segDist(p, pts[i - 1], pts[i])); return m; };
  if (g.type === "LineString") return lineMin(g.coordinates);
  if (g.type === "Polygon") {
    if (inRing([lon, lat], g.coordinates[0]) && !g.coordinates.slice(1).some((h) => inRing([lon, lat], h))) return 0;
    return Math.min(...g.coordinates.map(lineMin));
  }
  return Infinity;
}
