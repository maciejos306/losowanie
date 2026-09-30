const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1500,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async()=>{const o={};
 Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.hr={};calCache={};
 // 1. własny dzień na święcie ustawowym nie znosi skutku (sobota 15.08)
 S.hr._cal={custom:[{id:'a',date:'2026-08-15',name:'Firmowy w święto',kind:'firmowy',routes:'plan'}]};calCache={};
 o.satNorm=weekNormDays('2026-08-10');o.yNorm=yearStats(2026).normDays;const row=calList(2026).filter(e=>e.date==='2026-08-15');o.rows=row.map(e=>[e.auto,e.duplicate,e.normEffect]);o.customKpi=yearStats(2026).customDays;o.holKpi=yearStats(2026).holidays;
 // 2. dwa własne dni tego samego dnia
 S.hr._cal={custom:[{id:'a',date:'2026-09-19',name:'A',kind:'swieto',routes:'plan'},{id:'b',date:'2026-09-19',name:'B',kind:'firmowy',routes:'none'}]};calCache={};
 o.dup=[nDay('2026-09-19'),calDay('2026-09-19').routes,calDay('2026-09-19').name];
 S.hr._cal={custom:[{id:'b',date:'2026-09-19',name:'B',kind:'firmowy',routes:'plan'},{id:'a',date:'2026-09-19',name:'A',kind:'swieto',routes:'plan'}]};calCache={};o.dupRev=nDay('2026-09-19');
 // 3. okres bez dni pracujących
 S.hr={};calCache={};
 const we=bilansRange('2026-09-26','2026-09-27'),xm=bilansRange('2026-12-24','2026-12-26'),sun=bilansRange('2026-09-27','2026-09-27');
 o.zero=[we.status,we.hire,xm.status,xm.hire,sun.status,sun.hire,we.label];
 // 4. dni bez tras a harmonogram
 const D=[21,22,23,24,25,26,27].map(d=>'2026-12-'+d);const cells=[];D.forEach(d=>{cells.push({date:d,shiftId:'t1',slot:0,empId:'e1'},{date:d,shiftId:'t2',slot:0,empId:'e2'})});
 S.scheds.x={id:'x',start:D[0],end:D[6],createdAt:'2026-12-01',cells};
 const with1=bilansWeek('2026-12-21').demand;S.hr._cal={holidayRoutes:'none'};calCache={};const with2=bilansWeek('2026-12-21').demand;
 // zakończona trasa w święto liczy się mimo "nie jadą"
 S.scheds.x.cells.find(c=>c.date==='2026-12-25'&&c.shiftId==='t1').closed=true;const with3=bilansWeek('2026-12-21').demand;
 o.noRoutes=[with1,with2,with3];delete S.scheds.x;
 // 5. norma z ustawień skaluje miesiąc/rok jak tydzień
 S.hr={_bilans:{norm:4,ot:0.5,low:90}};calCache={};const wk=bilansWeek('2026-09-14'),rg=bilansRange('2026-09-14','2026-09-20');o.normScale=[wk.capNorm,rg.capNorm,wk.capMax,rg.capMax];
 // 6. całkowicie nieobecny kierowca
 S.hr={};calCache={};S.abs=[];for(let d=1;d<=31;d++){const ds='2026-12-'+String(d).padStart(2,'0');if(!['24','25','26'].includes(String(d)))S.abs.push({empId:'e1',date:ds,reason:'l4'})}
 const dec=bilansRange('2026-12-01','2026-12-31');o.absent=[dec.capNorm,dec.normDays,dec.drivers,dec.absDays];S.abs=[];
 const yr=bilansRange('2026-01-01','2026-12-31');for(let m=1;m<=12;m++){}S.abs=[];for(const d of range('2026-01-01','2026-12-31'))if(!isOffDay(d))S.abs.push({empId:'e1',date:d,reason:'l4'});const yr2=bilansRange('2026-01-01','2026-12-31');o.absentYear=[yr.capNorm-yr2.capNorm,yr.normDays];S.abs=[];
 // 7. zniekształcone dane
 S.hr._cal={custom:[null,5,'x',{date:'2026-09-16',name:'x',kind:'swieto'},{date:'2026-13-45',name:'zła'},{id:'ok',date:'2026-09-17',name:'ok',kind:'firmowy'}]};calCache={};
 let thrown=null;try{weekNormDays('2026-09-14');calList(2026);renderBilans();renderPlan()}catch(e){thrown=e.message}
 o.malformed=[thrown,calDay('2026-09-16')?.kind,calDay('2026-09-17')?.name,calList(2026).filter(e=>!e.auto).length];
 // 8. lata spoza zakresu
 S.hr={};calCache={};let yerr=null;try{plHolidays(500);calDay('0500-01-01');yearStats(500);bilansRange('0500-01-01','0500-01-31')}catch(e){yerr=e.message}
 o.years=[yerr,plHolidays(500).length,plHolidays(1582).length,plHolidays(1583).length>0];
 return o});
