#!/usr/bin/env node
/* 匯出所有副本資料中的字串，供繁體顯示表生成器使用。 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data/manifest.js"), "utf8"), ctx);
for (const file of ctx.window.FF14_MANIFEST || []) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data", file), "utf8"), ctx, { filename: file });
}

const strings = new Set();
function visit(value) {
  if (typeof value === "string") strings.add(value);
  else if (Array.isArray(value)) value.forEach(visit);
  else if (value && typeof value === "object") Object.values(value).forEach(visit);
}
visit(ctx.window.FF14_DATA || []);
process.stdout.write(JSON.stringify([...strings]));
