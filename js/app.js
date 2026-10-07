(() => {
  "use strict";
  const C = window.LCLAV;
  const t = (k, v) => I18N.t(k, v);
  const pn = (p) => (I18N.lang === "en" && p.name_en) || p.name;      // product name / description in the current language
  const ptag = (p) => (I18N.lang === "en" && p.tag_en) || p.tag;
  const pd = (p) => (I18N.lang === "en" ? p.desc_en : p.desc) || t("desc.default");
  const ART_W = 2752, ART_H = 1536;      // room art / frames are 16:9 at this size
  const SEQ_END = 0.8;                   // share of the intro scroll used by the walk-in; the rest holds the room
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  // static demo hosts (GitHub Pages) have no form backend: forms show the confirmation and say it's a demo
  const isDemo = isLocal || /\.github\.io$/.test(location.hostname) || C.formsDemo === true;
  const phoneMQ = matchMedia("(max-width: 820px)");
  const isPhone = () => phoneMQ.matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  const pin = $(".pin"), canvas = $("#seq"), ctx = canvas.getContext("2d");
  const room = $("#room"), cam = $(".room-cam"), pan = $(".room-pan"), poster = $("#roomPoster");
  const loops = $$(".room-loop"), stage = $(".room-stage");
  const FW = 1920, FH = 1080;            // the room still, the videos and the masks share this frame
  const enterBtn = $("#enterBtn"), hero = $("#hero"), knockWrap = $(".knock-wrap");
  const DOOR = [0.492, 0.497];            // door centre in the 16:9 walk-in frame (phone frames are a centre crop of it)
  const store = $("#store"), bagEl = $("#bag"), phone = $("#phone");
  const dialog = $("#dialog"), promptEl = $("#prompt");

  let frames = [], lastFrame = -1, progress = 0, inRoom = false, products = null, lenis = null;

  /* ============================================================ loader */
  async function boot() {
    let ti = 0;
    $("#ldTip").textContent = t("tips")[0];
    const tipTimer = setInterval(() => { const tips = t("tips"); $("#ldTip").textContent = tips[++ti % tips.length]; }, 2200);
    let list = [];
    try {
      const url = isPhone() && C.entryManifestMobile ? C.entryManifestMobile : C.entryManifest;
      const m = await (await fetch(url, { cache: "no-cache" })).json();
      const base = url.replace(/[^/]+$/, "");
      list = Array.from({ length: m.count }, (_, i) => base + m.pattern.replace("%04d", String(i + 1).padStart(4, "0")));
    } catch (e) { console.warn("entry manifest missing", e); }
    if (!list.length) list = ["assets/door.webp"];

    // coarse pass first (every 8th frame) so the door is ready fast; the rest streams in after
    const order = [];
    for (const step of [8, 4, 2, 1]) for (let i = 0; i < list.length; i += step) if (!order.includes(i)) order.push(i);
    if (!order.includes(list.length - 1)) order.splice(1, 0, list.length - 1);
    const coarse = order.filter((i) => i % 8 === 0 || i === list.length - 1);
    frames = new Array(list.length);
    let done = 0;
    const total = coarse.length + 1;
    const tick = () => {
      const p = Math.min(100, Math.round((++done / total) * 100));
      $("#ldNum").textContent = String(p).padStart(3, "0");
      $("#ldBar").style.width = p + "%";
    };
    const load = (i) => new Promise((res) => {
      const img = new Image(); img.decoding = "async";
      img.onload = () => { frames[i] = img; res(); };
      img.onerror = () => res();
      img.src = list[i];
    });
    const posterReady = new Promise((res) => { if (poster.complete) res(); else { poster.onload = poster.onerror = () => res(); } });
    await Promise.all(coarse.map((i) => load(i).then(tick)));
    await posterReady; tick();
    clearInterval(tipTimer);
    fit();
    await new Promise((r) => setTimeout(r, 300));
    $("#loader").classList.add("is-out");
    document.body.classList.remove("is-loading");
    enterBtn.disabled = false;
    // fill in the remaining frames, a few at a time
    const rest = order.filter((i) => !coarse.includes(i));
    (async () => { for (let k = 0; k < rest.length; k += 6) await Promise.all(rest.slice(k, k + 6).map(load)); })();
    introAnim();
  }

  /* ============================================================ layout */
  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(pin.clientWidth * dpr);
    canvas.height = Math.round(pin.clientHeight * dpr);
    lastFrame = -1; draw(true);
    placeKnock();
    layoutRoom();
  }
  // the knock button sits on the door wherever the cover-fit puts it
  function placeKnock() {
    const img = frames.find(Boolean);
    if (!img) return;
    const fw = img.naturalWidth, fh = img.naturalHeight;
    const fx = fw < fh ? (DOOR[0] * 1920 - (1920 - fw) / 2) / fw : DOOR[0];
    const W = pin.clientWidth, H = pin.clientHeight, s = Math.max(W / fw, H / fh);
    knockWrap.style.setProperty("--door-x", fx * fw * s + (W - fw * s) / 2 + "px");
    knockWrap.style.setProperty("--door-y", DOOR[1] * fh * s + (H - fh * s) / 2 + "px");
  }
  function layoutRoom() {
    const W = pan.clientWidth, H = pan.clientHeight, s = Math.max(W / FW, H / FH);
    const sw = FW * s, sh = FH * s;
    stage.style.setProperty("--st-w", sw + "px"); stage.style.setProperty("--st-h", sh + "px");
    stage.style.setProperty("--st-x", (W - sw) / 2 + "px"); stage.style.setProperty("--st-y", (H - sh) / 2 + "px");
    clampPan();
  }
  function draw(force) {
    if (!frames.length) return;
    const i = Math.min(frames.length - 1, Math.round(Math.min(1, progress / SEQ_END) * (frames.length - 1)));
    if (i === lastFrame && !force) return;
    let img = frames[i];
    for (let d = 1; !img && d < frames.length; d++) img = frames[i - d] || frames[i + d];   // nearest loaded
    if (!img) return;
    lastFrame = frames[i] ? i : -1;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  /* ============================================================ scroll */
  function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    ScrollTrigger.create({ trigger: "#intro", start: "top top", end: "bottom bottom", onUpdate: (self) => { progress = self.progress; onProgress(); } });
    $$(".reveal").forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
  }
  function onProgress() {
    draw();
    const p = progress;
    const h = Math.max(0, 1 - p / 0.035);
    hero.style.opacity = h;
    hero.style.visibility = h < 0.02 ? "hidden" : "visible";   // hidden hero must not catch taps
    if (p > 0.25) preloadRoom();
    const want = p >= SEQ_END - 0.004;
    if (want !== inRoom) want ? enterRoom() : leaveRoom();
  }
  function scrollToRoom(duration) {
    const intro = $("#intro");
    const y = intro.offsetTop + (intro.offsetHeight - innerHeight) * SEQ_END + 2;
    preloadRoom();
    if (lenis) lenis.scrollTo(y, { duration, easing: (t) => -(Math.cos(Math.PI * t) - 1) / 2 }); else window.scrollTo({ top: y, behavior: "smooth" });
  }
  function scrollToTop() {
    closeAllLayers();
    if (lenis) lenis.scrollTo(0, { duration: 2.2 }); else window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function introAnim() {
    gsap.from(".hero-title span", { yPercent: 30, opacity: 0, duration: 1.6, ease: "power4.out", stagger: .12, delay: .3 });
    gsap.from([".knock-wrap", "#hero .scroll-hint"], { opacity: 0, duration: 1.1, ease: "power2.out", stagger: .15, delay: .7 });
    gsap.from("#enterBtn", { scale: .6, duration: 1.1, ease: "back.out(1.6)", delay: .7, clearProps: "transform" });
    gsap.from("#nav", { y: -30, opacity: 0, duration: 1, ease: "power3.out", delay: .5 });
  }

  /* ============================================================ room */
  function enterRoom() {
    inRoom = true;
    room.classList.add("is-on");
    pin.classList.add("room-mode");
    playRoom();
    preloadTransitions();
    look.cx = C.mobilePan[0]; clampPan(); startDrift(0.4);
    if (!enterRoom.greeted) {
      enterRoom.greeted = true;
      pin.classList.add("room-intro");
      setTimeout(() => pin.classList.remove("room-intro"), 3200);
      if (!isPhone()) setTimeout(() => { if (inRoom && !layers.length && !dived) talk("hola"); }, 1600);
    }
  }
  function leaveRoom() {
    inRoom = false;
    room.classList.remove("is-on");
    pin.classList.remove("room-mode");
    pauseRoom();
    stopDrift();
    dialog.hidden = true; promptEl.hidden = true;
    gsap.set(cam, { clearProps: "transform" });
  }

  // Room loop: at the loop point a second copy starts and crossfades in, so the restart can't be seen
  // (and Safari's own loop hiccup never happens).
  let cur = 0, fading = false;
  const XF = 0.8;
  function preloadRoom() {
    if (preloadRoom.done || !C.roomLoop) return;
    preloadRoom.done = true;
    loops.forEach((v) => {
      v.src = C.roomLoop; v.preload = "auto"; v.load();
      v.addEventListener("timeupdate", () => checkLoop(v));
    });
  }
  function checkLoop(v) {
    if (v !== loops[cur] || fading || !v.duration || v.duration - v.currentTime > XF) return;
    fading = true;
    const nxt = loops[1 - cur];
    nxt.currentTime = 0;
    nxt.play().then(() => {
      gsap.fromTo(nxt, { opacity: 0 }, { opacity: 1, duration: XF * .9, ease: "none", onComplete: () => {
        v.pause(); gsap.set(v, { opacity: 0 }); cur = 1 - cur; fading = false;
      } });
    }).catch(() => { fading = false; });
  }
  function playRoom() {
    preloadRoom();
    const v = loops[cur];
    v.play().then(() => { gsap.set(v, { opacity: 1 }); }).catch(() => {});
  }
  function pauseRoom() { loops.forEach((v) => v.pause()); }
  function restartRoom() {
    gsap.killTweensOf(loops); fading = false;
    gsap.set(loops[1 - cur], { opacity: 0 }); loops[1 - cur].pause();
    const v = loops[cur]; v.currentTime = 0; gsap.set(v, { opacity: 1 }); v.play().catch(() => {});
  }

  // camera moves into a rack (real Seedance clips), then back out
  const tIn = $("#transIn"), tBack = $("#transBack");
  let inRack = null;
  const warm = {};
  function preloadTransitions() {
    if (preloadTransitions.done || !C.transitions) return;
    preloadTransitions.done = true;
    const srcs = [...new Set(Object.values(C.transitions).map((t) => t.in))];
    srcs.forEach((src, i) => setTimeout(() => {          // keep a hidden video per clip so the browser caches it
      const v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = src; warm[src] = v;
    }, 2500 + i * 2500));
  }
  const shift = () => (isPhone() ? 0 : -0.3 * pan.clientWidth);   // desktop: slide the rack left of the shop panel
  function playThrough(v, src) {
    return new Promise((res) => {
      if (!v.src.endsWith(src)) v.src = src;
      v.currentTime = 0;
      v.playbackRate = C.transitionRate || 1;
      v.onended = () => { v.onended = null; res(); };
      v.play().catch(() => res());
    });
  }
  async function rackIn(kind) {
    const t = C.transitions && C.transitions[kind];
    if (!t || !inRoom) return false;
    inRack = kind; dived = true; stopDrift();
    dialog.hidden = true; promptEl.hidden = true;
    pin.classList.add("is-diving");
    if (isPhone()) gsap.to(look, { cx: ART_W / 2, duration: .5, ease: "power2.out", onUpdate: clampPan });
    gsap.set(tIn, { x: 0 });
    const nudge = gsap.to(cam, { scale: 1.04, transformOrigin: "60% 45%", duration: 1.2, ease: "power2.out" });  // instant feedback
    const done = playThrough(tIn, t.in);
    await new Promise((r) => (tIn.readyState >= 2 ? r() : tIn.addEventListener("playing", r, { once: true })));
    nudge.kill(); gsap.set(cam, { clearProps: "transform" });
    tIn.classList.add("is-on");
    pauseRoom();
    gsap.to(tIn, { x: shift(), duration: 1.1, delay: Math.max(0, (tIn.duration || 4) / (C.transitionRate || 1) - 1.3), ease: "power2.inOut" });
    tBack.src = t.back; tBack.preload = "auto"; tBack.load();
    await done;
    return true;
  }
  async function rackOut() {
    const kind = inRack; inRack = null;
    const t = C.transitions[kind];
    gsap.set(tBack, { x: gsap.getProperty(tIn, "x") });
    const done = playThrough(tBack, t.back);
    await new Promise((r) => (tBack.readyState >= 2 ? r() : tBack.addEventListener("playing", r, { once: true })));
    tBack.classList.add("is-on"); tIn.classList.remove("is-on");
    gsap.to(tBack, { x: 0, duration: 1, ease: "power2.inOut" });
    await done;
    restartRoom();
    await new Promise((r) => setTimeout(r, 60));
    tBack.classList.remove("is-on");
    pin.classList.remove("is-diving");
    dived = false;
    startDrift(1.5);
  }

  // art coordinates → .room-pan box (object-fit: cover)
  function artToBox(x, y) {
    const W = pan.clientWidth, H = pan.clientHeight;
    const s = Math.max(W / ART_W, H / ART_H);
    return { x: x * s + (W - ART_W * s) / 2, y: y * s + (H - ART_H * s) / 2 };
  }
  function buildHotspots() {
    const svg = $("#hotspots"), blips = $("#blips"), NS = "http://www.w3.org/2000/svg";
    C.hotspots.forEach((h) => {
      const poly = document.createElementNS(NS, "polygon");
      poly.setAttribute("points", h.points); poly.setAttribute("class", "hs");
      poly.setAttribute("tabindex", "0"); poly.setAttribute("role", "button"); poly.id = "hs-" + h.id;
      svg.appendChild(poly);
      const b = document.createElement("div");
      b.className = "blip" + (h.anchor[0] > ART_W * .66 ? " is-left" : "");
      b.id = "blip-" + h.id;
      b.innerHTML = `<span class="bd"></span><span class="bl"></span>`;
      b.style.setProperty("--bx", h.anchor[0] / ART_W); b.style.setProperty("--by", h.anchor[1] / ART_H);
      blips.appendChild(b);
      const on = (v) => {
        b.classList.toggle("is-on", v);
        promptEl.hidden = !v;
        if (v) { promptEl.querySelector("kbd").textContent = h.key; promptEl.querySelector("span").textContent = hsLabel(h); }
      };
      // the label and dot are clickable too, so what you point at is what you get
      [poly, b].forEach((el) => {
        el.addEventListener("mouseenter", () => on(true));
        el.addEventListener("mouseleave", () => on(false));
        el.addEventListener("click", () => open(h.open, h));
      });
      poly.addEventListener("focus", () => on(true));
      poly.addEventListener("blur", () => on(false));
      poly.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(h.open, h); } });
    });
    labelHotspots();
  }
  const hsLabel = (h) => { const v = t("hs." + h.id); return v === "hs." + h.id ? h.label : v; };
  function labelHotspots() {
    C.hotspots.forEach((h) => {
      $("#hs-" + h.id).setAttribute("aria-label", hsLabel(h));
      $(`#blip-${h.id} .bl`).innerHTML = `<kbd>${h.key}</kbd>${hsLabel(h)}`;
    });
  }


  // phones: the full-screen room is wider than the screen; the camera drifts and can be dragged
  const look = { cx: ART_W / 2 };            // art x at the centre of the screen
  let resumeT = 0;
  function panScale() { return pan.clientHeight / ART_H; }
  function clampPan() {
    if (!isPhone()) { pan.style.removeProperty("--pan"); return; }
    const s = panScale(), half = innerWidth / 2 / s;
    look.cx = Math.max(half, Math.min(ART_W - half, look.cx));
    pan.style.setProperty("--pan", ((ART_W / 2 - look.cx) * s).toFixed(1) + "px");
  }
  // the camera follows the loop: on Nily while she smokes, over to the racks while she's still, back for the
  // sandal moment. (loop time → art x of the screen centre)
  const CAM = [[0, 0], [9.5, 0], [11.8, 1], [14, 1], [16, 0], [99, 0]];
  let autoCam = false;
  function camAt(t) {
    for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
      const [t0, a] = CAM[i - 1], [t1, b] = CAM[i], k = (t - t0) / (t1 - t0 || 1);
      return a + (b - a) * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    }
    return 0;
  }
  function startDrift(delay = 0) {
    if (!isPhone() || !inRoom) return;
    clearTimeout(startDrift.t);
    startDrift.t = setTimeout(() => { autoCam = true; }, delay * 1000);
  }
  gsap.ticker.add(() => {
    if (!autoCam || !isPhone() || !inRoom) return;
    const v = loops[cur]; if (!v || !v.duration) return;
    const [a, b] = C.mobilePan;
    const target = a + (b - a) * camAt(v.currentTime);
    look.cx += (target - look.cx) * .08;
    clampPan();
  });
  function stopDrift() { autoCam = false; clearTimeout(startDrift.t); }
  (() => {
    let sx = 0, sy = 0, startCx = 0, dragging = false, moved = false;
    room.addEventListener("pointerdown", (e) => { if (!isPhone()) return; sx = e.clientX; sy = e.clientY; startCx = look.cx; dragging = true; moved = false; });
    room.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { moved = true; stopDrift(); }
      if (moved) { look.cx = startCx - dx / panScale(); clampPan(); }
    });
    const end = () => {
      if (!dragging) return; dragging = false;
      if (moved) { clearTimeout(resumeT); resumeT = setTimeout(() => startDrift(0), 4000); }
    };
    window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
    room.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  })();
  // keep every label inside the screen: hide the ones that drift off, flip the ones near the right edge
  gsap.ticker.add(() => {
    if (!isPhone() || !inRoom) return;
    const W = innerWidth;
    $$(".blip").forEach((b) => {
      const r = b.querySelector(".bd").getBoundingClientRect(), x = r.left + r.width / 2;
      b.classList.toggle("is-off", x < 26 || x > W - 26);
      b.classList.toggle("is-left", x > W * 0.55);
    });
  });

  // "go into" a rack: the camera pushes in on it before the shop opens
  let dived = false;
  function dive(h) {
    const dot = $(`#blip-${h.id} .bd`);
    if (!dot || !inRoom) return Promise.resolve();
    gsap.set(cam, { clearProps: "transform" });
    const b = dot.getBoundingClientRect(), r = cam.getBoundingClientRect();
    const ax = b.left + b.width / 2 - r.left, ay = b.top + b.height / 2 - r.top;
    const S = isPhone() ? 2.3 : 2.1;
    const tx = (isPhone() ? r.width / 2 : r.width * 0.19) - S * ax;
    const ty = r.height / 2 - S * ay;
    dived = true;
    stopDrift();
    pin.classList.add("is-diving");
    dialog.hidden = true; promptEl.hidden = true;
    return new Promise((res) => gsap.to(cam, { x: tx, y: ty, scale: S, duration: .85, ease: "power3.inOut", onComplete: res }));
  }
  function undive() {
    if (!dived) return;
    dived = false;
    pin.classList.remove("is-diving");
    gsap.to(cam, { x: 0, y: 0, scale: 1, duration: .8, ease: "power3.inOut", onComplete: () => startDrift(1.5) });
  }

  /* ============================================================ Nily */
  const LINES = {
    hola: { text: "nily.hola", opts: [["opt.tops", "tops"], ["opt.bottoms", "bottoms"], ["opt.special", "especiales"], ["opt.book", "cita"]] },
    nily: { text: "nily.again", opts: [["opt.seeTops", "tops"], ["opt.seeBottoms", "bottoms"], ["opt.request", "pedido"], ["opt.book", "cita"]] }
  };
  let lastTalk = null;
  function talk(key) {
    lastTalk = key;
    const l = { text: t(LINES[key].text), opts: LINES[key].opts.map(([k, o]) => [t(k), o]) };
    if (isPhone()) {
      $("#ctrlLine").textContent = l.text;
      gsap.fromTo("#ctrlLine", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4 });
      return;
    }
    $("#dlText").textContent = l.text;
    $("#dlOpts").innerHTML = l.opts.map(([t, k], i) => `<button data-open="${k}"><kbd>${i + 1}</kbd>${t}</button>`).join("");
    dialog.hidden = false;
  }

  /* ============================================================ layers + back button */
  // Every overlay is a layer with a history entry, so the phone's back button closes it.
  const layers = [];
  function pushLayer(name, close) {
    layers.push({ name, close });
    history.pushState({ depth: layers.length }, "", "#" + name);
    syncLock();
  }
  function popLayer() { const l = layers.pop(); if (l) l.close(); syncLock(); }
  window.addEventListener("popstate", (e) => {
    const depth = (e.state && e.state.depth) || 0;
    while (layers.length > depth) popLayer();
  });
  const back = () => { if (layers.length) history.back(); };
  function closeAllLayers() { if (layers.length) history.go(-layers.length); closeMenu(); dialog.hidden = true; }
  function syncLock() {
    const v = layers.length > 0;
    document.body.classList.toggle("is-locked", v);
    if (lenis) v ? lenis.stop() : lenis.start();
  }
  // a deep link like /#tienda/tops would otherwise leave a dead hash on reload
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);

  /* ============================================================ open anything */
  const hotspotById = (id) => C.hotspots.find((h) => h.id === id);
  function open(kind, h) {
    closeMenu();
    dialog.hidden = true;
    if (kind === "top") return scrollToTop();
    if (kind === "nily") { if (!inRoom) scrollToRoom(1.6); return talk("nily"); }
    if (kind === "billar") return toast(t("pool"));
    if (kind === "cita" || kind === "pedido") return openPhone(kind);
    if (["tops", "bottoms", "especiales"].includes(kind)) return openStore(kind, h || hotspotById(kind));
  }

  /* ============================================================ store */
  const catTitle = (c) => t("cat." + c);
  const ICON = {
    tops: '<path d="M22 8 32 14 42 8 56 16 50 28 44 25V56H20V25L14 28 8 16Z"/>',
    bottoms: '<path d="M18 6H46L50 58H37L32 24 27 58H14Z"/><path d="M18 13H46"/>',
    especiales: '<path d="M32 6 39 24 58 25 43 37 48 56 32 45 16 56 21 37 6 25 25 24Z"/>'
  };
  const art = (cat) => `<div class="ph-art"><svg viewBox="0 0 64 64">${ICON[cat]}</svg>${t("photoSoon")}</div>`;
  const imgOf = (p) => p.image || (p.images && p.images[0]) || "";
  const price = (p) => (p.price == null ? t("ask") : `$${p.price}`);
  let cat = "tops", sizeFilter = "";

  async function getProducts() {
    if (!products) products = await (await fetch("data/products.json?v=7")).json();
    return products;
  }
  async function openStore(kind, h) {
    await getProducts();
    if (store.hidden) {
      if (inRoom && !(await rackIn(kind)) && h) await dive(h);
      pin.classList.add("is-shopping");
      dialog.hidden = true; promptEl.hidden = true;
      store.hidden = false;
      pushLayer("tienda/" + kind, closeStore);
    }
    setCat(kind);
  }
  function closeStore() {
    store.hidden = true;
    $("#stPdp").hidden = true; $("#stList").hidden = false;
    pin.classList.remove("is-shopping");
    if (inRack) rackOut(); else undive();
  }
  function setCat(kind) {
    cat = kind; sizeFilter = "";
    $$(".st-tabs [data-cat]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.cat === kind)));
    $("#stTitle").textContent = catTitle(kind);
    if (layers.length && layers[layers.length - 1].name.startsWith("tienda/")) history.replaceState(history.state, "", "#tienda/" + kind);
    renderList();
    $("#stScroll").scrollTop = 0;
  }
  function renderList() {
    const all = products[cat] || [];
    const sizes = [...new Set(all.flatMap((p) => p.sizes))];
    const list = sizeFilter ? all.filter((p) => p.sizes.includes(sizeFilter)) : all;
    $("#stPdp").hidden = true;
    const el = $("#stList"); el.hidden = false;
    el.innerHTML = `
      <div class="st-filters" role="group" aria-label="${t("filterBy")}">
        <span class="lbl">${t("size")}</span>
        <button aria-pressed="${!sizeFilter}" data-size="">${t("all")}</button>
        ${sizes.map((s) => `<button aria-pressed="${s === sizeFilter}" data-size="${s}">${s}</button>`).join("")}
      </div>
      <p class="st-count">${list.length} ${list.length === 1 ? t("piece") : t("pieces")}</p>
      ${list.length ? `<div class="st-grid">${list.map(card).join("")}</div>` : `<p class="st-empty">${t("empty")}</p>`}
      <div class="st-help"><span>${t("help")}</span><button class="btn ghost" data-open="pedido">${t("askNily")}</button></div>`;
    $$(".st-filters button", el).forEach((b) => b.addEventListener("click", () => { sizeFilter = b.dataset.size; renderList(); }));
    $$(".card", el).forEach((c) => c.addEventListener("click", () => openPdp(c.dataset.id)));
  }
  function card(p) {
    const img = imgOf(p);
    return `<button class="card" data-id="${p.id}">
      <div class="card-img">${img ? `<img src="${img}" alt="${pn(p)}" loading="lazy">` : art(cat)}${p.tag ? `<span class="card-tag">${ptag(p)}</span>` : ""}</div>
      <div><p class="card-name">${pn(p)}</p><p class="card-meta"><span>${price(p)}</span><span>${p.sizes.join(" · ")}</span></p></div>
    </button>`;
  }
  function openPdp(id) {
    const p = products[cat].find((x) => x.id === id);
    const listScroll = $("#stScroll").scrollTop;
    let size = p.sizes.length === 1 ? p.sizes[0] : "";
    const img = imgOf(p);
    const el = $("#stPdp");
    const again = openPdp.current === id && !el.hidden;     // re-render in place (language switch)
    el.innerHTML = `<div class="pdp">
      <div class="pdp-img">${img ? `<img src="${img}" alt="${pn(p)}">` : art(cat)}${p.tag ? `<span class="card-tag">${ptag(p)}</span>` : ""}</div>
      <div class="pdp-info">
        <p class="eyebrow">${catTitle(cat)}</p>
        <h3>${pn(p)}</h3>
        <p class="pdp-price">${price(p)}</p>
        <p class="pdp-desc">${pd(p)}</p>
        <div class="pdp-lbl"><span>${t("size")}</span><em id="sizeHint">${size ? "" : t("pickSize")}</em></div>
        <div class="pdp-sizes" role="group" aria-label="${t("size")}">${p.sizes.map((s) => `<button type="button" aria-pressed="${s === size}">${s}</button>`).join("")}</div>
        <div class="pdp-actions">
          <button class="btn" id="addBag">${t("addBag")}</button>
          <button class="btn ghost" id="tryOn">${t("tryOn")}</button>
          ${C.whatsapp ? `<a class="btn ghost" target="_blank" rel="noopener" href="${wa(t("waInterest", { p: pn(p) }))}">${t("askWa")}</a>` : ""}
        </div>
        <div class="pdp-acc">
          <details><summary>${t("acc.howT")}</summary><p>${t("acc.howP")}</p></details>
          <details><summary>${t("acc.sizeT")}</summary><p>${t("acc.sizeP")}</p></details>
        </div>
      </div></div>`;
    $$(".pdp-sizes button", el).forEach((b) => b.addEventListener("click", () => {
      $$(".pdp-sizes button", el).forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true"); size = b.textContent; $("#sizeHint").textContent = "";
    }));
    let added = false;
    $("#addBag", el).addEventListener("click", () => {
      if (added) return openBag();
      if (!size) {
        $("#sizeHint").textContent = t("pickSizeFirst");
        $(".pdp-lbl", el).scrollIntoView({ behavior: "smooth", block: "center" });
        gsap.fromTo(".pdp-sizes", { x: -6 }, { x: 0, duration: .4, ease: "elastic.out(1,.3)" });
        return;
      }
      addToBag({ id: p.id, cat, size });
      added = true;
      $("#addBag", el).textContent = t("viewBag");
    });
    $("#tryOn", el).addEventListener("click", () => openPhone("cita", { mensaje: t("tryOnMsg", { p: pn(p) }) + (size ? t("tryOnSize", { s: size }) : "") }));
    if (again) return;
    $("#stList").hidden = true; el.hidden = false;
    $("#stScroll").scrollTop = 0;
    openPdp.current = id;
    pushLayer(`tienda/${cat}/${p.id}`, () => { openPdp.current = null; el.hidden = true; $("#stList").hidden = false; $("#stScroll").scrollTop = listScroll; });
  }
  $$(".st-tabs [data-cat]").forEach((b) => b.addEventListener("click", () => {
    if (!$("#stPdp").hidden) history.back();     // leave the product page first
    setCat(b.dataset.cat);
  }));

  /* ============================================================ bag */
  const BAG_KEY = "lclav_bag";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(BAG_KEY) || "[]"); } catch { bag = []; }
  const saveBag = () => { try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch {} updateBadges(); };
  function updateBadges(pop) {
    $$(".bag-n").forEach((n) => {
      n.textContent = bag.length; n.hidden = !bag.length;
      if (pop) { n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop"); }
    });
  }
  function addToBag(item) {
    if (!bag.some((b) => b.id === item.id && b.size === item.size)) bag.push(item);
    saveBag(); updateBadges(true);
    toast(t("added"));
  }
  const findP = (b) => (products && products[b.cat] || []).find((p) => p.id === b.id);
  async function openBag() {
    await getProducts();
    renderBag();
    if (bagEl.hidden) { bagEl.hidden = false; pushLayer("bolsa", () => { bagEl.hidden = true; }); }
  }
  function renderBag() {
    const body = $("#bagBody");
    if (!bag.length) {
      body.innerHTML = `<div class="bag-empty"><p>${t("bagEmpty")}</p><button class="btn" data-open="tops">${t("seeTops")}</button></div>`;
      return;
    }
    body.innerHTML = bag.map((b, i) => {
      const p = findP(b) || { name: b.id };
      const img = imgOf(p);
      return `<div class="bag-item"><div class="bag-thumb">${img ? `<img src="${img}" alt="">` : `<svg viewBox="0 0 64 64">${ICON[b.cat]}</svg>`}</div>
        <div><b>${pn(p)}</b><span>${t("size")} ${b.size} · ${price(p)}</span></div>
        <button class="bag-rm" data-rm="${i}" aria-label="${t("remove")} ${pn(p)}">✕</button></div>`;
    }).join("") + `
      <form class="form bag-form" name="apartado" data-form="apartado">
        <input type="hidden" name="form-name" value="apartado"><p hidden><input name="bot-field"></p>
        <label>${t("f.name")}<input name="nombre" required autocomplete="name"></label>
        <label>${t("f.contact")}<input name="contacto" required inputmode="tel" autocomplete="tel"></label>
        <div class="seg" role="radiogroup" aria-label="${t("f.how")}">
          <label><input type="radio" name="modo" value="Probármelo en el cuarto" checked><span>${t("f.tryRoom")}</span></label>
          <label><input type="radio" name="modo" value="Recoger"><span>${t("f.pickup")}</span></label>
        </div>
        <div class="form-row-cita" style="display:grid;gap:12px">
          <label>${t("f.day")}<input type="date" name="fecha" min="${today()}"></label>
          <label>${t("f.time")}<select name="hora">${C.citaHoras.map((h) => `<option>${h}</option>`).join("")}</select></label>
        </div>
        <label>${t("f.note")}<textarea name="nota" placeholder="${t("f.notePh")}"></textarea></label>
        <input type="hidden" name="piezas" value="">
        <input type="hidden" name="idioma" value="${I18N.lang}">
        <button class="btn" type="submit">${bag.length === 1 ? t("f.reserve1") : t("f.reserveN", { n: bag.length })}</button>
      </form>`;
    $$("[data-rm]", body).forEach((b) => b.addEventListener("click", () => { bag.splice(+b.dataset.rm, 1); saveBag(); renderBag(); }));
    const f = $("form", body);
    const cita = $(".form-row-cita", f);
    $$("input[name=modo]", f).forEach((r) => r.addEventListener("change", () => { cita.style.display = r.value === "Recoger" && r.checked ? "none" : "grid"; }));
    f.piezas.value = bag.map((b) => { const p = findP(b); return `${p ? p.name : b.id} (talla ${b.size})`; }).join("\n");   // Nily reads Spanish
    f.addEventListener("submit", (e) => submit(e, () => {
      bag = []; saveBag();
      const ok = $(".ok", body); body.innerHTML = ""; body.appendChild(ok);   // only the confirmation stays
    }));
  }

  /* ============================================================ phone (cita / pedido) */
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wa = (text) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  function openPhone(kind, pre = {}) {
    openPhone.current = kind;
    $("#phTitle").textContent = kind === "cita" ? t("ph.book") : t("ph.request");
    $("#phClock").textContent = new Date().toLocaleTimeString(I18N.lang === "en" ? "en-US" : "es-US", { hour: "numeric", minute: "2-digit" });
    $("#phBody").innerHTML = kind === "cita" ? `
      <p class="ph-lead">${t("ph.bookLead")}</p>
      <form class="form" name="cita" data-form="cita">
        <input type="hidden" name="form-name" value="cita"><p hidden><input name="bot-field"></p>
        <input type="hidden" name="idioma" value="${I18N.lang}">
        <label>${t("f.name")}<input name="nombre" required autocomplete="name"></label>
        <label>${t("f.contact")}<input name="contacto" required inputmode="tel" autocomplete="tel"></label>
        <label>${t("f.day")}<input type="date" name="fecha" required min="${today()}"></label>
        <label>${t("f.time")}<select name="hora" required>${C.citaHoras.map((h) => `<option>${h}</option>`).join("")}</select></label>
        <label>${t("f.lookingFor")}<textarea name="mensaje" placeholder="${t("f.lookingPh")}">${esc(pre.mensaje)}</textarea></label>
        <button class="btn" type="submit">${t("f.book")}</button>
      </form>` : `
      <p class="ph-lead">${t("ph.requestLead")}</p>
      <form class="form" name="pedido" data-form="pedido">
        <input type="hidden" name="form-name" value="pedido"><p hidden><input name="bot-field"></p>
        <input type="hidden" name="idioma" value="${I18N.lang}">
        <label>${t("f.name")}<input name="nombre" required autocomplete="name"></label>
        <label>${t("f.contact")}<input name="contacto" required inputmode="tel" autocomplete="tel"></label>
        <label>${t("f.piece")}<input name="pieza" value="${esc(pre.pieza)}" placeholder="${t("f.piecePh")}"></label>
        <label>${t("size")}<input name="talla" value="${esc(pre.talla)}" placeholder="${t("f.sizePh")}"></label>
        <label>${t("f.budget")}<input name="presupuesto" placeholder="${t("f.budgetPh")}"></label>
        <label>${t("f.msg")}<textarea name="mensaje" required placeholder="${t("f.msgPh")}"></textarea></label>
        <button class="btn" type="submit">${t("f.send")}</button>
      </form>`;
    $("#phBody form").addEventListener("submit", (e) => submit(e));
    if (phone.hidden) { phone.hidden = false; pushLayer(kind, () => { phone.hidden = true; }); }
  }
  async function submit(e, after) {
    e.preventDefault();
    const f = e.currentTarget, btn = $("button[type=submit]", f);
    btn.disabled = true;
    const data = new FormData(f);
    let ok = true;
    if (!isDemo) {
      try {
        const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() });
        ok = r.ok;
      } catch { ok = false; }
    }
    if (!ok) { btn.disabled = false; return toast(t("sendFail")); }
    const summary = [...data.entries()].filter(([k, v]) => v && !["form-name", "bot-field"].includes(k)).map(([k, v]) => `${k}: ${v}`).join("\n");
    const msg = t("sent." + f.dataset.form);
    f.outerHTML = `<div class="ok"><div class="big-ok">${t("sent")}</div><p>${msg}</p>${isDemo ? `<p class="demo-note">${t("sent.demo")}</p>` : ""}
      ${C.whatsapp ? `<a class="btn ghost" target="_blank" rel="noopener" href="${wa(summary)}">${t("sent.wa")}</a>` : ""}</div>`;
    if (after) after();
  }

  /* ============================================================ menu, keys, misc */
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", (e) => { e.stopPropagation(); const s = menu.hidden; menu.hidden = !s; menuBtn.setAttribute("aria-expanded", String(s)); });

  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) {
      e.preventDefault();
      // from inside an overlay, leave it first, then open the new thing
      if (o.closest("#bag, #phone") && ["tops", "bottoms", "especiales"].includes(o.dataset.open) && !store.hidden) { back(); setCat(o.dataset.open); return; }
      if (o.closest("#bag") && o.dataset.open === "tops") { back(); setTimeout(() => open("tops"), 50); return; }
      open(o.dataset.open); return;
    }
    if (e.target.closest("[data-lang]")) { e.preventDefault(); closeMenu(); I18N.set(I18N.lang === "es" ? "en" : "es"); return; }
    if (e.target.closest("[data-bag]")) { e.preventDefault(); closeMenu(); openBag(); return; }
    if (e.target.closest("[data-go=top]")) { e.preventDefault(); closeMenu(); scrollToTop(); return; }
    if (e.target.closest("[data-back]")) { e.preventDefault(); back(); return; }
    if (!menu.hidden && !e.target.closest("#menu")) closeMenu();
    if (!dialog.hidden && !e.target.closest("#dialog, .hs")) dialog.hidden = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) { if (e.key === "Escape") back(); return; }
    const k = e.key.toLowerCase();
    if (k === "escape") { if (!menu.hidden) return closeMenu(); if (!dialog.hidden) { dialog.hidden = true; return; } return back(); }
    if (layers.length) return;
    if (!inRoom && k === "enter" && progress < .02 && !enterBtn.disabled) { e.preventDefault(); return knock(); }
    if (!dialog.hidden && /^[1-4]$/.test(k)) { const b = $$("#dlOpts button")[+k - 1]; if (b) b.click(); return; }
    const map = { t: "tops", b: "bottoms", p: "especiales", c: "cita", m: "pedido", e: "nily", 8: "billar" };
    if (map[k] && (inRoom || ["c", "m"].includes(k))) { e.preventDefault(); open(map[k], hotspotById(map[k])); }
  });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }

  // desktop: idle camera sway + custom cursor
  if (finePointer) {
    let tx = 0, ty = 0, cx = 0, cy = 0, mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my;
    const cur = document.createElement("div"); cur.id = "cursor"; document.body.appendChild(cur);
    document.documentElement.classList.add("has-cursor");
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      tx = (e.clientX / innerWidth - .5) * -18; ty = (e.clientY / innerHeight - .5) * -10;
      cur.classList.toggle("is-hot", !!e.target.closest("button, a, .hs, input, select, textarea, summary, label"));
    });
    gsap.ticker.add(() => {
      if (!inRoom || dived || isPhone()) { tx = ty = 0; }
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      room.style.transform = isPhone() ? "" : `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(1.03)`;
      x += (mx - x) * .25; y += (my - y) * .25;
      cur.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  const links = [];
  if (C.instagram) links.push(`<a href="https://instagram.com/${C.instagram}" target="_blank" rel="noopener">Instagram</a>`);
  if (C.whatsapp) links.push(`<a href="${wa(t("waHello"))}" target="_blank" rel="noopener">WhatsApp</a>`);
  $("#footLinks").innerHTML = links.join("");

  // knock knock, then the door opens
  let knocking = false;
  function knock() {
    if (knocking) return;
    knocking = true;
    enterBtn.classList.remove("is-knocking"); void enterBtn.offsetWidth; enterBtn.classList.add("is-knocking");
    preloadRoom();
    setTimeout(() => { knocking = false; enterBtn.classList.remove("is-knocking"); scrollToRoom(C.enterSeconds); }, 520);
  }
  enterBtn.addEventListener("click", knock);

  // language switch: static text is redone by I18N.apply; redraw whatever is open
  window.addEventListener("langchange", () => {
    labelHotspots();
    if (lastTalk) { if (isPhone()) $("#ctrlLine").textContent = t(LINES[lastTalk].text); else if (!dialog.hidden) talk(lastTalk); }
    if (!store.hidden) {
      $("#stTitle").textContent = catTitle(cat);
      renderList();                 // (hides the product page; put it back and redraw it in place)
      if (openPdp.current) { $("#stList").hidden = true; $("#stPdp").hidden = false; openPdp(openPdp.current); }
    }
    if (!bagEl.hidden) renderBag();
    if (!phone.hidden && openPhone.current) openPhone(openPhone.current);
  });
  window.addEventListener("resize", fit);
  buildHotspots();
  setupScroll();
  updateBadges();
  fit();
  boot();
})();
