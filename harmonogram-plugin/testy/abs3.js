const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const open=async()=>{await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);await pg.evaluate(()=>{FL.mcp=null})};
// A. formularz w Kadrach zdejmuje trasy
await open();
const a=await pg.evaluate(async()=>{const today=warsawDay();const s=S.scheds[S.current];const d1=addDays(today,2),d2=addDays(today,3);const c=s.cells.find(c=>c.date===d1&&c.empId&&s.cells.some(x=>x.date===d2&&x.empId===c.empId));const emp=c.empId;
 document.querySelector('nav .tab[data-tab="kadry"]').click();await new Promise(r=>setTimeout(r,300));
 document.querySelector(`[data-absdate="${emp}"]`).value=d1;document.querySelector(`[data-absdate2="${emp}"]`).value=d2;document.querySelector(`[data-absreason="${emp}"]`).value='l4';document.querySelector(`[data-absadd="${emp}"]`).click();await new Promise(r=>setTimeout(r,900));
 return{emp,abs:S.abs.filter(x=>x.empId===emp&&x.date>=d1&&x.date<=d2).length,routes:s.cells.filter(x=>x.empId===emp&&x.date>=d1&&x.date<=d2).length,saved:__docs['schedules/'+s.id].cells.filter(x=>x.empId===emp&&x.date>=d1&&x.date<=d2).length,note:$("notice").textContent}});
ok('Kadry: L4 na 2 dni wpisane i trasy zdjęte (także w bazie)',a.abs===2&&a.routes===0&&a.saved===0,JSON.stringify(a));
ok('Kadry: komunikat z nazwiskiem i zakresem',/L4 \d\d\.\d\d – \d\d\.\d\d/.test(a.note),a.note);
// B. odmowa zapisu: czerwony pasek, pamięć wraca do stanu z bazy, trasy zostają
await open();
const bq=await pg.evaluate(async()=>{const today=warsawDay();const s=S.scheds[S.current];const d=addDays(today,4);const c=s.cells.find(c=>c.date===d&&c.empId);const emp=c.empId;
 const raw=S.db.doc.bind(S.db);S.db={...S.db,doc:p=>{const x=raw(p);return p==='app/absences'?{...x,set:async()=>{throw{code:'invalid_argument',message:'write refused'}}}:x}};
 try{await tlAbs('urlop',emp,d)}catch(e){}await new Promise(r=>setTimeout(r,300));
 return{abs:S.abs.filter(x=>x.empId===emp&&x.date===d).length,routes:s.cells.filter(x=>x.empId===emp&&x.date===d).length,banner:document.getElementById('dberr')?.textContent||'',hidden:document.getElementById('dberr')?.hidden,ro:S.ro,chips:[...document.querySelectorAll('th.day .ini')].length}});
ok('odmowa zapisu: pasek NIE ZAPISANO z wyjaśnieniem o prawie edycji',/NIE ZAPISANO/.test(bq.banner)&&/prawem edycji/.test(bq.banner)&&bq.hidden===false,bq.banner);
ok('odmowa zapisu: nieobecność nie zostaje w pamięci, trasa zostaje',bq.abs===0&&bq.routes===1,JSON.stringify(bq));
// C. nieobecność z innej przeglądarki/FlotoMax → samonaprawa
await open();
const cq=await pg.evaluate(async()=>{const today=warsawDay();const s=S.scheds[S.current];const d=addDays(today,5);const c=s.cells.find(c=>c.date===d&&c.empId);const emp=c.empId;const sid=c.shiftId;
 __docs['app/absences']={items:[...S.abs,{empId:emp,date:d,reason:'urlop',src:'floto',flotoAbs:999}]};__emit('app/absences');await new Promise(r=>setTimeout(r,1200));
 return{emp,abs:S.abs.filter(x=>x.empId===emp&&x.date===d).length,routes:s.cells.filter(x=>x.empId===emp&&x.date===d).length,who:s.cells.filter(x=>x.date===d&&x.shiftId===sid).map(x=>x.empId),saved:__docs['schedules/'+s.id].cells.filter(x=>x.empId===emp&&x.date===d).length,note:$("notice").textContent}});
ok('nieobecność z zewnątrz: program sam zdejmuje trasę i zapisuje grafik',cq.abs===1&&cq.routes===0&&cq.saved===0,JSON.stringify(cq));
ok('…i szuka zastępcy',cq.who.length===1&&cq.who[0]&&cq.who[0]!==cq.emp,JSON.stringify(cq.who));
ok('…z komunikatem',/przestawiony z powodu nieobecności/.test(cq.note),cq.note);
// D. gdy naprawa niemożliwa (podgląd): kafelek pokazuje kolizję
await open();
const dq=await pg.evaluate(async()=>{const today=warsawDay();const s=S.scheds[S.current];let d=null,c=null;for(let i=1;i<12&&!c;i++){const dd=addDays(today,i);const cc=s.cells.find(x=>x.date===dd&&x.empId&&!absMap()[x.empId]?.[dd]);if(cc){d=dd;c=cc}}const emp=c.empId;S.ro=true;
 S.abs.push({empId:emp,date:d,reason:'urlop'});renderPlan();await new Promise(r=>setTimeout(r,200));
 const td=document.querySelector(`[data-drop="${emp}|${d}"]`);return{html:td?.innerHTML||'',routes:s.cells.filter(x=>x.empId===emp&&x.date===d).length}});
ok('kolizja widoczna na kafelku: „⚠ Urlop – trasa nadal przydzielona”',/abx/.test(dq.html)&&/Urlop – trasa nadal przydzielona/.test(dq.html)&&dq.routes>=1,dq.html.slice(0,200));
// E. nieobecność z FlotoMax usunięta w oknie komórki nie wraca przy pobraniu
await open();
const eq=await pg.evaluate(async()=>{const today=warsawDay();const s=S.scheds[S.current];let d=null,c=null;for(let i=1;i<12&&!c;i++){const dd=addDays(today,i);const cc=s.cells.find(x=>x.date===dd&&x.empId&&!absMap()[x.empId]?.[dd]);if(cc){d=dd;c=cc}}const emp=c.empId;
 S.abs.push({empId:emp,date:d,reason:'urlop',src:'floto',flotoAbs:777});await saveA();await new Promise(r=>setTimeout(r,500));
 openSheet(emp,d);document.querySelector('#sheet-opts [data-abs-del]').click();await new Promise(r=>setTimeout(r,500));
 const e=S.emps.find(x=>x.id===emp);const r=applyFlotoAbsences([{id:777,driverId:e.flotoId||1,driverName:e.name,type:'urlop',from:d,to:d}],d,d);
 return{ign:S.hr._absIgnore,abs:S.abs.filter(x=>x.empId===emp&&x.date===d).length,added:r.added,note:$("notice").textContent}});
ok('usunięta nieobecność z FlotoMax trafia na listę pominiętych i nie wraca',eq.ign&&eq.ign.includes('777')&&eq.abs===0&&eq.added.length===0,JSON.stringify(eq));
console.log('ERRS',errs);await b.close()})();
