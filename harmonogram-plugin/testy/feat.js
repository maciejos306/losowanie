const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1300,height:900}});const errs=[];
pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const ok=(k,v,extra='')=>console.log((v?'OK   ':'FAIL ')+k+(extra?'  '+extra:''));
const r=await pg.evaluate(async()=>{const o={};
 S.shifts.forEach(x=>{if(['t8','t9','t10','t11'].includes(x.id))x.rest=1;if(x.id==='t12')x.rest=0});
 // (a) limit urlopu
 const day="2026-10-06";
 o.slots0=slotsOn(day);
 o.need=o.slots0.need;o.activeN=o.slots0.active;o.expected=o.slots0.free;
 let accepted=0,blocked=0;const res=[];
 for(const e of S.emps.filter(x=>x.active)){const r=await HarmonogramPlugin.requestLeave(e.id,day,day);res.push(r.ok);if(r.ok)accepted++;else blocked++}
 o.accepted=accepted;o.blocked=blocked;
 o.msg=(await HarmonogramPlugin.requestLeave(S.emps[0].id,day,day)).ok;
 o.slotsAfter=slotsOn(day).free;
 // zakres: jeden pełny dzień w środku zakresu blokuje cały wniosek
 const rr=await HarmonogramPlugin.requestLeave(S.emps[7].id,"2026-10-05","2026-10-07");o.rangeBlocked=!rr.ok&&rr.blocked.map(x=>x.date);
 // ta sama osoba może ponownie (własny wpis nie liczy się podwójnie)
 const firstOk=S.abs.find(a=>a.date===day&&a.reason==="wniosek").empId;
 o.reRequest=(await HarmonogramPlugin.requestLeave(firstOk,day,day)).ok;
 // inicjały
 o.initials=S.emps.map(e=>initials(e));
 S.sched=null;
 return o});
console.log(JSON.stringify(r));
ok('limit = aktywni − trasy − nieobecni',r.accepted===r.expected,`(przyjęto ${r.accepted}, oczekiwano ${r.expected})`);
ok('reszta zablokowana',r.blocked===r.activeN-r.accepted);
ok('po wyczerpaniu 0 miejsc',r.slotsAfter===0);
ok('zakres z pełnym dniem odrzucony',Array.isArray(r.rangeBlocked)&&r.rangeBlocked.includes('2026-10-06'));
ok('ponowny wniosek tej samej osoby przechodzi',r.reReq!==false&&r.reRequest===true);
ok('inicjały unikalne',new Set(r.initials).size===r.initials.length,r.initials.join(','));
// widok: nagłówek dnia
await pg.evaluate(()=>{S.current=Object.keys(S.scheds).find(id=>S.scheds[id].start<='2026-10-06'&&S.scheds[id].end>='2026-10-06')||S.current;renderPlan()});
await pg.waitForTimeout(200);
const hdr=await pg.locator('th.day',{hasText:'06.10'}).first().innerText();
console.log(JSON.stringify(hdr));
ok('nagłówek dnia ma inicjały i wolne miejsca',/wolnych miejsc na urlop: 0/.test(hdr)&&/[A-Z]{2}/.test(hdr));
ok('są znaczniki koloru wniosku',await pg.locator('b.ini.w').count()>0);
// UI: zablokowane zgłoszenie z formularza
await pg.click('nav .tab[data-tab="ludzie"]');
const free=await pg.evaluate(()=>S.emps.find(e=>!S.abs.some(a=>a.empId===e.id&&a.date==='2026-10-06')).id);
await pg.fill(`[data-absdate="${free}"]`,'2026-10-06');await pg.selectOption(`[data-absreason="${free}"]`,'wniosek');await pg.click(`[data-absadd="${free}"]`);await pg.waitForTimeout(150);
ok('UI odrzuca wniosek',/odrzucone/.test(await pg.locator('#notice').innerText()||'')||await pg.evaluate(()=>/odrzucone/.test(document.body.innerText)));
// L4 nie jest blokowane
await pg.selectOption(`[data-absreason="${free}"]`,'l4');await pg.click(`[data-absadd="${free}"]`);await pg.waitForTimeout(150);
ok('L4 nie jest blokowane',await pg.evaluate(id=>S.abs.some(a=>a.empId===id&&a.date==='2026-10-06'&&a.reason==='l4'),free));
// (d) wyrównywanie sald
const f=await pg.evaluate(async()=>{
 S.abs=[];S.hr={};S.emps.forEach(e=>e.active=true);
 const base=Object.keys(S.scheds);base.forEach(id=>delete S.scheds[id]);
 const run=(hr)=>{S.hr=hr;Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);const cnt={};let start="2026-10-12";
  for(let i=0;i<30;i++){const end=addDays(start,6);const cells=generate(start,end,null);S.scheds["w"+i]={id:"w"+i,start,end,createdAt:"2027-01-01",cells};cells.forEach(c=>{if(c.empId)cnt[c.empId]=(cnt[c.empId]||0)+1});start=addDays(end,1)}
  const bal=balances(null);return {cnt,bal}};
 const a=run({});const b=run({e1:{overtime:60},e2:{overtime:-60}});
 const spread=o=>{const v=Object.values(o);return Math.max(...v)-Math.min(...v)};
 return {plain:a.cnt,biased:b.cnt,spreadPlain:spread(a.bal),spreadBiased:spread(b.bal),balBiased:b.bal}});
