#!/usr/bin/env node
// 灰機對照稽核：把每場副本與灰機 wiki 頁面文字（<dir>/<副本 id>.txt）比對：
//   1. 王卡片數是否等於灰機的「#2 王」數（門神／本體、絕本各 P 可多，不應少、不應把小怪拆成卡）
//   2. 灰機列出的每個技能名是否出現在小抄裡
//
// 用法：node scripts/audit_huiji.js <灰機文字目錄> [--file data/x.js] [--id duty-id] [--json out.json]
// 灰機文字格式：`#2 王名`、`#3 階段名`、`技能名：描述`。
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const dir = args[0] && !args[0].startsWith("--") ? args[0] : null;
if (!dir) { console.error("usage: node scripts/audit_huiji.js <huiji text dir> [--file f] [--id id] [--json out]"); process.exit(2); }
const dataDir = path.join(__dirname, "..", "data");
const onlyFile = opt("--file") && path.basename(opt("--file"));
const onlyId = opt("--id");

const NOT_BOSS = /^(目录|开放条件|任务|攻略|机制|概述|备注|注释|道中|小怪|杂兵|宝箱|其他|相关|剧情|简介|基本信息)/;
const NOT_SKILL = /^(攻击|添加版本|副本ID|数据文件|副本台词|品级同步|首领数量|.*数量|血量.*|体力.*|.*[ぁ-んァ-ヶ].*|.*释放一系列.*|.*附加.*|第.轮.*|普通攻击|任务地点|任务时限|队伍构成|超越之力|神典石|初次完成奖励|等级要求|装备品级要求|允许.*|前置任务|备注|注|说明|提示|第.{1,3}轮|第.{1,3}次|阶段.*|P\d.*|.*状态|.*小时|时间|条件|奖励|地点|开始NPC.*|接受条件)$/;
function parseHuiji(txt) {
  const bosses = [];
  let cur = null, phase = "";
  const start = txt.search(/^#2 /m);
  for (const raw of (start >= 0 ? txt.slice(start) : txt).split(/\r?\n/)) {
    const line = raw.replace(/^- /, "").trim();
    let m;
    if ((m = line.match(/^#2 (.+)$/))) {
      const name = m[1].replace(/编辑.*$/, "").trim();
      cur = NOT_BOSS.test(name) ? null : (bosses.find((b) => b.name === name) || { name, skills: [] });
      if (cur && !bosses.includes(cur)) bosses.push(cur);
      phase = "";
      continue;
    }
    if ((m = line.match(/^#[3-6] (.+)$/))) { phase = m[1].trim(); continue; }
    if (!cur) continue;
    if ((m = line.match(/^([^\s：:#，。、；]{2,14})：/))) {
      const name = m[1];
      if (NOT_SKILL.test(name)) continue;
      if (!cur.skills.some((s) => s.name === name)) cur.skills.push({ name, phase });
    }
  }
  return bosses;
}

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
  const p = path.join(dir, d.id + ".txt");
  const base = { file: f, id: d.id, type: d.type, cn: d.name.cn, cards: d.bosses.length, mechanics: d.bosses.reduce((s, b) => s + b.mechanics.length, 0) };
  if (!fs.existsSync(p)) { report.push({ ...base, huiji: null }); continue; }
  const hb = parseHuiji(fs.readFileSync(p, "utf8"));
  const text = JSON.stringify(d.bosses).replace(/[／\/、＋+ ]/g, "");
  const skills = hb.flatMap((b) => b.skills.map((s) => ({ ...s, boss: b.name })));
  const missing = skills.filter((s) => !text.includes(s.name));
  report.push({ ...base, huiji: hb.map((b) => b.name), skills: skills.length, missing: missing.map((s) => `${s.name}@${s.boss}${s.phase ? "・" + s.phase : ""}`) });
}

if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify(report, null, 1));
const byFile = {};
for (const r of report) {
  const s = (byFile[r.file] ??= { duties: 0, cards: 0, hbosses: 0, skills: 0, missing: 0, nopage: 0 });
  s.duties++; s.cards += r.cards;
  if (r.huiji) { s.hbosses += r.huiji.length; s.skills += r.skills; s.missing += r.missing.length; } else s.nopage++;
}
console.log("檔案".padEnd(22), "副本", "王卡片", "灰機王數", "灰機技能", "沒寫到");
for (const [f, s] of Object.entries(byFile)) console.log(f.padEnd(24), String(s.duties).padStart(3), String(s.cards).padStart(6), String(s.hbosses).padStart(7), String(s.skills).padStart(8), String(s.missing).padStart(6));
const tot = report.filter((r) => r.huiji);
console.log(`\n合計：${report.length} 場；王卡片 ${report.reduce((s, r) => s + r.cards, 0)}／灰機王 ${tot.reduce((s, r) => s + r.huiji.length, 0)}；灰機技能 ${tot.reduce((s, r) => s + r.skills, 0)}，沒寫到 ${tot.reduce((s, r) => s + r.missing.length, 0)}。`);
if (onlyFile || onlyId) for (const r of report) {
  if (!r.huiji) { console.log(`\n## ${r.id} ${r.cn}：沒有灰機文字`); continue; }
  console.log(`\n## ${r.id} ${r.cn}｜王卡片 ${r.cards}／灰機王 ${r.huiji.length}（${r.huiji.join("、")}）｜條目 ${r.mechanics}／灰機技能 ${r.skills}`);
  console.log("沒寫到：" + (r.missing.join("；") || "無"));
}
