const {test}=require('node:test'),assert=require('node:assert/strict');
globalThis.UWU_REFERENCE=require('../sim/uwu-reference');
for(const phase of ['garuda','ifrit','titan','ultima'])test(`${phase} every role opens with camera facing into the arena`,()=>{
 const sim=require('../sim/uwu'+(['ifrit','titan'].includes(phase)?'-'+phase:''));
 for(let role=0;role<8;role++){
  Object.assign(sim.S.opts,{role,god:true,preset:'reference',start:-4});
  if(phase==='garuda'||phase==='ultima')sim.reset(phase,0);else sim.reset();
  const p=sim.S.ents[role],r=Math.hypot(p.x,p.y);if(r<1)continue;
  const forward={x:Math.sin(sim.S.cam),y:-Math.cos(sim.S.cam)};
  assert((forward.x*-p.x+forward.y*-p.y)/r>.99,`${role}: camera points outside arena`);
 }
});
