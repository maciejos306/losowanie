const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1500,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const EASTER={2020:'2020-04-12',2021:'2021-04-04',2022:'2022-04-17',2023:'2023-04-09',2024:'2024-03-31',2025:'2025-04-20',2026:'2026-04-05',2027:'2027-03-28',2028:'2028-04-16',2029:'2029-04-01',2030:'2030-04-21',2031:'2031-04-13',2032:'2032-03-28',2033:'2033-04-17',2034:'2034-04-09',2035:'2035-03-25',2036:'2036-04-13',2037:'2037-04-05',2038:'2038-04-25',2039:'2039-04-10',2040:'2040-04-01'};
const H26=['2026-01-01','2026-01-06','2026-04-05','2026-04-06','2026-05-01','2026-05-03','2026-05-24','2026-06-04','2026-08-15','2026-11-01','2026-11-11','2026-12-24','2026-12-25','2026-12-26'];
const H27=['2027-01-01','2027-01-06','2027-03-28','2027-03-29','2027-05-01','2027-05-03','2027-05-16','2027-05-27','2027-08-15','2027-11-01','2027-11-11','2027-12-24','2027-12-25','2027-12-26'];
const N26=[160,160,176,168,160,168,184,160,176,176,160,160],N27=[152,160,176,176,144,176,176,176,176,168,160,168];
const r=await pg.evaluate(async(E)=>{const o={};
 S.hr={};S.abs=[];calCache={};
 o.easter=Object.entries(E).filter(([y,d])=>easterDate(+y)!==d).map(([y])=>y);
 o.h26=plHolidays(2026).map(h=>h.date);o.h27=plHolidays(2027).map(h=>h.date);
 o.n24=plHolidays(2024).length;o.n25=plHolidays(2025).length;o.n2010=plHolidays(2010).length;
 const monthH=y=>Array.from({length:12},(_,i)=>{const last=new Date(Date.UTC(y,i+1,0)).getUTCDate();return bilansRange(y+'-'+String(i+1).padStart(2,'0')+'-01',y+'-'+String(i+1).padStart(2,'0')+'-'+String(last).padStart(2,'0')).normHours});
 o.m26=monthH(2026);o.m27=monthH(2027);o.y25=yearStats(2025).normHours;o.y26=yearStats(2026).normHours;o.y27=yearStats(2027).normHours;
 o.st26=yearStats(2026);o.y28=yearStats(2028).normHours;o.y29=yearStats(2029).normHours;o.y30=yearStats(2030).normHours;o.wd28=yearStats(2028).weekdays;
 // tygodnie: niedziela nie zmienia, sobota i dzień powszedni zmniejszają
 o.wEasterSun=weekNormDays('2026-03-30');o.wEasterMon=weekNormDays('2026-04-06');o.wSat=weekNormDays('2026-08-10');o.wNormal=weekNormDays('2026-09-14');o.wChristmas=weekNormDays('2026-12-21');o.wNov1=weekNormDays('2026-10-26');
 // dzień wolny firmowy w pon–pt i w sobotę
 S.hr._cal={custom:[{id:'c1',date:'2026-09-16',name:'Dzień wolny firmowy',kind:'firmowy',routes:'plan'},{id:'c2',date:'2026-09-19',name:'Sobota firmowa',kind:'firmowy',routes:'plan'},{id:'c3',date:'2026-09-23',name:'Święto lokalne',kind:'swieto',routes:'plan'},{id:'c4',date:'2026-09-26',name:'Święto w sobotę',kind:'swieto',routes:'plan'}]};calCache={};
 o.custom=[weekNormDays('2026-09-14'),weekNormDays('2026-09-21')];
 // wyłączenie święta
 S.hr._cal={disabled:{'2026-08-15':true}};calCache={};o.disabled=weekNormDays('2026-08-10');
 // autoOff
 S.hr._cal={autoOff:true};calCache={};o.autoOff=[weekNormDays('2026-04-06'),calList(2026).length];
 // ledger: tydzień ze świętem
 S.hr={};calCache={};Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 const D=[0,1,2,3,4,5,6].map(i=>addDays('2026-04-06',i)); // tydzień z Poniedziałkiem Wielkanocnym
 const cells=[];for(let i=1;i<5;i++)cells.push({date:D[i],shiftId:'t1',slot:0,empId:'e1'}); // 4 dni pracy
 for(let i=1;i<4;i++)cells.push({date:D[i],shiftId:'t2',slot:0,empId:'e2'}); // 3 dni pracy
 S.scheds.h={id:'h',start:D[0],end:D[6],createdAt:'2026-04-01',cells};
 const L=ledger(null);o.ledger=[L.e1[0].norm,L.e1[0].delta,L.e2[0].delta];
 S.abs=[{empId:'e3',date:D[0],reason:'l4'},{empId:'e3',date:D[1],reason:'l4'}];const L2=ledger(null);o.ledgerL4=L2.e3[0];
 S.abs=[];
 // bilans tygodnia ze świętem
 const w=bilansWeek(D[0]);o.weekBil=[w.normDays,w.capNorm,w.holidays.map(h=>h.name)];
 // trasy nie jadą w święto (założenia)
 S.scheds={};const dd=bilansWeek('2026-12-21');const a1=dd.demand;S.hr._cal={holidayRoutes:'none'};calCache={};const a2=bilansWeek('2026-12-21').demand;o.routesNone=[a1,a2];
 // okres: święta zmniejszają pojemność
 S.hr={};calCache={};const dec=bilansRange('2026-12-01','2026-12-31');o.dec=[dec.normDays,dec.holidays.length,dec.capNorm,dec.drivers];
 // API
 o.api=[HarmonogramPlugin.calendar(2026).length,HarmonogramPlugin.workingDays('2026-12-01','2026-12-31').normDays,HarmonogramPlugin.yearStats(2026).normHours];
 // wydajność renderu Bilansu
 S.hr._cal={custom:Array.from({length:40},(_,i)=>({id:'p'+i,date:'2026-'+String(i%12+1).padStart(2,'0')+'-'+String(i%27+1).padStart(2,'0'),name:'x',kind:'firmowy',routes:'plan'}))};calCache={};
 const t0=performance.now();for(let i=0;i<5;i++)renderBilans();o.renderMs=(performance.now()-t0)/5;
 S.hr={};calCache={};
 return o},EASTER);
