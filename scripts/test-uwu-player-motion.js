// Run with node scripts/test-uwu-assets.js and the local xivsim-assets package.
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const vm = require("node:vm");

const rendererPath = path.resolve(__dirname, "../sim/uwu-view3d.js");
const rendererUrl = pathToFileURL(rendererPath);
const modelRoot = new URL("../xivsim-assets/models/", rendererUrl);
global.THREE = require("../sim/vendor/three-r128/three.min.js");
global.self = global;
// The real GLB parser reads embedded texture definitions, while Node stands in for image decoding.
global.createImageBitmap = async () => ({ width: 4, height: 4, close() {} });
require("../sim/vendor/three-r128/GLTFLoader.js");
require("../sim/vendor/three-r128/SkeletonUtils.js");

const loads = [];
let scene, loadingStatus;

function readModel(url) {
  const data = fs.readFileSync(fileURLToPath(url));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.length);
}

THREE.GLTFLoader.prototype.loadAsync = function (url) {
  return new Promise((resolve, reject) => {
    loads.push({
      url,
      finish: async (fail = false) => {
        if (fail) {
          reject(new Error("Test load failure"));
          return;
        }
        try {
          const gltf = await new Promise((done, failed) => this.parse(readModel(url), "", done, failed));
          resolve(gltf);
        } catch (error) {
          reject(error);
          throw error;
        }
      },
    });
  });
};

class MemoryRenderer {
  constructor({ canvas }) { this.domElement = canvas; }
  setPixelRatio(ratio) { this.pixelRatio = ratio; }
  getPixelRatio() { return this.pixelRatio; }
  setSize(width, height) { Object.assign(this.domElement, { width, height }); }
  render(value) { scene = value; }
}
THREE.WebGLRenderer = MemoryRenderer;

let guides = [];
const roles = ["MT", "ST", "H1", "H2", "D1", "D2", "D3", "D4"];
const actors = [0, 1].map((x) => ({ pos: { x, y: 0 }, look: { x: 0, y: -1 }, tag: "", real: x === 1 }));
const arena = {
  t: 0, opts: { assist: false, role: 0 },
  ents: roles.map((_, i) => ({ x: i, y: i })),
  aoes: [], flashRings: [], props: [{ type: "gaol", pos: { x: 1, y: 2 } }],
  cam: 0, pitch: 0.5, dist: 15,
};
const view = vm.runInNewContext(fs.readFileSync(rendererPath, "utf8") + "\nView3D;", {
  THREE, URL, TextDecoder, performance,
  document: {
    currentScript: { src: rendererUrl.href },
    head: { append() {} },
    createElement(tag) {
      if (tag !== "canvas") return { textContent: "", hidden: true, setAttribute() {} };
      return { getContext: () => ({ measureText: () => ({ width: 30 }), strokeText() {}, fillText() {} }) };
    },
  },
  devicePixelRatio: 1,
  location: { href: rendererUrl.href, pathname: "/sim/uwu-ifrit.html" },
  CFG: { R: 20, swR: 14, stackR: 4.5, fetterMax: 10 },
  ROLES: roles, ROLE_COLOR: roles.map(() => 0xffffff), MARKERS: [], DIR_NAME: [],
  S: arena, sceneActors: () => actors, sceneGuides: () => guides, bossState: () => ({ vis: true }),
  hasSw: () => false, fetterOn: () => false, tankable: () => false, nails: () => [],
  clamp01: (value) => Math.max(0, Math.min(1, value)),
});

const draw = () => view.render(1000, 800);
const tick = () => new Promise((resolve) => setImmediate(resolve));
function find(test, root = scene) {
  const matches = [];
  root.traverse((object) => { if (test(object)) matches.push(object); });
  return matches;
}
const models = () => find((object) => object.userData.instance).map((object) => object.userData.instance);
const skin = (model) => find((object) => object.isSkinnedMesh, model.root)[0];

