(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Scroll-triggered story reveals.
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: 0.12});
  $$('.reveal').forEach(el => observer.observe(el));


  // Scroll progress indicator for a more cinematic journey.
  const progress = $('#scrollProgress');
  let progressTick = false;
  function updateProgress(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    progressTick = false;
  }
  window.addEventListener('scroll', () => {
    if (!progressTick) { requestAnimationFrame(updateProgress); progressTick = true; }
  }, {passive:true});
  updateProgress();

  // Reveal children with a gentle stagger as each story scene enters view.
  const staggerGroups = $$('.gallery-grid, .family-strip, .countdown, .event-layout');
  staggerGroups.forEach(group => {
    [...group.children].forEach((child, index) => {
      child.style.transitionDelay = `${Math.min(index * 110, 440)}ms`;
      if (!child.classList.contains('reveal')) child.classList.add('reveal');
      observer.observe(child);
    });
  });

  // Subtle scroll-linked image zoom in the wide couple banner.
  const bannerImage = $('.couple-banner > img');
  if (bannerImage && !reduceMotion) {
    let bannerTick = false;
    const moveBanner = () => {
      const rect = bannerImage.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      bannerImage.style.objectPosition = `center ${40 + progress * 5}%`;
      bannerTick = false;
    };
    window.addEventListener('scroll', () => { if (!bannerTick) { requestAnimationFrame(moveBanner); bannerTick = true; } }, {passive:true});
    moveBanner();
  }

  // Gentle parallax, disabled on smaller screens and reduced-motion preferences.
  const parallaxEls = $$('.parallax');
  let ticking = false;
  function updateParallax(){
    if (window.innerWidth > 640 && !reduceMotion) {
      parallaxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.speed || '.04');
        const offset = (r.top + r.height/2 - window.innerHeight/2) * speed;
        el.style.translate = `0 ${-offset}px`;
      });
    } else parallaxEls.forEach(el => el.style.translate = '0 0');
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; } }, {passive:true});
  window.addEventListener('resize', updateParallax); updateParallax();

  // Navigation drawer on mobile.
  const nav = $('#nav');
  $('#menuToggle').addEventListener('click', () => nav.classList.toggle('open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // Wedding countdown: event time is Kochi local time (IST, UTC+05:30).
  const target = new Date('2026-11-29T11:00:00+05:30').getTime();
  function countdown(){
    let diff = target - Date.now();
    if (diff <= 0) { $('#countdown').innerHTML = '<p class="countdown-heading">TODAY WE BEGIN FOREVER ♥</p>'; return; }
    const d = Math.floor(diff/86400000); diff %= 86400000;
    const h = Math.floor(diff/3600000); diff %= 3600000;
    const m = Math.floor(diff/60000); const s = Math.floor((diff%60000)/1000);
    $('#days').textContent = String(d).padStart(2,'0'); $('#hours').textContent = String(h).padStart(2,'0');
    $('#minutes').textContent = String(m).padStart(2,'0'); $('#seconds').textContent = String(s).padStart(2,'0');
  }
  countdown(); setInterval(countdown,1000);

  // Wedding music: try audible autoplay as soon as the page is entered.
  // Browsers may block sound-on-load; when they do, the first visitor gesture
  // anywhere on the page starts the track (no separate music-button click needed).
  const music = $('#weddingMusic');
  const musicButton = $('#musicToggle');
  const musicLabel = $('#musicLabel');
  const musicHint = $('#musicHint');
  let musicOn = false;
  let musicAttempted = false;
  let visitorPausedMusic = false;
  let gestureListenersActive = true;

  if (music) {
    music.autoplay = true;
    music.loop = true;
    music.preload = 'auto';
    music.playsInline = true;
    music.volume = 0.5;
  }

  function setMusicState(playing) {
    musicOn = playing;
    musicButton.classList.toggle('playing', playing);
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Pause wedding music' : 'Play wedding music');
    musicLabel.textContent = playing ? 'Music On' : (musicAttempted ? 'Tap for Music' : 'Starting Music…');
    if (musicHint) musicHint.hidden = playing || visitorPausedMusic;
  }

  function removeGestureListeners() {
    if (!gestureListenersActive) return;
    gestureListenersActive = false;
    window.removeEventListener('pointerdown', retryOnGesture, true);
    window.removeEventListener('touchstart', retryOnGesture, true);
    window.removeEventListener('keydown', retryOnGesture, true);
    window.removeEventListener('click', retryOnGesture, true);
  }

  async function startMusic(fromGesture = false) {
    if (!music || visitorPausedMusic) return false;
    musicAttempted = true;
    try {
      // Call play() directly inside the gesture handler when possible so the
      // browser's temporary user-activation permission is still available.
      const result = music.play();
      if (result && typeof result.then === 'function') await result;
      setMusicState(true);
      removeGestureListeners();
      return true;
    } catch (error) {
      setMusicState(false);
      if (musicHint) musicHint.hidden = false;
      return false;
    }
  }

  function pauseMusic() {
    if (!music) return;
    visitorPausedMusic = true;
    music.pause();
    setMusicState(false);
    if (musicHint) musicHint.hidden = true;
  }

  async function toggleMusic() {
    if (musicOn) pauseMusic();
    else {
      visitorPausedMusic = false;
      await startMusic(true);
    }
  }

  async function retryOnGesture(event) {
    if (event.target && event.target.closest && event.target.closest('#musicToggle')) return;
    if (visitorPausedMusic || musicOn) return;
    // Don't swallow the event or prevent normal page interaction.
    await startMusic(true);
  }

  // Attempt sound-on-load immediately. If blocked, show a clear hint and start
  // automatically on the first tap/click/key press anywhere in the document.
  startMusic(false);
  window.addEventListener('pointerdown', retryOnGesture, true);
  window.addEventListener('touchstart', retryOnGesture, { capture: true, passive: true });
  window.addEventListener('keydown', retryOnGesture, true);
  window.addEventListener('click', retryOnGesture, true);
  musicButton.addEventListener('click', toggleMusic);

  music.addEventListener('play', () => setMusicState(true));
  music.addEventListener('pause', () => { if (musicOn) setMusicState(false); });
  music.addEventListener('ended', () => { if (!visitorPausedMusic) startMusic(false); });
  music.addEventListener('error', () => {
    musicLabel.textContent = 'Music Unavailable';
    if (musicHint) {
      musicHint.hidden = false;
      musicHint.textContent = 'Wedding music could not be loaded. Please check the audio file.';
    }
  });

  // Falling flower petals canvas.
  const canvas=$('#petals'), ctx=canvas.getContext('2d'); let petals=[]; let w=0,h=0;
  function resize(){w=canvas.width=window.innerWidth*devicePixelRatio;h=canvas.height=window.innerHeight*devicePixelRatio;canvas.style.width=window.innerWidth+'px';canvas.style.height=window.innerHeight+'px';}
  function makePetal(){return{x:Math.random()*w,y:Math.random()*h-h,r:(3+Math.random()*5)*devicePixelRatio,vy:(.45+Math.random()*.8)*devicePixelRatio,vx:(-.25+Math.random()*.5)*devicePixelRatio,rot:Math.random()*6,vr:(-.02+Math.random()*.04),alpha:.25+Math.random()*.35};}
  function animatePetals(){ctx.clearRect(0,0,w,h);if(!reduceMotion){petals.forEach(p=>{p.y+=p.vy;p.x+=p.vx+Math.sin(p.y*.003)*.25*devicePixelRatio;p.rot+=p.vr;if(p.y>h+20){p.y=-20;p.x=Math.random()*w;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.alpha;ctx.fillStyle='#bd8e79';ctx.beginPath();ctx.ellipse(0,0,p.r*.65,p.r,0,0,Math.PI*2);ctx.fill();ctx.restore();});}requestAnimationFrame(animatePetals);}
  resize();petals=Array.from({length:window.innerWidth<640?14:25},makePetal);window.addEventListener('resize',()=>{resize();petals=Array.from({length:window.innerWidth<640?14:25},makePetal)});animatePetals();

  // Gallery lightbox.
  const lightbox=$('#lightbox'), lightboxImage=$('#lightboxImage');
  $$('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lightboxImage.src=item.dataset.full;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}));
  function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  $('#lightboxClose').addEventListener('click',closeLightbox);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});
})();
