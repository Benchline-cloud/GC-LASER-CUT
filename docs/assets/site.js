(function(){
  // Set this to your Formspree endpoint, e.g. "https://formspree.io/f/abcdwxyz", to send quote requests directly.
  // Leave empty and the form opens the visitor's mail app instead.
  var FORM_ENDPOINT = "https://formspree.io/f/mrppvkjp";
  // Formspree only accepts file attachments on a paid plan. Set this to true after upgrading
  // and the drag-and-drop field appears on the contact page; false shows an email note instead.
  var FILE_UPLOADS = false;

  // background laser: scores geometric outlines into the dark hero surface, one shape at a time
  (function(){
    var c=document.getElementById('bgLaser');
    if(!c||!c.getContext||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var ctx=c.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
    var scar=document.createElement('canvas'),sctx=scar.getContext('2d'); // persistent scorched lines
    function size(){var r=c.getBoundingClientRect();W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
      c.width=scar.width=W*dpr;c.height=scar.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);sctx.setTransform(dpr,0,0,dpr,0,0);sctx.clearRect(0,0,W,H);}
    size();window.addEventListener('resize',size);
    // a family of laser-cut outlines: snowflake, gear, mandala petal ring
    function shape(cx,cy,r,kind){
      var pts=[],n,i,a,rr;
      if(kind===0){n=12;for(i=0;i<=n*2;i++){a=i*Math.PI/n;rr=i%2?r*.45:r;if(i%4===1)rr=r*.62;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}}
      else if(kind===1){n=14;for(i=0;i<=n*4;i++){a=i*Math.PI/(n*2);rr=(i%4<2)?r:r*.8;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}}
      else{n=8;for(i=0;i<=n*6;i++){a=i*Math.PI/(n*3);var k=i%6;rr=k===0?r*.55:(k===3?r:r*.78);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}}
      return pts;
    }
    var path=[],seg=0,t=0,speed=0,kind=0,restUntil=0,fading=false,lastTs=0;
    function newShape(){
      kind=(kind+1)%3;
      var r=Math.min(W,H)*(0.22+Math.random()*0.14);
      var cx=r+Math.random()*(W-2*r),cy=r*0.9+Math.random()*Math.max(1,H-1.8*r);
      path=shape(cx,cy,r,kind);seg=0;t=0;
      var len=0;for(var i=1;i<path.length;i++)len+=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);
      speed=len/9000; // px per ms: each outline takes about 9 seconds
    }
    newShape();
    function frame(ts){
      requestAnimationFrame(frame);
      if(document.hidden)return;
      var dt=lastTs?Math.min(50,ts-lastTs):16;lastTs=ts;
      if(ts<restUntil){draw(null);return;}
      if(fading){sctx.globalCompositeOperation='destination-out';sctx.fillStyle='rgba(0,0,0,.06)';sctx.fillRect(0,0,W,H);sctx.globalCompositeOperation='source-over';
        if((fading-=dt)<=0){fading=false;sctx.clearRect(0,0,W,H);newShape();}draw(null);return;}
      var a=path[seg],b=path[seg+1];
      var L=Math.hypot(b[0]-a[0],b[1]-a[1]);t+=speed*dt;
      while(t>=L){
        sctx.strokeStyle='rgba(255,170,90,.55)';sctx.lineWidth=1.4;sctx.lineCap='round';sctx.beginPath();sctx.moveTo(a[0],a[1]);sctx.lineTo(b[0],b[1]);sctx.stroke();
        t-=L;seg++;
        if(seg>=path.length-1){restUntil=ts+1800;fading=2200;draw(null);return;}
        a=path[seg];b=path[seg+1];L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      }
      var k=t/L,x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k;
      sctx.strokeStyle='rgba(255,170,90,.55)';sctx.lineWidth=1.4;sctx.beginPath();sctx.moveTo(a[0],a[1]);sctx.lineTo(x,y);sctx.stroke();
      draw([x,y]);
    }
    function draw(head){
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(scar,0,0,W,H);
      if(!head)return;
      var g=ctx.createRadialGradient(head[0],head[1],0,head[0],head[1],26);
      g.addColorStop(0,'rgba(255,200,140,.95)');g.addColorStop(.25,'rgba(255,120,40,.55)');g.addColorStop(1,'rgba(255,100,20,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(head[0],head[1],26,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff6e8';ctx.beginPath();ctx.arc(head[0],head[1],2.2,0,Math.PI*2);ctx.fill();
    }
    requestAnimationFrame(frame);
  })();

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
