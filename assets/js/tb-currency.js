
"use strict";
/* ===== Currency Converter ===== */
const CURR=[['USD','US Dollar (USD)',1],['BDT','Bangladeshi Taka (BDT)',123.666224],['EUR','Euro (EUR)',0.89075],['GBP','British Pound (GBP)',0.748335],['INR','Indian Rupee (INR)',94.995216],['PKR','Pakistani Rupee (PKR)',277.013331],['LKR','Sri Lankan Rupee (LKR)',331.602916],['NPR','Nepali Rupee (NPR)',151.984541],['AED','UAE Dirham (AED)',3.6725],['SAR','Saudi Riyal (SAR)',3.75],['KWD','Kuwaiti Dinar (KWD)',0.309652],['QAR','Qatari Riyal (QAR)',3.64],['OMR','Omani Riyal (OMR)',0.384497],['BHD','Bahraini Dinar (BHD)',0.376],['MYR','Malaysian Ringgit (MYR)',4.082917],['SGD','Singapore Dollar (SGD)',1.278172],['HKD','Hong Kong Dollar (HKD)',7.848269],['CNY','Chinese Yuan (CNY)',6.691314],['JPY','Japanese Yen (JPY)',158.224062],['KRW','South Korean Won (KRW)',1327.17027],['THB','Thai Baht (THB)',33.616253],['AUD','Australian Dollar (AUD)',1.428632],['CAD','Canadian Dollar (CAD)',1.40605],['CHF','Swiss Franc (CHF)',0.825328],['TRY','Turkish Lira (TRY)',49.597774],['ZAR','South African Rand (ZAR)',16.397238],['IDR','Indonesian Rupiah (IDR)',18001.598375],['PHP','Philippine Peso (PHP)',63.087647],['VND','Vietnamese Dong (VND)',25846.196303]];
let RATES={};CURR.forEach(c=>RATES[c[0]]=c[2]);
(function(){
 const opts=CURR.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('');
 $('#cc-from').innerHTML=opts;$('#cc-to').innerHTML=opts;
 $('#cc-from').value='USD';$('#cc-to').value='BDT';
})();
function ccConvert(){
 const amt=+$('#cc-amt').value||0,f=$('#cc-from').value,t=$('#cc-to').value;
 const out=amt*RATES[t]/RATES[f];
 const box=$('#cc-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\"><b class=\"big\">{0} {1}</b> = <b class=\"big\">{2} {3}</b></p><div class=\"kv\"><span>1 {4} =</span><b>{5} {6}</b></div><div class=\"kv\"><span>1 {7} =</span><b>{8} {9}</b></div>",fmtN(amt,4),f,fmtN(out,4),t,f,fmtN(RATES[t]/RATES[f],6),t,t,fmtN(RATES[f]/RATES[t],6),f);
 box.classList.add('show');
 $('#cc-quick').innerHTML=['USD','EUR','GBP','SAR','AED','KWD','INR','MYR','SGD'].map(code=>{
   const c=CURR.find(x=>x[0]===code);return Tf("<div class=\"kv\"><span>1 {0} ({1})</span><b>৳{2}</b></div>",code,c[1].split(' (')[0],toBn(fmtN(RATES.BDT/RATES[code],4)));}).join('');
}
$('#cc-go').addEventListener('click',ccConvert);
$('#cc-swap').addEventListener('click',()=>{const f=$('#cc-from').value;$('#cc-from').value=$('#cc-to').value;$('#cc-to').value=f;ccConvert();});
$('#cc-amt').addEventListener('input',ccConvert);
ccConvert();
fetch('https://open.er-api.com/v6/latest/USD').then(r=>r.json()).then(j=>{
 if(j&&j.rates){CURR.forEach(c=>{if(j.rates[c[0]])RATES[c[0]]=j.rates[c[0]];});
  $('#cc-note').textContent='Rate: Live (ExchangeRate-API) — Last updated: '+toBn(new Date(j.time_last_update_utc).toLocaleDateString('en-GB'))+'.';
  ccConvert();}
}).catch(()=>{});
/* ===== Time Zone Converter ===== */
const ZONES=[['Asia/Dhaka','Dhaka, Bangladesh'],['Asia/Kolkata','Kolkata, India'],['Asia/Karachi','Karachi, Pakistan'],['Asia/Dubai','Dubai, UAE'],['Asia/Riyadh','Riyadh, Saudi Arabia'],['Asia/Kuala_Lumpur','Kuala Lumpur, Malaysia'],['Asia/Singapore','Singapore'],['Asia/Tokyo','Tokyo, Japan'],['Europe/London','London, UK'],['Europe/Paris','Paris, France'],['America/New_York','New York, USA'],['America/Chicago','Chicago, USA'],['America/Los_Angeles','Los Angeles, USA'],['Australia/Sydney','Sydney, Australia'],['UTC','UTC / GMT']];
(function(){const o=ZONES.map(z=>`<option value="${z[0]}">${z[1]}</option>`).join('');$('#tz-from').innerHTML=o;$('#tz-to').innerHTML=o;$('#tz-from').value='Asia/Dhaka';$('#tz-to').value='Asia/Dubai';
 const n=new Date();n.setSeconds(0,0);$('#tz-dt').value=new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,16);})();
