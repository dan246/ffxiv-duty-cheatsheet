#!/usr/bin/env node
// 招式覆蓋率稽核：把每場副本的 mechanics 與 cactbot 時間軸（實際戰鬥紀錄整理出的技能表）逐招比對，
// 找出「時間軸上有、小抄裡沒寫」的技能，以及「小抄有寫、時間軸查無此名」的可疑技能名。
//
// 用法：
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/OverlayPlugin/cactbot.git <dir>
//   (cd <dir> && git sparse-checkout set ui/raidboss/data)
//   node scripts/audit_coverage.js <cactbot dir> [--file data/savage_sb.js] [--id sb-omega-o8-savage] [--json out.json]
//
// cactbot 只當作唯讀參考資料（技能英文名、陸服譯名、出現順序），不會在遊戲內執行任何東西。
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const cactbot = args[0] && !args[0].startsWith("--") ? args[0] : null;
if (!cactbot) { console.error("usage: node scripts/audit_coverage.js <cactbot dir> [--file f] [--id id] [--json out]"); process.exit(2); }
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const onlyFile = opt("--file") && path.basename(opt("--file"));
const onlyId = opt("--id");

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const normZone = (s) => norm(String(s).replace(/&/g, "and")).replace(/^the/, "");

// ---------- cactbot ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
// 時間軸裡不是「招式」的雜項
const NOISE = /^(--.*--|start|end|enrage|.*enrage.*|attack|auto-?attack|.*\badds?\b.*|phase \d+|intermission.*)$/i;
function cleanName(raw) {
  return raw.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+x\s?\d+\b/gi, "").replace(/\s+\d+$/g, "").replace(/\?+$/, "").trim();
}
function parseTimeline(txt) {
  const seen = new Map();
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*[\d.]+\s+"([^"]+)"\s*(.*)$/);
    if (!m) continue;
    if (/^\s*#/.test(line)) continue;
    const src = (m[2].match(/source:\s*"([^"]+)"/) || [])[1] || "";
    for (const part of m[1].split(/\s*[\/+]\s*/)) {
      const name = cleanName(part);
      if (!name || NOISE.test(name) || name.length < 3) continue;
      const k = norm(name);
      if (!k) continue;
      if (!seen.has(k)) seen.set(k, { en: name, source: src, count: 0 });
      seen.get(k).count++;
    }
  }
  return [...seen.values()];
}
function parseCnReplace(ts) {
  const i = ts.search(/['"]?locale['"]?:\s*'cn'/);
  if (i < 0) return {};
  const next = ts.slice(i + 10).search(/['"]?locale['"]?:\s*'/);
  const block = next < 0 ? ts.slice(i) : ts.slice(i, i + 10 + next);
  const j = block.search(/['"]?replaceText['"]?:\s*\{/);
  if (j < 0) return {};
  const body = block.slice(j);
  const map = {};
  const re = /'((?:[^'\\]|\\.)+)':\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(body))) {
    const en = m[1].replace(/\\\(.*?\\\)/g, "").replace(/\(\?[<!=][^)]*\)/g, "").replace(/\\(.)/g, "$1");
    map[norm(cleanName(en))] = m[2].replace(/\\(.)/g, "$1").replace(/\s*[（(].*?[)）]\s*/g, "");
  }
  return map;
}
const zones = new Map(); // normZone -> [{file, abilities, cn}]
for (const ts of walk(path.join(cactbot, "ui/raidboss/data")).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(ts, "utf8");
  const tl = (src.match(/timelineFile:\s*'([^']+)'/) || [])[1];
  if (!tl) continue;
  const tlPath = path.join(path.dirname(ts), tl);
  if (!fs.existsSync(tlPath)) continue;
  const zm = src.match(/zoneId:\s*(\[[^\]]+\]|ZoneId\.\w+)/);
  if (!zm) continue;
  const entry = {
    file: path.relative(cactbot, tlPath),
    abilities: parseTimeline(fs.readFileSync(tlPath, "utf8")),
    cn: parseCnReplace(src),
  };
  for (const z of zm[1].match(/ZoneId\.(\w+)/g) || []) {
    const k = normZone(z.slice(7));
    if (!zones.has(k)) zones.set(k, []);
    zones.get(k).push(entry);
  }
}

