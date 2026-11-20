'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu-titan'),{S}=sim;
function setup(role=4){Object.assign(S.opts,{preset:'random',seed:0,start:-4,role,god:false});sim.reset();}
function event(t){S.t=t;S.events.find(e=>Math.abs(e.t-t)<1e-6).run();}
test('NPC center-gaol misplacement is recorded without failing the player or inventing a rescue',()=>{
 setup();S.g4=2;Object.assign(S.ents[2],{x:10,y:0});event(91.4);assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===2));assert(S.jailed[2]);event(98);assert.equal(S.over,null);assert(S.jailed[2]);
});
test('controlled center-gaol misplacement still fails',()=>{setup(2);S.g4=2;Object.assign(S.ents[2],{x:10,y:0});event(91.4);assert.equal(S.over.win,false);});
test('missing NPC rescuers cannot fail a player who joined the gaol',()=>{
 setup();S.g4=2;S.ents.forEach(p=>Object.assign(p,{x:11,y:0}));Object.assign(S.ents[2],{x:0,y:0});Object.assign(S.ents[4],{x:0,y:0});event(91.4);event(98);assert.equal(S.over,null);assert(S.jailed[2]);assert(S.npcFaults.length);
});
test('controlled rescuer outside rescue range still fails when the rescue is short',()=>{
 setup();S.g4=2;S.ents.forEach(p=>Object.assign(p,{x:11,y:0}));for(const i of [1,2,3,5])Object.assign(S.ents[i],{x:0,y:0});event(91.4);event(98);assert.equal(S.over.win,false);
});
for(const badRole of [3,2])test(`chain attributes bad carrier ${badRole} while controlled H1 stays accountable`,()=>{
 setup(2);for(const i of sim.GAOL)Object.assign(S.ents[i],sim.home(i,46.1));Object.assign(S.ents[badRole],{x:15,y:0});event(46.1);for(const t of [49.6,50.3,51.1,52])event(t);
 if(badRole===2){assert.equal(S.over.win,false);assert.equal(S.npcFaults.length,0);}else{assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===badRole));}
});
for(const role of [0,1])test(`missed sacrifice belongs to the responsible actor, controlled role ${role}`,()=>{
 setup(role);S.events=[];S.aoes=[];S.t=24;S.sacrificeDeadline=24;for(const i of sim.DIE){S.ents[i].dead=true;S.ents[i].plannedDeath=true;}S.ents[1].dead=false;S.ents[1].plannedDeath=false;sim.step(.001);
 if(role===1)assert.equal(S.over.win,false);else{assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===1));}
});
function referenceSetup(role){globalThis.UWU_REFERENCE=require('../sim/uwu-reference');Object.assign(S.opts,{preset:'reference',seed:0,start:0,role,god:false});sim.reset();}
function recordedEvent(absolute){const t=absolute-sim.REFERENCE_ORIGIN;S.t=t;S.events.filter(e=>Math.abs(e.t-t)<1e-6).forEach(e=>e.run());}
test('reference chain does not blame a correctly placed player for an NPC missing its first link',()=>{
 referenceSetup(2);for(const i of sim.GAOL)Object.assign(S.ents[i],sim.practicePosition(sim.ROLES[i],346.323-sim.REFERENCE_ORIGIN));Object.assign(S.ents[3],{x:15,y:0});
 for(const t of [346.323,351.218,351.886,352.601,352.650])recordedEvent(t);
 assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===3));assert(S.gaols.some(g=>!g.broken));
});
for(const fault of ['placement','rescuers'])test(`reference fourth gaol attributes NPC ${fault} without inventing release`,()=>{
 referenceSetup(4);S.ents.forEach(p=>Object.assign(p,{x:11,y:0}));Object.assign(S.ents[4],{x:0,y:0});Object.assign(S.ents[3],{x:fault==='placement'?10:0,y:0});
 recordedEvent(392.388);recordedEvent(400.382);assert.equal(S.over,null);assert(S.jailed[3]);assert(S.npcFaults.length);
});

test('an absent NPC gaol cannot condemn the correctly placed controlled carrier',()=>{
 setup(2);for(const i of sim.GAOL)Object.assign(S.ents[i],sim.home(i,46.1));event(46.1);S.gaols=S.gaols.filter(g=>g.who!==3);event(52);assert.equal(S.over,null);assert(S.npcFaults.some(f=>f.role===3));
});
