
/* ===== 12 NEW TOOLS (2026-10-27, local) ===== */
(function(){
function $(id){return document.getElementById(id);}
function out(id,msg){var e=$(id);if(e)e.textContent=msg;}
async function tbAi(system,user){
  try{
    var r=await fetch('https://text.pollinations.ai/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:system},{role:'user',content:user}]})});
    if(!r.ok)throw new Error('err');
    var t=await r.text();
    if(!t.trim()||t.indexOf('INTERNAL_ERROR')>=0)throw new Error('err');
    return t.trim();
  }catch(e){
    var r2=await fetch('https://text.pollinations.ai/'+encodeURIComponent(system+' '+user));
    if(!r2.ok)throw new Error('AI service error');
    var t2=await r2.text();
    if(!t2.trim()||t2.indexOf('INTERNAL_ERROR')>=0)throw new Error('AI service error');
    return t2.trim();
  }
}
function coverDraw(ctx,img,W,H){var sc=Math.max(W/img.width,H/img.height);var w=img.width*sc,h=img.height*sc;ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h);}
function loadImgs(inputEl,arr,outId,doneMsg){
  var inp=$(inputEl); if(!inp)return;
  inp.addEventListener('change',function(e){
    arr.length=0; var fs=e.target.files; if(!fs.length){out(outId,'No photos chosen.');return;}
    var done=0;
    Array.prototype.forEach.call(fs,function(f){
      var rd=new FileReader();
      rd.onload=function(ev){var im=new Image();im.onload=function(){done++;if(done===fs.length)out(outId,done+' photo(s) loaded.');};im.src=ev.target.result;arr.push(im);};
      rd.readAsDataURL(f);
    });
  });
}
function tbRecord(canvas,durMs,total,drawFn,videoEl,outId,filename){
  if(!('MediaRecorder' in window)){out(outId,'Video recording is not supported in this browser.');return;}
  var idx=0; drawFn(0);
  var stream=canvas.captureStream(30); var mt='';
  ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].forEach(function(m){if(!mt&&MediaRecorder.isTypeSupported(m))mt=m;});
  var rec=new MediaRecorder(stream,mt?{mimeType:mt}:{}); var chunks=[];
  rec.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};
  rec.onstop=function(){var blob=new Blob(chunks,{type:'video/webm'});var u=URL.createObjectURL(blob);var v=$(videoEl);if(v){v.src=u;v.style.display='block';}var a=document.createElement('a');a.href=u;a.download=filename;a.click();out(outId,'Video recorded. Download started (WebM).');};
  rec.start();
  var iv=setInterval(function(){idx++;if(idx<total){drawFn(idx);}else{clearInterval(iv);rec.stop();}},durMs);
  out(outId,'Recording\u2026 please wait until it finishes.');
}
/* Prompt to Image */
(function(){
  var go=$('pti-go'); if(!go)return;
  var img=$('pti-img');
  go.addEventListener('click',function(){
    var p=$('pti-prompt').value.trim(); if(!p){out('pti-out','Please type a prompt first.');return;}
    var sz=$('pti-size').value.split('x');
    var url='https://image.pollinations.ai/prompt/'+encodeURIComponent(p)+'?width='+sz[0]+'&height='+sz[1]+'&seed='+Math.floor(Math.random()*1000000)+'&nologo=true';
    out('pti-out','Generating image\u2026 please wait.'); img.style.display='none';
    var wrap=img.closest('.stage-wrap'); if(wrap)wrap.classList.add('show');
    img.onload=function(){img.style.display='block'; if(wrap)wrap.classList.add('show'); out('pti-out','Image ready. Tap Download JPG to save it.');};
    img.onerror=function(){out('pti-out','The image service did not respond. Please try again in a moment.');};
    img.src=url;
  });
  $('pti-dl').addEventListener('click',function(){
    if(img.style.display!=='block'||!img.src){out('pti-out','Generate an image first.');return;}
    fetch(img.src).then(function(r){return r.blob();}).then(function(b){
      if((b.type||'').indexOf('json')>=0){out('pti-out','Free limit reached (Pollinations: 1 free image every 45 seconds). Please wait 45 seconds and tap Generate again.');return;}
      var cv=document.createElement('canvas'); cv.width=img.naturalWidth||1024; cv.height=img.naturalHeight||1024;
      var ctx=cv.getContext('2d'); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,cv.width,cv.height); ctx.drawImage(img,0,0,cv.width,cv.height);
      cv.toBlob(function(jb){var a=document.createElement('a');a.href=URL.createObjectURL(jb);a.download='prompt-to-image.jpg';a.click();out('pti-out','JPG downloaded.');},'image/jpeg',0.92);
    }).catch(function(){var a=document.createElement('a');a.href=img.src;a.target='_blank';a.click();out('pti-out','Download opened in a new tab.');});
  });
})();
/* AI Chat */
(function(){
  var go=$('ach-go'); if(!go)return; var hist=[];
  function add(who,txt){var log=$('ach-log');var p=document.createElement('p');p.innerHTML='<strong>'+who+':</strong> '+txt.replace(/</g,'&lt;');log.appendChild(p);}
  go.addEventListener('click',async function(){
    var q=$('ach-in').value.trim(); if(!q){out('ach-out','Please type a message first.');return;}
    add('You',q); $('ach-in').value=''; out('ach-out','AI is thinking\u2026');
    try{
      hist.push({role:'user',content:q}); var a='';
      try{ a=await tbAi('You are a helpful assistant. Answer briefly and clearly.', q); }
      catch(e){ var r2=await fetch('https://text.pollinations.ai/'+encodeURIComponent(q)); if(!r2.ok)throw new Error('err'); a=(await r2.text()).trim(); if(!a||a.indexOf('INTERNAL_ERROR')>=0)throw new Error('err'); }
      hist.push({role:'assistant',content:a}); add('AI',a); out('ach-out','');
    }catch(e){ out('ach-out','The AI service did not respond. Please try again in a moment.'); }
  });
  $('ach-clear').addEventListener('click',function(){ $('ach-log').innerHTML=''; hist=[]; out('ach-out',''); });
})();
/* AI Caption / Title / Bio */
(function(){
  var go=$('ctb-go'); if(!go)return;
  go.addEventListener('click',async function(){
    var mode=$('ctb-mode').value, topic=$('ctb-topic').value.trim();
    if(!topic){out('ctb-out','Please type a topic first.');return;}
    out('ctb-out','Generating ideas\u2026');
    try{
      var t=await tbAi('You write short social media ideas. Reply with one idea per line, no numbering, no extra explanation.','Write 8 short '+mode+' about: '+topic);
      var lines=t.split('\n').map(function(x){return x.replace(/^\s*[-*\d.)\s]+/,'').trim();}).filter(Boolean).slice(0,8);
      $('ctb-out').innerHTML='<ul>'+lines.map(function(x){return '<li>'+x.replace(/</g,'&lt;')+'</li>';}).join('')+'</ul>';
    }catch(e){ out('ctb-out','The AI service did not respond. Please try again in a moment.'); }
  });
})();
/* AI Story / Script */
(function(){
  var go=$('ss-go'); if(!go)return;
  go.addEventListener('click',async function(){
    var idea=$('ss-idea').value.trim(), typ=$('ss-type').value, len=$('ss-len').value;
    if(!idea){out('ss-out','Please type an idea first.');return;}
    out('ss-out','Writing\u2026 please wait.');
    try{
      var t=await tbAi('You are a creative writer. Write clearly and simply.','Write a '+len+' '+typ+' based on this idea: '+idea);
      $('ss-out').innerHTML='<p>'+t.replace(/</g,'&lt;').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>';
    }catch(e){ out('ss-out','The AI service did not respond. Please try again in a moment.'); }
  });
})();
/* AI Summarizer */
(function(){
  var go=$('sm-go'); if(!go)return;
  go.addEventListener('click',async function(){
    var txt=$('sm-in').value.trim(), len=$('sm-len').value;
    if(txt.length<50){out('sm-out','Please paste at least a few sentences first.');return;}
    out('sm-out','Summarizing\u2026');
    try{
      var t=await tbAi('You summarize text accurately without adding new facts.','Summarize this text in '+len+':\n\n'+txt.slice(0,6000));
      $('sm-out').innerHTML='<p>'+t.replace(/</g,'&lt;')+'</p>';
    }catch(e){
      var sents=txt.split(/(?<=[.!?])\s+/).filter(Boolean);
      var n=(len.indexOf('2-3')>=0)?3:6;
      $('sm-out').innerHTML='<p><strong>Simple extract (not AI \u2014 the AI service did not respond):</strong></p><p>'+sents.slice(0,n).join(' ').replace(/</g,'&lt;')+'</p>';
    }
  });
})();
/* AI Voice (browser speech) */
(function(){
  var go=$('av-go'); if(!go)return;
  function loadVoices(){
    if(!('speechSynthesis' in window)){out('av-out','Speech is not supported in this browser.');return;}
    var vs=speechSynthesis.getVoices(); var sel=$('av-voice'); sel.innerHTML='';
    vs.forEach(function(v,i){var o=document.createElement('option');o.value=i;o.textContent=v.name+' ('+v.lang+')';sel.appendChild(o);});
    if(!vs.length)out('av-out','No voices found on this device.');
  }
  if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }
  go.addEventListener('click',function(){
    if(!('speechSynthesis' in window)){out('av-out','Speech is not supported in this browser.');return;}
    var txt=$('av-in').value.trim(); if(!txt){out('av-out','Please type some text first.');return;}
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(txt); var vs=speechSynthesis.getVoices();
    if(vs[$('av-voice').value])u.voice=vs[$('av-voice').value];
    u.rate=parseFloat($('av-rate').value); u.pitch=parseFloat($('av-pitch').value);
    u.onend=function(){out('av-out','Finished speaking.');};
    u.onerror=function(){out('av-out','Speech failed on this device.');};
    speechSynthesis.speak(u); out('av-out','Speaking\u2026');
  });
  $('av-stop').addEventListener('click',function(){ if('speechSynthesis' in window)speechSynthesis.cancel(); out('av-out','Stopped.'); });
})();
/* Voice to Text Note */
(function(){
  var start=$('vn-start'); if(!start)return;
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition; var rec=null;
  if(!SR){ out('vn-out','Voice recognition is not supported in this browser. Please try Chrome on desktop or Android.'); start.disabled=true; return; }
  start.addEventListener('click',function(){
    try{
      rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang=$('vn-lang').value;
      rec.onresult=function(e){ var txt=''; for(var i=e.resultIndex;i<e.results.length;i++){txt+=e.results[i][0].transcript;} if(e.results[e.results.length-1].isFinal){var n=$('vn-note'); n.value=(n.value?n.value+' ':'')+txt.trim();} out('vn-out','Listening\u2026'); };
      rec.onerror=function(ev){ out('vn-out','Microphone or recognition error: '+ev.error+'. Please allow the microphone and try again.'); };
      rec.onend=function(){ out('vn-out','Stopped listening.'); };
      rec.start(); out('vn-out','Listening\u2026 speak now.');
    }catch(err){ out('vn-out','Could not start listening. Please allow the microphone and try again.'); }
  });
  $('vn-stop').addEventListener('click',function(){ if(rec)rec.stop(); });
  $('vn-copy').addEventListener('click',function(){ if(navigator.clipboard)navigator.clipboard.writeText($('vn-note').value); out('vn-out','Note copied.'); });
  $('vn-dl').addEventListener('click',function(){ var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([$('vn-note').value],{type:'text/plain'})); a.download='voice-note.txt'; a.click(); });
})();
/* Online Translator */
(function(){
  var go=$('tr-go'); if(!go)return;
  $('tr-swap').addEventListener('click',function(){ var f=$('tr-from'),t=$('tr-to'),v=f.value; f.value=t.value; t.value=v; });
  go.addEventListener('click',async function(){
    var txt=$('tr-in').value.trim(); if(!txt){out('tr-out','Please type some text first.');return;}
    out('tr-out','Translating\u2026');
    try{
      var url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(txt)+'&langpair='+$('tr-from').value+'|'+$('tr-to').value;
      var r=await fetch(url); var d=await r.json();
      if(d.quotaFinished)throw new Error('quota');
      var t=d.responseData&&d.responseData.translatedText;
      if(!t||t==='QUERY LENGTH LIMIT EXCEEDED')throw new Error('bad');
      $('tr-out').innerHTML='<p><strong>Translation:</strong></p><p id="tr-res">'+t.replace(/</g,'&lt;')+'</p>';
    }catch(e){ out('tr-out','Translation failed or the free service is busy. Please try again in a moment.'); }
  });
  $('tr-copy').addEventListener('click',function(){ var el=$('tr-res'); if(el&&navigator.clipboard)navigator.clipboard.writeText(el.textContent); });
})();
/* Birthday Video Maker */
(function(){
  var go=$('bv-go'); if(!go)return; var imgs=[]; loadImgs('bv-files',imgs,'bv-out','');
  var cv=$('bv-cv'), ctx=cv.getContext('2d');
  function draw(i){
    var g=ctx.createLinearGradient(0,0,1280,720); g.addColorStop(0,'#7c3aed'); g.addColorStop(1,'#db2777');
    ctx.fillStyle=g; ctx.fillRect(0,0,1280,720);
    if(imgs[i])coverDraw(ctx,imgs[i],1280,720);
    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,520,1280,200);
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 64px sans-serif';
    ctx.fillText($('bv-msg').value||'Happy Birthday!',640,600);
    var nm=$('bv-name').value.trim(); if(nm){ctx.font='40px sans-serif'; ctx.fillText(nm,640,665);}
  }
  var timer=null;
  $('bv-preview').addEventListener('click',function(){
    if(timer)clearInterval(timer); var idx=0; draw(0);
    var dur=parseInt($('bv-dur').value,10)*1000; var total=Math.max(imgs.length,1);
    timer=setInterval(function(){idx=(idx+1)%total; draw(idx);},dur);
    out('bv-out','Preview playing on the canvas above.');
  });
  go.addEventListener('click',function(){
    if(timer)clearInterval(timer);
    var dur=parseInt($('bv-dur').value,10)*1000; var total=Math.max(imgs.length,1);
    tbRecord(cv,dur,total,draw,'bv-vid','bv-out','birthday-video.webm');
  });
  draw(0);
})();
/* Easy Video Maker */
(function(){
  var go=$('ev-go'); if(!go)return; var imgs=[]; loadImgs('ev-files',imgs,'ev-out','');
  var cv=$('ev-cv'), ctx=cv.getContext('2d');
  function caps(){ return $('ev-caps').value.split('\n'); }
  function draw(i){
    var g=ctx.createLinearGradient(0,0,1280,720); g.addColorStop(0,'#0f766e'); g.addColorStop(1,'#1e293b');
    ctx.fillStyle=g; ctx.fillRect(0,0,1280,720);
    if(imgs[i])coverDraw(ctx,imgs[i],1280,720);
    var c=(caps()[i]||'').trim();
    if(c){ ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,600,1280,120); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 44px sans-serif'; ctx.fillText(c.slice(0,80),640,675); }
  }
  var timer=null;
  $('ev-preview').addEventListener('click',function(){
    if(timer)clearInterval(timer); var idx=0; draw(0);
    var dur=parseInt($('ev-dur').value,10)*1000; var total=Math.max(imgs.length,1);
    timer=setInterval(function(){idx=(idx+1)%total; draw(idx);},dur);
    out('ev-out','Preview playing on the canvas above.');
  });
  go.addEventListener('click',function(){
    if(timer)clearInterval(timer);
    var dur=parseInt($('ev-dur').value,10)*1000; var total=Math.max(imgs.length,1);
    tbRecord(cv,dur,total,draw,'ev-vid','ev-out','slideshow-video.webm');
  });
  draw(0);
})();
/* Business Card Maker */
(function(){
  var drawBtn=$('bc-draw'); if(!drawBtn)return;
  var cv=$('bc-cv'), ctx=cv.getContext('2d');
  function draw(){
    var theme=$('bc-theme').value;
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,1050,600);
    ctx.fillStyle=theme; ctx.fillRect(0,0,1050,170);
    ctx.fillStyle='#fff'; ctx.font='bold 56px sans-serif'; ctx.fillText($('bc-name').value||'Your Name',60,105);
    ctx.font='28px sans-serif'; ctx.fillText($('bc-job').value||'',60,150);
    ctx.fillStyle='#111'; ctx.font='32px sans-serif'; var y=250;
    ['bc-co','bc-phone','bc-mail'].forEach(function(id){ var v=$(id).value.trim(); if(v){ctx.fillText(v,60,y); y+=55;} });
    ctx.fillStyle=theme; ctx.fillRect(0,560,1050,40);
  }
  drawBtn.addEventListener('click',draw);
  $('bc-dl').addEventListener('click',function(){ draw(); var a=document.createElement('a'); a.download='business-card.png'; a.href=cv.toDataURL('image/png'); a.click(); });
  draw();
})();
/* Photo Collage Maker */
(function(){
  var go=$('pcl-go'); if(!go)return; var imgs=[]; loadImgs('pcl-files',imgs,'pcl-out','');
  var cv=$('pcl-cv'), ctx=cv.getContext('2d');
  function slot(x,y,w,h,im){
    if(im){ ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); coverDraw(ctx,im,w,h); ctx.restore(); }
    else{ ctx.fillStyle='#ddd'; ctx.fillRect(x,y,w,h); }
  }
  go.addEventListener('click',function(){
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,1200,800);
    var L=$('pcl-layout').value;
    if(L==='2'){ slot(0,0,600,800,imgs[0]); slot(600,0,600,800,imgs[1]); }
    else if(L==='3'){ slot(0,0,800,800,imgs[0]); slot(800,0,400,400,imgs[1]); slot(800,400,400,400,imgs[2]); }
    else{ slot(0,0,600,400,imgs[0]); slot(600,0,600,400,imgs[1]); slot(0,400,600,400,imgs[2]); slot(600,400,600,400,imgs[3]); }
    out('pcl-out','Collage ready. Tap Download PNG to save it.');
  });
  $('pcl-dl').addEventListener('click',function(){ var a=document.createElement('a'); a.download='photo-collage.png'; a.href=cv.toDataURL('image/png'); a.click(); });
})();
})();

