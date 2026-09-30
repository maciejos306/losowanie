const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{
 S.hr={_cal:{custom:[{id:'n1',date:'2026-10-14',name:'Dzień bez tras',kind:'firmowy',routes:'none'}]}};calCache={};
 const cells=generate('2026-10-12','2026-10-18',null);
 const on=d=>cells.filter(c=>c.date===d).length;
 return{none:on('2026-10-14'),others:['2026-10-13','2026-10-15'].map(on),opts:shiftsOn('2026-10-14').length,est:estOf({est:{}},'2026-10-14').n,slots:slotsOn('2026-10-14').free}});
console.log(JSON.stringify(r),r.none===0&&r.others.every(x=>x>0)&&r.opts===0&&r.est===0?'OK   generowanie pomija dni bez tras':'FAIL');
console.log('ERRS',errs);await b.close()})();
