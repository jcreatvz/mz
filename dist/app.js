/* Metro Zoomin’ / paired mascots across three editorial scenes.
   CharacterMedia owns decoding + playback. SceneDirector owns layout + transforms.
   Native scrolling, focus order and semantic content work independently of motion. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = matchMedia('(max-width: 760px)');
  const coarseQuery = matchMedia('(pointer: coarse)');
  let savedMotion = null;
  try { savedMotion = localStorage.getItem('metro-motion-v2'); } catch (_) { /* Private file browsing may reject storage. */ }
  // System reduced-motion always wins over a saved "on" preference.
  const preferences = { off: reducedQuery.matches || savedMotion === 'off' };
  document.documentElement.classList.add('js');

  class CharacterMedia {
    constructor(root) {
      this.root = root;
      this.poster = $('[data-character-poster]', root);
      this.posterURL = this.poster.src;
      this.assets = { idle: null, react: null };
      this.state = 'idle';
      this.media = null;
      this.activeAsset = null;
      this.visible = true;
      this.token = 0;
      document.addEventListener('visibilitychange', () => this.sync());
    }
    configure(assets = {}) {
      this.assets = { ...this.assets, ...assets };
      this.activeAsset = null;
      this.sync();
    }
    setState(state) {
      this.state = state;
      this.sync();
    }
    setVisible(visible) {
      if (visible === this.visible) return;
      this.visible = visible;
      this.sync();
    }
    removeMedia() {
      this.token++;
      this.root.classList.remove('is-playing');
      if (this.media) {
        if (this.media.tagName === 'VIDEO') { this.media.pause(); this.media.removeAttribute('src'); this.media.load(); }
        else this.media.removeAttribute('src');
        this.media.remove();
      }
      this.media = null;
      this.activeAsset = null;
    }
    sync() {
      const asset = this.assets[this.state] || this.assets.idle;
      const canAnimate = !preferences.off && this.visible && !document.hidden && asset;
      if (!canAnimate) {
        // GIF has no pause API: remove it and display the stable poster.
        if (this.media?.tagName === 'IMG') this.removeMedia();
        else { this.media?.pause(); this.root.classList.remove('is-playing'); }
        return;
      }
      if (asset === this.activeAsset && this.media) {
        if (this.media.tagName === 'VIDEO') this.media.play().then(() => this.root.classList.add('is-playing')).catch(() => {});
        else this.root.classList.add('is-playing');
        return;
      }
      this.removeMedia();
      const token = this.token;
      this.activeAsset = asset;
      const reveal = () => { if (token === this.token && this.visible && !preferences.off && !document.hidden) this.root.classList.add('is-playing'); };
      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.className = 'animated-media';
        video.muted = true; video.loop = true; video.playsInline = true;
        video.preload = 'none'; video.poster = this.posterURL;
        video.setAttribute('aria-hidden', 'true');
        video.width = this.poster.width; video.height = this.poster.height;
        const selected = (asset.sources || []).find(s => video.canPlayType(s.type));
        if (!selected) { this.activeAsset = null; return; }
        video.src = selected.src;
        video.addEventListener('playing', reveal);
        video.addEventListener('error', () => { if (token === this.token) this.removeMedia(); }, { once: true });
        this.media = video; this.root.append(video);
        video.play().catch(() => { /* Autoplay denied: retain poster, no blocked interface. */ });
      } else if (asset.type === 'image' && asset.src) {
        const image = new Image(this.poster.width, this.poster.height);
        image.alt = ''; image.className = 'animated-media'; image.decoding = 'async';
        image.onload = reveal;
        image.onerror = () => { if (token === this.token) this.removeMedia(); };
        this.media = image; this.root.append(image); image.src = asset.src;
      } else this.activeAsset = null;
    }
  }

  const actors = [
    {name:'boy',el:$('#traveler'),media:new CharacterMedia($('#character-media')),current:null,damping:12},
    {name:'girl',el:$('#traveler-girl'),media:new CharacterMedia($('#character-media-girl')),current:null,damping:8.5}
  ];
  class SceneDirector {
    constructor() {
      this.stage=$('#mascot-stage');this.anchors={};this.scenes=[];this.frame=0;this.lastTime=0;this.region='none';this.pointer={x:0,y:0};this.previousY=scrollY;this.footerExit=null;
      this.measure=this.measure.bind(this);this.request=this.request.bind(this);
      addEventListener('scroll',this.request,{passive:true});addEventListener('resize',this.measure,{passive:true});
      mobileQuery.addEventListener('change',this.measure);document.fonts.ready.then(this.measure);
      actors.forEach(a=>a.media.poster.addEventListener('load',this.measure));
      new ResizeObserver(this.measure).observe($('#main'));
      document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;}else this.request();});
      this.measure();
    }
    measure() {
      const sy=scrollY;
      this.anchors=Object.fromEntries($$('[data-actor-anchor]').map(el=>{const r=el.getBoundingClientRect();return [el.dataset.actorAnchor,{x:r.left,y:r.top+sy,width:r.width,height:r.height,rotation:Number(el.dataset.rotation||0)}];}));
      this.scenes=$$('[data-scene]').map(el=>{const r=el.getBoundingClientRect();return {el,top:r.top+sy,bottom:r.bottom+sy,label:el.dataset.scene};});
      this.crew=this.scenes.find(s=>s.el.id==='together');this.footer=this.scenes.find(s=>s.el.id==='finish');
      const r=$('#the-long-way').getBoundingClientRect();this.rail={top:r.top+sy,height:r.height,travel:Math.max(0,$('.wide-type').scrollWidth-innerWidth+innerWidth*.15)};
      this.maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);this.request();
    }
    request(){if(this.frame||document.hidden)return;this.frame=requestAnimationFrame(t=>{this.frame=0;this.render(t);});}
    render(time) {
      const sy=scrollY,vh=innerHeight,dt=Math.min(.05,this.lastTime?(time-this.lastTime)/1000:1/60);this.lastTime=time;
      document.documentElement.style.setProperty('--scroll',clamp(sy/this.maxScroll));
      const current=this.scenes.find(s=>sy+vh*.42>=s.top&&sy+vh*.42<s.bottom)||this.scenes[0];
      if(current){$('#scene-number').textContent=String(this.scenes.indexOf(current)+1).padStart(2,'0');$('#scene-label').textContent=current.label;$('.scene-index').classList.toggle('visible',sy>vh*.65&&sy<this.maxScroll-vh*.25);}
      if(preferences.off){this.stage.hidden=true;actors.forEach(a=>a.media.setVisible(false));return;}
      const desktop=!mobileQuery.matches;
      $('.hero').style.setProperty('--hero-back',`${desktop?-clamp(sy/vh)*65:0}px`);
      $('.hero').style.setProperty('--hero-front',`${desktop?clamp(sy/vh)*38:0}px`);
      const rail=clamp((sy-this.rail.top)/Math.max(1,this.rail.height-vh));$('.wide-type').style.setProperty('--rail-x',`${desktop?-this.rail.travel*smooth(rail):0}px`);
      // Freeze the current grow-in scale on upward travel; exit horizontally.
      if(sy<this.previousY&&this.region==='footer'&&!this.footerExit){
        this.footerExit={startY:this.previousY,progress:clamp((this.previousY-(this.footer.top-vh*.65))/(vh*.6))};
      }else if(sy>this.previousY){this.footerExit=null;}
      this.previousY=sy;
      const result=window.MetroSceneMotion.targets({scrollY:sy,viewport:vh,width:innerWidth,anchors:this.anchors,crew:this.crew,footer:this.footer,footerExit:this.footerExit});
      this.stage.hidden=result.region==='none';
      if(result.region==='none'){this.region='none';actors.forEach(a=>{a.current=null;a.media.setVisible(false);});return;}
      const changed=result.region!==this.region;this.region=result.region;this.stage.dataset.region=result.region;
      this.stage.style.top=`${result.top}px`;this.stage.style.height=`${result.height}px`;
      let unsettled=false;
      for(const a of actors){
        const goal={...result.actors[a.name]};const depth=a.name==='boy'?1:.7;
        goal.x+=this.pointer.x*depth;goal.y+=this.pointer.y*depth;goal.rotation+=this.pointer.x*(a.name==='boy'?.075:.045);
        if(changed||!a.current)a.current={...goal};
        const follow=1-Math.exp(-a.damping*dt);
        for(const key of ['x','y','width','rotation','opacity']){
          if(Math.abs(goal[key]-a.current[key])>.015){a.current[key]=lerp(a.current[key],goal[key],follow);unsettled=true;}else a.current[key]=goal[key];
        }
        const p=a.current;a.el.style.transform=`translate3d(${p.x.toFixed(2)}px,${(p.y-result.top).toFixed(2)}px,0) rotate(${p.rotation.toFixed(2)}deg) scale(${Math.max(0,p.width/600).toFixed(5)})`;
        a.el.style.opacity=p.opacity.toFixed(3);a.media.setVisible(p.opacity>.02&&p.y+p.width*1.25>sy&&p.y<sy+vh);
      }
      if(unsettled)this.request();
    }
    reset(){this.pointer={x:0,y:0};this.previousY=scrollY;this.footerExit=null;actors.forEach(a=>{a.current=null;});this.measure();}
  }
  const director=new SceneDirector();
  function syncMotionPreference(){
    document.documentElement.classList.toggle('motion-off',preferences.off);document.body.classList.toggle('motion-off',preferences.off);
    const toggle=$('#motion-toggle');toggle.setAttribute('aria-pressed',String(!preferences.off));toggle.innerHTML=`SITE MOTION: ${preferences.off?'OFF':'ON'} <span aria-hidden="true">↗</span>`;
    toggle.disabled=reducedQuery.matches;toggle.title=reducedQuery.matches?'Reduced motion follows your device preference':'Toggle scene motion';
    if(preferences.off)$$('[data-actor-anchor]').forEach(anchor=>{
      if($('.still-runner',anchor))return;
      const img=new Image(290,192);img.alt='';img.className='still-runner';img.loading=anchor.dataset.actorAnchor==='hero'?'eager':'lazy';img.decoding='async';img.src=window.METRO_ASSETS?.['assets/mz-duo.svg']||'assets/mz-duo.svg';anchor.append(img);
    });
    actors.forEach(a=>a.media.sync());director.reset();
  }
  $('#motion-toggle').addEventListener('click',()=>{preferences.off=!preferences.off;savedMotion=preferences.off?'off':'on';try{localStorage.setItem('metro-motion-v2',savedMotion);}catch(_){}syncMotionPreference();});
  reducedQuery.addEventListener('change',()=>{preferences.off=reducedQuery.matches||savedMotion==='off';syncMotionPreference();});
  syncMotionPreference();document.body.classList.add('motion-ready');
  
  let reactionTimer;
  function react(){
    clearTimeout(reactionTimer);actors.forEach(a=>{a.media.setState('react');});
    reactionTimer=setTimeout(()=>actors.forEach(a=>a.media.setState('idle')),900);
  }
  addEventListener('pointermove',event=>{
    if(preferences.off||coarseQuery.matches||mobileQuery.matches)return;
    director.pointer={x:(event.clientX/innerWidth-.5)*24,y:(event.clientY/innerHeight-.5)*18};director.request();
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{director.pointer={x:0,y:0};director.request();});

  // One open pace panel at a time. Native buttons preserve touch and keyboard behavior.
  const paces = {
    walk:{word:'EASY.',caption:'NO RUSH. YOU’RE RIGHT ON TIME.'},
    jog:{word:'FLOW.',caption:'SETTLE IN. FIND YOUR PEOPLE.'},
    zoom:{word:'ZOOM.',caption:'A LITTLE MORE PACE. SAME GOOD ENERGY.'}
  };
  $$('.pace-toggle').forEach(button=>button.addEventListener('click',()=>{
    $$('.pace-toggle').forEach(other=>{
      const active=other===button;
      other.setAttribute('aria-expanded',String(active));
      other.closest('.pace-item').classList.toggle('is-active',active);
      document.getElementById(other.getAttribute('aria-controls')).hidden=!active;
    });
    const pace=paces[button.dataset.pace];$('.pace-word').textContent=pace.word;$('#pace-caption').textContent=pace.caption;
    react(false);director.measure();
  }));

  // Menu and dialog always have an obvious exit and return focus to their trigger.
  const menuButton=$('.menu-toggle'),menu=$('#mobile-menu');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');$('.menu-icon').textContent='+';}
  menuButton.addEventListener('click',()=>{
    const opening=menu.hidden;menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));$('.menu-icon').textContent=opening?'−':'+';
  });
  $$('a',menu).forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
  mobileQuery.addEventListener('change',()=>{if(!mobileQuery.matches)closeMenu();});
  const dialog=$('#run-guide');let dialogTrigger=null;
  $$('[data-open-guide]').forEach(link=>link.addEventListener('click',event=>{
    if(typeof dialog.showModal!=='function')return;
    event.preventDefault();dialogTrigger=link;dialog.showModal();$('.dialog-close',dialog).focus();
  }));
  function closeGuide(){dialog.close();dialogTrigger?.focus();}
  $('.dialog-close').addEventListener('click',closeGuide);$('.guide-done').addEventListener('click',closeGuide);
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeGuide();});
  dialog.addEventListener('close',()=>dialogTrigger?.focus());

  // Asset hook: configure once; every scene uses the same actor instance.
  // GIF: { idle: {type:'image',src:'assets/runner-idle.gif'} }
  // Video: { idle: {type:'video',sources:[{src:'assets/runner-idle.webm',type:'video/webm'},{src:'assets/runner-idle.mp4',type:'video/mp4'}]} }
  // Optional react uses the same schema. Poster remains the accessible low-motion fallback.
  function configureCharacters(assets){
    for(const actor of actors)actor.media.configure(assets[actor.name]||assets);
  }
  window.metroCharacter=Object.freeze({configure:configureCharacters,react,refresh:()=>director.measure()});
  if(window.METRO_CHARACTER_MEDIA)configureCharacters(window.METRO_CHARACTER_MEDIA);
})();
