'use strict';
// Engine acceptance: controlled inputs and NPC snapshots, not a browser clear.
const test=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu'),{S,reset,step,useSkill,contains}=sim;
const timeline=require('../sim/uwu-timeline');
function start(phase,time,role=4,seed=0){Object.assign(S.opts,{role,god:false,hints:true,assist:true});reset(phase,seed,time);}
function advance(time){while(S.t<time&&!S.dead&&!S.done)step(Math.min(.01,time-S.t));}
test('every LB assignment accepts only its own active input and resets between attempts',()=>{
 for(const phase of ['intermission','ultima'])for(const lb of timeline.build(phase,0).filter(e=>e.kind==='lb'))for(let role=0;role<8;role++){
  start(phase,lb.t-lb.lead-.1,role);S.events=S.events.filter(e=>e.kind==='lb'&&e.t===lb.t);
  useSkill('lb');assert.equal(S.lb,null,'early LB must not prefill deadline');
  advance(lb.t-.1);useSkill('lb');advance(lb.t+.01);assert.equal(S.dead,false,`${phase} ${lb.who}/${role}: ${S.reason}`);
  start(phase,lb.t-.2,role);S.events=S.events.filter(e=>e.kind==='lb'&&e.t===lb.t);advance(lb.t+.01);
  assert.equal(S.dead,role===lb.who,'missed controlled assignment fails only that role');
 }
});
test('Ultima NPCs dodge actual bait snapshots at normal movement speed for every role and seed',()=>{
 for(let seed=0;seed<4;seed++)for(let role=0;role<8;role++){
  start('ultima',688,role,seed);S.events=S.events.filter(e=>e.kind==='bait'&&e.t===689.739);
  Object.assign(S.ents[role],{x:16,y:0});let maxStep=0;
  while(S.t<689.73){const before=S.ents.map(p=>({...p}));step(.01);for(let i=0;i<8;i++)if(i!==role)maxStep=Math.max(maxStep,Math.hypot(S.ents[i].x-before[i].x,S.ents[i].y-before[i].y));}
  const event=S.events[0];for(const p of S.ents)if(p.i!==role)assert(!event.hazards.some(h=>contains(h,p)),`seed ${seed} controlled ${role}: NPC ${p.i} standing in Weight`);
  assert(maxStep<=.060001,`NPC speed ${maxStep/.01}`);
 }
});
test('Suppression prison cannot release itself when rescuers are out of range',()=>{
 const role=timeline.assignments(0).gaol;start('ultima',764.49,role);S.events=S.events.filter(e=>e.kind==='rescue');
 S.gaol={x:3,y:5};Object.assign(S.ents[role],S.gaol);for(const p of S.ents)if(p.i!==role)Object.assign(p,{x:-15,y:-9});
 advance(764.51);assert(!S.dead,'NPC rescue failure must not blame the prisoner');assert(S.npcFaults.length);assert(S.gaol,'deadline cannot delete prison');
});
test('Suppression NPC rescue needs a nearby free actor and leaves the prisoner free to move',()=>{
 const role=timeline.assignments(0).gaol;start('ultima',763,role);S.events=S.events.filter(e=>e.kind==='rescue');
 S.gaol={x:3,y:5};Object.assign(S.ents[role],S.gaol);Object.assign(S.ents[0],{x:4,y:5});step(.01);
 assert.equal(S.gaol,null,'nearby NPC should perform rescue instead of waiting for scripted timeout');
 const x=S.ents[role].x;step(.1,new Set(['d']));assert(S.ents[role].x>x);
});
test('Suppression singer movement changes the interception lane; a tank behind them fails',()=>{
 for(let seed=0;seed<6;seed++){
  const song=timeline.build('ultima',seed).find(e=>e.kind==='songside');start('ultima',song.t-.02,song.who,seed);S.events=S.events.filter(e=>e.kind==='songside'&&e.t===song.t);
  Object.assign(S.ents[song.who],{x:-2,y:0});Object.assign(S.ents[song.tank],{x:0,y:0});advance(song.t+.001);
  assert(S.dead,'a nearby destination cannot replace actual interception');
 }
});
test('full Ultima NPC route avoids each snapshot across assignments when player baits away from party',()=>{
 const failures=[];
 for(let seed=0;seed<3;seed++)for(let role=0;role<8;role++){
  start('ultima',536.112,role,seed);S.opts.god=true;
  // Keep the controlled actor out of the NPC duties. This audits NPC survival,
  // not a player clear; dropping Light Pillar on the gaol is a negative case.
  Object.assign(S.ents[role],{x:-16,y:-8});
  while(!S.done){const done=new Set(S.events.filter(e=>e.done));step(.025);
   for(const e of S.events.filter(e=>e.done&&!done.has(e)))for(const p of S.ents)
    if(p.i!==role&&!(S.gaol&&p.i===S.supp.gaol)&&e.hazards?.some(h=>contains(h,p)))failures.push({seed,role,npc:p.i,t:e.t,event:e.name});
  }
 }
 assert.deepEqual(failures,[],'NPC impact audit (controlled bait held away from party; this is not a player clear)');
});

