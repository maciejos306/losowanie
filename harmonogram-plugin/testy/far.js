const fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/local.html');await pg.waitForTimeout(2800);
const ok=(k,v,x='')=>console.log((v?'OK   ':'FAIL ')+k+(x?'  '+x:''));
const L=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const r=await pg.evaluate(([shifts,emps,plan])=>{FL.mcp=null;Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);S.abs=[];S.shifts=shifts;S.emps=emps.filter(e=>e.active);S.plan=plan;
 const runs=[];for(let rep=0;rep<5;rep++){Object.keys(S.scheds).forEach(id=>delete S.scheds[id]);
 let st='2026-11-02';for(let w=0;w<6;w++){const cells=generate(st,addDays(st,6),null);const id='g'+w;S.scheds[id]={id,start:st,end:addDays(st,6),createdAt:st,cells};st=addDays(st,7)}
 const m={};S.shifts.forEach(x=>m[x.id]=x);const far={};
 for(const s of Object.values(S.scheds))for(const c of s.cells)if(c.empId&&isFar(m[c.shiftId]))(far[c.empId]??=[]).push(c.date);
 const out={};for(const e of S.emps){const d=(far[e.id]||[]).sort();let g=99;for(let i=1;i<d.length;i++)g=Math.min(g,dDiff(d[i],d[i-1]));out[e.name]={n:d.length,minGap:d.length>1?g:null}}runs.push(out)}
 return runs},[L('live6/app/shifts.json').items,L('live6/app/employees.json').items,L('live6/app/plan.json')]);
console.log(JSON.stringify(r[0],null,0));
const all=r.flatMap(o=>Object.entries(o));const ns=r.map(o=>Object.values(o).map(v=>v.n));
ok('każdy kierowca dostaje dalekie trasy (6 tygodni)',r.every(o=>Object.entries(o).every(([n,v])=>v.n>=2||/Bubon/.test(n))),JSON.stringify(ns));
ok('rozrzut liczby dalekich tras ≤ 3 w 6 tygodni',ns.every(a=>Math.max(...a)-Math.min(...a)<=3),JSON.stringify(ns));
ok('nikt nie ma dwóch dalekich tras w odstępie < 3 dni',all.every(([n,v])=>v.minGap==null||v.minGap>=3),JSON.stringify(all.filter(([n,v])=>v.minGap!=null&&v.minGap<4)));
console.log('ERRS',errs);await b.close()})();
