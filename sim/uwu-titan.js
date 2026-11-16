// 絕神兵・泰坦階段 機制模擬器（前 62 秒：自殺、隆起擊飛、三連石牢）
// 時間、站位、擊飛距離、炸彈排列依 FFLogs 8 筆擊殺的詳細 log 與回放整理（0 秒＝泰坦第一次地裂落地）。
// 判定範圍（大地之重、炸彈、山崩寬度等）為估計值，集中在 CFG。畫面層共用 uwu-view3d.js。
"use strict";

const BUILD = "1116-18";
const CFG = {
  R: 16,            // 地裂後的場地半徑（回放：玩家最遠只到 15.8）
  speed: 6,
  crushR: 11,       // 第一次地裂：離落點多近會死（估）
  crush2R: 22,      // 第二次地裂：要站到正對面場邊（回放都離 28～29 米）
  wotlR: 5,         // 大地之重半徑（估）
  bombLandR: 2.2,   // 炸彈落地範圍（估）
  bombR: 5,         // 炸彈爆炸半徑（估：回放落點離最近的炸彈 6.7 米存活；設 5 讓起點有 ±0.35 米左右的容許）
  kb: 24,           // 隆起擊飛距離（回放實測：30 個樣本 26 個落在 23.7～24.0）
  slideHalf: 2,     // 山崩半寬（由回放反推：五條線夾角 45 度，石牢三人站在兩條線之間 2.5 米處存活）
  chainFirst: 6.8,  // 第一個石牢要在第六顆炸彈的爆炸範圍內
  chain: 7.6,       // 石牢之間連鎖引爆的距離（估：回放間距 6.3～7）
  coneHalf: Math.PI / 4,
  swR: 14, stackR: 4.5, fetterMax: 10, // 畫面層需要的欄位（泰坦階段用不到）
};
const ROLES = ["MT", "ST", "H1", "H2", "D1", "D2", "D3", "D4"];
const ROLE_COLOR = ["#6096ff", "#6096ff", "#5fd08a", "#5fd08a", "#ff7b7b", "#ff7b7b", "#ff7b7b", "#ff7b7b"];
const DIR_NAME = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"];
const MARKERS = [["A", 0, -6.5, "#ff6b6b"], ["B", 6.5, 0, "#ffd166"], ["C", 0, 6.5, "#6096ff"], ["D", -6.5, 0, "#c084fc"], ["1", 0, 0, "#ff6b6b"]];
const DIE = [1, 4, 5, 6];   // 自殺：ST＋三名輸出（回放 10/10 是 3 輸出＋1 坦克）
const GAOL = [3, 2, 7];     // 石牢站位（回放 8/8）：H2（盾補）離泰坦最遠、最先炸開 → H1（純補）在場中 → D4（法系）最靠泰坦、最後炸開
const CHECKPOINTS = [{ t: -4, name: "開場：地裂、死刑" }, { t: 17.5, name: "大地之重（自殺）" }, { t: 27.5, name: "第二次地裂、隆起擊飛、石牢" }, { t: 62, name: "後半：大地之重、山崩" }, { t: 78, name: "第三次地裂、第四個石牢" }, { t: 99, name: "山崩、換坦死刑" }, { t: 119, name: "四顆炸彈繞場" }];
const END_T = 157;

const rad = (deg) => (deg * Math.PI) / 180;
const polar = (deg, r) => ({ x: Math.sin(rad(deg)) * r, y: -Math.cos(rad(deg)) * r });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const S = { opts: { role: 7, start: -4, speed: 1, assist: true, hints: true, god: false, view: "game" }, pitch: 0.42, dist: 15 };
// 第二次地裂的方位決定整個座標框：以下站位都用「泰坦在北 (0,-14)」來寫，再用 F() 轉成實際方位。
// 回放裡四個方位各自的炸彈缺口：北 (-5,12)、南 (-5,-12)、西 (12,-5)、東 (-12,5)。
const FRAME = [(x, y) => ({ x, y }), (x, y) => ({ x: -y, y: -x }), (x, y) => ({ x, y: -y }), (x, y) => ({ x: y, y: x })];
const F = (x, y) => FRAME[S.g2](x, y);
const TITAN2 = () => F(0, -14);
const BOMBS = [[5, 5], [-5, 5], [5, 12], [11, 11], [-11, 11]], GAP = [-5, 12];
const LAND = [-4.5, 14.2];
function stackSpot() { const u = { x: LAND[0], y: LAND[1] + 14 }, n = Math.hypot(u.x, u.y); return F((u.x / n) * 4.6, -14 + (u.y / n) * 4.6); } // 泰坦腳前 4.6 米、在「泰坦→缺口」的線上
const GAOL_SPOT = [[-3, 6], [0, 0], [0, -7]];

function reset() {
  const o = S.opts, rnd = mulberry32((Date.now() ^ (Math.random() * 1e9)) | 0);
  S.rnd = rnd; S.t = o.start; S.over = null; S.paused = false;
  S.aoes = []; S.casts = []; S.tl = []; S.log = []; S.flashRings = []; S.props = []; S.crushMark = null;
  S.keys = S.keys || {}; S.cam = S.cam || 0; S.zoom = S.zoom || 1;
  S.buff = { sprint: -1 }; S.cd = { sprint: 0, provoke: 0 };
  S.g2 = Math.floor(rnd() * 4);
  S.g3 = (S.g2 + 1 + Math.floor(rnd() * 3)) % 4;   // 第三次地裂：另外三個正點隨機（回放 8 筆：對面 4、順 90 度 3、逆 90 度 1）
  S.g4 = 2 + Math.floor(rnd() * 2);                // 第四個石牢：隨機點一個補師
  S.bomb0 = Math.floor(rnd() * 4);                 // 最後四顆炸彈：第一顆的角落隨機，之後固定順時針
  S.tank = o.start < 3 ? null : o.start >= 104 && o.start < 119.6 ? 1 : 0; // 泰坦出場時仇恨重置，MT 要挑釁（回放 7/8 筆在落地後 2.5～5.6 秒按）
  S.fetterDps = 4; S.bossCard = 0; S.bossDyn = null;
  S.stun = -1; S.jailed = {}; S.freed = {}; S.gaols = []; S.slide = []; S.gaol4 = null;
  S.wotl = [0, 0, 0, 0, 0, 0, 0, 0];
  S.ents = ROLES.map((_, i) => ({ ...home(i, o.start), i, face: 0, dead: o.start > 27.3 && o.start < 50.6 && DIE.includes(i) }));
  S.events = buildEvents().filter((e) => e.t >= o.start - 1e-6).sort((a, b) => a.t - b.t);
  S.evIdx = 0;
  if (o.start > 36 && o.start < 41.5) placeBombs();
}
const alive = (i) => !S.ents[i].dead;
function placeBombs() { S.props = BOMBS.map(([x, y]) => ({ type: "bomb", pos: F(x, y) })); }