test('an Ultima NPC hazard collision does not blame a player who dodged',()=>{
 start('ultima',751.64,4,0);S.events=S.events.filter(e=>e.kind==='pillar'&&e.t===752.658);
 Object.assign(S.ents[4],{x:0,y:3});advance(751.68);const e=S.events[0];
 Object.assign(S.ents[4],{x:-16,y:-8});advance(752.65);
 Object.assign(S.ents[0],{x:e.hazards[0].c.x,y:e.hazards[0].c.y});advance(752.66);
 assert(!S.dead);assert(S.npcFaults.some(f=>f.role===0));
});
test('Ultima Landslide snapshots a seeded live target and its awakened follow-up keeps that aim',()=>{
 const aims=[];
 for(const point of [{x:10,y:-8},{x:-10,y:8}]){
  const scheduled=timeline.build('ultima',3).find(e=>e.kind==='slide'&&e.name==='地裂');
  assert(Number.isInteger(scheduled.who),'landslide needs a live party target');
  start('ultima',scheduled.t-scheduled.lead-.02,scheduled.who,3);S.opts.god=true;
  S.events=S.events.filter(e=>e.kind==='slide'&&e.t<653);
  Object.assign(S.ents[scheduled.who],point);advance(scheduled.t-scheduled.lead+.01);
  const first=S.events[0],shape=first.hazards[0];assert(contains(shape,point),'locked line must go through selected actor');
  const frozen=JSON.stringify(shape);Object.assign(S.ents[scheduled.who],{x:0,y:15});advance(650.5);
  assert.equal(JSON.stringify(shape),frozen,'movement after lock must not drag the line');
  const second=S.events.find(e=>e.repeatOf===first.t&&!e.ultima);advance(second.t-second.lead+.01);assert(second.hazards);assert.equal(second.hazards[0].deg,shape.deg+22.5,'awakened follow-up is based on first aim');
  assert.deepEqual(second.hazards[0].c,shape.c);aims.push(shape.deg);
 }
 assert.notEqual(aims[0],aims[1],'different live bait locations must rotate the attack');
});
test('Garuda eight-role NPC traces dodge snapshots and keep cyclone, Friction and tether duties',()=>{
 const failures=[];
 for(let role=0;role<8;role++){
  start('garuda',0,role);S.opts.god=true;S.cam=0;assistedWalk.dodge=null;if(role!==0)Object.assign(S.ents[role],{x:-16,y:-8});
  while(!S.done){const done=new Set(S.events.filter(e=>e.done));if(role===0)assistedWalk(sim.roleSample(0,S.t+.025),t=>sim.roleSample(0,t));else step(.025);
   for(const e of S.events.filter(e=>e.done&&!done.has(e))){
    for(const p of S.ents)if(p.i!==role&&!(e.kind==='buster'&&p.i===0)&&e.hazards?.some(h=>contains(h,p)))failures.push([role,e.t,p.i,'hit']);
    const assigned=e.kind==='friction'?[0,1,2,3,4,5,6,7]:e.kind==='cyclone'?[1]:e.kind==='tethers'?e.targets:[];
    for(const i of assigned){if(i===role)continue;const target=sim.goal(e,i),p=S.ents[i];if(Math.hypot(p.x-target.x,p.y-target.y)>(e.kind==='friction'?5:4))failures.push([role,e.t,i,'missed duty']);}
   }
  }
 }
 assert.deepEqual(failures,[],'non-tank controlled actor held outside duties; controlled MT keeps correct facing with WASD; NPC audit, not player clear');
});
test('Garuda records an NPC Feather Rain fault without blaming a player who dodged',()=>{
 const role=timeline.build('garuda',0).find(e=>e.kind==='bait'&&e.t===71.459).targets.find(i=>i!==0);
 start('garuda',70.4,role);S.events=S.events.filter(e=>e.kind==='bait'&&e.t===71.459);
 const impact=sim.roleSample(0,71.459);Object.assign(S.ents[role],impact);advance(70.8);
 Object.assign(S.ents[role],{x:-16,y:-8});advance(71.45);
 Object.assign(S.ents[0],impact);advance(71.46);
 assert(!S.dead);assert(S.npcFaults.length);
});
test('more Annihilation orb soakers separate the later pair farther and delay its fusion',()=>{
 function pair(soakers){
  start('ultima',795.3,0);S.events=S.events.filter(e=>e.kind==='grouporb'&&e.orb===0);S.orbSoaks[0]=soakers;
  Object.assign(S.ents[0],{x:0,y:0});step(.001);
  const line=sim.sceneGuides().find(g=>g.type==='line');return {distance:Math.hypot(line.a.x-line.b.x,line.a.y-line.b.y)};
 }
 const one=pair(1),two=pair(2);assert(two.distance>one.distance,'additional early soakers must increase pair spacing');
 advance(799.3);assert.equal(S.dead,false,'a two-soaker pair has not fused at the one-soaker deadline');
 advance(800.1);assert(S.dead);assert.match(S.reason,/融合/);
});
function walkToward(target,dt=.025){
 const p=S.ents[S.opts.role],keys=new Set(),tolerance=Math.max(.04,6*dt*.55);
 if(Math.abs(target.x-p.x)>tolerance)keys.add(target.x>p.x?'d':'a');
 if(Math.abs(target.y-p.y)>tolerance)keys.add(target.y>p.y?'s':'w');
 step(dt,keys);
}
test('eight roles can perform the complete LB intermission with movement and only their assigned LB input',()=>{
 for(let role=0;role<8;role++){
  start('intermission',486,role);S.cam=0;
  while(!S.dead&&!S.done){
   if(S.events.some(e=>!e.done&&e.kind==='lb'&&e.who===role&&S.t>=e.t-e.lead))useSkill('lb');
   walkToward({x:0,y:0});
  }
  assert(!S.dead,`${role}: ${S.reason}`);assert(S.done);
 }
});
test('eight roles walk both Predation movements for four layouts at 30/60/120 Hz without observation immunity',()=>{
 for(const fps of [30,60,120])for(let seed=0;seed<4;seed++)for(let role=0;role<8;role++){
  start('ultima',595,role,seed);S.cam=0;
  while(S.t<616.55&&!S.dead){const event=S.events.find(e=>!e.done&&['pred1','pred2'].includes(e.kind)&&S.t>=e.t-e.lead);walkToward(event?sim.goal(event,role):S.ents[role],1/fps);}
  assert(!S.dead,`${fps}Hz ${seed}/${role}: ${S.reason}`);
  assert.equal(S.events.filter(e=>e.done&&['pred1','pred2'].includes(e.kind)).length,2);
 }
});
// Test-side keyboard driver: follows displayed route intent and chooses a local
// safe waypoint from visible tells. It never sets the player position mid-run.
function assistedWalk(target,routeAt){
 const p=S.ents[S.opts.role],hazards=S.events.map(e=>e.kind==='orb'&&e.who!==S.opts.role?{...e,hazards:[{type:'circle',c:sim.goal(e,e.who),r:6}]}:e).filter(e=>!e.done&&e.hazards?.length&&S.t>=e.t-e.lead&&!(S.opts.role===S.supp.gaol&&e.kind==='eruption'&&e.t===753.684));
 const safe=q=>Math.hypot(q.x,q.y)<19.6&&hazards.every(e=>e.hazards.every(h=>!contains({...h,r:h.r+.4,inner:h.inner-.4,half:h.type==='strip'?h.half+.4:h.half},q)));
 const predict=(q,seconds)=>{const d=Math.hypot(q.x-p.x,q.y-p.y),f=d?Math.min(1,Math.max(0,seconds)*(S.sprint>S.t?8:6)/d):0;return {x:p.x+(q.x-p.x)*f,y:p.y+(q.y-p.y)*f};};
 const threatens=q=>hazards.some(e=>e.hazards.some(h=>contains({...h,r:h.r+.4,inner:h.inner-.4,half:h.type==='strip'?h.half+.4:h.half},predict(q,e.t-S.t-.04))));
 const threatened=(S.phase!=='garuda'&&!routeAt&&threatens(target))||hazards.some(e=>e.hazards.some(h=>contains(h,routeAt?routeAt(e.t):target)));
 if(threatened){
  if(!assistedWalk.dodge||!safe(assistedWalk.dodge)||(S.phase!=='garuda'&&threatens(assistedWalk.dodge))){
   let best=null,cost=Infinity;
   for(let r=.35;r<=10;r+=.35)for(let j=0;j<48;j++){
    const q={x:p.x+Math.cos(j*Math.PI/24)*r,y:p.y+Math.sin(j*Math.PI/24)*r};
    if(!safe(q)||(S.phase!=='garuda'&&threatens(q)))continue;
    const score=r+Math.hypot(q.x-target.x,q.y-target.y)*(S.phase==='garuda'?.2:.8);if(score<cost){best=q;cost=score;}
   }
   if(!best&&hazards.length){
    const first=Math.min(...hazards.map(e=>e.t)),urgent=hazards.filter(e=>e.t<=first+.02);
    const urgentSafe=q=>urgent.every(e=>e.hazards.every(h=>!contains(h,q)));
    if(urgentSafe(p))best={x:p.x,y:p.y};
    else for(let r=.2;r<=10&&!best;r+=.2)for(let j=0;j<48;j++){const q={x:p.x+Math.cos(j*Math.PI/24)*r,y:p.y+Math.sin(j*Math.PI/24)*r};if(Math.hypot(q.x,q.y)<19.5&&urgentSafe(q)){best=q;break;}}
   }
   assistedWalk.dodge=best;
   // Reserve Sprint for the final roulette if ordinary movement cannot reach
   // any safe waypoint before the visible snapshot.
   if(!best&&S.phase==='ultima'&&S.t>=860&&S.sprint<=S.t&&S.sprintCd<=S.t){useSkill('sprint');return assistedWalk(target,routeAt);}
  }
  if(assistedWalk.dodge)target=assistedWalk.dodge;
 }else assistedWalk.dodge=null;
 walkToward(target);
}
test('all Garuda roles can follow live tells with normal-speed movement through the complete phase',()=>{
 const failures=[];
 for(let role=0;role<8;role++){
  start('garuda',0,role);S.cam=0;assistedWalk.dodge=null;
  while(!S.dead&&!S.done){
   const cleanse=timeline.thermalUpdates.slice(S.thermalIndex).find(([t,i,n])=>i===role&&n===0&&t<100);
   const bubble=sim.sceneGuides().find(g=>g.type==='ring'&&g.radius===5);
   const cleanNow=cleanse&&bubble&&S.stacks[role]>0&&cleanse[0]-S.t<=1.5;
   assistedWalk(cleanNow?bubble.pos:sim.roleSample(role,S.t+.025),t=>sim.roleSample(role,t));
  }
  if(S.dead)failures.push([role,S.t,S.reason]);
 }
 assert.deepEqual(failures,[]);
});
function ultimaPlayerIntent(){
 const i=S.opts.role,t=S.t;
 const weight=sim.annihilationWeightIntent(i,t);if(weight)return weight;
 if(i===1&&t>=762&&t<=768.137)return {x:-6,y:3};
 if(t>663.574&&t<666.634)return {x:0,y:4};
 if(t>642.028&&t<=653)return {x:0,y:0};
 if(t>=816)return sim.rouletteIntent(t);
 if(t>=685&&t<688.785)return {x:0,y:4};
 if(t>=640&&t<=650&&(i===1||i===4))return S.ents[i===1?4:1];
 if(i===0&&t>663.574&&t<669.6)return {x:0,y:4};
 if(i===1&&t>=666.6&&t<669.6)return {x:2.5,y:4};
 const suppression=sim.suppressionIntent(i,t);if(suppression)return suppression;
 const event=S.events.find(e=>!e.done&&S.t>=e.t-e.lead&&sim.goal(e,i));
 if(event?.kind==='grouporb'){
  const c=sim.goal(event,i),ready=S.ents.filter(p=>p.i!==i&&p.i%2===i%2).every(p=>Math.hypot(p.x-c.x,p.y-c.y)<=3.5);
  return ready?c:{x:c.x-event.side*2.5,y:c.y};
 }
 return event?sim.goal(event,i):S.orbRally[i%2]&&t<804?S.orbRally[i%2]:t>=816?{x:0,y:4}:i===3&&t>=695.835&&t<=725.844?{x:-3.5,y:-11.3}:i===0?{x:0,y:-3}:i===1?{x:-3,y:-2}:{x:(i-4)*.7,y:3};
}
test('all roles can complete normal-mode Ultima with movement, rescue and assigned LB inputs',()=>{
 const failures=[];
 for(let seed=0;seed<3;seed++)for(let role=0;role<8;role++){
  start('ultima',536.112,role,seed);S.cam=0;assistedWalk.dodge=null;
  while(!S.dead&&!S.done){
   if(S.events.some(e=>!e.done&&e.kind==='lb'&&e.who===role&&S.t>=e.t-e.lead))useSkill('lb');
   // A late release into a snapshotted Feather Rain leaves no travel time.
   // Wait for that visible impact before freeing the prisoner; early releases
   // still work, and the engine keeps the fatal late-release negative case.
   const rescueHazard=S.gaol&&S.events.some(e=>!e.done&&e.t-S.t<.9&&e.hazards?.some(h=>contains(h,S.gaol)));
   if(!rescueHazard)useSkill('attack');const pillarRoute=S.t>=740&&S.t<=760.793&&role===S.supp.pillar?(t=>{const a=(230-Math.max(0,t-751.658)*20)*Math.PI/180;return {x:Math.sin(a)*15,y:-Math.cos(a)*15};}):null;assistedWalk(ultimaPlayerIntent(),pillarRoute);
  }
  if(S.dead)failures.push([seed,role,S.t,S.reason,S.ents.map(p=>[p.i,+p.x.toFixed(1),+p.y.toFixed(1)])]);
 }
 assert.deepEqual(failures,[]);
});
test('Wheel guidance does not send an already safe tank through the boss to the opposite side',()=>{
 start('ultima',661,0);const e=S.events.find(e=>e.kind==='wheel'),p=S.ents[0],target=sim.goal(e,0);
 for(let n=0;n<=20;n++){const q={x:p.x+(target.x-p.x)*n/20,y:p.y+(target.y-p.y)*n/20};assert(!sim.shapes(e).some(h=>contains(h,q)));}
});
test('the busy Suppression pillar runner is rescued by nearby teammates without abandoning the bait',()=>{
 start('ultima',763,timeline.assignments(0).pillar);S.events=S.events.filter(e=>e.kind==='rescue');
 S.gaol={x:3,y:5};Object.assign(S.ents[S.supp.gaol],S.gaol);Object.assign(S.ents[0],{x:4,y:5});step(.01);assert.equal(S.gaol,null);
});
test('stack guidance points the controlled actor toward the actual safe teammate cluster',()=>{
 start('ultima',690,4);for(const p of S.ents)if(p.i!==4)Object.assign(p,{x:7,y:4});
 const stack=S.events.find(e=>e.kind==='stack'),target=sim.goal(stack,4);assert(Math.hypot(target.x-7,target.y-4)<1);
});
test('the two Suppression song targets can hold their separate assigned lanes without clipping each other',()=>{
 for(let seed=0;seed<3;seed++)for(const role of timeline.assignments(seed).singers){
  start('ultima',745,role,seed);S.cam=0;S.events=S.events.filter(e=>e.kind==='songside');
  const own=S.events.find(e=>e.who===role);
  while(!S.dead&&S.t<753)walkToward(sim.goal(own,role));
  assert(!S.dead,`${seed}/${role}: ${S.reason}`);
 }
});
test('Annihilation orbs spawn at the same southeast leg and assigned NPC tanks reach them',()=>{
 for(let role=0;role<8;role++){
  start('ultima',674,role);S.opts.god=true;Object.assign(S.ents[role],{x:-16,y:-8});
  const orbs=S.events.filter(e=>e.kind==='orb'),points=orbs.map(e=>sim.goal(e,e.who));
  assert(points.every(p=>p.x>0&&p.y>0));assert(points.every(p=>p.x===points[0].x&&p.y===points[0].y));
  while(S.t<714){const done=new Set(S.events.filter(e=>e.done));step(.025);
   for(const e of S.events.filter(e=>e.kind==='orb'&&e.done&&!done.has(e))){
    const c=sim.goal(e,e.who);for(const p of S.ents)if(p.i!==role){const d=Math.hypot(p.x-c.x,p.y-c.y);assert(e.who===p.i?d<=3:d>6,`${role}: NPC${p.i} orb${e.t} distance${d}`);}
   }
  }
 }
});
test('missing NPC orb soak is diagnosed without blaming a safe player',()=>{
 start('ultima',694.18,4);S.events=S.events.filter(e=>e.kind==='orb'&&e.t===694.187);
 Object.assign(S.ents[4],{x:-16,y:-8});Object.assign(S.ents[0],{x:0,y:-15});advance(694.19);
 assert(!S.dead);assert(S.npcFaults.length);
});
test('both Suppression tank intercepts lock on the simultaneous source snapshots',()=>{
 start('ultima',750.748,4,1);S.events=S.events.filter(e=>e.kind==='songside');
 for(const p of S.ents)Object.assign(p,{x:14,y:-8});
 for(const e of S.events){Object.assign(S.ents[e.who],sim.goal(e,e.who));Object.assign(S.ents[e.tank],sim.goal(e,e.tank));}
 step(.002);assert.equal(S.dead,false,S.reason);assert(S.events.every(e=>e.done&&e.interceptAt));
 assert.deepEqual(S.whirlOrigins.suppression,S.events.map(e=>e.interceptAt));
});
test('a correctly intercepted song records NPC collateral without blaming its target',()=>{
 const song=timeline.build('ultima',0).find(e=>e.kind==='songside');start('ultima',song.t-.01,song.who,0);
 S.events=S.events.filter(e=>e.kind==='songside'&&e.tank===song.tank);
 for(const p of S.ents)Object.assign(p,{x:14,y:-8});
 Object.assign(S.ents[song.who],{x:0,y:3});Object.assign(S.ents[song.tank],{x:-3,y:-1.5});Object.assign(S.ents[S.supp.pillar],{x:-1.5,y:.75});advance(song.t+.001);
 assert(!S.dead);assert(S.npcFaults.length);
});
test('rescue guidance starts when the Suppression prison exists, without a dead interval',()=>{
 start('ultima',753.8,0);S.gaol={x:3,y:5};
 assert(sim.sceneGuides().some(g=>g.type==='ring'&&g.pos.x===3&&g.pos.y===5));
});
// Isolated hitbox contracts deliberately set fixture positions immediately
// before impact. These are damage tests, separate from the WASD clear tests.
test('Ultima area attacks fail player contact and diagnose NPC contact with assists off',()=>{
 let checked=0;
 for(let seed=0;seed<3;seed++)for(const scheduled of timeline.build('ultima',seed)){
  if(!['slide','pred1','pred2','wheel','donut','eye','bait','eruption','pillar','plume','bomb','bombLand','whirl','predTornado','crimsonCross','aetherLaser','suppCone'].includes(scheduled.kind))continue;
  start('ultima',scheduled.t-scheduled.lead-.01,4,seed);const shapeCount=sim.shapes(S.events.find(e=>e.t===scheduled.t&&e.kind===scheduled.kind)).length;
  for(let shapeIndex=0;shapeIndex<shapeCount;shapeIndex++)for(const contact of ['player','npc','safe']){
   start('ultima',scheduled.t-scheduled.lead-.01,4,seed);Object.assign(S.opts,{hints:false,assist:false,god:false});
   S.events=S.events.filter(e=>e.t===scheduled.t&&e.kind===scheduled.kind);assert.equal(S.events.length,1);
   const event=S.events[0];S.t=event.t-event.lead;step(.001);assert(event.hazards?.length);
   let safe=null,inside=null;
   for(let x=-19.5;x<=19.5&&(!safe||!inside);x+=.5)for(let y=-19.5;y<=19.5&&(!safe||!inside);y+=.5){
    if(Math.hypot(x,y)>19.6)continue;const p={x,y};
    if(!inside&&[p,{x:x+.2,y},{x:x-.2,y},{x,y:y+.2},{x,y:y-.2}].every(q=>contains(event.hazards[shapeIndex],q)))inside=p;
    if(!safe&&[p,{x:x+.2,y},{x:x-.2,y},{x,y:y+.2},{x,y:y-.2}].every(q=>event.hazards.every(h=>!contains(h,q))))safe=p;
   }
   assert(safe&&inside,`${seed}/${scheduled.name}@${scheduled.t} needs safe and dangerous arena points`);
   for(const p of S.ents)Object.assign(p,safe);
   if(contact==='player')Object.assign(S.ents[4],inside);if(contact==='npc')Object.assign(S.ents[0],inside);
   S.t=event.t-.001;step(.002);
   assert.equal(S.dead,contact==='player',`${seed}/${event.name}@${event.t} shape${shapeIndex} ${contact}: ${S.reason}`);
   if(contact==='npc')assert(S.npcFaults.length);checked++;
  }
 }
 assert(checked>=400,`only ${checked} damage cases checked`);
 Object.assign(S.opts,{hints:true,assist:true});
});
test('every Ultima stack, laser, tether, searing pulse, orb, knockback, gaol, rescue and LB has positive/negative resolution',()=>{
 let cases=0;
 for(const scheduled of timeline.build('ultima',0)){
  if(!['stack','laser','tether','pulse','orb','boom','gaol','rescue','lb'].includes(scheduled.kind))continue;
  for(const correct of [true,false]){
   const role=['orb','tether','gaol','lb'].includes(scheduled.kind)?scheduled.who:scheduled.kind==='pulse'?3:scheduled.kind==='laser'?1:scheduled.kind==='rescue'?0:4;
   start('ultima',scheduled.t-.01,role,0);Object.assign(S.opts,{god:false,hints:false,assist:false});S.events=S.events.filter(e=>e.kind===scheduled.kind&&e.t===scheduled.t);
   for(const p of S.ents)Object.assign(p,{x:0,y:4});
   if(scheduled.kind==='pulse')Object.assign(S.ents[3],{x:14,y:7});
   if(['orb','tether','gaol','laser'].includes(scheduled.kind)){
    if(scheduled.kind==='orb')for(const p of S.ents)Object.assign(p,{x:-8,y:-8});
    Object.assign(S.ents[role],sim.goal(S.events[0],role));
   }
   if(scheduled.kind==='boom')Object.assign(S.ents[role],{x:0,y:0});
   if(scheduled.kind==='rescue'){S.gaol={x:3,y:5};Object.assign(S.ents[role],S.gaol);}
   if(!correct)Object.assign(S.ents[role],scheduled.kind==='pulse'?{x:0,y:4}:{x:-14,y:-7});
   if(scheduled.kind==='lb'&&correct)useSkill('lb');if(scheduled.kind==='rescue')useSkill('attack');
   step(.02);assert.equal(S.dead,!correct,`${scheduled.name}@${scheduled.t} ${correct}: ${S.reason}`);cases++;
  }
 }
 assert(cases>=50);Object.assign(S.opts,{hints:true,assist:true});
});
test('pre-Annihilation Eruptions select the two farthest live players from Ifrit, not arena center',()=>{
 start('ultima',633,6);const eruption=S.events.find(e=>e.kind==='eruption');
 for(const p of S.ents)Object.assign(p,{x:0,y:0});
 Object.assign(S.ents[0],{x:0,y:-16});Object.assign(S.ents[6],{x:-1,y:10});Object.assign(S.ents[7],{x:1,y:10});
 const targets=sim.shapes(eruption).map(h=>h.c.i).sort();assert.deepEqual(targets,[6,7]);
 Object.assign(S.ents[6],{x:0,y:-10});Object.assign(S.ents[4],{x:0,y:12});
 assert.deepEqual(sim.shapes(eruption).map(h=>h.c.i).sort(),[4,7],'moving a live baiter changes who is selected');
});
test('roulette Eruptions use seeded random player targets and snapshot their live positions',()=>{
 const seen=new Set();
 for(let seed=0;seed<8;seed++){
  start('ultima',816,4,seed);const event=S.events.find(e=>e.kind==='eruption');
  assert.equal(event.targets?.length,2);assert.equal(new Set(event.targets).size,2);event.targets.forEach(i=>seen.add(i));
  Object.assign(S.ents[event.targets[0]],{x:11,y:7});assert.deepEqual(sim.shapes(event).map(h=>h.c.i),event.targets);assert(sim.shapes(event).some(h=>h.c.x===11&&h.c.y===7));
 }
 assert.equal(seen.size,8);
});
test('NPC D3 and D4 keep all four pre-Annihilation baits while other roles stay north',()=>{
 for(let role=0;role<6;role++){
  start('ultima',629,role);Object.assign(S.ents[role],{x:0,y:-4});advance(642.04);
  assert(!S.dead,`${role}: ${S.reason}`);
  for(const event of S.events.filter(e=>e.kind==='eruption'&&e.t<643))assert.deepEqual(event.hazards.map(h=>h.c.i).sort(),[6,7],`role${role} @${event.t}`);
 }
});
test('Aetheric Boom moves all actors and diagnoses unsafe NPCs without blaming the player',()=>{
 for(const badNpc of [false,true]){
  start('ultima',795.79,4);S.events=S.events.filter(e=>e.kind==='boom');
  for(const p of S.ents)Object.assign(p,{x:p.i%2?1:-1,y:1});
  if(badNpc)Object.assign(S.ents[0],{x:14,y:0});
  const before=S.ents.map(p=>Math.hypot(p.x,p.y));step(.02);
  if(badNpc){assert(!S.dead);assert(S.npcFaults.length);}
  else{assert(!S.dead);for(const p of S.ents)assert(Math.hypot(p.x,p.y)>before[p.i]+6.8,`NPC${p.i} must also receive the physical knockback`);}
 }
});

