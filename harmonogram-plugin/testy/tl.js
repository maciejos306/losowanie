const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1900,height:2600}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const week=L('live3/schedules/week-2026-09-28.json'),shifts=L('live3/app/shifts.json').items,emps=L('live3/app/employees.json').items;
await pg.evaluate(([w,shifts,emps])=>{FL.mcp=null;Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.shifts=shifts;S.emps=emps;S.scheds[w.id]=w;__docs['schedules/'+w.id]=JSON.parse(JSON.stringify(w));S.current=w.id;S.undo={};S.seen={[w.id]:JSON.stringify(w)};document.querySelector('[data-view="hours"]').click();renderPlan()},[week,shifts,emps]);
await pg.waitForTimeout(300);
const cellOf=(emp,date,sid)=>pg.evaluate(([emp,date,sid])=>{const c=S.scheds[S.current].cells.find(c=>c.empId===emp&&c.date===date&&(!sid||c.shiftId===sid));return c&&JSON.parse(JSON.stringify(c))},[emp,date,sid]);
// cel: przyszły dzień 03.10, kierowca z trasą dzienną
const tgt=await pg.evaluate(()=>{const s=S.scheds[S.current];const m={};S.shifts.forEach(x=>m[x.id]=x);const c=s.cells.find(c=>c.date==='2026-10-03'&&c.empId&&!startsPrevDay(m[c.shiftId])&&!isDutyCell(c,m[c.shiftId]));return c&&{emp:c.empId,sid:c.shiftId,slot:c.slot,st:cellBounds(c,m[c.shiftId],c.date).st}});
console.log('cel',JSON.stringify(tgt));
const sel=`.bar[data-tl="${tgt.emp}|2026-10-03|${tgt.sid}|${tgt.slot}"]`;
const bar=pg.locator(sel).first();const bb=await bar.boundingBox();const lane=await pg.locator(sel).first().evaluate(e=>e.closest('.lane').getBoundingClientRect().width);
// 1 przesunięcie w prawo o 2 h
await pg.mouse.move(bb.x+15,bb.y+bb.height/2);await pg.mouse.down();await pg.mouse.move(bb.x+40,bb.y+bb.height/2,{steps:3});await pg.mouse.move(bb.x+15+lane/12,bb.y+bb.height/2,{steps:6});
const tip=await pg.locator('.tl-tip').innerText().catch(()=>'');await pg.mouse.up();await pg.waitForTimeout(300);
let c=await cellOf(tgt.emp,'2026-10-03',tgt.sid);
ok('przesunięcie w prawo o 2 h zmienia start i blokuje',c&&Math.abs(c.startH-(tgt.st+2))<0.01&&c.locked&&c.manualT,`${tip} | ${c&&c.startH}`);
ok('okno edycji nie otworzyło się po przeciągnięciu',!(await pg.locator('#sheet.open,.sheet.open').count()));
// 2 cofnięcie
await pg.click('#btn-undo');await pg.waitForTimeout(300);c=await cellOf(tgt.emp,'2026-10-03',tgt.sid);
ok('Cofnij przywraca godzinę',c&&c.startH===undefined,JSON.stringify(c));
// 3 rozciągnięcie prawej krawędzi o 1 h
let bb2=await pg.locator(sel).first().boundingBox();const rs=pg.locator(sel+' .rs').first();const rb=await rs.boundingBox();
await pg.mouse.move(rb.x+rb.width/2,rb.y+rb.height/2);await pg.mouse.down();await pg.mouse.move(rb.x+20,rb.y+5,{steps:3});await pg.mouse.move(rb.x+rb.width/2+lane/24,rb.y+rb.height/2,{steps:5});await pg.mouse.up();await pg.waitForTimeout(300);
c=await cellOf(tgt.emp,'2026-10-03',tgt.sid);const hh=await pg.evaluate(()=>hoursOf(S.shifts.find(x=>x.id==='t1')));
ok('rozciągnięcie o 1 h wydłuża kafelek',c&&Math.abs(c.durH-(hh+1))<0.01&&c.startH===undefined,JSON.stringify(c));
// 4 przeniesienie na innego kierowcę (w dół o wiersz)
const rows=await pg.$$eval('table.tl tr[data-tl-emp]',rs=>rs.map(r=>({id:r.dataset.tlEmp,y:r.getBoundingClientRect().top+r.getBoundingClientRect().height/2})));
const free=await pg.evaluate(()=>{const s=S.scheds[S.current];const m={};S.shifts.forEach(x=>m[x.id]=x);return S.emps.filter(e=>e.active&&hasCatC(e)&&!s.cells.some(c=>c.empId===e.id&&['2026-10-02','2026-10-03'].includes(c.date))&&!absMap()[e.id]?.['2026-10-03']).map(e=>e.id)});
const dst=rows.find(r=>free.includes(r.id)&&r.id!==tgt.emp);console.log('wolny',dst&&dst.id);
bb2=await pg.locator(sel).first().boundingBox();
await pg.mouse.move(bb2.x+12,bb2.y+bb2.height/2);await pg.mouse.down();await pg.mouse.move(bb2.x+14,bb2.y+bb2.height/2+20,{steps:3});await pg.mouse.move(bb2.x+12,dst.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(500);
const moved=await pg.evaluate(([sid,from,to])=>{const s=S.scheds[S.current];return{to:s.cells.filter(c=>c.date==='2026-10-03'&&c.empId===to).map(c=>c.shiftId),from:s.cells.filter(c=>c.date==='2026-10-03'&&c.empId===from&&c.shiftId===sid).length,dur:s.cells.find(c=>c.date==='2026-10-03'&&c.empId===to&&c.shiftId===sid)?.durH}},[tgt.sid,tgt.emp,dst.id]);
ok('przeciągnięcie w pionie przenosi trasę na innego kierowcę (z zachowaniem długości)',moved.to.includes(tgt.sid)&&moved.from===0&&Math.abs(moved.dur-(hh+1))<0.01,JSON.stringify(moved));
// 5 kierowca bez kat. C nie dostanie trasy wymagającej C
const reqC=await pg.evaluate(()=>S.shifts.filter(x=>x.reqC).map(x=>x.id));console.log('reqC',reqC);
// 6 pula etykiet: przeciągnij Trasę 5 na Dziadurę w niedzielę 04.10 o ~10:00
const poolChip=pg.locator('[data-tl-new="t5"]');await poolChip.scrollIntoViewIfNeeded();const pb=await poolChip.boundingBox();
const td=await pg.evaluate(()=>{const tr=[...document.querySelectorAll('table.tl tr[data-tl-emp]')].find(r=>S.emps.find(e=>e.id===r.dataset.tlEmp)?.name==='Tomasz Dziadura');const cell=tr.querySelector('td[data-tl-day="2026-10-04"] .lane');const r=cell.getBoundingClientRect();return{x:r.left+r.width*10/24,y:r.top+r.height/2,emp:tr.dataset.tlEmp}});
await pg.mouse.move(pb.x+10,pb.y+10);await pg.mouse.down();await pg.mouse.move(pb.x+30,pb.y+30,{steps:3});await pg.mouse.move(td.x,td.y,{steps:12});await pg.mouse.up();await pg.waitForTimeout(500);
c=await cellOf(td.emp,'2026-10-04','t5');
ok('z puli: Trasa 5 dla Dziadury 04.10, start ok. 10:00, zablokowana',c&&c.locked&&Math.abs(c.startH-10)<=0.25,JSON.stringify(c));
const note=await pg.innerText('#notice');console.log('notice:',note);
// 7 zakończonej trasy z przeszłości nie da się „zgubić”: przesunięcie przesuwa też godziny z FlotoMax
// 8 przeniesienie na inny dzień: złap kafelek 03.10 i upuść w kolumnie 04.10 tego samego kierowcy ok. 6:00
await pg.evaluate(()=>{const s=S.scheds[S.current];s.cells=s.cells.filter(c=>!(c.date==='2026-10-04'&&c.empId==='e1'));renderPlan()});
const t2=await pg.evaluate(()=>{const s=S.scheds[S.current];const m={};S.shifts.forEach(x=>m[x.id]=x);const c=s.cells.find(c=>c.date==='2026-10-03'&&c.empId==='e1'&&!isDutyCell(c,m[c.shiftId]));if(!c){const n={date:'2026-10-03',shiftId:'t2',slot:9,empId:'e1'};s.cells.push(n);renderPlan();return{sid:'t2',slot:9}}return{sid:c.shiftId,slot:c.slot}});
const sel2=`.bar[data-tl="e1|2026-10-03|${t2.sid}|${t2.slot}"]`;await pg.locator(sel2).first().scrollIntoViewIfNeeded();const b3=await pg.locator(sel2).first().boundingBox();
const tgt2=await pg.evaluate(()=>{const tr=document.querySelector('table.tl tr[data-tl-emp="e1"]');const ln=tr.querySelector('td[data-tl-day="2026-10-04"] .lane').getBoundingClientRect();return{x:ln.left+ln.width*6/24,y:ln.top+ln.height/2}});
const st3=await pg.evaluate(([sid,slot])=>{const s=S.scheds[S.current];const c=s.cells.find(c=>c.date==='2026-10-03'&&c.empId==='e1'&&c.shiftId===sid&&c.slot===slot);return cellBounds(c,S.shifts.find(x=>x.id===sid),c.date).st},[t2.sid,t2.slot]);
const lw=await pg.evaluate(()=>document.querySelector('table.tl .lane').getBoundingClientRect().width);
// chwyt w lewej krawędzi kafelka (start), upuszczenie w 6:00 następnego dnia
await pg.mouse.move(b3.x+3,b3.y+b3.height/2);await pg.mouse.down();await pg.mouse.move(b3.x+30,b3.y+b3.height/2,{steps:4});await pg.mouse.move(tgt2.x+3-(0),tgt2.y,{steps:10});
const tip2=await pg.locator('.tl-tip').innerText().catch(()=>'');await pg.mouse.up();await pg.waitForTimeout(500);
const res=await pg.evaluate(([sid])=>{const s=S.scheds[S.current];return{d3:s.cells.filter(c=>c.date==='2026-10-03'&&c.empId==='e1'&&c.shiftId===sid).length,d4:s.cells.filter(c=>c.date==='2026-10-04'&&c.empId==='e1').map(c=>({sid:c.shiftId,st:c.startH}))}},[t2.sid]);
ok('kafelek upuszczony w innej kolumnie trafia na ten dzień z godziną z miejsca upuszczenia',res.d3===0&&res.d4.some(x=>x.sid===t2.sid&&Math.abs((x.st??99)-6)<=0.5),tip2+' | '+JSON.stringify(res)+' st0 '+st3);
console.log('notice:',await pg.innerText('#notice'));
// 9 zakończonej trasy nie da się przenieść na inny dzień
const done=await pg.evaluate(()=>{const s=S.scheds[S.current];const c=s.cells.find(c=>c.date==='2026-09-29'&&c.empId&&c.closed);return c&&{emp:c.empId,sid:c.shiftId,slot:c.slot}});
if(done){const sel3=`.bar[data-tl="${done.emp}|2026-09-29|${done.sid}|${done.slot}"]`;await pg.locator(sel3).first().scrollIntoViewIfNeeded();const b4=await pg.locator(sel3).first().boundingBox();
 const tg=await pg.evaluate(([e])=>{const ln=document.querySelector(`table.tl tr[data-tl-emp="${e}"] td[data-tl-day="2026-10-01"] .lane`).getBoundingClientRect();return{x:ln.left+ln.width/2,y:ln.top+ln.height/2}},[done.emp]);
 await pg.mouse.move(b4.x+5,b4.y+b4.height/2);await pg.mouse.down();await pg.mouse.move(b4.x+30,b4.y+b4.height/2,{steps:3});await pg.mouse.move(tg.x,tg.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(400);
 ok('zakończona trasa zostaje w swoim dniu',await pg.evaluate(([d])=>S.scheds[S.current].cells.some(c=>c.date==='2026-09-29'&&c.empId===d.emp&&c.shiftId===d.sid),[done]),await pg.innerText('#notice'))}
console.log('ERRS',errs);await b.close()})();
