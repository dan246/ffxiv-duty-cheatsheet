// Real Three.js transforms and bundled GLB parsing; WebGL rasterization is stubbed.
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
  arena.assetPhase = "titan";
  arena.arena = { radius: 20, previousRadius: 20, collapse: 0 };
  arena.t = -1;
  assert(view.init({ insertAdjacentElement: (_, element) => { loadingStatus = element; } }));
  draw(); await tick();
  await Promise.all(loads.map(load => load.finish())); await tick(); draw();
  const debris = scene.getObjectByName("titan-collapse-sectors");
  assert.equal(debris.children.length, 12);
  assert(debris.visible, "opening has a full stationary outer ring");
  const inner = scene.getObjectByName("titan-inner-collapse-sectors");
  assert(inner.visible && inner.children.every(m => m.position.y === 0));
  assert(debris.children.every(m => m.visible && m.position.y === 0));
  scene.updateMatrixWorld(true);
  const ringBounds = new THREE.Box3().setFromObject(debris);
  assert(Math.abs(ringBounds.max.y) < 1e-6, "ring surface is at the actor floor");
  assert(ringBounds.max.x > 19.9 && ringBounds.min.x < -19.9);
  const core = models().find(m => m.root.getObjectByName("w1fz-titan_boss"));
  assert(core, "real p3 map was parsed");
  let floorMaterial;
  core.root.traverse(object => {
    if (object.material?.name.includes("rcjr5a")) floorMaterial = object.material;
  });
  assert(floorMaterial?.map);
  assert.notEqual(debris.children[0].material, floorMaterial, "sector material is an isolated clone");
  assert.equal(debris.children[0].material.map, floorMaterial.map, "sector uses actual p3 floor texture");
  const uv = debris.children[0].geometry.getAttribute("uv");
  assert(Array.from(uv.array).some(value => Math.abs(value) > 1), "planar UVs tile with original floor density");
  assert(Math.abs(core.root.parent.scale.x - 12 / 20.859610458372096) < 1e-9);
  arena.t = 30.606; arena.arena = { radius: 16, previousRadius: 20, collapse: .5 }; draw();
  assert(debris.children.every(m => m.visible && m.position.y < -6));
  assert(debris.children.some(m => Math.abs(m.rotation.z) > .1));
  arena.t = 31.206; arena.arena.collapse = 1; draw();
  assert(debris.children.every(m => !m.visible));
  assert(Math.abs(core.root.parent.scale.x - 12 / 20.859610458372096) < 1e-9);
  assert(inner.visible && inner.children.every(m => m.position.y === 0), "second landing preserves 12–16 ring");
  arena.t = 84.258; arena.arena = { radius: 12, previousRadius: 16, collapse: 0 }; draw(); scene.updateMatrixWorld(true);
  assert(!debris.visible && inner.visible);
  const thirdBounds = new THREE.Box3().setFromObject(inner);
  assert(thirdBounds.max.x > 15.9 && thirdBounds.max.x <= 16.001);
  assert(Math.abs(thirdBounds.max.y) < 1e-6);
  assert(Math.abs(core.root.parent.scale.x - 12 / 20.859610458372096) < 1e-9);
  arena.t += .6; arena.arena.collapse = .5; draw();
  assert(inner.children.every(m => m.position.y < -6));
  arena.t += .6; arena.arena.collapse = 1; draw();
  assert(!inner.visible && !debris.visible);
  const player = find(m => m.userData.pose)[0];
  arena.ents[0].dead = true; draw(); scene.updateMatrixWorld(true);
  assert.equal(player.rotation.z, 0, "labels and ring are not rolled with corpse");
  assert.equal(player.userData.pose.rotation.z, Math.PI / 2);
  let minY = Infinity;
  const vertex = new THREE.Vector3();
  player.userData.model.traverse(mesh => {
    const positions = mesh.geometry?.getAttribute("position");
    if (!mesh.isMesh || !positions) return;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      if (mesh.isSkinnedMesh) mesh.boneTransform(i, vertex);
      minY = Math.min(minY, vertex.applyMatrix4(mesh.matrixWorld).y);
    }
  });
  assert(Math.abs(minY - .02) < 1e-5, "loaded corpse rests on floor using actual deformed bounds");
  arena.ents[0].fallY = -8; draw();
  assert.equal(player.position.y, -8);
  assert(!player.userData.name.visible);
  arena.ents[0].fallY = -46; draw(); assert(!player.visible);
  arena.t = -1; arena.arena = { radius: 20, previousRadius: 20, collapse: 0 };
  arena.ents[0].dead = false; delete arena.ents[0].fallY; draw();
  assert(debris.visible && inner.visible);
  assert([...debris.children, ...inner.children].every(m => m.visible && m.position.y === 0 && m.rotation.z === 0));
  assert(Math.abs(core.root.parent.scale.x - 12 / 20.859610458372096) < 1e-9);
  arena.t = 30.006; arena.arena = { radius: 16, previousRadius: 20, collapse: 0 }; draw();
  assert(debris.visible && debris.children.every(m => m.visible && m.position.y === 0 && m.rotation.z === 0));
  assert(player.visible); assert.equal(player.position.y, 0);
  assert.equal(player.userData.pose.rotation.z, 0); assert(player.userData.name.visible);
  arena.assetPhase = "ifrit"; draw(); assert(!debris.visible);
  assert.equal(core.root.parent.scale.x, 1, "other phases retain original map scale");
  console.log("Titan view passed: ring bounds, falling sectors, replay/reset, grounded GLB corpse, falling actor and other-phase isolation.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