test('NPC assigned duties remain diagnostic when controlled role is uninvolved',()=>{
 for(const kind of ['tether','laser','pulse','gaol','songside'])for(const wrong of [false,true]){
  const event=timeline.build('ultima',0).find(e=>e.kind===kind),role=4;
  start('ultima',event.t-.001,role);S.events=S.events.filter(e=>e.kind===kind&&e.t===event.t&&(kind!=='songside'||e.tank===event.tank));
  for(const p of S.ents)Object.assign(p,{x:0,y:4});
  if(kind==='tether')Object.assign(S.ents[event.who],wrong?{x:14,y:10}:sim.goal(event,event.who));
  if(kind==='laser'){Object.assign(S.ents[1],{x:9,y:2});if(wrong)Object.assign(S.ents[2],{x:9,y:2});}
  if(kind==='pulse'){Object.assign(S.ents[3],{x:14,y:7});if(wrong)Object.assign(S.ents[2],{x:14,y:7});}
  if(kind==='gaol')Object.assign(S.ents[event.who],wrong?{x:14,y:10}:{x:3,y:5});
  if(kind==='songside'){
   // Avoid choosing the singer as the controlled role in this unrelated-role fixture.
   S.opts.role=S.supp.pillar;
   for(const p of S.ents)Object.assign(p,{x:0,y:-8});
   Object.assign(S.ents[event.who],{x:0,y:4});Object.assign(S.ents[event.tank],wrong?{x:4,y:4}:{x:(event.source.x)/2,y:(event.source.y+4)/2});
  }
  step(.002);assert(!S.dead,`${kind} misplaced NPC ${wrong}: ${S.reason}`);if(wrong)assert(S.npcFaults.length);
 }
});
test('Ultima NPC fetter diagnostics retain the distance grace without player failure',()=>{
 start('ultima',644,2);S.events=[];Object.assign(S.ents[1],{x:-15,y:0});Object.assign(S.ents[4],{x:15,y:0});
 advance(644.8);assert(!S.dead);assert(S.npcFaults.some(f=>/炎獄之鎖/.test(f.reason)));
});
test('Aetheroplasm stack follows its marked actor, not an unrelated four-player cluster',()=>{
 for(const time of [593.329,829.863])for(const away of [false,true]){
  const event=timeline.build('ultima',0).find(e=>e.kind==='stack'&&e.t===time);
  assert(Number.isInteger(event.who),'Aetheroplasm needs an assigned debuff recipient');
  start('ultima',time-.001,(event.who+1)%8);S.events=S.events.filter(e=>e.t===time&&e.kind==='stack');
  for(const p of S.ents)Object.assign(p,{x:0,y:4});
  if(away)Object.assign(S.ents[event.who],{x:12,y:-8});
  step(.002);assert.equal(S.dead,away,`target ${event.who}, misplaced ${away}`);
 }
});
test('roulette marks three unique reproducible live party targets, one per later explosion',()=>{
 const seen=new Set();
 for(let seed=0;seed<8;seed++){
  const events=timeline.build('ultima',seed),mark=events.find(e=>e.kind==='mark'&&e.t>800),stacks=events.filter(e=>e.kind==='stack'&&e.t>800);
  assert.equal(mark.targets?.length,3);assert.equal(new Set(mark.targets).size,3);assert.deepEqual(stacks.map(e=>e.who),mark.targets);
  mark.targets.forEach(i=>seen.add(i));assert.deepEqual(timeline.build('ultima',seed).find(e=>e.kind==='mark'&&e.t>800).targets,mark.targets);
 }
 assert.equal(seen.size,8);
});
test('Garuda Great Whirlwind locks the intercepted tank positions and kills at its game-data radius',()=>{
 for(const sourceTime of [10.216,99.244]){
  start('garuda',sourceTime-.001,4);S.opts.god=true;
  S.events=S.events.filter(e=>['song','sisters','whirl'].includes(e.kind));
  const tanks=sourceTime<20?[1]:[0,1];for(const i of tanks)Object.assign(S.ents[i],{x:i?11:-11,y:0});
  step(.002);const locked=tanks.map(i=>({...S.ents[i]}));
  for(const event of S.events.filter(e=>e.kind==='whirl'&&e.t>sourceTime&&e.t<(sourceTime<20?30:106))){
   const hazards=sim.shapes(event);assert.equal(hazards.length,tanks.length);for(let i=0;i<tanks.length;i++){assert.equal(hazards[i].r,8);assert(Math.hypot(hazards[i].c.x-locked[i].x,hazards[i].c.y-locked[i].y)<.001);}
  }
 }
 for(const contact of ['player','npc','outside']){
  start('garuda',16.312,4);S.events=S.events.filter(e=>e.kind==='whirl'&&e.t===16.313);const h=sim.shapes(S.events[0])[0];assert(h);
  for(const p of S.ents)Object.assign(p,{x:-10,y:-10});if(contact!=='outside')Object.assign(S.ents[contact==='player'?4:0],h.c);
  step(.002);assert.equal(S.dead,contact==='player',contact);if(contact==='npc')assert(S.npcFaults.length);
 }
});
test('Garuda NPCs cannot receive assigned mechanics or cleanse Thermal Low from arbitrary positions',()=>{
 for(const kind of ['cyclone','friction','tethers']){
  const event=timeline.build('garuda',0).find(e=>e.kind===kind),npc=kind==='cyclone'?1:kind==='tethers'?0:6;
  start('garuda',event.t-.001,2);S.events=S.events.filter(e=>e.kind===kind&&e.t===event.t&&(kind!=='songside'||e.tank===event.tank));
  Object.assign(S.ents[npc],{x:18,y:0});step(.002);assert(!S.dead,`${kind}: bad NPC position must not fail controlled player`);assert(S.npcFaults.length);
 }
 start('garuda',61.100,2);S.events=[];Object.assign(S.ents[5],{x:15,y:0});step(.002);assert(!S.dead);assert(S.npcFaults.some(f=>/低氣壓/.test(f.reason)));
});
test('Garuda tank responsibilities are checked when both tanks are NPCs',()=>{
 for(const kind of ['song','sisters','buster']){
  const event=timeline.build('garuda',0).find(e=>e.kind===kind);start('garuda',event.t-.001,4);S.events=S.events.filter(e=>e.kind===kind&&e.t===event.t&&(kind!=='songside'||e.tank===event.tank));
  if(kind==='song')Object.assign(S.ents[1],{x:-15,y:-8});
  if(kind==='sisters')Object.assign(S.ents[0],{x:-15,y:-8});
  if(kind==='buster')Object.assign(S.ents[2],S.ents[0],{i:2});
  step(.002);assert(!S.dead,kind+' NPC duty must not blame player');assert(S.npcFaults.length);
 }
});
test('MT Aetheroplasm application rejects nearby NPCs and players within the sourced two-meter splash',()=>{
 for(const contact of ['safe','player','npc']){
  start('ultima',582.164,4);S.events=S.events.filter(e=>e.kind==='mark'&&e.t===582.165);
  for(const p of S.ents)Object.assign(p,{x:0,y:4});Object.assign(S.ents[0],{x:0,y:-8});
  if(contact!=='safe')Object.assign(S.ents[contact==='player'?4:2],{x:0,y:-7});step(.002);
  assert.equal(S.dead,contact==='player',contact);
 }
});
test('live Titan Landslides have five forward six-meter lanes and five interleaved aftershocks',()=>{
 start('ultima',648,4,0);const first=S.events.find(e=>e.kind==='slide'&&e.bait),next=S.events.find(e=>e.repeatOf===first.t);
 const shapes=sim.shapes(first),after=sim.shapes(next);assert.equal(shapes.length,5);assert.equal(after.length,5);
 assert.equal(shapes[0].length,44.55);assert.equal(shapes[0].back,4.55);
 for(const sh of [...shapes.slice(1),...after]){assert.equal(sh.half,3);assert.equal(sh.length,40.5);assert.equal(sh.back,.5);}
 assert.deepEqual(shapes.map(s=>s.deg-first.lockedAngle),[0,45,-45,135,-135]);
 assert.deepEqual(after.map(s=>Math.round((s.deg-first.lockedAngle)*1000)/1000),[22.5,-22.5,90,-90,180]);
 const center=shapes[0],d=center.deg*Math.PI/180;
 assert(!contains(center,{x:center.c.x-Math.sin(d)*8,y:center.c.y+Math.cos(d)*8}),'no infinite strip behind the caster');
});
test('roulette has both eighteen-meter cardinal Crimson Cyclones with safe intercardinal corners',()=>{
 for(let seed=0;seed<3;seed++){
  start('ultima',816,4,seed);const event=S.events.find(e=>e.name==='深紅旋風');const shapes=sim.shapes(event);assert.equal(shapes.length,2);
  for(const sh of shapes)assert.equal(sh.half,9);
  for(const p of [{x:15,y:0},{x:-15,y:0},{x:0,y:15},{x:0,y:-15}])assert(shapes.some(h=>contains(h,p)));
  for(const x of [-12,12])for(const y of [-12,12])assert(shapes.every(h=>!contains(h,{x,y})));
 }
});
test('Suppression includes both Great Whirlwinds at the raw cast deadline and live intercept points',()=>{
 start('ultima',753,4);const whirl=S.events.find(e=>e.kind==='whirl');assert(whirl);assert.equal(whirl.t,756.836);
 S.whirlOrigins.suppression=[{x:-10,y:2},{x:10,y:-2}];const hazards=sim.shapes(whirl);assert.equal(hazards.length,2);
 assert.deepEqual(hazards.map(h=>h.c),S.whirlOrigins.suppression);assert(hazards.every(h=>h.r===8));
});
test('NPC three-stack cleanse remains diagnostic instead of wiping solo practice',()=>{
 start('garuda',60,4);S.events=[];S.stacks[6]=3;Object.assign(S.ents[6],{x:-7.88,y:-.23});step(.001);
 assert(!S.dead);assert(S.npcFaults.some(f=>/三層/.test(f.reason)));
});
test('six Ultima bombs have paired observed landings and delayed radius-five explosions',()=>{
 const events=timeline.build('ultima',0),lands=events.filter(e=>e.kind==='bombLand'),booms=events.filter(e=>e.kind==='bomb');
 assert.equal(lands.length,6);assert.equal(booms.length,6);
 const points=[[-6,0],[-3,-5],[3,-5],[6,0],[3,5],[-3,5]];
 for(let i=0;i<6;i++){assert.deepEqual(lands[i].center,{x:points[i][0],y:points[i][1]});assert.deepEqual(booms[i].center,lands[i].center);assert(booms[i].t-lands[i].t>5.5);assert.equal(sim.shapes(lands[i])[0].r,4.3);assert.equal(sim.shapes(booms[i])[0].r,6.3);}
});
test('Suppression singers resolve together from the two observed diagonal sister positions',()=>{
 const songs=timeline.build('ultima',0).filter(e=>e.kind==='songside');assert(songs.every(e=>e.t===750.749));
 assert.deepEqual(songs.map(e=>e.source),[{x:-6,y:-6},{x:5.97,y:5.97}]);
});
test('observation contact is explicitly logged as observation judgment without normal-mode immunity',()=>{
 for(const god of [true,false]){
  start('ultima',663.573,4);S.opts.god=god;S.events=S.events.filter(e=>e.kind==='wheel'&&e.t===663.574);
  for(const p of S.ents)Object.assign(p,{x:0,y:-18});Object.assign(S.ents[4],{x:15,y:0});step(.002);
  assert.equal(S.dead,!god);assert(S.log.some(x=>x.startsWith(god?'觀摩判定':'失誤')));
 }
});
test('Ultima has its own three independently baited forward Landslides alongside Titan',()=>{
 start('ultima',648,4,0);const events=S.events.filter(e=>e.ultima);
 assert.equal(events.length,2);assert.equal(events[0].t,651.2);assert.equal(events[1].t,651.29);
 const shapes=events.flatMap(e=>sim.shapes(e));assert.equal(shapes.length,4);assert.equal(new Set(shapes.map(h=>Math.round(h.deg*1000))).size,3);assert(shapes.every(h=>h.half===3&&h.length>=40));
});
test('Aetheroplasm indicators expire with their own explosion and do not persist to a later mark',()=>{
 start('ultima',584,4);assert(sim.sceneGuides().some(g=>g.color==='#ffbc55'));
 start('ultima',594,4);assert(!sim.sceneGuides().some(g=>g.color==='#ffbc55'));
 start('ultima',660,4);assert(sim.sceneGuides().some(g=>g.color==='#ffbc55'));
});
test('NPC stack assignments follow a moving controlled marked recipient at normal speed',()=>{
 start('ultima',590.4,0);S.events=S.events.filter(e=>e.kind==='stack'&&e.t===593.329);Object.assign(S.ents[0],{x:7,y:2});
 for(const p of S.ents)if(p.i!==0)Object.assign(p,{x:0,y:4});
 advance(593.34);assert.equal(S.dead,false,S.reason);assert(S.ents.filter(p=>Math.hypot(p.x-7,p.y-2)<=4).length>=4);
});
test('Searing Wind staging stays inside Eye of Storm while separating the southeast orb soaker',()=>{
 start('ultima',707,2,2);const pulse=S.events.find(e=>e.kind==='pulse'),eye=S.events.find(e=>e.kind==='eye'),orb=S.events.find(e=>e.kind==='orb'),p=sim.goal(pulse,3);
 assert(!sim.shapes(eye).some(h=>contains(h,p)));assert(Math.hypot(p.x-6,p.y-3)>8);assert(pulse&&orb);
});
test('Feather Rain selects five live targets and Ultima Weight selects four, matching raw helper counts',()=>{
 for(const phase of ['garuda','ultima'])for(let seed=0;seed<8;seed++){
  start(phase,phase==='garuda'?0:536.112,4,seed);
  for(const e of S.events.filter(e=>e.kind==='bait')){
   const count=e.name==='大地之重'?4:5;assert.equal(e.targets?.length,count);assert.equal(new Set(e.targets).size,count);
   const chosen=e.targets[0];Object.assign(S.ents[chosen],{x:11,y:-7});const shapes=sim.shapes(e);assert.equal(shapes.length,count);assert(shapes.some(h=>h.c.i===chosen&&h.c.x===11&&h.c.y===-7));
  }
 }
});
test('post-Predation sister Wheels hit both flank casters while leaving the actual center safe',()=>{
 for(const x of [-15,0,15]){
  start('ultima',663.573,4);S.events=S.events.filter(e=>e.kind==='wheel'&&e.t===663.574);
  for(const p of S.ents)Object.assign(p,{x:0,y:-18});Object.assign(S.ents[4],{x,y:0});step(.002);
  assert.equal(S.dead,x!==0,`x=${x}`);
 }
});
test('any NPC touching a Boom orb resolves immediately and cannot bypass the four-player requirement',()=>{
 for(const orbIndex of [0,1]){
  start('ultima',796,4);S.events=S.events.filter(e=>e.kind==='grouporb'&&e.orb===orbIndex);
  for(const p of S.ents)Object.assign(p,{x:orbIndex?-12:12,y:0});const e=S.events[0],ball=sim.sceneGuides().find(g=>g.type==='ring'&&g.color===(orbIndex?'#bd9afb':'#ffc85d'));
  assert(ball);Object.assign(S.ents[orbIndex?1:0],ball.pos);step(.001);assert(!S.dead,'NPC early contact must not blame player');assert(e.done);assert(S.npcFaults.some(f=>/四名/.test(f.reason)));assert.equal(S.orbEffects.at(-1).outcome,'failed');
 }
});
test('Aetherochemical Laser uses the observed source, dimensions and three recorded variant sequences',()=>{
 const sequences=[['right','right','left'],['center','left','right'],['center','center','left']];
 for(let seed=0;seed<3;seed++){
  start('ultima',757,4,seed);const lasers=S.events.filter(e=>e.kind==='aetherLaser');assert.deepEqual(lasers.map(e=>e.direction),sequences[seed]);
  for(const e of lasers){const [shape]=sim.shapes(e);assert.deepEqual(shape.c,{x:13.7,y:-13.7});assert.equal(shape.length,46);assert.equal(shape.half,4);assert.equal(e.geometryProvenance,'diagram-reconstructed');assert.equal(shape.deg,{right:270,center:225,left:180}[e.direction]);}
 }
});
test('observed bomb variants change the starting slot without rotating the six physical positions',()=>{
 const baseline=timeline.build('ultima',0).filter(e=>e.kind==='bombLand').map(e=>e.center),alternate=timeline.build('ultima',1).filter(e=>e.kind==='bombLand').map(e=>e.center);
 assert.deepEqual(alternate,[baseline[5],...baseline.slice(0,5)]);
});
test('live Titan baits lock at the observed begin-cast times, not an invented three-second tell',()=>{
 const starts=[[650.621,648.434],[704.884,702.701],[765.378,763.200]];
 for(const [hit,begins] of starts){const event=timeline.build('ultima',0).find(e=>e.kind==='slide'&&e.t===hit);assert(Math.abs(event.t-event.lead-begins)<.00001);}
});

