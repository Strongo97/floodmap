// FloodMap app: map setup, UI wiring (panel, bottom sheet, legend, search box, filters,
// language, locate, disclaimer, hash links) and boot. The map renders first; data loads asynchronously.
import { CONFIG } from "./config.js";
import { RISK_TABLE } from "./risk.js";
import { t, LANG, setLangValue, loadStrings, strings, nSpots, fmtWard, fmtDistrict, fmtDistrictName, fmtDate, fmtDepth, esc, DEPTH_WORDS } from "./i18n.js";
import { norm, buildIndex, localSearch, geocode, distanceToSpot } from "./search.js";
import {
  SPOTS, SPOT_BY_ID, loadSpots, spotName, state, isVisible, COLORS, iconShape, riskIconSvg,
  spotBounds, initLayers, renderSpots, drawSelected
} from "./spots.js";

const $ = (sel) => document.querySelector(sel);
const isDesktop = () => window.matchMedia(CONFIG.DESKTOP_MQ).matches;
let map, zoomCtl, tileLayer, locLayer = null, searchPin = null;
let INDEX = [], DISTRICTS = [];
let spotsReady = false;

/* =====================================================================
   MAP
   ===================================================================== */
function initMap() {
  map = L.map("map", {
    center: CONFIG.CENTER, zoom: CONFIG.START_ZOOM, minZoom: CONFIG.MIN_ZOOM, maxZoom: CONFIG.MAX_ZOOM,
    maxBounds: CONFIG.BOUNDS, maxBoundsViscosity: 1.0, zoomControl: false, attributionControl: true, tapTolerance: 15
  });
  initLayers(map, { onSelect: selectSpot, onHiddenSelected: closeDetails });

  const tp = CONFIG.TILES;
  tileLayer = L.tileLayer(tp.url, { attribution: tp.attribution, maxZoom: CONFIG.MAX_ZOOM, maxNativeZoom: tp.maxNativeZoom, crossOrigin: false }).addTo(map);
  let tileOk = 0, tileErr = 0;
  tileLayer.on("tileload", () => { tileOk++; $("#tilenotice").hidden = true; });
  tileLayer.on("tileerror", () => { tileErr++; if (tileErr >= 4 && tileOk === 0) showTileNotice(); });

  fitMinZoom();
  map.on("click", () => { if (!isDesktop() && state.selectedId) closeDetails(); });
  window.addEventListener("resize", () => { fitMinZoom(); if (state.sheet !== "closed") setSheet(state.sheet, false); });
  map.getContainer().addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-action='disclaimer']");
    if (a) { ev.preventDefault(); openDisclaimer(); }
  });
}
function fitMinZoom() {
  // Never zoom out further than the zoom at which the whole v1 area just fits (FR-1).
  const z = Math.max(CONFIG.MIN_ZOOM, map.getBoundsZoom(CONFIG.BOUNDS, false));
  map.setMinZoom(z);
  if (map.getZoom() < z) map.setZoom(z);
}
function showTileNotice() { const n = $("#tilenotice"); n.textContent = t("tilesFailed"); n.hidden = false; }

function setAttribution() {
  const ac = map.attributionControl;
  ac.setPrefix(`<a href="#" data-action="disclaimer">${esc(t("attrDisclaimer"))}</a> · <a href="https://leafletjs.com" lang="en">Leaflet</a>`);
  if (setAttribution.geo) ac.removeAttribution(setAttribution.geo);
  setAttribution.geo = `${esc(t("attrSearch"))}<a href="https://nominatim.org/" lang="en">Nominatim</a>`;
  ac.addAttribution(setAttribution.geo);
  if (zoomCtl) zoomCtl.remove();
  zoomCtl = L.control.zoom({ position: "bottomright", zoomInTitle: t("zoomIn"), zoomOutTitle: t("zoomOut") }).addTo(map);
}
/* Fit a bounds into the part of the map not covered by overlays. */
function overlayPadding() {
  if (isDesktop()) return { tl: [32, 32], br: [80, 32] };
  const fil = $("#filters").getBoundingClientRect();
  const sheetH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sheet-visible")) || 0;
  return { tl: [24, fil.bottom + 16], br: [72, sheetH + 24] };
}
function fitTo(bounds, maxZoom) {
  const pad = overlayPadding();
  map.fitBounds(bounds, { paddingTopLeft: pad.tl, paddingBottomRight: pad.br, maxZoom: maxZoom || 16 });
}
function inViewArea(bounds) {
  const pad = overlayPadding(), size = map.getSize();
  const nw = map.latLngToContainerPoint(bounds.getNorthWest()), se = map.latLngToContainerPoint(bounds.getSouthEast());
  return nw.x >= pad.tl[0] && nw.y >= pad.tl[1] && se.x <= size.x - pad.br[0] && se.y <= size.y - pad.br[1];
}

