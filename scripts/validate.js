#!/usr/bin/env node
/* 驗證 data/*.js 是否符合 SCHEMA.md
 *   node scripts/validate.js            驗證 manifest 內全部檔案
 *   node scripts/validate.js data/x.js  驗證指定檔案
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const TYPES = new Set(["dungeon", "trial", "extreme", "raid", "savage", "alliance", "ultimate", "other"]);
const EXPS = new Set(["arr", "hw", "sb", "shb", "ew", "dt"]);
const ROLES = new Set(["all", "T", "H", "D"]);

function loadFile(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
  return ctx.window.FF14_DATA || [];
}

let files = process.argv.slice(2);
if (!files.length) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), ctx);
  files = ctx.window.FF14_MANIFEST.map((f) => path.join(ROOT, "data", f));
}

const errors = [];
const ids = new Map();
let total = 0;
const err = (f, id, msg) => errors.push(`${path.basename(f)} [${id}] ${msg}`);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const hasSimplified = (s) => /[一-鿿]/.test(s); // 粗略：只檢查有中文

for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`(略過，不存在) ${path.relative(ROOT, f)}`); continue; }
  let arr;
  try { arr = loadFile(f); } catch (e) { errors.push(`${path.basename(f)} 無法執行：${e.message}`); continue; }
  if (!arr.length) { errors.push(`${path.basename(f)} 沒有任何資料`); continue; }
  for (const d of arr) {
    total++;
    const id = d.id || "(無id)";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id || "")) err(f, id, "id 必須是小寫 kebab-case");
    if (ids.has(d.id)) err(f, id, `id 重複（另見 ${ids.get(d.id)}）`); else ids.set(d.id, path.basename(f));
    if (!TYPES.has(d.type)) err(f, id, `type 不合法：${d.type}`);
    if (!EXPS.has(d.expansion)) err(f, id, `expansion 不合法：${d.expansion}`);
    if (!isStr(d.patch)) err(f, id, "patch 必須是字串");
    if (!Number.isInteger(d.level) || d.level < 1) err(f, id, "level 必須是整數");
    if (!d.name || !isStr(d.name.cn) || !isStr(d.name.en) || !isStr(d.name.tw)) err(f, id, "name.cn / name.en / name.tw 必填");
    if (d.aliases && !Array.isArray(d.aliases)) err(f, id, "aliases 必須是陣列");
    if (!isStr(d.overview)) err(f, id, "overview 必填");
    if (!Array.isArray(d.bosses) || !d.bosses.length) { err(f, id, "bosses 必填且至少 1 個"); continue; }
    d.bosses.forEach((b, bi) => {
      const bid = `${id} boss#${bi + 1}`;
      if (!b.name || !isStr(b.name.cn) || !isStr(b.name.en)) err(f, bid, "boss.name.cn / en 必填");
      if (!isStr(b.summary)) err(f, bid, "boss.summary 必填");
      if (!Array.isArray(b.mechanics) || !b.mechanics.length) { err(f, bid, "mechanics 必填且至少 1 個"); return; }
      if (b.tips && !Array.isArray(b.tips)) err(f, bid, "tips 必須是陣列");
      b.mechanics.forEach((m, mi) => {
        const mid = `${bid} mech#${mi + 1}`;
        if (!m.name || !isStr(m.name.cn)) err(f, mid, "mechanic.name.cn 必填");
        if (!isStr(m.desc)) err(f, mid, "desc 必填");
        if (!isStr(m.solve)) err(f, mid, "solve 必填");
        if (m.role != null && !ROLES.has(m.role)) err(f, mid, `role 不合法：${m.role}`);
        if (m.danger != null && ![1, 2, 3].includes(m.danger)) err(f, mid, `danger 必須是 1~3：${m.danger}`);
      });
    });
    if (d.notes && !Array.isArray(d.notes)) err(f, id, "notes 必須是陣列");
  }
  console.log(`✓ ${path.relative(ROOT, f)}：${arr.length} 場`);
}

console.log(`\n共 ${total} 場副本`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} 個錯誤：`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
} else {
  console.log("✓ 全部通過");
}
