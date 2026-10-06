/* GEYMZKII draft 01. Pure simulation; no DOM, network or storage. */
(function(root){
'use strict';
const ROUTE=['RGC','River Valley','Victoria Park','Emily Murphy','University of Alberta','High Level Bridge View','Walterdale','RGC'];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
class Game{
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){Object.assign(this,{phase:'ready',distance:0,elapsed:0,juice:10,bolts:0,waters:0,boosts:0,hits:0,peak:0,x:160,lift:0,vy:0,duck:false,boostTime:0,inv:0,stumble:0,speed:280,world:0,jumpHeld:false,objects:[],events:[],hazardTimer:4,boltTimer:1,waterTimer:17});}
 start(){this.reset();this.phase='running';}
 get progress(){return clamp(this.distance/8000,0,1);}
 get segment(){return Math.min(7,Math.floor(this.progress*7));}
 get kmh(){return this.speed/18*3.6;}
 get ground(){return 440;}
 jump(){if(this.phase!=='running'||this.lift>0)return false;this.duck=false;this.vy=610;return true;}
 boost(){if(this.phase!=='running'||this.juice<4||this.boostTime>0){this.events.push({type:'notice',text:this.boostTime>0?'Boost active':'Need 4 Juice to boost'});return false;}this.juice-=3;this.boostTime=3;this.boosts++;this.events.push({type:'notice',text:'ZOOM! −3 JUICE'});return true;}
 bounds(){const h=this.duck?72:108;return{x:this.x+45,y:this.ground-this.lift-h,w:58,h};}
 damage(type){if(this.inv>0||this.phase!=='running')return;this.juice=Math.max(0,this.juice-1);this.hits++;this.inv=1.25;this.stumble=.4;this.events.push({type:'notice',text:`${type==='bird'?'Bird':type} · −1 JUICE`});if(!this.juice){this.phase='over';this.boostTime=0;}}
 hazard(){const choices=this.distance<900?['banana','cone']:this.distance<2000?['banana','ice','barrier','cone']:['banana','ice','barrier','cone','pothole','bird'];const kind=choices[Math.floor(this.random()*choices.length)];const dims={banana:[70,30],ice:[88,18],barrier:[78,83],cone:[48,60],pothole:[88,20],bird:[65,36]};const [w,h]=dims[kind];this.objects.push({kind,x:1250,y:this.ground-h,w,h,age:0,hit:false});}
 step(dt,input={}){
 if(this.phase!=='running')return;dt=clamp(dt,0,.04);this.elapsed+=dt;
 this.duck=!!input.down&&this.lift<=0;
 this.x=clamp(this.x+((input.right?1:0)-(input.left?1:0))*240*dt,60,460);
 const low=this.juice<=5?.60+.065*this.juice:1;
 const desired=(280+140*this.progress)*low*(this.boostTime>0?1.65:1)*(this.stumble>0?.78:1);
 this.speed+=(desired-this.speed)*(1-Math.exp(-4*dt));this.peak=Math.max(this.peak,this.kmh);
 const dx=this.speed*dt;this.world+=dx;this.distance=Math.min(8000,this.distance+dx/18);
 this.boostTime=Math.max(0,this.boostTime-dt);this.inv=Math.max(0,this.inv-dt);this.stumble=Math.max(0,this.stumble-dt);
 this.lift+=this.vy*dt;this.vy-=(input.up&&this.vy>0?1250:1900)*dt;
 if(this.lift<=0){this.lift=0;this.vy=0;}
 this.hazardTimer-=dt;this.boltTimer-=dt;this.waterTimer-=dt;
 if(this.hazardTimer<=0){this.hazard();this.hazardTimer=3.5-this.progress+.7*this.random();}
 if(this.boltTimer<=0){const high=this.random()>.48;for(let i=0;i<5;i++)this.objects.push({kind:'bolt',x:1250+i*58,y:this.ground-(high?105+Math.sin(i/4*Math.PI)*70:65),w:24,h:30});this.boltTimer=2.6+this.random()*1.2;}
 if(this.waterTimer<=0){this.objects.push({kind:'water',x:1250,y:this.ground-95,w:34,h:40});this.waterTimer=18+this.random()*5;}
 const player=this.bounds();
 for(const o of this.objects){o.x-=dx;o.age=(o.age||0)+dt;if(o.kind==='bird')o.y=this.ground-130+Math.sin(o.age*3)*10;
  if(o.gone||o.hit)continue;
  if(hit(player,{x:o.x+5,y:o.y+4,w:o.w-10,h:o.h-5})){
   if(o.kind==='bolt'){o.gone=true;this.bolts++;}
   else if(o.kind==='water'){o.gone=true;this.juice=Math.min(10,this.juice+1);this.waters++;this.events.push({type:'notice',text:'WATER · +1 JUICE'});}
   else {o.hit=true;this.damage(o.kind);if(this.phase==='over')break;}
  }
 }
 this.objects=this.objects.filter(o=>!o.gone&&o.x+o.w>-100);
 if(this.distance>=8000&&this.phase==='running'){this.phase='finished';this.events.push({type:'finish'});}
 }
 stats(){return {distance_m:Math.round(this.distance),time_seconds:+this.elapsed.toFixed(2),gold_bolts:this.bolts,average_arcade_kmh:this.elapsed?+(this.distance/this.elapsed*3.6).toFixed(1):0,peak_arcade_kmh:+this.peak.toFixed(1),juice_remaining:this.juice,boosts_used:this.boosts,hazards_hit:this.hits,completed:this.phase==='finished'};}
}
const HEADER=['run_id','submitted_at_utc','display_name','course_version','completed','distance_m','time_seconds','gold_bolts','average_arcade_kmh','peak_arcade_kmh','juice_remaining','boosts_used','hazards_hit'];
function csvCell(value){let s=String(value??'').replace(/[\r\n]+/g,' ');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function csv(record,header=true){return (header?HEADER.join(',')+'\r\n':'')+HEADER.map(k=>csvCell(record[k])).join(',')+'\r\n';}
const api={Game,ROUTE,HEADER,csv};if(typeof module!=='undefined')module.exports=api;else root.MZGame=api;
})(typeof window==='undefined'?globalThis:window);