// ---------- 泰坦 ----------
const D3 = () => S.g3 * 90, G3 = () => polar(D3(), 14);
function bossSpot(t) {
  if (t < 0) return { pos: { x: 0, y: 0 }, vis: false };
  if (t < 27.5) return { pos: { x: 0, y: 0 }, vis: true };                       // 25.3 秒起不可選中，轉身面向要跳過去的那一邊
  if (t < 30.5) { const k = clamp01((t - 27.5) / 2.8); return { pos: lerp({ x: 0, y: 0 }, TITAN2(), k), vis: true, alt: Math.sin(k * Math.PI) * 14 }; }
  if (t < 81.5) return { pos: lerp(TITAN2(), F(0, -9), clamp01((t - 66) / 5)), vis: true }; // 後半：坦克把泰坦往場中帶一點
  if (t < 84.3) { const k = clamp01((t - 81.5) / 2.8); return { pos: lerp(F(0, -9), G3(), k), vis: true, alt: Math.sin(k * Math.PI) * 14 }; } // 第三次地裂
  if (t < 124) return { pos: lerp(G3(), polar(D3(), 7), clamp01((t - 88) / 4)), vis: true };
  if (t < 135) { const k = clamp01((t - 124) / 5.5); return { pos: polar(D3() - 108 * k, 7 + 2.5 * k), vis: true }; }      // 四顆炸彈：泰坦跟著 MT 逆時針移動
  return { pos: lerp(polar(D3() - 108, 9.5), polar(D3() - 135, 8.5), clamp01((t - 135) / 4)), vis: true };
}
function bossLook(t) {
  if (t >= 25.3 && t < 30.5) return TITAN2(); if (t >= 30.5 && t < 32.9) return { x: 0, y: 0 };
  if (t >= 79.3 && t < 84.3) return G3(); if (t >= 84.3 && t < 86.9) return { x: 0, y: 0 };
  const h = S.tank === null ? 7 : S.tank; return alive(h) ? S.ents[h] : { x: 0, y: 0 };
}
const jumping = (t) => (t >= 25.3 && t < 32.9) || (t >= 79.3 && t < 86.9);
const bossState = bossSpot;
const tankable = () => false;
// 畫面層共用介面：泰坦階段沒有這些東西
const dashers = () => [], nails = () => [], swActive = () => [], hasSw = () => false, fetterOn = () => false;
function sceneActors(t) { const b = bossSpot(t); return b.vis ? [{ pos: b.pos, alt: b.alt || 0, look: bossLook(t), real: false, tag: "", color: 0xa16207 }] : []; }
function sceneGuides(t) { // 輔助預兆：擊飛落點線、石牢站位、MT 山崩站位
  if (!S.opts.assist) return [];
  const out = [], kp = kbPreview();
  if (kp) out.push({ type: "line", a: kp.from, b: kp.to, color: kp.bad ? "#ff4d4d" : "#4cc2ff" }, { type: "ring", pos: kp.to, color: kp.bad ? "#ff4d4d" : "#4cc2ff" });
  if (t >= 41.1 && t < 46.2) for (const [x, y] of GAOL_SPOT) out.push({ type: "ring", pos: F(x, y), color: "#ffd166" });
  if (S.opts.role === 0 && t >= 39.1 && t < 43.5) out.push({ type: "ring", pos: F(-8, 5.4), color: "#4cc2ff" });
  return out;
}

// ---------- NPC 站位（回放） ----------
function home(i, t) {
  if (t < 0.4) return polar(200 + i * 20, 15);                                  // 地裂前貼場邊散開
  if (t < 18.9) return i === 0 ? { x: 0, y: 4.5 } : { x: (i - 4) * 0.5, y: -6.2 }; // 泰坦在場中：MT 在南，其他人在北
  if (t < 21.95) return i === 0 ? { x: -6.5, y: 0 } : { x: 6.2 + (i % 2) * 0.4, y: -0.6 + (i % 3) * 0.5 }; // 第一發大地之重：全員往東 6 米，MT 往西
  if (t < 27.4) return i === 0 ? { x: 0, y: 5 } : DIE.includes(i) ? { x: 6.2 + (i % 2) * 0.4, y: -0.6 + (i % 3) * 0.5 } : { x: (i - 4) * 0.6, y: -6.5 }; // 第二發：自殺的人留在東邊不動，其他人回北邊
  if (t < 33.5) return F((i - 3.5) * 0.4, 15);                                  // 第二次地裂：站到泰坦正對面的場邊
  if (t < 39.2) return stackSpot(); // 隆起：全員疊在同一點（泰坦腳前、對準炸彈缺口）。這裡差 0.3 米，落點就差快 2 米
  if (t < 46.2) { const g = GAOL.indexOf(i); if (g >= 0) return F(...GAOL_SPOT[g]); return t < 43.5 ? F(-8, 5.4) : F(-13.5, 0); } // 石牢三人排成一條鏈；MT 在山崩詠唱開始（43.4 秒）時站在偏西 22 度的位置，讓石牢三人落在兩條線中間，之後再往側邊走
  if (t < 62) return i === 0 ? F(-13.5, -3) : S.ents ? S.ents[i] : F(0, 0);
  const d3 = D3(), o = (i - 3.5);
  if (t < 65.2) return F(-6 + (i % 3) * 0.3, -13);                 // 激震後：全員貼在泰坦旁邊
  if (t < 68.2) return F(4.5, -13);                                // 大地之重 1 出圈：整群穿過泰坦走到另一側
  if (t < 76 && i === 0 && t >= 68.2) return F(3.1, -1.6);         // MT：站在偏離人群 22.5 度的方向，讓人群落在兩條山崩線中間
  if (t < 76) return F(o * 0.5, 5);                                // 山崩 ×2：人群在泰坦正對面，第二波換位
  if (t < 81.5) return F(o * 0.3, 2);
  if (t < 86.9) return polar(d3 + 180 + o * 0.8, 11);              // 第三次地裂：泰坦面向的正對面、離場中 11 米，全員疊在一起
  const mtSide = () => { const T = polar(d3, 7), a = rad(d3 + 180 + 22.5); return { x: T.x + Math.sin(a) * 12, y: T.y - Math.cos(a) * 12 }; }; // 泰坦對面偏 22.5 度
  if (t < 99) return i === S.g4 ? { x: 0, y: 0 } : i === 0 ? (t < 93 ? polar(d3, 3.5) : mtSide()) : polar(d3 + 180 + o * 14, 2.2); // 第四個石牢放在場中，其他人圍著打
  if (t < 104.5) { return i !== 0 ? polar(d3 + 180 + o * 4, 8.5) : mtSide(); } // 山崩 ×2：人群退到泰坦對面；MT 偏 22.5 度，把線帶開
  if (t < 119.6) return i === 1 ? polar(d3, 10.5) : polar(d3 + 180 + o * 20, 1.2); // ST 接手吃兩個死刑：站泰坦外側；其他人在場中
  if (t < 123.4) return polar(d3 + o * 0.6, 10.6);                 // 四顆炸彈前：全員疊到泰坦外側的場邊
  if (t < 135.5) { const k = clamp01((t - 123.4) / 9.6); return i === 0 ? polar(d3 - Math.min(235, 23.75 * Math.max(0, t - 123.4)), 10.8) : polar(d3 + 152 * k + o * 0.5, 10.6); } // MT 要跑在泰坦前面一段，山崩鎖定後繼續沿外圈彎開 // 人群順時針、MT 逆時針沿外圈繞
  if (t < 147) return i === 0 ? polar(d3 - 135, 11.5) : polar(i * 45, 1.2); // MT 吃最後兩個死刑；其他人在場中
  return i === 0 ? polar(d3 - 135, 11.5) : polar(i * 45, 3);
}

