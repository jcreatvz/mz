const assert = require('node:assert/strict');
const {Game, HEADER, csv} = require('./engine.js');
function fresh(){const g=new Game(()=>.5);g.start();g.hazardTimer=g.boltTimer=g.waterTimer=1e6;return g;}
function advance(g,seconds,input={}){for(let n=0;n<seconds*120;n++)g.step(1/120,input);}
let g=fresh();assert.equal(g.boost(),true);assert.equal(g.juice,7);assert.equal(g.boost(),false);advance(g,29);assert(g.boostTime>0);advance(g,2);assert.equal(g.boostTime,0);g.juice=3;assert.equal(g.boost(),false);g.juice=4;assert.equal(g.boost(),true);assert.equal(g.juice,1);
g=fresh();advance(g,2);const normal=g.speed;g.juice=5;advance(g,2);assert(g.speed<normal);const half=g.speed;g.juice=1;advance(g,2);assert(g.speed<half);
g=fresh();g.phase='paused';advance(g,10);assert.equal(g.distance,0);assert.equal(g.elapsed,0);g.phase='running';advance(g,5,{right:true});assert.equal(g.x,460);advance(g,5,{left:true});assert.equal(g.x,60);
function peak(hold){const j=fresh();j.jump();let max=0;for(let i=0;i<150;i++){j.step(1/120,{up:hold});max=Math.max(max,j.lift);}return max;}
assert(peak(true)>peak(false)+40);
g=fresh();g.step(1/120,{down:true});assert.equal(g.bounds().h,72);g.step(1/120,{});assert.equal(g.bounds().h,108);
for(const duck of [false,true]){g=fresh();g.objects=[{kind:'bird',x:g.x+45,y:310,w:65,h:36,age:0}];g.step(1/120,{down:duck});assert.equal(g.juice,duck?10:9);}
g=fresh();g.juice=4;g.objects=[{kind:'water',x:g.x+45,y:345,w:34,h:40}];g.step(1/120);assert.equal(g.juice,5);assert.equal(g.waters,1);
g=fresh();g.damage('cone');g.damage('ice');assert.equal(g.juice,9);g.inv=0;g.juice=1;g.damage('cone');assert.equal(g.phase,'over');const elapsed=g.elapsed;advance(g,5);assert.equal(g.elapsed,elapsed);
g=fresh();advance(g,480);assert.equal(g.phase,'finished');assert.equal(g.distance,8000);assert(g.elapsed>360&&g.elapsed<480);assert.equal(g.segment,7);assert(g.stats().completed);console.log('Clean course:',g.elapsed.toFixed(2),'seconds');
const row=csv({display_name:' =SUM(1,2)\n"JC"',completed:true});assert(row.startsWith(HEADER.join(',')+'\r\n'));assert(row.includes('"\' =SUM(1,2) ""JC"""'));assert.equal(row.split('\r\n').length,3);
g=fresh();g.waterTimer=0;g.step(1/120);assert.equal(g.objects.filter(o=>o.kind==='water').length,1);assert(g.waterTimer>=18);assert(g.waterTimer<=23);
console.log('PASS: boost, speed, pause, movement, variable jump, duck/bird collisions, water, damage immunity, finish, CSV escaping.');

g=fresh();assert(g.jump());advance(g,.2,{up:true});const firstLift=g.lift;assert(g.jump());assert.equal(g.jump(),false);advance(g,.2,{up:true});assert(g.lift>firstLift);advance(g,2);assert.equal(g.lift,0);assert.equal(g.jumps,0);assert(g.jump());
g=fresh();g.viewWidth=560;advance(g,4,{right:true});assert(g.x<=350);g.hazard();assert.equal(g.objects.at(-1).x,610);
console.log('PASS: 30-second boost, double jump limit/reset, narrow-camera bounds and spawns.');

g=fresh();g.distance=7990;advance(g,2);assert.equal(g.phase,'finished');const world=g.world,flag=g.finishX;advance(g,5);assert.equal(g.world,world);assert.equal(g.finishX,flag);assert.equal(g.speed,0);assert(flag>0&&flag<g.viewWidth);
console.log('PASS: finish freezes the camera and grounded flag.');
