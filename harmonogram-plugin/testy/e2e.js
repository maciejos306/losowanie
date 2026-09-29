const fs=require('fs');const {chromium}=require('playwright');
const EXE='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
(async()=>{
 const b=await chromium.launch({executablePath:EXE}); const errs=[]; const log=(...a)=>console.log(...a);
 const pg=await b.newPage({viewport:{width:1200,height:900}});
 pg.on('pageerror',e=>errs.push('PAGEERROR: '+e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text())});
 await pg.goto('file://'+process.cwd()+'/local.html'); await pg.waitForTimeout(500);
 const st=()=>pg.evaluate(()=>S);
 const check=async(name,cond)=>{const ok=await cond(); log((ok?'OK  ':'FAIL')+' '+name); if(!ok)errs.push('FAIL '+name)};
 // 1 pracownicy
 await pg.click('nav .tab[data-tab="ludzie"]'); await pg.fill('#emp-name','Test Kierowca'); await pg.click('#btn-emp'); await pg.waitForTimeout(100);
 await check('dodanie pracownika',async()=>(await st()).emps.some(e=>e.name==='Test Kierowca'));
 const tid=(await st()).emps.find(e=>e.name==='Test Kierowca').id;
 await pg.fill(`[data-absdate="${tid}"]`,'2026-10-06'); await pg.fill(`[data-absdate2="${tid}"]`,'2026-10-08'); await pg.selectOption(`[data-absreason="${tid}"]`,'l4'); await pg.click(`[data-absadd="${tid}"]`); await pg.waitForTimeout(100);
 await check('nieobecność zakres 3 dni',async()=>(await st()).abs.filter(a=>a.empId===tid).length===3);
 await check('wyświetla zakres jako jeden wpis',async()=>(await pg.locator(`[data-abs^="${tid}|2026-10-06|2026-10-08"]`).count())===1);
 await pg.click(`[data-abs="${tid}|2026-10-06|2026-10-08"]`); await pg.waitForTimeout(100);
 await check('usunięcie zakresu',async()=>(await st()).abs.filter(a=>a.empId===tid).length===0);
 await pg.click(`[data-toggle="${tid}"]`); await pg.waitForTimeout(50);
 await check('dezaktywacja',async()=>(await st()).emps.find(e=>e.id===tid).active===false);
 await pg.click(`[data-delemp="${tid}"]`); await pg.click(`[data-delemp="${tid}"]`); await pg.waitForTimeout(100);
 await check('usunięcie pracownika (2x klik)',async()=>!(await st()).emps.some(e=>e.id===tid));
 // 2 typy zmian
 await pg.click('nav .tab[data-tab="trasy"]'); await pg.fill('#shift-name','Trasa 13'); await pg.selectOption('#shift-part','am'); await pg.selectOption('#shift-weight','1.5'); await pg.click('#btn-shift'); await pg.waitForTimeout(100);
 await check('dodanie trasy',async()=>(await st()).shifts.some(s=>s.name==='Trasa 13'&&s.part==='am'&&s.weight===1.5));
 const s13=(await st()).shifts.find(s=>s.name==='Trasa 13').id;
 await pg.click(`[data-edit="${s13}"]`); await pg.waitForTimeout(50);
 await pg.fill(`[data-ed-name="${s13}"]`,'Trasa 13b'); await pg.selectOption(`[data-ed-rest="${s13}"]`,'3'); await pg.click(`[data-edsave="${s13}"]`); await pg.waitForTimeout(100);
 await check('edycja trasy + odpoczynek ręczny',async()=>{const s=(await st()).shifts.find(s=>s.id===s13);return s.name==='Trasa 13b'&&s.rest===3});
 await check('lista pokazuje +3 dni (ręcznie)',async()=>(await pg.locator('#shift-list').innerText()).includes('+3 dni odpoczynku (ręcznie)'));
 await pg.click(`[data-delshift="${s13}"]`); await pg.click(`[data-delshift="${s13}"]`); await pg.waitForTimeout(100);
 await check('usunięcie trasy',async()=>!(await st()).shifts.some(s=>s.id===s13));
 // 3 założenia
 await pg.click('nav .tab[data-tab="zalozenia"]');
 const before=(await st()).plan.days["1"].length;
 await pg.click('[data-tpl="1|t1"]'); await pg.waitForTimeout(100);
 await check('toggle założeń',async()=>(await st()).plan.days["1"].length!==before);
 await pg.click('[data-tpl="1|t1"]'); await pg.waitForTimeout(100);
 // 4 nowy harmonogram
 await pg.click('nav .tab[data-tab="lista"]'); await pg.fill('#new-name','E2E'); await pg.fill('#new-start','2026-10-12'); await pg.fill('#new-end','2026-10-18'); await pg.click('#btn-new'); await pg.waitForTimeout(300);
 await check('nowy harmonogram utworzony i otwarty',async()=>{const s=await st();return s.scheds[s.current]?.name==='E2E'});
 await check('plan tygodnia ma wiersze',async()=>(await pg.locator('#plan-table tr').count())>5);
 // 5 ręczna edycja przez okno
 const cell=pg.locator('td[data-drop]').first(); const key=await cell.getAttribute('data-drop'); const [emp,date]=key.split('|');
 await cell.locator('.chip').first().click(); await pg.waitForTimeout(150);
 await check('okno wyboru otwarte',async()=>pg.locator('#sheet.open').count().then(n=>n===1));
 const optLoc=pg.locator('#sheet-opts [data-set]:not([data-set=""])').filter({hasNotText:'✓'}).first(); const optId=await optLoc.getAttribute('data-set');
 await optLoc.click(); await pg.waitForTimeout(300);
 console.log('DBG key',key,'opt',optId,'sheetOpen',await pg.locator('#sheet.open').count(),'notice',await pg.locator('#notice').innerText(),'cells',JSON.stringify(await pg.evaluate(([e,d])=>S.scheds[S.current].cells.filter(c=>c.date===d&&c.empId===e),[emp,date])));
 await check('przypisanie zablokowane',async()=>{const s=await st();return s.scheds[s.current].cells.some(c=>c.date===date&&c.empId===emp&&c.shiftId===optId&&c.locked)});
 await check('komunikat kolizji',async()=>(await pg.locator('#notice').innerText()).includes('Sprawdzono kolizje'));
 await pg.locator(`td[data-drop="${key}"] .chip`).first().click(); await pg.waitForTimeout(150);
 await check('przycisk odblokuj widoczny',async()=>pg.locator('#sheet-opts [data-unlock]').count().then(n=>n===1));
 await pg.click('#sheet-opts [data-unlock]'); await pg.waitForTimeout(200);
 await check('odblokowano',async()=>{const s=await st();return !s.scheds[s.current].cells.some(c=>c.date===date&&c.empId===emp&&c.locked)});
 // 6 drag z palety
 const pal=pg.locator('#palette [data-drag-shift="nagel"]'); await pal.scrollIntoViewIfNeeded(); const target=pg.locator('td[data-drop]').nth(3); await target.scrollIntoViewIfNeeded(); const tkey=await target.getAttribute('data-drop');
 const pb=await pal.boundingBox(), tb=await target.boundingBox();
 await pg.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2); await pg.mouse.down(); await pg.mouse.move(pb.x+30,pb.y+30,{steps:5}); await pg.mouse.move(tb.x+tb.width/2,tb.y+tb.height/2,{steps:10});
 await check('podświetlenie celu',async()=>pg.locator('td.drop-over').count().then(n=>n===1));
 await pg.mouse.up(); await pg.waitForTimeout(300);
 const [temp,tdate]=tkey.split('|');
 console.log('DBG drop',tkey,JSON.stringify(await pg.evaluate(([e,d])=>S.scheds[S.current].cells.filter(c=>c.date===d&&(c.empId===e||c.shiftId==='nagel')),[temp,tdate])),await pg.locator('#notice').innerText());
 await check('drop Nagla z palety',async()=>{const s=await st();return s.scheds[s.current].cells.some(c=>c.date===tdate&&c.empId===temp&&c.shiftId==='nagel'&&c.locked)});
 await check('okno nie otworzyło się po dragu',async()=>pg.locator('#sheet.open').count().then(n=>n===0));
 await check('rubryka podzielona (2 komórki half)',async()=>pg.locator(`td.half[data-drop="${tkey}"]`).count().then(n=>n===2));
 // 7 drag między komórkami
 const src=pg.locator('td[data-drop] .chip[data-drag-cell]').first(); const sk=await src.getAttribute('data-drag-cell');
 const dst=pg.locator('td[data-drop]').nth(20); await src.scrollIntoViewIfNeeded(); const dk=await dst.getAttribute('data-drop');
 const sb=await src.boundingBox(), db=await dst.boundingBox();
 await pg.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2); await pg.mouse.down(); await pg.mouse.move(sb.x+20,sb.y+20,{steps:4}); await pg.mouse.move(db.x+db.width/2,db.y+db.height/2,{steps:10}); await pg.mouse.up(); await pg.waitForTimeout(300);
 await check('przeniesienie kafelka między komórkami',async()=>{const s=await st();const [fe,fd,fs,fslot]=sk.split('|');const [de,dd]=dk.split('|');const cells=s.scheds[s.current].cells;return cells.some(c=>c.date===dd&&c.empId===de&&c.shiftId===fs)&&!cells.some(c=>c.date===fd&&c.empId===fe&&c.shiftId===fs&&c.slot==+fslot)});
 // 8 reroll zachowuje blokady
 const lockedBefore=(await st()).scheds[(await st()).current].cells.filter(c=>c.locked).map(c=>c.date+c.shiftId+c.empId).sort().join();
 await pg.click('#btn-reroll'); await pg.waitForTimeout(300);
 await check('losuj ponownie zachowuje zablokowane',async()=>{const s=await st();return s.scheds[s.current].cells.filter(c=>c.locked).map(c=>c.date+c.shiftId+c.empId).sort().join()===lockedBefore});
 // 9 napraw
 await pg.fill('#repair-from','2026-10-14'); await pg.click('#btn-repair'); await pg.waitForTimeout(300);
 await check('napraw od daty',async()=>(await pg.locator('#notice').innerText()).includes('2026-10-14'));
 // 10 reguły w wyniku
 await check('brak dubli w dniu (cały dzień)',async()=>{const s=await st();const sc=s.scheds[s.current];const m={};for(const c of sc.cells){if(c.empId==null)continue;const sh=s.shifts.find(x=>x.id===c.shiftId);const p=(sh.part||'full');const k=c.date+'|'+c.empId;m[k]=m[k]||[];m[k].push(p)}return Object.values(m).every(a=>a.filter(p=>p!=='pm').length<=1&&a.filter(p=>p==='pm').length<=1)});
 await check('max 5 dni pracy/tydzień',async()=>{const s=await st();const sc=s.scheds[s.current];const w={};for(const c of sc.cells){if(c.empId==null)continue;const sh=s.shifts.find(x=>x.id===c.shiftId);if((sh.part||'full')==='pm')continue;(w[c.empId]??=new Set()).add(c.date)}return Object.values(w).every(x=>x.size<=5)});
 await pg.screenshot({path:'e2e-final.png',fullPage:true});
 await b.close();
 log('\nBŁĘDY:',errs.length?errs:'brak');
 process.exit(errs.length?1:0);
})();
