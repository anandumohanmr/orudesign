(() => {
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  window.addEventListener('load',()=>setTimeout(()=>$('#preloader')?.classList.add('hidden'),500));

  // Falling floral decoration
  const decor=$('.floating-decor');
  for(let i=0;i<34;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'vw';s.style.animationDuration=(7+Math.random()*10)+'s';s.style.animationDelay=(-Math.random()*15)+'s';s.style.transform=`scale(${.55+Math.random()*.9})`;decor.appendChild(s)}
  const spark=$('.sparkle-field');
  for(let i=0;i<55;i++){const s=document.createElement('span');s.className='spark';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=Math.random()*3+'s';spark?.appendChild(s)}
  const fairyStars=$('.fairy-stars');
  for(let i=0;i<70;i++){const s=document.createElement('span');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=Math.random()*4+'s';fairyStars?.appendChild(s)}
  const heartRain=$('.heart-rain');
  for(let i=0;i<24;i++){const h=document.createElement('span');h.textContent='♥';h.style.left=Math.random()*100+'%';h.style.bottom=(-10+Math.random()*10)+'%';h.style.animationDuration=(8+Math.random()*8)+'s';h.style.animationDelay=(-Math.random()*12)+'s';heartRain?.appendChild(h)}

  function createScene(canvas,dark=false){
    if(!canvas||!window.THREE)return;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.1,100),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2)); camera.position.z=9; scene.add(new THREE.AmbientLight(dark?0x7f4770:0xffffff,1.7));
    const p1=new THREE.PointLight(dark?0xff7fb3:0xffc66d,4,30);p1.position.set(4,4,5);scene.add(p1);const p2=new THREE.PointLight(dark?0x8870ff:0xff8fc1,2.5,30);p2.position.set(-4,-2,4);scene.add(p2);
    const group=new THREE.Group();scene.add(group);
    const rings=[];[[3,.012,dark?0xffcf7b:0xd65a89],[2.1,.009,dark?0xff7fae:0xa77dff],[1.4,.007,dark?0x9e8bff:0xff9b73]].forEach((r,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,r[1],16,100),new THREE.MeshBasicMaterial({color:r[2],transparent:true,opacity:.3}));m.rotation.x=i*.7;m.rotation.y=i*.4;group.add(m);rings.push(m)});
    const shapes=[];for(let i=0;i<90;i++){const g=new THREE.SphereGeometry(.025+Math.random()*.055,7,7),m=new THREE.MeshBasicMaterial({color:[0xffa4c7,0xffd477,0xa88cff,0x8de7ff][i%4],transparent:true,opacity:.3+Math.random()*.45});const o=new THREE.Mesh(g,m);o.position.set((Math.random()-.5)*13,(Math.random()-.5)*9,(Math.random()-.5)*5);o.userData={y:o.position.y,s:Math.random()*.7+0.3,p:Math.random()*6};group.add(o);shapes.push(o)}
    function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}resize();addEventListener('resize',resize);
    const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();rings.forEach((r,i)=>{r.rotation.z=t*(.04+i*.025);r.rotation.x+=.001*(i+1)});shapes.forEach(o=>{o.position.y=o.userData.y+Math.sin(t*.45+o.userData.p)*.22;o.scale.setScalar(.75+Math.sin(t*o.userData.s+o.userData.p)*.2)});group.rotation.y=Math.sin(t*.08)*.08;renderer.render(scene,camera)}animate();
  }
  createScene($('#introCanvas'),true);createScene($('#heroCanvas'));createScene($('#fairytaleCanvas'),true);

  // Intro transition + Web Audio romantic ambient melody
  const AudioEngine=(()=>{let ctx,master,active=false,timer;const chords=[[261.63,329.63,392],[293.66,369.99,440],[246.94,311.13,369.99],[220,277.18,329.63]];function start(){if(active)return;ctx=ctx||new (AudioContext||webkitAudioContext)();ctx.resume();master=ctx.createGain();master.gain.value=.035;master.connect(ctx.destination);active=true;let bar=0;const play=()=>{if(!active)return;const now=ctx.currentTime;chords[bar%4].forEach((freq,j)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=j===0?'sine':'triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.25/(j+1),now+.12);g.gain.exponentialRampToValueAtTime(.0001,now+2.8);o.connect(g);g.connect(master);o.start(now);o.stop(now+3)});bar++};play();timer=setInterval(play,2300);$('#musicToggle').classList.add('visible');$('#musicLabel').textContent='Music on'}function stop(){active=false;clearInterval(timer);if(master)master.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.4);$('#musicToggle').classList.add('off');$('#musicLabel').textContent='Music off'}return{start,stop,isOn:()=>active}})();
  $('#enterBtn').addEventListener('click',()=>{AudioEngine.start();gsap.timeline().to('.intro-card',{duration:.5,scale:1.08,opacity:0,ease:'power2.in'}).to('#intro',{duration:1,opacity:0,ease:'power3.inOut',onComplete:()=>{$('#intro').style.display='none';document.body.classList.remove('locked');document.querySelector('#home').scrollIntoView({behavior:'smooth'})}},'-=.15')});
  $('#musicToggle').addEventListener('click',()=>AudioEngine.isOn()?AudioEngine.stop():AudioEngine.start());

  // Countdown: invitation card specifies 25 Oct 2026, 11 AM IST
  const weddingTime=new Date('2026-10-25T11:00:00+05:30').getTime();function update(){let d=Math.max(0,weddingTime-Date.now());const vals=[Math.floor(d/86400000)];d%=86400000;vals.push(Math.floor(d/3600000));d%=3600000;vals.push(Math.floor(d/60000));d%=60000;vals.push(Math.floor(d/1000));['days','hours','minutes','seconds'].forEach((id,i)=>{$('#'+id).textContent=String(vals[i]).padStart(2,'0')})}update();setInterval(update,1000);

  // Scroll reveal with stagger
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');e.target.style.transitionDelay=(Math.random()*.16)+'s';io.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(el=>io.observe(el));
  addEventListener('scroll',()=>{$('#topBtn').classList.toggle('show',scrollY>700);const frame=$('.hero-photo-frame');if(frame&&scrollY<innerHeight*1.15)frame.style.transform=`rotate(${4-scrollY*.002}deg) translateY(${scrollY*.035}px)`},{passive:true});
  $('#topBtn').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  addEventListener('mousemove',e=>{const g=$('.cursor-glow');if(g){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}});
  // Gentle 3D tilt for cards
  $$('.detail-card,.gallery-item,.memory-card').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateY(-5px)`});card.addEventListener('mouseleave',()=>card.style.transform='')});
})();
