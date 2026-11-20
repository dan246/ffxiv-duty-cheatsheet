'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fixtures=require('./fixtures/uwu-fight13-position-checks.json');
const data=require('../sim/uwu-reference');globalThis.UWU_REFERENCE=data;
const g=require('../sim/uwu'),f=require('../sim/uwu-ifrit'),t=require('../sim/uwu-titan');
for(const [phase,sim,origin,end]of [['garuda',g,0,152.558],['ifrit',f,152.558,300.72],['titan',t,300.72,430]])test(`${phase}: source position matches independently extracted API cast samples`,()=>{
 if(phase!=='garuda'){Object.assign(sim.S.opts,{preset:'reference',randomJumps:false,start:0,role:4,god:true});sim.reset();}
 const points=fixtures.filter(p=>p.t>=origin&&p.t<end);assert(points.length>100);
 for(const p of points){const pos=phase==='garuda'?g.npcRoleSample(['MT','ST','H1','H2','D1','D2','D3','D4'].indexOf(p.role),p.t):sim.referencePosition(p.role,p.t-origin);assert(pos&&Math.hypot(pos.x-p.x,pos.y-p.y)<.001,`${p.role}@${p.t}: ${JSON.stringify(pos)} vs ${p.x},${p.y}`);}
});
test('practice Landslide rotates with its live bait and locks after cast start',()=>{
 function bait(x,y){Object.assign(t.S.opts,{preset:'reference',randomJumps:false,start:343.60-300.72,role:0,god:true});t.reset();t.S.rnd=()=>0;Object.assign(t.S.ents[0],{x,y});t.step(.01);return t.S.aoes.filter(a=>a.shape?.type==='rect').map(a=>a.shape.ang);}
 const north=bait(-14,-10),east=bait(-4,0);assert.equal(north.length,5);assert.equal(east.length,5);
 assert(Math.abs(Math.atan2(Math.sin(east[0]-north[0]),Math.cos(east[0]-north[0]))-Math.PI/2)<.02,'moving the live bait must rotate the attack');
 Object.assign(t.S.ents[0],{x:-14,y:10});t.step(.1);assert.deepEqual(t.S.aoes.filter(a=>a.shape?.type==='rect').map(a=>a.shape.ang),east,'bait locks at cast start, so dodging is possible');
});
for(const [phase,sim,origin,end]of [['garuda',g,0,152.558],['ifrit',f,152.558,300.72],['titan',t,300.72,429]])test(`${phase}: source remains exact while live NPCs obey walk/Sprint limits and feasible arrivals`,()=>{
 for(let controlled=0;controlled<8;controlled++){
  if(phase==='garuda'){Object.assign(sim.S.opts,{role:controlled,god:true});sim.reset('garuda',0,0);}
  else{Object.assign(sim.S.opts,{preset:'reference',randomJumps:false,start:0,role:controlled,god:true,full:true});sim.reset();}
  const roles=['MT','ST','H1','H2','D1','D2','D3','D4'];let speedChecks=0,feasibleChecks=0;
  while(sim.S.t<end-origin-.051&&!sim.S.over&&!sim.S.done){
   const dt=.05,before=sim.S.ents.map(e=>({...e})),jailed={...sim.S.jailed},cleaveHeld=phase==='titan'?new Set(sim.S.aoes.filter(a=>!a.done&&a.shape?.type==='cone').flatMap(a=>a.skip||[])):new Set(),garudaIntent=phase==='garuda'?sim.S.ents.map(e=>sim.garudaNpcIntent(e.i,sim.S.t+dt)):null;sim.step(dt);
   for(const e of sim.S.ents){
    const old=before[e.i];
    // Death/raise, physical knockback and prison binding are explicit state
    // transitions, not walking. Avoidance itself gets no speed exemption.
    if(e.i===controlled||old.dead||e.dead||old.knockbackPos||e.knockbackPos||jailed[e.i]||sim.S.jailed?.[e.i])continue;
    const absolute=sim.S.t+origin;
    const sprint=(data[phase].motionEvents||[]).some(a=>a.type==='sprint'&&a.role===roles[e.i]&&absolute>=a.start&&absolute<a.end);
    const budget=(sprint?7.8:6)*dt,distance=Math.hypot(e.x-old.x,e.y-old.y);
    assert(distance<=budget+1e-7,`${roles[e.i]} @${absolute}: moved ${distance}m, allowed ${budget}m`);speedChecks++;
    // Movement precedes damage resolution: tanks hold facing through the
    // resolving frame, then resume on the next frame. Sample that frame's intent.
    const expected=cleaveHeld.has(e.i)?old:phase==='garuda'?garudaIntent[e.i]:sim.npcReferencePosition(roles[e.i],sim.S.t);
    if(expected&&!old.avoidGoal&&!e.avoidGoal&&Math.hypot(expected.x-old.x,expected.y-old.y)<=budget+1e-9){
     assert(Math.hypot(e.x-expected.x,e.y-expected.y)<1e-7,`${roles[e.i]} delayed despite reachable safe sample @${absolute}`);feasibleChecks++;
    }
   }
  }
  assert(speedChecks>1000);assert(feasibleChecks>1000,`${phase}/${controlled}: only ${feasibleChecks} feasible arrivals checked`);
 }
});