test('Suppression Mistral Song has the actual cast clock, live locked aim and 150-degree cone',()=>{
 const scheduled=timeline.build('ultima',0).find(e=>e.kind==='suppCone');assert(scheduled,'missing Action 11150');
 assert.equal(scheduled.t,752.927);assert(Math.abs(scheduled.t-scheduled.lead-750.925)<1e-8);
 for(const point of [{x:10,y:0},{x:0,y:10}]){
  start('ultima',750.9,scheduled.who);S.events=S.events.filter(e=>e.kind==='suppCone');
  Object.assign(S.ents[scheduled.who],point);advance(750.93);const e=S.events[0],h=e.hazards[0];
  assert.deepEqual(h.from(),{x:-13.7,y:-13.7});assert.deepEqual({x:h.to().x,y:h.to().y},point);assert.equal(h.len,21.7);assert.equal(h.half,75*Math.PI/180);
  Object.assign(S.ents[scheduled.who],{x:-10,y:-10});advance(751);assert.deepEqual({x:h.to().x,y:h.to().y},point,'locked cone must not follow subsequent movement');
  assert.deepEqual(sim.sceneActors(S.t).find(a=>a.kind==='garuda'&&a.tag==='迦樓羅').look,h.to());
  const a=Math.atan2(point.y+13.7,point.x+13.7),p=(r,off)=>({x:-13.7+r*Math.cos(a+off),y:-13.7+r*Math.sin(a+off)});
  assert(contains(h,p(21.69,0)));assert(!contains(h,p(21.71,0)));assert(contains(h,p(8,74.9*Math.PI/180)));assert(!contains(h,p(8,75.1*Math.PI/180)));
 }
});

