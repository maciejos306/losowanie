const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1700,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const live=JSON.parse(fs.readFileSync('live/schedules/5oa2kdmu.json','utf8'));const shifts=JSON.parse(fs.readFileSync('live/app/shifts.json','utf8')).items;const emps=JSON.parse(fs.readFileSync('live/app/employees.json','utf8')).items;
const viol=()=>pg.evaluate(()=>{const s=S.scheds[S.current];const m={};S.shifts.forEach(x=>m[x.id]=x);const out=[];for(const c of s.cells){if(c.empId==null)continue;const r=restOf(m[c.shiftId]);for(let i=1;i<=r;i++){const d=addDays(c.date,i);s.cells.filter(x=>x.empId===c.empId&&x.date===d).forEach(x=>out.push(c.empId+' '+c.date+' '+c.shiftId+' -> '+d+' '+x.shiftId))}}return out});
const load=async(doc)=>pg.evaluate(async([doc,shifts,emps])=>{Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.shifts=shifts;S.emps=emps;S.scheds[doc.id]=doc;S.current=doc.id;__docs['schedules/'+doc.id]=JSON.parse(JSON.stringify(doc));renderPlan()},[doc,shifts,emps]);
// 1 dane z bazy: naprawa całego tygodnia usuwa kolizję Bubona
await load(JSON.parse(JSON.stringify(live)));
ok('w danych z bazy jest kolizja Bubona',(await viol()).some(v=>v.startsWith('e8 2026-10-07 t8')));
await pg.evaluate(()=>{repair(S.scheds[S.current],S.scheds[S.current].start)});
let v=await viol();ok('po naprawie brak naruszeń odpoczynku',v.length===0,JSON.stringify(v));
ok('T11 08.10 nadal u Bubona (blokada)',await pg.evaluate(()=>S.scheds[S.current].cells.some(c=>c.date==='2026-10-08'&&c.shiftId==='t11'&&c.empId==='e8')));
// 2 ręczne wstawienie: zdejmij blokadę, potem wstaw T11 na 08.10 Bubonowi z UI-funkcji
const d2=JSON.parse(JSON.stringify(live));d2.cells.forEach(c=>{if(c.date==='2026-10-08'&&c.shiftId==='t11'){c.empId='e3';delete c.locked}});d2.cells.forEach(c=>{if(c.date==='2026-10-08'&&c.empId==='e3'&&c.shiftId!=='t11')c.empId=null});
await load(d2);ok('przed ręcznym wstawieniem brak kolizji Bubona',!(await viol()).some(x=>x.startsWith('e8')));
await pg.evaluate(async()=>{document.getElementById('auto-repair').checked=true;await assignShift('e8','2026-10-08','t11')});
v=await viol();ok('ręczne wstawienie T11 po T8 przenosi T8 na innego kierowcę',v.length===0&&await pg.evaluate(()=>S.scheds[S.current].cells.find(c=>c.date==='2026-10-07'&&c.shiftId==='t8').empId!=='e8'),JSON.stringify(v));
console.log(await pg.evaluate(()=>document.getElementById('notice')?.innerText||''));
console.log('ERRS',errs);await b.close()})();
