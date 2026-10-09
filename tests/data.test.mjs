import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { inBounds } from "../js/config.js";
import { DEPTH_WORDS } from "../js/i18n.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const i18n = JSON.parse(read("data/i18n.json"));

test("i18n.json: vi and en have exactly the same keys", () => {
  assert.deepEqual(Object.keys(i18n).sort(), ["en", "vi"]);
  const vi = Object.keys(i18n.vi), en = Object.keys(i18n.en);
  assert.deepEqual(vi.filter((k) => !en.includes(k)), [], "keys only in vi");
  assert.deepEqual(en.filter((k) => !vi.includes(k)), [], "keys only in en");
  for (const l of ["vi", "en"]) for (const [k, v] of Object.entries(i18n[l])) {
    assert.ok(typeof v === "string" ? v.trim() : Array.isArray(v) && v.length, `${l}.${k} is empty`);
    assert.equal(typeof v, typeof i18n[l === "vi" ? "en" : "vi"][k], `${k}: same type in both languages`);
  }
});

test("every string key used in index.html and js/ exists in i18n.json", () => {
  const used = new Set();
  const html = read("index.html");
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(";").forEach((p) => used.add(p.split(":")[1]));
  for (const f of readdirSync(new URL("../js/", import.meta.url))) {
    for (const m of read("js/" + f).matchAll(/\bt\("([A-Za-z_]+)"[,)]/g)) used.add(m[1]);
  }
  // Keys built from a prefix + a data value, e.g. t("risk_" + s.risk).
  const families = {
    risk_: ["high", "medium", "low"], status_: ["active", "improved", "resolved"], freq_: ["rare", "occasional", "frequent"],
    freqDesc_: ["rare", "occasional", "frequent"], cause_: ["rain", "tide", "both"], dc_: ["shallow", "moderate", "deep"],
    depth_: DEPTH_WORDS.map(([, key]) => key), type_: ["spot", "street", "ward", "district"]
  };
  for (const [prefix, values] of Object.entries(families)) values.forEach((v) => used.add(prefix + v));
  ["High", "Medium", "Low"].forEach((r) => used.add(`lg${r}Desc`));
  assert.deepEqual([...used].filter((k) => !(k in i18n.vi)), []);
});

test("districts.json: 17 former districts with centres inside the v1 bounds", () => {
  const { districts } = JSON.parse(read("data/districts.json"));
  assert.equal(districts.length, 17);
  assert.equal(new Set(districts.map((d) => d.name)).size, 17);
  for (const d of districts) {
    assert.ok(inBounds(d.center[0], d.center[1]), d.name);
    assert.ok(Number.isInteger(d.zoom) && d.zoom >= 11 && d.zoom <= 18, d.name);
  }
});
