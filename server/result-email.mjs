/* Deploy server-side only. No recipient or sender credentials enter public assets. */
const attempts=new Map();
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');const allowed=env.MZ_SITE_ORIGIN;
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 if(allowed&&origin===allowed){headers['Access-Control-Allow-Origin']=allowed;headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(!allowed||origin!==allowed)return reply({error:'Origin not allowed.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='POST')return reply({error:'Use POST.'},405);
 if(!env.RESEND_API_KEY||!env.MZ_RESULTS_FROM||!env.MZ_RESULTS_TO)return reply({error:'Direct submissions are not connected yet.'},503);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'Use JSON.'},415);
 if(Number(request.headers.get('Content-Length'))>8192)return reply({error:'Result is too large.'},413);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown',now=Date.now();
 for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
 const count=attempts.get(ip)||{count:0,until:now+60000};if(count.count>=6)return reply({error:'Please wait a minute before trying again.'},429);count.count++;attempts.set(ip,count);
 let r;try{const raw=await request.text();if(raw.length>8192)return reply({error:'Result is too large.'},413);r=JSON.parse(raw);}catch{return reply({error:'Invalid result.'},400);}
 if(!r||r.completed!==true||r.course_version!=='rgc-arcade-v2'||r.distance_m!==8000||typeof r.display_name!=='string'||!r.display_name.trim()||r.display_name.length>28||/[\r\n]/.test(r.display_name)||typeof r.run_id!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(r.run_id))return reply({error:'A completed run and display name are required.'},400);
 const limits={time_seconds:[1,7200],gold_bolts:[0,10000],average_arcade_kmh:[0,200],peak_arcade_kmh:[0,200],juice_remaining:[1,10],boosts_used:[0,1000],hazards_hit:[0,1000]};
 for(const [key,[lo,hi]] of Object.entries(limits))if(typeof r[key]!=='number'||!Number.isFinite(r[key])||r[key]<lo||r[key]>hi)return reply({error:'Invalid run statistics.'},400);
 const text=['METRO ZOOMIN’ — PLAYER SUBMISSION','Runner: '+r.display_name.trim(),'Run ID: '+r.run_id,'Course: '+r.course_version,'Distance: 8000 m',...Object.keys(limits).map(k=>k+': '+r[k]),'Captured: '+new Date().toISOString(),'Casual, client-reported result.'].join('\n');
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'mz-run/'+r.run_id},body:JSON.stringify({from:env.MZ_RESULTS_FROM,to:[env.MZ_RESULTS_TO],subject:'MZ score — '+r.display_name.trim(),text}),signal:AbortSignal.timeout(10000)});const data=await response.json();if(!response.ok||!data.id)return reply({error:'The score could not be sent. Please retry.'},502);return reply({sent:true});}catch{return reply({error:'Sending timed out. Please retry.'},502);}
}};
