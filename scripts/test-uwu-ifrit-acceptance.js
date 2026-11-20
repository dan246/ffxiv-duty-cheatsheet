'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const reference=require('../sim/uwu-reference');
const sim=require('../sim/uwu-ifrit');
const {S,CFG,ROLES}=sim;
const origin=152.558;
function setup(role,start){globalThis.UWU_REFERENCE=reference;Object.assign(S.opts,{preset:'reference',role,start,god:false,full:true,seed:0});sim.reset();}
function until(t,control=()=>{}){while(S.t<t-1e-8&&!S.over){const dt=Math.min(.01,t-S.t);control(dt);sim.step(dt);}}
// Isolate a real timeline event without substituting its collision or handler.
function onlyEvent(t){S.events=S.events.filter(e=>Math.abs(e.t-t)<.001);S.evIdx=0;}
for(const role of ROLES.keys())for(const overlap of [false,true])test(`Searing Wind ${ROLES[role]} ${overlap?'fails on overlap':'survives isolation'} in reference practice`,()=>{
 const pulse=201.130-origin;setup(role,pulse-.02);onlyEvent(pulse);
 Object.assign(S.ents[2],{x:18,y:0});for(const e of S.ents)if(e.i!==2)Object.assign(e,{x:-15,y:0});
 const victim=role===2?4:role;if(overlap)Object.assign(S.ents[victim],{x:17,y:0});until(pulse+.001,()=>{Object.assign(S.ents[2],{x:18,y:0});for(const e of S.ents)if(e.i!==2)Object.assign(e,{x:overlap&&e.i===victim?17:-15,y:0});});
 if(overlap){assert.equal(S.over?.win,false);assert.match(S.over.reason,/灼熱/);}else assert.equal(S.over,null);
});
for(const dodge of [false,true])test(`Eruption ${dodge?'allows leaving a locked circle':'kills a stationary baiter'} in reference practice`,()=>{
 const c=reference.ifrit.eventCasts.find(c=>c.ability===11098),bait=c.t0-origin,impact=c.t-origin;
 setup(6,bait-.01);onlyEvent(bait);Object.assign(S.ents[6],{x:0,y:-17});until(bait+.001);
 const circle=S.aoes.find(a=>Math.abs(a.shape.c.x)<.01&&a.shape.c.y===-17);assert(circle,'circle locks current baiter position');
 if(dodge)Object.assign(S.ents[6],{x:-17,y:0});until(impact+.001);
 if(dodge)assert.equal(S.over,null);else {assert.equal(S.over?.win,false);assert.match(S.over.reason,/地火/);}
 assert.deepEqual(circle.shape.c,{x:0,y:-17},'bait remains frozen after movement');
});
for(const role of [1,4])test(`${ROLES[role]} tether partner follows a safe player deviation at walking speed`,()=>{
 setup(role,41);S.events=[];const partner=S.ents[role===1?4:1];Object.assign(S.ents[role],{x:-15,y:-6});Object.assign(partner,{x:0,y:0});
 let maxStep=0;while(S.t<45&&!S.over){const before={x:partner.x,y:partner.y};sim.step(.01);maxStep=Math.max(maxStep,Math.hypot(partner.x-before.x,partner.y-before.y));}assert(maxStep<=CFG.speed*.01+1e-6,'adaptive movement cannot teleport');
 assert.equal(S.over,null,'valid nearby deviation cannot require exact replay');assert(Math.hypot(partner.x+15,partner.y+6)<=CFG.fetterMax,'partner must stay within tether distance');
});
for(const role of [1,4])test(`${ROLES[role]} impossible tether stretch still fails`,()=>{
 setup(role,41);S.events=[];const partner=S.ents[role===1?4:1];partner.dead=true;Object.assign(partner,{x:18,y:0});Object.assign(S.ents[role],{x:-18,y:0});until(45.1);
 assert.equal(S.over?.win,false);assert.match(S.over.reason,/炎獄之鎖/);
});
for(const useInvuln of [false,true])test(`ST repeated busters ${useInvuln?'survive with timed invulnerability':'fail without invulnerability'}`,()=>{
 setup(1,19);for(const e of S.ents)Object.assign(e,{x:0,y:e.i===1?3:-5});S.replay=null;S.events=S.events.filter(e=>e.t>=19&&e.t<28.3);S.evIdx=0;
 if(useInvuln)sim.useSkill('invuln');until(28.3,()=>{for(const e of S.ents)Object.assign(e,{x:0,y:e.i===1?3:-5});});
 if(useInvuln){assert.equal(S.over,null);assert(S.log.some(l=>l.msg==='烈焰焚燒 3/3'));}else {assert.equal(S.over?.win,false);assert.match(S.over.reason,/火耐性下降/);}
});
test('tank invulnerability does not excuse a last-moment cleave into the party',()=>{
 setup(1,19.3);sim.useSkill('invuln');until(20.94,()=>{
   const b=sim.bossState(S.t).pos, victim=S.ents[5];
   // Hold normal south facing until the actual damage snapshot, then turn north.
   if(S.t>20.92)Object.assign(S.ents[1],{x:b.x+(victim.x-b.x)*.3,y:b.y+(victim.y-b.y)*.3});
 });
 assert.equal(S.over?.win,false);assert.match(S.over.reason,/正面.*隊友/);
});
test('Eruption selects the two furthest eligible live players and excludes Searing Wind',()=>{
 const c=reference.ifrit.eventCasts.find(c=>c.ability===11098),bait=c.t0-origin;
 setup(4,bait-.001);onlyEvent(bait);const b=sim.bossState(S.t).pos;
 for(const e of S.ents)Object.assign(e,{x:b.x,y:b.y});
 Object.assign(S.ents[2],{x:19,y:0});Object.assign(S.ents[4],{x:17,y:0});Object.assign(S.ents[5],{x:16,y:1});sim.step(.002);
 assert.deepEqual(S.aoes.map(a=>a.shape.c),[{x:17,y:0},{x:16,y:1}]);
});
for(const role of [2,4])test(`${ROLES[role]} NPCs react to Searing Wind at current player position`,()=>{
 const pulse=201.130-origin;setup(role,pulse-3.2);onlyEvent(pulse);
 const paths=Object.fromEntries(ROLES.map((name,i)=>[name,[[origin+S.t-1,i===2?18:i===4?5:-16,0],[origin+pulse+1,i===2?18:i===4?5:-16,0]]]));
 S.replay={rawCoordinates:true,paths};for(const e of S.ents)Object.assign(e,{x:e.i===2?18:e.i===4?5:-16,y:0});
 Object.assign(S.ents[role],{x:role===2?15:10,y:0});until(pulse+.001);
 assert.equal(S.over,null);assert(Math.hypot(S.ents[2].x-S.ents[4].x,S.ents[2].y-S.ents[4].y)>CFG.swR);
});
for(let role=0;role<8;role++)test(`${ROLES[role]} correct nail snapshots empower all four nails without observation immunity`,()=>{
 const cs=[...new Map(reference.ifrit.eventCasts.filter(c=>c.ability===11098&&c.t<210).map(c=>[c.t,c])).values()];
 const baits=cs.map(c=>c.t0-origin),check=208.940-origin-.1;
 setup(role,36);S.events=S.events.filter(e=>baits.some(t=>Math.abs(e.t-t)<.001)||Math.abs(e.t-check)<.001);S.evIdx=0;
 until(check+.001,dt=>{
  const next=S.t+dt;const n=baits.findIndex(t=>t>S.t-1e-7&&t<=next+1e-7);
  if((role===6||role===7)&&n>=0){const idx=role===6?(n<2?2:1):(n<2?3:0),p=sim.nails(S.t).find(n=>n.i===idx).pos;Object.assign(S.ents[role],{x:p.x*1.55,y:p.y*1.55});}
  else if(role===0||role===2)Object.assign(S.ents[role],sim.referencePosition(ROLES[role],next));
  else Object.assign(S.ents[role],{x:0,y:0});
 });
 assert.equal(S.over,null);assert.deepEqual(S.nailHits,[2,2,2,2]);assert.deepEqual(S.killOrder.map(i=>S.nailDirs[i]),[3,0,5,6]);
});
test('dodging eruptions without putting them on nails fails awakening',()=>{
 const cs=[...new Map(reference.ifrit.eventCasts.filter(c=>c.ability===11098&&c.t<210).map(c=>[c.t,c])).values()],baits=cs.map(c=>c.t0-origin),check=208.940-origin-.1;
 setup(6,36);S.events=S.events.filter(e=>baits.some(t=>Math.abs(e.t-t)<.001)||Math.abs(e.t-check)<.001);S.evIdx=0;
 until(check+.001,dt=>{const bait=baits.some(t=>t>S.t-1e-7&&t<=S.t+dt+1e-7);Object.assign(S.ents[6],bait?{x:19,y:0}:{x:0,y:0});});
 assert.equal(S.over?.win,false);assert.match(S.over.reason,/釘子沒有每根炸滿兩次/);
});
test('an NPC Eruption routing defect does not fail solo practice',()=>{
 const c=reference.ifrit.eventCasts.find(c=>c.ability===11098),bait=c.t0-origin,impact=c.t-origin;
 setup(4,bait-.001);onlyEvent(bait);sim.step(.002);const circle=S.aoes[0];
 until(impact-.001,()=>Object.assign(S.ents[4],{x:0,y:0}));
 Object.assign(S.ents[5],circle.shape.c);S.ents[5].avoidGoal={...circle.shape.c};sim.step(.002);
 assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===5));
});
test('recovering tether distance clears the stretch timer before another brief excursion',()=>{
 setup(1,41);S.events=[];const partner=S.ents[S.fetterDps];partner.dead=true;Object.assign(partner,{x:0,y:0});
 Object.assign(S.ents[1],{x:15,y:0});until(43.1);Object.assign(S.ents[1],{x:5,y:0});until(43.2);
 Object.assign(S.ents[1],{x:15,y:0});until(45.3);assert.equal(S.over,null);
});
for(const useInvuln of [false,true])test(`MT final three busters ${useInvuln?'survive with timed invulnerability':'fail without invulnerability'}`,()=>{
 setup(0,132);S.replay=null;S.events=S.events.filter(e=>e.t>=132&&e.t<141.2);S.evIdx=0;
 if(useInvuln)sim.useSkill('invuln');until(141.2,()=>{const b=sim.bossState(S.t).pos;for(const e of S.ents)Object.assign(e,{x:b.x,y:b.y+(e.i===0?-3:5)});});
 if(useInvuln){assert.equal(S.over,null);assert(S.log.some(l=>l.msg==='烈焰焚燒 3/3'));}else {assert.equal(S.over?.win,false);assert.match(S.over.reason,/火耐性下降/);}
});
test('eight-role full Ifrit NPC audit avoids lethal snapshots while the player remains independently driven',()=>{
 for(let role=0;role<8;role++){
  setup(role,0);S.opts.god=true;const hits=[];
  while(S.t<148&&!S.over){
   Object.assign(S.ents[role],sim.referencePosition(ROLES[role],S.t+.01));
   if(role===1&&S.t>=8&&S.t<8.02)sim.useSkill('provoke');
   if(role===1&&S.t>=19&&S.t<19.02)sim.useSkill('invuln');
   if(role===1&&S.t>=31&&S.t<31.02)sim.useSkill('shirk');
   if(role===0&&S.t>=30.5&&S.t<30.52)sim.useSkill('provoke');
   if(role===0&&S.t>=132&&S.t<132.02)sim.useSkill('invuln');
   if(role===3&&S.t>=15&&S.t<15.02)sim.useSkill('shield');
   for(const a of S.aoes)if(!a.audited){a.audited=true;const resolve=a.onHit;a.onHit=function(){
    for(const e of S.ents)if(e.i!==role&&!e.dead&&!(a.skip||[]).includes(e.i)&&a.hit(e))hits.push({role:ROLES[role],npc:ROLES[e.i],t:S.t,shape:a.shape.type});
    return resolve.call(a);
   };}
   sim.step(.01);
  }
  // Observation lets the raw player route (which contains gaps) keep running;
  // NPC geometry is asserted independently, so observation cannot hide its hits.
  assert.deepEqual(hits,[],`NPC collision audit with ${ROLES[role]} controlled`);
 }
});
test('non-tank practice records an NPC tank-cone collision without ending',()=>{
 setup(4,19.3);until(20.92,()=>Object.assign(S.ents[4],{x:0,y:5}));
 S.tank=0;sim.step(.02);assert.equal(S.over,null);assert(S.npcFaults.length);
});
for(const kind of ['dash','cross'])for(const unsafe of [false,true])test(`${kind} actual snapshot ${unsafe?'fails':'accepts safe placement'} for all eight roles`,()=>{
 for(let role=0;role<8;role++){
  setup(role,114.999);onlyEvent(115);sim.step(.002);
  const a=S.aoes.find(a=>kind==='cross'?a.isCross:a.order===0);assert(a);
  S.aoes=[a];Object.assign(S.ents[role],unsafe?{x:0,y:0}:kind==='cross'?{x:0,y:role===2?18:-18}:{x:12,y:-12});
  until(a.t1+.001);
  if(unsafe){assert.equal(S.over?.win,false,ROLES[role]);assert.match(S.over.reason,kind==='cross'?/十字火焰/:/深紅旋風/);}
  else assert.equal(S.over,null,ROLES[role]);
 }
});
// Input-only acceptance driver: route samples are steering hints. Only step()
// moves the controlled actor; camera-relative W and real skills supply inputs.
function keyboardPractice(role,dt=.02){
 const planner=require('../sim/uwu-npc-motion');setup(role,0);let steering={...S.ents[role]},walked=0;
 const casts=[...new Map(reference.ifrit.eventCasts.filter(c=>c.ability===11098&&c.t<210).map(c=>[c.t,c])).values()];
 const route=t=>sim.referencePosition(role===5&&t>99?'D1':ROLES[role],t)||sim.home(role,t);
 while(!S.over&&S.t<149){
  if(role===1&&S.t>=8&&S.cd.provoke===0)sim.useSkill('provoke');
  if(role===1&&S.t>=20&&S.cd.invuln===0)sim.useSkill('invuln');
  if(role===1&&S.t>=31&&S.cd.shirk===0)sim.useSkill('shirk');
  if(role===0&&S.t>=30.6&&S.cd.provoke===0)sim.useSkill('provoke');
  if(role===0&&S.t>=132.5&&S.cd.invuln===0)sim.useSkill('invuln');
  if(role===3&&S.t>=15&&S.cd.shield===0)sim.useSkill('shield');
  if((role>=6&&S.t>=44&&S.t<45)||(S.t>=115&&S.t<116))sim.useSkill('sprint');
  const hazards=S.aoes.filter(a=>(!a.done||a.linger&&S.t<a.t1+a.linger)&&a.t0<=S.t&&!(a.skip||[]).includes(role)).map(a=>({t1:Math.max(S.t,a.t1),hit:a.hit}));
  for(const sw of S.sw){const pulse=sw.pulses.find(t=>t>=S.t);if(pulse===undefined||pulse-S.t>3.5)continue;
   const others=S.ents.filter(e=>e.i!==role);if(sw.who===role)hazards.push({t1:pulse,hit:p=>others.some(e=>Math.hypot(p.x-e.x,p.y-e.y)<=CFG.swR+.5)});
   else{const c=sim.referencePosition(ROLES[sw.who],pulse)||S.ents[sw.who];hazards.push({t1:pulse,hit:p=>Math.hypot(p.x-c.x,p.y-c.y)<=CFG.swR+.5});}
  }
  if(role>=6){const n=casts.findIndex(c=>c.t0-origin>=S.t-.001);if(n>=0&&casts[n].t0-origin-S.t<=3.5){const idx=role===6?(n<2?2:1):(n<2?3:0),all=sim.nails(S.t),nail=all.find(n=>n.i===idx);if(nail)hazards.push({t1:casts[n].t0-origin,hit:p=>Math.hypot(p.x-nail.pos.x,p.y-nail.pos.y)>8.2||all.some(n=>n.i!==idx&&Math.hypot(p.x-n.pos.x,p.y-n.pos.y)<=8.8)});}}
  Object.assign(steering,{x:S.ents[role].x,y:S.ents[role].y});
  planner.move(steering,route(S.t+.2),dt,{time:S.t,radius:CFG.R,speed:CFG.speed*(S.buff.sprint>S.t?1.3:1),future:route,hazards});
  const dx=steering.x-S.ents[role].x,dy=steering.y-S.ents[role].y;
  S.keys.KeyW=Math.hypot(dx,dy)>.01;if(S.keys.KeyW)S.cam=Math.atan2(dx,-dy);
  const before={x:S.ents[role].x,y:S.ents[role].y},limit=CFG.speed*(S.buff.sprint>S.t+dt?1.3:1)*dt;
  sim.step(dt);const moved=Math.hypot(S.ents[role].x-before.x,S.ents[role].y-before.y);walked+=moved;
  assert(moved<=limit+1e-7,`${ROLES[role]} moved ${moved} in ${dt}s at ${S.t}`);
 }
 assert(walked>5,'driver actually moves the player');assert.equal(S.opts.god,false);
 return S.over;
}
for(let role=0;role<8;role++)test(`${ROLES[role]} full reference practice clears through keyboard movement and actual skills`,()=>{
 const result=keyboardPractice(role);assert.equal(result?.win,true,JSON.stringify(result));
});
function stationaryTether(gap){
 setup(7,41);S.events=[];
 S.replay={paths:{ST:[[origin+40,-gap/2,0],[origin+47,-gap/2,0]],D1:[[origin+40,gap/2,0],[origin+47,gap/2,0]]}};
 Object.assign(S.ents[1],{x:-gap/2,y:0});Object.assign(S.ents[4],{x:gap/2,y:0});
}
for(const gap of [8,24])test(`uncontrolled ST/D1 tether ${gap<10?'accepts safe distance':'records sustained NPC separation'}`,()=>{
 stationaryTether(gap);until(45.1);
 assert.equal(S.over,null);if(gap>=10)assert(S.npcFaults.some(f=>/炎獄之鎖.*ST.*D1/.test(f.reason)));
});
test('uncontrolled tether recovery resets its timer and expiry clears it',()=>{
 stationaryTether(24);until(43.1);assert(S.fetterApart>2);
 S.replay.paths.D1=[[origin+40,-5,0],[origin+47,-5,0]];Object.assign(S.ents[4],{x:-5,y:0});until(43.2);assert.equal(S.fetterApart,0);assert.equal(S.over,null);
 S.fetterApart=3;S.t=213.994-origin;sim.step(.01);assert.equal(S.fetterApart,0);
});
test('NPC tether pair reunites instead of remaining on separated route samples',()=>{
 setup(7,41);S.events=[];S.replay={rawCoordinates:true,paths:{ST:[[origin+40,-14,0],[origin+47,-14,0]],D1:[[origin+40,0,0],[origin+47,0,0]]}};
 Object.assign(S.ents[1],{x:-14,y:0});Object.assign(S.ents[4],{x:0,y:0});until(45.1);
 assert.equal(S.over,null);assert(Math.hypot(S.ents[1].x-S.ents[4].x,S.ents[1].y-S.ents[4].y)<=CFG.fetterMax);
});
for(const role of [2,4,7])for(const count of [5,6])test(`Flaming Crush ${count} living eligible participants, ${ROLES[role]} controlled`,()=>{
 const time=262.228-origin;setup(role,time-.001);onlyEvent(time);
 // Healers remain isolated; the intended six are MT/ST and four DPS.
 for(const e of S.ents)Object.assign(e,{x:e.i===2?18:e.i===3?0:-12,y:e.i===2?0:e.i===3?18:-10});
 if(count===5)Object.assign(S.ents[6],{x:0,y:0});sim.step(.002);
 assert.equal(S.over,null);if(count===5)assert(S.npcFaults.some(f=>f.role===6&&/分攤人數不足/.test(f.reason)));
});
test('NPC tether partner follows the tank through a real AoE dodge without abandoning the pair',()=>{
 setup(7,41);S.events=[];S.replay={rawCoordinates:true,paths:{ST:[[origin+40,-5,0],[origin+47,-5,0]],D1:[[origin+40,4,0],[origin+47,4,0]]}};
 Object.assign(S.ents[1],{x:-5,y:0});Object.assign(S.ents[4],{x:4,y:0});Object.assign(S.ents[7],{x:0,y:17});
 const hit=p=>Math.hypot(p.x+5,p.y)<=4;let resolved=false,minDpsX=4;
 S.aoes=[{t0:41,t1:43,hit,done:false,linger:0,onHit(){resolved=true;assert(!hit(S.ents[1]),'tank actually leaves the AoE');}}];
 until(45.1,()=>{minDpsX=Math.min(minDpsX,S.ents[4].x);});
 assert(resolved);assert.equal(S.over,null);assert(minDpsX<3.5,'DPS must adapt to the tank dodge');assert(Math.hypot(S.ents[1].x-S.ents[4].x,S.ents[1].y-S.ents[4].y)<=CFG.fetterMax);
});
for(const safeParty of [false,true])test(`unshielded knockback ${safeParty?'physically moves all eight survivors':'fails NPC wall impact even when H2 stands safely'}`,()=>{
 const time=170.676-origin;setup(3,time-.001);onlyEvent(time);const b=sim.bossState(S.t).pos;
 for(const e of S.ents)Object.assign(e,{x:b.x+(safeParty?1:8),y:b.y});Object.assign(S.ents[3],{x:b.x+1,y:b.y});
 const before=S.ents.map(e=>({x:e.x,y:e.y}));sim.step(.002);
 if(safeParty){assert.equal(S.over,null);for(const e of S.ents)assert(Math.hypot(e.x-before[e.i].x,e.y-before[e.i].y)>14.9,ROLES[e.i]);}
 else{assert.equal(S.over?.win,false);assert.match(S.over.reason,/火神爆裂.*場邊/);}
});
test('Flaming Crush NPC participants assemble around the live controlled marker',()=>{
 const time=262.228-origin;setup(7,time-5.1);Object.assign(S.ents[7],{x:-8,y:12});until(time+.001);
 assert.equal(S.over,null);assert(S.ents.filter(e=>![2,3].includes(e.i)&&!e.dead&&Math.hypot(e.x-S.ents[7].x,e.y-S.ents[7].y)<=CFG.stackR).length>=6);
});
test('a dead character cannot provide the sixth Flaming Crush participant',()=>{
 const time=262.228-origin;setup(2,time-.001);onlyEvent(time);
 for(const e of S.ents)Object.assign(e,{x:e.i===2?18:e.i===3?0:-12,y:e.i===2?0:e.i===3?18:-10});S.ents[6].dead=true;sim.step(.002);
 assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===6&&/分攤人數不足（5\/6/.test(f.reason)));
});
test('physical knockback is marked for one transition, then NPC recovery remains speed bounded',()=>{
 const time=170.676-origin;setup(3,time-.001);onlyEvent(time);const b=sim.bossState(S.t).pos;
 for(const e of S.ents)Object.assign(e,{x:b.x+1,y:b.y});sim.step(.002);
 assert(S.ents.every(e=>e.knockbackPos),'the displacement must be distinguishable from walking');const before=S.ents.map(e=>({x:e.x,y:e.y}));
 sim.step(.02);assert(S.ents.every(e=>!e.knockbackPos),'the transition marker must expire, not exempt future motion');
 for(const e of S.ents)if(e.i!==3)assert(Math.hypot(e.x-before[e.i].x,e.y-before[e.i].y)<=CFG.speed*.02+1e-7);
});

