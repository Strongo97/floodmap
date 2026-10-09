// Flood spots: load the GeoJSON, filter state, styles (design §6) and Leaflet rendering.
// Uses the global L (Leaflet 1.9.4, loaded from cdnjs before the modules).
import { computeRisk, RISK_RANK } from "./risk.js";
import { t, LANG } from "./i18n.js";

/* ---- Data ---- */
export let SPOTS = [];
export let SPOT_BY_ID = new Map();
/** Fetch the GeoJSON and compute each spot's risk. Rejects if the file cannot be loaded or parsed. */
export async function loadSpots(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  const data = await r.json();
  SPOTS = data.features.map((f) => {
    const p = f.properties;
    return { id: p.id, f, p, risk: computeRisk(p.depth_cm, p.frequency), layers: null, focusEl: null };
  });
  SPOT_BY_ID = new Map(SPOTS.map((s) => [s.id, s]));
  return SPOTS;
}
export function spotName(s) { return LANG === "vi" ? s.p.name_vi : s.p.name_en; }

/* ---- Filter + selection state ---- */
export const state = { risks: new Set(["high", "medium", "low"]), cause: "all", showResolved: false, selectedId: null, sheet: "closed", legendOpen: false };
export function isVisible(spot) {
  if (spot.p.status === "resolved" && !state.showResolved) return false;
  if (!state.risks.has(spot.risk)) return false;
  if (state.cause === "rain" && spot.p.cause === "tide") return false;
  if (state.cause === "tide" && spot.p.cause === "rain") return false;
  return true;
}
/* ---- Geometry → Leaflet ---- */
export function spotLatLngs(spot) {
  const g = spot.f.geometry;
  if (g.type === "Point") return [g.coordinates[1], g.coordinates[0]];
  if (g.type === "LineString") return g.coordinates.map(([x, y]) => [y, x]);
  return g.coordinates.map((ring) => ring.map(([x, y]) => [y, x]));
}
export function spotBounds(spot) {
  const g = spot.f.geometry;
  const pts = g.type === "Point" ? [g.coordinates] : g.type === "LineString" ? g.coordinates : g.coordinates.flat();
  return L.latLngBounds(pts.map(([x, y]) => [y, x]));
}
/* ---- Styles (design §6): colours, patterns, widths by zoom, states ---- */
export const COLORS = { high: "#c62828", medium: "#e08a00", low: "#1565c0", resolved: "#9e9e9e" };
export function lineWidth(z) { return z <= 13 ? 4 : z <= 15 ? 6 : 8; }
export function lineDash(risk, w) { return risk === "medium" ? "10 6" : risk === "low" ? `0.1 ${Math.round(w * 1.5)}` : null; }
export function lineStyle(spot, w) {
  const resolved = spot.p.status === "resolved", op = spot.p.status === "improved" ? 0.6 : 1;
  if (resolved) return { color: COLORS.resolved, weight: Math.max(3, w - 1), dashArray: "4 4", lineCap: "butt", opacity: 1 };
  return { color: COLORS[spot.risk], weight: w, dashArray: lineDash(spot.risk, w), lineCap: spot.risk === "medium" ? "butt" : "round", opacity: op };
}
export function casingStyle(spot, w) { return { color: "#ffffff", weight: w + 3, opacity: spot.p.status === "improved" ? 0.6 : 1, lineCap: "round", lineJoin: "round" }; }
export function areaStyle(spot, selected) {
  if (spot.p.status === "resolved") return { color: COLORS.resolved, weight: selected ? 3 : 2, dashArray: "4 4", fillColor: COLORS.resolved, fillOpacity: selected ? 0.3 : 0.15, opacity: 1 };
  const op = spot.p.status === "improved" && !selected ? 0.6 : 1;
  const base = spot.risk === "low" ? 0.18 : 0.22;
  return {
    color: COLORS[spot.risk], weight: selected ? 3 : 2, opacity: op, lineCap: spot.risk === "low" ? "round" : "butt",
    dashArray: spot.risk === "medium" ? "8 5" : spot.risk === "low" ? "1.5 5" : null,
    fillColor: COLORS[spot.risk], fillOpacity: selected ? 0.35 : base * op
  };
}
export function iconShape(risk, color, cx, cy, s) {     // s = half size of the glyph
  if (risk === "high") return `<path d="M${cx},${cy - s} L${cx + s},${cy + s * 0.85} L${cx - s},${cy + s * 0.85} Z" fill="${color}"/>`;
  if (risk === "medium") return `<path d="M${cx},${cy - s} L${cx + s},${cy} L${cx},${cy + s} L${cx - s},${cy} Z" fill="${color}"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="${s * 0.85}" fill="${color}"/>`;
}
export function riskIconSvg(risk, color, size) {
  return `<svg class="rico" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${iconShape(risk, color, 12, 12, 7)}</svg>`;
}
export function pointIconHtml(spot, selected) {
  const resolved = spot.p.status === "resolved", col = resolved ? COLORS.resolved : COLORS[spot.risk];
  const op = spot.p.status === "improved" && !selected ? 0.6 : 1;
  return `<svg width="44" height="44" viewBox="0 0 44 44" opacity="${op}" aria-hidden="true">` +
    (selected ? `<circle cx="22" cy="22" r="20" fill="${col}" fill-opacity=".25"/>` : "") +
    `<circle cx="22" cy="22" r="${selected ? 14 : 12}" fill="#fff" stroke="${col}" stroke-width="${selected ? 3 : 2}"/>` +
    `<circle class="ring-focus" cx="22" cy="22" r="17" fill="none" stroke="none"/>` +
    iconShape(spot.risk, col, 22, 22, selected ? 7 : 6) + `</svg>`;
}
/* ---- Layers ---- */
let map = null, groups = null, hooks = { onSelect() {}, onHiddenSelected() {} };
/**
 * Create the panes and layer groups on `map`. Panes give the draw order from design §6:
 * areas < casing < lines < hit targets < points < selected.
 * hooks.onSelect(id, opts) selects a spot; hooks.onHiddenSelected() closes the details of a spot that a filter hid.
 */
