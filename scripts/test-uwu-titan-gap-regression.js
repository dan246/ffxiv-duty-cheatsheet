'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan');const {S}=sim;
for(let seed=0;seed<16;seed++)test(`synthetic safe knockback holds all NPCs in gap until five bombs resolve seed ${seed}`,()=>{
 Object.assign(S.opts,{preset:'random',seed,start:33.5,role:7,god:false});sim.reset();
 // Start at the pre-knockback stack, then let every NPC walk normally.
 for(const e of S.ents){if(!e.dead)Object.assign(e,sim.stackSpot());}
 while(S.t<41.51&&!S.over)sim.step(.01);
 assert.equal(S.over,null,JSON.stringify(S.over));
 for(const i of [0,2,3,7])assert(!S.ents[i].dead,`role ${i}`);
});
test('different seeds select all four fixed world directions; retry preserves the selected arrangement',()=>{
 const dirs=new Set();
 for(let seed=0;seed<64;seed++){
  Object.assign(S.opts,{preset:'random',seed,start:27,role:7,god:false});sim.reset();
  const direction=S.g2;dirs.add(direction);const point=sim.bossSpot(30.5).pos;
  const expected=sim.polar(direction*90,14);assert(Math.hypot(point.x-expected.x,point.y-expected.y)<1e-8);
  sim.reset();assert.equal(S.g2,direction);
 }
 assert.equal(dirs.size,4);
});
for(let role=0;role<8;role++)test(`synthetic knockback through gaol release with normal keyboard role ${role}`,()=>{
 for(let seed=0;seed<16;seed++){
  Object.assign(S.opts,{preset:'random',seed,start:33.5,role,god:false});sim.reset();
  while(S.t<52.1&&!S.over){
   const p=S.ents[role],goal=sim.npcTarget(p),dx=goal.x-p.x,dy=goal.y-p.y,d=Math.hypot(dx,dy);
   S.keys.KeyW=d>.001&&!p.dead&&!S.jailed[role]&&S.t>=S.stun;S.cam=Math.atan2(dx,-dy);
   sim.step(Math.min(.01,S.keys.KeyW?d/6:.01));
  }
  assert.equal(S.over,null,`role ${role} seed ${seed}: ${JSON.stringify(S.over)}`);
  assert.equal(S.gaols.length,3);assert(S.gaols.every(g=>g.broken),'all three gaols must actually break');
 }
});
test('second jump checkpoint restores completed sacrifices and NPCs survive through gap',()=>{
 for(let seed=0;seed<16;seed++){
  Object.assign(S.opts,{preset:'random',seed,start:25.3,role:4,god:false});sim.reset();
  assert(sim.DIE.every(i=>S.ents[i].dead),'checkpoint follows the resolved sacrifice');
  while(S.t<42&&!S.over)sim.step(.01);
  assert.equal(S.over,null,JSON.stringify(S.over));
 }
});
