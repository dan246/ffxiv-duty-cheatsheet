#!/usr/bin/env node
/* 驗證 data/*.js 是否符合 SCHEMA.md
 *   node scripts/validate.js            驗證 manifest 內全部檔案
 *   node scripts/validate.js data/x.js  驗證指定檔案
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const TYPES = new Set(["dungeon", "trial", "extreme", "raid", "savage", "alliance", "chaotic", "ultimate", "other"]);
const EXPS = new Set(["arr", "hw", "sb", "shb", "ew", "dt"]);
const ROLES = new Set(["all", "T", "H", "D"]);
const HIGH_END = new Set(["savage", "chaotic", "ultimate"]);
const CONTENT_TYPE_TO_TYPE = new Map([
  ["dungeon", "dungeon"],
  ["trial", "trial"],
  ["extreme-trial", "extreme"],
  ["normal-raid", "raid"],
  ["savage-raid", "savage"],
  ["alliance-raid", "alliance"],
  ["chaotic-alliance-raid", "chaotic"],
  ["ultimate-raid", "ultimate"],
]);
const OUTSOURCED_SOLVE = /(看宏|依宏|按宏|隊伍宏|先確認.{0,12}流派|招募文|隊伍圖|依圖站|固定圖站位|實際站位一律)/;
const OFFICIAL_MECHANIC_CN = new Map([
  ["Almagest", "至高无上"],
  ["Forsaken", "妖星乱舞"],
  ["Flame Floater", "浪顶炽火"],
  ["Alley-oop Inferno + Cutback Blaze", "空中旋火＋火浪回切"],
  ["Alley-oop Double-Dip / Reverse Alley-oop", "双重旋水／交错旋水"],
  ["Pyrolation", "旋绕巨火"],
  ["Diver's Dare", "斗志昂扬"],
  ["Xtreme Spectacular", "极限炫技"],
]);
const RETIRED_74_TRANSLATIONS = new Map([
  ["dt-arcadion-m9-savage", /杀手之声|吸血鬼践踏|棺材填充|以太释放|地狱牢笼|亡灵死亡赛|血腥抓痕|致命落幕/],
  ["dt-arcadion-m11-savage", /登天之冠|粗钢战利品|战利武器三连|虚空星尘|终极战利武器|强力阵风|轨道预兆|黄道狂奔|唯一霸王/],
  ["dt-arcadion-m12-savage", /致命杀戮|异形细胞|屠戮场|登天燃烧|田园梦|坠落塔|扭曲视界|时间帷幕/],
]);
const SAVAGE_DUTY_PREFIX = new Map([
  ["arr", "巴哈姆特零式大迷宫 "],
  ["hw", "亚历山大零式机神城 "],
  ["sb", "欧米茄零式时空狭缝 "],
  ["shb", "伊甸零式希望乐园 "],
  ["ew", "零式万魔殿 "],
  ["dt", "阿卡狄亚零式登天斗技场 "],
]);

function loadFile(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
  return ctx.window.FF14_DATA || [];
}

let files = process.argv.slice(2);
const validatingManifest = !files.length;
if (!files.length) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), ctx);
  files = ctx.window.FF14_MANIFEST.map((f) => path.join(ROOT, "data", f));
}

const errors = [];
const ids = new Map();
const officialKeys = new Map();
let total = 0;
const err = (f, id, msg) => errors.push(`${path.basename(f)} [${id}] ${msg}`);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const hasSimplified = (s) => /[一-鿿]/.test(s); // 粗略：只檢查有中文

for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`(略過，不存在) ${path.relative(ROOT, f)}`); continue; }
  let arr;
  try { arr = loadFile(f); } catch (e) { errors.push(`${path.basename(f)} 無法執行：${e.message}`); continue; }
  if (!arr.length && path.basename(f) === "strategies_cn.js") {
    console.log(`✓ ${path.relative(ROOT, f)}：运行时打法补全层`);
    continue;
  }
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
    if (d.ilvl != null && (!Number.isInteger(d.ilvl) || d.ilvl < 0)) err(f, id, "ilvl 必須是非負整數或 null");
    if (d.ilvlSync != null && (!Number.isInteger(d.ilvlSync) || d.ilvlSync < 0)) err(f, id, "ilvlSync 必須是非負整數或 null");
    if (!d.name || !isStr(d.name.cn) || !isStr(d.name.en) || !isStr(d.name.tw)) err(f, id, "name.cn / name.en / name.tw 必填");
    if (d.aliases && !Array.isArray(d.aliases)) err(f, id, "aliases 必須是陣列");
    if (!isStr(d.overview)) err(f, id, "overview 必填");
    if (d.identity == null) {
      err(f, id, "identity 必填；每筆副本必須直接綁定官方唯一身分，不得由名稱或別名推測");
    } else {
      if (!/^cfc:\d+$/.test(d.identity.officialKey || "")) err(f, id, "identity.officialKey 必須是 cfc:<數字> 的官方唯一列 ID");
      else if (officialKeys.has(d.identity.officialKey)) err(f, id, `官方身分重複（另見 ${officialKeys.get(d.identity.officialKey)}）`);
      else officialKeys.set(d.identity.officialKey, id);
      if (!CONTENT_TYPE_TO_TYPE.has(d.identity.contentType)) err(f, id, `identity.contentType 不合法：${d.identity.contentType}`);
      else if (CONTENT_TYPE_TO_TYPE.get(d.identity.contentType) !== d.type) err(f, id, `官方內容類型 ${d.identity.contentType} 與 type=${d.type} 不一致`);
      if (!Number.isInteger(d.identity.partySize) || d.identity.partySize < 1) err(f, id, "identity.partySize 必須是正整數");
      if (!/^https:\/\//.test(d.identity.sourceUrl || "")) err(f, id, "identity.sourceUrl 必須是官方 https 來源");
    }
    if (d.sources != null) {
      if (!Array.isArray(d.sources)) err(f, id, "sources 必須是陣列");
      else d.sources.forEach((s, si) => {
        if (!s || !isStr(s.label) || !/^https:\/\//.test(s.url || "")) err(f, id, `sources#${si + 1} 需要 label 與 https URL`);
      });
    }
    if (HIGH_END.has(d.type) && !d.sources?.length) err(f, id, "高難副本必須列出攻略來源");
    if (HIGH_END.has(d.type) && !d.sources?.some((s) => /ff14\.huijiwiki\.com/.test(s.url || ""))) {
      err(f, id, "零式／絕本必須列出灰机 Wiki，作為陸服名稱與技能來源");
    }
    if (d.strategies != null) {
      if (!Array.isArray(d.strategies)) err(f, id, "strategies 必須是陣列");
      else d.strategies.forEach((s, si) => {
        if (!isStr(s?.name) || !isStr(s?.summary)) err(f, id, `strategies#${si + 1} 需要 name 與 summary`);
        if (s?.macro != null && !isStr(s.macro)) err(f, id, `strategies#${si + 1} macro 必須是非空字串`);
        if (s?.macroStatus != null && !isStr(s.macroStatus)) err(f, id, `strategies#${si + 1} macroStatus 必須是非空字串`);
        if (s?.positionsStatus != null && !isStr(s.positionsStatus)) err(f, id, `strategies#${si + 1} positionsStatus 必須是非空字串`);
        if (s?.diagramStatus != null && !isStr(s.diagramStatus)) err(f, id, `strategies#${si + 1} diagramStatus 必須是非空字串`);
        if (s?.source && (!isStr(s.source.label) || !/^https:\/\//.test(s.source.url || ""))) err(f, id, `strategies#${si + 1} source 不合法`);
        if (s?.diagramUrl && !/^https:\/\//.test(s.diagramUrl)) err(f, id, `strategies#${si + 1} diagramUrl 不合法`);
      });
    }
    if (d.type === "savage" && !d.name?.cn?.startsWith(SAVAGE_DUTY_PREFIX.get(d.expansion) || "")) {
      err(f, id, `陸服零式正式名稱前綴錯誤：${d.name?.cn}`);
    }
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
        if (OFFICIAL_MECHANIC_CN.has(m.name?.en) && m.name.cn !== OFFICIAL_MECHANIC_CN.get(m.name.en)) {
          err(f, mid, `${m.name.en} 的陸服技能名應為「${OFFICIAL_MECHANIC_CN.get(m.name.en)}」，目前是「${m.name.cn}」`);
        }
        if (!isStr(m.desc)) err(f, mid, "desc 必填");
        if (!isStr(m.solve)) err(f, mid, "solve 必填");
        if (HIGH_END.has(d.type) && OUTSOURCED_SOLVE.test(m.solve || "")) err(f, mid, "解法不可把站位外包給宏、招募文或未附內容的圖");
        if (m.role != null && !ROLES.has(m.role)) err(f, mid, `role 不合法：${m.role}`);
        if (m.danger != null && ![1, 2, 3].includes(m.danger)) err(f, mid, `danger 必須是 1~3：${m.danger}`);
        if (RETIRED_74_TRANSLATIONS.get(id)?.test(m.name?.cn || "")) {
          err(f, mid, `7.4 零式混入非陆服正式技能名：${m.name.cn}`);
        }
      });
    });
    if (HIGH_END.has(d.type)) {
      const mechanicCount = d.bosses.reduce((n, b) => n + (b.mechanics?.length || 0), 0);
      if (mechanicCount < 4) err(f, id, "高難副本至少需要 4 個致死／核心機制");
    }
    if (d.notes && !Array.isArray(d.notes)) err(f, id, "notes 必須是陣列");
  }
  console.log(`✓ ${path.relative(ROOT, f)}：${arr.length} 場`);
}

if (validatingManifest) {
  const runtime = { window: {} };
  vm.createContext(runtime);
  for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), runtime, { filename: f });
  for (const d of runtime.window.FF14_DATA || []) {
    if (HIGH_END.has(d.type) && !d.strategies?.length) {
      errors.push(`运行时 [${d.id}] 零式／绝本必须提供至少一套国服主流打法、宏或站位资料`);
    }
  }
}

console.log(`\n共 ${total} 場副本`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} 個錯誤：`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
} else {
  console.log("✓ 全部通過");
}
