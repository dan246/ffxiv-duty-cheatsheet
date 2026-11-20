const npcMotion=typeof require==='function'?require('./uwu-npc-motion'):globalThis.UwuNpcMotion;
// 絕神兵・泰坦階段：本隊 Fight 13 滅團紀錄與多場綜合隨機練習。
// Reference 0 秒＝回放 5:00.720 第一次大地粉碎施法完成；死亡另取事件，位置與判定近似。
// 可核實範圍採 Action 資料與 BossMod（炸彈含 1.3m hitbox）；剩餘角度、位置與教學路線估計另註。畫面層共用 uwu-view3d.js。
"use strict";

const BUILD = "1120-ranges2";
// Reference casts are rendered FFLogs completed casts, not damage/application packets.
// Cast starts are inferred from displayed durations; geometry remains a teaching estimate.
const REFERENCE_ORIGIN = 300.720;
const REFERENCE_END = 449.000; // report's displayed 7:29 wipe bound (rounded)
const REFERENCE_CASTS = [
  {"time":300.72,"name":"大地粉碎","duration":2.7,"source":"泰坦"},
  {"time":306.17,"name":"大地之怒","duration":2.7,"source":"泰坦"},
  {"time":314.348,"name":"碎岩","duration":0,"source":"泰坦 → 城市老鼠"},
  {"time":317.471,"name":"山崩","duration":0,"source":"泰坦 → 城市老鼠"},
  {"time":322.02,"name":"大地之重","duration":2.2,"source":"泰坦 → 泰坦"},
  {"time":322.554,"name":"大地之重","duration":2.7,"source":"泰坦 1"},
  {"time":322.554,"name":"大地之重","duration":2.7,"source":"泰坦 2"},
  {"time":322.554,"name":"大地之重","duration":2.7,"source":"泰坦 3"},
  {"time":322.554,"name":"大地之重","duration":2.7,"source":"泰坦 4"},
  {"time":325.589,"name":"大地之重","duration":2.7,"source":"泰坦 5"},
  {"time":325.589,"name":"大地之重","duration":2.7,"source":"泰坦 6"},
  {"time":325.589,"name":"大地之重","duration":2.7,"source":"泰坦 7"},
  {"time":325.589,"name":"大地之重","duration":2.7,"source":"泰坦 8"},
  {"time":330.726,"name":"大地粉碎","duration":2.7,"source":"泰坦"},
  {"time":333.189,"name":"unknown_2b68","duration":0,"source":"泰坦 → 泰坦"},
  {"time":336.23,"name":"冲击","duration":0,"source":"爆破岩石 1"},
  {"time":336.23,"name":"冲击","duration":0,"source":"爆破岩石 2"},
  {"time":336.23,"name":"冲击","duration":0,"source":"爆破岩石 3"},
  {"time":336.23,"name":"冲击","duration":0,"source":"爆破岩石 4"},
  {"time":336.23,"name":"冲击","duration":0,"source":"爆破岩石 5"},
  {"time":339.265,"name":"大怒震","duration":3.7,"source":"泰坦"},
  {"time":341.411,"name":"花岗岩牢狱","duration":0,"source":"泰坦 3 → 卡洛特"},
  {"time":341.411,"name":"花岗岩牢狱","duration":0,"source":"泰坦 4 → 姆咪蹦蹦跳"},
  {"time":341.411,"name":"花岗岩牢狱","duration":0,"source":"泰坦 → 鄉下老鼠"},
  {"time":341.815,"name":"大爆炸","duration":3.2,"source":"爆破岩石 1"},
  {"time":341.815,"name":"大爆炸","duration":3.2,"source":"爆破岩石 2"},
  {"time":341.815,"name":"大爆炸","duration":3.2,"source":"爆破岩石 3"},
  {"time":341.815,"name":"大爆炸","duration":3.2,"source":"爆破岩石 4"},
  {"time":341.815,"name":"大爆炸","duration":3.2,"source":"爆破岩石 5"},
  {"time":344.228,"name":"冲击","duration":0,"source":"爆破岩石 6"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦 8"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦 1"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦 2"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦 3"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦 4"},
  {"time":345.788,"name":"地裂","duration":1.9,"source":"泰坦"},
  {"time":349.795,"name":"大爆炸","duration":3.2,"source":"爆破岩石 6 → 花岗石牢 3"},
  {"time":350.15,"name":"诱导爆炸","duration":0,"source":"花岗石牢 3 → 花岗石牢 2"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦 8"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦 1"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦 2"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦 3"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦 4"},
  {"time":350.196,"name":"地裂","duration":1.9,"source":"泰坦"},
  {"time":350.818,"name":"诱导爆炸","duration":0,"source":"花岗石牢 2"},
  {"time":351.529,"name":"诱导爆炸","duration":0,"source":"花岗石牢 1 → 花岗石牢 2"},
  {"time":352.332,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":353.449,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":354.56,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":355.678,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":356.794,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":357.907,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":359.022,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":360.14,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":367.719,"name":"大地之重","duration":2.2,"source":"泰坦 → 泰坦"},
  {"time":368.255,"name":"大地之重","duration":2.7,"source":"泰坦 3"},
  {"time":368.255,"name":"大地之重","duration":2.7,"source":"泰坦 4"},
  {"time":371.291,"name":"大地之重","duration":2.7,"source":"泰坦 1"},
  {"time":371.291,"name":"大地之重","duration":2.7,"source":"泰坦 2"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦 6"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦 7"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦 8"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦 3"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦 4"},
  {"time":373.205,"name":"地裂","duration":1.9,"source":"泰坦"},
  {"time":375.212,"name":"地裂","duration":1.7,"source":"泰坦 9"},
  {"time":375.212,"name":"地裂","duration":1.7,"source":"泰坦 10"},
  {"time":375.212,"name":"地裂","duration":1.7,"source":"泰坦 5"},
  {"time":375.212,"name":"地裂","duration":1.7,"source":"泰坦 1"},
  {"time":375.212,"name":"地裂","duration":1.7,"source":"泰坦 2"},
  {"time":384.978,"name":"大地粉碎","duration":2.7,"source":"泰坦"},
  {"time":387.435,"name":"花岗岩牢狱","duration":0,"source":"泰坦 → 鄉下老鼠"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦 8"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦 1"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦 2"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦 3"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦 4"},
  {"time":401.851,"name":"地裂","duration":1.9,"source":"泰坦"},
  {"time":403.859,"name":"地裂","duration":1.7,"source":"泰坦 9"},
  {"time":403.859,"name":"地裂","duration":1.7,"source":"泰坦 10"},
  {"time":403.859,"name":"地裂","duration":1.7,"source":"泰坦 5"},
  {"time":403.859,"name":"地裂","duration":1.7,"source":"泰坦 6"},
  {"time":403.859,"name":"地裂","duration":1.7,"source":"泰坦 7 → Camelh"},
  {"time":407.017,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":408.131,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":409.245,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":410.364,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":411.48199999999997,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":412.601,"name":"怒震","duration":0,"source":"泰坦"},
  {"time":414.744,"name":"碎岩","duration":0,"source":"泰坦 → 城市老鼠"},
  {"time":418.861,"name":"山崩","duration":0,"source":"泰坦 → 球"},
  {"time":420.959,"name":"unknown_2b68","duration":0,"source":"泰坦 → 泰坦"},
  {"time":424.003,"name":"冲击","duration":0,"source":"爆破岩石 7"},
  {"time":426.02,"name":"大地之重","duration":2.7,"source":"泰坦 3"},
  {"time":426.02,"name":"大地之重","duration":2.7,"source":"泰坦 4"},
  {"time":426.02,"name":"冲击","duration":0,"source":"爆破岩石 8 → 星夜空"},
  {"time":428.032,"name":"冲击","duration":0,"source":"爆破岩石 9"},
  {"time":429.057,"name":"大地之重","duration":2.7,"source":"泰坦 1"},
  {"time":429.057,"name":"大地之重","duration":2.7,"source":"泰坦 2"},
  {"time":429.547,"name":"大爆炸","duration":3.2,"source":"爆破岩石 7"},
  {"time":430.039,"name":"冲击","duration":0,"source":"爆破岩石 10"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦 5"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦 6"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦 7"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦 8"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦 3"},
  {"time":431.469,"name":"地裂","duration":1.9,"source":"泰坦"},
  {"time":431.603,"name":"大爆炸","duration":3.2,"source":"爆破岩石 8"},
  {"time":432.097,"name":"大地之重","duration":2.7,"source":"泰坦 4"},
  {"time":433.484,"name":"地裂","duration":1.7,"source":"泰坦 11"},
  {"time":433.484,"name":"地裂","duration":1.7,"source":"泰坦 9"},
  {"time":433.484,"name":"地裂","duration":1.7,"source":"泰坦 10"},
  {"time":433.484,"name":"地裂","duration":1.7,"source":"泰坦 1 → 鄉下老鼠"},
  {"time":433.484,"name":"地裂","duration":1.7,"source":"泰坦 2 → 納垢神選樹蛙"},
  {"time":433.618,"name":"大爆炸","duration":3.2,"source":"爆破岩石 9"},
  {"time":435.625,"name":"大爆炸","duration":3.2,"source":"爆破岩石 10"},
  {"time":439.692,"name":"碎岩","duration":0,"source":"泰坦"},
  {"time":443.808,"name":"山崩","duration":0,"source":"泰坦 → 城市老鼠"},
  {"time":448.368,"name":"大地之重","duration":2.2,"source":"泰坦 → 泰坦"}
];
const relative = (time) => +(time - REFERENCE_ORIGIN).toFixed(3);
function samplePath(path, t) {
  if (!path?.length) return null;
  const abs = t + REFERENCE_ORIGIN;
  if (abs <= path[0][0]) return {x:path[0][1],y:path[0][2]};
  for (let i=1;i<path.length;i++) if (abs <= path[i][0]) {
    const a=path[i-1], b=path[i]; return lerp({x:a[1],y:a[2]},{x:b[1],y:b[2]},clamp01((abs-a[0])/(b[0]-a[0])));
  }
  const end=path.at(-1); return {x:end[1],y:end[2]};
}
function referencePosition(role,t) { return S.reference ? samplePath(S.replay?.paths?.[role],t) : null; }
function rotatePoint(p,angle){if(!p)return null;const a=rad(angle);return {x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)};}
function practiceAngle(t){
  if(!S.reference||S.opts.randomJumps===false)return 0;
  const jumps=S.jumps||[];if(jumps[1]&&t>=jumps[1].cue+.45)return (S.g3-(S.replay?.g3??2))*90;
  if(jumps[0]&&t>=jumps[0].cue+.45)return (S.g2-(S.replay?.g2??3))*90;
  return 0;
}
function practicePoint(p,t){return rotatePoint(p,practiceAngle(t));}
function practicePosition(role,t){return practicePoint(referencePosition(role,t),t);}

// NPC teaching movement is reconstructed between sparse samples: walk at normal
// speed near the sample arrival time. Raw green guides stay linear observations;
// the explicitly reconstructed knockback/gaol transition has its own departure times.
function npcReferencePosition(role,t) {
  if(S.replay?.rawCoordinates){
    const i=ROLES.indexOf(role);
    // The tank keeps the live cleave aimed in one direction through resolution.
    // Crossing the boss while following the next sparse sample sweeps the raid.
    if(S.aoes?.some(a=>!a.done&&a.shape?.type==='cone'&&a.skip?.includes(i)&&t<=Math.max(S.t,a.t1))&&S.ents?.[i])
      return {x:S.ents[i].x,y:S.ents[i].y};
    // Released gaols must leave immediately. The source has nearly stationary
    // status/resource samples after release; keep those as evidence, but teach
    // a normal-speed retreat to the observed edge stack through the live planner.
    const release=S.replay.gaolStates?.find(e=>e.role===role&&!e.active&&e.time<360);
    if(release&&t>=relative(release.time)&&t<relative(357.907))
      return practicePosition(role,relative(357.907));
    // Prepare the chain anchors as soon as the first five bombs burst. Sparse
    // source samples otherwise leave the last gaol too far from its anchor to
    // dodge a full-width Landslide and return at normal walking speed.
    const binding=S.replay.gaolStates?.find(e=>e.role===role&&e.active&&e.time<360);
    if(binding&&t>=relative(341.815)&&t<relative(binding.time)) {
      const anchor=practicePosition(role,relative(binding.time));
      const hazards=S.aoes.filter(a=>!a.done&&a.t0<=S.t&&a.t1>=t&&a.t1<relative(binding.time));
      const cached=S.gaolStage?.[role];
      if(cached&&cached.hazards.length===hazards.length&&cached.hazards.every((a,i)=>a===hazards[i]))return cached.pos;
      const save=pos=>{(S.gaolStage??={})[role]={hazards,pos};return pos;};
      const safe=p=>Math.hypot(p.x,p.y)<arenaAt(t).radius-.4&&!hazards.some(a=>a.hit(p,.4));
      if(safe(anchor))return save(anchor);
      // Stage near the final anchor, rather than near the old escape point:
      // only half a second remains between the Landslide and the binding.
      for(let r=.25;r<=6;r+=.25)for(let k=0;k<48;k++){
        const p={x:anchor.x+r*Math.cos(k*Math.PI/24),y:anchor.y+r*Math.sin(k*Math.PI/24)};
        if(safe(p))return save(p);
      }
      return save(anchor);
    }
    // D2 died in Ifrit in the source pull. Practice starts with all eight alive;
    // teach the same sacrifice assignment as D1 until the planned death window.
    if(role==='D2'&&t<relative(355.096))return practicePosition('D1',t);
    if(['MT','H1','H2','D4'].includes(role)&&t>=relative(339.265)&&t<relative(341.411)){
      const from=practicePosition(role,relative(339.265)),boss=TITAN2(),d=Math.max(dist(from,boss),.01);
      return {x:from.x+(from.x-boss.x)/d*CFG.kb,y:from.y+(from.y-boss.y)/d*CFG.kb};
    }
    const p=practicePosition(role,t),r=p?Math.hypot(p.x,p.y):0,limit=arenaAt(t).radius-.4;
    // Teaching reconstruction: begin at the observed stack angle, then circle
    // the four central bombs at 5m/s. Sparse wipe coordinates cut through live
    // bombs; this continuous outer route stays feasible under the 6m/s cap.
    if(p&&t>=relative(419.0)&&t<relative(435.7)){
      const start=practicePosition('D4',relative(419)),angle=Math.atan2(start.y,start.x)+(t-relative(419))*5/11;
      return {x:11*Math.cos(angle),y:11*Math.sin(angle)};
    }
    // Sparse coordinates include bodies sliding off the arena during the source wipe.
    // The practice route stays on the living platform; collision checks remain lethal.
    return p&&r>limit?{x:p.x*limit/r,y:p.y*limit/r}:p;
  }
  const raw=S.reference && S.replay?.paths?.[role]; if(!raw?.length) return null;
  let path=raw, taughtKnockback=false;
  const before=raw.find(p=>p[0]===334), preJump=raw.find(p=>p[0]===337);
  if(before && preJump && ["MT","H1","H2","D4"].includes(role)) {
    // The 337→341/344 samples straddle Upheaval and are not a walking segment.
    // Rebuild the safe stack and the one physical 24m jump, then hold through
    // stun and the first Burst. These sub-sample positions are teaching estimates.
    taughtKnockback=true;
    const start=stackSpot(), boss=TITAN2(), d=dist(start,boss);
    const land={x:start.x+(start.x-boss.x)/d*CFG.kb,y:start.y+(start.y-boss.y)/d*CFG.kb};
    // Compare phase time directly, like the event queue, to avoid rounding the
    // absolute clock onto the post-jump sample one simulation step too early.
    if(t>=relative(337)&&t<relative(339.265)) return start;
    if(t>=relative(339.265)&&t<=relative(341.820)) return land;
    const i=ROLES.indexOf(role), gi=GAOL.indexOf(i);
    const bait=gi>=0?F(...[[-8.7,7],[-7,3],[-5.4,-1]][gi]):F(-8,5.4);
    const final=gi>=0?F(...GAOL_SPOT[gi]):F(-13.5,0);
    path=[...raw.filter(p=>p[0]<=334),[337,start.x,start.y],
      [339.265,land.x,land.y],
      [341.820,land.x,land.y],[343.888,bait.x,bait.y],
      [346.300,final.x,final.y],...raw.filter(p=>p[0]>=348)];
  }
  const abs=t+REFERENCE_ORIGIN;
  if(abs<=path[0][0]) return {x:path[0][1],y:path[0][2]};
  for(let j=1;j<path.length;j++) if(abs<=path[j][0]) {
    const a=path[j-1],b=path[j],distance=Math.hypot(b[1]-a[1],b[2]-a[2]);
    const duration=Math.min(b[0]-a[0],distance/CFG.speed);
    const depart=taughtKnockback&&a[0]>=334&&b[0]<=348?a[0]:b[0]-duration;
    return lerp({x:a[1],y:a[2]},{x:b[1],y:b[2]},duration>0?clamp01((abs-depart)/duration):1);
  }
  const last=path.at(-1);return {x:last[1],y:last[2]};
}

const CFG = {
  R: 16,            // 共用畫面基準；實際場地依 S.arena 為 20 → 16 → 12 米
  speed: 6,
  crushR: 11,       // 第一次地裂：離落點多近會死（估）
  crush2R: 22,      // 第二次地裂：要站到正對面場邊（回放都離 28～29 米）
  wotlR: 6,         // Action 11109 / BossMod Weight of the Land
  bombLandR: 4.3,     // Action 11113 range 3 + BombBoulder hitbox 1.3
  bombR: 6.3,         // Action 11114 range 5 + BombBoulder hitbox 1.3
  kb: 24,           // 隆起擊飛距離（回放實測：30 個樣本 26 個落在 23.7～24.0）
  slideHalf: 3,     // Landslide width 6; main/helper lengths include actor hitbox
  chainFirst: 6.8,  // 第一個石牢要在第六顆炸彈的爆炸範圍內
  chain: 7.6,       // 石牢之間連鎖引爆的距離（估：回放間距 6.3～7）
  // BossMod P3RockBuster/P3MountainBuster: sourced ranges + Titan R4.55.
  // Both angles are explicitly TODO verify in that source, so remain estimates.
  rockLen: 10.55, rockHalf: Math.PI / 3,
  mountainLen: 15.55, coneHalf: Math.PI / 4,
  swR: 14, stackR: 4.5, fetterMax: 10, // 畫面層需要的欄位（泰坦階段用不到）
};
const ROLES = ["MT", "ST", "H1", "H2", "D1", "D2", "D3", "D4"];
const ROLE_COLOR = ["#6096ff", "#6096ff", "#5fd08a", "#5fd08a", "#ff7b7b", "#ff7b7b", "#ff7b7b", "#ff7b7b"];
const DIR_NAME = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"];
const BASE_MARKERS = [["A", 0, -6.5, "#ff6b6b"], ["B", 6.5, 0, "#ffd166"], ["C", 0, 6.5, "#6096ff"], ["D", -6.5, 0, "#c084fc"], ["1", 0, 0, "#ff6b6b"]];
let MARKERS = BASE_MARKERS;
const DIE = [1, 4, 5, 6];   // 自殺：ST＋三名輸出（回放 10/10 是 3 輸出＋1 坦克）
const GAOL = [3, 2, 7];     // 石牢站位（回放 8/8）：H2（盾補）離泰坦最遠、最先炸開 → H1（純補）在場中 → D4（法系）最靠泰坦、最後炸開
const CHECKPOINTS = [{ t: -4, name: "開場：地裂、死刑" }, { t: 17.5, name: "大地之重（自殺）" }, { t: 25, name: "第二次大地粉碎：讀面向、擊退、石牢" }, { t: 62, name: "後半：大地之重、山崩" }, { t: 79, name: "第三次大地粉碎：讀面向、第四牢" }, { t: 99, name: "山崩、換坦死刑" }, { t: 119, name: "四顆炸彈繞場" }];
const END_T = 157;

const rad = (deg) => (deg * Math.PI) / 180;
const polar = (deg, r) => ({ x: Math.sin(rad(deg)) * r, y: -Math.cos(rad(deg)) * r });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const S = { opts: { preset: "reference", seed: Math.floor(Math.random() * 0x100000000), role: 7, start: -4, speed: 1, assist: true, hints: true, god: false, view: "game" }, pitch: 0.55, dist: 22 };
// 第二次地裂的方位決定整個座標框：以下站位都用「泰坦在北 (0,-14)」來寫，再用 F() 轉成實際方位。
// 回放裡四個方位各自的炸彈缺口：北 (-5,12)、南 (-5,-12)、西 (12,-5)、東 (-12,5)。
const FRAME = [(x, y) => ({ x, y }), (x, y) => ({ x: -y, y: -x }), (x, y) => ({ x, y: -y }), (x, y) => ({ x: y, y: x })];
const F = (x, y) => FRAME[S.g2](x * S.mir, y); // S.mir：炸彈有兩種排法（左右鏡像），跟泰坦跳到哪一邊無關
const TITAN2 = () => F(0, -14);
const BOMBS = [[5, 5], [-5, 5], [5, 12], [11, 11], [-11, 11]], GAP = [-5, 12];
const LAND = [-4.5, 14.2];
function stackSpot() { const u = { x: LAND[0], y: LAND[1] + 14 }, n = Math.hypot(u.x, u.y); return F((u.x / n) * 4.6, -14 + (u.y / n) * 4.6); } // 泰坦腳前 4.6 米、在「泰坦→缺口」的線上
const GAOL_SPOT = [[-3, 6], [0, 0], [0, -7]];

// Opening landing keeps the full arena. Later landings remove one four-unit ring.
function arenaAt(t) {
  const second = S.reference ? 330.726 - REFERENCE_ORIGIN : 30.5;
  const third = S.reference ? 384.978 - REFERENCE_ORIGIN : 84.3;
  if (t < second) return { radius: 20, previousRadius: 20, collapse: 0 };
  const lastLanding = t < third ? second : third;
  return { radius: t < third ? 16 : 12, previousRadius: t < third ? 20 : 16,
    collapse: clamp01((t - lastLanding) / 1.2) };
}
function arenaSupportRadius() {
  const arena = S.arena || arenaAt(S.t);
  return arena.previousRadius + (arena.radius - arena.previousRadius) * arena.collapse;
}

function reset() {
  const o = S.opts, rnd = mulberry32(o.seed >>> 0);
  S.reference = o.preset === "reference"; S.replay = S.reference ? globalThis.UWU_REFERENCE?.titan : undefined;
  MARKERS = S.reference ? (S.replay?.markers || globalThis.UWU_REFERENCE?.garuda?.markers || [...BASE_MARKERS,["2",0,-18,"#ffd166"],["3",12.7,-12.7,"#6096ff"],["4",12.7,12.7,"#c084fc"]]) : BASE_MARKERS; S.markers = MARKERS;
  S.rnd = rnd; S.t = o.start; S.arena = arenaAt(S.t); S.over = null; S.paused = false;
  S.aoes = []; S.casts = []; S.tl = []; S.log = []; S.flashRings = []; S.props = []; S.crushMark = null;
  S.keys = {}; S.cam = S.cam || 0; S.zoom = S.zoom || 1;
  S.buff = { sprint: -Infinity }; S.cd = { sprint: -Infinity, provoke: -Infinity };
  S.g2 = Math.floor(rnd() * 4);
  S.mir = rnd() < 0.5 ? 1 : -1;
  S.g3 = (S.g2 + 1 + Math.floor(rnd() * 3)) % 4;   // 第三次地裂：另外三個正點隨機（回放 8 筆：對面 4、順 90 度 3、逆 90 度 1）
  S.g4 = 2 + Math.floor(rnd() * 2);                // 第四個石牢：隨機點一個補師
  S.bomb0 = Math.floor(rnd() * 4);                 // 最後四顆炸彈：第一顆的角落隨機，之後固定順時針
  if (S.reference) { if(o.randomJumps===false){S.g2=S.replay?.g2 ?? 3;S.g3=S.replay?.g3 ?? 2;} S.mir=S.replay?.mir ?? -1; S.g4=S.replay?.g4 ?? 3; S.bomb0=S.replay?.bomb0 ?? 0; }
  const jumpRnd=mulberry32((o.seed^0x54495441)>>>0);
  S.jumps=[{land:S.reference?relative(330.726):30.5,launch:S.reference?relative(327.730):27.5,direction:S.g2,sourceDirection:3},
    {land:S.reference?relative(384.978):84.3,launch:S.reference?relative(381.987):81.5,direction:S.g3,sourceDirection:2}]
    .map((j,index)=>({...j,index,cue:j.launch-2.0,target:polar(j.direction*90,14),feint:o.randomJumps!==false&&jumpRnd()<.5,feintSign:jumpRnd()<.5?-1:1}));
  S.tank = o.start < 3 ? null : o.start >= 104 && o.start < 119.6 ? 1 : 0; // 泰坦出場時仇恨重置，MT 要挑釁（回放 7/8 筆在落地後 2.5～5.6 秒按）
  S.fetterDps = 4; S.bossCard = 0; S.bossDyn = null;
  S.stun = -Infinity; S.jailed = {}; S.freed = {}; S.gaols = []; S.slide = []; S.gaol4 = null; S.slideWave = null; S.slideRef = null;
  S.gaolStage={}; S.wotl = [0, 0, 0, 0, 0, 0, 0, 0]; S.sacrificeDeadline=null;
  S.ents = ROLES.map((_, i) => ({ ...((i===o.role?practicePosition(ROLES[i],o.start):npcReferencePosition(ROLES[i],o.start)) || home(i,o.start)), i, face: 0, fallY: 0, fallTime: 0, plannedDeath: false, dead: !S.reference && o.start > 27.3 && o.start < 50.6 && DIE.includes(i) }));
  if (S.reference) for (const e of referenceLifeEvents().filter(e=>relative(e.time)<o.start)) applyReferenceLife(e);
  if(S.reference){
    if(o.role===5&&o.start<relative(325.589))Object.assign(S.ents[5],npcReferencePosition('D2',o.start));
    for(const i of DIE){const raise=S.replay?.raises?.find(e=>e.role===ROLES[i]&&e.time>325.589);
      if(o.start>relative(325.589)&&raise&&o.start<relative(raise.time)){S.ents[i].dead=true;S.ents[i].plannedDeath=true;}
    }
  }
  const cameraAnchor=S.ents[o.role]; S.cam=Math.atan2(-cameraAnchor.x,cameraAnchor.y);
  S.events = (S.reference ? buildReferenceEvents() : buildEvents()).filter((e) => e.t >= o.start - 1e-6).sort((a, b) => a.t - b.t);
  S.evIdx = 0;
  if (!S.reference && o.start > 36 && o.start < 41.5) placeBombs();
}
const alive = (i) => !S.ents[i].dead;
function placeBombs() { S.props = BOMBS.map(([x, y]) => ({ type: "bomb", pos: F(x, y) })); }

// ---------- 泰坦 ----------
const D3 = () => S.g3 * 90, G3 = () => polar(D3(), 14);
function bossSpot(t) {
  for(const j of S.jumps||[])if(t>=j.cue&&t<j.land+.05){
    const from=S.reference ? practicePoint(samplePath(S.replay?.bossPath,j.cue-.01)||{x:0,y:0},j.cue-.01) : (j.index===0?{x:0,y:0}:F(0,-9));
    if(t<j.launch)return {pos:from,vis:true,alt:0};
    if(t<j.launch+.3)return {pos:from,vis:true,alt:48*clamp01((t-j.launch)/.3)};
    if(t<j.land-.25)return {pos:j.target,vis:false,alt:48};
    return {pos:j.target,vis:true,alt:t<j.land?48*Math.pow((j.land-t)/.25,2):0};
  }
  const observed = S.reference && practicePoint(samplePath(S.replay?.bossPath,t),t);
  if (observed) return {pos:observed,vis:t>=0};
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
  if((S.jumps||[]).some(j=>t>=j.land&&t<j.land+2))return {x:0,y:0};
  for(const j of S.jumps||[])if(t>=j.cue&&t<j.land){
    if(j.feint&&t<j.cue+.45){const origin=bossSpot(j.cue).pos,dx=j.target.x-origin.x,dy=j.target.y-origin.y;return {x:origin.x-dy*j.feintSign,y:origin.y+dx*j.feintSign};}
    return j.target;
  }
  if (t >= 25.3 && t < 30.5) return TITAN2(); if (t >= 30.5 && t < 39.2) return { x: 0, y: 0 }; // 落地後面向場中：腳下目標圈的箭頭是擊飛站位的參考點
  if (t >= 79.3 && t < 84.3) return G3(); if (t >= 84.3 && t < 86.9) return { x: 0, y: 0 };
  const h = S.tank === null ? 7 : S.tank; return alive(h) ? S.ents[h] : { x: 0, y: 0 };
}
const jumping = (t) => (t >= 25.3 && t < 32.9) || (t >= 79.3 && t < 86.9);
const bossState = bossSpot;
const tankable = () => false;
const RING = { r: 4.2, tip: 5.1, half: 0.9 }; // 泰坦腳下的目標圈與面向箭頭（估）
function bossRing(t) { const b = bossSpot(t); return b.vis && !b.alt ? { pos: b.pos, look: bossLook(t), ...RING } : null; }
// 畫面層共用介面：泰坦階段沒有這些東西
const dashers = () => [], nails = () => [], swActive = () => [], hasSw = () => false, fetterOn = () => false;
function sceneActors(t) { const b = bossSpot(t); return b.vis ? [{ pos: b.pos, alt: b.alt || 0, look: bossLook(t), real: false, tag: "", color: 0xa16207 }] : []; }
function sceneGuides(t) { // 輔助預兆：擊飛落點線、石牢站位、MT 山崩站位
  if (!S.opts.assist) return [];
  const out = [], kp = kbPreview();
  if (S.reference) {
    const observed=practicePosition(ROLES[S.opts.role],t);
    if(observed) out.push({type:"ring",pos:observed,color:"#55dba6"});
    if(kp) out.push({type:"line",a:kp.from,b:kp.to,color:kp.bad?"#ff4d4d":"#4cc2ff"},{type:"ring",pos:kp.to,color:kp.bad?"#ff4d4d":"#4cc2ff"});
    if(t>=relative(341.411)&&t<relative(346.323)) for(const role of ["H2","H1","D4"]) {
      const pos=practicePosition(role,relative(346.323)); if(pos) out.push({type:"ring",pos,color:"#ffd166"});
    }
    return out;
  }
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
  if (t < 46.2) { const g = GAOL.indexOf(i); if (g >= 0) return t < 43.5 ? F(...[[-8.7, 7], [-7, 3], [-5.4, -1]][g]) : F(...GAOL_SPOT[g]); return t < 43.5 ? F(-8, 5.4) : F(-13.5, 0); } // 石牢三人排成一條鏈；MT 在山崩詠唱開始（43.4 秒）時站在偏西 22 度的位置，讓石牢三人落在兩條線中間，之後再往側邊走
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
function rectAoe(from, ang, half, len, back = .5) { // 從 from 沿 ang（弧度）射出的長條
  const ux = Math.cos(ang), uy = Math.sin(ang);
  return {
    shape: { type: "rect", from, ang, half, len, back },
    hit: (p, m = 0) => { const dx = p.x - from.x, dy = p.y - from.y, along = dx * ux + dy * uy; return along >= -back && along <= len && Math.abs(-dx * uy + dy * ux) <= half + m; },
    draw: (g, k) => { g.save(); g.translate(from.x, from.y); g.rotate(ang); g.beginPath(); g.rect(-back, -half, len + back, half * 2); fillAoe(g, k); g.restore(); },
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
function kill(i, why, mechanic = null) { // 有人被打死：玩家死在該自殺的時候不算失敗
  const e = S.ents[i]; if (e.dead) return; const me = i === S.opts.role;

  if (DIE.includes(i) && mechanic?.plannedWeight && Math.abs(S.t-mechanic.resolveAt)<0.51) { e.dead = true; e.plannedDeath = true; flash(`${ROLES[i]} 自殺（${why}）${me ? "：正確，等復活" : ""}`); return; }
  if (S.opts.god) return flash(`（觀摩判定）${ROLES[i]}：${why}`);
  if (me) { if (!S.opts.god) { e.dead = true; e.plannedDeath = false; } return die(why); }
  e.dead = true; die(`${ROLES[i]} 被打死：${why}`); // 該活著的隊友死了就算失敗
}

// Recorded life state is separate from collision verdicts and cast timestamps.
function applyReferenceLife(event) {
  const i=ROLES.indexOf(event.role), e=S.ents[i];
  e.recordedDead=event.dead;
  if(!event.dead && e.plannedDeath) {
    e.dead=event.dead;

    if(!event.dead) {
      e.plannedDeath=false; e.fallY=0; e.fallTime=0;
      const pos=practicePosition(event.role,relative(event.time));
      if(pos) Object.assign(e,pos);
    }
  }
}
function referenceLifeEvents() {
  return [...(S.replay?.deaths || []).map(e=>({...e,dead:true})), ...(S.replay?.raises || []).map(e=>({...e,dead:false}))]
    .filter(e=>ROLES.includes(e.role)&&Number.isFinite(e.time)).sort((a,b)=>a.time-b.time);
}
function buildReferenceEvents() {
  const events=[], at=(t,run,name)=>{events.push({t,run}); if(name) S.tl.push({t,name});};
  // Match the practice handoff. Without this, a non-MT player watches Titan
  // face D4 until the first buster's setup event, more than twelve seconds late.
  at(3.5,()=>{if(S.tank===null&&S.opts.role!==0){S.tank=0;flash('MT 挑釁接泰坦');}},'MT 挑釁接泰坦');
  at(10,()=>{if(S.tank!==0)die(S.opts.role===0?'你是 MT：泰坦落地後要按 3 挑釁接王（10 秒前）':'泰坦要由 MT 挑釁接王：仇恨不在 MT 身上');});
  // Match the practice engine: prison-bound actors are not direct player hit targets.
  // This follows logged拘束 state, never distance to a reference path.
  const directTarget=e=>!e.dead&&!S.jailed[e.i]&&!(S.freed[e.i]>S.t);
  const hit=(shape,why,mechanic)=>{for(const e of S.ents) if(directTarget(e)&&shape.hit(e)) kill(e.i,`（估計判定）${why}`,mechanic);};
  const circle=(c,r,t0,t1,why,mechanic)=>{const shape=circleAoe(c,r); addAoe({...shape,t0,t1,plannedWeight:mechanic?.plannedWeight,onHit(){hit(shape,why,mechanic);}});};
  const grouped=new Map();
  for(const row of REFERENCE_CASTS) {
    const key=`${row.time}/${row.name}`, g=grouped.get(key);
    if(g) g.sources.push(row.source); else grouped.set(key,{...row,sources:[row.source]});
  }
  let slideIndex=0;
  for(const row of grouped.values()) {
    if(row.name.startsWith('unknown_'))continue;
    const logged=(S.replay?.eventCasts||[]).filter(e=>Math.abs(e.t-row.time)<.002);
    const t=relative(row.time), t0=logged.length?relative(Math.min(...logged.map(e=>e.t0))):+(t-row.duration).toFixed(3);
    const spawn=(run)=>{if(t>=S.opts.start)at(Math.max(t0,S.opts.start),run);};
    if(row.duration) S.casts.push({name:row.name,t0,t1:t});
    at(t,()=>flash(`回放施法完成：${row.name}${row.sources.length>1?` ×${row.sources.length}`:""}`),`${row.name}${row.sources.length>1?` ×${row.sources.length}`:""}（施法完成）`);
    if(row.name==='大地粉碎') {
      const c=row.time<310?{x:0,y:0}:row.time<350?TITAN2():G3();
      spawn(()=>circle(c,row.time<310?CFG.crushR:CFG.crush2R,S.t,t,'靠近大地粉碎落點'));
    }
    if(row.name==='大地之重' && row.sources.some(source=>/^泰坦 \d/.test(source))) {
      spawn(()=>{
        if(row.time===325.589)S.sacrificeDeadline=t;
        const count=logged.filter(e=>e.ability===11109).length||4;
        const eligible=S.ents.filter(e=>!e.dead&&!S.jailed[e.i]);
        for(let j=eligible.length-1;j>0;j--){const k=Math.floor(S.rnd()*(j+1));[eligible[j],eligible[k]]=[eligible[k],eligible[j]];}
        const points=eligible.slice(0,count).map(e=>{
          const p=S.opts.start>t0?practicePosition(ROLES[e.i],t0)||e:e;
          return {x:p.x,y:p.y};
        });
        for(const c of points) circle(c,CFG.wotlR,S.t,t,'站在大地之重裡',{plannedWeight:row.time===325.589,resolveAt:t});
      });
    }
    if(row.name==='地裂') {
      const gaps=[375.212,403.859,433.484].includes(row.time), index=slideIndex++;
      spawn(()=>{
        const T={...bossSpot(t0).pos}, pool=S.ents.filter(e=>!e.dead&&!S.jailed[e.i]);
        // Practice chooses a live eligible bait; recordings calibrate timing only.
        // Freeze the direction here so the targeted player can dodge after the tell.
        const target=pool[Math.floor(S.rnd()*pool.length)]||{x:0,y:0};
        const base=gaps&&S.slideRef?S.slideRef.a0:Math.atan2(target.y-T.y,target.x-T.x);
        const offs=gaps?[22.5,-22.5,90,-90,180]:[0,45,-45,135,-135];
        if(!gaps) S.slideRef={T,a0:base};
        S.slideWave={id:index,T,base,offs,t1:t,hold:0,target:target.i};
        for(const off of offs) {const shape=rectAoe(T,base+rad(off),CFG.slideHalf,!gaps&&off===0?44.55:40.5,!gaps&&off===0?4.55:.5); addAoe({...shape,t0:S.t,t1:t,onHit(){hit(shape,'被地裂直線打到');}});}
      });
    }
    if(row.name==='大怒震') at(t,()=>{
      const T=TITAN2(); for(const e of S.ents) if(!e.dead) {
        const d=Math.max(dist(e,T),.01); e.x+=(e.x-T.x)/d*CFG.kb; e.y+=(e.y-T.y)/d*CFG.kb;
        e.knockbackPos={x:e.x,y:e.y};e.knockbackUntil=S.t+2;
        if(Math.hypot(e.x,e.y)>arenaSupportRadius()) updateFall(e,0);
      } S.stun=S.t+2;
    });
    if(row.name==='冲击'||row.name==='大爆炸') {
      for(const source of row.sources) {
        const n=Number(source.match(/爆破岩石 (\d+)/)?.[1]); if(!n) continue;
        const loggedBomb=logged.find(e=>e.actor===30&&e.instance===n);
        const c=loggedBomb?practicePoint({x:loggedBomb.x,y:loggedBomb.y},t):n<=5?F(...BOMBS[n-1]):n===6?F(...GAP):polar(45+((S.bomb0+n-7)%4)*90,4.24);
        if(row.name==='冲击') {
          at(t-.8,()=>circle(c,CFG.bombLandR,S.t,t,'被落下的炸彈砸到'));
          at(t,()=>S.props.push({type:'bomb',pos:c,refId:n}));
        } else {
          spawn(()=>circle(c,CFG.bombR,S.t,t,'被炸彈炸到'));
          at(t,()=>S.props=S.props.filter(p=>p.refId!==n));
        }
      }
    }
    if(row.name==='碎岩'||row.name==='山崩') at(t-1.2,()=>{
      const targetName=row.source.split('→ ')[1];
      const role=Object.entries(globalThis.UWU_REFERENCE?.roles||{}).find(([,name])=>name===targetName)?.[0];
      const holder=role?ROLES.indexOf(role):0; S.tank=holder;
      const half=row.name==='碎岩'?CFG.rockHalf:CFG.coneHalf,len=row.name==='碎岩'?CFG.rockLen:CFG.mountainLen;
      const shape=coneAoe(()=>bossSpot(S.t).pos,()=>S.ents[holder],half,len);
      addAoe({...shape,t0:S.t,t1:t,assistOnly:true,skip:[holder],plannerHit:holder!==S.opts.role?coneAoe(()=>bossSpot(t).pos,()=>npcReferencePosition(ROLES[holder],t)||S.ents[holder],half,len).hit:null,onHit(){for(const e of S.ents) if(directTarget(e)&&e.i!==holder&&this.hit(e)) kill(e.i,`（估計判定）站在${row.name}扇形裡`);}});
    });
    // Gaol cast is target selection. Do not mistake it for the later status application,
    // and canceled Granite Impact casts must never become an explosion or death.
  }
  for(const e of referenceLifeEvents()) {
    const label=e.dead?'死亡':e.proxy?'復活狀態代理（衰弱／瀕死套用）':'復活';
    at(relative(e.time),()=>{
      applyReferenceLife(e);
      if(!e.dead)flash(`${e.role} 接受復活`);
    },e.dead?null:`${e.role} 復活狀態代理`);
  }
  for(const e of S.replay?.gaolStates||[]) {
    const apply=()=>{
      const i=ROLES.indexOf(e.role); if(i<0)return;
      const restoring=relative(e.time)<S.opts.start;
      if(e.active) {
        S.jailed[i]=true;
        const observed=restoring?practicePosition(e.role,relative(e.time)):null;
        const entry={who:i,pos:observed||{x:S.ents[i].x,y:S.ents[i].y},broken:false,chain:e.time<360};
        S.gaols.push(entry);S.props.push({type:'gaol',pos:entry.pos,refRole:i,gaol:entry});
      } else {
        const entry=S.gaols.find(g=>g.who===i&&!g.broken);
        if(entry&&entry.chain){
          const previous=S.gaols.filter(g=>g.chain&&g.broken);
          const bomb=S.replay?.eventCasts?.find(c=>c.actor===30&&c.instance===6&&c.ability===11114);
          const center=bomb?practicePoint({x:bomb.x,y:bomb.y},relative(bomb.t)):F(...GAP);
          const connected=previous.length?previous.some(g=>dist(g.pos,entry.pos)<=CFG.chain):dist(center,entry.pos)<=CFG.chainFirst;
          if(!connected&&!restoring){flash(`${ROLES[i]} 石牢未連上炸彈／前一個石牢`);return;}
          entry.broken=true;
        } else if(entry){
          const near=S.ents.filter(p=>p.i!==i&&!p.dead&&dist(p,entry.pos)<=9).length;
          if(!restoring&&(Math.hypot(entry.pos.x,entry.pos.y)>4||near<4)){die('石牢未放在場中或附近救援隊友不足');return;}
          entry.broken=true;
        }
        delete S.jailed[i];S.freed[i]=S.t+.4;S.props=S.props.filter(p=>p.refRole!==i);
      }
    };
    if(relative(e.time)<S.opts.start) apply();
    else at(relative(e.time),apply,`實際狀態：${e.role} 石牢${e.active?'生效':'解除'}`);
  }
  at(relative(352.650),()=>{
    const chain=S.gaols.filter(g=>g.chain);
    if(chain.length&& (chain.some(g=>!g.broken)||!chain.some(g=>g.broken&&dist(g.pos,TITAN2())<=CFG.chain)))
      die('石牢連鎖失敗：三牢必須接上第六顆炸彈，逐個連到泰坦。');
  });
  const cutoff=relative(S.replay?.end ?? REFERENCE_END);
  at(cutoff,()=>{S.over={win:false,recordEnd:true,t:S.t,reason:'已完成本隊資料涵蓋的泰坦機制練習。來源紀錄止於 7:29，這不是你的失敗，也不代表泰坦擊殺；可選其他起點重練。'};});
  S.tl.sort((a,b)=>a.t-b.t);
  return events.filter(e=>e.t<=cutoff);
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
    at(t - 1.5, () => addAoe({ ...coneAoe(boss, () => S.ents[holder()], nm === "岩石破壞" ? CFG.rockHalf : CFG.coneHalf, nm === "岩石破壞" ? CFG.rockLen : CFG.mountainLen), t0: S.t, t1: t, assistOnly: true, skip: [0, 1], onHit() { const h = holder(); hitAll((e) => e.i !== h && this.hit(e), `站在泰坦正面吃到${nm}（非接王的人站泰坦背後）`); } }), `${nm}（${who} 死刑）`);
  };
  buster(13.6, "岩石破壞", "MT"); buster(16.8, "山崩破壞", "MT");
  // 大地之重：每個人腳下一個圈，3 秒後爆。兩發，第二發是自殺用的
  const wotl = (t, label, suicide, msg) => {
    cast("大地之重", t - 3, t - 0.5);
    at(t - 3, () => {
      const pts = []; for (const e of S.ents) if (!e.dead && !S.jailed[e.i] && !pts.some((p) => dist(p, e) < 0.25)) pts.push({ x: e.x, y: e.y });
      if(suicide)S.sacrificeDeadline=t;
      for (const c of pts) addAoe({ ...circleAoe(c, CFG.wotlR), t0: S.t, t1: t, suicide, onHit() { for (const e of S.ents) { if (e.dead || !this.hit(e)) continue; kill(e.i, "站在大地之重裡", {plannedWeight:suicide,resolveAt:t}); } } });
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
      if (Math.hypot(e.x, e.y) > arenaSupportRadius()) { updateFall(e,0); if (S.over) return; }
    }
    S.stun = S.t + 2; flash("隆起：擊飛 24 米，暈眩 2 秒");
  }, "隆起（擊飛 24 米）");
  at(41.2, () => flash("石牢點名：H2、H1、D4"), "石牢點名 ×3");
  at(43.2, () => { const c = F(...GAP); addAoe({ ...circleAoe(c, CFG.bombLandR), t0: S.t, t1: 44, onHit() { hitAll((e) => this.hit(e), "被第六顆炸彈岩砸到（落地後要離開缺口）"); } }); }, "第六顆炸彈岩落在缺口");
  at(44, () => S.props.push({ type: "bomb", pos: F(...GAP), sixth: true }));
  // 山崩：五條線，中間那條對準 MT，另外四條偏 ±45、±135 度；詠唱開始時鎖定方向
  // 山崩（依 log 逐波核對 8 筆）：
  //  ・第一波：中線瞄準「隨機一名可被選中的玩家」（坦克、補師、輸出都出現過，誤差 5 度內），另外四條偏 ±45、±135 度；詠唱開始時鎖定。
  //  ・62 秒後的第二波：同一個原點，五條線剛好落在第一波的五個空隙（±22.5、±90、180 度）。
  //  ・50 秒那一波是重新瞄準：當時只有 MT 沒被關也沒死，所以一定打 MT。
  const slide = (t, gaps) => {
    cast("山崩", t - 2.2, t);
    at(t - 2.2, () => {
      let T, base, offs;
      if (gaps) { ({ T } = S.slideRef); base = S.slideRef.a0; offs = [22.5, -22.5, 90, -90, 180]; }
      else {
        const pool = S.ents.filter((e) => !e.dead && !S.jailed[e.i]); const tg = pool[Math.floor(S.rnd() * pool.length)] || S.ents[0];
        T = { ...bossSpot(S.t).pos }; base = Math.atan2(tg.y - T.y, tg.x - T.x); offs = [0, 45, -45, 135, -135]; S.slideRef = { T, a0: base };
        flash(`山崩瞄準 ${ROLES[tg.i]}`);
      }
      S.slideWave = { id: t, T, base, offs, t1: t, hold: gaps ? t - 2 + 0.03 : 0 }; // 第二波在第一波結算前 0.2 秒就鎖定：等第一波炸完再動
      for (const off of offs) addAoe({ ...rectAoe(T, base + rad(off), CFG.slideHalf, !gaps&&off===0?44.55:40.5, !gaps&&off===0?4.55:.5), t0: S.t, t1: t, onHit() { hitAll((e) => this.hit(e), "被山崩打到"); } });
    }, gaps ? "山崩第二波（打在第一波的空隙）" : "山崩（五條線，中線瞄準隨機一人）");
  };
  slide(45.6); slide(50);
  at(46.1, () => {
    for (const i of GAOL) if (alive(i)) { S.jailed[i] = true; S.gaols.push({ who: i, pos: { x: S.ents[i].x, y: S.ents[i].y }, broken: false }); }
    S.props.push(...S.gaols.map((g) => ({ type: "gaol", pos: g.pos, gaol: g })));
    flash("石牢成形：要靠第六顆炸彈引爆第一個，再一個炸一個");
  }, "石牢成形");
  at(46.6, () => { const c = F(...GAP); addAoe({ ...circleAoe(c, CFG.bombR), t0: S.t, t1: 49.6, onHit() { hitAll((e) => this.hit(e), "被第六顆炸彈岩炸到"); } }); });
  const breakGaol = (g, why) => { g.broken = true; delete S.jailed[g.who]; S.freed[g.who] = S.t + 1.2; S.props = S.props.filter((p) => p.gaol !== g); S.flashRings.push({ c: g.pos, r: 4, until: S.t + 0.5 }); flash(`${ROLES[g.who]} 的石牢被${why}炸開`); };
  at(49.6, () => { S.props = S.props.filter((p) => !p.sixth); const c = F(...GAP), g = S.gaols.filter((x) => !x.broken).sort((a, b) => dist(a.pos, c) - dist(b.pos, c))[0]; if (g && dist(g.pos, c) <= CFG.chainFirst) breakGaol(g, "炸彈岩"); }, "第六顆炸彈爆炸 → 石牢連鎖");
  for (const t of [50.3, 51.1]) at(t, () => { const done = S.gaols.filter((x) => x.broken); const g = S.gaols.filter((x) => !x.broken).sort((a, b) => Math.min(...done.map((d) => dist(d.pos, a.pos)), 99) - Math.min(...done.map((d) => dist(d.pos, b.pos)), 99))[0]; if (g && done.some((d) => dist(d.pos, g.pos) <= CFG.chain)) breakGaol(g, "隔壁的石牢"); });
  at(52, () => { if(S.gaols.length===3&&S.gaols.every(g=>g.broken)&&!S.gaols.some(g=>dist(g.pos,TITAN2())<=CFG.chain)){die('石牢連鎖沒有接到泰坦');return;} const stuck = S.gaols.filter((g) => !g.broken); if (stuck.length) { S.over = S.opts.god ? null : { win: false, reason: `石牢沒有全部炸開（${stuck.map((g) => ROLES[g.who]).join("、")} 還關著）：三個人要排成一條鏈，第一個貼近第六顆炸彈，每個相隔 ${CFG.chain} 米內`, t: S.t }; if (S.opts.god) flash("（觀摩模式）石牢沒有全部炸開"); } });
  at(50.6, () => { for (const i of DIE) { S.ents[i].dead = false; S.ents[i].plannedDeath = false; S.ents[i].fallY=0; S.ents[i].fallTime=0; } flash("自殺的四個人接受復活"); }, "自殺的人接受復活");
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
    at(tb, () => { const c = corner(n); S.props.push({ type: "bomb", pos: c, late: n }); addAoe({ ...circleAoe(c, CFG.bombR), t0: S.t + 2.5, t1: tb + 5.5, onHit() { S.props = S.props.filter((p) => p.late !== n); hitAll((e) => this.hit(e), "被炸彈岩炸到（要待在外圈）"); } }); });
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
// 躲山崩：以泰坦為圓心，把自己轉到最近的「兩條線中間」，距離不變。會避開還沒爆的圓形範圍與場外
function slideDodge(e, h) {
  const w = S.slideWave; if (e.sw && e.sw.id === w.id) return e.sw.pos || greedy(e, h);
  const ref = dist(e, w.T) > 5 ? e : h, d = Math.max(6.5, dist(ref, w.T)), cur = Math.atan2(ref.y - w.T.y, ref.x - w.T.x);
  const offs = w.offs.map((o) => ((o % 360) + 360) % 360).sort((a, b) => a - b), mids = offs.map((o, k) => { const nx = k + 1 < offs.length ? offs[k + 1] : offs[0] + 360; return { a: w.base + rad((o + nx) / 2), width: nx - o }; });
  const dAng = (a) => Math.abs(Math.atan2(Math.sin(a - cur), Math.cos(a - cur)));
  const circles = S.aoes.filter((a) => !a.done && a.shape.type === "circle" && !(a.skip && a.skip.includes(e.i)));
  let best = null;
  for (const m of mids.sort((x, y) => dAng(x.a) - dAng(y.a))) for (const dd of [d, d + 3, d - 3, d + 6]) {
    const q = { x: w.T.x + Math.cos(m.a) * dd, y: w.T.y + Math.sin(m.a) * dd };
    if (dd < 6 || Math.hypot(q.x, q.y) > arenaSupportRadius() - 0.8 || circles.some((c) => c.hit(q, 0.8)) || dist(e, q) > CFG.speed * Math.max(0.3, w.t1 - S.t - 0.15)) continue;
    best = q; break;
  }
  e.sw = { id: w.id, pos: best };
  return best || greedy(e, h);
}
function gaolDodge(e, goal, slides) {
  if (!slides.some((a) => a.hit(goal, 0.1))) return goal;
  if (e.gaolDodge) return e.gaolDodge;
  // 山崩爆完到石牢成形只有半秒。選離目標最近的安全點，才來得及歸位。
  for (let r = 0.25; r <= CFG.speed * 0.5; r += 0.25) {
    for (let k = 0; k < 24; k++) {
      const q = { x: goal.x + r * Math.sin(k * Math.PI / 12), y: goal.y + r * Math.cos(k * Math.PI / 12) };
      if (Math.hypot(q.x, q.y) < arenaSupportRadius() - 0.4 && !slides.some((a) => a.hit(q, 0.1))) {
        e.gaolDodge = q;
        return q;
      }
    }
  }
  return slideDodge(e, goal);
}
// The reconstructed NPC teaching track already specifies position over time.
// A second chase cap/deadzone adds lag. Preserve any real
// displacement (knockback, frozen interval, gap entry) as an offset that catches
// up smoothly; ordinary playback follows the teaching track, not the raw guide.
function moveReferenceNpc(e,dt) {
  const now=npcReferencePosition(ROLES[e.i],S.t), before=npcReferencePosition(ROLES[e.i],S.t-dt);
  if(!now || !before) return false;
  if(S.replay?.rawCoordinates && !S.jailed[e.i]){
    if(e.knockbackPos&&S.t<e.knockbackUntil){Object.assign(e,e.knockbackPos);return true;}
    if(e.knockbackPos){e.avoidGoal={...e.knockbackPos};delete e.knockbackPos;}
    const jump=(S.jumps||[]).find(j=>S.t>=j.cue+.45&&S.t<j.land+.02);
    if(jump){
      const target=polar((jump.direction+2)*90,jump.index===0?15:11);
      const d=dist(e,target),f=d?Math.min(1,CFG.speed*dt/d):0;
      if(d>.01)e.face=Math.atan2(target.y-e.y,target.x-e.x);
      e.x+=(target.x-e.x)*f;e.y+=(target.y-e.y)*f;e.avoidGoal={...target};return true;
    }

    if(S.t>=relative(341.815)&&S.t<relative(346.323)&&GAOL.includes(e.i))delete e.avoidGoal;
    npcMotion.move(e,now,dt,{time:S.t,radius:arenaSupportRadius(),speed:npcMotion.observedSprintSpeed(ROLES[e.i],S.t+REFERENCE_ORIGIN,S.replay,CFG.speed),
      future:t=>npcReferencePosition(ROLES[e.i],t)||now,
      hazards:S.aoes.filter(a=>(!a.done||a.linger&&S.t<a.t1+a.linger)&&a.t0<=S.t&&!(a.skip||[]).includes(e.i)&& !(a.plannedWeight&&DIE.includes(e.i))).flatMap(a=>[a.hit,...(a.plannerHit?[a.plannerHit]:[])].map(hit=>({t1:Math.max(S.t,a.t1),hit}))) });return true;
  }
  const ox=e.x-before.x, oy=e.y-before.y, drift=Math.hypot(ox,oy);
  const remain=drift>1e-8?Math.max(0,1-CFG.speed*dt/drift):0;
  const x=S.replay?.rawCoordinates?now.x:now.x+ox*remain, y=S.replay?.rawCoordinates?now.y:now.y+oy*remain, dx=x-e.x, dy=y-e.y;
  if(Math.hypot(dx,dy)>1e-8) e.face=Math.atan2(dy,dx);
  e.x=x; e.y=y; return true;
}
function npcTarget(e) {
  const observed=npcReferencePosition(ROLES[e.i],S.t); if(observed) return observed;
  const h = home(e.i, S.t);
  if (S.t >= 43.4 && S.t < 46.2 && GAOL.includes(e.i)) {
    const slides = S.aoes.filter((a) => a.t1 === 45.6 && !a.done);
    if (slides.length) return gaolDodge(e, home(e.i, 45.6), slides);
  }
  if (S.t >= 33.5 && S.t < 46.2 && !(e.i === 0 && S.t > 41.2)) return h; // 擊飛與石牢站位是固定的，不做臨時閃避
  if (S.t >= 81.5 && S.t < 86.9) return h;
  if (S.t >= 119.6 && S.t < 128.7) return h;
  if (S.slideWave && S.t < S.slideWave.t1 + 0.05 && S.t >= 46.2) return S.t < S.slideWave.hold && dist(e, S.slideWave.T) < 11 ? e : slideDodge(e, h); // 離泰坦近的人線很密，要等第一波炸完；遠的人可以先動 // 四顆炸彈繞場：照固定路線一直走，大地之重的圈自然會被甩在後面
  if (S.t >= 133 && S.t < 135.15) { const r = Math.hypot(e.x, e.y) || 1, k = Math.max(r, 10.8) / r; return greedy(e, { x: e.x * k, y: e.y * k }); } // 最後一顆炸彈爆之前留在外圈，不要穿過場中
  return greedy(e, h);
}
function greedy(e, h) {
  if (!dangerAt(h, e.i, true)) return h;
  if (!dangerAt(e, e.i)) return e;
  let best = null, bd = 1e9;
  for (const r of [2, 4, 6, 8, 11, 14]) for (let k = 0; k < 24; k++) { const q = { x: e.x + Math.sin(k * 0.2618) * r, y: e.y - Math.cos(k * 0.2618) * r }; if (Math.hypot(q.x, q.y) > arenaSupportRadius() - 1 || dangerAt(q, e.i)) continue; if (r < bd) { bd = r; best = q; } }
  return best || h;
}
const frozen = (i) => S.ents[i].dead || S.jailed[i] || S.t < S.stun;
// Visual falling never rewrites reference NPC life events or approximate positions.
function updateFall(e,dt) {
  const outside=Math.hypot(e.x,e.y)>arenaSupportRadius();
  if(!outside) { e.fallY=0; e.fallTime=0; return; }
  e.fallTime=(e.fallTime||0)+dt;
  e.fallY=-Math.min(60,0.15+9.8*e.fallTime*e.fallTime/2);
  if(!e.dead && e.i===S.opts.role && !S.opts.god) {
    e.dead=true; e.plannedDeath=false;
    die(`掉出平台：目前平台半徑 ${S.arena.radius} 米；第二、三次大地粉碎後分別縮為 16、12 米，掉落不算大地之重自殺。`);
  } else if(!e.dead && e.i!==S.opts.role && !S.opts.god) {
    e.dead=true; e.plannedDeath=false;
    die(`${ROLES[e.i]} 掉出平台：擊退起點或移動位置不正確。`);
  }
}
function step(dt) {
  if (S.paused) return;
  if(S.over) { for(const e of S.ents) if(e.fallY<0) updateFall(e,dt); return; }
  S.t += dt;
  S.arena=arenaAt(S.t);
  while (S.evIdx < S.events.length && S.events[S.evIdx].t <= S.t) { S.events[S.evIdx++].run(); if (S.over) return; }
  const role = S.opts.role, p = S.ents[role];
  const kx = (S.keys.KeyD ? 1 : 0) - (S.keys.KeyA ? 1 : 0), ky = (S.keys.KeyS ? 1 : 0) - (S.keys.KeyW ? 1 : 0);
  if ((kx || ky) && !frozen(role)) {
    const n = Math.hypot(kx, ky), sx = kx / n, sy = ky / n, c = Math.cos(S.cam), s = Math.sin(S.cam), wx = sx * c - sy * s, wy = sx * s + sy * c, sp = CFG.speed * (S.buff.sprint > S.t ? 1.3 : 1) * dt;
    p.x += wx * sp; p.y += wy * sp; p.face = Math.atan2(wy, wx);
  }
  for (const e of S.ents) {
    if (e.i !== role && !(S.replay?.rawCoordinates ? e.dead||S.jailed[e.i] : frozen(e.i)) && !(S.reference && moveReferenceNpc(e,dt))) { const tg = npcTarget(e), d = dist(e, tg); if (d > 0.05) { const sp = Math.min(d, CFG.speed * dt); e.face = Math.atan2(tg.y - e.y, tg.x - e.x); e.x += ((tg.x - e.x) / d) * sp; e.y += ((tg.y - e.y) / d) * sp; } }
    updateFall(e,dt);
  }
  for (const a of S.aoes) if (!a.done && S.t >= a.t1) { a.done = true; a.onHit.call(a); if (S.over) return; }
  if(S.sacrificeDeadline!==null&&S.t>=S.sacrificeDeadline){
    S.sacrificeDeadline=null;
    const missed=DIE.filter(i=>!S.ents[i].dead||!S.ents[i].plannedDeath);
    if(missed.length)die(`自殺分工未完成：${missed.map(i=>ROLES[i]).join('、')} 必須吃第二波大地之重倒地，讓三牢只點到指定存活組。`);
  }
  S.aoes = S.aoes.filter((a) => S.t < a.t1 + 0.4);
}
function useSkill(k) { if (S.over) return; const t = S.t, role = S.opts.role;
  if (k === "provoke" && role <= 1 && S.cd.provoke <= t && !S.ents[role].dead) { if (!bossSpot(t).vis || jumping(t)) return flash("現在沒有目標可以挑釁"); S.cd.provoke = t + 30; S.tank = role; flash(`${ROLES[role]} 挑釁：仇恨到你身上`); } if (k === "sprint" && S.cd.sprint <= t) { S.buff.sprint = t + 10; S.cd.sprint = t + 45; flash("衝刺 10 秒"); } }

// ---------- 提示 ----------
function referenceHint() {
  const jump=(S.jumps||[]).find(j=>S.t>=j.cue&&S.t<j.land+1.2);
  if(jump){const final=S.t>=jump.cue+.45,dir=final?jump.direction:(jump.direction+(jump.feint?jump.feintSign:0)+4)%4;
    return `泰坦${S.t<jump.launch?'正面向':'跳往'}${DIR_NAME[dir*2]}。${!final?'留意起跳前是否再轉90度；以最後面向為準。':`跑到正對面的${DIR_NAME[((dir+2)%4)*2]}側。`}飛上空中後會消失，落地時外圈崩落，收進半徑${jump.index===0?16:12}米的平台。`;
  }
  const abs=S.t+REFERENCE_ORIGIN,r=S.opts.role,e=S.ents[r];
  if(e.plannedDeath) return '自殺分工完成：等待隊友復活，暫時不能移動。';
  if(r===0&&S.tank!==0&&S.t>=0&&S.t<10)return '泰坦已落地、仇恨重置：現在按 3 挑釁接王（落地後 10 秒前），再站到牠南側，讓牠背對隊友。';

  let advice;
  if(abs<300.720) advice='第一次大地粉碎將落在場中：先留在外圍、避開中央 11 米；這次落地保留半徑 20 米場地。';
  else if(abs<301.920) advice='第一次落地不縮場，平台半徑仍為 20 米；第二、三次落地才分別縮為 16、12 米。';
  else if(abs<319.854) advice=r===0?'MT 接王，讓泰坦背對北側隊友；接著是碎岩、山崩兩次死刑。':'站在泰坦背面，避開 MT 所在的南側死刑扇形。';
  else if(abs<328.176) advice=DIE.includes(r)?'第一波大地之重先閃開，再留在第二波圈裡完成自殺；ST、D1、D2、D3 都要執行。':'連續大地之重：離開腳下的圈。ST、D1、D2、D3 留在第二波大地之重自殺；其餘人離開。';
  else if(abs<330.726) advice='看泰坦起跳前的最後面向，跑向正對面場邊。落地後收進半徑16米的平台。';
  else if(abs<331.926) advice='第二次落地正在移除 16～20 米外圈：往半徑 16 米內移動，掉出平台不算大地之重自殺。';
  else if(abs<339.265) advice='回到泰坦腳前疊好，對準對面的炸彈缺口。大怒震會向外擊退；藍線顯示估計落點。';
  else if(abs<346.323) advice='擊退後離開炸彈缺口：H2 靠缺口、H1 場中、D4 靠泰坦，排成三牢連鎖。地裂鎖定後避開直線，再回各自位置。';
  else if(abs<352.601) advice='炸彈應連到 H2 → H1 → D4 → 泰坦。石牢解除就立即避開地裂、往泰坦側場邊集合，不要留在原地；牢擺錯不會自動解除。';
  else if(abs<367.719) advice='三牢解除後立即往泰坦側場邊集合，邊移動邊避招；準備怒震與兩輪大地之重。倒地隊友依衰弱／瀕死套用時間作為復活狀態代理。';
  else if(abs<375.212) advice='連續大地之重後接兩波地裂：先移開圈，第一波直線過後再換進剛炸過的位置。';
  else if(abs<384.978) advice='留意泰坦轉身；以起跳前最後面向判斷落點，跑到對面。落地後平台縮為半徑12米。';
  else if(abs<386.178) advice='第三次落地正在移除 12～16 米外圈：站在半徑 12 米內，接著準備第四個石牢。';
  else if(abs<400.382) advice=r===3?'第四個石牢點 H2：回場中，回放 6:32.388 拘束、6:40.382 解除。':'第四個石牢點 H2，放在場中；靠近處理，再準備兩波地裂。';
  else if(abs<403.859) advice='兩波地裂接續：留意第一波方向，結算後換到剛炸過的直線。';
  else if(abs<420.959) advice='怒震後接兩次死刑：遠離接王者的正面。綠圈只標原紀錄位置，不表示安全。';
  else if(abs<435.625) advice='四顆炸彈依序爆炸，與大地之重、地裂重疊。保持移動，別踩進尚未爆炸的範圍。';
  else advice='繼續避開死刑正面與後續大地之重；完成這段後顯示練習完成。校準資料到 7:29，不代表泰坦擊殺。';
  return advice;
}

function hint() {
  if(S.reference) return referenceHint();
  const t = S.t, r = S.opts.role, me = S.ents[r], dn = DIR_NAME[S.g2 * 2], op = DIR_NAME[(S.g2 * 2 + 4) % 8];
  if (me.dead) return t < 27.4 ? "你已自殺（正確）。隊友會先把復活讀好，你等石牢成形後再接。" : "你躺著等復活：50 秒左右才接，不要太早起來，不然石牢會點到你。";
  if (S.jailed[r]) return "你被關在石牢裡，不能動也不會被打。等第六顆炸彈引爆石牢的連鎖。";
  if (t < 0.4) return "泰坦會砸在場中（地裂）：先到外圍，這次保留半徑 20 米場地；第二、三次落地才縮為 16、12 米。" + (r === 0 ? "你是 MT：泰坦出場會重置仇恨，牠一落地你就要按 3 挑釁。" : "");
  if (r === 0 && S.tank !== 0 && t < 10) return "泰坦的仇恨重置了，牠現在沒在看你：馬上按 3 挑釁接王（10 秒前沒接到算失敗），然後站到牠的南側。";
  if (t < 18.9) return r === 0 ? "你拉泰坦：站牠的南側，吃岩石破壞和山崩破壞兩個死刑，讓牠背對北邊的人群。" : "站泰坦的北側。兩個死刑是打 MT 的正面扇形，別跑到南邊。";
  if (t < 21.95) return r === 0 ? "大地之重 1：腳下出圈，往西走開 6 米。" : "大地之重 1：每個人腳下出圈，全員一起往東走 6 米離開。";
  if (t < 27.4) {
    if (DIE.includes(r)) return "大地之重 2：你是自殺組（ST、D1、D2、D3）。留在東邊的圈裡不要動，被炸死才對。這樣石牢只會點活著的 H2、H1、D4。";
    return r === 0 ? "大地之重 2：走開。自殺組會留在東邊被炸死，這是故意的。" : "大地之重 2：你要活著。離開腳下的圈，走回泰坦北側。可以先讀復活，但自殺的人 50 秒才會接。";
  }
  if (t < 33.5) return t < 30.5 ? "看泰坦的面向：牠轉向哪一邊，就會跳到那一邊的場邊砸下來（第二次地裂）。離落點越近越痛，全員往牠面向的反方向跑，貼到正對面的場邊。" : `泰坦落在${dn}邊。`;
  if (t < 39.2) return `隆起會把你從泰坦身上往外推 24 米，暈 2 秒，不能防擊退。炸彈岩出現在你們背後，先回頭看：5 顆炸彈有兩種排法（左右鏡像），只缺一格。站位看泰坦腳下目標圈的箭頭：全員疊在箭頭尖端「靠缺口那一側」的角上（缺口在箭頭左邊就站左角，在右邊就站右角），被推過去才會剛好落在缺口。${S.opts.assist ? "藍線是你現在的位置會被推到哪。" : ""}偏一點就會落在炸彈旁邊或被推出場外。`;
  if (t < 41.2) return "被擊飛中，暈眩 2 秒。";
  if (t < 46.2) {
    const g = GAOL.indexOf(r);
    if (g >= 0) return `你被石牢點名。缺口這格馬上會落下第六顆炸彈，快離開。三個人要排成一條鏈：H2 離第六顆炸彈最近（${CFG.chainFirst} 米內，離泰坦最遠，最先炸開）、H1 在場中、D4 往泰坦方向再 7 米（最後炸開）。你是第 ${g + 1} 個，位置是${["最靠近炸彈缺口的那一點", "場中", "場中往泰坦方向 7 米"][g]}（開輔助預兆有黃圈）。注意 43.4 秒山崩會鎖定方向，中線瞄準隨機一人：四個人先一起待在偏離「泰坦 → 場中」那條線的同一側，鎖定後再踏進自己的位置，46 秒被關住前站好。`;
    return `山崩五條線的中線會瞄準隨機一名還能動的人（43.4 秒鎖定）。跟石牢三人待在同一側（偏離「泰坦 → 場中」那條線約 22 度${S.opts.assist ? "，有藍圈" : ""}），這樣不管瞄準誰，線都不會經過石牢的位置。鎖定後往側邊走開；50 秒那一波只剩你能被瞄準，一定打你，讀條後再橫移躲掉。`;
  }
  if (r === 0) return "只剩你能被瞄準：這一波山崩的中線一定對準你，詠唱開始就鎖定。看到讀條就橫移到兩條線之間。";
  if (t < 62) return "等復活的人起來，接著是八下全場傷害的激震。";
  const d3 = DIR_NAME[S.g3 * 2];
  if (t < 70.8) return "大地之重兩發：圈出在每個人腳下，3 秒後爆。全員疊在一起、一起移動，圈就只有一個：第一發整群穿過泰坦到另一側，第二發出圈就直接往泰坦正對面走（離泰坦約 14 米），準備躲山崩。";
  if (t < 76) return "山崩兩波。第一波：中線瞄準隨機一個人（詠唱開始就鎖定），其餘四條各偏 45、135 度，所以大家疊在一起時線會穿過人群，鎖定後橫移到兩條線之間。第二波：五條線剛好打在第一波的五個空隙，所以第一波一炸完就踏回剛炸過的線上。";
  if (t < 86.9) return t < 84.3 ? "再看一次泰坦的面向：牠轉向哪邊就跳到哪邊（第三次地裂）。全員到牠面向的正對面、離場中 11 米疊在一起。" : `泰坦落在${d3}邊。`;
  if (t < 99) {
    if (r === S.g4) return S.jailed[r] ? "你被關在場中的石牢裡，等隊友打破。" : "你被第四個石牢點名：91 秒前走到場中（1 號標記），讓大家圍著打。";
    return `第四個石牢點 ${ROLES[S.g4]}，他會站到場中：91 秒成形後全員靠過去打，98 秒前要打破（旁邊至少要有 4 個人）。`;
  }
  if (t < 104.5) return (r === 1 ? "打完後你（ST）要按 3 挑釁換坦，接下來兩個死刑是你的。" : "") + `山崩兩波：泰坦在${d3}側，退到對面。第一波中線瞄準隨機一人，鎖定後橫移到線與線之間；第二波打在第一波的空隙，第一波炸完就踏回剛炸過的線上。`;
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
  if (!(S.t >= (S.reference ? relative(336.230) : 33.5) && S.t < (S.reference ? relative(339.265) : 39.1)) || !S.opts.assist) return null;
  const T = TITAN2(), p = S.ents[S.opts.role]; if (p.dead) return null;
  const d = Math.max(dist(p, T), 0.01), to = { x: p.x + ((p.x - T.x) / d) * CFG.kb, y: p.y + ((p.y - T.y) / d) * CFG.kb };
  const bad = Math.hypot(to.x, to.y) > arenaSupportRadius() || BOMBS.some(([x, y]) => dist(F(x, y), to) <= CFG.bombR);
  return { from: p, to, bad };
}
function draw() {
  const sc = (W / 2 / (CFG.R + 4)) * S.zoom, t = S.t, role = S.opts.role;
  g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); g.fillStyle = "#020617"; g.fillRect(0, 0, W, W);
  g.save(); g.translate(W / 2, W / 2); g.rotate(-S.cam); g.scale(sc, sc);
  const floorRadius=arenaSupportRadius();
  g.beginPath(); g.arc(0, 0, floorRadius, 0, 7); g.fillStyle = "#1a1c22"; g.fill(); g.lineWidth = 0.4; g.strokeStyle = "#a16207"; g.stroke();
  for (const [, mx, my, col] of MARKERS) { g.beginPath(); g.arc(mx, my, 1.1, 0, 7); g.fillStyle = col + "33"; g.fill(); }
  g.save(); g.beginPath(); g.arc(0, 0, floorRadius, 0, 7); g.clip();
  for (const a of S.aoes) { if ((a.assistOnly && !S.opts.assist) || t < a.t0) continue; a.draw(g, a.done ? 1 : clamp01((t - a.t0) / Math.max(a.t1 - a.t0, 0.01))); }
  g.restore();
  for (const f of (S.flashRings = S.flashRings.filter((f) => f.until > t))) { g.beginPath(); g.arc(f.c.x, f.c.y, f.r, 0, 7); g.fillStyle = "rgba(255,220,140,.4)"; g.fill(); }
  for (const p of S.props) { g.beginPath(); if (p.type === "bomb") { g.arc(p.pos.x, p.pos.y, 1.5, 0, 7); g.fillStyle = "#7c2d12"; } else { g.rect(p.pos.x - 1.6, p.pos.y - 1.6, 3.2, 3.2); g.fillStyle = "rgba(160,160,170,.75)"; } g.fill(); }
  if (!S.reference && S.opts.assist && S.opts.role === 0 && t >= 39.1 && t < 43.5) { const c = F(-8, 5.4); g.beginPath(); g.arc(c.x, c.y, 1.3, 0, 7); g.lineWidth = 0.18; g.strokeStyle = "#4cc2ff"; g.stroke(); }
  if (!S.reference && S.opts.assist && t >= 41.1 && t < 46.2) GAOL_SPOT.forEach(([x, y]) => { const c = F(x, y); g.beginPath(); g.arc(c.x, c.y, 1.2, 0, 7); g.lineWidth = 0.15; g.strokeStyle = "#ffd166"; g.stroke(); });
  const kp = kbPreview(); if (kp) { g.beginPath(); g.moveTo(kp.from.x, kp.from.y); g.lineTo(kp.to.x, kp.to.y); g.lineWidth = 0.2; g.strokeStyle = kp.bad ? "#ff4d4d" : "#4cc2ff"; g.stroke(); g.beginPath(); g.arc(kp.to.x, kp.to.y, 0.9, 0, 7); g.stroke(); }
  if(S.reference && S.opts.assist) for(const guide of sceneGuides(t).filter(guide=>guide.type==="ring")) {
    g.beginPath(); g.arc(guide.pos.x,guide.pos.y,1,0,7); g.lineWidth=.15; g.strokeStyle=guide.color; g.stroke();
  }
  const b = bossSpot(t);
  if (b.vis) {
    g.beginPath(); g.arc(b.pos.x, b.pos.y, 3, 0, 7); g.fillStyle = b.alt ? "rgba(161,98,7,.45)" : "#a16207"; g.fill(); g.lineWidth = 0.2; g.strokeStyle = "#fde68a"; g.stroke();
    const br = bossRing(t);
    if (br) { const a = Math.atan2(br.look.y - b.pos.y, br.look.x - b.pos.x), px = -Math.sin(a), py = Math.cos(a), cx = b.pos.x + Math.cos(a) * br.r, cy = b.pos.y + Math.sin(a) * br.r;
      g.beginPath(); g.arc(b.pos.x, b.pos.y, br.r, 0, 7); g.lineWidth = 0.12; g.strokeStyle = "rgba(255,255,255,.8)"; g.stroke();
      g.beginPath(); g.moveTo(b.pos.x + Math.cos(a) * br.tip, b.pos.y + Math.sin(a) * br.tip); g.lineTo(cx + px * br.half, cy + py * br.half); g.lineTo(cx - px * br.half, cy - py * br.half); g.closePath(); g.fillStyle = "rgba(255,255,255,.9)"; g.fill(); }
  }
  for (const e of S.ents) { if(e.fallY < -3) continue; g.beginPath(); g.arc(e.x, e.y, 0.75, 0, 7); g.fillStyle = e.dead ? "#475569" : ROLE_COLOR[e.i]; g.fill(); if (e.i === role) { g.lineWidth = 0.22; g.strokeStyle = "#fff"; g.stroke(); } }
  g.restore();
  DIR_NAME.forEach((m, d) => label(polar(d * 45, CFG.R + 2), m, d === 0 ? "#f8fafc" : "#8a96ad", d % 2 ? 11 : 13));
  for (const [name, mx, my, col] of MARKERS) label({ x: mx, y: my }, name, col, 11);
  if(S.reference && S.opts.assist) { const pos=practicePosition(ROLES[role],t); if(pos) label(pos,"隊伍路線參考（仍須閃招）","#55dba6",10,18); }
  if (b.vis) label(b.pos, "泰坦", "#fde68a", 12);
  for (const e of S.ents.filter(e=>!(e.fallY < -3))) label(e, (e.i === role ? "你 " : "") + ROLES[e.i] + (e.dead ? "（倒地）" : e.recordedDead ? "（原紀錄倒地）" : ""), e.i === role ? "#fff" : "#cbd5e1", e.i === role ? 12 : 10, -15);
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop();
  if (c) { const w = W * 0.5, x = (W - w) / 2, y = 14; g.fillStyle = "rgba(2,6,23,.8)"; g.fillRect(x, y, w, 20); g.fillStyle = "#a16207"; g.fillRect(x, y, w * clamp01((t - c.t0) / (c.t1 - c.t0)), 20); g.strokeStyle = "#fde68a"; g.lineWidth = 1; g.strokeRect(x, y, w, 20); g.font = '600 13px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.name, W / 2, y + 11); }
  if (S.over || S.paused) { g.fillStyle = S.over?"rgba(2,6,23,.72)":"rgba(2,6,23,.12)"; g.fillRect(0, 0, W, W); g.textAlign = "center"; g.textBaseline = "middle"; g.font = '800 30px "Fira Sans",system-ui,sans-serif'; g.fillStyle = (S.paused && !S.over) || S.over?.recordEnd ? "#f8fafc" : S.over.win ? "#5fd08a" : "#ff6b6b"; g.fillText(S.paused && !S.over ? "暫停" : S.over.recordEnd ? "本段練習完成" : S.over.win ? "通過" : "失敗", W / 2, W / 2 - 40); g.font = '500 15px "Fira Sans",system-ui,sans-serif'; g.fillStyle = "#f8fafc"; if (S.over) wrapText(S.over.reason, W / 2, W / 2, W * 0.8, 22); g.fillStyle = "#aeb9cc"; g.fillText(S.over ? "按 R 從這一段重來" : "按 P 繼續", W / 2, W / 2 + 90); }
}
function wrapText(text, x, y, maxW, lh) { let line = ""; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); y += lh; line = ch; } else line += ch; } g.fillText(line, x, y); }

function updateHud() {
  const t = S.t, $ = (id) => document.getElementById(id), r = S.opts.role;
  const c = S.casts.filter((x) => t >= x.t0 && t < x.t1).pop(); $("castbar").hidden = !c;
  if (c) { $("castfill").style.width = clamp01((t - c.t0) / (c.t1 - c.t0)) * 100 + "%"; $("castname").textContent = c.name; }
  const st = []; if(S.opts.god) st.push("觀摩模式：碰撞不判失敗"); if(S.reference && S.opts.assist) st.push("綠圈：隊伍路線參考（仍須閃招）"); if (S.ents[r].dead) st.push("倒地"); if (S.jailed[r]) st.push("石牢"); if (t < S.stun && !S.ents[r].dead) st.push("暈眩"); if (S.buff.sprint > t) st.push("衝刺");
  if (r <= 1 && !S.ents[r].dead) st.push(S.tank === r ? "仇恨在你身上" : "仇恨不在你身上");
  const kp = kbPreview(); if (kp) st.push(kp.bad ? "擊飛落點：危險" : "擊飛落點：安全");
  $("statusline").textContent = st.join(" · ");
  const ov = $("overlay"); ov.hidden = !(S.over || S.paused);
  if (!ov.hidden) { const win = S.over && S.over.win; $("ovTitle").textContent = S.paused && !S.over ? "暫停" : S.over?.recordEnd ? "本段練習完成" : win ? "通過" : "失敗"; $("ovTitle").className = (S.paused && !S.over) || S.over?.recordEnd ? "" : win ? "win" : "dead"; $("ovReason").textContent = S.over ? S.over.reason : ""; $("ovHint").textContent = S.over ? "按 R 從這一段重來" : "按 P 繼續"; }
}
function updatePanel() {
  const t = S.t, $ = (id) => document.getElementById(id), tt = Math.max(0, t);
  $("clock").textContent = (t < 0 ? "-" : "") + `${Math.floor(Math.abs(t) / 60)}:${String(Math.floor(Math.abs(t) % 60)).padStart(2, "0")}`;
  if ($("replayClock")) { $("replayClock").hidden=!S.reference; const abs=REFERENCE_ORIGIN+t; $("replayClock").textContent=`回放 ${Math.floor(abs/60)}:${(abs%60).toFixed(3).padStart(6,"0")} · 階段 +${t.toFixed(3)}s`; }
  $("hint").textContent = (S.opts.god ? "觀摩模式：碰撞不判失敗。要檢查走位，請關閉「觀摩（不會死）」。\n" : "") + (S.opts.hints ? hint() : "（提示已關閉）");
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
  $("view").value = S.opts.view;
  $("speed").value = S.opts.speed;
  for (const key of ["assist", "hints", "god"]) $(key).checked = S.opts[key];
  fit(); addEventListener("resize", fit);
  $("view").addEventListener("change", (e) => { S.opts.view = e.target.value; fit(); e.target.blur(); });
  const refreshRoleLabels=()=>{ $("role").innerHTML = ROLES.map((r, i) => `<option value="${i}">${r}${DIE.includes(i) ? "（自殺組）" : GAOL.includes(i) ? "（石牢組）" : "（拉泰坦）"}</option>`).join(""); $("role").value = S.opts.role; };
  refreshRoleLabels();
  $("start").innerHTML = CHECKPOINTS.map((c) => `<option value="${c.t}">${c.name}</option>`).join("");
  $("start").value = S.opts.start;
  const bind = (id, key, conv, restart) => $(id).addEventListener("change", (e) => { S.opts[key] = conv(e.target); if (restart) reset(); e.target.blur(); });
  bind("preset", "preset", (el)=>el.value, true); $("preset").addEventListener("change",refreshRoleLabels); $("preset").value=S.opts.preset;
  bind("role", "role", (el) => +el.value, true); bind("start", "start", (el) => +el.value, true); bind("speed", "speed", (el) => +el.value, false);
  bind("assist", "assist", (el) => el.checked, false); bind("hints", "hints", (el) => el.checked, false); bind("god", "god", (el) => el.checked, false);
  $("restart").addEventListener("click", (e) => { reset(); e.target.blur(); }); $("skSprint").addEventListener("click", () => useSkill("sprint")); if ($("skProvoke")) $("skProvoke").addEventListener("click", () => useSkill("provoke"));
  addEventListener("keydown", (e) => { if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return; S.keys[e.code] = true; if (!e.repeat && e.code === "KeyR") reset(); if (!e.repeat && (e.code === "KeyP" || e.code === "Escape")) S.paused = !S.paused; if (e.code === "ShiftLeft" || e.code === "ShiftRight") useSkill("sprint"); if (e.code === "Digit3") useSkill("provoke"); if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) e.preventDefault(); });
  addEventListener("keyup", (e) => { S.keys[e.code] = false; }); addEventListener("blur", () => { S.keys = {}; });
  let drag = null;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    S.keys = {};
    drag = null;
    S.paused = true;
  });
  for (const el of [cv, cv3]) { el.addEventListener("mousedown", (e) => { drag = [e.clientX, e.clientY]; e.preventDefault(); }); el.addEventListener("contextmenu", (e) => e.preventDefault()); }
  addEventListener("mousemove", (e) => { if (!drag) return; const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; drag = [e.clientX, e.clientY]; if (S.opts.view === "game") { S.cam += dx * 0.006; S.pitch = Math.max(0.08, Math.min(1.4, S.pitch + dy * 0.004)); } else S.cam += dx * 0.008; });
  addEventListener("mouseup", () => { drag = null; });
  cv.addEventListener("wheel", (e) => { S.zoom = Math.max(0.7, Math.min(2, S.zoom * (e.deltaY < 0 ? 1.08 : 0.92))); e.preventDefault(); }, { passive: false });
  cv3.addEventListener("wheel", (e) => { S.dist = Math.max(4, Math.min(26, S.dist * (e.deltaY < 0 ? 0.92 : 1.08))); e.preventDefault(); }, { passive: false });
  const bv = $("build"); if (bv) bv.textContent = "版本 " + BUILD;
  reset();
  let last = performance.now(); let panelAt = 0, fpsAt = last, fpsN = 0;
  const loop = (now) => { const real = Math.min((now - last) / 1000, 0.5); last = now; if (S.keys.KeyQ) S.cam -= real * 1.8; if (S.keys.KeyE) S.cam += real * 1.8; let left = real * S.opts.speed; while (left > 0) { const d = Math.min(left, 0.02); step(d); left -= d; } if (S.opts.view === "game" && has3d) { View3D.render(W3, H3); updateHud(); } else draw(); fpsN++; if (now - panelAt >= 100) { panelAt = now; updatePanel(); } if (now - fpsAt >= 1000) { const bv = document.getElementById("build"); if (bv) bv.textContent = "版本 " + BUILD + " · 每秒 " + Math.round((fpsN * 1000) / (now - fpsAt)) + " 格"; fpsN = 0; fpsAt = now; } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
if (typeof document !== "undefined") addEventListener("DOMContentLoaded", init);
if (typeof module !== "undefined") module.exports = { S, CFG, arenaAt, arenaSupportRadius, ROLES, CHECKPOINTS, DIE, GAOL, reset, step, home, npcTarget, useSkill, END_T, F, stackSpot, polar, D3, kill, REFERENCE_CASTS, REFERENCE_ORIGIN, REFERENCE_END, bossSpot, bossLook, practicePoint, practicePosition, referencePosition, npcReferencePosition };
