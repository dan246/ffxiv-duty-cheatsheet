#!/usr/bin/env node
/* Fetches the game ContentFinderCondition sheet from two independent mirrors:
 * - CN client CSV: official Simplified Chinese duty name and row id
 * - XIVAPI v2: global English name, content type and party composition
 * Output is a reviewable snapshot; duty identity is the numeric CFC row id,
 * never a boss-name or fuzzy-keyword match.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "audit_official_catalog.json");
const CN_URL = "https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-cn/master/ContentFinderCondition.csv";
const GLOBAL_URL = "https://v2.xivapi.com/api/sheet/ContentFinderCondition";
const GLOBAL_FIELDS = "Name,ContentType,ContentMemberType,ClassJobLevelRequired,ItemLevelRequired,ItemLevelSync";

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ""; }
    else if (c === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  const cnResponse = await fetch(CN_URL);
  if (!cnResponse.ok) throw new Error(`CN CFC fetch failed: ${cnResponse.status}`);
  const cnText = await cnResponse.text();
  const globalRows = [];
  let after = null;
  for (;;) {
    const url = `${GLOBAL_URL}?limit=500${after == null ? "" : `&after=${after}`}&fields=${encodeURIComponent(GLOBAL_FIELDS)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Global CFC fetch failed: ${response.status}`);
    const page = await response.json();
    if (!page.rows?.length) break;
    globalRows.push(...page.rows);
    const next = page.rows.at(-1).row_id;
    if ((after != null && next <= after) || page.rows.length < 500) break;
    after = next;
  }

  const csv = parseCsv(cnText.replace(/^\uFEFF/, ""));
  const headings = csv[1];
  const nameColumn = headings.indexOf("Name");
  if (nameColumn < 0) throw new Error("CN CFC Name column not found");
  const cnNames = new Map(csv.slice(3).map((r) => [Number(r[0]), r[nameColumn] || ""]));

  const entries = globalRows
    .filter((r) => r.fields?.Name)
    .map((r) => {
      const member = r.fields.ContentMemberType?.fields || {};
      const partySize = Number(member.MembersPerParty || 0) * Number(member.PartyCount || 1);
      return {
        cfcId: r.row_id,
        cn: cnNames.get(r.row_id) || "",
        en: r.fields.Name,
        contentType: r.fields.ContentType?.fields?.Name || "",
        partySize,
        level: r.fields.ClassJobLevelRequired || 0,
        itemLevel: r.fields.ItemLevelRequired || 0,
        itemLevelSync: r.fields.ItemLevelSync || 0,
      };
    });

  fs.writeFileSync(OUT, JSON.stringify({
    generatedAt: new Date().toISOString(),
    sources: { cn: CN_URL, global: `${GLOBAL_URL}?fields=${GLOBAL_FIELDS}` },
    entries,
  }, null, 2) + "\n");
  console.log(`✓ official catalog: ${entries.length} named CFC rows → ${path.relative(ROOT, OUT)}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
