'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const sim=require('../sim/uwu-titan.js');
const reference=require('../sim/uwu-reference.js');
const {S}=sim;
function setup(role=0){globalThis.UWU_REFERENCE=reference;Object.assign(S.opts,{preset:'reference',randomJumps:false,start:27,role,god:true});sim.reset();}
function advance(abs){const end=abs-sim.REFERENCE_ORIGIN;while(S.t<end-1e-8&&!S.over)sim.step(Math.min(.005,end-S.t));}
function atHazard(abs,role=0){setup(role);advance(abs-.005);const hazard=S.aoes.find(a=>a.shape?.type==='circle'&&Math.abs(a.t1+sim.REFERENCE_ORIGIN-abs)<1e-6);assert(hazard);return hazard;}
for(const [label,time] of [['Bury first five',336.230],['Burst first five',341.815],['Bury sixth',344.228],['Burst sixth',349.795]]){
  test(`${label}: normal collision displays death and failure; observation remains nonfatal`,()=>{
    try{
      for(const god of [false,true]){
        const hazard=atHazard(time);Object.assign(S.ents[0],hazard.shape.c);S.opts.god=god;advance(time+.005);
        assert.equal(S.ents[0].dead,!god);assert.equal(S.ents[0].plannedDeath,false);
        if(god)assert.equal(S.over,null);else {assert.equal(S.over.win,false);assert.match(S.over.reason,/炸彈/);}
      }
    }finally{delete globalThis.UWU_REFERENCE;}
  });
}
test('Bury includes the actor hitbox and excludes points beyond 4.3m',()=>{
  try{
    assert.equal(sim.CFG.bombLandR,4.3);assert.equal(sim.CFG.bombR,6.3);
    for(const [offset,fatal] of [[4.29,true],[4.31,false]]){
      const hazard=atHazard(336.230);Object.assign(S.ents[0],{x:hazard.shape.c.x+offset,y:hazard.shape.c.y});
      assert.equal(hazard.hit(S.ents[0]),fatal);S.opts.god=false;S.t=hazard.t1;hazard.onHit.call(hazard);
      assert.equal(S.ents[0].dead,fatal);assert.equal(!!S.over,fatal);
    }
  }finally{delete globalThis.UWU_REFERENCE;}
});
test('Upheaval off-edge knockback visibly kills normal player and gives no sacrifice credit',()=>{
  try{
    for(const god of [false,true]){
      setup();advance(339.260);Object.assign(S.ents[0],{x:0,y:0});S.opts.god=god;advance(339.270);
      assert(S.ents[0].fallY<0);assert.equal(S.ents[0].dead,!god);assert(!S.ents[0].plannedDeath);
      if(god)assert.equal(S.over,null);else assert.equal(S.over.win,false);
    }
  }finally{delete globalThis.UWU_REFERENCE;}
});
test('actual gaol binding protects the encased player from sixth Burst only until release',()=>{
  try{
    const hazard=atHazard(349.795,2);assert(S.jailed[2]);Object.assign(S.ents[2],hazard.shape.c);S.opts.god=false;
    advance(349.800);assert.equal(S.over,null);assert.equal(S.ents[2].dead,false);
    delete S.jailed[2];hazard.onHit.call(hazard);assert.equal(S.over.win,false);assert(S.ents[2].dead);
  }finally{delete globalThis.UWU_REFERENCE;}
});
test('random normal deaths display a corpse, while observation keeps control and planned deaths remain separate',()=>{
  Object.assign(S.opts,{preset:'random',start:22,role:4,god:false});sim.reset();sim.kill(4,'unplanned rock');assert(S.ents[4].dead);assert(!S.ents[4].plannedDeath);assert.equal(S.over.win,false);
  S.opts.god=true;sim.reset();sim.kill(4,'unplanned rock');assert(!S.ents[4].dead);assert.equal(S.over,null);
});
test('observation mode stays visible in HUD and hint panel even with hints disabled',()=>{
  const fs=require('node:fs'),vm=require('node:vm');
  const elements=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,{style:{},classList:{toggle(){}},querySelector(){return {textContent:''}}});return elements.get(id)};
  const context={module:{exports:{}},document:{getElementById:get},addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../sim/uwu-titan.js'),'utf8')+'\nmodule.exports.updateHud=updateHud;module.exports.updatePanel=updatePanel;',context);
  const view=context.module.exports;
  Object.assign(view.S.opts,{preset:'reference',randomJumps:false,start:27,god:true,hints:false});view.reset();view.updateHud();view.updatePanel();
  assert.match(get('statusline').textContent,/觀摩模式：碰撞不判失敗/);
  assert.match(get('hint').textContent,/^觀摩模式：碰撞不判失敗/);
  view.S.opts.god=false;view.updateHud();view.updatePanel();
  assert.doesNotMatch(get('statusline').textContent,/觀摩模式/);
  assert.doesNotMatch(get('hint').textContent,/觀摩模式/);
});

