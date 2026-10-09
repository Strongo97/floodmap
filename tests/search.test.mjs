import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { norm, districtAliases, buildIndex, localSearch, distanceToSpot } from "../js/search.js";

const districts = JSON.parse(readFileSync(new URL("../data/districts.json", import.meta.url), "utf8")).districts;
const spot = (id, p, geometry) => ({ id, p: Object.assign({ name_vi: id, name_en: id, ward: "Phường Bến Thành" }, p), f: { geometry } });

test("normaliser is accent-insensitive and maps đ to d", () => {
  assert.equal(norm("Quận 4"), "quan 4");
  assert.equal(norm("quan 4"), norm("Quận 4"));
  assert.equal(norm("Đường Đinh Tiên Hoàng"), "duong dinh tien hoang");
  assert.equal(norm("đ"), "d");
  assert.equal(norm("  Thủ   Đức!! "), "thu duc");
  assert.equal(norm("Phường Thông Tây Hội"), "phuong thong tay hoi");
});

test("district aliases", () => {
  assert.deepEqual(districtAliases("Quận 4").map(norm), ["quan 4", "q4", "q 4", "district 4", "quan 4"]);
  assert.deepEqual(districtAliases("Gò Vấp").map(norm), ["go vap", "quan go vap", "go vap district"]);
});

test("local search: quan 4, q4, district 4, and Quận 2/9 → Thủ Đức", () => {
  const idx = buildIndex([], districts);
  const top = (q) => localSearch(idx, q)[0];
  for (const q of ["quan 4", "Quận 4", "q4", "district 4"]) assert.equal(top(q).key, "Quận 4", q);
  for (const q of ["Quận 2", "quan 9", "district 2", "District 9", "thu duc", "Thành phố Thủ Đức"]) assert.equal(top(q).key, "Thủ Đức", q);
  assert.equal(top("quan 4").type, "district");
  assert.deepEqual(localSearch(idx, "q"), [], "fewer than 2 characters gives nothing");
});

test("local search indexes spots, streets and wards", () => {
  const s = spot("hcmc-0001", { name_vi: "Đường Phan Huy Ích", name_en: "Phan Huy Ich Street", street: "Phan Huy Ích", ward: "Phường Thông Tây Hội", legacy_district: "Gò Vấp" },
    { type: "Point", coordinates: [106.66, 10.84] });
  const idx = buildIndex([s], districts);
  const keys = (q) => localSearch(idx, q).map((e) => `${e.type}:${e.key}`);
  assert.ok(keys("phan huy").includes("street:Phan Huy Ích"));
  assert.ok(keys("phan huy").includes("spot:hcmc-0001"));
  assert.deepEqual(keys("thong tay hoi"), ["ward:Phường Thông Tây Hội"]);
  assert.deepEqual(localSearch(idx, "go vap")[0].ids, ["hcmc-0001"]);
});

test("distance to a point, a line and a polygon (metres)", () => {
  const lat = 10.77, lon = 106.70, mPerDegLat = 6371008.8 * Math.PI / 180;
  const near = (a, b) => Math.abs(a - b) < 0.5;
  const pt = spot("p", {}, { type: "Point", coordinates: [lon, lat + 0.001] });
  assert.ok(near(distanceToSpot(pt, lat, lon), 0.001 * mPerDegLat));

  // Horizontal line 0.001° north: nearest point is the perpendicular foot.
  const line = spot("l", {}, { type: "LineString", coordinates: [[lon - 0.01, lat + 0.001], [lon + 0.01, lat + 0.001]] });
  assert.ok(near(distanceToSpot(line, lat, lon), 0.001 * mPerDegLat));
  // Beyond the end of a line: distance to its end point.
  const short = spot("s", {}, { type: "LineString", coordinates: [[lon + 0.003, lat], [lon + 0.004, lat]] });
  assert.ok(near(distanceToSpot(short, lat, lon), 0.003 * mPerDegLat * Math.cos(lat * Math.PI / 180)));

  const square = [[lon - 0.001, lat - 0.001], [lon + 0.001, lat - 0.001], [lon + 0.001, lat + 0.001], [lon - 0.001, lat + 0.001], [lon - 0.001, lat - 0.001]];
  const poly = spot("a", {}, { type: "Polygon", coordinates: [square] });
  assert.equal(distanceToSpot(poly, lat, lon), 0, "inside the polygon");
  assert.ok(near(distanceToSpot(poly, lat + 0.002, lon), 0.001 * mPerDegLat), "outside: distance to the edge");

  // Inside a hole counts as outside the polygon.
  const hole = [[lon - 0.0005, lat - 0.0005], [lon + 0.0005, lat - 0.0005], [lon + 0.0005, lat + 0.0005], [lon - 0.0005, lat + 0.0005], [lon - 0.0005, lat - 0.0005]];
  const donut = spot("d", {}, { type: "Polygon", coordinates: [square, hole] });
  assert.ok(near(distanceToSpot(donut, lat, lon), 0.0005 * mPerDegLat * Math.cos(lat * Math.PI / 180)), "nearest hole edge is east/west");
});
