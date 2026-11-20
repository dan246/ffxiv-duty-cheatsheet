/* Across-phase practice preferences. Each battle keeps its original mechanics engine. */
"use strict";
const UwuSession = (() => {
  const phases = [
    { id: "garuda", name: "風神", url: "uwu.html?phase=garuda" },
    { id: "ifrit", name: "火神・逆 Z", url: "uwu-ifrit.html" },
    { id: "titan", name: "泰坦", url: "uwu-titan.html" },
    { id: "intermission", name: "轉場・極限技", url: "uwu.html?phase=intermission" },
    { id: "ultima", name: "究極神兵", url: "uwu.html?phase=ultima" },
  ];
  const key = "uwu-practice-v1";
  function advancePaused(state,advance) {
    if(!state.paused||state.over||state.dead||state.done)return false;
    state.paused=false;
    try{for(let i=0;i<5&&!state.over&&!state.dead&&!state.done;i++)advance(.02);}finally{state.paused=true;}
    return true;
  }
  function sanitize(value) {
    const o = {};
    if (!value || typeof value !== "object") return o;
    if (Number.isInteger(+value.role) && +value.role >= 0 && +value.role < 8) o.role = +value.role;
    if ([0.5, 0.75, 1, 1.25, 1.5].includes(+value.speed)) o.speed = +value.speed;
    if (["game", "top"].includes(value.view)) o.view = value.view;
    if (Number.isInteger(+value.seed) && +value.seed >= 0 && +value.seed <= 4294967295) o.seed = +value.seed;
    for (const k of ["assist", "hints", "god"]) if (typeof value[k] === "boolean") o[k] = value[k];
    return o;
  }
  function persistOptions(value) {
    const opts=sanitize(value); delete opts.god; return opts;
  }
  function restoreOptions(defaults, saved, incoming) {
    return {...defaults,...persistOptions(saved),god:false,...sanitize(incoming)};
  }
  function phaseFor(path, query) {
    if (path.endsWith("uwu-ifrit.html")) return "ifrit";
    if (path.endsWith("uwu-titan.html")) return "titan";
    return ["garuda", "intermission", "ultima"].includes(query.get("phase")) ? query.get("phase") : "garuda";
  }
  function urlFor(phase, opts) {
    const query = new URLSearchParams(phase.url.split("?")[1] || "");
    for (const [k, v] of Object.entries({...sanitize(opts),god:false})) query.set(k, String(v));
    return phase.url.split("?")[0] + "?" + query;
  }
  if (typeof document !== "undefined" && typeof S !== "undefined") {
    const query = new URLSearchParams(location.search);
    let saved = {};
    try { saved = sanitize(JSON.parse(localStorage.getItem(key))); } catch {}
    const incoming = {};
    for (const k of ["role", "speed", "view", "seed"]) if (query.has(k)) incoming[k] = query.get(k);
    for (const k of ["assist", "hints", "god"]) if (["true", "false"].includes(query.get(k))) incoming[k] = query.get(k) === "true";
    Object.assign(S.opts, restoreOptions(S.opts, saved, incoming));
    if (!Number.isInteger(S.opts.seed)) S.opts.seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const current = phaseFor(location.pathname, query), at = phases.findIndex(p => p.id === current);
    const save = () => { try { localStorage.setItem(key, JSON.stringify(persistOptions(S.opts))); } catch {} };
    addEventListener("DOMContentLoaded", () => {
      const sidebar = document.querySelector("aside");
      if (!sidebar) return;
      const nav = document.createElement("nav"); nav.className = "uwu-phase-nav"; nav.setAttribute("aria-label", "絕神兵階段");
      for (const p of phases) {
        const a = document.createElement("a"); a.textContent = p.name; a.href = urlFor(p, S.opts);
        if (p.id === current) a.setAttribute("aria-current", "page");
        a.addEventListener("click", () => { save(); a.href = urlFor(p, S.opts); }); nav.append(a);
      }
      sidebar.insertBefore(nav, sidebar.children[1] || null);
      const controls = document.createElement("div"); controls.className = "uwu-session-controls";
      const label = document.createElement("label"); label.textContent = "排列種子 ";
      const input = document.createElement("input"); input.type = "number"; input.min = "0"; input.max = "4294967295"; input.step = "1"; input.value = S.opts.seed; input.id = "sessionSeed";
      label.append(input); controls.append(label);
      const change = document.createElement("button"); change.type = "button"; change.textContent = "換一組";
      const applySeed = (seed) => { S.opts.seed = seed; input.value = seed; save(); reset(); };
      input.addEventListener("change", () => { if (input.validity.valid && input.value !== "") applySeed(+input.value); else input.value = S.opts.seed; });
      change.addEventListener("click", () => { applySeed(crypto.getRandomValues(new Uint32Array(1))[0]); change.blur(); }); controls.append(change);
      const pause=document.createElement("button");pause.type="button";pause.textContent="暫停 P";
      pause.addEventListener("click",()=>{if(!S.dead&&!S.over&&!S.done)S.paused=!S.paused;pause.blur();});controls.append(pause);
      const singleStep=document.createElement("button");singleStep.type="button";singleStep.textContent="前進 0.1 秒";
      singleStep.addEventListener("click",()=>{advancePaused(S,step);singleStep.blur();});controls.append(singleStep);
      const note = document.createElement("p"); note.className = "note"; note.textContent = "R 重練相同排列。通過後可接下一階段；各階段保留獨立練習判定；切換階段會關閉觀摩免死。";
      controls.append(note); nav.after(controls);
      const next = document.createElement("button"); next.type = "button"; next.className = "uwu-next"; next.hidden = true;
      next.textContent = at < phases.length - 1 ? "繼續 → " + phases[at + 1].name : "全階段完成・回到風神";
      next.addEventListener("click", () => { save(); location.href = urlFor(phases[(at + 1) % phases.length], S.opts); });
      controls.append(next);
      const refresh = () => { document.body.classList.toggle("uwu-paused",!!S.paused&&!S.dead&&!S.over&&!S.done); next.hidden = !(S.done || S.over?.win || S.over?.recordEnd); pause.textContent=S.paused?"繼續 P":"暫停 P"; pause.disabled=!!S.dead||!!S.over||!!S.done;singleStep.disabled=!S.paused||!!S.dead||!!S.over||!!S.done; };
      addEventListener("uwu-phase-complete", refresh);
      setInterval(refresh, 250);
      sidebar.addEventListener("change", save);
      save();
    });
  }
  return { sanitize, phaseFor, urlFor, phases, advancePaused, persistOptions, restoreOptions };
})();
if (typeof module !== "undefined") module.exports = UwuSession;
