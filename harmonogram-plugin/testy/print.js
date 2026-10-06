const fs=require('fs');const {chromium}=require('playwright');const L=p=>{const j=JSON.parse(fs.readFileSync('live/'+p));return j.data||j};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1500,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2600);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const r=await pg.evaluate(async([roll,sh,em,ab,pl])=>{FL.mcp=null;Object.keys(S.scheds).forEach(k=>delete S.scheds[k]);S.shifts=sh;S.emps=em;S.abs=ab;S.plan=pl;S.scheds.rolling=JSON.parse(JSON.stringify(roll));S.current='rolling';renderPlan();
 const o={};const sel=$("print-week");o.opts=[...sel.options].map(x=>x.textContent);o.sel=sel.value;
 const html=printWeekHtml(sel.value);o.len=html.length;o.rows=(html.match(/<tr style/g)||[]).length;o.labels=(html.match(/class="pl"/g)||[]).length;o.abs=(html.match(/class="pa/g)||[]).length;o.css=PRINT_CSS().length;
 o.dziad=/Tomasz Dziadura/.test(html);o.prev=/wyjazd (Pon|Wt|Śr|Czw|Pt|Sob|Nd) \d\d:\d\d/.test(html);o.doc=printWeekDoc(sel.value).slice(0,60);
 // zapis pliku przez downloads
 window.__saved=null;const u0=claude.use;claude.use=async n=>n==="downloads"?{save:async r=>{__saved=r;return{status:"saved"}}}:u0(n);await printWeek("save");o.saved=__saved&&{name:__saved.filename,len:__saved.data.length,ok:/<!doctype html>/.test(__saved.data)&&/Grafik kierowców/.test(__saved.data)};o.note=$("notice").textContent;claude.use=u0;
 // widok wydruku do zrzutu/pdf
 let pv=$("printview");if(!pv){pv=document.createElement("div");pv.id="printview";document.body.appendChild(pv)}pv.innerHTML=html;return o},[L('schedules/rolling.json'),L('app/shifts.json').items,L('app/employees.json').items,L('app/absences.json').items,L('app/plan.json')]);
ok('lista tygodni z bieżącym',r.opts.length>=3&&r.opts.some(x=>/bieżący/.test(x))&&r.sel.length===10,JSON.stringify([r.opts,r.sel]));
ok('wiersz na każdego aktywnego kierowcę (10)',r.rows===10,String(r.rows));
ok('etykiety tras i nieobecności obecne',r.labels>20&&r.abs>=3,JSON.stringify([r.labels,r.abs]));
ok('daleka trasa: „wyjazd <dzień> HH:MM”',r.prev);
ok('CSS wydruku znaleziony',r.css>500,String(r.css));
ok('zapis pliku: pełny dokument HTML',r.saved&&r.saved.ok&&/grafik-\d{4}-\d{2}-\d{2}\.html/.test(r.saved.name),JSON.stringify(r.saved)+' '+r.note);
await pg.emulateMedia({media:'print'});await pg.pdf({path:'print.pdf',format:'A4',landscape:true,printBackground:true,margin:{top:'7mm',bottom:'7mm',left:'7mm',right:'7mm'}});
const pdf=fs.readFileSync('print.pdf','latin1');const pages=(pdf.match(/\/Type\s*\/Page[^s]/g)||[]).length;ok('PDF mieści się na 1 stronie A4',pages===1,'stron: '+pages);
await pg.emulateMedia({media:'screen'});await pg.evaluate(()=>{document.body.querySelectorAll('body>*:not(#printview)').forEach(x=>x.style.display='none');const pv=$("printview");pv.style.display='block';pv.style.background='#fff';pv.style.padding='7mm';document.body.style.background='#fff'});
await pg.setViewportSize({width:1123,height:794});await pg.screenshot({path:'print.png',fullPage:true});
console.log('ERRS',errs);await b.close()})();
