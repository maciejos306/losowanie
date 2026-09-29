const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const run=async(seed)=>await pg.evaluate(async(seed)=>{
 // deterministyczny los
 let x=seed;const rnd=()=>{x=(x*1664525+1013904223)%4294967296;return x/4294967296};
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1;if(s.id==='t12')s.rest=0});
 S.hr={};S.abs=[];
 // nieobecności: urlopy zatwierdzone, L4, odpoczynek
 const add=(e,a,b,r)=>{for(const d of range(a,b))S.abs.push({empId:e,date:d,reason:r})};
 add("e1","2026-10-07","2026-10-09","urlop");add("e2","2026-10-14","2026-10-14","urlop");add("e3","2026-10-20","2026-10-22","l4");
 add("e4","2026-10-26","2026-10-30","urlop");add("e5","2026-10-13","2026-10-13","l4");add("e6","2026-10-15","2026-10-16","urlop");
 // 5 kolejnych tygodni
 const mons=["2026-09-28","2026-10-05","2026-10-12","2026-10-19","2026-10-26"];
 for(const m of mons){const end=addDays(m,6);const cells=generate(m,end,null);
   const s={id:"w"+m,start:m,end,createdAt:m,cells};S.scheds[s.id]=s;__docs['schedules/'+s.id]=JSON.parse(JSON.stringify(s));}
 // losy dyżurów
 const duty={done:0,cancelled:0,planned:0,over5:0};
 for(const s of Object.values(S.scheds))for(const c of s.cells){if(c.shiftId==='nagel'&&c.empId){const r=rnd();if(r<.4){c.duty='done';c.dutyH=Math.round((2+rnd()*6)*4)/4;duty.done++;if(c.dutyH>5)duty.over5++}else if(r<.7){c.duty='cancelled';duty.cancelled++}else duty.planned++}}
 // ------- wyrocznia niezależna od kodu programu -------
 const W={};S.shifts.forEach(s=>W[s.id]=s);
 const mondayOf=d=>{const dt=new Date(d+"T00:00:00Z");const wd=(dt.getUTCDay()+6)%7;dt.setUTCDate(dt.getUTCDate()-wd);return dt.toISOString().slice(0,10)};
 const dnOf=c=>{const sh=W[c.shiftId];const isDuty=(sh.part==='pm')&&!c.part;if(!isDuty)return sh.weight;if(c.duty!=='done')return 0;return (Number.isFinite(c.dutyH)&&c.dutyH>5)?1:sh.weight};
 const daily={}; // emp -> date -> dn
 for(const s of Object.values(S.scheds))for(const c of s.cells){if(!c.empId)continue;((daily[c.empId]??={})[c.date]=(daily[c.empId][c.date]||0)+dnOf(c))}
 const l4={};S.abs.filter(a=>a.reason==='l4').forEach(a=>{((l4[a.empId]??={})[mondayOf(a.date)]??=new Set()).add(a.date)});
 const hasRec={};S.abs.filter(a=>a.reason==='l4'||a.reason==='urlop').forEach(a=>{((hasRec[a.empId]??={})[mondayOf(a.date)]=1)});
 const weekly={},monthly={};
 for(const e of S.emps){weekly[e.id]=[];for(const m of mons){let earned=0;for(let k=0;k<7;k++){const d=addDays(m,k);earned+=daily[e.id]?.[d]||0}
   const has=Object.keys(daily[e.id]||{}).some(d=>mondayOf(d)===m)||hasRec[e.id]?.[m];if(!has)continue;
   const norm=5-Math.min(5,l4[e.id]?.[m]?.size||0);weekly[e.id].push({m,earned,norm,delta:earned-norm})}}
 const oct=["2026-10-05","2026-10-12","2026-10-19","2026-10-26","2026-09-28"].filter(m=>addDays(m,3).startsWith("2026-10"));
 for(const e of S.emps){const w=weekly[e.id].filter(w=>oct.includes(w.m));monthly[e.id]={earned:w.reduce((a,x)=>a+x.earned,0),norm:w.reduce((a,x)=>a+x.norm,0)};monthly[e.id].delta=monthly[e.id].earned-monthly[e.id].norm}
 // ------- wyniki programu -------
 const L=ledger(null,true), H=hrReport("2026-10"), B=balances(null);
 const diffs=[];
 for(const e of S.emps){
  const pw=L[e.id]||[],ow=weekly[e.id];
  if(pw.length!==ow.length)diffs.push(`${e.id}: liczba tygodni ${pw.length} vs ${ow.length}`);
  ow.forEach((o,i)=>{const p=pw[i];if(!p||p.monday!==o.m||Math.abs(p.worked-o.earned)>1e-9||Math.abs(p.norm-o.norm)>1e-9||Math.abs(p.delta-o.delta)>1e-9)diffs.push(`${e.id} tydzień ${o.m}: program ${JSON.stringify(p)} vs ${JSON.stringify(o)}`)});
  const h=H.find(r=>r.employeeId===e.id);const mo=monthly[e.id];
  if(Math.abs(h.earned-mo.earned)>1e-9||Math.abs(h.norm-mo.norm)>1e-9||Math.abs(h.delta-mo.delta)>1e-9)diffs.push(`${e.id} miesiąc: program ${h.earned}/${h.norm}/${h.delta} vs ${mo.earned}/${mo.norm}/${mo.delta}`);
  const sumAll=ow.reduce((a,x)=>a+x.delta,0);if(Math.abs(B[e.id]-sumAll)>1e-9)diffs.push(`${e.id} saldo ${B[e.id]} vs ${sumAll}`);
 }
 // zachowanie: suma dniówek w komórkach = suma dziennych = suma tygodniowych
 let cellSum=0;for(const s of Object.values(S.scheds))for(const c of s.cells)if(c.empId)cellSum+=dnOf(c);
 let dSum=0;for(const e of Object.values(daily))for(const v of Object.values(e))dSum+=v;
 let wSum=0;for(const e of Object.values(weekly))e.forEach(w=>wSum+=w.earned);
 // niezmienniki planu
 const viol=[];let unfilled=0,extra=0;
 for(const s of Object.values(S.scheds)){unfilled+=s.cells.filter(c=>!c.empId).length;extra+=s.cells.filter(c=>c.extra).length;
  const byE={};s.cells.filter(c=>c.empId).forEach(c=>((byE[c.empId]??={})[c.date]??=[]).push(c));
  const am=absMap();
  for(const [e,days] of Object.entries(byE)){let wd=0;for(const [d,cs] of Object.entries(days)){if(am[e]?.[d])viol.push(`${e} pracuje w dniu nieobecności ${d}`);if(cs.some(c=>(W[c.shiftId].part||'full')!=='pm'||c.part))wd++;
    for(const c of cs){const r=restOf(W[c.shiftId]);for(let k=1;k<=r;k++)if(days[addDays(d,k)]?.some(x=>(W[x.shiftId].part||'full')!=='pm'))viol.push(`${e} łamie odpoczynek ${d}`)}}
   if(wd>6)viol.push(`${e} ${wd} dni pracy w tygodniu ${s.start}`)}}
 // tabele do raportu
 const round=v=>Math.round(v*100)/100;
 const monthTable=S.emps.map(e=>({name:e.name,earned:round(monthly[e.id].earned),norm:monthly[e.id].norm,delta:round(monthly[e.id].delta),saldo:round(B[e.id])}));
 const weekTable=S.emps.map(e=>({name:e.name.split(' ')[1],weeks:weekly[e.id].map(w=>round(w.delta))}));
 const day="2026-10-13";const dayTable=S.emps.map(e=>({name:e.name.split(' ')[1],dn:round(daily[e.id]?.[day]||0),cells:Object.values(S.scheds).flatMap(s=>s.cells).filter(c=>c.empId===e.id&&c.date===day).map(c=>c.shiftId+(c.duty?':'+c.duty:''))}));
 const pgIn=hrReport("2026-10").map(r=>r.days);
 return {diffs,cellSum:round(cellSum),dSum:round(dSum),wSum:round(wSum),viol,unfilled,extra,duty,monthTable,weekTable,dayTable,totalMonth:round(monthTable.reduce((a,x)=>a+x.delta,0))};
},seed);
const seeds=[1,2,3,4,5,6,7,8,9,10,11,12];const out=[];
for(const sd of seeds){await pg.reload();await pg.waitForTimeout(400);const r=await run(sd);const d=r.monthTable.map(x=>x.delta);const mean=d.reduce((a,b)=>a+b,0)/d.length;const sdv=Math.sqrt(d.reduce((a,b)=>a+(b-mean)**2,0)/d.length);out.push({sd,diffs:r.diffs.length,viol:r.viol.length,unfilled:r.unfilled,range:Math.round((Math.max(...d)-Math.min(...d))*100)/100,std:Math.round(sdv*100)/100,total:r.totalMonth});}
console.log(out.map(o=>JSON.stringify(o)).join('\n'));
console.log('AVG std',Math.round(out.reduce((a,o)=>a+o.std,0)/out.length*100)/100,'AVG range',Math.round(out.reduce((a,o)=>a+o.range,0)/out.length*100)/100,'diffs',out.reduce((a,o)=>a+o.diffs,0),'viol',out.reduce((a,o)=>a+o.viol,0),'unfilled',out.reduce((a,o)=>a+o.unfilled,0));

console.log('ERRS',errs);await b.close()})();
