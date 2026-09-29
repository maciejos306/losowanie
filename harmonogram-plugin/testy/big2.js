const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1300,height:900}});const errs=[];
pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('CONSOLE '+m.text())});
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const res=await pg.evaluate(async()=>{
 const out={};const V=[];S.shifts.forEach(x=>{if(['t8','t9','t10','t11'].includes(x.id))x.rest=1;if(x.id==='t12')x.rest=0});
 // 1 inwarianty losowania: 60 tygodni, każdy kolejny po poprzednim
 const shMap={};S.shifts.forEach(s=>shMap[s.id]=s);
 let start="2026-10-12";
 for(let i=0;i<40;i++){
  const end=addDays(start,6);
  const cells=generate(start,end,null);
  const s={id:"t"+i,name:"t"+i,start,end,createdAt:"2027-01-0"+(i%9+1),cells};
  S.scheds[s.id]=s; S.seen[s.id]=JSON.stringify(s);
  const am=absMap();
  // doubles
  const byE={};cells.filter(c=>c.empId!=null).forEach(c=>{((byE[c.empId]??={})[c.date]??=[]).push(c)});
  for(const [e,days] of Object.entries(byE)){
   let work=0;const emp=S.emps.find(x=>x.id===e);
   for(const [d,cs] of Object.entries(days)){
    const routes=cs.filter(c=>partOf(shMap[c.shiftId],d)!=="pm");
    if(routes.length>1&&wdOf(d)===0)V.push(`${s.id} niedziela 2 trasy ${e} ${d}`);
    if(routes.length>2)V.push(`${s.id} >2 trasy ${e} ${d}`);
    if(cs.filter(c=>partOf(shMap[c.shiftId],d)==="pm").length>1)V.push(`${s.id} 2 dyżury ${e} ${d}`);
    if(routes.length)work++;
    if(am[e]?.[d])V.push(`${s.id} nieobecny ${e} ${d}`);
    for(const c of cs){ if(shMap[c.shiftId]?.reqC&&emp.catC===false)V.push(`${s.id} brak kat C ${e} ${c.shiftId}`)}
    // odpoczynek po dalekiej trasie w obrębie tygodnia
    for(const c of routes){const r=restOf(shMap[c.shiftId]);for(let k=1;k<=r;k++){const dd=addDays(d,k);if(dd<=end&&days[dd]&&days[dd].length)V.push(`${s.id} łamie odpoczynek ${e} ${d}->${dd}`)}}
   }
   if(work>5)V.push(`${s.id} ${work} dni pracy ${e}`);
  }
  start=addDays(end,1);
 }
 out.violations=V.slice(0,15);out.vcount=V.length;
 // 2 brak obsady
 const un=[];for(let i=0;i<40;i++){const s=S.scheds["t"+i];un.push(s.cells.filter(c=>c.empId==null).length)}
 out.emptyCells={min:Math.min(...un),max:Math.max(...un),avg:+(un.reduce((a,b)=>a+b,0)/un.length).toFixed(2)};
 // 3 fair distribution over 40 weeks
 const cnt={};for(let i=0;i<40;i++)S.scheds["t"+i].cells.forEach(c=>{if(c.empId)cnt[c.empId]=(cnt[c.empId]||0)+1});out.perEmp=cnt;
 // 4 repair idempotent
 const s0=S.scheds.t5;const before=JSON.stringify(s0.cells);const ch=repair(s0,s0.start);out.repairChanged=ch;
 // 5 API
 out.api=Object.keys(window.HarmonogramPlugin);
 out.avail=HarmonogramPlugin.availability("2026-10-06").length;
 out.hr=hrReport("2026-10").length??Object.keys(hrReport("2026-10")).length;
 out.free=HarmonogramPlugin.freeDrivers("2026-10-06").length;
 const d=HarmonogramPlugin.getData();out.exportKeys=Object.keys(d);
 return out});
console.log(JSON.stringify(res,null,1));console.log('ERRS',errs);await b.close()})();