test('generic ground attacks use game ranges and raw three-second cast snapshots',()=>{
 start('ultima',629);const events=S.events;
 for(const e of events.filter(e=>e.kind==='eruption'))assert(sim.shapes(e).every(h=>h.r===8),'Eruption radius8');
 for(const e of events.filter(e=>e.kind==='bait'&&e.name==='大地之重'))assert.equal(e.r,6,'Weight radius6');
 for(const [kind,t,beg] of [['eruption',636.058,633.072],['eruption',747.638,744.66],['eruption',848.459,845.479],['bait',689.739,686.764],['bait',826.215,823.235]]){
  const e=events.find(e=>e.kind===kind&&e.t===t);assert(Math.abs(e.t-e.lead-beg)<1e-8,`${kind} ${t} true cast start`);
 }
});
test('Searing Wind hits every other actor inside14m and spares actors beyond14m',()=>{
 for(const hit of [true,false])for(const controlled of [true,false]){
  start('ultima',701.806,4);S.events=S.events.filter(e=>e.kind==='pulse'&&e.t===701.807);
  for(const p of S.ents)Object.assign(p,{x:-10,y:0});Object.assign(S.ents[3],{x:10,y:0});
  Object.assign(S.ents[controlled?4:0],{x:10-(hit?13.9:14.1),y:0});step(.002);assert.equal(S.dead,hit&&controlled);if(hit&&!controlled)assert(S.npcFaults.length);
 }
});

