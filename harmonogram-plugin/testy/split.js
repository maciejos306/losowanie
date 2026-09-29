const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
 const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/local.html'); await pg.waitForTimeout(600);
 const r=await pg.evaluate(async()=>{
  const s=S.scheds[S.current]; const date=s.start>"" ? addDays(s.start,1):null; // wtorek
  const emp=S.emps.find(e=>e.active).id;
  const ids=S.shifts.filter(x=>(x.part||"full")==="full"&&x.weight===1).slice(0,2).map(x=>x.id);
  await assignShift(emp,date,ids[0]); await assignShift(emp,date,ids[1]);
  const cells=()=>S.scheds[S.current].cells.filter(c=>c.date===date&&c.empId===emp).map(c=>c.shiftId+":"+(c.part||"-"));
  const a=cells(); const halves=document.querySelector(`td.half[data-drop="${emp}|${date}"]`)!==null;
  await undoLast(); const b=cells(); await undoLast(); const c=cells();
  return {a,halves,b,c,undoLeft:(S.undo[S.current]||[]).length};
 });
 console.log(JSON.stringify(r),errs);
 await b.close();
})();
