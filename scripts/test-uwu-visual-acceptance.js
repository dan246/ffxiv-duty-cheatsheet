// Geometry/inventory acceptance only. Does not rasterize or establish visual quality.
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
let observedBossRing = null;
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
  bossRing: () => observedBossRing,
  hasSw: () => false, fetterOn: () => false, tankable: () => false, nails: () => [],
  clamp01: (value) => Math.max(0, Math.min(1, value)),
  rad: (degrees) => degrees * Math.PI / 180,
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


function deformedBounds(root) {
  const bounds = new THREE.Box3(), vertex = new THREE.Vector3();
  root.traverseVisible(mesh => {
    const positions = mesh.geometry?.getAttribute("position");
    if (!mesh.isMesh || !positions) return;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      if (mesh.isSkinnedMesh) mesh.boneTransform(i, vertex);
      bounds.expandByPoint(vertex.applyMatrix4(mesh.matrixWorld));
    }
  });
  return bounds;
}
async function inventory() {
  const crypto = require("node:crypto"), root = path.resolve(__dirname, "../xivsim-assets");
  const hash = data => crypto.createHash("sha256").update(data).digest("hex");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json")));
  const validation = JSON.parse(fs.readFileSync(path.join(root, "job-models-validation.json")));
  const expected = new Map([...manifest, ...validation.map(row => ({ ...row, file: "models/characters/players/" + row.file }))].map(row => [row.file, row]));
  let textureCount = 0;
  for (const model of manifest) for (const texture of model.images || []) {
    assert.equal(hash(fs.readFileSync(path.join(root, texture.file))), texture.sha256, texture.file);
    textureCount++;
  }
  function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
  const models = [];
  for (const file of files(path.join(root, "models")).filter(file => file.endsWith(".glb")).sort()) {
    const data = fs.readFileSync(file), relative = path.relative(root, file), sha256 = hash(data);
    assert.equal(data.readUInt32LE(0), 0x46546c67, relative);
    assert.equal(data.readUInt32LE(4), 2, relative);
    assert.equal(data.readUInt32LE(8), data.length, relative);
    const meta = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)));
    assert([...meta.buffers || [], ...meta.images || []].every(resource => !resource.uri || resource.uri.startsWith("data:")), `${relative} external dependency`);
    if (expected.has(relative)) assert.equal(sha256, expected.get(relative).sha256, relative);
    if (relative.endsWith("lala_anim.glb")) assert.equal(sha256, "feb8b15da84d2d98d6b3e6a5c85409f4533c707d0336e501324d2c88e292d121", "motion source hash");
    const gltf = await new Promise((resolve, reject) => new THREE.GLTFLoader().parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), "", resolve, reject));
    let texturedMeshes = 0, meshes = 0, skinnedMeshes = 0;
    gltf.scene.traverse(object => {
      if (!object.isMesh) return;
      meshes++; if (object.isSkinnedMesh) skinnedMeshes++;
      const materials = [].concat(object.material);
      if (materials.some(material => material.map || material.normalMap)) {
        texturedMeshes++;
        assert(object.geometry.getAttribute("uv"), `${relative} textured mesh missing UV`);
      }
      assert(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite), `${relative} finite vertices`);
    });
    assert(meshes > 0 || gltf.animations.length > 0, relative);
    models.push({ file: relative, bytes: data.length, sha256, meshes, skinnedMeshes, texturedMeshes, embeddedImages: meta.images?.length || 0, animations: gltf.animations.map(clip => clip.name), listedInAssetManifest: expected.has(relative), source: expected.get(relative)?.source || (relative.endsWith("lala_anim.glb") ? "https://cdn.xivsim.com/models/characters/players/lala_anim.glb" : relative.endsWith("sge_training.glb") ? "WHM derivative; see job-models-README.md and embedded extras" : "https://cdn.xivsim.com/" + relative) });
  }
  assert.equal(models.filter(row => /characters\/players\/(war|drk|ast|sge_training|drg|sam|dnc|smn)(_noanim)?\.glb$/.test(row.file)).length, 8);
  return { models, textureHashesVerified: textureCount };
}
async function main() {
  assert(view.init({ insertAdjacentElement: (_, element) => { loadingStatus = element; } }));
  draw(); await tick(); await Promise.all(loads.map(load => load.finish())); await tick(); draw();
  // The encounter's collision shapes use translated centers. Their decals
  // must show the same center, including when a cached shape is moved.
  const strip = { type: "strip", half: 2, deg: 90, c: { x: 7, y: -4 } };
  const cross = { type: "cross", half: 1, deg: 45, c: { x: -6, y: 3 } };
  arena.aoes = [strip, cross].map(shape => ({ shape, t0: 0, t1: 10 }));
  draw(); scene.updateMatrixWorld(true);
  const attackMeshes = color => find(mesh => mesh.geometry?.type === "ShapeGeometry" && mesh.material?.color?.getHex() === color);
  const stripMeshes = attackMeshes(0xff7828), crossMeshes = attackMeshes(0xffa040);
  assert.equal(stripMeshes.length, 1); assert.equal(crossMeshes.length, 2);
  const checkCenter = (mesh, x, z) => {
    const center = mesh.localToWorld(new THREE.Vector3());
    assert(Math.abs(center.x - x) < 1e-9 && Math.abs(center.z - z) < 1e-9, `attack center should be (${x}, ${z}), got (${center.x}, ${center.z})`);
  };
  checkCenter(stripMeshes[0], 7, -4);
  crossMeshes.forEach(mesh => checkCenter(mesh, -6, 3));
  strip.c = { x: -2, y: 9 }; delete cross.c;
  draw(); scene.updateMatrixWorld(true);
  checkCenter(stripMeshes[0], -2, 9);
  crossMeshes.forEach(mesh => checkCenter(mesh, 0, 0));
  arena.aoes = []; draw();

  // Finite, forward-only landslides must not display a lethal lane behind
  // their source. Probe the actual transformed mesh, not the shape helper.
  const finite = { type: "strip", half: 3, deg: 180, c: { x: 3, y: -17 }, length: 40.5, back: .5 };
  arena.aoes = [{ shape: finite, t0: 0, t1: 10 }];
  draw(); scene.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const decalHit = (x, z) => {
    ray.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0));
    return ray.intersectObjects(attackMeshes(0xff7828), false).length > 0;
  };
  assert(decalHit(3, -10), "forward landslide is visible");
  assert(!decalHit(3, -19), "no landslide decal behind its finite source");
  assert(!decalHit(7, -10), "decal must respect three-metre half-width");
  assert(!decalHit(3, 21), "finite decal stays on the arena");
  finite.c = { x: -17, y: -3 }; finite.deg = 90;
  draw(); scene.updateMatrixWorld(true);
  assert(decalHit(-10, -3), "cached lane follows the new facing");
  assert(!decalHit(-19, -3), "cached lane keeps its finite back edge");
  assert(!decalHit(-10, 1), "cached lane updates its transverse axis");
  finite.length = 5;
  draw(); scene.updateMatrixWorld(true);
  assert(decalHit(-14, -3));
  assert(!decalHit(-10, -3), "cached lane responds to a shorter length");
  const rectangle={type:"rect",from:{x:0,y:0},ang:0,half:3,len:44.55,back:4.55};
  arena.aoes=[{shape:rectangle,t0:0,t1:10}];draw();scene.updateMatrixWorld(true);
  assert(decalHit(-4,0),"Titan main lane includes boss rear hitbox");
  assert(!decalHit(-5,0),"Titan rear extent is finite");
  assert(!decalHit(22,0),"Titan rect decal clips to arena");
  rectangle.ang=Math.PI/2;draw();scene.updateMatrixWorld(true);
  assert(decalHit(0,-4),"Titan rect rotation updates while paused");
  assert(!decalHit(-4,0),"old rect orientation is removed");
  arena.aoes = []; draw();

  // Titan must disappear on the engine's visibility signal and show final
  // cardinal turns in the very same rendered frame, even while paused.
  const loadStart = loads.length;
  Object.assign(actors[0], { kind: "titan", pos: { x: 8, y: -5 }, look: { x: 8, y: -6 }, alt: 30, vis: false });
  draw(); await tick(); await Promise.all(loads.slice(loadStart).map(load => load.finish())); await tick(); draw();
  const titanActor = find(object => object.userData.aura)[0];
  assert.equal(titanActor.position.y, 30, "Titan altitude follows the engine");
  assert.equal(titanActor.visible, false, "Titan disappears while airborne when vis is false");
  actors[0].vis = true; actors[0].alt = 0;
  for (const [x, y] of [[8, -6], [9, -5], [8, -4], [7, -5], [8, -6]]) {
    actors[0].look = { x, y }; draw();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(titanActor.quaternion);
    assert(Math.abs(forward.x - (x - 8)) < 1e-9 && Math.abs(forward.z - (y + 5)) < 1e-9, "Titan final facing must apply immediately without smoothing lag");
  }
  assert.equal(titanActor.visible, true); assert.equal(titanActor.position.y, 0, "Titan lands at engine floor height");
  actors[0].pos = { x: -12, y: 0 }; actors[0].look = { x: 0, y: 0 }; draw();
  assert.equal(titanActor.position.x, -12); assert.equal(titanActor.position.z, 0, "Titan lands at the engine's chosen cardinal location");
  // A radius-14 logged boss anchor lies outside the final radius-12 platform.
  // Only the reconstructed model may move: mechanic origins and the target
  // ring must retain their exact source positions.
  const solePoints = holder => {
    const points = [], point = new THREE.Vector3();
    holder.traverseVisible(mesh => {
      const positions = mesh.geometry?.getAttribute("position");
      if (!mesh.isMesh || !positions) return;
      for (let vertex = 0; vertex < positions.count; vertex++) {
        point.fromBufferAttribute(positions, vertex);
        if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
        points.push(point.clone().applyMatrix4(mesh.matrixWorld));
      }
    });
    const lowest = Math.min(...points.map(p => p.y));
    return points.filter(p => p.y <= lowest + .25);
  };
  const landingSupport = [];
  arena.assetPhase = "titan";
  for (const radius of [20, 16, 12]) for (const [x, y] of [[0, 14], [14, 0], [0, -14], [-14, 0]]) {
    arena.arena = { radius, previousRadius: radius, collapse: 1 };
    Object.assign(actors[0], { pos: { x, y }, look: { x: 0, y: 0 }, alt: 0, vis: true });
    observedBossRing = { pos: { x, y }, look: { x: 0, y: 0 }, r: 4.2, half: .9, tip: 5.1 };
    arena.aoes = [{ shape: { type: "circle", c: { x, y }, r: 22 }, t0: 0, t1: 10 }];
    const sourceState = JSON.stringify([actors, arena.arena, observedBossRing, arena.aoes]);
    draw(); scene.updateMatrixWorld(true);
    const soles = solePoints(titanActor.userData.model), maximumRadius = Math.max(...soles.map(p => Math.hypot(p.x, p.z)));
    assert(maximumRadius <= radius + 1e-5, `Titan soles lack support on ${radius}m platform: max radius ${maximumRadius}`);
    assert.equal(titanActor.position.x, x); assert.equal(titanActor.position.z, y);
    const ring = find(g => g.children.length === 2 && g.children[0].geometry?.parameters?.outerRadius === 1.03)[0];
    assert(ring); assert.equal(ring.position.x, x); assert.equal(ring.position.z, y);
    const circle = find(g => g.geometry?.type === "CircleGeometry" && g.material?.color?.getHex() === 0xff7828)[0];
    assert(circle); assert.equal(circle.position.x, x); assert.equal(circle.position.z, y);
    assert.equal(JSON.stringify([actors, arena.arena, observedBossRing, arena.aoes]), sourceState, "render correction cannot rewrite encounter positions, AoEs or radius");
    const offset = titanActor.userData.model.position.length();
    if (radius >= 16) assert(offset < 1e-9, "already-supported model keeps its original placement");
    else {
      assert(offset > 0);
      const outward = new THREE.Vector3(x / 14 * .001, 0, y / 14 * .001);
      assert(soles.some(p => Math.hypot(p.x + outward.x, p.z + outward.z) > radius), "landing adaptation uses the minimum inward displacement");
    }
    landingSupport.push({ radius, x, y, soleVertices: soles.length, maximumRadius, modelOffset: offset });
  }
  let priorOffset = 0;
  for (const collapse of [0, .25, .5, .75, 1]) {
    arena.arena = { radius: 12, previousRadius: 16, collapse };
    draw(); scene.updateMatrixWorld(true);
    const supportRadius = 16 - 4 * collapse;
    assert(solePoints(titanActor.userData.model).every(p => Math.hypot(p.x, p.z) <= supportRadius + 1e-5), "model follows the current collapsing support radius");
    const offset = titanActor.userData.model.position.length();
    assert(offset >= priorOffset - 1e-8, "shrinking floor requires only a continuous inward adjustment");
    priorOffset = offset;
  }
  for (const [alt, vis] of [[1, true], [48, false]]) {
    Object.assign(actors[0], { alt, vis }); draw();
    assert.equal(titanActor.userData.model.position.length(), 0, "airborne/hidden Titan has no ground correction");
  }
  Object.assign(actors[0], { alt: 0, vis: true }); draw();
  assert(titanActor.userData.model.position.length() > 0, "landing reapplies support correction");
  actors[0].kind = "ifrit"; draw();
  assert.equal(titanActor.userData.model.position.length(), 0, "a reused Ifrit slot does not inherit Titan's correction");
  actors[0].kind = "titan"; draw();
  arena.t = -4; arena.arena = { radius: 20, previousRadius: 20, collapse: 0 };
  actors[0].pos = { x: 0, y: 0 }; draw();
  assert.equal(titanActor.userData.model.position.length(), 0, "restart clears the prior landing correction");
  arena.t = 0; arena.aoes = []; observedBossRing = null;
  delete arena.assetPhase; delete arena.arena; draw();
  // Every vertical face needs two-dimensional UVs. X/Z-only mapping
  // collapses a vertical triangle to a line and smears one texel column.
  const ringUV = { sectors: 0, sideTriangles: 0, capVertices: 0, minimumSideUVArea: Infinity, positionHashes: [] };
  const uvDensity = 0.126 * 20.859610458372096 / 12;
  for (const name of ["titan-collapse-sectors", "titan-inner-collapse-sectors"]) {
    for (const sector of scene.getObjectByName(name).children) {
      ringUV.sectors++;
      const geometry = sector.geometry, position = geometry.attributes.position, normals = geometry.attributes.normal, uv = geometry.attributes.uv;
      ringUV.positionHashes.push(require("node:crypto").createHash("sha256").update(Buffer.from(position.array.buffer)).digest("hex"));
      for (let vertex = 0; vertex < position.count; vertex += 3) {
        if (Math.abs(normals.getY(vertex)) > .5) {
          for (let offset = 0; offset < 3; offset++) {
            const index = vertex + offset, x = position.getX(index) + sector.userData.origin.x, z = position.getZ(index) + sector.userData.origin.z;
            assert(Math.abs(uv.getX(index) - (-x * uvDensity - .514)) < 2e-6, "cap planar U preserved");
            assert(Math.abs(uv.getY(index) - (-z * uvDensity + 2.014)) < 2e-6, "cap planar V preserved");
            ringUV.capVertices++;
          }
          continue;
        }
        const ax = uv.getX(vertex + 1) - uv.getX(vertex), ay = uv.getY(vertex + 1) - uv.getY(vertex);
        const bx = uv.getX(vertex + 2) - uv.getX(vertex), by = uv.getY(vertex + 2) - uv.getY(vertex);
        const uvArea = Math.abs(ax * by - ay * bx) / 2;
        ringUV.sideTriangles++; ringUV.minimumSideUVArea = Math.min(ringUV.minimumSideUVArea, uvArea);
        assert(uvArea > 1e-7, `vertical rock face UV collapsed to a line: sector ${ringUV.sectors}, triangle ${vertex / 3}, area ${uvArea}`);
        for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
          const ia = vertex + a, ib = vertex + b;
          if (Math.hypot(position.getX(ia) - position.getX(ib), position.getZ(ia) - position.getZ(ib)) > 1e-5) continue;
          const height = Math.abs(position.getY(ia) - position.getY(ib));
          if (height < .01) continue;
          assert(Math.abs(Math.abs(uv.getY(ia) - uv.getY(ib)) / height - uvDensity) < 1e-5, "vertical UV density matches floor texel density");
        }
      }
    }
  }
  assert.equal(ringUV.sectors, 24); assert(ringUV.sideTriangles > 100);
  // Use the real GLB and rendered transforms, not geometry bounds: the source
  // edge is jagged and can fall meters below the added rings before r=12.
  arena.assetPhase = "titan";
  const floorContinuity = [];
  for (const radius of [20, 16, 12]) {
    arena.arena = { radius, previousRadius: radius, collapse: 1 };
    draw(); scene.updateMatrixWorld(true);
    const core = models().find(item => item.entry.gltf.scene.getObjectByName("w1fz-titan_boss"));
    assert(core, "actual Titan arena model loaded");
    const floorMeshes = [];
    core.root.traverseVisible(mesh => { if (mesh.isMesh) floorMeshes.push(mesh); });
    for (const name of ["titan-collapse-sectors", "titan-inner-collapse-sectors", "titan-core-support-ring"]) {
      const ring = scene.getObjectByName(name);
      if (ring.visible) ring.traverseVisible(mesh => { if (mesh.isMesh) floorMeshes.push(mesh); });
    }
    for (const r of [10.5, 10.9, 11.2, 11.5, 11.75, 11.95, ...(radius >= 16 ? [12, 12.05, 15.95] : []), ...(radius === 20 ? [16, 16.05, 19.5] : [])]) {
      let minimumY = Infinity, maximumY = -Infinity, missing = 0;
      for (let angleIndex = 0; angleIndex < 144; angleIndex++) {
        const angle = angleIndex * Math.PI / 72;
        const ray = new THREE.Raycaster(new THREE.Vector3(r * Math.cos(angle), 5, r * Math.sin(angle)), new THREE.Vector3(0, -1, 0));
        const hit = ray.intersectObjects(floorMeshes, false)[0];
        if (!hit) { missing++; continue; }
        minimumY = Math.min(minimumY, hit.point.y); maximumY = Math.max(maximumY, hit.point.y);
      }
      floorContinuity.push({ arenaRadius: radius, sampleRadius: r, samples: 144, missing, minimumY, maximumY });
      assert.equal(missing, 0, `Titan ${radius}m arena: unsupported visible floor at radius ${r}`);
      assert(minimumY >= -.12 && maximumY <= .12, `Titan ${radius}m arena: interior cliff at radius ${r}: ${minimumY}..${maximumY}`);
    }
  }
  arena.arena = { radius: 12, previousRadius: 16, collapse: 1 }; draw();
  assert.equal(scene.getObjectByName("titan-inner-collapse-sectors").visible, false, "inner ring disappears after collapse");
  assert.equal(scene.getObjectByName("titan-collapse-sectors").visible, false);
  const coreSupport = scene.getObjectByName("titan-core-support-ring");
  assert(coreSupport.visible, "the final 12m circle keeps its walking surface after both rings fall");
  const supportMesh = coreSupport.children[0], supportUV = supportMesh.geometry.getAttribute("uv"), supportPosition = supportMesh.geometry.getAttribute("position");
  assert.equal(supportMesh.material.map, scene.getObjectByName("titan-inner-collapse-sectors").children[0].material.map, "support cap shares the original floor texture");
  for (let vertex = 0; vertex < supportPosition.count; vertex++) {
    assert(Math.abs(supportPosition.getY(vertex) + .01) < 1e-6, "support cap stays thin and close to the walking plane");
    assert(Math.abs(supportUV.getX(vertex) - (-supportPosition.getX(vertex) * uvDensity - .514)) < 2e-6);
    assert(Math.abs(supportUV.getY(vertex) - (-supportPosition.getZ(vertex) * uvDensity + 2.014)) < 2e-6);
  }
  const finalCore = models().find(item => item.entry.gltf.scene.getObjectByName("w1fz-titan_boss"));
  const originalMeshes = [];
  finalCore.entry.gltf.scene.traverse(mesh => { if (mesh.isMesh) originalMeshes.push(mesh.geometry); });
  finalCore.root.traverse(mesh => { if (mesh.isMesh) assert(originalMeshes.includes(mesh.geometry), "original final-core geometry is preserved"); });
  delete arena.assetPhase; delete arena.arena; draw();
  assert.equal(coreSupport.visible, false, "Titan support cap is hidden in other phases");
  const party = find(object => object.userData.pose);
  const jobs = ["war", "drk", "ast", "sge", "drg", "sam", "dnc", "smn"];
  scene.updateMatrixWorld(true);
  const modelSizes = party.map((g, i) => {
    const item = g.userData.model.userData.instance, b = deformedBounds(g.userData.model);
    assert(item.sharedMotion && item.walk && item.run && item.sprint && item.idle, `${jobs[i]} locomotion available`);
    assert(b.max.y - b.min.y > .9 && b.max.y - b.min.y < 5, `${jobs[i]} plausible model height`);
    return { job: jobs[i], height: b.max.y - b.min.y, normalizedScale: item.root.scale.toArray(), supportVertexCount: item.supportVertices.length };
  });
  const samples = [];
  for (const fps of [15, 30, 60, 120]) {
    arena.t = -1; arena.ents.forEach(e => { e.x = e.y = 0; e.dead = false; e.fallY = 0; }); draw();
    const minima = jobs.map(() => Infinity), maxima = jobs.map(() => -Infinity);
    for (let frame = 0; frame < fps * 2; frame++) {
      arena.t += 1 / fps; arena.ents.forEach(e => { e.x += 2.5 / fps; }); draw();
      if (frame % Math.max(1, Math.round(fps / 6)) === 0) {
        scene.updateMatrixWorld(true);
        party.forEach((g, i) => {
          const b = deformedBounds(g.userData.model);
          minima[i] = Math.min(minima[i], b.min.y); maxima[i] = Math.max(maxima[i], b.min.y);
        });
      }
    }
    party.forEach((g, i) => { assert(minima[i] >= -.002, `${jobs[i]} walking mesh penetrates floor at ${fps} FPS: ${minima[i]}`); assert(maxima[i] <= .04, `${jobs[i]} walking mesh floats at ${fps} FPS: ${maxima[i]}`); });
    samples.push({ fps, jobs: jobs.map((job, i) => ({ job, minimumY: minima[i], maximumMinY: maxima[i] })) });
    for (const [speed, expectedClip] of [[6, "run"], [7.8, "sprint"], [0, "idle"]]) {
      for (let frame = 0; frame < fps; frame++) { arena.t += 1 / fps; arena.ents.forEach(e => { e.x += speed / fps; }); draw(); }
      party.forEach(g => { const item = g.userData.model.userData.instance; assert.equal(item.clip, item[expectedClip], `${expectedClip} transition at ${fps} FPS`); });
    }
    arena.ents.forEach(e => { e.dead = true; }); arena.t += 1 / fps; draw(); scene.updateMatrixWorld(true);
    party.forEach((g, i) => assert(Math.abs(deformedBounds(g.userData.model).min.y - .02) < 1e-5, `${jobs[i]} corpse ground contact at ${fps} FPS`));
  }
  const assetInventory = await inventory();
  const report = {
    generatedAt: new Date().toISOString(), rendererSha256: require("node:crypto").createHash("sha256").update(fs.readFileSync(rendererPath)).digest("hex"),
    status: "IN_PROGRESS", automatedResult: "PASS", scope: "Real Three r128 GLB parser and skinned world-vertex geometry. WebGL rasterization and image decoding stubbed; this test cannot determine overall visual acceptance. Consult REQUIREMENTS.md and the separate browser evidence.",
    models: assetInventory.models, textureHashesVerified: assetInventory.textureHashesVerified,
    modelSizes, walkingSamples: samples, floorContinuity, ringUV, landingSupport,
    fixEvidence: { failingBefore: "WAR walk at 15 FPS: minY=-0.01112195219522671; max gap 0.11442466029924994. Grounding existed only for corpses.", change: "Cache low mesh vertices and skin them for live idle/walk floor contact; preserve run/sprint aerial strides, death and falling.", tests: "Eight jobs at 15/30/60/120 FPS; 2 seconds walking with 6 samples/sec; subsequent run, sprint, idle transitions; all eight corpse contacts." },
    substitutes: ["Garuda and Ifrit use the Titan p3 map; original wind/fire arena assets are not present.", "Titan 20–16m and 16–12m collapse rings are procedural sectors sharing p3 floor texture; a permanent thin 10.75–12m support cap covers the original core's uneven top edge without changing its geometry. No original detachable rim assets.", "Grounded Titan uses a reconstructed-model support correction: only the rendered model is shifted minimally inward until its sole vertices fit the current floor. Source boss anchors, rings, AoEs and collision radii are unchanged. This is not an original game-pose calibration.", "SGE is a WHM-derived c1201 face remodel with white hair and four custom floating instruments, not an original c1101 male head or official Sage asset.", "Bomb and nail visuals remain procedural; unavailable assets cannot be represented as original game assets."],
    distributionChecks: ["Standalone package validation must include the 36-model complete-source-manifest, animation-source.json and all local runtime dependencies.", "Any source assets symlink must be dereferenced into real ZIP members.", "Geometry tests do not validate archive CRC, extracted-page WebGL rendering, or the separate downloaded asset inventory; see the package verification and browser evidence."],
    uiVerificationRequired: ["Current SGE close-up/front/back: white cropped hair, masculine Lalafell appearance, all four instruments and texture quality; prior uwu-sage-refined.jpg only confirms visible white hair and equipment in a static earlier image.", "Eight jobs visible and identifiable with current WebGL texture decoding, correct facing and weapon scale.", "Idle→walk→run→sprint→turn→stop at 15/30/60/120 FPS: inspect foot contact, sliding and possible vertical transition discontinuity; geometry bounds alone cannot prove animation quality.", "Titan both collapses: actual textures and UV seams, no hole in supported floor, corpse fall and revive, close/far cameras and restart.", "Garuda/Ifrit/Titan/Ultima full phase transitions: model/map load success and correct source labeling.", "Final extracted standalone archive served separately, complete models/textures/vendor files and no missing network requests."],
    visualRequirementsPass: false
  };
  const outputIndex = process.argv.indexOf("--report");
  if (outputIndex >= 0) fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + "\n");
  console.log(`Geometry/inventory checks passed: ${report.models.length} GLBs, ${report.textureHashesVerified} texture hashes, 8 jobs × 4 frame rates. This automated test does not determine visual acceptance.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