test('Garuda and bomb footprints include documented caster hitboxes and Boom moves ten metres',()=>{
 start('garuda',0);const cone=sim.shapes(S.events.find(e=>e.kind==='cone'))[0];assert.equal(cone.len,11.7);assert.equal(cone.half,Math.PI/4);
 const eye=sim.shapes(S.events.find(e=>e.kind==='eye'))[0];assert.equal(eye.inner,12);assert.equal(eye.r,25);
 assert.equal(sim.shapes(S.events.find(e=>e.kind==='burst'))[0].r,6.5);
 start('ultima',644);assert.equal(sim.shapes(S.events.find(e=>e.kind==='bombLand'))[0].r,4.3);assert.equal(sim.shapes(S.events.find(e=>e.kind==='bomb'))[0].r,6.3);
 start('ultima',795.799,4);S.events=S.events.filter(e=>e.kind==='boom');for(const p of S.ents)Object.assign(p,{x:p.i%2?1:-1,y:0});step(.002);assert.equal(S.ents[4].x,-11);
});

test('solo orb explosion hits collateral beyond contact radius and fusion soak uses eight-metre blast',()=>{
 start('ultima',694.186,4);S.events=S.events.filter(e=>e.kind==='orb'&&e.t===694.187);const orb=S.events[0],c=sim.goal(orb,0);
 for(const p of S.ents)Object.assign(p,{x:-10,y:-5});Object.assign(S.ents[0],c);Object.assign(S.ents[4],{x:c.x-5.9,y:c.y});step(.002);assert(S.dead,'six-metre blast must hit a player outside trigger3');
 start('ultima',796,4);S.events=S.events.filter(e=>e.kind==='grouporb'&&e.orb===0);const e=S.events[0];
 // Contact center is read from the same visible moving physical orb.
 const pair=sim.sceneGuides().filter(x=>x.type==='ring'&&x.color==='#ffc85d');
 assert(pair.length>=2);const point=pair[0].pos;
 for(const p of S.ents)Object.assign(p,p.i%2?{x:12,y:-5}:{x:point.x,y:point.y+6});Object.assign(S.ents[4],point);step(.001);assert(!S.dead,'all four within actual8m explosion can share');assert(e.done);
});

