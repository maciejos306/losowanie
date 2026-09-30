const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1700,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const doc=JSON.parse(fs.readFileSync('week_import_final.json','utf8'));
await pg.evaluate(async(doc)=>{
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};
 S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1;if(s.id==='t12')s.rest=0});
 // slot 0 dyżuru 30.09 pusty (Twardzik usunięty), Roman w slocie 1
 doc.cells=doc.cells.filter(c=>!(c.date==='2026-09-30'&&c.shiftId==='nagel'&&c.slot===0));doc.cells.push({date:'2026-09-30',shiftId:'nagel',slot:0,empId:null});
 S.scheds[doc.id]=doc;S.current=doc.id;__docs['schedules/'+doc.id]=JSON.parse(JSON.stringify(doc));
 document.querySelector('[data-view="hours"],#btn-view-hours')?.click();
},doc);
// widok godzin
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Godziny/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(300);
const row=n=>pg.locator('table.tl tr',{hasText:n}).first();
const lanes=async n=>row(n).locator('td.cell').evaluateAll(tds=>tds.map(td=>[...td.querySelectorAll('.lane > *')].map(x=>({c:x.className,t:x.innerText.replace(/\n/g,' '),l:x.style.left,w:x.style.width,r:x.style.right}))));
// Knura: T10 w środę (idx 2) -> spill we wtorek (idx 1), cont w środę
const kn=await lanes('Grzegorz Knura');
ok('Knura: wtorek ma pasek wyjazdu Trasa 10 od 21:00',kn[1].some(x=>/Trasa 10/.test(x.t)&&/spill/.test(x.c)&&parseFloat(x.l)>85),JSON.stringify(kn[1].map(x=>x.t)));
ok('Knura: środa ma tylko końcówkę (cont do 17:00), bez startu',kn[2].some(x=>/Trasa 10/.test(x.t)&&/cont/.test(x.c)&&/17:00/.test(x.t))&&!kn[2].some(x=>/spill/.test(x.c)&&/Trasa 10/.test(x.t)));
ok('Knura: wtorek nadal ma Trasa 7 rano',kn[1].some(x=>/Trasa 7/.test(x.t)&&!/spill/.test(x.c)));
// Czogała: wtorek wolne + wyjazd wieczorem (Trasa 8), węższy znacznik
const cz=await lanes('Andrzej Czogała');
ok('Czogała: wtorek ma wyjazd Trasa 8 i węższe „wolne”',cz[1].some(x=>/Trasa 8/.test(x.t)&&/spill/.test(x.c))&&cz[1].some(x=>/wolne/.test(x.t)&&/right/.test(x.r?('right'):'')),JSON.stringify(cz[1].map(x=>[x.t,x.r])));
// niedziela T11 (Schmidt): wyjazd w sobotę
const sc=await lanes('Jacek Schmidt');
ok('Schmidt: sobota ma wyjazd Trasa 11 (19:00), niedziela końcówkę',sc[5].some(x=>/Trasa 11/.test(x.t)&&/spill/.test(x.c))&&sc[6].some(x=>/Trasa 11/.test(x.t)&&/cont/.test(x.c)));
// odpoczynek po T10: tooltip liczy od środy 17:00
const rt=await row('Grzegorz Knura').locator('td.cell').nth(3).locator('.tl-rest').getAttribute('title');
ok('odpoczynek po Trasa 10 liczony od środy 17:00',/śr 17:00|sro 17:00|śro 17:00/i.test(rt||''),rt);
// poprzedni tydzień: nie dorysowuje „kontynuacji” w poniedziałek
const hist=await pg.evaluate(async(doc)=>{
 const s2={id:'nxt',name:'nast',start:'2026-10-05',end:'2026-10-11',createdAt:'2026-10-01',cells:[{date:'2026-10-05',shiftId:'t10',slot:0,empId:'e4'},{date:'2026-10-06',shiftId:'t1',slot:0,empId:'e8'}]};
 S.scheds.nxt=s2;__docs['schedules/nxt']=JSON.parse(JSON.stringify(s2));S.current='nxt';renderPlan();
 const b=[...document.querySelectorAll('button')].find(x=>/Godziny/.test(x.textContent));b&&b.click();
 return 1},doc);await pg.waitForTimeout(300);
