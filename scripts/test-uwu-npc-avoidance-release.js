'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {move}=require('../sim/uwu-npc-motion');
test('completed avoidance releases toward a reachable safe duty before the next snapshot',()=>{
 const actor={x:4.753,y:9.184,avoidGoal:{x:4.753,y:9.184}},start=actor.x;
 const hazard={t1:712.805,hit:(p,m=0)=>Math.hypot(p.x-6,p.y-3)<=6+m};
 move(actor,{x:4.7,y:9.1},.02,{time:710,radius:20,speed:6,hazards:[hazard],future:()=>({x:-6,y:3})});
 assert(actor.x<start,'NPC must leave the completed avoidance point');
});