// ---------- 判定形狀 ----------
function addAoe(a) { S.aoes.push({ linger: 0, assistOnly: false, done: false, ...a }); }
const circleAoe = (c, r) => ({ shape: { type: "circle", c, r }, hit: (p, m = 0) => dist(p, c) <= r + m, draw: (g, k) => { g.beginPath(); g.arc(c.x, c.y, r, 0, 7); fillAoe(g, k); } });
function rectAoe(from, ang, half, len) { // 從 from 沿 ang（弧度）射出的長條
  const ux = Math.cos(ang), uy = Math.sin(ang);
  return {
    shape: { type: "rect", from, ang, half, len },
    hit: (p, m = 0) => { const dx = p.x - from.x, dy = p.y - from.y, along = dx * ux + dy * uy; return along >= -1 && along <= len && Math.abs(-dx * uy + dy * ux) <= half + m; },
    draw: (g, k) => { g.save(); g.translate(from.x, from.y); g.rotate(ang); g.beginPath(); g.rect(0, -half, len, half * 2); fillAoe(g, k); g.restore(); },
  };
}
function coneAoe(from, to, half, len) {
  const ang = () => Math.atan2(to().y - from().y, to().x - from().x);
  return {
    shape: { type: "cone", from, to, half, len },
    hit: (p, m = 0) => { const f = from(), d = dist(p, f); if (d > len) return false; if (d < 0.01) return true; let da = Math.atan2(p.y - f.y, p.x - f.x) - ang(); da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) <= half + m / Math.max(d, 1); },
    draw: (g, k) => { const f = from(), a = ang(); g.beginPath(); g.moveTo(f.x, f.y); g.arc(f.x, f.y, len, a - half, a + half); g.closePath(); fillAoe(g, k); },
  };
}
function fillAoe(g, k) { g.fillStyle = `rgba(255,150,40,${0.14 + 0.3 * k})`; g.fill(); g.lineWidth = 0.12; g.strokeStyle = `rgba(255,190,90,${0.5 + 0.4 * k})`; g.stroke(); }
const flash = (msg) => { S.log.unshift({ msg, t: S.t }); S.log.length = Math.min(S.log.length, 6); };
function die(reason) { if (S.opts.god) return flash("（觀摩模式）" + reason); if (!S.over) S.over = { win: false, reason, t: S.t }; }
function kill(i, why) { // 有人被打死：玩家死在該自殺的時候不算失敗
  const e = S.ents[i]; if (e.dead) return; const me = i === S.opts.role;
  if (DIE.includes(i) && S.t > 18 && S.t < 27.4) { e.dead = true; flash(`${ROLES[i]} 自殺（${why}）${me ? "：正確，等復活" : ""}`); return; }
  if (me) return die(why);
  e.dead = true; die(`${ROLES[i]} 被打死：${why}`); // 該活著的隊友死了就算失敗
}

