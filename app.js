(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  // мобильное меню
  const menu=$('.menu');
  if(menu){
    $('.burger').addEventListener('click',()=>{menu.classList.add('open');document.body.style.overflow='hidden';
      $$('nav a',menu).forEach((a,i)=>a.style.transitionDelay=(.05+i*.05)+'s')});
    $('.menu .x').addEventListener('click',()=>{menu.classList.remove('open');document.body.style.overflow=''});
  }

  // появление при прокрутке
  const io='IntersectionObserver' in window? new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'}):null;
  window.__reveal=(root=document)=>$$('.reveal:not(.in)',root).forEach(el=>io?io.observe(el):el.classList.add('in'));
  window.__reveal();

  // главная: кадры и цитаты
  const mom=$('#moments');
  if(mom){
    const imgs=$$('img',mom), dots=$('#dots');
    imgs.forEach((_,i)=>{const d=document.createElement('i'); if(!i) d.className='on'; dots.appendChild(d)});
    let k=0; setInterval(()=>{imgs[k].classList.remove('on');dots.children[k].classList.remove('on');k=(k+1)%imgs.length;imgs[k].classList.add('on');dots.children[k].classList.add('on')},3800);
    mom.addEventListener('click',()=>location.href='foto.html');
  }
  const qs=$$('#quotes .q');
  if(qs.length){let j=0;setInterval(()=>{qs[j].classList.remove('on');j=(j+1)%qs.length;qs[j].classList.add('on')},5200)}

  // просмотр фото и видео
  const lb=document.createElement('div'); lb.className='lb';
  lb.innerHTML='<div class="stage"></div><button class="x" aria-label="Закрыть">×</button><button class="pv" aria-label="Назад">‹</button><button class="nx" aria-label="Дальше">›</button><div class="cnt"></div>';
  document.body.appendChild(lb);
  const stage=$('.stage',lb), cnt=$('.cnt',lb);
  let list=[], idx=0;
  function show(){
    const it=list[idx];
    if(it.yt){
      stage.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${it.yt}?autoplay=1&rel=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      cnt.innerHTML=(it.title||'')+` <a href="https://youtu.be/${it.yt}" target="_blank" rel="noopener">Открыть на YouTube</a>`;
    } else {
      stage.innerHTML=`<img src="${it.src}" alt="">`;
      cnt.textContent=list.length>1?`${idx+1} / ${list.length}`:'';
    }
    const many=list.length>1; $('.pv',lb).style.visibility=$('.nx',lb).style.visibility=many?'visible':'hidden';
  }
  function open(items,i){list=items;idx=i;show();lb.classList.add('open');document.body.style.overflow='hidden'}
  function close(){lb.classList.remove('open');stage.innerHTML='';document.body.style.overflow=menu&&menu.classList.contains('open')?'hidden':''}
  function step(d){idx=(idx+d+list.length)%list.length;show()}
  $('.x',lb).onclick=close; $('.pv',lb).onclick=()=>step(-1); $('.nx',lb).onclick=()=>step(1);
  lb.addEventListener('click',e=>{if(e.target===lb||e.target===stage)close()});
  document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return; if(e.key==='Escape')close(); if(e.key==='ArrowLeft')step(-1); if(e.key==='ArrowRight')step(1)});
  let sx=null; lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  lb.addEventListener('touchend',e=>{if(sx===null)return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50)step(dx<0?1:-1); sx=null});
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-lb]');
    if(a){e.preventDefault(); const g=a.dataset.lb, items=$$(`[data-lb="${g}"]`); open(items.map(x=>({src:x.getAttribute('href')})),items.indexOf(a)); return}
    const v=e.target.closest('[data-yt]');
    if(v){e.preventDefault(); const g=v.dataset.g, items=g?$$(`[data-yt][data-g="${g}"]`):[v]; open(items.map(x=>({yt:x.dataset.yt,title:x.dataset.title})),items.indexOf(v))}
  });

  // вкладки на странице фото
  const tabs=$$('.tabs button');
  if(tabs.length){
    function pick(id){tabs.forEach(b=>b.classList.toggle('on',b.dataset.t===id));$$('.pane').forEach(p=>p.classList.toggle('on',p.id===id));window.__reveal()}
    tabs.forEach(b=>b.addEventListener('click',()=>{pick(b.dataset.t);history.replaceState(null,'','#'+b.dataset.t)}));
    const h=location.hash.slice(1); pick(tabs.some(b=>b.dataset.t===h)?h:tabs[0].dataset.t);
    window.addEventListener('hashchange',()=>{const h=location.hash.slice(1); if(tabs.some(b=>b.dataset.t===h))pick(h)});
  }

  // отзывы
  const rg=$('#rgrid');
  if(rg&&window.REVIEWS){
    const R=window.REVIEWS, btn=$('#more'); let shown=0;
    const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    function add(n){
      const part=R.slice(shown,shown+n);
      part.forEach(r=>{
        const d=document.createElement('div'); const long=r.text.length>420;
        d.className='rcard reveal'+(long?' long':'');
        d.innerHTML=`<div class="who"><div class="av">${esc(r.name.trim()[0].toUpperCase())}</div><b>${esc(r.name)}</b></div><div class="t">${esc(r.text)}</div>`+(long?'<button class="rd">Читать полностью</button>':'');
        rg.appendChild(d);
      });
      shown+=part.length; window.__reveal(rg);
      btn.style.display=shown>=R.length?'none':'';
      btn.querySelector('span').textContent=`Показать ещё (${R.length-shown})`;
    }
    rg.addEventListener('click',e=>{const b=e.target.closest('.rd'); if(!b)return; const c=b.parentElement; c.classList.toggle('open'); b.textContent=c.classList.contains('open')?'Свернуть':'Читать полностью'});
    btn.addEventListener('click',()=>add(18)); add(18);
  }
})();
