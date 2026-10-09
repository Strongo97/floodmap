// FloodMap data validator: enforces the field rules of docs/design.md §4.
//
// Usage: node scripts/validate.mjs [file.geojson] [--base <git ref>] [--today YYYY-MM-DD]
//   file      defaults to data/hcmc-flood-spots.geojson
//   --base    fail if any id present in the file at that git ref is missing now (spots are retired, never deleted)
//   --today   date used for the "not in the future" and staleness checks (default: today in Ho Chi Minh City)
// Exit code 1 on any error. Warnings do not fail.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeRisk, depthClass } from "../js/risk.js";
import { inBounds } from "../js/config.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAUSE = ["rain", "tide", "both"], FREQ = ["rare", "occasional", "frequent"], STATUS = ["active", "improved", "resolved"];
const MAX_EVENTS_SHOWN = 5, STALE_DAYS = 365;

function parseArgs(argv) {
  const opts = { file: resolve(ROOT, "data/hcmc-flood-spots.geojson"), base: null, today: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base") opts.base = argv[++i];
    else if (a === "--today") opts.today = argv[++i];
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else opts.file = resolve(a);
  }
  if (opts.base === undefined) throw new Error("--base needs a git ref");
  return opts;
}
const hcmcToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

const isoDate = (s) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;    // rejects 2026-02-30 and 2026-13-01
};
const isUrl = (s) => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };
const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0;
const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const hasKeyDeep = (o, k) => !!o && typeof o === "object" && (Object.prototype.hasOwnProperty.call(o, k) || Object.values(o).some((v) => hasKeyDeep(v, k)));

/** Validate a parsed FeatureCollection. Returns { errors, warnings, spots }. */
export function validate(fc, today) {
  const errors = [], warnings = [], spots = [];
  const err = (id, m) => errors.push(`${id}: ${m}`), warn = (id, m) => warnings.push(`${id}: ${m}`);

  const checkPos = (id, p) => {
    if (!Array.isArray(p) || p.length < 2 || !p.every(isNum)) return err(id, `bad position ${JSON.stringify(p)}`);
    const [lon, lat] = p;
    if (!inBounds(lat, lon)) err(id, `position ${lon},${lat} outside the v1 bounds`);
  };
  const checkGeom = (id, g) => {
    if (!g || typeof g !== "object") return err(id, "missing geometry");
    if (g.type === "Point") return checkPos(id, g.coordinates);
    if (g.type === "LineString") {
      if (!Array.isArray(g.coordinates) || g.coordinates.length < 2) return err(id, "LineString needs at least 2 positions");
      return g.coordinates.forEach((p) => checkPos(id, p));
    }
    if (g.type === "Polygon") {
      if (!Array.isArray(g.coordinates) || !g.coordinates.length) return err(id, "Polygon has no rings");
      for (const ring of g.coordinates) {
        if (!Array.isArray(ring) || ring.length < 4) { err(id, "Polygon ring needs at least 4 positions"); continue; }
        ring.forEach((p) => checkPos(id, p));
        const a = ring[0], b = ring[ring.length - 1];
        if (Array.isArray(a) && Array.isArray(b) && (a[0] !== b[0] || a[1] !== b[1])) err(id, "Polygon ring not closed");
      }
      return;
    }
    err(id, `geometry type ${g.type} not allowed (Point, LineString, Polygon)`);
  };

  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    errors.push("file: not a GeoJSON FeatureCollection");
    return { errors, warnings, spots };
  }
  const ids = new Set();
  for (const [i, f] of fc.features.entries()) {
    const p = (f && f.properties) || {};
    const id = typeof p.id === "string" && p.id ? p.id : `feature#${i}`;
    let ok = true;
    const e = (m) => { ok = false; err(id, m); };
    if (!f || f.type !== "Feature") e("type must be Feature");
    if (!f || !f.properties || typeof f.properties !== "object") e("properties missing");
    if (!/^hcmc-\d{4}$/.test(p.id || "")) e("id must match hcmc-NNNN");
    else if (ids.has(p.id)) e("duplicate id");
    ids.add(p.id);
    for (const k of ["name_vi", "name_en", "ward"]) if (!nonEmpty(p[k])) e(`${k} is required and must not be empty`);
    for (const k of ["street", "legacy_district", "notes"]) if (p[k] !== undefined && typeof p[k] !== "string") e(`${k} must be a string`);
    if (!CAUSE.includes(p.cause)) e(`cause '${p.cause}' not allowed (${CAUSE.join(", ")})`);
    const d = p.depth_cm;
    if (!d || !isNum(d.min) || !isNum(d.max)) e("depth_cm.min and depth_cm.max must be numbers");
    else {
      if (d.min > d.max) e(`depth_cm.min ${d.min} > depth_cm.max ${d.max}`);
      for (const v of [d.min, d.max]) if (v < 0 || v > 200) e(`depth ${v} cm outside 0–200`);
    }
    if (!FREQ.includes(p.frequency)) e(`frequency '${p.frequency}' not allowed (${FREQ.join(", ")})`);
    if (!STATUS.includes(p.status)) e(`status '${p.status}' not allowed (${STATUS.join(", ")})`);
    if (p.past_events !== undefined) {
      if (!Array.isArray(p.past_events)) e("past_events must be an array");
      else {
        if (p.past_events.length > MAX_EVENTS_SHOWN) warn(id, `${p.past_events.length} past_events; only the newest ${MAX_EVENTS_SHOWN} are shown`);
        p.past_events.forEach((ev, j) => {
          if (!ev || typeof ev !== "object") return e(`past_events[${j}] must be an object`);
          if (!isoDate(ev.date)) e(`past_events[${j}].date '${ev.date}' is not an ISO date (YYYY-MM-DD)`);
          else if (ev.date > today) e(`past_events[${j}].date ${ev.date} is in the future`);
          if (!isUrl(ev.source)) e(`past_events[${j}].source is not an http(s) URL`);
          if (ev.cause !== undefined && !CAUSE.includes(ev.cause)) e(`past_events[${j}].cause '${ev.cause}' not allowed`);
          if (ev.depth_cm !== undefined && (!isNum(ev.depth_cm) || ev.depth_cm < 0 || ev.depth_cm > 200)) e(`past_events[${j}].depth_cm must be a number from 0 to 200`);
        });
      }
    }
    if (!Array.isArray(p.sources) || p.sources.length === 0) e("sources needs at least 1 http(s) URL");
    else p.sources.forEach((s) => { if (!isUrl(s)) e(`source '${s}' is not an http(s) URL`); });
    if (!isoDate(p.last_verified)) e(`last_verified '${p.last_verified}' is not an ISO date (YYYY-MM-DD)`);
    else if (p.last_verified > today) e(`last_verified ${p.last_verified} is in the future`);
    else if ((Date.parse(today) - Date.parse(p.last_verified)) / 864e5 > STALE_DAYS) warn(id, `last_verified ${p.last_verified} is older than 12 months`);
    if (hasKeyDeep(f, "risk")) e("'risk' must not appear anywhere: it is computed from depth and frequency");
    const before = errors.length;
    checkGeom(id, f && f.geometry);
    if (errors.length > before) ok = false;
    if (ok) spots.push({ id: p.id, risk: computeRisk(d, p.frequency), depthClass: depthClass(d.max), p, geometry: f.geometry.type });
  }
  return { errors, warnings, spots };
}

