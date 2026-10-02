/* Three-scene choreography, independent of the renderer and animation library. */
(() => {
  'use strict';
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const lerp=(a,b,t)=>a+(b-a)*t;
  const popIn=t=>{t=clamp(t);return 1-(1-t)**3+.055*Math.sin(Math.PI*t);};
  const parts={boy:{x:112.48,y:0,w:177.283,h:181.17,delay:0},girl:{x:5.75,y:6.69,w:148.905,h:181.82,delay:.045}};
  function compose(pair,part,scale){
    const factor=pair.width/290,w=part.w*factor,h=part.h*factor;
    return {x:pair.x+part.x*factor+w*(1-scale)/2,y:pair.y+part.y*factor+h*(1-scale)/2,width:w*scale,rotation:pair.rotation,opacity:clamp(scale*3)};
  }
  function targets({scrollY:sy,viewport:vh,width:vw=1440,anchors,crew,footer,footerExit=null}){
    const hero=anchors.hero,end=anchors.crew,last=anchors.footer;
    if(!hero||!end||!last||!crew||!footer)return {region:'none',actors:{}};
    const footerStart=footer.top-vh*.65;
    if(sy>=footerStart){
      const progress=clamp((sy-footerStart)/(vh*.6));
      return {region:'footer',top:footer.top,height:footer.bottom-footer.top,actors:Object.fromEntries(Object.entries(parts).map(([name,part])=>{
        const sourceProgress=footerExit?footerExit.progress:progress;
        const t=clamp((sourceProgress-part.delay)/(1-part.delay));
        const pose=compose(last,part,popIn(t));
        if(footerExit){
          const exit=smooth((footerExit.startY-sy)/(vh*.6));
          pose.x-=exit*(Math.max(0,last.x)+last.width+vw*.15);
        }
        return [name,pose];
      }))};
    }
    if(sy>=crew.bottom)return {region:'none',actors:{}};
    const travel=clamp(sy/Math.max(1,end.y+end.height*.5-vh*.58));
    const exit=clamp((sy-(crew.bottom-vh*.68))/(vh*.58));
    const actors=Object.fromEntries(Object.entries(parts).map(([name,part])=>{
      const t=smooth((travel-part.delay)/(1-part.delay));
      const pair={x:lerp(hero.x,end.x,t),y:lerp(hero.y,end.y,t),width:lerp(hero.width,end.width,t),rotation:lerp(hero.rotation,end.rotation,t)};
      const slide=smooth((exit-part.delay)/(1-part.delay));
      pair.x+=slide*(vw-Math.min(hero.x,end.x)+Math.max(hero.width,end.width)+vw*.15);
      return [name,compose(pair,part,1)];
    }));
    return {region:Object.values(actors).every(a=>a.opacity<.001)?'none':'intro',top:0,height:crew.bottom,actors};
  }
  const api={targets,popIn};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.MetroSceneMotion=api;
})();
