// 絕神兵機制模擬器：遊戲視角（第三人稱跟隨鏡頭）畫面層。
// 只負責「畫」，機制與判定都在 uwu-ifrit.js。場地座標 (x, y) 對應 3D 的 (x, 0, z)，北 = -z。
// 造型全部是簡化的幾何形狀，不使用任何遊戲素材。
"use strict";

const View3D = (() => {
  let renderer, scene, camera, ready = false;
  let players = [], ifrits = [], nailMeshes = [], swRings = [], crushRing, fetterLine, flashPool = [];
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
    while (holder.children.length) holder.remove(holder.children[0]);
    if (text) holder.add(sprite(text, color, h));
  }
  const decalMat = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
  function flat(geom, color, opacity) { const m = new THREE.Mesh(geom, decalMat(color, opacity)); m.rotation.x = -Math.PI / 2; return m; }
  // 直線衝鋒：長條與圓形場地的交集，才不會畫到場外
  function stripGeom(half) {
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
    g.userData = { body, head, fire, aura, tag };
    return g;
  }
  function faceTo(obj, from, to) { const dx = to.x - from.x, dz = to.y - from.y; if (Math.abs(dx) + Math.abs(dz) > 1e-3) obj.rotation.y = Math.atan2(-dx, -dz); }

  function init(canvas) {
    if (typeof THREE === "undefined") return false;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x04060d); scene.fog = new THREE.Fog(0x04060d, 55, 130);
    camera = new THREE.PerspectiveCamera(58, 1.6, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1b2033, 0.95));
    const sun = new THREE.DirectionalLight(0xffe2c4, 0.55); sun.position.set(12, 30, 8); scene.add(sun);
    const R = CFG.R;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.8, 72), new THREE.MeshLambertMaterial({ color: 0x1b2238 })); floor.position.y = -0.4; scene.add(floor);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 8, 96), new THREE.MeshBasicMaterial({ color: 0xb4532a })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.05; scene.add(rim);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.15, R + 0.15, 2.4, 72, 1, true), new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })); wall.position.y = 1.2; scene.add(wall);
    for (const r of [5, 10, 15]) { const ring = flat(new THREE.RingGeometry(r - 0.04, r + 0.04, 64), 0xffffff, 0.07); ring.position.y = 0.01; scene.add(ring); }
    for (let d = 0; d < 4; d++) { const line = flat(new THREE.PlaneGeometry(0.07, R * 2), 0xffffff, 0.06); line.rotation.z = (d * Math.PI) / 4; line.position.y = 0.01; scene.add(line); }
    // 場地標記
    for (const [name, mx, my, col] of MARKERS) {
      const c = new THREE.Color(col);
      const pad = flat(new THREE.CircleGeometry(1.15, 24), c, 0.28); pad.position.set(mx, 0.02, my); scene.add(pad);
      const edge = flat(new THREE.RingGeometry(1.05, 1.2, 24), c, 0.8); edge.position.set(mx, 0.025, my); scene.add(edge);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 })); beam.position.set(mx, 1.1, my); scene.add(beam);
      const s = sprite(name, col, 1.1); s.position.set(mx, 2.7, my); scene.add(s);
    }
    DIR_NAME.forEach((n, d) => { const p = polar(d * 45, R + 3); const s = sprite(n, d === 0 ? "#f8fafc" : "#8a96ad", d % 2 ? 1.3 : 1.7); s.position.set(p.x, 2.2, p.y); scene.add(s); });
    // 玩家
    ROLES.forEach((role, i) => {
      const g = new THREE.Group(), col = new THREE.Color(ROLE_COLOR[i]);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 12), new THREE.MeshLambertMaterial({ color: col })); body.position.y = 0.65; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), new THREE.MeshLambertMaterial({ color: col })); head.position.y = 1.62; g.add(head);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff })); nose.position.set(0, 1.62, -0.4); g.add(nose);
      const ring = flat(new THREE.RingGeometry(0.6, 0.78, 24), 0xffffff, 0.9); ring.position.y = 0.03; g.add(ring);
      const name = new THREE.Group(); name.position.y = 2.6; g.add(name);
      const mark = new THREE.Group(); mark.position.y = 3.5; g.add(mark);
      g.userData = { ring, name, mark };
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
    fetterLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffb347 })); fetterLine.visible = false; scene.add(fetterLine);
    for (let i = 0; i < 6; i++) { const f = flat(new THREE.CircleGeometry(1, 48), 0xffc878, 0.35); f.visible = false; scene.add(f); flashPool.push(f); }
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
        if (sh.type === "circle") { const c = flat(new THREE.CircleGeometry(sh.r, 48), 0xff7828, 0.2); c.position.set(sh.c.x, Y, sh.c.y); m.add(c); }
        else if (sh.type === "strip" || sh.type === "cross") for (const deg of sh.type === "cross" ? [sh.deg, sh.deg + 90] : [sh.deg]) { const s = flat(stripGeom(sh.half), sh.type === "cross" ? 0xffa040 : 0xff7828, 0.2); s.rotation.z = -rad(deg); s.position.y = Y + 0.01; m.add(s); }
        else if (sh.type === "cone") { m.add(flat(new THREE.BufferGeometry(), 0xff7828, 0.2)); }
        scene.add(m); aoeMeshes.set(a, m);
      }
      if (sh.type === "cone") { // 扇形跟著王與坦克轉，每幀重建
        const f = sh.from(), to = sh.to(), ang = Math.atan2(to.y - f.y, to.x - f.x), c = m.children[0];
        c.geometry.dispose(); c.geometry = new THREE.CircleGeometry(sh.len, 28, -ang - sh.half, sh.half * 2); c.position.set(f.x, Y + 0.02, f.y);
      }
      for (const c of m.children) c.material.opacity = 0.16 + 0.34 * k;
      seen.add(a);
    }
    for (const [a, m] of aoeMeshes) if (!seen.has(a)) { for (const c of m.children) { c.geometry.dispose(); c.material.dispose(); } scene.remove(m); aoeMeshes.delete(a); }
  }

  function render(w, h) {
    if (!ready) return;
    const t = S.t, role = S.opts.role, me = S.ents[role];
    if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    // 玩家
    S.ents.forEach((e, i) => {
      const g = players[i]; g.position.set(e.x, 0, e.y); g.rotation.y = -(e.face || 0) - Math.PI / 2;
      g.userData.ring.visible = i === role;
      setSprite(g.userData.name, i === role ? "你 " + ROLES[i] : ROLES[i], i === role ? "#ffffff" : "#cbd5e1", i === role ? 0.85 : 0.75);
      const marks = [];
      if (hasSw(i, t)) marks.push("灼熱");
      if (fetterOn(t) && (i === 1 || i === S.fetterDps)) marks.push("鎖");
      if (S.crushMark && S.crushMark.until > t && S.crushMark.who === i) marks.push("分攤");
      setSprite(g.userData.mark, marks.join(" "), marks[0] === "分攤" ? "#ffd166" : "#ff8080", 0.8);
    });
    // 火神本體、分身、四連衝的四隻
    const list = [];
    const b = bossState(t);
    if (b.vis) list.push({ pos: b.pos, look: t < 7.2 ? polar(S.bossCard * 90 + 180, 19.5) : S.ents[t < 66 ? 1 : 0], real: t >= 66, tag: "" });
    if (t >= 91.8 && t < 95.7) for (const d of [180, 90]) list.push({ pos: lerp(polar(d, 19.5), polar(d + 180, 19.5), clamp01((t - 94.8) / 0.35)), look: { x: 0, y: 0 }, real: false, tag: "" });
    for (const c of dashers(t)) list.push({ pos: c.pos, look: { x: 0, y: 0 }, real: c.real, tag: S.opts.assist ? String(c.n + 1) + (c.real ? " 藍火" : "") : "" });
    ifrits.forEach((m, i) => {
      const it = list[i]; m.visible = !!it; if (!it) return;
      m.position.set(it.pos.x, 0, it.pos.y); faceTo(m, it.pos, it.look);
      m.userData.fire.visible = m.userData.aura.visible = it.real; // 覺醒的本體身上是藍火
      m.userData.body.material.emissive.setHex(it.real ? 0x12305e : 0x4a1503);
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
    fetterLine.visible = fetterOn(t);
    if (fetterLine.visible) { const a = S.ents[1], c = S.ents[S.fetterDps]; fetterLine.geometry.setFromPoints([v3(a, 1.1), v3(c, 1.1)]); fetterLine.material.color.setHex(dist(a, c) > CFG.fetterMax ? 0xff4d4d : 0xffb347); }
    const fl = S.flashRings.filter((f) => f.until > t);
    flashPool.forEach((m, i) => { const f = fl[i]; m.visible = !!f; if (f) { m.position.set(f.c.x, Y + 0.03, f.c.y); m.scale.set(f.r, f.r, 1); } });
    syncAoes(t);
    // 鏡頭：跟在角色背後。S.cam = 水平角（0 = 面向北），S.pitch = 俯角，S.dist = 距離
    const yaw = S.cam, pitch = S.pitch, d = S.dist;
    const tx = me.x, ty = 1.5, tz = me.y;
    camera.position.set(tx - Math.sin(yaw) * Math.cos(pitch) * d, ty + Math.sin(pitch) * d, tz + Math.cos(yaw) * Math.cos(pitch) * d);
    camera.lookAt(tx, ty, tz);
    renderer.render(scene, camera);
  }

  return { init, render, get ready() { return ready; } };
})();
