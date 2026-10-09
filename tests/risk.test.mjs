import { test } from "node:test";
import assert from "node:assert/strict";
import { depthClass, RISK_TABLE, computeRisk } from "../js/risk.js";

// Requirements §4, written out independently of RISK_TABLE.
const EXPECTED = [
  ["shallow", "rare", "low"], ["shallow", "occasional", "low"], ["shallow", "frequent", "medium"],
  ["moderate", "rare", "low"], ["moderate", "occasional", "medium"], ["moderate", "frequent", "high"],
  ["deep", "rare", "medium"], ["deep", "occasional", "high"], ["deep", "frequent", "high"]
];
const MAX_FOR = { shallow: 5, moderate: 20, deep: 50 };

test("all 9 cells of the risk table", () => {
  for (const [dc, freq, risk] of EXPECTED) {
    assert.equal(RISK_TABLE[dc][freq], risk, `${dc} × ${freq}`);
    assert.equal(computeRisk({ min: 0, max: MAX_FOR[dc] }, freq), risk, `computeRisk ${dc} × ${freq}`);
  }
  assert.equal(Object.keys(RISK_TABLE).length, 3);
  for (const row of Object.values(RISK_TABLE)) assert.deepEqual(Object.keys(row).sort(), ["frequent", "occasional", "rare"]);
});

test("depth class boundaries at 9/10 and 30/31 cm", () => {
  assert.equal(depthClass(0), "shallow");
  assert.equal(depthClass(9), "shallow");
  assert.equal(depthClass(10), "moderate");
  assert.equal(depthClass(30), "moderate");
  assert.equal(depthClass(31), "deep");
  assert.equal(depthClass(200), "deep");
});

test("computeRisk uses depth_cm.max, not min", () => {
  assert.equal(computeRisk({ min: 5, max: 31 }, "rare"), "medium");
  assert.equal(computeRisk({ min: 9, max: 10 }, "frequent"), "high");
  assert.equal(computeRisk({ min: 0, max: 9 }, "frequent"), "medium");
});
