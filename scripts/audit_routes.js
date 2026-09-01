#!/usr/bin/env node
/* 驗證每筆副本都能由自己的 hash id 唯一解析；不包含任何副本特例。 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const manifestContext = { window: {} };
vm.createContext(manifestContext);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), manifestContext);

const dataContext = { window: {} };
vm.createContext(dataContext);
for (const file of manifestContext.window.FF14_MANIFEST || []) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data", file), "utf8"), dataContext, { filename: file });
}

const duties = dataContext.window.FF14_DATA || [];
const byId = new Map();
const errors = [];
for (const duty of duties) {
  if (byId.has(duty.id)) errors.push(`duplicate id: ${duty.id}`);
  else byId.set(duty.id, duty);
}
for (const duty of duties) {
  const hash = `#/${duty.id}`;
  const match = hash.match(/^#\/([\w-]+)/);
  const resolved = match ? byId.get(match[1]) : null;
  if (resolved !== duty) errors.push(`unresolvable hash: ${hash}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`routes=${duties.length} unique=${byId.size} errors=0`);
