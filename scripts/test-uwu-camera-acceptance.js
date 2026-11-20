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
let scene, loadingStatus, renderedCamera;

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
  render(value, camera) { scene = value; renderedCamera=camera; }
}
THREE.WebGLRenderer = MemoryRenderer;

let guides = [];
const roles = ["MT", "ST", "H1", "H2", "D1", "D2", "D3", "D4"];
const actors = [{kind:"titan",pos:{x:0,y:6},look:{x:0,y:0},tag:"Titan",real:false}];
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


async function main(){
 assert(view.init({insertAdjacentElement(){}}));draw();await tick();await Promise.all(loads.map(load=>load.finish()));await tick();draw();
 for(let yaw=0;yaw<Math.PI*2;yaw+=Math.PI/4)for(const pitch of [.08,.42,1.4])for(const dist of [4,15,26]){
  arena.cam=yaw;arena.pitch=pitch;arena.dist=dist;draw();renderedCamera.updateMatrixWorld();
  const dir=renderedCamera.getWorldDirection(new THREE.Vector3());assert(dir.x*Math.sin(yaw)-dir.z*Math.cos(yaw)>.1,'W must follow the camera horizontal forward');assert(renderedCamera.position.y>1.5,'camera stays above platform');
  scene.updateMatrixWorld(true);
  for(const b of find(o=>o.userData.model&&o.userData.body&&o.visible)){
   const tag=b.userData.tag,child=tag.children[0];if(!tag.visible||!child)continue;
   const world=tag.getWorldPosition(new THREE.Vector3()),depth=-world.clone().applyMatrix4(renderedCamera.matrixWorldInverse).z,units=2*depth*Math.tan(renderedCamera.fov*Math.PI/360)/800;
   assert(child.scale.y/units<=24.01,'nearby boss labels must not cover the arena');
   const screen=world.project(renderedCamera),top=(1-screen.y)*400-child.scale.y/units/2;
   assert(top>=54,'boss labels must stay below the cast bar');
  }
 }
 arena.cam=0;arena.pitch=.42;arena.dist=15;draw();scene.updateMatrixWorld(true);
 
 const visibleBoss=find(o=>o.userData.model&&o.userData.body&&o.visible)[0];assert(visibleBoss,'boss loaded');
 const materials=[];visibleBoss.userData.model.traverse(o=>{if(o.isMesh)materials.push(...[].concat(o.material));});
 assert(materials.some(m=>m.opacity<.5),'boss between camera and player must become translucent');
 actors[0].pos={x:15,y:0};draw();assert(materials.every(m=>m.opacity>=.99),'opacity returns when the boss leaves the view ray');
 actors[0].pos={x:0,y:2};arena.cam=0;arena.pitch=.42;arena.dist=4;draw();assert(materials.some(m=>m.opacity<.5),"camera inside the boss bounds must reveal the player");
 actors[0].pos={x:15,y:0};arena.dist=15;draw();
 for(const p of arena.ents){p.x=0;p.y=0;}draw();scene.updateMatrixWorld(true);
 const names=find(g=>g.userData.name&&g.userData.model).map(g=>g.userData.name);
 const boxes=names.map(n=>{const p=n.getWorldPosition(new THREE.Vector3()).project(renderedCamera);return {x:p.x,y:p.y};});
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert(Math.hypot(boxes[i].x-boxes[j].x,boxes[i].y-boxes[j].y)>.025,'stacked player nameplates must remain distinct');
 arena.dist=4;draw();scene.updateMatrixWorld(true);
 const closeBoxes=names.filter(n=>n.visible).map(n=>{const child=n.children[0],world=n.getWorldPosition(new THREE.Vector3()),depth=-world.clone().applyMatrix4(renderedCamera.matrixWorldInverse).z,units=2*depth*Math.tan(renderedCamera.fov*Math.PI/360)/800,p=world.project(renderedCamera);const h=child.scale.y/units,w=child.scale.x/units;assert(h<=26.01,'close camera must not inflate names over the actors');return{x:(p.x+1)*500,y:(1-p.y)*400,w,h};});
 for(let i=0;i<closeBoxes.length;i++)for(let j=i+1;j<closeBoxes.length;j++){const a=closeBoxes[i],b=closeBoxes[j];assert(Math.abs(a.x-b.x)>=(a.w+b.w)/2||Math.abs(a.y-b.y)>=(a.h+b.h)/2,'close stacked labels cannot overlap');}
 console.log('3D camera: 72 yaw/pitch/zoom cases; real Titan occlusion/restoration; eight stacked nameplates pass.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
