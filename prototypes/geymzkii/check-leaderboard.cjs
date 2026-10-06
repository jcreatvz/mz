const assert=require('node:assert/strict'),fs=require('node:fs');
const {parseCSV,rank,aura,clock}=require('./leaderboard.js');
const rows=parseCSV(fs.readFileSync(__dirname+'/results.csv','utf8'));
assert.equal(rank(rows)[0].display_name,'LUTZKII');assert.equal(rank(rows)[0].gold_bolts,'517');assert.equal(aura(rows[0]),'BOLT SOVEREIGN');assert.equal(clock(397.27),'6:37.27');
assert.equal(parseCSV('name,n\r\n"A, B",1\r\n')[0].name,'A, B');
const a={...rows[0],run_id:'second',gold_bolts:'518',time_seconds:'499'};assert.equal(rank([rows[0],a])[0].run_id,'second');
assert.equal(rank([rows[0],{...rows[0],completed:'FALSE'}]).length,1);assert.equal(rank([rows[0],rows[0]]).length,1);assert.equal(rank([{...rows[0],time_seconds:'nope'}]).length,0);
console.log('PASS: real CSV, quoted cells, rank order, aura, invalid scores and duplicate IDs.');
