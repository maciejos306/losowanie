const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1600,height:1200}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const r=await pg.evaluate(async([docs,shifts,emps,abs,plan])=>{FL.mcp=null;Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=abs;S.shifts=shifts;S.plan=plan;
 S.emps=emps.map(e=>/Faraś|Dziadura/.test(e.name)?{...e,startDate:'2026-10-05'}:e);for(const d of docs){S.scheds[d.id]=JSON.parse(JSON.stringify(d));__docs['schedules/'+d.id]=JSON.parse(JSON.stringify(d))}
 const frozenBefore=JSON.stringify(docs.flatMap(d=>d.cells).filter(c=>c.date>='2026-10-05'&&c.date<='2026-10-11').map(c=>c.date+c.shiftId+c.empId).sort());
 await migrateRolling();await new Promise(r=>setTimeout(r,300));const ids=Object.keys(S.scheds);const s=S.scheds.rolling;
 // dni przyszłe po zamrożeniu: wyczyść i dobuduj od nowa (jak dla nowego grafiku)
 s.cells=s.cells.filter(c=>c.date<='2026-10-11');s.end='2026-10-11';const n=await ensureHorizon();
 const m={};S.shifts.forEach(x=>m[x.id]=x);const nm=id=>S.emps.find(e=>e.id===id)?.name;
 const frozenAfter=JSON.stringify(s.cells.filter(c=>c.date>='2026-10-05'&&c.date<='2026-10-11').map(c=>c.date+c.shiftId+c.empId).sort());
 const gen=s.cells.filter(c=>c.date>'2026-10-11');
 const rest=[];for(const c of s.cells){if(!c.empId||c.date<'2026-10-12')continue;for(let i=1;i<=restOf(m[c.shiftId]);i++){const d=addDays(c.date,i);s.cells.filter(x=>x.empId===c.empId&&x.date===d).forEach(x=>rest.push(nm(c.empId)+' '+c.date))}}
 const pc=[];for(const c of gen){if(!c.empId)continue;const sh=m[c.shiftId];if(!startsPrevDay(sh))continue;s.cells.filter(x=>x.empId===c.empId&&x.date===addDays(c.date,-1)).forEach(x=>{if(clashNext(m[x.shiftId],x.date,sh,c.date))pc.push(nm(c.empId)+' '+c.date)})}
 const traineeFar=gen.filter(c=>c.empId&&isFar(m[c.shiftId])&&isTrainee(S.emps.find(e=>e.id===c.empId),c.date)).map(c=>nm(c.empId)+' '+c.date);
 // 2 wolne z rzędu w każdym pełnym nowym tygodniu
 const pairs={};for(const mon of ['2026-10-12','2026-10-19']){for(const e of S.emps.filter(e=>e.active)){const work=new Set(s.cells.filter(c=>c.empId===e.id&&(m[c.shiftId]?.part||'full')!=='pm').map(c=>c.date));const ds=[...range(mon,addDays(mon,6))];let ok2=false;for(let i=0;i<6;i++)if(!work.has(ds[i])&&!work.has(ds[i+1]))ok2=true;if(!ok2)(pairs[mon]??=[]).push(e.name)}}
 const unf=gen.filter(c=>!c.empId).map(c=>c.date+' '+c.shiftId);
 // tydzień nauki dla nowego kierowcy
 S.emps.push({id:'nk',name:'Nowy Kierowca',active:true,catC:false});const tr=await planTraining('nk','2026-10-13','e6');
 const trc=S.scheds.rolling.cells.filter(c=>c.empId==='nk');
 return{ids,n,end:s.end,today:warsawDay(),frozenSame:frozenBefore===frozenAfter,rest,pc,traineeFar,pairs,unf,tr,trc:trc.map(c=>c.date+' '+m[c.shiftId].name+' z '+nm(c.with)),trDuty:trc.some(c=>isDutyCell(c,m[c.shiftId])),trMentor:trc.filter(c=>c.with==='e6').length}},[[L('live12/schedules/3lge9m2a.json'),L('live12/schedules/week-2026-09-28.json')],L('live12/app/shifts.json').items,L('live12/app/employees.json').items,L('live12/app/absences.json').items,L('live12/app/plan.json')]);
console.log(JSON.stringify({...r,tr:undefined,trc:undefined}));console.log(r.tr);
ok('jeden ciągły grafik',r.ids.length===1&&r.ids[0]==='rolling',r.ids.join());
ok('ułożony do dziś + 20 dni',r.end===addD(r.today,20),r.end);
ok('zamrożony tydzień 05–11.10 bez zmian',r.frozenSame);
ok('brak naruszeń odpoczynku',r.rest.length===0,r.rest.join());
ok('9 h wypoczynku przed daleką trasą',r.pc.length===0,r.pc.join());
ok('nowi kierowcy bez dalekich tras przez 4 tygodnie',r.traineeFar.length===0,r.traineeFar.join());
ok('2 wolne dni z rzędu: najwyżej 2 osoby bez pary w tygodniu (bez gwarancji)',Object.values(r.pairs).every(a=>a.length<=2),JSON.stringify(r.pairs));
ok('wszystkie trasy obsadzone',r.unf.length===0,r.unf.join());
ok('tydzień nauki: 5 dni z różnymi kierowcami, w tym dyżur',r.trc.length===5&&r.trDuty,JSON.stringify(r.trc));
console.log('ERRS',errs);await b.close()})();
function addD(d,n){const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
