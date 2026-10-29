/* TB-IDEAS-2026-10-27: (1) big Copy Result button after result panels that lack one, reusing copyText/toast; (2) live as-you-type suggestions from real TOOLS names only. Existing chips, filter, categories and Sponsored gate untouched. */
(function(){
  try{
    var inp=document.getElementById('toolSearch'), box=document.getElementById('tb-live-sug');
    if(inp&&box&&typeof TOOLS!=='undefined'&&TOOLS&&TOOLS.length){
      function hideSug(){ box.hidden=true; box.innerHTML=''; }
      function showSug(){
        var q=inp.value.trim().toLowerCase();
        if(!q){ hideSug(); return; }
        var hits=[];
        for(var i=0;i<TOOLS.length&&hits.length<8;i++){
          var t=TOOLS[i], name=t.bn||'';
          if(name.toLowerCase().indexOf(q)>=0||String(t.id).toLowerCase().indexOf(q)>=0) hits.push(t);
        }
        if(!hits.length){ hideSug(); return; }
        box.innerHTML='';
        hits.forEach(function(t){
          var b=document.createElement('button');
          b.type='button'; b.setAttribute('role','option'); b.textContent=t.bn||t.id;
          b.addEventListener('click',function(){
            inp.value=t.bn||t.id; hideSug();
            inp.dispatchEvent(new Event('input',{bubbles:true}));
            var all=document.querySelector('#allBlock');
            if(all) all.scrollIntoView({behavior:'smooth'});
          });
          box.appendChild(b);
        });
        box.hidden=false;
      }
      inp.addEventListener('input',showSug);
      inp.addEventListener('keydown',function(e){ if(e.key==='Escape') hideSug(); });
      document.addEventListener('click',function(e){ if(e.target!==inp&&!box.contains(e.target)) hideSug(); });
    }
  }catch(e){}
  try{
    if(typeof copyText!=='function') return;
    function panelHasCopy(panel){
      if(!panel) return false;
      if(panel.querySelector('button[id$="-copy"]')) return true;
      var btns=panel.querySelectorAll('button');
      for(var i=0;i<btns.length;i++){ if(/copy|\u0995\u09aa\u09bf/i.test(btns[i].textContent||'')) return true; }
      return false;
    }
    var results=document.querySelectorAll('.view .result');
    results.forEach(function(res){
      if(res.closest('#view-video-downloader')) return;
      var panel=res.closest('.panel')||res.parentElement;
      if(!panel||panelHasCopy(panel)) return;
      if(panel.querySelector('img')) return;
      if(res.id==='pti-out') return;
      if(panel.querySelector('.tb-copy-result')) return;
      var btn=document.createElement('button');
      btn.type='button'; btn.className='btn tb-copy-result'; btn.textContent='Copy Result';
      btn.setAttribute('aria-label','Copy result');
      function sync(){ btn.style.display=res.textContent.trim()?'':'none'; }
      btn.addEventListener('click',function(){
        var txt=(res.innerText||res.textContent||'').trim();
        if(!txt) return;
        copyText(txt,'Copied \u2713');
      });
      res.parentNode.insertBefore(btn,res.nextSibling);
      sync();
      try{ var mo=new MutationObserver(sync); mo.observe(res,{childList:true,characterData:true,subtree:true}); }catch(e){}
    });
  }catch(e){}
})();