/* =====================================================================
   SELECTION + DETAILS
   ===================================================================== */
function ensureVisible(s) {
  let changed = false;
  if (!state.risks.has(s.risk)) { state.risks.add(s.risk); changed = true; }
  if (!isVisible(s) && state.cause !== "all") { state.cause = "all"; changed = true; }
  if (s.p.status === "resolved" && !state.showResolved) { state.showResolved = true; changed = true; }
  if (changed) { syncFilterUI(); renderSpots(); }
}
function selectSpot(id, opts = {}) {
  const s = SPOT_BY_ID.get(id); if (!s) return;
  ensureVisible(s);
  state.selectedId = id;
  drawSelected();
  renderDetails();
  if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  if (isDesktop()) { setLegendOpen(false); $("#details").hidden = false; }
  else { closeLegendSheet(); setSheet(state.sheet === "full" ? "full" : "half", true); }
  const b = spotBounds(s);
  if (opts.fit !== false || !(map.getZoom() >= 14 && inViewArea(b))) fitTo(b, s.f.geometry.type === "Point" ? 16 : 17);
  if (opts.focus !== false) $("#dName").focus({ preventScroll: !isDesktop() });
  if (isDesktop()) $("#panelScroll").scrollTop = 0;
}
function closeDetails() {
  state.selectedId = null;
  drawSelected();
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  if (isDesktop()) { $("#details").hidden = true; setLegendOpen(true); }
  else setSheet("closed", true);
}
function renderDetails() {
  const s = state.selectedId && SPOT_BY_ID.get(state.selectedId);
  if (!s) return;
  const p = s.p, d = fmtDepth(p.depth_cm), resolved = p.status === "resolved";
  const otherName = LANG === "vi" ? p.name_en : p.name_vi, otherLang = LANG === "vi" ? "en" : "vi";
  const riskCls = resolved ? "b-resolvedrisk" : "b-" + s.risk;
  const riskIconCol = resolved ? "currentColor" : s.risk === "medium" ? "#1d1f21" : "#fff";
  const events = (p.past_events || []).slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const sources = (p.sources || []).filter((u) => /^https?:\/\//i.test(u));
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
  let h = `<h2 class="d-name" id="dName" tabindex="-1">${esc(spotName(s))}</h2>`;
  if (otherName && otherName !== spotName(s)) h += `<p class="d-alt" lang="${otherLang}"><span class="vh">${esc(t("otherLangName"))}: </span>${esc(otherName)}</p>`;
  h += `<div class="badges"><span class="badge ${riskCls}">${riskIconSvg(s.risk, riskIconCol, 18)}${esc(t(resolved ? "riskBadgeBefore" : "riskBadge", { r: t("risk_" + s.risk) }))}</span>` +
       `<span class="badge b-${p.status}">${statusIcon(p.status)}${esc(t("status_" + p.status))}</span></div>`;
  h += `<div class="d-sec"><h3>${esc(t("secDepth"))}</h3><p class="d-big"><b>${esc(d.cm)}</b> · ${esc(d.words)}</p></div>`;
  h += `<div class="d-sec"><h3>${esc(t("secFreq"))}</h3><p><b>${esc(t("freq_" + p.frequency))}</b> (${esc(t("freqDesc_" + p.frequency))})</p><p>${esc(t("cause_" + p.cause))}</p></div>`;
  h += `<div class="d-sec"><h3>${esc(t("secLocation"))}</h3><p>${esc(fmtWard(p.ward))}</p>` + (p.legacy_district ? `<p class="d-sub">${esc(fmtDistrict(p.legacy_district))}</p>` : "") + `</div>`;
  if (events.length) {
    h += `<div class="d-sec"><h3>${esc(t("secEvents"))}</h3><ul class="events">` + events.map((e) => {
      const desc = LANG === "vi" ? (e.description_vi || e.description_en) : (e.description_en || e.description_vi);
      const meta = [fmtDate(e.date), e.cause ? t("cause_" + e.cause) : "", typeof e.depth_cm === "number" ? t("eventDepth", { d: e.depth_cm }) : ""].filter(Boolean).join(" · ");
      return `<li><div class="ev-head">${esc(meta)}</div>` + (desc ? `<div>${esc(desc)}</div>` : "") +
        (e.source ? `<a class="ext" href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">${esc(t("eventSource"))}: ${esc(host(e.source))}<span class="vh"> ${esc(t("newTab"))}</span></a>` : "") + `</li>`;
    }).join("") + `</ul></div>`;
  }
  h += `<div class="d-sec"><h3>${esc(t("secSources"))}</h3>`;
  if (sources.length) h += `<ol class="srcs">` + sources.map((u) => `<li><a class="ext" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}<span class="vh"> ${esc(t("newTab"))}</span></a></li>`).join("") + `</ol>`;
  if (p.last_verified) h += `<p class="d-sub">${esc(t("lastVerified", { d: fmtDate(p.last_verified) }))}</p>`;
  h += `</div>`;
  $("#detailsBody").innerHTML = h;
  $("#details").setAttribute("aria-labelledby", "dName");
}
function statusIcon(st) {
  const p = st === "active" ? `<circle cx="12" cy="12" r="5" fill="currentColor"/>`
    : st === "improved" ? `<path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}
/* =====================================================================
   BOTTOM SHEET (mobile): half ↔ full, drag down to close
   ===================================================================== */
const sheetEl = () => $("#details");
function sheetOffsets() {
  const el = sheetEl(), H = el.offsetHeight, vh = window.innerHeight;
  return { H, full: 0, half: Math.max(0, H - Math.round(vh * 0.5)), closed: H };
}
function setSheet(mode, animate) {
  if (isDesktop()) return;
  const el = sheetEl();
  if (mode === "closed") {
    state.sheet = "closed";
    el.classList.toggle("anim", !!animate);
    el.style.transform = "translateY(100%)";
    document.documentElement.style.setProperty("--sheet-visible", "0px");
    const done = () => { if (state.sheet === "closed") el.hidden = true; };
    animate ? setTimeout(done, 230) : done();
    return;
  }
  el.hidden = false;
  const o = sheetOffsets(), y = o[mode];
  state.sheet = mode;
  el.classList.toggle("anim", !!animate);
  el.style.transform = `translateY(${y}px)`;
  applySheetVisible(o.H - y);
  const grip = $("#grip");
  grip.setAttribute("aria-expanded", String(mode === "full"));
  grip.setAttribute("aria-label", t(mode === "full" ? "collapse" : "expand"));
}
function applySheetVisible(px) {
  document.documentElement.style.setProperty("--sheet-visible", Math.max(0, Math.round(px)) + "px");
  const body = $("#detailsBody"), head = $("#detailsHead");
  body.style.maxHeight = Math.max(0, px - head.offsetHeight) + "px";
}
function initSheetDrag() {
  const head = $("#detailsHead"), el = sheetEl();
  let startY = 0, startOff = 0, cur = 0, dragging = false, moved = false, lastT = 0, lastY = 0, vel = 0;
  head.addEventListener("pointerdown", (ev) => {
    if (isDesktop() || ev.target.closest("#detailsClose")) return;
    dragging = true; moved = false; startY = ev.clientY; lastY = ev.clientY; lastT = performance.now();
    const o = sheetOffsets(); startOff = o[state.sheet] ?? o.half; cur = startOff;
    el.classList.remove("anim");
  });
  head.addEventListener("pointermove", (ev) => {
    if (!dragging) return;
    const dy = ev.clientY - startY;
    if (!moved && Math.abs(dy) > 6) { moved = true; try { head.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } }
    if (!moved) return;
    const o = sheetOffsets(); cur = Math.min(o.H, Math.max(0, startOff + dy));
    const now = performance.now(); vel = (ev.clientY - lastY) / Math.max(1, now - lastT); lastY = ev.clientY; lastT = now;
    el.style.transform = `translateY(${cur}px)`;
    applySheetVisible(o.H - cur);
  });
  const end = () => {
    if (!dragging) return; dragging = false;
    if (!moved) return;
    const o = sheetOffsets();
    if (cur > o.half + 70 || (vel > 0.8 && cur > o.half - 20)) closeDetails();
    else if (vel < -0.6 || cur < o.half / 2) setSheet("full", true);
    else setSheet("half", true);
  };
  head.addEventListener("pointerup", end);
  head.addEventListener("pointercancel", end);
  $("#grip").addEventListener("click", (ev) => {
    if (moved) { moved = false; return; }
    setSheet(state.sheet === "full" ? "half" : "full", true);
  });
}

/* =====================================================================
   LEGEND
   ===================================================================== */
function swatchLine(risk, resolved, improved) {
  const col = resolved ? COLORS.resolved : COLORS[risk];
  const dash = resolved ? "4 4" : risk === "medium" ? "10 6" : risk === "low" ? "0.1 9" : "";
  const cap = resolved || risk === "medium" ? "butt" : "round";
  return `<svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true"><g opacity="${improved ? 0.6 : 1}"><path d="M6 12H58" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M6 12H58" stroke="${col}" stroke-width="${resolved ? 5 : 6}" stroke-linecap="${cap}" ${dash ? `stroke-dasharray="${dash}"` : ""}/></g></svg>`;
}
function swatchArea(risk) {
  const col = COLORS[risk], dash = risk === "medium" ? "8 5" : risk === "low" ? "1.5 5" : "";
  return `<svg width="40" height="28" viewBox="0 0 40 28" aria-hidden="true"><rect x="4" y="4" width="32" height="20" rx="3" fill="${col}" fill-opacity="${risk === "low" ? 0.18 : 0.22}" stroke="${col}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} stroke-linecap="${risk === "low" ? "round" : "butt"}"/></svg>`;
}
function swatchPoint(risk) {
  const col = COLORS[risk];
  return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="#fff" stroke="${col}" stroke-width="2"/>${iconShape(risk, col, 14, 14, 6)}</svg>`;
}
function renderLegend() {
  let h = `<h3>${esc(t("lgRisk"))}</h3>`;
  for (const r of ["high", "medium", "low"]) {
    h += `<div class="lg-row"><div class="lg-sw">${swatchLine(r)}${swatchArea(r)}${swatchPoint(r)}</div><div><b>${esc(t("risk_" + r))}</b><span>${esc(t("lg" + r[0].toUpperCase() + r.slice(1) + "Desc"))}</span></div></div>`;
  }
  h += `<h3>${esc(t("lgStatus"))}</h3>`;
  h += `<div class="lg-row"><div class="lg-sw">${swatchLine("medium", false, true)}</div><div><b>${esc(t("status_improved"))}</b><span>${esc(t("lgImproved"))}</span></div></div>`;
  h += `<div class="lg-row"><div class="lg-sw">${swatchLine("high", true)}</div><div><b>${esc(t("status_resolved"))}</b><span>${esc(t("lgResolved"))}</span></div></div>`;
  h += `<div class="lg-row"><div class="lg-sw"><svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true"><path d="M8 12H56" stroke="${COLORS.high}" stroke-opacity=".25" stroke-width="18" stroke-linecap="round"/><path d="M8 12H56" stroke="#fff" stroke-width="11" stroke-linecap="round"/><path d="M8 12H56" stroke="${COLORS.high}" stroke-width="8" stroke-linecap="round"/></svg></div><div><span>${esc(t("lgSelected"))}</span></div></div>`;
  h += `<h3>${esc(t("lgHow"))}</h3><p>${esc(t("lgHowText"))}</p>`;
  h += `<table><thead><tr><th scope="col">${esc(t("lgDepthCol"))}</th>` + ["rare", "occasional", "frequent"].map((f) => `<th scope="col">${esc(t("freq_" + f))}</th>`).join("") + `</tr></thead><tbody>`;
  for (const dc of ["shallow", "moderate", "deep"]) {
    h += `<tr><th scope="row">${esc(t("dc_" + dc))}</th>` + ["rare", "occasional", "frequent"].map((f) => { const r = RISK_TABLE[dc][f]; return `<td>${riskIconSvg(r, COLORS[r], 16)} ${esc(t("risk_" + r))}</td>`; }).join("") + `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<h3>${esc(t("lgFreq"))}</h3><dl>` + ["rare", "occasional", "frequent"].map((f) => `<dt>${esc(t("freq_" + f))}</dt><dd>${esc(t("freqDesc_" + f))}</dd>`).join("") + `</dl>`;
  h += `<h3>${esc(t("lgDepthWords"))}</h3><dl>`;
  let lo = 0;
  for (const [max, key] of DEPTH_WORDS) {
    const range = max === Infinity ? t("cmOver", { a: lo }) : lo === 0 ? t("cmUnder", { b: max }) : t("cmRange", { a: lo + 1, b: max });
    h += `<dt>${esc(range)}</dt><dd>${esc(t("depth_" + key))}</dd>`; lo = max;
  }
  h += `</dl>`;
  h += `<h3>${esc(t("lgCauses"))}</h3><dl><dt>${esc(t("cause_rain"))}</dt><dd>${esc(t("lgCauseRain"))}</dd><dt>${esc(t("cause_tide"))}</dt><dd>${esc(t("lgCauseTide"))}</dd><dt>${esc(t("cause_both"))}</dt><dd>${esc(t("lgCauseBoth"))}</dd></dl>`;
  h += `<p class="lg-foot"><button type="button" class="linkbtn" data-action="disclaimer">${esc(t("disclaimerLink"))}</button></p>`;
  $("#legendBody").innerHTML = h;
}
function setLegendOpen(open) {               // desktop collapse
  state.legendOpen = open;
  $("#legendToggle").setAttribute("aria-expanded", String(open));
  $("#legendBody").hidden = !open;
}
function openLegendSheet() {                 // mobile
  const el = $("#legend");
  el.hidden = false; el.classList.add("anim");
  el.style.transform = "translateY(25%)";
  $("#legendBody").hidden = false;
  $("#legendBody").style.maxHeight = (el.offsetHeight * 0.75 - el.querySelector(".sheet-head").offsetHeight) + "px";
  $("#legendFab").setAttribute("aria-expanded", "true");
  el.focus({ preventScroll: true });
}
function closeLegendSheet(returnFocus) {
  if (isDesktop()) return;
  const el = $("#legend"); if (el.hidden) return;
  el.style.transform = "translateY(100%)";
  $("#legendFab").setAttribute("aria-expanded", "false");
  setTimeout(() => { el.hidden = true; }, 230);
  if (returnFocus) $("#legendFab").focus();
}

/* =====================================================================
   SEARCH UI (combobox)
   ===================================================================== */
const SEARCH = { items: [], active: -1, mode: "local" };
const ICONS = {
  spot: `<svg viewBox="0 0 24 24"><path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  street: `<svg viewBox="0 0 24 24"><path d="M8 3L5 21M16 3l3 18M12 4v3M12 10v3M12 16v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  ward: `<svg viewBox="0 0 24 24"><path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  district: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.5"/></svg>`,
  address: `<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};
function entryLabel(e) {
  if (e.type === "spot") { const s = SPOT_BY_ID.get(e.key); return { main: spotName(s), sub: `${t("type_spot")} · ${t("risk_" + s.risk)} · ${fmtWard(s.p.ward)}` }; }
  const cnt = e.ids.filter((id) => SPOT_BY_ID.get(id).p.status !== "resolved" || state.showResolved).length;
  const n = cnt ? nSpots(cnt) : t("noDataShort");
  if (e.type === "street") return { main: e.key, sub: `${t("type_street")} · ${n}` };
  if (e.type === "ward") return { main: fmtWard(e.key), sub: `${t("type_ward")} · ${n}` };
  return { main: fmtDistrictName(e.key), sub: `${t("type_district")} · ${n}` };
}
function renderSugg() {
  const ul = $("#sugg"), q = $("#q").value.trim();
  if (!SEARCH.items.length && SEARCH.mode !== "msg") { closeSugg(); return; }
  let html = "", i = 0;
  if (SEARCH.mode === "msg") html = `<li class="msg" role="presentation">${esc(SEARCH.msg)}</li>`;
  for (const it of SEARCH.items) {
    if (it.hdr) { html += `<li class="hdr" role="presentation">${esc(it.hdr)}</li>`; continue; }
    html += `<li role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === SEARCH.active}"><span class="s-ico" aria-hidden="true">${ICONS[it.icon]}</span><span><span class="s-main">${esc(it.main)}</span>${it.sub ? `<span class="s-sub">${esc(it.sub)}</span>` : ""}</span></li>`;
    i++;
  }
  ul.innerHTML = html; ul.hidden = false;
  $("#q").setAttribute("aria-expanded", "true");
  if (SEARCH.active >= 0) { $("#q").setAttribute("aria-activedescendant", "opt-" + SEARCH.active); const el = $("#opt-" + SEARCH.active); if (el) el.scrollIntoView({ block: "nearest" }); }
  else $("#q").removeAttribute("aria-activedescendant");
  void q;
}
function options() { return SEARCH.items.filter((x) => !x.hdr); }
function closeSugg() { $("#sugg").hidden = true; $("#q").setAttribute("aria-expanded", "false"); $("#q").removeAttribute("aria-activedescendant"); SEARCH.active = -1; }
function onType() {
  const q = $("#q").value.trim();
  SEARCH.mode = "local"; SEARCH.active = -1;
  if (norm(q).length < 2) { SEARCH.items = []; closeSugg(); return; }
  const local = localSearch(INDEX, q).map((e) => Object.assign({ icon: e.type, entry: e }, entryLabel(e)));
  SEARCH.items = local.concat([{ icon: "search", main: t("searchAddress", { q }), sub: t("searchAddressSub"), address: true }]);
  renderSugg();
}
function choose(it) {
  if (!it) return;
  if (it.address) { runAddressSearch(); return; }
  closeSugg();
  if (it.geo) { goToAddress(it.geo); return; }
  const e = it.entry;
  $("#q").value = it.main;
  if (e.type === "spot") { clearSearchPin(); selectSpot(e.key, { fit: true, focus: true }); return; }
  const ids = e.ids.filter((id) => SPOT_BY_ID.get(id).p.status !== "resolved" || state.showResolved);
  clearSearchPin();
  if (ids.length === 1) { selectSpot(ids[0], { fit: true, focus: true }); return; }
  if (state.selectedId) closeDetails();
  if (!ids.length) {
    if (e.district) map.setView(e.district.center, e.district.zoom);
    toast(t("noData"));
    return;
  }
  const b = L.latLngBounds([]); ids.forEach((id) => b.extend(spotBounds(SPOT_BY_ID.get(id))));
  fitTo(b, 16);
  toast(t("groupFound", { n: ids.length, place: it.main }));
}
async function runAddressSearch() {
  const q = $("#q").value.trim();
  if (norm(q).length < 2) return;
  SEARCH.mode = "msg"; SEARCH.msg = t("searching"); SEARCH.items = []; renderSugg();
  try {
    const list = await geocode(q, LANG);
    if ($("#q").value.trim() !== q) return;
    if (!list.length) { closeSugg(); clearSearchPin(); toast(t("noData")); return; }
    if (list.length === 1) { closeSugg(); goToAddress(list[0]); return; }
    SEARCH.mode = "geo"; SEARCH.active = 0;
    SEARCH.items = [{ hdr: t("addresses") }].concat(list.map((g) => ({ icon: "address", main: g.name.split(",").slice(0, 2).join(","), sub: g.name.split(",").slice(2, 5).join(",").trim(), geo: g })));
    renderSugg();
  } catch (err) {
    console.info("Nominatim unavailable:", err && err.message);
    closeSugg(); toast(t("busy"));
  }
}
function clearSearchPin() { if (searchPin) { searchPin.remove(); searchPin = null; } }
function goToAddress(g) {
  clearSearchPin();
  searchPin = L.circleMarker([g.lat, g.lon], { pane: "fmLoc", radius: 9, color: "#202124", weight: 3, fillColor: "#fff", fillOpacity: 1, interactive: false }).addTo(map);
  // nearest spot within 300 m (resolved ones only when shown)
  let best = null, bestD = Infinity;
  for (const s of SPOTS) {
    if (s.p.status === "resolved" && !state.showResolved) continue;
    const d = distanceToSpot(s, g.lat, g.lon);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (best && bestD <= CONFIG.NEAREST_SPOT_M) {
    selectSpot(best.id, { fit: false, focus: false });
    const b = spotBounds(best).extend([g.lat, g.lon]);
    fitTo(b, 17);
    toast(t("nearest", { name: spotName(best), m: Math.max(0, Math.round(bestD / 10) * 10) }));
  } else {
    if (state.selectedId) closeDetails();
    map.setView([g.lat, g.lon], 16);
    toast(t("noData"));
  }
}
function initSearch() {
  const q = $("#q"), ul = $("#sugg");
  q.addEventListener("input", onType);
  q.addEventListener("focus", () => { if (q.value.trim()) onType(); });
  q.addEventListener("keydown", (ev) => {
    const opts = options();
    if (ev.key === "ArrowDown") { ev.preventDefault(); if (ul.hidden) onType(); SEARCH.active = Math.min(opts.length - 1, SEARCH.active + 1); renderSugg(); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); SEARCH.active = Math.max(-1, SEARCH.active - 1); renderSugg(); }
    else if (ev.key === "Escape") { if (!ul.hidden) { ev.preventDefault(); closeSugg(); } }
  });
  $("#searchForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const opts = options();
    if (!ul.hidden && SEARCH.active >= 0 && opts[SEARCH.active]) { choose(opts[SEARCH.active]); return; }
    if (SEARCH.mode === "geo" && opts.length) { choose(opts[0]); return; }
    // Enter: first local match if any, otherwise one Nominatim request (design §7).
    const local = localSearch(INDEX, q.value.trim());
    if (local.length) choose(Object.assign({ icon: local[0].type, entry: local[0] }, entryLabel(local[0])));
    else runAddressSearch();
  });
  ul.addEventListener("mousedown", (ev) => ev.preventDefault());
  ul.addEventListener("click", (ev) => { const li = ev.target.closest("li[data-i]"); if (li) choose(options()[+li.dataset.i]); });
  document.addEventListener("click", (ev) => { if (!ev.target.closest("#search")) closeSugg(); });
}

/* =====================================================================
   FILTERS, LANGUAGE, TOASTS, LOCATE, DISCLAIMER, HASH
   ===================================================================== */
function syncFilterUI() {
  document.querySelectorAll(".chip[data-risk]").forEach((b) => {
    const r = b.dataset.risk;
    b.setAttribute("aria-pressed", String(state.risks.has(r)));
    b.innerHTML = `<svg class="tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>${riskIconSvg(r, COLORS[r], 20)}<span>${esc(t("risk_" + r))}</span>`;
    b.setAttribute("aria-label", t("riskChipAria", { r: t("risk_" + r) }));
  });
  $("#cause").value = state.cause;
  $("#showResolved").setAttribute("aria-pressed", String(state.showResolved));
}
function initFilters() {
  document.querySelectorAll(".chip[data-risk]").forEach((b) => b.addEventListener("click", () => {
    const r = b.dataset.risk; state.risks.has(r) ? state.risks.delete(r) : state.risks.add(r); syncFilterUI(); renderSpots();
  }));
  $("#cause").addEventListener("change", (ev) => { state.cause = ev.target.value; renderSpots(); });
  $("#showResolved").addEventListener("click", () => { state.showResolved = !state.showResolved; syncFilterUI(); renderSpots(); });
}
let toastTimer = null;
function toast(msg) {
  const box = $("#toast");
  box.innerHTML = `<div class="t"><p>${esc(msg)}</p><button type="button" class="iconbtn" aria-label="${esc(t("close"))}"><svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>`;
  box.querySelector("button").addEventListener("click", () => { box.innerHTML = ""; });
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { box.innerHTML = ""; }, 8000);
}
function applyI18n() {
  document.documentElement.lang = LANG;
  $("#toast").innerHTML = "";
  document.title = document.title.replace(/FloodMap.*$/, t("appTitle"));
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => { const [attr, key] = pair.split(":"); el.setAttribute(attr, t(key)); });
  });
  document.querySelectorAll("#langBtn [data-l]").forEach((b) => b.classList.toggle("on", b.dataset.l === LANG));
  $("#dlgBody").innerHTML = t("disclaimerBody").map((p) => `<p>${p}</p>`).join("");
  if (spotsReady) {
    const latest = SPOTS.reduce((m, s) => (s.p.last_verified > m ? s.p.last_verified : m), "");
    $("#dataNote").textContent = t("dataNote", { n: SPOTS.length, d: latest ? fmtDate(latest) : "" });
  }
  syncFilterUI();
  renderLegend();
  if (map) { setAttribution(); if (spotsReady) renderSpots(); else if (!dataFailed) $("#count").textContent = t("loading"); }
  if (state.selectedId) renderDetails();
  if (state.sheet !== "closed") setSheet(state.sheet, false);
  if (!$("#sugg").hidden && SEARCH.mode === "local") onType();
  const tn = $("#tilenotice"); if (!tn.hidden) tn.textContent = t("tilesFailed");
}
function setLang(l) {
  setLangValue(l);
  try { localStorage.setItem(CONFIG.STORAGE_LANG, LANG); } catch (e) { /* storage blocked: fine */ }
  applyI18n();
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem(CONFIG.STORAGE_LANG); } catch (e) { saved = null; }
  setLangValue(saved === "en" || saved === "vi" ? saved : (navigator.language || "vi").toLowerCase().startsWith("vi") ? "vi" : "en");
  $("#langBtn").addEventListener("click", () => setLang(LANG === "vi" ? "en" : "vi"));
}
function initLocate() {
  const btn = $("#locate");
  btn.addEventListener("click", () => {
    if (!window.isSecureContext) { toast(t("locInsecure")); return; }
    if (!("geolocation" in navigator)) { toast(t("locUnavailable")); return; }
    btn.setAttribute("aria-busy", "true");
    navigator.geolocation.getCurrentPosition((pos) => {
      btn.removeAttribute("aria-busy");
      const { latitude: lat, longitude: lon, accuracy } = pos.coords;
      if (locLayer) locLayer.remove();
      const ll = [lat, lon];
      if (!L.latLngBounds(CONFIG.BOUNDS).contains(ll)) { toast(t("locOutside")); return; }
      locLayer = L.layerGroup([
        L.circle(ll, { pane: "fmLoc", radius: Math.min(accuracy, 500), color: "#1a73e8", weight: 1, fillOpacity: 0.12, interactive: false }),
        L.circleMarker(ll, { pane: "fmLoc", radius: 8, color: "#fff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1, interactive: false })
      ]).addTo(map);
      map.setView(ll, Math.max(map.getZoom(), 16));
    }, (err) => {
      btn.removeAttribute("aria-busy");
      toast(err && err.code === 1 ? t("locDenied") : t("locUnavailable"));
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });
}
function openDisclaimer() {
  const d = $("#disclaimer");
  if (typeof d.showModal === "function") { if (!d.open) d.showModal(); } else d.setAttribute("open", "");
  $("#dlgOk").focus();
}
function initDisclaimer() {
  const d = $("#disclaimer");
  $("#dlgOk").addEventListener("click", () => {
    try { localStorage.setItem(CONFIG.STORAGE_DISCLAIMER, "1"); } catch (e) { /* ignore */ }
    d.close ? d.close() : d.removeAttribute("open");
  });
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-action='disclaimer']");
    if (a && !a.closest(".leaflet-container")) { ev.preventDefault(); openDisclaimer(); }
  });
  let seen = null;
  try { seen = localStorage.getItem(CONFIG.STORAGE_DISCLAIMER); } catch (e) { seen = null; }
  if (!seen) openDisclaimer();
}
function onHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && SPOT_BY_ID.has(id)) { if (id !== state.selectedId) selectSpot(id, { fit: true, focus: false }); }
}
function initPanels() {
  $("#detailsClose").addEventListener("click", () => {
    const sel = state.selectedId;
    closeDetails();
    const s = sel && SPOT_BY_ID.get(sel);
    if (s && s.focusEl && document.body.contains(s.focusEl)) s.focusEl.focus({ preventScroll: true }); else $("#q").focus();
  });
  $("#legendToggle").addEventListener("click", () => setLegendOpen(!state.legendOpen));
  $("#legendFab").addEventListener("click", () => { $("#legend").hidden ? openLegendSheet() : closeLegendSheet(true); });
  $("#legendClose").addEventListener("click", () => closeLegendSheet(true));
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape" || $("#disclaimer").open) return;
    if (!$("#sugg").hidden) return;
    if (!isDesktop() && !$("#legend").hidden) { closeLegendSheet(true); return; }
    if (state.selectedId && ev.target.closest && (ev.target.closest("#details") || ev.target.closest("#map"))) { $("#detailsClose").click(); }
  });
  const mq = window.matchMedia(CONFIG.DESKTOP_MQ);
  const onMode = () => {
    const det = $("#details"), lg = $("#legend");
    det.style.transform = ""; lg.style.transform = ""; $("#detailsBody").style.maxHeight = ""; $("#legendBody").style.maxHeight = "";
    document.documentElement.style.setProperty("--sheet-visible", "0px");
    if (mq.matches) {
      det.hidden = !state.selectedId; lg.hidden = false; setLegendOpen(!state.selectedId); state.sheet = "closed";
    } else {
      lg.hidden = true; $("#legendBody").hidden = false; det.hidden = true; state.sheet = "closed";
      if (state.selectedId) setSheet("half", false);
    }
    if (map) map.invalidateSize();
  };
  mq.addEventListener ? mq.addEventListener("change", onMode) : mq.addListener(onMode);
  onMode();
}

