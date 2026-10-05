(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let saved=null;try{saved=localStorage.getItem('metro-motion-v2');}catch(e){}
 const enabled=!reduced&&saved!=='off';document.body.classList.add('motion-study');
 const scenes=[...document.querySelectorAll('#main > .scene')];
 scenes.forEach(scene=>{const shell=document.createElement('div');shell.className='scene-hold';scene.before(shell);shell.append(scene);});
 function measure(){}
 // Keep hero words inside its existing front/back layers. Route type stays intact.
 const selectors='.hero-line,.finale-words>span,h1:not(.hero-title),h2:not(.wide-type),h3';
 const groups=[...document.querySelectorAll(selectors)].filter(el=>!el.closest('dialog,.game-overlay'));
 groups.forEach(group=>{
  const walker=document.createTreeWalker(group,NodeFilter.SHOW_TEXT);const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);let index=group.matches('.finale-words>span:last-child')?1:0;
  nodes.forEach(node=>{const frag=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(token=>{if(!token)return;if(/^\s+$/.test(token)){frag.append(document.createTextNode(token));return;}const slot=document.createElement('mz-word');slot.className='word-slot';const ink=document.createElement('mz-ink');ink.className='word-ink';ink.textContent=token;ink.style.setProperty('--word-from',index++%2?'115%':'-115%');slot.append(ink);frag.append(slot);});node.replaceWith(frag);});
  group.dataset.wordGroup='';if(enabled)group.classList.add('word-armed');
 });
 window.MZDraft={groups,measure};
 // A failed enhancement must never leave the page unreadable.
 window.MZDraft.failsafe=setTimeout(()=>groups.forEach(g=>g.classList.remove('word-armed')),5000);
})();
