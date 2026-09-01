#!/usr/bin/env node
/* 驗證瀏覽器顯示轉換會涵蓋全部資料字串，同時不改寫 ID、英文名與 URL。 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
for (const file of ["data/manifest.js", "js/zh_tw_map.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx, { filename: file });
}
for (const file of ctx.window.FF14_MANIFEST || []) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data", file), "utf8"), ctx, { filename: file });
}

const mapping = ctx.window.FF14_ZH_TW || {};
const skip = new Set(["id", "en", "url", "sourceUrl", "diagramUrl", "officialKey", "aliases"]);
const preserved = [];
const errors = [];
function localize(value, trail = "") {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      value[index] = typeof value[index] === "string" ? (mapping[value[index]] || value[index]) : localize(value[index], `${trail}[${index}]`);
    }
    return value;
  }
  if (!value || typeof value !== "object") return value;
  for (const [key, child] of Object.entries(value)) {
    const at = trail ? `${trail}.${key}` : key;
    if (skip.has(key)) {
      if (typeof child === "string") preserved.push([at, child]);
      continue;
    }
    if (typeof child === "string") value[key] = mapping[child] || child;
    else localize(child, at);
  }
  return value;
}
function check(value, trail = "") {
  if (typeof value === "string") {
    if (mapping[value]) errors.push(`${trail}: 尚未轉換「${value.slice(0, 40)}」`);
  } else if (Array.isArray(value)) value.forEach((child, index) => check(child, `${trail}[${index}]`));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) if (!skip.has(key)) check(child, trail ? `${trail}.${key}` : key);
  }
}

const duties = ctx.window.FF14_DATA || [];
localize(duties);
check(duties);
for (const [trail, before] of preserved) {
  const parts = trail.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let current = duties;
  for (const part of parts) current = current?.[part];
  if (current !== before) errors.push(`${trail}: 不應改寫的識別／URL 欄位遭修改`);
}
if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log(`duties=${duties.length} convertedStrings=${Object.keys(mapping).length} displayErrors=0`);
