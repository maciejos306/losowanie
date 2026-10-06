const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage();await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2500);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async()=>{S.emps.forEach((e,i)=>{if(e.flotoId==null)e.flotoId=100+i});window.__calls=[];FL.mcp={callTool:async(s,t,i)=>{__calls.push([t,i]);return{payload:{ok:true,saved:(i.entries||[]).length,removed:0}}}};FL.busy=false;
 await flotoSendSchedule();const ss=__calls.filter(c=>c[0]==='set_schedule'),pv=__calls.filter(c=>c[0]==='publish_week_view');const e=ss.flatMap(c=>c[1].entries);const route=e.find(x=>/^Trasa/.test(x.label)),far=e.find(x=>/^Trasa (8|9|10|11)/.test(x.label)),rest=e.find(x=>/^Odpoczynek po/.test(x.label));
 // automatyczna wysyłka po zmianie grafiku
 __calls.length=0;const s=S.scheds[S.current];const c=s.cells.find(c=>c.date>=warsawDay()&&c.empId);await saveSched(s);const before=__calls.length;await new Promise(r=>setTimeout(r,21500));
 return{ss:ss.length,pv:pv.length,pvHtml:pv[0]&&pv[0][1].html.length,pvNoScript:pv[0]&&!/<script/i.test(pv[0][1].html),route,far,rest,auto:__calls.filter(c=>c[0]==='set_schedule').length,autoPv:__calls.filter(c=>c[0]==='publish_week_view').length,before}});
ok('set_schedule + publish_week_view dla każdego tygodnia',r.ss>=1&&r.pv===r.ss,JSON.stringify([r.ss,r.pv]));
ok('okno tygodnia: samodzielny HTML bez skryptów',r.pvHtml>3000&&r.pvNoScript,String(r.pvHtml));
ok('wpis trasy ma departAt "YYYY-MM-DD HH:MM" i hours',r.route&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(r.route.departAt)&&r.route.hours>0,JSON.stringify(r.route));
ok('daleka trasa: departAt dzień wcześniej',!r.far||r.far.departAt.slice(0,10)<r.far.date,JSON.stringify(r.far));
ok('odpoczynek jako „Odpoczynek po Trasa N”',!!r.rest,JSON.stringify(r.rest));
ok('po zmianie grafiku automatyczna wysyłka po 20 s',r.before===0&&r.auto>=1&&r.autoPv>=1,JSON.stringify([r.before,r.auto,r.autoPv]));
await b.close()})();
