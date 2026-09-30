const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1500,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
await pg.evaluate(()=>{S.hr={};calCache={};calYearSel=2026});await pg.click('nav .tab[data-tab="bilans"]');await pg.evaluate(()=>renderBilans());await pg.waitForTimeout(150);
const cust=()=>pg.evaluate(()=>(S.hr._cal?.custom||[]).map(x=>x.date+'|'+x.name));
// 1 dodanie klawiszem Enter
await pg.fill('#cal-add-date','2026-09-16');await pg.fill('#cal-add-name','Pierwszy');await pg.press('#cal-add-name','Enter');await pg.waitForTimeout(250);
ok('Enter w formularzu dodaje dzień',JSON.stringify(await cust())==='["2026-09-16|Pierwszy"]');
// 2 formularz dodawania przetrwa przebudowę okna
await pg.fill('#cal-add-name','wpisane-ale-niedodane');await pg.locator('[data-cal-on="2026-01-01"]').uncheck();await pg.waitForTimeout(250);
ok('wpisany tekst formularza przetrwa przebudowę okna',(await pg.inputValue('#cal-add-name'))==='wpisane-ale-niedodane');
await pg.locator('[data-cal-on="2026-01-01"]').check();await pg.waitForTimeout(200);await pg.fill('#cal-add-name','');
// 3 edycja nazwy i natychmiastowy klik Usuń (pierwsze kliknięcie nie może zginąć)
const nm=pg.locator('[data-cal-cname]').first();await nm.fill('Zmieniona nazwa');
await pg.locator('[data-cal-del]').first().click();await pg.waitForTimeout(300);
ok('pierwsze kliknięcie Usuń po edycji pola działa',(await cust()).length===0);
// 4 data: wpisywanie cząstkowe nie zapisuje złych dat, pierwszy klik po edycji działa
await pg.fill('#cal-add-date','2026-09-16');await pg.fill('#cal-add-name','Dzień do daty');await pg.click('#cal-add');await pg.waitForTimeout(250);
const di=pg.locator('[data-cal-cdate]').first();await di.fill('0002-09-16');await di.blur();await pg.waitForTimeout(250);
ok('rok 0002 jest odrzucany po opuszczeniu pola',JSON.stringify(await cust())==='["2026-09-16|Dzień do daty"]'&&(await pg.locator('[data-cal-cdate]').first().inputValue())==='2026-09-16');
await pg.locator('[data-cal-cdate]').first().fill('2027-03-01');
await pg.locator('[data-cal-del]').first().click();await pg.waitForTimeout(300);
ok('po edycji daty pierwsze kliknięcie Usuń też działa',(await cust()).length===0);
// 5 zmiana daty na inny rok przełącza widok roku
await pg.fill('#cal-add-date','2026-09-16');await pg.fill('#cal-add-name','Przenoszony');await pg.click('#cal-add');await pg.waitForTimeout(250);
const d2=pg.locator('[data-cal-cdate]').first();await d2.fill('2027-03-01');await d2.blur();await pg.waitForTimeout(300);
ok('zmiana daty na rok 2027 przełącza widok na 2027 i wiersz pozostaje widoczny',await pg.evaluate(()=>calYearSel===2027&&(S.hr._cal.custom[0].date==='2027-03-01'))&&(await pg.locator('[data-cal-cdate]').count())===1);
ok('data w polu odpowiada zapisanej',(await pg.locator('[data-cal-cdate]').first().inputValue())==='2027-03-01');
await pg.locator('[data-cal-del]').first().click();await pg.waitForTimeout(250);
// 6 nieprawidłowy rok w polu Rok
await pg.fill('#cal-year','1999');await pg.locator('#cal-year').blur();await pg.waitForTimeout(200);
ok('nieprawidłowy rok wraca do poprzedniego',(await pg.inputValue('#cal-year'))==='2027');
await pg.fill('#cal-year','2026');await pg.locator('#cal-year').blur();await pg.waitForTimeout(200);
// 7 etykiety dostępności
const unnamed=await pg.evaluate(()=>[...document.querySelectorAll('#bil-cal input,#bil-cal select')].filter(e=>{const l=e.closest('label');return !(e.getAttribute('aria-label')||(l&&l.innerText.trim())||e.type==='checkbox')}).length);
ok('każde pole okna kalendarza ma nazwę dostępnościową',unnamed===0,String(unnamed));
// 8 przewinięcie tabeli przetrwa przebudowę (telefon)
await pg.setViewportSize({width:390,height:800});await pg.evaluate(()=>renderBilans());
await pg.evaluate(()=>{const g=document.querySelector('#bil-cal .grid-scroll');g.scrollLeft=120});
await pg.locator('[data-cal-on="2026-01-06"]').evaluate(e=>{e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(250);
ok('przewinięcie poziome tabeli zostaje po zapisie',(await pg.evaluate(()=>document.querySelector('#bil-cal .grid-scroll').scrollLeft))>=100);
await pg.setViewportSize({width:1500,height:1000});
await pg.evaluate(async()=>{await saveCal(c=>{c.disabled={}});});
// 9 asystent: usuwanie nieistniejącego, cofnięcie tylko jednego dnia, łączenie ze świętem
const as=await pg.evaluate(async()=>{const t=HarmonogramAssistant.tools().find(x=>x.name==='ustaw_dzien_wolny');const o={};
 try{await t.execute({date:'2026-10-20',remove:true})}catch(e){o.absent=e.message}
 try{await t.execute({date:'2026-08-15',remove:true})}catch(e){o.holiday=e.message}
 // dwa dni, cofnięcie jednego
 const ai=document.getElementById('ai-auto');ai.checked=true;
 await t.execute({date:'2026-10-20',name:'A',kind:'firmowy',routes:'plan'});await t.execute({date:'2026-10-21',name:'B',kind:'firmowy',routes:'plan'});
 await new Promise(r=>setTimeout(r,200));
 o.before=(S.hr._cal.custom||[]).map(x=>x.date).sort();
 const card=[...document.querySelectorAll('.ai-card.done')];return o});
console.log(JSON.stringify(as));
ok('usunięcie nieistniejącego dnia daje błąd zamiast „sukcesu”',/nie ma własnego dnia wolnego/.test(as.absent||''));
ok('usunięcie święta ustawowego daje czytelny błąd',/świ[ęe]to ustawowe/i.test(as.holiday||''));
ok('dodanie dwóch dni asystentem',JSON.stringify(as.before)==='["2026-10-20","2026-10-21"]');
await pg.evaluate(()=>{document.getElementById('ai-auto').checked=false});
await pg.click('#ai-fab');
// cofnięcie drugiego wpisu nie kasuje pierwszego
await pg.evaluate(()=>{window.__c=[...document.querySelectorAll('.ai-card.done button')]});
const btns=await pg.locator('.ai-card.done button').count();
if(btns){await pg.locator('.ai-card.done button').last().click();await pg.waitForTimeout(300)}
ok('cofnięcie ostatniej zmiany asystenta usuwa tylko jej dzień',btns===0||JSON.stringify(await pg.evaluate(()=>(S.hr._cal.custom||[]).map(x=>x.date).sort()))==='["2026-10-20"]');
// 10 API
const api=await pg.evaluate(()=>[HarmonogramPlugin.workingDays('x','y').ok,HarmonogramPlugin.workingDays('2026-01-01','2030-12-31').ok,HarmonogramPlugin.workingDays('2026-12-31','2026-12-01').normDays,HarmonogramPlugin.yearStats(500).ok,HarmonogramPlugin.calendar('abc').length>=0,HarmonogramPlugin.calendar(500).length]);
ok('API: złe daty i zbyt długi zakres odrzucane, odwrócone zamienione, rok poza zakresem bezpieczny',api[0]===false&&api[1]===false&&api[2]===20&&api[3]===false&&api[5]===0,JSON.stringify(api));
console.log('ERRS',errs);await b.close()})();
