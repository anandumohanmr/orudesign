(() => {
  const C = window.WEDDING || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bgm = $("#bgm"), musicBtn = $("#musicBtn"), rainBtn = $("#rainBtn");
  const heroMusic = $("#heroMusic");
  if (heroMusic) heroMusic.addEventListener("click", () => musicBtn.click());
  let rainEnabled = C.rain !== false, musicOn = false;

  /* ---------- music ---------- */
  bgm.src = C.songFile || "audio/song.mp3";
  bgm.volume = 0;
  function fadeTo(v, ms = 2500) {
    const start = bgm.volume, t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / ms);
      bgm.volume = Math.max(0, Math.min(1, start + (v - start) * k));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function playMusic() {
    bgm.play().then(() => { musicOn = true; fadeTo(C.songVolume ?? 0.7); musicBtn.classList.add("on"); musicBtn.innerHTML = '<i class="bi bi-pause-fill"></i>'; })
      .catch(() => { musicOn = false; });
  }
  musicBtn.onclick = () => {
    if (musicOn) { bgm.pause(); musicOn = false; musicBtn.classList.remove("on"); musicBtn.innerHTML = '<i class="bi bi-music-note-beamed"></i>'; }
    else playMusic();
  };
  rainBtn.onclick = () => {
    rainEnabled = !rainEnabled; SFX.rain(rainEnabled); rainBtn.classList.toggle("off", !rainEnabled);
    $("#fx").style.opacity = rainEnabled ? 1 : .55;
  };
  $("#addSong").onclick = () => $("#songFile").click();
  $("#songFile").onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    bgm.src = URL.createObjectURL(f); playMusic();
  };

  /* ---------- temple door intro ---------- */
  const intro = $("#intro");
  $("#openDoor").onclick = () => {
    SFX.resume();
    $(".intro-ui").classList.add("hide");
    SFX.conch();
    setTimeout(() => { SFX.thud(); SFX.creak(4.2); }, 900);
    setTimeout(() => intro.classList.add("open"), 1100);
    setTimeout(() => { SFX.bell(480, 0.35, 6); setTimeout(() => SFX.bell(640, 0.25, 6), 600); }, 3200);
    setTimeout(() => { document.body.classList.remove("locked"); playMusic(); if (rainEnabled) SFX.rain(true); document.body.classList.add("started"); }, 3600);
    setTimeout(() => SFX.chime(), 5000);
    setTimeout(() => intro.classList.add("gone"), 6600);
    setTimeout(() => intro.remove(), 8000);
  };

  /* ---------- countdown ---------- */
  const target = new Date(C.weddingDate || "2026-11-26T12:10:00+05:30").getTime();
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    let d = Math.max(0, target - Date.now());
    $("#cd-d").textContent = pad(Math.floor(d / 864e5)); d %= 864e5;
    $("#cd-h").textContent = pad(Math.floor(d / 36e5)); d %= 36e5;
    $("#cd-m").textContent = pad(Math.floor(d / 6e4)); d %= 6e4;
    $("#cd-s").textContent = pad(Math.floor(d / 1e3));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- reveal + mood (scene) on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.dataset.mood) setMood(e.target.dataset.mood); }
  }), { threshold: .25 });
  $$(".reveal").forEach(el => io.observe(el));
  let mood = "";
  function setMood(m) { if (m === mood) return; mood = m; document.body.dataset.mood = m; if (m === "rain") thunderSoon(); }
  function thunderSoon() {
    setTimeout(() => { if (!rainEnabled) return; const l = $("#lightning"); l.classList.add("flash"); setTimeout(() => l.classList.remove("flash"), 450); setTimeout(() => SFX.thunder(), 500); }, 600);
  }
  $$("#kerala-cinematic").forEach(h => new IntersectionObserver(e => { if (e[0].isIntersecting) { mood = ""; document.body.dataset.mood = "hero"; } }, { threshold: .5 }).observe(h));

  /* ---------- parallax + 3D tilt ---------- */
  const hero = $("#kerala-cinematic"), l = $$(".layer", hero), couple = $("#couple3d .stage");
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  addEventListener("deviceorientation", e => { if (e.gamma == null) return; mx = Math.max(-.5, Math.min(.5, e.gamma / 60)); my = Math.max(-.5, Math.min(.5, (e.beta - 40) / 80)); });
  const sceneContent = $(".hero-content", hero);
  (function loop() {
    tx += (mx - tx) * .06; ty += (my - ty) * .06;
    // Measure scroll relative to the relocated Kerala animation section.
    // Using page scrollY here made the bottom scene fade out before it entered view.
    const sceneTop = hero ? hero.getBoundingClientRect().top : 0;
    const sceneScroll = Math.max(0, -sceneTop);
    l.forEach((el, i) => el.style.transform = `translate3d(${tx * (i + 1) * -14}px, ${sceneScroll * (.03 + i * .02) + ty * (i + 1) * -6}px, 0)`);
    if (couple) couple.style.transform = `rotateY(${tx * 36}deg) rotateX(${ty * -18}deg)`;
    if (sceneContent && hero) {
      sceneContent.style.transform = `translate3d(0, ${sceneScroll * .12}px, 0)`;
      sceneContent.style.opacity = Math.max(0, 1 - sceneScroll / (hero.offsetHeight * .9));
    }
    requestAnimationFrame(loop);
  })();

  $$("[data-tilt]").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });

  /* ---------- weather canvas: rain, splashes, leaves, petals, fireflies ---------- */
  const cv = $("#fx"), cx = cv.getContext("2d");
  let W, H, DPR = Math.min(2, devicePixelRatio || 1);
  function size() { W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; }
  size(); addEventListener("resize", size);
  const small = innerWidth < 700;
  const drops = Array.from({ length: small ? 90 : 190 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 18, v: 14 + Math.random() * 14, a: .15 + Math.random() * .3 }));
  const splashes = [];
  const leaves = Array.from({ length: small ? 14 : 28 }, () => mkLeaf(true));
  const fireflies = Array.from({ length: small ? 10 : 22 }, () => ({ x: Math.random() * W, y: Math.random() * H, p: Math.random() * 6, s: .3 + Math.random() * .6 }));
  function mkLeaf(init) {
    const kind = Math.random() < .35 ? "petal" : "leaf";
    return { x: Math.random() * W, y: init ? Math.random() * H : -40, s: (6 + Math.random() * 10) * DPR, r: Math.random() * 6.28, vr: (Math.random() - .5) * .05,
      vy: (.5 + Math.random() * 1.1) * DPR, sw: Math.random() * 6.28, kind, c: kind === "petal" ? ["#ffb35c", "#ff8a3d", "#fff3d1"][(Math.random() * 3) | 0] : ["#3d7a3a", "#6aa84f", "#a9b84a", "#c28b2c"][(Math.random() * 4) | 0] };
  }
  function drawLeaf(p) {
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = .85;
    cx.beginPath();
    if (p.kind === "petal") { cx.ellipse(0, 0, p.s * .5, p.s * .9, 0, 0, 6.28); }
    else { cx.moveTo(0, -p.s); cx.quadraticCurveTo(p.s, -p.s * .2, 0, p.s); cx.quadraticCurveTo(-p.s, -p.s * .2, 0, -p.s); }
    cx.fill();
    if (p.kind === "leaf") { cx.strokeStyle = "rgba(0,0,0,.25)"; cx.lineWidth = DPR; cx.beginPath(); cx.moveTo(0, -p.s); cx.lineTo(0, p.s); cx.stroke(); }
    cx.restore();
  }
  let t = 0;
  (function frame() {
    cx.clearRect(0, 0, W, H); t += .016;
    const wind = Math.sin(t * .4) * 1.2 + tx * 3;
    if (rainEnabled && C.rain !== false) {
      const heavy = document.body.dataset.mood === "rain" ? 1.6 : 1;
      cx.strokeStyle = "rgba(210,230,255,.55)"; cx.lineWidth = DPR;
      drops.forEach(d => {
        cx.globalAlpha = d.a * (heavy > 1 ? 1.4 : 1); cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x + wind * 2, d.y + d.l * DPR); cx.stroke();
        d.y += d.v * DPR * heavy; d.x += wind * heavy;
        if (d.y > H) { if (Math.random() < .25) splashes.push({ x: d.x, y: H - Math.random() * 30 * DPR, r: 1, a: .5 }); d.y = -20; d.x = Math.random() * W; }
      });
      cx.globalAlpha = 1;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i]; s.r += .6 * DPR; s.a -= .035;
        if (s.a <= 0) { splashes.splice(i, 1); continue; }
        cx.strokeStyle = `rgba(255,255,255,${s.a})`; cx.beginPath(); cx.ellipse(s.x, s.y, s.r * 2, s.r * .7, 0, 0, 6.28); cx.stroke();
      }
    }
    if (C.leaves !== false) leaves.forEach((p, i) => {
      p.sw += .02; p.x += Math.sin(p.sw) * .9 * DPR + wind * .6 * DPR; p.y += p.vy; p.r += p.vr;
      drawLeaf(p); if (p.y > H + 40 || p.x < -60 || p.x > W + 60) leaves[i] = mkLeaf(false);
    });
    if (document.body.dataset.mood === "night" || document.body.dataset.mood === "gold") {
      fireflies.forEach(f => {
        f.p += .03; f.x += Math.cos(f.p) * f.s * DPR; f.y += Math.sin(f.p * 1.3) * f.s * DPR;
        const a = .4 + .6 * Math.abs(Math.sin(f.p * 2)); const g = cx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 14 * DPR);
        g.addColorStop(0, `rgba(255,232,140,${a})`); g.addColorStop(1, "rgba(255,232,140,0)"); cx.fillStyle = g; cx.fillRect(f.x - 14 * DPR, f.y - 14 * DPR, 28 * DPR, 28 * DPR);
      });
    }
    requestAnimationFrame(frame);
  })();

  /* smooth in-page nav */
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const el = $(a.getAttribute("href")); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); } }));
  /* gentle bell when a chapter appears */
  let last = 0;
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && document.body.classList.contains("started") && Date.now() - last > 4000) { last = Date.now(); SFX.chime(); } }), { threshold: .5 }).observe($("#story .chapter:nth-of-type(2)") || document.body);
  $$(".chapter").forEach(c => new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && document.body.classList.contains("started") && Date.now() - last > 6000) { last = Date.now(); SFX.chime(); } }), { threshold: .6 }).observe(c));
})();
