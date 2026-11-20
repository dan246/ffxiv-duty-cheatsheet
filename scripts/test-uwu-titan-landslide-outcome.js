'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan');const {S}=sim;
function lock(){Object.assign(S.opts,{preset:'random',seed:3,start:43.39,role:7,god:false,assist:true});sim.reset();Object.assign(S.ents[7],{x:8,y:8,dead:false});sim.step(.02);return S.slideWave;}
function resolve(w){for(const a of S.aoes.filter(a=>a.t1===w.t1))a.onHit();}
test('one wave records every actual victim, locked bait and struck lane before ending',()=>{
 const w=lock();for(const e of S.ents)e.dead=true;
 for(const i of [2,3])Object.assign(S.ents[i],{dead:false,x:w.T.x+Math.cos(w.base)*10,y:w.T.y+Math.sin(w.base)*10});
 resolve(w);assert.deepEqual(S.landslideResult.victims.map(v=>v.role),[2,3]);
 assert.equal(S.landslideResult.target,7);assert.equal(S.landslideResult.lockedAt,w.lockedAt);
 assert(S.landslideResult.victims.every(v=>v.lanes.includes(0)));assert.match(S.over.reason,/H1.*H2/);
 assert.match(S.over.reason,/D4/);assert.equal(S.over.mechanic,'landslide');
 assert(sim.landslideGuides().some(g=>g.type==='line'));
});
test('baiting through center is not itself a failure when nobody is struck',()=>{
 const w=lock();for(const e of S.ents)e.dead=true;
 resolve(w);assert.equal(S.over,null);assert.deepEqual(S.landslideResult.victims,[]);
});
test('controlled player hit is attributed to own collision and retry clears outcome',()=>{
 const w=lock();for(const e of S.ents)e.dead=true;
 Object.assign(S.ents[7],{dead:false,x:w.T.x+Math.cos(w.base)*10,y:w.T.y+Math.sin(w.base)*10});
 resolve(w);assert.deepEqual(S.landslideResult.victims.map(v=>v.role),[7]);assert.match(S.over.reason,/你.*D4/);
 sim.reset();assert.equal(S.landslideResult,null);
});
test('jailed and recently freed players keep existing immunity',()=>{
 const w=lock();for(const e of S.ents)e.dead=true;
 for(const i of [2,3])Object.assign(S.ents[i],{dead:false,x:w.T.x+Math.cos(w.base)*10,y:w.T.y+Math.sin(w.base)*10});
 S.jailed[2]=true;S.freed[3]=S.t+10;resolve(w);assert.equal(S.over,null);assert.equal(S.landslideResult.victims.length,0);
});
for(const role of [0,2,3,7])test(`NPC route survives 16 arrangements x 24 bait angles; controlled role ${role}`,()=>{
 for(let seed=0;seed<16;seed++)for(let deg=0;deg<360;deg+=15){
  Object.assign(S.opts,{preset:'random',seed,start:33.5,role,god:false});sim.reset();
  while(S.t<43.39&&!S.over){const p=S.ents[role],g=sim.npcTarget(p),dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy);S.keys.KeyW=d>.001&&!p.dead&&!S.jailed[role]&&S.t>=S.stun;S.cam=Math.atan2(dx,-dy);sim.step(Math.min(.01,S.keys.KeyW?d/6:.01));}
  assert.equal(S.over,null);
  S.keys.KeyW=false;const p=S.ents[role];Object.assign(p,{x:12*Math.cos(deg*Math.PI/180),y:12*Math.sin(deg*Math.PI/180)});
  sim.step(.02);assert.equal(S.slideWave.target,role);
  // Isolate NPC routing after locking the live bait. Player survival and gaol
  // completion are covered separately by the normal keyboard regression suite.
  p.dead=true;
  while(S.t<45.7&&!S.over)sim.step(.01);
  assert.equal(S.over,null,`seed ${seed}, bait ${deg}: ${JSON.stringify(S.over)}`);
  assert.equal(S.landslideResult.victims.length,0);
 }
});
