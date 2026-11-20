'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const sim=require('../sim/uwu');
const {S}=sim;
function setup(kind='grouporb'){
 Object.assign(S.opts,{role:0,god:false,assist:false});sim.reset('ultima',1,790);
 const e={kind,name:'orb test',t:792,lead:4,orb:0,side:1,who:0,hazards:[]};S.events=[e];
 S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));return e;
}
test('paired bodies follow collision centers and converge with assists disabled',()=>{
 setup();let bodies=sim.sceneOrbs().bodies;assert.equal(bodies.length,2);assert.equal(bodies[0].radius,1.15);
 assert.deepEqual(bodies.map(b=>b.pos),[{x:6,y:2.75},{x:6,y:5.25}]);
 S.t=791;assert(sim.sceneOrbs().bodies[1].pos.y<bodies[1].pos.y);
});
test('contact snapshots a successful four-player soak and both departing bodies',()=>{
 const e=setup();S.ents.filter(p=>p.i%2===0).forEach(p=>Object.assign(p,{x:6,y:2.75}));sim.step(.001);
 assert(e.done);assert(!S.dead);assert.equal(S.orbEffects.length,1);const fx=S.orbEffects[0];
 assert.equal(fx.outcome,'soak');assert.equal(fx.bodies.length,2);assert.equal(fx.targets.length,4);assert.equal(fx.radius,8);
 assert.equal(sim.sceneOrbs().bodies.length,0);assert.equal(sim.sceneOrbs().effects.length,1);
 const snapshot=JSON.stringify(fx.targets);S.ents[0].x=0;assert.equal(JSON.stringify(fx.targets),snapshot);
 const before=sim.sceneOrbs();S.paused=true;sim.step(1);assert.deepEqual(sim.sceneOrbs(),before);S.paused=false;
 sim.step(2);assert.equal(sim.sceneOrbs().effects.length,0);
});
test('bad contact produces failure effect even in observation mode',()=>{
 setup();S.opts.god=true;Object.assign(S.ents[1],{x:6,y:2.75});sim.step(.001);
 assert.equal(S.orbEffects[0].outcome,'failed');assert.equal(S.orbEffects[0].targets.length,0);
});
test('missed pair fuses and failure animation drains after death without moving encounter time',()=>{
 setup();S.t=791.999;sim.step(.002);assert(S.dead);assert.equal(S.orbEffects[0].outcome,'fusion');
 const at=S.t;sim.step(.3);assert.equal(S.t,at);assert(sim.sceneOrbs().effects[0].progress>0);sim.step(2);assert.equal(sim.sceneOrbs().effects.length,0);
 sim.reset('ultima',1,790);assert.deepEqual(S.orbEffects,[]);
});
test('single orb uses actual designated-tank resolution; missing tank is never a soak',()=>{
 for(const valid of [true,false]){const e=setup('orb');S.t=e.t-.001;if(valid)Object.assign(S.ents[0],{x:6,y:3});sim.step(.002);
 assert.equal(S.orbEffects[0].outcome,valid?'soak':'failed');assert.equal(S.orbEffects[0].radius,6);}
});
test('effect elapsed time is deterministic for equivalent speed-scaled deltas',()=>{
 function progress(deltas){setup();S.opts.role=1;Object.assign(S.ents[1],{x:6,y:2.75});sim.step(.001);assert(S.dead);for(const dt of deltas)sim.step(dt);return sim.sceneOrbs().effects[0].progress;}
 assert(Math.abs(progress([.4])-progress([.1,.1,.1,.1]))<1e-10);
});