function buildEvents() {
  const ev = [], at = (t, run, name) => { ev.push({ t, run }); if (name) S.tl.push({ t, name }); };
  const cast = (name, t0, t1) => S.casts.push({ name, t0, t1 });
  const me = () => S.ents[S.opts.role], boss = () => bossSpot(S.t).pos;
  const hitAll = (test, why, skipJailed = true) => { for (const e of S.ents) if (!e.dead && !(skipJailed && (S.jailed[e.i] || S.freed[e.i] > S.t)) && test(e)) kill(e.i, why); };

  cast("地裂", -3, 0);
  at(-3, () => addAoe({ ...circleAoe({ x: 0, y: 0 }, CFG.crushR), t0: S.t, t1: 0, onHit() { hitAll((e) => this.hit(e), "離第一次地裂的落點太近（要貼場邊）"); } }), "地裂（泰坦落在場中）");
  at(3.5, () => { if (S.tank === null && S.opts.role !== 0) { S.tank = 0; flash("MT 挑釁接泰坦"); } }, "MT 挑釁接泰坦");
  at(10, () => { if (S.tank !== 0) die(S.opts.role === 0 ? "你是 MT：泰坦出場會重置仇恨，落地後要按 3 挑釁接王（10 秒前）" : "泰坦要由 MT 接：仇恨不在 MT 身上"); });
  cast("大地之怒", 2.4, 5.4); at(5.4, () => flash("大地之怒：全場傷害"), "大地之怒（全場）");
  const buster = (t, nm, who) => {
    cast(nm, t - 1.2, t);
    const holder = () => (S.tank === null ? 7 : S.tank);
    at(t - 1.5, () => addAoe({ ...coneAoe(boss, () => S.ents[holder()], CFG.coneHalf, 12), t0: S.t, t1: t, assistOnly: true, skip: [0, 1], onHit() { const h = holder(); hitAll((e) => e.i !== h && this.hit(e), `站在泰坦正面吃到${nm}（非接王的人站泰坦背後）`); } }), `${nm}（${who} 死刑）`);
  };
  buster(13.6, "岩石破壞", "MT"); buster(16.8, "山崩破壞", "MT");
  // 大地之重：每個人腳下一個圈，3 秒後爆。兩發，第二發是自殺用的
  const wotl = (t, label, suicide, msg) => {
    cast("大地之重", t - 3, t - 0.5);
    at(t - 3, () => {
      const pts = []; for (const e of S.ents) if (!e.dead && !S.jailed[e.i] && !pts.some((p) => dist(p, e) < 0.25)) pts.push({ x: e.x, y: e.y });
      for (const c of pts) addAoe({ ...circleAoe(c, CFG.wotlR), t0: S.t, t1: t, suicide, onHit() { for (const e of S.ents) { if (e.dead || !this.hit(e)) continue; if (e.i <= 1 && S.t < 30) { if (++S.wotl[e.i] >= 2) kill(e.i, "坦克連吃兩個大地之重"); } else kill(e.i, "站在大地之重裡"); } } });
      if (msg) flash(msg);
    }, label);
  };
  wotl(21.9, "大地之重 1/2", false, "大地之重 1：每個人腳下出圈，全員移開");
  wotl(24.9, "大地之重 2/2（ST、D1、D2、D3 自殺）", true, "大地之重 2：自殺的四個人留在圈裡，其他人走開");
  at(25.3, () => flash("泰坦轉身了：牠面向哪邊就會跳到哪邊，往反方向跑"), "泰坦轉向（看面向）");
  at(27.4, () => {
    for (const i of DIE) if (alive(i)) { if (i === S.opts.role) return die("你該自殺卻沒死：石牢會點到你，順序就亂了（第二發大地之重要留在圈裡）"); S.ents[i].dead = true; }
    for (const i of [0, 2, 3, 7]) if (!alive(i) && i !== S.opts.role) S.ents[i].dead = false;
    flash("四人已自殺：石牢只會點 H2、H1、D4。復活先讀好，死的人晚點再接");
  });
  cast("地裂", 27.5, 30.5);
  at(27.5, () => { const T = TITAN2(); addAoe({ ...circleAoe(T, CFG.crush2R), t0: S.t, t1: 30.5, onHit() { hitAll((e) => this.hit(e), "離第二次地裂的落點太近（要站到正對面的場邊）"); } }); }, "地裂（泰坦跳到場邊）");
  // 炸彈岩 ×5：缺一格
  at(35.2, () => { for (const [x, y] of BOMBS) { const c = F(x, y); addAoe({ ...circleAoe(c, CFG.bombLandR), t0: S.t, t1: 36, onHit() { hitAll((e) => this.hit(e), "被落下的炸彈岩砸到"); } }); } }, "炸彈岩 ×5 落下");
  at(36, () => placeBombs());
  at(38.1, () => { for (const [x, y] of BOMBS) { const c = F(x, y); addAoe({ ...circleAoe(c, CFG.bombR), t0: S.t, t1: 41.5, onHit() { hitAll((e) => this.hit(e), "被炸彈岩炸到（擊飛落點不在缺口）"); } }); } });
  at(41.5, () => { S.props = S.props.filter((p) => p.type !== "bomb" || p.sixth); flash("炸彈岩爆炸"); }, "炸彈岩爆炸");
  // 隆起：從泰坦往外擊飛 24 米，暈 2 秒
  cast("隆起", 35.1, 39.1);
  at(39.1, () => {
    const T = TITAN2();
    for (const e of S.ents) {
      if (e.dead) continue;
      const d = Math.max(dist(e, T), 0.01); e.x += ((e.x - T.x) / d) * CFG.kb; e.y += ((e.y - T.y) / d) * CFG.kb;
      if (Math.hypot(e.x, e.y) > CFG.R) { kill(e.i, "被隆起擊飛出場外（起點沒對準缺口，或離泰坦太遠）"); if (S.over) return; }
    }
    S.stun = S.t + 2; flash("隆起：擊飛 24 米，暈眩 2 秒");
  }, "隆起（擊飛 24 米）");
  at(41.2, () => flash("石牢點名：H2、H1、D4"), "石牢點名 ×3");
  at(43.2, () => { const c = F(...GAP); addAoe({ ...circleAoe(c, CFG.bombLandR), t0: S.t, t1: 44, onHit() { hitAll((e) => this.hit(e), "被第六顆炸彈岩砸到（落地後要離開缺口）"); } }); }, "第六顆炸彈岩落在缺口");
  at(44, () => S.props.push({ type: "bomb", pos: F(...GAP), sixth: true }));
  // 山崩：五條線，中間那條對準 MT，另外四條偏 ±45、±135 度；詠唱開始時鎖定方向
  // 山崩：五條線（中間那條對準接王的坦克，其餘偏 ±45、±135 度），詠唱開始時鎖定。
  // 每次都是兩波：第二波是同一組線轉 22.5 度，剛好補在第一波的空隙（log：兩波的面向差 0.38～0.42 弧度）
  const slide = (t, second) => {
    cast("山崩", t - 2.2, t);
    at(t - 2.2, () => {
      if (!second) { const T = { ...bossSpot(S.t).pos }, tk = S.ents[S.tank === null ? 0 : S.tank]; S.slideRef = { T, a0: Math.atan2(tk.y - T.y, tk.x - T.x) }; }
      const { T, a0 } = S.slideRef, base = a0 + (second ? rad(22.5) : 0);
      for (const off of [0, 45, -45, 135, -135]) addAoe({ ...rectAoe(T, base + rad(off), CFG.slideHalf, 40), t0: S.t, t1: t, onHit() { hitAll((e) => this.hit(e), "被山崩打到"); } });
    }, second ? "山崩第二波（轉 22.5 度補空隙）" : "山崩（五條線，中間對準接王的坦克）");
  };
  slide(45.6); slide(50, true);
  at(46.1, () => {
    for (const i of GAOL) if (alive(i)) { S.jailed[i] = true; S.gaols.push({ who: i, pos: { x: S.ents[i].x, y: S.ents[i].y }, broken: false }); }
    S.props.push(...S.gaols.map((g) => ({ type: "gaol", pos: g.pos, gaol: g })));
    flash("石牢成形：要靠第六顆炸彈引爆第一個，再一個炸一個");
  }, "石牢成形");
  at(46.6, () => { const c = F(...GAP); addAoe({ ...circleAoe(c, CFG.bombR), t0: S.t, t1: 49.6, onHit() { hitAll((e) => this.hit(e), "被第六顆炸彈岩炸到"); } }); });
  const breakGaol = (g, why) => { g.broken = true; delete S.jailed[g.who]; S.freed[g.who] = S.t + 0.4; S.props = S.props.filter((p) => p.gaol !== g); S.flashRings.push({ c: g.pos, r: 4, until: S.t + 0.5 }); flash(`${ROLES[g.who]} 的石牢被${why}炸開`); };
  at(49.6, () => { S.props = S.props.filter((p) => !p.sixth); const c = F(...GAP), g = S.gaols.filter((x) => !x.broken).sort((a, b) => dist(a.pos, c) - dist(b.pos, c))[0]; if (g && dist(g.pos, c) <= CFG.chainFirst) breakGaol(g, "炸彈岩"); }, "第六顆炸彈爆炸 → 石牢連鎖");
  for (const t of [50.3, 51.1]) at(t, () => { const done = S.gaols.filter((x) => x.broken); const g = S.gaols.filter((x) => !x.broken).sort((a, b) => Math.min(...done.map((d) => dist(d.pos, a.pos)), 99) - Math.min(...done.map((d) => dist(d.pos, b.pos)), 99))[0]; if (g && done.some((d) => dist(d.pos, g.pos) <= CFG.chain)) breakGaol(g, "隔壁的石牢"); });
  at(52, () => { const stuck = S.gaols.filter((g) => !g.broken); if (stuck.length) { S.over = S.opts.god ? null : { win: false, reason: `石牢沒有全部炸開（${stuck.map((g) => ROLES[g.who]).join("、")} 還關著）：三個人要排成一條鏈，第一個貼近第六顆炸彈，每個相隔 ${CFG.chain} 米內`, t: S.t }; if (S.opts.god) flash("（觀摩模式）石牢沒有全部炸開"); } });
  at(50.6, () => { for (const i of DIE) { S.ents[i].dead = false; } flash("自殺的四個人接受復活"); }, "自殺的人接受復活");
  for (let n = 0; n < 8; n++) at(52.2 + n * 1.12, () => { if (n === 0) flash("激震 ×8：全場連續傷害"); }, n === 0 ? "激震 ×8（全場）" : null);
  // ===== 後半（62 秒起）=====
  wotl(68.1, "大地之重", false, "大地之重：腳下出圈，整群一起移開"); wotl(71.1, "大地之重", false);
  slide(73); slide(75, true);
  at(79.3, () => flash("泰坦又轉身了：往牠面向的反方向跑，疊在正對面離場中 11 米"), "泰坦轉向（第三次地裂）");
  cast("地裂", 81.5, 84.3);
  at(81.5, () => { const T = G3(); addAoe({ ...circleAoe(T, CFG.crush2R), t0: S.t, t1: 84.3, onHit() { hitAll((e) => this.hit(e), "離第三次地裂的落點太近（要到泰坦面向的正對面）"); } }); }, "地裂（第三次）");
  at(86.5, () => flash(`石牢點名：${ROLES[S.g4]}，走到場中讓大家打`), "第四個石牢（點一個補師）");
  at(91.4, () => {
    const e = S.ents[S.g4]; if (e.dead) return;
    if (Math.hypot(e.x, e.y) > 4) return die(`${ROLES[S.g4]} 的石牢沒有放在場中（回放 8 筆都在場中）：被點名要走到場中`);
    S.jailed[S.g4] = true; S.gaol4 = { who: S.g4, pos: { x: e.x, y: e.y } }; S.props.push({ type: "gaol", pos: S.gaol4.pos, gaol: S.gaol4 }); flash("石牢成形：全員打石牢");
  }, "石牢成形");
  at(98, () => {
    if (!S.gaol4) return;
    const near = S.ents.filter((e) => !e.dead && e.i !== S.g4 && dist(e, S.gaol4.pos) <= 9).length;
    if (near < 4) return die(`石牢沒打破（只有 ${near} 人在石牢旁邊）：${ROLES[S.g4]} 還關著就要放山崩了`);
    delete S.jailed[S.g4]; S.freed[S.g4] = S.t + 0.4; S.props = S.props.filter((p) => p.gaol !== S.gaol4); flash("石牢打破");
  }, "石牢打破");
  slide(101.3); slide(103.3, true);
  at(104, () => { if (S.opts.role !== 1 && S.tank !== 1) { S.tank = 1; flash("ST 挑釁換坦"); } }, "ST 挑釁換坦");
  for (let n = 0; n < 6; n++) at(106.5 + n * 1.12, () => { if (n === 0) flash("激震 ×6：全場連續傷害"); }, n === 0 ? "激震 ×6（全場）" : null);
  at(113, () => { if (S.tank !== 1) die(S.opts.role === 1 ? "你是 ST：山崩之後（104 秒左右）要按 3 挑釁換坦，114、118 秒的兩個死刑由你吃" : "114、118 秒的死刑要換 ST 吃：仇恨還在 MT 身上"); });
  buster(114.2, "岩石破壞", "ST"); buster(118.3, "山崩破壞", "ST");
  at(119.6, () => { if (S.opts.role !== 0 && S.tank !== 0) { S.tank = 0; flash("MT 挑釁接回"); } }, "MT 挑釁接回");
  at(123.4, () => { if (S.tank !== 0) die(S.opts.role === 0 ? "你是 MT：第二個死刑打完（118 秒）要按 3 挑釁接回來，四顆炸彈時由你帶泰坦繞" : "四顆炸彈時要由 MT 帶泰坦：仇恨還在 ST 身上"); });
  // 四顆炸彈：場中四角依序落下（順時針），各自 5.5 秒後爆。同時三發大地之重、兩波山崩
  const corner = (n) => polar(45 + ((S.bomb0 + n) % 4) * 90, 4.24);
  for (let n = 0; n < 4; n++) {
    const tb = 123.5 + n * 2;
    at(tb - 0.8, () => { const c = corner(n); addAoe({ ...circleAoe(c, CFG.bombLandR), t0: S.t, t1: tb, onHit() { hitAll((e) => this.hit(e), "被落下的炸彈岩砸到"); } }); }, n === 0 ? "炸彈岩 ×4（場中四角，順時針）" : null);
    at(tb, () => { const c = corner(n); S.props.push({ type: "bomb", pos: c, late: n }); addAoe({ ...circleAoe(c, CFG.bombR + 1), t0: S.t + 2.5, t1: tb + 5.5, onHit() { S.props = S.props.filter((p) => p.late !== n); hitAll((e) => this.hit(e), "被炸彈岩炸到（要待在外圈）"); } }); });
  }
  wotl(125.5, "大地之重 ×3（邊繞邊躲）", false, "大地之重：圈會一直出在腳下，不要停"); wotl(128.6, null, false); wotl(131.6, null, false);
  slide(131); slide(133, true);
  buster(139.1, "岩石破壞", "MT"); buster(143.3, "山崩破壞", "MT");
  wotl(148.4, "大地之重 ×3", false, "大地之重連三發：每次出圈就離開"); wotl(151.4, null, false); wotl(154.4, null, false);
  at(END_T, () => { S.over = { win: true, reason: "泰坦被擊殺，階段通過" }; });
  S.tl.sort((a, b) => a.t - b.t);
  return ev;
}

