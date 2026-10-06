const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async()=>{FL.mcp=null;const o={};const today=warsawDay();
 const s=S.scheds[S.current];const d=addDays(today,3);const c=s.cells.find(c=>c.date===d&&c.empId);const emp=c.empId;o.emp=S.emps.find(e=>e.id===emp).name;o.d=d;
 o.pal=[...document.querySelectorAll('#palette [data-drag-shift]')].map(x=>x.dataset.dragShift).filter(x=>x.startsWith('abs:'));
 openSheet(emp,d);o.sheetHas=!!document.querySelector('#sheet-opts [data-abs-set="urlop"]')&&!!document.querySelector('#sheet-opts [data-abs-set="l4"]');
 document.querySelector('#sheet-opts [data-abs-set="urlop"]').click();await new Promise(r=>setTimeout(r,600));
 o.abs=S.abs.filter(a=>a.empId===emp&&a.date===d).map(a=>a.reason);o.routes=s.cells.filter(c=>c.date===d&&c.empId===emp).length;o.note=$("notice").textContent;
 openSheet(emp,d);o.del=!!document.querySelector('#sheet-opts [data-abs-del]');document.querySelector('#sheet-opts [data-abs-del]').click();await new Promise(r=>setTimeout(r,400));
 o.absAfter=S.abs.filter(a=>a.empId===emp&&a.date===d).length;
 // za mało kierowców: wszyscy poza trzema na urlopie
 const act=S.emps.filter(e=>e.active);act.slice(3).forEach(e=>S.abs.push({empId:e.id,date:d,reason:'urlop'}));await tlAbs('l4',act[0].id,d);o.warn=$("notice").textContent;
 return o});
ok('pasek kafelków ma Urlop i L4',r.pal.join()==='abs:urlop,abs:l4',r.pal.join());
ok('okno komórki ma Urlop i L4',r.sheetHas);
ok('Urlop z okna: nieobecność wpisana, trasy zdjęte',r.abs.join()==='urlop'&&r.routes===0,JSON.stringify([r.abs,r.routes]));
ok('komunikat po wpisaniu',new RegExp(r.emp+': Urlop').test(r.note),r.note);
ok('okno pokazuje zdjęcie nieobecności i działa',r.del&&r.absAfter===0);
ok('ostrzeżenie, gdy zabraknie kierowców',/⚠ Uwaga/.test(r.warn)&&/zabraknie kierowców|wolnych miejsc/.test(r.warn),r.warn);
// przeciągnięcie L4 z paska na komórkę
await pg.reload();await pg.waitForTimeout(2800);
const t=await pg.evaluate(()=>{const today=warsawDay();const d=addDays(today,4);const s=S.scheds[S.current];const c=s.cells.find(c=>c.date===d&&c.empId);const el=document.querySelector(`[data-drop="${c.empId}|${d}"]`);el.scrollIntoView();const r=el.getBoundingClientRect();const p=document.querySelector('#palette [data-drag-shift="abs:l4"]');p.scrollIntoView({inline:'center',block:'center'});const q=p.getBoundingClientRect();const r2=el.getBoundingClientRect();return{emp:c.empId,d,x:r2.x+r2.width/2,y:r2.y+r2.height/2,px:q.x+q.width/2,py:q.y+q.height/2};return{emp:c.empId,d,x:r.x+r.width/2,y:r.y+r.height/2,px:q.x+q.width/2,py:q.y+q.height/2}});
await pg.mouse.move(t.px,t.py);await pg.mouse.down();await pg.mouse.move(t.px+20,t.py+20,{steps:3});await pg.mouse.move(t.x,t.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(800);
const r2=await pg.evaluate(([emp,d])=>({abs:S.abs.filter(a=>a.empId===emp&&a.date===d).map(a=>a.reason),routes:S.scheds[S.current].cells.filter(c=>c.date===d&&c.empId===emp).length}),[t.emp,t.d]);
ok('L4 przeciągnięte z paska na komórkę',r2.abs.join()==='l4'&&r2.routes===0,JSON.stringify(r2));
console.log('ERRS',errs);await b.close()})();
