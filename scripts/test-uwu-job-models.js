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
  assert(view.init({ insertAdjacentElement: (_, element) => { loadingStatus = element; } }));
  draw(); await tick();
  await Promise.all(loads.map(load => load.finish(load.url.endsWith("war_noanim.glb"))));
  await tick(); draw(); await tick();
  const fallback = loads.find(load => load.url.endsWith("pld_noanim.glb"));
  assert(fallback, "a failed job model requests bundled PLD fallback");
  await fallback.finish(); await tick(); draw();
  const party = find(object => object.userData.pose);
  assert(party.every(player => !player.userData.fallback.visible), "all slots retain a GLB appearance");
  assert.match(loadingStatus.textContent, /1 項模型.*替代造型/);
  const mt = party[0].userData.model.userData.instance;
  assert.equal(mt.entry.state, "ready");
  const override = { arrayBuffer: async () => readModel(new URL("characters/gaol.glb", modelRoot)) };
  assert(await view.setModel("player", override)); draw();
  assert(party.every(player => player.userData.model.userData.instance.entry.manual));
  assert(loadingStatus.hidden, "all-party override suppresses unused job load failure");
  view.clearModel("player"); draw();
  assert.equal(party[0].userData.model.userData.instance.entry, mt.entry);
  assert.match(loadingStatus.textContent, /1 項模型/);
  console.log("Party job fallback passed: failed WAR uses PLD, other roles load normally, global upload overrides all, reset restores cached job/fallback.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
