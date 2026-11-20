const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan');const data=require('../sim/uwu-reference');
test('H1 reaches the reference west stack by 359s without teleporting or adding a hold',()=>{
 globalThis.UWU_REFERENCE=data;
 try{
  // West is the observed jump orientation, not an arbitrary randomized seed.
  Object.assign(sim.S.opts,{preset:'reference',randomJumps:false,seed:0,start:352-300.72,role:7,god:true});sim.reset();
  let feasible=0;
  while(sim.S.t<359-300.72){
   const old={...sim.S.ents[2]},dt=.01;sim.step(dt);const p=sim.S.ents[2],absolute=sim.S.t+300.72;
   const sprint=(data.titan.motionEvents||[]).some(e=>e.type==='sprint'&&e.role==='H1'&&absolute>=e.start&&absolute<e.end),budget=(sprint?7.8:6)*dt;
   assert(Math.hypot(p.x-old.x,p.y-old.y)<=budget+1e-7,'stale event-resource samples cannot cause a teleport');
   const target=sim.npcReferencePosition('H1',sim.S.t);
   if(!old.avoidGoal&&!p.avoidGoal&&Math.hypot(target.x-old.x,target.y-old.y)<=budget+1e-9){assert(Math.hypot(p.x-target.x,p.y-target.y)<1e-8);feasible++;}
  }
  assert(sim.S.ents[2].x<-10);assert(feasible>100);
  const target=sim.referencePosition('H1',sim.S.t);assert(Math.hypot(target.x-sim.S.ents[2].x,target.y-sim.S.ents[2].y)<1e-8);
 }finally{delete globalThis.UWU_REFERENCE;}
});