export function initLayers(m, h) {
  map = m; hooks = h;
  [["fmAreas", 410], ["fmCasing", 420], ["fmLines", 430], ["fmHit", 440], ["fmPoints", 600], ["fmSelected", 650], ["fmSelPoint", 660], ["fmLoc", 670]]
    .forEach(([name, z]) => { const p = map.createPane(name); p.style.zIndex = z; });
  map.getPane("fmSelected").style.pointerEvents = "none";
  map.getPane("fmSelPoint").style.pointerEvents = "none";
  groups = {}; ["areas", "casing", "lines", "hit", "points", "selected"].forEach((k) => { groups[k] = L.layerGroup().addTo(map); });
  map.on("zoomend", updateWeights);
}

/* Render all visible spots. Rebuilt on every filter change so the draw order stays Low < Medium < High. */
export function renderSpots() {
  Object.values(groups).forEach((g) => g.clearLayers());
  hiddenBasePoly = null;
  const w = lineWidth(map.getZoom());
  const vis = SPOTS.filter(isVisible).sort((a, b) => {
    const ra = a.p.status === "resolved" ? 0 : RISK_RANK[a.risk], rb = b.p.status === "resolved" ? 0 : RISK_RANK[b.risk];
    return ra - rb;
  });
  for (const s of SPOTS) { s.layers = null; s.focusEl = null; }
  for (const s of vis) {
    const g = s.f.geometry, ll = spotLatLngs(s), onSel = () => hooks.onSelect(s.id, { fit: false, focus: false });
    if (g.type === "Polygon") {
      const poly = L.polygon(ll, Object.assign({ pane: "fmAreas", className: "fm-area" }, areaStyle(s, false))).on("click", (e) => { L.DomEvent.stop(e); onSel(); });
      groups.areas.addLayer(poly);
      s.layers = { poly }; s.focusEl = poly.getElement();
    } else if (g.type === "LineString") {
      const casing = L.polyline(ll, Object.assign({ pane: "fmCasing", interactive: false }, casingStyle(s, w)));
      const line = L.polyline(ll, Object.assign({ pane: "fmLines", interactive: false }, lineStyle(s, w)));
      const hit = L.polyline(ll, { pane: "fmHit", color: "#000", opacity: 0, weight: 20, lineCap: "round", lineJoin: "round", className: "fm-hit" })
        .on("click", (e) => { L.DomEvent.stop(e); onSel(); });
      groups.casing.addLayer(casing); groups.lines.addLayer(line); groups.hit.addLayer(hit);
      s.layers = { casing, line, hit }; s.focusEl = hit.getElement();
    } else if (g.type === "Point") {
      const mk = L.marker(ll, { pane: "fmPoints", keyboard: true, icon: L.divIcon({ className: "fm-pt", html: pointIconHtml(s, false), iconSize: [44, 44], iconAnchor: [22, 22] }) })
        .on("click", (e) => { onSel(); });
      groups.points.addLayer(mk);
      s.layers = { marker: mk }; s.focusEl = mk.getElement();
    }
    makeFocusable(s);
  }
  if (state.selectedId && !isVisible(SPOT_BY_ID.get(state.selectedId))) hooks.onHiddenSelected();
  else drawSelected();
  document.getElementById("count").textContent = t("count", { n: vis.length, t: SPOTS.length });
}
function makeFocusable(s) {
  const el = s.focusEl; if (!el) return;
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", t("spotAria", { name: spotName(s), r: t("risk_" + s.risk) }));
  el.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); hooks.onSelect(s.id, { fit: true, focus: true }); }
  });
}
function updateWeights() {
  const w = lineWidth(map.getZoom());
  for (const s of SPOTS) {
    if (!s.layers || !s.layers.line) continue;
    s.layers.casing.setStyle(casingStyle(s, w));
    s.layers.line.setStyle(lineStyle(s, w));
  }
}
let hiddenBasePoly = null;
export function drawSelected() {
  groups.selected.clearLayers();
  if (hiddenBasePoly) { hiddenBasePoly.poly.setStyle(areaStyle(hiddenBasePoly.spot, false)); hiddenBasePoly = null; }
  const s = state.selectedId && SPOT_BY_ID.get(state.selectedId);
  if (!s || !s.layers) return;
  if (s.layers.poly) { s.layers.poly.setStyle({ opacity: 0, fillOpacity: 0 }); hiddenBasePoly = { poly: s.layers.poly, spot: s }; }
  const g = s.f.geometry, ll = spotLatLngs(s);
  const col = s.p.status === "resolved" ? COLORS.resolved : COLORS[s.risk];
  if (g.type === "LineString") {
    const dash = s.p.status === "resolved" ? "4 4" : lineDash(s.risk, 8);
    groups.selected.addLayer(L.polyline(ll, { pane: "fmSelected", interactive: false, color: col, opacity: 0.25, weight: 18, lineCap: "round", lineJoin: "round" }));
    groups.selected.addLayer(L.polyline(ll, { pane: "fmSelected", interactive: false, color: "#fff", weight: 11, lineCap: "round", lineJoin: "round" }));
    groups.selected.addLayer(L.polyline(ll, { pane: "fmSelected", interactive: false, color: col, weight: 8, dashArray: dash, lineCap: s.risk === "medium" ? "butt" : "round", lineJoin: "round" }));
  } else if (g.type === "Polygon") {
    groups.selected.addLayer(L.polygon(ll, Object.assign({ pane: "fmSelected", interactive: false }, areaStyle(s, true))));
  } else {
    groups.selected.addLayer(L.marker(ll, { pane: "fmSelPoint", interactive: false, keyboard: false, icon: L.divIcon({ className: "fm-pt", html: pointIconHtml(s, true), iconSize: [44, 44], iconAnchor: [22, 22] }) }));
  }
}