console.log(JSON.stringify(f));
ok('kierowca z wysokim saldem pracuje mniej',f.biased.e1<f.plain.e1,`(${f.plain.e1} → ${f.biased.e1})`);
ok('kierowca z ujemnym saldem pracuje więcej',f.biased.e2>f.plain.e2,`(${f.plain.e2} → ${f.biased.e2})`);
// (e) brak ludzi → dodatkowe dni
const g=await pg.evaluate(async()=>{
 S.hr={};Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 S.emps.forEach((e,i)=>e.active=i<5);
 const cells=generate("2026-10-12","2026-10-18",null);const s={id:"s1",start:"2026-10-12",end:"2026-10-18",createdAt:"2027-01-01",cells};S.scheds.s1=s;
 const shMap={};S.shifts.forEach(x=>shMap[x.id]=x);
 const extra=cells.filter(c=>c.extra).length,unf=cells.filter(c=>!c.empId).length;
 const days={};cells.filter(c=>c.empId&&partOf(shMap[c.shiftId],c.date)!=="pm").forEach(c=>{((days[c.empId]??={})[c.date]=1)});
 const maxDays=Math.max(...Object.values(days).map(m=>Object.keys(m).length));
 let restViol=0;for(const [e,m] of Object.entries(days))for(const d of Object.keys(m)){for(const c of cells.filter(c=>c.empId===e&&c.date===d)){const r=restOf(shMap[c.shiftId]);for(let k=1;k<=r;k++)if(m[addDays(d,k)])restViol++}}
 const hr=hrReport("2026-10").filter(r=>r.dodatkoweDni>0).length;
 return {extra,unf,maxDays,restViol,hrDriversWithExtra:hr}});
console.log(JSON.stringify(g));
ok('przy braku ludzi pojawiają się dodatkowe dni',g.extra>0);
ok('maks. 6 dni pracy',g.maxDays<=6);
ok('odpoczynek po dalekich trasach nienaruszony',g.restViol===0);
ok('Kadry pokazują dodatkowe dni',g.hrDriversWithExtra>0);
// Kadry UI
await pg.evaluate(()=>{S.emps.forEach(e=>e.active=true);document.querySelector('nav .tab[data-tab="kadry"]').click();$("hr-month").value="2026-10";renderHR()});
ok('tabela rachunku godzin',await pg.locator('#hr-bal tr').count()>1);
console.log('ERRS',errs);await b.close()})();
