const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const errs=[];const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
// bez sample: przycisk ukryty
const p0=await b.newPage();p0.on('pageerror',e=>errs.push('P0 '+e.message));await p0.goto('file://'+process.cwd()+'/local.html');await p0.waitForTimeout(500);
ok('bez capability sample przycisk asystenta jest ukryty',await p0.locator('#ai-fab').isHidden());
const pg=await b.newPage({viewport:{width:1300,height:900}});pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/CERT/.test(m.text()))errs.push('C '+m.text())});
await pg.goto('file://'+process.cwd()+'/local_ai.html');await pg.waitForTimeout(600);
ok('z capability przycisk jest widoczny',await pg.locator('#ai-fab').isVisible());
await pg.click('#ai-fab');ok('panel się otwiera',await pg.locator('#ai-panel').isVisible());
// przygotuj stan
await pg.evaluate(()=>{S.abs=[];S.hr={};S.shifts.forEach(s=>{if(['t8','t9','t10','t11'].includes(s.id))s.rest=1});S.emps[0].rate=99.5;S.current=Object.keys(S.scheds).find(id=>S.scheds[id].start<='2026-10-08'&&S.scheds[id].end>='2026-10-08')||S.current});
const send=async t=>{await pg.fill('#ai-in',t);await pg.click('#ai-send');await pg.waitForFunction(()=>!document.getElementById('ai-send').disabled,null,{timeout:8000});await pg.waitForTimeout(120)};
// przykłady
await pg.click('#ai-ex button >> nth=0');ok('przykładowe polecenie wypełnia pole',/Knury/.test(await pg.inputValue('#ai-in')));
// 1 podliczanie
await send('podlicz dniówki Knury');
const ans=await pg.locator('.ai-m.a').last().innerText();
const orac=await pg.evaluate(()=>{let e=0;const W={};S.shifts.forEach(x=>W[x.id]=x);for(const s of Object.values(S.scheds))for(const c of s.cells)if(c.empId==='e6'&&c.date>='2026-10-01'&&c.date<='2026-10-31'){const sh=W[c.shiftId];const duty=(sh.part==='pm')&&!c.part;e+=duty?(c.duty==='done'?((c.dutyH>5)?1:sh.weight):0):sh.weight}return e});
const got=JSON.parse(ans.replace(/^P: /,'')).dniowki_zarobione;
ok('podliczenie dniówek zgadza się z niezależnym wyliczeniem',Math.abs(got-orac)<1e-9,`(${got} vs ${orac})`);
// 2 zmiana z zatwierdzeniem
await send('oznacz Czogałę jako L4');
ok('zmiana czeka na zatwierdzenie (dane bez zmian)',await pg.locator('.ai-card.pend').count()===1&&await pg.evaluate(()=>S.abs.filter(a=>a.empId==='e4').length===0));
ok('model dostaje informację, że NIE wykonano',/NIE WYKONANO/.test(await pg.locator('.ai-m.a').last().innerText()));
const before=await pg.evaluate(()=>JSON.stringify(Object.values(S.scheds).map(s=>s.cells)));
await pg.click('[data-ok]');await pg.waitForTimeout(400);
const st=await pg.evaluate(()=>({abs:S.abs.filter(a=>a.empId==='e4').map(a=>a.date+a.reason),cells:Object.values(S.scheds).flatMap(s=>s.cells).filter(c=>c.empId==='e4'&&c.date>='2026-10-13'&&c.date<='2026-10-15').length}));
ok('po zatwierdzeniu L4 zapisane na 3 dni',st.abs.length===3&&st.abs.every(x=>x.endsWith('l4')),JSON.stringify(st.abs));
ok('program naprawił kolizje (brak przydziałów w dniach L4)',st.cells===0);
ok('karta wykonania z przyciskiem Cofnij',await pg.locator('.ai-card.done button').count()>=1);
await pg.click('.ai-card.done button');await pg.waitForTimeout(400);
const after=await pg.evaluate(()=>({abs:S.abs.filter(a=>a.empId==='e4').length,cells:JSON.stringify(Object.values(S.scheds).map(s=>s.cells))}));
ok('cofnięcie usuwa L4',after.abs===0);ok('cofnięcie przywraca plan',after.cells===before);
// 3 odrzucenie
await send('oznacz Czogałę jako L4');await pg.click('[data-no]');await pg.waitForTimeout(150);
ok('odrzucenie nic nie zmienia',await pg.evaluate(()=>S.abs.length===0)&&await pg.locator('.ai-card.pend').count()===0);
// 4 tryb od razu
await pg.check('#ai-auto');await send('oznacz Czogałę jako L4');
ok('tryb „od razu” wykonuje bez zatwierdzania',await pg.evaluate(()=>S.abs.filter(a=>a.empId==='e4').length===3)&&await pg.locator('.ai-card.pend').count()===0);
await pg.evaluate(()=>{S.abs=[]});await pg.uncheck('#ai-auto');
// 5 limit wolnych miejsc blokuje wniosek
await pg.evaluate(async()=>{for(const id of ['e1','e2','e3','e5'])await HarmonogramPlugin.requestLeave(id,'2026-10-06','2026-10-06')});
await send('wniosek Bubona');
const wtxt=await pg.locator('.ai-m.a').last().innerText();
ok('wniosek ponad limit odrzucony (błąd narzędzia, brak karty)',/Error/.test(wtxt)&&/nie ma już wolnych miejsc/.test(wtxt)&&await pg.locator('.ai-card.pend').count()===0);
await send('wolne miejsca');ok('wolne_miejsca_urlop zwraca 0',/"wolnych_miejsc_na_urlop":0/.test(await pg.locator('.ai-m.a').last().innerText()));
await pg.evaluate(()=>{S.abs=[]});
// 6 przypisanie trasy
await send('trasa');await pg.click('[data-ok]');await pg.waitForTimeout(400);
const tr=await pg.evaluate(()=>{const c=Object.values(S.scheds).flatMap(s=>s.cells).find(c=>c.empId==='e7'&&c.date==='2026-10-08'&&c.shiftId==='t7');return c?{locked:!!c.locked}:null});
ok('przypisz_trase: trasa przydzielona i zablokowana',tr&&tr.locked);
await pg.click('.ai-card.done:last-of-type button');await pg.waitForTimeout(400);
ok('cofnięcie przydziału trasy',await pg.evaluate(()=>{const c=Object.values(S.scheds).flatMap(s=>s.cells).find(c=>c.empId==='e7'&&c.date==='2026-10-08'&&c.shiftId==='t7'&&c.locked);return !c}));
// 7 dyżur
await pg.evaluate(()=>{const s=Object.values(S.scheds).find(s=>s.start<='2026-10-05'&&s.end>='2026-10-05');const c=s.cells.find(c=>c.date==='2026-10-05'&&c.shiftId==='nagel');c.empId='e4';delete c.duty});
await send('dyżur');await pg.click('[data-ok]');await pg.waitForTimeout(300);
ok('rozlicz_dyzur: 6,5 h = zrealizowany (1 dniówka)',await pg.evaluate(()=>{const c=Object.values(S.scheds).flatMap(s=>s.cells).find(c=>c.date==='2026-10-05'&&c.shiftId==='nagel');return c.duty==='done'&&c.dutyH===6.5&&cellDn(c,S.shifts.find(x=>x.id==='nagel'))===1}));
// 8 błędna data
await send('zla data');ok('błędny format daty zgłasza błąd narzędzia',/Error: Pole from musi mieć format/.test(await pg.locator('.ai-m.a').last().innerText()));
// 9 instrukcja
const rl=await pg.evaluate(()=>({r:HarmonogramAssistant.rules(),n:new TextEncoder().encode(HarmonogramAssistant.rules()).length,turns:window.__turns.length,first:window.__turns[0].role,last:window.__turns[window.__turns.length-1].role}));
ok('instrukcja zawiera dzisiejszą datę i listę kierowców',/Dziś jest/.test(rl.r)&&/e6 = Grzegorz Knura/.test(rl.r));
ok('instrukcja nie ujawnia stawek',!/99\.5|99,5|rate|stawk/.test(rl.r.replace(/Nie masz dostępu do stawek[^.]*\./,'')));
ok('rozmiar instrukcji < 8 KB',rl.n<8192,rl.n+' B');
ok('rozmowa zaczyna i kończy się turą użytkownika',rl.first==='user'&&rl.last==='user');
// 10 schemat narzędzi
const tl=await pg.evaluate(()=>HarmonogramAssistant.tools().map(t=>({n:t.name,d:t.description.length,s:JSON.stringify(t.inputSchema).length,t:t.inputSchema.type})));
ok('narzędzia: nazwy, limity opisu i schematu',tl.length<=16&&tl.every(t=>/^[A-Za-z0-9_-]{1,128}$/.test(t.n)&&t.d<=1024&&t.s<=4096&&t.t==='object'),tl.length+' narzędzi');
// 11 opcje wywołania
const op=await pg.evaluate(()=>({cache:window.__opts.cache,tier:window.__opts.modelTier,sig:window.__opts.signal instanceof AbortSignal}));
ok('wywołanie: cache=false, szybki model, AbortSignal',op.cache===false&&op.tier==='quick'&&op.sig);
await pg.check('#ai-deep');await send('Cześć');ok('tryb dokładny używa modelu default',await pg.evaluate(()=>window.__opts.modelTier==='default'));await pg.uncheck('#ai-deep');
// 12 Stop
await pg.fill('#ai-in','wolno');await pg.click('#ai-send');await pg.waitForSelector('#ai-stop:not([hidden])');await pg.click('#ai-stop');await pg.waitForFunction(()=>!document.getElementById('ai-send').disabled,null,{timeout:4000});
ok('Stop przerywa odpowiedź',/przerwano/.test(await pg.locator('.ai-m.a').last().innerText()));
// 13 wyczyść
await pg.click('#ai-clear');ok('wyczyść kasuje rozmowę',await pg.locator('.ai-m.u').count()===0);
// zrzuty
await pg.click('#ai-close');await pg.click('#ai-fab');await send('oznacz Czogałę jako L4');
await pg.screenshot({path:'ai-desktop.png'});
const ph=await b.newPage({viewport:{width:390,height:800}});ph.on('pageerror',e=>errs.push('PH '+e.message));await ph.goto('file://'+process.cwd()+'/local_ai.html');await ph.waitForTimeout(500);await ph.click('#ai-fab');await ph.fill('#ai-in','podlicz Knury');await ph.click('#ai-send');await ph.waitForTimeout(600);await ph.screenshot({path:'ai-phone.png'});
ok('telefon: panel mieści się w ekranie',await ph.evaluate(()=>document.getElementById('ai-panel').getBoundingClientRect().width<=innerWidth));
console.log('ERRS',errs);await b.close()})();
