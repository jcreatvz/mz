/* Pure simulation: rendering, DOM, media loading and site motion stay separate. */
(() => {
  'use strict';
  const HAZARDS = Object.freeze({
    banana:{width:72,height:59,hitWidth:48,hitHeight:23,slip:'stumble'},
    ice:{width:92,height:33,hitWidth:75,hitHeight:13,slip:'slide'},
    barrier:{width:84,height:80,hitWidth:66,hitHeight:68,slip:'bump'},
    cone:{width:52,height:62,hitWidth:32,hitHeight:46,slip:'bump'},
    pothole:{width:92,height:31,hitWidth:66,hitHeight:15,slip:'stumble'}
  });
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  class RunEngine {
    constructor({width=1200,height=440,random=Math.random}={}) {
      this.random=random;this.width=width;this.height=height;this.reset();
    }
    get ground(){return this.height-65;}
    get runnerX(){return Math.max(45,Math.min(160,this.width*.12));}
    get speed(){return Math.min(470,Math.min(280+this.elapsed*1.5, this.width<750?360:470))*(this.stumble>0?.84:1);}
    reset(){
      this.phase='ready';this.health=10;this.elapsed=0;this.distance=0;this.drops=0;this.bonus=0;
      this.lift=0;this.velocity=0;this.invulnerable=0;this.stumble=0;this.slip='';
      this.hazards=[];this.pickups=[];this.events=[];this.hazardTimer=2.1;this.waterTimer=.75;
      this.jumpBuffer=0;this.milestone=false;this.lastDamage=null;
    }
    start(){this.reset();this.phase='running';}
    pause(){if(this.phase==='running')this.phase='paused';}
    resume(){if(this.phase==='paused')this.phase='running';}
    jump(){if(this.phase!=='running')return false;this.jumpBuffer=.13;if(this.lift<=.001){this.velocity=760;this.jumpBuffer=0;return true;}return false;}
    playerBounds(){return {x:this.runnerX+47,y:this.ground-this.lift-111,w:58,h:110};}
    damage(type){
      if(this.invulnerable>0||this.phase!=='running')return false;
      this.health=Math.max(0,this.health-1);this.invulnerable=1.15;this.stumble=.45;this.slip=HAZARDS[type]?.slip||'bump';this.lastDamage=type;
      this.events.push({type:'damage',hazard:type,health:this.health});
      if(this.health===0){this.phase='over';this.events.push({type:'over'});}return true;
    }
    collect(){
      if(this.phase!=='running')return;
      const restored=this.health<10;this.health=Math.min(10,this.health+1);this.drops++;if(!restored)this.bonus+=10;
      this.events.push({type:'water',restored,health:this.health});
    }
    resize(width,height=this.height){
      const shift=width-this.width;this.hazards.forEach(o=>{if(o.x>this.width)o.x+=shift;});this.pickups.forEach(o=>{if(o.x>this.width)o.x+=shift;});this.width=width;this.height=height;
    }
    spawnHazard(){
      const choices=this.elapsed<12?['banana','ice','barrier']:this.elapsed<35?['banana','ice','barrier','cone']:Object.keys(HAZARDS);
      const type=choices[Math.min(choices.length-1,Math.floor(this.random()*choices.length))];
      this.hazards.push({type,x:this.width+100,hit:false,...HAZARDS[type]});
    }
    spawnWater(){
      const high=this.random()>.48;
      this.pickups.push({x:this.width+50,y:this.ground-(high?150:78),size:29});
      if(high)this.pickups.push({x:this.width+115,y:this.ground-120,size:29});
    }
    step(dt){
      if(this.phase!=='running')return;
      dt=Math.max(0,Math.min(dt,.05));this.elapsed+=dt;this.distance+=this.speed*dt/65;
      this.invulnerable=Math.max(0,this.invulnerable-dt);this.stumble=Math.max(0,this.stumble-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
      this.lift+=this.velocity*dt;this.velocity-=1800*dt;
      if(this.lift<=0){this.lift=0;this.velocity=0;if(this.jumpBuffer>0){this.velocity=760;this.jumpBuffer=0;}}
      const dx=this.speed*dt;
      this.hazardTimer-=dt;this.waterTimer-=dt;
      if(this.hazardTimer<=0){this.spawnHazard();this.hazardTimer=Math.max(1.35,2.1-this.elapsed*.004)+this.random()*.65;}
      if(this.waterTimer<=0){this.spawnWater();this.waterTimer=3.9+this.random()*1.5;}
      const player=this.playerBounds();
      for(const o of this.hazards){
        o.x-=dx;const box={x:o.x+(o.width-o.hitWidth)/2,y:this.ground-o.hitHeight,w:o.hitWidth,h:o.hitHeight};
        if(!o.hit&&overlaps(player,box)){o.hit=true;this.damage(o.type);}
      }
      for(const o of this.pickups){o.x-=dx;if(!o.collected&&overlaps(player,{x:o.x,y:o.y,w:o.size,h:o.size})){o.collected=true;this.collect();}}
      this.hazards=this.hazards.filter(o=>o.x+o.width>-20);this.pickups=this.pickups.filter(o=>!o.collected&&o.x+o.size>-20);
      if(this.elapsed>=60&&!this.milestone&&this.phase==='running'){this.milestone=true;this.events.push({type:'milestone'});}
    }
    drainEvents(){return this.events.splice(0);}
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={RunEngine,HAZARDS};
  else window.MetroRunEngine=RunEngine;
})();
