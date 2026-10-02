const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const pg=await b.newPage({viewport:{width:1700,height:1100}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(3000);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));const F=L('floto_data.json');
const week=L('live3/schedules/week-2026-09-28.json'),shifts=L('live3/app/shifts.json').items,emps=L('live3/app/employees.json').items;
await pg.evaluate(([w,shifts,emps,F])=>{Object.keys(__docs).filter(k=>k.startsWith('schedules/')).forEach(k=>delete __docs[k]);Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.shifts=shifts;S.emps=emps;
 // lokalny urlop do wysłania do FlotoMax
 S.abs.push({empId:'e4',date:'2026-10-14',reason:'l4'},{empId:'e4',date:'2026-10-15',reason:'l4'});
 S.scheds[w.id]=w;__docs['schedules/'+w.id]=JSON.parse(JSON.stringify(w));S.current=w.id;
 window.__calls=[];FL.mcp={callTool:async(srv,tool,inp)=>{__calls.push([tool,inp]);const P={list_drivers:F.drivers,list_trips:F.trips.filter(t=>t.deliveryDate>=inp.from&&t.deliveryDate<=inp.to),list_assignments:F.assign.filter(a=>a.date>=inp.from&&a.date<=inp.to),list_absences:{absences:F.absences,availability:[]},report_absence:{ok:true},set_availability:{ok:true}};if(!(tool in P))throw{code:'tool_error'};return{payload:P[tool]}}};FL.busy=false;FL.kinds={};FL.avail={}},[week,shifts,emps,F]);
await pg.evaluate(()=>flotoSync(true));await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const s=S.scheds['week-2026-09-28'];const m={};S.shifts.forEach(x=>m[x.id]=x);const by=(d,e)=>s.cells.filter(c=>c.date===d&&c.empId===e).map(c=>(m[c.shiftId]?.name||c.shiftId)+(c.part?':'+c.part:'')+(c.locked?'*':'')).sort().join(',');
 return{txt:$("floto-txt").textContent,items:FL.items,tools:[...new Set(__calls.map(c=>c[0]))],
 czog03:by('2026-10-03','e4'),bubon03:by('2026-10-03','e8'),wranik04:by('2026-10-04','e2'),schmidt04:by('2026-10-04','e1'),pior04:by('2026-10-04','e7'),
 virt:S.emps.filter(e=>/Wirtualny/.test(e.name)).map(e=>e.active),
 niez:S.shifts.filter(x=>x.fromFloto).map(x=>x.name+'|'+x.start+'|'+x.hours),
 czog02:by('2026-10-02','e4'),
 abs:S.abs.filter(a=>a.src==='floto').length,knura19:absMap()['e6']?.['2026-10-19'],sent:__calls.filter(c=>c[0]==='report_absence').map(c=>JSON.stringify(c[1])),avail:__calls.filter(c=>c[0]==='set_availability').length,
 past:s.cells.filter(c=>c.date<'2026-10-02'&&c.flotoRoute!=null).length,
 restViol:(()=>{const out=[];for(const c of s.cells){if(c.empId==null||c.date<'2026-10-02')continue;const r=restOf(m[c.shiftId]);for(let i=1;i<=r;i++){const d=addDays(c.date,i);s.cells.filter(x=>x.empId===c.empId&&x.date===d).forEach(x=>out.push(c.empId+' '+c.date+' '+c.shiftId+'->'+x.shiftId))}}return out})(),
 wr:(()=>{const c=s.cells.find(c=>c.flotoPlan===287);return c&&cellBounds(c,m[c.shiftId],c.date)})()}});
console.log(r.txt);console.log(r.items.join('\n'));
ok('użyto wszystkich narzędzi FlotoMax',['list_drivers','list_assignments','list_trips','list_absences','report_absence','set_availability'].every(t=>r.tools.includes(t)),r.tools.join());
ok('sobota 03.10 Czogała: Trasa 2 rano + Zwroty po południu (zablokowane)',r.czog03==='Trasa 2:am*,Zwroty:pm*',r.czog03);
ok('sobota 03.10 Bubon: Trasa 1 + Zwroty',r.bubon03==='Trasa 1:am*,Zwroty:pm*',r.bubon03);
ok('niedziela 04.10: Wranik T10, Schmidt T12, Piórkowski T11 wg FlotoMax',r.wranik04.startsWith('Trasa 10')&&r.schmidt04.startsWith('Trasa 12')&&r.pior04.startsWith('Trasa 11'),[r.wranik04,r.schmidt04,r.pior04].join(' / '));
ok('Wranik T10: wyjazd 23:45 dzień wcześniej wg planu FlotoMax',r.wr&&r.wr.st===23.75,JSON.stringify(r.wr));
ok('Wirtualny kierowca wyłączony z losowania',r.virt.length===0||r.virt.every(a=>a===false),JSON.stringify(r.virt));
ok('„Trasa niezapowiedziana” dodana jako typ zmiany i wpisana Czogale 02.10',r.niez.length===1&&/Trasa niezapowiedziana/.test(r.czog02),r.niez+' | '+r.czog02);
ok('brak grafiku na 05.10 zgłoszony',r.items.some(x=>/Brak harmonogramu na 05\.10/.test(x))&&/Brak grafiku na: 05\.10/.test(r.txt));
ok('urlopy z FlotoMax wczytane (Knura 19.10)',r.abs===14&&r.knura19==='urlop',r.abs+' '+r.knura19);
ok('L4 Czogały wysłane do FlotoMax jednym zgłoszeniem',r.sent.length===1&&/"from":"2026-10-14","to":"2026-10-15","type":"l4"/.test(r.sent[0]),r.sent.join());
ok('dostępność wysłana na 21 dni',r.avail===21,String(r.avail));
ok('brak naruszeń odpoczynku od dziś',r.restViol.length===0,r.restViol.join('; '));
// drugi raz: nic nowego, nic nie wysyła ponownie
await pg.evaluate(()=>{__calls=[]});await pg.evaluate(()=>flotoSync(true));
const r2=await pg.evaluate(()=>({txt:$("floto-txt").textContent,rep:__calls.filter(c=>c[0]==='report_absence'||c[0]==='set_availability').length}));
ok('drugie pobranie: bez zmian i bez ponownego wysyłania',/Bez zmian/.test(r2.txt)&&r2.rep===0,r2.txt+' '+r2.rep);
// usunięcie urlopu we FlotoMax
await pg.evaluate(()=>{const F2=FL.mcp.callTool;FL.mcp={callTool:async(s,t,i)=>{const res=await F2(s,t,i);if(t==='list_absences')return{payload:{absences:res.payload.absences.filter(a=>a.id!==3)}};return res}}});await pg.evaluate(()=>flotoSync(true));
ok('urlop usunięty we FlotoMax znika z Harmonogramu',await pg.evaluate(()=>!absMap()['e8']?.['2026-10-11']));
console.log('ERRS',errs);await b.close()})();