/** Ids present in `file` at git ref `ref` that are missing from `current`. */
export function missingSince(file, ref, currentIds) {
  let old;
  try {
    // "./name" is resolved by git relative to the cwd, so this works for any repo the file is in.
    old = execFileSync("git", ["show", `${ref}:./${basename(file)}`], { cwd: dirname(file), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
  } catch (e) {
    const msg = String(e.stderr || e.message);
    if (/does not exist|exists on disk, but not in/.test(msg)) return { missing: [], note: `${basename(file)} not present at ${ref}; nothing to compare` };
    throw new Error(`git show ${ref} failed: ${msg.trim()}`);
  }
  const oldIds = (JSON.parse(old).features || []).map((f) => f && f.properties && f.properties.id).filter(Boolean);
  return { missing: oldIds.filter((id) => !currentIds.has(id)), note: `compared with ${oldIds.length} ids at ${ref}` };
}

function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  const today = opts.today || hcmcToday();
  if (!isoDate(today)) { console.error(`--today '${today}' is not YYYY-MM-DD`); process.exit(2); }
  let fc;
  try { fc = JSON.parse(readFileSync(opts.file, "utf8")); } catch (e) { console.log(`ERROR file: cannot read or parse ${opts.file}: ${e.message}`); process.exit(1); }
  const { errors, warnings, spots } = validate(fc, today);

  if (opts.base) {
    const ids = new Set((fc.features || []).map((f) => f && f.properties && f.properties.id));
    try {
      const { missing, note } = missingSince(opts.file, opts.base, ids);
      console.log(`--base: ${note}.`);
      missing.forEach((id) => errors.push(`${id}: present at ${opts.base} but missing now. Never delete a spot; set status to "resolved".`));
    } catch (e) { errors.push(`--base: ${e.message}`); }
  }

  console.log(`Checked ${fc.features ? fc.features.length : 0} spots in ${opts.file} (today = ${today}).\n`);
  if (spots.length) {
    console.log("Risk summary (computed, never stored)");
    console.log("id         risk    depth              frequency   status    geometry    name");
    for (const s of spots) {
      const dc = `${s.p.depth_cm.min}–${s.p.depth_cm.max} cm ${s.depthClass}`;
      console.log(`${s.id}  ${s.risk.padEnd(6)}  ${dc.padEnd(17)}  ${s.p.frequency.padEnd(10)}  ${s.p.status.padEnd(8)}  ${s.geometry.padEnd(10)}  ${s.p.name_en}`);
    }
    const count = (k, v) => spots.filter((s) => s[k] === v || s.p[k] === v).length;
    console.log(`\nRisk: high ${count("risk", "high")} · medium ${count("risk", "medium")} · low ${count("risk", "low")}` +
      `  |  Status: active ${count("status", "active")} · improved ${count("status", "improved")} · resolved ${count("status", "resolved")}\n`);
  }
  warnings.forEach((w) => console.log("WARN  " + w));
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: no errors, ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
