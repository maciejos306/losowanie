const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async()=>{const o={};
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 S.abs=[];S.hr={};calCache={};S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1;if(s.id==='t10')s.reqC=true});
 const D=[0,1,2,3,4,5,6].map(i=>addDays('2026-10-05',i));const c=[];
 const add=(i,sh,e,extra={})=>c.push({date:D[i],shiftId:sh,slot:c.filter(x=>x.date===D[i]&&x.shiftId===sh).length,empId:e,...extra});
 for(let i=0;i<5;i++)add(i,'t1','e1');                        // 5 dn, 40 h (plan)
 add(0,'t8','e2');for(let i=1;i<5;i++)add(i,'t1','e2');       // 6,5 dn, 52 h w trasie, 43 h pracy (9 h odpoczynku w T8)
 add(0,'nagel','e3',{duty:'done',out:'14:30',back:'21:00'});   // 1 dn (6,5 h rzecz.)
 add(0,'nagel','e4');                                        // niezrealizowany: 0 dn, 0 h
 add(1,'t10','e5',{closed:true,out:'20:00',back:'16:30'});    // 2,5 dn, 20,5 h rzecz.
 add(1,'nagel','e6',{duty:'cancelled'});                      // anulowany: 0
 add(2,'nagel','e7',{duty:'done',dutyH:4});                   // 0,5 dn, 4 h (wpisany czas)
 add(3,'t2','e8',{closed:true});                              // 1 dn, 8 h z planu (zakończona bez godzin)
 S.scheds.w={id:'w',start:D[0],end:D[6],createdAt:'2026-10-01',cells:c};__docs['schedules/w']=JSON.parse(JSON.stringify(S.scheds.w));
 // wyrocznia niezależna
 const W={};S.shifts.forEach(s=>W[s.id]=s);const orc={};
 for(const x of c){const sh=W[x.shiftId];const duty=sh.part==='pm';let dn=0,h=0;
  if(duty){if(x.duty==='done'){dn=(x.out&&x.back?(((x.back.split(':')[0]*60+ +x.back.split(':')[1])-(x.out.split(':')[0]*60+ +x.out.split(':')[1])+1440)%1440)/60:(x.dutyH??5))>5?1:0.5;h=x.out&&x.back?(((x.back.split(':')[0]*60+ +x.back.split(':')[1])-(x.out.split(':')[0]*60+ +x.out.split(':')[1])+1440)%1440)/60:(x.dutyH??5)}}
  else{dn=sh.weight;h=x.out&&x.back?(((x.back.split(':')[0]*60+ +x.back.split(':')[1])-(x.out.split(':')[0]*60+ +x.out.split(':')[1])+1440)%1440)/60:sh.hours;
   const em=S.emps.find(e=>e.id===x.empId);if(em.catC!==false&&sh.reqC&&h>=12)h-=9} // 9 h odpoczynku w trasie kat. C nie jest czasem pracy
  const a=orc[x.empId]??={dn:0,h:0};a.dn+=dn;a.h+=h}
 const rows=weekRegister('2026-10-05');o.rows=Object.fromEntries(rows.map(r=>[r.id,{dn:r.dn,h:r.h,hAct:r.hAct,hPlan:r.hPlan}]));o.orc=orc;
 o.mism=Object.keys(orc).filter(k=>Math.abs(orc[k].dn-o.rows[k].dn)>1e-9||Math.abs(orc[k].h-o.rows[k].h)>1e-9);
 o.hpd=rows.find(r=>r.id==='e2').hpd;o.norm=rows.find(r=>r.id==='e1').norm;
 // stawki
 S.emps.find(e=>e.id==='e1').rate=30;S.emps.find(e=>e.id==='e1').rateUnit='h';         // rh 30, rd 255
 S.emps.find(e=>e.id==='e2').rate=255;S.emps.find(e=>e.id==='e2').rateUnit='d';        // rd 255, rh 30
 S.emps.find(e=>e.id==='e3').rate=6000;S.emps.find(e=>e.id==='e3').rateUnit='m';       // miesięczna
 const r2=weekRegister('2026-10-05');const g=id=>r2.find(r=>r.id===id);
 o.e1=[g('e1').payD,g('e1').payH];o.e2=[g('e2').payD,g('e2').payH];o.e3=[g('e3').payD,g('e3').payH,monthNormDays(2026,10)];
 o.noRate=g('e5').hasRate;
 // dodatek 0%
 const r3=weekRegister('2026-10-05',{prem:0});o.e2prem0=r3.find(r=>r.id==='e2').payH;
 // agregacja
 const sum=regSum(['2026-10-05']);o.sum=sum.find(r=>r.id==='e2').dn;
 // tygodnie
 o.weeks=regWeeks();
 // święto w tygodniu: norma
 S.scheds.h2={id:'h2',start:'2026-04-06',end:'2026-04-12',createdAt:'2026-04-01',cells:[{date:'2026-04-07',shiftId:'t1',slot:0,empId:'e1'}]};
 o.normHol=weekRegister('2026-04-06').find(r=>r.id==='e1').norm;
 delete S.scheds.h2;
 return o});