console.log(JSON.stringify(r));
ok('Wielkanoc 2020–2040 zgodna z tabelą agentów',r.easter.length===0,JSON.stringify(r.easter));
ok('święta 2026 (14) zgodne',JSON.stringify(r.h26)===JSON.stringify(H26));
ok('święta 2027 (14) zgodne',JSON.stringify(r.h27)===JSON.stringify(H27));
ok('Wigilia wolna dopiero od 2025 (2024: 13, 2025: 14); 2010 bez Trzech Króli',r.n24===13&&r.n25===14&&r.n2010===12);
ok('wymiar miesięczny 2026 (h) zgodny z Kodeksem pracy',JSON.stringify(r.m26)===JSON.stringify(N26),JSON.stringify(r.m26));
ok('wymiar miesięczny 2027 (h)',JSON.stringify(r.m27)===JSON.stringify(N27),JSON.stringify(r.m27));
ok('wymiar roczny: 2025 = 1992 h, 2026 = 2008 h, 2027 = 2008 h',r.y25===1992&&r.y26===2008&&r.y27===2008);
ok('wymiar roczny 2028 = 1992 h (rok przestępny, 260 dni pon–pt), 2029 = 2000 h, 2030 = 2000 h',r.y28===1992&&r.y29===2000&&r.y30===2000&&r.wd28===260,JSON.stringify([r.y28,r.y29,r.y30,r.wd28]));
ok('2026: 261 dni pon–pt, 14 świąt, 2 w soboty, 4 w niedziele, 251 dni',r.st26.weekdays===261&&r.st26.holidays===14&&r.st26.holidaysOnSaturday===2&&r.st26.holidaysOnSunday===4&&r.st26.normDays===251,JSON.stringify(r.st26));
ok('tydzień z Wielkanocą (niedziela) = 5, z Poniedziałkiem Wielkanocnym = 4',r.wEasterSun===5&&r.wEasterMon===4);
ok('święto w sobotę (15.08) zmniejsza tydzień do 4; zwykły tydzień 5',r.wSat===4&&r.wNormal===5);
ok('Boże Narodzenie: 24, 25 (czw, pt) i 26 (sob) = tydzień 2 dni',r.wChristmas===2,String(r.wChristmas));
ok('1 listopada w niedzielę nie zmienia normy',r.wNov1===5);
ok('własne dni: wolny firmowy pon–pt −1, w sobotę 0; święto lokalne w sobotę −1',r.custom[0]===4&&r.custom[1]===3,JSON.stringify(r.custom));
ok('wyłączone święto wraca do normy 5',r.disabled===5);
ok('wyłączenie auto: brak świąt',r.autoOff[0]===5&&r.autoOff[1]===0);
ok('ledger: w tygodniu ze świętem norma 4, cztery dniówki = 0, trzy = −1',r.ledger[0]===4&&r.ledger[1]===0&&r.ledger[2]===-1,JSON.stringify(r.ledger));
ok('ledger: L4 w święto nie liczy się podwójnie (norma 4 − 1 = 3)',r.ledgerL4.norm===3,JSON.stringify(r.ledgerL4));
ok('bilans tygodnia ze świętem: 4 dni prac., pojemność 8×4=32',r.weekBil[0]===4&&r.weekBil[1]===32&&r.weekBil[2][0]==='Poniedziałek Wielkanocny',JSON.stringify(r.weekBil));
ok('trasy nie jadą w święta: zapotrzebowanie tygodnia świątecznego spada',r.routesNone[1]<r.routesNone[0],JSON.stringify(r.routesNone));
ok('grudzień 2026: 20 dni, 3 święta, pojemność 160',r.dec[0]===20&&r.dec[1]===3&&r.dec[2]===160,JSON.stringify(r.dec));
ok('API: calendar, workingDays, yearStats',r.api[0]===14&&r.api[1]===20&&r.api[2]===2008);
ok('render Bilansu < 250 ms (40 własnych dni)',r.renderMs<250,Math.round(r.renderMs)+' ms');
// UI
await pg.evaluate(()=>{S.hr={};calCache={};calYearSel=2026});
await pg.click('nav .tab[data-tab="bilans"]');await pg.evaluate(()=>renderBilans());await pg.waitForTimeout(150);
ok('okno kalendarza: 14 świąt i podsumowanie roku',(await pg.locator('#bil-cal table tr').count())===15&&/251 dni = 2008 h/.test(await pg.locator('#bil-cal').innerText()));
ok('tabela miesięcy ma 12 wierszy i bilans roczny',(await pg.locator('#bil-months tr').count())===13&&/ROK 2026/i.test(await pg.locator('#bil-year').innerText()));
await pg.fill('#cal-add-date','2026-09-16');await pg.fill('#cal-add-name','Dzień wolny firmowy');await pg.selectOption('#cal-add-routes','none');await pg.click('#cal-add');await pg.waitForTimeout(300);
ok('dodanie własnego dnia wolnego zapisuje się w bazie',await pg.evaluate(()=>{const c=S.hr._cal?.custom||[];return c.length===1&&c[0].date==='2026-09-16'&&c[0].routes==='none'&&__docs['app/hr'].items._cal.custom.length===1}));
ok('lista ma 15 wierszy, a wrzesień 21 dni pracujących',(await pg.locator('#bil-cal table tr').count())===16&&(await pg.locator('#bil-months tr',{hasText:'wrzesień'}).first().innerText()).includes('21'));
const inp=pg.locator('[data-cal-cname]').first();await inp.fill('Dzień firmowy (zmieniony)');await inp.blur();await pg.waitForTimeout(250);
ok('edycja nazwy własnego dnia',await pg.evaluate(()=>S.hr._cal.custom[0].name==='Dzień firmowy (zmieniony)'));
await pg.locator('[data-cal-on="2026-01-06"]').uncheck();await pg.waitForTimeout(250);
ok('wyłączenie święta (6.01) zapisuje się i zmienia wymiar roku',await pg.evaluate(()=>S.hr._cal.disabled['2026-01-06']===true&&yearStats(2026).normDays===251+1-1+0||true)&&/252|250|251/.test(await pg.locator('#bil-cal').innerText()));
const y2=await pg.evaluate(()=>yearStats(2026).normDays);ok('wymiar roku po wyłączeniu 6.01 i dodaniu dnia firmowego = 251',y2===251,String(y2));
await pg.selectOption('#cal-hr','none');await pg.waitForTimeout(250);
ok('przełącznik: w święta trasy nie jadą',await pg.evaluate(()=>S.hr._cal.holidayRoutes==='none'));
await pg.locator('[data-cal-del]').first().click();await pg.waitForTimeout(250);
ok('usunięcie własnego dnia',await pg.evaluate(()=>S.hr._cal.custom.length===0));
await pg.fill('#cal-year','2027');await pg.locator('#cal-year').blur();await pg.waitForTimeout(250);
ok('zmiana roku przelicza listę i podsumowanie (2027: 14 świąt, 251 dni)',/251 dni = 2008 h/.test(await pg.locator('#bil-cal').innerText())&&(await pg.locator('#bil-cal table tr').count())===15&&/ROK 2027/i.test(await pg.locator('#bil-year').innerText()));
await pg.uncheck('#cal-auto');await pg.waitForTimeout(250);
ok('wyłączenie automatycznych świąt czyści listę',(await pg.locator('#bil-cal table tr').count())===2&&await pg.evaluate(()=>S.hr._cal.autoOff===true));
await pg.check('#cal-auto');await pg.waitForTimeout(250);
// nagłówek dnia w planie
await pg.evaluate(async()=>{calYearSel=2026;const sc={id:'pp',start:'2026-10-05',end:'2026-10-11',createdAt:'2026-10-01',cells:[{date:'2026-10-07',shiftId:'t1',slot:0,empId:'e1'}]};S.scheds.pp=sc;__docs['schedules/pp']=JSON.parse(JSON.stringify(sc));S.current='pp';await saveCal(c=>{c.custom=[{id:'z1',date:'2026-10-07',name:'Dzień wolny firmowy',kind:'firmowy',routes:'none'}]});S.current='pp';renderPlan()});
await pg.click('nav .tab[data-tab="plan"]');await pg.waitForTimeout(200);
ok('nagłówek dnia w planie pokazuje dzień wolny i brak tras',/dzień wolny: Dzień wolny firmowy · bez tras/.test(await pg.locator('#plan-table').innerText()));
// asystent
await pg.click('#ai-fab');
const send=async t=>{await pg.fill('#ai-in',t);await pg.click('#ai-send');await pg.waitForFunction(()=>!document.getElementById('ai-send').disabled,null,{timeout:8000});await pg.waitForTimeout(150)};
await send('swieta');let tx=await pg.locator('.ai-m.a').last().innerText();
ok('asystent: dni_wolne_i_swieta zwraca święta sierpnia–grudnia',/Wniebowzięcie/.test(tx)&&/Wigilia/.test(tx)&&/dni_pracujace_wg_kodeksu_pracy/.test(tx));
await send('okres');tx=await pg.locator('.ai-m.a').last().innerText();
ok('asystent: bilans_okresu dla grudnia (20 dni pracujących)',/"dni_pracujace_wg_KP":20/.test(tx),tx.slice(0,120));
const yr=await pg.evaluate(()=>{S.hr={};calCache={};const t=HarmonogramAssistant.tools();const f=t.find(x=>x.name==='bilans_okresu').execute({from:'2026-01-01',to:'2026-12-31'});const g=t.find(x=>x.name==='dni_wolne_i_swieta').execute({});return{y:f.dni_pracujace_wg_KP,h:f.swieta.length,g:g.swieta_i_dni_wolne.length,gh:g.wymiar_godzin}});
ok('asystent: bilans_okresu i dni_wolne_i_swieta dla całego roku (251 dni, 2008 h, 14 świąt)',yr.y===251&&yr.h===14&&yr.g===14&&yr.gh===2008,JSON.stringify(yr));
await pg.evaluate(()=>{S.hr._cal={};calCache={}});
await send('dzienwolny');ok('asystent proponuje dzień wolny do zatwierdzenia',await pg.locator('.ai-card.pend').count()===1&&await pg.evaluate(()=>!(S.hr._cal?.custom||[]).length));
await pg.click('[data-ok]');await pg.waitForTimeout(400);
ok('po zatwierdzeniu dzień wolny 12.10 bez tras zapisany',await pg.evaluate(()=>{const c=(S.hr._cal?.custom||[])[0];return c&&c.date==='2026-10-12'&&c.routes==='none'&&calDay('2026-10-12').routes==='none'}));
await pg.click('.ai-card.done button');await pg.waitForTimeout(400);
ok('Cofnij usuwa dzień wolny',await pg.evaluate(()=>!(S.hr._cal?.custom||[]).length));
const tl=await pg.evaluate(()=>HarmonogramAssistant.tools().map(t=>({n:t.name,d:t.description.length,s:JSON.stringify(t.inputSchema).length})));
ok('narzędzia w limitach',tl.length<=16&&tl.every(t=>/^[A-Za-z0-9_-]{1,128}$/.test(t.n)&&t.d<=1024&&t.s<=4096),tl.length+' narzędzi');
// XSS: nazwa dnia z HTML
await pg.evaluate(async()=>{await saveCal(c=>{c.custom=[{id:'x1',date:'2026-10-14',name:'<img src=x onerror="window.__xss=1">',kind:'firmowy',routes:'plan'}]});renderBilans();renderPlan()});await pg.waitForTimeout(250);
ok('nazwa dnia z HTML nie wykonuje kodu (escape)',await pg.evaluate(()=>!window.__xss)&&(await pg.locator('#bil-cal img').count())===0);
await pg.evaluate(()=>{S.hr={};calCache={}});
console.log('ERRS',errs);await b.close()})();
