import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATE = join(ROOT, "scripts/validate.mjs");
const FIX = join(ROOT, "tests/fixtures");
const TODAY = "2026-10-09";        // fixed, so the fixtures never go stale or "future"
const run = (...args) => spawnSync(process.execPath, [VALIDATE, ...args], { encoding: "utf8" });

test("the real data passes", () => {
  const r = run();
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /OK: no errors/);
  assert.match(r.stdout, /Risk summary/);
});

test("the valid fixture passes with no warnings", () => {
  const r = run(join(FIX, "valid.geojson"), "--today", TODAY);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /OK: no errors, 0 warning/);
});

test("last_verified older than 12 months warns but does not fail", () => {
  const r = run(join(FIX, "stale.geojson"), "--today", TODAY);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /WARN {2}hcmc-0001: last_verified 2025-09-01 is older than 12 months/);
});

// One failing fixture per field rule (design §4); cases.json gives the expected error text.
const cases = JSON.parse(readFileSync(join(FIX, "invalid/cases.json"), "utf8"));
for (const c of cases) {
  test(`fails: ${c.file}`, () => {
    const r = run(join(FIX, "invalid", c.file), "--today", TODAY);
    assert.equal(r.status, 1, r.stdout);
    assert.ok(r.stdout.includes(c.expect), `expected "${c.expect}" in:\n${r.stdout}`);
  });
}

test("--base fails when a spot id was deleted, passes when it was retired", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "floodmap-base-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8" });
  git("init", "-q");
  const file = join(dir, "spots.geojson");
  cpSync(join(FIX, "valid.geojson"), file);
  git("add", ".");
  git("-c", "user.name=test", "-c", "user.email=test@example.org", "-c", "commit.gpgsign=false", "commit", "-qm", "base");

  const fc = JSON.parse(readFileSync(file, "utf8"));
  fc.features[0].properties.status = "resolved";
  writeFileSync(file, JSON.stringify(fc));
  let r = run(file, "--base", "HEAD", "--today", TODAY);
  assert.equal(r.status, 0, r.stdout);

  fc.features.splice(1, 1);                       // delete hcmc-0002
  writeFileSync(file, JSON.stringify(fc));
  r = run(file, "--base", "HEAD", "--today", TODAY);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /hcmc-0002: present at HEAD but missing now/);

  r = run(file, "--base", "no-such-ref", "--today", TODAY);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /--base: git show no-such-ref failed/);
});
