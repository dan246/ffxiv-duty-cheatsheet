"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { S, reset, step, nails, npcTarget, ROLES, useSkill } = require("../sim/uwu-ifrit.js");

const closeTo = (actual, expected) => assert(Math.abs(actual - expected) < 0.00001);
const onTimeline = (abs, name) =>
  S.tl.some((entry) => entry.name.includes(name) && Math.abs(entry.t + 152.558 - abs) < 0.00001);

test("fight 13 defaults to inverse-Z with independent surge, death and charge times", () => {
  assert.equal(S.opts.preset, "reference");
  Object.assign(S.opts, { full: true, start: 0, god: true });
  reset();
  assert.deepEqual(S.killOrder.map((i) => S.nailDirs[i]), [3, 0, 5, 6]);
  assert.equal(S.realIdx, 3);
  for (const [n, time] of [208.940, 211.174, 213.548, 214.798].entries()) {
    assert(onTimeline(time, `釘子 ${n + 1} 爆炸`));
  }
  for (const [n, time] of [213.009, 215.243, 217.611, 218.863].entries()) {
    const t = time - 152.558;
    assert.equal(nails(t - 0.001).length, 4 - n);
    assert.equal(nails(t + 0.001).length, 3 - n);
  }
  for (const [n, time] of [273.645, 275.076, 276.461, 277.893].entries()) {
    assert(onTimeline(time, `${n + 1}/4${n === 3 ? "（本體）" : ""}`));
  }
  assert(onTimeline(280.039, "十字火焰"));
  assert.deepEqual(S.markers.find((m) => m[0] === "4").slice(1, 3), [12.7, 12.7]);
});

test("reference paths set NPC positions on time and preserve independent role input", () => {
  globalThis.UWU_REFERENCE = { ifrit: { paths: { ST: [[152.558, 0, 0], [153.558, 10, 0]] } } };
  try {
    Object.assign(S.opts, { role: 0, start: 0, preset: "reference" });
    reset();
    assert.equal(S.ents[1].x, 0);
    const beforePlayer = { x: S.ents[0].x, y: S.ents[0].y };
    step(0.02);
    closeTo(npcTarget(S.ents[1]).x, 0.2);
    closeTo(S.ents[1].x,0.2);
    closeTo(S.ents[0].x, beforePlayer.x);
    closeTo(S.ents[0].y, beforePlayer.y);
  } finally {
    delete globalThis.UWU_REFERENCE;
  }
});

test("reference keeps cast completions and debuff windows distinct", () => {
  Object.assign(S.opts, { role: 5, start: 36, preset: "reference", full: true, god: true });
  reset();
  for (const [time, label] of [
    [192.951, "炎獄之鎖"],
    [193.039, "炎獄之鎖 詠唱完成"],
    [195.182, "灼熱咆哮 詠唱完成"],
    [196.077, "灼熱咆哮 → H1"],
    [174.975, "回放傷害：第一次烈焰焚燒 1/3"],
    [201.354, "地火 1/4 結算"],
    [213.994, "炎獄之鎖解除"],
    [214.040, "灼熱解除 → H1"],
    [239.568, "地火"],
    [240.105, "地火 1/4 結算"],
    [247.121, "分身深紅旋風 ×2 詠唱完成"],
    [262.228, "烈焰碎擊 詠唱完成"],
  ]) {
    const isBossEruption = time === 239.568;
    assert(isBossEruption
      ? S.casts.some((c) => c.name === label && Math.abs(c.t1 + 152.558 - time) < 0.00001)
      : onTimeline(time, label), `${time} ${label}`);
  }
  while (S.t < 56 && !S.over) step(0.02);
  assert.deepEqual(S.nailHits, [2, 2, 2, 2]);
  while (S.t < 149 && !S.over) step(0.02);
  assert.equal(S.over?.win, true);
});

test("west opener starts south and the two reference baiters start on their own nails", () => {
  const { home } = require("../sim/uwu-ifrit.js");
  Object.assign(S.opts, { preset: "reference", start: 0 });
  reset();
  assert.equal(S.bossCard, 3);
  assert(S.ents.every((e) => e.y > 10));
  assert(home(6, 45).y < -12 && Math.abs(home(6, 45).x) < 1);
  assert(home(7, 45).x > 9 && home(7, 45).y > 9);
  assert(home(6, 51).x < -8);
  assert(home(7, 51).x < -3 && home(7, 51).y > 7);
  assert(home(4, 46).y < 0 && home(5, 46).y > 0);
});

test("reference boss path guides NPC tanking while player tank movement still controls it", () => {
  const { bossState } = require("../sim/uwu-ifrit.js");
  globalThis.UWU_REFERENCE = { ifrit: { bossPath: [[188.558, 4, 1], [190.558, 6, 3]] } };
  try {
    Object.assign(S.opts, { preset: "reference", start: 36, role: 5 });
    reset();
    assert.deepEqual(bossState(37).pos, { x: 5, y: 2 });
    S.opts.role = 0;
    S.bossDyn = { x: 2, y: -2 };
    assert.deepEqual(bossState(37).pos, { x: 2, y: -2 });
  } finally {
    delete globalThis.UWU_REFERENCE;
  }
});

// The API recording includes Sprint, movement skills, a death and gaps;
// a greedy 6m/s keyboard follower is not an oracle for replay correctness.
// Full engine/source agreement is tested for every role in test-uwu-raw-replay.js.

test("reference still fails a player who ignores the opener and stays in the middle", () => {
  globalThis.UWU_REFERENCE = require("../sim/uwu-reference.js");
  try {
    Object.assign(S.opts, { role: 5, god: false, preset: "reference", start: 0 });
    reset();
    while (!S.over && S.t < 5) step(0.02);
    assert.equal(S.over?.win, false);
    assert.match(S.over.reason, /深紅旋風|光輝炎柱/);
  } finally {
    delete globalThis.UWU_REFERENCE;
  }
});

test("standing still as an eruption baiter fails at the first eruption", () => {
  globalThis.UWU_REFERENCE = require("../sim/uwu-reference.js");
  try {
    Object.assign(S.opts, { role: 6, god: false, preset: "reference", start: 36 });
    reset();
    while (!S.over && S.t < 57) step(0.02);
    assert.equal(S.over?.win, false);
    assert.match(S.over.reason, /地火/);
  } finally {
    delete globalThis.UWU_REFERENCE;
  }
});

test('reference NPC fast samples preserve deadlines, slow samples hold and player speed stays unchanged',()=>{
  const previous=globalThis.UWU_REFERENCE;
  globalThis.UWU_REFERENCE={ifrit:{paths:{ST:[[152.558,0,0],[153.558,10,0],[154.558,10.5,0]]}}};
  try {
    Object.assign(S.opts,{preset:'reference',start:0,role:7,god:true,full:true}); reset(); S.events=[];
    for(let i=0;i<50;i++) step(.02);
    closeTo(S.ents[1].x,10);
    step(.02); closeTo(S.ents[1].x,10);
    S.cam=0; // Fix the camera axis for this pure movement-speed assertion.
    const x=S.ents[7].x; S.keys.KeyD=true; step(.02); closeTo(S.ents[7].x-x,.12);
    S.ents[1].dead=true; const deadX=S.ents[1].x; step(.02); closeTo(S.ents[1].x,deadX);
  } finally {if(previous===undefined)delete globalThis.UWU_REFERENCE;else globalThis.UWU_REFERENCE=previous;}
});
