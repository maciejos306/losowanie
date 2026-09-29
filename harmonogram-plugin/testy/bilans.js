const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1300,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(500);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(()=>{const o={};
 S.abs=[];S.hr={};
 const T=()=>bilansWeek("2099-01-05");
 let w=T();o.n8=[w.drivers,w.demand,w.capNorm,w.capMax,w.status];
 S.emps.forEach((e,i)=>e.active=i<6);w=T();o.n6=[w.drivers,w.capNorm,w.capMax,w.status,w.hire,w.hireNorm];
 S.emps.forEach((e,i)=>e.active=true);
 // dodatkowi kierowcy → za mało pracy
 for(let i=0;i<3;i++)S.emps.push({id:"x"+i,name:"Nowy "+i,active:true});w=T();o.n11=[w.drivers,w.capNorm,w.status,w.advice];
 S.emps.length=8;
 // nieobecność zmniejsza pojemność
 S.abs=[{empId:"e1",date:"2099-01-05",reason:"urlop"},{empId:"e1",date:"2099-01-06",reason:"urlop"}];w=T();o.abs=[w.capNorm,w.capMax,w.absDays,w.status];
 S.abs=[];
 // granice: dokładnie 5,5 x N
 const cfg={norm:5,ot:.5,low:90};const save=S.plan;
 S.plan={days:{1:["t1"],2:["t1"],3:["t1"],4:["t1"],5:["t1"],6:[],0:[]}}; // 5 dniówek, 8 kierowców → 12,5%
 w=T();o.low=[w.demand,w.status];
 // 44 = 8 x 5,5
 S.plan={days:{1:["t8","t8","t8","t8"].slice(0,1),2:[],3:[],4:[],5:[],6:[],0:[]}};
 S.shifts.push({id:"big",name:"Big",people:1,weight:44,part:"full"});S.plan={days:{1:["big"],2:[],3:[],4:[],5:[],6:[],0:[]}};w=T();o.edge44=[w.demand,w.capMax,w.status];
 S.shifts.find(s=>s.id==="big").weight=44.5;w=T();o.edge445=[w.demand,w.status,w.hire];
 S.shifts.pop();S.plan=save;
 // z harmonogramu: liczy tygodniowe dniówki z komórek
 const s=Object.values(S.scheds)[0];const mon=weekKey(s.start);const bw=bilansWeek(mon);o.sched=[bw.src,bw.demand];
 let manual=0;const W={};S.shifts.forEach(x=>W[x.id]=x);s.cells.filter(c=>c.date>=mon&&c.date<=addDays(mon,6)&&W[c.shiftId].part!=='pm').forEach(c=>manual+=W[c.shiftId].weight);o.schedManual=manual;
 o.api=typeof HarmonogramPlugin.bilans("2099-01-05").status;
 return o});
console.log(JSON.stringify(r));
ok('8 kierowców, 41,5 dn. → OK z nadgodzinami (40/44)',r.n8[1]===41.5&&r.n8[2]===40&&r.n8[3]===44&&r.n8[4]==='ok');
ok('6 kierowców → za mało (30/33), zatrudnić 2',r.n6[3]==='short'&&r.n6[4]===2&&r.n6[1]===30&&r.n6[2]===33,JSON.stringify(r.n6));
ok('11 kierowców → za mało pracy',r.n11[2]==='idle',r.n11[3]);
ok('urlop 2 dni zmniejsza pojemność (38/41,25... )',r.abs[0]===38&&r.abs[1]===42&&r.abs[2]===2,JSON.stringify(r.abs));
ok('5 dn. przy 8 kierowcach → za mało pracy',r.low[1]==='idle');
ok('dokładnie 44 = 5,5 × 8 → OK',r.edge44[2]==='ok');
ok('44,5 > 44 → za mało kierowców, zatrudnić 1',r.edge445[1]==='short'&&r.edge445[2]===1,JSON.stringify(r.edge445));
ok('zapotrzebowanie z harmonogramu = suma wag komórek',r.sched[0]==='plan'&&r.sched[1]===r.schedManual,JSON.stringify(r.sched)+' '+r.schedManual);
ok('API bilans',r.api==='string');
// UI
await pg.click('nav .tab[data-tab="bilans"]');await pg.waitForTimeout(200);
ok('karta Bilans pokazuje status',/OK|Za mało/.test(await pg.locator('#bil-main').innerText()));
ok('tabela tygodni',await pg.locator('#bil-weeks tr').count()>2);
await pg.fill('#bil-ot','1');await pg.locator('#bil-ot').blur();await pg.waitForTimeout(250);
ok('zmiana nadgodzin zapisuje się i przelicza',await pg.evaluate(()=>S.hr._bilans?.ot===1)&&/48/.test(await pg.locator('#bil-main').innerText()),await pg.locator('#bil-main').innerText().then(t=>t.slice(0,150).replace(/\n/g,' | ')));
await pg.screenshot({path:'bilans.png',fullPage:true});
console.log('ERRS',errs);await b.close()})();