function tzWallToUTC(str,tz){
 const m=str.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+)/);if(!m)return null;
 const target=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);let guess=target;
 for(let i=0;i<3;i++){
   const loc=new Date(new Date(guess).toLocaleString('en-US',{timeZone:tz}));
   const locUtc=Date.UTC(loc.getFullYear(),loc.getMonth(),loc.getDate(),loc.getHours(),loc.getMinutes(),loc.getSeconds());
   const diff=target-locUtc;guess+=diff;if(diff===0)break;
 }
 return new Date(guess);
}
function tzFmt(d,tz){return new Intl.DateTimeFormat('en-GB',{timeZone:tz,weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).format(d);}
$('#tz-go').addEventListener('click',()=>{
 const v=$('#tz-dt').value;if(!v){toast(T('Enter date and time'));return;}
 const from=$('#tz-from').value,to=$('#tz-to').value;
 const utc=tzWallToUTC(v,from);if(!utc){toast(T('Enter a valid time'));return;}
 const zf=ZONES.find(z=>z[0]===from),zt=ZONES.find(z=>z[0]===to);
 const box=$('#tz-res');
 box.innerHTML=Tf("<div class=\"kv\"><span>{0}</span><b>{1}</b></div><div class=\"kv\"><span>{2}</span><b class=\"big\" style=\"font-size:18px\">{3}</b></div><div class=\"kv\"><span>In Dhaka time</span><b>{4}</b></div>",zf[1],tzFmt(utc,from),zt[1],tzFmt(utc,to),tzFmt(utc,'Asia/Dhaka'));
 box.classList.add('show');
});
function tzWorld(){
 const rows=[['Asia/Dhaka','Dhaka'],['Asia/Dubai','Dubai'],['Asia/Riyadh','Riyadh'],['Asia/Kuala_Lumpur','Kuala Lumpur'],['Europe/London','London'],['America/New_York','New York'],['Asia/Tokyo','Tokyo']];
 const now=new Date();
 $('#tz-world').innerHTML=rows.map(r=>`<div class="kv"><span>${r[1]}</span><b>${new Intl.DateTimeFormat('en-GB',{timeZone:r[0],weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true}).format(now)}</b></div>`).join('');
}
tzWorld();setInterval(()=>{if($('#tz-world'))tzWorld();},1000);
/* ===== Shared BD income tax (FY 2024-25 slabs, estimate) ===== */
function taxBD(annual,freeLimit){
 const slabs=[[100000,0.05],[300000,0.10],[400000,0.15],[500000,0.20],[Infinity,0.25]];
 let rem=Math.max(0,annual-freeLimit),tax=0;const rows=[];
 if(annual>0)rows.push(Tf("<div class=\"kv\"><span>Tax-free portion</span><b>৳{0}</b></div>",toBn(fmtN(Math.min(annual,freeLimit)))));
 const labels=['Next ৳100,000 — 5%','Next ৳300,000 — 10%','Next ৳400,000 — 15%','Next ৳500,000 — 20%','Remaining — 25%'];
 slabs.forEach((s,i)=>{if(rem<=0)return;const take=Math.min(rem,s[0]);const t=take*s[1];tax+=t;rem-=take;
  rows.push(Tf("<div class=\"kv\"><span>{0} (income ৳{1})</span><b>৳{2}</b></div>",labels[i],toBn(fmtN(take)),toBn(fmtN(Math.round(t)))));});
 return {tax:Math.round(tax),rows:rows.join('')};
}
/* ===== VAT & Tax ===== */
$('#vt-mode').addEventListener('change',()=>{
 const m=$('#vt-mode').value;
 $('#vt-rate-wrap').style.display=m==='income'?'none':'block';
 $('#vt-cat-wrap').style.display=m==='income'?'block':'none';
 $('#vt-amt-label').textContent=m==='income'?'Annual total income (৳)':'Amount (৳)';
});
$('#vt-go').addEventListener('click',()=>{
 const m=$('#vt-mode').value,amt=+$('#vt-amt').value||0,box=$('#vt-res');
 if(m==='add'){const r=+$('#vt-rate').value||0;const vat=amt*r/100;
  box.innerHTML=Tf("<p style=\"margin:0 0 6px\">Total price including VAT: <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>Original price</span><b>৳{1}</b></div><div class=\"kv\"><span>VAT ({2}%)</span><b>৳{3}</b></div>",toBn(fmtN(amt+vat)),toBn(fmtN(amt)),toBn(r),toBn(fmtN(vat)));}
 else if(m==='remove'){const r=+$('#vt-rate').value||0;const net=amt/(1+r/100);const vat=amt-net;
  box.innerHTML=Tf("<p style=\"margin:0 0 6px\">Price without VAT: <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>Price including VAT</span><b>৳{1}</b></div><div class=\"kv\"><span>VAT included ({2}%)</span><b>৳{3}</b></div>",toBn(fmtN(net)),toBn(fmtN(amt)),toBn(r),toBn(fmtN(vat)));}
 else{const lim=+$('#vt-cat').value;const res=taxBD(amt,lim);
  box.innerHTML=res.rows+Tf("<p style=\"margin:10px 0 0\">Estimated total income tax: <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>Effective tax rate</span><b>{1}%</b></div><div class=\"kv\"><span>Average per month</span><b>৳{2}</b></div>",toBn(fmtN(res.tax)),amt?toBn((res.tax/amt*100).toFixed(2)):0,toBn(fmtN(Math.round(res.tax/12))));}
 box.classList.add('show');
});
/* ===== Salary ===== */
$('#sal-go').addEventListener('click',()=>{
 let monthly=+$('#sal-amt').value||0;if($('#sal-per').value==='year')monthly=monthly/12;
 const yearly=monthly*12,bonus=monthly*(+$('#sal-bonus').value||0);
 const pfYear=yearly*(+$('#sal-pf').value||0)/100;
 const tax=($('#sal-tax').value==='1')?taxBD(yearly+bonus,350000).tax:0;
 const netYear=yearly+bonus-pfYear-tax;
 const box=$('#sal-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">Monthly take-home (average): <b class=\"big\">৳{0}</b></p>\n <div class=\"kv\"><span>Monthly gross salary</span><b>৳{1}</b></div>\n <div class=\"kv\"><span>Annual gross (12 months)</span><b>৳{2}</b></div>\n <div class=\"kv\"><span>Annual bonus</span><b>৳{3}</b></div>\n <div class=\"kv\"><span>Annual PF deduction</span><b>৳{4}</b></div>\n <div class=\"kv\"><span>Estimated annual income tax</span><b>৳{5}</b></div>\n <div class=\"kv\"><span>Annual net (take-home)</span><b>৳{6}</b></div>\n <div class=\"kv\"><span>Per hour (based on 26 days × 8 hours)</span><b>৳{7}</b></div>",toBn(fmtN(Math.round(netYear/12))),toBn(fmtN(Math.round(monthly))),toBn(fmtN(Math.round(yearly))),toBn(fmtN(Math.round(bonus))),toBn(fmtN(Math.round(pfYear))),toBn(fmtN(tax)),toBn(fmtN(Math.round(netYear))),toBn(fmtN(monthly/208,1)));
 box.classList.add('show');
});
/* ===== Percentage ===== */
const PC_LABELS={of:['Percentage (X %)','Total number (Y)'],iswhat:['Number (X)','Out of (Y)'],change:['Previous value (A)','Next value (B)'],incdec:['Percentage (X %)','Number (Y)']};
$('#pc-mode').addEventListener('change',()=>{const l=PC_LABELS[$('#pc-mode').value];$('#pc-la').textContent=l[0];$('#pc-lb').textContent=l[1];});
$('#pc-go').addEventListener('click',()=>{
 const m=$('#pc-mode').value,a=+$('#pc-a').value||0,b=+$('#pc-b').value||0,box=$('#pc-res');let html='';
 if(m==='of')html=Tf("<b class=\"big\">{1}% of {0} = {2}</b>",fmtN(b),fmtN(a),fmtN(a/100*b));
 else if(m==='iswhat'){if(!b){toast(T('Y cannot be zero'));return;}html=Tf("<b class=\"big\">{0} is {2}% of {1}</b>",fmtN(a),fmtN(b),fmtN(a/b*100,4));}
 else if(m==='change'){if(!a){toast(T('Previous value cannot be zero'));return;}const ch=(b-a)/Math.abs(a)*100;
  html=Tf("<b class=\"big\">{0} → {1}: {2} {3}%</b><div class=\"kv\"><span>Difference</span><b>{4}</b></div>",fmtN(a),fmtN(b),ch>=0?'Increased':'Decreased',fmtN(Math.abs(ch),4),fmtN(b-a));}
 else{const inc=b*(1+a/100),dec=b*(1-a/100);html=Tf("<div class=\"kv\"><span>{0}% If increased by</span><b class=\"big\" style=\"font-size:19px\">{1}</b></div><div class=\"kv\"><span>{2}% If decreased by</span><b class=\"big\" style=\"font-size:19px\">{3}</b></div>",fmtN(a),fmtN(inc),fmtN(a),fmtN(dec));}
 box.innerHTML=html;box.classList.add('show');
});
/* ===== CV Builder ===== */
function dynRow(container,fields){
 const div=document.createElement('div');div.className='dynrow';
 div.innerHTML=fields.map(f=>`<input class="in" data-k="${f[0]}" placeholder="${f[1]}" ${f[2]?`style="${f[2]}"`:''} />`).join('')+`<button class="btn alt sm" type="button">✕</button>`;
 div.querySelector('button').onclick=()=>div.remove();
 $(container).appendChild(div);return div;
}
function rowData(container){
 return Array.from(document.querySelectorAll(container+' .dynrow')).map(r=>{
  const o={};r.querySelectorAll('[data-k]').forEach(i=>o[i.dataset.k]=i.value.trim());return o;
 }).filter(o=>Object.values(o).some(v=>v));
}
dynRow('#cv-exp-rows',[['role','Job title (e.g. Sales Executive)'],['org','Organization'],['period','Period (2019 – 2023)'],['desc','Job description','flex:2;min-width:200px']]);
dynRow('#cv-exp-rows',[['role','Job title'],['org','Organization'],['period','Period'],['desc','Job description','flex:2;min-width:200px']]);
dynRow('#cv-edu-rows',[['degree','Degree (e.g. BBA)'],['inst','Organization'],['year','Passing year'],['result','Result (CGPA/GPA)']]);
dynRow('#cv-edu-rows',[['degree','Degree (e.g. HSC)'],['inst','Organization'],['year','Passing year'],['result','Result']]);
$('#cv-exp-add').addEventListener('click',()=>dynRow('#cv-exp-rows',[['role','Job title'],['org','Organization'],['period','Period'],['desc','Job description','flex:2;min-width:200px']]));
$('#cv-edu-add').addEventListener('click',()=>dynRow('#cv-edu-rows',[['degree','Degree'],['inst','Organization'],['year','Passing year'],['result','Result']]));
function cvData(){
 return {name:$('#cv-name').value.trim(),title:$('#cv-title').value.trim(),email:$('#cv-email').value.trim(),
  phone:$('#cv-phone').value.trim(),addr:$('#cv-addr').value.trim(),summary:$('#cv-summary').value.trim(),
  skills:$('#cv-skills').value.trim(),lang:$('#cv-lang').value.trim(),
  exp:rowData('#cv-exp-rows'),edu:rowData('#cv-edu-rows')};
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function cvRender(){
 const d=cvData();if(!d.name){toast(T('Enter a name first'));return null;}
 const contact=[d.email,d.phone,d.addr].filter(Boolean).join(' · ');
 const paper=$('#cv-paper');
 paper.innerHTML=`<h2>${esc(d.name)}</h2>${d.title?`<p style="margin:2px 0 0;color:#0b7a4b;font-weight:600">${esc(d.title)}</p>`:''}${contact?`<p style="margin:2px 0 0;color:#555">${esc(contact)}</p>`:''}
 ${d.summary?`<h4>Career Summary</h4><p style="margin:0">${esc(d.summary)}</p>`:''}
 ${d.exp.length?`<h4>Work Experience</h4>`+d.exp.map(e=>`<p style="margin:0 0 8px"><b>${esc(e.role)}</b>${e.org?' — '+esc(e.org):''}${e.period?` <span style="color:#666">(${esc(e.period)})</span>`:''}${e.desc?`<br/><span style="color:#444">${esc(e.desc)}</span>`:''}</p>`).join(''):''}
 ${d.edu.length?`<h4>Education</h4>`+d.edu.map(e=>`<p style="margin:0 0 6px"><b>${esc(e.degree)}</b>${e.inst?' — '+esc(e.inst):''}${e.year?` (${esc(e.year)})`:''}${e.result?` · Result: ${esc(e.result)}`:''}</p>`).join(''):''}
 ${d.skills?`<h4>Skills</h4><p style="margin:0">${esc(d.skills)}</p>`:''}
 ${d.lang?`<h4>Languages</h4><p style="margin:0">${esc(d.lang)}</p>`:''}`;
 paper.classList.add('show');return d;
}
$('#cv-preview').addEventListener('click',cvRender);
function cvText(d){
 const L=[];L.push(d.name);if(d.title)L.push(d.title);
 const c=[d.email,d.phone,d.addr].filter(Boolean).join(' | ');if(c)L.push(c);
 L.push('='.repeat(46));
 if(d.summary){L.push('', 'CAREER SUMMARY', d.summary);}
 if(d.exp.length){L.push('', 'WORK EXPERIENCE');d.exp.forEach(e=>{L.push(`- ${e.role}${e.org?' — '+e.org:''}${e.period?' ('+e.period+')':''}`);if(e.desc)L.push('  '+e.desc);});}
 if(d.edu.length){L.push('', 'EDUCATION');d.edu.forEach(e=>L.push(`- ${e.degree}${e.inst?' — '+e.inst:''}${e.year?' ('+e.year+')':''}${e.result?' · '+e.result:''}`));}
 if(d.skills){L.push('', 'SKILLS', d.skills);}
 if(d.lang){L.push('', 'LANGUAGES', d.lang);}
 return L.join('\n');
}
$('#cv-txt').addEventListener('click',()=>{const d=cvRender();if(!d)return;const b=new Blob([cvText(d)],{type:'text/plain;charset=utf-8'});dl(URL.createObjectURL(b),(d.name||'cv').replace(/\s+/g,'_')+'_CV.txt');});
$('#cv-pdf').addEventListener('click',()=>{
 const d=cvRender();if(!d)return;
 try{
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  let y=18;const X=15,W=180;
  const need=n=>{if(y+n>282){doc.addPage();y=18;}};
  const head=t=>{need(12);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text(t.toUpperCase(),X,y);y+=2;doc.setLineWidth(0.4);doc.line(X,y,X+W,y);y+=6;doc.setFont('helvetica','normal');doc.setFontSize(11);};
  const para=t=>{const lines=doc.splitTextToSize(t,W);need(lines.length*5.2+2);doc.text(lines,X,y);y+=lines.length*5.2+2;};
  doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text(d.name||'Your Name',X,y);y+=7;
  doc.setFont('helvetica','normal');doc.setFontSize(12);if(d.title){doc.text(d.title,X,y);y+=6;}
  doc.setFontSize(10);const c=[d.email,d.phone,d.addr].filter(Boolean).join('  |  ');if(c){doc.text(c,X,y);y+=4;}
  doc.setLineWidth(0.7);doc.line(X,y,X+W,y);y+=8;doc.setFontSize(11);
  if(d.summary){head('Career Summary');para(d.summary);}
  if(d.exp.length){head('Work Experience');d.exp.forEach(e=>{doc.setFont('helvetica','bold');const t=`${e.role}${e.org?' — '+e.org:''}`;need(6);doc.text(t,X,y);y+=5.4;doc.setFont('helvetica','normal');if(e.period){doc.setFontSize(10);doc.text(e.period,X,y);y+=5;doc.setFontSize(11);}if(e.desc)para(e.desc);});}
  if(d.edu.length){head('Education');d.edu.forEach(e=>para(`${e.degree}${e.inst?' — '+e.inst:''}${e.year?' ('+e.year+')':''}${e.result?' · Result: '+e.result:''}`));}
  if(d.skills){head('Skills');para(d.skills);}
  if(d.lang){head('Languages');para(d.lang);}
  doc.save((d.name||'cv').replace(/\s+/g,'_')+'_CV.pdf');toast(T('PDF downloaded ✓'));
 }catch(e){toast(T('Could not create PDF — use Text Download'));}
});
/* ===== Invoice Generator ===== */
$('#inv-date').value=new Date().toISOString().slice(0,10);
const CURS={BDT:{s:'৳',n:'Taka'},USD:{s:'$',n:'US Dollar'},EUR:{s:'€',n:'Euro'},GBP:{s:'£',n:'British Pound'},INR:{s:'₹',n:'Indian Rupee'},PKR:{s:'Rs ',n:'Pakistani Rupee'},LKR:{s:'Rs ',n:'Sri Lankan Rupee'},NPR:{s:'Rs ',n:'Nepalese Rupee'},AED:{s:'AED ',n:'UAE Dirham'},SAR:{s:'SAR ',n:'Saudi Riyal'},QAR:{s:'QAR ',n:'Qatari Riyal'},KWD:{s:'KWD ',n:'Kuwaiti Dinar'},MYR:{s:'RM ',n:'Malaysian Ringgit'},SGD:{s:'$',n:'Singapore Dollar'},AUD:{s:'$',n:'Australian Dollar'},CAD:{s:'$',n:'Canadian Dollar'},JPY:{s:'¥',n:'Japanese Yen'},CNY:{s:'¥',n:'Chinese Yuan'},THB:{s:'฿',n:'Thai Baht'},PHP:{s:'₱',n:'Philippine Peso'},IDR:{s:'Rp ',n:'Indonesian Rupiah'},VND:{s:'₫',n:'Vietnamese Dong'},TRY:{s:'₺',n:'Turkish Lira'},ZAR:{s:'R ',n:'South African Rand'},NGN:{s:'₦',n:'Nigerian Naira'},KES:{s:'KSh ',n:'Kenyan Shilling'}};
function invCur(){const c=$('#inv-cur').value||'BDT';return {code:c,s:(CURS[c]||CURS.BDT).s,n:(CURS[c]||CURS.BDT).n};}
function invMoney(x){const c=invCur();return c.s+fmtN(Math.round(x*100)/100);}
function invRow(){
 const div=document.createElement('div');div.className='dynrow inv-row';
 div.innerHTML=`<input class="in f-desc" data-k="desc" placeholder="Item name / description" /><input class="in f-qty" data-k="qty" type="number" value="1" min="0" step="any" placeholder="Quantity" /><input class="in f-price" data-k="price" type="number" value="0" min="0" step="any" placeholder="Unit price" /><span class="f-amt">—</span><span class="f-x"><button class="btn alt sm" type="button">✕</button></span>`;
 div.querySelector('button').onclick=()=>{div.remove();invLive();};
 div.querySelectorAll('input').forEach(el=>el.addEventListener('input',invLive));
 $('#inv-rows').appendChild(div);
}
invRow();invRow();
$('#inv-add').addEventListener('click',()=>{invRow();invLive();});
$('#inv-type').addEventListener('change',()=>{$('#inv-due-wrap').style.display=$('#inv-type').value==='receipt'?'none':'block';});
['inv-disc','inv-tax','inv-paid','inv-cur'].forEach(id=>{const el=document.getElementById(id);if(el){el.addEventListener('input',invLive);el.addEventListener('change',invLive);}});
function numWords(n){
 n=Math.floor(Math.abs(n));if(n===0)return 'Zero';
 const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
 const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
 const below=x=>x<20?ones[x]:tens[Math.floor(x/10)]+(x%10?' '+ones[x%10]:'');
 const hund=x=>{const h=Math.floor(x/100),r=x%100;return (h?ones[h]+' Hundred'+(r?' ':''):'')+(r?below(r):'');};
 let out='';const parts=[[1e9,'Billion'],[1e6,'Million'],[1e3,'Thousand']];
 for(const [v,label] of parts){if(n>=v){out+=hund(Math.floor(n/v))+' '+label+' ';n%=v;}}
 out+=hund(n);return out.trim();
}
function invCalc(){
 const items=rowData('#inv-rows').map(r=>({desc:r.desc||'Item',qty:+r.qty||0,price:+r.price||0})).filter(i=>i.qty>0||i.price>0);
 const sub=items.reduce((sm,i)=>sm+i.qty*i.price,0);
 const disc=sub*(+$('#inv-disc').value||0)/100;
 const tax=(sub-disc)*(+$('#inv-tax').value||0)/100;
 const total=sub-disc+tax,paid=+$('#inv-paid').value||0;
 return {items,sub,disc,tax,total,paid,due:total-paid,cur:invCur(),
  type:$('#inv-type').value,biz:$('#inv-biz').value.trim(),bizinfo:$('#inv-bizinfo').value.trim(),
  client:$('#inv-client').value.trim(),no:$('#inv-no').value.trim(),date:$('#inv-date').value,dueDate:$('#inv-due').value,notes:$('#inv-notes').value.trim(),
  discPct:+$('#inv-disc').value||0,taxPct:+$('#inv-tax').value||0};
}
function invLive(){
 document.querySelectorAll('#inv-rows .inv-row').forEach(r=>{
   const q=+((r.querySelector('[data-k="qty"]')||{}).value)||0, p=+((r.querySelector('[data-k="price"]')||{}).value)||0;
   const a=r.querySelector('.f-amt'); if(a) a.textContent=(q>0||p>0)?invMoney(q*p):'—';
 });
 const d=invCalc();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
 set('inv-lv-sub',invMoney(d.sub)); set('inv-lv-disc','−'+invMoney(d.disc)); set('inv-lv-tax',invMoney(d.tax));
 set('inv-lv-total',invMoney(d.total)); set('inv-lv-paid',invMoney(d.paid)); set('inv-lv-due',invMoney(Math.max(0,d.due)));
}
function invRender(){
 const d=invCalc();if(!d.items.length){toast(T('Please add at least one item'));return null;}
 const isInv=d.type==='invoice';
 const rows=d.items.map((it,ix)=>`<tr><td class="num">${ix+1}</td><td>${esc(it.desc)}</td><td class="r num">${fmtN(it.qty)}</td><td class="r num">${invMoney(it.price)}</td><td class="r num">${invMoney(it.qty*it.price)}</td></tr>`).join('');
 $('#inv-paper').innerHTML=`
 <div class="inv-band" style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap">
   <div><h2>${esc(d.biz)||'Your Business'}</h2><p style="margin:2px 0 0;color:#555">${esc(d.bizinfo)}</p></div>
   <div style="text-align:right"><h2 style="color:#0b7a4b">${isInv?'INVOICE':'RECEIPT'}</h2>
   <p style="margin:2px 0 0;color:#555">No: ${esc(d.no)}<br/>Date: ${esc(d.date)}${isInv&&d.dueDate?`<br/>Due: ${esc(d.dueDate)}`:''}</p></div>
 </div>
 ${d.client?`<h4>Bill To</h4><p style="margin:0">${esc(d.client)}</p>`:''}
 <table><thead><tr><th style="width:36px">#</th><th>Description</th><th class="r">Qty</th><th class="r">Unit Price</th><th class="r">Amount</th></tr></thead><tbody>${rows}
 <tr><td colspan="4" class="r">Subtotal</td><td class="r num">${invMoney(d.sub)}</td></tr>
 ${d.disc?`<tr><td colspan="4" class="r">Discount (${fmtN(d.discPct)}%)</td><td class="r num">−${invMoney(d.disc)}</td></tr>`:''}
 ${d.tax?`<tr><td colspan="4" class="r">VAT/Tax (${fmtN(d.taxPct)}%)</td><td class="r num">${invMoney(d.tax)}</td></tr>`:''}
 <tr class="tot"><td colspan="4" class="r">Total (${d.cur.code})</td><td class="r num">${invMoney(d.total)}</td></tr>
 ${d.paid?`<tr><td colspan="4" class="r">Paid</td><td class="r num">${invMoney(d.paid)}</td></tr>`:''}
 ${d.paid&&d.due>0?`<tr><td colspan="4" class="r"><b>Due</b></td><td class="r num"><b>${invMoney(d.due)}</b></td></tr>`:''}
 ${(!isInv||(d.paid>=d.total&&d.total>0))?`<tr><td colspan="5" style="text-align:center;padding-top:14px"><span class="stamp">✓ PAID IN FULL</span></td></tr>`:''}
 </tbody></table>
 <p style="margin-top:12px;color:#444">Amount in words: <b>${numWords(d.total)} ${d.cur.n} Only</b></p>
 ${d.notes?`<p style="color:#555">${esc(d.notes)}</p>`:''}
 <p style="color:#888;font-size:12px;margin-top:14px">Generated with ToolBari — All In One Tools</p>`;
 $('#inv-paper').classList.add('show');return d;
}
$('#inv-preview').addEventListener('click',invRender);
$('#inv-txt').addEventListener('click',()=>{
 const d=invRender();if(!d)return;
 const L=[(d.type==='invoice'?'INVOICE':'RECEIPT')+'  No: '+d.no,'Date: '+d.date,(d.biz||''),d.bizinfo||'','Bill To: '+(d.client||''),'-'.repeat(48)];
 d.items.forEach((it,ix)=>L.push(`${ix+1}. ${it.desc}  x${it.qty}  @ ${d.cur.code} ${fmtN(it.price)}  = ${fmtN(it.qty*it.price)}`));
 L.push('-'.repeat(48),`Subtotal: ${d.cur.code} ${fmtN(d.sub)}`);
 if(d.disc)L.push(`Discount: -${fmtN(d.disc)}`);if(d.tax)L.push(`VAT/Tax: ${fmtN(d.tax)}`);
 L.push(`TOTAL: ${d.cur.code} ${fmtN(d.total)}`,`(${numWords(d.total)} ${d.cur.n} Only)`);
 if(d.paid)L.push(`Paid: ${fmtN(d.paid)}`,`Due: ${fmtN(d.due)}`);
 if(d.notes)L.push('',d.notes);
 dl(URL.createObjectURL(new Blob([L.join('\n')],{type:'text/plain;charset=utf-8'})),(d.no||'invoice')+'.txt');
});
$('#inv-pdf').addEventListener('click',()=>{
 const d=invRender();if(!d)return;
 try{
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});let y=18;const X=15;
  doc.setDrawColor(11,122,75);doc.setLineWidth(1.1);doc.line(X,y-8,195,y-8);
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text(d.biz||'Your Business',X,y);
  doc.setTextColor(11,122,75);doc.text(d.type==='invoice'?'INVOICE':'RECEIPT',195,y,{align:'right'});doc.setTextColor(0);y+=6;
  doc.setFont('helvetica','normal');doc.setFontSize(10);
  if(d.bizinfo){doc.text(d.bizinfo,X,y);y+=5;}
  doc.text('No: '+d.no+'   Date: '+d.date+(d.type==='invoice'&&d.dueDate?'   Due: '+d.dueDate:''),X,y);y+=7;
  if(d.client){doc.setFont('helvetica','bold');doc.text('Bill To: ',X,y);doc.setFont('helvetica','normal');doc.text(d.client,X+16,y);y+=8;}
  doc.setFont('helvetica','bold');doc.text('#',X,y);doc.text('Description',X+8,y);doc.text('Qty',118,y);doc.text('Unit Price',140,y);doc.text('Amount',195,y,{align:'right'});y+=2;doc.setLineWidth(0.4);doc.line(X,y,195,y);y+=6;doc.setFont('helvetica','normal');
  d.items.forEach((it,ix)=>{doc.text(String(ix+1),X,y);doc.text(String(it.desc).slice(0,58),X+8,y);doc.text(String(it.qty),118,y);doc.text(fmtN(it.price),140,y);doc.text(fmtN(it.qty*it.price),195,y,{align:'right'});y+=6;});
  doc.line(X,y,195,y);y+=7;
  const tot=(label,val,bold)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.text(label,140,y);doc.text(fmtN(val),195,y,{align:'right'});y+=6;};
  tot('Subtotal',d.sub);if(d.disc)tot('Discount',-d.disc);if(d.tax)tot('VAT/Tax',d.tax);tot('TOTAL ('+d.cur.code+')',d.total,true);
  if(d.paid){tot('Paid',d.paid);if(d.due>0)tot('Due',d.due,true);}
  y+=3;doc.setFontSize(10);doc.text('Amount in words: '+numWords(d.total)+' '+d.cur.n+' Only',X,y);y+=6;
  if(d.notes){doc.text(doc.splitTextToSize(d.notes,180),X,y);y+=8;}
  doc.setFontSize(9);doc.setTextColor(130);doc.text('Generated with ToolBari — All In One Tools',X,290);
  doc.save((d.no||'invoice')+'.pdf');toast(T('PDF downloaded ✓'));
 }catch(e){toast(T('Could not create PDF — use Text Download'));}
});
invLive();

