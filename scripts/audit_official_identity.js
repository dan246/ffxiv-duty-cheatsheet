#!/usr/bin/env node
/* Compares every project duty with the official ContentFinderCondition snapshot.
 * Exact official English/CN duty names are used only to locate a CFC row; once
 * located, identity and uniqueness are based on the numeric row id.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "audit_official_catalog.json"), "utf8"));
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), ctx);
for (const file of ctx.window.FF14_MANIFEST) {
  const full = path.join(ROOT, "data", file);
  if (fs.existsSync(full)) vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: full });
}

const norm = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s:：'’\-–—()（）・·]/g, "");
const byEn = new Map();
const byCn = new Map();
for (const entry of catalog.entries) {
  const en = norm(entry.en), cn = norm(entry.cn);
  if (en) (byEn.get(en) || byEn.set(en, []).get(en)).push(entry);
  if (cn) (byCn.get(cn) || byCn.set(cn, []).get(cn)).push(entry);
}

const report = { exact: [], ambiguous: [], unmatched: [], identityErrors: [] };
const allowedProjectTypes = {
  "Dungeons": new Set(["dungeon"]),
  "Trials": new Set(["trial", "extreme"]),
  "Raids": new Set(["raid", "savage", "alliance"]),
  "Ultimate Raids": new Set(["ultimate"]),
  "Chaotic Alliance Raid": new Set(["chaotic"]),
};
for (const duty of ctx.window.FF14_DATA) {
  const declaredCfc = /^cfc:(\d+)$/.exec(duty.identity?.officialKey || "");
  let candidates = declaredCfc ? catalog.entries.filter((entry) => entry.cfcId === Number(declaredCfc[1])) : (byEn.get(norm(duty.name?.en)) || []);
  if (candidates.length !== 1) {
    const cnCandidates = byCn.get(norm(duty.name?.cn)) || [];
    if (cnCandidates.length) candidates = cnCandidates;
  }
  if (candidates.length === 1) {
    const official = candidates[0];
    report.exact.push({ id: duty.id, cfcId: official.cfcId, projectCn: duty.name.cn, officialCn: official.cn, projectEn: duty.name.en, officialEn: official.en, contentType: official.contentType, partySize: official.partySize });
    if (duty.identity?.officialKey !== `cfc:${official.cfcId}`) {
      report.identityErrors.push({ id: duty.id, declared: duty.identity.officialKey, expected: `cfc:${official.cfcId}` });
    }
    if (norm(duty.name?.en) !== norm(official.en) || (official.cn && norm(duty.name?.cn) !== norm(official.cn))) {
      report.identityErrors.push({ id: duty.id, declared: duty.identity?.officialKey, projectCn: duty.name?.cn, officialCn: official.cn, projectEn: duty.name?.en, officialEn: official.en });
    }
    if (duty.identity?.partySize !== official.partySize) report.identityErrors.push({ id: duty.id, field: "partySize", project: duty.identity?.partySize, official: official.partySize });
    if (duty.level !== official.level) report.identityErrors.push({ id: duty.id, field: "level", project: duty.level, official: official.level });
    if (Number(duty.ilvl || 0) !== Number(official.itemLevel || 0)) report.identityErrors.push({ id: duty.id, field: "itemLevel", project: duty.ilvl || 0, official: official.itemLevel || 0 });
    if (duty.ilvlSync != null && Number(duty.ilvlSync) !== Number(official.itemLevelSync || 0)) report.identityErrors.push({ id: duty.id, field: "itemLevelSync", project: duty.ilvlSync, official: official.itemLevelSync || 0 });
    if (allowedProjectTypes[official.contentType] && !allowedProjectTypes[official.contentType].has(duty.type)) {
      report.identityErrors.push({ id: duty.id, field: "type", project: duty.type, official: official.contentType });
    }
  } else if (candidates.length > 1) report.ambiguous.push({ id: duty.id, cn: duty.name.cn, en: duty.name.en, candidates: candidates.map((e) => e.cfcId) });
  else report.unmatched.push({ id: duty.id, cn: duty.name.cn, en: duty.name.en });
}

const out = path.join(ROOT, "audit_official_identity.json");
fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
console.log(`exact=${report.exact.length} ambiguous=${report.ambiguous.length} unmatched=${report.unmatched.length} identityErrors=${report.identityErrors.length}`);
if (report.ambiguous.length || report.unmatched.length || report.identityErrors.length) process.exitCode = 1;