// ---------- 小抄資料 ----------
const ctx = { window: { FF14_DATA: [] }, console };
vm.createContext(ctx);
const duties = [];
for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith(".js") && !["manifest.js", "_example.js"].includes(f)).sort()) {
  const before = ctx.window.FF14_DATA.length;
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), ctx, { filename: f });
  for (const d of ctx.window.FF14_DATA.slice(before)) duties.push({ f, d });
}

const report = [];
for (const { f, d } of duties) {
  if (onlyFile && f !== onlyFile) continue;
  if (onlyId && d.id !== onlyId) continue;
  const mechs = (d.bosses || []).flatMap((b) => b.mechanics || []);
  const base = { file: f, id: d.id, type: d.type, en: d.name.en, cn: d.name.cn, bosses: (d.bosses || []).length, mechanics: mechs.length };
  const hit = zones.get(normZone(d.name.en));
  if (!hit) { report.push({ ...base, timeline: null }); continue; }
  const abilities = new Map();
  const cn = {};
  for (const e of hit) { for (const a of e.abilities) if (!abilities.has(norm(a.en))) abilities.set(norm(a.en), a); Object.assign(cn, e.cn); }
  const enPieces = mechs.flatMap((m) => String(m.name.en || "").split(/\s*[\/+＋／、,]\s*/)).map(norm).filter(Boolean);
  const text = JSON.stringify(d);
  const textNorm = norm(text);
  const missing = [];
  for (const [k, a] of abilities) {
    const zh = cn[k];
    const covered = enPieces.some((p) => p === k || (k.length >= 5 && p.includes(k)) || (p.length >= 5 && k.includes(p)))
      || (k.length >= 6 && textNorm.includes(k)) || (zh && zh.length >= 2 && text.includes(zh));
    if (!covered) missing.push({ en: a.en, cn: zh || null, source: a.source || null, casts: a.count });
  }
  const keys = [...abilities.keys()];
  const unknown = [...new Set(mechs.flatMap((m) => String(m.name.en || "").split(/\s*[\/+＋／、,]\s*/)).filter((p) => {
    const k = norm(p);
    return k && !keys.some((a) => a === k || (k.length >= 5 && a.includes(k)) || (a.length >= 5 && k.includes(a)));
  }))];
  report.push({ ...base, timeline: hit.map((e) => e.file), abilities: abilities.size, missing, unknown });
}

if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify(report, null, 1));
const withTl = report.filter((r) => r.timeline);
const byFile = {};
for (const r of report) {
  const s = (byFile[r.file] ??= { duties: 0, matched: 0, abilities: 0, missing: 0, unknown: 0 });
  s.duties++;
  if (r.timeline) { s.matched++; s.abilities += r.abilities; s.missing += r.missing.length; s.unknown += r.unknown.length; }
}
console.log("檔案".padEnd(24), "副本", "有時間軸", "時間軸招式", "漏寫", "查無此名");
for (const [f, s] of Object.entries(byFile)) console.log(f.padEnd(26), String(s.duties).padStart(3), String(s.matched).padStart(6), String(s.abilities).padStart(9), String(s.missing).padStart(6), String(s.unknown).padStart(7));
console.log(`\n合計：${report.length} 場，其中 ${withTl.length} 場有時間軸；漏寫 ${withTl.reduce((s, r) => s + r.missing.length, 0)} 招。`);
if (onlyFile || onlyId) {
  for (const r of report) {
    if (!r.timeline) { console.log(`\n## ${r.id} ${r.en}：cactbot 無時間軸`); continue; }
    console.log(`\n## ${r.id} ${r.en}（${r.mechanics} 條／時間軸 ${r.abilities} 招）`);
    console.log("漏寫：" + (r.missing.map((m) => `${m.en}${m.cn ? `〔${m.cn}〕` : ""}${m.source ? `@${m.source}` : ""}`).join("；") || "無"));
    if (r.unknown.length) console.log("查無此名：" + r.unknown.join("；"));
  }
}
