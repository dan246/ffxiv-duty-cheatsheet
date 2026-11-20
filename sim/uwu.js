const npcMotion=typeof require==='function'?require('./uwu-npc-motion'):globalThis.UwuNpcMotion;
'use strict';
const timeline = typeof module === 'undefined' ? UwuTimeline : require('./uwu-timeline.js');
const referenceData=(typeof module==='undefined'?window.UWU_REFERENCE:require('./uwu-reference.js')).garuda;
// Tracks preserve the report clock across every checkpoint. Only NPCs follow them.
function sampleTrack(track,t,teaching=false) {
  if(!track?.length)return null;
  let lo=0,hi=track.length-1;
  while(lo<hi){const mid=Math.floor((lo+hi)/2);if(track[mid][0]<t)lo=mid+1;else hi=mid;}
  const b=track[lo],a=track[Math.max(0,lo-1)];
  if(b[0]===t||t>=track[track.length-1][0])return {x:b[1],y:b[2]};
  const duration=teaching?Math.min(b[0]-a[0],Math.hypot(b[1]-a[1],b[2]-a[2])/6):b[0]-a[0];
  const departure=teaching?b[0]-duration:a[0];
  const fraction=duration<=0?0:Math.max(0,Math.min(1,(t-departure)/duration));
  return {x:a[1]+fraction*(b[1]-a[1]),y:a[2]+fraction*(b[2]-a[2])};
}
let practicePaths;
const tankImpactWindows=[];
function roleSample(role,t){
  if(!practicePaths)practicePaths=buildGarudaPracticePaths();
  return sampleTrack(practicePaths[role],t);
}
// Hold between instructional anchors, then move at 6 m/s to arrive exactly
// on the next timestamp. Raw reference and player practice paths stay separate.
function npcRoleSample(role,t){
  if(!practicePaths)practicePaths=buildGarudaPracticePaths();
  const impactWindow=role===0&&tankImpactWindows.some(([a,b])=>t>=a&&t<=b);
  return sampleTrack(practicePaths[role],t,!referenceData.rawCoordinates&&!impactWindow);
}
const mesohighSpots={0:{x:8.87,y:1.41},7:{x:-7.08,y:-.16}};
const CFG = {R:20,swR:14,stackR:4,fetterMax:10,slipstreamHalf:Math.PI/4};
const ROLES=['MT','ST','H1','H2','D1','D2','D3','D4'];
const ROLE_COLOR=['#6096ff','#6096ff','#5fd08a','#5fd08a','#ff7b7b','#ff7b7b','#ff7b7b','#ff7b7b'];
const DIR_NAME=['北','東北','東','東南','南','西南','西','西北'];
const isGarudaView=typeof location==='undefined'||!['ultima','intermission'].includes(new URLSearchParams(location.search).get('phase'));
const MARKERS=isGarudaView?referenceData.markers:[['A',0,-13,'#ff6b6b'],['B',13,0,'#ffd166'],['C',0,13,'#6096ff'],['D',-13,0,'#c084fc']];
const rad=d=>d*Math.PI/180, polar=(d,r)=>({x:Math.sin(rad(d))*r,y:-Math.cos(rad(d))*r});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), clamp01=n=>Math.max(0,Math.min(1,n));
const O={x:0,y:0};
const UWU_ASSET_PHASE=typeof location!=='undefined'&&['ultima','intermission'].includes(new URLSearchParams(location.search).get('phase'))?'ultima':'garuda';
const S={opts:{role:4,speed:1,god:false,hints:true,assist:true,view:'game'},cam:0,pitch:.53,dist:34};
const me=()=>S.ents[S.opts.role];
const pos=(x,y)=>({x,y});
const circle=(c,r)=>({type:'circle',c:{...c},r});
const donut=(c,inner,r=45)=>({type:'donut',c:{...c},inner,r});
const strip=(deg,half,c=O)=>({type:'strip',deg,half,c:{...c}});
function contains(s,p) {
  if(s.type==='circle')return dist(s.c,p)<=s.r;
  if(s.type==='donut')return dist(s.c,p)>=s.inner&&dist(s.c,p)<=s.r;
  if(s.type==='strip'){const dx=p.x-(s.c?.x||0),dy=p.y-(s.c?.y||0),along=dx*Math.sin(rad(s.deg))-dy*Math.cos(rad(s.deg));return Math.abs(dx*Math.cos(rad(s.deg))+dy*Math.sin(rad(s.deg)))<=s.half&&(!s.length||along>=-(s.back||0)&&along<=s.length);}
  const a=s.from(), b=s.to(), dx=p.x-a.x,dy=p.y-a.y;
  return Math.hypot(dx,dy)<=s.len && Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-Math.atan2(b.y-a.y,b.x-a.x)),Math.cos(Math.atan2(dy,dx)-Math.atan2(b.y-a.y,b.x-a.x))))<=s.half;
}
function npcHazardHit(shape,point,pad=0){
  if(!pad)return contains(shape,point);
  const expanded={...shape};
  if(shape.type==='circle')expanded.r+=pad;
  if(shape.type==='donut'){expanded.inner-=pad;expanded.r+=pad;}
  if(shape.type==='strip')expanded.half+=pad;
  return contains(expanded,point);
}
const garudaPos=t=>sampleTrack(referenceData.bossPath,t);
function bubbleCenter(){
  if(Array.isArray(referenceData.bubble))return pos(...referenceData.bubble);
  if(referenceData.bubble)return referenceData.bubble;
  // Tooltip at 39 s: world (92.12,99.77), centered on (100,100).
  return sampleTrack(referenceData.spinyPath,42.665)||pos(-7.88,-.23);
}
// The 24 replay frames per role omit fast dodges. Preserve every source frame
// and add marked instructional waypoints only between them. Collision checks
// still use actual actor positions, including a player's chosen bait or facing.
function buildGarudaPracticePaths(){
  if(referenceData.rawCoordinates)return ROLES.map(role=>referenceData.paths[role]);
  const paths=ROLES.map(role=>referenceData.paths[role].map(point=>[...point]));
  function add(i,t,p){
    if(!paths[i].some(point=>Math.abs(point[0]-t)<1e-7)){
      paths[i].push([t,p.x,p.y]);paths[i].sort((a,b)=>a[0]-b[0]);
    }
  }
  function raw(i,t){return sampleTrack(referenceData.paths[ROLES[i]],t);}
  function nearestSafe(origin,accept,maxDistance){
    if(accept(origin))return origin;
    for(let r=.16;r<=maxDistance;r+=.16){
      for(let j=0;j<72;j++){
        const direction=j*Math.PI/36,p=pos(origin.x+r*Math.cos(direction),origin.y+r*Math.sin(direction));
        if(dist(p,O)<19.7&&accept(p))return p;
      }
    }
    return origin;
  }
  for(const e of timeline.build('garuda',0)){
    if(e.kind==='buster') {
      // A normal-speed reconstructed tank must still be separated from the
      // group when the real cleave resolves; retain its original timed position.
      const before=sampleTrack(paths[0],e.t-.035),after=sampleTrack(paths[0],e.t+.045);
      add(0,e.t-.035,before);add(0,e.t+.045,after);
      tankImpactWindows.push([e.t-.035,e.t+.045]);
    }
    if(e.kind!=='cone'&&e.kind!=='bait')continue;
    const lock=e.t-e.lead;
    const baits=paths.map((track,i)=>{
      const p=sampleTrack(track,lock);
      add(i,lock,p);add(i,lock+.045,p);return p;
    });
    const from=garudaPos(lock);
    const cone={type:'cone',from:()=>from,to:()=>baits[0],half:CFG.slipstreamHalf+.065,len:12.3};
    for(let i=0;i<8;i++){
      const recorded=raw(i,e.t);
      const end=e.kind==='bait'
        ?nearestSafe(baits[i],p=>baits.every(b=>dist(p,b)>3.36),5.7)
        :nearestSafe(recorded,p=>!contains(cone,p),12);
      add(i,e.t-.035,end);add(i,e.t+.045,end);add(i,e.t+1.5,raw(i,e.t+1.5));
    }
  }
  for(const [t,i,count] of timeline.thermalUpdates){
    if(count||t>100)continue;
    const center=bubbleCenter(),p=raw(i,t),d=dist(center,p);
    if(d<=4.9)continue;
    const edge=pos(center.x+(p.x-center.x)*4.7/d,center.y+(p.y-center.y)*4.7/d);
    add(i,t-1.2,raw(i,t-1.2));add(i,t-.04,edge);add(i,t+.05,edge);add(i,t+1.2,raw(i,t+1.2));
  }
  return paths;
}
function restoreThermals(start){
  S.bubbleInside=S.ents.map(p=>start>=42.665&&start<69&&dist(p,bubbleCenter())<=5);S.thermalIndex=0;S.receivedThermal={};S.tetherHolds={};S.wasInsideBubble=start>=42.665&&start<69&&dist(me(),bubbleCenter())<=5;S.damageIndex=timeline.garudaDamage.findIndex(([t])=>t>=start);
  if(S.damageIndex<0)S.damageIndex=timeline.garudaDamage.length;
  while(S.thermalIndex<timeline.thermalUpdates.length&&timeline.thermalUpdates[S.thermalIndex][0]<start){
    const [,role,count]=timeline.thermalUpdates[S.thermalIndex++];
    if(!count&&S.stacks[role]===2)S.charges++;
    S.stacks[role]=count;
  }
}
function advanceThermals(){
  while(S.thermalIndex<timeline.thermalUpdates.length&&timeline.thermalUpdates[S.thermalIndex][0]<=S.t){
    const [t,role,count]=timeline.thermalUpdates[S.thermalIndex++],old=S.stacks[role];
    const marked=role===S.opts.role;
    if(!count&&!old)continue;
    // The party's packet times are observed. A player's delayed debuff uses the cast result.
    // Cleansing in the field accepts its near edge, not just the reference player's exact spot.
    let eligible=true;
    {
      if(count){
        const key=t<40?'cyclone':t<56?'friction1':'friction2';
        eligible=S.receivedThermal[key+':'+role]!==false;
      }else if(t<100)eligible=dist(S.ents[role],bubbleCenter())<=5.75;
      else eligible=S.tetherHolds[role]!==false;
    }
    if(!eligible){
      if(!count)actorFailure(role,t<100?'低氣壓：請進入刺羽罩的範圍清層':'低氣壓：未成功截線');
      if(S.dead)return;
      continue;
    }
    if(!count&&old>=3){actorFailure(role,'清除三層低氣壓引發團滅');if(S.dead)return;}
    if(!count&&old===2)S.charges++;
    S.stacks[role]=count?old+1:count;
    if(marked||(!count&&old===2))log(ROLES[role]+(count?'・低氣壓 '+S.stacks[role]+' 層':'・清除 '+old+' 層'),t);
  }
}
function trackBubbleEntry(){
  if(S.t<42.665||S.t>=69)return;
  for(const actor of S.ents){
    const role=actor.i,inside=dist(actor,bubbleCenter())<=5,count=S.stacks[role];
    if(inside&&!S.bubbleInside[role]&&count){
      const next=timeline.thermalUpdates.slice(S.thermalIndex).find(update=>update[1]===role);
      if(!next||next[2]!==0||next[0]-S.t>1.5){
        if(count>=3)actorFailure(role,'清除三層低氣壓引發團滅');
        if(count===2)S.charges++;
        S.stacks[role]=0;log(ROLES[role]+'・提早入罩，清除 '+count+' 層');
      }
    }
    S.bubbleInside[role]=inside;
  }
  S.wasInsideBubble=S.bubbleInside[S.opts.role];
}
function garudaNpcIntent(i,t){
  const next=timeline.thermalUpdates.slice(S.thermalIndex).find(a=>a[1]===i);
  if(next&&next[2]===0&&next[0]<100&&next[0]-t<=1.5&&S.stacks[i]>0){
    const c=bubbleCenter(),p=S.ents[i],d=dist(p,c);
    if(d<=4.7)return pos(p.x,p.y);
    return pos(c.x+(p.x-c.x)*4.7/d,c.y+(p.y-c.y)*4.7/d);
  }
  return npcRoleSample(i,t);
}
function sistersAt(t){
  const tracks=referenceData.sisters||[];
  return tracks.filter(add=>t>=add.path[0][0]&&t<=add.path[add.path.length-1][0])
    .map(add=>({tag:add.tag,pos:sampleTrack(add.path,t)}));
}
const rotatePractice=(p,angle)=>pos(p.x*Math.cos(rad(angle))-p.y*Math.sin(rad(angle)),p.x*Math.sin(rad(angle))+p.y*Math.cos(rad(angle)));
const predPos=()=>rotatePractice(pos(3,3),(S.seed%4)*90);
const predActor=(x,y)=>rotatePractice(pos(x,y),(S.seed%4)*90);
function shapes(e) {
  const boss=S.phase==='garuda'?garudaPos(e.t):O;
  switch(e.kind){
    // Downburst has no cast: evaluate its actual facing at impact.
    case 'buster':return [{type:'cone',from:()=>garudaPos(S.t),to:()=>S.ents[0],half:rad(65),len:11.7}];
    case 'cone':{const a=garudaPos(e.t-e.lead),b={...S.ents[0]};return [{type:'cone',from:()=>a,to:()=>b,half:CFG.slipstreamHalf,len:11.7}];}
    case 'wheel':return (e.centers||[boss]).map(c=>circle(c,e.radius||8.7));
    case 'donut':return [donut(boss,7,20)];
    case 'eye':return [donut(O,12,25)];
    case 'burst':return bubbleCenter()?[circle(bubbleCenter(),6.5)]:[];
    case 'slide':{
      if(e.ultima){const source=e.source,target=S.ents[e.who],first=e.repeatOf&&S.events.find(a=>a.t===e.repeatOf&&a.ultima);e.lockedAngle??=first?.lockedAngle??Math.atan2(target.x-source.x,-(target.y-source.y))*180/Math.PI;return e.offsets.map(off=>({...strip(e.lockedAngle+off,3,source),length:40.5,back:.5}));}
      if(e.bait){
        const source=e.source||O,target=S.ents[e.who];
        e.lockedAngle??=Math.atan2(target.x-source.x,-(target.y-source.y))*180/Math.PI;
        return [0,45,-45,135,-135].map((off,j)=>({...strip(e.lockedAngle+off,3,source),length:j?40.5:44.55,back:j?.5:4.55}));
      }
      if(e.repeatOf){
        const first=S.events.find(a=>a.t===e.repeatOf&&a.kind==='slide');
        // A checkpoint after the first cast uses the documented teaching
        // heading when its earlier snapshot is outside this segment.
        const angle=first?.lockedAngle??e.angle;
        return [22.5,-22.5,90,-90,180].map(off=>({...strip(angle+off,3,e.source||O),length:40.5,back:.5}));
      }
      if(e.name==='深紅旋風'&&e.t>816)return [strip(0,9),strip(90,9)];
      return [strip(e.angle,e.name==='深紅旋風'?9:2)];
    }
    case 'pred1':{const source=predActor(3,17);e.lockedAngle??=e.angle;return [circle(predPos(),8.7),strip(e.angle+135,9),...[0,45,-45,135,-135].map((off,j)=>({...strip(e.lockedAngle+off,3,source),length:j?40.5:44.55,back:j?.5:4.55}))];}
    case 'pred2':return [circle(predActor(-12,12),14),...[22.5,-22.5,90,-90,180].map(off=>({...strip(e.angle+off,3,predActor(3,17)),length:40.5,back:.5}))];
    case 'predTornado':return [donut(predPos(),7,20)];
    case 'crimsonCross':return [strip(e.angle||0,5),strip((e.angle||0)+90,5)];
    // Action 11150: range20 + Garuda R1.7; BossMod half-angle75.
    case 'suppCone':{e.lockedTarget??={...S.ents[e.who]};const a={...e.source},b={...e.lockedTarget};return [{type:'cone',from:()=>a,to:()=>b,len:21.7,half:rad(75)}];}
    case 'aetherLaser':return [{...strip(e.angle,4,e.source),length:46,back:0}];
    case 'plume':return Array.from({length:8},(_,i)=>circle(polar(i*45,i%2?15.5:17.5),8)); // Centers reconstructed from Tuufless diagram; r8 is Action 11105.
    case 'eruption':{
      const targets=e.targets||S.ents.map((p,i)=>({i,d:dist(p,e.source||O)})).sort((a,b)=>b.d-a.d).slice(0,2).map(p=>p.i);
      return targets.map(i=>circle(S.ents[i],8));}
    case 'whirl':{
      // Action 11073: circle, EffectRange 8 (XIVAPI game sheet). The
      // first Mistral Song interceptor determines each fixed spawn center.
      if(S.phase==='ultima')return (S.whirlOrigins.suppression||[pos(-10.2,4.5),pos(-4.509,10.891)]).map(c=>circle(c,8));
      const source=e.t<30?10.216:99.244,tanks=e.t<30?[1]:[0,1];
      return (S.whirlOrigins[source]||tanks.map(i=>roleSample(i,source))).map(c=>circle(c,8));
    }
    case 'bait':return e.targets.map(i=>circle(S.ents[i],e.r));
    case 'pillar':return [circle(S.ents[e.who],3)];
    case 'bombLand':return [circle(e.center,4.3)];
    case 'bomb':return [circle(e.center,6.3)];
    default:return [];
  }
}
function log(msg,at=S.t){
  const stamp=S.phase==='garuda'?(Math.floor(at/60)+':'+(at%60).toFixed(3).padStart(6,'0')+'　'):'';
  S.log.unshift(stamp+msg);S.log.length=Math.min(S.log.length,12);}