// ---------- 更新 ----------
function dangerAt(p, i, isHome) {
  for (const a of S.aoes) if (!a.done && a.t0 <= S.t && a.t1 - S.t < 2.6 && !(a.skip && a.skip.includes(i)) && !(a.suicide && DIE.includes(i)) && a.hit(p, 1.2)) return true;
  return false;
}
function npcTarget(e) {
  const h = home(e.i, S.t);
  if (S.t >= 33.5 && S.t < 46.2 && !(e.i === 0 && S.t > 41.2)) return h; // 擊飛與石牢站位是固定的，不做臨時閃避
  if (S.t >= 81.5 && S.t < 86.9) return h;
  if (S.t >= 119.6 && S.t < 133.4) return h; // 四顆炸彈繞場：照固定路線一直走，大地之重的圈自然會被甩在後面
  if (!dangerAt(h, e.i, true)) return h;
  if (!dangerAt(e, e.i)) return e;
  let best = null, bd = 1e9;
  for (const r of [2, 4, 6, 8, 11, 14]) for (let k = 0; k < 24; k++) { const q = { x: e.x + Math.sin(k * 0.2618) * r, y: e.y - Math.cos(k * 0.2618) * r }; if (Math.hypot(q.x, q.y) > CFG.R - 1 || dangerAt(q, e.i)) continue; if (r < bd) { bd = r; best = q; } }
  return best || h;
}
const frozen = (i) => S.ents[i].dead || S.jailed[i] || S.t < S.stun;
function step(dt) {
  if (S.over || S.paused) return;
  S.t += dt;
  while (S.evIdx < S.events.length && S.events[S.evIdx].t <= S.t) { S.events[S.evIdx++].run(); if (S.over) return; }
  const role = S.opts.role, p = S.ents[role];
  const kx = (S.keys.KeyD ? 1 : 0) - (S.keys.KeyA ? 1 : 0), ky = (S.keys.KeyS ? 1 : 0) - (S.keys.KeyW ? 1 : 0);
  if ((kx || ky) && !frozen(role)) {
    const n = Math.hypot(kx, ky), sx = kx / n, sy = ky / n, c = Math.cos(S.cam), s = Math.sin(S.cam), wx = sx * c - sy * s, wy = sx * s + sy * c, sp = CFG.speed * (S.buff.sprint > S.t ? 1.3 : 1) * dt;
    p.x += wx * sp; p.y += wy * sp; p.face = Math.atan2(wy, wx);
  }
  for (const e of S.ents) {
    if (e.i !== role && !frozen(e.i)) { const tg = npcTarget(e), d = dist(e, tg); if (d > 0.05) { const sp = Math.min(d, CFG.speed * 1.15 * dt); e.face = Math.atan2(tg.y - e.y, tg.x - e.x); e.x += ((tg.x - e.x) / d) * sp; e.y += ((tg.y - e.y) / d) * sp; } }
    const d = Math.hypot(e.x, e.y), lim = CFG.R - 0.4; if (d > lim && S.t > 0.3) { e.x *= lim / d; e.y *= lim / d; }
  }
  for (const a of S.aoes) if (!a.done && S.t >= a.t1) { a.done = true; a.onHit.call(a); if (S.over) return; }
  S.aoes = S.aoes.filter((a) => S.t < a.t1 + 0.4);
}
function useSkill(k) { if (S.over) return; const t = S.t, role = S.opts.role;
  if (k === "provoke" && role <= 1 && S.cd.provoke <= t && !S.ents[role].dead) { if (!bossSpot(t).vis || jumping(t)) return flash("現在沒有目標可以挑釁"); S.cd.provoke = t + 30; S.tank = role; flash(`${ROLES[role]} 挑釁：仇恨到你身上`); } if (k === "sprint" && S.cd.sprint <= t) { S.buff.sprint = t + 10; S.cd.sprint = t + 45; flash("衝刺 10 秒"); } }

