'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan');
const planner=require('../sim/uwu-npc-motion');
const reference=require('../sim/uwu-reference');
const {S,CFG,ROLES,DIE,REFERENCE_ORIGIN:origin}=sim;
function run(role,seed,dt=.02){
 globalThis.UWU_REFERENCE=reference;Object.assign(S.opts,{preset:'reference',role,seed,start:-4,god:false,randomJumps:true});sim.reset();
 let steering={...S.ents[role]},walked=0,sacrificed=false,revived=false,knocked=false;
 const route=t=>{
  // Do not use future rotated samples to reveal a jump before its true facing
  // is visible (the first 450ms may deliberately show a feint).
  for(const j of S.jumps)if(S.t<j.cue+.45&&t>=j.cue+.45)t=j.cue+.45-.001;
  const p=sim.npcReferencePosition(ROLES[role],t)||sim.practicePosition(ROLES[role],t)||sim.home(role,t),radius=sim.arenaAt(t).radius-.5,d=Math.hypot(p.x,p.y);
  return d>radius?{x:p.x*radius/d,y:p.y*radius/d}:p;
 };
 while(!S.over&&S.t<150){
  const p=S.ents[role],wasDead=p.dead;
  if(role===0&&S.t>=1&&S.cd.provoke===-Infinity)sim.useSkill('provoke');
  const jump=S.jumps.find(j=>S.t>=j.cue+.45&&S.t<j.land+.02);
  if(jump&&role!==7&&S.cd.sprint<=S.t)sim.useSkill('sprint');
  if(role===7&&S.t>=41.2&&S.t<42&&S.cd.sprint<=S.t)sim.useSkill('sprint');
  if(S.t>=124.8&&S.cd.sprint<=S.t)sim.useSkill('sprint');
  const hazards=S.aoes.filter(a=>!a.done&&a.t0<=S.t&&!(a.skip||[]).includes(role)&&!(a.plannedWeight&&DIE.includes(role)))
   .flatMap(a=>[a.hit,...(a.plannerHit?[a.plannerHit]:[])].map(hit=>({t1:Math.max(S.t,a.t1),hit:(p,m=0)=>hit(p,m)})));
  let intent=route(S.t);
  if(S.aoes.some(a=>!a.done&&a.shape?.type==='cone'&&a.skip?.includes(role)))intent={x:p.x,y:p.y};
  if(!DIE.includes(role)&&S.t>=339.265-origin-1.5&&S.t<339.265-origin)intent=sim.practicePosition(ROLES[role],339.265-origin);
  if(jump){const look=sim.bossLook(Math.min(S.t,jump.launch-.001)),d=Math.hypot(look.x,look.y);intent={x:-look.x/d*(jump.index===0?15:11),y:-look.y/d*(jump.index===0?15:11)};}
  const prison=reference.titan.gaolStates.find(e=>e.active&&e.role===ROLES[role]&&e.time-origin>S.t&&e.time-origin-S.t<3.5);
  if(prison){
   if(prison.time<360){intent=route(S.t);delete steering.avoidGoal;}
   else {const anchor=sim.practicePosition(ROLES[role],prison.time-origin);hazards.push({t1:prison.time-origin,hit:p=>Math.hypot(p.x-anchor.x,p.y-anchor.y)>.2});}
  }
  const planned=S.aoes.filter(a=>a.plannedWeight&&!a.done);
  if(DIE.includes(role)&&planned.length&&!p.dead){const a=planned.sort((a,b)=>Math.hypot(a.shape.c.x-p.x,a.shape.c.y-p.y)-Math.hypot(b.shape.c.x-p.x,b.shape.c.y-p.y))[0];intent=a.shape.c;}
  Object.assign(steering,{x:p.x,y:p.y});
  planner.move(steering,intent,dt,{time:S.t,radius:sim.arenaSupportRadius(),speed:CFG.speed*(S.buff.sprint>S.t?1.3:1),future:jump?()=>intent:route,hazards});
  const dx=steering.x-p.x,dy=steering.y-p.y,distance=Math.hypot(dx,dy);S.keys.KeyW=distance>.001&&!p.dead&&!S.jailed[role]&&S.t>=S.stun;if(S.keys.KeyW)S.cam=Math.atan2(dx,-dy);
  // Release W when the steering point is reached, instead of overshooting it
  // by a full frame and oscillating over the boundary of a telegraph.
  const frame=S.keys.KeyW?Math.min(dt,distance/(CFG.speed*(S.buff.sprint>S.t?1.3:1))):dt;
  const before={x:p.x,y:p.y},time=S.t,limit=CFG.speed*(S.buff.sprint>S.t+frame?1.3:1)*frame;
  sim.step(frame);const moved=Math.hypot(p.x-before.x,p.y-before.y);
  const knock=time<339.265-origin&&S.t>=339.265-origin&&!wasDead;
  const raise=wasDead&&!p.dead;
  if(knock){knocked=true;assert(Math.abs(moved-CFG.kb)<.001,'engine supplies the real 24m knockback');}
  else if(!raise)assert(moved<=limit+1e-7,`${ROLES[role]} seed ${seed}: unexplained movement ${moved} at ${S.t}`);
  if(p.dead&&p.plannedDeath)sacrificed=true;if(raise)revived=true;if(!knock&&!raise)walked+=moved;
 }
 return {over:S.over,role:ROLES[role],seed,g2:S.g2,g3:S.g3,t:S.t,walked,sacrificed,revived,knocked,position:{x:S.ents[role].x,y:S.ents[role].y},gaols:S.gaols.map(g=>({who:ROLES[g.who],pos:g.pos,broken:g.broken}))};
}
for(let seed=0;seed<16;seed++)for(let role=0;role<8;role++)test(`${ROLES[role]} Titan seed ${seed} reaches record end using only keyboard movement and skills`,()=>{
 const result=run(role,seed);assert.equal(result.over?.recordEnd,true,JSON.stringify(result));assert.equal(S.opts.god,false);assert(result.walked>5);
 if(DIE.includes(role)){assert(result.sacrificed,'assigned second Weight death actually happens');assert(result.revived,'assigned player returns through the raise event');}else assert(result.knocked,'living player takes the real knockback');
});
test('the keyboard matrix seeds cover all four landing directions and both feint states',()=>{
 const second=new Set(),third=new Set(),feints=new Set();
 for(let seed=0;seed<16;seed++){globalThis.UWU_REFERENCE=reference;Object.assign(S.opts,{preset:'reference',start:-4,seed,randomJumps:true,god:false});sim.reset();second.add(S.g2);third.add(S.g3);for(const j of S.jumps)feints.add(j.feint);}
 assert.deepEqual([...second].sort(),[0,1,2,3]);assert.deepEqual([...third].sort(),[0,1,2,3]);assert.deepEqual([...feints].sort(),[false,true]);
});
