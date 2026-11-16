// 絕神兵・火神階段 機制模擬器（試作）
// 俯視、可操作：WASD 移動、滑鼠拖曳／Q E 轉視角。走錯會死。
// 時間與站位依 FFLogs 擊殺回放整理（以火神登場為 0 秒）；判定範圍為估計值，集中在 CFG，方便照實戰校正。
"use strict";

const CFG = {
  R: 20,            // 場地半徑
  speed: 6,         // 角色移動速度（米／秒）
  plumeR: 9,        // 光輝炎柱半徑（估）
  dashHalf: 9,      // 深紅旋風半寬（估：全寬 18）
  crossHalf: 4.5,   // 覺醒十字半寬（回放：十字結算時有人離十字線只有 5 米左右仍存活）
  crossDelay: 2.1,  // 本體衝完到十字結算（回放實測）
  crossLinger: 0.3, // 十字持續（估）
  eruptR: 8,        // 地火半徑（回放：離釘子 7～8 米仍炸得到）
  nailBox: 0.5,     // 釘子本身的判定半徑（估）
  eruptDelay: 3,    // 地火出圈到爆炸（回放實測）
  swR: 14,          // 灼熱半徑（估）
  swEvery: 6,       // 灼熱爆炸間隔（回放：範圍爆炸每 6 秒一次；帶原者自己另外每 3 秒吃一次持續傷害）
  stackR: 4.5,      // 烈焰碎擊分攤半徑（估）
  kb: 15,           // 火神爆裂擊退距離（估）
  coneHalf: Math.PI / 3, // 烈焰焚燒扇形半角（估：120 度）
  fetterMax: 10,    // 炎獄之鎖安全距離（估）
  fetterGrace: 4,   // 拉遠累計幾秒算失敗
};
const BUILD = "1116-13"; // 每次改版要跟 uwu-ifrit.html 裡 script 的 ?v= 一起改，避免瀏覽器跑到快取的舊版
const ROLES = ["MT", "ST", "H1", "H2", "D1", "D2", "D3", "D4"];
const ROLE_COLOR = ["#6096ff", "#6096ff", "#5fd08a", "#5fd08a", "#ff7b7b", "#ff7b7b", "#ff7b7b", "#ff7b7b"];
const DIR_NAME = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"];
const dirName = (deg) => DIR_NAME[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
// 時間、釘子順序與站位依 FFLogs 日本區 13 筆擊殺回放整理（0 秒＝火神登場開始詠唱深紅旋風）。
// 其中 8 筆火神階段打滿約 146～155 秒（有烈焰碎擊與四連深紅旋風），5 筆在 97 秒左右就擊殺。
const CHECKPOINTS = [
  { t: 0, name: "開場：登場衝鋒＋炎柱" },
  { t: 36, name: "釘子、灼熱、第一輪地火" },
  { t: 68, name: "拉角落、第二輪地火、分身衝鋒" },
  { t: 97, name: "第三次灼熱、烈焰碎擊" },
  { t: 112, name: "四連深紅旋風" },
  { t: 129, name: "收尾：MT 三連焚燒＋第三輪地火" },
];
const KILL_T = 97;   // 輸出很高的隊伍在這時就擊殺（壓掉後面的機制）
const END_T = 155;   // 一般隊伍的擊殺時間（回放 8 筆裡 5 筆打到第三輪地火，152～155 秒擊殺）
const NAIL_DEATH = [55.2, 57.7, 60.2, 62.7];
const DASH_T = [121.3, 122.8, 124.2, 125.6];
const MARKERS = [["A", 0, -6.5, "#ff6b6b"], ["B", 6.5, 0, "#ffd166"], ["C", 0, 6.5, "#6096ff"], ["D", -6.5, 0, "#c084fc"], ["1", 0, 0, "#ff6b6b"], ["2", 0, -18, "#ffd166"], ["3", 12.7, -12.7, "#6096ff"]];

const rad = (deg) => (deg * Math.PI) / 180;
const polar = (deg, r) => ({ x: Math.sin(rad(deg)) * r, y: -Math.cos(rad(deg)) * r });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// 到「通過場中、方向為 deg 的直線」的垂直距離
const perp = (p, deg) => Math.abs(p.x * Math.cos(rad(deg)) + p.y * Math.sin(rad(deg)));

const S = { opts: { role: 6, start: 0, speed: 1, assist: true, hints: true, god: false, full: true, view: "game" }, pitch: 0.42, dist: 15 };

function reset() {
  const o = S.opts;
  const rnd = mulberry32((Date.now() ^ (Math.random() * 1e9)) | 0);
  const ri = (n) => Math.floor(rnd() * n);
  S.rnd = rnd;
  S.t = o.start;
  S.over = null;
  S.paused = false;
  S.aoes = [];
  S.casts = [];
  S.tl = [];
  S.log = [];
  S.fetterApart = 0;
  S.tank = o.start < 7.6 ? null : o.start < 30.5 ? 1 : 0; // 目前仇恨在誰身上（null＝還沒人接）。回放：ST 開場接、吃完第一組焚燒後 30.5 秒換 MT，之後都是 MT
  S.shirked = o.start >= 33;  // ST 換坦後有沒有對 MT 用退避
  S.bossDyn = null;  // 玩家拉王時，王的實際位置
  S.posErr = 0; S.faceErr = 0;
  S.crushMark = null;
  S.flashRings = [];
  S.keys = S.keys || {};
  S.cam = S.cam || 0;
  S.zoom = S.zoom || 1;
  S.buff = { shield: -1, invuln: -1, sprint: -1 };
  S.cd = { shield: 0, invuln: 0, sprint: 0, provoke: 0, shirk: 0 };
  S.fireRes = [false, false]; // 兩個坦克各自有沒有火耐性下降
  S.nailHits = o.start > 56 ? [2, 2, 2, 2] : [0, 0, 0, 0]; // 每根釘子被地火炸到幾次（兩次才會強化）
  // 這一把的隨機內容
  S.bossCard = ri(4);                        // 開場火神出現的正點（0北 1東 2南 3西）
  S.k = ri(8);                               // 釘子基準方位
  S.nailDirs = [S.k, S.k + 1, S.k + 3, S.k + 6].map((d) => d % 8); // [近A, 近B, 遠, 遠]：相鄰兩根＋分開兩根
  S.killOrder = [3, 2, 0, 1];                // 逆Z（回放 8/8 一致）：先打分開的兩根（k+6 → k+3），再打相鄰的兩根（k → k+1）
  S.closeDeg = S.k * 45 + 22.5;              // 相鄰兩根釘子的中間方位：王往這邊拉
  S.realIdx = ri(4);                         // 四連衝鋒裡第幾隻是本體（覺醒，會留十字）
  S.cornerDeg = (S.k % 2 ? S.k : S.k + 1) * 45; // 第二輪全隊去的角落：相鄰兩根釘子裡在斜點的那一根方位
  S.fetterDps = 4 + ri(2);                   // 炎獄之鎖：接王的坦克（前半是 ST）＋一名輸出（回放是隨機輸出；這裡固定成近戰，兩人本來就一起打釘子）
  const h1 = 2 + ri(2), h2 = 2 + ri(2);
  S.sw = [
    { who: h1, t0: 43.6, first: 48.7, last: 60.7 },                    // 第一次：炸 3 下
    { who: h2, t0: 82.4, first: 87.5, last: 111.6 },                   // 覺醒後 30 秒：炸 5 下
    { who: h2 === 2 ? 3 : 2, t0: 100.5, first: 105.6, last: 129.6 },    // 第三次：一路炸到四連衝結束
  ];
  S.crush1 = 4 + ri(4);
  S.ents = ROLES.map((_, i) => ({ ...home(i, o.start), i, face: 0 }));
  S.events = buildEvents().filter((e) => e.t >= o.start - 1e-6).sort((a, b) => a.t - b.t);
  S.evIdx = 0;
}

// ---------- 王、分身、釘子 ----------
const curNailDir = (t) => S.nailDirs[S.killOrder[Math.min(3, NAIL_DEATH.filter((d) => d <= t).length)]];
const finalDir = () => S.k + (S.realIdx % 2 === 0 ? 2 : 3); // 四連衝後全隊停的方位：本體第 1、3 隻走 45 度，第 2、4 隻走 90 度
const cornerBossSpot = () => polar(S.cornerDeg, 13);
const tankable = (t) => t >= 7.2 && !(t >= 66 && t < 70.3) && !(t >= 113.6 && t < 129.5); // 火神可選中、會跟著仇恨走的時段
const playerHolds = (t) => S.opts.role <= 1 && S.tank === S.opts.role && tankable(t);
// 玩家是接王的坦克時，王跟著玩家走；否則照回放的定位
function bossState(t) { const b = bossSpot(t); return b.vis && S.bossDyn && playerHolds(t) ? { pos: S.bossDyn, vis: true } : b; }
function bossSpot(t) {
  const c = S.bossCard * 90;
  if (t < 3) return { pos: polar(c, 19.5), vis: true };
  if (t < 5) return { pos: lerp(polar(c, 19.5), polar(c + 180, 19.5), clamp01((t - 3) / 0.5)), vis: true };
  if (t < 7.2) return { pos: lerp(polar(c + 180, 19.5), { x: 0, y: 0 }, clamp01((t - 5) / 2)), vis: true };
  if (t < 39) return { pos: { x: 0, y: 0 }, vis: true };
  if (t < 66) return { pos: { x: 0, y: 0 }, vis: true }; // 釘子階段：坦克把王留在場中，面向背對正在打的那根釘子
  if (t < 78) return { pos: { x: 0, y: 0 }, vis: t >= 70.3 };
  if (t < 113.6) return { pos: lerp({ x: 0, y: 0 }, cornerBossSpot(), clamp01((t - 78) / 6)), vis: true };
  if (t < 129.5) return { pos: { x: 0, y: 0 }, vis: false };
  return { pos: lerp({ x: 0, y: 0 }, polar(finalDir() * 45, 12), clamp01((t - 129.7) / 2.8)), vis: true }; // 收尾：MT 在人群停下的方位接王
}
function dashers(t) { // 四連衝鋒的四隻，其中一隻是本體
  if (t < 115 || t > 127) return [];
  return S.killOrder.map((nail, n) => {
    const d = S.nailDirs[nail] * 45;
    const k = clamp01((t - DASH_T[n]) / 0.35);
    return { pos: lerp(polar(d, 19.5), polar(d + 180, 19.5), k), n, real: n === S.realIdx, gone: t > DASH_T[n] + 1.2 };
  }).filter((c) => !c.gone);
}
function nails(t) {
  if (t < 31.6) return [];
  return S.nailDirs.map((d, i) => ({ pos: polar(d * 45, 10), i, hits: S.nailHits[i], order: S.killOrder.indexOf(i), dead: t >= NAIL_DEATH[S.killOrder.indexOf(i)] })).filter((n) => !n.dead);
}
const swActive = (t) => S.sw.filter((s) => t >= s.t0 && t <= s.last + 0.2);
const hasSw = (i, t) => swActive(t).some((s) => s.who === i);
const swIdx = (i, t) => S.sw.findIndex((s) => s.who === i && t >= s.t0 - 2.6 && t <= s.last + 0.2); // 咆哮開始詠唱（點名）就算
const fetterOn = (t) => t >= 40.8 && t < 66;

// ---------- NPC 站位（依回放） ----------
// 接王的坦克該站哪：王還沒到定位就先走到定位的另一頭把牠拖過去；到位後貼著王站在指定的那一側（3 米內王就不會再動）
function tankAt(t, faceDeg) {
  const spot = bossSpot(t).pos, b = S.ents ? bossState(t).pos : spot, off = dist(b, spot);
  if (off > 1.5) return { x: spot.x + ((spot.x - b.x) / off) * 3.4, y: spot.y + ((spot.y - b.y) / off) * 3.4 };
  const o = polar(faceDeg, 2.8); return { x: spot.x + o.x, y: spot.y + o.y };
}
const CENTER_HOME = [[270, 3.5], [180, 5], [-15, 5.5], [15, 5.5], [-28, 4], [28, 4], [-8, 7], [8, 7]];
function home(i, t) {
  // 開場：火神在東西就去北，在南北就去西，貼場邊
  if (t < 9) return polar((S.bossCard % 2 ? 0 : 270) + (i - 3.5) * 3, 17.5);
  const center = () => polar(CENTER_HOME[i][0], CENTER_HOME[i][1]);
  if (t < 38) { const h = t < 30.5 ? 1 : 0; return i === h ? tankAt(t, 180) : i <= 1 ? polar(...CENTER_HOME[0]) : center(); } // 接王的坦克把王留在場中、面朝南：30.5 秒前是 ST，之後換 MT
  if (t < 66) {
    const far6 = (S.k + 6) * 45, far3 = (S.k + 3) * 45;
    // 灼熱補師：相鄰兩根釘子的正對面場邊
    if (swIdx(i, t) === 0 && t < 62) return polar(S.closeDeg + 180, 18);
    // 地火誘導（D3 順時針、D4 逆時針，路線互為鏡像）：
    // 站在自己那根分開的釘子外側吃第 1、2 圈 → 沿外圈跑向自己那根相鄰的釘子，第 3 圈放在快到的地方、第 4 圈放在它的外側內緣 → 回第一根釘子找人群。
    // 後兩圈都偏在「自己那根」的外側，不會蓋到隊友負責的釘子：每根釘子剛好被炸兩次。
    if ((i === 6 || i === 7) && t < 54.2) {
      const far = i === 6 ? far6 : far3, sgn = i === 6 ? 1 : -1, at = (a, r) => polar(far + sgn * a, r);
      if (t < 49.85) { const q = clamp01((t - 46.8) / 3.05); return at(65 * q, 15 - q); }
      if (t < 51.95) return lerp(at(65, 14), at(68, 9.5), clamp01((t - 49.95) / 1.9));
      return lerp(at(68, 9.5), polar(far6 + (i === 6 ? -8 : -20), 5), clamp01((t - 51.95) / 2.2)); // 兩人都往第一根釘子、遠離相鄰釘子的那一側收
    }
    // 近戰、坦克、沒被點的補師：照擊殺順序一根一根去打釘子（這條路線就是逆Z）。前兩圈地火炸完前先站在第一根釘子的內側
    const d = curNailDir(t) * 45, wait = t < 51.2;
    if (i === 0) return tankAt(t, d + 180); // MT 拉王：王留在場中，自己站在目前那根釘子的反方向，王的正面就不會對到打釘子的人
    // 站位都收在釘子方位的 -8～+3 度內：再偏順時針會進到 D3 第 4 圈，再偏逆時針會進到灼熱補師的範圍
    if (i === 6 || i === 7) return polar(d + (i === 6 ? -8 : -3), 5.5);
    if (i === 2 || i === 3) return polar(d + (i === 2 ? -6 : 2), 4.5);
    return polar(d + [0, -6, 0, 0, -2, 1][i], wait ? 5.5 : 8.2); // ST 換坦後跟近戰一起打釘子（炎獄之鎖連的就是 ST 和一名輸出）
  }
  if (t < 78) return i === 0 ? tankAt(t, 180) : polar(...CENTER_HOME[i === 1 ? 0 : i]); // MT 接王在南側，ST 在人群
  if (t >= 129.5) {
    // 收尾：MT 在人群停下的方位把王接在場邊，其他人站王靠場中的那一側
    const F = finalDir() * 45;
    // 第三輪地火（147 秒起）：D3、D4 在焚燒期間就先到離王最遠的場邊，出圈後各自沿牆跑（D3 順時針、D4 逆時針）
    if ((i === 6 || i === 7) && t >= 137.5) { const sgn = i === 6 ? 1 : -1; return polar(F + 180 + sgn * (6 + Math.max(0, t - 147.2) * 13), 18); }
    return i === 0 ? tankAt(t, F) : polar(F + (i - 3.5) * 5, 6.5 + (i % 2));
  }
  if (t >= 113.6) {
    // 四連深紅旋風（13 筆回放一致）：全隊先到第 4 隻的正前方，第 1 隻衝完後順時針連續走：本體是第 1、3 隻走 45 度，第 2、4 隻走 90 度。
    // 還帶著灼熱的補師在正對面做同樣的事。
    const opp = swIdx(i, t) === 2 ? 4 : 0;
    const total = (finalDir() - S.k - 1) * 45; // 45 或 90 度
    const deg = (S.k + 1 + opp) * 45 + Math.min(total, Math.max(0, (t - DASH_T[0] - 0.1) * 22)); // 第 1 隻衝完起跑，約每秒 22 度（要開疾跑）
    return polar(deg + (i - 3.5) * 1.2, 17);
  }
  // 78 ≤ t < 113.6：全隊貼角落場邊
  const P = S.cornerDeg;
  if (swIdx(i, t) === 2) return polar(P + 110, 18);                       // 第三次灼熱：順時針側
  if (swIdx(i, t) === 1) return polar(t < 100 ? P - 135 : P - 90, 18);    // 第二次灼熱：先到人群對面那一側，第三次點名後移到逆時針 90 度
  if (S.crushMark && S.crushMark.until > t) return polar(P + (i - 3.5) * 1.2, 17.6 + (i % 2) * 0.7); // 分攤：擠在一起
  if ((i === 6 || i === 7) && t >= 79 && t < 92.8) return polar(P + 135 - clamp01((t - 84.7) / 8) * 135 + (i === 7 ? 4 : 0), 18); // 第二輪地火：兩人一起從遠處沿牆跑回角落
  if (i === 0) return tankAt(t, P); // 後半（火神跳回來之後）都是 MT 接王：王拉到角落前面，自己站外側
  return polar(P + [0, -7, 5, -5, -3, 3, 7, 8][i], 17.4 + (i % 2) * 0.8);
}

// ---------- 事件 ----------
function addAoe(a) { S.aoes.push({ linger: 0, assistOnly: false, done: false, ...a }); }
const circleAoe = (c, r) => ({ shape: { type: "circle", c, r }, hit: (p, m = 0) => dist(p, c) <= r + m, draw: (g, k) => { g.beginPath(); g.arc(c.x, c.y, r, 0, 7); fillAoe(g, k); } });
const stripAoe = (deg, half) => ({ shape: { type: "strip", deg, half }, hit: (p, m = 0) => perp(p, deg) <= half + m, draw: (g, k) => { g.save(); g.rotate(rad(deg)); g.beginPath(); g.rect(-half, -CFG.R, half * 2, CFG.R * 2); fillAoe(g, k); g.restore(); } });
const crossAoe = (deg, half) => { const a = stripAoe(deg, half), b = stripAoe(deg + 90, half); return { shape: { type: "cross", deg, half }, hit: (p, m) => a.hit(p, m) || b.hit(p, m), draw: (g, k) => { a.draw(g, k); b.draw(g, k); } }; };
function coneAoe(from, to, half, len) {
  const ang = () => Math.atan2(to().y - from().y, to().x - from().x);
  return {
    shape: { type: "cone", from, to, half, len },
    hit: (p, m = 0) => { const f = from(); const d = dist(p, f); if (d > len) return false; if (d < 0.01) return true; let da = Math.atan2(p.y - f.y, p.x - f.x) - ang(); da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) <= half + m / Math.max(d, 1); },
    draw: (g, k) => { const f = from(), a = ang(); g.beginPath(); g.moveTo(f.x, f.y); g.arc(f.x, f.y, len, a - half, a + half); g.closePath(); fillAoe(g, k); },
  };
}
function fillAoe(g, k) { g.fillStyle = `rgba(255,120,40,${0.14 + 0.3 * k})`; g.fill(); g.lineWidth = 0.12; g.strokeStyle = `rgba(255,170,90,${0.5 + 0.4 * k})`; g.stroke(); }

