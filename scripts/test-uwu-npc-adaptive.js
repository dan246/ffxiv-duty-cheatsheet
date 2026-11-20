const {test}=require('node:test'),assert=require('node:assert/strict');
const planner=require('../sim/uwu-npc-motion');
test('NPC dodges a newly baited line before impact and returns without teleporting',()=>{
 const e={x:5,y:0};let maxStep=0;
 for(let n=0;n<220;n++){const time=n*.02, before={...e};const hazards=time<=2?[{t1:2,hit:p=>p.x>=0&&Math.abs(p.y)<2}]:[];
 planner.move(e,{x:5,y:0},.02,{time,radius:16,speed:6,hazards});maxStep=Math.max(maxStep,Math.hypot(e.x-before.x,e.y-before.y));if(n===99)assert(Math.abs(e.y)>=2,'must be outside line at impact');}
 assert(maxStep<=.120001);assert(Math.hypot(e.x-5,e.y)<.15,'returns to route');
});
test('NPC respects overlapping hazards and arena boundary',()=>{
 const e={x:14,y:0},hazards=[{t1:2,hit:p=>Math.abs(p.y)<2},{t1:2,hit:p=>p.y>0}];
 for(let n=0;n<100;n++){planner.move(e,{x:14,y:0},.02,{time:n*.02,radius:16,speed:6,hazards});assert(Math.hypot(e.x,e.y)<16);}
 assert(e.y<=-2);
});
test('safe route has no additional chase delay',()=>{const e={x:0,y:0};planner.move(e,{x:.1,y:0},.02,{time:0,radius:20,speed:6,hazards:[]});assert.equal(e.x,.1);});
for(const phase of ['garuda','ifrit','titan'])test(`${phase}: live engine NPC leaves a danger area even when source route stays inside`,()=>{
 const ref=require('../sim/uwu-reference');globalThis.UWU_REFERENCE=ref;
 const sim=require('../sim/uwu'+(phase==='garuda'?'':'-'+phase)),S=sim.S;
 Object.assign(S.opts,{role:4,god:true,preset:'reference',start:0});if(phase==='garuda')sim.reset('garuda',0,50);else sim.reset();S.events=[];
 const e=S.ents[2],c={x:e.x,y:e.y};const hit=p=>Math.hypot(p.x-c.x,p.y-c.y)<2;
 S.aoes=[{t0:S.t,t1:S.t+1.5,shape:{type:'circle',c,r:2},hit,onHit(){},done:false,linger:0}];
 // Keep the intended route stationary to prove movement comes from the hazard.
 const track=ref[phase].paths.H1,copy=track.map(p=>p.slice());for(const p of track){p[1]=c.x;p[2]=c.y;}
 try{for(let n=0;n<74;n++)sim.step(.02);assert(!hit(e),'NPC must react before the snapshot');assert(e.avoidGoal);}finally{track.splice(0,track.length,...copy);delete globalThis.UWU_REFERENCE;}
});
test('Titan Weight creates the logged four puddles rather than adding a circle to every party member',()=>{
 globalThis.UWU_REFERENCE=require('../sim/uwu-reference');const sim=require('../sim/uwu-titan');Object.assign(sim.S.opts,{role:4,god:true,preset:'reference',start:318-300.72});sim.reset();while(sim.S.t<319.57-300.72)sim.step(.01);
 const circles=sim.S.aoes.filter(a=>Math.abs(a.t1+300.72-322.554)<.001);assert.equal(circles.length,4);
});
test('Titan complete seed-0 rehearsal has no unintended live NPC hits at actual snapshots',()=>{
 const ref=require('../sim/uwu-reference');globalThis.UWU_REFERENCE=ref;const sim=require('../sim/uwu-titan'),S=sim.S;
 Object.assign(S.opts,{role:4,god:true,preset:'reference',randomJumps:false,seed:0,start:-4,full:true});sim.reset();
 const unexpected=[];let snapshots=0,checks=0;
 try{
  while(!S.over&&S.t<150){
   const done=new Set(S.aoes.filter(a=>a.done));sim.step(.005);
   for(const a of S.aoes.filter(a=>a.done&&!done.has(a)&&typeof a.hit==='function')){
    snapshots++;
    for(const e of S.ents){
     if(e.i===S.opts.role||e.dead||S.jailed[e.i]||S.freed[e.i]>S.t||(a.skip||[]).includes(e.i))continue;
     // Only the explicitly designated second Weight sacrifice is intentional.
     if(a.plannedWeight&&[1,4,5,6].includes(e.i))continue;
     checks++;if(a.hit(e))unexpected.push({t:a.t1+300.72,role:e.i,shape:a.shape?.type});
    }
   }
  }
  assert(snapshots>50);assert(checks>100);assert.deepEqual(unexpected,[]);
 }finally{delete globalThis.UWU_REFERENCE;}
});
test('a live NPC bomb routing defect is recorded without failing normal practice',()=>{
 globalThis.UWU_REFERENCE=require('../sim/uwu-reference');const sim=require('../sim/uwu-titan'),S=sim.S;
 try{
  Object.assign(S.opts,{role:4,god:true,preset:'reference',randomJumps:false,seed:0,start:27});sim.reset();
  while(S.t<336.22-300.72)sim.step(.005);
  const bomb=S.aoes.find(a=>Math.abs(a.t1+300.72-336.230)<.001);assert(bomb);
  Object.assign(S.ents[2],{x:bomb.shape.c.x,y:bomb.shape.c.y});S.opts.god=false;
  while(S.t<336.235-300.72&&!S.over)sim.step(.005);
  assert(!S.ents[2].dead);assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===2));
 }finally{delete globalThis.UWU_REFERENCE;}
});
test('a later hazard cannot pull an NPC back into an earlier unresolved puddle',()=>{
 const actor={x:6,y:0,avoidGoal:{x:6,y:0}},intent={x:0,y:0};
 const early={t1:1,hit:p=>Math.hypot(p.x,p.y)<5},later={t1:3,hit:p=>p.x>4};
 for(let time=.8;time<=3.01;time+=.01){const hazards=[early,later].filter(h=>h.t1>=time-.00001);planner.move(actor,intent,.01,{time,radius:20,speed:6,hazards});if(time<=1.00001)assert(!early.hit(actor),'must hold outside the earlier puddle');}
 assert(!later.hit(actor),'must leave the later line before its snapshot');
});
test('a previously safe but distant avoidance goal is reconsidered for a new short deadline',()=>{
 const actor={x:0,y:0,avoidGoal:{x:0,y:15}},hazard={t1:.5,hit:p=>Math.abs(p.x)<2&&p.y<10};
 for(let n=0;n<25;n++)planner.move(actor,{x:0,y:0},.02,{time:n*.02,radius:20,speed:6,hazards:[hazard]});
 assert(!hazard.hit(actor),'must choose nearby side exit instead of an unreachable old goal');
});
