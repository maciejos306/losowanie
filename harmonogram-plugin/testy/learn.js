const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(()=>{FL.mcp=null;const o={};const m={};S.shifts.forEach(x=>m[x.id]=x);
 Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 const w={id:"w",name:"w",start:"2026-09-07",end:"2026-10-25",cells:[]};S.scheds.w=w;S.current="w";
 o.none=learned(m.t8,"2026-10-06");o.prev0=startsPrevDay(m.t8);
 // 1 przejazd: wtorek 29.09, wyjazd pon. 19:00 (17:00Z, CEST), powrót wt. 13:00 = 18 h
 w.cells.push({date:"2026-09-29",shiftId:"t8",slot:0,empId:"e1",flotoRoute:901,tripAt:["2026-09-28T17:00:00Z","2026-09-29T11:00:00Z"],out:"19:00",back:"13:00",closed:true,locked:true});
 o.one=learned(m.t8,"2026-10-06");
 // 3 kolejne wtorki: 22.09 (18:30, 19,5 h), 15.09 (19:30, 17 h), 08.09 (10:00 tego dnia, 30 h) – ten ostatni ma wypaść ze średniej z 3
 w.cells.push({date:"2026-09-22",shiftId:"t8",slot:0,empId:"e2",flotoRoute:902,tripAt:["2026-09-21T16:30:00Z","2026-09-22T12:00:00Z"],out:"18:30",back:"14:00",closed:true});
 w.cells.push({date:"2026-09-15",shiftId:"t8",slot:0,empId:"e3",flotoRoute:903,tripAt:["2026-09-14T17:30:00Z","2026-09-15T10:30:00Z"],out:"19:30",back:"12:30",closed:true});
 w.cells.push({date:"2026-09-08",shiftId:"t8",slot:0,empId:"e4",flotoRoute:904,tripAt:["2026-09-08T08:00:00Z","2026-09-09T14:00:00Z"],out:"10:00",back:"16:00",closed:true});
 o.three=learned(m.t8,"2026-10-06");o.thu=learned(m.t8,"2026-10-08");o.prev3=startsPrevDay(m.t8,"2026-10-06");
 // plan FlotoMax z błędną godziną (czw. 07:00, 8 h) – nauka ma pierwszeństwo; ręczna poprawka – nie
 const c={date:"2026-10-06",shiftId:"t8",slot:0,empId:"e5",startH:7,durH:8,prevDep:false,flotoPlan:950};w.cells.push(c);
 o.bounds=cellBounds(c,m.t8,c.date);o.cprev=cellPrev(c,m.t8);
 const cm={...c,manualT:true};o.boundsM=cellBounds(cm,m.t8,cm.date);o.cprevM=cellPrev(cm,m.t8);
 // 9 h odpoczynku: Trasa 2 z nauczonym długim dniem (06:00–16:00) przed Trasą 8 o 19:00 → kolizja; bez nauki (01:30 + 8 h) → brak
 o.clash0=clashNext(m.t2,"2026-10-05",m.t8,"2026-10-06");
 w.cells.push({date:"2026-09-28",shiftId:"t2",slot:0,empId:"e6",flotoRoute:905,tripAt:["2026-09-28T04:00:00Z","2026-09-28T14:00:00Z"],out:"06:00",back:"16:00",closed:true});
 o.t2=learned(m.t2,"2026-10-05");o.clash1=clashNext(m.t2,"2026-10-05",m.t8,"2026-10-06");
 // dziennik triplog jako źródło (bez komórki)
 if(!FL.logged)FL.logged=new Map();FL.logged.set("999",JSON.stringify({routeId:999,date:"2026-10-01",label:"Trasa 5",kind:"dostawa",departed:"2026-10-01T04:00:00Z",returned:"2026-10-01T12:00:00Z"}));
 o.t5=learned(m.t5,"2026-10-08");
 // trasa o dwóch porach (nd 12:30 tego dnia, cz 19:45 dzień wcześniej): bez własnych przejazdów danego dnia bierze porę ostatniego przejazdu, nie średnią „pośrodku”
 w.cells.push({date:"2026-10-04",shiftId:"t11",slot:0,empId:"e1",flotoRoute:911,tripAt:["2026-10-04T10:30:00Z","2026-10-05T11:30:00Z"],out:"12:30",back:"13:30",closed:true});
 w.cells.push({date:"2026-10-01",shiftId:"t11",slot:0,empId:"e2",flotoRoute:912,tripAt:["2026-09-30T17:45:00Z","2026-10-01T12:45:00Z"],out:"19:45",back:"14:45",closed:true});
 o.t11=learned(m.t11,"2026-10-06");o.t11thu=learned(m.t11,"2026-10-08");
 // wyjazdy wokół północy: średnia z 23:45 (dzień wcześniej) i 00:15 nie może dać „dzień wcześniej 00:00”
 w.cells.push({date:"2026-10-02",shiftId:"t7",slot:0,empId:"e3",flotoRoute:921,tripAt:["2026-10-01T21:45:00Z","2026-10-02T05:00:00Z"],out:"23:45",back:"07:00",closed:true});
 w.cells.push({date:"2026-10-01",shiftId:"t7",slot:0,empId:"e4",flotoRoute:922,tripAt:["2026-09-30T22:15:00Z","2026-10-01T05:00:00Z"],out:"00:15",back:"07:00",closed:true});
 o.t7=learned(m.t7);
 // dyżur (Nagel) się nie uczy
 w.cells.push({date:"2026-09-30",shiftId:"nagel",slot:0,empId:"e7",tripAt:["2026-09-30T12:00:00Z","2026-09-30T19:00:00Z"],out:"14:00",back:"21:00",duty:"done",dutyH:7});
 o.nagel=learned(m.nagel,"2026-10-07");
 renderShifts&&renderShifts();o.html=document.getElementById("shifts-body")?.innerHTML||document.body.innerHTML;
 return o});
