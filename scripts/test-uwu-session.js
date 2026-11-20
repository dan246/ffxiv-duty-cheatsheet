const test = require('node:test');
const assert = require('node:assert/strict');
const session = require('../sim/uwu-session.js');
test('phase handoff preserves practice controls but not previous checkpoint', () => {
  const url = new URL(session.urlFor(session.phases[2], {role:3,speed:0.75,seed:0,god:false,start:112,view:'top'}),'https://example.test/sim/');
  assert.equal(url.pathname,'/sim/uwu-titan.html');
  assert.equal(url.searchParams.get('role'),'3');
  assert.equal(url.searchParams.get('seed'),'0');
  assert.equal(url.searchParams.get('god'),'false');
  assert.equal(url.searchParams.has('start'),false);
});
test('invalid persisted input cannot select missing roles or unbounded speed', () => {
  assert.deepEqual(session.sanitize({role:99,speed:1000,seed:-1,view:'bad',god:'false'}),{});
  assert.equal(session.phaseFor('/sim/uwu.html',new URLSearchParams('phase=bad')),'garuda');
  assert.equal(session.phaseFor('/sim/uwu-ifrit.html',new URLSearchParams('phase=ultima')),'ifrit');
});
test('phase handoff always returns to damage-enabled practice after observation',()=>{
  for(const phase of session.phases){
    const url=new URL(session.urlFor(phase,{role:4,god:true,hints:false,assist:false}),'https://example.test/');
    assert.equal(url.searchParams.get('god'),'false');
    assert.equal(url.searchParams.get('hints'),'false');
  }
});
test('saved observation cannot disable damage on reload; explicit URL observation still works',()=>{
  assert.equal(session.restoreOptions({god:false,role:4},{god:true,role:2},{}).god,false);
  assert.equal(session.restoreOptions({god:false},{god:true},{god:true}).god,true);
  assert.equal(session.persistOptions({god:true,role:2}).god,undefined);
  assert.equal(session.persistOptions({god:true,role:2}).role,2);
});
