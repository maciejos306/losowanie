const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1500,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const doc=JSON.parse(fs.readFileSync('week_import.json','utf8'));
const r=await pg.evaluate(async(doc)=>{
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};
 S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1;if(s.id==='t12')s.rest=0});
 S.scheds[doc.id]=doc;S.current=doc.id;__docs['schedules/'+doc.id]=JSON.parse(JSON.stringify(doc));renderPlan();
 const W={};S.shifts.forEach(x=>W[x.id]=x);const bad=[];
 for(const c of doc.cells){if(!W[c.shiftId])bad.push('nieznana zmiana '+c.shiftId);if(!S.emps.find(e=>e.id===c.empId))bad.push('nieznany kierowca')}
 const byE={};doc.cells.forEach(c=>((byE[c.empId]??={})[c.date]??=[]).push(c));
 return{bad,hr:hrReport('2026-10').map(r=>[r.name,r.days,r.earned,r.norm,r.delta]),bil:bilansWeek('2026-09-28'),balances:balances(null)}},doc);
console.log(JSON.stringify(r.bad));console.log(r.hr.map(x=>x.join(' | ')).join('\n'));console.log('bilans',r.bil.label,r.bil.demand,r.bil.capNorm,r.bil.capMax);
await pg.locator('#plan-table').screenshot({path:'imp.png'});
console.log('ERRS',errs);await b.close()})();
