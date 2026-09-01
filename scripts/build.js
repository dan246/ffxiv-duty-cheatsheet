#!/usr/bin/env node
/* 把 index.html + css + js + data/*.js 打包成單一 HTML 檔（離線可用、可丟手機）
 *   node scripts/build.js            → dist/ff14-cheatsheet.html
 *   node scripts/build.js out.html   → 指定輸出路徑
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read("data/manifest.js"), ctx);
const files = ctx.window.FF14_MANIFEST.filter((f) => fs.existsSync(path.join(ROOT, "data", f)));

let html = read("index.html");
html = html.replace(/<link rel="stylesheet" href="css\/style.css">/, () => `<style>\n${read("css/style.css")}\n</style>`);
const dataJs = files.map((f) => `/* ---- ${f} ---- */\n${read("data/" + f)}`).join("\n");
const appJs = read("js/app.js").replace(
  "loadData(window.FF14_MANIFEST || [])",
  "Promise.resolve()"  // 單檔版：資料已內嵌，不需動態載入
);
html = html.replace(
  /<script src="data\/manifest.js"><\/script>\s*<script src="js\/app.js"><\/script>/,
  () => `<script>\n${dataJs}\n</script>\n<script>\n${appJs}\n</script>`
);
if (/<\/script/i.test(dataJs + appJs)) throw new Error("內嵌內容含有 </script>，請改寫");

// --artifact：輸出不含 doctype/html/head/body 外殼的片段（給 claude.ai Artifact 用）
const args = process.argv.slice(2);
if (args.includes("--artifact")) {
  const title = (html.match(/<title>[\s\S]*?<\/title>/) || [""])[0];
  const style = (html.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
  const body = (html.match(/<body>([\s\S]*?)<\/body>/) || ["", ""])[1];
  html = `${title}\n${style}\n${body}`;
}
const outArg = args.find((a) => !a.startsWith("--"));
const out = outArg ? path.resolve(outArg) : path.join(ROOT, "dist", "ff14-cheatsheet.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`✓ 已輸出 ${path.relative(process.cwd(), out)}（${(html.length / 1024).toFixed(0)} KB，含 ${files.length} 個資料檔）`);
