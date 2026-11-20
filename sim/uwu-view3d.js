// 絕神兵機制模擬器：遊戲視角（第三人稱跟隨鏡頭）畫面層。
// 只負責「畫」，機制與判定都在 uwu-ifrit.js。場地座標 (x, y) 對應 3D 的 (x, 0, z)，北 = -z。
// GLB 只替換外觀，場地邊界、預兆與目標圈仍使用模擬器座標。
"use strict";

const View3D = (() => {
  let renderer, scene, camera, ready = false, ground, mapHolder, assetStatus, modelSource, arenaRim, arenaWall, titanDebris, titanInnerDebris, titanCoreRim;
  const scriptUrl = document.currentScript?.src || location.href;
  const libraryUrl = new URL("vendor/three-r128/", scriptUrl);
  const assetRoot = new URL("../xivsim-assets/models/", scriptUrl);
  const assets = {
    garuda: { file: "characters/garuda.glb", scale: 0.8, tagY: 5.0, facesForward: true },
    ifrit: { file: "characters/ifrit.glb", scale: 0.8, tagY: 7.7, facesForward: true },
    titan: { file: "characters/titan.glb", scale: 1.4, tagY: 11.1, facesForward: true },
    ultima: { file: "characters/ultima.glb", scale: 0.8, tagY: 16.8, facesForward: true },
    player_motion: { file: "characters/players/lala_anim.glb" },
    player: { file: "characters/players/pld_noanim.glb", scale: 2, facesForward: true },
    gaol: { file: "characters/gaol.glb", scale: 0.83, y: 0.77 },
    p3: { file: "maps/uwu/p3.glb", y: -0.14 },
    p4: { file: "maps/uwu/p4.glb", y: -0.025 },
  };
  // Fixed reference party. SGE uses an explicitly labeled custom training model.
  const partyModels = ["war", "drk", "ast", "sge", "drg", "sam", "dnc", "smn"];
  const partyJobLabels = ["戰士", "暗黑騎士", "占星術士", "賢者", "龍騎士", "武士", "舞者", "召喚師"];
  for (const job of partyModels) assets[`player_${job}`] = {
    file: `characters/players/${job === "sge" ? "sge_training" : job + "_noanim"}.glb`, scale: job === "sge" ? 1 : 2, facesForward: job !== "sge",
  };
  const bossKinds = ["garuda", "ifrit", "titan", "ultima"];
  const bundled = new Map(), overrides = new Map(), pendingOverrides = new Map();
  const activeAssets = new Set(), retired = new Set();
  let loaderPromise, previousTime;
  const defaultPhase = () => {
    const phase = typeof UWU_ASSET_PHASE === "string" ? UWU_ASSET_PHASE : location.pathname.match(/uwu-(garuda|ifrit|titan|ultima)\.html$/)?.[1];
    return bossKinds.includes(phase) ? phase : "ifrit";
  };

  function dependency(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(path, libraryUrl).href;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error("無法載入 3D 模型元件")); };
      document.head.append(script);
    });
  }
  function getLoader() {
    if (!loaderPromise) {
      loaderPromise = Promise.all([
        THREE.GLTFLoader || dependency("GLTFLoader.js"),
        THREE.SkeletonUtils || dependency("SkeletonUtils.js"),
      ]).then(() => new THREE.GLTFLoader());
    }
    return loaderPromise;
  }
  function requestAsset(kind) {
    activeAssets.add(kind);
    if (overrides.has(kind)) return overrides.get(kind);
    if (!bundled.has(kind)) {
      const entry = { state: "loading", refs: 0 };
      bundled.set(kind, entry);
      getLoader().then((loader) => loader.loadAsync(new URL(assets[kind].file, assetRoot).href))
        .then((gltf) => { entry.gltf = gltf; entry.state = "ready"; })
        .catch(() => { entry.state = "error"; });
    }
    return bundled.get(kind);
  }
  function releaseRetired(entry) {
    if (!retired.has(entry) || entry.refs !== 0) return;
    retired.delete(entry);
    const geometries = new Set(), materials = new Set(), textures = new Set(), images = new Set();
    entry.gltf.scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of [].concat(object.material)) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) { texture.dispose(); if (texture.image?.close) images.add(texture.image); }
    for (const image of images) image.close();
  }
  function retire(entry) {
    if (!entry) return;
    retired.add(entry);
    releaseRetired(entry);
  }
  async function setModel(kind, file) {
    if (!Object.hasOwn(assets, kind)) throw new Error("不支援的模型類型");
    const token = Symbol();
    pendingOverrides.set(kind, token);
    try {
      const loader = await getLoader();
      const data = await file.arrayBuffer();
      if (data.byteLength < 12 || new DataView(data).getUint32(0, true) !== 0x46546c67) throw new Error("請選擇 GLB 檔案");
      const header = new DataView(data);
      if (data.byteLength < 20 || header.getUint32(4, true) !== 2 || header.getUint32(16, true) !== 0x4e4f534a) {
        throw new Error("請選擇 GLB 2.0 檔案");
      }
      const jsonLength = header.getUint32(12, true);
      if (jsonLength > data.byteLength - 20) throw new Error("GLB 檔案不完整");
      const metadata = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 20, jsonLength)));
      const resources = [...(metadata.buffers || []), ...(metadata.images || [])];
      if (resources.some((x) => x.uri && !x.uri.startsWith("data:"))) throw new Error("請使用貼圖及模型資料皆內嵌的 GLB");
      const gltf = await new Promise((resolve, reject) => loader.parse(data, "", resolve, reject));
      const entry = { state: "ready", gltf, refs: 0, manual: true };
      if (pendingOverrides.get(kind) !== token) { retire(entry); return false; }
      retire(overrides.get(kind));
      overrides.set(kind, entry);
      return true;
    } finally {
      if (pendingOverrides.get(kind) === token) pendingOverrides.delete(kind);
    }
  }
  function clearModel(kind) {
    pendingOverrides.delete(kind);
    const entry = overrides.get(kind);
    overrides.delete(kind);
    retire(entry);
  }

  function installUploadControls(canvas) {
    const sidebar = canvas.closest?.(".wrap")?.querySelector("aside");
    if (!sidebar) return;
    const panel = document.createElement("details");
    panel.className = "card";
    const summary = document.createElement("summary");
    summary.textContent = "自訂 3D 模型";
    const row = document.createElement("div");
    row.className = "row";
    const kind = document.createElement("select");
    kind.setAttribute("aria-label", "模型類型");
    for (const [value, label] of Object.entries({
      player: "玩家", garuda: "迦樓羅", ifrit: "伊弗利特", titan: "泰坦", ultima: "究極神兵",
      gaol: "石牢", p3: "泰坦場地", p4: "究極神兵場地",
    })) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      kind.append(option);
    }
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".glb,model/gltf-binary";
    file.hidden = true;
    const choose = document.createElement("button"), reset = document.createElement("button");
    choose.type = reset.type = "button";
    choose.textContent = "選擇 GLB";
    reset.textContent = "還原";
    const status = document.createElement("p");
    status.className = "note";
    status.setAttribute("role", "status");
    const update = () => { reset.disabled = !overrides.has(kind.value); };
    choose.onclick = () => file.click();
    kind.onchange = () => { status.textContent = ""; update(); };
    reset.onclick = () => { clearModel(kind.value); status.textContent = "已還原內建模型"; update(); };
    file.onchange = async () => {
      const selected = file.files[0];
      file.value = "";
      if (!selected) return;
      const target = kind.value;
      status.textContent = "正在讀取模型…";
      try { if (await setModel(target, selected) && kind.value === target) status.textContent = `已套用 ${selected.name}`; }
      catch (error) { if (kind.value === target) status.textContent = `無法讀取模型 · ${error.message}`; }
      finally { update(); }
    };
    update();
    row.append(kind, choose, reset, file);
    panel.append(summary, row, status);
    sidebar.append(panel);
  }

  function clearModelSlot(holder) {
    const instance = holder.userData.instance;
    if (!instance) return;
    const { root, mixer, entry } = instance;
    if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(root); }
    root.traverse((object) => {
      if (object.isSkinnedMesh) object.skeleton.boneTexture?.dispose();
    });
    for(const item of instance.occlusionMaterials||[])item.material.dispose();
    holder.remove(root);
    delete holder.userData.instance;
    entry.refs--;
    releaseRetired(entry);
  }
  function syncModel(holder, kind, position, dt) {
    if (!kind) { clearModelSlot(holder); return false; }
    const entry = requestAsset(kind);
    if (holder.userData.instance?.entry !== entry) {
      clearModelSlot(holder);
      if (entry.state !== "ready") return false;
      const config = assets[kind], root = THREE.SkeletonUtils.clone(entry.gltf.scene);
      const scale = entry.manual ? 1 : config.scale || 1;
      root.scale.multiplyScalar(scale);
      if (config.facesForward) root.rotation.y += Math.PI;
      root.position.y += entry.manual ? 0 : config.y || 0;
      // 體積由骨架動畫改變，r128 只依原始網格邊界裁切。
      root.traverse((object) => { if (object.isSkinnedMesh) object.frustumCulled = false; });
      const idle = entry.gltf.animations.find((clip) => clip.name.toLowerCase() === "idle");
      const walk = entry.gltf.animations.find((clip) => clip.name.toLowerCase() === "walk");
      const mixer = idle || walk ? new THREE.AnimationMixer(root) : null;
      entry.refs++;
      holder.userData.instance = { root, mixer, idle, walk, entry };
      holder.add(root);
    }
    const item = holder.userData.instance;
    if (item.mixer && !item.sharedMotion && (dt > 0 || !item.clip)) {
      const moving = position && item.position && dt > 0 && Math.hypot(position.x - item.position.x, position.y - item.position.y) > dt * 0.18;
      if (position) item.position = { x: position.x, y: position.y };
      const clip = moving ? item.walk || item.idle : item.idle || item.walk;
      if (clip !== item.clip) {
        if (item.clip) item.mixer.clipAction(item.clip).fadeOut(0.12);
        const action = item.mixer.clipAction(clip).reset().play();
        if (item.clip) action.fadeIn(0.12);
        item.clip = clip;
      }
      item.mixer.update(dt);
    }
    return true;
  }
  function updateAssetStatus() {
    modelSource.textContent = overrides.has("player") ? "玩家：自訂模型" :
      bundled.get("player_sge")?.state === "error" ? "賢者模型載入失敗：使用替代造型" : "賢者：改製模型";
    const states = Array.from(activeAssets, (kind) => (overrides.get(kind) || bundled.get(kind)).state);
    const errors = states.filter((state) => state === "error").length;
    const loading = states.filter((state) => state === "loading").length;
    const message = errors ? `有 ${errors} 項模型無法載入，使用替代造型` : loading ? "載入 3D 模型中…" : "";
    if (assetStatus.textContent !== message) assetStatus.textContent = message;
    assetStatus.hidden = !message;
  }
  let players = [], ifrits = [], nailMeshes = [], swRings = [], crushRing, spotRing, fetterLine, flashPool = [], propPool = [], guideRings = [], guideLines = [], bossRingG;
  const aoeMeshes = new Map();
  const spriteCache = new Map();
  const Y = 0.04; // 地面貼花的高度

  const v3 = (p, y = 0) => new THREE.Vector3(p.x, y, p.y);
  function sprite(text, color = "#ffffff", h = 1) {
    const key = text + "|" + color;
    let tex = spriteCache.get(key);
    if (!tex) {
      const c = document.createElement("canvas"), g = c.getContext("2d");
      g.font = '700 44px "Fira Sans",system-ui,"PingFang TC","Microsoft JhengHei",sans-serif';
      c.width = Math.ceil(g.measureText(text).width) + 24; c.height = 64;
      g.font = '700 44px "Fira Sans",system-ui,"PingFang TC","Microsoft JhengHei",sans-serif';
      g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 8; g.strokeStyle = "rgba(2,6,23,.9)"; g.strokeText(text, c.width / 2, 34); g.fillStyle = color; g.fillText(text, c.width / 2, 34);
      tex = new THREE.CanvasTexture(c); tex.userData = { aspect: c.width / c.height }; spriteCache.set(key, tex);
    }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    s.scale.set(h * tex.userData.aspect, h, 1); s.renderOrder = 10;
    return s;
  }
  function setSprite(holder, text, color, h) { // 文字會變的標籤：內容變了才換
    if (holder.userData.text === text + color) return;
    holder.userData.text = text + color;
    while (holder.children.length) {
      const old = holder.children[0];
      old.material.dispose();
      holder.remove(old);
    }
    if (text) holder.add(sprite(text, color, h));
  }
  function layoutNameplates(width,height,controlled){
    const occupied=[];
    const order=players.map((player,i)=>({player,i})).sort((a,b)=>(a.i===controlled?-1:b.i===controlled?1:a.i-b.i));
    for(const {player,i} of order){
      const name=player.userData.name,child=name.children[0];if(!child)continue;
      name.position.set(0,2.6,0);player.updateMatrixWorld(true);
      const world=name.getWorldPosition(new THREE.Vector3()),ndc=world.clone().project(camera);
      name.visible=player.visible&&!player.userData.hideName&&ndc.z>=-1&&ndc.z<=1&&Math.abs(ndc.x)<1.1&&Math.abs(ndc.y)<1.1;
      if(!name.visible){if(player.userData.nameLeader)player.userData.nameLeader.visible=false;continue;}
      const depth=-world.clone().applyMatrix4(camera.matrixWorldInverse).z;
      const units=2*depth*Math.tan(camera.fov*Math.PI/360)/height;
      if(!child.userData.nameBaseScale)child.userData.nameBaseScale=child.scale.clone();
      const baseScale=child.userData.nameBaseScale,pixels=baseScale.y/units,screenScale=Math.max(12,Math.min(i===controlled?26:20,pixels))/pixels;
      child.scale.copy(baseScale).multiplyScalar(screenScale);
      const rw=Math.max(18,child.scale.x/units)+5,rh=Math.max(14,child.scale.y/units)+4;
      const base={x:(ndc.x+1)*width/2,y:(1-ndc.y)*height/2};let selected=null;
      const overlaps=b=>occupied.some(o=>Math.abs(b.x-o.x)<(b.w+o.w)/2&&Math.abs(b.y-o.y)<(b.h+o.h)/2);
      for(let ring=0;ring<9&&!selected;ring++)for(const side of [0,-1,1]){
        const candidate={x:Math.max(rw/2+4,Math.min(width-rw/2-4,base.x+side*ring*(rw*.55))),y:Math.max(rh/2+4,Math.min(height-rh/2-4,base.y-ring*rh)),w:rw,h:rh};
        if(!overlaps(candidate)){selected=candidate;break;}
      }
      selected=selected||{x:base.x,y:base.y,w:rw,h:rh};occupied.push(selected);
      const adjusted=new THREE.Vector3(selected.x/width*2-1,1-selected.y/height*2,ndc.z).unproject(camera);
      name.position.copy(player.worldToLocal(adjusted));
      let leader=player.userData.nameLeader;
      if(!leader){leader=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:ROLE_COLOR[i],transparent:true,opacity:.5,depthTest:false}));leader.renderOrder=9;leader.frustumCulled=false;player.add(leader);player.userData.nameLeader=leader;}
      leader.visible=Math.hypot(selected.x-base.x,selected.y-base.y)>5;
      const positions=leader.geometry.attributes.position;positions.setXYZ(0,0,2.25,0);positions.setXYZ(1,name.position.x,name.position.y-.15,name.position.z);positions.needsUpdate=true;
    }
  }
  function layoutBossNames(width,height){
    for(const boss of ifrits){
      const tag=boss.userData.tag,child=tag.children[0];if(!child)continue;
      const world=tag.getWorldPosition(new THREE.Vector3()),ndc=world.clone().project(camera);
      const depth=-world.clone().applyMatrix4(camera.matrixWorldInverse).z;
      tag.visible=boss.visible&&depth>0&&ndc.z>=-1&&ndc.z<=1&&Math.abs(ndc.x)<1.2&&Math.abs(ndc.y)<1.2;
      if(!tag.visible)continue;
      const units=2*depth*Math.tan(camera.fov*Math.PI/360)/height;
      if(!child.userData.nameBaseScale)child.userData.nameBaseScale=child.scale.clone();
      const base=child.userData.nameBaseScale,pixels=base.y/units;
      child.scale.copy(base).multiplyScalar(Math.max(12,Math.min(24,pixels))/pixels);
      const halfW=child.scale.x/units/2,halfH=child.scale.y/units/2;
      const x=Math.max(halfW+5,Math.min(width-halfW-5,(ndc.x+1)*width/2));
      const y=Math.max(56+halfH,Math.min(height-halfH-5,(1-ndc.y)*height/2));
      tag.position.copy(boss.worldToLocal(new THREE.Vector3(x/width*2-1,1-y/height*2,ndc.z).unproject(camera)));
    }
  }
  const decalMat = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
  function flat(geom, color, opacity) { const m = new THREE.Mesh(geom, decalMat(color, opacity)); m.rotation.x = -Math.PI / 2; return m; }
  // 直線衝鋒：長條與圓形場地的交集，才不會畫到場外
  function stripGeom(half, shape, deg) {
    if (Number.isFinite(shape?.length)) {
      // Clip a finite forward lane against the world-space arena, then
      // express it in the same local axes used by the engine's polar(deg).
      const angle = rad(deg), co = Math.cos(angle), si = Math.sin(angle);
      const cx = shape.c?.x ?? 0, cz = shape.c?.y ?? 0;
      let points = Array.from({length:128}, (_,i) => {
        const a = i * Math.PI * 2 / 128, x = CFG.R * Math.cos(a) - cx, z = CFG.R * Math.sin(a) - cz;
        return {x:co*x+si*z, y:si*x-co*z};
      });
      for (const [axis, bound, sign] of [['x',-half,1],['x',half,-1],['y',-(shape.back??0),1],['y',shape.length,-1]]) {
        const clipped = [];
        for (let i=0;i<points.length;i++) {
          const a=points[i], b=points[(i+1)%points.length];
          const insideA=(a[axis]-bound)*sign>=0, insideB=(b[axis]-bound)*sign>=0;
          if (insideA) clipped.push(a);
          if (insideA!==insideB) {
            const k=(bound-a[axis])/(b[axis]-a[axis]);
            clipped.push({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});
          }
        }
        points=clipped;
      }
      const outline = new THREE.Shape();
      points.forEach((p,i)=>i?outline.lineTo(p.x,p.y):outline.moveTo(p.x,p.y));
      return new THREE.ShapeGeometry(outline);
    }
    const R = CFG.R, sh = new THREE.Shape(), n = 14;
    for (let i = 0; i <= n; i++) { const x = -half + (2 * half * i) / n, y = Math.sqrt(Math.max(0, R * R - x * x)); i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
    for (let i = n; i >= 0; i--) { const x = -half + (2 * half * i) / n; sh.lineTo(x, -Math.sqrt(Math.max(0, R * R - x * x))); }
    return new THREE.ShapeGeometry(sh);
  }
  function makeIfrit() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.6, 6, 12), new THREE.MeshLambertMaterial({ color: 0xc2410c, emissive: 0x4a1503 })); body.position.y = 3; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), new THREE.MeshLambertMaterial({ color: 0xea580c, emissive: 0x5a1a04 })); head.position.y = 6.6; g.add(head);
    for (const sx of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0x1f2937 })); horn.position.set(sx * 0.9, 7.9, 0); horn.rotation.z = -sx * 0.4; g.add(horn); }
    const snout = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.6), new THREE.MeshLambertMaterial({ color: 0xfdba74 })); snout.position.set(0, 6.4, -1.5); g.add(snout); // 朝 -z（本地正面）
    const fire = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.35, 8, 28), new THREE.MeshBasicMaterial({ color: 0x60a5fa })); fire.rotation.x = Math.PI / 2; fire.position.y = 0.5; g.add(fire);
    const aura = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.2, 7.5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })); aura.position.y = 3.7; g.add(aura);
    const tag = new THREE.Group(); tag.position.y = 9.6; g.add(tag);
    const fallback = new THREE.Group();
    for (const part of [...g.children]) if (part !== fire && part !== aura && part !== tag) fallback.add(part);
    const model = new THREE.Group();
    g.add(fallback, model);
    g.userData = { body, head, fire, aura, tag, fallback, model };
    return g;
  }
  function faceTo(obj, from, to) { const dx = to.x - from.x, dz = to.y - from.y; if (Math.abs(dx) + Math.abs(dz) > 1e-3) obj.rotation.y = Math.atan2(-dx, -dz); }

  function syncTitanLandingSupport(boss, actor, kind, phase) {
    const holder = boss.userData.model, instance = holder.userData.instance;
    // Reconstructed-model presentation adaptation only. Never move the actor
    // anchor, facing ring or collision origin supplied by the encounter.
    // Clear first so takeoff, reset and a reused model slot cannot retain it.
    holder.position.set(0, 0, 0);
    if (kind !== "titan" || phase !== "titan" || !boss.visible || !instance || Math.abs(actor.alt || 0) > 1e-6) return;
    const current = S.arena?.radius ?? 20, previous = S.arena?.previousRadius ?? current;
    const progress = Math.max(0, Math.min(1, S.arena?.collapse ?? 1));
    const radius = previous + (current - previous) * progress;
    const distance = Math.hypot(actor.pos.x, actor.pos.y);
    if (distance < 1e-8 || radius <= 0) return;
    boss.updateMatrixWorld(true);
    const point = new THREE.Vector3();
    if (!instance.landingSoles) {
      const vertices = []; let lowest = Infinity;
      instance.root.traverseVisible(mesh => {
        const positions = mesh.geometry?.getAttribute("position");
        if (!mesh.isMesh || !positions) return;
        for (let vertex = 0; vertex < positions.count; vertex++) {
          point.fromBufferAttribute(positions, vertex);
          if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
          point.applyMatrix4(mesh.matrixWorld);
          lowest = Math.min(lowest, point.y);
          vertices.push({ mesh, vertex, height: point.y });
        }
      });
      instance.landingSoles = vertices.filter(v => v.height <= lowest + .25);
    }
    const ux = actor.pos.x / distance, uz = actor.pos.y / distance;
    let minimumShift = 0, maximumShift = Infinity;
    for (const { mesh, vertex } of instance.landingSoles) {
      point.fromBufferAttribute(mesh.geometry.getAttribute("position"), vertex);
      if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
      point.applyMatrix4(mesh.matrixWorld);
      const along = point.x * ux + point.z * uz;
      const sidewaysSquared = Math.max(0, point.x * point.x + point.z * point.z - along * along);
      if (sidewaysSquared > radius * radius) return; // No radial-only solution for this custom footprint.
      const halfChord = Math.sqrt(radius * radius - sidewaysSquared);
      minimumShift = Math.max(minimumShift, along - halfChord);
      maximumShift = Math.min(maximumShift, along + halfChord);
    }
    if (minimumShift <= 0 || minimumShift > maximumShift) return;
    // Intersect each sole vertex's allowed interval along the inward ray.
    // Its lower endpoint is the smallest translation supporting every sole.
    const origin = holder.getWorldPosition(new THREE.Vector3());
    origin.x -= ux * minimumShift; origin.z -= uz * minimumShift;
    holder.position.copy(boss.worldToLocal(origin));
  }

  // The source GLB has no detachable rim nodes. Reconstruct the lost ring as
  // deterministic rock sectors; animation time comes from the encounter clock.
  function makeTitanDebris(innerRadius = 16, outerRadius = 20) {
    const group = new THREE.Group();
    group.name = "titan-collapse-sectors";
    group.userData.radii = `${innerRadius}:${outerRadius}`;
    // The original 12m core has a jagged cliff beginning near 11.3m.
    // Cover that cliff while the inner ring exists, rather than exposing a
    // hole and the ring's vertical inner wall inside the walkable arena.
    // This overlap falls with the ring; a separate thin support cap remains
    // over the final core's jagged upper edge without changing its mesh.
    // A small overlap at 16m also closes the two independently tessellated arcs.
    const surfaceInnerRadius = innerRadius === 12 ? 10.75 : innerRadius - .04;
    for (let i = 0; i < 12; i++) {
      const start = i * Math.PI / 6, end = (i + 1) * Math.PI / 6;
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, start, end, false);
      shape.lineTo(surfaceInnerRadius * Math.cos(end), surfaceInnerRadius * Math.sin(end));
      shape.absarc(0, 0, surfaceInnerRadius, end, start, true);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false, curveSegments: 12 });
      geometry.rotateX(Math.PI / 2); // top at y=0, thickness below the floor
      const angle = (start + end) / 2;
      const center = new THREE.Vector3((innerRadius + outerRadius) / 2 * Math.cos(angle), 0, (innerRadius + outerRadius) / 2 * Math.sin(angle));
      // Continue the p3 floor's planar UV density across the reconstructed rim.
      // The original rcjr5a floor uses approximately 0.126 UV units per unit.
      const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
      const uvScale = 0.126 * 20.859610458372096 / 12;
      for (let vertex = 0; vertex < position.count; vertex++) {
        const x = position.getX(vertex), y = position.getY(vertex), z = position.getZ(vertex);
        if (Math.abs(normal.getY(vertex)) > .5) {
          uv.setXY(vertex, -x * uvScale - 0.514, -z * uvScale + 2.014);
        } else {
          // Cylindrical walls unwrap by arc length and height. The radial
          // cut ends use radius and height so they remain textured as sectors
          // separate. Unwrap around this sector's midpoint, avoiding a seam
          // through a triangle at atan2's +/-PI boundary.
          const radius = Math.hypot(x, z);
          let theta = Math.atan2(z, x);
          theta += Math.round((angle - theta) / (2 * Math.PI)) * 2 * Math.PI;
          const curved = Math.abs(normal.getX(vertex) * x + normal.getZ(vertex) * z) > radius * .5;
          uv.setXY(vertex, (curved ? theta * radius : radius) * uvScale,
            y * uvScale + 2.014);
        }
      }
      geometry.translate(-center.x, 0, -center.z);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: i % 2 ? 0x746548 : 0x807052 }));
      mesh.userData.origin = center;
      mesh.position.copy(center);
      group.add(mesh);
    }
    return group;
  }

  function makeTitanCoreRim() {
    const group = new THREE.Group();
    group.name = "titan-core-support-ring";
    // The source cliff becomes uneven before the circular 12m collision edge.
    // Supply only its missing walking surface, preserving the original rock
    // geometry underneath. Keep it 1cm below the falling rings to avoid z-fighting.
    const geometry = new THREE.RingGeometry(10.75, 12, 288);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -.01, 0);
    const position = geometry.getAttribute("position"), uv = geometry.getAttribute("uv");
    const uvScale = 0.126 * 20.859610458372096 / 12;
    for (let vertex = 0; vertex < position.count; vertex++) {
      uv.setXY(vertex, -position.getX(vertex) * uvScale - .514, -position.getZ(vertex) * uvScale + 2.014);
    }
    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0x807052 }));
    mesh.userData.origin = new THREE.Vector3();
    group.add(mesh);
    return group;
  }

  function syncTitanRing(group, progress, instance) {
    group.visible = progress < 1;
    if (instance && group.userData.mapEntry !== instance.entry) {
      let floorMaterial, firstMaterial;
      instance.root.traverse(object => {
        for (const material of [].concat(object.material || [])) {
          if (material.map && !firstMaterial) firstMaterial = material;
          if (material.map && /rcjr5a/.test(material.name)) floorMaterial = material;
        }
      });
      const source = floorMaterial || firstMaterial;
      if (source) {
        // Clone materials, sharing immutable cached GLB textures.
        const material = source.clone();
        const previous = new Set(group.children.map(mesh => mesh.material));
        group.children.forEach(mesh => { mesh.material = material; });
        previous.forEach(old => old.dispose());
        group.userData.mapEntry = instance.entry;
      }
    }
    group.children.forEach((mesh, i) => {
      const k = Math.max(0, (progress - (i % 3) * 0.025) / (1 - (i % 3) * 0.025));
      const origin = mesh.userData.origin;
      mesh.visible = progress < 1;
      mesh.position.set(origin.x * (1 + k * 0.08), -32 * k * k, origin.z * (1 + k * 0.08));
      mesh.rotation.set(k * 0.65 * Math.sin(i), 0, k * 0.65 * Math.cos(i));
    });
  }

  function syncArena(phase) {
    const titan = phase === "titan", radius = titan ? S.arena?.radius ?? 20 : CFG.R;
    // p3 is the final arena: keep its normalized 12m core fixed throughout.
    // Two reconstructed rings supply the initial 20m and intermediate 16m floor;
    // the permanent thin rim fills the source core's uneven 10.75–12m top edge.
    const nativeRadius = titan && !overrides.has("p3") ? 20.859610458372096 : 20;
    mapHolder.scale.setScalar((titan ? 12 : CFG.R) / nativeRadius);
    ground.visible = !syncModel(mapHolder, phase === "ultima" || phase === "p4" ? "p4" : "p3");
    ground.scale.set(titan ? 12 / CFG.R : 1, 1, titan ? 12 / CFG.R : 1);
    arenaRim.scale.set(radius / CFG.R, radius / CFG.R, 1);
    arenaWall.scale.set(radius / CFG.R, 1, radius / CFG.R);
    titanDebris.visible = titanInnerDebris.visible = titanCoreRim.visible = titan;
    if (titan) {
      const previousRadius = S.arena?.previousRadius ?? radius;
      const progress = Math.max(0, Math.min(1, S.arena?.collapse ?? 0));
      const outerProgress = radius >= 20 ? 0 : previousRadius === 20 && radius === 16 ? progress : 1;
      const innerProgress = radius >= 16 ? 0 : progress;
      const instance = mapHolder.userData.instance;
      syncTitanRing(titanDebris, outerProgress, instance);
      syncTitanRing(titanInnerDebris, innerProgress, instance);
      syncTitanRing(titanCoreRim, 0, instance);
    }
  }

  function syncPlayerModel(holder, index, entity, dt, rewound) {
    const custom = overrides.has("player");
    const kind = custom ? "player" : `player_${partyModels[index] || "war"}`;
    const entry = requestAsset(kind);
    const motion = custom ? null : requestAsset("player_motion");
    const loaded = syncModel(holder, entry.state === "error" ? "player" : kind, entity, dt);
    if (!loaded) return false;
    const item = holder.userData.instance;
    if (motion?.state === "ready" && !item.mixer) {
      const clips = {};
      for (const [name, sourceName] of Object.entries({ idle: "cbnm_id0", walk: "cbnm_01f_lp0", run: "cbnm_02f_lp0", sprint: "cbnm_sprint_lp0" })) {
        const source = motion.gltf.animations.find(clip => clip.name === sourceName);
        if (!source) continue;
        const tracks = source.tracks.filter(track => {
          const parsed = THREE.PropertyBinding.parseTrackName(track.name);
          // Preserve each job's proportions, normalization wrapper and world position.
          return parsed.propertyName === "quaternion" && parsed.nodeName !== "n_root" &&
            item.root.getObjectByName(parsed.nodeName)?.isBone;
        }).map(track => track.clone());
        if (tracks.length) clips[name] = new THREE.AnimationClip(`party_${name}`, source.duration, tracks);
      }
      if (clips.idle || clips.walk) {
        Object.assign(item, clips, { mixer: new THREE.AnimationMixer(item.root), sharedMotion: true });
      }
    }
    const entityChanged = item.entity !== entity;
    item.entity = entity;
    if ((rewound || entityChanged) && item.mixer) {
      item.mixer.stopAllAction(); item.mixer.setTime(0);
      item.clip = null; item.position = null; item.speed = 0;
    }
    if (item.sharedMotion) {
      const speed = dt > 0 && item.position ? Math.hypot(entity.x - item.position.x, entity.y - item.position.y) / dt : 0;
      item.position = { x: entity.x, y: entity.y };
      if (!entity.dead && !(entity.fallY < 0) && (dt > 0 || !item.clip)) {
        item.speed = (item.speed || 0) + (speed - (item.speed || 0)) * (dt > 0 ? 1 - Math.exp(-dt * 14) : 1);
        const clip = item.speed > 7.2 ? item.sprint || item.run || item.walk :
          item.speed > 3.5 ? item.run || item.walk : item.speed > .15 ? item.walk : item.idle;
        if (clip && clip !== item.clip) {
          const previous = item.clip && item.mixer.clipAction(item.clip);
          const action = item.mixer.clipAction(clip).reset().setEffectiveWeight(1).play();
          if (previous) action.crossFadeFrom(previous, .18, false);
          item.clip = clip;
        }
        if (item.clip) {
          item.mixer.clipAction(item.clip).setEffectiveTimeScale(item.clip === item.idle ? 1 :
            Math.max(.65, Math.min(1.6, item.speed / (item.clip === item.sprint ? 7.8 : item.clip === item.run ? 6 : 2.5))));
          item.mixer.update(dt);
        }
      }
    }
    return true;
  }

  function syncPlayerPose(g, e, dt, rewound) {
    const { pose, model, fallback } = g.userData;
    const falling = Number.isFinite(e.fallY) && e.fallY < 0;
    g.position.set(e.x, falling ? e.fallY : 0, e.y);
    const targetYaw = -(e.face || 0) - Math.PI / 2;
    const previousYaw = g.userData.heading;
    const delta = previousYaw === undefined ? 0 : Math.atan2(Math.sin(targetYaw - previousYaw), Math.cos(targetYaw - previousYaw));
    const entityChanged = g.userData.entity !== e;
    g.userData.entity = e;
    g.userData.heading = previousYaw === undefined || rewound || entityChanged ? targetYaw : previousYaw + delta * (1 - Math.exp(-12 * dt));
    g.rotation.set(0, g.userData.heading, 0);
    g.visible = !falling || e.fallY > -45;
    pose.position.set(0, 0, 0);
    pose.rotation.z = e.dead ? Math.PI / 2 : 0;
    if (e.dead) {
      const body = fallback.visible ? fallback : model.userData.instance?.root || model;
      const cached = g.userData.corpse;
      if (!cached || cached.body !== body || entityChanged || rewound) {
        // r128 Box3 reads the undeformed mesh, which floats after a walking
        // pose is frozen. Skin vertices once per corpse/model transition.
        g.updateMatrixWorld(true);
        let minY = Infinity;
        const point = new THREE.Vector3();
        body.traverseVisible(mesh => {
          const positions = mesh.geometry?.getAttribute("position");
          if (!mesh.isMesh || !positions) return;
          for (let vertex = 0; vertex < positions.count; vertex++) {
            point.fromBufferAttribute(positions, vertex);
            if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
            point.applyMatrix4(mesh.matrixWorld);
            minY = Math.min(minY, point.y);
          }
        });
        g.userData.corpse = { body, offset: Number.isFinite(minY) ? g.position.y - minY + .02 : 0 };
      }
      pose.position.y = g.userData.corpse.offset;
    } else {
      delete g.userData.corpse;
      const item = model.userData.instance;
      if (!falling && item?.sharedMotion && (item.clip === item.idle || item.clip === item.walk)) {
        // Rotation-only retargeting preserves each job's proportions, but loses
        // the source rig's vertical compensation. Keep a planted walk/idle on
        // the floor using actual skinned sole vertices. Run/sprint retain their
        // airborne stride. Cache the low vertices once, not the full mesh per frame.
        g.updateMatrixWorld(true);
        const point = new THREE.Vector3();
        if (!item.supportVertices) {
          const candidates = [];
          let lowest = Infinity;
          item.root.traverseVisible(mesh => {
            const positions = mesh.geometry?.getAttribute("position");
            if (!mesh.isMesh || !positions) return;
            for (let vertex = 0; vertex < positions.count; vertex++) {
              point.fromBufferAttribute(positions, vertex);
              if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
              point.applyMatrix4(mesh.matrixWorld);
              lowest = Math.min(lowest, point.y);
              candidates.push({ mesh, vertex, height: point.y });
            }
          });
          item.supportVertices = candidates.filter(vertex => vertex.height <= lowest + .25);
        }
        let lowest = Infinity;
        for (const { mesh, vertex } of item.supportVertices) {
          point.fromBufferAttribute(mesh.geometry.getAttribute("position"), vertex);
          if (mesh.isSkinnedMesh) mesh.boneTransform(vertex, point);
          lowest = Math.min(lowest, point.applyMatrix4(mesh.matrixWorld).y);
        }
        if (Number.isFinite(lowest)) pose.position.y = g.position.y - lowest + .02;
      }
    }
    g.userData.hideName = falling;
    g.userData.name.visible = !falling;
    g.userData.mark.visible = !e.dead;
  }

  function init(canvas) {
    if (typeof THREE === "undefined") return false;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); }
    catch { return false; }
    renderer.outputEncoding = THREE.sRGBEncoding;
    const statusStyle = document.createElement("style");
    statusStyle.textContent = ".uwu-asset-status{position:absolute;top:8px;left:8px;padding:3px 7px;border-radius:4px;background:#020617dc;color:#e2e8f0;font-size:12px;pointer-events:none}.uwu-model-source{position:absolute;top:32px;left:8px;padding:3px 7px;border-radius:4px;background:#020617dc;color:#cbd5e1;font-size:12px;pointer-events:none}.viewport:not(.game) .uwu-asset-status,.viewport:not(.game) .uwu-model-source{display:none}";
    document.head.append(statusStyle);
    modelSource = document.createElement("div");
    modelSource.className = "uwu-model-source";
    modelSource.textContent = "賢者：改製模型";
    canvas.insertAdjacentElement("afterend", modelSource);
    assetStatus = document.createElement("div");
    assetStatus.className = "uwu-asset-status";
    assetStatus.setAttribute("role", "status");
    assetStatus.hidden = true;
    canvas.insertAdjacentElement("afterend", assetStatus);
    installUploadControls(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x04060d); scene.fog = new THREE.Fog(0x04060d, 55, 130);
    camera = new THREE.PerspectiveCamera(58, 1.6, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1b2033, 0.95));
    const sun = new THREE.DirectionalLight(0xffe2c4, 0.55); sun.position.set(12, 30, 8); scene.add(sun);
    const R = CFG.R;
    ground = new THREE.Group();
    mapHolder = new THREE.Group();
    titanDebris = makeTitanDebris(16, 20); titanDebris.visible = false;
    titanInnerDebris = makeTitanDebris(12, 16); titanInnerDebris.visible = false;
    titanInnerDebris.name = "titan-inner-collapse-sectors";
    titanCoreRim = makeTitanCoreRim(); titanCoreRim.visible = false;
    scene.add(ground, mapHolder, titanDebris, titanInnerDebris, titanCoreRim);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.8, 72), new THREE.MeshLambertMaterial({ color: 0x1b2238 })); floor.position.y = -0.4; ground.add(floor);
    const rim = arenaRim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 8, 96), new THREE.MeshBasicMaterial({ color: 0xb4532a })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.05; scene.add(rim);
    const wall = arenaWall = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.15, R + 0.15, 2.4, 72, 1, true), new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })); wall.position.y = 1.2; scene.add(wall);
    for (const r of [5, 10, 15]) { const ring = flat(new THREE.RingGeometry(r - 0.04, r + 0.04, 64), 0xffffff, 0.07); ring.position.y = 0.01; ground.add(ring); }
    for (let d = 0; d < 4; d++) { const line = flat(new THREE.PlaneGeometry(0.07, R * 2), 0xffffff, 0.06); line.rotation.z = (d * Math.PI) / 4; line.position.y = 0.01; ground.add(line); }
    // 場地標記
    for (const [name, mx, my, col] of MARKERS) {
      const c = new THREE.Color(col);
      const pad = flat(new THREE.CircleGeometry(1.15, 24), c, 0.28); pad.position.set(mx, 0.02, my); scene.add(pad);
      const edge = flat(new THREE.RingGeometry(1.05, 1.2, 24), c, 0.8); edge.position.set(mx, 0.025, my); scene.add(edge);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 })); beam.position.set(mx, 1.1, my); scene.add(beam);
      const s = sprite(name, col, 1.1); s.position.set(mx, 2.7, my); scene.add(s);
    }
    DIR_NAME.forEach((n, d) => { const p = polar(d * 45, R + 5); const s = sprite(n, d === 0 ? "#f8fafc" : "#8a96ad", d % 2 ? .8 : 1.1); s.position.set(p.x, .3, p.y); scene.add(s); });
    // 玩家
    ROLES.forEach((role, i) => {
      const g = new THREE.Group(), col = new THREE.Color(ROLE_COLOR[i]);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 12), new THREE.MeshLambertMaterial({ color: col })); body.position.y = 0.65; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), new THREE.MeshLambertMaterial({ color: col })); head.position.y = 1.62; g.add(head);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff })); nose.position.set(0, 1.62, -0.4); g.add(nose);
      const ring = flat(new THREE.RingGeometry(0.6, 0.78, 24), 0xffffff, 0.9); ring.position.y = 0.03; g.add(ring);
      const name = new THREE.Group(); name.position.y = 2.6; g.add(name);
      const mark = new THREE.Group(); mark.position.y = 3.5; g.add(mark);
      const fallback = new THREE.Group(), model = new THREE.Group();
      fallback.add(body, head, nose);
      const pose = new THREE.Group();
      pose.add(fallback, model); g.add(pose);
      g.userData = { ring, name, mark, fallback, model, pose };
      scene.add(g); players.push(g);
    });
    for (let i = 0; i < 6; i++) { const m = makeIfrit(); m.visible = false; scene.add(m); ifrits.push(m); }
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 8), new THREE.MeshLambertMaterial({ color: 0x9a3412, emissive: 0x2a0d03 })); spike.position.y = 1.8; g.add(spike);
      const tag = new THREE.Group(); tag.position.y = 4.6; g.add(tag);
      g.userData = { spike, tag }; g.visible = false; scene.add(g); nailMeshes.push(g);
    }
    for (let i = 0; i < 3; i++) { const r = flat(new THREE.RingGeometry(CFG.swR - 0.18, CFG.swR, 72), 0xff5a5a, 0.75); r.visible = false; scene.add(r); swRings.push(r); }
    crushRing = flat(new THREE.RingGeometry(CFG.stackR - 0.2, CFG.stackR, 48), 0xffd166, 0.95); crushRing.visible = false; scene.add(crushRing);
    spotRing = flat(new THREE.RingGeometry(3.2, 3.5, 48), 0x4cc2ff, 0.85); spotRing.visible = false; scene.add(spotRing);
    fetterLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffb347 })); fetterLine.visible = false; scene.add(fetterLine);
    for (let i = 0; i < 6; i++) { const f = flat(new THREE.CircleGeometry(1, 48), 0xffc878, 0.35); f.visible = false; scene.add(f); flashPool.push(f); }
    // 場景道具（炸彈岩、石牢）與輔助標示：由各階段的腳本透過 S.props、sceneGuides() 提供
    for (let i = 0; i < 10; i++) {
      const g = new THREE.Group();
      const bomb = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), new THREE.MeshLambertMaterial({ color: 0x7c2d12, emissive: 0x2a0d03 })); bomb.position.y = 1.3; g.add(bomb);
      const gaol = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 2.6), new THREE.MeshLambertMaterial({ color: 0x9ca3af, transparent: true, opacity: 0.6 })); gaol.position.y = 1.7; g.add(gaol);
      const model = new THREE.Group();
      g.add(model);
      g.userData = { bomb, gaol, model }; g.visible = false; scene.add(g); propPool.push(g);
    }
    // 王腳下的目標圈與面向箭頭（有的階段拿它當站位參考）
    bossRingG = new THREE.Group();
    bossRingG.add(flat(new THREE.RingGeometry(1, 1.03, 64), 0xffffff, 0.85));
    const tri = new THREE.Shape(); tri.moveTo(0, 1); tri.lineTo(-1, 0); tri.lineTo(1, 0); tri.closePath();
    bossRingG.add(flat(new THREE.ShapeGeometry(tri), 0xffffff, 0.95));
    bossRingG.visible = false; scene.add(bossRingG);
    ready = true;
    return true;
  }

  function syncAoes(t) {
    const seen = new Set();
    for (const a of S.aoes) {
      if (!a.shape) continue;
      if (a.assistOnly && !S.opts.assist) continue;
      if (t < a.t0) continue;
      if (a.isCross && t < a.t1 && !S.opts.assist) continue;
      if (a.done && !a.linger && t > a.t1 + 0.35) continue;
      const k = a.done ? 1 : clamp01((t - a.t0) / Math.max(a.t1 - a.t0, 0.01));
      let m = aoeMeshes.get(a);
      const sh = a.shape;
      if (!m) {
        m = new THREE.Group();
        if (sh.type === "circle" || sh.type === "donut") {
          const geometry = sh.type === "donut" ? new THREE.RingGeometry(sh.inner, sh.r, 64) : new THREE.CircleGeometry(sh.r, 48);
          const c = flat(geometry, 0xff7828, 0.2);
          c.position.set(sh.c.x, Y, sh.c.y);
          m.add(c);
        }
        else if (sh.type === "strip" || sh.type === "cross") for (const deg of sh.type === "cross" ? [sh.deg, sh.deg + 90] : [sh.deg]) { const s = flat(stripGeom(sh.half, sh, deg), sh.type === "cross" ? 0xffa040 : 0xff7828, 0.2); s.rotation.z = -rad(deg); s.position.y = Y + 0.01; m.add(s); }
        else if (sh.type === "cone") { m.add(flat(new THREE.CircleGeometry(sh.len, 28, -sh.half, sh.half * 2), 0xff7828, 0.2)); }
        else if (sh.type === "rect") { m.add(flat(new THREE.BufferGeometry(),0xff7828,0.2)); }
        scene.add(m); aoeMeshes.set(a, m);
      }
      if (sh.type === "cone") { // 扇形跟著王與坦克轉
        const f = sh.from(), to = sh.to(), ang = Math.atan2(to.y - f.y, to.x - f.x), c = m.children[0];
        c.rotation.z = -ang; c.position.set(f.x, Y + 0.02, f.y);
      }
      if(sh.type === "rect") {
        const deg=sh.ang*180/Math.PI+90,key=[sh.half,sh.len,sh.back,sh.from.x,sh.from.y,sh.ang].join(':');
        const mesh=m.children[0];
        if(m.userData.rectKey!==key){mesh.geometry.dispose();mesh.geometry=stripGeom(sh.half,{length:sh.len,back:sh.back??.5,c:sh.from},deg);m.userData.rectKey=key;}
        mesh.rotation.z=-rad(deg);mesh.position.set(sh.from.x,Y+.01,sh.from.y);
      }
      if (sh.type === "strip" || sh.type === "cross") {
        const key=[sh.half,sh.length,sh.back,sh.c?.x,sh.c?.y,sh.deg].join(':');
        m.children.forEach((strip,index)=>{
          const deg=sh.deg+index*90;
          if (m.userData.laneKey!==key) { strip.geometry.dispose(); strip.geometry=stripGeom(sh.half,sh,deg); }
          strip.rotation.z=-rad(deg);
          strip.position.set(sh.c?.x ?? 0, Y + 0.01, sh.c?.y ?? 0);
        });
        m.userData.laneKey=key;
      }
      for (const c of m.children) c.material.opacity = 0.16 + 0.34 * k;
      seen.add(a);
    }
    for (const [a, m] of aoeMeshes) if (!seen.has(a)) { for (const c of m.children) { c.geometry.dispose(); c.material.dispose(); } scene.remove(m); aoeMeshes.delete(a); }
  }

  // Pooled practice orb geometry: the simulation owns contact positions,
  // outcomes and lifetime. Rendering never decides whether a soak succeeded.
  const orbBodyPool = [], orbBurstPool = [];
  function orbMaterial(color, opacity=1) {
    return new THREE.MeshBasicMaterial({color, transparent:true, opacity, depthWrite:false});
  }
  function makeOrbBody() {
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.SphereGeometry(.78,24,16),orbMaterial(0xffdc78));
    const shell=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),orbMaterial(0xffdc78,.3));
    const band=new THREE.Mesh(new THREE.TorusGeometry(.91,.045,8,48),orbMaterial(0xfff2cc,.9));
    band.rotation.x=.75;g.add(core,shell,band);scene.add(g);return g;
  }
  function syncOrbs() {
    const data=typeof sceneOrbs==='function'?sceneOrbs():{bodies:[],effects:[]};
    let count=0;
    function body(b,scale=1,opacity=1,color=b.color) {
      const g=orbBodyPool[count]||(orbBodyPool[count]=makeOrbBody());count++;
      g.visible=true;g.position.set(b.pos.x,b.radius+.2,b.pos.y);g.scale.setScalar(Math.max(.001,b.radius*scale));
      g.children.forEach((m,i)=>{m.material.color.set(color);m.material.opacity=opacity*(i===1?.3:i===2?.9:1);});
      g.children[2].rotation.z=(S.orbEffectTime||0)*1.2;
    }
    data.bodies.forEach(b=>body(b));
    data.effects.forEach((fx,index)=>{
      const k=fx.progress,color=fx.outcome==='soak'?'#ffe19a':fx.outcome==='fusion'?'#bf85ff':'#ff6655';
      // Contact consumes both members of the pair; shrinking shells make the
      // despawn visible instead of deleting them in the collision frame.
      fx.bodies.forEach(b=>body(b,Math.max(0,1-k*3),Math.max(0,1-k*3),color));
      let g=orbBurstPool[index];
      if(!g){
        g=new THREE.Group();
        const flash=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),orbMaterial(color,.65));
        const wave=flat(new THREE.RingGeometry(.94,1,64),color,.9);wave.position.y=.12;
        g.add(flash,wave);
        for(let i=0;i<16;i++)g.add(new THREE.Mesh(new THREE.SphereGeometry(.1,6,4),orbMaterial(color)));
        for(let i=0;i<8;i++)g.add(new THREE.Mesh(new THREE.SphereGeometry(1,12,8),orbMaterial(color,.4)));
        scene.add(g);orbBurstPool[index]=g;
      }
      g.visible=true;g.position.set(fx.pos.x,0,fx.pos.y);
      const flash=g.children[0],wave=g.children[1];
      flash.position.y=1.4;flash.scale.setScalar(.3+Math.min(k*5,1)*2.2);flash.material.color.set(color);flash.material.opacity=Math.max(0,.7-k*1.8);
      wave.scale.setScalar(fx.radius*Math.min(1,.05+k*2));wave.material.color.set(color);wave.material.opacity=(1-k)*.85;
      for(let i=0;i<16;i++){
        const m=g.children[i+2],angle=i*Math.PI/8,r=(.2+k)*3.8;
        m.position.set(Math.cos(angle)*r,1.4+Math.sin(k*Math.PI)*((i%3)+1),Math.sin(angle)*r);
        m.material.color.set(color);m.material.opacity=1-k;m.scale.setScalar(1-k*.6);
      }
      for(let i=0;i<8;i++){
        const m=g.children[i+18],p=fx.targets[i];m.visible=!!p;
        if(p){m.position.set(p.x-fx.pos.x,1,p.y-fx.pos.y);m.scale.set(.55+k*.7,1.1+k*.4,.55+k*.7);m.material.color.set(color);m.material.opacity=(1-k)*.45;}
      }
    });
    for(let i=count;i<orbBodyPool.length;i++)orbBodyPool[i].visible=false;
    for(let i=data.effects.length;i<orbBurstPool.length;i++)orbBurstPool[i].visible=false;
  }

  function syncGuides(t) {
    const guides = typeof sceneGuides === "function" ? sceneGuides(t) : [];
    let rings = 0, lines = 0;
    for (const guide of guides) {
      if (guide.type === "ring") {
        if (rings === guideRings.length) {
          const ring = flat(new THREE.RingGeometry(1.05, 1.3, 32), 0xffffff, 0.9);
          guideRings.push(ring);
          scene.add(ring);
        }
        const ring = guideRings[rings++];
        ring.visible = true;
        const radius = Number.isFinite(guide.radius) && guide.radius > 0 ? guide.radius : 1.3;
        ring.scale.setScalar(radius / 1.3);
        ring.position.set(guide.pos.x, Y + 0.03, guide.pos.y);
        ring.material.color.set(guide.color);
        ring.material.depthTest = !guide.diagnostic;
        ring.renderOrder = guide.diagnostic ? 100 : 0;
      } else if (guide.type === "line") {
        if (lines === guideLines.length) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3).setUsage(THREE.DynamicDrawUsage));
          const line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
          line.frustumCulled = false; // 端點每幀移動。
          guideLines.push(line);
          scene.add(line);
        }
        const line = guideLines[lines++];
        const points = line.geometry.getAttribute("position");
        points.setXYZ(0, guide.a.x, 0.3, guide.a.y);
        points.setXYZ(1, guide.b.x, 0.3, guide.b.y);
        points.needsUpdate = true;
        line.material.color.set(guide.color);
        line.material.depthTest = !guide.diagnostic;
        line.renderOrder = guide.diagnostic ? 100 : 0;
        line.visible = true;
      }
    }
    for (let i = rings; i < guideRings.length; i++) guideRings[i].visible = false;
    for (let i = lines; i < guideLines.length; i++) guideLines[i].visible = false;
  }

  // 畫面跟不上時自動降解析度：連續約 1.5 秒平均低於每秒 40 格，就把像素比降到 1
  let qLast = 0, qAvg = 16, qSlow = 0;
  function render(w, h) {
    if (!ready) return;
    const qNow = performance.now(); if (qLast) { qAvg += (Math.min(200, qNow - qLast) - qAvg) * 0.08; qSlow = qAvg > 25 ? qSlow + (qNow - qLast) : 0; } qLast = qNow;
    if (qSlow > 1500 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(1); qSlow = 0; }
    const t = S.t, role = S.opts.role, me = S.ents[role];
    const rewound = previousTime !== undefined && t < previousTime;
    const dt = t >= previousTime ? Math.min(t - previousTime, 0.1) : 0;
    previousTime = t;
    activeAssets.clear();
    const phase = S.assetPhase || defaultPhase();
    syncArena(phase);
    if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    // 玩家
    S.ents.forEach((e, i) => {
      const g = players[i];
      g.userData.fallback.visible = !syncPlayerModel(g.userData.model, i, e, e.dead || e.fallY < 0 ? 0 : dt, rewound);
      syncPlayerPose(g, e, dt, rewound);
      g.userData.ring.visible = i === role && !e.dead;
      setSprite(g.userData.name, i===role?`你 ${ROLES[i]} ${partyJobLabels[i]}`:ROLES[i], i === role ? "#ffffff" : "#cbd5e1", i === role ? 0.75 : 0.6);
      const marks = [];
      if (hasSw(i, t)) marks.push("灼熱");
      if (fetterOn(t) && (i === 1 || i === S.fetterDps)) marks.push("鎖");
      if (S.crushMark && S.crushMark.until > t && S.crushMark.who === i) marks.push("分攤");
      setSprite(g.userData.mark, marks.join(" "), marks[0] === "分攤" ? "#ffd166" : "#ff8080", 0.8);
    });
    // 火神本體、分身、四連衝的四隻
    const custom = typeof sceneActors === "function" ? sceneActors(t) : null; // 其他階段自己提供場上的王
    const list = custom || [];
    const b = bossState(t);
    if (!custom && b.vis) list.push({ pos: b.pos, look: t < 7.2 ? polar(S.bossCard * 90 + 180, 19.5) : S.tank === null ? { x: 0, y: 30 } : S.ents[S.tank], real: t >= 66, tag: "" });
    if (!custom && t >= 91.8 && t < 95.7) for (const d of [180, 90]) list.push({ pos: lerp(polar(d, 19.5), polar(d + 180, 19.5), clamp01((t - 94.8) / 0.35)), look: { x: 0, y: 0 }, real: false, tag: "" });
    if (!custom) for (const c of dashers(t)) list.push({ pos: c.pos, look: { x: 0, y: 0 }, real: c.real, tag: S.opts.assist ? String(c.n + 1) + (c.real ? " 藍火" : "") : "" });
    ifrits.forEach((m, i) => {
      const it = list[i];
      const parts = m.userData;
      m.visible = !!it && it.vis !== false;
      if (!it) { clearModelSlot(parts.model); return; }
      const kind = bossKinds.includes(it.kind) ? it.kind : bossKinds.includes(phase) ? phase : defaultPhase();
      parts.fallback.visible = !syncModel(parts.model, kind, it.pos, dt);
      parts.tag.position.set(0, parts.fallback.visible ? 9.6 : assets[kind].tagY, 0);
      m.position.set(it.pos.x, it.alt || 0, it.pos.y); faceTo(m, it.pos, it.look);
      syncTitanLandingSupport(m, it, kind, phase);
      m.userData.fire.visible = m.userData.aura.visible = it.real; // 覺醒的本體身上是藍火
      m.userData.body.material.emissive.setHex(it.real ? 0x12305e : 0x4a1503);
      m.userData.body.material.color.setHex(it.color ?? 0xc2410c);
      m.userData.head.material.color.setHex(it.color ?? 0xea580c);
      setSprite(m.userData.tag, it.tag, it.real ? "#93c5fd" : "#ffffff", 1.5);
    });
    // 釘子：被地火炸到會變大
    const alive = nails(t);
    nailMeshes.forEach((g, i) => {
      const n = alive.find((x) => x.i === i); g.visible = !!n; if (!n) return;
      g.position.set(n.pos.x, 0, n.pos.y); const s = 1 + 0.35 * Math.min(n.hits, 2); g.scale.set(s, s, s);
      g.userData.spike.material.color.setHex([0x7c2d12, 0xc2410c, 0xf97316][Math.min(n.hits, 2)]);
      setSprite(g.userData.tag, S.opts.assist ? `${n.order + 1}（${Math.min(n.hits, 2)}/2）` : "", n.hits >= 2 ? "#fde68a" : "#ffffff", 1.2);
    });
    // 灼熱範圍（輔助）、分攤圈、連線
    const sws = S.opts.assist ? swActive(t) : [];
    swRings.forEach((r, i) => { const s = sws[i]; r.visible = !!s; if (s) r.position.set(S.ents[s.who].x, Y, S.ents[s.who].y); });
    const cm = S.crushMark && S.crushMark.until > t ? S.ents[S.crushMark.who] : null;
    crushRing.visible = !!cm; if (cm) crushRing.position.set(cm.x, Y + 0.02, cm.y);
    const spotOn = S.opts.assist && S.opts.role <= 1 && tankable(t) && b.vis; spotRing.visible = spotOn; if (spotOn) { const sp = bossSpot(t).pos; spotRing.position.set(sp.x, Y + 0.02, sp.y); } // 坦克輔助：王該在的位置
    fetterLine.visible = fetterOn(t);
    if (fetterLine.visible) { const a = S.ents[1], c = S.ents[S.fetterDps]; fetterLine.geometry.setFromPoints([v3(a, 1.1), v3(c, 1.1)]); fetterLine.material.color.setHex(dist(a, c) > CFG.fetterMax ? 0xff4d4d : 0xffb347); }
    const fl = S.flashRings.filter((f) => f.until > t);
    flashPool.forEach((m, i) => { const f = fl[i]; m.visible = !!f; if (f) { m.position.set(f.c.x, Y + 0.03, f.c.y); m.scale.set(f.r, f.r, 1); } });
    const props = S.props || [];
    propPool.forEach((g, i) => {
      const p = props[i], parts = g.userData;
      g.visible = !!p;
      if (!p) { clearModelSlot(parts.model); return; }
      const gaol = p.type === "gaol";
      const loaded = syncModel(parts.model, gaol ? "gaol" : null);
      g.position.set(p.pos.x, 0, p.pos.y);
      parts.bomb.visible = p.type === "bomb";
      parts.gaol.visible = gaol && !loaded;
    });
    syncGuides(t);
    syncOrbs();
    const br = typeof bossRing === "function" ? bossRing(t) : null; bossRingG.visible = !!br;
    if (br) { bossRingG.position.set(br.pos.x, Y + 0.04, br.pos.y); faceTo(bossRingG, br.pos, br.look); const ring = bossRingG.children[0], ar = bossRingG.children[1]; ring.scale.set(br.r, br.r, 1); ar.scale.set(br.half, br.tip - br.r, 1); ar.position.set(0, 0, -br.r); }
    syncAoes(t);
    // 鏡頭：跟在角色背後。S.cam = 水平角（0 = 面向北），S.pitch = 俯角，S.dist = 距離
    const yaw = S.cam, pitch = S.pitch, d = S.dist;
    const tx = me.x, ty = 1.5, tz = me.y;
    camera.position.set(tx - Math.sin(yaw) * Math.cos(pitch) * d, ty + Math.sin(pitch) * d, tz + Math.cos(yaw) * Math.cos(pitch) * d);
    camera.lookAt(tx, ty, tz);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    layoutNameplates(w,h,role);
    layoutBossNames(w,h);
    scene.updateMatrixWorld(true);
    // A huge primal can stand between the follow camera and the player. Fade
    // that instance only, keeping the facing ring and the attack tells visible.
    const focus=new THREE.Vector3(tx,ty,tz),viewRay=new THREE.Ray(camera.position,focus.clone().sub(camera.position).normalize());
    const focusDistance=camera.position.distanceTo(focus);
    for(const boss of ifrits){
      const instance=boss.userData.model.userData.instance;if(!boss.visible||!instance)continue;
      const box=new THREE.Box3().setFromObject(instance.root),intersection=viewRay.intersectBox(box,new THREE.Vector3());
      const blocked=box.containsPoint(camera.position)||(!!intersection&&camera.position.distanceTo(intersection)<focusDistance-.4);
      if(blocked&&!instance.occlusionMaterials){
        instance.occlusionMaterials=[];
        instance.root.traverse(object=>{
          if(!object.isMesh||!object.material)return;
          const clone=material=>{const copy=material.clone();instance.occlusionMaterials.push({material:copy,opacity:material.opacity,alphaTest:material.alphaTest,transparent:material.transparent,depthWrite:material.depthWrite});return copy;};
          object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
        });
      }
      for(const item of instance.occlusionMaterials||[]){
        const transparent=blocked||item.transparent;
        if(item.material.transparent!==transparent){item.material.transparent=transparent;item.material.needsUpdate=true;}
        const fade=blocked?.22:1;
        item.material.opacity=item.opacity*fade;
        // GLB MASK materials compare texture alpha * opacity to alphaTest.
        // Scale both so fading cannot discard the whole primal silhouette.
        item.material.alphaTest=item.alphaTest*fade;
        item.material.depthWrite=blocked?false:item.depthWrite;
      }
    }
    renderer.render(scene, camera);
    updateAssetStatus();
  }

  return { init, render, setModel, clearModel, get ready() { return ready; } };
})();