console.log(JSON.stringify(r));
ok('rejestr zgadza się z niezależnym wyliczeniem dla wszystkich kierowców',r.mism.length===0,JSON.stringify(r.mism));
ok('e1: 5 dniówek, 40 h z planu',r.rows.e1.dn===5&&r.rows.e1.h===40&&r.rows.e1.hPlan===40&&r.rows.e1.hAct===0);
ok('e2: Trasa 8 + 4 krótkie = 6,5 dn. i 52 h (T8 bez kat. C: bez odpoczynku 9 h)',r.rows.e2.dn===6.5&&r.rows.e2.h===52,JSON.stringify(r.rows.e2)+' hpd '+r.hpd);
ok('dyżur z odjazdem 14:30 i powrotem 21:00 = 6,5 h rzecz. = 1 dniówka',r.rows.e3.dn===1&&r.rows.e3.hAct===6.5);
ok('dyżur niezrealizowany i anulowany: 0 dn., 0 h',r.rows.e4.dn===0&&r.rows.e4.h===0&&r.rows.e6.dn===0&&r.rows.e6.h===0);
ok('Trasa 10 z odjazdem 20:00 i powrotem 16:30: 2,5 dn. i 11,5 h pracy (20,5 h minus 9 h odpoczynku)',r.rows.e5.dn===2.5&&r.rows.e5.hAct===11.5);
ok('dyżur z wpisanym czasem 4 h = 0,5 dn. i 4 h rzecz.',r.rows.e7.dn===0.5&&r.rows.e7.hAct===4);
ok('trasa zakończona bez godzin: godziny z planu (8)',r.rows.e8.dn===1&&r.rows.e8.hPlan===8&&r.rows.e8.hAct===0);
ok('norma tygodnia 5 dn.',r.norm===5);
ok('stawka 30 zł/h: wg dniówek 1275, wg godzin 1200 (40 h w normie 42,5 h)',Math.abs(r.e1[0]-1275)<1e-6&&Math.abs(r.e1[1]-1200)<1e-6,JSON.stringify(r.e1));
ok('stawka 255 zł/dn.: wg dniówek 1657,50, wg godzin 1702,50 (52 h, 9,5 h ponad normę +50%)',Math.abs(r.e2[0]-1657.5)<1e-6&&Math.abs(r.e2[1]-1702.5)<1e-6,JSON.stringify(r.e2));
ok('dodatek 0%: wg godzin 1560 (52 h × 30 zł)',Math.abs(r.e2prem0-1560)<1e-6,String(r.e2prem0));
ok('stawka miesięczna dzielona przez dni pracujące miesiąca (22)',r.e3[2]===22&&Math.abs(r.e3[0]-6000/22*1)<1e-6,JSON.stringify(r.e3));
ok('brak stawki: brak wynagrodzeń',r.noRate===false);
ok('regSum sumuje tygodnie',r.sum===6.5);
ok('lista tygodni z rejestru',JSON.stringify(r.weeks)==='["2026-10-05"]');
ok('norma tygodnia ze świętem (Poniedziałek Wielkanocny) = 4',r.normHol===4);
// UI
await pg.evaluate(()=>{S.current='w';regSel='2026-10-05';render()});
await pg.click('nav .tab[data-tab="rejestr"]');await pg.waitForTimeout(200);
ok('karta Rejestr: tabela ma wiersz na kierowcę i sumę',(await pg.locator('#reg-table tr').count())===10);
ok('werdykt podaje dniówki i godziny',/dniówek/.test(await pg.locator('#reg-verdict').innerText())&&/przepracowanych godzin/.test(await pg.locator('#reg-verdict').innerText()));
const vt=await pg.locator('#reg-verdict').innerText();
ok('werdykt w złotówkach dla kierowców ze stawką (3 z 8)',/ze stawką \(3 z 8\)/.test(vt),vt.slice(0,400));
const before=await pg.locator('#reg-table').innerText();
await pg.fill('#reg-prem','100');await pg.locator('#reg-prem').blur();await pg.waitForTimeout(250);
ok('dodatek za godziny ponad normę zapisuje się i przelicza',await pg.evaluate(()=>S.hr._reg.prem===100)&&(await pg.locator('#reg-table').innerText())!==before);
await pg.selectOption('#reg-scope','all');await pg.waitForTimeout(150);
ok('zakres „wszystkie tygodnie”',/wszystkie tygodnie/i.test(await pg.locator('#reg-verdict').innerText()));
ok('macierz tygodni x kierowcy z sumą',(await pg.locator('#reg-matrix tr').count())===3&&/Σ wszystkie tygodnie/.test(await pg.locator('#reg-matrix').innerText()));
await pg.click('#reg-csv');await pg.waitForTimeout(150);
const csv=await pg.inputValue('#reg-out');ok('CSV z nagłówkiem i 8 kierowcami',csv.split('\n').length===9&&/^Kierowca;Dniówki/.test(csv));
// asystent
await pg.click('#ai-fab');await pg.fill('#ai-in','rejestr');await pg.click('#ai-send');await pg.waitForFunction(()=>!document.getElementById('ai-send').disabled,null,{timeout:8000});await pg.waitForTimeout(150);
const at=await pg.locator('.ai-m.a').last().innerText();
ok('asystent: rejestr bez stawek i wynagrodzeń',/"dniowki"/.test(at)&&/"godziny_rzeczywiste"/.test(at)&&!/zl|zł|stawk|wynagrodz/.test(at.replace(/Nie podajesz wynagrodzeń/,'')),at.slice(0,140));
const api=await pg.evaluate(()=>HarmonogramPlugin.register('2026-10-05').length);ok('API register',api===8);
const tl=await pg.evaluate(()=>HarmonogramAssistant.tools().map(t=>({n:t.name,d:t.description.length,s:JSON.stringify(t.inputSchema).length})));
ok('narzędzia w limitach',tl.length<=16&&tl.every(t=>/^[A-Za-z0-9_-]{1,128}$/.test(t.n)&&t.d<=1024&&t.s<=4096),tl.length+' narzędzi');
await pg.evaluate(()=>{document.getElementById('ai-panel').hidden=true});
await pg.locator('#rejestr').screenshot({path:'reg.png'});
console.log('ERRS',errs);await b.close()})();
