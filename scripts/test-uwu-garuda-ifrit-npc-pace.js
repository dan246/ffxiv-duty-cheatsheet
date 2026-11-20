const {test}=require('node:test'),assert=require('node:assert/strict');
const g=require('../sim/uwu'),f=require('../sim/uwu-ifrit'),d=require('../sim/uwu-reference');
test('recorded NPC routes share the observation clock without late-departure guesses',()=>{
 globalThis.UWU_REFERENCE=d;try{Object.assign(f.S.opts,{preset:'reference',start:0,role:7,god:true});f.reset();for(let t=153;t<299;t+=.137)assert.deepEqual(f.npcReferencePosition('H1',t-152.558),f.referencePosition('H1',t-152.558));for(let t=0;t<152;t+=.137)assert.deepEqual(g.npcRoleSample(7,t),g.roleSample(7,t));}finally{delete globalThis.UWU_REFERENCE;}
});
test('pause does not advance source playback',()=>{Object.assign(g.S.opts,{role:4,god:true});g.reset('garuda',0,5);const before={...g.S.ents[7]};g.S.paused=true;g.step(.5);assert.deepEqual(g.S.ents[7],before);assert.equal(g.S.t,5);});
