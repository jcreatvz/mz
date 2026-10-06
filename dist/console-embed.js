(()=>{
 'use strict';
 const frame=document.querySelector('#mz-console-frame'),shell=document.querySelector('#game-shell');
 if(!frame||!shell)return;
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
  const data=event.data;if(!data||typeof data!=='object')return;
  if(data.type==='mz-console-height'&&Number.isFinite(data.height))frame.style.height=Math.max(420,Math.min(3200,data.height))+'px';
  if(data.type==='mz-console-state')shell.dataset.state=data.state==='running'?'running':'paused';
  if(data.type==='mz-console-results'&&Number.isFinite(data.top))window.scrollTo({top:window.scrollY+frame.getBoundingClientRect().top+Math.max(0,Math.min(2500,data.top))-90,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 });
 new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)frame.contentWindow?.postMessage({type:'mz-console-pause'},location.origin==='null'?'*':location.origin);},{threshold:0}).observe(frame);
})();
