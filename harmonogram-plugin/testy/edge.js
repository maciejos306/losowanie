const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const errs=[];const log=(k,v)=>console.log((v?'OK   ':'FAIL ')+k);
// telefon
const pg=await b.newPage({viewport:{width:390,height:800}});pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
for(const t of await pg.$$eval('nav .tab',b=>b.map(x=>x.dataset.tab))){
 await pg.click(`nav .tab[data-tab="${t}"]`);await pg.waitForTimeout(150);
 const w=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);log(`telefon bez poziomego scrolla strony: ${t} ${w}`,w[0]<=w[1]+1)}
// brzegowe + cofanie
const r=await pg.evaluate(async()=>{const o={};
 document.querySelector('nav .tab[data-tab="plan"]').click();
 const s=()=>S.scheds[S.current];const snap=()=>JSON.stringify(s().cells);
 const start=snap();
 const e=S.emps.find(x=>x.active).id;const d=addDays(s().start,3);
 await assignShift(e,d,"t1");await assignShift(e,d,"t2");await assignShift(e,d,"t3");
 o.cellsAfter3=s().cells.filter(c=>c.date===d&&c.empId===e).map(c=>c.shiftId+":"+(c.part||"-"));
 await assignShift(e,d,null);o.cleared=s().cells.filter(c=>c.date===d&&c.empId===e).length;
 // niedziela
 const sun=addDays(s().start,6);await assignShift(e,sun,"t1");await assignShift(e,sun,"t2");
 o.sunday=s().cells.filter(c=>c.date===sun&&c.empId===e).map(c=>c.shiftId+":"+(c.part||"-"));
 let n=0;while((S.undo[S.current]||[]).length){await undoLast();n++}
 o.undoSteps=n;o.backToStart=snap()===start;
 // dezaktywacja wszystkich i losowanie
 const before=S.emps.map(x=>x.active);S.emps.forEach(x=>x.active=false);
 let ok=true;try{const c=generate("2026-11-02","2026-11-08",null);o.noEmp=c.every(x=>x.empId==null)}catch(er){o.noEmpErr=er.message}
 S.emps.forEach((x,i)=>x.active=before[i]);
 // kadry
 const h=hrReport("2026-10");o.hr0=h[0]&&Object.keys(h[0]);
 // wniosek nie blokuje
 await HarmonogramPlugin.requestLeave(e,"2026-10-20","2026-10-21");
 o.wniosekNoBlock=absMap()[e]?.["2026-10-20"]===undefined;
 o.availLeave=availability("2026-10-20").find(x=>x.employeeId===e).status;
 return o});
console.log(JSON.stringify(r));
log('trzecia trasa zastępuje część po południu (2 komórki)',r.cellsAfter3.length===2);
log('wyczyszczenie dnia',r.cleared===0);
log('niedziela: 1 trasa',r.sunday.length===1);
log('cofanie do stanu wyjściowego',r.backToStart);
log('brak aktywnych — bez wyjątku, puste obsady',r.noEmp===true);
log('wniosek nie blokuje',r.wniosekNoBlock);
console.log('ERRS',errs);await b.close()})();
