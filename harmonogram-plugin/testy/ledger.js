const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(()=>{
 Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};
 const mk=(id,rows)=>{const cells=[];rows.forEach(([e,d,sh])=>cells.push({date:d,shiftId:sh,slot:0,empId:e}));return S.scheds[id]={id,start:"2026-10-05",end:"2026-10-11",createdAt:"2027-01-01",cells}};
 const D=["2026-10-05","2026-10-06","2026-10-07","2026-10-08","2026-10-09","2026-10-10","2026-10-11"];
 const rows=[];
 for(let i=0;i<5;i++)rows.push(["e1",D[i],"t1"]);                       // 5 x 8,5 = 42,5 -> 0
 for(let i=0;i<4;i++)rows.push(["e2",D[i],"t1"]);                       // 34 -> -8,5
 rows.push(["e3",D[0],"t8"]);for(let i=1;i<5;i++)rows.push(["e3",D[i],"t1"]); // 20+34 = 54 -> +11,5
 for(let i=0;i<5;i++)rows.push(["e4",D[i],"t1"]);rows.push(["e4",D[2],"nagel"]); // +5 (dyżur 5h)
 for(let i=0;i<4;i++)rows.push(["e5",D[i],"t1"]);                       // urlop 1 dzień -> norma 34 -> 0
 mk("w1",rows);S.abs.push({empId:"e5",date:D[4],reason:"urlop"});S.abs.push({empId:"e6",date:D[1],reason:"l4"});
 const L=ledger(null);const d=id=>(L[id][0]||{}).delta;
 const o={e1:d("e1"),e2:d("e2"),e3:d("e3"),e4:d("e4"),e5:d("e5"),e6:d("e6"),e7:L.e7.length};
 o.bal=balances(null).e2;
 S.hr={e2:{overtime:10}};o.balWithManual=balances(null).e2;
 S.hr={_since:"2026-10-12"};o.sinceSkips=ledger(null).e1.length;
 S.hr={};
 // niepełny tydzień nie liczy się
 S.scheds.w1.end="2026-10-10";o.partial=ledger(null).e1.length;S.scheds.w1.end="2026-10-11";
 // wyłączony harmonogram
 o.excl=ledger("w1").e1.length;
 // raport miesięczny
 const h=hrReport("2026-10").find(x=>x.employeeId==="e2");o.month={earned:h.earned,norm:h.norm,delta:h.delta,days:h.days,saldo:h.saldoOver};
 o.pay=[payHours({weight:1}),payHours({weight:0.5}),payHours({weight:2.5}),payHours({weight:2})];
 return o});
console.log(JSON.stringify(r));
ok('5 dniówek = norma → 0',r.e1===0);ok('4 dni → dzień wolny kosztuje −1',r.e2===-1);
ok('Trasa 8 (2,5) + 4 krótkie → +1,5',r.e3===1.5);ok('dyżur 0,5 dolicza się → +0,5',r.e4===0.5);
ok('urlop bez wyjazdu kosztuje dniówkę → −1',r.e5===-1);ok('L4 zmniejsza normę (1 dzień, brak pracy → −4)',r.e6===-4);
ok('saldo = suma tygodni',r.bal===-1);ok('ręczny bilans dodaje się',r.balWithManual===9);
ok('data rachunku pomija tydzień',r.sinceSkips===0);ok('niepełny tydzień nie liczy się',r.partial===0);ok('wyłączony harmonogram nie liczy się',r.excl===0);
ok('raport miesięczny zgodny',r.month.delta===-1&&r.month.earned===4&&r.month.norm===5,JSON.stringify(r.month));
ok('godziny dniówek 8,5 / 5 / 20 / 16',JSON.stringify(r.pay)==='[8.5,5,20,16]');
console.log('e6 (L4 bez pracy)',JSON.stringify(await pg.evaluate(()=>{const L=ledger(null);return L.e6})));
console.log('ERRS',errs);await b.close()})();
