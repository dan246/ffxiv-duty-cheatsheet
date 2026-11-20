"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const ifrit = require("../sim/uwu-ifrit.js");
const titan = require("../sim/uwu-titan.js");

function runTo(sim, end) {
  const { S, step } = sim;
  while (S.t < end && !S.over) {
    step(Math.min(0.02, end - S.t));
    assert(S.ents.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)));
  }
}

for (const [name, sim, variant] of [
  ["Ifrit", ifrit, (s) => [s.bossCard, s.k, s.realIdx, s.fetterDps, s.sw, s.crush1]],
  ["Titan", titan, (s) => [s.g2, s.mir, s.g3, s.g4, s.bomb0]],
]) {
  test(`${name}: resets reproduce a seed, including seed zero`, () => {
    const { S, reset } = sim;
    S.opts.preset = "random";
    assert(Number.isInteger(S.opts.seed) && S.opts.seed >= 0 && S.opts.seed <= 0xffffffff);
    Object.assign(S.opts, { seed: 0, role: 0, start: name === "Ifrit" ? 0 : -4 });
    reset();
    const original = variant(S);
    reset();
    assert.deepEqual(variant(S), original);
    S.opts.seed = 1;
    reset();
    assert.notDeepEqual(variant(S), original);
    S.opts.seed = 0;
    reset();
    assert.deepEqual(variant(S), original);
  });

  test(`${name}: every checkpoint completes in observation mode for each role`, () => {
    const { S, reset, ROLES, CHECKPOINTS, END_T } = sim;
    for (const { t: start } of CHECKPOINTS) {
      for (const [role, label] of ROLES.entries()) {
        Object.assign(S.opts, { start, role, seed: 3991, god: true, full: true, preset: "random" });
        reset();
        assert.equal(S.t, start);
        runTo(sim, END_T + 1);
        assert.equal(S.over?.win, true, `${label}, checkpoint ${start}`);
      }
    }
  });
}

test("Ifrit: entering short mode from an unavailable checkpoint still reaches kill", () => {
  const { S, reset, KILL_T } = ifrit;
  Object.assign(S.opts, { start: 112, role: 0, seed: 0, god: true, full: false, preset: "random" });
  reset();
  assert.equal(S.t, 68);
  runTo(ifrit, KILL_T + 1);
  assert.equal(S.over?.win, true);
});

test("Ifrit: NPC baiters give every nail two hits, then nails die in inverse-Z order", () => {
  const { S, reset, nails } = ifrit;
  Object.assign(S.opts, { start: 36, role: 0, seed: 8, god: true, full: true, preset: "random" });
  reset();
  runTo(ifrit, 55.15);
  assert.deepEqual(S.nailHits, [2, 2, 2, 2]);
  for (const [t, remaining] of [[55.22, [0, 1, 2]], [57.72, [0, 1]], [60.22, [1]], [62.72, []]]) {
    runTo(ifrit, t);
    assert.deepEqual(nails(S.t).map((n) => n.i), remaining);
  }
});

test("Titan: bomb chain frees H2, H1, then D4 when first Landslide aims at MT", () => {
  const { S, reset } = titan;
  Object.assign(S.opts, { start: 27.5, role: 0, seed: 6, god: true });
  reset();
  runTo(titan, 49.61);
  assert.deepEqual(S.gaols.filter((g) => g.broken).map((g) => g.who), [3]);
  runTo(titan, 50.31);
  assert.deepEqual(S.gaols.filter((g) => g.broken).map((g) => g.who), [3, 2]);
  runTo(titan, 51.11);
  assert.deepEqual(S.gaols.filter((g) => g.broken).map((g) => g.who), [3, 2, 7]);
});