function buildEvents() {
  const ev = [];
  const full = S.opts.full;
  const at = (t, run, name) => { if (!full && t > KILL_T) return; ev.push({ t, run }); if (name) S.tl.push({ t, name }); };
  const cast = (name, t0, t1) => { if (full || t1 <= KILL_T) S.casts.push({ name, t0, t1 }); };
  const me = () => S.ents[S.opts.role];
  const boss = () => bossState(S.t).pos;
  const lethal = (label) => function () { if (this.hit(me())) die(label); };

  // 開場：登場衝鋒＋光輝炎柱
  cast("深紅旋風", 0, 3);
  at(0, () => {
    addAoe({ ...stripAoe(S.bossCard * 90, CFG.dashHalf), t0: 0, t1: 3, assistOnly: true, onHit: lethal("被登場的深紅旋風撞到") });
    for (const c of [polar(45, 13), polar(135, 13), polar(225, 13), polar(315, 13), { x: 0, y: 0 }]) addAoe({ ...circleAoe(c, CFG.plumeR), t0: 0.3, t1: 4, onHit: lethal("站在光輝炎柱裡") });
  }, "深紅旋風＋光輝炎柱");
  S.tl.push({ t: 3, name: "深紅旋風結算" }, { t: 4, name: "光輝炎柱結算" });

  const hellfire = (t) => { cast("地獄之火炎", t - 3, t); at(t, () => flash("地獄之火炎：全場大傷"), "地獄之火炎（全場）"); };
  hellfire(10.3);

  cast("火神爆裂", 15.5, 18.5);
  at(14.5, () => { if (S.opts.role !== 3) { S.buff.shield = S.t + 30; flash("H2 上群盾：有盾就不會被火神爆裂擊退"); } });
  at(18.5, () => {
    if (S.buff.shield > S.t) return flash("火神爆裂：有盾，沒被擊退");
    const b = boss(), p = me(), d = Math.max(dist(p, b), 0.01);
    const nx = p.x + ((p.x - b.x) / d) * CFG.kb, ny = p.y + ((p.y - b.y) / d) * CFG.kb;
    if (Math.hypot(nx, ny) >= CFG.R - 0.3) return die("火神爆裂：你是 H2，沒在 18.5 秒前按 1 上群盾，全隊被擊退撞上場邊");
    p.x = nx; p.y = ny; flash("火神爆裂：沒盾，被擊退");
  }, "火神爆裂（擊退，H2 上盾擋）");

  const incinerate = (t, n, expect) => { // expect：照打法這一組該由誰吃
    cast("烈焰焚燒", t - 1.2, t);
    const holder = () => (S.tank === null ? expect : S.tank);
    at(t - 1.5, () => addAoe({
      ...coneAoe(boss, () => S.ents[holder()], CFG.coneHalf, 22), t0: S.t, t1: t, assistOnly: true, skip: [0, 1],
      onHit() {
        const role = S.opts.role, tank = holder();
        if (role === tank) {
          const cleaved = S.ents.filter((e) => e.i !== tank && this.hit(e));
          if (cleaved.length) return die(`烈焰焚燒順劈到隊友（${cleaved.map((e) => ROLES[e.i]).join("、")}）：接王的坦克要讓王背對人群`);
          if (S.fireRes[tank] && S.buff.invuln <= S.t) return die("烈焰焚燒：帶著火耐性下降硬吃下一發（先按 2 開無敵）");
          S.fireRes[tank] = true; flash(`烈焰焚燒 ${n}/3`);
        } else if (this.hit(me())) die("站在王正面吃到烈焰焚燒（非接王的人站王的背後）");
      },
    }));
    S.tl.push({ t, name: `烈焰焚燒 ${n}/3（${ROLES[expect]} 順劈）` });
  };
  // 坦克技能時間（回放 8 筆）：ST 約 8 秒挑釁接王、20～22 秒開無敵；MT 30.5 秒挑釁換坦；ST 32～34 秒對 MT 用退避；MT 131～137 秒開無敵
  at(8.3, () => { if (S.tank === null && S.opts.role !== 1) { S.tank = 1; flash("ST 挑釁接王"); } });
  at(12, () => { if (S.tank !== 1) die(S.opts.role === 1 ? "你是 ST，火神出現後沒有按 3 挑釁接王，王跑去打別人" : "開場要讓 ST 接王：你把王嘲走了"); });
  at(30.5, () => { if (S.opts.role !== 0 && S.tank !== 0) { S.tank = 0; S.bossDyn = null; flash("MT 挑釁換坦"); } });
  at(33, () => { if (S.opts.role !== 1 && !S.shirked) { S.shirked = true; flash("ST 對 MT 用退避"); } });
  at(34.5, () => { if (S.tank !== 0) die(S.opts.role === 0 ? "你是 MT，第一組焚燒打完（28.5 秒）後沒有按 3 挑釁換坦，釘子階段王還在 ST 身上" : "第一組焚燒後要換 MT 拉王：仇恨還在你身上"); });
  at(36, () => { if (!S.shirked) { S.tank = 1; S.bossDyn = null; die(S.opts.role === 1 ? "換坦後你沒有按 4 對 MT 用退避，仇恨又回到你身上，王轉回來了" : "ST 沒有退避，仇恨回到 ST 身上"); } });
  S.tl.push({ t: 7.2, name: "火神可選中：ST 挑釁接王" }, { t: 30.5, name: "MT 挑釁換坦" }, { t: 33, name: "ST 對 MT 退避" });
  incinerate(21.3, 1, 1); incinerate(24.4, 2, 1); incinerate(28.5, 3, 1); // 第一組：ST 接

  at(31.6, () => flash("炎獄之楔出現：數字是擊殺順序（逆Z），每根要被地火炸兩次"), "炎獄之楔 ×4");
  at(40.8, () => { S.fetterApart = 0; flash(`炎獄之鎖：ST 與 ${ROLES[S.fetterDps]} 連線`); }, "炎獄之鎖");
  NAIL_DEATH.forEach((t, n) => at(t, () => flash(`第 ${n + 1} 根釘子爆炸：全場傷害`), `釘子 ${n + 1} 爆炸`));

  // 灼熱：每 6 秒以帶原者為中心爆炸
  S.sw.forEach((s, n) => {
    cast("灼熱咆哮", s.t0 - 2.8, s.t0 - 0.9);
    at(s.t0, () => flash(`灼熱：${ROLES[s.who]}`), `灼熱咆哮 → ${ROLES[s.who]}`);
    for (let t = s.first; t <= s.last + 1e-6; t += CFG.swEvery) at(t, () => {
      const c = S.ents[s.who], role = S.opts.role;
      S.flashRings.push({ c: { x: c.x, y: c.y }, r: CFG.swR, until: S.t + 0.4 });
      if (role === s.who) { const v = S.ents.filter((e) => e.i !== role && dist(e, c) <= CFG.swR); if (v.length) die(`你的灼熱炸到隊友（${v.map((e) => ROLES[e.i]).join("、")}）：帶著灼熱要離所有人 ${CFG.swR} 米以上`); }
      else if (dist(me(), c) <= CFG.swR) die(`被 ${ROLES[s.who]} 的灼熱炸到（離他 ${CFG.swR} 米以上）`);
    });
  });

  // 地火：四連，每 2 秒一輪，出圈 3 秒後爆炸
  const eruptions = (first, pick, label) => {
    cast("地火", first - CFG.eruptDelay - 1, first - CFG.eruptDelay);
    for (let n = 0; n < 4; n++) {
      const hitT = first + 2 * n;
      at(hitT - CFG.eruptDelay, () => { const who = pick(); for (const i of who) addAoe({ ...circleAoe({ x: S.ents[i].x, y: S.ents[i].y }, CFG.eruptR), t0: S.t, t1: hitT, skipHome: who, onHit() { for (const n of nails(S.t)) if (this.hit(n.pos, CFG.nailBox)) { S.nailHits[n.i]++; flash(S.nailHits[n.i] > 2 ? `${DIR_NAME[S.nailDirs[n.i]]}釘子被多炸了一次（第 ${S.nailHits[n.i]} 次）：有圈放到別人負責的釘子` : `地火炸到${DIR_NAME[S.nailDirs[n.i]]}釘子（${S.nailHits[n.i]}/2）`); } if (this.hit(me())) die("站在地火裡"); } }); }, n === 0 ? label : null);
    }
  };
  const furthest2 = () => S.ents.slice().sort((a, b) => dist(b, boss()) - dist(a, boss())).slice(0, 2).map((e) => e.i);
  eruptions(48.9, () => [6, 7], "地火 ×4（點 D3、D4）");
  at(55.1, () => { const miss = S.nailHits.map((h, i) => (h < 2 ? `${DIR_NAME[S.nailDirs[i]]}（${h}/2）` : null)).filter(Boolean); if (miss.length) die(`釘子沒有每根炸滿兩次：${miss.join("、")}。火神不會覺醒，之後會滅團`); else flash("四根釘子都炸滿兩次：火神將覺醒"); });
  at(66, () => { S.bossDyn = null; flash("火神跳走，回場中集合"); });
  hellfire(73.4);
  eruptions(87.7, () => [6, 7], "地火 ×4（點 D3、D4）");

  // 分身：固定從南、東兩個正點同時衝過場中
  cast("深紅旋風（分身 ×2）", 91.8, 94.8);
  at(91.8, () => { for (const d of [180, 90]) addAoe({ ...stripAoe(d, CFG.dashHalf), t0: S.t, t1: 94.8, assistOnly: true, onHit: lethal("被分身的深紅旋風撞到（站四個斜角才安全）") }); }, "分身深紅旋風 ×2（南、東）");
  if (!full) { ev.push({ t: KILL_T, run: () => { S.over = { win: true, reason: "火神被擊殺（輸出夠高、壓掉後面機制的情況）" }; } }); S.tl.sort((a, b) => a.t - b.t); return ev; }

  const crush = (t, who) => {
    cast("烈焰碎擊", t - 5, t);
    at(t - 5, () => { S.crushMark = { who, until: t }; flash(`烈焰碎擊點名 ${ROLES[who]}：分攤`); }, `烈焰碎擊（分攤 ${ROLES[who]}）`);
    at(t, () => {
      const c = S.ents[who], role = S.opts.role, p = me();
      const inside = S.ents.filter((e) => dist(e, c) <= CFG.stackR);
      S.flashRings.push({ c: { x: c.x, y: c.y }, r: CFG.stackR, until: S.t + 0.5 });
      if (role === 2 || role === 3) { if (hasSw(role, S.t) && dist(p, c) <= CFG.swR) die("帶著灼熱靠近分攤人群"); return; } // 兩個補師都帶灼熱，不進分攤
      if (role === who && inside.length < 5) return die(`烈焰碎擊分攤人數不足（${inside.length} 人）：被點名要回人群`);
      if (dist(p, c) > CFG.stackR) die("沒進烈焰碎擊的分攤");
    });
  };
  crush(109.9, S.crush1);

  // 四連深紅旋風＋覺醒十字：四隻站在釘子的方位，依釘子擊殺順序衝；本體衝完 2.1 秒後留十字
  cast("深紅旋風 ×4", 118.3, DASH_T[3]);
  at(115, () => {
    flash("四隻火神就位：依釘子擊殺順序衝鋒");
    S.killOrder.forEach((nail, n) => addAoe({ ...stripAoe(S.nailDirs[nail] * 45, CFG.dashHalf), t0: S.t, t1: DASH_T[n], assistOnly: true, order: n, onHit: lethal(`被第 ${n + 1} 隻的深紅旋風撞到`) }));
    const realDir = S.nailDirs[S.killOrder[S.realIdx]], ct = DASH_T[S.realIdx];
    addAoe({ ...crossAoe(realDir % 2 === 0 ? 45 : 0, CFG.crossHalf), t0: ct, t1: ct + CFG.crossDelay, linger: CFG.crossLinger, isCross: true, onHit: lethal("踩到本體留下的十字火焰（本體在正點就站正點，在斜點就站斜點）") });
  }, "四連深紅旋風");
  DASH_T.forEach((t, n) => S.tl.push({ t, name: `深紅旋風 ${n + 1}/4${n === S.realIdx ? "（本體）" : ""}` }));
  S.tl.push({ t: DASH_T[S.realIdx] + CFG.crossDelay, name: "十字火焰" });

  at(60, () => { S.fireRes = [false, false]; });
  at(129.5, () => { flash("火神回來：仇恨還在 MT 身上"); });
  incinerate(133.9, 1, 0); incinerate(137, 2, 0); incinerate(141.1, 3, 0); // 第二組：MT 接（火神跳回來之後都是 MT）
  at(129.5, () => { S.bossDyn = null; });
  eruptions(150.2, () => [6, 7], "第三輪地火 ×4（點離王最遠的 D3、D4）");
  at(END_T, () => { S.over = { win: true, reason: "火神被擊殺，階段通過（打得慢的話這裡之後還有一次烈焰碎擊）" }; });
  S.tl.sort((a, b) => a.t - b.t);
  return ev;
}

