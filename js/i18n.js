// UI strings (data/i18n.json) and VI / EN formatting helpers. No DOM access.
// Every UI string lives in data/i18n.json, with the same keys in "vi" and "en".

/* Depth words (seed-sources v3 table, extended per M2 decision): upper bound in cm (inclusive) → word key */
export const DEPTH_WORDS = [            // upper bound in cm (inclusive) → word key
  [10, "ankle"], [30, "halfWheel"], [40, "wheel"], [50, "knee"], [70, "aboveKnee"], [Infinity, "waist"]
];
export function depthWordKey(cm) { for (const [max, key] of DEPTH_WORDS) if (cm <= max) return key; return "waist"; }
let I18N = { vi: {}, en: {} };
/** Use an already-parsed i18n object ({ vi: {...}, en: {...} }). */
export function setStrings(obj) { I18N = obj; }
/** Fetch data/i18n.json. Rejects if the file cannot be loaded or parsed. */
export async function loadStrings(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  setStrings(await r.json());
  return I18N;
}
/** Raw string table for one language (used for the bilingual load-failure message). */
export function strings(lang) { return I18N[lang] || {}; }

export let LANG = "vi";
export function setLangValue(l) { LANG = l === "en" ? "en" : "vi"; }
export function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]);
  if (s === undefined) { console.warn("i18n missing:", LANG, key); s = key; }
  if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}
export function nSpots(n) { return n === 1 ? t("nSpots_one") : t("nSpots_other", { n }); }

/* Place-name formatting (VI kept as-is; EN translates the prefix, keeps diacritics) */
export function fmtWard(ward) {
  return ward.split("/").map((w) => w.trim()).map((w) =>
    LANG === "vi" ? w : t("wardFmt", { w: w.replace(/^Phường\s+/u, "").replace(/^Xã\s+/u, "") })
  ).join(" / ");
}
export function districtLabel(d) {           // "Quận 4" → "Quận 4" | "District 4"; "Thủ Đức" → "TP Thủ Đức" | "Thủ Đức City"
  const m = /^Quận\s+(\d+)$/u.exec(d);
  if (LANG === "vi") return m ? d : (d === "Thủ Đức" ? "TP Thủ Đức" : "quận " + d);
  if (m) return "District " + m[1];
  return d === "Thủ Đức" ? "Thủ Đức City" : d + " District";
}
export function fmtDistrict(d) { return t("districtFmt", { d: districtLabel(d) }); }
export function fmtDistrictName(d) { const s = t("districtName", { d: districtLabel(d) }); return s.charAt(0).toUpperCase() + s.slice(1); }
export function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return new Intl.DateTimeFormat(LANG === "vi" ? "vi-VN" : "en-GB", { day: LANG === "vi" ? "2-digit" : "numeric", month: LANG === "vi" ? "2-digit" : "short", year: "numeric", timeZone: "UTC" }).format(d);
}
export function fmtDepth(dc) {
  const cm = dc.min === dc.max ? `${dc.max} cm` : `${dc.min}–${dc.max} cm`;
  const a = depthWordKey(dc.min), b = depthWordKey(dc.max);
  const words = a === b ? t("depth_" + a) : t("depthRange", { a: t("depth_" + a), b: t("depth_" + b) });
  return { cm, words };
}
export function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }