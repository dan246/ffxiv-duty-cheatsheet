'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan'),reference=require('../sim/uwu-reference');const {S}=sim;
for(const preset of ['reference','random'])for(let role=0;role<8;role++)test(`${preset}: post-knockback Landslide locks controlled role ${role}`,()=>{
 globalThis.UWU_REFERENCE=reference;
 const start=preset==='reference'?343.60-300.72:43.39;
 const capture=pos=>{
  Object.assign(S.opts,{preset,seed:7,start,role,god:true,randomJumps:false});sim.reset();
  Object.assign(S.ents[role],{...pos,dead:false});delete S.jailed[role];S.rnd=()=>0;
  sim.step(.02);const wave=S.slideWave;assert(wave,'wave exists');assert.equal(wave.target,role);
  const angle=Math.atan2(pos.y-wave.T.y,pos.x-wave.T.x);assert(Math.abs(Math.atan2(Math.sin(wave.base-angle),Math.cos(wave.base-angle)))<1e-9);
  const base=wave.base;Object.assign(S.ents[role],{x:0,y:0});sim.step(.02);assert.equal(S.slideWave.base,base,'locked fan does not follow later movement');return base;
 };
 assert.notEqual(capture({x:-8,y:9}),capture({x:8,y:9}),'pre-lock movement changes the fan');
 delete globalThis.UWU_REFERENCE;
});
for(const preset of ['reference','random'])for(const state of ['dead','jailed'])test(`${preset}: ${state} controlled player is not used as a bait`,()=>{
 globalThis.UWU_REFERENCE=reference;
 Object.assign(S.opts,{preset,seed:7,start:preset==='reference'?343.60-300.72:43.39,role:7,god:true,randomJumps:false});sim.reset();
 if(state==='dead')S.ents[7].dead=true;else S.jailed[7]=true;
 sim.step(.02);assert.notEqual(S.slideWave.target,7);
 delete globalThis.UWU_REFERENCE;
});
