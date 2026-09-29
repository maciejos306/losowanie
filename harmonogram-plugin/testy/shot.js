const fs=require('fs');const {chromium}=require('playwright');
const html=fs.readFileSync('../harmonogram-app.html','utf8');
const docs={
 "app/employees":JSON.parse(fs.readFileSync('dbdump/app/employees.json')),
 "app/shifts":JSON.parse(fs.readFileSync('dbdump/app/shifts.json')),
 "app/absences":{items:[{empId:"e3",date:"2026-10-07",reason:"l4"},{empId:"e3",date:"2026-10-08",reason:"l4"},{empId:"e4",date:"2026-10-10",reason:"urlop"}]},
 "app/plan":JSON.parse(fs.readFileSync('dbdump/app/plan.json')),
};
const sched=JSON.parse(fs.readFileSync('next.json'));
// dodaj Nagel na dniu z trasą + lock
sched.cells.push({date:"2026-10-07",shiftId:"nagel",slot:1,empId:"e1"}); sched.cells[2].locked=true;
const stub=`<script>
const __docs=${JSON.stringify(docs)}; const __sched=${JSON.stringify(sched)};
const __subs={}; const __colsubs=[];
const __deepFreeze=o=>{if(o&&typeof o==="object"&&!Object.isFrozen(o)){Object.freeze(o);Object.values(o).forEach(__deepFreeze)}return o};
const __emit=p=>{(__subs[p]||[]).forEach(cb=>cb({exists:!!__docs[p],data:()=>__deepFreeze(__docs[p])}))};
const __emitCol=()=>{__colsubs.forEach(cb=>cb({docs:Object.keys(__docs).filter(k=>k.startsWith("schedules/")).map(k=>({id:k.slice(10),data:()=>__deepFreeze(__docs[k])}))}))};
__docs["schedules/"+__sched.id]=__sched; const __prev=${JSON.stringify(JSON.parse(require("fs").readFileSync("prev.json")))}; __prev.name="poprzedni"; __prev.createdAt="2026-09-20"; __docs["schedules/"+__prev.id]=__prev;
window.claude={use:async(n)=>n!=="db"?null:{
  doc:p=>({get:async()=>({exists:!!__docs[p],data:()=>__docs[p]}),set:async d=>{__docs[p]=JSON.parse(JSON.stringify(d));__emit(p);if(p.startsWith("schedules/"))__emitCol()},delete:async()=>{delete __docs[p];__emit(p);__emitCol()},onSnapshot:(cb)=>{(__subs[p]??=[]).push(cb);setTimeout(()=>cb({exists:!!__docs[p],data:()=>__deepFreeze(__docs[p])}),10);return()=>{}}}),
  collection:()=>({onSnapshot:(cb)=>{__colsubs.push(cb);setTimeout(__emitCol,10);return()=>{}}})
}};
</script>`;
const page_html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${stub}${html}</body></html>`;
fs.writeFileSync('local.html',page_html);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
 for(const [name,w,hh] of [["phone",400,900],["desktop",1200,900]]){
  const pg=await b.newPage({viewport:{width:w,height:hh},deviceScaleFactor:1});
  pg.on('pageerror',e=>console.log('PAGEERROR',name,e.message));
  await pg.goto('file://'+process.cwd()+'/local.html'); await pg.waitForTimeout(600);
  await pg.screenshot({path:`shot-${name}-plan.png`,fullPage:true});
  await pg.evaluate(()=>{const it=__docs['app/shifts'].items;it.forEach(x=>{const n=x.name;if(/^Trasa ([1-7])$/.test(n)||n==='Zwroty'){x.start=1.5;x.hours=8}else if(n==='Trasa 8'){x.start=22;x.hours=20}else if(n==='Trasa 9'||n==='Trasa 10'){x.start=21;x.hours=20}else if(n==='Trasa 11'){x.start=19;x.hours=20}else if(n==='Trasa 12'){x.start=13;x.hours=16}else if(x.part==='pm'){x.start=14.5;x.hours=5}});window.claude.use('db').then(db=>db.doc('app/shifts').set({items:it}))}); await pg.waitForTimeout(200);
  await pg.click('.view-btn[data-view="hours"]'); await pg.waitForTimeout(300); await pg.screenshot({path:`shot-${name}-hours.png`,fullPage:true}); await pg.click('.view-btn[data-view="chips"]');
  await pg.click('nav .tab[data-tab="ludzie"]'); await pg.waitForTimeout(100); await pg.screenshot({path:`shot-${name}-ludzie.png`,fullPage:true});
  await pg.click('nav .tab[data-tab="zalozenia"]'); await pg.waitForTimeout(100); await pg.screenshot({path:`shot-${name}-zal.png`,fullPage:true});
  await pg.click('nav .tab[data-tab="trasy"]'); await pg.waitForTimeout(100); await pg.screenshot({path:`shot-${name}-trasy.png`,fullPage:true});
  await pg.click('nav .tab[data-tab="plan"]'); await pg.waitForTimeout(100);
  await pg.click('td[data-drop] .chip'); await pg.waitForTimeout(150); await pg.screenshot({path:`shot-${name}-sheet.png`});
  await pg.close();
 }
 await b.close();})();
