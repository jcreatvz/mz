/* MZ photo rail: adapted from user-supplied Originkit SmoothScrollSlider.
   Natural aspect ratios, inertial input, seamless looping, and 24px/s auto drift.
   Autoplay pauses on hover/focus/drag, when hidden, and for reduced/site motion off. */
(()=>{
'use strict';
const root=document.querySelector('.photo-rail');if(!root)return;
const view=root.querySelector('.run-slider-viewport'),toggle=root.querySelector('.run-autoplay');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const off=()=>reduced.matches||document.body.classList.contains('motion-off');
const wrap=(v,n)=>((v%n)+n)%n,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const source=JSON.parse(document.querySelector('#mz-run-photos').textContent);
let nodes=[],width=0,height=0,cycle=1,span=1,margin=1,current=0,target=0,raf=0,last=0,visible=false,drag=null,hover=false,focused=false,paused=false,resumeAt=0;
function createCard(item,index,copy,w,h,start){
 const el=document.createElement('div');el.className='rail-slide';el.style.width=`${w}px`;el.style.height=`${h}px`;
 if(copy)el.setAttribute('aria-hidden','true');else {el.setAttribute('role','group');el.setAttribute('aria-roledescription','slide');el.setAttribute('aria-label',`${index+1} of ${source.length}`);}
 if(item.type==='info')el.append(document.querySelector('#run-info-card').content.cloneNode(true));
 else {
  const img=document.createElement('img');img.src=item.src;img.alt=copy?'':item.alt;img.draggable=false;img.decoding='async';img.loading='lazy';img.width=item.width;img.height=item.height;img.style.objectPosition=item.objectPosition||'50% 50%';el.append(img);
 }
 view.append(el);return {el,w,start};
}
function rebuild(){
 const previous=cycle; width=view.clientWidth;height=clamp(width*.24,200,310);
 const gap=width<600?24:40;const sizes=source.map(item=>height*clamp(item.width/item.height,.55,1.9));
 cycle=sizes.reduce((sum,w)=>sum+w+gap,0);current=current/previous*cycle;target=target/previous*cycle;
 margin=Math.max(...sizes)*2+gap;
 const repeats=Math.max(1,Math.ceil((width+margin*2)/cycle));span=cycle*repeats;
 view.replaceChildren();nodes=[];let start=0;
 for(let copy=0;copy<repeats;copy++)source.forEach((item,i)=>{nodes.push(createCard(item,i,copy,sizes[i],height,start));start+=sizes[i]+gap;});
 last=0;request();
}
function automatic(){return !off()&&!paused&&!hover&&!focused&&!drag;}
function paint(now){
 raf=0;if(!visible||document.hidden){last=0;return;}
 const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
 if(!nodes.length||!width)return;
 const auto=automatic();if(auto&&now>=resumeAt)target+=24*dt;
 if(Math.abs(current)>span){const shift=Math.trunc(current/span)*span;current-=shift;target-=shift;}
 current+=(target-current)*(off()?1:1-Math.pow(.98,dt*60));
 if(Math.abs(target-current)<.05)current=target;
 const pad=(width-nodes[0].w)/2;
 nodes.forEach(({el,w,start})=>{
  const x=wrap(start-current+pad+margin,span)-margin;
  const distance=x+w/2-width/2;
  const scale=off()?1:clamp(1+distance/width,.1,2.5);
  const push=distance>0?(scale-1)*w*.75:0;
  el.style.transform=`translate3d(${x+push}px,-50%,0) scale(${scale})`;
  el.style.filter=off()?'none':`brightness(${1-(1-Math.min(1,scale))/.9*.4})`;
 });
 if(auto||Math.abs(target-current)>.05)request();else last=0;
}
function request(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(paint);}
function move(delta){target+=delta;resumeAt=performance.now()+1600;request();}
function step(direction){
 // Variable-width cards: move to the next actual card centre, including wraparound.
 const firstWidth=nodes[0].w;let best=direction>0?Infinity:-Infinity;
 nodes.forEach(({start,w})=>{const center=start+(w-firstWidth)/2;let d=wrap(center-target,span);if(direction<0)d=d<.5?-span:d-span;else if(d<.5)d=span;if(direction>0?d<best:d>best)best=d;});
 move(best);
}
root.querySelector('.run-prev').addEventListener('click',()=>step(-1));root.querySelector('.run-next').addEventListener('click',()=>step(1));
function syncToggle(){toggle.disabled=off();toggle.setAttribute('aria-pressed',String(paused||off()));toggle.textContent=paused||off()?'Play':'Pause';toggle.setAttribute('aria-label',paused||off()?'Play gallery':'Pause gallery');toggle.title=off()?'Enable site motion to play the gallery':'';request();}
toggle.addEventListener('click',()=>{paused=!paused;syncToggle();});
view.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
view.addEventListener('wheel',e=>{if(e.ctrlKey)return;const unit=e.deltaMode===1?16:e.deltaMode===2?view.clientHeight:1;const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*unit;if(delta){e.preventDefault();move(clamp(delta,-width,width));}},{passive:false});
view.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,axis:null};});
view.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.axis&&Math.max(Math.abs(dx),Math.abs(dy))>6){drag.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';if(drag.axis==='x'){view.setPointerCapture(e.pointerId);view.classList.add('is-dragging');}}if(drag.axis==='x'){e.preventDefault();move((drag.lastX-e.clientX)*1.8);drag.lastX=e.clientX;}});
function end(e){if(!drag||drag.id!==e.pointerId)return;drag=null;view.classList.remove('is-dragging');if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);request();}
view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);view.addEventListener('dragstart',e=>e.preventDefault());
root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});root.addEventListener('pointerleave',e=>{hover=false;if(drag&&!drag.axis)end(e);request();});
root.addEventListener('focusin',()=>{focused=true;});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){focused=false;request();}});
new ResizeObserver(()=>{if(Math.abs(view.clientWidth-width)>1)rebuild();}).observe(view);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request();}else if(raf){cancelAnimationFrame(raf);raf=0;last=0;}}).observe(root);
new MutationObserver(syncToggle).observe(document.body,{attributes:true,attributeFilter:['class']});reduced.addEventListener('change',syncToggle);
document.addEventListener('visibilitychange',()=>{last=0;request();});rebuild();syncToggle();
})();
