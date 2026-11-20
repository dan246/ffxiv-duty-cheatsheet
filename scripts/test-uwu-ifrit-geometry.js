'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const reference=require('../sim/uwu-reference');
const sim=require('../sim/uwu-ifrit');
const {S}=sim;
const origin=152.558;
function setup(preset='reference',start=0,role=4,replay=reference){
 globalThis.UWU_REFERENCE=replay;
 Object.assign(S.opts,{preset,start,role,god:false,full:true,seed:0});sim.reset();
}
function lanePoint(deg,along,side){const a=deg*Math.PI/180;return {x:Math.sin(a)*along+Math.cos(a)*side,y:-Math.cos(a)*along+Math.sin(a)*side};}
// Independent dimensions: XIVAPI Actions11103/11104/11105; BossMod UWU
// P2CrimsonCyclone and P2RadiantPlume. Reference and random practice must
// expose identical real contact boundaries, not a softened replay variant.
for(const preset of ['reference','random'])test(`${preset} entry Cyclone hits at8.99m and misses at9.01m from its axis`,()=>{
 setup(preset);sim.step(.001);const a=S.aoes.find(a=>a.shape.type==='strip');assert(a);
 assert(a.hit(lanePoint(a.shape.deg,0,8.99)),'18m full width');
 assert(!a.hit(lanePoint(a.shape.deg,0,9.01)));
});
for(const preset of ['reference','random'])test(`${preset} Radiant Plume has the sourced eight-meter boundary`,()=>{
 setup(preset);sim.step(.001);const circles=S.aoes.filter(a=>a.shape.type==='circle');assert.equal(circles.length,5);
 for(const a of circles){const c=a.shape.c;assert(a.hit({x:c.x+7.99,y:c.y}));assert(!a.hit({x:c.x+8.01,y:c.y}));}
});
for(const preset of ['reference','random'])test(`${preset} awakened afterburn hits4.99m and misses5.01m from either arm`,()=>{
 setup(preset,114.999);S.events=S.events.filter(e=>Math.abs(e.t-115)<.001);S.evIdx=0;sim.step(.002);
 const a=S.aoes.find(a=>a.isCross);assert(a);
 for(const deg of [a.shape.deg,a.shape.deg+90]){assert(a.hit(lanePoint(deg,14,4.99)));assert(!a.hit(lanePoint(deg,14,5.01)));}
});
for(const gap of [3.99,4.01])test(`Flaming Crush counts a sixth participant at${gap}m using the actual resolution`,()=>{
 const impact=262.228-origin;
 setup('reference',impact-.0001,2);S.events=S.events.filter(e=>Math.abs(e.t-impact)<.001);S.evIdx=0;
 for(const e of S.ents)Object.assign(e,{x:e.i===2?18:e.i===3?-18:0,y:0});
 Object.assign(S.ents[4],{x:0,y:gap});sim.step(.0002);
 assert.equal(S.over,null);assert.equal(S.npcFaults.some(f=>f.role===4&&/分攤人數不足/.test(f.reason)),gap>4);
});
test('Incinerate ends fifteen meters from Ifrit rather than killing across the arena',()=>{
 const cue=173.497-origin-1.5;setup('reference',cue-.001);S.events=S.events.filter(e=>Math.abs(e.t-cue)<.001);S.evIdx=0;sim.step(.002);
 const a=S.aoes.find(a=>a.shape.type==='cone');assert(a);const from=a.shape.from(),to=a.shape.to(),angle=Math.atan2(to.y-from.y,to.x-from.x);
 const point=(d,offset=0)=>({x:from.x+d*Math.cos(angle+offset),y:from.y+d*Math.sin(angle+offset)});
 assert(a.hit(point(14.99)));assert(!a.hit(point(15.01)));
 assert(a.hit(point(10,Math.PI/3-.001)));assert(!a.hit(point(10,Math.PI/3+.001)));
});
test('reference Eruption without cast packets still snapshots three seconds before impact',()=>{
 const impact=201.354-origin,replay={...reference,ifrit:{...reference.ifrit,eventCasts:[]}};
 setup('reference',impact-3-.001,6,replay);sim.step(.002);
 const a=S.aoes.find(a=>a.shape.type==='circle'&&Math.abs(a.t1-impact)<.001);assert(a,'the3s cast has begun');
 const locked={...a.shape.c};Object.assign(S.ents[6],{x:0,y:0});sim.step(.001);assert.deepEqual(a.shape.c,locked);
 globalThis.UWU_REFERENCE=reference;
});
