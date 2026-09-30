window.__fakeSample=Object.assign(async(input,opts)=>{
  const turns=Array.isArray(input)?input:[{role:'user',content:input}];
  const last=turns[turns.length-1].content;window.__turns=turns;window.__opts=opts;
  const T={};(opts.tools||[]).forEach(t=>T[t.name]=t);
  const call=async(n,a)=>{try{const r=await T[n].execute(a,{signal:opts.signal});return typeof r==='string'?r:JSON.stringify(r)}catch(e){return 'Error: '+e.message}};
  const say=t=>{opts.onText&&opts.onText({text:t,delta:t});return t};
  if(opts.signal?.aborted)throw{code:'cancelled',message:'x'};
  let out;
  if(/zakoncz/i.test(last)){out='K: '+await call('zakoncz_trase',{employeeId:'e6',date:'2026-09-30',shiftId:'t10',departure:'20:00',return:'16:30'})}
  else if(/zlecenie/i.test(last)){out='Z: '+await call('dodaj_zlecenie_dodatkowe',{employeeId:'e2',date:'2026-10-07',orders:'Nagel + Perfekt'})}
  else if(/wyjazd/i.test(last)){out='J: '+await call('rozlicz_dyzur',{employeeId:'e2',date:'2026-10-07',went:true,departure:'14:30',return:'21:00'})}
  else if(/wolne miejsca/i.test(last)){out='M: '+await call('wolne_miejsca_urlop',{from:'2026-10-06'})}
  else if(/podlicz/i.test(last)){out='P: '+await call('podlicz_dniowki',{employeeId:'e6',from:'2026-10-01',to:'2026-10-31'})}
  else if(/wniosek/i.test(last)){out='W: '+await call('ustaw_nieobecnosc',{employeeId:'e8',from:'2026-10-06',to:'2026-10-06',reason:'wniosek'})}
  else if(/L4/i.test(last)){out='L: '+await call('ustaw_nieobecnosc',{employeeId:'e4',from:'2026-10-13',to:'2026-10-15',reason:'l4'})}
  else if(/trasa/i.test(last)){out='T: '+await call('przypisz_trase',{employeeId:'e7',date:'2026-10-08',shiftId:'t7'})}
  else if(/dyzur|dyżur/i.test(last)){out='D: '+await call('rozlicz_dyzur',{employeeId:'e4',date:'2026-10-05',went:true,hours:6.5})}
  else if(/wolny/i.test(last)){out='A: '+await call('dostepnosc_dnia',{date:'2026-10-06'})}
  else if(/bilans/i.test(last)){out='B: '+await call('bilans_tygodnia',{monday:'2026-10-12'})}
  else if(/zla data/i.test(last)){out='Z: '+await call('podlicz_dniowki',{employeeId:'e1',from:'1.02',to:'5.02'})}
  else if(/wolno/i.test(last)){await new Promise((res,rej)=>{opts.signal.addEventListener('abort',()=>rej({code:'cancelled',message:'x',text:''}));setTimeout(res,5000)});out='nigdy'}
  else out='Cześć';
  return{text:say(out),truncated:false,modelTierApplied:opts.modelTier||'default'};
},{limits:async()=>({maxPromptBytes:65536,tools:{maxCount:16}}),json:async()=>({})});