"use strict";
/* ===== Background Remover (solid-color chroma key) ===== */
let bgrImg=null,bgrTarget=[255,255,255];
function bgrProcess(){
 if(!bgrImg)return;
 const c=$('#bgr-canvas');const max=1600;let w=bgrImg.naturalWidth,h=bgrImg.naturalHeight;
 if(w>max){h=Math.round(h*max/w);w=max;}
 c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(bgrImg,0,0,w,h);
 const imgd=x.getImageData(0,0,w,h),d=imgd.data;
 const thr=(+$('#bgr-tol').value)/100*441,feather=thr*0.6+1;
 const [tr,tg,tb]=bgrTarget;
 for(let i=0;i<d.length;i+=4){
   const dr=d[i]-tr,dg=d[i+1]-tg,db=d[i+2]-tb;
   const dist=Math.sqrt(dr*dr+dg*dg+db*db);
   if(dist<thr)d[i+3]=0;
   else if(dist<thr+feather)d[i+3]=Math.min(d[i+3],Math.round(255*(dist-thr)/feather));
 }
 x.putImageData(imgd,0,0);
 $('#bgr-wrap').classList.add('show');
}
function bgrSetTarget(r,g,b){
 bgrTarget=[r,g,b];
 const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
 $('#bgr-color').style.background=hex;$('#bgr-hex').textContent=hex;bgrProcess();
}
$('#bgr-file').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;bgrImg=await loadImgFile(f);
 const c=document.createElement('canvas');const s=Math.min(1,200/Math.max(bgrImg.naturalWidth,bgrImg.naturalHeight));
 c.width=Math.max(2,Math.round(bgrImg.naturalWidth*s));c.height=Math.max(2,Math.round(bgrImg.naturalHeight*s));
 const x=c.getContext('2d');x.drawImage(bgrImg,0,0,c.width,c.height);
 const d=x.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;
 const pts=[[0,0],[W-1,0],[0,H-1],[W-1,H-1]];let r=0,g=0,b=0;
 pts.forEach(p=>{const i=(p[1]*W+p[0])*4;r+=d[i];g+=d[i+1];b+=d[i+2];});
 bgrSetTarget(Math.round(r/4),Math.round(g/4),Math.round(b/4));
});
$('#bgr-tol').addEventListener('input',()=>{$('#bgr-tolv').textContent=$('#bgr-tol').value;bgrProcess();});
$('#bgr-canvas').addEventListener('click',e=>{
 if(!bgrImg)return;const c=$('#bgr-canvas');const r=c.getBoundingClientRect();
 const px=Math.floor((e.clientX-r.left)*c.width/r.width),py=Math.floor((e.clientY-r.top)*c.height/r.height);
 const tmp=document.createElement('canvas');tmp.width=c.width;tmp.height=c.height;
 const tx=tmp.getContext('2d');tx.drawImage(bgrImg,0,0,c.width,c.height);
 const d=tx.getImageData(px,py,1,1).data;bgrSetTarget(d[0],d[1],d[2]);
});
$('#bgr-dl').addEventListener('click',()=>canvasDl($('#bgr-canvas'),'no-background.png'));
/* ===== Video Compressor ===== */
let vcURL=null,vcOutBlob=null,vcBusy=false;
$('#vc-file').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 if(vcURL)URL.revokeObjectURL(vcURL);
 vcURL=URL.createObjectURL(f);
 const v=$('#vc-video');v.src=vcURL;
 v.onloadedmetadata=()=>{
  $('#vc-info').innerHTML=Tf("<div class=\"kv\"><span>Original file</span><b>{0} MB</b></div><div class=\"kv\"><span>Resolution</span><b>{1}×{2}</b></div><div class=\"kv\"><span>Duration</span><b>{3}:{4}</b></div>",(f.size/1048576).toFixed(2),v.videoWidth,v.videoHeight,Math.floor(v.duration/60),String(Math.floor(v.duration%60)).padStart(2,'0'));
  $('#vc-prev-wrap').classList.add('show');$('#vc-go').disabled=false;
 };
});
$('#vc-go').addEventListener('click',async()=>{
 const v=$('#vc-video');if(!v.src||vcBusy)return;
 if(typeof MediaRecorder==='undefined'){$('#vc-status').textContent='This browser does not support MediaRecorder — use Chrome/Edge.';return;}
 vcBusy=true;$('#vc-go').disabled=true;$('#vc-wrap').classList.remove('show');
 const maxH=+$('#vc-res').value;let w=v.videoWidth,h=v.videoHeight;
 if(maxH&&h>maxH){w=Math.round(w*maxH/h/2)*2;h=maxH;}
 const cnv=document.createElement('canvas');cnv.width=w;cnv.height=h;
 const ctx=cnv.getContext('2d');
 const stream=cnv.captureStream(30);
 let actx=null;
 try{
   actx=new (window.AudioContext||window.webkitAudioContext)();
   if(!v._vcSrc){v._vcSrc=actx.createMediaElementSource(v);}
   const dest=actx.createMediaStreamDestination();
   v._vcSrc.connect(dest);v._vcSrc.connect(actx.destination);
   const at=dest.stream.getAudioTracks()[0];if(at)stream.addTrack(at);
 }catch(e){$('#vc-status').textContent='Processing without audio (browser could not capture audio)…';}
 const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
 const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:+$('#vc-br').value,audioBitsPerSecond:128000});
 const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 let raf=null;
 const draw=()=>{ctx.drawImage(v,0,0,w,h);$('#vc-status').textContent='Compressing… '+Math.floor(v.currentTime)+'s / '+Math.floor(v.duration||0)+'s';raf=requestAnimationFrame(draw);};
 rec.onstop=()=>{
   cancelAnimationFrame(raf);vcBusy=false;$('#vc-go').disabled=false;
   vcOutBlob=new Blob(chunks,{type:'video/webm'});
   $('#vc-out').src=URL.createObjectURL(vcOutBlob);
   $('#vc-outinfo').innerHTML=Tf("<div class=\"kv\"><span>Compressed file</span><b>{0} MB · {1}×{2} · WebM</b></div>",(vcOutBlob.size/1048576).toFixed(2),w,h);
   $('#vc-wrap').classList.add('show');
   $('#vc-status').textContent='Done ✓';
   if(actx)actx.close().catch(()=>{});
 };
 v.onended=()=>{if(rec.state==='recording')rec.stop();};
 try{
   v.currentTime=0;await v.play();rec.start(250);draw();
 }catch(e){$('#vc-status').textContent='Video could not be played — please select the file again.';vcBusy=false;$('#vc-go').disabled=false;}
});
$('#vc-dl').addEventListener('click',()=>{if(vcOutBlob)dl(URL.createObjectURL(vcOutBlob),'compressed-video.webm');});
/* ===== Audio Converter ===== */
let acFile=null,acBuffer=null;
$('#ac-file').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;acFile=f;acBuffer=null;
 $('#ac-audio').src=URL.createObjectURL(f);$('#ac-prev-wrap').classList.add('show');
 $('#ac-info').innerHTML=Tf("<div class=\"kv\"><span>File</span><b>{0}</b></div><div class=\"kv\"><span>Size</span><b>{1} KB</b></div>",esc(f.name),(f.size/1024).toFixed(0));
 $('#ac-go').disabled=false;$('#ac-status').textContent='';
 $('#ac-res').classList.remove('show');
});
function wavEncode(buffer){
 const ch=Math.min(2,buffer.numberOfChannels),sr=buffer.sampleRate,len=buffer.length*ch*2+44;
 const out=new ArrayBuffer(len),v=new DataView(out);
 const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 ws(0,'RIFF');v.setUint32(4,len-8,true);ws(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);
 v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);
 ws(36,'data');v.setUint32(40,len-44,true);
 const chans=[];for(let c=0;c<ch;c++)chans.push(buffer.getChannelData(c));
 let off=44;
 for(let i=0;i<buffer.length;i++)for(let c=0;c<ch;c++){
   let s=Math.max(-1,Math.min(1,chans[c][i]));v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;
 }
 return new Blob([out],{type:'audio/wav'});
}
async function acDecode(){
 if(acBuffer)return acBuffer;
 const ab=await acFile.arrayBuffer();
 const ctx=new (window.AudioContext||window.webkitAudioContext)();
 acBuffer=await ctx.decodeAudioData(ab);ctx.close().catch(()=>{});
 return acBuffer;
}
$('#ac-go').addEventListener('click',async()=>{
 if(!acFile)return;const fmt=$('#ac-fmt').value;const btn=$('#ac-go');btn.disabled=true;
 try{
   const buffer=await acDecode();
   $('#ac-info').innerHTML+=Tf("<div class=\"kv\"><span>Duration</span><b>{0} seconds</b></div><div class=\"kv\"><span>Channels / sample rate</span><b>{1}ch · {2} Hz</b></div>",buffer.duration.toFixed(1),buffer.numberOfChannels,buffer.sampleRate);
   if(fmt==='wav'){
     $('#ac-status').textContent='Creating WAV…';
     const blob=wavEncode(buffer);
     $('#ac-res').innerHTML=Tf("<p style=\"margin:0 0 8px\"><b>Created ✓</b> — {0} MB WAV File</p>",(blob.size/1048576).toFixed(2));
     const a=document.createElement('a');a.className='btn';a.textContent='⬇ Download WAV';a.href=URL.createObjectURL(blob);a.download='converted.wav';$('#ac-res').appendChild(a);
     $('#ac-res').classList.add('show');$('#ac-status').textContent='';
   }else{
     $('#ac-status').textContent='Creating WebM — audio is playing in real time ('+Math.ceil(buffer.duration)+'s)…';
     const ctx=new (window.AudioContext||window.webkitAudioContext)();
     const src=ctx.createBufferSource();src.buffer=buffer;
     const dest=ctx.createMediaStreamDestination();src.connect(dest);
     const rec=new MediaRecorder(dest.stream,{mimeType:'audio/webm'});
     const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
     rec.onstop=()=>{ctx.close().catch(()=>{});
       const blob=new Blob(chunks,{type:'audio/webm'});
       $('#ac-res').innerHTML=Tf("<p style=\"margin:0 0 8px\"><b>Created ✓</b> — {0} KB WebM File</p>",(blob.size/1024).toFixed(0));
       const a=document.createElement('a');a.className='btn';a.textContent='⬇ Download WebM';a.href=URL.createObjectURL(blob);a.download='converted.webm';$('#ac-res').appendChild(a);
       $('#ac-res').classList.add('show');$('#ac-status').textContent='';btn.disabled=false;};
     src.onended=()=>{if(rec.state==='recording')rec.stop();};
     rec.start(250);src.start();
     return;
   }
 }catch(e){$('#ac-status').textContent='File could not be read — try another audio/video file.';}
 btn.disabled=false;
});
/* ===== JSON Formatter ===== */
function jfParse(){
 const s=$('#jf-in').value.trim();
 if(!s){showErr('#jf-err','Enter JSON data first.');return null;}
 try{const o=JSON.parse(s);showErr('#jf-err','');return o;}
 catch(e){showErr('#jf-err','Invalid JSON: '+e.message);$('#jf-status').classList.remove('show');return null;}
}
function jfOk(msg){const b=$('#jf-status');b.textContent=msg;b.classList.add('show');}
$('#jf-format').addEventListener('click',()=>{const o=jfParse();if(o===null)return;$('#jf-out').value=JSON.stringify(o,null,2);jfOk('✓ Valid JSON — formatted');});
$('#jf-min').addEventListener('click',()=>{const o=jfParse();if(o===null)return;$('#jf-out').value=JSON.stringify(o);jfOk('✓ Valid JSON — minified');});
$('#jf-validate').addEventListener('click',()=>{const o=jfParse();if(o===null)return;jfOk('✓ Fully valid JSON — no errors');});
$('#jf-sample').addEventListener('click',()=>{$('#jf-in').value='{"name":"Rahim Uddin","city":"Dhaka","skills":["Excel","Word"],"active":true}';showErr('#jf-err','');});
$('#jf-copy').addEventListener('click',()=>{if($('#jf-out').value)copyText($('#jf-out').value,'Copied ✓');});
/* ===== Code Formatter ===== */
function cssFmt(s){
 s=s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').trim();
 let out='',depth=0;
 for(const ch of s){
   if(ch==='{'){out+=' {\n';depth++;out+='  '.repeat(depth);}
   else if(ch==='}'){depth=Math.max(0,depth-1);out=out.replace(/\s+$/,'')+'\n'+'  '.repeat(depth)+'}\n'+'  '.repeat(depth);}
   else if(ch===';'){out+=';\n'+'  '.repeat(depth);}
   else out+=ch;
 }
 return out.trim();
}
function cssMin(s){return s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>~+])\s*/g,'$1').replace(/;}/g,'}').trim();}
function htmlFmt(s){
 const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
 const toks=s.replace(/>\s+</g,'><').split(/(<[^>]+>)/g).filter(t=>t.trim());
 let depth=0;const lines=[];
 for(const t of toks){
   if(t.startsWith('</')){depth=Math.max(0,depth-1);lines.push('  '.repeat(depth)+t);}
   else if(t.startsWith('<')){
     lines.push('  '.repeat(depth)+t);
     const m=t.match(/^<([a-zA-Z0-9]+)/);
     if(m&&!voids.has(m[1].toLowerCase())&&!t.endsWith('/>')&&!t.startsWith('<!'))depth++;
   }
   else lines.push('  '.repeat(depth)+t.trim());
 }
 return lines.join('\n');
}
function jsFmt(s){
 let out='',depth=0,i=0,lineStart=true;const ind=()=>'  '.repeat(depth);
 const pushIndent=()=>{if(lineStart){out+=ind();lineStart=false;}};
 while(i<s.length){
   const ch=s[i];
   if(ch==='"'||ch==="'"||ch==='`'){let j=i+1;while(j<s.length&&s[j]!==ch){if(s[j]==='\\')j++;j++;}pushIndent();out+=s.slice(i,Math.min(j+1,s.length));i=j+1;continue;}
   if(ch==='/'&&s[i+1]==='/'){let j=s.indexOf('\n',i);if(j<0)j=s.length;pushIndent();out+=s.slice(i,j);i=j;continue;}
   if(ch==='/'&&s[i+1]==='*'){let j=s.indexOf('*/',i);j=j<0?s.length:j+2;pushIndent();out+=s.slice(i,j);i=j;continue;}
   if(ch==='{'){out+=' {\n';depth++;lineStart=true;i++;continue;}
   if(ch==='}'){depth=Math.max(0,depth-1);out=out.replace(/[ \t]+$/,'');if(!out.endsWith('\n'))out+='\n';out+=ind()+'}';i++;
     if(s[i]===';'){out+=';';i++;}
     if(s[i]!==','&&s[i]!==')'&&s[i]!==']'){out+='\n';lineStart=true;}continue;}
   if(ch===';'){out+=';\n';lineStart=true;i++;continue;}
   if(ch==='\n'||ch==='\r'){i++;continue;}
   if(lineStart&&(ch===' '||ch==='\t')){i++;continue;}
   pushIndent();out+=ch;i++;
 }
 return out.trim();
}
function compactCode(s,lang){
 if(lang==='css')return cssMin(s);
 return s.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').map(l=>l.trim()).filter(Boolean).join(lang==='html'?'':'\n');
}
$('#cf-format').addEventListener('click',()=>{
 const s=$('#cf-in').value;if(!s.trim()){showErr('#cf-err','Enter code first.');return;}showErr('#cf-err','');
 const lang=$('#cf-lang').value;
 $('#cf-out').value=lang==='css'?cssFmt(s):lang==='html'?htmlFmt(s):jsFmt(s);
 toast(T('Formatted ✓'));
});
$('#cf-min').addEventListener('click',()=>{
 const s=$('#cf-in').value;if(!s.trim()){showErr('#cf-err','Enter code first.');return;}showErr('#cf-err','');
 $('#cf-out').value=compactCode(s,$('#cf-lang').value);toast(T('Minified ✓'));
});
$('#cf-copy').addEventListener('click',()=>{if($('#cf-out').value)copyText($('#cf-out').value,'Copied ✓');});
/* ===== URL Encoder ===== */
function ueDo(fn){
 const ta=$('#ue-in');showErr('#ue-err','');
 try{ta.value=fn(ta.value);toast(T('Done ✓'));}
 catch(e){showErr('#ue-err','Could not decode — this is not valid encoded text.');}
}
$('#ue-enc').addEventListener('click',()=>ueDo(s=>encodeURIComponent(s)));
$('#ue-enfull').addEventListener('click',()=>ueDo(s=>encodeURI(s)));
$('#ue-dec').addEventListener('click',()=>ueDo(s=>decodeURIComponent(s)));
$('#ue-copy').addEventListener('click',()=>copyText($('#ue-in').value,'Copied ✓'));
/* ===== DNS Checker ===== */
const DNS_TYPES={1:'A',2:'NS',5:'CNAME',6:'SOA',15:'MX',16:'TXT',28:'AAAA'};
$('#dns-go').addEventListener('click',async()=>{
 const name=$('#dns-name').value.trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
 const box=$('#dns-res');
 if(!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(name)){$('#dns-status').textContent='Enter a valid domain — e.g. example.com';return;}
 $('#dns-status').textContent='Fetching DNS records…';box.classList.remove('show');
 try{
   const r=await fetch('https://dns.google/resolve?name='+encodeURIComponent(name)+'&type='+encodeURIComponent($('#dns-type').value));
   const j=await r.json();
   if(j.Status===3){$('#dns-status').textContent='This domain does not exist (NXDOMAIN).';return;}
   if(!j.Answer||!j.Answer.length){$('#dns-status').textContent='No record of this type was found.';return;}
   $('#dns-status').textContent='';
   box.innerHTML='<table class="tbl"><thead><tr><th>Name</th><th>Type</th><th>TTL</th><th>Data</th></tr></thead><tbody>'+
     j.Answer.map(a=>`<tr><td class="mono">${esc(a.name)}</td><td>${DNS_TYPES[a.type]||a.type}</td><td>${a.TTL}</td><td class="mono" style="word-break:break-all">${esc(a.data)}</td></tr>`).join('')+'</tbody></table>';
   box.classList.add('show');
 }catch(e){$('#dns-status').textContent='Could not connect — check your internet and try again.';}
});
$('#dns-web').addEventListener('click',async()=>{
 const name=$('#dns-name').value.trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
 if(!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(name)){$('#dns-status').textContent='Enter a valid domain — e.g. example.com';return;}
 $('#dns-status').textContent='Checking website…';
 const t0=performance.now();
 try{
   await fetch('https://'+name+'/',{mode:'no-cors',cache:'no-store'});
   const ms=Math.round(performance.now()-t0);
   $('#dns-status').textContent='✓ Website is responding (online) — approximate response time: '+toBn(ms)+' ms';
 }catch(e){$('#dns-status').textContent='✗ No response from website — the site may be down or the domain may be wrong.';}
});
/* ===== Subtitle Editor ===== */
function t2ms(t){
 const m=t.trim().match(/(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{3})/);if(!m)return 0;
 return ((+m[1]||0)*3600+(+m[2])*60+(+m[3]))*1000+(+m[4]);
}
function ms2t(ms,comma){
 ms=Math.max(0,Math.round(ms));
 const h=Math.floor(ms/3600000),mi=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),m3=ms%1000;
 return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')+':'+String(s).padStart(2,'0')+(comma?',':'.')+String(m3).padStart(3,'0');
}
function sbParse(text){
 const blocks=text.replace(/\r\n/g,'\n').split(/\n\s*\n/);const cues=[];
 for(const b of blocks){
   const lines=b.split('\n').filter(l=>l.trim()!==''||true);
   const ti=lines.findIndex(l=>l.includes('-->'));
   if(ti<0)continue;
   const mm=lines[ti].match(/(\S+)\s*-->\s*(\S+)/);if(!mm)continue;
   const txt=lines.slice(ti+1).join('\n').trim();
   cues.push({start:t2ms(mm[1]),end:t2ms(mm[2]),text:txt});
 }
 return cues;
}
function sbRender(cues,fmt){
 if(fmt==='vtt')return 'WEBVTT\n\n'+cues.map(c=>ms2t(c.start,false)+' --> '+ms2t(c.end,false)+'\n'+c.text).join('\n\n')+'\n';
 return cues.map((c,i)=>(i+1)+'\n'+ms2t(c.start,true)+' --> '+ms2t(c.end,true)+'\n'+c.text).join('\n\n')+'\n';
}
function sbFmtDetect(){
 const t=$('#sb-in').value;
 $('#sb-fmt').textContent='Format: '+(t.includes('WEBVTT')?'WebVTT (VTT)':(/-->/.test(t)?'SRT':'—'));
}
$('#sb-in').addEventListener('input',sbFmtDetect);
$('#sb-file').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 f.text().then(t=>{$('#sb-in').value=t;sbFmtDetect();toast(T('File loaded ✓'));});
});
function sbOp(fn){
 const cues=sbParse($('#sb-in').value);
 if(!cues.length){showErr('#sb-err','No subtitle text found — enter valid SRT/VTT.');return;}
 showErr('#sb-err','');fn(cues);
}
$('#sb-shiftbtn').addEventListener('click',()=>sbOp(cues=>{
 const shift=Math.round((+$('#sb-shift').value||0)*1000);
 const fmt=$('#sb-in').value.includes('WEBVTT')?'vtt':'srt';
 cues.forEach(c=>{c.start+=shift;c.end+=shift;});
 $('#sb-in').value=sbRender(cues,fmt);sbFmtDetect();toast(T('Time shifted ✓'));
}));
$('#sb-tosrt').addEventListener('click',()=>sbOp(cues=>{$('#sb-in').value=sbRender(cues,'srt');sbFmtDetect();toast(T('Converted to SRT ✓'));}));
$('#sb-tovtt').addEventListener('click',()=>sbOp(cues=>{$('#sb-in').value=sbRender(cues,'vtt');sbFmtDetect();toast(T('Converted to VTT ✓'));}));
$('#sb-dl').addEventListener('click',()=>{
 const t=$('#sb-in').value;if(!t.trim()){toast(T('Enter subtitles first'));return;}
 const vtt=t.includes('WEBVTT');
 dl(URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'})),vtt?'subtitle.vtt':'subtitle.srt');
});
$('#sb-copy').addEventListener('click',()=>copyText($('#sb-in').value,'Copied ✓'));
/* ===== Grammar & Writing Tools ===== */
const MISSP={teh:'the',adress:'address',recieve:'receive',seperate:'separate',definately:'definitely',occured:'occurred',enviroment:'environment',goverment:'government',wich:'which',thier:'their',finaly:'finally',realy:'really',beleive:'believe',freind:'friend',tommorrow:'tomorrow',tomorow:'tomorrow',necesary:'necessary',existance:'existence',independant:'independent',langauge:'language',writting:'writing',comming:'coming',happend:'happened',knowlege:'knowledge',publich:'publish',grammer:'grammar',sentense:'sentence',paragraf:'paragraph',exelent:'excellent',immediatly:'immediately',noticable:'noticeable',prefered:'preferred',refering:'referring',untill:'until',withing:'within',youseful:'useful'};
function grAnalyze(){
 const t=$('#gr-in').value;const box=$('#gr-res');
 if(!t.trim()){toast(T('Enter text first'));return;}
 const issues=[];
 const words=t.trim().split(/\s+/).filter(Boolean).length;
 const sents=(t.match(/[^.!?.]+[.!?.]+/g)||[]).length||1;
 const dbl=(t.match(/ {2,}/g)||[]).length;
 if(dbl)issues.push(['warn',Tf("Extra spaces: {0} places have multiple consecutive spaces.",toBn(dbl))]);
 const sp=(t.match(/\s+[,.!?;:]/g)||[]).length;
 if(sp)issues.push(['warn',Tf("Space before punctuation: {0} places (no space before commas/full stops).",toBn(sp))]);
 const rep=[...t.matchAll(/\b([A-Za-z]+)\s+\1\b/gi)].map(m=>m[1].toLowerCase());
 const repU=[...new Set(rep)];
 if(repU.length)issues.push(['err',Tf("Same word twice in a row: {0}",repU.slice(0,6).join(', '))]);
 const found={};
 for(const w in MISSP){const re=new RegExp('\\b'+w+'\\b','gi');const mm=t.match(re);if(mm)found[w]=mm.length;}
 const fk=Object.keys(found);
 if(fk.length)issues.push(['err','Possible spelling mistakes: '+fk.slice(0,10).map(w=>`${w} → ${MISSP[w]}`).join(' · ')]);
 const lowStarts=(t.match(/(^|[.!?]\s+)[a-z]/gm)||[]).length;
 if(lowStarts)issues.push(['tip',Tf("Sentences starting with lowercase letters: {0} places — start sentences with capital letters.",toBn(lowStarts))]);
 const caps=(t.match(/\b[A-Z]{4,}\b/g)||[]).length;
 if(caps>2)issues.push(['tip',Tf("ALL CAPS words {0}— all-caps text is hard to read, avoid unless needed.",toBn(caps))]);
 const excl=(t.match(/!/g)||[]).length;
 if(excl>3)issues.push(['tip','Too many exclamation marks (!) — use fewer in professional writing.']);
 const avg=words/sents;
 if(avg>25)issues.push(['tip',Tf("Sentences are long (average {0} words/sentence) — short sentences are easier to read.",toBn(avg.toFixed(0)))]);
 let html=Tf("<div class=\"kv\"><span>Words</span><b>{0}</b></div><div class=\"kv\"><span>Sentences</span><b>{1}</b></div><div class=\"kv\"><span>Average sentence length</span><b>{2} Words</b></div>",toBn(words),toBn(sents),toBn(avg.toFixed(1)));
 if(issues.length)html+='<ul class="issue-list">'+issues.map(i=>`<li><span class="sev ${i[0]}">${i[0]==='err'?'Error':i[0]==='warn'?'Warning':'Tip'}</span>${i[1]}</li>`).join('')+'</ul>';
 else html+='<p style="margin:8px 0 0;color:var(--ok);font-weight:600">✓ No common mistakes found — excellent!</p>';
 box.innerHTML=html;box.classList.add('show');
}
$('#gr-check').addEventListener('click',grAnalyze);
$('#gr-fix').addEventListener('click',()=>{
 let t=$('#gr-in').value;if(!t.trim()){toast(T('Enter text first'));return;}
 t=t.replace(/ {2,}/g,' ');
 t=t.replace(/\s+([,.!?;:])/g,'$1');
 t=t.replace(/\b([A-Za-z]+)(\s+)\1\b/gi,'$1');
 for(const w in MISSP){t=t.replace(new RegExp('\\b'+w+'\\b','gi'),m=>m[0]===m[0].toUpperCase()?MISSP[w][0].toUpperCase()+MISSP[w].slice(1):MISSP[w]);}
 t=t.replace(/(^|[.!?]\s+)([a-z])/g,(m,p,c)=>p+c.toUpperCase());
 $('#gr-in').value=t;toast(T('Auto-fix done ✓'));grAnalyze();
});
$('#gr-sample').addEventListener('click',()=>{$('#gr-in').value='teh quick brown fox is  very fast . He recieve alot of praise for his writting , but his grammer is noticable weak . the the fox runs fast and fast .';});
$('#gr-copy').addEventListener('click',()=>copyText($('#gr-in').value,'Copied ✓'));

"use strict";
/* ===== Prayer Times (Aladhan API) ===== */
const PRAYERS=[['Fajr','Fajr'],['Sunrise','Sunrise'],['Dhuhr','Dhuhr'],['Asr','Asr'],['Maghrib','Maghrib'],['Isha','Isha']];
function pr12(t){
 const m=t.match(/(\d+):(\d+)/);if(!m)return t;
 let h=+m[1];const ap=h>=12?'PM':'AM';h=h%12||12;
 return h+':'+m[2]+' '+ap;
}
async function prLoad(){
 const [city,country]=$('#pr-city').value.split('|');
 const method=city==='Makkah'?4:1;
 $('#pr-note').textContent='Fetching times…';
 try{
   const r=await fetch('https://api.aladhan.com/v1/timingsByCity?city='+encodeURIComponent(city)+'&country='+encodeURIComponent(country)+'&method='+method+'&school=1');
   const j=await r.json();
   const t=j.data.timings,d=j.data.date;
   const now=new Date();let next=null,nextName='';
   for(const [k,bn] of PRAYERS){
     if(k==='Sunrise')continue;
     const [hh,mm]=t[k].split(':').map(Number);
     const dt=new Date();dt.setHours(hh,mm,0,0);
     if(dt>now){next=dt;nextName=bn;break;}
   }
   if(!next){const [hh,mm]=t.Fajr.split(':').map(Number);next=new Date();next.setDate(next.getDate()+1);next.setHours(hh,mm,0,0);nextName='Fajr (tomorrow)';}
   const diffMs=next-now,dh=Math.floor(diffMs/3600000),dm=Math.floor(diffMs%3600000/60000);
   const box=$('#pr-res');
   box.innerHTML=Tf("<p style=\"margin:0 0 8px\"><b>{0}</b> · Hijri: {1} {2} Hijri</p>",esc(d.readable),d.hijri.day,d.hijri.month.en,d.hijri.year)+
     PRAYERS.map(([k,bn])=>`<div class="kv"><span>${bn}</span><b>${pr12(t[k])}</b></div>`).join('')+
     Tf("<div class=\"kv\"><span>Sehri end (Imsak)</span><b>{0}</b></div>",pr12(t.Imsak))+
     Tf("<p style=\"margin:10px 0 0\">Next prayer time: <b class=\"big\" style=\"font-size:19px\">{0}</b> — {1} hours {2} minutes remaining</p>",nextName,toBn(dh),toBn(dm));
   box.classList.add('show');
   $('#pr-note').textContent='';
 }catch(e){$('#pr-note').textContent='Times could not be fetched — check your internet connection and try again.';}
}
$('#pr-go').addEventListener('click',prLoad);
$('#pr-city').addEventListener('change',prLoad);
prLoad();
/* ===== Weather (Open-Meteo) ===== */
const WMO={0:'Clear sky',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Snowfall',73:'Snowfall',75:'Heavy snowfall',77:'Snow grains',80:'Light showers',81:'Showers',82:'Violent showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Thunderstorm with hail',99:'Thunderstorm with hail'};
async function wxLoad(){
 const q=$('#wx-city').value.trim();showErr('#wx-err','');
 if(!q){showErr('#wx-err','Enter a city name.');return;}
 const box=$('#wx-res');box.innerHTML='<p style="margin:0;color:var(--ink2)">Fetching weather…</p>';box.classList.add('show');
 try{
   const g=await (await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=1&language=en&format=json')).json();
   if(!g.results||!g.results.length){showErr('#wx-err','No city found with this name — check the spelling (write in English).');box.classList.remove('show');return;}
   const p=g.results[0];
   const f=await (await fetch('https://api.open-meteo.com/v1/forecast?latitude='+p.latitude+'&longitude='+p.longitude+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5')).json();
   const c=f.current;
   const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
   box.innerHTML=Tf("<p style=\"margin:0 0 4px\"><b>{0}{1}, {2}</b></p>\n   <p style=\"margin:0 0 8px\">Now: <b class=\"big\">{3}°C</b> — {4}</p>\n   <div class=\"kv\"><span>Feels like</span><b>{5}°C</b></div>\n   <div class=\"kv\"><span>Humidity</span><b>{6}%</b></div>\n   <div class=\"kv\"><span>Wind speed</span><b>{7} km/h</b></div>\n   <h4 style=\"margin:14px 0 4px;font-size:15px\">Next 5 days</h4>",esc(p.name),p.admin1?', '+esc(p.admin1):'',esc(p.country||''),toBn(c.temperature_2m),WMO[c.weather_code]||'',toBn(c.apparent_temperature),toBn(c.relative_humidity_2m),toBn(c.wind_speed_10m))+
   f.daily.time.map((d,i)=>`<div class="kv"><span>${days[new Date(d+'T12:00').getDay()]} (${toBn(d.slice(8))}/${toBn(d.slice(5,7))})</span><b>${WMO[f.daily.weather_code[i]]||''} · ${toBn(Math.round(f.daily.temperature_2m_min[i]))}° – ${toBn(Math.round(f.daily.temperature_2m_max[i]))}°C</b></div>`).join('');
 }catch(e){showErr('#wx-err','Weather could not be fetched — try again.');box.classList.remove('show');}
}
$('#wx-go').addEventListener('click',wxLoad);
wxLoad();
/* ===== My IP & Device ===== */
function devInfo(){
 const ua=navigator.userAgent;let browser='Unknown';
 if(/Edg\//.test(ua))browser='Microsoft Edge';else if(/OPR\/|Opera/.test(ua))browser='Opera';
 else if(/Chrome\//.test(ua))browser='Google Chrome';else if(/Firefox\//.test(ua))browser='Mozilla Firefox';
 else if(/Safari\//.test(ua))browser='Apple Safari';
 let os='Unknown';
 if(/Windows NT/.test(ua))os='Windows';else if(/Android/.test(ua))os='Android';else if(/iPhone|iPad/.test(ua))os='iOS';
 else if(/Mac OS X/.test(ua))os='macOS';else if(/Linux/.test(ua))os='Linux';
 const conn=navigator.connection||{};
 const rows=[
  ['Browser',browser],['Operating System',os],
  ['Screen resolution',screen.width+' × '+screen.height+' px'],
  ['Browser window',window.innerWidth+' × '+window.innerHeight+' px'],
  ['Device pixel ratio',window.devicePixelRatio||1],
  ['Language',navigator.language],
  ['CPU cores',navigator.hardwareConcurrency||'—'],
  ['RAM (approx.)',navigator.deviceMemory?navigator.deviceMemory+' GB':'—'],
  ['Touch support','ontouchstart' in window?'Yes':'No'],
  ['Network type',conn.effectiveType?conn.effectiveType.toUpperCase():'—'],
  ['Cookies enabled?',navigator.cookieEnabled?'Yes':'No']
 ];
 $('#mydev-res').innerHTML=rows.map(r=>`<div class="kv"><span>${r[0]}</span><b>${esc(String(r[1]))}</b></div>`).join('');
}
async function ipLoad(){
 const box=$('#myip-res');
 box.innerHTML='<p style="margin:0;color:var(--ink2)">IP Fetching info…</p>';
 try{
   const j=await (await fetch('https://ipapi.co/json/')).json();
   if(!j.ip)throw new Error('no ip');
   box.innerHTML=Tf("<div class=\"kv\"><span>Your public IP</span><b class=\"big mono\" style=\"font-size:20px\">{0}</b></div>\n   <div class=\"kv\"><span>Approximate location</span><b>{1}, {2}, {3}</b></div>\n   <div class=\"kv\"><span>Internet provider (ISP)</span><b>{4}</b></div>\n   <div class=\"kv\"><span>IP version</span><b>{5}</b></div>",esc(j.ip),esc(j.city||'—'),esc(j.region||''),esc(j.country_name||''),esc(j.org||'—'),esc(j.version||'—'));
 }catch(e){
   try{const w=await (await fetch('https://ipwho.is/')).json();
     if(!w||!w.success||!w.ip)throw new Error('ipwho');
     box.innerHTML=Tf("<div class=\"kv\"><span>Your public IP</span><b class=\"big mono\" style=\"font-size:20px\">{0}</b></div>\n   <div class=\"kv\"><span>Approximate location</span><b>{1}, {2}, {3}</b></div>\n   <div class=\"kv\"><span>Internet provider (ISP)</span><b>{4}</b></div>\n   <div class=\"kv\"><span>IP version</span><b>{5}</b></div>\n   <p style=\"margin:8px 0 0\"><a class=\"btn sm alt\" target=\"_blank\" rel=\"noopener\" href=\"https://www.google.com/maps/search/{6},{7}\">📍 View on Map</a></p>",esc(w.ip),esc(w.city||'—'),esc(w.region||''),esc(w.country||''),esc((w.connection&&w.connection.isp)||'—'),esc(w.type||'—'),w.latitude,w.longitude);
   }catch(e3){
   try{const j2=await (await fetch('https://api.ipify.org?format=json')).json();
     box.innerHTML=Tf("<div class=\"kv\"><span>Your public IP</span><b class=\"big mono\" style=\"font-size:20px\">{0}</b></div><p style=\"margin:6px 0 0;color:var(--ink2);font-size:13.5px\">Detailed information is not available right now.</p>",esc(j2.ip));
   }catch(e2){box.innerHTML='<p style="margin:0;color:var(--danger);font-weight:600">Could not fetch IP info — check the internet connection.</p>';}
   }
 }
}
$('#myip-reload').addEventListener('click',()=>{ipLoad();devInfo();});
ipLoad();devInfo();
/* ===== Typing Speed Test ===== */
const TT_TEXTS={
 en:["The quick brown fox jumps over the lazy dog. Practice makes a person perfect, so keep typing every day and your speed will grow step by step.",
 "Success usually comes to those who are too busy to be looking for it. Work hard in silence, stay focused on your goal, and let your results make the noise.",
 "Bangladesh is a land of rivers and green fields. Its people are hardworking and kind, and every new morning brings a fresh chance to do something good."],

};
let ttTarget='',ttTimer=null,ttLeft=60,ttStarted=false,ttDone=false;
function ttRender(){
 const typed=$('#tt-in').value;
 const spans=ttTarget.split('').map((ch,i)=>{
   if(i<typed.length)return `<span class="${typed[i]===ch?'ok':'bad'}">${esc(ch)}</span>`;
   if(i===typed.length)return `<span class="cur">${esc(ch)}</span>`;
   return `<span>${esc(ch)}</span>`;
 }).join('');
 $('#tt-text').innerHTML=spans;
 let correct=0;for(let i=0;i<typed.length&&i<ttTarget.length;i++)if(typed[i]===ttTarget[i])correct++;
 const elapsed=(60-ttLeft)||0.001;
 const mins=elapsed/60;
 const wpm=ttStarted?Math.round((correct/5)/mins):0;
 const acc=typed.length?Math.round(correct/typed.length*100):100;
 $('#tt-wpm').textContent=ttDone?$('#tt-wpm').textContent:wpm;
 $('#tt-acc').textContent=acc+'%';
 return {correct,typed:typed.length,wpm,acc};
}
function ttFinish(){
 ttDone=true;clearInterval(ttTimer);$('#tt-in').disabled=true;
 const r=ttRender();
 $('#tt-wpm').textContent=r.wpm;
 const box=$('#tty-res');
 box.innerHTML=Tf("<p style=\"margin:0\">Time is up! Your result: <b class=\"big\">{0} WPM</b></p>\n <div class=\"kv\"><span>Accuracy</span><b>{1}%</b></div>\n <div class=\"kv\"><span>Correct characters</span><b>{2} / {3}</b></div>\n <p style=\"margin:8px 0 0;color:var(--ink2)\">{4}</p>",toBn(r.wpm),toBn(r.acc),toBn(r.correct),toBn(r.typed),r.wpm>=60?'Amazing speed! Equal to a professional typist.':r.wpm>=40?'Good speed — equal to an average typist. It will improve with regular practice.':r.wpm>=25?'Fair speed — practise 10 minutes every day, you will improve quickly.':'Good start! Practise with your fingers on the home row.');
 box.classList.add('show');
}
function ttReset(){
 clearInterval(ttTimer);ttLeft=60;ttStarted=false;ttDone=false;
 $('#tt-time').textContent='60s';
 $('#tt-in').disabled=false;$('#tt-in').value='';
 $('#tt-wpm').textContent='0';$('#tt-acc').textContent='100%';
 $('#tty-res').classList.remove('show');
 const arr=TT_TEXTS[$('#tt-lang').value];
 ttTarget=arr[Math.floor(Math.random()*arr.length)];
 ttRender();
}
$('#tt-in').addEventListener('input',()=>{
 if(ttDone)return;
 if(!ttStarted&&$('#tt-in').value.length){
   ttStarted=true;
   ttTimer=setInterval(()=>{ttLeft--;$('#tt-time').textContent=ttLeft+'s';ttRender();if(ttLeft<=0)ttFinish();},1000);
 }
 const r=ttRender();
 if($('#tt-in').value.length>=ttTarget.length){ttLeft=Math.max(ttLeft,1);ttFinish();}
});
$('#tt-restart').addEventListener('click',ttReset);
$('#tt-lang').addEventListener('change',ttReset);
ttReset();
/* ===== Password Strength ===== */
const PWS_COMMON=['password','123456','123456789','12345','qwerty','12345678','111111','123123','abc123','password1','iloveyou','admin','letmein','welcome','monkey','dragon','football','sunshine','master','shadow','superman','michael','ninja','mustang','charlie','bangladesh','dhaka','bangla','allah','muslim','faysal','1234567','1234','000000','654321','987654321'];
function crackTime(bits){
 const secs=Math.pow(2,bits)/1e10;
 if(secs<1)return 'Less than a second';
 if(secs<60)return Math.round(secs)+' seconds';
 if(secs<3600)return Math.round(secs/60)+' minutes';
 if(secs<86400)return Math.round(secs/3600)+' hours';
 if(secs<31536000)return Math.round(secs/86400)+' days';
 if(secs<31536000*100)return Math.round(secs/31536000)+' years';
 if(secs<31536000*1e6)return fmtN(secs/31536000,0)+' years';
 return 'Millions of years';
}
$('#pws-in').addEventListener('input',()=>{
 const p=$('#pws-in').value;
 const list=$('#pws-list');
 if(!p){$('#pws-score').textContent='—';$('#pws-bar').style.width='0';$('#pws-len').textContent='0 characters';$('#pws-ent').textContent='0 bits';$('#pws-crack').textContent='—';list.innerHTML='';return;}
 let pool=0;const tips=[];
 if(/[a-z]/.test(p))pool+=26;if(/[A-Z]/.test(p))pool+=26;if(/[0-9]/.test(p))pool+=10;if(/[^A-Za-z0-9]/.test(p))pool+=33;
 let bits=pool?p.length*Math.log2(pool):0;
 if(PWS_COMMON.includes(p.toLowerCase())){bits=Math.min(bits,8);tips.push(['err','This is a very common password — hackers try these first. Change it now.']);}
 if(p.length<8)tips.push(['err','Too short — use at least 12 characters.']);
 else if(p.length<12)tips.push(['warn','Length is okay — 12+ characters would be safer.']);
 else tips.push(['tip','Good length — long passwords are hard to crack.']);
 if(!/[A-Z]/.test(p))tips.push(['warn','Add uppercase letters (A-Z).']);
 if(!/[0-9]/.test(p))tips.push(['warn','Add numbers (0-9).']);
 if(!/[^A-Za-z0-9]/.test(p))tips.push(['warn','Add special characters (!@#$%).']);
 if(/(.)\1{2,}/.test(p)){tips.push(['warn','The same character appears more than three times in a row — these are easy to guess.']);bits*=0.85;}
 if(/0123|1234|2345|3456|4567|5678|6789|abcd|qwerty/i.test(p)){tips.push(['warn','Avoid sequential characters/numbers (1234, abcd, qwerty).']);bits*=0.85;}
 bits=Math.round(bits);
 let score,label,color;
 if(bits<28){score=0;label='Very weak';color='#c0392b';}
 else if(bits<45){score=1;label='Weak';color='#e67e22';}
 else if(bits<65){score=2;label='Medium';color='#e8a00c';}
 else if(bits<90){score=3;label='Strong';color='#27ae60';}
 else{score=4;label='Very strong';color='#0b7a4b';}
 const bar=$('#pws-bar');bar.style.width=((score+1)*20)+'%';bar.style.background=color;
 $('#pws-score').textContent=label;
 $('#pws-len').textContent=toBn(p.length)+' characters';
 $('#pws-ent').textContent=toBn(bits)+' bits';
 $('#pws-crack').textContent=crackTime(bits);
 list.innerHTML=tips.map(t=>`<li><span class="sev ${t[0]}">${t[0]==='err'?'Risk':t[0]==='warn'?'Tip':'Good'}</span>${t[1]}</li>`).join('');
});
/* ===== Internet Speed Test ===== */
$('#st-go').addEventListener('click',async()=>{
 const btn=$('#st-go');btn.disabled=true;
 const status=$('#st-status');
 $('#st-ping').textContent='—';$('#st-down').textContent='—';$('#st-data').textContent='—';
 try{
   status.textContent='Measuring ping…';
   const pings=[];
   for(let i=0;i<3;i++){
     const t0=performance.now();
     await fetch('https://speed.cloudflare.com/__down?bytes=0&r='+Math.random(),{cache:'no-store'});
     pings.push(performance.now()-t0);
   }
   const ping=Math.round(pings.reduce((a,b)=>a+b,0)/pings.length);
   $('#st-ping').textContent=toBn(ping);
   status.textContent='Measuring download speed…';
   const t0=performance.now();
   const res=await fetch('https://speed.cloudflare.com/__down?bytes=25000000&r='+Math.random(),{cache:'no-store'});
   const reader=res.body.getReader();let received=0;
   while(true){
     const {done,value}=await reader.read();
     if(done)break;
     received+=value.length;
     const secs=(performance.now()-t0)/1000;
     if(secs>0.3)$('#st-down').textContent=fmtN(received*8/secs/1e6,1);
     $('#st-data').textContent=(received/1048576).toFixed(1)+' MB';
     if(secs>=12){reader.cancel();break;}
   }
   const secs=(performance.now()-t0)/1000;
   const mbps=received*8/secs/1e6;
   $('#st-down').textContent=fmtN(mbps,1);
   $('#st-data').textContent=(received/1048576).toFixed(1)+' MB';
   status.textContent='Test complete ✓ — Download '+fmtN(mbps,1)+' Mbps · Ping '+toBn(ping)+' ms (approx.)';
 }catch(e){status.textContent='Test could not be run — check connection and try again.';}
 btn.disabled=false;
});
/* ===== Business Directory ===== */
function bdOpen(q){
 const area=$('#bd-area').value.trim();
 const query=q+' '+(area?area+' ':'')+'Bangladesh';
 window.open('https://www.google.com/maps/search/'+encodeURIComponent(query),'_blank');
}
$('#bd-go').addEventListener('click',()=>bdOpen($('#bd-cat').value));
$$('[data-mapq]').forEach(b=>b.addEventListener('click',()=>bdOpen(b.dataset.mapq)));

/* ===== Mobile hamburger menu ===== */
(function(){
 const b=document.getElementById('menuBtn'), m=document.getElementById('mobileMenu');
 if(!b||!m) return;
 function cats(){
   const el=document.getElementById('mCatPills'); if(!el) return;
   el.innerHTML=CATS.map(c=>'<a class="fpill" href="#/cat/'+c.id+'">'+esc(LANG==='en'?c.en:c.name)+'</a>').join('');
 }
 function close(){m.classList.remove('open'); b.textContent='☰'; b.setAttribute('aria-expanded','false');}
 cats();
 b.addEventListener('click',()=>{
   const o=m.classList.toggle('open');
   b.textContent=o?'✕':'☰'; b.setAttribute('aria-expanded',o?'true':'false');
 });
 m.addEventListener('click',e=>{if(e.target.closest('a')) close();});
 document.addEventListener('click',e=>{if(m.classList.contains('open') && !e.target.closest('header.top')) close();});
 const lb=document.getElementById('langBn'), le=document.getElementById('langEn');
 if(lb) lb.addEventListener('click',()=>setTimeout(cats,0));
 if(le) le.addEventListener('click',()=>setTimeout(cats,0));
})();


/* ===== RSS fetch with proxy fallbacks ===== */
async function fetchRSS(url){
 const proxies=[
   u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u),
   u=>'https://api.cors.lol/?url='+encodeURIComponent(u),
   u=>'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(u)
 ];
 for(const px of proxies){
   try{
     const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),7000);
     const r=await fetch(px(url),{signal:ctl.signal}); clearTimeout(to);
     if(r.ok){const tx=await r.text(); if(tx&&tx.indexOf('<item')!==-1) return tx;}
   }catch(e){}
 }
 return null;
}
/* ===== Live ticker: breaking news + market prices ===== */
(function(){
 const track=document.getElementById('tkTrack'); const track2=document.getElementById('tkTrack2'); if(!track) return;
 function renderTo(tr, items){
   const html=items.map(x=>'<span class="tk-item">'+(x[2]?'<b>'+x[2]+'</b> ':'')+'<a href="'+x[1]+'"'+(x[3]?' target="_blank" rel="noopener"':'')+'>'+x[0]+'</a></span>').join('<span class="tk-sep">•</span>');
   tr.innerHTML=html+'<span class="tk-sep">•</span>'+html;
   tr.style.animationDuration=Math.max(35, items.length*7)+'s';
 }
 renderTo(track, LANG==='en'?[
   ['Read the latest breaking news','#/tool/breaking-news',''],
   ["See today's prayer times",'#/tool/prayer-times',''],
   ['Now 241 free tools on ToolBari — all in one place','#/','']
 ]:[
   ['Read the latest breaking news','#/tool/breaking-news',''],
   ['View prayer times for today','#/tool/prayer-times',''],
   ['ToolBari now has 429 free tools — all in one place','#/','']
 ]);
 if(track2) renderTo(track2, LANG==='en'?[
   ['Live Dhaka Stock Exchange prices & the DSEX index','#/tool/stock-exchange',''],
   ["Today's dollar, pound & euro rates",'#/tool/currency-converter',''],
   ['Live world market prices, incl. Bitcoin','#/tool/stock-exchange','']
 ]:[
   ['Dhaka Stock Exchange live prices and DSEX index','#/tool/stock-exchange',''],
   ['Dollar, pound and euro rates for today','#/tool/currency-converter',''],
   ['Live world market prices including Bitcoin','#/tool/stock-exchange','']
 ]);
 (async()=>{
   const items=[], mkt=[];
   try{
     const txt=await fetchRSS(LANG==='en'?'https://feeds.bbci.co.uk/news/world/rss.xml':'https://www.prothomalo.com/feed');
     if(txt){
       const xml=new DOMParser().parseFromString(txt,'text/xml');
       Array.from(xml.querySelectorAll('item')).slice(0,8).forEach(it=>{
         const ti=it.querySelector('title'), li=it.querySelector('link');
         if(ti&&li&&ti.textContent) items.push([esc(ti.textContent.trim()), li.textContent.trim(), '📰', 1]);
       });
     }
   }catch(e){}
   if(!items.length){
     try{
       const hj=await (await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=6')).json();
       (hj.hits||[]).filter(h=>h.title).forEach(h=>items.push([esc(h.title), h.url||('https://news.ycombinator.com/item?id='+h.objectID), '📰', 1]));
     }catch(e){}
   }
   try{
     const j=await (await fetch('https://open.er-api.com/v6/latest/USD')).json();
     if(j&&j.rates&&j.rates.BDT){
       mkt.push([LANG==='en'?'Dollar = ৳'+(+j.rates.BDT).toFixed(2):'Dollar = ৳'+toBn((+j.rates.BDT).toFixed(2)), '#/tool/stock-exchange', '💵']);
       if(j.rates.GBP) mkt.push([LANG==='en'?'Pound = ৳'+(+j.rates.BDT/+j.rates.GBP).toFixed(2):'Pound = ৳'+toBn((+j.rates.BDT/+j.rates.GBP).toFixed(2)), '#/tool/currency-converter', '💷']);
       if(j.rates.EUR) mkt.push([LANG==='en'?'Euro = ৳'+(+j.rates.BDT/+j.rates.EUR).toFixed(2):'Euro = ৳'+toBn((+j.rates.BDT/+j.rates.EUR).toFixed(2)), '#/tool/currency-converter', '💶']);
     }
   }catch(e){}
   try{
     const c=await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')).json();
     if(c&&c.bitcoin&&c.bitcoin.usd) mkt.push(['Bitcoin = $'+(LANG==='en'?Number(c.bitcoin.usd).toLocaleString('en-US'):toBn(Number(c.bitcoin.usd).toLocaleString('en-US'))), '#/tool/stock-exchange', '₿']);
   }catch(e){}
   try{
     const sr=await fetch('https://scanner.tradingview.com/global/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({symbols:{tickers:['DSEBD:DSEX','DSEBD:GP','DSEBD:SQURPHARMA','DSEBD:ROBI','DSEBD:BRACBANK','DSEBD:WALTONHIL'],query:{types:[]}},columns:['close','change']})});
     const sj=await sr.json();
     const names=LANG==='en'?{'DSEBD:DSEX':'DSEX Index','DSEBD:GP':'Grameenphone','DSEBD:SQURPHARMA':'Square Pharma','DSEBD:ROBI':'Robi Axiata','DSEBD:BRACBANK':'Brac Bank','DSEBD:WALTONHIL':'Walton Hi-Tech'}:{'DSEBD:DSEX':'DSEX index','DSEBD:GP':'Grameenphone','DSEBD:SQURPHARMA':'Square Pharma','DSEBD:ROBI':'Robi Axiata','DSEBD:BRACBANK':'Brac Bank','DSEBD:WALTONHIL':'Walton Hi-Tech'};
     (sj.data||[]).forEach(function(row){
       if(!row.d||row.d[0]==null) return;
       const nm=names[row.s]||row.s.split(':')[1];
       let txt=nm+' = '+(row.s==='DSEBD:DSEX'?'':'৳')+(LANG==='en'?fmt(row.d[0]):bn(fmt(row.d[0])));
       if(row.d[1]!=null) txt+=' ('+(LANG==='en'?Math.abs(row.d[1]).toFixed(2):bn(Math.abs(row.d[1]).toFixed(2)))+'%'+(row.d[1]>=0?' ▲':' ▼')+')';
       mkt.push([txt, '#/tool/stock-exchange', '🇧🇩', 0]);
     });
   }catch(e){}
   if(items.length>=2) renderTo(track, items); if(track2&&mkt.length>=2) renderTo(track2, mkt);
 })();
})();
/* ===== UPGRADE tools ===== */
/* --- Snake game --- */
(function(){
 const cv=document.getElementById('snk-cv'); if(!cv) return;
 const ctx=cv.getContext('2d'); const N=20,S=15;
 let snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}], dir={x:1,y:0}, nextDir=null, food={x:15,y:10}, score=0, timer=null, alive=false, paused=false;
 const pauseBtn=document.getElementById('snk-pause');
 function placeFood(){food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}
 function draw(){
   ctx.fillStyle='#0e1511'; ctx.fillRect(0,0,300,300);
   ctx.fillStyle='#e8a00c'; ctx.fillRect(food.x*S+1,food.y*S+1,S-2,S-2);
   ctx.fillStyle='#2fbb77'; snake.forEach(p=>ctx.fillRect(p.x*S+1,p.y*S+1,S-2,S-2));
 }
 function stop(){if(timer)clearInterval(timer); timer=null; alive=false; paused=false; if(pauseBtn)pauseBtn.textContent='⏸ Pause';}
 function step(){
   if(nextDir){dir=nextDir; nextDir=null;}
   const h={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
   if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(p=>p.x===h.x&&p.y===h.y)){stop(); toast('Game over! Score: '+score); return;}
   snake.unshift(h);
   if(h.x===food.x&&h.y===food.y){score+=10; document.getElementById('snk-score').textContent=score; placeFood();}
   else snake.pop();
   draw();
 }
 function setDir(nd){if(!alive||paused) return; const base=nextDir||dir; if(!(nd.x===-base.x && nd.y===-base.y)) nextDir=nd;}
 document.getElementById('snk-start').addEventListener('click',()=>{
   stop(); snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; nextDir=null; score=0;
   document.getElementById('snk-score').textContent='0'; placeFood(); draw(); alive=true; timer=setInterval(step,140);
 });
 if(pauseBtn) pauseBtn.addEventListener('click',()=>{
   if(!alive) return;
   if(paused){paused=false; timer=setInterval(step,140); pauseBtn.textContent='⏸ Pause';}
   else{paused=true; if(timer)clearInterval(timer); timer=null; pauseBtn.textContent='▶ Resume';}
 });
 document.querySelectorAll('[data-sd]').forEach(b=>b.addEventListener('pointerdown',e=>{
   e.preventDefault();
   const d=b.dataset.sd;
   setDir(d==='up'?{x:0,y:-1}:d==='down'?{x:0,y:1}:d==='left'?{x:-1,y:0}:{x:1,y:0});
 }));
 let tx=0,ty=0;
 cv.addEventListener('touchstart',e=>{const t=e.changedTouches[0]; tx=t.clientX; ty=t.clientY;},{passive:true});
 cv.addEventListener('touchend',e=>{
   const t=e.changedTouches[0], dx=t.clientX-tx, dy=t.clientY-ty;
   if(Math.max(Math.abs(dx),Math.abs(dy))<24) return;
   setDir(Math.abs(dx)>Math.abs(dy)?{x:dx>0?1:-1,y:0}:{x:0,y:dy>0?1:-1});
 },{passive:true});
 document.addEventListener('keydown',e=>{
   if(!alive || !document.querySelector('#view-games.active')) return;
   const k=e.key.toLowerCase();
   const nd=(k==='arrowup'||k==='w')?{x:0,y:-1}:(k==='arrowdown'||k==='s')?{x:0,y:1}:(k==='arrowleft'||k==='a')?{x:-1,y:0}:(k==='arrowright'||k==='d')?{x:1,y:0}:null;
   if(nd){setDir(nd); e.preventDefault();}
 });
 draw();
})();
/* --- Tic-Tac-Toe --- */
(function(){
 const cells=Array.from(document.querySelectorAll('.ttt-cell')); if(!cells.length) return;
 const status=document.getElementById('ttt-status');
 let board=Array(9).fill(''), over=false;
 const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 function winner(b){for(const L of LINES){if(b[L[0]]&&b[L[0]]===b[L[1]]&&b[L[1]]===b[L[2]])return b[L[0]];} return b.every(x=>x)?'draw':null;}
 function render(){cells.forEach((c,i)=>{c.textContent=board[i]; c.disabled=!!board[i]||over;});}
 function computer(){
   if(over) return;
   const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);
   if(!empty.length) return;
   let pick=null;
   for(const mark of ['O','X']){
     for(const i of empty){const b2=board.slice(); b2[i]=mark; if(winner(b2)===mark){pick=i; break;}}
     if(pick!==null) break;
   }
   if(pick===null) pick=(board[4]===''?4:empty[Math.floor(Math.random()*empty.length)]);
   board[pick]='O';
   const w=winner(board);
   if(w==='O'){over=true; status.textContent='Computer won! Try again.';}
   else if(w==='draw'){over=true; status.textContent='It is a draw!';}
   render();
 }
 cells.forEach(c=>c.addEventListener('click',()=>{
   const i=+c.dataset.i;
   if(over||board[i]) return;
   board[i]='X';
   const w=winner(board);
   if(w==='X'){over=true; status.textContent='Congratulations! You won 🎉'; render(); return;}
   if(w==='draw'){over=true; status.textContent='It is a draw!'; render(); return;}
   status.textContent='Computer is thinking…';
   render();
   setTimeout(computer,300);
 }));
 document.getElementById('ttt-reset').addEventListener('click',()=>{
   board=Array(9).fill(''); over=false; status.textContent='Your turn — place X in any square.'; render();
 });
 render();
})();
/* --- Memory match --- */
(function(){
 const grid=document.getElementById('mem-grid'); if(!grid) return;
 const EM=['🍎','🚗','🐶','⚽','🎸','🍕'];
 let first=null, lock=false, moves=0, hit=0;
 function upd(){document.getElementById('mem-moves').textContent=moves; document.getElementById('mem-hit').textContent=hit;}
 function build(){
   first=null; lock=false; moves=0; hit=0; upd(); grid.innerHTML='';
   const cards=EM.concat(EM).sort(()=>Math.random()-0.5);
   cards.forEach(e=>{
     const b=document.createElement('button'); b.className='mem-card'; b.textContent='❓'; b.dataset.e=e;
     b.addEventListener('click',()=>{
       if(lock||b.disabled||b===first||b.textContent!=='❓') return;
       b.textContent=e;
       if(!first){first=b; return;}
       moves++;
       if(first.dataset.e===e){hit++; first.disabled=true; b.disabled=true; first=null; upd(); if(hit===6) toast(T('Congratulations! All pairs matched 🎉'));}
       else{lock=true; const f=first; first=null; setTimeout(()=>{f.textContent='❓'; b.textContent='❓'; lock=false;},700); upd();}
     });
     grid.appendChild(b);
   });
 }
 document.getElementById('mem-reset').addEventListener('click',build);
 build();
})();
/* --- Video to MP3 (own file, in-browser) --- */
(function(){
 const fileEl=document.getElementById('v2m-file'); if(!fileEl) return;
 let file=null;
 fileEl.addEventListener('change',e=>{
   file=e.target.files[0]||null;
   document.getElementById('v2m-info').textContent=file?('File: '+file.name+' ('+(file.size/1048576).toFixed(1)+' MB)'):'';
 });
 document.getElementById('v2m-go').addEventListener('click',async()=>{
   const st=document.getElementById('v2m-status');
   if(!file){toast(T('Select a video/audio file first')); return;}
   if(typeof lamejs==='undefined'||!lamejs.Mp3Encoder){st.textContent='MP3 engine did not load — refresh the page and try again.'; return;}
   const btn=document.getElementById('v2m-go'); btn.disabled=true; st.textContent='Reading file…';
   try{
     const ab=await file.arrayBuffer();
     const AC=window.AudioContext||window.webkitAudioContext; const ac=new AC();
     const buf=await ac.decodeAudioData(ab);
     const br=+document.getElementById('v2m-br').value;
     const chs=Math.min(2,buf.numberOfChannels);
     const enc=new lamejs.Mp3Encoder(chs,buf.sampleRate,br);
     const L=buf.getChannelData(0), R=chs>1?buf.getChannelData(1):null;
     const to16=f=>{const o=new Int16Array(f.length); for(let i=0;i<f.length;i++){const s=Math.max(-1,Math.min(1,f[i])); o[i]=s<0?s*0x8000:s*0x7FFF;} return o;};
     const parts=[]; const CH=1152;
     for(let i=0;i<L.length;i+=CH){
       const d=R?enc.encodeBuffer(to16(L.subarray(i,i+CH)),to16(R.subarray(i,i+CH))):enc.encodeBuffer(to16(L.subarray(i,i+CH)));
       if(d.length) parts.push(new Uint8Array(d));
       if(i%(CH*300)===0){st.textContent='Creating MP3… '+Math.round(i/L.length*100)+'%'; await new Promise(r=>setTimeout(r,0));}
     }
     const end=enc.flush(); if(end.length) parts.push(new Uint8Array(end));
     try{ac.close();}catch(e){}
     const blob=new Blob(parts,{type:'audio/mpeg'}); const url=URL.createObjectURL(blob);
     const au=document.getElementById('v2m-audio'); au.src=url; au.style.display='block';
     const dlEl=document.getElementById('v2m-dl'); dlEl.href=url; dlEl.download=(file.name.replace(/\.[^.]+$/,'')||'audio')+'.mp3'; dlEl.style.display='inline-flex';
     st.textContent='Created ✓ ('+(blob.size/1048576).toFixed(2)+' MB MP3)';
   }catch(e){
     st.textContent='Sorry — audio could not be read from this file. Try an MP4/WebM/MP3 file.';
   }
   btn.disabled=false;
 });
})();
/* --- Photo Editor --- */
(function(){
 const fileEl=document.getElementById('pe-file'); if(!fileEl) return;
 let img=null, rot=0, flip=1;
 const ids=['pe-br','pe-ct','pe-sat','pe-gray','pe-sep','pe-blur'];
 function draw(){
   if(!img) return;
   const cv=document.getElementById('pe-cv'); const r=((rot%360)+360)%360; const swap=(r===90||r===270);
   cv.width=swap?img.height:img.width; cv.height=swap?img.width:img.height;
   document.getElementById('pe-wrap').classList.add('show');
   const ctx=cv.getContext('2d');
   ctx.save(); ctx.translate(cv.width/2,cv.height/2); ctx.rotate(r*Math.PI/180); ctx.scale(flip,1);
   ctx.filter='brightness('+document.getElementById('pe-br').value+'%) contrast('+document.getElementById('pe-ct').value+'%) saturate('+document.getElementById('pe-sat').value+'%) grayscale('+document.getElementById('pe-gray').value+'%) sepia('+document.getElementById('pe-sep').value+'%) blur('+document.getElementById('pe-blur').value+'px)';
   ctx.drawImage(img,-img.width/2,-img.height/2); ctx.restore();
 }
 function syncLabels(){ids.forEach(id=>{const v=document.getElementById(id+'-v'); if(v) v.textContent=document.getElementById(id).value;});}
 fileEl.addEventListener('change',async e=>{
   const f=e.target.files[0]; if(!f) return;
   img=await loadImgFile(f); rot=0; flip=1; draw();
 });
 ids.forEach(id=>document.getElementById(id).addEventListener('input',()=>{syncLabels(); draw();}));
 const PRESETS={normal:[100,100,100,0,0,0],vintage:[105,95,80,0,60,0],bw:[100,110,100,100,0,0],warm:[112,105,115,0,15,0],vivid:[108,112,165,0,0,0]};
 document.querySelectorAll('[data-pef]').forEach(b=>b.addEventListener('click',()=>{
   const p=PRESETS[b.dataset.pef]; if(!p) return;
   ids.forEach((id,i)=>{document.getElementById(id).value=p[i];}); syncLabels(); draw();
 }));
 document.getElementById('pe-rot').addEventListener('click',()=>{rot=(rot+90)%360; draw();});
 document.getElementById('pe-flip').addEventListener('click',()=>{flip*=-1; draw();});
 document.getElementById('pe-reset').addEventListener('click',()=>{
   ids.forEach((id,i)=>{document.getElementById(id).value=[100,100,100,0,0,0][i];}); rot=0; flip=1; syncLabels(); draw();
 });
 document.getElementById('pe-dl').addEventListener('click',()=>{
   if(!img){toast(T('Select an image first')); return;}
   dl(document.getElementById('pe-cv').toDataURL('image/jpeg',0.92),'edited-photo.jpg');
 });
 syncLabels();
})();
/* --- Breaking News --- */
(function(){
 const btn=document.getElementById('nw-go'); if(!btn) return;
 const status=document.getElementById('nw-status'), list=document.getElementById('nw-list');
 const RSS={pa:'https://www.prothomalo.com/feed', kk:'https://www.kalerkantho.com/rss.xml', ds:'https://www.thedailystar.net/top-news/rss.xml'};
 let loaded=false;
 function strip(html){const d=document.createElement('div'); d.innerHTML=html||''; return (d.textContent||'').trim();}
 function card(title,link,date,desc){
   return '<div class="news-card"><h4><a href="'+link+'" target="_blank" rel="noopener">'+title+'</a></h4>'+(date?'<p class="nt">'+date+'</p>':'')+(desc?'<p>'+desc+'</p>':'')+'</div>';
 }
 async function load(){
   const src=document.getElementById('nw-src').value;
   status.textContent='Fetching news…'; list.innerHTML='';
   try{
     if(src==='hn'){
       const j=await (await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=12')).json();
       list.innerHTML=j.hits.filter(h=>h.title).map(h=>card(esc(h.title), h.url||('https://news.ycombinator.com/item?id='+h.objectID), new Date(h.created_at).toLocaleString('en-GB'), (h.points||0)+' points · '+(h.num_comments||0)+' comments')).join('');
     }else{
       const txt=await fetchRSS(RSS[src]); if(!txt) throw new Error('feed');
       const xml=new DOMParser().parseFromString(txt,'text/xml');
       const items=Array.from(xml.querySelectorAll('item')).slice(0,12);
       if(!items.length) throw new Error('empty');
       list.innerHTML=items.map(it=>{
         const g=s=>{const n=it.querySelector(s); return n?n.textContent:'';};
         const d=strip(g('description')).slice(0,160);
         let date=''; try{date=new Date(g('pubDate')).toLocaleString('en-GB');}catch(e){}
         return card(esc(g('title')), g('link'), date, esc(d));
       }).join('');
     }
     status.textContent='Latest news ✓'; loaded=true;
   }catch(e){
     status.textContent='News could not be fetched from this source — choose another source and try again.';
   }
 }
 btn.addEventListener('click',load);
 document.getElementById('nw-src').addEventListener('change',()=>{loaded=false;});
 document.addEventListener('hashchange',()=>{if(location.hash.indexOf('#/tool/breaking-news')===0 && !loaded) load();});
 if(location.hash.indexOf('#/tool/breaking-news')===0) load();
})();
/* --- Voice Recorder --- */
(function(){
 const startB=document.getElementById('vr-start'); if(!startB) return;
 const stopB=document.getElementById('vr-stop'), msg=document.getElementById('vr-msg'),
       timeEl=document.getElementById('vr-time'), dot=document.getElementById('vr-dot');
 let rec=null, chunks=[], t0=0, tiv=null;
 function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
 startB.addEventListener('click',async()=>{
   if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){msg.textContent='This browser does not support recording — use Chrome.'; return;}
   try{
     const stream=await navigator.mediaDevices.getUserMedia({audio:true});
     chunks=[]; rec=new MediaRecorder(stream);
     rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
     rec.onstop=()=>{
       stream.getTracks().forEach(t=>t.stop());
       const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'}); const url=URL.createObjectURL(blob);
       const au=document.getElementById('vr-audio'); au.src=url; au.style.display='block';
       const a=document.getElementById('vr-dl'); a.href=url; a.download='voice-recording.webm'; a.style.display='inline-flex';
       msg.textContent='Recording created ✓ Listen below or download.';
     };
     rec.start(); t0=Date.now();
     dot.style.display='inline'; startB.disabled=true; stopB.disabled=false; msg.textContent='Recording…';
     tiv=setInterval(()=>{timeEl.textContent=fmt(Math.floor((Date.now()-t0)/1000));},500);
   }catch(e){msg.textContent='Microphone permission was not granted — allow it in browser settings.';}
 });
 stopB.addEventListener('click',()=>{
   if(rec&&rec.state!=='inactive') rec.stop();
   clearInterval(tiv); dot.style.display='none'; startB.disabled=false; stopB.disabled=true;
 });
})();
/* --- Screen Recorder --- */
(function(){
 const startB=document.getElementById('sr-start'); if(!startB) return;
 const stopB=document.getElementById('sr-stop'), msg=document.getElementById('sr-msg');
 let rec=null, chunks=[], stream=null;
 startB.addEventListener('click',async()=>{
   if(!navigator.mediaDevices||typeof navigator.mediaDevices.getDisplayMedia!=='function'){msg.textContent='This device/browser does not support screen recording — try desktop Chrome or Edge.'; return;}
   try{
     stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
   }catch(e){msg.textContent='Screen selection was cancelled or permission was not granted.'; return;}
   chunks=[]; rec=new MediaRecorder(stream,{mimeType:'video/webm'});
   rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
   rec.onstop=()=>{
     stream.getTracks().forEach(t=>t.stop());
     const blob=new Blob(chunks,{type:'video/webm'}); const url=URL.createObjectURL(blob);
     const v=document.getElementById('sr-video'); v.src=url; v.style.display='block';
     const a=document.getElementById('sr-dl'); a.href=url; a.download='screen-recording.webm'; a.style.display='inline-flex';
     msg.textContent='Recording created ✓ Watch below or download.';
     startB.disabled=false; stopB.disabled=true;
   };
   stream.getVideoTracks()[0].addEventListener('ended',()=>{if(rec&&rec.state!=='inactive')rec.stop();});
   rec.start(1000); msg.textContent='Recording… To stop, press "Stop" or press Stop sharing in the browser.';
   startB.disabled=true; stopB.disabled=false;
 });
 stopB.addEventListener('click',()=>{if(rec&&rec.state!=='inactive')rec.stop();});
})();
/* --- Any-IP location lookup --- */
(function(){
 const btn=document.getElementById('iplook-go'); if(!btn) return;
 btn.addEventListener('click',async()=>{
   const ip=document.getElementById('iplook-ip').value.trim();
   const box=document.getElementById('iplook-res');
   if(!/^[0-9a-fA-F:.]+$/.test(ip)){box.innerHTML='<p style="margin:0;color:var(--danger);font-weight:600">Please enter a valid IP address (e.g. 8.8.8.8).</p>'; box.classList.add('show'); return;}
   box.innerHTML='<p style="margin:0;color:var(--ink2)">Fetching info…</p>'; box.classList.add('show');
   try{
     const w=await (await fetch('https://ipwho.is/'+encodeURIComponent(ip))).json();
     if(!w||!w.success) throw new Error('bad');
     box.innerHTML='<div class="kv"><span>IP</span><b class="mono">'+esc(w.ip)+'</b></div>'
       +'<div class="kv"><span>Location</span><b>'+esc(w.city||'—')+', '+esc(w.region||'')+', '+esc(w.country||'')+'</b></div>'
       +'<div class="kv"><span>ISP</span><b>'+esc((w.connection&&w.connection.isp)||'—')+'</b></div>'
       +'<p style="margin:8px 0 0"><a class="btn sm alt" target="_blank" rel="noopener" href="https://www.google.com/maps/search/'+w.latitude+','+w.longitude+'">📍 View on Map</a></p>';
   }catch(e){
     box.innerHTML='<p style="margin:0;color:var(--danger);font-weight:600">Information for this IP was not found — verify the address and try again.</p>';
   }
 });
})();