test('NPC-only Searing Wind splash is diagnostic while a safe player continues',()=>{
 const pulse=201.130-origin;setup(7,pulse-.001);onlyEvent(pulse);
 for(const e of S.ents)Object.assign(e,{x:[0,2].includes(e.i)?18:-18,y:0});sim.step(.002);
 assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===0&&/灼熱/.test(f.reason)));assert(!S.ents[0].dead);
});
test('missing controlled Flaming Crush participant still fails',()=>{
 const time=262.228-origin;setup(6,time-.001);onlyEvent(time);
 for(const e of S.ents)Object.assign(e,{x:e.i===2?18:e.i===3?0:-12,y:e.i===2?0:e.i===3?18:-10});
 Object.assign(S.ents[6],{x:0,y:0});sim.step(.002);assert.equal(S.over?.win,false);assert.match(S.over.reason,/沒進.*分攤/);
});
for(const role of [2,7])test(`Flaming Crush wind responsibility for role ${role}`,()=>{
 const time=262.228-origin;setup(role,time-.001);onlyEvent(time);
 for(const e of S.ents)Object.assign(e,{x:e.i===3?18:-12,y:e.i===3?0:-10});
 // H1's wind is on the stack. H1 caused it; the stack participant is actually hit.
 sim.step(.002);assert.equal(S.over?.win,false);assert.match(S.over.reason,/灼熱/);
});
test('isolated wind healer continues when another NPC wind carrier reaches the stack',()=>{
 const time=262.228-origin;setup(3,time-.001);onlyEvent(time);
 for(const e of S.ents)Object.assign(e,{x:e.i===3?18:-12,y:e.i===3?0:-10});
 sim.step(.002);assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===2&&/灼熱/.test(f.reason)));
});
test('NPC-only broken fetter is diagnostic and does not end D4 practice',()=>{
 setup(7,41);S.events=[];S.ents[1].dead=true;S.ents[4].dead=true;
 Object.assign(S.ents[1],{x:18,y:0});Object.assign(S.ents[4],{x:-18,y:0});until(45.1);
 assert.equal(S.over,null);assert(S.npcFaults.some(f=>/炎獄之鎖/.test(f.reason)));
});
