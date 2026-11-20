'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const motion=require('../sim/uwu-npc-motion');
const reference=require('../sim/uwu-reference');
test('source Sprint increases speed only during its observed buff lifetime',()=>{
 const replay=reference.titan;
 assert.equal(motion.observedSprintSpeed('D4',342.621,replay),6);
 assert(Math.abs(motion.observedSprintSpeed('D4',342.622,replay)-7.8)<1e-9);
 assert.equal(motion.observedSprintSpeed('D4',352.601,replay),6);
 assert.equal(motion.observedSprintSpeed('D1',345,replay),6);
 assert.equal(motion.observedSprintSpeed('D4',345,{}),6);
});

test('a stale source-coordinate jump cannot teleport an ordinary walking NPC',()=>{
 const actor={x:0,y:0};
 motion.move(actor,{x:12,y:0},.02,{time:1,radius:20,speed:6});
 assert(Math.hypot(actor.x,actor.y)<=.120000001);
});
test('a feasible six-meter-per-second reference track has no extra chase delay',()=>{
 const actor={x:0,y:0};
 for(let frame=1;frame<=100;frame++){
  const t=frame*.02,intent={x:t*6,y:0};
  motion.move(actor,intent,.02,{time:t,radius:20,speed:6});
  assert(Math.hypot(actor.x-intent.x,actor.y-intent.y)<1e-8);
 }
});
test('both reactive avoidance and returning to the route retain the walking speed limit',()=>{
 const actor={x:0,y:0};
 for(let frame=1;frame<=100;frame++){
  const t=frame*.02,before={...actor};
  motion.move(actor,{x:10,y:0},.02,{time:t,radius:20,speed:6,future:()=>({x:10,y:0}),hazards:t<1?[{t1:1,hit:p=>p.x>4}]:[]});
  assert(Math.hypot(actor.x-before.x,actor.y-before.y)<=.120000001);
 }
});
test('avoidance checks the reachable position when the future reference lies beyond walking range',()=>{
 const actor={x:0,y:0},hit=p=>p.x>=2&&p.x<=4&&Math.abs(p.y)<1;
 for(let frame=1;frame<=25;frame++)motion.move(actor,{x:10,y:0},.02,{time:frame*.02,radius:20,speed:6,future:()=>({x:10,y:0}),hazards:[{t1:.5,hit}]});
 assert(!hit(actor),'a safe future reference cannot justify crossing a snapshot hazard on the way there');
});
test('Titan source replay never turns stale healer coordinates into sprintless teleports',()=>{
 const sim=require('../sim/uwu-titan'),{S}=sim,previous=globalThis.UWU_REFERENCE;
 globalThis.UWU_REFERENCE=reference;
 try{
  // Observation permits inspecting the whole trajectory independently of hit
  // validation; the normal-mode keyboard suite validates the mechanics.
  Object.assign(S.opts,{preset:'reference',seed:0,start:-4,role:7,god:true,randomJumps:true});sim.reset();
  while(!S.over&&S.t<148){
   const before=S.ents.map(e=>({...e})),t=S.t,dt=.02;sim.step(dt);
   const knock=t<339.265-sim.REFERENCE_ORIGIN&&S.t>=339.265-sim.REFERENCE_ORIGIN;
   for(const e of S.ents){
    const prior=before[e.i];
    if(e.i===S.opts.role||prior.dead||e.dead||knock)continue;
    const speed=Math.max(motion.observedSprintSpeed(sim.ROLES[e.i],t+sim.REFERENCE_ORIGIN,S.replay),motion.observedSprintSpeed(sim.ROLES[e.i],S.t+sim.REFERENCE_ORIGIN,S.replay));
    const moved=Math.hypot(e.x-prior.x,e.y-prior.y);
    assert(moved<=speed*dt+1e-7,`${sim.ROLES[e.i]} moved ${moved}m in ${dt}s at ${S.t}`);
   }
  }
 }finally{if(previous===undefined)delete globalThis.UWU_REFERENCE;else globalThis.UWU_REFERENCE=previous;}
});
