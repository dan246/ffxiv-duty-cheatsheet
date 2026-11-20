'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sim=require('../sim/uwu'),{S}=sim,timeline=require('../sim/uwu-timeline');
function start(phase,time,role){Object.assign(S.opts,{role,god:false});sim.reset(phase,1,time);}
test('assigned cyclone failure belongs only to controlled ST; NPC miss stays diagnostic',()=>{
 for(let role=0;role<8;role++){
 const e=timeline.build('garuda',1).find(e=>e.kind==='cyclone');start('garuda',e.t-.001,role);S.events=[{...e,hazards:[]}];
 Object.assign(S.ents[role],sim.goal(e,role));Object.assign(S.ents[1],{x:19,y:0});sim.step(.002);
 assert.equal(S.dead,role===1);if(role!==1)assert(S.npcFaults.some(f=>f.role===1));}
});
test('another group missing or fusing its orb never fails an uninvolved player',()=>{
 for(const mode of ['contact','fusion'])for(const role of [1,3,5,7]){
 start('ultima',790,role);S.events=[{kind:'grouporb',name:'orb duty',t:792,lead:4,orb:0,side:1,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));
 if(mode==='contact')Object.assign(S.ents[0],{x:6,y:2.75});else S.t=791.999;sim.step(.002);
 assert(!S.dead,`${mode} ${role}`);assert(S.npcFaults.length);assert.equal(S.orbEffects[0].outcome,mode==='contact'?'failed':'fusion');}
});
test('wrong-group controlled contact fails while identical NPC contact is diagnostic',()=>{
 for(const role of [1,3]){start('ultima',790,role);S.events=[{kind:'grouporb',name:'orb duty',t:792,lead:4,orb:0,side:1,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));Object.assign(S.ents[1],{x:6,y:2.75});sim.step(.001);assert.equal(S.dead,role===1);}
});

test('an NPC touching early cannot blame the still-approaching player in its own group',()=>{
 start('ultima',790,2);S.events=[{kind:'grouporb',name:'early NPC',t:792,lead:4,orb:0,side:1,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));Object.assign(S.ents[0],{x:6,y:2.75});sim.step(.001);assert(!S.dead);assert(S.npcFaults.some(f=>f.role===0));
});

test('an unrelated wrong NPC does not suppress the player triggering an incomplete soak',()=>{
 start('ultima',790,0);S.events=[{kind:'grouporb',name:'early player',t:792,lead:4,orb:0,side:1,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));Object.assign(S.ents[0],{x:6,y:2.75});Object.assign(S.ents[1],{x:6,y:6});sim.step(.001);assert(S.dead);assert.match(S.reason,/四名/);
});
test('correct singer is not blamed for NPC tank interception; misplaced singer still fails',()=>{
 for(const misplaced of [false,true]){const e=timeline.build('ultima',0).find(e=>e.kind==='songside');start('ultima',e.t-.001,e.who);S.events=[{...e,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:14,y:-8}));Object.assign(S.ents[e.who],misplaced?{x:-19,y:0}:sim.goal(e,e.who));Object.assign(S.ents[e.tank],{x:19,y:0});sim.step(.002);assert.equal(S.dead,misplaced);if(!misplaced)assert(S.npcFaults.some(f=>f.role===e.tank));}
});

test('NPC contact at deadline cannot excuse the player missing their own soak',()=>{
 start('ultima',791.999,2);S.events=[{kind:'grouporb',name:'missed own soak',t:792,lead:4,orb:0,side:1,hazards:[]}];S.ents.forEach(p=>Object.assign(p,{x:-15,y:0}));[0,4,6].forEach(i=>Object.assign(S.ents[i],{x:6,y:4}));sim.step(.002);assert(S.dead);assert.match(S.reason,/四名/);
});