function flash(msg) { S.log.unshift({ msg, t: S.t }); S.log.length = Math.min(S.log.length, 5); }
function die(reason) { if (S.opts.god) return flash("（觀摩模式）" + reason); if (!S.over) S.over = { win: false, reason, t: S.t }; }

// ---------- 更新 ----------
function dangerAt(p, i, isHome) {
  for (const a of S.aoes) if (!a.done && a.t0 <= S.t && a.t1 - S.t < 2.6 && !(a.skip && a.skip.includes(i)) && !(isHome && a.skipHome && a.skipHome.includes(i)) && a.hit(p, 1.3)) return true;
  for (const a of S.aoes) if (a.done && a.linger && S.t < a.t1 + a.linger && a.hit(p, 1.3)) return true;
  for (const s of swActive(S.t)) if (s.who !== i && dist(p, S.ents[s.who]) < CFG.swR + 1.5) return true;
  return false;
}
function npcTarget(e) {
  const h = home(e.i, S.t);
  if (S.t >= 113.6 && S.t < 129.5) return h; // 四連衝照固定路線走
  if (!dangerAt(h, e.i, true)) return h;
  if (!dangerAt(e, e.i)) return e;
  let best = null, bd = 1e9;
  for (const r of [2, 4, 6, 9, 12, 15, 18]) for (let k = 0; k < 24; k++) {
    const q = { x: e.x + Math.sin(k * 0.2618) * r, y: e.y - Math.cos(k * 0.2618) * r };
    if (Math.hypot(q.x, q.y) > CFG.R - 1 || dangerAt(q, e.i)) continue;
    if (r < bd) { bd = r; best = q; }
  }
  return best || h;
}
function step(dt) {
  if (S.over || S.paused) return;
  S.t += dt;
  while (S.evIdx < S.events.length && S.events[S.evIdx].t <= S.t) { S.events[S.evIdx++].run(); if (S.over) return; }
  const role = S.opts.role, p = S.ents[role];
  // 玩家移動（相對於鏡頭）
  const kx = (S.keys.KeyD ? 1 : 0) - (S.keys.KeyA ? 1 : 0), ky = (S.keys.KeyS ? 1 : 0) - (S.keys.KeyW ? 1 : 0);
  if (kx || ky) {
    const n = Math.hypot(kx, ky), sx = kx / n, sy = ky / n, c = Math.cos(S.cam), s = Math.sin(S.cam);
    const wx = sx * c - sy * s, wy = sx * s + sy * c, sp = CFG.speed * (S.buff.sprint > S.t ? 1.3 : 1) * dt;
    p.x += wx * sp; p.y += wy * sp; p.face = Math.atan2(wy, wx);
    const d = Math.hypot(p.x, p.y), lim = CFG.R - 0.4; if (d > lim) { p.x *= lim / d; p.y *= lim / d; }
  }
  for (const e of S.ents) {
    if (e.i === role) continue;
    const tg = npcTarget(e), d = dist(e, tg);
    if (d > 0.05) { const sp = Math.min(d, CFG.speed * 1.15 * dt); e.face = Math.atan2(tg.y - e.y, tg.x - e.x); e.x += ((tg.x - e.x) / d) * sp; e.y += ((tg.y - e.y) / d) * sp; }
  }
  for (const a of S.aoes) {
    if (!a.done && S.t >= a.t1) { a.done = true; a.onHit.call(a); if (S.over) return; }
    else if (a.done && a.linger && S.t < a.t1 + a.linger) { a.onHit.call(a); if (S.over) return; }
  }
  S.aoes = S.aoes.filter((a) => S.t < a.t1 + a.linger + 0.4);
  if (playerHolds(S.t)) {
    const spot = bossSpot(S.t).pos;
    if (!S.bossDyn) S.bossDyn = { x: spot.x, y: spot.y };
    const bd = S.bossDyn, d = dist(bd, p);
    if (d > 3.2) { const sp = Math.min(d - 3.2, 7 * dt); bd.x += ((p.x - bd.x) / d) * sp; bd.y += ((p.y - bd.y) / d) * sp; } // 王追著仇恨目標，停在近戰距離
    const t = S.t, settled = (t >= 13 && t < 38) || (t >= 44 && t < 64) || (t >= 86 && t < 112) || (t >= 134 && t < 153);
    // 定位：離該在的位置太遠，隊友打不到、後面的機制也會歪
    if (settled && dist(bd, spot) > 7) { S.posErr += dt; if (S.posErr > 4) die("王沒有拉到定位（離該在的位置超過 7 米太久）：看提示把王帶過去"); } else S.posErr = Math.max(0, S.posErr - dt);
    // 釘子階段：王的正面（朝著你）不能掃到正在打釘子的人
    if (t >= 46.5 && t < 62.7) { // 人群走到釘子、灼熱補師離開之後才開始算
      const ang = Math.atan2(p.y - bd.y, p.x - bd.x);
      const inFront = S.ents.filter((e) => e.i > 1 && !hasSw(e.i, t) && dist(e, bd) < 12 && Math.abs(Math.atan2(Math.sin(Math.atan2(e.y - bd.y, e.x - bd.x) - ang), Math.cos(Math.atan2(e.y - bd.y, e.x - bd.x) - ang))) < CFG.coneHalf);
      if (inFront.length >= 2) { S.faceErr += dt; if (S.faceErr > 3) die(`釘子階段王的正面對著人群（${inFront.map((e) => ROLES[e.i]).join("、")}）：站到王的另一側，讓牠背對正在打的那根釘子`); } else S.faceErr = Math.max(0, S.faceErr - dt);
    }
  }
  if (fetterOn(S.t) && (role === 1 || role === S.fetterDps)) {
    const other = S.ents[role === 1 ? S.fetterDps : 1];
    if (dist(p, other) > CFG.fetterMax) { S.fetterApart += dt; if (S.fetterApart > CFG.fetterGrace) die(`炎獄之鎖拉太遠太久（和 ${ROLES[other.i]} 保持 ${CFG.fetterMax} 米內）`); }
  }
}
function useSkill(k) {
  if (S.over) return;
  const role = S.opts.role, t = S.t;
  if (k === "shield" && role === 3 && S.cd.shield <= t) { S.buff.shield = t + 30; S.cd.shield = t + 30; flash("群盾 30 秒"); }
  if (k === "invuln" && role <= 1 && S.cd.invuln <= t) { S.buff.invuln = t + 10; S.cd.invuln = t + 90; flash("無敵 10 秒"); }
  if (k === "provoke" && role <= 1 && S.cd.provoke <= t) {
    if (!tankable(t) || !bossSpot(t).vis) return flash("現在沒有目標可以挑釁");
    S.cd.provoke = t + 30; S.bossDyn = { ...bossState(t).pos }; S.tank = role; S.posErr = 0; S.faceErr = 0; flash(`${ROLES[role]} 挑釁：仇恨到你身上，王會跟著你`);
  }
  if (k === "shirk" && role <= 1 && S.cd.shirk <= t) { // 退避：把自己 25% 的仇恨轉給另一個坦克
    S.cd.shirk = t + 120;
    if (S.tank === role) { S.tank = 1 - role; S.bossDyn = null; flash(`退避：仇恨轉給 ${ROLES[1 - role]}，王跑去他那邊`); }
    else { if (role === 1) S.shirked = true; flash(`退避：仇恨丟給 ${ROLES[1 - role]}，不會再把王搶回來`); }
  }
  if (k === "sprint" && S.cd.sprint <= t) { S.buff.sprint = t + 10; S.cd.sprint = t + 45; flash("衝刺 10 秒"); }
}

