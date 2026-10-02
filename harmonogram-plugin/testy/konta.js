const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const p=await b.newPage({viewport:{width:1400,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
await p.goto('file://'+process.cwd()+'/local.html');await p.waitForTimeout(2500);
ok('bez kont: brak logowania',await p.evaluate(()=>!document.querySelector('#login:not([hidden])')));
await p.evaluate(async()=>{const mk=async(id,name,group,pin,mc)=>{const salt=newSalt();return{id,name,group,salt,hash:await pinHash(salt,pin),...(mc?{mustChange:true}:{})}};
 __docs['app/users']={items:[await mk('a','Administrator','admin','1234'),await mk('m','Mariola Basiaga','spedycja','1111',true),await mk('j','Jolanta','kadry','2222')]};try{sessionStorage.clear()}catch(e){}await authInit()});
await p.waitForTimeout(300);
ok('ekran logowania',await p.isVisible('#login'));ok('grupy',(await p.textContent('#login')).includes('Spedycja'));
await p.click('[data-lgu=m]');await p.fill('#lg-pin','9999');await p.click('#lg-ok');await p.waitForTimeout(800);ok('błędny PIN',(await p.textContent('#login .lg-msg')).includes('Błędny'));
await p.fill('#lg-pin','1111');await p.click('#lg-ok');await p.waitForTimeout(200);ok('wymuszona zmiana',(await p.textContent('#login')).includes('Ustaw nowy'));
await p.fill('#lg-pin','4321');await p.click('#lg-ok');await p.waitForTimeout(150);await p.fill('#lg-pin','4321');await p.click('#lg-ok');await p.waitForTimeout(400);
ok('zalogowano',!(await p.isVisible('#login')));
const tabs=await p.$$eval('nav .tab',x=>x.filter(y=>!y.hidden).map(y=>y.dataset.tab));ok('spedycja: tylko plan/dysp/kalendarz',JSON.stringify(tabs)==='["plan","dysp","kalendarz"]',tabs.join());
ok('spedycja: brak AI',await p.evaluate(()=>getComputedStyle(document.getElementById('ai-fab')).display==='none'));
ok('hash zapisany, bez PIN',await p.evaluate(()=>{const u=__docs['app/users'].items.find(x=>x.id==='m');return !u.mustChange&&!JSON.stringify(__docs['app/users']).includes('4321')}));
// L4 z puli
await p.click('[data-view=hours]').catch(()=>{});await p.waitForTimeout(500);
const r=await p.evaluate(async()=>{const s=S.scheds[S.current];const d=s.cells.map(c=>c.date).filter(x=>x>=warsawDay()).sort()[0];const c=s.cells.find(x=>x.date===d&&x.empId);if(!c)return 'brak';const e=c.empId;await tlAbs('l4',e,d);return {abs:!!S.abs.find(a=>a.empId===e&&a.date===d&&a.reason==='l4'),freed:!S.scheds[S.current].cells.some(x=>x.empId===e&&x.date===d&&!x.closed&&!x.locked&&x.flotoRoute==null)}});
ok('L4 z puli = nieobecność + zwolnione trasy',r.abs&&r.freed,JSON.stringify(r));
ok('pula ma L4 i Urlop',await p.evaluate(()=>!!document.querySelector('[data-tl-new="abs:l4"]')&&!!document.querySelector('[data-tl-new="abs:urlop"]')));
// kadry
await p.click('#logout');await p.click('[data-lgu=j]');await p.fill('#lg-pin','2222');await p.click('#lg-ok');await p.waitForTimeout(400);
const t2=await p.$$eval('nav .tab',x=>x.filter(y=>!y.hidden).map(y=>y.dataset.tab));ok('kadry: plan/ludzie/kadry/rejestr',t2.sort().join()==='kadry,ludzie,plan,rejestr',t2.join());
ok('kadry: plan tylko podgląd',await p.evaluate(()=>document.body.classList.contains('ro-plan')&&!canEdit()));
await p.click('nav .tab[data-tab=kadry]');await p.waitForTimeout(300);ok('historia kierowcy',await p.evaluate(()=>document.getElementById('hist-emp').options.length>0));
// admin
await p.click('#logout');await p.click('[data-lgu=a]');await p.fill('#lg-pin','1234');await p.click('#lg-ok');await p.waitForTimeout(400);
const t3=await p.$$eval('nav .tab',x=>x.filter(y=>!y.hidden).length);ok('admin: wszystkie zakładki + Konta + Płace',t3===12,t3);
await p.click('nav .tab[data-tab=konta]');await p.click('[data-kpin=j]');await p.waitForTimeout(300);ok('reset PIN pokazuje tymczasowy',/\d{4}/.test(await p.textContent('#k-msg')));
console.log('ERRS',er);await b.close()})();
