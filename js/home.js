/* ============================================================
   PARCHATE.STORE — HOME
   Hero wall, marquee, categorías, destacados, más vendidos.
   ============================================================ */
(function(){
'use strict';
const CFG = window.PARCHATE_CONFIG;
const P = window.PARCHATE_PRODUCTS || [];
const CATS = window.PARCHATE_CATS || [];
const SVG = () => window.PARCHATE_SVG;
const card = (p,e) => window.PARCHATE_CARD(p,e);
const $ = s => document.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const waLink = m => 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(m);
const imgP = sku => 'img/p/' + sku + '.webp';

const feat = P.filter(p=>p.f);
const byViews = [...P].sort((a,b)=>b.v-a.v);

document.addEventListener('DOMContentLoaded', ()=>{

  /* WhatsApp CTAs */
  $('#heroWa').href = waLink('Hola PARCHATE.STORE 👋 Quiero información sobre sus parches.');
  $('#customWa').href = waLink('Hola PARCHATE.STORE 👋 Quiero cotizar un parche personalizado. Te comparto mi idea:');
  $('#finalWa').href = waLink('Hola PARCHATE.STORE 👋 Quiero hacer un pedido de parches.');

  /* Hero: muro de 5 parches solo en desktop, strip solo en móvil
     (así el móvil no descarga las imágenes eager de un elemento oculto) */
  const isDesktop = window.matchMedia('(min-width:1024px)').matches;
  if(isDesktop){
    const wall = $('#heroWall');
    feat.slice(0,5).forEach(p=>{
      const d = document.createElement('div');
      d.className='hw-tile';
      d.innerHTML = '<img src="'+imgP(p.sku)+'" alt="" loading="eager" fetchpriority="high">';
      wall.appendChild(d);
    });
  } else {
    const stripSkus = byViews.slice(0,14);
    const stripHTML = stripSkus.map(p=>'<div class="tile"><img src="'+imgP(p.sku)+'" alt="" loading="lazy"></div>').join('');
    $('#heroStrip').innerHTML = '<div class="track">'+stripHTML+stripHTML+'</div>';
  }

  /* Marquee: 2 filas con productos populares distintos */
  const rowA = byViews.slice(0,18), rowB = byViews.slice(18,36);
  const mq = $('#marquee');
  const mkRow = (items,rev)=>{
    const cells = items.map(p=>'<a class="mq-item" href="producto.html?sku='+encodeURIComponent(p.sku)+'" tabindex="-1"><img src="'+imgP(p.sku)+'" alt="" loading="lazy"></a>').join('');
    return '<div class="marquee-row'+(rev?' rev':'')+'"><div class="marquee-track">'+cells+cells+'</div></div>';
  };
  mq.innerHTML = mkRow(rowA,false) + mkRow(rowB,true);

  /* Pausar las animaciones infinitas cuando salen del viewport */
  if('IntersectionObserver' in window){
    const animIO = new IntersectionObserver(es=>{
      es.forEach(en=>en.target.classList.toggle('anim-paused', !en.isIntersecting));
    }, {threshold:0});
    [mq, $('#heroStrip'), $('#heroWall')].forEach(el=>{ if(el) animIO.observe(el); });
  }

  /* Categorías */
  $('#catGrid').innerHTML = CATS.map((c,i)=>
    '<a class="cat-card rv rv-d'+(i%4)+'" href="parches.html?cat='+c.id+'">' +
      '<img src="'+c.cover+'" alt="Parches de '+esc(c.name)+'" loading="lazy">' +
      '<div class="cat-info"><h3>'+esc(c.name)+'</h3><span>'+c.count+' diseños</span>' +
        '<span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3"/></svg></span>' +
      '</div></a>'
  ).join('');

  /* Destacados (8) y más vendidos (8, sin repetir destacados) */
  $('#featGrid').innerHTML = feat.slice(0,8).map((p,i)=>card(p,i<4)).join('');
  const featSet = new Set(feat.slice(0,8).map(p=>p.sku));
  $('#topGrid').innerHTML = byViews.filter(p=>!featSet.has(p.sku)).slice(0,8).map(p=>card(p)).join('');

  /* Galería personalizados (6 fotos reales; decorativas, el banner ya describe) */
  const cg = $('#customGrid');
  for(let i=1;i<=6;i++){
    cg.innerHTML += '<img src="img/custom/custom-'+String(i).padStart(2,'0')+'.webp" alt="" loading="lazy">';
  }

  /* Beneficios */
  const B = [
    ['fire','Más de 1.000 diseños','Catálogo enorme y en crecimiento constante.'],
    ['thread','Fabricación propia','Bordamos cada parche en nuestro taller.'],
    ['pin','Hechos en Bogotá','Producto 100% colombiano.'],
    ['palette','Diseños personalizados','Convierte tu idea en un parche real.'],
    ['bolt','Producción rápida','Despacho inmediato en diseños de línea.'],
    ['box','Envíos','Recibe tu pedido en todo el país.'],
    ['layers','Velcro y adhesivo','Elige el respaldo que necesites.'],
    ['chat','Atención por WhatsApp','Te asesoramos de principio a fin.']
  ];
  const BI = {
    fire:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.4 15.6a3.6 3.6 0 1 1-5-3.3c.5 1 1.3 1.8 2.3 2.2.2-1.5 1-2.8 2.1-3.7.4 1.9.6 3.2.6 4.8ZM12 2s1 2.5 1 4.5c1.8-1 3.5-1 3.5-1-.3 2.1-1.1 3.4-2.1 4.4 2.8 1 4.6 3.2 4.6 6.1a7 7 0 0 1-14 0c0-2.5 1.2-4.4 2.9-5.7C6.6 8 6 5.5 8.2 3.4c.7 1.5 1.6 2.4 2.6 3C10.6 4.6 12 2 12 2Z"/></svg>',
    thread:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M5.5 8.5h13M5.5 12h13M5.5 15.5h13"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7-7.5 11.25-7.5 11.25S4.5 17.5 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>',
    palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 1 9-9c0 1.9-1.3 3-3 3h-2a2 2 0 0 0-1.5 3.3c.4.5.2 1.7-1 1.7H12Z"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m13 2-8.5 12h6L11 22l8.5-12h-6L13 2Z"/></svg>',
    box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25M21 7.5v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>',
    layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m12 3 9 5-9 5-9-5 9-5Z"/><path stroke-linecap="round" stroke-linejoin="round" d="m3 13 9 5 9-5"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8.6 10.6h.01M12 10.6h.01m3.4 0h.01M21 12c0 4.4-4 8-9 8-1 0-2-.1-2.9-.4L4 21l1.3-3.9A7.6 7.6 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"/></svg>'
  };
  $('#benefitsGrid').innerHTML = B.map(([ic,t,d],i)=>
    '<div class="benefit rv rv-d'+(i%4)+'"><div class="ic">'+BI[ic]+'</div><h3>'+t+'</h3><p>'+d+'</p></div>'
  ).join('');

  /* Nosotros: checklist */
  const chk = '<span class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg></span>';
  $('#aboutList').innerHTML = [
    'Bordado en lona de alta resistencia e hilos premium',
    'Acabado en velcro o doble adhesivo, como prefieras',
    'Tienda física + ventas por WhatsApp y online',
    'Parches personalizados desde tu imagen o idea'
  ].map(t=>'<li>'+chk+'<span>'+t+'</span></li>').join('');

  /* Ubicación */
  $('#locCard').innerHTML =
    '<div class="loc-row"><div class="ic">'+SVG().pin+'</div><div><h3>Dirección</h3><p>'+esc(CFG.direccion)+'<br>'+esc(CFG.ciudad)+'</p></div></div>' +
    '<div class="loc-row"><div class="ic">'+SVG().wa+'</div><div><h3>WhatsApp</h3><p>'+esc(CFG.telefonoBonito)+'</p></div></div>' +
    '<div class="loc-row"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg></div><div><h3>Horario</h3><p>'+esc(CFG.horario)+'</p></div></div>' +
    '<a class="btn btn-primary" style="margin-top:6px" href="'+CFG.mapsUrl+'" target="_blank" rel="noopener">Cómo llegar</a>';
  $('#mapFrame').src = CFG.mapsEmbed;

  /* Contadores animados */
  const nums = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(es=>{
      es.forEach(en=>{
        if(!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, target = parseInt(el.dataset.count), suf = el.dataset.suffix||'';
        const t0 = performance.now(), dur = 1200;
        const tick = t=>{
          const k = Math.min((t-t0)/dur, 1);
          el.textContent = Math.round(target * (1-Math.pow(1-k,3))).toLocaleString('es-CO') + suf;
          if(k<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },{threshold:.5});
    nums.forEach(el=>io.observe(el));
  } else nums.forEach(el=>el.textContent = parseInt(el.dataset.count).toLocaleString('es-CO')+(el.dataset.suffix||''));

  /* re-observar reveals creados dinámicamente */
  window.PARCHATE_REVEAL();
});
})();
