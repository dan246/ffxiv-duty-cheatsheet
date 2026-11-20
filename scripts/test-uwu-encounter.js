'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {S,reset,step,contains,goal,shapes,useSkill,sampleTrack,roleSample,npcRoleSample,sceneActors,sceneGuides,MARKERS}=require('../sim/uwu');
const timeline=require('../sim/uwu-timeline');
function start(phase,time,role=4,seed=0){
  S.opts.role=role;S.opts.god=false;reset(phase,seed,time);
}
function advance(t){
  while(S.t<t&&!S.dead&&!S.done)step(Math.min(.025,t-S.t));
}
test('seeds reproduce the three supported primal orders and six distinct Suppression assignments',()=>{
  const orders=new Set(),targets=new Set();
  for(let seed=0;seed<40;seed++){
    const events=timeline.build('ultima',seed);
    assert.deepEqual(events,timeline.build('ultima',seed));
    orders.add(events.filter(e=>e.kind==='summon').map(e=>e.primal).join(''));
    const s=timeline.assignments(seed);
    assert.equal(new Set([...s.eruptions,...s.singers,s.pillar]).size,6);
    assert.ok(s.eruptions.includes(s.gaol));
    targets.add(s.gaol);
  }
  assert.deepEqual([...orders].sort(),['土火風','火風土','風火土'].sort());
  assert.ok(targets.size>=3);
});
test('both predation waypoints are safe and permit the second movement in two seconds',()=>{
  for(let seed=0;seed<4;seed++){
    start('ultima',595,4,seed);const a=S.events.find(e=>e.kind==='pred1'),b=S.events.find(e=>e.kind==='pred2');
    const p=goal(a,4),q=goal(b,4);
    assert.ok(!shapes(a).some(s=>contains(s,p)));assert.ok(!shapes(b).some(s=>contains(s,q)));
    const followups=S.events.filter(e=>['pred2','predTornado','crimsonCross'].includes(e.kind)&&e.t<617);
    assert.ok(followups.flatMap(shapes).some(s=>contains(s,p)),'the awakened cross requires leaving the first safe spot');
    assert.ok(followups.flatMap(shapes).every(s=>!contains(s,q)));
    assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<12);
  }
});
test('a Feather Rain snapshots the controlled position at the recorded cast start',()=>{
  function prepare(){
    const role=timeline.build('garuda',0).find(e=>e.kind==='bait'&&e.t===71.459).targets[0];
    start('garuda',70.4,role);Object.assign(S.ents[role],{x:11,y:0});
    advance(70.8);
    const e=S.events.find(e=>e.kind==='bait');
    assert.equal(e.t,71.459);assert(Math.abs(e.lead-.98)<.02);
    assert.ok(e.hazards.some(s=>contains(s,S.ents[S.opts.role])));
  }
  prepare();advance(71.47);assert.ok(S.dead);
  prepare();
  while(S.t<71.47&&!S.dead)step(.025,new Set(['s']));
  assert.equal(S.dead,false);
});
test('caster LB requires the assigned role input inside the deadline',()=>{
  start('intermission',498,7);advance(501.51);assert.ok(S.dead);
  start('intermission',498,7);useSkill('lb');advance(501.51);assert.equal(S.dead,false);
  start('intermission',498,0);advance(501.51);assert.equal(S.dead,false);
});
test('tether checkpoint restores actual MT two stacks and D4 one and their later removal packets',()=>{
  start('garuda',116,7);S.opts.god=true;
  assert.equal(S.charges,3);assert.deepEqual(S.stacks,[2,1,1,1,0,0,1,1]);
  const target=goal(S.events.find(e=>e.kind==='tethers'),7);
  while(S.t<125.63){Object.assign(S.ents[7],target);step(.025);}
  assert.equal(S.charges,3);assert.equal(S.stacks[0],2);assert.equal(S.stacks[7],1);
  Object.assign(S.ents[7],roleSample(7,125.675));step(.05);
  assert.equal(S.charges,4);assert.equal(S.stacks[0],0);assert.equal(S.stacks[7],0);
  assert.ok(S.events.every(e=>e.t>=116));
});
test('seed edits retain current phase, checkpoint and reset transient state',()=>{
  start('ultima',731,4);S.opts.seed=23;S.gaol={x:8,y:0};S.dead=true;reset();
  assert.equal(S.seed,23);assert.equal(S.phase,'ultima');assert.equal(S.t,731);assert.equal(S.gaol,null);assert.equal(S.dead,false);
});
test('stone prison requires a nearby free player to release it',()=>{
  start('ultima',754,0);S.gaol={x:8,y:3};useSkill('attack');assert.ok(S.gaol);
  Object.assign(S.ents[0],S.gaol);useSkill('attack');assert.equal(S.gaol,null);
});
test('playback reaches each phase boundary and never evaluates skipped mechanics',()=>{
  for(const phase of Object.keys(timeline.phases)){
    for(const [checkpoint] of timeline.phases[phase].points){
      start(phase,checkpoint);S.opts.god=true;advance(S.end);
      assert.ok(S.done);assert.equal(S.dead,false);assert.ok(S.events.every(e=>e.done&&e.t>=checkpoint));
    }
  }
});
test('fetter distance remains active after the cast, allows a brief stretch and resets on recovery',()=>{
  start('ultima',644,1);S.events=[];Object.assign(S.ents[1],{x:15,y:0});
  advance(644.6);assert.ok(!S.dead);
  Object.assign(S.ents[1],S.ents[4],{i:1});advance(644.7);
  Object.assign(S.ents[1],{x:15,y:0});advance(645.3);assert.ok(!S.dead);
  advance(645.6);assert.ok(S.dead);assert.match(S.reason,/炎獄之鎖/);
});
test('wall contact fails practice and observation logs a continuous contact only once',()=>{
  start('garuda',0,4);Object.assign(S.ents[4],{x:19.99,y:0});step(.1,new Set(['d']));assert.ok(S.dead);
  start('garuda',0,4);S.opts.god=true;Object.assign(S.ents[4],{x:19.99,y:0});
  for(let i=0;i<10;i++)step(.025,new Set(['d']));assert.equal(S.errors,1);assert.ok(!S.dead);
});
test('gaol carrier must place the prison at the assigned south position',()=>{
  for(const [x,y,dead] of [[3,5,false],[-10,-10,true]]){
    start('ultima',753.67,timeline.assignments(0).gaol);
    S.events=S.events.filter(e=>e.kind==='gaol');Object.assign(S.ents[S.opts.role],{x,y});
    advance(753.7);assert.equal(S.dead,dead);assert.deepEqual([S.gaol.x,S.gaol.y],[x,y]);
  }
});
test('Boom checkpoint restores four solo tank soaks and spent Suppression tether',()=>{
  start('ultima',780);assert.deepEqual(S.orbSoaks,[1,1,1,1]);assert.deepEqual(S.stacks.slice(1,4),[0,0,0]);
});
test('orb needs actual touch, four assigned members, and the correct group',()=>{
  function layout(role,playerX,missing=false,everyoneOutside=false){
    start('ultima',799.21,role);S.events=S.events.filter(e=>e.kind==='grouporb'&&e.orb===0);
    for(const p of S.ents)Object.assign(p,p.i%2===0?{x:everyoneOutside?-3.5:-6,y:4}:{x:8,y:4});
    Object.assign(S.ents[role],{x:playerX,y:4});if(missing)S.ents[6].y=15;
    advance(799.224);
  }
  layout(0,-6);assert.ok(!S.dead);assert.ok(S.events[0].done);
  layout(0,-3.5,false,true);assert.ok(S.dead);assert.match(S.reason,/融合/);
  layout(0,-6,true);assert.ok(S.dead);assert.match(S.reason,/四名/);
  layout(1,-6);assert.ok(S.dead);assert.match(S.reason,/另一組/);
});
test('each role can walk both assigned orb pairs with the normal scripted party',()=>{
  for(let role=0;role<8;role++){
    start('ultima',795,role);S.cam=0;Object.assign(S.ents[role],{x:0,y:0});
    while(S.t<804&&!S.dead){
      const keys=new Set();
      const orb=S.events.find(e=>e.kind==='grouporb'&&!e.done&&e.orb%2===role%2&&S.t>=e.t-e.lead);
      const boom=S.events.find(e=>e.kind==='boom'&&!e.done);
      const dest=boom?goal(boom,role):orb?goal(orb,role):S.orbRally[role%2];
      if(dest){
        const p=S.ents[role];
        if(Math.abs(dest.x-p.x)>.1)keys.add(dest.x>p.x?'d':'a');
        if(Math.abs(dest.y-p.y)>.1)keys.add(dest.y>p.y?'s':'w');
      }
      step(.025,keys);
    }
    assert.equal(S.dead,false,S.reason);
    assert.equal(S.events.filter(e=>e.kind==='grouporb'&&e.done).length,4);
  }
});

