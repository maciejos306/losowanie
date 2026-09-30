const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const out=[];
for(const seed of [1,2,3,4,5,6,7,8]){
 await pg.reload();await pg.waitForTimeout(400);
 const r=await pg.evaluate(async(seed)=>{
  let x=seed*7919;const rnd=()=>{x=(x*1664525+1013904223)%4294967296;return x/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
  Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};
  S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1;if(s.id==='t12')s.rest=0});
  const mons=["2026-10-05","2026-10-12","2026-10-19"];
  for(const m of mons){const s={id:"f"+m,start:m,end:addDays(m,6),createdAt:m,cells:generate(m,addDays(m,6),null)};S.scheds[s.id]=s;__docs['schedules/'+s.id]=JSON.parse(JSON.stringify(s))}
  S.current="f"+mons[0];S.undo={};
  const V=[];const W={};S.shifts.forEach(s=>W[s.id]=s);
  const days=[];for(let i=0;i<21;i++)days.push(addDays(mons[0],i));
  const check=(tag)=>{
   const am=absMap();
   for(const s of Object.values(S.scheds)){
    const by={};for(const c of s.cells){ if(c.part&&c.part!=='am'&&c.part!=='pm')V.push(tag+' zła część '+c.part);
      if(c.extra&&!c.empId)V.push(tag+' extra bez kierowcy');
      if((c.duty||c.dutyH!==undefined)&&!(W[c.shiftId].part==='pm'&&!c.part))V.push(tag+' status dyżuru na trasie');
      if(!c.empId){ if(c.locked)V.push(tag+' zablokowana pusta komórka'); continue}
      ((by[c.empId]??={})[c.date]??=[]).push(c)}
    for(const [e,dm] of Object.entries(by))for(const [d,cs] of Object.entries(dm)){
      const routes=cs.filter(c=>!(W[c.shiftId].part==='pm'&&!c.part));const duty=cs.filter(c=>W[c.shiftId].part==='pm'&&!c.part);
      if(routes.length>2)V.push(tag+` >2 trasy ${e} ${d}`);
      if(wdOf(d)===0&&routes.length>1)V.push(tag+` niedziela 2 trasy ${e}`);
      if(duty.length>1)V.push(tag+` 2 dyżury ${e} ${d}`);
      if(routes.length===2){const ps=routes.map(c=>c.part||'-').sort().join();if(ps!=='am,pm')V.push(tag+` dwie trasy bez podziału ${e} ${d} ${ps}`)}
      if(am[e]?.[d]&&cs.some(c=>!c.locked))V.push(tag+` nieobecny ${e} ${d} ma niezablokowany przydział`);
    }}
   for(const r of hrReport("2026-10"))for(const k of ['days','earned','norm','delta','duty','saldoOver','base','over'])if(!Number.isFinite(r[k]))V.push(tag+' NaN w hrReport '+k);
   const bl=balances(null);for(const [e,v] of Object.entries(bl))if(!Number.isFinite(v))V.push(tag+' NaN saldo '+e);
   for(const m of mons){const w=bilansWeek(m);if(!Number.isFinite(w.demand)||!Number.isFinite(w.capNorm))V.push(tag+' NaN bilans')}
  };
  check('start');
  const emps=S.emps.filter(e=>e.active).map(e=>e.id);let ops=0;const log=[];
  for(let i=0;i<220;i++){
   const op=pick(['assign','assign','assign','clear','abs','absdel','duty','undo','undo','request','reroll','repair','toggle']);
   const e=pick(emps),d=pick(days),s=Object.values(S.scheds).find(s=>s.start<=d&&d<=s.end);S.current=s.id;
   try{
    if(op==='assign')await assignShift(e,d,pick(S.shifts).id);
    else if(op==='clear')await assignShift(e,d,null);
    else if(op==='toggle')await assignShift(e,d,pick(S.shifts).id,{toggle:true});
    else if(op==='abs'){const a=d,bb=addDays(d,Math.floor(rnd()*3));const r=pick(['l4','urlop','odpoczynek']);for(const dd of range(a,bb)){S.abs=S.abs.filter(x=>!(x.empId===e&&x.date===dd));S.abs.push({empId:e,date:dd,reason:r})}await saveA();for(const sc of Object.values(S.scheds))if(sc.start<=bb&&sc.end>=a)repair(sc,a>sc.start?a:sc.start)&&await saveSched(sc)}
    else if(op==='absdel'){S.abs=S.abs.filter(x=>!(x.empId===e&&x.date===d));await saveA()}
    else if(op==='duty'){const c=s.cells.find(c=>c.empId&&W[c.shiftId].part==='pm'&&!c.part);if(c){const r=rnd();if(r<.3){c.duty='cancelled';delete c.dutyH}else if(r<.7){c.duty='done';c.dutyH=Math.round(rnd()*80)/10}else{delete c.duty;delete c.dutyH}await saveSched(s)}}
    else if(op==='undo'){await undoLast()}
    else if(op==='request'){await HarmonogramPlugin.requestLeave(e,d,addDays(d,Math.floor(rnd()*2)))}
    else if(op==='reroll'&&rnd()<.15){document.getElementById('btn-reroll').click();await new Promise(r=>setTimeout(r,120))}
    else if(op==='repair'){repair(s,d);await saveSched(s)}
   }catch(er){V.push('WYJĄTEK '+op+': '+(er.message||er))}
   ops++; if(i%10===0)check('op'+i+':'+op);
  }
  check('koniec');
  return{ops,v:[...new Set(V)].slice(0,12),n:V.length};
 },seed);
 out.push({seed,...r});
}
for(const o of out)console.log(JSON.stringify(o));
console.log('ERRS',errs);await b.close()})();
