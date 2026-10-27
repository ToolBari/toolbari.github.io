
"use strict";
/* ===== Image Compressor ===== */
let icImg=null,icBlob=null;
async function icRender(){
 if(!icImg)return;
 const q=(+$('#ic-q').value)/100;const maxW=+$('#ic-w').value||Infinity;
 let w=icImg.naturalWidth,h=icImg.naturalHeight;
 if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
 const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(icImg,0,0,w,h);
 icBlob=await new Promise(r=>c.toBlob(r,'image/jpeg',q));
 $('#ic-img').src=URL.createObjectURL(icBlob);
 const orig=icImg._size||0;
 $('#ic-info').innerHTML=Tf("<div class=\"kv\"><span>আগের সাইজ</span><b>{0}</b></div><div class=\"kv\"><span>নতুন সাইজ</span><b>{1} KB</b></div><div class=\"kv\"><span>কমেছে</span><b>{2}</b></div><div class=\"kv\"><span>মাপ</span><b>{3}×{4}px</b></div>",orig?(orig/1024).toFixed(1)+' KB':'—',(icBlob.size/1024).toFixed(1),orig?Math.max(0,(100-icBlob.size/orig*100)).toFixed(0)+'%':'—',w,h);
 $('#ic-wrap').classList.add('show');
}
$('#ic-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;icImg=await loadImgFile(f);icImg._size=f.size;icRender();});
$('#ic-q').addEventListener('input',()=>{$('#ic-qv').textContent=$('#ic-q').value;icRender();});
$('#ic-w').addEventListener('change',icRender);
$('#ic-dl').addEventListener('click',()=>{if(icBlob)dl(URL.createObjectURL(icBlob),'compressed.jpg');});
/* ===== Converter + Resizer ===== */
let cvImg=null;
$('#cv-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;cvImg=await loadImgFile(f);cvImg._name=f.name;$('#cv-wrap').classList.add('show');$('#cv-img').src=cvImg.src;$('#cv-info').classList.remove('show');});
$('#cv-go').addEventListener('click',()=>{
 if(!cvImg)return;const fmt=$('#cv-fmt').value;
 let w=+$('#cv-w').value||cvImg.naturalWidth;let h=+$('#cv-h').value||Math.round(cvImg.naturalHeight*w/cvImg.naturalWidth);
 if($('#cv-w').value&&$('#cv-h').value){/* both given */}
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 if(fmt==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,w,h);}
 x.drawImage(cvImg,0,0,w,h);
 const ext=fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';
 c.toBlob(b=>{dl(URL.createObjectURL(b),'converted.'+ext);
  const info=$('#cv-info');info.innerHTML=Tf("কনভার্ট হয়েছে: <b>{0}×{1}px</b> · সাইজ <b>{2} KB</b> · ফরম্যাট <b>{3}</b>",w,h,(b.size/1024).toFixed(1),ext.toUpperCase());info.classList.add('show');},fmt,0.92);
});
/* ===== Passport Photo ===== */
let ppImg=null;
function ppDraw(){
 if(!ppImg)return;
 const one=$('#pp-one'),sheet=$('#pp-sheet');const W=472,H=590;
 const zoom=(+$('#pp-zoom').value)/100,px=(+$('#pp-x').value)/100,py=(+$('#pp-y').value)/100;
 const iw=ppImg.naturalWidth,ih=ppImg.naturalHeight;
 let cw=iw,ch=cw*H/W;if(ch>ih){ch=ih;cw=ch*W/H;}
 cw/=zoom;ch/=zoom;
 const sx=(iw-cw)*px,sy=(ih-ch)*py;
 const x=one.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(ppImg,sx,sy,cw,ch,0,0,W,H);
 const bg=$('#pp-bg').value;
 if(bg!=='keep'&&ppCutImg){x.fillStyle=bg;x.fillRect(0,0,W,H);x.drawImage(ppCutImg,sx,sy,cw,ch,0,0,W,H);}
 if(bg!=='keep'&&!ppCutImg){
   const id=x.getImageData(0,0,W,H),d=id.data;
   const corners=[[0,0],[W-1,0],[0,H-1],[W-1,H-1]].map(([cx,cy])=>{const i=(cy*W+cx)*4;return [d[i],d[i+1],d[i+2]];});
   const avg=[0,1,2].map(k=>corners.reduce((s,c)=>s+c[k],0)/4);
   const tgt=[parseInt(bg.slice(1,3),16),parseInt(bg.slice(3,5),16),parseInt(bg.slice(5,7),16)];
   const tol=42;
   for(let i=0;i<d.length;i+=4){const dr=d[i]-avg[0],dg=d[i+1]-avg[1],db=d[i+2]-avg[2];
     if(dr*dr+dg*dg+db*db<tol*tol*3){d[i]=tgt[0];d[i+1]=tgt[1];d[i+2]=tgt[2];}}
   x.putImageData(id,0,0);
 }
 sheet.width=1760;sheet.height=1180;const s=sheet.getContext('2d');
 s.fillStyle='#fff';s.fillRect(0,0,sheet.width,sheet.height);
 const cw2=400,ch2=500,gx=(1760-cw2*4)/5,gy=(1180-ch2*2)/3;
 s.strokeStyle='#ccc';
 for(let r=0;r<2;r++)for(let c=0;c<4;c++){const dx=gx+c*(cw2+gx),dy=gy+r*(ch2+gy);s.drawImage(one,dx,dy,cw2,ch2);s.strokeRect(dx,dy,cw2,ch2);}
 $('#pp-wrap').classList.add('show');
}
$('#pp-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;ppImg=await loadImgFile(f);ppDraw();});
/* Passport AI background (MediaPipe Selfie Segmentation, lazy; falls back to corner method) */
let ppCutImg=null,ppSegLoading=false;
const ppStatus=document.createElement('p');ppStatus.className='mono';ppStatus.style.cssText='color:var(--ink2);font-size:13px;margin:6px 0';
(function(){const w=$('#pp-wrap');if(w&&w.parentNode)w.parentNode.insertBefore(ppStatus,w);})();
async function ppSegment(){
 if(ppSegLoading||!ppImg)return;ppSegLoading=true;ppCutImg=null;
 try{
  if(!window.SelfieSegmentation){
   await new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';sc.onload=res;sc.onerror=rej;document.head.appendChild(sc);});
  }
  ppStatus.textContent='Creating AI background…';
  const seg=new SelfieSegmentation({locateFile:f=>'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/'+f});
  seg.setOptions({modelSelection:1});
  seg.onResults(res=>{
   try{
    const iw=ppImg.naturalWidth,ih=ppImg.naturalHeight;
    const cut=document.createElement('canvas');cut.width=iw;cut.height=ih;
    const cx=cut.getContext('2d');
    cx.filter='blur(2px)';cx.drawImage(res.segmentationMask,0,0,iw,ih);cx.filter='none';
    cx.globalCompositeOperation='source-in';cx.drawImage(ppImg,0,0,iw,ih);
    ppCutImg=cut;ppStatus.textContent='AI background created ✓ — change the colour for a vivid background.';ppDraw();
   }catch(e){ppStatus.textContent='';}
  });
  await seg.send({image:ppImg});
 }catch(e){ppStatus.textContent='';ppCutImg=null;}
 ppSegLoading=false;
}
$('#pp-file').addEventListener('change',()=>{ppCutImg=null;ppSegment();});
['pp-zoom','pp-y','pp-x','pp-bg'].forEach(id=>$('#'+id).addEventListener('input',ppDraw));
$('#pp-dl1').addEventListener('click',()=>canvasDl($('#pp-one'),'passport-photo.png'));
$('#pp-dl2').addEventListener('click',()=>canvasDl($('#pp-sheet'),'passport-sheet-8copies.png'));
/* ===== Watermark ===== */
let wmImg=null;
function wmDraw(){
 if(!wmImg)return;const c=$('#wm-canvas');c.width=wmImg.naturalWidth;c.height=wmImg.naturalHeight;
 const x=c.getContext('2d');x.drawImage(wmImg,0,0);
 const text=$('#wm-text').value||'©';const size=+$('#wm-size').value;const pos=$('#wm-pos').value;
 x.font='700 '+size+'px "Hind Siliguri",sans-serif';x.globalAlpha=(+$('#wm-op').value)/100;
 x.fillStyle=$('#wm-color').value;x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=Math.max(2,size/8);
 const tw=x.measureText(text).width,m=size*0.7;
 const put=(dx,dy,align)=>{x.textAlign=align;x.fillText(text,dx,dy);};
 if(pos==='tile'){x.textAlign='center';for(let yy=size;yy<c.height+size;yy+=size*3.2)for(let xx=0;xx<c.width+size*2;xx+=tw+size*2.4)put(xx,yy,'left');}
 else if(pos==='center'){x.textBaseline='middle';put(c.width/2,c.height/2,'center');}
 else{x.textBaseline='alphabetic';
  if(pos==='br')put(c.width-m,c.height-m,'right');else if(pos==='bl')put(m,c.height-m,'left');
  else if(pos==='tr')put(c.width-m,m+size*0.6,'right');else put(m,m+size*0.6,'left');}
 x.globalAlpha=1;$('#wm-wrap').classList.add('show');
}
$('#wm-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;wmImg=await loadImgFile(f);wmDraw();});
['wm-text','wm-pos','wm-color'].forEach(id=>$('#'+id).addEventListener('input',wmDraw));
$('#wm-op').addEventListener('input',()=>{$('#wm-ov').textContent=$('#wm-op').value;wmDraw();});
$('#wm-size').addEventListener('input',()=>{$('#wm-sv').textContent=$('#wm-size').value;wmDraw();});
$('#wm-dl').addEventListener('click',()=>canvasDl($('#wm-canvas'),'watermarked.png'));
/* ===== Watermark Remover ===== */
let wrImg=null,wrOrig=null,wrMode='gem',wrPaint=false;
const wrMaskC=document.createElement('canvas');
function wrSetup(){
 const W=wrImg.naturalWidth,H=wrImg.naturalHeight,c=$('#wr-canvas'),x=c.getContext('2d');
 c.width=W;c.height=H;x.drawImage(wrImg,0,0);wrOrig=x.getImageData(0,0,W,H);
 wrMaskC.width=W;wrMaskC.height=H;wrMaskC.getContext('2d').clearRect(0,0,W,H);
 const o=$('#wr-mask');o.width=W;o.height=H;wrDrawMask();
 $('#wr-wrap').classList.add('show');$('#wr-status').textContent='';
}
function wrDrawMask(){const o=$('#wr-mask'),x=o.getContext('2d');x.clearRect(0,0,o.width,o.height);x.drawImage(wrMaskC,0,0);}
function wrSetMode(m){
 wrMode=m;
 $('#wr-gem-panel').style.display=m==='gem'?'':'none';
 $('#wr-brush-panel').style.display=m==='brush'?'':'none';
 $('#wr-tab-gem').className='btn sm'+(m==='gem'?'':' alt');
 $('#wr-tab-brush').className='btn sm'+(m==='brush'?'':' alt');
 $('#wr-mask').style.pointerEvents=m==='brush'?'auto':'none';
}
$('#wr-tab-gem').addEventListener('click',()=>wrSetMode('gem'));
$('#wr-tab-brush').addEventListener('click',()=>wrSetMode('brush'));
$('#wr-gsize').addEventListener('input',()=>$('#wr-gv').textContent=$('#wr-gsize').value);
$('#wr-bsize').addEventListener('input',()=>$('#wr-bv').textContent=$('#wr-bsize').value);
$('#wr-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;wrImg=await loadImgFile(f);wrSetup();});
function wrPaintAt(e){
 const o=$('#wr-mask'),r=o.getBoundingClientRect();
 const cx=(e.touches?e.touches[0].clientX:e.clientX),cy=(e.touches?e.touches[0].clientY:e.clientY);
 const px=(cx-r.left)*o.width/r.width,py=(cy-r.top)*o.height/r.height;
 const rad=(+$('#wr-bsize').value)*o.width/r.width/2;
 const mx=wrMaskC.getContext('2d');mx.fillStyle='rgba(255,45,45,1)';
 mx.beginPath();mx.arc(px,py,rad,0,7);mx.fill();wrDrawMask();
}
$('#wr-mask').addEventListener('pointerdown',e=>{if(wrMode!=='brush')return;wrPaint=true;wrPaintAt(e);e.preventDefault();});
$('#wr-mask').addEventListener('pointermove',e=>{if(wrPaint&&wrMode==='brush')wrPaintAt(e);});
addEventListener('pointerup',()=>wrPaint=false);
$('#wr-clear').addEventListener('click',()=>{wrMaskC.getContext('2d').clearRect(0,0,wrMaskC.width,wrMaskC.height);wrDrawMask();});
$('#wr-reset').addEventListener('click',()=>{if(!wrOrig)return;$('#wr-canvas').getContext('2d').putImageData(wrOrig,0,0);wrMaskC.getContext('2d').clearRect(0,0,wrMaskC.width,wrMaskC.height);wrDrawMask();$('#wr-status').textContent='Original image restored.';});
function wrMarkGem(){
 const W=wrMaskC.width,H=wrMaskC.height,pct=+$('#wr-gsize').value,cor=$('#wr-corner').value;
 const sz=Math.round(W*pct/100);let x0=0,y0=0;
 if(cor==='br'){x0=W-sz;y0=H-sz;}else if(cor==='bl'){x0=0;y0=H-sz;}else if(cor==='tr'){x0=W-sz;y0=0;}
 const mx=wrMaskC.getContext('2d');mx.fillStyle='rgba(255,45,45,1)';mx.fillRect(x0,y0,sz,sz);wrDrawMask();
}
function wrInpaint(){
 const c=$('#wr-canvas'),x=c.getContext('2d'),W=c.width,H=c.height;
 const md=wrMaskC.getContext('2d').getImageData(0,0,W,H).data;
 let minx=W,miny=H,maxx=-1,maxy=-1;const mask=new Uint8Array(W*H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i;if(md[k*4+3]>10){mask[k]=1;if(i<minx)minx=i;if(i>maxx)maxx=i;if(j<miny)miny=j;if(j>maxy)maxy=j;}}
 if(maxx<0){$('#wr-status').textContent='Please mark the area to erase first.';return;}
 $('#wr-status').textContent='Working… একটু অপেক্ষা করুন।';
 setTimeout(()=>{
  minx=Math.max(0,minx-12);miny=Math.max(0,miny-12);maxx=Math.min(W-1,maxx+12);maxy=Math.min(H-1,maxy+12);
  const bw=maxx-minx+1,bh=maxy-miny+1;
  const img=x.getImageData(minx,miny,bw,bh),d=img.data;
  const m2=new Uint8Array(bw*bh);
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++)m2[j*bw+i]=mask[(miny+j)*W+(minx+i)];
  let sr=0,sg=0,sb=0,cnt=0;
  for(let k=0;k<bw*bh;k++){if(!m2[k]){sr+=d[k*4];sg+=d[k*4+1];sb+=d[k*4+2];cnt++;}}
  if(cnt){const ar=sr/cnt,ag=sg/cnt,ab=sb/cnt;for(let k=0;k<bw*bh;k++){if(m2[k]){d[k*4]=ar;d[k*4+1]=ag;d[k*4+2]=ab;}}}
  const iters=Math.min(600,Math.max(80,Math.round(Math.max(bw,bh)*1.4)));
  let cur=new Uint8ClampedArray(d),nxt=new Uint8ClampedArray(d);
  for(let t=0;t<iters;t++){
   for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){
    const k=j*bw+i;if(!m2[k])continue;const o=k*4;let r=0,g=0,b=0,n=0;
    if(i>0){r+=cur[o-4];g+=cur[o-3];b+=cur[o-2];n++;}
    if(i<bw-1){r+=cur[o+4];g+=cur[o+5];b+=cur[o+6];n++;}
    if(j>0){r+=cur[o-bw*4];g+=cur[o-bw*4+1];b+=cur[o-bw*4+2];n++;}
    if(j<bh-1){r+=cur[o+bw*4];g+=cur[o+bw*4+1];b+=cur[o+bw*4+2];n++;}
    if(n){nxt[o]=r/n;nxt[o+1]=g/n;nxt[o+2]=b/n;nxt[o+3]=255;}
   }
   const tmp=cur;cur=nxt;nxt=tmp;
  }
  img.data.set(cur);x.putImageData(img,minx,miny);
  wrMaskC.getContext('2d').clearRect(0,0,W,H);wrDrawMask();
  $('#wr-status').textContent='হয়ে গেছে ✓ এবার ডাউনলোড করুন। আরো জায়গা থাকলে আবার দাগ দিয়ে মুছুন।';
 },60);
}
$('#wr-gem-go').addEventListener('click',()=>{if(!wrImg){$('#wr-status').textContent='Please choose an image first.';return;}wrMarkGem();wrInpaint();});
$('#wr-brush-go').addEventListener('click',()=>{if(!wrImg){$('#wr-status').textContent='Please choose an image first.';return;}wrInpaint();});
$('#wr-dl').addEventListener('click',()=>canvasDl($('#wr-canvas'),'watermark-removed.png'));
wrSetMode('gem');
/* ===== Stylish Text ===== */
const ST_FONTS=[
 ['Bold',0x1D400,0x1D41A,0x1D7CE],['Italic',0x1D434,0x1D44E,null],['Bold Italic',0x1D468,0x1D482,null],
 ['Script',0x1D49C,0x1D4B6,null,{'B':'ℬ','E':'ℰ','F':'ℱ','H':'ℋ','I':'ℐ','L':'ℒ','M':'ℳ','R':'ℛ','e':'ℯ','g':'ℊ','o':'ℴ'}],
 ['Fraktur',0x1D504,0x1D51E,null,{'C':'ℭ','H':'ℌ','I':'ℑ','R':'ℜ','Z':'ℨ'}],
 ['Double Struck',0x1D538,0x1D552,0x1D7D8,{'C':'ℂ','H':'ℍ','N':'ℕ','P':'ℙ','Q':'ℚ','R':'ℝ','Z':'ℤ'}],
 ['Monospace',0x1D670,0x1D68A,0x1D7F6],['Sans',0x1D5A0,0x1D5BA,0x1D7E2],['Sans Bold',0x1D5D4,0x1D5EE,0x1D7EC]
];
const ST_SMALL={'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
function stConv(t,f){
 const[A,a,d,ex]=f;let out='';
 for(const ch of t){
  if(ex&&ex[ch]){out+=ex[ch];continue;}
  const c=ch.charCodeAt(0);
  if(c>=65&&c<=90)out+=String.fromCodePoint(A+c-65);
  else if(c>=97&&c<=122){if(f[0]==='Italic'&&ch==='h')out+='ℎ';else out+=String.fromCodePoint(a+c-97);}
  else if(c>=48&&c<=57&&d)out+=String.fromCodePoint(d+c-48);
  else out+=ch;
 }
 return out;
}
function stRender(){
 const t=$('#st-in').value.trim(),box=$('#st-out');box.innerHTML='';
 if(!t)return;
 const rows=ST_FONTS.map(f=>[f[0],stConv(t,f)]);
 rows.push(['Circled',Array.from(t).map(ch=>{const c=ch.charCodeAt(0);if(c>=65&&c<=90)return String.fromCodePoint(0x24B6+c-65);if(c>=97&&c<=122)return String.fromCodePoint(0x24D0+c-97);if(ch==='0')return '⓪';if(c>=49&&c<=57)return String.fromCodePoint(0x2460+c-49);return ch;}).join('')]);
 rows.push(['Small Caps',Array.from(t.toLowerCase()).map(ch=>ST_SMALL[ch]||ch).join('')]);
 rows.push(['Strikethrough',Array.from(t).map(ch=>ch+'̶').join('')]);
 rows.push(['Underline',Array.from(t).map(ch=>ch+'͟').join('')]);
 rows.forEach(([name,val])=>{
  const row=document.createElement('div');row.className='row';row.style.cssText='align-items:center;margin-top:8px';
  row.innerHTML='<div class="field" style="flex:1"><label></label><div class="in" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></div></div>';
  row.querySelector('label').textContent=name;row.querySelector('.in').textContent=val;
  const b=document.createElement('button');b.className='btn alt sm';b.textContent='Copy';b.style.marginTop='22px';
  b.addEventListener('click',()=>{navigator.clipboard&&navigator.clipboard.writeText(val);b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1500);});
  row.appendChild(b);box.appendChild(row);
 });
}
$('#st-in').addEventListener('input',stRender);
/* ===== Hashtag Generator ===== */
const HG_BANK={
 seller:['#onlineshopping','#onlineshop','#bdshop','#bangladeshshop','#f-commerce','#fcommerce','#cashondelivery','#orderonline','#shopnow','#newcollection','#offer','#discount','#sale','#qualityproduct','#trustedshop','#dhaka','#bangladesh'],
 youtube:['#youtube','#youtubeshorts','#video','#subscribe','#youtuber','#newvideo','#watchnow','#trending','#viralvideo','#contentcreator'],
 tiktok:['#tiktok','#fyp','#foryou','#foryoupage','#tiktokbangladesh','#viral','#trending','#tiktokviral','#bd','#bangladesh'],
 reels:['#reels','#instagramreels','#facebookreels','#shorts','#reelsvideo','#viralreels','#trendingreels','#explore','#creator'],
 food:['#food','#foodie','#foodlover','#recipe','#homemade','#yummy','#delicious','#foodblogger','#bangladeshifood','#cooking','#foodphotography','#tasty'],
 fashion:['#fashion','#style','#outfit','#ootd','#fashionstyle','#newarrival','#trendingfashion','#dress','#bangladeshfashion','#shopping'],
 photo:['#photography','#photooftheday','#photographer','#photoshoot','#portrait','#naturephotography','#mobilephotography','#instaphoto','#picoftheday'],
 islamic:['#islam','#muslim','#quran','#islamic','#deen','#allah','#prophetmuhammad','#islamicreminder','#jannah','#dua','#sunnah','#islamicpost'],
 birthday:['#birthday','#happybirthday','#birthdaycake','#birthdayparty','#birthdaycelebration','#cake','#party','#birthdayvibes','#celebration'],
 travel:['#travel','#travelphotography','#travelgram','#wanderlust','#trip','#vacation','#beautifulbangladesh','#visitbangladesh','#nature','#adventure'],
 tech:['#technology','#tech','#gadgets','#smartphone','#review','#techtips','#android','#unboxing','#technews','#gadgetreview'],
 study:['#education','#study','#studymotivation','#exam','#bcs','#jobpreparation','#students','#learning','#studytips','#admission']
};
const HG_BOOST=['#viral','#trending','#explore','#fyp','#bangladesh'];
let hgSeed=0;
function hgBuild(){
 const cat=$('#hg-cat').value,kw=$('#hg-kw').value.trim().toLowerCase().replace(/\s+/g,'');
 let tags=HG_BANK[cat].slice();
 let pool=tags.slice(4);tags=tags.slice(0,4);
 for(let i=0;i<11&&pool.length;i++){const j=(hgSeed*7+i*3)%pool.length;tags.push(pool.splice(j,1)[0]);}
 HG_BOOST.forEach(t=>{if(!tags.includes(t))tags.push(t);});
 if(kw){tags.unshift('#'+kw);tags.push('#'+kw+'bangladesh');}
 tags=[...new Set(tags)].slice(0,25);
 $('#hg-out').value=tags.join(' ');
 $('#hg-count').textContent=tags.length+'টা হ্যাশট্যাগ';
 $('#hg-wrap').classList.add('show');
}
$('#hg-go').addEventListener('click',()=>{hgSeed=0;hgBuild();});
$('#hg-shuffle').addEventListener('click',()=>{hgSeed++;hgBuild();});
$('#hg-copy').addEventListener('click',()=>{navigator.clipboard&&navigator.clipboard.writeText($('#hg-out').value);$('#hg-count').textContent='Copied ✓';});
/* ===== Video Watermark Remover ===== */
let vwrUrl=null,vwrDur=0;
$('#vwr-size').addEventListener('input',()=>$('#vwr-sv').textContent=$('#vwr-size').value);
$('#vwr-file').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 if(vwrUrl)URL.revokeObjectURL(vwrUrl);
 vwrUrl=URL.createObjectURL(f);
 const v=document.createElement('video');v.muted=true;v.src=vwrUrl;
 v.addEventListener('loadedmetadata',()=>{
  vwrDur=v.duration;
  if(vwrDur>185){$('#vwr-status').textContent='ভিডিওটি ৩ minutesের বেশি লম্বা — ছোট ক্লিপ (সর্বোচ্চ ৩ minutes) days।';$('#vwr-go').disabled=true;}
  else{$('#vwr-status').textContent='ভিডিও তৈরি ✓ দৈর্ঘ্য: '+Math.round(vwrDur)+' seconds। লোগোর কোণ ঠিক করে বোতাম চাপুন।';$('#vwr-go').disabled=false;}
 });
});
$('#vwr-go').addEventListener('click',async()=>{
 if(!vwrUrl)return;
 const btn=$('#vwr-go');btn.disabled=true;
 const st=t=>$('#vwr-status').textContent=t;
 try{
  const v=document.createElement('video');v.src=vwrUrl;v.playsInline=true;
  await new Promise((res,rej)=>{v.addEventListener('loadedmetadata',res);v.addEventListener('error',rej);});
  const vw=v.videoWidth,vh=v.videoHeight,sc=Math.min(1,1280/vw);
  const W=Math.round(vw*sc),H=Math.round(vh*sc);
  const cnv=$('#vwr-canvas');cnv.width=W;cnv.height=H;const x=cnv.getContext('2d');
  const fb=document.createElement('canvas');fb.width=W;fb.height=H;const fx=fb.getContext('2d');
  const tiny=document.createElement('canvas');const tx=tiny.getContext('2d');
  const AC=window.AudioContext||window.webkitAudioContext;let stream;
  if(AC){const ac=new AC();const src=ac.createMediaElementSource(v);const dst=ac.createMediaStreamDestination();src.connect(dst);stream=new MediaStream([].concat(cnv.captureStream(30).getVideoTracks(),dst.stream.getAudioTracks()));}
  else stream=cnv.captureStream(30);
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000,audioBitsPerSecond:128000});
  const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const stopped=new Promise(r=>rec.onstop=r);
  const p=(+$('#vwr-size').value)/100,cor=$('#vwr-corner').value;
  const rw=Math.round(W*p),rh=Math.round(rw*0.62);
  const rx=cor.includes('r')?W-rw:0,ry=cor.startsWith('b')?H-rh:0;
  function fix(){
   const sx2=cor.includes('r')?Math.max(0,rx-rw):Math.min(W-rw,rx+rw);
   x.save();x.beginPath();x.rect(rx,ry,rw,rh);x.clip();
   x.translate(cor.includes('r')?rx+rw:rx,ry);x.scale(cor.includes('r')?-1:1,1);
   x.drawImage(fb,sx2,ry,rw,rh,0,0,rw,rh);x.restore();
   tiny.width=Math.max(2,Math.round(rw/7));tiny.height=Math.max(2,Math.round(rh/7));
   tx.drawImage(cnv,rx,ry,rw,rh,0,0,tiny.width,tiny.height);
   x.save();x.beginPath();x.rect(rx,ry,rw,rh);x.clip();x.imageSmoothingEnabled=true;
   x.drawImage(tiny,0,0,tiny.width,tiny.height,rx,ry,rw,rh);x.restore();
  }
  let raf;
  function tick(){if(v.paused||v.ended)return;fx.drawImage(v,0,0,W,H);x.drawImage(fb,0,0);fix();st('Processing… '+Math.round(v.currentTime/v.duration*100)+'%');raf=requestAnimationFrame(tick);}
  v.addEventListener('ended',()=>{cancelAnimationFrame(raf);if(rec.state!=='inactive')rec.stop();});
  rec.start(250);await v.play();tick();
  await stopped;
  const blob=new Blob(chunks,{type:'video/webm'});
  const a=$('#vwr-dl');a.href=URL.createObjectURL(blob);
  $('#vwr-wrap').classList.add('show');
  st('হয়ে গেছে ✓ এবার ডাউনলোড করুন।');
 }catch(e){st('ভিডিও প্রসেস করা যায়নি — অন্য ক্লিপ দিয়ে চেষ্টা করুন।');}
 btn.disabled=false;
});
/* ===== DP Frame Maker ===== */
let dpImg=null;
function dpDraw(){
 const c=$('#dp-canvas'),x=c.getContext('2d'),S=1080;x.clearRect(0,0,S,S);
 x.fillStyle='#f3f4f6';x.fillRect(0,0,S,S);
 if(dpImg){
  const z=(+$('#dp-zoom').value)/100,iw=dpImg.naturalWidth,ih=dpImg.naturalHeight;
  const base=Math.max(S/iw,S/ih)*z,dw=iw*base,dh=ih*base;
  x.drawImage(dpImg,(S-dw)/2+(+$('#dp-x').value),(S-dh)/2+(+$('#dp-y').value),dw,dh);
 }
 const f=$('#dp-frame').value,B=54;
 x.lineWidth=B;
 if(f==='eid'){x.strokeStyle='#0b7a4b';x.strokeRect(B/2,B/2,S-B,S-B);x.lineWidth=6;x.strokeStyle='#d4af37';x.strokeRect(B+16,B+16,S-2*(B+16),S-2*(B+16));
  x.fillStyle='#0b7a4b';x.fillRect(0,S-190,S,190);x.fillStyle='#ffd94d';x.font='800 92px "Hind Siliguri",sans-serif';x.textAlign='center';x.fillText('Eid Mubarak',S/2,S-62);
  x.font='700 64px serif';x.fillText('☪',S/2,120);}
 else if(f==='victory'||f==='flag'){x.strokeStyle='#0b7a4b';x.strokeRect(B/2,B/2,S-B,S-B);x.fillStyle='#d61f26';x.beginPath();x.arc(S-150,150,86,0,7);x.fill();
  x.fillStyle='#0b7a4b';x.fillRect(0,S-168,S,168);x.fillStyle='#fff';x.font='800 76px "Hind Siliguri",sans-serif';x.textAlign='center';x.fillText(f==='victory'?'মহান বিজয় দিবস':'বাংলাদেশ',S/2,S-58);}
 else if(f==='birthday'){x.strokeStyle='#e75480';x.strokeRect(B/2,B/2,S-B,S-B);
  const cols=['#f59e0b','#3b82f6','#10b981','#ef4444','#a855f7'];let seed=7;
  for(let i=0;i<130;i++){seed=(seed*37)%997;x.fillStyle=cols[i%5];x.fillRect((seed*13)%S,(seed*29)%S,14,6);}
  x.fillStyle='#111827';x.fillRect(0,S-178,S,178);x.fillStyle='#ffd94d';x.font='800 80px "Hind Siliguri",sans-serif';x.textAlign='center';x.fillText('🎂 Happy Birthday',S/2,S-60);}
 else{x.strokeStyle='#d4af37';x.lineWidth=26;x.strokeRect(40,40,S-80,S-80);x.lineWidth=6;x.strokeRect(84,84,S-168,S-168);}
 $('#dp-wrap').classList.add('show');
}
$('#dp-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;dpImg=await loadImgFile(f);dpDraw();});
['dp-frame','dp-zoom','dp-x','dp-y'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#dp-zv').textContent=$('#dp-zoom').value;dpDraw();}));
$('#dp-dl').addEventListener('click',()=>canvasDl($('#dp-canvas'),'profile-frame.png'));
/* ===== Photo Enhancer ===== */
let peImg=null;
function peRender(){
 if(!peImg)return;
 const maxL=1600;let w=peImg.naturalWidth,h=peImg.naturalHeight;
 const sc=Math.min(1,maxL/Math.max(w,h));w=Math.round(w*sc);h=Math.round(h*sc);
 if($('#pe-2x').checked){w*=2;h*=2;}
 const c=$('#pe-canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.filter='brightness('+(+$('#pe-b').value)+'%) contrast('+(+$('#pe-c').value)+'%) saturate('+(+$('#pe-s').value)+'%)';
 x.drawImage(peImg,0,0,w,h);x.filter='none';
 const sh=(+$('#pe-h').value)/100;
 if(sh>0){
  const id=x.getImageData(0,0,w,h),src=new Uint8ClampedArray(id.data),d=id.data,k=[0,-sh,0,-sh,1+4*sh,-sh,0,-sh,0];
  for(let yy=1;yy<h-1;yy++)for(let xx=1;xx<w-1;xx++){
   const o=(yy*w+xx)*4;
   for(let ch=0;ch<3;ch++){let v=0,ki=0;
    for(let ky=-1;ky<=1;ky++)for(let kx=-1;kx<=1;kx++)v+=src[((yy+ky)*w+(xx+kx))*4+ch]*k[ki++];
    d[o+ch]=v;}
  }
  x.putImageData(id,0,0);
 }
 $('#pe-wrap').classList.add('show');
}
function peSync(){$('#pe-bv').textContent=$('#pe-b').value;$('#pe-cv').textContent=$('#pe-c').value;$('#pe-sv').textContent=$('#pe-s').value;$('#pe-hv').textContent=$('#pe-h').value;peRender();}
$('#pe-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;peImg=await loadImgFile(f);peRender();});
['pe-b','pe-c','pe-s','pe-h','pe-2x'].forEach(id=>$('#'+id).addEventListener('input',peSync));
$('#pe-auto').addEventListener('click',()=>{$('#pe-b').value=108;$('#pe-c').value=114;$('#pe-s').value=126;$('#pe-h').value=45;peSync();});
$('#pe-reset').addEventListener('click',()=>{$('#pe-b').value=100;$('#pe-c').value=100;$('#pe-s').value=100;$('#pe-h').value=0;$('#pe-2x').checked=false;peSync();});
$('#pe-dl').addEventListener('click',()=>canvasDl($('#pe-canvas'),'enhanced-photo.png'));
/* ===== Donate ===== */
$('#dn-copy').addEventListener('click',()=>{copyText('01677161678','বিকাশ নম্বর Copied ✓');});
/* ===== Job Photo & Signature Sizer ===== */
let jpImg=null,jpMode='photo';
function jpDims(){return jpMode==='photo'?{w:300,h:300,kb:100}:{w:300,h:80,kb:60};}
function jpDraw(){
 if(!jpImg)return;const{w,h}=jpDims(),c=$('#jp-canvas');c.width=w;c.height=h;
 const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);
 const z=(+$('#jp-zoom').value)/100,iw=jpImg.naturalWidth,ih=jpImg.naturalHeight;
 const base=Math.max(w/iw,h/ih)*z,dw=iw*base,dh=ih*base;
 const ox=(w-dw)/2+(+$('#jp-x').value),oy=(h-dh)/2+(+$('#jp-y').value);
 x.drawImage(jpImg,ox,oy,dw,dh);$('#jp-wrap').classList.add('show');
}
function jpSetMode(m){
 jpMode=m;const{kb}=jpDims();$('#jp-kb').value=kb;
 $('#jp-tab-photo').className='btn sm'+(m==='photo'?'':' alt');
 $('#jp-tab-sign').className='btn sm'+(m==='sign'?'':' alt');
 jpDraw();
}
$('#jp-tab-photo').addEventListener('click',()=>jpSetMode('photo'));
$('#jp-tab-sign').addEventListener('click',()=>jpSetMode('sign'));
$('#jp-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;jpImg=await loadImgFile(f);$('#jp-zoom').value=100;$('#jp-x').value=0;$('#jp-y').value=0;jpDraw();});
['jp-zoom','jp-x','jp-y'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#jp-zv').textContent=$('#jp-zoom').value;jpDraw();}));
$('#jp-dl').addEventListener('click',()=>{
 if(!jpImg)return;const maxB=(+$('#jp-kb').value||100)*1024,c=$('#jp-canvas');
 let q=0.92;
 const tryQ=()=>{c.toBlob(b=>{
   if(b.size<=maxB||q<=0.3){dl(URL.createObjectURL(b),jpMode==='photo'?'job-photo-300x300.jpg':'signature-300x80.jpg');$('#jp-status').textContent='তৈরি ✓ সাইজ: '+(b.size/1024).toFixed(1)+'KB — use in applications.';}
   else{q-=0.07;tryQ();}
 },'image/jpeg',q);};
 tryQ();
});
/* ===== SSC/HSC marks -> GPA ===== */
function bdRow(){
 const tr=document.createElement('tr');
 tr.innerHTML='<td><input class="in bd-sub" placeholder="বিষয়" style="min-width:90px"></td><td><input class="in bd-mark" type="number" min="0" max="100" placeholder="নম্বর" style="width:96px"></td><td><select class="in bd-type"><option value="main">প্রধান</option><option value="opt">ঐচ্ছিক (৪র্থ)</option></select></td><td><button class="btn alt sm bd-del">✕</button></td>';
 tr.querySelector('.bd-del').addEventListener('click',()=>tr.remove());
 $('#bd-rows').appendChild(tr);
}
$('#bd-add').addEventListener('click',bdRow);
for(let i=0;i<7;i++)bdRow();
function bdPoint(m){return m>=80?5:m>=70?4:m>=60?3.5:m>=50?3:m>=40?2:m>=33?1:0;}
function bdLetter(g){return g>=5?'A+':g>=4?'A':g>=3.5?'A-':g>=3?'B':g>=2?'C':g>=1?'D':'F';}
$('#bd-go').addEventListener('click',()=>{
 let sum=0,cnt=0,bonus=0,fail=false,done=0;
 $$('#bd-rows tr').forEach(tr=>{
  const v=tr.querySelector('.bd-mark').value;if(v==='')return;done++;
  const p=bdPoint(Math.max(0,Math.min(100,+v)));
  if(tr.querySelector('.bd-type').value==='opt'){bonus=Math.max(bonus,Math.max(0,p-2));}
  else{cnt++;sum+=p;if(p===0)fail=true;}
 });
 const box=$('#bd-res');box.classList.add('show');
 if(!done||!cnt){box.innerHTML='<p style="margin:0">Please enter at least one main subject number first.</p>';return;}
 const gpa=fail?0:Math.min(5,(sum+bonus)/cnt);
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">আপনার GPA: <b class=\"big\">{0}</b> <span style=\"color:var(--ink2)\">/ 5.00 ({1})</span></p><div class=\"kv\"><span>প্রধান বিষয়</span><b>{2}টি</b></div>{3}{4}",gpa.toFixed(2),bdLetter(gpa),cnt,bonus?`<div class="kv"><span>ঐচ্ছিক বোনাস</span><b>+${bonus.toFixed(2)}</b></div>`:'',fail?'<p style="margin:6px 0 0;color:#d61f26">কোনো প্রধান বিষয়ে ফেল (৩৩-এর কম) থাকায় GPA 0.00।</p>':'');
});
/* ===== OCR ===== */
let ocrFile=null;
$('#ocr-file').addEventListener('change',e=>{ocrFile=e.target.files[0]||null;$('#ocr-go').disabled=!ocrFile;});
$('#ocr-go').addEventListener('click',async()=>{
 if(!ocrFile)return;const btn=$('#ocr-go');btn.disabled=true;btn.textContent='Working…';
 $('#ocr-status').textContent='Starting…';
 try{
  const res=await Tesseract.recognize(ocrFile,$('#ocr-lang').value,{logger:m=>{if(m.status==='recognizing text')$('#ocr-status').textContent='লেখা শনাক্ত হচ্ছে: '+Math.round(m.progress*100)+'%';else if(m.status)$('#ocr-status').textContent=m.status+'…';}});
  $('#ocr-out').value=res.data.text.trim();$('#ocr-wrap').classList.add('show');$('#ocr-status').textContent='সম্পন্ন ✓';
 }catch(e){$('#ocr-status').textContent='দুঃখিত, লেখা তোলা যায়নি — পরিষ্কার ছবি দিয়ে আবার চেষ্টা করুন।';}
 btn.disabled=false;btn.textContent='লেখা তুলুন (Extract Text)';
});
$('#ocr-copy').addEventListener('click',()=>copyText($('#ocr-out').value,'Text copied ✓'));
/* ===== QR ===== */
function qrText(){
 const t=$('#qr-type').value;
 if(t==='wifi')return 'WIFI:T:WPA;S:'+$('#qr-ssid').value+';P:'+$('#qr-pass').value+';;';
 if(t==='tel')return 'tel:'+$('#qr-text').value.trim();
 return $('#qr-text').value.trim();
}
$('#qr-type').addEventListener('change',()=>{
 const w=$('#qr-type').value==='wifi';
 $('#qr-wifi-wrap').style.display=w?'block':'none';
 $('#qr-text-wrap').style.display=w?'none':'block';
 if($('#qr-type').value==='tel')$('#qr-text').placeholder='01XXXXXXXXX';
 else $('#qr-text').placeholder='https://… or any text';
});
$('#qr-go').addEventListener('click',()=>{
 const txt=qrText();if(!txt){toast(T('Please enter text/link first'));return;}
 const size=+$('#qr-size').value;const box=$('#qr-box');box.innerHTML='';
 try{new QRCode(box,{text:txt,width:size,height:size,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}
 catch(e){toast(T('Could not create QR — shorten the text'));return;}
 $('#qr-wrap').classList.add('show');
});
$('#qr-dl').addEventListener('click',()=>{const cv=$('#qr-box canvas');if(cv){canvasDl(cv,'qrcode.png');}else{const im=$('#qr-box img');if(im&&im.src)dl(im.src,'qrcode.png');}});
/* ===== Age ===== */
$('#age-at').value=new Date().toISOString().slice(0,10);
$('#age-go').addEventListener('click',()=>{
 const dobV=$('#age-dob').value,atV=$('#age-at').value;
 if(!dobV||!atV){toast(T('তারিখ দুটোই days'));return;}
 let dob=new Date(dobV),at=new Date(atV);
 if(at<dob){toast(T('দ্বিতীয় তারিখ জন্মতারিখের পরে হতে হবে'));return;}
 let y=at.getFullYear()-dob.getFullYear(),m=at.getMonth()-dob.getMonth(),d=at.getDate()-dob.getDate();
 if(d<0){m--;d+=new Date(at.getFullYear(),at.getMonth(),0).getDate();}
 if(m<0){y--;m+=12;}
 const days=Math.floor((at-dob)/864e5);
 let nb=new Date(at.getFullYear(),dob.getMonth(),dob.getDate());if(nb<=at)nb=new Date(at.getFullYear()+1,dob.getMonth(),dob.getDate());
 const nbDays=Math.ceil((nb-at)/864e5);
 const daysBn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 const box=$('#age-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">Your age: <b class=\"big\">{0} years {1} months {2} days</b></p><div class=\"kv\"><span>Total days</span><b>{3} days</b></div><div class=\"kv\"><span>Birth weekday</span><b>{4}</b></div><div class=\"kv\"><span>Next birthday</span><b>in {5} days ({6})</b></div>",toBn(y),toBn(m),toBn(d),toBn(days.toLocaleString('en-US')),daysBn[dob.getDay()],toBn(nbDays),nb.toLocaleDateString('en-GB'));
 box.classList.add('show');
});
/* ===== Word counter ===== */
$('#wc-in').addEventListener('input',()=>{
 const t=$('#wc-in').value;
 const words=t.trim()?t.trim().split(/\s+/).length:0;
 $('#wc-words').textContent=words;$('#wc-chars').textContent=t.length;
 $('#wc-nospace').textContent=t.replace(/\s/g,'').length;
 $('#wc-sent').textContent=t.trim()?(t.match(/[.!?।\n]+/g)||[]).length+( /[^\s.!?।]$/.test(t.trim())?1:0):0;
 $('#wc-lines').textContent=t?t.split('\n').length:0;
 const mins=words/180;$('#wc-read').textContent=words?(mins<1?Math.max(1,Math.round(words/3))+' seconds':mins.toFixed(1)+' minutes'):'0 minutes';
});
/* ===== Bijoy <-> Avro (Unicode) ===== */
const U2B={'অ':'A','আ':'Av','ই':'B','ঈ':'C','উ':'D','ঊ':'E','ঋ':'F','এ':'G','ঐ':'H','ও':'I','ঔ':'J','ক':'K','খ':'L','গ':'M','ঘ':'N','ঙ':'O','চ':'P','ছ':'Q','জ':'R','ঝ':'S','ট':'T','ঠ':'U','ড':'V','ঢ':'W','ণ':'X','ত':'Y','থ':'Z','দ':'_','ধ':'a','ন':'b','প':'c','ফ':'d','ব':'e','ভ':'f','ম':'g','য':'h','র':'i','ল':'j','শ':'k','ষ':'l','স':'m','হ':'n','ড়':'o','ঢ়':'p','য়':'q','ৎ':'r','ং':'s','ঃ':'t','ঁ':'u','া':'v','ি':'w','ী':'x','ু':'y','ূ':'z','ৃ':'`','ে':'‡','ৈ':'ˆ','ো':'‡v','ৌ':'‡ˆ','্':'&','০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9','।':'|','–':'-','—':'-'};
const B2U={};Object.keys(U2B).forEach(k=>{if(k.length===1||U2B[k].length===1)B2U[U2B[k]]=k;});
B2U['Av']='আ';B2U['‡v']='ো';B2U['‡ˆ']='ৌ';
let bjMode='b2u';
function setBjMode(m){bjMode=m;$('#bj-mode-u2b').classList.toggle('on',m==='u2b');$('#bj-mode-b2u').classList.toggle('on',m==='b2u');}
$('#bj-mode-u2b').addEventListener('click',()=>setBjMode('u2b'));
$('#bj-mode-b2u').addEventListener('click',()=>setBjMode('b2u'));
function uniToBijoy(s){
 let out='';
 for(let i=0;i<s.length;i++){
   const two=s.substr(i,2);
   if(two==='ো'||two==='ৌ'){/* single char in unicode, handled below */}
   const ch=s[i];
   if(ch==='ি'||ch==='ে'||ch==='ৈ'){ /* pre-kar: swap with previous consonant in output */
     out+=U2B[ch];continue;}
   if(U2B[ch]!==undefined)out+=U2B[ch];else out+=ch;
 }
 /* move pre-kar codes (w,‡,ˆ) before the consonant they follow */
 out=out.replace(/([KLMNOPQRSTUVWXYZ_abdefghjklmnopqrs])([w‡ˆ])/g,'$2$1');
 out=out.replace(/&([w‡ˆ])/g,'$1&');
 return out;
}
function bijoyToUni(s){
 /* conjunct ligatures & common fixes first */
 let t=s.replace(/¯'/g,'ক্ষ');
 /* reph: Bijoy 'i' AFTER a consonant code means র্ before it in unicode display order is handled naturally: cons + 'i' handled by char map order */
 let out='',i=0;
 while(i<t.length){
   const two=t.substr(i,2);
   if(B2U[two]&&two.length===2&&(two==='Av'||two==='‡v'||two==='‡ˆ')){out+=B2U[two];i+=2;continue;}
   /* pre-kar: w/‡/ˆ placed BEFORE following consonant -> emit consonant first then kar */
   const ch=t[i];
   if((ch==='w'||ch==='‡'||ch==='ˆ')&&i+1<t.length&&B2U[t[i+1]]){out+=B2U[t[i+1]]+B2U[ch];i+=2;continue;}
   if(B2U[ch]!==undefined)out+=B2U[ch];else out+=ch;
   i++;
 }
 /* reph fix: র followed by ্-consonant stays; Bijoy types যুক্ত '্য' etc handled by & map */
 return out;
}
$('#bj-go').addEventListener('click',()=>{
 const s=$('#bj-in').value;
 $('#bj-out').value=bjMode==='u2b'?uniToBijoy(s):bijoyToUni(s);
 toast(T('Converted ✓'));
});
$('#bj-copy').addEventListener('click',()=>copyText($('#bj-out').value,'Copied ✓'));
/* ===== EMI ===== */
$('#emi-go').addEventListener('click',()=>{
 const P=+$('#emi-p').value||0,r=(+$('#emi-r').value||0)/100/12,n=Math.round((+$('#emi-y').value||0)*12);
 if(P<=0||n<=0){toast(T('সঠিক মান days'));return;}
 const emi=r>0?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;
 const total=emi*n,interest=total-P;
 const box=$('#emi-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">মাসিক কিস্তি (EMI): <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>আসল (Principal)</span><b>৳{1}</b></div><div class=\"kv\"><span>মোট সুদ</span><b>৳{2}</b></div><div class=\"kv\"><span>মোট পরিশোধ</span><b>৳{3}</b></div><div class=\"kv\"><span>মেয়াদ</span><b>{4} মাস</b></div>",toBn(fmtN(Math.round(emi))),toBn(fmtN(P)),toBn(fmtN(Math.round(interest))),toBn(fmtN(Math.round(total))),toBn(n));
 box.classList.add('show');
});
/* ===== Discount ===== */
$('#dc-go').addEventListener('click',()=>{
 const p=+$('#dc-p').value||0,d=+$('#dc-d').value||0;
 const save=p*d/100,final=p-save;
 const box=$('#dc-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">ছাড়ের পর দাম: <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>আসল দাম</span><b>৳{1}</b></div><div class=\"kv\"><span>ছাড় ({2}%)</span><b>৳{3} সাশ্রয়</b></div>",toBn(fmtN(final)),toBn(fmtN(p)),toBn(d),toBn(fmtN(save)));
 box.classList.add('show');
});
/* ===== bKash/Nagad ===== */
$('#bk-go').addEventListener('click',()=>{
 const svc=$('#bk-svc').value,via=$('#bk-via').value,amt=+$('#bk-amt').value||0;
 const rates={bkash:{app:14.90,ussd:18.50},nagad:{app:12.99,ussd:14.94}};
 const per=rates[svc][via];const charge=Math.ceil(amt/1000*per*100)/100;
 const box=$('#bk-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">ক্যাশ আউট চার্জ: <b class=\"big\">৳{0}</b></p><div class=\"kv\"><span>তুলতে চান</span><b>৳{1}</b></div><div class=\"kv\"><span>হার (প্রতি ১০০০)</span><b>৳{2}</b></div><div class=\"kv\"><span>ব্যালেন্স থেকে মোট কাটবে</span><b>৳{3}</b></div><div class=\"kv\"><span>এজেন্টকে মোট দিতে হতে পারে</span><b>৳{4}</b></div>",toBn(fmtN(charge)),toBn(fmtN(amt)),toBn(per.toFixed(2)),toBn(fmtN(amt+charge)),toBn(fmtN(amt+charge)));
 box.classList.add('show');
});
/* ===== CGPA ===== */
function cgRow(){const tr=document.createElement('tr');
 tr.innerHTML=`<td><input class="in" data-cg="name" placeholder="বিষয়ের Name" style="padding:8px"></td><td><input class="in" data-cg="gpa" type="number" step="0.01" min="0" placeholder="4.00" style="padding:8px"></td><td><input class="in" data-cg="cr" type="number" step="0.5" min="0" value="3" style="padding:8px"></td><td><button class="btn alt sm" data-cg="del">✕</button></td>`;
 tr.querySelector('[data-cg="del"]').onclick=()=>tr.remove();
 $('#cg-rows').appendChild(tr);}
for(let i=0;i<4;i++)cgRow();
$('#cg-add').addEventListener('click',cgRow);
$('#cg-go').addEventListener('click',()=>{
 const scale=+$('#cg-scale').value;let pts=0,cr=0,count=0;
 $$('#cg-rows tr').forEach(tr=>{
   const g=parseFloat(tr.querySelector('[data-cg="gpa"]').value),c=parseFloat(tr.querySelector('[data-cg="cr"]').value)||0;
   if(!isNaN(g)&&c>0){pts+=Math.min(g,scale)*c;cr+=c;count++;}});
 if(!cr){toast(T('Please enter at least one subject grade and credit'));return;}
 const cgpa=pts/cr;
 const box=$('#cg-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">আপনার CGPA: <b class=\"big\">{0}</b> <span style=\"color:var(--ink2)\">/ {1}</span></p><div class=\"kv\"><span>বিষয়</span><b>{2}টি</b></div><div class=\"kv\"><span>মোট ক্রেডিট</span><b>{3}</b></div><div class=\"kv\"><span>শতকরা (আনুমানিক)</span><b>{4}%</b></div>",cgpa.toFixed(2),scale.toFixed(2),toBn(count),toBn(cr),toBn((cgpa/scale*100).toFixed(1)));
 box.classList.add('show');
});
/* ===== Electricity ===== */
$('#el-go').addEventListener('click',()=>{
 const u=+$('#el-units').value||0;
 const slabs=[[50,4.35],[25,5.52],[125,6.92],[100,7.10],[100,7.37],[200,8.36],[Infinity,9.68]];
 let rem=u,energy=0,rows='',prev=0;
 const names=['লাইফলাইন ০–৫০','১ম ধাপ ৫১–৭৫','২য় ধাপ ৭৬–২০০','৩য় ধাপ ২০১–৩০০','৪র্থ ধাপ ৩০১–৪০০','৫ম ধাপ ৪০১–৬০০','৬ষ্ঠ ধাপ ৬০০+'];
 slabs.forEach((s,i)=>{if(rem<=0)return;const take=Math.min(rem,s[0]);const cost=take*s[1];energy+=cost;rem-=take;
  rows+=Tf("<div class=\"kv\"><span>{0} — {1} ইউনিট × ৳{2}</span><b>৳{3}</b></div>",names[i],toBn(take),toBn(s[1].toFixed(2)),toBn(fmtN(cost)));});
 const demand=u>0?42:0,meter=u>0?40:0,sub=energy+demand+meter,vat=sub*0.05,total=sub+vat;
 const box=$('#el-res');
 box.innerHTML=rows+Tf("<div class=\"kv\"><span>ডিমান্ড চার্জ</span><b>৳{0}</b></div><div class=\"kv\"><span>মিটার ভাড়া</span><b>৳{1}</b></div><div class=\"kv\"><span>ভ্যাট (৫%)</span><b>৳{2}</b></div><p style=\"margin:10px 0 0\">আনুমানিক মোট বিল: <b class=\"big\">৳{3}</b></p>",toBn(demand),toBn(meter),toBn(fmtN(vat)),toBn(fmtN(Math.round(total))));
 box.classList.add('show');
});
/* ===== Bangla date ===== */
const BM=['Boishakh','Joishtho','Asharh','Srabon','Bhadro','Ashwin','Kartik','Agrahayan','Poush','Magh','Falgun','Chaitra'];
const BM_LEN=[31,31,31,31,31,30,30,30,30,30,29,30];
function isLeap(y){return (y%4===0&&y%100!==0)||y%400===0;}
function g2b(date){
 let by=date.getFullYear()-593;
 const ref=new Date(date.getFullYear(),3,14); /* Apr 14 */
 if(date<ref)by-=1;
 const start=new Date(by+593,3,14);
 let diff=Math.floor((date-start)/864e5);
 const leap=isLeap(by+594); /* Falgun falls in Feb of by+594 */
 let m=0;const lens=BM_LEN.slice();if(leap)lens[10]=30;
 while(diff>=lens[m]){diff-=lens[m];m++;}
 return {y:by,m:m,d:diff+1};
}
function b2g(by,bm,bd){
 const start=new Date(by+593,3,14);
 const lens=BM_LEN.slice();if(isLeap(by+594))lens[10]=30;
 let add=bd-1;for(let i=0;i<bm;i++)add+=lens[i];
 return new Date(start.getTime()+add*864e5);
}
$('#bd-bm').innerHTML=BM.map((m,i)=>`<option value="${i}">${m}</option>`).join('');
$('#bd-g').value=new Date().toISOString().slice(0,10);
$('#bd-go1').addEventListener('click',()=>{
 const v=$('#bd-g').value;if(!v){toast(T('তারিখ days'));return;}
 const r=g2b(new Date(v));
 const box=$('#bd-res1');box.innerHTML=Tf("বাংলা তারিখ: <b class=\"big\">{0} {1} {2}</b> বঙ্গাব্দ",toBn(r.d),BM[r.m],toBn(r.y));box.classList.add('show');
});
$('#bd-go2').addEventListener('click',()=>{
 const by=+$('#bd-by').value,bm=+$('#bd-bm').value,bd=+$('#bd-bd').value;
 if(!by||!bd){toast(T('years ও days days'));return;}
 const g=b2g(by,bm,bd);
 const box=$('#bd-res2');box.innerHTML=Tf("ইংরেজি তারিখ: <b class=\"big\">{0}</b>",g.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}));box.classList.add('show');
});
/* ===== Password ===== */
function genPw(){
 const len=+$('#pw-len').value;
 let set='abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
 if($('#pw-num').checked)set+='23456789';
 if(!$('#pw-up').checked)set=set.replace(/[A-Z]/g,'');
 if($('#pw-sym').checked)set+='!@#$%^&*()-_=+';
 const arr=new Uint32Array(len);crypto.getRandomValues(arr);
 $('#pw-out').value=Array.from(arr).map(n=>set[n%set.length]).join('');
}
$('#pw-len').addEventListener('input',()=>{$('#pw-lv').textContent=$('#pw-len').value;genPw();});
$('#pw-go').addEventListener('click',genPw);
$('#pw-copy').addEventListener('click',()=>copyText($('#pw-out').value,'পাসওয়ার্ড Copied ✓'));
genPw();
/* ===== TTS + STT ===== */
function loadVoices(){const vs=speechSynthesis.getVoices();
 $('#tts-voice').innerHTML=vs.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join('');
 const bn=vs.findIndex(v=>/bn/i.test(v.lang));if(bn>=0)$('#tts-voice').value=bn;}
if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=loadVoices;loadVoices();}
$('#tts-play').addEventListener('click',()=>{
 const t=$('#tts-in').value.trim();if(!t)return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(t);u.rate=+$('#tts-rate').value;
 const vs=speechSynthesis.getVoices();const v=vs[+$('#tts-voice').value];if(v)u.voice=v;
 speechSynthesis.speak(u);
});
$('#tts-stop').addEventListener('click',()=>speechSynthesis.cancel());
let recog=null;
$('#stt-go').addEventListener('click',()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 showErr('#stt-err','');
 if(!SR){showErr('#stt-err','This browser does not support Voice Typing — use Chrome.');return;}
 if(recog){recog.stop();recog=null;$('#stt-go').textContent='🎙 বলা শুরু করুন';return;}
 recog=new SR();recog.lang=$('#stt-lang').value;recog.interimResults=true;recog.continuous=true;
 let finalTxt=$('#stt-out').value;
 recog.onresult=e=>{let interim='';
   for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalTxt+=e.results[i][0].transcript+' ';else interim+=e.results[i][0].transcript;}
   $('#stt-out').value=finalTxt+interim;};
 recog.onend=()=>{recog=null;$('#stt-go').textContent='🎙 বলা শুরু করুন';};
 recog.onerror=e=>{showErr('#stt-err','মাইক্রোফোনে সমস্যা: '+e.error+' — check whether permission was granted.');};
 recog.start();$('#stt-go').textContent='⏹ থামান (শুনছি…)';
});
$('#stt-copy').addEventListener('click',()=>copyText($('#stt-out').value,'Copied ✓'));
/* ===== YouTube income ===== */
$('#yti-cat').addEventListener('change',()=>{$('#yti-rpm-wrap').style.display=$('#yti-cat').value==='custom'?'block':'none';});
$('#yti-go').addEventListener('click',()=>{
 const views=+$('#yti-views').value||0;
 let rpm;
 if($('#yti-cat').value==='shorts')rpm=0.05;
 else if($('#yti-cat').value==='custom')rpm=+$('#yti-rpm').value||0;
 else rpm=+$('#yti-cat').value;
 const usd=views/1000*rpm,bdt=usd*120;
 const box=$('#yti-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">আনুমানিক মাসিক আয়: <b class=\"big\">${0} ≈ ৳{1}</b></p><div class=\"kv\"><span>দৈনিক (আনুমানিক)</span><b>${2} ≈ ৳{3}</b></div><div class=\"kv\"><span>বার্ষিক (আনুমানিক)</span><b>${4} ≈ ৳{5}</b></div><div class=\"kv\"><span>ধরা RPM</span><b>${6} / ১০০০ ভিউ</b></div>",fmtN(usd),toBn(fmtN(Math.round(bdt))),fmtN(usd/30),toBn(fmtN(Math.round(bdt/30))),fmtN(usd*12),toBn(fmtN(Math.round(bdt*12))),rpm);
 box.classList.add('show');
});
/* ===== Land ===== */
$('#land-go').addEventListener('click',()=>{
 const amt=+$('#land-amt').value||0,unit=$('#land-unit').value;
 const toSqft={shotangsho:435.6,katha:720,bigha:14400,acre:43560,sqft:1,sqm:10.7639};
 const sqft=amt*toSqft[unit];
 const r={'বর্গফুট (Sq Ft)':sqft,'শতাংশ (Decimal)':sqft/435.6,'কাঠা (Katha)':sqft/720,'বিঘা (Bigha)':sqft/14400,'Acre':sqft/43560,'বর্গমিটার (Sq M)':sqft/10.7639,'বর্গগজ (Sq Yard)':sqft/9};
 const box=$('#land-res');
 box.innerHTML=Object.keys(r).map(k=>`<div class="kv"><span>${k}</span><b>${toBn(fmtN(r[k],4))}</b></div>`).join('');
 box.classList.add('show');
});
/* ===== BMI ===== */
$('#bmi-go').addEventListener('click',()=>{
 const w=+$('#bmi-w').value||0,ft=+$('#bmi-ft').value||0,inch=+$('#bmi-in').value||0;
 const m=(ft*12+inch)*0.0254;if(!w||!m){toast(T('ওজন ও উচ্চতা days'));return;}
 const bmi=w/(m*m);
 let cat,color;
 if(bmi<18.5){cat='Underweight';color='#b8860b';}
 else if(bmi<25){cat='স্বাভাবিক (Healthy)';color='var(--ok)';}
 else if(bmi<30){cat='বেশি ওজন (Overweight)';color='#d2691e';}
 else{cat='স্থূলতা (Obese)';color='var(--danger)';}
 const lo=(18.5*m*m).toFixed(1),hi=(24.9*m*m).toFixed(1);
 const box=$('#bmi-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">আপনার BMI: <b class=\"big\">{0}</b> — <b style=\"color:{1}\">{2}</b></p><div class=\"kv\"><span>আপনার উচ্চতায় স্বাস্থ্যকর ওজন</span><b>{3} – {4} কেজি</b></div>",bmi.toFixed(1),color,cat,toBn(lo),toBn(hi));
 box.classList.add('show');
});
/* ===== Date difference ===== */
$('#dd-go').addEventListener('click',()=>{
 const a=$('#dd-a').value,b=$('#dd-b').value;
 if(!a||!b){toast(T('দুটো তারিখই days'));return;}
 let d1=new Date(a),d2=new Date(b);if(d2<d1){const t=d1;d1=d2;d2=t;}
 const days=Math.round((d2-d1)/864e5);
 let y=d2.getFullYear()-d1.getFullYear(),mo=d2.getMonth()-d1.getMonth(),da=d2.getDate()-d1.getDate();
 if(da<0){mo--;da+=new Date(d2.getFullYear(),d2.getMonth(),0).getDate();}
 if(mo<0){y--;mo+=12;}
 const box=$('#dd-res');
 box.innerHTML=Tf("<p style=\"margin:0 0 6px\">ব্যবধান: <b class=\"big\">{0} days</b></p><div class=\"kv\"><span>years-মাস-daysে</span><b>{1} years {2} মাস {3} days</b></div><div class=\"kv\"><span>সপ্তাহে</span><b>{4} সপ্তাহ</b></div><div class=\"kv\"><span>মোট মাস (আনুমানিক)</span><b>{5} মাস</b></div>",toBn(days.toLocaleString('en-US')),toBn(y),toBn(mo),toBn(da),toBn(fmtN(days/7,1)),toBn(fmtN(days/30.44,1)));
 box.classList.add('show');
});
/* ===== Crop & Rotate ===== */
let crImg=null,crState={rot:0,flip:false};
function crDraw(){
 if(!crImg)return;
 const t=+$('#cr-t').value/100,b=+$('#cr-b').value/100,l=+$('#cr-l').value/100,r=+$('#cr-r').value/100;
 $('#cr-tv').textContent=$('#cr-t').value;$('#cr-bv').textContent=$('#cr-b').value;$('#cr-lv').textContent=$('#cr-l').value;$('#cr-rv').textContent=$('#cr-r').value;
 const tmp=document.createElement('canvas');const iw=crImg.naturalWidth,ih=crImg.naturalHeight;
 const swap=crState.rot%180!==0;
 tmp.width=swap?ih:iw;tmp.height=swap?iw:ih;
 const tx=tmp.getContext('2d');tx.translate(tmp.width/2,tmp.height/2);tx.rotate(crState.rot*Math.PI/180);tx.scale(crState.flip?-1:1,1);tx.drawImage(crImg,-iw/2,-ih/2);
 const sx=tmp.width*l,sy=tmp.height*t,sw=tmp.width*(1-l-r),sh=tmp.height*(1-t-b);
 const c=$('#cr-canvas');c.width=Math.max(1,Math.round(sw));c.height=Math.max(1,Math.round(sh));
 c.getContext('2d').drawImage(tmp,sx,sy,sw,sh,0,0,c.width,c.height);
 $('#cr-wrap').classList.add('show');
}
$('#cr-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;crImg=await loadImgFile(f);crState={rot:0,flip:false};crDraw();});
$('#cr-rotl').addEventListener('click',()=>{crState.rot=(crState.rot+270)%360;crDraw();});
$('#cr-rotr').addEventListener('click',()=>{crState.rot=(crState.rot+90)%360;crDraw();});
$('#cr-flip').addEventListener('click',()=>{crState.flip=!crState.flip;crDraw();});
['cr-t','cr-b','cr-l','cr-r'].forEach(id=>$('#'+id).addEventListener('input',crDraw));
$('#cr-dl').addEventListener('click',()=>canvasDl($('#cr-canvas'),'cropped.png'));
/* ===== Meme ===== */
let mmImg=null;
function mmDraw(){
 if(!mmImg)return;const c=$('#mm-canvas');c.width=mmImg.naturalWidth;c.height=mmImg.naturalHeight;
 const x=c.getContext('2d');x.drawImage(mmImg,0,0);
 const size=+$('#mm-size').value;$('#mm-sv').textContent=size;
 x.font='800 '+size+'px "Sora","Hind Siliguri",sans-serif';x.textAlign='center';
 x.lineWidth=Math.max(2,size/7);x.strokeStyle='#000';x.fillStyle='#fff';
 const top=$('#mm-top').value.toUpperCase(),bot=$('#mm-bottom').value.toUpperCase();
 if(top){x.textBaseline='top';x.strokeText(top,c.width/2,size*0.25);x.fillText(top,c.width/2,size*0.25);}
 if(bot){x.textBaseline='bottom';x.strokeText(bot,c.width/2,c.height-size*0.25);x.fillText(bot,c.width/2,c.height-size*0.25);}
 $('#mm-wrap').classList.add('show');
}
$('#mm-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;mmImg=await loadImgFile(f);mmDraw();});
['mm-top','mm-bottom'].forEach(id=>$('#'+id).addEventListener('input',mmDraw));
$('#mm-size').addEventListener('input',mmDraw);
$('#mm-dl').addEventListener('click',()=>canvasDl($('#mm-canvas'),'meme.png'));
/* ===== Instagram DP ===== */
$('#ig-go').addEventListener('click',()=>{
 showErr('#ig-err','');const u=$('#ig-user').value.trim().replace(/^@/,'');
 if(!u){showErr('#ig-err','Please enter a username.');return;}
 const img=$('#ig-img');img.onload=()=>$('#ig-wrap').classList.add('show');
 img.onerror=()=>{showErr('#ig-err','ছবি পাওয়া যায়নি — username ঠিক আছে কিনা ও অ্যাকাউন্ট পাবলিক কিনা যাচাই করুন।');$('#ig-wrap').classList.remove('show');};
 img.src='https://unavatar.io/instagram/'+encodeURIComponent(u)+'?fallback=false';
});
$('#ig-dl').addEventListener('click',async()=>{
 const img=$('#ig-img');if(!img.src)return;
 try{const r=await fetch(img.src);const b=await r.blob();dl(URL.createObjectURL(b),'instagram-dp.jpg');}
 catch(e){dl(img.src,'instagram-dp.jpg');}
});
/* ===== Unit converter ===== */
const UC={
 weight:{base:'kg',units:{kg:['কেজি (kg)',1],g:['গ্রাম (g)',0.001],lb:['পাউন্ড (lb)',0.453592],oz:['Ounces (oz)',0.0283495],ton:['টন (tonne)',1000],mon:['মণ (maund, BD)',37.3242]}},
 length:{base:'m',units:{m:['মিটার (m)',1],cm:['সেন্টিমিটার (cm)',0.01],mm:['মিলিমিটার (mm)',0.001],km:['কিলোমিটার (km)',1000],inch:['Inches (inch)',0.0254],ft:['ফুট (ft)',0.3048],yd:['গজ (yard)',0.9144],mile:['মাইল (mile)',1609.34]}},
 temp:{base:'c',units:{c:['সেলসিয়াস (°C)',null],f:['ফারেনহাইট (°F)',null],k:['কেলভিন (K)',null]}}
};
function ucFill(){
 const cat=UC[$('#uc-cat').value];
 const fill=sel=>{sel.innerHTML=Object.keys(cat.units).map(u=>`<option value="${u}">${cat.units[u][0]}</option>`).join('');};
 fill($('#uc-from'));fill($('#uc-to'));
 $('#uc-to').selectedIndex=1;
}
$('#uc-cat').addEventListener('change',ucFill);ucFill();
$('#uc-go').addEventListener('click',()=>{
 const catK=$('#uc-cat').value,cat=UC[catK],v=+$('#uc-val').value||0,f=$('#uc-from').value,t=$('#uc-to').value;
 let out;
 if(catK==='temp'){
   let c=v;if(f==='f')c=(v-32)*5/9;if(f==='k')c=v-273.15;
   out=c;if(t==='f')out=c*9/5+32;if(t==='k')out=c+273.15;
 }else{out=v*cat.units[f][1]/cat.units[t][1];}
 const box=$('#uc-res');
 box.innerHTML=`<b class="big">${fmtN(v,4)} ${cat.units[f][0]}</b> = <b class="big">${fmtN(out,4)} ${cat.units[t][0]}</b>`;
 box.classList.add('show');
});
/* ===== Text tools ===== */
$$('[data-tx]').forEach(btn=>btn.addEventListener('click',()=>{
 const ta=$('#tx-in');let t=ta.value;const op=btn.dataset.tx;
 if(op==='upper')t=t.toUpperCase();
 else if(op==='lower')t=t.toLowerCase();
 else if(op==='title')t=t.toLowerCase().replace(/(^|\s|।|\.)\S/g,c=>c.toUpperCase());
 else if(op==='sentence')t=t.toLowerCase().replace(/(^\s*\w|[.!?।]\s*\w)/g,c=>c.toUpperCase());
 else if(op==='dedup'){const seen=new Set();t=t.split('\n').filter(l=>{const k=l.trim();if(seen.has(k))return false;seen.add(k);return true;}).join('\n');}
 else if(op==='sort')t=t.split('\n').sort((a,b)=>a.localeCompare(b)).join('\n');
 else if(op==='reverse')t=t.split('').reverse().join('');
 else if(op==='trim')t=t.split('\n').map(l=>l.trim().replace(/\s+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n');
 ta.value=t;toast(T('হয়ে গেছে ✓'));
}));
$('#tx-copy').addEventListener('click',()=>copyText($('#tx-in').value,'Copied ✓'));
/* ===== Random picker ===== */
let rpMode='names';
$('#rp-mode-names').addEventListener('click',()=>{rpMode='names';$('#rp-mode-names').classList.add('on');$('#rp-mode-nums').classList.remove('on');$('#rp-names-wrap').style.display='block';$('#rp-nums-wrap').style.display='none';});
$('#rp-mode-nums').addEventListener('click',()=>{rpMode='nums';$('#rp-mode-nums').classList.add('on');$('#rp-mode-names').classList.remove('on');$('#rp-names-wrap').style.display='none';$('#rp-nums-wrap').style.display='block';});
function randInt(max){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%max;}
$('#rp-go').addEventListener('click',()=>{
 const count=Math.max(1,+$('#rp-count').value||1);
 let pool=[];
 if(rpMode==='names'){pool=$('#rp-names').value.split('\n').map(s=>s.trim()).filter(Boolean);}
 else{const mn=+$('#rp-min').value||0,mx=+$('#rp-max').value||0;for(let i=mn;i<=mx;i++)pool.push(String(i));}
 const box=$('#rp-res');
 if(pool.length<count){box.innerHTML='পর্যাপ্ত অপশন নেই — আরও Name/বড় রেঞ্জ days।';box.classList.add('show');return;}
 const copy=pool.slice(),winners=[];
 for(let i=0;i<count;i++){winners.push(copy.splice(randInt(copy.length),1)[0]);}
 box.innerHTML=Tf("<p style=\"margin:0;font-size:15px;color:var(--ink2)\">🏆 বিজয়ী</p><p style=\"margin:4px 0 0;font-size:clamp(24px,6vw,36px);font-weight:800\">{0}</p>",winners.join(' · '));
 box.classList.add('show');
});
/* ===== Stopwatch & Timer ===== */
let swInt=null,swStart=0,swElapsed=0,swRun=false,lapN=0;
function swFmt(ms){const t=Math.floor(ms/100);const m=Math.floor(t/600),s=Math.floor(t/10)%60,d=t%10;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+d;}
$('#sw-go').addEventListener('click',()=>{
 if(swRun){clearInterval(swInt);swElapsed+=Date.now()-swStart;swRun=false;$('#sw-go').textContent='Resume';}
 else{swStart=Date.now();swRun=true;$('#sw-go').textContent='Pause';
  swInt=setInterval(()=>{$('#sw-disp').textContent=swFmt(swElapsed+(Date.now()-swStart));},47);}
});
$('#sw-lap').addEventListener('click',()=>{if(!swRun&&!swElapsed)return;lapN++;
 const cur=swFmt(swElapsed+(swRun?Date.now()-swStart:0));
 $('#sw-laps').insertAdjacentHTML('afterbegin',`<div class="kv"><span>Lap ${lapN}</span><b class="mono">${cur}</b></div>`);});
$('#sw-reset').addEventListener('click',()=>{clearInterval(swInt);swRun=false;swElapsed=0;lapN=0;$('#sw-disp').textContent='00:00.0';$('#sw-laps').innerHTML='';$('#sw-go').textContent='Start';});
let tmInt=null,tmLeft=0,tmRun=false,audioCtx=null;
function tmRender(){const s=Math.max(0,Math.ceil(tmLeft/1000));$('#tm-disp').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function beep(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
 const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);
 o.frequency.value=880;g.gain.setValueAtTime(0.001,audioCtx.currentTime);
 g.gain.exponentialRampToValueAtTime(0.4,audioCtx.currentTime+0.05);
 g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+1.1);
 o.start();o.stop(audioCtx.currentTime+1.2);}catch(e){}}
$('#tm-go').addEventListener('click',()=>{
 if(tmRun){clearInterval(tmInt);tmRun=false;$('#tm-go').textContent='Resume';return;}
 if(tmLeft<=0)tmLeft=((+$('#tm-min').value||0)*60+(+$('#tm-sec').value||0))*1000;
 if(tmLeft<=0){toast(T('সময় days'));return;}
 const end=Date.now()+tmLeft;tmRun=true;$('#tm-go').textContent='Pause';
 tmInt=setInterval(()=>{tmLeft=end-Date.now();tmRender();
   if(tmLeft<=0){clearInterval(tmInt);tmRun=false;tmLeft=0;tmRender();$('#tm-go').textContent='Start';beep();toast(T('⏰ টাইম শেষ!'));}},200);
 tmRender();
});
$('#tm-reset').addEventListener('click',()=>{clearInterval(tmInt);tmRun=false;tmLeft=((+$('#tm-min').value||0)*60+(+$('#tm-sec').value||0))*1000;$('#tm-go').textContent='Start';tmRender();});
tmLeft=5*60000;tmRender();
/* ===== Color picker ===== */
let cpImg=null,cpHex='';
$('#cp-file').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;cpImg=await loadImgFile(f);
 const c=$('#cp-canvas');const max=900;let w=cpImg.naturalWidth,h=cpImg.naturalHeight;
 if(w>max){h=Math.round(h*max/w);w=max;}
 c.width=w;c.height=h;c.getContext('2d').drawImage(cpImg,0,0,w,h);
 $('#cp-palette').innerHTML='';$('#cp-wrap').classList.add('show');
});
function cpPick(cx,cy){
 const c=$('#cp-canvas');const r=c.getBoundingClientRect();
 const x=Math.floor((cx-r.left)*c.width/r.width),y=Math.floor((cy-r.top)*c.height/r.height);
 const d=c.getContext('2d').getImageData(x,y,1,1).data;
 const hex='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
 cpHex=hex;$('#cp-hex').textContent=hex;$('#cp-rgb').textContent=`rgb(${d[0]}, ${d[1]}, ${d[2]})`;
 $('#cp-cur').style.background=hex;
 const pal=$('#cp-palette');
 if(!Array.from(pal.children).some(s=>s.dataset.hex===hex)){
   const s=document.createElement('div');s.className='swatch';s.style.background=hex;s.dataset.hex=hex;s.title=hex;
   s.onclick=()=>{cpHex=hex;$('#cp-hex').textContent=hex;$('#cp-cur').style.background=hex;};
   pal.appendChild(s);}
}
$('#cp-canvas').addEventListener('click',e=>cpPick(e.clientX,e.clientY));
$('#cp-copy').addEventListener('click',()=>{if(cpHex)copyText(cpHex,'HEX copied ✓');});
