(function(){
  // Set this to your Formspree endpoint, e.g. "https://formspree.io/f/abcdwxyz", to send quote requests directly.
  // Leave empty and the form opens the visitor's mail app instead.
  var FORM_ENDPOINT = "";

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

  // product page: variant select and gallery
  var sel=document.getElementById('variant'),buyBtn=document.getElementById('buyBtn'),price=document.getElementById('price'),buy=document.querySelector('.buy');
  if(sel&&buyBtn){
    sel.addEventListener('change',function(){
      var o=sel.options[sel.selectedIndex];
      price.textContent='$'+(Number(o.dataset.price)%1?Number(o.dataset.price).toFixed(2):Number(o.dataset.price).toFixed(0));
      var link=o.dataset.link||buy.dataset.default;
      buyBtn.href=link||buy.dataset.order;
      buyBtn.textContent=link?'Buy now with card':'Order this';
    });
  }
  var main=document.getElementById('mainImg');
  document.querySelectorAll('.thumbs button').forEach(function(b){
    b.addEventListener('click',function(){main.src=b.dataset.src;document.querySelectorAll('.thumbs button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');});
  });

  // quote form
  var f=document.getElementById('quoteForm');
  if(f){
    var box=document.getElementById('sent'),submit=document.getElementById('qSubmit');
    try{var pre=new URLSearchParams(location.search).get('product');if(pre&&f.message){f.message.value='I would like to order: '+pre+'\n\nQuantity: \nAny changes or personalisation: ';}}catch(_){}
    f.addEventListener('submit',function(e){
      e.preventDefault();
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
      fetch(FORM_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},
        body:JSON.stringify({name:name,email:email,material:material,thickness:thk,message:msg,_subject:subject})})
      .then(function(r){if(!r.ok)throw new Error('send failed');
        document.getElementById('sentTitle').textContent='Sent.';
        document.getElementById('sentBody').textContent='Thanks '+name+', we will reply to '+email+' within 24 hours.';
        document.getElementById('sentText').hidden=true;
        box.classList.add('show');f.reset();})
      .catch(function(){showFallback();})
      .finally(function(){submit.disabled=false;submit.textContent='Send quote request';});
    });
  }
})();
