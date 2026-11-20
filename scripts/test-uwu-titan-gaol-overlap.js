'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');const sim=require('../sim/uwu-titan');const {S}=sim;
function setup(start){Object.assign(S.opts,{preset:'random',seed:7,start,role:4,god:false});sim.reset();}
for(const [distance,hit] of [[7.9,true],[8.2,false]])test(`bomb overlaps first gaol at ${distance}m: ${hit}`,()=>{
 setup(49.59);const c=sim.F(-5,12);S.gaols=[{who:3,pos:{x:c.x+distance,y:c.y},broken:false}];S.jailed[3]=true;
 S.events.find(e=>e.t===49.6).run();assert.equal(S.gaols[0].broken,hit);
});
for(const [distance,hit] of [[7.7,true],[7.9,false]])test(`gaol blast overlaps next gaol at ${distance}m: ${hit}`,()=>{
 setup(50.29);S.gaols=[{who:3,pos:{x:0,y:0},broken:true},{who:2,pos:{x:distance,y:0},broken:false}];S.jailed[2]=true;
 S.events.find(e=>e.t===50.3).run();assert.equal(S.gaols[1].broken,hit);
});
for(const [distance,hit] of [[10.4,true],[10.7,false]])test(`sludge overlaps Titan hitbox at ${distance}m: ${hit}`,()=>{
 setup(51.99);const boss=sim.F(0,-14);S.gaols=[3,2,7].map((who,i)=>({who,pos:{x:boss.x+distance+i*10,y:boss.y},broken:true}));
 S.events.find(e=>e.t===52).run();assert.equal(S.over,null);assert.equal(S.npcFaults.some(f=>f.mechanic==='gaol-chain-incomplete'),!hit);
});
test('live connection preview agrees with first-bomb overlap on both sides of boundary',()=>{
 for(const [distance,ok] of [[7.9,true],[8.2,false]]){
  setup(43);const bomb=sim.F(-5,12);Object.assign(S.ents[3],{x:bomb.x+distance,y:bomb.y});
  const link=sim.gaolLinks(43)[0];assert.equal(link.ok,ok);assert(Math.abs(link.distance-distance)<1e-9);
 }
});
