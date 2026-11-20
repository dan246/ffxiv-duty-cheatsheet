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
  draw();
  await tick();
  assert.equal(loads.length, 12);
  assert.match(loadingStatus.textContent, /載入/);
  assert.equal(models().length, 0);
  await Promise.all(loads.map((load) => load.finish()));
  await tick();
  draw();
  assert.equal(loadingStatus.hidden, true);
  assert.equal(models().length, 12);
  const jobFiles = loads.map(load => load.url.split("/").pop()).filter(file => file.endsWith("_noanim.glb") || file === "sge_training.glb");
  assert.deepEqual(jobFiles.sort(), ["ast_noanim.glb", "dnc_noanim.glb", "drg_noanim.glb", "drk_noanim.glb", "sam_noanim.glb", "sge_training.glb", "smn_noanim.glb", "war_noanim.glb"]);
  const party = find(object => object.userData.pose);
  const roots = party.map(player => player.userData.model.userData.instance.root);
  const geometries = roots.map(root => find(object => object.isMesh, root)[0].geometry);
  assert.equal(new Set(geometries).size, 8, "each party role has distinct loaded job geometry");

  const ifrits = models().filter((model) => model.idle?.name === "idle");
  assert.equal(ifrits.length, 2);
  assert.notEqual(skin(ifrits[0]).skeleton, skin(ifrits[1]).skeleton);
  assert.notEqual(skin(ifrits[0]).skeleton.bones[0], skin(ifrits[1]).skeleton.bones[0]);
  assert.equal(skin(ifrits[0]).geometry, skin(ifrits[1]).geometry);
  actors[0].pos.x += 1;
  arena.t = 0.05;
  arena.aoes = [{ shape: { type: "donut", c: { x: 4, y: -3 }, inner: 6, r: 18 }, t0: 0, t1: 1 }];
  draw();
  assert.equal(ifrits[0].clip.name, "walk");
  assert.equal(ifrits[1].clip.name, "idle");
  const [donut] = find((object) => object.geometry?.parameters?.innerRadius === 6);
  assert.equal(donut.geometry.parameters.outerRadius, 18);
  assert.equal(donut.position.x, 4);
  assert.equal(donut.position.z, -3);

  guides = Array.from({ length: 6 }, (_, i) => ({ type: "ring", pos: { x: i, y: 2 }, color: "#42caff" }));
  guides.push(...[3, 7].map((x) => ({ type: "line", a: { x, y: 3 }, b: { x, y: -4 }, color: "#42caff" })));
  draw();
  const guideRings = () => find((object) => object.geometry?.parameters?.innerRadius === 1.05);
  const guideLines = () => find((object) => object.isLine && object.geometry.getAttribute("position").usage === THREE.DynamicDrawUsage);
  const rings = guideRings(), lines = guideLines();
  assert.equal(rings.length, 6);
  assert.equal(lines.length, 2);
  assert(rings.every((ring) => ring.visible));
  assert(lines.every((line) => line.visible));
  assert.equal(rings[5].position.x, 5);
  assert.equal(lines[1].geometry.getAttribute("position").getX(1), 7);
  guides = [guides[0], guides[6]];
  guides[1].b.x = 11;
  draw();
  assert.deepEqual(guideRings(), rings);
  assert.deepEqual(guideLines(), lines);
  assert.equal(rings.filter((ring) => ring.visible).length, 1);
  assert.equal(lines.filter((line) => line.visible).length, 1);
  assert.equal(lines[0].geometry.getAttribute("position").getX(1), 11);

  const upload = { arrayBuffer: async () => readModel(new URL("characters/gaol.glb", modelRoot)) };
  assert(await view.setModel("player", upload));
  draw();
  const users = models().filter((model) => model.entry.manual);
  assert.equal(users.length, 8);
  let disposals = 0;
  skin(users[0]).geometry.addEventListener("dispose", () => disposals++);
  view.clearModel("player");
  draw();
  assert.equal(models().filter((model) => model.entry.manual).length, 0);
  assert.equal(disposals, 1);
  assert.equal(loads.length, 12);
  let finishUpload;
  const slow = view.setModel("player", { arrayBuffer: () => new Promise((resolve) => { finishUpload = resolve; }) });
  await tick();
  view.clearModel("player");
  finishUpload(await upload.arrayBuffer());
  assert.equal(await slow, false);
  await assert.rejects(view.setModel("player", { arrayBuffer: async () => new ArrayBuffer(0) }), /GLB/);

  arena.assetPhase = "ultima";
  actors[0].kind = "garuda";
  actors[1].kind = "titan";
  actors.push({ kind: "ultima", pos: { x: 4, y: 2 }, look: { x: 4, y: 0 }, tag: "" });
  arena.props = [];
  draw();
  await tick();
  const phaseLoads = loads.slice(12);
  assert.deepEqual(phaseLoads.map(({ url }) => url.split("/").pop()).sort(), ["garuda.glb", "p4.glb", "titan.glb", "ultima.glb"]);
  await Promise.all(phaseLoads.map((load) => load.finish(load.url.endsWith("/garuda.glb"))));
  await tick();
  draw();
  assert.match(loadingStatus.textContent, /1 項模型/);
  assert(await view.setModel("garuda", { arrayBuffer: async () => readModel(new URL("characters/garuda.glb", modelRoot)) }));
  draw();
  assert.equal(models().filter((model) => model.idle?.name === "idle").length, 3);
  assert.equal(loadingStatus.hidden, true);
  view.clearModel("garuda");
  actors.pop();
  arena.assetPhase = "ifrit";
  for (const actor of actors) delete actor.kind;
  draw();
  assert.equal(loadingStatus.hidden, true);
  assert.equal(loads.length, 16);
  console.log("UWU 3D smoke passed (GLB parsing, fallback, cache, animations, models and maps, donut, guides, overrides).");
}

main().catch((error) => {
  if (error.code === "ENOENT") console.error("This test requires the local xivsim-assets package.");
  console.error(error);
  process.exitCode = 1;
});