// ---------- 提示 ----------
function hint() {
  const t = S.t, r = S.opts.role, c = S.bossCard * 2, cd = S.closeDeg, P = S.cornerDeg;
  const near = `${DIR_NAME[S.nailDirs[0]]}、${DIR_NAME[S.nailDirs[1]]}`;
  if (t < 5) return `火神在${DIR_NAME[c]}邊，會直線衝過場中，同時場上有炎柱。全隊去${S.bossCard % 2 ? "北" : "西"}邊貼場邊。${r === 1 ? "你是 ST：火神 7 秒變成可選中後要按 3 挑釁接王。" : ""}`;
  if (t < 38) {
    if (r === 1) {
      if (S.tank !== 1 && t < 30) return "你是 ST：現在按 3 挑釁接王（12 秒前沒接到算失敗），把王留在場中、自己站南側。";
      if (t < 28.6) return "王在你身上，會跟著你走：把牠留在場中，自己貼在王的南側，讓王面朝南、背對北邊的人群。21 秒起三連烈焰焚燒，20 秒左右按 2 開無敵。火神爆裂的擊退由 H2 上盾擋掉。";
      return S.shirked ? "已退避。跟近戰一起去打釘子；炎獄之鎖會連你和一名輸出。" : "第三下焚燒打完，MT 會在 30.5 秒挑釁換坦。他一接走你就按 4 退避（36 秒前），不然仇恨會回到你身上。";
    }
    if (r === 0) {
      if (t < 28.6) return "王在 ST 身上，你先跟人群站王的北側。第三下焚燒（28.5 秒）一打完，你要馬上按 3 挑釁換坦。";
      return S.tank === 0 ? "王在你身上了：把牠留在場中，接下來是釘子階段。" : "現在按 3 挑釁換坦（34.5 秒前沒接到算失敗）。之後到火神死都是你拉。";
    }
    if (t < 19) return r === 3 ? "回場中，站王的北側 4～5 米。你是 H2：火神爆裂（18.5 秒）前按 1 上群盾，有盾全隊就不會被擊退；沒上會全隊撞牆。" : "回場中，站王的北側 4～5 米。火神爆裂的擊退由 H2 上盾擋掉，不用自己防擊退。";
    return "三連烈焰焚燒由 ST 在南側開無敵接，是朝南的正面扇形：留在王的北側。打完後換 MT 拉王。";
  }
  if (t < 66) {
    const fet = r === 1 || r === S.fetterDps ? `你和 ${ROLES[r === 1 ? S.fetterDps : 1]} 有炎獄之鎖，保持 ${CFG.fetterMax} 米內。` : "";
    if (swIdx(r, t) === 0 && t < 62) return `你被點灼熱：去${dirName(cd + 180)}邊場邊（相鄰兩根釘子的正對面），離所有人 ${CFG.swR} 米以上，每 6 秒炸一次。`;
    if ((r === 6 || r === 7) && t < 56) {
      const far = DIR_NAME[S.nailDirs[r === 6 ? 3 : 2]], own = DIR_NAME[S.nailDirs[r === 6 ? 0 : 1]], mate = DIR_NAME[S.nailDirs[r === 6 ? 1 : 0]], way = r === 6 ? "順時針" : "逆時針";
      return `你是地火誘導，你負責${far}和${own}兩根，各炸兩次（另外兩根是 ${r === 6 ? "D4" : "D3"} 的，別炸到）。42 秒前站到${far}釘子外側不動，吃第 1、2 圈（46、48 秒出圈）；第 2 圈快出來時起跑，${way}沿外圈跑向${own}釘子，第 3 圈（50 秒）放在快到的地方，第 4 圈（52 秒）貼著${own}釘子外側放。後兩圈都要留在${own}釘子「遠離${mate}」的那一側，放完往第一根釘子那邊回人群。${fet}`;
    }
    const order = S.killOrder.map((n) => DIR_NAME[S.nailDirs[n]]).join(" → ");
    if (r === 0) return `你拉著王：把王留在場中（開輔助預兆會有藍圈），自己貼在王的另一側，讓王的正面背對打釘子的人。王離你超過 3 米就會跟過來，要挪牠的位置就往反方向走把牠拖過去。現在打${DIR_NAME[curNailDir(t)]}釘子，所以你要站在王的${dirName(curNailDir(t) * 45 + 180)}側（貼著王 3 米內牠就不會再跟著動）；釘子打掉換下一根（順序 ${order}），你就跟著繞到新的對面。王正面對著人群超過 3 秒算失敗。${fet}`;
    return `打釘子，順序（逆Z）：${order}。先在第一根釘子靠場中的那側等，前兩圈地火（49、51 秒）炸完再貼上去打，打掉一根就走去下一根。王由 MT 留在場中、背對你們。別擋到場邊的灼熱補師和放地火的 D3、D4。${fet}`;
  }
  if (t < 78) return r === 0 ? "火神跳走，全隊回場中吃地獄之火炎。牠回來後仇恨還在你身上，不用再挑釁；吃完就把王往角落帶。" : "火神跳走，全隊回場中吃地獄之火炎。回來後還是 MT 拉王。";
  if (t < 97) {
    if (swIdx(r, t) === 1) return `你被點灼熱（第二次，30 秒）：先去人群對面那一側（${dirName(P - 135)}）的場邊，100 秒左右再移到${dirName(P - 90)}角。`;
    if ((r === 6 || r === 7) && t < 94) return `第二輪地火誘導：D3、D4 一起先去${dirName(P + 135)}邊場邊，圈出來後沿場邊跑回${dirName(P)}角的人群，四個圈放在路上。`;
    return r === 0 ? `你拉著王：往${dirName(P)}角走到貼場邊，王會跟過來停在你前面（離場中約 13 米）。兩隻分身會從南、東兩個正點同時衝過場中，只有斜角安全。` : `全隊貼${dirName(P)}角場邊。兩隻分身會從南、東兩個正點同時衝過場中，只有四個斜角安全。`;
  }
  if (t < 113.6) {
    if (swIdx(r, t) === 2) return `你是第三個被點灼熱的補師：去${dirName(P + 110)}邊場邊。兩個補師都帶灼熱，不進分攤。`;
    if (swIdx(r, t) === 1) return `你有灼熱：移到${dirName(P - 90)}角場邊，別回人群。`;
    return `烈焰碎擊（110 秒）：坦克和輸出在${dirName(P)}角擠在一起分攤，兩個補師帶灼熱不進來。`;
  }
  if (t < 129.5) {
    const opp = swIdx(r, t) === 2 ? 4 : 0, d = (n) => DIR_NAME[(S.k + n + opp) % 8], deg = S.realIdx % 2 === 0 ? 45 : 90;
    return `四連深紅旋風，四隻照釘子擊殺順序衝。${opp ? "你還帶著灼熱，在人群的正對面做同樣的事。" : ""}先到${d(1)}場邊（${opp ? "第 4 隻的正對面" : "第 4 隻的正前方"}）。看哪隻身上是藍火（本體）：這把是第 ${S.realIdx + 1} 隻，所以第 1 隻一衝完就順時針走 ${deg} 度到${d(deg === 45 ? 2 : 3)}。規則：藍火是第 1、3 隻走 45 度，第 2、4 隻走 90 度。這段開疾跑（Shift）。十字在藍火那隻衝完 2.1 秒後出現。`;
  }
  const F = dirName(finalDir() * 45), FO = dirName(finalDir() * 45 + 180);
  if (r === 6 || r === 7) return t < 147 ? `MT 在${F}邊場邊接王吃三連烈焰焚燒。你是地火誘導：焚燒期間就先走到${FO}邊場邊（離王最遠的地方），等 147 秒第三輪地火。` : `第三輪地火點你和 ${r === 6 ? "D4" : "D3"}：圈出來後${r === 6 ? "順時針" : "逆時針"}沿場邊一直跑，每 2 秒一個圈，別往人群帶，跑到火神死。`;
  if (r === 0) return `火神回來後仇恨還在你身上，王會跟著你：走到${F}邊貼場邊，讓王停在離場中約 12 米、面向場外，132 秒左右按 2 開無敵吃第二組三連烈焰焚燒（134、137、141 秒）。之後地火由 D3、D4 在對面場邊誘導。`;
  return `第二組由 MT 在${F}邊場邊接王吃三連烈焰焚燒：其他人站王靠場中的那一側。147 秒起第三輪地火由 D3、D4 在${FO}邊場邊誘導，別靠過去，打到死為止。`;
}

