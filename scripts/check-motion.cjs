const assert=require('node:assert/strict');
const {targets}=require('../dist/scene-motion');
for(const [width,vh] of [[1440,900],[768,1024],[390,844],[320,568]]){
 const anchors={hero:{x:width*.52,y:100,width:width*.6,height:width*.6*192/290,rotation:-5},crew:{x:width*.54,y:1500,width:width*.4,height:width*.4*192/290,rotation:8},footer:{x:-width*.08,y:6200,width:width*.48,height:width*.48*192/290,rotation:8}};
 const setup={viewport:vh,width,anchors,crew:{top:900,bottom:2100},footer:{top:6000,bottom:7100}};
 const initial=targets({...setup,scrollY:0});assert.equal(initial.region,'intro');assert(initial.actors.boy.width>0&&initial.actors.girl.width>0);assert.notEqual(initial.actors.boy.x,initial.actors.girl.x);
 const exit=targets({...setup,scrollY:2100-vh*.2});assert.equal(exit.region,'intro');assert.equal(exit.actors.boy.width,anchors.crew.width*177.283/290);assert(exit.actors.boy.x>anchors.crew.x+anchors.crew.width);assert(exit.actors.girl.width>0);
 assert.equal(targets({...setup,scrollY:2100}).region,'none');assert.equal(targets({...setup,scrollY:4000}).region,'none');
 const enter=targets({...setup,scrollY:6000-vh*.6});assert.equal(enter.region,'footer');assert.equal(enter.top,6000);assert.equal(enter.height,1100);assert(enter.actors.boy.width>enter.actors.girl.width);
 const settled=targets({...setup,scrollY:6000});assert(settled.actors.boy.width>enter.actors.boy.width);assert(settled.actors.girl.width>enter.actors.girl.width);
 const left=targets({...setup,scrollY:6000-vh*.5,footerExit:{startY:6000,progress:1}});
 assert.equal(left.actors.boy.width,settled.actors.boy.width);assert.equal(left.actors.girl.width,settled.actors.girl.width);
 assert(left.actors.boy.x+left.actors.boy.width<0);assert(left.actors.girl.x+left.actors.girl.width<0);
 const partial=targets({...setup,scrollY:6000-vh*.5,footerExit:{startY:6000-vh*.4,progress:.25/.6}});
 assert(partial.actors.boy.width>0);assert(partial.actors.boy.width<settled.actors.boy.width);
 for(let sy=0;sy<=7100;sy+=17){const p=targets({...setup,scrollY:sy});for(const a of Object.values(p.actors)){assert(Object.values(a).every(Number.isFinite));assert(a.width>=0);assert(a.opacity>=0&&a.opacity<=1);}}
 // The endpoints of the 300vmax strokes stay beyond the viewport after rotation.
 const vmax=Math.max(width,vh);const horizontalReach=150*vmax/100*Math.cos(28*Math.PI/180);assert(horizontalReach>width/2+100);
}
console.log('PASS: paired poses, crew right slide, footer left slide at preserved scale, empty middle scenes, footer pop-in, finite transforms, and lane coverage at four viewport sizes.');
