/* Standalone motion prototype; no remote animation dependencies. */
(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const off=()=>reduced.matches||document.body.classList.contains('motion-off');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease='cubic-bezier(.16,1,.3,1)';
const running=new Set();
function animate(el,frames,opts={}){if(off()||!el.animate)return Promise.resolve();const a=el.animate(frames,{duration:760,easing:ease,fill:'both',...opts});running.add(a);return a.finished.catch(()=>{}).finally(()=>running.delete(a));}
document.body.classList.add('motion-study');
const overlay=$('#motion-study-loader'),counter=$('#loader-counter'),disc=$('.loader-disc'),name=$('.loader-name');
let generation=0,timeout=0,busy=false;
function stopLoader(){generation++;clearTimeout(timeout);if(busy)document.querySelectorAll('.hero-line').forEach(g=>{g.querySelectorAll('.word-ink').forEach(w=>{w.style.transform=getComputedStyle(w).transform;});g.classList.remove('word-armed');});busy=false;overlay.hidden=true;overlay.style.clipPath='';disc.style.transform='';name.style.opacity='';for(const a of overlay.getAnimations({subtree:true}))a.cancel();}
const groups=window.MZDraft.groups;clearTimeout(window.MZDraft.failsafe);
const wordStates=new Map(groups.map(group=>[group,{visible:false,token:0}]));
function setWords(group,visible){
 const state=wordStates.get(group);if(state.visible===visible)return;
 state.visible=visible;const token=++state.token;
 const words=[...group.querySelectorAll('.word-ink')];
 const starts=words.map(word=>getComputedStyle(word).transform);
 group.classList.remove('word-armed');
 words.forEach((word,i)=>{
  const from=starts[i];
  word.getAnimations().forEach(a=>a.cancel());
  word.style.transform=from==='none'?'translate3d(0,0,0)':from;
  const to=visible?'translate3d(0,0,0)':`translate3d(${word.style.getPropertyValue('--word-from')},0,0)`;
  const delay=Math.min((visible?i:words.length-1-i)*45,360);
  const a=word.animate([{transform:word.style.transform},{transform:to}],{duration:visible?650:450,delay,easing:visible?ease:'cubic-bezier(.7,0,.84,0)',fill:'both'});
  running.add(a);a.finished.then(()=>{if(state.token===token){word.style.transform=to;a.cancel();}}).catch(()=>{}).finally(()=>running.delete(a));
 });
}
function heroEnter(){
 if(off()||scrollY>100)return;
 groups.filter(g=>g.matches('.hero-line')).forEach(g=>setWords(g,true));
}
async function intro(replay=false){
 stopLoader();if(off()||(!replay&&location.hash)){heroEnter();return;}
 busy=true;const mine=generation;overlay.hidden=false;counter.textContent='00';
 timeout=setTimeout(()=>{stopLoader();heroEnter();},4500);
 const imgs=[$('#runner-poster'),$('#runner-poster-girl')];
 const tasks=[document.fonts.load('32px MetroDisplay'),...imgs.map(i=>i.decode?i.decode():Promise.resolve())];let done=0;
 await Promise.allSettled(tasks.map(p=>Promise.resolve(p).catch(()=>{}).then(()=>{if(mine===generation)counter.textContent=String(Math.round(++done/tasks.length*100)).padStart(2,'0');})));
 if(mine!==generation||off())return;
 const scale=Math.hypot(innerWidth,innerHeight)/24;
 await Promise.all([animate(disc,[{transform:'scale(1)'},{transform:`scale(${scale})`}],{duration:680,easing:'cubic-bezier(.76,0,.24,1)'}),animate(name,[{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,delay:160})]);
 if(mine!==generation)return;
 disc.style.transform=`scale(${scale})`;name.style.opacity='1';name.style.transform='translateY(0)';
 const revealing=animate(overlay,[{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 100% 0)'}],{duration:680,easing:'cubic-bezier(.76,0,.24,1)'});
 heroEnter();await revealing;if(mine===generation)stopLoader();
}
$('#loader-skip').addEventListener('click',()=>{stopLoader();heroEnter();});

addEventListener('keydown',e=>{if(e.key==='Escape'&&busy){stopLoader();heroEnter();}});
// Never prevent reading or scrolling behind an intro; user intent dismisses it.
addEventListener('wheel',()=>{if(busy){stopLoader();heroEnter();}},{passive:true});
addEventListener('touchstart',e=>{if(busy&&!overlay.contains(e.target)){stopLoader();heroEnter();}},{passive:true});
addEventListener('focusin',e=>{if(busy&&!overlay.contains(e.target)){stopLoader();heroEnter();}});
// Small copy moves as a complete readable block; no word splitting.
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
 if(!isIntersecting)return;observer.unobserve(target);if(off())return;
 animate(target,[{transform:'translate3d(0,22px,0)'},{transform:'translate3d(0,0,0)'}],{duration:600}).then(()=>target.getAnimations().forEach(a=>a.cancel()));
}),{threshold:.12});
$$('.together-copy p,.interlude-copy p,.game-copy p,.rhythm-heading>p,.pace-panel p,.invitation p,.run-facts>div,.footer-signoff p').forEach(g=>observer.observe(g));
const topButton=$('#back-to-top');topButton.addEventListener('click',()=>{window.scrollTo({top:0,behavior:off()?'instant':'smooth'});$('.brand').focus({preventScroll:true});});
new MutationObserver(()=>document.documentElement.classList.toggle('game-interacting',$('#game-shell').dataset.state==='running')).observe($('#game-shell'),{attributes:true,attributeFilter:['data-state']});
// Each footer line tracks its own viewport position. Scrolling back reverses it
// while the word is still visible, rather than waiting until the whole title exits.
function drawFooterWords(group){
 const r=group.getBoundingClientRect();
 const entering=clamp((innerHeight*.96-r.top)/(innerHeight*.36));
 const leaving=clamp((r.bottom-innerHeight*.06)/(innerHeight*.25));
 const progress=Math.min(entering,leaving);
 const eased=progress*progress*(3-2*progress);
 group.classList.remove('word-armed');
 group.querySelectorAll('.word-ink').forEach(word=>{
  const from=parseFloat(word.style.getPropertyValue('--word-from'));
  word.style.transform=`translate3d(${from*(1-eased)}%,0,0)`;
 });
}
let frame=0;function draw(){frame=0;topButton.hidden=scrollY<innerHeight*.7;const circle=$('.orbital-mark');const clouds=$$('.footer-clouds svg');if(off()){circle.style.transform='';clouds.forEach(c=>c.style.transform='');return;}groups.forEach(group=>{if(group.matches('.finale-words>span')){drawFooterWords(group);return;}if(busy&&group.matches('.hero-line'))return;const r=group.getBoundingClientRect();const state=wordStates.get(group);if(!state.visible&&r.top<innerHeight*.88&&r.bottom>innerHeight*.16)setWords(group,true);else if(state.visible&&(r.bottom<innerHeight*.10||r.top>innerHeight*.97))setWords(group,false);});const r=$('#together').getBoundingClientRect();const progress=clamp((innerHeight-r.top)/(innerHeight+r.height));circle.style.transform=`scale(${.72+.28*clamp(progress*2)})`;const f=$('#finish').getBoundingClientRect();const p=clamp((innerHeight-f.top)/(innerHeight+260));clouds.forEach((c,i)=>{const distance=[100,60,20][i];c.style.transform=`translate3d(${(i%2?-1:1)*(1-p)*20}px,${(1-p)*distance}px,0)`;});}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
function sync(){if(off()){stopLoader();groups.forEach(g=>{g.classList.remove('word-armed');const state=wordStates.get(g);state.token++;state.visible=true;g.querySelectorAll('.word-ink').forEach(w=>w.style.transform='translate3d(0,0,0)');});running.forEach(a=>a.cancel());}request();}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});reduced.addEventListener('change',sync);
intro();request();
})();