// ---------- 繪製 ----------
let cv, g, W = 600;
function toScreen(p) { const sc = (W / 2 / (CFG.R + 4)) * S.zoom, c = Math.cos(-S.cam), s = Math.sin(-S.cam); return { x: W / 2 + (p.x * c - p.y * s) * sc, y: W / 2 + (p.x * s + p.y * c) * sc }; }
function label(p, text, color, size = 12, dy = 0) { const q = toScreen(p); g.font = `600 ${size}px "Fira Sans",system-ui,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 3; g.strokeStyle = "rgba(2,6,23,.85)"; g.strokeText(text, q.x, q.y + dy); g.fillStyle = color; g.fillText(text, q.x, q.y + dy); }
function draw() {
  const sc = (W / 2 / (CFG.R + 4)) * S.zoom, t = S.t, role = S.opts.role;
  g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  g.fillStyle = "#020617"; g.fillRect(0, 0, W, W);
  g.save(); g.translate(W / 2, W / 2); g.rotate(-S.cam); g.scale(sc, sc);
  g.beginPath(); g.arc(0, 0, CFG.R, 0, 7); g.fillStyle = "#141a2e"; g.fill(); g.lineWidth = 0.5; g.strokeStyle = "#b4532a"; g.stroke();
  g.lineWidth = 0.05; g.strokeStyle = "rgba(255,255,255,.07)";
  for (const r of [5, 10, 15]) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
  for (let d = 0; d < 4; d++) { g.save(); g.rotate(rad(d * 45)); g.beginPath(); g.moveTo(0, -CFG.R); g.lineTo(0, CFG.R); g.stroke(); g.restore(); }
  for (const [, mx, my, col] of MARKERS) { g.beginPath(); g.arc(mx, my, 1.15, 0, 7); g.fillStyle = col + "33"; g.fill(); g.lineWidth = 0.12; g.strokeStyle = col + "aa"; g.stroke(); }
  g.save(); g.beginPath(); g.arc(0, 0, CFG.R, 0, 7); g.clip();
  for (const a of S.aoes) {
    if (a.assistOnly && !S.opts.assist) continue;
    if (t < a.t0) continue;
    if (a.isCross && t < a.t1 && !S.opts.assist) continue;
    const k = a.done ? 1 : clamp01((t - a.t0) / Math.max(a.t1 - a.t0, 0.01));
    if (a.done && !a.linger && t > a.t1 + 0.35) continue;
    a.draw(g, k);
  }
  g.restore();
  for (const s of swActive(t)) { const c = S.ents[s.who]; g.beginPath(); g.arc(c.x, c.y, CFG.swR, 0, 7); g.setLineDash([0.6, 0.6]); g.lineWidth = 0.15; g.strokeStyle = "rgba(255,90,90,.8)"; g.stroke(); g.setLineDash([]); }
  S.flashRings = S.flashRings.filter((f) => f.until > t);
  for (const f of S.flashRings) { g.beginPath(); g.arc(f.c.x, f.c.y, f.r, 0, 7); g.fillStyle = "rgba(255,200,120,.35)"; g.fill(); }
  if (fetterOn(t)) { const a = S.ents[1], b = S.ents[S.fetterDps]; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineWidth = 0.25; g.strokeStyle = dist(a, b) > CFG.fetterMax ? "#ff4d4d" : "#ffb347"; g.stroke(); }
  for (const n of nails(t)) { g.beginPath(); g.arc(n.pos.x, n.pos.y, 1 + 0.45 * Math.min(n.hits, 2), 0, 7); g.fillStyle = ["#7c2d12", "#c2410c", "#f97316"][Math.min(n.hits, 2)]; g.fill(); if (n.hits >= 2) { g.lineWidth = 0.18; g.strokeStyle = "#fde68a"; g.stroke(); } }
  const b = bossState(t);
  const drawIfrit = (pos, faceTo, real) => { g.beginPath(); g.arc(pos.x, pos.y, real ? 3 : 2.4, 0, 7); g.fillStyle = real ? "#c2410c" : "#9a3412"; g.fill(); g.lineWidth = 0.2; g.strokeStyle = "#fdba74"; g.stroke(); if (faceTo) { const a = Math.atan2(faceTo.y - pos.y, faceTo.x - pos.x); g.beginPath(); g.moveTo(pos.x + Math.cos(a) * 4.2, pos.y + Math.sin(a) * 4.2); g.lineTo(pos.x + Math.cos(a + 0.5) * 2.6, pos.y + Math.sin(a + 0.5) * 2.6); g.lineTo(pos.x + Math.cos(a - 0.5) * 2.6, pos.y + Math.sin(a - 0.5) * 2.6); g.closePath(); g.fillStyle = "#fdba74"; g.fill(); } };
  if (b.vis) drawIfrit(b.pos, t < 7.2 ? polar(S.bossCard * 90 + 180, 19.5) : S.tank === null ? { x: 0, y: 30 } : S.ents[S.tank], true);
  if (S.opts.assist && S.opts.role <= 1 && tankable(t) && b.vis) { const sp = bossSpot(t).pos; g.beginPath(); g.arc(sp.x, sp.y, 3.4, 0, 7); g.setLineDash([0.5, 0.5]); g.lineWidth = 0.14; g.strokeStyle = "rgba(76,194,255,.8)"; g.stroke(); g.setLineDash([]); } // 坦克輔助：王該在的位置
  if (t >= 91.8 && t < 95.7) for (const d of [180, 90]) drawIfrit(lerp(polar(d, 19.5), polar(d + 180, 19.5), clamp01((t - 94.8) / 0.35)), { x: 0, y: 0 }, false);
  const ds = dashers(t);
  for (const c of ds) { drawIfrit(c.pos, { x: 0, y: 0 }, c.real); if (c.real) { g.beginPath(); g.arc(c.pos.x, c.pos.y, 3.7, 0, 7); g.lineWidth = 0.45; g.strokeStyle = "#60a5fa"; g.stroke(); } } // 本體身上是藍火
  for (const e of S.ents) {
    g.beginPath(); g.arc(e.x, e.y, 0.75, 0, 7); g.fillStyle = ROLE_COLOR[e.i]; g.globalAlpha = e.i === role ? 1 : 0.8; g.fill(); g.globalAlpha = 1;
    if (e.i === role) { g.lineWidth = 0.22; g.strokeStyle = "#fff"; g.stroke(); g.beginPath(); g.moveTo(e.x + Math.cos(e.face) * 1.5, e.y + Math.sin(e.face) * 1.5); g.lineTo(e.x + Math.cos(e.face + 2.5) * 0.8, e.y + Math.sin(e.face + 2.5) * 0.8); g.lineTo(e.x + Math.cos(e.face - 2.5) * 0.8, e.y + Math.sin(e.face - 2.5) * 0.8); g.closePath(); g.fillStyle = "#fff"; g.fill(); }
    if (S.crushMark && S.crushMark.until > t && S.crushMark.who === e.i) { g.beginPath(); g.arc(e.x, e.y, CFG.stackR, 0, 7); g.lineWidth = 0.2; g.strokeStyle = "#ffd166"; g.stroke(); }
  }
  g.restore();
  DIR_NAME.forEach((m, d) => label(polar(d * 45, CFG.R + 2), m, d === 0 ? "#f8fafc" : d % 2 ? "rgba(174,185,204,.45)" : "#aeb9cc", d % 2 ? 11 : 13));
  for (const [name, mx, my, col] of MARKERS) label({ x: mx, y: my }, name, col, 11);
  for (const n of nails(t)) { label(n.pos, String(n.order + 1), "#fff", 12); if (t < 56) label(n.pos, `${Math.min(n.hits, 2)}/2`, n.hits >= 2 ? "#fde68a" : "#aeb9cc", 10, 15); }
  for (const c of ds) { if (S.opts.assist) label(c.pos, String(c.n + 1), "#fff", 13); if (c.real) label(c.pos, "藍火", "#93c5fd", 11, 22); }
  for (const e of S.ents) label(e, e.i === role ? "你 " + ROLES[e.i] : ROLES[e.i], e.i === role ? "#fff" : "#cbd5e1", e.i === role ? 12 : 10, -15);
  for (const s of swActive(t)) label(S.ents[s.who], "灼熱", "#ff8080", 10, 14);
  // 詠唱條
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop();
  if (c) { const w = W * 0.5, x = (W - w) / 2, y = 14; g.fillStyle = "rgba(2,6,23,.8)"; g.fillRect(x, y, w, 20); g.fillStyle = "#c2410c"; g.fillRect(x, y, w * clamp01((t - c.t0) / (c.t1 - c.t0)), 20); g.strokeStyle = "#fdba74"; g.lineWidth = 1; g.strokeRect(x, y, w, 20); g.font = '600 13px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.name, W / 2, y + 11); }
  if (S.over || S.paused) {
    g.fillStyle = "rgba(2,6,23,.72)"; g.fillRect(0, 0, W, W); g.textAlign = "center"; g.textBaseline = "middle";
    g.font = '800 30px "Fira Sans",system-ui,sans-serif'; g.fillStyle = S.paused && !S.over ? "#f8fafc" : S.over.win ? "#5fd08a" : "#ff6b6b";
    g.fillText(S.paused && !S.over ? "暫停" : S.over.win ? "通過" : "你死了", W / 2, W / 2 - 40);
    g.font = '500 15px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#f8fafc";
    if (S.over) wrapText(S.over.reason, W / 2, W / 2, W * 0.8, 22);
    g.fillStyle = "#aeb9cc"; g.fillText(S.over ? "按 R 從這一段重來" : "按 P 繼續", W / 2, W / 2 + 80);
  }
}
function wrapText(text, x, y, maxW, lh) { let line = ""; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); y += lh; line = ch; } else line += ch; } g.fillText(line, x, y); }

function updateHud() {
  const t = S.t, $ = (id) => document.getElementById(id), r = S.opts.role;
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop();
  $("castbar").hidden = !c;
  if (c) { $("castfill").style.width = clamp01((t - c.t0) / (c.t1 - c.t0)) * 100 + "%"; $("castname").textContent = c.name; }
  const st = [];
  if (hasSw(r, t)) st.push("灼熱");
  if (fetterOn(t) && (r === 1 || r === S.fetterDps)) st.push("炎獄之鎖");
  if (r <= 1 && S.fireRes[r]) st.push("火耐性下降");
  if (r <= 1) st.push(S.tank === r ? "仇恨在你身上" : "仇恨不在你身上");
  if (S.crushMark && S.crushMark.until > t && S.crushMark.who === r) st.push("烈焰碎擊點名");
  if (S.buff.shield > t) st.push("群盾"); if (S.buff.invuln > t) st.push("無敵"); if (S.buff.sprint > t) st.push("衝刺");
  $("statusline").textContent = st.join(" · ");
  const ov = $("overlay"); ov.hidden = !(S.over || S.paused);
  if (!ov.hidden) {
    const win = S.over && S.over.win;
    $("ovTitle").textContent = S.paused && !S.over ? "暫停" : win ? "通過" : "你死了"; $("ovTitle").className = S.paused && !S.over ? "" : win ? "win" : "dead";
    $("ovReason").textContent = S.over ? S.over.reason : ""; $("ovHint").textContent = S.over ? "按 R 從這一段重來" : "按 P 繼續";
  }
}
function updatePanel() {
  const t = S.t, $ = (id) => document.getElementById(id);
  $("clock").textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  $("hint").textContent = S.opts.hints ? hint() : "（提示已關閉）";
  $("upcoming").innerHTML = S.tl.filter((e) => e.t > t).slice(0, 6).map((e) => `<li><span>${(e.t - t).toFixed(1)}s</span>${e.name}</li>`).join("");
  $("log").innerHTML = S.log.map((l) => `<li>${l.msg}</li>`).join("");
  const sk = (id, key, cd, buff, ok = true) => { const el = $(id); el.disabled = !ok || cd > t; el.classList.toggle("on", buff > t); el.querySelector("i").textContent = !ok ? "—" : buff > t ? `生效 ${(buff - t).toFixed(0)}s` : cd > t ? `冷卻 ${(cd - t).toFixed(0)}s` : "可用"; };
  sk("skShield", "shield", S.cd.shield, S.buff.shield, S.opts.role === 3);
  sk("skInvuln", "invuln", S.cd.invuln, S.buff.invuln, S.opts.role <= 1);
  sk("skProvoke", "provoke", S.cd.provoke, -1, S.opts.role <= 1);
  sk("skShirk", "shirk", S.cd.shirk, -1, S.opts.role <= 1);
  sk("skSprint", "sprint", S.cd.sprint, S.buff.sprint);
}

function init() {
  cv = document.getElementById("arena"); g = cv.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const cv3 = $("arena3d"), vp = $("viewport");
  const has3d = typeof View3D !== "undefined" && View3D.init(cv3);
  if (!has3d) { S.opts.view = "top"; $("view").value = "top"; $("view").disabled = true; } // 3D 函式庫沒載到（離線）時退回俯視
  let W3 = 800, H3 = 500;
  const fit = () => {
    const box = vp.parentElement.getBoundingClientRect(), game = S.opts.view === "game";
    vp.classList.toggle("game", game);
    W = Math.max(320, Math.floor(Math.min(box.width, window.innerHeight - 24))); cv.style.width = cv.style.height = W + "px"; cv.width = cv.height = W * devicePixelRatio;
    W3 = Math.max(320, Math.floor(box.width)); H3 = Math.max(240, Math.floor(Math.min(window.innerHeight - 24, W3 * 0.66))); cv3.style.width = W3 + "px"; cv3.style.height = H3 + "px";
    vp.style.width = (game ? W3 : W) + "px"; vp.style.height = (game ? H3 : W) + "px";
  };
  fit(); addEventListener("resize", fit);
  $("view").addEventListener("change", (e) => { S.opts.view = e.target.value; fit(); e.target.blur(); });
  $("role").innerHTML = ROLES.map((r, i) => `<option value="${i}">${r}</option>`).join(""); $("role").value = S.opts.role;
  $("start").innerHTML = CHECKPOINTS.map((c) => `<option value="${c.t}">${c.name}</option>`).join("");
  const bind = (id, key, conv, restart) => $(id).addEventListener("change", (e) => { S.opts[key] = conv(e.target); if (restart) reset(); e.target.blur(); });
  bind("role", "role", (el) => +el.value, true); bind("start", "start", (el) => +el.value, true); bind("speed", "speed", (el) => +el.value, false);
  bind("full", "full", (el) => el.value === "1", true);
  bind("assist", "assist", (el) => el.checked, false); bind("hints", "hints", (el) => el.checked, false); bind("god", "god", (el) => el.checked, false);
  $("restart").addEventListener("click", (e) => { reset(); e.target.blur(); });
  $("skShield").addEventListener("click", () => useSkill("shield")); $("skInvuln").addEventListener("click", () => useSkill("invuln")); $("skProvoke").addEventListener("click", () => useSkill("provoke")); $("skShirk").addEventListener("click", () => useSkill("shirk")); $("skSprint").addEventListener("click", () => useSkill("sprint"));
  addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
    S.keys[e.code] = true;
    if (e.code === "KeyR") reset();
    if (e.code === "KeyP" || e.code === "Escape") S.paused = !S.paused;
    if (e.code === "Digit1") useSkill("shield");
    if (e.code === "Digit2") useSkill("invuln");
    if (e.code === "Digit3") useSkill("provoke");
    if (e.code === "Digit4") useSkill("shirk");
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") useSkill("sprint");
    if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) e.preventDefault();
  });
  addEventListener("keyup", (e) => { S.keys[e.code] = false; });
  addEventListener("blur", () => { S.keys = {}; });
  let drag = null;
  for (const el of [cv, cv3]) {
    el.addEventListener("mousedown", (e) => { drag = [e.clientX, e.clientY]; e.preventDefault(); });
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  addEventListener("mousemove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; drag = [e.clientX, e.clientY];
    if (S.opts.view === "game") { S.cam += dx * 0.006; S.pitch = Math.max(0.08, Math.min(1.4, S.pitch + dy * 0.004)); } // 遊戲視角：左右轉、上下調俯角
    else S.cam += dx * 0.008;
  });
  addEventListener("mouseup", () => { drag = null; });
  cv.addEventListener("wheel", (e) => { S.zoom = Math.max(0.7, Math.min(2, S.zoom * (e.deltaY < 0 ? 1.08 : 0.92))); e.preventDefault(); }, { passive: false });
  cv3.addEventListener("wheel", (e) => { S.dist = Math.max(4, Math.min(26, S.dist * (e.deltaY < 0 ? 0.92 : 1.08))); e.preventDefault(); }, { passive: false });
  const bv = $("build"); if (bv) bv.textContent = "版本 " + BUILD;
  reset();
  let last = performance.now();
  const loop = (now) => {
    const real = Math.min((now - last) / 1000, 0.05); last = now;
    if (S.keys.KeyQ) S.cam -= real * 1.8; if (S.keys.KeyE) S.cam += real * 1.8;
    let left = real * S.opts.speed; while (left > 0) { const d = Math.min(left, 0.02); step(d); left -= d; }
    if (S.opts.view === "game" && has3d) { View3D.render(W3, H3); updateHud(); } else draw();
    updatePanel(); requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
if (typeof document !== "undefined") addEventListener("DOMContentLoaded", init);
if (typeof module !== "undefined") module.exports = { S, CFG, ROLES, reset, step, home, dangerAt, npcTarget, useSkill, END_T, KILL_T };