console.log(JSON.stringify(r));
ok('własny dzień na święcie w sobotę nie znosi obniżki normy (tydzień 4, rok 251)',r.satNorm===4&&r.yNorm===251,JSON.stringify([r.satNorm,r.yNorm]));
ok('wiersze na tej dacie: auto liczy, własny oznaczony jako duplikat; KPI święta 14 i 1 własny',JSON.stringify(r.rows)==='[[true,false,-1],[false,true,0]]'&&r.customKpi===1&&r.holKpi===14,JSON.stringify(r.rows));
ok('dwa własne dni tej samej daty: silniejszy rodzaj wygrywa niezależnie od kolejności, trasy nie jadą jeśli którykolwiek tak',r.dup[0]===-1&&r.dup[1]==='none'&&r.dupRev===-1,JSON.stringify([r.dup,r.dupRev]));
ok('okres bez dni pracujących: status „off”, bez rekomendacji zatrudnienia',r.zero.slice(0,6).join()==='off,0,off,0,off,0'&&/bez dni pracujących/i.test(r.zero[6]),JSON.stringify(r.zero));
ok('harmonogram: dni „trasy nie jadą” nie liczą niezakończonych tras',r.noRoutes[1]<r.noRoutes[0],JSON.stringify(r.noRoutes));
ok('zakończona trasa w dniu „trasy nie jadą” liczy się do zapotrzebowania',r.noRoutes[2]===r.noRoutes[1]+1);
ok('norma z ustawień (4) skaluje okres jak tydzień (32 i 36)',r.normScale[0]===r.normScale[1]&&r.normScale[2]===r.normScale[3]&&r.normScale[0]===32,JSON.stringify(r.normScale));
ok('kierowca nieobecny cały miesiąc: pojemność dokładnie 7 × 20 = 140',Math.abs(r.absent[0]-140)<1e-9,JSON.stringify(r.absent));
ok('kierowca nieobecny cały rok: pojemność spada dokładnie o normę roku (251)',Math.abs(r.absentYear[0]-251)<1e-6,JSON.stringify(r.absentYear));
ok('zniekształcone dane kalendarza nie psują programu',r.malformed[0]===null&&r.malformed[1]==='swieto'&&r.malformed[2]==='ok'&&r.malformed[3]===2,JSON.stringify(r.malformed));
ok('lata spoza 1583–9999 nie rzucają wyjątków',r.years[0]===null&&r.years[1]===0&&r.years[2]===0&&r.years[3]===true,JSON.stringify(r.years));
// UI: walidacja
await pg.evaluate(()=>{S.hr={};calCache={};calYearSel=2026});await pg.click('nav .tab[data-tab="bilans"]');await pg.evaluate(()=>renderBilans());
for(const [id,val] of [['bil-norm','0'],['bil-norm','-2'],['bil-ot','-1'],['bil-low','5'],['bil-low','500']]){await pg.fill('#'+id,val);await pg.locator('#'+id).blur();await pg.waitForTimeout(120)}
ok('ustawienia Bilansu poza zakresem są odrzucane',await pg.evaluate(()=>!S.hr._bilans||(!('norm' in S.hr._bilans)&&!('ot' in S.hr._bilans)&&!('low' in S.hr._bilans)))&&(await pg.inputValue('#bil-norm'))==='5');
await pg.fill('#bil-norm','4');await pg.locator('#bil-norm').blur();await pg.waitForTimeout(200);
ok('poprawne ustawienie przechodzi',await pg.evaluate(()=>S.hr._bilans?.norm===4));
await pg.evaluate(()=>{S.hr={};calCache={}});
await pg.fill('#cal-add-date','2026-09-16');await pg.click('#cal-add');await pg.waitForTimeout(300);
const dinp=pg.locator('[data-cal-cdate]').first();await dinp.focus();await dinp.fill('0002-09-16');await dinp.blur();await pg.waitForTimeout(250);
ok('data własnego dnia z rokiem 0002 jest odrzucana (zostaje 2026-09-16)',await pg.evaluate(()=>S.hr._cal.custom[0].date==='2026-09-16'));
// usuwanie wpisu bez id (dane zewnętrzne)
await pg.evaluate(async()=>{S.hr._cal={custom:[{date:'2026-09-16',name:'bez id',kind:'firmowy'}]};calCache={};renderBilans()});await pg.waitForTimeout(150);
await pg.locator('[data-cal-del]').first().click();await pg.waitForTimeout(250);
ok('wpis bez id można usunąć',await pg.evaluate(()=>(S.hr._cal.custom||[]).length===0));
// asystent: lata i narzędzia
const tt=await pg.evaluate(()=>{const t=HarmonogramAssistant.tools();const f=(n,i)=>{try{return t.find(x=>x.name===n).execute(i)}catch(e){return'ERR '+e.message}};return[f('bilans_okresu',{from:'0202-09-01'}),f('dni_wolne_i_swieta',{from:'1800-01-01',to:'1800-12-31'})]});
ok('asystent: daty spoza 1900–2200 dają czytelny błąd',/ERR Podaj daty z lat 1900–2200/.test(tt[0])&&/ERR Podaj daty z lat 1900–2200/.test(tt[1]),JSON.stringify(tt).slice(0,160));
console.log('ERRS',errs);await b.close()})();