// ---------- 提示 ----------
function hint() {
  const t = S.t, r = S.opts.role, me = S.ents[r], dn = DIR_NAME[S.g2 * 2], op = DIR_NAME[(S.g2 * 2 + 4) % 8];
  if (me.dead) return t < 27.4 ? "你已自殺（正確）。隊友會先把復活讀好，你等石牢成形後再接。" : "你躺著等復活：50 秒左右才接，不要太早起來，不然石牢會點到你。";
  if (S.jailed[r]) return "你被關在石牢裡，不能動也不會被打。等第六顆炸彈引爆石牢的連鎖。";
  if (t < 0.4) return "泰坦會砸在場中（地裂）：貼著場邊站。之後場地會縮小。" + (r === 0 ? "你是 MT：泰坦出場會重置仇恨，牠一落地你就要按 3 挑釁。" : "");
  if (r === 0 && S.tank !== 0 && t < 10) return "泰坦的仇恨重置了，牠現在沒在看你：馬上按 3 挑釁接王（10 秒前沒接到算失敗），然後站到牠的南側。";
  if (t < 18.9) return r === 0 ? "你拉泰坦：站牠的南側，吃岩石破壞和山崩破壞兩個死刑，讓牠背對北邊的人群。" : "站泰坦的北側。兩個死刑是打 MT 的正面扇形，別跑到南邊。";
  if (t < 21.95) return r === 0 ? "大地之重 1：腳下出圈，往西走開 6 米。" : "大地之重 1：每個人腳下出圈，全員一起往東走 6 米離開。";
  if (t < 27.4) {
    if (DIE.includes(r)) return "大地之重 2：你是自殺組（ST、D1、D2、D3）。留在東邊的圈裡不要動，被炸死才對。這樣石牢只會點活著的 H2、H1、D4。";
    return r === 0 ? "大地之重 2：走開。自殺組會留在東邊被炸死，這是故意的。" : "大地之重 2：你要活著。離開腳下的圈，走回泰坦北側。可以先讀復活，但自殺的人 50 秒才會接。";
  }
  if (t < 33.5) return t < 30.5 ? "看泰坦的面向：牠轉向哪一邊，就會跳到那一邊的場邊砸下來（第二次地裂）。離落點越近越痛，全員往牠面向的反方向跑，貼到正對面的場邊。" : `泰坦落在${dn}邊。`;
  if (t < 39.2) return `隆起會把你從泰坦身上往外推 24 米。對面半場有 5 顆炸彈岩，只缺一格。走到泰坦腳前 4～5 米、站在「泰坦 → 缺口」那條線上疊在一起，被推過去才會剛好落在缺口。${S.opts.assist ? "藍線是你現在的位置會被推到哪。" : ""}被推出場外或落在炸彈旁邊都會死。`;
  if (t < 41.2) return "被擊飛中，暈眩 2 秒。";
  if (t < 46.2) {
    const g = GAOL.indexOf(r);
    if (g >= 0) return `你被石牢點名。缺口這格馬上會落下第六顆炸彈，快離開。三個人要排成一條鏈：H2 離第六顆炸彈最近（${CFG.chainFirst} 米內，離泰坦最遠，最先炸開）、H1 在場中、D4 往泰坦方向再 7 米（最後炸開）。你是第 ${g + 1} 個，站到${["最靠近炸彈缺口的那一點", "場中", "場中往泰坦方向 7 米"][g]}（開輔助預兆有黃圈），46 秒被關住前要站好。`;
    return `你拉泰坦，這裡你決定隊友的生死。山崩有五條線（對準你的那條，加上兩側各偏 45、135 度），43.4 秒詠唱開始時鎖定方向。石牢三人排在「泰坦 → 場中」這條直線上，所以你要站在偏離這條線約 22 度的位置（從落點往泰坦方向走到一半、離場中約 10 米${S.opts.assist ? "，有藍圈" : ""}），讓他們剛好落在兩條線中間。鎖定後你再往側邊走開。`;
  }
  if (r === 0) return "只剩你能動：山崩的五條線在詠唱開始時鎖定，中間那條對準你。看到讀條就往兩條線之間走。";
  if (t < 62) return "等復活的人起來，接著是八下全場傷害的激震。";
  const d3 = DIR_NAME[S.g3 * 2];
  if (t < 70.8) return "大地之重兩發：圈出在每個人腳下，3 秒後爆。全員疊在一起、一起移動，圈就只有一個：第一發整群穿過泰坦到另一側，第二發出圈就直接往泰坦正對面走（離泰坦約 14 米），準備躲山崩。";
  if (t < 76) return r === S.tank ? "山崩兩波，五條線在詠唱開始時鎖定，中間那條對準你：把線帶到一側，別對著人群。" : "山崩兩波：五條線從泰坦射出，中間那條對準坦克，其餘各偏 45、135 度。先站在兩條線之間；第二波是同一組線轉 22.5 度，剛好打在你站的空隙，所以第一波一炸完就踏進剛炸過的線上。";
  if (t < 86.9) return t < 84.3 ? "再看一次泰坦的面向：牠轉向哪邊就跳到哪邊（第三次地裂）。全員到牠面向的正對面、離場中 11 米疊在一起。" : `泰坦落在${d3}邊。`;
  if (t < 99) {
    if (r === S.g4) return S.jailed[r] ? "你被關在場中的石牢裡，等隊友打破。" : "你被第四個石牢點名：91 秒前走到場中（1 號標記），讓大家圍著打。";
    return `第四個石牢點 ${ROLES[S.g4]}，他會站到場中：91 秒成形後全員靠過去打，98 秒前要打破（旁邊至少要有 4 個人）。`;
  }
  if (t < 104.5) return r === 1 ? "山崩兩波，躲線。打完後你（ST）要按 3 挑釁換坦，接下來兩個死刑是你的。" : `山崩兩波：泰坦在${d3}側，退到對面散開，站在線與線之間。`;
  if (t < 119.6) {
    if (r === 1) return S.tank === 1 ? `王在你身上：站到泰坦的外側（${d3}邊場邊），讓牠背對場中的人群，吃 114、118 秒兩個死刑。` : "你是 ST：現在按 3 挑釁換坦（113 秒前），然後站到泰坦外側吃兩個死刑。";
    return r === 0 ? "ST 挑釁換坦吃 114、118 秒的死刑。你回場中；118 秒第二個死刑打完後按 3 挑釁接回來。" : "激震六下後 ST 吃兩個死刑：待在場中、泰坦背後。";
  }
  if (t < 123.4) return r === 0 ? (S.tank === 0 ? `接回來了。全員疊到泰坦外側的${d3}邊場邊，準備繞場。` : "現在按 3 挑釁接回泰坦（123 秒前）。") : `全員疊到泰坦外側的${d3}邊場邊（離場中 10～11 米），準備繞場。`;
  if (t < 135.5) return r === 0 ? "四顆炸彈在場中四角依序落下並爆炸，同時腳下一直出大地之重。你帶著泰坦沿外圈「逆時針」繞半圈，不要停、不要進場中。" : "四顆炸彈在場中四角依序落下並爆炸，同時腳下一直出大地之重、泰坦還會放兩波山崩。全員疊在一起沿外圈「順時針」繞（MT 走反方向），保持離場中 10 米以上、不要停，繞大約 150 度到對面跟 MT 會合。";
  if (t < 147) return r === 0 ? "把泰坦帶到場邊、背對場中，吃 139、143 秒兩個死刑。" : "回場中，MT 吃最後兩個死刑。";
  return "大地之重連三發：圈出在腳下就走開，別踩到別人的圈。打到泰坦死。";
}

