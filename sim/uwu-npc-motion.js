/* Reactive local movement. Reference coordinates describe intent, not immunity. */
(function(root){
'use strict';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function observedSprintSpeed(role,absoluteTime,replay,base=6){
 return (replay?.motionEvents||[]).some(e=>e.type==='sprint'&&e.role===role&&absoluteTime>=e.start&&absoluteTime<e.end)?base*1.3:base;
}
function move(actor,intent,dt,{time,radius,speed=6,hazards=[],future=()=>intent}){
 const active=hazards.filter(h=>h.t1>=time-1e-7&&h.t1-time<=3.5);
 const safe=p=>Math.hypot(p.x,p.y)<radius-.25&&!active.some(h=>h.hit(p,.25));
 const threatens=h=>{
  const desired=future(h.t1),d=distance(actor,desired),f=d?Math.min(1,speed*(Math.max(0,h.t1-time)+dt)/d):1;
  const reachable={x:actor.x+(desired.x-actor.x)*f,y:actor.y+(desired.y-actor.y)*f};
  return h.hit(reachable,.25);
 };
 const threat=active.some(threatens);
 let goal=intent;
 if(threat){
  if(actor.avoidGoal&&safe(actor.avoidGoal)&&active.every(h=>{
   const d=distance(actor,actor.avoidGoal),f=d?Math.min(1,Math.max(0,h.t1-time)*speed/d):1;
   return !h.hit({x:actor.x+(actor.avoidGoal.x-actor.x)*f,y:actor.y+(actor.avoidGoal.y-actor.y)*f},.05);
  }))goal=actor.avoidGoal;
  else{
   let best=null,score=Infinity;
   const deadline=Math.min(...active.filter(threatens).map(h=>h.t1));
   for(let r=.5;r<=Math.min(24,speed*Math.max(.1,deadline-time));r+=.5)for(let j=0;j<48;j++){
    const angle=j*Math.PI/24,p={x:actor.x+Math.cos(angle)*r,y:actor.y+Math.sin(angle)*r};
    if(!safe(p))continue;
    // Verify the travel path at every imminent snapshot, not just its endpoint.
    if(active.some(h=>{const f=Math.min(1,Math.max(0,h.t1-time)*speed/r);return h.hit({x:actor.x+(p.x-actor.x)*f,y:actor.y+(p.y-actor.y)*f},.05);} ))continue;
    const cost=r+distance(p,intent)*.25;
    if(cost<score){score=cost;best=p;}
   }
   if(best){goal=best;actor.avoidGoal=best;}
   else {
    // Sequential mechanics can have disjoint safe areas. Never abandon an
    // earlier safe position just because it is inside a later telegraph.
    const first=Math.min(...active.map(h=>h.t1)),urgent=active.filter(h=>h.t1<=first+.05);
    const urgentSafe=p=>Math.hypot(p.x,p.y)<radius-.25&&!urgent.some(h=>h.hit(p,.25));
    if(urgentSafe(actor))goal={x:actor.x,y:actor.y};
    else {
     let closest=Infinity;
     for(let r=.25;r<=Math.min(24,speed*Math.max(.05,first-time));r+=.25)for(let j=0;j<48;j++){
      const angle=j*Math.PI/24,p={x:actor.x+Math.cos(angle)*r,y:actor.y+Math.sin(angle)*r};
      if(urgentSafe(p)&&r+distance(p,intent)*.25<closest){goal=p;closest=r+distance(p,intent)*.25;}
     }
    }
    actor.avoidGoal=goal;
   }
  }
 }
 if(actor.avoidGoal){
  if(!threat){goal=intent;if(distance(actor,intent)<=speed*dt){delete actor.avoidGoal;}}
  const d=distance(actor,goal),f=d>0?Math.min(1,speed*dt/d):0;
  const dx=(goal.x-actor.x)*f,dy=(goal.y-actor.y)*f;
  if(Math.hypot(dx,dy)>1e-8)actor.face=Math.atan2(dy,dx);
  actor.x+=dx;actor.y+=dy;
 }else{
  // Event-resource samples can briefly jump back to an older coordinate.
  // The reference is an intent, not authority to teleport: a feasible track
  // is reached exactly, and larger gaps are traversed at the walking speed.
  const d=distance(actor,intent),f=d?Math.min(1,speed*dt/d):0;
  const dx=(intent.x-actor.x)*f,dy=(intent.y-actor.y)*f;
  if(Math.hypot(dx,dy)>1e-8)actor.face=Math.atan2(dy,dx);
  actor.x+=dx;actor.y+=dy;
 }
}
const api={move,observedSprintSpeed};root.UwuNpcMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