/* =====================================================================
   BOOT: map first, then strings, then spots + districts (asynchronous)
   ===================================================================== */
async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}
let dataFailed = false;
function showDataFailed(err) {
  // Shown in both languages at once, so it is understood whatever the current language.
  dataFailed = true;
  console.error("FloodMap data failed to load:", err);
  const box = $("#datafail");
  box.innerHTML = ["vi", "en"].map((l) => `<p lang="${l}">${esc(strings(l).dataFailed)}</p>`).join("");
  box.hidden = false;
  $("#count").textContent = "";
}
async function boot() {
  const pStrings = loadStrings(CONFIG.I18N_URL);
  const pData = Promise.all([loadSpots(CONFIG.DATA_URL), fetchJson(CONFIG.DISTRICTS_URL)]);
  pData.catch(() => {});                // handled below, after the strings are in
  const hasLeaflet = typeof L !== "undefined";
  if (hasLeaflet) initMap();            // the map (tiles) renders before any data arrives
  try { await pStrings; } catch (err) {
    // data/i18n.json itself failed: the only message that cannot come from it (static VI + EN in index.html).
    console.error("FloodMap strings failed to load:", err);
    $("#bootfail").hidden = false;
    return;
  }
  initLang();
  if (!hasLeaflet) {
    applyI18n();
    const f = $("#libfail"); f.textContent = t("libFailed"); f.hidden = false;
    console.error("Leaflet failed to load (network or SRI mismatch).");
    return;
  }
  initPanels();
  initFilters();
  initSearch();
  initLocate();
  initSheetDrag();
  applyI18n();
  initDisclaimer();
  let districts;
  try { [, districts] = await pData; } catch (err) { showDataFailed(err); return; }
  DISTRICTS = districts.districts;
  INDEX = buildIndex(SPOTS, DISTRICTS);
  spotsReady = true;
  applyI18n();                          // renders the spots, count and data note
  window.addEventListener("hashchange", onHash);
  if (location.hash) onHash();
}
boot();