async function main() {
  const warnings = [], originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(" "));
  try {
    arena.ents.forEach(e => { e.face = Math.PI - .03; });
    assert(view.init({ insertAdjacentElement: (_, element) => { loadingStatus = element; } }));
    draw(); await tick();
    await Promise.all(loads.map(load => load.finish())); await tick(); draw();
    const party = find(object => object.userData.pose);
    const instances = party.map(g => g.userData.model.userData.instance);
    assert(instances.every(item => item.sharedMotion && item.idle && item.walk && item.run && item.sprint));
    const states = instances.map(item => ({
      rootPosition: item.root.position.clone(), rootScale: item.root.scale.clone(),
      bone: item.root.getObjectByName("j_asi_b_r"),
      transforms: find(o => o.isBone, item.root).map(bone => ({ bone, position: bone.position.clone(), scale: bone.scale.clone() })),
    }));
    const startQuats = states.map(state => state.bone.quaternion.clone());
    const yaw = party[0].rotation.y;
    arena.ents[0].face = -Math.PI + .03;
    for (let frame = 0; frame < 10; frame++) {
      arena.t += .05; arena.ents.forEach(e => { e.x += .3; }); draw();
      if (frame === 0) assert(Math.abs(party[0].rotation.y - yaw) < .04, "yaw follows shortest arc smoothly");
    }
    assert(instances.every(item => item.clip === item.run), "normal-speed movement selects run");
    for (const index of [0, 3]) assert(states[index].bone.quaternion.angleTo(startQuats[index]) > .01, "WAR and normalized SGE bones both animate");
    instances.forEach((item, i) => {
      assert(item.root.position.equals(states[i].rootPosition)); assert(item.root.scale.equals(states[i].rootScale));
      states[i].transforms.forEach(({bone, position, scale}) => {
        assert(bone.position.equals(position), "retargeting preserves bone translations");
        assert(bone.scale.equals(scale), "retargeting preserves rest scale");
      });
      assert.equal(party[i].position.x, arena.ents[i].x, "animation never moves the gameplay holder");
      assert(item.run.tracks.every(track => track.name.endsWith(".quaternion") && !track.name.startsWith("n_root.")));
    });
    arena.t += .05; draw();
    const moving = instances[0];
    assert.equal(moving.clip, moving.walk);
    assert(moving.mixer.clipAction(moving.walk).getEffectiveWeight() > 0 && moving.mixer.clipAction(moving.walk).getEffectiveWeight() < 1);
    assert(moving.mixer.clipAction(moving.run).getEffectiveWeight() > 0, "outgoing run and incoming walk crossfade");
    assert(moving.mixer.clipAction(moving.walk).getEffectiveTimeScale() >= .65, "cycle speed adapts within stable limits");
    const item = instances[0], clip = item.clip, time = item.mixer.time, q = states[0].bone.quaternion.clone();
    draw(); draw(); assert.equal(item.clip, clip); assert.equal(item.mixer.time, time); assert(states[0].bone.quaternion.equals(q));
    arena.ents[0].dead = true; arena.t += .1; draw();
    assert.equal(item.mixer.time, time); assert(states[0].bone.quaternion.equals(q));
    arena.ents[3].dead = true; draw(); scene.updateMatrixWorld(true);
    function actualMinY(group) {
      let min = Infinity; const vertex = new THREE.Vector3();
      group.traverse(mesh => {
        const positions = mesh.geometry?.getAttribute("position");
        if (!mesh.isMesh || !positions) return;
        for (let i = 0; i < positions.count; i++) {
          vertex.fromBufferAttribute(positions, i);
          if (mesh.isSkinnedMesh) mesh.boneTransform(i, vertex);
          min = Math.min(min, vertex.applyMatrix4(mesh.matrixWorld).y);
        }
      });
      return min;
    }
    for (const index of [0, 3]) assert(Math.abs(actualMinY(party[index].userData.model) - .02) < 1e-5, "actual deformed WAR/SGE corpse touches floor");
    const corpseCache = party[0].userData.corpse;
    draw(); assert.equal(party[0].userData.corpse, corpseCache, "frozen corpse bounds are cached");
    arena.ents[0].fallY = -5; arena.t += .1; draw(); assert.equal(party[0].position.y, -5); assert.equal(item.mixer.time, time);
    scene.updateMatrixWorld(true); assert(Math.abs(actualMinY(party[0].userData.model) - (-4.98)) < 1e-5, "cached corpse offset follows falling holder");
    assert.equal(party[0].userData.corpse, corpseCache);
    arena.ents[3].dead = false;
    arena.ents[0].dead = false; arena.ents[0].fallY = 0; arena.t = -1; draw();
    assert.equal(item.mixer.time, 0); assert.equal(item.clip, item.idle);
    assert.equal(party[0].rotation.y, -arena.ents[0].face - Math.PI / 2);
    for (let frame = 0; frame < 12; frame++) {
      arena.t += .05; arena.ents.forEach(e => { e.x += 7.8 * .05; }); draw();
    }
    assert(instances.every(instance => instance.clip === instance.sprint), "7.8 m/s selects source sprint clip");
    assert(Math.abs(item.mixer.clipAction(item.sprint).getEffectiveTimeScale() - 1) < .01);
    arena.ents = arena.ents.map(entity => ({ ...entity, x: 0, y: 0, face: 1 }));
    draw();
    assert(instances.every(instance => instance.clip === instance.idle && instance.mixer.time === 0), "same-time checkpoint reset clears motion");
    assert.equal(party[0].rotation.y, -1 - Math.PI / 2, "new entity resets heading even at identical time");
    assert.equal(warnings.length, 0, warnings.join("\n"));
    console.log("Party motion passed: native/SGE bone animation, rotation-only retarget, preserved roots/scales, shortest-arc heading, pause/death/fall freeze and rewind reset; no binding warnings.");
  } finally { console.warn = originalWarn; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