// ---------- 俯視繪製 ----------
let cv, g, W = 600;
function toScreen(p) { const sc = (W / 2 / (CFG.R + 4)) * S.zoom, c = Math.cos(-S.cam), s = Math.sin(-S.cam); return { x: W / 2 + (p.x * c - p.y * s) * sc, y: W / 2 + (p.x * s + p.y * c) * sc }; }
function label(p, text, color, size = 12, dy = 0) { const q = toScreen(p); g.font = `600 ${size}px "Fira Sans",system-ui,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 3; g.strokeStyle = "rgba(2,6,23,.85)"; g.strokeText(text, q.x, q.y + dy); g.fillStyle = color; g.fillText(text, q.x, q.y + dy); }
function kbPreview() { // 輔助：隆起會把你推到哪
  if (!(S.t >= 33.5 && S.t < 39.1) || !S.opts.assist) return null;
  const T = TITAN2(), p = S.ents[S.opts.role]; if (p.dead) return null;
  const d = Math.max(dist(p, T), 0.01), to = { x: p.x + ((p.x - T.x) / d) * CFG.kb, y: p.y + ((p.y - T.y) / d) * CFG.kb };
  const bad = Math.hypot(to.x, to.y) > CFG.R || BOMBS.some(([x, y]) => dist(F(x, y), to) <= CFG.bombR);
  return { from: p, to, bad };
}
function draw() {
  const sc = (W / 2 / (CFG.R + 4)) * S.zoom, t = S.t, role = S.opts.role;
  g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); g.fillStyle = "#020617"; g.fillRect(0, 0, W, W);
  g.save(); g.translate(W / 2, W / 2); g.rotate(-S.cam); g.scale(sc, sc);
  g.beginPath(); g.arc(0, 0, CFG.R, 0, 7); g.fillStyle = "#1a1c22"; g.fill(); g.lineWidth = 0.4; g.strokeStyle = "#a16207"; g.stroke();
  for (const [, mx, my, col] of MARKERS) { g.beginPath(); g.arc(mx, my, 1.1, 0, 7); g.fillStyle = col + "33"; g.fill(); }
  g.save(); g.beginPath(); g.arc(0, 0, CFG.R, 0, 7); g.clip();
  for (const a of S.aoes) { if ((a.assistOnly && !S.opts.assist) || t < a.t0) continue; a.draw(g, a.done ? 1 : clamp01((t - a.t0) / Math.max(a.t1 - a.t0, 0.01))); }
  g.restore();
  for (const f of (S.flashRings = S.flashRings.filter((f) => f.until > t))) { g.beginPath(); g.arc(f.c.x, f.c.y, f.r, 0, 7); g.fillStyle = "rgba(255,220,140,.4)"; g.fill(); }
  for (const p of S.props) { g.beginPath(); if (p.type === "bomb") { g.arc(p.pos.x, p.pos.y, 1.5, 0, 7); g.fillStyle = "#7c2d12"; } else { g.rect(p.pos.x - 1.6, p.pos.y - 1.6, 3.2, 3.2); g.fillStyle = "rgba(160,160,170,.75)"; } g.fill(); }
  if (S.opts.assist && S.opts.role === 0 && t >= 39.1 && t < 43.5) { const c = F(-8, 5.4); g.beginPath(); g.arc(c.x, c.y, 1.3, 0, 7); g.lineWidth = 0.18; g.strokeStyle = "#4cc2ff"; g.stroke(); }
  if (S.opts.assist && t >= 41.1 && t < 46.2) GAOL_SPOT.forEach(([x, y]) => { const c = F(x, y); g.beginPath(); g.arc(c.x, c.y, 1.2, 0, 7); g.lineWidth = 0.15; g.strokeStyle = "#ffd166"; g.stroke(); });
  const kp = kbPreview(); if (kp) { g.beginPath(); g.moveTo(kp.from.x, kp.from.y); g.lineTo(kp.to.x, kp.to.y); g.lineWidth = 0.2; g.strokeStyle = kp.bad ? "#ff4d4d" : "#4cc2ff"; g.stroke(); g.beginPath(); g.arc(kp.to.x, kp.to.y, 0.9, 0, 7); g.stroke(); }
  const b = bossSpot(t); if (b.vis) { g.beginPath(); g.arc(b.pos.x, b.pos.y, 3, 0, 7); g.fillStyle = b.alt ? "rgba(161,98,7,.45)" : "#a16207"; g.fill(); g.lineWidth = 0.2; g.strokeStyle = "#fde68a"; g.stroke(); const lk = bossLook(t), a = Math.atan2(lk.y - b.pos.y, lk.x - b.pos.x); if (!b.alt) { g.beginPath(); g.moveTo(b.pos.x + Math.cos(a) * 4.4, b.pos.y + Math.sin(a) * 4.4); g.lineTo(b.pos.x + Math.cos(a + 0.5) * 2.7, b.pos.y + Math.sin(a + 0.5) * 2.7); g.lineTo(b.pos.x + Math.cos(a - 0.5) * 2.7, b.pos.y + Math.sin(a - 0.5) * 2.7); g.closePath(); g.fillStyle = "#fde68a"; g.fill(); } }
  for (const e of S.ents) { g.beginPath(); g.arc(e.x, e.y, 0.75, 0, 7); g.fillStyle = e.dead ? "#475569" : ROLE_COLOR[e.i]; g.fill(); if (e.i === role) { g.lineWidth = 0.22; g.strokeStyle = "#fff"; g.stroke(); } }
  g.restore();
  DIR_NAME.forEach((m, d) => label(polar(d * 45, CFG.R + 2), m, d === 0 ? "#f8fafc" : "#8a96ad", d % 2 ? 11 : 13));
  for (const [name, mx, my, col] of MARKERS) label({ x: mx, y: my }, name, col, 11);
  if (b.vis) label(b.pos, "泰坦", "#fde68a", 12);
  for (const e of S.ents) label(e, (e.i === role ? "你 " : "") + ROLES[e.i] + (e.dead ? "（倒地）" : ""), e.i === role ? "#fff" : "#cbd5e1", e.i === role ? 12 : 10, -15);
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop();
  if (c) { const w = W * 0.5, x = (W - w) / 2, y = 14; g.fillStyle = "rgba(2,6,23,.8)"; g.fillRect(x, y, w, 20); g.fillStyle = "#a16207"; g.fillRect(x, y, w * clamp01((t - c.t0) / (c.t1 - c.t0)), 20); g.strokeStyle = "#fde68a"; g.lineWidth = 1; g.strokeRect(x, y, w, 20); g.font = '600 13px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.name, W / 2, y + 11); }
  if (S.over || S.paused) { g.fillStyle = "rgba(2,6,23,.72)"; g.fillRect(0, 0, W, W); g.textAlign = "center"; g.textBaseline = "middle"; g.font = '800 30px "Fira Sans",system-ui,sans-serif'; g.fillStyle = S.paused && !S.over ? "#f8fafc" : S.over.win ? "#5fd08a" : "#ff6b6b"; g.fillText(S.paused && !S.over ? "暫停" : S.over.win ? "通過" : "失敗", W / 2, W / 2 - 40); g.font = '500 15px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#f8fafc"; if (S.over) wrapText(S.over.reason, W / 2, W / 2, W * 0.8, 22); g.fillStyle = "#aeb9cc"; g.fillText(S.over ? "按 R 從這一段重來" : "按 P 繼續", W / 2, W / 2 + 90); }
}
function wrapText(text, x, y, maxW, lh) { let line = ""; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); y += lh; line = ch; } else line += ch; } g.fillText(line, x, y); }

function updateHud() {
  const t = S.t, $ = (id) => document.getElementById(id), r = S.opts.role;
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop(); $("castbar").hidden = !c;
  if (c) { $("castfill").style.width = clamp01((t - c.t0) / (c.t1 - c.t0)) * 100 + "%"; $("castname").textContent = c.name; }
  const st = []; if (S.ents[r].dead) st.push("倒地"); if (S.jailed[r]) st.push("石牢"); if (t < S.stun && !S.ents[r].dead) st.push("暈眩"); if (S.buff.sprint > t) st.push("衝刺");
  if (r <= 1 && !S.ents[r].dead) st.push(S.tank === r ? "仇恨在你身上" : "仇恨不在你身上");
  const kp = kbPreview(); if (kp) st.push(kp.bad ? "擊飛落點：危險" : "擊飛落點：安全");
  $("statusline").textContent = st.join(" · ");
  const ov = $("overlay"); ov.hidden = !(S.over || S.paused);
  if (!ov.hidden) { const win = S.over && S.over.win; $("ovTitle").textContent = S.paused && !S.over ? "暫停" : win ? "通過" : "失敗"; $("ovTitle").className = S.paused && !S.over ? "" : win ? "win" : "dead"; $("ovReason").textContent = S.over ? S.over.reason : ""; $("ovHint").textContent = S.over ? "按 R 從這一段重來" : "按 P 繼續"; }
}
function updatePanel() {
  const t = S.t, $ = (id) => document.getElementById(id), tt = Math.max(0, t);
  $("clock").textContent = (t < 0 ? "-" : "") + `${Math.floor(Math.abs(t) / 60)}:${String(Math.floor(Math.abs(t) % 60)).padStart(2, "0")}`;
  $("hint").textContent = S.opts.hints ? hint() : "（提示已關閉）";
  $("upcoming").innerHTML = S.tl.filter((e) => e.t > t).slice(0, 6).map((e) => `<li><span>${(e.t - t).toFixed(1)}s</span>${e.name}</li>`).join("");
  $("log").innerHTML = S.log.map((l) => `<li>${l.msg}</li>`).join("");
  const el = $("skSprint"); el.disabled = S.cd.sprint > t; el.classList.toggle("on", S.buff.sprint > t); el.querySelector("i").textContent = S.buff.sprint > t ? `生效 ${(S.buff.sprint - t).toFixed(0)}s` : S.cd.sprint > t ? `冷卻 ${(S.cd.sprint - t).toFixed(0)}s` : "可用";
  const pv = $("skProvoke"); if (pv) { const ok = S.opts.role <= 1; pv.disabled = !ok || S.cd.provoke > t; pv.querySelector("i").textContent = !ok ? "—" : S.cd.provoke > t ? `冷卻 ${(S.cd.provoke - t).toFixed(0)}s` : "可用"; }
  void tt;
}

function init() {
  cv = document.getElementById("arena"); g = cv.getContext("2d");
  const $ = (id) => document.getElementById(id), cv3 = $("arena3d"), vp = $("viewport");
  const has3d = typeof View3D !== "undefined" && View3D.init(cv3);
  if (!has3d) { S.opts.view = "top"; $("view").value = "top"; $("view").disabled = true; }
  let W3 = 800, H3 = 500;
  const fit = () => { const box = vp.parentElement.getBoundingClientRect(), game = S.opts.view === "game"; vp.classList.toggle("game", game); W = Math.max(320, Math.floor(Math.min(box.width, window.innerHeight - 24))); cv.style.width = cv.style.height = W + "px"; cv.width = cv.height = W * devicePixelRatio; W3 = Math.max(320, Math.floor(box.width)); H3 = Math.max(240, Math.floor(Math.min(window.innerHeight - 24, W3 * 0.66))); cv3.style.width = W3 + "px"; cv3.style.height = H3 + "px"; vp.style.width = (game ? W3 : W) + "px"; vp.style.height = (game ? H3 : W) + "px"; };
  fit(); addEventListener("resize", fit);
  $("view").addEventListener("change", (e) => { S.opts.view = e.target.value; fit(); e.target.blur(); });
  $("role").innerHTML = ROLES.map((r, i) => `<option value="${i}">${r}${DIE.includes(i) ? "（自殺組）" : GAOL.includes(i) ? "（石牢組）" : "（拉泰坦）"}</option>`).join(""); $("role").value = S.opts.role;
  $("start").innerHTML = CHECKPOINTS.map((c) => `<option value="${c.t}">${c.name}</option>`).join("");
  const bind = (id, key, conv, restart) => $(id).addEventListener("change", (e) => { S.opts[key] = conv(e.target); if (restart) reset(); e.target.blur(); });
  bind("role", "role", (el) => +el.value, true); bind("start", "start", (el) => +el.value, true); bind("speed", "speed", (el) => +el.value, false);
  bind("assist", "assist", (el) => el.checked, false); bind("hints", "hints", (el) => el.checked, false); bind("god", "god", (el) => el.checked, false);
  $("restart").addEventListener("click", (e) => { reset(); e.target.blur(); }); $("skSprint").addEventListener("click", () => useSkill("sprint")); if ($("skProvoke")) $("skProvoke").addEventListener("click", () => useSkill("provoke"));
  addEventListener("keydown", (e) => { if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return; S.keys[e.code] = true; if (e.code === "KeyR") reset(); if (e.code === "KeyP" || e.code === "Escape") S.paused = !S.paused; if (e.code === "ShiftLeft" || e.code === "ShiftRight") useSkill("sprint"); if (e.code === "Digit3") useSkill("provoke"); if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) e.preventDefault(); });
  addEventListener("keyup", (e) => { S.keys[e.code] = false; }); addEventListener("blur", () => { S.keys = {}; });
  let drag = null;
  for (const el of [cv, cv3]) { el.addEventListener("mousedown", (e) => { drag = [e.clientX, e.clientY]; e.preventDefault(); }); el.addEventListener("contextmenu", (e) => e.preventDefault()); }
  addEventListener("mousemove", (e) => { if (!drag) return; const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; drag = [e.clientX, e.clientY]; if (S.opts.view === "game") { S.cam += dx * 0.006; S.pitch = Math.max(0.08, Math.min(1.4, S.pitch + dy * 0.004)); } else S.cam += dx * 0.008; });
  addEventListener("mouseup", () => { drag = null; });
  cv.addEventListener("wheel", (e) => { S.zoom = Math.max(0.7, Math.min(2, S.zoom * (e.deltaY < 0 ? 1.08 : 0.92))); e.preventDefault(); }, { passive: false });
  cv3.addEventListener("wheel", (e) => { S.dist = Math.max(4, Math.min(26, S.dist * (e.deltaY < 0 ? 0.92 : 1.08))); e.preventDefault(); }, { passive: false });
  const bv = $("build"); if (bv) bv.textContent = "版本 " + BUILD;
  reset();
  let last = performance.now();
  const loop = (now) => { const real = Math.min((now - last) / 1000, 0.05); last = now; if (S.keys.KeyQ) S.cam -= real * 1.8; if (S.keys.KeyE) S.cam += real * 1.8; let left = real * S.opts.speed; while (left > 0) { const d = Math.min(left, 0.02); step(d); left -= d; } if (S.opts.view === "game" && has3d) { View3D.render(W3, H3); updateHud(); } else draw(); updatePanel(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
if (typeof document !== "undefined") addEventListener("DOMContentLoaded", init);
if (typeof module !== "undefined") module.exports = { S, CFG, ROLES, DIE, GAOL, reset, step, home, npcTarget, useSkill, END_T, F, stackSpot, polar, D3 };
