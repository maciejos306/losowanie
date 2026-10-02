const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage({viewport:{width:1400,height:1100}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2600);const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));
await pg.evaluate(([emps,abs])=>{FL.mcp=null;S.emps=emps;S.abs=abs;kalMonth='2026-11';document.querySelector('nav .tab[data-tab="kalendarz"]').click();renderKalendarz()},[L('live11/app/employees.json').items,L('live11/app/absences.json').items]);
const t=await pg.innerText('#kal-grid');const ok=(k,v)=>console.log((v?'OK   ':'FAIL ')+k);
ok('1.11 Wszystkich Świętych',/Wszystkich Świętych/.test(t));ok('11.11 Święto Niepodległości',/Niepodległości/.test(t));ok('urlop Misiewicza 2.11',/Krzysztof Misiewicz · Urlop/.test(t));
await pg.screenshot({path:'kal.png'});console.log('ERRS',errs);await b.close()})();
