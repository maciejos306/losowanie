const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.hr={};calCache={};
 // tydzień 26.10–01.11.2026: 1.11 to niedziela (święto) → norma 5; L4 w niedzielę-święto nadal zmniejsza normę
 const D=[0,1,2,3,4,5,6].map(i=>addDays('2026-10-26',i));S.scheds.s={id:'s',start:D[0],end:D[6],createdAt:'2026-10-01',cells:[{date:D[0],shiftId:'t1',slot:0,empId:'e1'}]};
 S.abs=[{empId:'e1',date:D[6],reason:'l4'}];const a=ledger(null).e1[0].norm;const reg=weekRegister('2026-10-26').find(r=>r.id==='e1').norm;
 // L4 w święto w dzień powszedni (11.11.2026, środa) nie liczy się podwójnie
 const D2=[0,1,2,3,4,5,6].map(i=>addDays('2026-11-09',i));S.scheds.s2={id:'s2',start:D2[0],end:D2[6],createdAt:'2026-10-01',cells:[{date:D2[0],shiftId:'t1',slot:0,empId:'e1'}]};S.abs=[{empId:'e1',date:D2[2],reason:'l4'}];const b=ledger(null).e1.find(w=>w.monday==='2026-11-09').norm;
 return{a,b,reg}});
console.log(JSON.stringify(r),r.a===4&&r.b===4&&r.reg===4?'OK   L4 w niedzielę-święto zmniejsza normę, w święto powszednie nie liczy się podwójnie':'FAIL');
console.log('ERRS',errs);await b.close()})();
