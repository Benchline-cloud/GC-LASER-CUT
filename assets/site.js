(function(){
  // Set this to your Formspree endpoint, e.g. "https://formspree.io/f/abcdwxyz", to send quote requests directly.
  // Leave empty and the form opens the visitor's mail app instead.
  var FORM_ENDPOINT = "https://formspree.io/f/mrppvkjp";
  // Formspree only accepts file attachments on a paid plan. Set this to true after upgrading
  // and the drag-and-drop field appears on the contact page; false shows an email note instead.
  var FILE_UPLOADS = false;

  // scorched underline draws under section headings as they scroll into view
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.documentElement.classList.add('kerf-ready');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.6});
    document.querySelectorAll('section > .wrap > h2, .about-grid h2').forEach(function(x){io.observe(x);});
  }

  var btn=document.getElementById('menuBtn'),nav=document.getElementById('mainNav');
  if(btn&&nav){
    btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o);});
    nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  }

  document.querySelectorAll('.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.getAttribute('data-copy');
      function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy';},1500);}
      function fallback(){window.getSelection().selectAllChildren(b.previousElementSibling);}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(fallback);}else{fallback();}
    });
  });

  // quote form
  var f=document.getElementById('quoteForm');
  if(f){
    // --- file attachments: allowlist by extension AND by content, with size and count caps ---
    var MAX_FILES=5, MAX_BYTES=25*1024*1024, ALLOWED={dxf:1,svg:1,ai:1,pdf:1};
    var chosen=[];
    var drop=document.getElementById('drop'), fileInput=document.getElementById('qFiles'), list=document.getElementById('fileList'), ferr=document.getElementById('fileError');
    function showErr(m){if(ferr){ferr.textContent=m;ferr.hidden=!m;}}
    function fmt(n){return n<1024*1024?Math.round(n/1024)+' KB':(n/1024/1024).toFixed(1)+' MB';}
    function render(){
      if(!list)return; list.innerHTML='';
      chosen.forEach(function(file,i){
        var li=document.createElement('li'),s=document.createElement('span'),sm=document.createElement('small'),b=document.createElement('button');
        s.textContent=file.name; sm.textContent=fmt(file.size); b.type='button'; b.textContent='Remove';
        b.addEventListener('click',function(){chosen.splice(i,1);render();});
        li.appendChild(s);li.appendChild(sm);li.appendChild(b);list.appendChild(li);
      });
    }
    // Reads the first 4 KB and checks the file really is what its name claims.
    function sniff(file){
      return new Promise(function(res){
        var ext=(file.name.split('.').pop()||'').toLowerCase();
        var r=new FileReader();
        r.onload=function(){
          var head=String(r.result||''), ok=false, why='';
          if(ext==='pdf'||ext==='ai'){ ok=/^%PDF-/.test(head)||(ext==='ai'&&/^%!PS-Adobe/.test(head)); why='does not look like a real '+ext.toUpperCase()+' file'; }
          else if(ext==='svg'){
            ok=/<svg[\s>]/i.test(head); why='does not look like an SVG file';
            if(ok&&/<script|javascript:|\son[a-z]+\s*=|<foreignObject|<iframe|<embed|<object|<set\b|<animate/i.test(head)){ ok=false; why='contains scripting or embedded content, which we do not accept. Export a plain SVG from your drawing program'; }
          }
          else if(ext==='dxf'){ ok=/^\s*0\s*[\r\n]+\s*SECTION/.test(head)||/^\s*999/.test(head)||/^AutoCAD Binary DXF/.test(head); why='does not look like a DXF file'; }
          res({ok:ok,why:why});
        };
        r.onerror=function(){res({ok:false,why:'could not be read'});};
        r.readAsText(file.slice(0,4096));
      });
    }
    function addFiles(files){
      showErr('');
      var queue=Array.prototype.slice.call(files||[]);
      (function next(){
        var file=queue.shift(); if(!file){render();return;}
        var ext=(file.name.split('.').pop()||'').toLowerCase();
        if(!ALLOWED[ext]){showErr(file.name+': only DXF, SVG, AI or PDF files are accepted.');return next();}
        if(file.size>MAX_BYTES){showErr(file.name+' is larger than 25 MB. Export a lighter file or send a link.');return next();}
        if(file.size===0){showErr(file.name+' is empty.');return next();}
        if(chosen.length>=MAX_FILES){showErr('Up to 5 files per request.');return render();}
        if(chosen.some(function(c){return c.name===file.name&&c.size===file.size;})){return next();}
        sniff(file).then(function(v){ if(!v.ok){showErr(file.name+' '+v.why+'.');} else {chosen.push(file);} next(); });
      })();
    }
    var fileField=drop?drop.parentNode:null;
    if(fileField&&!FILE_UPLOADS){
      var note=document.createElement("p");note.className="formnote";note.id="fileNote";
      note.textContent="Have a cutting file? Send this form first, then reply to our confirmation email with your DXF, SVG, AI or PDF attached.";
      fileField.replaceWith(note);drop=null;fileInput=null;
    }
    if(drop&&fileInput){
      fileInput.addEventListener('change',function(){addFiles(fileInput.files);fileInput.value='';});
      ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');});});
      ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');});});
      drop.addEventListener('drop',function(e){addFiles(e.dataTransfer&&e.dataTransfer.files);});
      drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
    }
    var box=document.getElementById('sent'),submit=document.getElementById('qSubmit');
    try{var pre=new URLSearchParams(location.search).get('product');if(pre&&f.message){f.message.value='I would like to order: '+pre+'\n\nQuantity: \nAny changes or personalisation: ';}}catch(_){}
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f._gotcha&&f._gotcha.value){return;}
      var name=f.name.value.trim(),email=f.email.value.trim(),msg=f.message.value.trim();
      if(!name||!email||!msg){[f.name,f.email,f.message].some(function(x){if(!x.value.trim()){x.focus();return true;}});return;}
      var material=f.material.value,thk=f.thickness.value||'not sure';
      var subject='Quote request: '+material+(f.thickness.value?' '+f.thickness.value+'mm':'');
      var body='Name: '+name+'\nEmail: '+email+'\nMaterial: '+material+'\nThickness: '+thk+' mm\n\n'+msg;
      function showFallback(){
        document.getElementById('sentTitle').textContent='Ready to send.';
        document.getElementById('sentBody').textContent='Email this to gclasercutting@gmail.com:';
        document.getElementById('sentText').value='Subject: '+subject+'\n\n'+body;
        box.classList.add('show');
        try{window.location.href='mailto:gclasercutting@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);}catch(_){}
      }
      if(!FORM_ENDPOINT){showFallback();return;}
      submit.disabled=true;submit.textContent='Sending';
      function sendJson(){
        return fetch(FORM_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify({name:name,email:email,material:material,thickness:thk,message:msg,_subject:subject,_gotcha:''})});
      }
      function sendWithFiles(){
        var fd=new FormData();
        fd.append('name',name);fd.append('email',email);fd.append('material',material);fd.append('thickness',thk);fd.append('message',msg);fd.append('_subject',subject);fd.append('_gotcha','');
        chosen.forEach(function(file,i){fd.append('file'+(i+1),file,file.name);});
        return fetch(FORM_ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:fd});
      }
      var attached=chosen.length>0;
      (attached?sendWithFiles():sendJson())
      .then(function(r){
        if(r.ok)return {ok:true,files:attached};
        if(attached)return sendJson().then(function(r2){if(!r2.ok)throw new Error('send failed');return {ok:true,files:false,dropped:true};});
        throw new Error('send failed');
      })
      .then(function(res){
        document.getElementById('sentTitle').textContent='Sent.';
        document.getElementById('sentBody').textContent='Thanks '+name+', we will reply to '+email+' within 24 hours.'+(res.dropped?' Your file could not be attached, so please reply to our email with it.':(res.files?' Your file came through.':''));
        document.getElementById('sentText').hidden=true;
        box.classList.add('show');f.reset();chosen=[];render();})
      .catch(function(){showFallback();})
      .finally(function(){submit.disabled=false;submit.textContent='Send quote request';});
    });
  }
})();