test('Downburst uses the current boss-facing cone and only its tank may receive the cleave',()=>{
 for(const victim of [4,1])for(const hit of [true,false]){
  start('garuda',26.485,4);S.events=S.events.filter(e=>e.kind==='buster'&&e.t===26.486);const e=S.events[0],h=sim.shapes(e)[0];assert(h,'Downburst needs a real cone');
  const c=h.from(),direction={x:-c.x,y:-c.y},d=Math.hypot(direction.x,direction.y)||1,u={x:direction.x/d,y:direction.y/d};
  for(const p of S.ents)Object.assign(p,{x:c.x-u.x*2,y:c.y-u.y*2});
  Object.assign(S.ents[0],{x:c.x+u.x,y:c.y+u.y});Object.assign(S.ents[victim],{x:c.x+u.x*(hit?10:-1),y:c.y+u.y*(hit?10:-1)});
  // Isolated area resolution; thermal packet application is separate coverage.
  S.thermalIndex=timeline.thermalUpdates.length;step(.002);assert.equal(S.dead,hit&&victim===4,`${victim}/${hit}: ${S.reason}`);if(hit&&victim!==4)assert(S.npcFaults.length);
 }
});

test('released NPC Feather Rain contact is diagnostic; delayed release remains safe',()=>{
 for(const late of [true,false]){
  start('ultima',755.1,0,0);const prisoner=S.supp.gaol;S.gaol={x:3,y:5};for(const p of S.ents)Object.assign(p,{x:7,y:5});Object.assign(S.ents[prisoner],S.gaol);
  S.events=S.events.filter(e=>e.kind==='bait'&&e.t===755.326);S.events[0].targets=[prisoner];step(.001);
  if(late)useSkill('attack');advance(755.33);
  assert.equal(S.dead,false,'NPC collision alone is not player responsibility');
  if(late)assert(S.npcFaults.length);else{useSkill('attack');assert.equal(S.gaol,null);}
 }
});