ok('brak przejazdów → brak nauki, heurystyka: wyjazd dzień wcześniej',r.none===null&&r.prev0===true,JSON.stringify([r.none,r.prev0]));
ok('1 przejazd = średnia (19:00 dzień wcześniej, 18 h, n=1)',r.one&&r.one.n===1&&r.one.st===19&&r.one.hh===18&&r.one.prev===true,JSON.stringify(r.one));
ok('4 przejazdy → średnia z 3 ostatnich (19:00, 18,25 h), czwarty pominięty',r.three&&r.three.n===3&&r.three.st===19&&r.three.hh===18.25&&r.three.prev===true,JSON.stringify(r.three));
ok('czwartek bez własnych przejazdów → średnia ze wszystkich dni',r.thu&&r.thu.n===3&&r.thu.hh===18.25,JSON.stringify(r.thu));
ok('startsPrevDay z nauki',r.prev3===true);
ok('oś godzin: nauka wygrywa z błędnym planem FlotoMax (07:00/8 h → 19:00/18,25 h, dzień wcześniej)',r.bounds.st===19&&r.bounds.hh===18.25&&r.cprev===true,JSON.stringify([r.bounds,r.cprev]));
ok('ręczna poprawka na osi ważniejsza od nauki',r.boundsM.st===7&&r.boundsM.hh===8&&r.cprevM===false,JSON.stringify([r.boundsM,r.cprevM]));
ok('9 h odpoczynku bez nauki: brak kolizji',r.clash0===false);
ok('Trasa 2 nauczona 06:00–16:00',r.t2&&r.t2.st===6&&r.t2.hh===10&&r.t2.prev===false,JSON.stringify(r.t2));
ok('9 h odpoczynku z nauki: kolizja Trasa 2 → Trasa 8',r.clash1===true);
ok('dziennik triplog uczy bez komórki (Trasa 5: 06:00, 8 h)',r.t5&&r.t5.n===1&&r.t5.st===6&&r.t5.hh===8,JSON.stringify(r.t5));
ok('trasa o dwóch porach: ogólnie pora ostatniego przejazdu (12:30 tego dnia), czas = średnia obu (22 h)',r.t11&&r.t11.st===12.5&&r.t11.prev===false&&r.t11.hh===22&&r.t11.n===2,JSON.stringify(r.t11));
ok('…a w czwartek własna pora (19:45 dzień wcześniej)',r.t11thu&&r.t11thu.st===19.75&&r.t11thu.prev===true,JSON.stringify(r.t11thu));
ok('wyjazdy wokół północy uśredniają się na 00:00 tego dnia, nie „dzień wcześniej”',r.t7&&r.t7.st===0&&r.t7.prev===false,JSON.stringify(r.t7));
ok('dyżur się nie uczy',r.nagel===null);
ok('Typy zmian pokazują naukę',/FlotoMax: dzień wcześniej 19:00 · 18,25 h \(śr\. z 3\)/.test(r.html));
console.log('ERRS',errs);await b.close()})();
