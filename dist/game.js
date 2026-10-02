/* The page renderer controls the game only after an explicit Play action. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const shell=$('#game-shell'),canvas=$('#run-canvas'),ctx=canvas.getContext('2d');
  if(!ctx){$('#game-overlay-copy').textContent='This browser cannot display the game. The club details are below.';$('#game-start').disabled=true;return;}
  const overlay=$('#game-overlay'),start=$('#game-start'),pause=$('#game-pause'),restart=$('#game-restart'),jump=$('#game-jump');
  const label=$('#game-overlay-label'),title=$('#game-overlay-title'),copy=$('#game-overlay-copy'),endLink=$('#game-end-link');
  const health=$('#game-health'),status=$('#game-status'),notice=$('#game-notice');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const engine=new window.MetroRunEngine();
  const images={}, paths={runner:'assets/mz-run-atlas.webp',still:'assets/mz-run-still.webp',banana:'assets/game-banana.webp',ice:'assets/game-ice.webp',barrier:'assets/game-barrier.webp',cone:'assets/game-cone.webp',pothole:'assets/game-pothole.webp',water:'assets/game-water.webp'};
  let loaded=false,loading=null,frame=0,last=0,accumulator=0,visible=true,noticeTimer=0,announcedHealth=10;
  const assetURL=path=>window.METRO_ASSETS?.[path]||path;
  function loadImage(key){return new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(new Error(`Could not load ${key}`));im.src=assetURL(paths[key]);});}
  function load(){if(loaded)return Promise.resolve();if(loading)return loading;loading=Promise.all(Object.keys(paths).filter(k=>k!=='still').map(loadImage)).then(()=>{loaded=true;}).catch(e=>{loading=null;throw e;});return loading;}
  function showNotice(message){clearTimeout(noticeTimer);notice.textContent=message;notice.classList.add('visible');noticeTimer=setTimeout(()=>notice.classList.remove('visible'),1900);}
  function announce(message){status.textContent=message;}
  function updateHUD(){
    [...health.children].forEach((bar,i)=>bar.classList.toggle('is-empty',i>=engine.health));
    health.setAttribute('aria-valuenow',String(engine.health));health.setAttribute('aria-valuetext',`${engine.health} of 10 lifespan bars`);
    $('#health-value').textContent=`${engine.health} / 10`;$('#game-distance').textContent=`${Math.floor(engine.distance)} m`;$('#game-drops').textContent=engine.drops;
  }
  function setUI(phase,reason=''){
    shell.dataset.state=phase;const active=phase==='running';overlay.hidden=active;
    pause.disabled=!active;restart.disabled=phase==='ready'||phase==='loading';jump.disabled=!active;endLink.hidden=phase!=='over';
    if(active){pause.textContent='Pause';return;}
    if(phase==='paused'){
      label.textContent='TAKE YOUR TIME.';title.innerHTML='CATCH<br>YOUR BREATH.';copy.textContent=reason||'Your run is paused. Pick up where you left off.';start.textContent='Resume run';announce('Run paused. Press Resume run to continue.');
    }else if(phase==='over'){
      label.textContent='GOOD MILES. GOOD EFFORT.';title.innerHTML='NICE<br>RUN.';copy.textContent=`${Math.floor(engine.distance)} metres · ${engine.drops} drops · ${Math.floor(engine.distance)+engine.bonus} points. ${engine.milestone?'One-minute milestone reached.':'One more try? Your first goal is one minute.'}`;start.textContent='Run again';announce(`Run finished. ${Math.floor(engine.distance)} metres and ${engine.drops} water drops collected.`);
    }else if(phase==='loading'){
      start.textContent='Getting the track ready…';start.disabled=true;
    }
    if(phase!=='loading')start.disabled=false;
  }
  function stopLoop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;accumulator=0;}
  function doPause(reason){if(engine.phase!=='running')return;engine.pause();stopLoop();setUI('paused',reason);draw();}
  function handleEvents(){
    for(const event of engine.drainEvents()){
      if(event.type==='damage'){
        const name={banana:'Banana peel',ice:'Ice patch',barrier:'Roadworks',cone:'Traffic cone',pothole:'Pothole'}[event.hazard];
        showNotice(`${name} · −1 bar`);announce(`${name}. ${event.health} lifespan bars remaining.`);announcedHealth=event.health;
      }else if(event.type==='water'){
        if(event.restored){showNotice('A little refill. +1 bar');if(event.health!==announcedHealth)announce(`Water collected. ${event.health} lifespan bars.`);announcedHealth=event.health;}else showNotice('FULL TANK. +10 POINTS');
      }else if(event.type==='milestone'){
        showNotice('ONE MINUTE. KEEP ZOOMIN’!');announce('One-minute milestone reached. Keep zooming.');
      }else if(event.type==='over'){stopLoop();setUI('over');start.focus({preventScroll:true});}
    }
  }
  function loop(t){
    frame=0;if(engine.phase!=='running')return;
    if(last)accumulator+=Math.min((t-last)/1000,.1);last=t;
    while(accumulator>=1/120&&engine.phase==='running'){engine.step(1/120);accumulator-=1/120;}
    handleEvents();updateHUD();draw();if(engine.phase==='running')frame=requestAnimationFrame(loop);
  }
  async function begin(){
    if(shell.dataset.state==='loading')return;
    if(engine.phase==='paused'){
      if(document.hidden||!visible)return;engine.resume();setUI('running');canvas.focus({preventScroll:true});last=0;frame=requestAnimationFrame(loop);return;
    }
    setUI('loading');
    try{await load();}catch(_){
      setUI('ready');label.textContent='LET’S TRY THAT AGAIN.';copy.textContent='The track artwork did not load. Please try again.';start.textContent='Retry loading';announce('Track artwork could not load. Try again.');return;
    }
    engine.start();updateHUD();announcedHealth=10;
    if(document.hidden||!visible){engine.pause();setUI('paused','The track is ready. Return here and press Resume run.');draw();return;}
    setUI('running');canvas.focus({preventScroll:true});announce('Run started. Ten lifespan bars. Press Space or up arrow to jump.');last=0;accumulator=0;frame=requestAnimationFrame(loop);
  }
  function doJump(){if(engine.phase==='running')engine.jump();}
  start.addEventListener('click',begin);pause.addEventListener('click',()=>{doPause();start.focus({preventScroll:true});});
  restart.addEventListener('click',()=>{stopLoop();engine.reset();notice.classList.remove('visible');begin();});
  jump.addEventListener('pointerdown',e=>{if(e.button!==0)return;doJump();});
  // Keyboard activation still works when the button receives focus.
  jump.addEventListener('click',e=>{if(e.detail===0)doJump();});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||engine.phase!=='running')return;canvas.focus({preventScroll:true});doJump();});
  document.addEventListener('keydown',e=>{
    if(engine.phase!=='running'||!shell.contains(document.activeElement))return;
    if(['Space','ArrowUp'].includes(e.code)&&(document.activeElement===canvas||(e.code==='ArrowUp'&&document.activeElement===jump))){e.preventDefault();if(!e.repeat)doJump();}
    if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();doPause();start.focus({preventScroll:true});}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)doPause('Your run paused while you were away. Ready for another mile?');});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)doPause('Your run is saved here. Press Resume run when you’re ready.');},{threshold:.15}).observe($('#game-track'));
  function resize(){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);
    engine.resize(440*r.width/r.height,440);draw();
  }
  new ResizeObserver(resize).observe($('#game-track'));reduced.addEventListener('change',()=>draw());
  function sprite(key,x,y,w,h){const im=images[key];if(im)ctx.drawImage(im,x,y,w,h);}
  function drawWorld(){
    const w=engine.width,h=engine.height,g=engine.ground;
    ctx.fillStyle='#eeeae3';ctx.fillRect(0,0,w,h);
    // Editorial type and functional lane geometry replace a separate illustrated backdrop.
    ctx.save();ctx.fillStyle='#d8d5cd';ctx.font=`${w<700?110:150}px MetroDisplay, Impact, sans-serif`;ctx.textBaseline='top';
    const drift=reduced.matches?0:-(engine.distance*5)%750;
    ctx.fillText('KEEP ZOOMIN’',drift+30,32);if(w>700)ctx.fillText('KEEP ZOOMIN’',drift+840,32);ctx.restore();
    ctx.strokeStyle='#aaa79f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,g);ctx.lineTo(w,g);ctx.stroke();
    ctx.fillStyle='#e4e0d6';ctx.fillRect(0,g+1,w,h-g);
    ctx.fillStyle='#d94427';ctx.fillRect(0,g, w,3);
    const shift=reduced.matches?0:-(engine.distance*65)%155;
    ctx.fillStyle='#c6c1b8';for(let x=shift-155;x<w;x+=155)ctx.fillRect(x,g+36,73,3);
    ctx.fillStyle='#5c5951';ctx.font='12px Helvetica, Arial, sans-serif';ctx.fillText('EDMONTON / ON FOOT',25,h-18);
    if(w>700){ctx.textAlign='right';ctx.fillText('53°N / 113°W',w-25,h-18);ctx.textAlign='left';}
  }
  function drawRunner(preview=false){
    const x=preview?engine.width*.67:engine.runnerX,y=engine.ground-engine.lift-135;
    const run=images.runner,still=images.still;if(!run&&!still)return;
    let pose=engine.phase==='running'?Math.floor(engine.elapsed*(engine.speed/25))%8:0;
    if(engine.lift>1)pose=6;if(engine.stumble>0)pose=3;
    ctx.save();
    if(engine.invulnerable>0){ctx.globalAlpha=reduced.matches?.7:(Math.floor(engine.elapsed*10)%2?.55:1);}
    if(engine.stumble>0&&!reduced.matches){ctx.translate(x+80,y+105);ctx.rotate(engine.slip==='slide'?-.15:.1);ctx.translate(-x-80,-y-105);}
    if(run)ctx.drawImage(run,pose*640,0,640,540,x,y,160,135);else ctx.drawImage(still,x,y,160,135);
    ctx.restore();
  }
  function draw(){
    ctx.setTransform(canvas.width/engine.width,0,0,canvas.height/engine.height,0,0);drawWorld();
    if(engine.phase==='ready'||shell.dataset.state==='loading'){
      if(loaded){sprite('barrier',engine.width*.85,engine.ground-80,84,80);sprite('water',engine.width*.56,engine.ground-140,29,36);}
      drawRunner(true);return;
    }
    for(const o of engine.hazards)sprite(o.type,o.x,engine.ground-o.height,o.width,o.height);
    for(const o of engine.pickups)sprite('water',o.x,o.y,o.size,o.size*1.2);
    drawRunner();
  }
  // Load the small still only near the game. The animated atlas waits for Play.
  const previewObserver=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;previewObserver.disconnect();loadImage('still').then(draw).catch(()=>{});},{rootMargin:'500px'});previewObserver.observe(shell);
  document.fonts.ready.then(draw);resize();updateHUD();
})();