test('source dimensions include former Weight and bomb blind bands',()=>{
 try{
  for(const [at,radius] of [[368.255,6],[336.230,4.3],[341.815,6.3]]){
   for(const [distance,hit] of [[radius-.05,true],[radius+.05,false]]){
    const a=atHazard(at);Object.assign(S.ents[0],{x:a.shape.c.x+distance,y:a.shape.c.y});
    assert.equal(a.hit(S.ents[0]),hit,`${at}: ${distance}m`);
    S.opts.god=false; a.onHit.call(a);assert.equal(S.ents[0].dead,hit,`${at}: actual player damage`);
   }
  }
 }finally{delete globalThis.UWU_REFERENCE;}
});
test('Titan five lanes use width six and distinct boss/helper forward and rear extents',()=>{
 try{
  setup();advance(373.205-.005);
  const lanes=S.aoes.filter(a=>a.shape?.type==='rect'&&Math.abs(a.t1+sim.REFERENCE_ORIGIN-373.205)<.002);
  assert.equal(lanes.length,5);
  for(const [i,a] of lanes.entries()){
   const sh=a.shape,ux=Math.cos(sh.ang),uy=Math.sin(sh.ang),point=(along,side)=>({x:sh.from.x+along*ux-side*uy,y:sh.from.y+along*uy+side*ux});
   const front=i===0?44.55:40.5,back=i===0?4.55:.5;
   assert(a.hit(point(10,2.95)),`lane ${i} missing 2..3m band`);assert(!a.hit(point(10,3.05)));
   assert(a.hit(point(front-.05,0)));assert(!a.hit(point(front+.05,0)));
   assert(a.hit(point(-back+.05,0)));assert(!a.hit(point(-back-.05,0)));
  }
 }finally{delete globalThis.UWU_REFERENCE;}
});

for(const [name,time,length,half] of [['Rock Buster',439.692,10.55,Math.PI/3],['Mountain Buster',443.808,15.55,Math.PI/4]]){
 test(`${name} uses sourced reach and the explicitly provisional BossMod cone angle`,()=>{
  try{
   setup();advance(time-.01);
   const a=S.aoes.find(a=>a.shape?.type==='cone'&&Math.abs(a.t1+sim.REFERENCE_ORIGIN-time)<.001);assert(a);
   const from=a.shape.from(),to=a.shape.to(),angle=Math.atan2(to.y-from.y,to.x-from.x);
   for(const [radius,offset,expected] of [[length-.01,0,true],[length+.01,0,false],[5,half-.001,true],[5,half+.001,false]]){
    const p={x:from.x+radius*Math.cos(angle+offset),y:from.y+radius*Math.sin(angle+offset)};
    assert.equal(a.hit(p),expected,JSON.stringify({radius,offset}));
   }
  }finally{delete globalThis.UWU_REFERENCE;}
 });
}

test('synthetic Landslide uses the same main and helper rectangles as reference practice',()=>{
 Object.assign(S.opts,{preset:'random',start:43.39,god:true,randomJumps:false,role:0});sim.reset();sim.step(.02);
 const lanes=S.aoes.filter(a=>a.shape?.type==='rect'&&a.t1===45.6);assert.equal(lanes.length,5);
 for(const [i,a] of lanes.entries()){
  assert.equal(a.shape.half,3);assert.equal(a.shape.len,i===0?44.55:40.5);assert.equal(a.shape.back,i===0?4.55:.5);
 }
});
test('synthetic tank cones preserve the calibrated distinct reaches',()=>{
 for(const [start,length,half] of [[12.09,10.55,Math.PI/3],[15.29,15.55,Math.PI/4]]){
  Object.assign(S.opts,{preset:'random',start,god:true,randomJumps:false,role:0});sim.reset();sim.step(.02);
  const a=S.aoes.find(a=>a.shape?.type==='cone'&&!a.done);assert(a);assert.equal(a.shape.len,length);assert.equal(a.shape.half,half);
 }
});
test('synthetic ordinary NPC walking is capped at six metres per second',()=>{
 Object.assign(S.opts,{preset:'random',start:0,god:false,randomJumps:false,role:0});sim.reset();S.events=[];
 for(const e of S.ents)Object.assign(e,{x:0,y:0});
 sim.step(.1);
 assert(S.ents.slice(1).some(e=>Math.hypot(e.x,e.y)>.59),'test exercises actual walking');
 for(const e of S.ents.slice(1))assert(Math.hypot(e.x,e.y)<=.6+1e-8);
});
