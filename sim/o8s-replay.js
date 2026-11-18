// O8S 走位回放：把 FFLogs 擊殺紀錄的位置資料畫成俯視動畫。
(function () {
  "use strict";
  const BUILD = "1118-15";
  const D = window.O8S_REPLAY;
  const $ = (id) => document.getElementById(id);
  $("build").textContent = "版本 " + BUILD;
  $("src").href = "https://www.fflogs.com/reports/" + D.code;

  const ZH = {
    "Aero Assault": "疼颼颼暴風", "All Things Ending": "消滅之腳", "Ave Maria": "聖母頌", "Blizzard Blitz": "滴溜溜冰封",
    "Blizzard III": "冰封", "Celestriad": "三星", "Explosion": "爆炸", "Fire III": "爆炎", "Flagrant Fire": "呼啦啦爆炎",
    "Forsaken": "遺棄末世", "Future's End": "未來終結", "Past's End": "過去終結", "Futures Numbered": "未來破滅",
    "Pasts Forgotten": "過去破滅", "Graven Image": "眾神之像", "Gravitas": "重力彈", "Gravitational Wave": "重力波",
    "Heartless Angel": "無心天使", "Heartless Archangel": "無心大天使", "Holy Ascent": "升天", "Hyperdrive": "超驅動",
    "Idyllic Will": "睡魔的神氣", "Indolent Will": "懶惰的神氣", "Indomitable Will": "強腕的神氣", "Indulgent Will": "聖母的神氣",
    "Inexorable Will": "無情的神氣", "Intemperate Will": "撲殺的神氣", "Light of Judgment": "制裁之光", "Mana Charge": "魔法儲存",
    "Mana Release": "魔法放出", "Meteor": "隕石", "Pulse Wave": "波動彈", "Shockwave": "衝擊波", "Starstrafe": "妖星亂舞",
    "The Path of Light": "光之波動", "The River of Light": "光之大波動", "Thrumming Thunder": "劈啪啪暴雷", "Thunder III": "暴雷",
    "Timely Teleport": "跳蹦蹦傳送", "Trine": "異三角", "Ultima": "究極", "Ultima Upsurge": "撲騰騰究極",
    "Ultimate Embrace": "終末雙腕", "Vitrophyre": "岩石彈", "Wave Cannon": "波動炮", "Wings of Destruction": "破壞之翼",
    "Prey": "獵物", "Confused": "混亂", "Sleep": "睡眠", "Heavy": "加重", "Damage Up": "傷害提高",
  };
  const SHOW_DEBUFF = new Set(["Prey", "Confused", "Sleep", "Heavy", "Damage Up"]);
  const zh = (n) => ZH[n] || n;
  const WHO = { B: "", S: "神像：", C: "分身：" };

  // 每段機制的起訖秒數（依這筆紀錄的讀條時間切）
  const CLIPS = [
    [
      ["開場：魔法儲存、呼啦啦爆炎、超驅動、魔法放出", 0, 37],
      ["劈啪啪暴雷＋撲騰騰究極", 37, 64],
      ["眾神之像①：神氣連發、傳送、制裁之光", 64, 104],
      ["暴雷／冰封＋眾神之像②衝擊波擊退", 103, 158],
      ["超驅動＋眾神之像③撲殺、暴風、制裁之光", 157, 212],
      ["爆炎＋眾神之像④重力波、暴雷、超驅動", 212, 280],
      ["眾神之像⑤聖母頌、睡魔／聖母神氣、制裁之光", 280, 331],
      ["暴雷／冰封＋眾神之像⑥懶惰的神氣（到擊殺）", 331, 393],
    ],
    [
      ["開場：無心天使、究極、超驅動、三星", 0, 48],
      ["遺棄末世①：踩塔、無心大天使、破壞之翼", 48, 104],
      ["制裁之光、異三角、破壞之翼", 104, 157],
      ["未來破滅、終末雙腕、超驅動", 156, 205],
      ["遺棄末世②＋妖星亂舞（踩塔、隕石、分身衝鋒）", 205, 250],
      ["三星、破壞之翼、異三角、過去破滅、終末雙腕", 254, 346],
      ["遺棄末世③：波動彈、睡魔／聖母、大天使、重力波", 346, 423],
      ["制裁之光、異三角×2、未來破滅、超驅動", 421, 533],
      ["遺棄末世④（到擊殺）", 533, 607],
    ],
  ];

  const COLORS = { MT: "#5b9dff", ST: "#5b9dff", H1: "#5fd08a", H2: "#5fd08a", D1: "#ff7a7a", D2: "#ff7a7a", D3: "#ff7a7a", D4: "#ff7a7a" };
  const cv = $("arena"), g = cv.getContext("2d");
  const W = cv.width, C = W / 2, R = 20, SC = (W / 2 - 70) / R; // 場地半徑 20 米
  const S = { fi: 0, clip: 0, t: 0, playing: false, speed: 1, me: -1 };
  let F, clipA = 0, clipB = 1, lastHitKey = "";

  function at(track, t10) {
    // track = [t,x,y, t,x,y, ...]，t 單位 0.1 秒，x y 單位 0.1 米
    const n = track.length / 3;
    if (!n) return null;
    if (t10 <= track[0]) return [track[1] / 10, track[2] / 10];
    if (t10 >= track[(n - 1) * 3]) return [track[(n - 1) * 3 + 1] / 10, track[(n - 1) * 3 + 2] / 10];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (track[m * 3] <= t10) lo = m; else hi = m; }
    const a = lo * 3, b = hi * 3, k = (t10 - track[a]) / (track[b] - track[a]);
    return [(track[a + 1] + (track[b + 1] - track[a + 1]) * k) / 10, (track[a + 2] + (track[b + 2] - track[a + 2]) * k) / 10];
  }
  const px = (p) => [C + p[0] * SC, C + p[1] * SC];
  const fmt = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

  function setFight(i) {
    S.fi = i; F = D.fights[i]; if (!F.marks) { F.actors = F.actors.filter((a) => a[1] === "H"); addKnockbacks(F); buildMarks(F); buildWings(F); }
    $("tab0").classList.toggle("on", i === 0); $("tab1").classList.toggle("on", i === 1);
    const box = $("clips"); box.textContent = "";
    CLIPS[i].forEach((c, k) => {
      const b = document.createElement("button"); b.type = "button";
      const sp = document.createElement("span"); sp.textContent = fmt(c[1]);
      b.append(sp, document.createTextNode(c[0]));
      b.onclick = () => { setClip(k); S.playing = true; sync(); };
      box.append(b);
    });
    const all = document.createElement("button"); all.type = "button";
    const sp = document.createElement("span"); sp.textContent = "整場";
    all.append(sp, document.createTextNode("從頭播到尾"));
    all.onclick = () => { setClip(-1); S.playing = true; sync(); };
    box.append(all);
    setClip(0);
  }

  function setClip(k) {
    S.clip = k;
    if (k < 0) { clipA = 0; clipB = F.len / 10; } else { clipA = CLIPS[S.fi][k][1]; clipB = Math.min(CLIPS[S.fi][k][2], F.len / 10); }
    S.t = clipA;
    [...$("clips").children].forEach((b, i) => b.classList.toggle("on", k < 0 ? i === CLIPS[S.fi].length : i === k));
    const ul = $("casts"); ul.textContent = "";
    for (const c of F.casts) {
      const t = c[0] / 10;
      if (t < clipA - 0.5 || t > clipB || c[2].startsWith("Unknown")) continue;
      const li = document.createElement("li"); li.dataset.t = t; li.dataset.e = t + c[1] / 10;
      const sp = document.createElement("span"); sp.textContent = fmt(t);
      li.append(sp, document.createTextNode(WHO[c[3]] + zh(c[2])));
      li.onclick = () => { S.t = Math.max(clipA, t - 1); draw(); };
      ul.append(li);
    }
    lastHitKey = "";
    sync();
  }

  function sync() { $("play").textContent = S.playing ? "⏸ 暫停" : "▶ 播放"; }

  function labelSpots(pts) {
    // 疊在一起時各職能往固定方向挪開；挪多少只看附近有多少人，連續變化所以不會跳動
    if (!$("spread").checked) return pts.map((p) => p && [p[0], p[1]]);
    const NEAR = 1.7 * SC, OFF = 1.05 * SC;
    return pts.map((p, i) => {
      if (!p) return null;
      let w = 0;
      pts.forEach((q, k) => { if (q && k !== i) w += Math.max(0, 1 - Math.hypot(q[0] - p[0], q[1] - p[1]) / NEAR); });
      const m = Math.min(1, w) * OFF, a = -1.5708 + i * 0.7854;
      return [p[0] + Math.cos(a) * m, p[1] + Math.sin(a) * m];
    });
  }

  // 各招的真實半徑（米），取自遊戲資料表 Action.EffectRange；[單人, 多人分攤]
  const RAD = {
    "Flagrant Fire": [5, 6], "Fire III": [5, 6], "Meteor": [5, 6], "Hyperdrive": [5, 5], "Inexorable Will": [6, 6], "Indomitable Will": [6, 6],
    "Gravitas": [5, 5], "Vitrophyre": [5, 5], "The Path of Light": [4, 4], "Wings of Destruction": [7, 7], "Futures Numbered": [5, 5],
    "Pasts Forgotten": [5, 5], "Ultimate Embrace": [5, 5], "Trine": [6, 6], "Timely Teleport": [6, 6], "Explosion": [5, 5],
  };
  // 資料表裡範圍是全場（100 米）的招，一律當全體傷害，不畫圈
  const WIDE = new Set(["Ultima", "Ultima Upsurge", "Forsaken", "Light of Judgment", "Heartless Angel", "Heartless Archangel", "Ave Maria", "Indolent Will", "Holy Ascent", "Aero Assault", "The River of Light", "Shockwave"]);
  // 擊退：紀錄上的命中時間是讀條結束，人實際被推開大約在 1～2.5 秒後。
  // 在命中後 4.5 秒內找「短時間位移超過 7 米」的那一跳，當作擊退瞬間，並讓它在 0.6 秒內完成。
  function addKnockbacks(F) {
    for (const h of F.hits) {
      if (!/^(Pulse Wave|Shockwave|Aero Assault)$/.test(h[2])) continue;
      const tr = F.tracks[h[1]]; h.k = null;
      h.imm = (F.immune || []).some((m) => m[1] === h[1] && h[0] - m[0] >= 0 && h[0] - m[0] <= 70);
      for (let i = 3; i < tr.length; i += 3) {
        if (tr[i] <= h[0]) continue;
        if (tr[i - 3] > h[0] + 45) break;
        const dt = tr[i] - tr[i - 3], d = Math.hypot(tr[i + 1] - tr[i - 2], tr[i + 2] - tr[i - 1]) / 10;
        if (d > 7 && dt <= 25) { h.k = tr[i]; if (dt > 7) tr.splice(i, 0, tr[i] - 6, tr[i - 2], tr[i - 1]); break; }
      }
    }
  }

  // 機制落點：把同一時間吃到同一招的人，依位置分群畫圈（由紀錄反推，不是遊戲內的範圍）
  function buildMarks(F) {
    const groups = new Map();
    const OWN = new Set(F.actors.map((a) => a[4]).concat(["Future's End", "Past's End", "Pulse Wave"]));
    for (const h of F.hits) { if (OWN.has(h[2])) continue; const k = Math.round(h[0] / 5) + "|" + h[2]; if (!groups.has(k)) groups.set(k, { t: h[0], n: h[2], who: [] }); const gr = groups.get(k); if (!gr.who.includes(h[1])) gr.who.push(h[1]); }
    const marks = [], wides = [];
    for (const gr of groups.values()) {
      const P = gr.who.map((i) => [i, at(F.tracks[i], gr.t)]).filter((x) => x[1]);
      const cl = [];
      for (const [i, p] of P) { const c = cl.find((c) => c.m.some((q) => Math.hypot(q[1][0] - p[0], q[1][1] - p[1]) < 4.5)); c ? c.m.push([i, p]) : cl.push({ m: [[i, p]] }); }
      if (WIDE.has(gr.n) || (!RAD[gr.n] && gr.who.length >= 7 && cl.length > 1)) { wides.push([gr.t, gr.n]); continue; }
      for (const c of cl) {
        const x = c.m.reduce((a, q) => a + q[1][0], 0) / c.m.length, y = c.m.reduce((a, q) => a + q[1][1], 0) / c.m.length;
        const known = RAD[gr.n], r = known ? known[c.m.length > 1 ? 1 : 0] : Math.max(2.2, ...c.m.map((q) => Math.hypot(q[1][0] - x, q[1][1] - y) + 1.4));
        marks.push({ t: gr.t, n: gr.n, x, y, r, k: c.m.length });
      }
    }
    F.marks = marks; F.wides = wides;
  }

  // 單翼破壞之翼：紀錄沒有哪邊翅膀亮，用「炸的那一刻大家站在王的哪一側」反推危險半場
  function buildWings(F) {
    F.wings = [];
    for (const c of F.casts) {
      if (c[2] !== "Wings of Destruction" || c[3] !== "B") continue;
      const hitT = c[0] + c[1];
      if (F.hits.some((h) => h[2] === c[2] && Math.abs(h[0] - hitT) < 20)) continue; // 有人吃到的是雙翼（最近最遠各一發）
      const b = at(F.bossTrack, hitT), m = at(F.tracks[0], c[0]); if (!b || !m) continue;
      // 分界線＝王的前後軸：先假設王面向 MT，再在 ±60° 內找讓最多人落在同一側的角度
      const base = Math.atan2(m[1] - b[1], m[0] - b[0]), P = F.tracks.map((tr) => at(tr, hitT));
      let best = null;
      for (let d = -60; d <= 60; d += 5) for (const sg of [1, -1]) {
        const a = base + d * 0.01745, fx = Math.cos(a), fy = Math.sin(a), off = P.map((p) => (fx * (p[1] - b[1]) - fy * (p[0] - b[0])) * sg);
        const ok = off.filter((v) => v > 0.3).length, score = ok * 100 + Math.min(...off) - Math.abs(d) / 30;
        if (!best || score > best.score) best = { score, ok, fx, fy, sg };
      }
      const { fx, fy, sg, ok } = best;
      F.wings.push({ t0: c[0], t1: hitT, b, f: [fx, fy], n: [fy * sg, -fx * sg], ok }); // n 指向危險側
    }
  }

  const WAYMARKS = [
    [["A", 0, -5.5, "#f87171"], ["B", 9.7, 0, "#facc15"], ["C", 0, 5.6, "#60a5fa"], ["D", -9.7, 0, "#c084fc"], ["1", 0, -18.8, "#f87171"], ["2", 0, 18.9, "#facc15"]],
    [["A", 0, -18.8, "#f87171"], ["B", 18.8, 0, "#facc15"], ["C", 0, 18.8, "#60a5fa"], ["D", -18.8, 0, "#c084fc"], ["1", -13.5, 12.7, "#f87171"], ["2", 13.6, 12.7, "#facc15"]],
  ];

  function draw() {
    const t = S.t, t10 = t * 10;
    const pts = F.tracks.map((tr) => { const p = at(tr, t10); return p && px(p); });
    g.clearRect(0, 0, W, W);
    // 場地
    g.fillStyle = "#101a33"; g.beginPath(); g.arc(C, C, R * SC, 0, 6.2832); g.fill();
    g.strokeStyle = "#3a4569"; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#1e2a4a"; g.lineWidth = 2;
    for (const r of [5, 10, 15]) { g.beginPath(); g.arc(C, C, r * SC, 0, 6.2832); g.stroke(); }
    g.beginPath(); g.moveTo(C - R * SC, C); g.lineTo(C + R * SC, C); g.moveTo(C, C - R * SC); g.lineTo(C, C + R * SC); g.stroke();
    g.fillStyle = "#76829a"; g.font = "600 30px 'Fira Sans',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("北", C, 34); g.fillText("南", C, W - 30); g.fillText("西", 30, C); g.fillText("東", W - 30, C);

    // 場標（萌神神攻略的擺法）
    if ($("marks").checked) for (const m of WAYMARKS[S.fi]) {
      const [x, y] = px([m[1], m[2]]), sq = /\d/.test(m[0]);
      g.globalAlpha = 0.85; g.strokeStyle = m[3]; g.lineWidth = 4; g.fillStyle = "rgba(2,6,23,.6)"; g.beginPath();
      sq ? g.rect(x - 24, y - 24, 48, 48) : g.arc(x, y, 26, 0, 6.2832); g.fill(); g.stroke();
      g.fillStyle = m[3]; g.font = "800 30px 'Fira Sans',sans-serif"; g.fillText(m[0], x, y + 2); g.globalAlpha = 1;
    }

    // 三星的預兆：形狀固定以王為中心，照讀條時間畫（大小取自萌神神圖解）
    if ($("mech").checked) for (const c of F.casts) {
      if (c[2] !== "Celestriad" || c[3] !== "B") continue;
      const dt = (t10 - c[0]) / 10; if (dt < 0 || dt > 8.7) continue;
      const bp0 = at(F.bossTrack, c[0]) || [0, 0], [x, y] = px(bp0), r = 10 * SC, hw = 5 * SC, far = 45 * SC;
      g.save(); g.beginPath(); g.arc(C, C, R * SC, 0, 6.2832); g.clip();
      g.font = "600 24px 'Fira Sans',sans-serif";
      if (dt <= 5.6) { const hit = dt >= 5; g.fillStyle = hit ? "rgba(251,146,60,.6)" : "rgba(251,146,60,.28)"; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); g.fillStyle = "#fed7aa"; g.fillText("圓形冰封 " + (hit ? "炸" : (5 - dt).toFixed(0)), x, y + r - 22); }
      if (dt <= 7.6) { const hit = dt >= 7; g.fillStyle = hit ? "rgba(250,204,21,.6)" : "rgba(250,204,21,.22)"; g.fillRect(x - far, y - hw, far * 2, hw * 2); g.fillRect(x - hw, y - far, hw * 2, far * 2); g.fillStyle = "#fde68a"; g.fillText("十字暴雷 " + (hit ? "炸" : (7 - dt).toFixed(0)), x - r - 3.5 * SC, y); }
      if (dt >= 2) { const hit = dt >= 8; g.fillStyle = hit ? "rgba(244,114,182,.6)" : "rgba(244,114,182,.2)"; g.beginPath(); g.arc(x, y, far, 0, 6.2832); g.arc(x, y, r, 0, 6.2832, true); g.fill(); g.fillStyle = "#fbcfe8"; g.fillText("環形冰封 " + (hit ? "炸" : (8 - dt).toFixed(0)), x + r * 0.95, y - r * 0.95); }
      g.restore();
    }

    if ($("mech").checked) for (const w of F.wings) {
      if (t10 < w.t0 || t10 > w.t1 + 6) continue;
      const hit = t10 >= w.t1, L = 60 * SC, [x, y] = px(w.b), [fx, fy] = w.f, [nx, ny] = w.n;
      g.save(); g.beginPath(); g.arc(C, C, R * SC, 0, 6.2832); g.clip();
      g.fillStyle = hit ? "rgba(248,113,113,.55)" : "rgba(248,113,113,.2)"; g.beginPath();
      g.moveTo(x - fx * L, y - fy * L); g.lineTo(x + fx * L, y + fy * L); g.lineTo(x + fx * L + nx * L, y + fy * L + ny * L); g.lineTo(x - fx * L + nx * L, y - fy * L + ny * L); g.closePath(); g.fill();
      g.fillStyle = "#fecaca"; g.font = "600 26px 'Fira Sans',sans-serif"; g.fillText("破壞之翼 " + (hit ? "炸" : ((w.t1 - t10) / 10).toFixed(0)), x + nx * 7 * SC, y + ny * 7 * SC);
      g.restore();
    }

    // 神像連線：之後會中混亂的人拉黃線、會中睡眠的人拉紫線，從北邊神像拉過來，讀條期間顯示
    if ($("mech").checked) {
      const seenT = new Set();
      for (const d of F.debuffs) {
        if (d[3] !== "Confused" && d[3] !== "Sleep") continue;
        const k = d[2] + d[3] + Math.round(d[0] / 20); if (seenT.has(k)) continue; seenT.add(k);
        if (t10 > d[0] + 3 || t10 < d[0] - 62 || !pts[d[2]]) continue;
        const conf = d[3] === "Confused", p = pts[d[2]];
        g.strokeStyle = conf ? "#facc15" : "#c084fc"; g.lineWidth = 5; g.globalAlpha = 0.85;
        g.beginPath(); g.moveTo(C, C - R * SC - 30); g.lineTo(p[0], p[1]); g.stroke(); g.globalAlpha = 1;
      }
    }

    // 波動彈：神像連線到四個人，讀條完把他們往南擊退（要被推進塔裡）
    if ($("mech").checked) for (const h of F.hits) {
      if (h[2] !== "Pulse Wave" || t10 > h[0] + 6 || t10 < h[0] - 50 || !pts[h[1]]) continue;
      const p = pts[h[1]], hit = t10 >= h[0];
      g.strokeStyle = "#7dd3fc"; g.lineWidth = hit ? 8 : 4; g.globalAlpha = 0.9;
      g.beginPath(); g.moveTo(C, C - R * SC - 30); g.lineTo(p[0], p[1]); g.stroke(); g.globalAlpha = 1;
      const txt = !hit ? "連線・擊退 " + ((h[0] - t10) / 10).toFixed(0) : h.k ? (t10 < h.k ? "要被推了" : "被推到這") : h.imm ? "開了防擊退，沒被推" : "沒被推";
      g.fillStyle = "#bae6fd"; g.font = "600 22px 'Fira Sans',sans-serif"; g.fillText(txt, p[0], p[1] - 40);
    }

    // 機制落點：命中前 4 秒開始出現（塔提早到 8 秒），命中後留 0.6 秒
    if ($("mech").checked) {
      for (const m of F.marks) {
        const tower = m.n === "The Path of Light", lead = tower ? 8 : 4;
        const dt = (m.t - t10) / 10; if (dt > lead || dt < -0.6) continue;
        const [x, y] = px([m.x, m.y]), hit = dt <= 0;
        g.fillStyle = tower ? (hit ? "rgba(250,204,21,.45)" : "rgba(250,204,21,.14)") : hit ? "rgba(251,146,60,.45)" : "rgba(251,146,60,.14)"; g.strokeStyle = tower ? "#facc15" : "#fb923c"; g.lineWidth = hit ? 6 : 3;
        g.setLineDash(hit ? [] : [14, 10]); g.beginPath(); g.arc(x, y, m.r * SC, 0, 6.2832); g.fill(); g.stroke(); g.setLineDash([]);
        if (!hit) { g.strokeStyle = tower ? "#fde68a" : "#fdba74"; g.lineWidth = 5; g.beginPath(); g.arc(x, y, m.r * SC, -1.5708, -1.5708 + 6.2832 * (1 - dt / lead)); g.stroke(); }
        g.fillStyle = "#fed7aa"; g.font = "600 24px 'Fira Sans',sans-serif"; g.fillText((tower ? "踩塔" : zh(m.n)) + (m.k > 1 ? " " + m.k + "人" : ""), x, y - m.r * SC - 16);
      }
      // 飛頭：紀錄裡有它們自己的位置
      const seen = new Set();
      for (const a of F.actors) {
        const dt = (a[0] - t10) / 10, lead = a[1] === "T" ? 7 : 4; if (dt > lead || dt < -0.6) continue;
        const [x, y] = px([a[2] / 10, a[3] / 10]), hit = dt <= 0, key = a[1] + a[2] + "," + a[3] + "," + Math.round(a[0] / 10);
        if (a[5] >= 0 && pts[a[5]] && a[1] !== "T") { g.strokeStyle = a[1] === "C" ? "#e879f9" : "#fca5a5"; g.lineWidth = hit ? 6 : 3; g.setLineDash(hit ? [] : [10, 8]); g.beginPath(); g.moveTo(x, y); g.lineTo(pts[a[5]][0], pts[a[5]][1]); g.stroke(); g.setLineDash([]); }
        if (seen.has(key)) continue; seen.add(key);
        if (a[1] === "T") {
          const big = a[4] === "The River of Light", r = (big ? 4.5 : 3) * SC;
          g.fillStyle = hit ? "rgba(250,204,21,.4)" : "rgba(250,204,21,.12)"; g.strokeStyle = "#facc15"; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); g.stroke();
          g.fillStyle = "#fde68a"; g.font = "600 24px 'Fira Sans',sans-serif"; g.fillText("塔", x, y - r - 16);
        } else {
          g.strokeStyle = "#f87171"; g.lineWidth = 3; g.setLineDash(hit ? [] : [12, 10]); g.fillStyle = hit ? "rgba(248,113,113,.4)" : "rgba(248,113,113,.1)"; g.beginPath(); g.arc(x, y, 5 * SC, 0, 6.2832); g.fill(); g.stroke(); g.setLineDash([]);
          g.fillStyle = a[1] === "C" ? "#e879f9" : "#f87171"; g.strokeStyle = "#020617"; g.lineWidth = 3; g.beginPath();
          g.moveTo(x, y - 24); g.lineTo(x + 24, y); g.lineTo(x, y + 24); g.lineTo(x - 24, y); g.closePath(); g.fill(); g.stroke();
          g.fillStyle = "#020617"; g.font = "800 20px 'Fira Sans',sans-serif"; g.fillText(a[1] === "C" ? "分" : "頭", x, y + 1);
          g.fillStyle = "#f5d0fe"; g.font = "600 22px 'Fira Sans',sans-serif"; g.fillText((a[1] === "C" ? "分身：" : "") + zh(a[4]), x, y - 38);
        }
      }
      const wd = F.wides.filter((w) => w[0] - t10 <= 30 && t10 - w[0] <= 8);
      if (wd.length) { g.fillStyle = "#fca5a5"; g.font = "800 34px 'Fira Sans',sans-serif"; g.fillText("全體傷害：" + [...new Set(wd.map((w) => zh(w[1])))].join("、"), C, W - 84); }
    }

    // 本尊＋三隻分身衝鋒：衝之前畫在王旁邊（出發位置紀錄裡沒有，是示意），最後 0.8 秒衝到各自目標身上
    const dash = F.hits.filter((h) => /End$/.test(h[2]) && h[0] - t10 <= 50 && t10 - h[0] <= 30);
    const kef = (x, y, name, a) => {
      g.globalAlpha = a; g.fillStyle = "rgba(192,132,252,.3)"; g.strokeStyle = "#c084fc"; g.lineWidth = 4;
      g.beginPath(); g.arc(x, y, 3.2 * SC, 0, 6.2832); g.fill(); g.stroke();
      g.fillStyle = "#e9d5ff"; g.font = "800 30px 'Fira Sans',sans-serif"; g.fillText(name, x, y - 2.2 * SC); g.globalAlpha = 1;
    };
    // 王
    const bp = at(F.bossTrack, t10);
    if (bp && dash.length) {
      const [bx, by] = px(bp);
      dash.forEach((h, n) => {
        const tp = at(F.tracks[h[1]], Math.min(t10, h[0])); if (!tp) return;
        const [tx, ty] = px(tp), main = h[1] === 0, ang = n * 1.5708 + 0.7854;
        const sx = main ? bx : bx + Math.cos(ang) * 4.5 * SC, sy = main ? by : by + Math.sin(ang) * 4.5 * SC;
        const k = Math.max(0, Math.min(1, 1 - (h[0] - t10) / 8));
        if (k < 1) { g.strokeStyle = "#c084fc"; g.lineWidth = 3; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(sx, sy); g.lineTo(tx, ty); g.stroke(); g.setLineDash([]); }
        kef(sx + (tx - sx) * k, sy + (ty - sy) * k, main ? "凱夫卡" : "分身", k < 1 ? 0.75 : 1);
        g.strokeStyle = "#e879f9"; g.lineWidth = 3; g.setLineDash(k < 1 ? [12, 10] : []); g.beginPath(); g.arc(tx, ty, 5 * SC, 0, 6.2832); g.stroke(); g.setLineDash([]);
      });
    } else if (bp) {
      const [x, y] = px(bp);
      g.fillStyle = "rgba(192,132,252,.25)"; g.strokeStyle = "#c084fc"; g.lineWidth = 4;
      g.beginPath(); g.arc(x, y, 3.2 * SC, 0, 6.2832); g.fill(); g.stroke();
      g.fillStyle = "#e9d5ff"; g.font = "800 34px 'Fira Sans',sans-serif"; g.fillText("凱夫卡", x, y);
    }

    const dead = new Set(F.deaths.filter((d) => t10 >= d[0] && t10 < d[1]).map((d) => d[2]));

    // 走過的路（最近 6 秒）
    if ($("trail").checked) {
      F.tracks.forEach((tr, i) => {
        g.strokeStyle = COLORS[D.roles[i]]; g.globalAlpha = i === S.me ? 0.9 : 0.35; g.lineWidth = i === S.me ? 6 : 3; g.beginPath();
        for (let k = 0; k <= 12; k++) { const p = at(tr, Math.max(clipA * 10, t10 - 60 + k * 5)); if (!p) continue; const q = px(p); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
        g.stroke();
      });
      g.globalAlpha = 1;
    }

    // 剛被打到的人閃一下
    const hitNow = new Set(F.hits.filter((h) => t10 >= h[0] && t10 - h[0] < 8).map((h) => h[1]));
    const deb = F.debuffs.filter((d) => SHOW_DEBUFF.has(d[3]) && t10 >= d[0] && t10 < d[1]);
    const L = labelSpots(pts);
    pts.forEach((p, i) => {
      if (!p) return;
      const role = D.roles[i], col = COLORS[role], me = i === S.me, l = L[i];
      if (Math.hypot(l[0] - p[0], l[1] - p[1]) > 8) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(l[0], l[1]); g.stroke(); }
      g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], 6, 0, 6.2832); g.fill();
      if (hitNow.has(i)) { g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.arc(l[0], l[1], 32, 0, 6.2832); g.stroke(); }
      g.fillStyle = dead.has(i) ? "#475569" : col; g.beginPath(); g.arc(l[0], l[1], 23, 0, 6.2832); g.fill();
      g.strokeStyle = me ? "#ffd166" : "#020617"; g.lineWidth = me ? 7 : 3; g.stroke();
      g.fillStyle = "#020617"; g.font = "800 23px 'Fira Sans',sans-serif"; g.fillText(dead.has(i) ? "✕" : role, l[0], l[1] + 1);
      const ds = deb.filter((d) => d[2] === i).map((d) => zh(d[3]));
      if (ds.length) { g.font = "600 22px 'Fira Sans',sans-serif"; g.fillStyle = "#ffd166"; g.fillText([...new Set(ds)].join("・"), l[0], l[1] + 38); }
    });

    // 讀條
    const active = F.casts.filter((c) => t10 >= c[0] && t10 <= c[0] + c[1] && !c[2].startsWith("Unknown"));
    let y = 70;
    for (const c of active.filter((c) => c[3] === "B").concat(active.filter((c) => c[3] !== "B")).slice(0, 4)) {
      const w = 520, x0 = C - w / 2, k = (t10 - c[0]) / Math.max(1, c[1]);
      g.fillStyle = "rgba(2,6,23,.85)"; g.fillRect(x0, y, w, 44); g.fillStyle = c[3] === "B" ? "#c2410c" : "#7c3aed"; g.fillRect(x0, y, w * k, 44);
      g.strokeStyle = "#fdba74"; g.lineWidth = 2; g.strokeRect(x0, y, w, 44);
      g.fillStyle = "#fff"; g.font = "600 26px 'Fira Sans',sans-serif"; g.fillText(WHO[c[3]] + zh(c[2]), C, y + 23);
      y += 52;
    }

    // 側欄
    $("clock").textContent = fmt(t) + " / " + fmt(clipB);
    $("seek").value = Math.round(((t - clipA) / Math.max(0.1, clipB - clipA)) * 1000);
    for (const li of $("casts").children) li.classList.toggle("now", t >= +li.dataset.t && t <= +li.dataset.e);
    const groups = new Map();
    for (const h of F.hits) { if (h[0] > t10 || t10 - h[0] > 120 || h[0] < clipA * 10) continue; const k = Math.round(h[0] / 5) + "|" + h[2]; if (!groups.has(k)) groups.set(k, { t: h[0] / 10, n: h[2], who: new Set() }); groups.get(k).who.add(h[1]); }
    const rows = [...groups.values()].sort((a, b) => b.t - a.t).slice(0, 6);
    const key = rows.map((r) => r.t + r.n + r.who.size).join();
    if (key !== lastHitKey) {
      lastHitKey = key; const ul = $("hits"); ul.textContent = "";
      for (const r of rows) {
        const li = document.createElement("li"), b = document.createElement("b"); b.textContent = zh(r.n);
        li.append(fmt(r.t) + " ", b, " → " + (r.who.size === 8 ? "全員" : [...r.who].sort((a, c) => a - c).map((i) => D.roles[i]).join(" ")));
        ul.append(li);
      }
    }
  }

  // 異三角示意：照萌神神攻略圖上的例子重畫（7 個三角、分 3 組落下，各組依序爆炸）
  const TRI = [
    [1, [[0.2, -20.9], [9, -15.9], [0.2, -10.7]]], [1, [[-18, -10.5], [-9.1, -15.5], [-9.1, -5.2]]],
    [2, [[-17.7, 0.5], [-8.9, 5.6], [-17.7, 10.8]]], [2, [[9, 5.3], [17.9, 10.5], [9, 15.6]]],
    [3, [[8.8, -5.9], [17.6, -10.9], [17.6, -0.6]]], [3, [[-6.6, -0.5], [2.1, -5.5], [2.1, 5.3]]], [3, [[-9.3, 14.9], [-0.5, 10], [-0.5, 20.2]]],
  ];
  const LAND = [0, 6, 8, 10], BOOM = [0, 13, 15, 17];
  const tc = $("trine"), tg = tc.getContext("2d");
  function drawTrine(t) {
    const cast = F.casts.filter((c) => c[2] === "Trine" && c[3] === "B" && t * 10 >= c[0] && t * 10 - c[0] < 200).pop();
    $("trineCard").hidden = !cast;
    if (!cast) return;
    const dt = t - cast[0] / 10, w = tc.width, c = w / 2, k = (w / 2 - 14) / 21, P = (p) => [c + p[0] * k, c + p[1] * k];
    tg.clearRect(0, 0, w, w);
    tg.fillStyle = "#101a33"; tg.strokeStyle = "#3a4569"; tg.lineWidth = 3; tg.beginPath(); tg.arc(c, c, 20 * k, 0, 6.2832); tg.fill(); tg.stroke();
    tg.textAlign = "center"; tg.textBaseline = "middle";
    for (const [gp, v] of TRI) {
      if (dt < LAND[gp]) continue;
      const boom = dt - BOOM[gp];
      if (boom >= 0 && boom < 2.2) for (const q of v) { const [x, y] = P(q); tg.fillStyle = "rgba(251,146,60," + (boom < 0.5 ? 0.6 : 0.22) + ")"; tg.strokeStyle = "#fb923c"; tg.lineWidth = 2; tg.beginPath(); tg.arc(x, y, 6 * k, 0, 6.2832); tg.fill(); tg.stroke(); }
      if (boom >= 0) continue;
      tg.fillStyle = "rgba(250,204,21,.4)"; tg.strokeStyle = "#facc15"; tg.lineWidth = 3; tg.beginPath();
      v.forEach((q, i) => { const [x, y] = P(q); i ? tg.lineTo(x, y) : tg.moveTo(x, y); }); tg.closePath(); tg.fill(); tg.stroke();
      const [mx, my] = P([(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3]);
      tg.fillStyle = "#020617"; tg.beginPath(); tg.arc(mx, my, 20, 0, 6.2832); tg.fill(); tg.fillStyle = "#fde68a"; tg.font = "800 26px 'Fira Sans',sans-serif"; tg.fillText(gp, mx, my + 1);
    }
    $("trineTxt").textContent = dt < LAND[1] ? "讀條中：等三角落下，記住落下的順序。" : dt < LAND[3] ? "第 " + (dt < LAND[2] ? 1 : 2) + " 組落下。三角的三個角各會炸一個大圓。" : dt < BOOM[1] ? "三組都落下了：先站到第 3 組（最後落下）的三角位置，那裡最晚炸。" : dt < BOOM[2] ? "第 1 組炸了：立刻走進第 1 組剛炸過的地方。" : dt < BOOM[3] ? "第 2 組炸：留在第 1 組炸過的地方別動。" : "第 3 組炸完，結束。";
  }

  let prev = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - prev) / 1000); prev = now;
    if (S.playing) {
      S.t += dt * S.speed;
      if (S.t >= clipB) { if ($("loop").checked) S.t = clipA; else { S.t = clipB; S.playing = false; sync(); } }
    }
    draw(); drawTrine(S.t);
    requestAnimationFrame(frame);
  }

  D.roles.forEach((r, i) => { const o = document.createElement("option"); o.value = i; o.textContent = r + "（這隊是" + D.jobs[i] + "）"; $("me").append(o); });
  const none = document.createElement("option"); none.value = -1; none.textContent = "不標"; $("me").prepend(none); $("me").value = -1;
  $("me").onchange = (e) => { S.me = +e.target.value; };
  $("speed").onchange = (e) => { S.speed = +e.target.value; };
  $("play").onclick = () => { if (S.t >= clipB) S.t = clipA; S.playing = !S.playing; sync(); };
  $("seek").oninput = (e) => { S.t = clipA + (e.target.value / 1000) * (clipB - clipA); };
  $("tab0").onclick = () => setFight(0); $("tab1").onclick = () => setFight(1);
  addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); $("play").click(); }
    if (e.code === "ArrowLeft") S.t = Math.max(clipA, S.t - 2);
    if (e.code === "ArrowRight") S.t = Math.min(clipB, S.t + 2);
  });
  setFight(location.hash === "#body" ? 1 : 0);
  requestAnimationFrame(frame);
  window.__replay = { S, draw, setFight, setClip };
})();
