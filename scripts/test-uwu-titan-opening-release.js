'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan'),reference=require('../sim/uwu-reference');
const {S,REFERENCE_ORIGIN:origin}=sim;
function setup(start,role=0,seed=0){globalThis.UWU_REFERENCE=reference;Object.assign(S.opts,{preset:'reference',start:start-origin,role,seed,randomJumps:false,god:true});sim.reset();}
function advance(abs){while(!S.over&&S.t+origin<abs-1e-8)sim.step(Math.min(.01,abs-origin-S.t));}
test('reference NPC MT takes aggro at the opening handoff, before the first tankbuster',()=>{
 setup(origin,7);advance(origin+3.49);assert.equal(S.tank,null);advance(origin+3.51);
 assert.equal(S.tank,0);assert.equal(sim.bossLook(S.t),S.ents[0]);
 // Following the live tank changes immediately, with no raw-facing interpolation.
 S.ents[0].x+=2;assert.equal(sim.bossLook(S.t).x,S.ents[0].x);
});
test('controlled MT must provoke and boss faces the live player on the same frame',()=>{
 setup(origin,0);advance(origin+3.6);assert.equal(S.tank,null);
 sim.useSkill('provoke');assert.equal(S.tank,0);assert.equal(sim.bossLook(S.t),S.ents[0]);
});
test('controlled MT cannot wait for the tankbuster to silently grant aggro',()=>{
 setup(origin+9.9,0);S.opts.god=false;S.tank=null;
 advance(origin+10.01);assert(S.over);assert.match(S.over.reason,/挑釁/);
});
for(const role of ['H2','H1','D4'])test(`${role} immediately walks toward the edge after its triple gaol releases`,()=>{
 const release=reference.titan.gaolStates.find(e=>e.role===role&&!e.active).time,i=sim.ROLES.indexOf(role);
 setup(346.4);advance(release-.001);assert(S.jailed[i]);const before={...S.ents[i]};
 while(S.t+origin<release+.201-1e-8){
  const old={...S.ents[i]},dt=Math.min(.01,release+.201-origin-S.t);sim.step(dt);
  const sprint=reference.titan.motionEvents.some(e=>e.role===role&&e.type==='sprint'&&S.t+origin>=e.start&&S.t+origin<e.end);
  assert(Math.hypot(S.ents[i].x-old.x,S.ents[i].y-old.y)<=(sprint?7.8:6)*dt+1e-8,'release cannot teleport or invent Sprint');
 }
 const after=S.ents[i],goal=sim.practicePosition(role,357.907-origin);
 assert(!S.jailed[i]);const moved=Math.hypot(after.x-before.x,after.y-before.y);
 assert(moved>1.05,`${role} only moved ${moved}m in first 200ms after release`);
 assert(Math.hypot(after.x-goal.x,after.y-goal.y)<Math.hypot(before.x-goal.x,before.y-goal.y));
 assert.deepEqual(sim.referencePosition(role,release-origin),{x:before.x,y:before.y},'raw bound/release coordinates stay intact');
});
test('controlled H1 is still bound before release and can move on the release frame',()=>{
 const release=351.886;setup(346.4,2);advance(release-.011);S.cam=0;S.keys.KeyW=true;
 const p={...S.ents[2]};sim.step(.01);assert.equal(S.ents[2].y,p.y);sim.step(.01);
 assert(!S.jailed[2]);assert(Math.abs(S.ents[2].y-p.y+.06)<1e-8);
});
