// Raw NPC collision audit, independent of practice failure attribution.
// Usage: node scripts/audit-uwu-titan-late.js [exclusiveSeedEnd=16] [seedStart=0]
// Observation mode keeps sampling after a controlled-path mistake; every actual
// AoE resolution is checked geometrically for the seven NPCs, without immunity.
// Starts at62s and runs through END_T, including tank swaps and late bombs.
const sim=require('../sim/uwu-titan'),{S}=sim;let bad=[];
for(let seed=Number(process.argv[3]||0);seed<Number(process.argv[2]||16);seed++)for(let role=0;role<8;role++){
Object.assign(S.opts,{preset:'random',seed,start:62,role,god:true});sim.reset();
while(S.t<sim.END_T&&!S.over){if(role===1&&S.t>=104&&S.t<104.1)sim.useSkill('provoke');if(role===0&&S.t>=119.6&&S.t<119.7)sim.useSkill('provoke');let p=S.ents[role],g=sim.npcTarget(p),dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy);S.keys.KeyW=d>.001&&!p.dead&&!S.jailed[role]&&S.t>=S.stun;S.cam=Math.atan2(dx,-dy);sim.step(Math.min(.01,S.keys.KeyW?d/6:.01));
for(const a of S.aoes)if(a.done&&!a.checked){a.checked=true;for(const e of S.ents)if(e.i!==role&&!e.dead&&!S.jailed[e.i]&&!(S.freed[e.i]>S.t)&&!(a.skip||[]).includes(e.i)&&a.hit(e))bad.push({seed,role,t:a.t1,victim:e.i,type:a.shape.type});}}
if(role===7)console.log('seed',seed,'cumulativeHits',bad.length);
}
console.log('count',bad.length);console.log(JSON.stringify(bad,null,2));
