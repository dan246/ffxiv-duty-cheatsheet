"use strict";
const assert = require('node:assert/strict');
const {test} = require('node:test');
const sim = require('../sim/uwu-titan.js');
const {S, reset, step, npcTarget} = sim;
const setup = (opts={}) => { Object.assign(S.opts,{preset:'reference',randomJumps:false,seed:0,start:-4,role:7,god:true},opts); reset(); };
test('Titan defaults to fight 13, uses cast completions and excludes canceled casts',()=>{
  assert.equal(S.opts.preset,'reference'); setup();
  for (const [abs,name] of [[300.720,'大地粉碎'],[339.265,'大怒震'],[341.411,'花岗岩牢狱'],[384.978,'大地粉碎'],[433.484,'地裂'],[448.368,'大地之重']])
    assert(S.tl.some(e=>Math.abs(e.t+300.720-abs)<1e-6&&e.name.includes(name)),`${abs} ${name}`);
  assert(!S.tl.some(e=>e.name.includes('花岗岩冲击')));
  const cast=S.casts.find(c=>c.name==='大怒震');
  assert(Math.abs(cast.t1+300.720-339.265)<1e-6);
  assert(Math.abs(cast.t0+300.720-335.290)<1e-6); // API begincast, not rounded duration
});
test('observed NPC targets interpolate but player keeps controls and collisions',()=>{
  globalThis.UWU_REFERENCE={titan:{paths:{ST:[[300.720,0,0],[301.720,10,0]]},deaths:[{time:302,role:'ST'}],raises:[{time:303,role:'ST'}]},garuda:{markers:[]}};
  try {
    setup({start:0,role:7,god:false});
    S.events=S.events.filter(e=>e.t>.1);
    step(.02); assert(Math.abs(npcTarget(S.ents[1]).x-.2)<1e-6);
    assert(Math.abs(S.ents[1].x-.2)<1e-6);
    S.t=1.27; step(.02); assert(S.ents[1].recordedDead); assert(!S.ents[1].dead); assert.equal(S.over,null);
    S.t=2.27; step(.02); assert(!S.ents[1].dead);
    S.aoes.push({t0:S.t,t1:S.t+.01,done:false,hit:()=>false,onHit(){sim.kill(7,'test collision')}});
    step(.02); assert.equal(S.over.win,false);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('reference record ends neutrally, never with a Titan kill or Ultima handoff',()=>{
  setup(); while(!S.over&&S.t<160) step(.02);
  assert.equal(S.over.win,false); assert.equal(S.over.recordEnd,true);
  assert.match(S.over.reason,/已完成本隊資料涵蓋的泰坦機制練習/);
  assert(S.t<149);
});
test('observation warnings do not invent NPC deaths, actual deaths still display',()=>{
  setup({god:true}); sim.kill(2,'estimated collision'); assert.equal(S.ents[2].dead,false);
});
test('recorded deaths do not override the controlled player in practice',()=>{
  globalThis.UWU_REFERENCE={titan:{deaths:[{time:302,role:'D4'}]}};
  try {
    setup({start:1,role:7,god:false}); step(.3);
    assert.equal(S.ents[7].recordedDead,true); assert.equal(S.ents[7].dead,false);
    assert.equal(S.over,null);
    setup({start:1,role:7,god:true}); step(.3); assert.equal(S.ents[7].dead,false); assert(S.ents[7].recordedDead);
  } finally {delete globalThis.UWU_REFERENCE;}
});

test('jump checkpoint includes inferred cast start, west landing and exact completion',()=>{
  setup({start:27});
  while(S.t<27.32) step(.01);
  const crush=S.aoes.find(a=>a.shape?.type==='circle'&&a.shape.r===22);
  assert(crush); assert.equal(crush.shape.c.x,-14); assert(Math.abs(crush.shape.c.y)<1e-6);
  assert(Math.abs(crush.t1-30.006)<1e-6);
  assert.equal(S.g2,3); assert.equal(S.mir,-1);
});

const actualReference = require('../sim/uwu-reference.js');
const advanceAbsolute = (abs) => {
  const end=abs-sim.REFERENCE_ORIGIN;
  while(S.t<end-1e-8&&!S.over) step(Math.min(.01,end-S.t));
};
test('loaded fight 13 separates prior deaths from practice and preserves gaol/revival timings',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    setup();
    assert(S.ents[5].recordedDead,'D2 source prior death stays available');assert(!S.ents[5].dead,'practice D2 starts alive');
    assert.deepEqual(S.markers,actualReference.garuda.markers);
    assert.deepEqual([S.g2,S.mir,S.g3,S.g4],[3,-1,2,3]);
    advanceAbsolute(328.177);
    for(const i of [1,4,5,6]) assert(S.ents[i].dead);
    advanceAbsolute(346.322); assert.deepEqual(S.jailed,{});
    Object.assign(S.ents[7],actualReference.titan.gaolAnchors.D4); // controlled player must actually place the gaol
    advanceAbsolute(346.324); for(const i of [2,3,7]) assert(S.jailed[i]);
    advanceAbsolute(351.219); assert(!S.jailed[3]); assert(S.jailed[2]); assert(S.jailed[7]);
    advanceAbsolute(351.753); assert(!S.ents[6].dead);
    advanceAbsolute(351.887); assert(!S.jailed[2]); assert(S.jailed[7]);
    advanceAbsolute(352.602); assert(!S.jailed[7]);
    advanceAbsolute(355.097); assert(!S.ents[5].dead);
    advanceAbsolute(356.170); assert(!S.ents[4].dead); assert(S.ents[1].dead);
    advanceAbsolute(369.011); assert(S.ents[1].dead);
    advanceAbsolute(369.013); assert(!S.ents[1].dead);
    assert(S.tl.some(e=>e.name.includes('ST 復活狀態代理')&&Math.abs(e.t+300.720-369.012)<1e-6));
    advanceAbsolute(392.389); assert(S.jailed[3]);
    advanceAbsolute(400.383); assert(!S.jailed[3]);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('loaded positions preserve every manual keyframe and west/south boss landings',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    setup({start:0});
    for(const [role,points] of Object.entries(actualReference.titan.paths)) for(const [time,x,y] of points) {
      S.t=time-300.720;
      const p=sim.referencePosition(role,S.t);
      assert(Math.abs(p.x-x)<1e-6&&Math.abs(p.y-y)<1e-6,`${role}@${time}`);
    }
    assert(Math.hypot(sim.bossSpot(330.726-300.720).pos.x+14,sim.bossSpot(330.726-300.720).pos.y)<1e-6);
    assert(Math.hypot(sim.bossSpot(384.978-300.720).pos.x,sim.bossSpot(384.978-300.720).pos.y-14)<1e-6);
    setup({start:348-300.720}); for(const i of [2,3,7]) assert(S.jailed[i]);
    assert(S.ents[5].dead);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('loaded wipe ends at449 with all recorded deaths, never a success handoff',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    setup(); advanceAbsolute(449.001);
    assert.equal(S.over.recordEnd,true); assert.equal(S.over.win,false);
    assert(Math.abs(S.t+300.720-449)<.011);
    assert(S.ents.every(e=>e.recordedDead));assert(S.ents.some(e=>!e.dead));
    assert.equal(S.done,undefined);
    setup({start:446.890-300.720,role:0,god:false});
    advanceAbsolute(446.894);
    assert(S.ents[0].recordedDead); assert(!S.ents[0].dead); assert.equal(S.over,null);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('normal loaded entry advances18seconds for all roles without NPC interpolation failures',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    for(let role=0;role<8;role++) {
      setup({role,god:false}); advanceAbsolute(300.730);
      if(role===0)sim.useSkill('provoke');
      // Step inward after the first landing: the old radial clamp teleported idle players.
      const e=S.ents[role], radius=Math.hypot(e.x,e.y);
      if(radius>15) { e.x*=15/radius; e.y*=15/radius; }
      advanceAbsolute(318.720);
      assert.equal(S.over,null,sim.ROLES[role]);
      assert(S.t>=18-1e-6);
    }
    setup({role:7,god:false});
    sim.kill(2,'NPC collision');
    assert.equal(S.over.win,false); assert.equal(S.ents[2].dead,true);
    setup({role:7,god:false});
    sim.kill(7,'controlled player collision'); assert.equal(S.over.win,false);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('negative entry starts without phantom stun, sprint or cooldowns',()=>{
  for(const preset of ['reference','random']) {
    setup({preset,start:-4});
    assert(S.stun<=S.t); assert(S.buff.sprint<=S.t);
    assert(S.cd.sprint<=S.t); assert(S.cd.provoke<=S.t);
  }
});
test('recorded gaol binding excludes direct player bomb and landslide hits until release',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    for(const [abs,type] of [[349.795,'circle'],[350.196,'rect']]) {
      setup({start:346.5-300.720,role:2,god:false});
      assert(S.jailed[2]);
      advanceAbsolute(abs-.02);
      const hazard=S.aoes.find(a=>a.shape?.type===type&&Math.abs(a.t1+300.720-abs)<1e-6);
      assert(hazard,`${type} hazard exists`);
      const shape=hazard.shape;
      Object.assign(S.ents[2],type==='circle'?shape.c:{x:shape.from.x+Math.cos(shape.ang)*6,y:shape.from.y+Math.sin(shape.ang)*6});
      assert(hazard.hit(S.ents[2]));
      advanceAbsolute(abs+.001); assert.equal(S.over,null,`${type} must not directly hit jailed player`);
      delete S.jailed[2];
      hazard.onHit.call(hazard);
      assert.equal(S.over.win,false,`${type} still hits after gaol release`);
    }
  } finally {delete globalThis.UWU_REFERENCE;}
});


test('all four sacrifice roles can take designated second Weight in practice and rise on their recorded proxy',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    for(const role of sim.DIE) {
      setup({start:22.5,role,god:false});
      advanceAbsolute(325.580);
      const weight=S.aoes.find(a=>Math.abs(a.t1+300.720-325.589)<1e-6);
      assert(weight); Object.assign(S.ents[role],weight.shape.c);
      advanceAbsolute(325.590);
      assert.equal(S.over,null,sim.ROLES[role]);
      assert(S.ents[role].dead && S.ents[role].plannedDeath);
      const raise=actualReference.titan.raises.find(e=>e.role===sim.ROLES[role]&&e.time>325.589);
      advanceAbsolute(raise.time-.001); assert(S.ents[role].dead);
      advanceAbsolute(raise.time+.001); assert(!S.ents[role].dead); assert(!S.ents[role].plannedDeath);
    }
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('sacrifice allowance does not exempt other hazards or later Weight waves',()=>{
  for(const preset of ['reference','random']) {
    setup({preset,start:22,role:4,god:false}); sim.kill(4,'bomb');
    assert.equal(S.over.win,false); assert(!S.ents[4].plannedDeath);
  }
  setup({start:19.1,role:2,god:false});
  advanceAbsolute(322.540);
  const first=S.aoes.find(a=>Math.abs(a.t1+300.720-322.554)<1e-6);
  Object.assign(S.ents[2],first.shape.c); advanceAbsolute(322.555); assert.equal(S.over.win,false);
  setup({start:64,role:4,god:false}); advanceAbsolute(368.240);
  const later=S.aoes.find(a=>Math.abs(a.t1+300.720-368.255)<1e-6);
  Object.assign(S.ents[4],later.shape.c); advanceAbsolute(368.256); assert.equal(S.over.win,false);
});
test('opening stays full; second and third landings shrink 20→16→12 with falling edges',()=>{
  setup({start:-.1,role:4,god:false}); Object.assign(S.ents[4],{x:18,y:0});
  assert.equal(S.arena.radius,20); assert.equal(S.arena.collapse,0);
  step(.11); assert.equal(S.arena.radius,20); assert.equal(S.arena.collapse,0); assert.equal(S.over,null);
  setup({start:22,role:4,god:false}); Object.assign(S.ents[4],{x:18,y:0}); step(.01);
  assert.equal(S.over,null); assert.equal(S.ents[4].fallY,0);
  setup({start:29.9,role:4,god:true}); Object.assign(S.ents[4],{x:18,y:0}); step(.11);
  assert.equal(S.arena.radius,16); assert.equal(S.arena.previousRadius,20); assert(S.arena.collapse>0);
  S.opts.god=false; step(1.2); assert.equal(S.over.win,false); assert(S.ents[4].fallY<0);
  assert.equal(S.ents[4].x,18); assert(!S.ents[4].plannedDeath);
  const y=S.ents[4].fallY; step(.2); assert(S.ents[4].fallY<y);
  setup({start:85.5,role:4,god:false}); Object.assign(S.ents[4],{x:14,y:0}); step(.01);
  assert.equal(S.arena.radius,12); assert.equal(S.arena.previousRadius,16);
  assert.equal(S.over.win,false); assert(S.ents[4].fallY<0); assert(!S.ents[4].plannedDeath);
  setup({start:-4}); assert.equal(S.ents[4].fallY,0); assert.equal(S.arena.radius,20); assert.equal(S.arena.collapse,0);
});
test('arena checkpoint state uses exact reference landings and random practice cast completions',()=>{
  setup();
  const second=330.726-300.720,third=384.978-300.720;
  for(const [t,r,previous,progress] of [[0,20,20,0],[second-.001,20,20,0],[second,16,20,0],[second+.6,16,20,.5],[second+1.2,16,20,1],[third-.001,16,20,1],[third,12,16,0],[third+.6,12,16,.5],[third+1.2,12,16,1]]){
    const arena=sim.arenaAt(t); assert.equal(arena.radius,r); assert.equal(arena.previousRadius,previous); assert(Math.abs(arena.collapse-progress)<1e-8);
  }
  setup({preset:'random'}); assert.equal(sim.arenaAt(30.499).radius,20); assert.equal(sim.arenaAt(30.5).radius,16); assert.equal(sim.arenaAt(84.3).radius,12);
});
test('off-edge approximate NPC paths and old corpses fall visually without invented life events',()=>{
  globalThis.UWU_REFERENCE=actualReference;
  try {
    setup({start:2,role:7,god:true});
    const corpse=S.ents[5]; Object.assign(corpse,{x:21,y:0,dead:true}); step(.1);
    assert(corpse.dead&&corpse.recordedDead); assert(corpse.fallY<0); assert.equal(corpse.x,21);
    const npc=S.ents[2]; Object.assign(npc,{x:21,y:0});
    const advanceBounded=()=>{
      const old={x:npc.x,y:npc.y};step(.01);const absolute=S.t+300.72;
      const sprint=(actualReference.titan.motionEvents||[]).some(e=>e.type==='sprint'&&e.role==='H1'&&absolute>=e.start&&absolute<e.end);
      assert(Math.hypot(npc.x-old.x,npc.y-old.y)<=(sprint?7.8:6)*.01+1e-7);
      assert(!npc.dead);assert(!npc.recordedDead);assert.equal(S.over,null);
    };
    advanceBounded();assert(npc.fallY<0,'an actor still outside must continue to fall visually');
    let reunited=false;
    for(let n=0;n<600;n++){
      advanceBounded();
      if(Math.hypot(npc.x,npc.y)<=sim.arenaAt(S.t).radius)assert.equal(npc.fallY,0);
      const target=sim.npcReferencePosition('H1',S.t);
      if(Math.hypot(npc.x-target.x,npc.y-target.y)<1e-7){reunited=true;break;}
    }
    assert(reunited,'observation NPC walks back to the source route without an invented death or teleport');
  } finally {delete globalThis.UWU_REFERENCE;}
});

test('random practice preserves fatal NPC knockback while reference paths remain observations',()=>{
  setup({preset:'random',start:39,role:4,god:false,seed:1});
  Object.assign(S.ents[2],{x:0,y:0}); step(.11);
  assert(S.ents[2].dead); assert(S.ents[2].fallY<0);
  assert.equal(S.over.win,false); assert.match(S.over.reason,/H1.*掉出平台/);
  assert(!S.ents[2].plannedDeath);
});

test('reference NPC follows fast and slow samples on time without a chase cap or deadzone',()=>{
  globalThis.UWU_REFERENCE={titan:{paths:{ST:[[300.720,0,0],[301.720,10,0],[302.720,10.5,0]]}}};
  try {
    setup({start:0,role:7,god:false}); S.events=[];
    for(let i=0;i<50;i++) step(.02);
    assert(Math.abs(S.ents[1].x-10)<1e-7,'10 m/s reference movement must not lag behind at 6.9');
    const prev=S.ents[1].x; step(.02);
    assert(Math.abs(S.ents[1].x-prev)<1e-7,'sparse segment holds before its reconstructed departure');
    S.cam=0; // Fix the camera axis for this pure movement-speed assertion.
    const player={...S.ents[7]}; S.keys.KeyD=true; step(.02);
    assert(Math.abs(S.ents[7].x-player.x-.12)<1e-7,'controlled movement remains 6m/s');
    assert.equal(S.over,null);
    sim.kill(7,'controlled collision'); assert.equal(S.over.win,false);
  } finally {delete globalThis.UWU_REFERENCE;}
});
test('reference motion preserves knockback offsets, stun, jail and actual death',()=>{
  globalThis.UWU_REFERENCE={titan:{paths:{ST:[[300.720,0,0],[310.720,10,0]]}}};
  try {
    setup({start:0,role:7,god:true}); S.events=[];
    const e=S.ents[1]; e.x=6; S.stun=.2;
    step(.1); assert.equal(e.x,6,'stunned actor retains knockback');
    step(.11); assert(e.x>5&&e.x<6,'release eases offset instead of snapping to recorded .21');
    S.jailed[1]=true; const jailedX=e.x; step(.1); assert.equal(e.x,jailedX);
    delete S.jailed[1]; e.dead=true; const deadX=e.x; step(.1); assert.equal(e.x,deadX);
  } finally {delete globalThis.UWU_REFERENCE;}
});