test('outer rings fail player contact and record NPC contact, with safe points beyond',()=>{
 for(const [phase,kind,r] of [['ultima','eruption',8],['ultima','bait',6],['ultima','bombLand',4.3],['ultima','bomb',6.3],['garuda','burst',6.5]])for(const victim of ['player','npc','outside']){
  const scheduled=timeline.build(phase,0).find(e=>e.kind===kind&&(kind!=='bait'||e.name==='大地之重'));
  start(phase,scheduled.t-.001,4);S.events=S.events.filter(e=>e.kind===kind&&e.t===scheduled.t);const e=S.events[0],h=sim.shapes(e)[0];assert.equal(h.r,r);e.hazards=[h];
  const candidates=Array.from({length:72},(_,i)=>({x:h.c.x+Math.cos(i*Math.PI/36)*(r+.1),y:h.c.y+Math.sin(i*Math.PI/36)*(r+.1)}));
  const safe=candidates.find(p=>Math.hypot(p.x,p.y)<19.4);assert(safe);const factor=(r-.1)/(r+.1),inside={x:h.c.x+(safe.x-h.c.x)*factor,y:h.c.y+(safe.y-h.c.y)*factor};
  for(const p of S.ents)Object.assign(p,safe);if(victim!=='outside')Object.assign(S.ents[victim==='player'?4:0],inside);
  S.thermalIndex=timeline.thermalUpdates.length;step(.002);assert.equal(S.dead,victim==='player',`${phase}/${kind}/${victim}: ${S.reason}`);if(victim==='npc')assert(S.npcFaults.length);
 }
});
