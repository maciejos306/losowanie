const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1250,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async()=>{const o={};
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};
 const D=["2026-10-05","2026-10-06","2026-10-07","2026-10-08","2026-10-09","2026-10-10","2026-10-11"];
 const rows=[];for(let i=0;i<5;i++)rows.push({date:D[i],shiftId:"t1",slot:0,empId:"e1"});
 rows.push({date:D[0],shiftId:"nagel",slot:0,empId:"e1"}); // planowany
 for(let i=0;i<5;i++)rows.push({date:D[i],shiftId:"t1",slot:1,empId:"e2"});rows.push({date:D[0],shiftId:"nagel",slot:0,empId:"e2"});
 for(let i=0;i<5;i++)rows.push({date:D[i],shiftId:"t1",slot:2,empId:"e3"});rows.push({date:D[0],shiftId:"nagel",slot:0,empId:"e3"});
 for(let i=0;i<5;i++)rows.push({date:D[i],shiftId:"t1",slot:3,empId:"e4"});rows.push({date:D[0],shiftId:"nagel",slot:0,empId:"e4"});
 // nagel ma tylko slot 0 → każdy dyżur w innym dniu
 const nag=rows.filter(c=>c.shiftId==="nagel");nag.forEach((c,i)=>{c.date=D[i];});
 S.scheds.w={id:"w",start:D[0],end:D[6],createdAt:"2027-01-01",cells:rows};__docs['schedules/w']=JSON.parse(JSON.stringify(S.scheds.w));
 const dn=(e)=>ledger(null)[e].find(w=>w.monday===D[0]).delta;
 o.planned=dn("e1");                     // 5+0,5-5 = +0,5
 const c2=rows.find(c=>c.empId==="e2"&&c.shiftId==="nagel");c2.duty="cancelled";o.cancelled=dn("e2");   // 0
 const c3=rows.find(c=>c.empId==="e3"&&c.shiftId==="nagel");c3.duty="done";c3.dutyH=6.5;o.over5=dn("e3");  // +1
 const c4=rows.find(c=>c.empId==="e4"&&c.shiftId==="nagel");c4.duty="done";c4.dutyH=4;o.under5=dn("e4");   // +0,5
 c4.dutyH=5;o.exact5=dn("e4");           // 5 h dokładnie = 0,5
 const h=hrReport("2026-10");o.duty=Object.fromEntries(h.filter(x=>["e1","e2","e3","e4"].includes(x.employeeId)).map(x=>[x.employeeId,x.duty]));
 o.api=await HarmonogramPlugin.reportDuty("e1",c2.date==="x"?"":rows.find(c=>c.empId==="e1"&&c.shiftId==="nagel").date,{went:true,hours:7});
 o.afterApi=dn("e1");
 o.api2=await HarmonogramPlugin.reportDuty("e1",rows.find(c=>c.empId==="e1"&&c.shiftId==="nagel").date,{went:false});o.afterCancel=dn("e1");
 o.noDuty=(await HarmonogramPlugin.reportDuty("e1","2026-10-11",{went:true})).ok;
 return o});
console.log(JSON.stringify(r));
ok('dyżur planowany = 0,5',r.planned===0.5);ok('nie wyjechał: anulowany = 0',r.cancelled===0);
ok('ponad 5 h = 1 dniówka',r.over5===1);ok('poniżej 5 h = 0,5',r.under5===0.5);ok('dokładnie 5 h = 0,5',r.exact5===0.5);
ok('Kadry: anulowany nie liczy godzin dyżuru',r.duty.e2===0,JSON.stringify(r.duty));
ok('Kadry: wyjechał 6,5 h',r.duty.e3===6.5);
ok('API reportDuty wyjechał 7 h → 1 dn.',r.api.ok&&r.afterApi===1);ok('API reportDuty nie wyjechał → 0',r.afterCancel===0);
ok('API bez dyżuru zwraca błąd',r.noDuty===false);
// UI arkusz
await pg.evaluate(()=>{S.current='w';document.querySelector('nav .tab[data-tab="plan"]').click();renderPlan()});
const cell=await pg.evaluate(()=>{const c=S.scheds.w.cells.find(c=>c.empId==="e3"&&c.shiftId==="nagel");return c.empId+"|"+c.date});
await pg.evaluate(c=>{const [e,d]=c.split("|");openSheet(e,d)},cell);
await pg.waitForTimeout(150);
ok('arkusz ma sekcję dyżuru',await pg.locator('#duty-state').count()===1);
await pg.selectOption('#duty-state','done');await pg.fill('#duty-h','8');await pg.click('[data-dutysave]');await pg.waitForTimeout(200);
const v=await pg.evaluate(()=>{const c=S.scheds.w.cells.find(c=>c.empId==="e3"&&c.shiftId==="nagel");return [c.duty,c.dutyH,document.getElementById("notice").innerText]});
ok('zapis z arkusza',v[0]==="done"&&v[1]===8,JSON.stringify(v));
await pg.evaluate(c=>{const [e,d]=c.split("|");openSheet(e,d)},cell);await pg.selectOption('#duty-state','cancelled');await pg.click('[data-dutysave]');await pg.waitForTimeout(200);
ok('kafelek anulowanego dyżuru',await pg.locator('.chip.dutyx').count()>0);
await pg.locator('#plan-table').screenshot({path:'duty.png'});
console.log('ERRS',errs);await b.close()})();
