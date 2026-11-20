'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan'),{S}=sim;
test('NPC-only collision cannot end solo practice or kill teaching teammates',()=>{
 Object.assign(S.opts,{preset:'random',seed:0,start:62,role:3,god:false});sim.reset();
 sim.kill(2,'NPC routing regression');assert.equal(S.over,null);assert.equal(S.ents[2].dead,false);
 sim.kill(3,'player collision');assert.equal(S.over.win,false);assert(S.ents[3].dead);
});
for(let seed=0;seed<16;seed++)test(`awakened waves really miss NPCs, seed ${seed}`,()=>{
 Object.assign(S.opts,{preset:'random',seed,start:62,role:3,god:true});sim.reset();let last;
 while(S.t<104){
  const p=S.ents[3],g=sim.npcTarget(p),dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy);
  S.keys.KeyW=d>.001&&!S.jailed[3];S.cam=Math.atan2(dx,-dy);sim.step(Math.min(.01,S.keys.KeyW?d/6:.01));
  const r=S.landslideResult;if(r&&r!==last){last=r;assert.deepEqual(r.victims,[],`actual collisions at ${r.resolvedAt}: ${JSON.stringify(r.victims)}`);}
 }
});
test('Titan model selection is explicit and does not depend on a test-page filename',()=>{
 Object.assign(S.opts,{preset:'random',start:62,role:3,god:false});sim.reset();assert.equal(S.assetPhase,'titan');
});