function actorFailure(actor,reason){if(actor===S.opts.role)fail(reason);else S.npcFaults.push({role:actor,time:S.t,reason});}
function fail(reason){log((S.opts.god?'觀摩判定・':'失誤・')+reason);S.errors++;if(!S.opts.god){S.dead=true;S.reason=reason;}}
function home(i){return i===0?pos(0,-15):i===1?pos(-3,-2):pos((i-4)*.7,3);}
const hasSw=(i,t)=>S.phase==='ultima'&&i===3&&t>=695.835&&t<=725.844;
const swActive=t=>hasSw(3,t)?[{who:3}]:[];
const fetterOn=t=>S.phase==='ultima'&&t>=640&&t<=650;
const tankable=()=>false, bossState=()=>({vis:false}), nails=()=>[];
const groupPoint=pos(0,4);
// A practice route for the randomized Suppression duties, not party replay.
// Bait points change only after the corresponding cast snapshots the actors.
function preAnnihilationIntent(i,t){
  if(S.phase!=='ultima'||t<629||t>653)return null;
  if(t>642.028)return O;
  return i===6?pos(-2,12):i===7?pos(2,12):pos(0,-4);
}
function annihilationWeightIntent(i,t){
  if(S.phase!=='ultima'||t<684||t>695.747)return null;
  if(i===0&&t>=691.786&&t<692.763)return pos(3,-4);
  if(S.events.some(e=>e.kind==='orb'&&e.who===i&&e.t>=t&&e.t-t<2.4))return null;
  const waves=S.events.filter(e=>e.kind==='bait'&&e.name==='大地之重'&&e.t<700&&t>=e.t-e.lead);
  return [pos(-7,0),pos(0,7),O,pos(-6,3)][Math.min(3,waves.length)];
}
function suppressionIntent(i,t){
  if(S.phase==='ultima'&&i===1&&t>=762&&t<=768.137)return pos(-6,3);
  if(S.phase!=='ultima'||t<740||t>760.793)return null;
  if(i===S.supp.pillar){
    const elapsed=Math.max(0,t-751.658);
    return polar(230-elapsed*20,15);
  }
  if(t>750.749&&(!S.supp.eruptions.includes(i)||t>753.684))return pos(8,3);
  if(S.supp.eruptions.includes(i)&&t<=753.684){
    if(t<744.660)return pos(14,0);
    if(t<746.659)return pos(14,9);
    if(t<748.661)return pos(3,13);
    if(t<750.704)return pos(12,7);
    if(t<751.636)return pos(8,2);
    return i===S.supp.gaol?pos(3,5):pos(3,1);
  }
  return null;
}
function rouletteIntent(t){
  if(S.phase!=='ultima'||t<816)return null;
  const dash=S.events.find(e=>e.name==='深紅旋風'&&e.t>816&&t>=e.t-5&&t<=e.t+2);
  if(dash){const eruption=S.events.find(e=>e.kind==='eruption'&&Math.abs(e.t-dash.t)<.1);return eruption&&t<eruption.t-eruption.lead?pos(0,-12):pos(-12,-12);}
  const wheel=S.events.find(e=>e.kind==='wheel'&&e.t>816&&t>e.t&&t<e.t+2.5);
  if(wheel)return pos(0,-5);
  const summon=S.events.filter(e=>e.kind==='summon'&&e.t<=t).at(-1);
  if(summon?.primal==='土'&&t< summon.t+16){
    const weights=S.events.filter(e=>e.kind==='bait'&&e.name==='大地之重'&&e.t>summon.t&&e.t<summon.t+16&&t>=e.t-e.lead);
    return pos(weights.length%2?8:0,-12);
  }
  return pos(0,-12);
}
function partyStackPoint(i,t){
  const allies=S.ents.filter(p=>p.i!==i&&!hasSw(p.i,t));
  let cluster=[],best=-Infinity;
  for(const anchor of allies){
    const nearby=allies.filter(p=>dist(p,anchor)<=4),score=nearby.length*100-dist(anchor,groupPoint);
    if(score>best){cluster=nearby;best=score;}
  }
  return cluster.length?pos(cluster.reduce((sum,p)=>sum+p.x,0)/cluster.length,cluster.reduce((sum,p)=>sum+p.y,0)/cluster.length):groupPoint;
}
function goal(e,i) {
  if(S.phase==='garuda')return e.kind==='tethers'&&mesohighSpots[i]?mesohighSpots[i]:roleSample(i,e.t);
  switch(e.kind){
    case 'songside':{
      if(i===e.who)return e.tank?pos(-9,13):pos(-12,9);
      if(i!==e.tank){
        if(i<2){const own=S.events.find(a=>a.kind==='songside'&&a.tank===i);if(own?.interceptAt)return own.interceptAt;}
        return null;
      }
      const source=e.source||pos(e.tank?18:-18,0),target=S.ents[e.who];
      return pos(source.x+(target.x-source.x)*.7,source.y+(target.y-source.y)*.7);
    }
    case 'mark':return e.splash?(i===e.targets[0]?(e.t>650?pos(8,-10):pos(0,-8)):groupPoint):null;
    case 'tether':return i===e.who?pos(-6,3):null;
    case 'laser':return i===1?pos(9,2):groupPoint;
    case 'grouporb':{if(i%2!==e.orb%2)return null;const c=orbCenter(e),ready=S.ents.filter(p=>p.i%2===e.orb%2).every(p=>dist(p,c)<=4);return ready?c:pos(c.x-e.side*2.5,c.y);}
    case 'orb':return i===e.who?orbCenter(e):null;
    case 'stack':return hasSw(i,e.t)?pos(-3.5,-11.3):i===S.opts.role?(i===e.who?partyStackPoint(i,e.t):S.ents[e.who]):e.who===S.opts.role?S.ents[e.who]:rouletteIntent(S.t)||groupPoint;
    case 'pulse':return i===3?pos(-3.5,-11.3):S.events.some(a=>a.kind==='orb'&&a.who===i&&a.t>S.t&&a.t-S.t<2.5)?pos(3,3):groupPoint;
    case 'gaol':case 'gaolmark':return i===e.who?pos(3,5):null;
    case 'rescue':return S.gaol;
    case 'proximity':return O;
    case 'boom':{const c=pos(i%2?6:-6,4),d=dist(c,O);return pos(c.x/d,c.y/d);}
    case 'pred1':return predActor(-4,-17.6);
    case 'pred2':case 'predTornado':return predActor(-13.4,-12.7);
    case 'crimsonCross':return e.t<622?predActor(-13.4,-12.7):i===3?pos(-6.2,-9.8):pos(6,-6);
    case 'wheel':{
      if(e.centers)return shapes(e).some(h=>contains(h,S.ents[i]))?O:pos(S.ents[i].x,S.ents[i].y);
      const p=S.ents[i],d=dist(p,O);
      return d>=9.2?pos(p.x,p.y):d>.01?pos(p.x*9.2/d,p.y*9.2/d):pos(0,9.2);
    }
    case 'slide':return e.t>816?rouletteIntent(S.t):e.bait||e.ultima?O:null;
    case 'plume':return O;
    case 'donut':return pos(0,-5);
    case 'fetter':return i===1||i===4?groupPoint:null;
    default:return null;
  }
}
function reset(phase=S.phase||'garuda',seed=S.opts.seed??1,start=S.phase===phase&&S.start!==undefined?S.start:timeline.phases[phase].start){
  const info=timeline.phases[phase];
  Object.assign(S,{phase,assetPhase:phase==='garuda'?'garuda':'ultima',seed:seed>>>0,supp:timeline.assignments(seed),t:start,start,end:info.end,
    done:false,dead:false,paused:false,reason:'',errors:0,log:[],npcFaults:[],orbEffects:[],orbEffectTime:0,aoes:[],props:[],flashRings:[],fetterDps:4,
    stacks:Array(8).fill(phase==='ultima'?1:0),charges:0,ents:ROLES.map((_,i)=>({...(phase==='garuda'?(i===S.opts.role?roleSample(i,start):npcRoleSample(i,start)):home(i)),i})),sprint:0,sprintCd:0,
    gaol:null,lb:null,whirlOrigins:{},orbRally:[null,null],soloOrbRally:[null,null],fetterApart:0,atWall:false,orbSoaks:[],events:timeline.build(phase,seed>>>0).filter(e=>e.t>=start)});
  if(phase==='ultima'){
    // Restore the rally when starting inside Boom's preparation window; a late
    // checkpoint must not spawn the MT fifteen metres away with <1 s to move.
    const boom=S.events.find(e=>e.kind==='boom');
    if(boom&&start>=boom.t-boom.lead)for(const p of S.ents)Object.assign(p,goal(boom,p.i));
  }
  if(phase==='garuda')restoreThermals(start);
  if(phase==='ultima'&&start>=731){
    S.stacks[2]=S.stacks[3]=0;
    S.orbSoaks=[1,1,1,1]; // The selected strategy assigns each green orb to one tank.
  }
  if(phase==='ultima'&&start>768.137)S.stacks[1]=0;
  const cameraAnchor=S.ents[S.opts.role];S.cam=Math.atan2(-cameraAnchor.x,cameraAnchor.y);
  S.markEvents=timeline.build(phase,seed>>>0).filter(e=>e.kind==='mark');
  log('開始練習・'+info.name);
}
function orbCenter(e){return e.kind==='orb'?pos(6,3):pos(e.side*6,e.orb>=2?-2:4);}
function orbMergeTime(e){
  // More Annihilation soakers increase Boom separation, not its speed.
  // 0.5 m per extra soaker remains an explicit teaching approximation; the
  // one-soaker reference still fuses at its logged timeline deadline.
  return e.t+e.lead*((S.orbSoaks[e.orb]??1)-1)*.2;
}
function orbPair(e){
  const c=orbCenter(e),separation=Math.max(0,(orbMergeTime(e)-S.t)*2.5/e.lead);
  return [pos(c.x,c.y-separation),pos(c.x,c.y+separation)];
}
// Practice VFX, not a reconstruction of the game's particle assets. Every
// position/radius comes from the same geometry used by collision resolution.
function orbBodies(e){
  return (e.kind==='orb'?[orbCenter(e)]:orbPair(e)).map(p=>({pos:{...p},radius:e.kind==='orb'?3:1.15,color:e.kind==='orb'?'#95ef80':'#ffc85d'}));
}
function emitOrbEffect(e,outcome,center,targets=[]){
  S.orbEffects.push({at:S.orbEffectTime,duration:1.25,outcome,pos:{...center},
    radius:e.kind==='orb'?6:8,bodies:orbBodies(e),targets:outcome==='soak'?targets.map(p=>({x:p.x,y:p.y})):[]});
}
function sceneOrbs(){
  return {bodies:active().filter(e=>e.kind==='orb'||e.kind==='grouporb').flatMap(orbBodies),
    effects:(S.orbEffects||[]).map(e=>({...e,progress:clamp01((S.orbEffectTime-e.at)/e.duration)})).filter(e=>e.progress<1)};
}
function active(){return S.events.filter(e=>!e.done&&S.t>=e.t-e.lead);}
function useSkill(skill){
  if(S.paused||S.dead||S.done)return;
  if(skill==='sprint'&&S.t>=S.sprintCd){S.sprint=S.t+10;S.sprintCd=S.t+60;log('衝刺');}
  if(skill==='lb'){const e=active().find(e=>e.kind==='lb');if(e&&e.who===S.opts.role){S.lb=e;log('已施放 '+e.name);}else log('目前沒有你的 LB3 分工');}
  if(skill==='attack'&&S.gaol&&S.opts.role!==S.supp.gaol&&dist(me(),S.gaol)<=6){S.gaol=null;S.props=[];log('已擊破石牢');}
}
function songLane(t){
  const origin=garudaPos(t),h1=roleSample(2,t),h2=roleSample(3,t);
  const target=pos((h1.x+h2.x)/2,(h1.y+h2.y)/2),length=dist(origin,target);
  if(length<1)return null;
  const dx=(target.x-origin.x)/length,dy=(target.y-origin.y)/length;
  const project=p=>({along:(p.x-origin.x)*dx+(p.y-origin.y)*dy,side:Math.abs((p.x-origin.x)*dy-(p.y-origin.y)*dx)});
  const st=project(roleSample(1,t));
  // The log confirms the three hits but not the selected healer. Apply an
  // inferred corridor only where the measured positions support interception.
  if(st.side>2.5||st.along<0||st.along>=length)return null;
  return {origin,target,project};
}
function resolve(e){
  const i=S.opts.role,p=me(),g=goal(e,i);
  const check=(ok,msg,actor=i)=>{if(!ok){if(actor===i)fail(e.name+'：'+msg);else S.npcFaults.push({role:actor,time:S.t,reason:e.name+'：'+msg});}};
  const close=(r)=>g&&dist(p,g)<=r;
  if(e.hazards.some(s=>contains(s,p))&&!(e.kind==='buster'&&i===0)&&!(S.gaol&&i===S.supp.gaol))check(false,'被攻擊範圍命中');
  {
    const hit=S.ents.find(a=>a.i!==i&&!(e.kind==='buster'&&a.i===0)&&!(S.gaol&&a.i===S.supp.gaol)&&e.hazards.some(s=>contains(s,a)));
    if(hit)S.npcFaults.push({role:hit.i,time:S.t,reason:e.name+' 被攻擊範圍命中'});
  }
  switch(e.kind){
    case 'bomb':S.props=S.props.filter(p=>p.type!=='bomb'||p.id!==e.id);break;
    case 'mark':{
      if(e.splash){const target=S.ents[e.targets[0]];e.appliedTargets=S.ents.filter(a=>dist(a,target)<=e.splash).map(a=>a.i);check(e.appliedTargets.length===1,'主坦分散：吸附式以太炸彈波及隊友',i===e.targets[0]||e.appliedTargets.includes(i)?i:e.targets[0]);}
      log('點名・'+e.targets.map(j=>ROLES[j]).join('、'));break;
    }
    case 'song':{
      S.whirlOrigins[e.t]=[{...S.ents[1]}];
      const lane=songLane(e.t);
      for(const j of e.targets)check(dist(S.ents[j],goal(e,j))<=4,ROLES[j]+' 寒風之歌分工站位',j);
      if(lane){const tank=lane.project(S.ents[1]),depth=Math.min(lane.project(S.ents[2]).along,lane.project(S.ents[3]).along);check(tank.side<=2.5&&tank.along>=0&&tank.along<depth,'ST 在補師前截線',1);}
      if(e.targets.includes(i)){
        let ok=close(4);
        if(lane){
          const tank=lane.project(S.ents[1]);
          const healerDepth=Math.min(lane.project(S.ents[2]).along,lane.project(S.ents[3]).along);
          const recordedDepth=Math.min(lane.project(roleSample(2,e.t)).along,lane.project(roleSample(3,e.t)).along);
          if(lane.project(roleSample(1,e.t)).along<recordedDepth)
            if(i===1)ok=ok&&tank.side<=2.5&&tank.along>=0&&tank.along<healerDepth;
        }
        check(ok,'依紀錄由 ST 在補師前截線');
      }else if(lane){
        const spot=lane.project(p),recorded=lane.project(roleSample(i,e.t));
        if(recorded.along<0||recorded.side>2)check(spot.along<0||spot.side>2,'離開寒風之歌直線');
      }
      break;
    }
    case 'songside':{
      const source=e.source||pos(e.tank?18:-18,0),target=S.ents[e.who],tank=S.ents[e.tank];
      const length=dist(source,target),dx=(target.x-source.x)/Math.max(.001,length),dy=(target.y-source.y)/Math.max(.001,length);
      const depth=(tank.x-source.x)*dx+(tank.y-source.y)*dy;
      const side=Math.abs((tank.x-source.x)*dy-(tank.y-source.y)*dx);
      e.interceptAt=pos(tank.x,tank.y);
      S.whirlOrigins.suppression??=[pos(-10.2,4.5),pos(-4.509,10.891)];S.whirlOrigins.suppression[e.tank]={...e.interceptAt};
      const clipped=S.ents.find(a=>a.i!==i&&a.i!==e.who&&a.i!==e.tank&&(()=>{
        const along=(a.x-source.x)*dx+(a.y-source.y)*dy,lateral=Math.abs((a.x-source.x)*dy-(a.y-source.y)*dx);
        return along>=0&&along<=length&&lateral<=2;
      })());
      if(clipped)S.npcFaults.push({role:clipped.i,time:S.t,reason:'NPC 被寒風之歌直線命中'});
      check(length>1&&depth>0&&depth<length&&side<=2,'坦克站在分身與點名隊員之間',i===e.who&&dist(p,goal(e,i))>4?i:e.tank);
      if(i!==e.tank&&i!==e.who){const along=(p.x-source.x)*dx+(p.y-source.y)*dy,lateral=Math.abs((p.x-source.x)*dy-(p.y-source.y)*dx);check(along<0||along>length||lateral>2,'離開寒風之歌直線');}
      break;
    }
    case 'sisters':S.whirlOrigins[e.t]=[0,1].map(j=>({...S.ents[j]}));for(const j of [0,1])check(dist(S.ents[j],goal(e,j))<=4,'雙坦各依參考位置截寒風之歌',j);break;
    case 'buster':break;
    case 'cyclone':{const ok=dist(S.ents[1],goal(e,1))<=4;S.receivedThermal['cyclone:1']=ok;check(ok,'副坦接刺羽',1);break;}
    case 'friction':for(const actor of S.ents){const ok=dist(actor,goal(e,actor.i))<=5;S.receivedThermal['friction'+e.wave+':'+actor.i]=ok;check(ok,ROLES[actor.i]+' 靠近集合處接烈風刃',actor.i);}break;
    case 'tethers':
      for(const j of e.targets){S.tetherHolds[j]=dist(S.ents[j],goal(e,j))<=4&&S.stacks[j]>0;check(S.tetherHolds[j],ROLES[j]+' 帶低氣壓截線',j);}
      break;
    case 'discharge':if(e.t===125.698)check(S.charges===4,'須累積四次雙層清除才能覺醒',S.stacks[i]>0?i:S.npcFaults.find(f=>f.role!==i)?.role??i);break;
    case 'tether':check(dist(S.ents[e.who],goal(e,e.who))<=3&&S.stacks[e.who]>0,ROLES[e.who]+' 帶低氣壓接線',e.who);S.stacks[e.who]=0;break;
    case 'laser':check(dist(S.ents[1],goal(e,1))<=4,'副坦在東側單吃',1);for(const a of S.ents)if(a.i!==1)check(dist(a,S.ents[1])>4,'離開副坦：誘導雷射波及隊友',i===1?i:a.i);break;
    case 'stack':{const target=S.ents[e.who];check(target&&S.ents.filter(a=>dist(a,target)<=CFG.stackR&&!hasSw(a.i,e.t)).length>=4,'點名 '+ROLES[e.who]+' 身邊須至少四人分攤',!hasSw(i,e.t)&&(dist(p,target)>CFG.stackR||(i===e.who&&dist(p,partyStackPoint(i,e.t))>CFG.stackR))?i:S.ents.find(a=>a.i!==i&&dist(a,target)>CFG.stackR&&!hasSw(a.i,e.t))?.i??e.who);if(!hasSw(i,e.t))check(dist(p,target)<=CFG.stackR,'回到點名隊員身邊分攤');break;}
    case 'pulse':for(const a of S.ents)if(a.i!==3)check(dist(a,S.ents[3])>CFG.swR,'灼熱遠離全隊',i===3?i:a.i);break;
    case 'orb':{
      const c=orbCenter(e),soakers=S.ents.filter(a=>dist(a,c)<=6);
      const valid=dist(S.ents[e.who],c)<=3&&soakers.every(a=>a.i===e.who);
      emitOrbEffect(e,valid?'soak':'failed',c,soakers);
      check(dist(S.ents[e.who],c)<=3,'指定坦須實際接觸球',e.who);
      check(soakers.some(a=>a.i===e.who),(i===e.who?'':'NPC '+ROLES[e.who]+'・')+'指定坦進球',e.who);
      if(i!==e.who)check(dist(p,c)>6,'避開單吃球');
      const extra=soakers.find(a=>a.i!==e.who&&a.i!==i);
      if(extra)check(false,'NPC '+ROLES[extra.i]+' 誤吃單吃球',extra.i);
      S.orbSoaks.push(soakers.length);S.soloOrbRally[e.who]=pos(6,-1);break;
    }
    case 'boom':{
      for(const actor of S.ents){
        const d=dist(actor,O);check(d+10<20,(actor.i===i?'':'NPC '+ROLES[actor.i]+'・')+'從內圈承受擊退',actor.i);
        if(d>.1){actor.x+=actor.x/d*10;actor.y+=actor.y/d*10;}
      }
      break;
    }
    case 'proximity':check(close(6),'往中央避開四方落點');break;
    case 'gaol':check(dist(S.ents[e.who],goal(e,e.who))<=3,'將石牢放在指定南側集合點',e.who);S.gaol={...S.ents[e.who]};S.props=[{type:'gaol',pos:S.gaol}];break;
    case 'rescue':check(!S.gaol,'進入石牢六米內按 F 救人',i===S.supp.gaol?(i===0?1:0):i);break;
    case 'lb':if(i===e.who)check(S.lb===e,'讀條期間按 L 施放職能 LB3');break;
    case 'enrage':log('進入狂暴・本練習無輸出檢定');break;
  }
}
function step(dt,keys=new Set()){
  if(S.paused)return;
  // Finish terminal bursts on the same speed-scaled simulation delta, without
  // advancing mechanics after a failure. Explicit pause freezes both clocks.
  S.orbEffectTime+=dt;
  S.orbEffects=S.orbEffects.filter(e=>S.orbEffectTime-e.at<e.duration);
  if(S.dead||S.done)return;
  S.t=Math.min(S.end,S.t+dt);
  const upcoming=active();
  for(const e of upcoming)if(!e.hazards){
    e.hazards=shapes(e);if(e.kind==='bombLand')S.props.push({type:'bomb',pos:e.center,id:e.id});for(const shape of e.hazards)S.aoes.push({shape,event:e,t0:S.t,t1:e.t,assistOnly:!['bait','eruption','plume','pillar'].includes(e.kind)});
  }
  S.cam+=((keys.has('e')?1:0)-(keys.has('q')?1:0))*dt*1.8;
  const dx=Number(keys.has('d'))-Number(keys.has('a')),dy=Number(keys.has('s'))-Number(keys.has('w'));
  if((dx||dy)&&!(S.opts.role===S.supp.gaol&&S.gaol)){
    const speed=(S.sprint>S.t?8:6)*dt/Math.hypot(dx,dy),p=me(),yaw=S.cam;
    const x=dx*Math.cos(yaw)-dy*Math.sin(yaw),y=dx*Math.sin(yaw)+dy*Math.cos(yaw);
    p.x+=x*speed;p.y+=y*speed;p.face=Math.atan2(y,x);
    const d=dist(p,O);
    if(d>CFG.R){
      if(!S.atWall)fail('碰到場地外緣');
      S.atWall=true;p.x*=CFG.R/d;p.y*=CFG.R/d;
      if(S.dead)return;
    }else if(d<CFG.R-.1)S.atWall=false;
  }
  S.ents.forEach((p,i)=>{
    if(i===S.opts.role||S.gaol&&i===S.supp.gaol)return;
    if(S.phase==='garuda'){
      const target=garudaNpcIntent(i,S.t),dx=target.x-p.x,dy=target.y-p.y;
      if(dx*dx+dy*dy>.000001)p.face=Math.atan2(dy,dx);
      npcMotion.move(p,target,dt,{time:S.t,radius:CFG.R,speed:npcMotion.observedSprintSpeed(ROLES[i],S.t,referenceData,6),future:t=>garudaNpcIntent(i,t),hazards:S.aoes.filter(a=>a.t1>=S.t-dt&&!(i===0&&a.event?.kind==='buster')).map(a=>({...a,t1:Math.max(S.t,a.t1),hit:(q,pad)=>npcHazardHit(a.shape,q,pad)}))});return;
    }
    const rally=S.t<714&&S.soloOrbRally[i]||S.t<804&&S.orbRally[i%2];
    const weightDodge=S.t>816&&upcoming.some(e=>e.kind==='bait'&&e.name==='大地之重')?rouletteIntent(S.t):null;
    const target=annihilationWeightIntent(i,S.t)||weightDodge||(S.t>663.574&&S.t<666.634?groupPoint:null)||preAnnihilationIntent(i,S.t)||suppressionIntent(i,S.t)||upcoming.map(e=>goal(e,i)).find(Boolean)||rally||(hasSw(i,S.t)?pos(-3.5,-11.3):rouletteIntent(S.t)||home(i));
    const d=dist(p,target),k=d>0?Math.min(1,dt*6/d):0;
    // Bound the route intent as well as avoidance: this planner follows a timed
    // reference directly when safe, while Ultima uses live assignment targets.
    const intent=pos(p.x+(target.x-p.x)*k,p.y+(target.y-p.y)*k);
    const hazards=[...S.aoes.filter(a=>a.t1>=S.t-dt&&!(i===S.supp.gaol&&a.event?.kind==='eruption'&&a.t1===753.684)),
      ...upcoming.filter(e=>e.kind==='orb'&&e.who!==i).map(e=>({shape:circle(orbCenter(e),6),t1:e.t})),
      ...upcoming.filter(e=>e.kind==='grouporb'&&i%2!==e.orb%2).flatMap(e=>orbPair(e).map(c=>({shape:circle(c,1.15),t1:S.t}))),
      ...upcoming.filter(e=>e.kind==='pulse').flatMap(e=>(i===3?S.ents.filter(a=>a.i!==3):[S.ents[3]]).map(a=>({shape:circle(a,CFG.swR),t1:e.t})))];
    npcMotion.move(p,intent,dt,{time:S.t,radius:CFG.R,speed:6,future:t=>{if(hazards.some(a=>contains(a.shape,target)))return target;const f=d>0?Math.min(1,Math.max(0,t-S.t+dt)*6/d):0;return pos(p.x+(target.x-p.x)*f,p.y+(target.y-p.y)*f);},hazards:hazards.map(a=>({...a,t1:Math.max(S.t,a.event?.ultima&&a.event.repeatOf?a.event.repeatOf:a.t1),hit:(q,pad)=>npcHazardHit(a.shape,q,pad)})).concat(fetterOn(S.t)&&[1,4].includes(i)?[{t1:S.t+.15,hit:q=>dist(q,S.ents[i===1?4:1])>CFG.fetterMax-.5}]:[])});
  });
  // The prisoner and the busy pillar runner rely on nearby free NPCs.
  // Controlled free attackers must still make their own rescue input.
  if(S.gaol&&(S.opts.role===S.supp.gaol||S.opts.role===S.supp.pillar)&&upcoming.some(e=>e.kind==='rescue')&&S.ents.some(p=>p.i!==S.supp.gaol&&p.i!==S.supp.pillar&&dist(p,S.gaol)<=6)){
    S.gaol=null;S.props=[];log('隊友已擊破石牢');
  }
  if(fetterOn(S.t)){
    if(dist(S.ents[1],S.ents[4])>CFG.fetterMax){
      const previous=S.fetterApart;
      S.fetterApart+=dt;
      if(previous<.75&&S.fetterApart>=.75)actorFailure([1,4].includes(S.opts.role)?S.opts.role:1,'炎獄之鎖拉得太遠：副坦與 D1 保持十米以內');
    }else S.fetterApart=0;
    if(S.dead)return;
  }
  for(const e of upcoming){
    if(e.kind==='grouporb'){
      const ownGroup=S.opts.role%2===e.orb%2;
      const group=S.ents.filter(p=>p.i%2===e.orb%2);
      const touching=p=>orbPair(e).some(orb=>dist(p,orb)<=1.15);

      // Every physical contact snapshots the soak, including NPCs. Staging
      // belongs to movement intent above; it never gates collision resolution.
      const contacts=S.ents.filter(touching);
      if(contacts.length){
        e.done=true;
        const touched=orbPair(e).find(c=>contacts.some(p=>dist(p,c)<=1.15)),together=group.every(p=>dist(p,touched)<=8),wrong=[S.ents[S.opts.role],...S.ents.filter(p=>p.i!==S.opts.role)].find(p=>p.i%2!==e.orb%2&&dist(p,touched)<=8);
        emitOrbEffect(e,!wrong&&together?'soak':'failed',touched,group);
        if(wrong){actorFailure(wrong.i,e.name+'：'+ROLES[wrong.i]+' 碰到另一組的球');if(!together&&ownGroup&&(contacts.some(p=>p.i===S.opts.role)||(S.t>=orbMergeTime(e)&&dist(S.ents[S.opts.role],touched)>8)))actorFailure(S.opts.role,e.name+'：四名指定隊員尚未集合');}
        else if(together){S.orbRally[e.orb%2]=orbCenter(e);log(e.name+'・四人分攤');}
        else {const missing=group.filter(p=>dist(p,touched)>8);actorFailure(contacts.some(p=>p.i===S.opts.role)||(S.t>=orbMergeTime(e)&&missing.some(p=>p.i===S.opts.role))?S.opts.role:contacts[0].i,e.name+'：四名指定隊員尚未集合');}
      }else if(S.t>=orbMergeTime(e)){
        emitOrbEffect(e,'fusion',orbCenter(e));
        e.done=true;actorFailure(ownGroup?S.opts.role:group[0].i,e.name+'：球已融合，需由四人小隊在期限內實際碰球');
      }
    }else if(S.t>=e.t){
      e.done=true;log(e.name,e.t);resolve(e);
    }
    if(S.dead)break;
  }
  if(S.phase==='garuda'&&!S.dead){
    advanceThermals();if(S.dead)return;trackBubbleEntry();if(S.dead)return;
    while(S.damageIndex<timeline.garudaDamage.length&&timeline.garudaDamage[S.damageIndex][0]<=S.t){
      const [at,name]=timeline.garudaDamage[S.damageIndex++];log('實錄傷害・'+name,at);
    }
  }
  S.aoes=S.aoes.filter(a=>S.t<=a.t1+.32);for(const a of S.aoes)a.done=S.t>=a.t1;
  if(!S.dead&&S.t>=S.end)S.done=true;
}
function sceneActors(t){
  const actor=(kind,point,tag)=>({kind,pos:point,look:O,tag,real:false});
  if(S.phase==='garuda'){
    const g=actor('garuda',garudaPos(t),'迦樓羅');
    const casting=active().find(e=>e.kind==='cone');
    g.look=casting?.hazards?.[0]?.to()||S.ents[0];g.real=S.charges>=4;
    return [g,...sistersAt(t).map(add=>actor('garuda',add.pos,add.tag))];
  }
  if(S.phase==='intermission')return t>=531.4?[actor('ultima',O,'究極神兵')]:[];
  const list=[actor('ultima',t>599&&t<622?predActor(-12,12):t>=644&&t<653?pos(2.65,-6.48):t>=735.806&&t<774.184?pos(13.7,-13.7):O,'究極神兵')];
  if(t>599&&t<622)list.push(actor('garuda',predPos(),'迦樓羅'),actor('ifrit',predActor(-13.7,-13.7),'伊弗利特'),actor('titan',predActor(3,17),'泰坦'));
  if(t>=629&&t<644)list.push(actor('ifrit',pos(0,-22),'伊弗利特'));
  if(t>=660&&t<674)list.push(actor('garuda',pos(-15,0),'妙翅'),actor('garuda',pos(15,0),'美翼'));
  if(t>=644&&t<656)list.push(actor('titan',t<660||t>735?pos(-13.7,13.7):pos(13.7,13.7),'泰坦'));
  if(t>=678&&t<716)list.push(actor('garuda',pos(0,16),'迦樓羅'),actor('ifrit',pos(-13.7,13.7),'伊弗利特'),actor('titan',pos(13.7,13.7),'泰坦'));
  if(t>=735.806&&t<774.184)list.push(actor('garuda',pos(-13.7,-13.7),'迦樓羅'),actor('ifrit',pos(13.7,13.7),'伊弗利特'),actor('titan',pos(-13.7,13.7),'泰坦'));
  const summon=S.events.filter(e=>e.kind==='summon'&&e.t<=t&&t<e.t+20).pop();if(summon){list.push(actor({風:'garuda',火:'ifrit',土:'titan'}[summon.primal],O,summon.name));if(summon.primal==='火')list.push(actor('ifrit',pos(0,19.5),'深紅旋風分身'),actor('ifrit',pos(19.5,0),'深紅旋風分身'));}
  if(t>=740&&t<757)for(const event of S.events.filter(e=>e.kind==='songside'))list.push(actor('garuda',event.source,'寒風分身'));
  const cone=active().find(e=>e.kind==='suppCone');
  if(cone){const garuda=list.find(a=>a.kind==='garuda'&&a.tag==='迦樓羅');if(garuda){garuda.pos={...cone.source};garuda.look=cone.lockedTarget||S.ents[cone.who];}}
  for(const kind of ['ultima','titan']){
    const event=active().find(e=>e.kind==='slide'&&(kind==='ultima'?e.ultima:!e.ultima&&(e.bait||e.repeatOf)));
    const model=list.find(a=>a.kind===kind);
    if(event&&model){
      model.pos={...event.source};
      const first=event.repeatOf&&S.events.find(a=>a.t===event.repeatOf);
      const angle=event.lockedAngle??first?.lockedAngle;
      if(Number.isFinite(angle)){const direction=polar(angle,10);model.look=pos(model.pos.x+direction.x,model.pos.y+direction.y);}
    }
  }
  return list;
}
function sceneGuides(){
  const guides=[];
  for(const mark of S.markEvents||[])if(mark.t<=S.t)for(const who of mark.targets){
    const pending=S.events.find(e=>e.kind==='stack'&&e.who===who&&!e.done&&e.markAt===mark.t);
    if(pending)guides.push({type:'ring',pos:S.ents[who],color:'#ffbc55',radius:1.1});
  }
  if(S.phase==='intermission'&&S.t<501.5){
    for(let i=0;i<6;i++)guides.push({type:'ring',pos:polar(i*60,9),color:'#ffc85d'});
  }
  if(S.phase==='intermission'&&S.t>=501.822&&S.t<526)guides.push({type:'ring',pos:O,color:'#bc8efa'});
  for(const e of active()){
    if(e.kind==='songside')guides.push({type:'line',a:e.source||pos(e.tank?18:-18,0),b:S.ents[e.who],color:'#ffc85d'});
    if(e.kind==='song'){const lane=songLane(e.t);if(lane)guides.push({type:'line',a:lane.origin,b:lane.target,color:'#ffc85d'});}
    if(['tethers','tether','sisters'].includes(e.kind)){
      const ids=e.kind==='tethers'?e.targets:e.kind==='sisters'?[0,1]:[e.who];
      ids.forEach((i,j)=>{
        if(S.phase==='garuda'){
          const receiver=goal(e,i);
          const source=sistersAt(e.t).sort((a,b)=>dist(a.pos,receiver)-dist(b.pos,receiver))[0];
          if(source)guides.push({type:'line',a:source.pos,b:S.ents[i],color:'#79e1e2'});
        }else guides.push({type:'line',a:e.t>735?pos(-13.7,-13.7):pos(0,16),b:S.ents[i],color:'#79e1e2'});
      });
    }
    if(e.kind==='grouporb'&&S.opts.assist){
      const [a,b]=orbPair(e),color=S.opts.role%2===e.orb%2?'#ffc85d':'#bd9afb';
      guides.push({type:'ring',pos:a,color},{type:'ring',pos:b,color},{type:'line',a,b,color});
    }
    const g=goal(e,S.opts.role);if(g&&S.opts.assist&&S.phase!=='garuda')guides.push({type:'ring',pos:g,color:'#66ffb0'});
  }
  if(S.phase==='garuda'){
    if(S.t>=22&&S.t<42.665)guides.push({type:'ring',pos:sampleTrack(referenceData.spinyPath,S.t),color:'#ffc85d'});
    if(S.opts.assist){
      guides.unshift({type:'ring',pos:sampleTrack(referenceData.paths[ROLES[S.opts.role]],S.t),color:'#73ffc4'});
      if(active().some(e=>e.kind==='tethers')&&mesohighSpots[S.opts.role])
        guides.push({type:'ring',pos:mesohighSpots[S.opts.role],color:'#ffc85d'});
    }
    const center=bubbleCenter();
    if(center&&S.t>=42.665&&S.t<67)guides.push({type:'ring',pos:center,color:'#6edcf7',radius:5});
  }
  return guides;
}
if(typeof module!=='undefined')module.exports={S,reset,step,contains,goal,sceneGuides,sceneOrbs,useSkill,shapes,sampleTrack,roleSample,npcRoleSample,garudaNpcIntent,rouletteIntent,annihilationWeightIntent,suppressionIntent,sceneActors,MARKERS};
function lesson(e){
  if(!e)return '等待下一個機制。';
  const i=S.opts.role;
  const tips={
    raid:'準備團減與群補。',
    cone:'離開王正面的扇形；主坦讀條時穿過王。',
    song:'ST 擋在補師前；這場由 ST、H1、H2 依序受擊。',
    songside:ROLES[e.tank]+' 截住往 '+ROLES[e.who]+' 的寒風。',
    sisters:'ST 往西、MT 往南，各截一線；隊員留在中央，避開東北風神的鋼鐵。',
    cyclone:'ST 在刺羽旁取得兩層低氣壓。',
    whirl:'避開先前接寒風處的龍捲。',
    discharge:'爆炸前後觀察自己的低氣壓層數，依紀錄分批清層。',
    friction:e.wave===1?'先全員疊一層，ST、D3、H1、H2、D4 分批清除。':'全員疊層，D2、D1 依序清兩層；MT 留兩層到中高壓。',
    tethers:'MT 帶兩層往東，D4 帶一層往西，分別截住中高壓。',
    tether:ROLES[e.who]+' 到西側接線，其他人離開。',
    bait:'圈鎖定你的位置後立刻離開。',
    eruption:(e.source?'D3、D4 在伊弗利特遠側誘導；其他人靠近北側。':'')+(e.targets?e.targets.map(j=>ROLES[j]).join('、')+' 引地火。':'')+'地火鎖定後沿外側連走，別折返前一個圈。',
    eye:'留在中央安全圓內。',
    wheel:'離開風神腳下。',
    donut:'鋼鐵結束後貼近風神。',
    burst:'先出刺羽爆炸範圍，再進罩清層。',
    buster:'順劈由 MT 面向外側單吃。',
    proximity:'集合場中央，避開四方落點。',
    lb:ROLES[e.who]+' 在讀條完成前按 L；其他分工由隊友執行。',
    laser:'ST 東側單吃，其他人留在中央。',
    stack:'到 '+ROLES[e.who]+' 身邊分攤；帶灼熱的補師留在外圍。',
    pred1:'讀三王位置，在風神側外圍躲鋼鐵、衝鋒與地裂。',
    pred2:'第一波結束，進風神月環內圈，同時避開中央和交叉線。',
    slide:'往直線側面移動，留意第二次地裂。',
    suppCone:'風神鎖定大扇形後離開正面，或撤到距離 21.7 米外。',
    aetherLaser:'辨認向南、中央或向西的雷射並離開直線。',
    plume:'八圈外圍火柱：往中央花瓣空隙避開。',
    fetter:'ST 與 D1 保持十米以內。',
    orb:ROLES[e.who]+' 單獨進金球，其他人避開。',
    pulse:'H2 帶灼熱遠離隊友十四米。',
    searing:'H2 往外圍帶灼熱。',
    gaolmark:ROLES[e.who]+' 中石牢，到南側放牢。',
    gaol:'石牢出現，隊友接近後按 F 擊破。',
    rescue:'進石牢六米內按 F 救出 '+ROLES[S.supp.gaol]+'。',
    pillar:ROLES[e.who]+' 沿外圍連走引導光柱。',
    boom:'靠近場中，與自己的四人組同方向承受擊退，再一起碰球。',
    grouporb:i%2===e.orb%2?'本組靠近金色指定球，四人一起分攤。':'另一組接球，與自己的小隊準備下一球。',
    enrage:'進入狂暴，結束此組走位練習。'
  };
  return e.name+' · '+(tips[e.kind]||'觀察讀條，準備下一個機制。');
}
function cleanseHint(t,role){
  const next=timeline.thermalUpdates.slice(S.thermalIndex).find(row=>row[1]===role&&!row[2]);
  if(!next||next[0]>=100||next[0]-t>4||!S.stacks[role])return '';
  return ROLES[role]+' 帶 '+S.stacks[role]+' 層進西側刺羽罩；參考清層還有 '+(next[0]-t).toFixed(1)+' 秒。';
}
function initUwu(){
  const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
  const phase=Object.hasOwn(timeline.phases,params.get('phase'))?params.get('phase'):'garuda';
  const info=timeline.phases[phase], fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t)%60).padStart(2,'0');
  const eventTime=t=>phase==='garuda'?Math.floor(t/60)+':'+(t%60).toFixed(3).padStart(6,'0'):fmt(t);
  $('phaseTitle').textContent='絕神兵・'+info.name;document.title=$('phaseTitle').textContent+' 機制模擬器';
  $('garudaSource').hidden=phase!=='garuda';$('generalSource').hidden=phase==='garuda';
  $('sourceCoverage').textContent=phase==='garuda'?'本隊參考：2026-11-19・第 13 場（最終於泰坦滅團）':'其他紀錄練習：本隊目前拓荒至泰坦，本段尚無本隊回放。';
  $('role').replaceChildren(...ROLES.map((r,i)=>new Option(r,i)));
  $('start').replaceChildren(...info.points.map(([t,n])=>new Option(fmt(t)+' '+n,t)));
  const keys=new Set(),canvas=$('arena'),g=canvas.getContext('2d');
  const has3d=typeof View3D!=='undefined'&&View3D.init($('arena3d'));
  if(!has3d){S.opts.view='top';$('view').options[0].disabled=true;}
  function restart(){keys.clear();reset(phase,S.opts.seed??Number(params.get('seed')||1),Number($('start').value));}
  for(const opt of ['role','speed','view','assist','hints','god']){
    const el=$(opt), check=el.type==='checkbox';
    if(check)el.checked=S.opts[opt];else el.value=S.opts[opt];
    el.addEventListener('change',()=>{S.opts[opt]=check?el.checked:['role','speed'].includes(opt)?Number(el.value):el.value;if(opt==='role')restart();el.blur();});
  }
  $('start').onchange=()=>{restart();$('start').blur();};$('restart').onclick=restart;
  for(const skill of ['lb','attack','sprint'])$(skill).onclick=()=>useSkill(skill);
  $('pause').onclick=()=>{if(!S.dead&&!S.done)S.paused=!S.paused;keys.clear();};
  addEventListener('keydown',ev=>{
    if(ev.target.matches('select,input,textarea')||ev.metaKey||ev.ctrlKey||ev.altKey)return;
    const key=ev.key.toLowerCase();
    if(!['w','a','s','d','q','e','r','p','shift','l','f'].includes(key))return;
    ev.preventDefault();keys.add(key);if(ev.repeat)return;
    if(key==='r')restart();if(key==='p')$('pause').click();
    if(['shift','l','f'].includes(key))useSkill({shift:'sprint',l:'lb',f:'attack'}[key]);
  });
  addEventListener('keyup',ev=>keys.delete(ev.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
  let drag=null;
  document.addEventListener('visibilitychange',()=>{if(document.hidden){S.paused=true;keys.clear();drag=null;}});
  for(const cv of [canvas,$('arena3d')]){
    cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY];};
    cv.onpointerup=cv.onpointercancel=()=>{drag=null;};
    cv.onpointermove=e=>{if(drag){S.cam+=(e.clientX-drag[0])*.009;S.pitch=Math.max(.12,Math.min(1.42,S.pitch+(e.clientY-drag[1])*.007));drag=[e.clientX,e.clientY];}};
    cv.onwheel=e=>{e.preventDefault();S.dist=Math.max(14,Math.min(64,S.dist+e.deltaY*.045));};cv.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  }
  function draw(size){
    const px=Math.round(size*Math.min(devicePixelRatio||1,2));if(canvas.width!==px||canvas.height!==px)canvas.width=canvas.height=px;
    const scale=px/(S.dist+14);g.setTransform(scale,0,0,scale,px/2,px/2);g.fillStyle='#080d1c';g.fillRect(-100,-100,200,200);g.rotate(-S.cam);
    function disk(c,r,color){g.beginPath();g.arc(c.x,c.y,r,0,2*Math.PI);g.fillStyle=color;g.fill();}
    function label(p,s,color){g.save();g.translate(p.x,p.y);g.rotate(S.cam);g.fillStyle=color;g.font='bold 0.96px sans-serif';g.textAlign='center';g.fillText(s,0,-.95);g.restore();}
    disk(O,20,'#203348');
    if(phase==='garuda')for(const [name,x,y,color] of MARKERS){disk(pos(x,y),.85,color);label(pos(x,y),name,color);}
    for(let i=0;i<4;i++)label(polar(i*90,21),DIR_NAME[i*2],'#cfe9ff');
    g.save();g.beginPath();g.arc(0,0,20,0,Math.PI*2);g.clip();
    for(const a of S.aoes){
      if(a.assistOnly&&!S.opts.assist)continue;const s=a.shape,col='#ff863c77';
      if(s.type==='circle')disk(s.c,s.r,col);
      else if(s.type==='donut'){g.beginPath();g.arc(s.c.x,s.c.y,s.r,0,2*Math.PI);g.arc(s.c.x,s.c.y,s.inner,0,2*Math.PI,true);g.fillStyle=col;g.fill('evenodd');}
      else if(s.type==='strip'){g.save();g.translate(s.c?.x||0,s.c?.y||0);g.rotate(rad(s.deg));g.fillStyle=col;g.fillRect(-s.half,-(s.length||30),s.half*2,s.length?s.length+(s.back||0):60);g.restore();}
      else{const p=s.from(),b=s.to(),angle=Math.atan2(b.y-p.y,b.x-p.x);g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,s.len,angle-s.half,angle+s.half);g.closePath();g.fillStyle=col;g.fill();}
    }
    for(const guide of sceneGuides()){g.strokeStyle=guide.color;g.lineWidth=.2;g.beginPath();if(guide.type==='ring')g.arc(guide.pos.x,guide.pos.y,guide.radius||1.8,0,Math.PI*2);else{g.moveTo(guide.a.x,guide.a.y);g.lineTo(guide.b.x,guide.b.y);}g.stroke();}
    const orbs=sceneOrbs();
    for(const b of orbs.bodies){disk(b.pos,b.radius,b.color);disk(pos(b.pos.x-b.radius*.3,b.pos.y-b.radius*.3),b.radius*.35,'#fff8dc');}
    for(const fx of orbs.effects){
      const k=fx.progress,col=fx.outcome==='soak'?'#ffe19a':fx.outcome==='fusion'?'#bf85ff':'#ff6655';
      g.save();g.globalAlpha=1-k;
      for(const b of fx.bodies)disk(b.pos,b.radius*Math.max(.01,1-k*3),col);
      g.strokeStyle=col;g.lineWidth=.25;g.beginPath();g.arc(fx.pos.x,fx.pos.y,fx.radius*Math.min(1,.05+k*2),0,Math.PI*2);g.stroke();
      for(const p of fx.targets){g.beginPath();g.arc(p.x,p.y,.5+k*1.3,0,Math.PI*2);g.stroke();}
      g.restore();
    }
    for(const boss of sceneActors(S.t)){disk(boss.pos,1.4,'#a66dc5');label(boss.pos,boss.tag,'#fff');}
    if(S.phase==='intermission'&&S.t<501.5){for(let i=0;i<6;i++)label(polar(i*60,9),'機雷','#ffd166');}
    if(S.phase==='intermission'&&S.t>=501.822&&S.t<526)label(O,'拉哈布雷亞','#dab6ff');
    if(S.gaol)disk(S.gaol,1.6,'#957652');
    S.ents.forEach((p,i)=>{disk(p,i===S.opts.role ? .67 : .4,ROLE_COLOR[i]);label(p,(i===S.opts.role?'你 ':'')+ROLES[i],'#fff');});g.restore();
  }
  restart();let last=performance.now(),lastHud=-1,notified=false;
  function hud(){
    const upcoming=S.events.filter(e=>!e.done).slice(0,5),next=upcoming[0],act=active();
    $('clock').textContent=fmt(S.t);$('statusline').textContent=ROLES[S.opts.role]+' · '+(S.paused?'已暫停':info.name)+(S.opts.god?' · 觀摩模式：碰撞不判失敗':'')+(phase==='garuda'?' · 低氣壓 '+S.stacks[S.opts.role]+' · 覺醒 '+S.charges+'/4':'');
    $('hint').textContent=S.opts.hints?(phase==='intermission'?'LB 分工：D4 法系 → H1 治療 → D1 近戰 → MT。 ':'')+(phase==='garuda'&&cleanseHint(S.t,S.opts.role)||lesson(act.find(e=>goal(e,S.opts.role))||next)):'提示已關閉';
    const list=(id,items)=>$(id).replaceChildren(...items.map(v=>{const li=document.createElement('li');li.textContent=v;return li;}));
    list('upcoming',upcoming.map(e=>eventTime(e.t)+'　'+e.name));list('log',S.log.slice(0,5));
    $('overlay').hidden=!(S.dead||S.done||S.paused);$('ovTitle').textContent=S.dead?'練習失敗':S.done?'階段完成':'已暫停';$('ovReason').textContent=S.reason||'';$('ovHint').textContent=S.paused&&!S.dead&&!S.done?'按 P 繼續':'按 R 從所選機制重來';
    $('castbar').hidden=!act.length;if(act[0]){$('castname').textContent=act[0].name;$('castfill').style.width=100*clamp01(1-(act[0].t-S.t)/Math.max(.01,act[0].lead))+'%';}
  }
  function frame(now){
    let dt=Math.min(.15,(now-last)/1000)*S.opts.speed;last=now;
    while(dt>0){const h=Math.min(dt,.025);step(h,keys);dt-=h;}
    const game=has3d&&S.opts.view==='game';$('viewport').classList.toggle('game',game);
    const size=Math.max(160,Math.min($('viewport').parentElement.clientWidth,Math.max(360,innerHeight-24)));$('viewport').style.maxWidth=size+'px';
    if(game){const cv=$('arena3d');cv.style.height=size+'px';View3D.render(size,size);}else draw(size);
    if(now-lastHud>100){hud();lastHud=now;}
    if(S.done&&!notified){notified=true;window.dispatchEvent(new CustomEvent('uwu-phase-complete',{detail:{phase}}));}if(!S.done)notified=false;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initUwu);