test('Garuda checkpoints restore teaching NPC positions, player practice position and raw boss/guide samples',()=>{
  const ref=require('../sim/uwu-reference').garuda,ids=['MT','ST','H1','H2','D1','D2','D3','D4'];
  for(const [t] of timeline.phases.garuda.points){
    start('garuda',t);
    for(let i=0;i<8;i++)assert.deepEqual({x:S.ents[i].x,y:S.ents[i].y},i===S.opts.role?roleSample(i,t):npcRoleSample(i,t));
    assert.deepEqual(sceneActors(t)[0].pos,sampleTrack(ref.bossPath,t));
    assert.deepEqual(sceneGuides()[0].pos,sampleTrack(ref.paths.D1,t));
  }
  assert.equal(MARKERS.length,8);
});
test('teaching NPCs and raw reference guide stay separate while the controlled player stays free',()=>{
  const t=5;start('garuda',t,4);S.events=[];
  const initial={x:S.ents[4].x,y:S.ents[4].y};
  for(let i=0;i<20;i++)step(.025);
  assert.deepEqual({x:S.ents[4].x,y:S.ents[4].y},initial);
  assert.deepEqual({x:S.ents[0].x,y:S.ents[0].y},npcRoleSample(0,S.t));
  S.cam=0; // This assertion tests world-X movement, separately from reset camera facing.
  const before=S.ents[4].x;step(.05,new Set(['d']));assert.ok(S.ents[4].x>before);
  assert.deepEqual(sampleTrack([[2,0,0],[4,10,4]],3),{x:5,y:2});
});
test('fight 13 ends on the Ifrit cast start and excludes cancelled or post-kill Garuda attacks',()=>{
  const e=timeline.build('garuda',0);
  assert.equal(timeline.phases.garuda.end,152.558);
  assert.deepEqual(e.filter(a=>a.kind==='cone').map(a=>a.t),[7.641,23.018,121.327,141.827]);
  assert.equal(e.find(a=>a.kind==='song').t,10.216);
  assert.deepEqual(e.find(a=>a.kind==='song').targets,[1,2,3]);
  assert.deepEqual(e.filter(a=>a.kind==='whirl').map(a=>a.t),[16.313,22.484,28.664,105.374]);
  assert.deepEqual(e.filter(a=>a.kind==='wheel').map(a=>a.t),[99.782]);
  assert.deepEqual(e.find(a=>a.kind==='tethers').targets,[0,7]);
  assert.ok(!e.some(a=>a.kind==='donut'));
});
test('recorded ST cleanse accepts the bubble edge and rejects a player standing outside',()=>{
  start('garuda',46.3,1);S.events=[];
  Object.assign(S.ents[1],{x:-3.05,y:.1});advance(46.39);
  assert.equal(S.dead,false);assert.equal(S.stacks[1],0);assert.equal(S.charges,1);
  start('garuda',46.3,1);S.events=[];
  Object.assign(S.ents[1],{x:0,y:2});advance(46.39);
  assert.equal(S.dead,true);assert.equal(S.stacks[1],2);
});
test('logged Mistral Song damage arrives after cast completion in ST, H1, H2 order',()=>{
  start('garuda',10.3,4);advance(10.61);
  assert.ok(!S.log.some(line=>line.includes('實錄傷害')));
  advance(10.886);
  assert.deepEqual(S.log.filter(line=>line.includes('實錄傷害')).map(line=>line.slice(-2)),['H2','H1','ST']);
});
test('fight 13 Wicked Wheel is on the northeast main boss and the recorded middle remains safe',()=>{
  start('garuda',96,4);
  const [wheel]=shapes(S.events.find(e=>e.kind==='wheel'));
  assert.ok(Math.hypot(wheel.c.x-9.85,wheel.c.y+11.64)<2);
  assert.ok(contains(wheel,{x:9.85,y:-11.64}));
  assert.ok(!contains(wheel,{x:0,y:0}));
  assert.ok(Math.hypot(roleSample(7,124).x+7.08,roleSample(7,124).y+.16)<2);
  assert.ok(Math.hypot(roleSample(0,124).x-8.87,roleSample(0,124).y-1.41)<2);
});

test('API tracks preserve every logged player sample',()=>{
  const paths=require('../sim/uwu-reference').garuda.paths;
  let count=0;
  for(const [i,role] of ['MT','ST','H1','H2','D1','D2','D3','D4'].entries()){
    for(const [t,x,y] of paths[role]){assert.deepEqual(roleSample(i,t),{x,y});count++;}
  }
  assert(count>1900);
});
// Raw event tracks are observations, not a synthesized zero-error safe route.
// Full-phase NPC clock/position checks live in test-uwu-raw-replay.js;
// controlled-player collision and input tests above remain enabled.
