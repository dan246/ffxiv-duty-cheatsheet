const {test}=require('node:test'),assert=require('node:assert/strict');const reference=require('../sim/uwu-reference');const titan=require('../sim/uwu-titan');
function setup(){globalThis.UWU_REFERENCE=reference;Object.assign(titan.S.opts,{preset:'reference',randomJumps:false,start:346.30-300.72,role:2,god:false,seed:0});titan.reset();}
function advance(abs){while(titan.S.t<abs-300.72-1e-8&&!titan.S.over)titan.step(Math.min(.005,abs-300.72-titan.S.t));}
test('misplaced controlled gaol cannot be released just because the source recording released it',()=>{setup();Object.assign(titan.S.ents[2],{x:-10,y:-8});advance(352.7);assert(titan.S.over&&!titan.S.over.win);assert.match(titan.S.over.reason,/石牢/);});
test('correct observed gaol chain releases all three roles',()=>{setup();advance(352.7);assert.equal(titan.S.over,null);for(const i of [2,3,7])assert(!titan.S.jailed[i]);assert(titan.S.gaols.length===3&&titan.S.gaols.every(g=>g.broken));});
test('Ifrit NPC baiters preserve two hits per nail when each controlled role places its assigned baits',()=>{
 globalThis.UWU_REFERENCE=reference;const sim=require('../sim/uwu-ifrit');for(let role=0;role<8;role++){Object.assign(sim.S.opts,{preset:'reference',randomJumps:false,role,start:0,god:true,full:true,seed:0});sim.reset();while(sim.S.t<66){Object.assign(sim.S.ents[role],sim.referencePosition(sim.ROLES[role],sim.S.t+.02));
 if(role===6||role===7){const casts=[...new Map(reference.ifrit.eventCasts.filter(c=>c.ability===11098&&c.t<210).map(c=>[c.t,c])).values()];const n=casts.findIndex(c=>c.t0-152.558>=sim.S.t-.02);if(n>=0&&casts[n].t0-152.558-sim.S.t<.1){const index=role===6?(n<2?2:1):(n<2?3:0);const nail=sim.nails(sim.S.t).find(n=>n.i===index);Object.assign(sim.S.ents[role],{x:nail.pos.x*1.55,y:nail.pos.y*1.55});}}
 sim.step(.02);}assert.deepEqual(sim.S.nailHits,[2,2,2,2],`role ${role}`);}
});
test('extra nail contact must not invent a failure when all nails have two capped stacks',()=>{
 globalThis.UWU_REFERENCE=reference;const sim=require('../sim/uwu-ifrit');Object.assign(sim.S.opts,{preset:'reference',randomJumps:false,role:4,start:56,god:false,full:true,seed:0});sim.reset();sim.S.nailHits=[3,2,2,2];while(sim.S.t<56.5&&!sim.S.over)sim.step(.01);assert.equal(sim.S.over,null);
});
test('practice does not kill a living NPC solely at its recorded wipe death time',()=>{
 globalThis.UWU_REFERENCE=reference;Object.assign(titan.S.opts,{preset:'reference',randomJumps:false,role:0,start:407.18-300.72,god:false,seed:0});titan.reset();const S=titan.S;S.events=S.events.filter(e=>Math.abs(e.t+300.72-407.194)<.001);S.evIdx=0;S.aoes=[];S.ents[4].dead=false;titan.step(.02);assert(!S.ents[4].dead);assert(S.ents[4].recordedDead);
});
test('fourth gaol requires central placement and nearby rescuers',()=>{
 for(const bad of [false,true]){globalThis.UWU_REFERENCE=reference;Object.assign(titan.S.opts,{preset:'reference',randomJumps:false,role:3,start:392.38-300.72,god:false,seed:0});titan.reset();Object.assign(titan.S.ents[3],{x:bad?10:0,y:0});advance(400.39);if(bad){assert(titan.S.over&&!titan.S.over.win);assert.match(titan.S.over.reason,/石牢/);}else{assert.equal(titan.S.over,null);assert(!titan.S.jailed[3]);}}
});
test('three-gaol chain remains valid across eight controlled roles and sixteen seeds',()=>{
 globalThis.UWU_REFERENCE=reference;
 for(let seed=0;seed<16;seed++)for(let role=0;role<8;role++){
  Object.assign(titan.S.opts,{preset:'reference',randomJumps:false,seed,role,start:342-300.72,god:true});titan.reset();
  while(titan.S.t<352.66-300.72){const p=titan.referencePosition(titan.ROLES[role],titan.S.t+.01);if(!titan.S.jailed[role]&&p)Object.assign(titan.S.ents[role],p);titan.step(.01);}
  const chain=titan.S.gaols.filter(g=>g.chain);assert(chain.length===3&&chain.every(g=>g.broken)&&chain.some(g=>Math.hypot(g.pos.x+14,g.pos.y)<=7.6),`seed ${seed},role ${role}`);
 }
});
