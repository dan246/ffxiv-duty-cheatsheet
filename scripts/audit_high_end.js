#!/usr/bin/env node
/* Runtime audit for the complete savage/ultimate cheatsheet, including
 * strategies_cn.js enhancements that are not visible to per-file validation.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), ctx);
for (const file of ctx.window.FF14_MANIFEST) {
  const full = path.join(ROOT, "data", file);
  if (fs.existsSync(full)) vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: full });
}

const duties = ctx.window.FF14_DATA.filter((d) => ["savage", "chaotic", "ultimate"].includes(d.type));
const errors = [];
const fail = (d, message) => errors.push(`${d.id}: ${message}`);
const actual = { macro: 0, positions: 0, diagram: 0 };
const disclosed = { macro: 0, positions: 0, diagram: 0 };
const ultimateMacroMarkers = {
  "sb-ucob": ["Hatch", "黑炎", "八重奏"],
  "sb-uwu": ["Mesohigh", "石牢", "Suppression"],
  "shb-tea": ["1256西", "二人圈搭档", "时间牢"],
  "ew-dsr": ["Dive from Grace", "Mortal Vow", "Trinity"],
  "ew-top": ["Monitor", "Delta近线", "Magic Number"],
  "dt-fru": ["Light Rampant", "Relativity", "Crystallize"],
  "dt-dmu": ["Forsaken", "Chaos组", "真水分摊"],
};

if (duties.filter((d) => d.type === "savage").length !== 64) errors.push("零式总数必须为 64");
if (duties.filter((d) => d.type === "chaotic").length !== 1) errors.push("滅聯盟高難总数必须为 1");
if (duties.filter((d) => d.type === "ultimate").length !== 7) errors.push("绝境战总数必须为 7");

for (const duty of duties) {
  const primary = duty.strategies?.find((s) => s.primary) || duty.strategies?.[0];
  if (!primary) { fail(duty, "缺少主流打法"); continue; }
  if (!primary.source?.url) fail(duty, "缺少逐本攻略直连");
  if (/search\./.test(primary.source?.url || "")) fail(duty, "攻略来源不得为搜索结果页");
  if (primary.positions) actual.positions += 1;
  else if (primary.positionsStatus) disclosed.positions += 1;
  else fail(duty, "缺少可见站位分工，且未披露缺口");
  if (primary.macro) actual.macro += 1;
  else if (primary.macroStatus) disclosed.macro += 1;
  else fail(duty, "缺少可复制宏，且未披露缺口");
  if (/本站固定分工|機制另列位置時|机制另列位置时/.test(primary.macro || "")) fail(duty, "不可用全副本共用的泛用八方宏冒充逐本宏");
  if (duty.type === "ultimate") {
    if (!/非原作者宏/.test(primary.macroStatus || "")) fail(duty, "本站整理的绝本宏必须明确标示为非原作者宏");
    for (const marker of ultimateMacroMarkers[duty.id] || []) {
      if (!(primary.macro || "").includes(marker)) fail(duty, `绝本宏缺少本副本核心机制／分组：${marker}`);
    }
  }
  if (primary.diagramUrl) actual.diagram += 1;
  else if (primary.diagramStatus) disclosed.diagram += 1;
  else fail(duty, "缺少站位图／图文入口，且未披露缺口");
  if (!primary.macroStatus && /本站固定分工/.test(primary.macro || "")) fail(duty, "本站整理宏必须明确标示来源状态");
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ 高难来源诚实性通过：64 零式＋1 滅聯盟＋7 绝境战`);
console.log(`  实有逐本内容：宏 ${actual.macro}/72，站位 ${actual.positions}/72，图文入口 ${actual.diagram}/72`);
console.log(`  已明确披露缺口：宏 ${disclosed.macro}/72，站位 ${disclosed.positions}/72，图文 ${disclosed.diagram}/72`);
