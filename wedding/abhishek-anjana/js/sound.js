/* Synthesised sound effects (no files needed): door creak, temple bell, rain, thunder, wind chime */
const SFX = (() => {
  let ctx, master, rainGain, rainSrc, rainOn = false;
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  }
  const noiseBuf = () => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b;
  };
  function bell(freq = 520, vol = 0.35, dur = 5) {
    init(); const t = ctx.currentTime;
    [1, 2.01, 2.76, 4.07, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol / (i + 1.2), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i * 0.5 + 1));
      o.connect(g).connect(master); o.start(t); o.stop(t + dur);
    });
  }
  function creak(dur = 4.2) {
    init(); const t = ctx.currentTime;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "sawtooth"; o2.type = "square";
    o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(130, t + dur * 0.5); o.frequency.linearRampToValueAtTime(60, t + dur);
    o2.frequency.setValueAtTime(140, t); o2.frequency.linearRampToValueAtTime(210, t + dur * 0.5); o2.frequency.linearRampToValueAtTime(110, t + dur);
    f.type = "bandpass"; f.frequency.value = 420; f.Q.value = 3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.4); g.gain.linearRampToValueAtTime(0.1, t + dur - 0.8); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f); o2.connect(f); f.connect(g).connect(master); o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
    const n = ctx.createBufferSource(), ng = ctx.createGain(), nf = ctx.createBiquadFilter();
    n.buffer = noiseBuf(); nf.type = "lowpass"; nf.frequency.value = 220;
    ng.gain.setValueAtTime(0.0, t); ng.gain.linearRampToValueAtTime(0.35, t + 0.3); ng.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(nf).connect(ng).connect(master); n.start(t); n.stop(t + dur);
  }
  function thud() {
    init(); const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.7);
  }
  function chime() {
    init(); [1046, 1318, 1568, 2093].forEach((f, i) => setTimeout(() => bell(f, 0.00, 0), i * 140));
  }
  function conch() {
    init(); const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(196, t); o.frequency.linearRampToValueAtTime(220, t + 3);
    f.type = "lowpass"; f.frequency.value = 900;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.8); g.gain.linearRampToValueAtTime(0, t + 3.4);
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 3.6);
  }
  function thunder() {
    init(); const t = ctx.currentTime, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noiseBuf(); f.type = "lowpass"; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(60, t + 3);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
    n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + 3.6);
  }
  function rain(on) {
    init(); if (ctx.state === "suspended") ctx.resume();
    if (on && !rainOn) {
      rainSrc = ctx.createBufferSource(); rainSrc.buffer = noiseBuf(); rainSrc.loop = true;
      const hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 900; lp.type = "lowpass"; lp.frequency.value = 7000;
      rainGain = ctx.createGain(); rainGain.gain.setValueAtTime(0, ctx.currentTime);
      rainGain.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 3);
      rainSrc.connect(hp).connect(lp).connect(rainGain).connect(master); rainSrc.start(); rainOn = true;
    } else if (!on && rainOn) {
      rainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      const s = rainSrc; setTimeout(() => s.stop(), 1400); rainOn = false;
    }
  }
  return { init, bell, creak, thud, chime, conch, thunder, rain, isRain: () => rainOn,
           resume: () => { init(); if (ctx.state === "suspended") ctx.resume(); } };
})();
