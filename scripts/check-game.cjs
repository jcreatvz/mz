/* Focused simulation checks for actual game rules and collision edge cases. */
const assert=require('node:assert/strict');
const {RunEngine,HAZARDS}=require('../dist/game-engine.js');
const engine=()=>new RunEngine({random:()=>.1});
const tick=(g,seconds)=>{for(let t=0;t<seconds;t+=1/120)g.step(1/120);};
let g=engine();g.start();assert.equal(g.health,10);assert(g.jump());tick(g,.2);assert(g.lift>85);tick(g,.65);assert.equal(g.lift,0);
g=engine();g.start();assert(g.damage('banana'));assert.equal(g.health,9);assert.equal(g.slip,'stumble');assert(!g.damage('ice'));tick(g,1.2);assert(g.damage('ice'));assert.equal(g.health,8);assert.equal(g.slip,'slide');g.collect();assert.equal(g.health,9);g.collect();g.collect();assert.equal(g.health,10);assert.equal(g.drops,3);assert.equal(g.bonus,10);
for(const type of Object.keys(HAZARDS)){
  g=engine();g.start();const props=HAZARDS[type];const body=g.playerBounds();g.hazards.push({type,x:body.x-(props.width-props.hitWidth)/2,hit:false,...props});g.step(1/120);assert.equal(g.health,9,`${type} must collide at road level`);
  g=engine();g.start();g.jump();tick(g,.2);g.hazards.push({type,x:g.playerBounds().x-(props.width-props.hitWidth)/2,hit:false,...props});g.step(1/120);assert.equal(g.health,10,`${type} can be cleared with a jump`);
}
g=engine();g.start();g.hazardTimer=Infinity;g.waterTimer=Infinity;g.hazards.push({type:'barrier',x:g.playerBounds().x+g.playerBounds().w+60,hit:false,...HAZARDS.barrier});g.jump();tick(g,1);assert.equal(g.health,10,'A full moving barricade must be clearable with a well-timed jump');
g=engine();g.start();g.health=1;g.damage('barrier');assert.equal(g.phase,'over');g.collect();assert.equal(g.health,0,'A pickup cannot resurrect an ended run');
g=engine();g.start();tick(g,1);const time=g.elapsed;g.pause();tick(g,2);assert.equal(g.elapsed,time);g.resume();tick(g,.1);assert(g.elapsed>time);
g=engine();g.start();g.hazardTimer=Infinity;g.waterTimer=Infinity;tick(g,60.1);assert(g.milestone);assert.equal(g.drainEvents().filter(e=>e.type==='milestone').length,1);tick(g,1);assert(!g.drainEvents().some(e=>e.type==='milestone'));
g=engine();g.start();g.width=550;tick(g,150);assert(g.speed<=360);assert(g.health>=0&&g.health<=10);
console.log('PASS: jump clearance; all five hazards; 10-bar cap; pickups; recovery window; game over; pause/resume; one-minute milestone; mobile speed cap.');
