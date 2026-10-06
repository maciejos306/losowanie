const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1500,height:900}});
await pg.addInitScript(()=>{const T=Date.parse('2026-10-06T08:00:00Z');const RD=Date;class D extends RD{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}}window.Date=D});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const SW=[{"id":2,"date":"2026-10-07","status":"accepted","decidedAt":"2026-10-03T16:23:05.592Z","gave":"Dyżur","took":"wolne","driverA":{"id":106,"name":"Andrzej Czogała","dayAfter":"wolne"},"driverB":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"Dyżur od 14:30"}},{"id":3,"date":"2026-10-07","status":"accepted","decidedAt":"2026-10-03T16:26:05.909Z","gave":"Dyżur","took":"wolne","driverA":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"wolne"},"driverB":{"id":106,"name":"Andrzej Czogała","dayAfter":"Dyżur od 14:30"}},{"id":9,"date":"2026-10-07","status":"accepted","decidedAt":"2026-10-03T17:17:37.189Z","gave":"wolne","took":"Dyżur","driverA":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"Dyżur od 14:30"},"driverB":{"id":106,"name":"Andrzej Czogała","dayAfter":"wolne"}},{"id":1,"date":"2026-10-08","status":"accepted","decidedAt":"2026-10-03T16:19:25.817Z","gave":"Dyżur","took":"wolne","driverA":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"wolne"},"driverB":{"id":106,"name":"Andrzej Czogała","dayAfter":"Dyżur od 14:30"}},{"id":4,"date":"2026-10-08","status":"accepted","decidedAt":"2026-10-03T16:34:28.601Z","gave":"Dyżur","took":"wolne","driverA":{"id":106,"name":"Andrzej Czogała","dayAfter":"wolne"},"driverB":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"Dyżur od 14:30"}},{"id":8,"date":"2026-10-08","status":"accepted","decidedAt":"2026-10-03T16:56:43.952Z","gave":"Dyżur","took":"wolne","driverA":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"wolne"},"driverB":{"id":106,"name":"Andrzej Czogała","dayAfter":"Dyżur od 14:30"}},{"id":11,"date":"2026-10-09","status":"pending","gave":"Trasa 1","took":"wolne","driverA":{"id":105,"name":"Krzysztof Misiewicz","dayAfter":"wolne"},"driverB":{"id":106,"name":"Andrzej Czogała","dayAfter":"Trasa 1"}}];
const r=await pg.evaluate(async(SW)=>{S.emps.find(e=>e.id==='e3').flotoId=105;S.emps.find(e=>e.id==='e4').flotoId=106;S.emps.forEach((e,i)=>{if(e.flotoId==null)e.flotoId=900+i});S.abs=[];
 const s=S.scheds[S.current];const m={};S.shifts.forEach(x=>m[x.id]=x);
 // stan przed: 07.10 Czogała dyżur, Misiewicz wolne; 08.10 Misiewicz dyżur, Czogała wolne; 09.10 Misiewicz Trasa 1
 s.cells=s.cells.filter(c=>!(c.shiftId==='nagel'&&(c.date==='2026-10-07'||c.date==='2026-10-08')));
 s.cells.filter(c=>(c.date==='2026-10-07'||c.date==='2026-10-08')&&(c.empId==='e3'||c.empId==='e4')).forEach(c=>{c.empId=null;delete c.locked});
 s.cells.push({date:'2026-10-07',shiftId:'nagel',slot:0,empId:'e4'},{date:'2026-10-08',shiftId:'nagel',slot:0,empId:'e3'});
 const t1=s.cells.find(c=>c.date==='2026-10-09'&&c.shiftId==='t1');t1.empId='e3';t1.locked=true;
 window.__calls=[];FL.mcp={callTool:async(srv,tool,inp)=>{__calls.push(tool);const P={list_drivers:[],list_trips:[],list_assignments:[],list_absences:{absences:[],availability:[]},list_swaps:SW,set_availability:{ok:true}};if(!(tool in P))throw{code:'tool_error'};return{payload:P[tool]}}};FL.busy=false;FL.kinds={};FL.avail={};
 await flotoSync(true);await new Promise(r=>setTimeout(r,300));
 const by=(d,e)=>S.scheds[S.current].cells.filter(c=>c.date===d&&c.empId===e).map(c=>m[c.shiftId].name+(c.locked?'*':'')+(c.startH!=null?'@'+c.startH:'')).sort().join(',');
 const o={d07m:by('2026-10-07','e3'),d07c:by('2026-10-07','e4'),d08m:by('2026-10-08','e3'),d08c:by('2026-10-08','e4'),d09m:by('2026-10-09','e3'),empty:S.scheds[S.current].cells.filter(c=>c.date>='2026-10-07'&&c.date<='2026-10-08'&&c.shiftId==='nagel'&&!c.empId).length,nagel07:S.scheds[S.current].cells.filter(c=>c.date==='2026-10-07'&&c.shiftId==='nagel').length,items:FL.items.filter(x=>/Zamian|zamian/.test(x)),txt:$("floto-txt").textContent,called:__calls.includes('list_swaps')};
 // drugi raz: nic nowego
 FL.items=[];await flotoSync(true);o.items2=FL.items.filter(x=>/Zamian/.test(x));o.txt2=$("floto-txt").textContent;o.d08c2=by('2026-10-08','e4');
 return o},SW);
ok('list_swaps wywołane',r.called);
ok('07.10: po trzech zamianach dyżur ma Misiewicz, Czogała nie',/Nagel\*/.test(r.d07m)&&!/Nagel/.test(r.d07c),JSON.stringify([r.d07m,r.d07c]));
ok('08.10: dyżur ma Czogała, Misiewicz nie',/Nagel\*/.test(r.d08c)&&!/Nagel/.test(r.d08m),JSON.stringify([r.d08m,r.d08c]));
ok('zwolnione miejsce dyżuru przejęte, bez pustych i podwójnych',r.empty===0&&r.nagel07===1,JSON.stringify([r.empty,r.nagel07]));
ok('oczekująca zamiana (pending) 09.10 nie zastosowana',r.d09m==='Trasa 1*',r.d09m);
ok('komunikaty o zamianach',r.items.length>=2&&r.items.length<=4&&/Zamiana z FlotoMax: 08\.10 Andrzej Czogała: Dyżur od 14:30/.test(r.items.join('|')),r.items.join(' | '));
ok('licznik w pasku FlotoMax',/zamian/.test(r.txt),r.txt);
ok('drugie pobranie: zamiany już zgodne, bez komunikatów i zmian',r.items2.length===0&&/Nagel\*/.test(r.d08c2)&&/Bez zmian/.test(r.txt2),r.items2.join('|')+' '+r.txt2);
console.log('ERRS',errs);await b.close()})();
