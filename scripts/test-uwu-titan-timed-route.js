'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {S,CFG,moveLateNpc}=require('../sim/uwu-titan');
function setup(){S.t=0;S.reference=false;S.arena={radius:20,previousRadius:20,collapse:0};return {x:0,y:0};}
function tick(e,dt,hazards,intent={x:10,y:0}){
 const before={...e};S.t+=dt;
 assert(moveLateNpc(e,intent,dt,hazards),'a feasible route must be available');
 assert(Math.hypot(e.x-before.x,e.y-before.y)<=CFG.speed*dt+1e-9,'route sampling must preserve the movement speed cap');
}
test('crossing .2s waypoints carries unused frame movement into the next segment',()=>{
 const e=setup(),h={t1:.42,hit:p=>p.x<=2.48};
 for(let n=0;n<14;n++)tick(e,.03,[h]);
 assert(Math.abs(e.x-2.52)<1e-9,'the old waypoint follower only reached x=2.4');
 assert(!h.hit(e),'NPC must be safe at the actual .42s snapshot');
});
test('uneven frame deltas and changing path direction remain bounded by six metres per second',()=>{
 const e=setup(),hazards=[{t1:1.4,hit:()=>false}],deltas=[.013,.02,.007,.031,.016,.025,.003];
 while(S.t<1.1){const dt=Math.min(deltas[Math.floor(S.t*1000)%deltas.length],1.1-S.t);tick(e,dt,hazards,{x:8,y:5});}
 assert(Math.hypot(e.x,e.y)>6,'uneven frames must not lose travel at segment boundaries');
});
test('the real .02s maximum step stays clear when a snapshot falls between frames',()=>{
 const e=setup(),hit={t1:.21,hit:(p,pad=0)=>p.x>=1.42-pad},later={t1:.8,hit:()=>false};
 for(let n=0;n<11;n++)tick(e,.02,[hit,later]);
 assert(S.t>=hit.t1);assert(!hit.hit(e),'the collision callback evaluates the current frame endpoint');
});
test('expired routes stop controlling movement and the next hazard replans from the actual position',()=>{
 const e=setup(),h={t1:.2,hit:()=>false};
 for(let n=0;n<11;n++)tick(e,.02,[h]);
 const before={x:e.x,y:e.y};S.t+=.02;assert.equal(moveLateNpc(e,{x:10,y:0},.02,[]),false);assert.equal(e.timedRoute,undefined);assert.deepEqual({x:e.x,y:e.y},before);
 tick(e,.017,[{t1:.6,hit:()=>false}],{x:-5,y:4});
});
test('seed 6 overlapping second fan must not discard a feasible safe route',()=>{
 const fixture=require('./fixtures/titan-seed6-late-route.json');
 S.t=fixture.t;S.reference=false;S.arena={radius:12,previousRadius:12,collapse:0};const e={...fixture.position};
 const hazards=fixture.hazards.map(h=>({...h,hit:(p,pad=0)=>{
  const s=h.shape;if(s.type==='circle')return Math.hypot(p.x-s.c.x,p.y-s.c.y)<=s.r+pad;
  const dx=p.x-s.from.x,dy=p.y-s.from.y,c=Math.cos(s.ang),sn=Math.sin(s.ang),along=dx*c+dy*sn,across=-dx*sn+dy*c;
  return along>=-s.back&&along<=s.len&&Math.abs(across)<=s.half+pad;
 }}));
 assert(moveLateNpc(e,fixture.intent,fixture.t-fixture.begin,hazards),'the first fan is escapable; the future fan must not cause generic fallback into it');
 const path=[e.timedRoute.previous,...e.timedRoute.path];
 for(const h of hazards){const n=path.findIndex(p=>p.t>=h.t1),a=path[n-1],b=path[n];assert(a&&b,'route must cover every hazard deadline');const f=(h.t1-a.t)/(b.t-a.t);assert(!h.hit({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}),`unsafe ${h.shape.type} at ${h.t1}`);}
});
test('an exhausted search returns control without moving or teleporting the actor',()=>{
 const e=setup(),before={...e};S.t=.017;
 assert.equal(moveLateNpc(e,{x:10,y:0},.017,[{t1:.2,hit:()=>true}]),false);
 assert.deepEqual({x:e.x,y:e.y},before);assert.deepEqual(e.timedRoute.path,[]);
});