const n1=await lanes('Jacek Schmidt');ok('nowy tydzień: Niedziela Trasa 11 z poprzedniego tygodnia nie rysuje kontynuacji w poniedziałek',!n1[0].some(x=>/Trasa 11/.test(x.t)&&/cont/.test(x.c)),JSON.stringify(n1[0].map(x=>x.t)));
const n4=await lanes('Andrzej Czogała');ok('nowy tydzień: Trasa 10 w poniedziałek ma końcówkę w poniedziałek',n4[0].some(x=>/Trasa 10/.test(x.t)&&/cont/.test(x.c)));
await pg.evaluate(()=>{S.current='week-2026-09-28';renderPlan();const b=[...document.querySelectorAll('button')].find(x=>/Godziny/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(250);
const last=await lanes('Andrzej Czogała');ok('poprzedni tydzień: niedziela ma wyjazd z następnego tygodnia (poniedziałek Trasa 10)',last[6].some(x=>/Trasa 10/.test(x.t)&&/spill/.test(x.c)),JSON.stringify(last[6].map(x=>x.t)));
// brak obsady
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Kafelki/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(200);
ok('dyżur obsadzony (Roman) mimo pustej pozycji: brak ostrzeżenia',!/Brak obsady/.test(await pg.locator('#unfilled').innerText()),await pg.locator('#unfilled').innerText());
await pg.evaluate(()=>{const s=S.scheds['week-2026-09-28'];s.cells=s.cells.filter(c=>!(c.date==='2026-09-30'&&c.shiftId==='nagel'&&c.empId));renderPlan()});
ok('dyżur bez obsady: ostrzeżenie wraca',/Brak obsady \(1\).*(Nagel|Dyżur)/.test(await pg.locator('#unfilled').innerText()));
await pg.evaluate(()=>{const s=S.scheds['week-2026-09-28'];s.cells.push({date:'2026-09-30',shiftId:'nagel',slot:1,empId:'e2',locked:true,orders:['Nagel','Perfekt']});renderPlan()});
// zakończone
const r=await pg.evaluate(async()=>{const o={};
 o.a=await HarmonogramPlugin.completeRoute({employeeId:'e6',date:'2026-09-30',shiftId:'t10',departure:'20:00',return:'16:30'});
 o.bad=await HarmonogramPlugin.completeRoute({employeeId:'e6',date:'2026-09-30',shiftId:'t99'});
 const c=S.scheds['week-2026-09-28'].cells.find(c=>c.empId==='e6'&&c.shiftId==='t10');o.cell={closed:c.closed,out:c.out,back:c.back};
 o.hdr=/zakończone 1\/\d+/.test(document.querySelector('#plan-table').innerText);
 o.chip=!!document.querySelector('#plan-table .chip.closed');
 return o});
ok('completeRoute zapisuje zakończenie i godziny',r.a.ok&&r.cell.closed&&r.cell.out==='20:00'&&r.cell.back==='16:30'&&r.a.godziny===20.5,JSON.stringify(r.a));
ok('nieznana trasa odrzucona',r.bad.ok===false);
ok('nagłówek dnia: zakończone 1/N',r.hdr);ok('kafelek zakończonej trasy ma znacznik',r.chip&&/✓ Trasa 10/.test(await pg.locator('#plan-table .chip.closed').first().innerText()));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Godziny/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(250);
const k2=await lanes('Grzegorz Knura');
ok('oś godzin: rzeczywisty odjazd 20:00 (wtorek) i zakończenie ✓',k2[1].some(x=>/Trasa 10/.test(x.t)&&/closed/.test(x.c)&&Math.abs(parseFloat(x.l)-83.33)<0.5)&&k2[2].some(x=>/✓/.test(x.t)&&/16:30/.test(x.t)),JSON.stringify([k2[1].map(x=>[x.t,x.l]),k2[2].map(x=>x.t)]));
// wszystkie zakończone => dzień zakończony
const all=await pg.evaluate(async()=>{const s=S.scheds['week-2026-09-28'];for(const c of s.cells)if(c.date==='2026-10-01'&&c.empId&&c.shiftId!=='nagel')c.closed=true;for(const c of s.cells)if(c.date==='2026-10-01'&&c.shiftId==='nagel'&&c.empId){c.duty='done';c.dutyH=4}renderPlan();return document.querySelector('#plan-table').innerText.includes('dzień zakończony')});
ok('wszystkie trasy dnia zakończone: „dzień zakończony”',all);
// okno dnia
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Kafelki/.test(x.textContent));b&&b.click();openSheet('e1','2026-09-29')});await pg.waitForTimeout(150);
ok('okno dnia ma sekcję realizacji trasy',await pg.locator('#rt-closed').count()===1);
await pg.check('#rt-closed');await pg.fill('#rt-out','01:40');await pg.fill('#rt-back','09:10');await pg.click('[data-routesave]');await pg.waitForTimeout(250);
ok('zapis realizacji z okna',await pg.evaluate(()=>{const c=S.scheds['week-2026-09-28'].cells.find(c=>c.empId==='e1'&&c.date==='2026-09-29'&&c.shiftId==='t3');return c.closed&&c.out==='01:40'&&c.back==='09:10'}));
// postMessage
const pm=await pg.evaluate(()=>new Promise(res=>{const h=ev=>{if(ev.data&&ev.data.action==='routeCompleted'){window.removeEventListener('message',h);res(ev.data)}};window.addEventListener('message',h);window.postMessage({type:'harmonogram',action:'completeRoute',requestId:'q',employeeId:'e2',date:'2026-09-29',departure:'01:30',return:'09:30'},'*')}));
ok('postMessage completeRoute',pm.requestId==='q'&&pm.result.ok&&pm.result.godziny===8);
const un=await pg.evaluate(async()=>{const r=await HarmonogramPlugin.completeRoute({employeeId:'e2',date:'2026-09-29',completed:false});const c=S.scheds['week-2026-09-28'].cells.find(c=>c.empId==='e2'&&c.date==='2026-09-29');return r.ok&&!c.closed&&!c.out});
ok('completed:false zdejmuje zakończenie',un);
// dostępność
const av=await pg.evaluate(()=>{const a=availability('2026-09-29').find(x=>x.employeeId==='e6');return a.departsEvening});
ok('dostępność: wieczorem wyjeżdża (Knura, Trasa 10 21:00)',av&&av[0]&&av[0].shift==='Trasa 10'&&av[0].start==='21:00',JSON.stringify(av));
await pg.click('nav .tab[data-tab="dysp"]');await pg.evaluate(()=>{document.getElementById('dysp-date').value='2026-09-29';renderDysp()});
ok('Dyspozycja dnia pokazuje wieczorny wyjazd',/wieczorem wyjeżdża: Trasa 10 \(21:00\)/.test(await pg.locator('#dysp-list').innerText()));
// reguła auto i ręczna
const rule=await pg.evaluate(()=>({t10:startsPrevDay(S.shifts.find(x=>x.id==='t10')),t12:startsPrevDay(S.shifts.find(x=>x.id==='t12')),t1:startsPrevDay(S.shifts.find(x=>x.id==='t1')),forced:startsPrevDay({start:10,weight:1,startPrev:true}),off:startsPrevDay({start:21,weight:2.5,startPrev:false})}));
ok('reguła wyjazdu: T10 wczoraj, T12 i T1 tego dnia, ręczne nadpisanie',rule.t10&&!rule.t12&&!rule.t1&&rule.forced&&!rule.off,JSON.stringify(rule));
// asystent
await pg.evaluate(()=>{document.querySelector('nav .tab[data-tab="plan"]').click();S.current='week-2026-09-28'});await pg.click('#ai-fab');
await pg.evaluate(()=>{const c=S.scheds['week-2026-09-28'].cells.find(c=>c.empId==='e6'&&c.shiftId==='t10');delete c.closed;delete c.out;delete c.back});
await pg.fill('#ai-in','zakoncz trase');await pg.click('#ai-send');await pg.waitForFunction(()=>!document.getElementById('ai-send').disabled,null,{timeout:8000});await pg.waitForTimeout(150);
ok('asystent proponuje zakończenie trasy',await pg.locator('.ai-card.pend').count()===1);
await pg.click('[data-ok]');await pg.waitForTimeout(300);
ok('po zatwierdzeniu trasa zakończona z godzinami',await pg.evaluate(()=>{const c=S.scheds['week-2026-09-28'].cells.find(c=>c.empId==='e6'&&c.shiftId==='t10');return c.closed&&c.out==='20:00'&&c.back==='16:30'}));
const tl=await pg.evaluate(()=>HarmonogramAssistant.tools().map(t=>({n:t.name,d:t.description.length,s:JSON.stringify(t.inputSchema).length})));
ok('narzędzia w limitach',tl.length<=16&&tl.every(t=>/^[A-Za-z0-9_-]{1,128}$/.test(t.n)&&t.d<=1024&&t.s<=4096),tl.length+' narzędzi');
await pg.evaluate(()=>{document.getElementById('ai-panel').hidden=true;const b=[...document.querySelectorAll('button')].find(x=>/Godziny/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(300);
await pg.locator('#timeline').screenshot({path:'prev.png'});
console.log('ERRS',errs);await b.close()})();
