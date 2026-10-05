const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../dist/run-gallery.js'),'utf8');
const code=source.slice(source.indexOf('function automatic()'),source.indexOf('function request()'));
const ctx=vm.createContext({Math,document:{hidden:false}});
vm.runInContext(`const wrap=(v,n)=>((v%n)+n)%n,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));let disabled=false;const off=()=>disabled;let nodes=[440,248,440,248,440,248].map((w,i,all)=>({el:{style:{}},w,start:all.slice(0,i).reduce((s,v)=>s+v+40,0)}));let width=1200,span=nodes.reduce((s,n)=>s+n.w+40,0),margin=920,target=0,current=0,raf=0,last=0,visible=true,paused=false,hover=false,focused=false,drag=null,resumeAt=0,calls=0;function request(){calls++;}${code}`,ctx);
const run=s=>vm.runInContext(s,ctx);
run('paint(16)');assert(run('target>0'));
for(const state of ['hover','focused','paused']){run(`${state}=true;constBefore=target;paint(32)`);assert(run('target===constBefore'));run(`${state}=false`);}
run('paused=true;current=target=0;paint(64)');const first=run('JSON.stringify(nodes.map(n=>n.el.style.transform))');
for(const dir of [-1,1]){run(`current=target=${dir}*span;paint(80)`);assert.equal(run('JSON.stringify(nodes.map(n=>n.el.style.transform))'),first);}
run('disabled=true;target=123;paint(96)');assert.equal(run('current'),123);assert(run('nodes.every(n=>n.el.style.transform.endsWith("scale(1)"))'));
run('visible=false;constBefore=current;target=500;calls=0;paint(112)');assert(run('current===constBefore&&calls===0'));
console.log('PASS: variable-width seamless wrap, autoplay, hover/focus/pause, reduced motion and offscreen shutdown.');
