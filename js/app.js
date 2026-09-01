/* FF14 副本小抄 — 單頁 App，無 build、無框架 */
(function () {
  "use strict";

  const TYPES = [
    ["all", "全部"],
    ["dungeon", "迷宮"],
    ["trial", "討伐"],
    ["extreme", "極"],
    ["raid", "大型"],
    ["savage", "零式"],
    ["alliance", "24人"],
    ["chaotic", "滅聯盟"],
    ["ultimate", "絕"],
  ];
  const TYPE_LABEL = Object.fromEntries(TYPES);
  const EXPS = [
    ["all", "全部"],
    ["arr", "2.x 新生"],
    ["hw", "3.x 蒼天"],
    ["sb", "4.x 紅蓮"],
    ["shb", "5.x 暗影"],
    ["ew", "6.x 曉月"],
    ["dt", "7.x 黃金"],
  ];
  const EXP_LABEL = Object.fromEntries(EXPS);
  const EXP_ORDER = { arr: 0, hw: 1, sb: 2, shb: 3, ew: 4, dt: 5 };
  const TYPE_ORDER = { dungeon: 0, trial: 1, extreme: 2, raid: 3, savage: 4, alliance: 5, chaotic: 6, ultimate: 7, other: 8 };

  const $ = (s) => document.querySelector(s);
  const els = {
    search: $("#searchInput"), clear: $("#clearBtn"),
    typeChips: $("#typeChips"), expChips: $("#expChips"),
    list: $("#list"), content: $("#content"),
    sidebar: $("#sidebar"), backdrop: $("#backdrop"), menuBtn: $("#menuBtn"),
    compactBtn: $("#compactBtn"), fontPlus: $("#fontPlus"), fontMinus: $("#fontMinus"),
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem("ff14." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("ff14." + k, JSON.stringify(v)); } catch { } },
  };
  const toTW = (value) => {
    const text = String(value ?? "");
    return window.FF14_ZH_TW?.[text] || text;
  };
  const LOCALIZE_SKIP_KEYS = new Set(["id", "en", "url", "sourceUrl", "diagramUrl", "officialKey", "aliases"]);
  function localizeInPlace(value) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "string") value[i] = toTW(value[i]);
        else localizeInPlace(value[i]);
      }
    } else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (LOCALIZE_SKIP_KEYS.has(key)) continue;
        if (typeof child === "string") value[key] = toTW(child);
        else localizeInPlace(child);
      }
    }
    return value;
  }
  async function copyText(value) {
    try {
      if (navigator.clipboard?.writeText) return await navigator.clipboard.writeText(value);
    } catch { /* file:// 可能沒有 Clipboard API，改用舊式複製 */ }
    const ta = document.createElement("textarea");
    ta.value = value; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
  }

  const state = {
    data: [], byId: new Map(),
    q: "", type: store.get("type", "all"), exp: store.get("exp", "all"),
    favs: new Set(store.get("favs", [])),
    recent: store.get("recent", []),
    current: null,
    compact: store.get("compact", false),
    fs: store.get("fs", 15),
    dmin: store.get("dmin", 0),     // 機制篩選：最低危險度 0=全部 2=要處理 3=會死
    role: store.get("role", "all"), // 機制篩選：職能 all/T/H/D
    echoOpen: new Set(),            // 本次開著的 /echo 面板（不存）
  };

  /* ---------- 載入資料檔 ---------- */
  async function loadData(files) {
    const loaded = [];
    for (const f of files) loaded.push(await new Promise((res) => {
      const s = document.createElement("script");
      s.src = "data/" + f;
      s.onload = () => res(true);
      s.onerror = () => { console.warn("[資料檔未載入]", f); res(false); };
      document.head.appendChild(s);
    }));
    return loaded;
  }

  /* ---------- 搜尋 ---------- */
  function norm(s) { return String(s || "").toLowerCase().replace(/[\s\-_'’.:：·・()（）【】\[\]]/g, ""); }
  function buildIndex(d) {
    const parts = [d.name.cn, d.name.tw, d.name.en, ...(d.aliases || []), ...(d.strategies || []).map((s) => s.name)];
    d._names = parts.filter(Boolean).flatMap((value) => [value, toTW(value)]).map(norm);
    d._bossNames = (d.bosses || []).flatMap((b) => [b.name.cn, toTW(b.name.cn), b.name.en]).filter(Boolean).map(norm);
    d._text = [...d._names, ...d._bossNames].join(" ");
  }
  function score(d, q) {
    if (!q) return 1;
    let best = 0;
    for (const n of d._names) {
      if (n === q) return 100;
      if (n.startsWith(q)) best = Math.max(best, 80);
      else if (n.includes(q)) best = Math.max(best, 60);
    }
    for (const n of d._bossNames) if (n.includes(q)) best = Math.max(best, 40);
    if (!best && d._text.includes(q)) best = 20;
    return best;
  }
  function filtered() {
    const q = norm(state.q);
    return state.data
      .filter((d) => (state.type === "all" || d.type === state.type) && (state.exp === "all" || d.expansion === state.exp))
      .map((d) => ({ d, s: score(d, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => q ? (b.s - a.s || cmp(a.d, b.d)) : cmp(a.d, b.d))
      .map((x) => x.d);
  }
  function cmp(a, b) {
    return (EXP_ORDER[a.expansion] - EXP_ORDER[b.expansion])
      || (TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
      || (parseFloat(a.patch) - parseFloat(b.patch))
      || (a.level - b.level)
      || toTW(a.name.cn).localeCompare(toTW(b.name.cn), "zh-Hant");
  }

  /* ---------- 渲染：側欄 ---------- */
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (v != null) e.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) if (k != null) e.append(k.nodeType ? k : document.createTextNode(String(k)));
    return e;
  }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function fmt(s) {
    // 支援 **粗體** 與換行
    return esc(toTW(s)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  }

  /* ---------- 機制篩選 ---------- */
  const DANGERS = [[0, "全部機制"], [2, "要處理 ≥2"], [3, "只看會死 ★3"]];
  const ROLES = [["all", "全職能"], ["T", "T"], ["H", "H"], ["D", "D"]];
  function mechVisible(m) {
    const danger = m.danger ?? 2;
    const role = m.role || "all";
    return danger >= state.dmin && (state.role === "all" || role === "all" || role === state.role);
  }
  function filterLabel() {
    const parts = [];
    if (state.dmin) parts.push(state.dmin === 3 ? "只看會死" : "危險度 ≥2");
    if (state.role !== "all") parts.push("職能 " + state.role);
    return parts.join("、");
  }

  /* ---------- /echo 巨集（遊戲規格：每顆 15 行；每行保守 60 字，CJK 以 3 bytes 計也在 180 內） ---------- */
  const MACRO_LINES = 15, MACRO_LINE_MAX = 60;
  function plain(s) { return toTW(s).replace(/\*\*/g, "").replace(/\s*\n\s*/g, " ").trim(); }
  function clip(s, max) {
    s = plain(s);
    if ([...s].length <= max) return s;
    const noParen = s.replace(/[（(][^（）()]*[）)]/g, "").replace(/\s{2,}/g, " ").trim();
    if (noParen && [...noParen].length <= max) return noParen;
    const chars = [...s].slice(0, max);
    let cut = -1;
    for (let i = chars.length - 1; i > max * 0.5; i--) if ("。；;，,".includes(chars[i])) { cut = i; break; }
    return (cut > 0 ? chars.slice(0, cut) : chars.slice(0, max - 1)).join("") + "…";
  }
  function echoLine(prefix, body) {
    const head = "/echo " + prefix;
    return head + clip(body, MACRO_LINE_MAX - [...head].length);
  }
  function mechLine(m) {
    const mark = m.danger === 3 ? "★" : m.danger === 1 ? "·" : "◆";
    const role = m.role && m.role !== "all" ? `[${m.role}]` : "";
    const phase = m.phase ? `(${clip(m.phase, 10)})` : "";
    return echoLine(`${mark}${role} `, `${plain(m.name.cn)}${phase} → ${m.solve}`);
  }
  function buildEcho(bosses, title) {
    const lines = [];
    for (const b of bosses) {
      lines.push(echoLine("■ ", plain(b.name.cn) + (b.summary ? "：" + plain(b.summary) : "")));
      for (const m of (b.mechanics || []).filter(mechVisible)) lines.push(mechLine(m));
    }
    if (lines.length <= MACRO_LINES) return [lines];
    const per = MACRO_LINES - 1; // 每顆留 1 行給「(1/2)」標頭
    const n = Math.ceil(lines.length / per);
    return Array.from({ length: n }, (_, i) =>
      [`/echo ── ${clip(title, 40)} (${i + 1}/${n}) ──`, ...lines.slice(i * per, (i + 1) * per)]);
  }
  async function copyWithFeedback(btn, text) {
    await copyText(text);
    const t = btn.textContent; btn.textContent = "已複製 ✓"; btn.disabled = true;
    setTimeout(() => { btn.textContent = t; btn.disabled = false; }, 1500);
  }
  function echoPanel(key, bosses, title, summaryText) {
    const chunks = buildEcho(bosses, title);
    const total = chunks.reduce((a, c) => a + c.length, 0);
    const fl = filterLabel();
    return h("details", { class: "echo", open: state.echoOpen.has(key) ? "" : null,
      ontoggle: (e) => { if (e.target.open) state.echoOpen.add(key); else state.echoOpen.delete(key); } },
      h("summary", null, summaryText, h("span", { class: "cnt" }, chunks.length > 1 ? `${total} 行 → ${chunks.length} 顆` : `${total} 行`)),
      h("div", { class: "echo-panel" },
        h("p", { class: "echo-help" },
          chunks.length > 1 ? `共 ${total} 行，超過遊戲每顆 15 行上限，已拆成 ${chunks.length} 顆。` : `${total} 行（每顆上限 15）。`,
          fl ? ` 已套用篩選：${fl}。` : " 用上方「要處理 / 只看會死」與職能篩選可以減少行數。",
          " 貼法：遊戲內 系統 → 使用者巨集 → 選一格 → 在內容欄貼上 → 拖到熱鍵列；開王前按一下，內容只有你自己看得到。",
          " 建議另開一個只勾「回聲」的聊天分頁並拖出成獨立視窗，就不會被戰鬥訊息洗掉。"),
        chunks.map((lines, i) => h("div", { class: "macro" },
          h("div", { class: "macro-head" },
            h("strong", null, chunks.length > 1 ? `巨集 ${i + 1}/${chunks.length}` : "巨集", h("span", { class: "cnt" }, ` ${lines.length} 行`)),
            h("button", { onclick: (e) => copyWithFeedback(e.currentTarget, lines.join("\n")) }, "複製")),
          h("pre", null, lines.join("\n")),
        )),
      ),
    );
  }
  function rerenderDuty() {
    if (!state.current) return;
    const y = window.scrollY;
    renderDuty(state.current, { keepScroll: true });
    window.scrollTo(0, y);
  }

  function renderChips() {
    els.typeChips.replaceChildren(...TYPES.map(([k, l]) =>
      h("button", { class: "chip" + (state.type === k ? " on" : ""), onclick: () => { state.type = k; store.set("type", k); renderChips(); renderList(); } }, l)));
    els.expChips.replaceChildren(...EXPS.map(([k, l]) =>
      h("button", { class: "chip" + (state.exp === k ? " on" : ""), onclick: () => { state.exp = k; store.set("exp", k); renderChips(); renderList(); } }, l)));
  }

  function renderList() {
    const items = filtered();
    const frag = document.createDocumentFragment();
    if (!items.length) {
      frag.append(h("div", { class: "list-empty" }, state.data.length ? "找不到符合的副本" : "尚無資料，請確認 data/ 目錄"));
    } else {
      let lastGroup = null;
      for (const d of items) {
        const g = state.q ? null : d.expansion + "|" + d.type;
        if (g && g !== lastGroup) {
          frag.append(h("div", { class: "list-group" }, `${EXP_LABEL[d.expansion] || d.expansion} · ${TYPE_LABEL[d.type] || d.type}`));
          lastGroup = g;
        }
        frag.append(h("button", {
          class: "list-item" + (state.current && state.current.id === d.id ? " active" : ""),
          "data-id": d.id,
          onclick: () => { location.hash = "#/" + d.id; closeSidebar(); },
        },
          h("span", { class: "lv" }, "Lv" + d.level),
          h("span", { class: "nm" }, toTW(d.name.cn), h("small", null, d.name.en)),
          state.favs.has(d.id) ? h("span", { class: "fav" }, "★") : null,
          state.q ? h("span", { class: "badge t-" + d.type }, TYPE_LABEL[d.type] || d.type) : null,
        ));
      }
    }
    els.list.replaceChildren(frag);
    const act = els.list.querySelector(".list-item.active");
    if (act) act.scrollIntoView({ block: "nearest" });
  }

  /* ---------- 渲染：內容 ---------- */
  function renderHome() {
    const link = (d) => h("a", { href: "#/" + d.id }, toTW(d.name.cn), h("small", null, `Lv${d.level} ${d.name.en}`));
    const favs = [...state.favs].map((id) => state.byId.get(id)).filter(Boolean).sort(cmp);
    const recent = state.recent.map((id) => state.byId.get(id)).filter(Boolean);
    const counts = {};
    for (const d of state.data) counts[d.type] = (counts[d.type] || 0) + 1;
    els.content.replaceChildren(
      h("div", { class: "home" },
        h("h1", null, "FF14 副本小抄"),
        h("p", null, "進本前打副本名稱搜尋（中文、陸服名、英文、Boss 名都可以），機制怎麼解、要往哪跑，一頁看完。"),
        h("p", null, h("kbd", null, "/"), " 聚焦搜尋 　", h("kbd", null, "Esc"), " 清除 　", h("kbd", null, "Enter"), " 開啟第一個結果 　「精簡」只留機制名＋解法"),
        h("p", null, "想在遊戲裡看：副本頁每隻 Boss 都有「/echo 巨集」，複製後貼進遊戲的使用者巨集，開王前按一下就會印在自己的聊天欄（只有你看得到）。搭配「只看會死」篩選可以把行數壓進 15 行內。"),
        h("div", { class: "cols" },
          h("div", null, h("h3", null, "★ 我的收藏"), h("div", { class: "linklist" }, favs.length ? favs.map(link) : h("span", { style: "color:var(--fg3)" }, "在副本頁按 ☆ 收藏"))),
          h("div", null, h("h3", null, "最近查看"), h("div", { class: "linklist" }, recent.length ? recent.map(link) : h("span", { style: "color:var(--fg3)" }, "—"))),
        ),
        h("div", { class: "stat" }, `目前收錄 ${state.data.length} 場：` +
          Object.entries(counts).sort((a, b) => TYPE_ORDER[a[0]] - TYPE_ORDER[b[0]]).map(([t, n]) => `${TYPE_LABEL[t] || t} ${n}`).join("、")),
      )
    );
    document.title = "FF14 副本小抄";
  }

  function renderDuty(d, opts = {}) {
    const isFav = state.favs.has(d.id);
    const filterChip = (list, cur, key) => list.map(([k, l]) =>
      h("button", { class: "chip" + (cur === k ? " on" : ""), onclick: () => { state[key] = k; store.set(key, k); rerenderDuty(); } }, l));
    const bossId = (i) => "boss-" + (i + 1);
    els.content.replaceChildren(h("div", { class: "duty" },
      h("div", { class: "duty-head" },
        h("div", { class: "meta" },
          h("span", { class: "badge t-" + d.type }, TYPE_LABEL[d.type] || d.type),
          h("span", null, EXP_LABEL[d.expansion] || d.expansion),
          h("span", null, "Patch " + d.patch),
          h("span", null, "Lv " + d.level
            + (d.ilvl ? ` · 最低 IL ${d.ilvl}` : "")
            + (d.ilvlSync ? ` · 同步 IL ${d.ilvlSync}` : "")),
        ),
        h("h1", null,
          toTW(d.name.cn),
          h("span", { class: "en" }, d.name.en),
          h("button", { class: "iconbtn favbtn" + (isFav ? " on" : ""), title: "收藏", onclick: () => toggleFav(d.id) }, isFav ? "★" : "☆"),
        ),
      ),
      h("div", { class: "overview", html: fmt(d.overview) }),
      d.route ? h("details", { class: "route", open: "" }, h("summary", null, "道中 / 路線提示"), h("div", { class: "body", html: fmt(d.route) })) : null,
      d.sources && d.sources.length ? h("div", { class: "sources" },
        h("strong", null, "攻略基準："),
        d.sources.map((s, i) => [i ? "、" : "", h("a", { href: s.url, target: "_blank", rel: "noopener noreferrer" }, toTW(s.label))]),
      ) : null,
      d.strategies && d.strategies.length ? h("section", { class: "strategies" },
        h("h2", null, "主流打法／宏／站位"),
        d.strategies.map((s) => h("details", { class: "strategy", open: !!s.primary },
          h("summary", null, toTW(s.name), s.primary ? h("span", { class: "primary" }, "陸服野隊主流") : null),
          s.summary ? h("p", { html: fmt(s.summary) }) : null,
          s.positions ? h("pre", { class: "positions" }, toTW(s.positions)) : null,
          s.positionsStatus ? h("p", { class: "macro-status" }, toTW(s.positionsStatus)) : null,
          s.macroStatus ? h("p", { class: "macro-status" }, toTW(s.macroStatus)) : null,
          s.macro ? h("div", { class: "macro" },
            h("div", { class: "macro-head" }, h("strong", null, "可複製隊伍宏"), h("button", { onclick: () => copyText(toTW(s.macro)) }, "複製")),
            h("pre", null, toTW(s.macro)),
          ) : null,
          h("div", { class: "strategy-links" },
            s.diagramUrl ? h("a", { href: s.diagramUrl, target: "_blank", rel: "noopener noreferrer" }, "站位圖／圖文") : null,
            s.source?.url ? h("a", { href: s.source.url, target: "_blank", rel: "noopener noreferrer" }, toTW(s.source.label || "原始攻略")) : null,
          ),
          s.diagramStatus ? h("p", { class: "macro-status" }, toTW(s.diagramStatus)) : null,
        )),
      ) : null,
      h("div", { class: "mech-filter" },
        h("span", { class: "lbl" }, "機制篩選"),
        h("div", { class: "chips" }, filterChip(DANGERS, state.dmin, "dmin")),
        h("div", { class: "chips" }, filterChip(ROLES, state.role, "role")),
      ),
      echoPanel(d.id, d.bosses, d.name.cn, "整本 /echo 巨集（進本前貼一次）"),
      d.bosses.length > 1 ? h("div", { class: "boss-nav" }, d.bosses.map((b, i) => h("a", { href: "#" + bossId(i), onclick: (e) => { e.preventDefault(); document.getElementById(bossId(i))?.scrollIntoView({ behavior: "smooth" }); } }, `${i + 1}. ${toTW(b.name.cn)}`))) : null,
      d.bosses.map((b, i) => h("section", { class: "boss", id: bossId(i) },
        h("div", { class: "boss-head" },
          h("span", { class: "num" }, "BOSS " + (i + 1)),
          h("h2", null, toTW(b.name.cn)),
          h("span", { class: "en" }, b.name.en),
        ),
        b.summary ? h("p", { class: "summary", html: fmt(b.summary) }) : null,
        echoPanel(d.id + "#" + i, [b], b.name.cn, "/echo 巨集"),
        (b.mechanics || []).filter(mechVisible).map((m) => h("div", { class: "mech d" + (m.danger || 0) },
          h("div", { class: "bar" }),
          h("div", null,
            h("div", { class: "mech-title" },
              toTW(m.name.cn),
              m.name.en ? h("span", { class: "en" }, m.name.en) : null,
              m.role && m.role !== "all" ? h("span", { class: "role " + m.role }, m.role) : null,
              m.phase ? h("span", { class: "phase" }, toTW(m.phase)) : null,
            ),
            m.desc ? h("div", { class: "desc", html: fmt(m.desc) }) : null,
            h("div", { class: "solve", html: fmt(m.solve) }),
          ),
        )),
        (() => { const n = (b.mechanics || []).filter((m) => !mechVisible(m)).length; return n ? h("div", { class: "hidden-note" }, `已依篩選隱藏 ${n} 個機制`) : null; })(),
        b.tips && b.tips.length ? h("ul", { class: "tips" }, b.tips.map((t) => h("li", { html: fmt(t) }))) : null,
      )),
      d.notes && d.notes.length ? h("div", { class: "notes" }, h("h3", null, "備註"), h("ul", null, d.notes.map((t) => h("li", { html: fmt(t) })))) : null,
    ));
    document.title = `${toTW(d.name.cn)} — FF14 副本小抄`;
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  function toggleFav(id) {
    if (state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
    store.set("favs", [...state.favs]);
    route();
    renderList();
  }
  function pushRecent(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 12);
    store.set("recent", state.recent);
  }

  /* ---------- 路由 ---------- */
  function route() {
    const m = location.hash.match(/^#\/([\w-]+)/);
    const d = m ? state.byId.get(m[1]) : null;
    state.current = d || null;
    if (d) { renderDuty(d); pushRecent(d.id); } else renderHome();
    els.list.querySelectorAll(".list-item").forEach((el) => el.classList.toggle("active", !!d && el.dataset.id === d.id));
    const act = els.list.querySelector(".list-item.active");
    if (act) act.scrollIntoView({ block: "nearest" });
  }

  /* ---------- UI 事件 ---------- */
  function openSidebar() { els.sidebar.classList.add("open"); els.backdrop.classList.add("show"); }
  function closeSidebar() { els.sidebar.classList.remove("open"); els.backdrop.classList.remove("show"); }
  els.menuBtn.addEventListener("click", () => els.sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
  els.backdrop.addEventListener("click", closeSidebar);

  els.search.addEventListener("input", () => {
    state.q = els.search.value;
    els.clear.hidden = !state.q;
    renderList();
    if (state.q && window.innerWidth <= 860) openSidebar();
  });
  els.search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = filtered()[0];
      if (first) { location.hash = "#/" + first.id; closeSidebar(); els.search.blur(); }
    } else if (e.key === "Escape") { clearSearch(); }
  });
  function clearSearch() { els.search.value = ""; state.q = ""; els.clear.hidden = true; renderList(); }
  els.clear.addEventListener("click", () => { clearSearch(); els.search.focus(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== els.search) { e.preventDefault(); els.search.focus(); els.search.select(); }
  });

  function applyPrefs() {
    document.body.classList.toggle("compact", state.compact);
    els.compactBtn.classList.toggle("on", state.compact);
    document.documentElement.style.setProperty("--fs", state.fs + "px");
  }
  els.compactBtn.addEventListener("click", () => { state.compact = !state.compact; store.set("compact", state.compact); applyPrefs(); });
  els.fontPlus.addEventListener("click", () => { state.fs = Math.min(24, state.fs + 1); store.set("fs", state.fs); applyPrefs(); });
  els.fontMinus.addEventListener("click", () => { state.fs = Math.max(12, state.fs - 1); store.set("fs", state.fs); applyPrefs(); });
  window.addEventListener("hashchange", route);

  /* ---------- 啟動 ---------- */
  applyPrefs();
  renderChips();
  els.content.replaceChildren(h("div", { class: "home" }, h("p", null, "載入資料中…")));
  loadData(window.FF14_MANIFEST || []).then(() => {
    const seen = new Set();
    for (const d of (window.FF14_DATA || [])) {
      if (!d || !d.id || !d.name || !d.bosses) { console.warn("[資料格式錯誤]", d); continue; }
      if (seen.has(d.id)) { console.warn("[重複 id]", d.id); continue; }
      seen.add(d.id);
      buildIndex(d);
      localizeInPlace(d);
      state.data.push(d);
      state.byId.set(d.id, d);
    }
    state.data.sort(cmp);
    renderList();
    route();
    if (window.innerWidth > 860) els.search.focus();
  });
})();
