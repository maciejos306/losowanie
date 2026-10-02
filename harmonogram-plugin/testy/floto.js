const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(3200);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
ok('bez łącznika: czytelny komunikat',/niedostępny/.test(await pg.innerText('#floto-txt')));
const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));const F=L('floto_data.json');
const live=L('live2/schedules/week-2026-09-28.json'),auto=L('live2/schedules/sxl89yje.json'),shifts=L('live/app/shifts.json').items,emps=L('live/app/employees.json').items;
await pg.evaluate(([live,auto,shifts,emps,F])=>{Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.shifts=shifts;S.emps=emps;
 for(const d of [live,auto]){S.scheds[d.id]=d;__docs['schedules/'+d.id]=JSON.parse(JSON.stringify(d))}S.current=live.id;
 window.__calls=[];FL.mcp={callTool:async(srv,tool,inp)=>{__calls.push([srv,tool,inp]);if(tool==='list_drivers')return{payload:F.drivers};if(tool==='list_trips')return{payload:F.trips.filter(t=>t.deliveryDate>=inp.from&&t.deliveryDate<=inp.to)}}};FL.busy=false},[live,auto,shifts,emps,F]);
await pg.evaluate(()=>flotoSync(true));await pg.waitForTimeout(300);
const r=await pg.evaluate(()=>({txt:$("floto-txt").textContent,items:FL.items,calls:__calls,emps:S.emps.map(e=>e.name+':'+e.flotoId+':'+e.catC),
 mis:S.scheds['week-2026-09-28'].cells.find(c=>c.date==='2026-10-01'&&c.shiftId==='nagel'&&c.empId==='e3'),
 knura:S.scheds['week-2026-09-28'].cells.find(c=>c.flotoRoute===264),
 dn:(()=>{const m={};S.shifts.forEach(x=>m[x.id]=x);const c=S.scheds['week-2026-09-28'].cells.find(c=>c.flotoRoute===279);return cellDn(c,m[c.shiftId])})(),
 reg:weekRegister('2026-09-28').map(x=>x.name+' '+x.dn+' dn '+x.hAct+' h'),saved:JSON.stringify(__docs['schedules/week-2026-09-28']).includes('"flotoRoute":279')}));
console.log(r.txt);console.log(r.items.join('\n'));console.log(r.reg.join('\n'));
ok('wywołano list_drivers i list_trips na FlotoMax',r.calls.map(c=>c[0]+'/'+c[1]).join()==='FlotoMax/list_drivers,FlotoMax/list_trips');
ok('Dariusz Faraś dodany z kat. B, symulacja pominięta',r.emps.some(x=>x==='Dariusz Faraś:118:false')&&!r.emps.some(x=>/symulacja/.test(x)));
ok('istniejący kierowcy powiązani po id',r.emps.includes('Krzysztof Misiewicz:105:true')&&r.emps.length===10);
ok('Misiewicz Nagel 01.10: 16:39–20:30, zrealizowany, 0,5 dn.',r.mis&&r.mis.out==='16:39'&&r.mis.back==='20:30'&&r.mis.duty==='done'&&r.dn===0.5,JSON.stringify(r.mis));
ok('Knura T10: wyjazd 20:12, ponad doba liczona dokładnie',r.knura&&r.knura.out==='20:12'&&r.knura.closed&&await pg.evaluate(()=>cellTripH(S.scheds['week-2026-09-28'].cells.find(c=>c.flotoRoute===264)))>33);
ok('Wranik 2 min i trasa niezapowiedziana -> do sprawdzenia',r.items.some(x=>/Wranik.*2 min/.test(x))&&r.items.some(x=>/niezapowiedziana.*nie ma takiego typu/.test(x)));
ok('zapisano do bazy',r.saved);
// ponowne pobranie nic nie zmienia
await pg.evaluate(()=>{__calls=[]});await pg.evaluate(()=>flotoSync(true));
ok('drugie pobranie: bez zmian',/Bez zmian/.test(await pg.innerText('#floto-txt')),await pg.innerText('#floto-txt'));
// błąd łącznika
await pg.evaluate(()=>{FL.mcp={callTool:async()=>{throw {code:'server_not_connected'}}}});await pg.evaluate(()=>flotoSync(true));
ok('brak łącznika na koncie: podpowiedź',/Łączniki/.test(await pg.innerText('#floto-txt')));
console.log('ERRS',errs);await b.close()})();
