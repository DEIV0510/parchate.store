/* ============================================================
   PARCHATE.STORE — PRODUCTO INDIVIDUAL
   Detalle, selector de respaldo, cantidad, carrito, WhatsApp,
   lightbox, relacionados y JSON-LD dinámico.
   ============================================================ */
(function(){
'use strict';
const CFG = window.PARCHATE_CONFIG;
const P = window.PARCHATE_PRODUCTS || [];
const CATS = window.PARCHATE_CATS || [];
const SVG = () => window.PARCHATE_SVG;
const card = p => window.PARCHATE_CARD(p);
const $ = s => document.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => '$' + Number(n).toLocaleString('es-CO');
const waLink = m => 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(m);
const catName = id => { const c = CATS.find(c=>c.id===id); return c ? c.name : id; };
const TIPO_LBL = { bordado:'Parche bordado', laser:'Parche corte láser', lentejuelas:'Parche de lentejuelas', llavero:'Llavero bordado' };

const sku = new URLSearchParams(location.search).get('sku');
const prod = P.find(p=>p.sku===sku);

let qty = 1;
let back = 'Adhesivo';

function setMeta(sel, attrs){
  let el = document.querySelector(sel);
  if(!el){
    el = document.createElement(attrs.rel ? 'link' : 'meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
}

function notFound(){
  document.title = 'Producto no encontrado | PARCHATE.STORE';
  setMeta('meta[name="robots"]', { name:'robots', content:'noindex,follow' });
  $('#productGrid').innerHTML =
    '<div class="empty-state" style="grid-column:1/-1">' +
      '<h3>Producto no encontrado</h3>' +
      '<p>Puede que el enlace haya cambiado. Explora el catálogo completo para encontrar tu parche.</p>' +
      '<a class="btn btn-primary" href="parches.html">Ver todos los parches</a>' +
    '</div>';
}

function render(){
  const p = prod;
  document.title = p.n + ' | Parche ' + (p.t==='laser'?'Corte Láser':'Bordado') + ' | PARCHATE.STORE';
  const desc = TIPO_LBL[p.t] + ' “' + p.n + '”' + (p.m ? ', medida ' + p.m : '') + '. Fabricado en Bogotá, disponible con velcro o adhesivo. Pide por WhatsApp.';
  const pageUrl = CFG.web + '/producto.html?sku=' + encodeURIComponent(p.sku);
  const imgUrl = CFG.web + '/img/p/' + p.sku + '-lg.webp';
  setMeta('meta[name="description"]', { name:'description', content:desc });
  setMeta('link[rel="canonical"]', { rel:'canonical', href:pageUrl });
  setMeta('meta[property="og:title"]', { property:'og:title', content:p.n + ' | PARCHATE.STORE' });
  setMeta('meta[property="og:description"]', { property:'og:description', content:desc });
  setMeta('meta[property="og:url"]', { property:'og:url', content:pageUrl });
  setMeta('meta[property="og:image"]', { property:'og:image', content:imgUrl });

  $('#bcCat').textContent = catName(p.c);
  $('#bcCat').href = 'parches.html?cat=' + p.c;
  $('#bcName').textContent = p.n;

  const badges = [];
  if(p.sa) badges.push('<span class="badge badge-sale">Oferta</span>');
  if(p.f) badges.push('<span class="badge badge-hot">Top ventas</span>');
  if(p.nw) badges.push('<span class="badge badge-new">Nuevo</span>');
  if(p.t==='laser') badges.push('<span class="badge badge-laser">Corte láser</span>');
  if(p.t==='lentejuelas') badges.push('<span class="badge badge-laser">Lentejuelas</span>');

  const off = p.sa ? Math.round((1 - p.sa/p.pr)*100) : 0;

  $('#productGrid').innerHTML =
    '<div class="pd-media">' +
      '<div class="pd-main" id="pdZoom" role="button" tabindex="0" aria-label="Ampliar imagen">' +
        (badges.length ? '<div class="pd-badges">'+badges.join('')+'</div>' : '') +
        '<img src="img/p/'+p.sku+'-lg.webp" alt="'+esc(TIPO_LBL[p.t])+' '+esc(p.n)+'" fetchpriority="high" width="1000" height="1000">' +
        '<span class="zoom-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="m21 21-4.8-4.8m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM10 7v6m-3-3h6"/></svg></span>' +
      '</div>' +
    '</div>' +
    '<div class="pd-info">' +
      '<span class="p-cat">'+esc(p.s || catName(p.c))+' · Ref '+esc(p.sku)+'</span>' +
      '<h1>'+esc(p.n)+'</h1>' +
      '<div class="pd-price">' +
        '<span class="now">'+fmt(p.sa||p.pr)+'</span>' +
        (p.sa ? '<span class="was">'+fmt(p.pr)+'</span><span class="off">-'+off+'%</span>' : '') +
      '</div>' +
      '<p class="pd-desc">Bordado con precisión en lona de alta resistencia e hilos de primera calidad. Ideal para chaquetas, chalecos, morrales, gorras y más — se fija fácil sin necesidad de coser.</p>' +
      '<div class="pd-specs">' +
        (p.m ? '<div class="pd-spec"><div class="k">Medida</div><div class="v">'+esc(p.m)+'</div></div>' : '') +
        '<div class="pd-spec"><div class="k">Tipo</div><div class="v">'+TIPO_LBL[p.t]+'</div></div>' +
        '<div class="pd-spec"><div class="k">Categoría</div><div class="v">'+esc(p.s || catName(p.c))+'</div></div>' +
        '<div class="pd-spec"><div class="k">Disponibilidad</div><div class="v" style="color:#3ddc84">Bajo pedido / inmediata</div></div>' +
      '</div>' +
      '<div class="pd-options">' +
        '<div class="pd-opt-title">Respaldo</div>' +
        '<div class="back-opts" id="backOpts">' +
          '<button class="back-opt active" data-back="Adhesivo">Termo adhesivo</button>' +
          '<button class="back-opt" data-back="Velcro">Velcro</button>' +
        '</div>' +
      '</div>' +
      '<div class="pd-buy">' +
        '<div class="qty"><button id="qMinus" aria-label="Restar uno">−</button><span id="qVal">1</span><button id="qPlus" aria-label="Sumar uno">+</button></div>' +
        '<button class="btn btn-primary" id="addBtn">'+SVG().cart+' Agregar al pedido</button>' +
      '</div>' +
      '<div class="pd-wa-block">' +
        '<a class="btn btn-wa btn-block" id="waBtn" target="_blank" rel="noopener">'+SVG().wa+' Pedir por WhatsApp</a>' +
      '</div>' +
      '<div class="pd-trust">' +
        '<span>'+SVG().spark+' Fabricación propia en Bogotá</span>' +
        '<span>'+SVG().spark+' Envíos a todo el país</span>' +
        '<span>'+SVG().spark+' Atención inmediata por WhatsApp</span>' +
      '</div>' +
    '</div>';

  updateWa();

  /* cantidad */
  $('#qMinus').addEventListener('click', ()=>{ if(qty>1){qty--; $('#qVal').textContent=qty; updateWa();} });
  $('#qPlus').addEventListener('click', ()=>{ if(qty<99){qty++; $('#qVal').textContent=qty; updateWa();} });

  /* respaldo */
  $('#backOpts').addEventListener('click', e=>{
    const b = e.target.closest('[data-back]'); if(!b) return;
    back = b.dataset.back;
    document.querySelectorAll('.back-opt').forEach(o=>o.classList.toggle('active', o===b));
    updateWa();
  });

  /* carrito */
  $('#addBtn').addEventListener('click', ()=>{
    window.PARCHATE_CART.add(p.sku, qty, back);
    window.PARCHATE_CART.open();
  });

  /* lightbox */
  const lb = $('#lightbox');
  const openLb = ()=>{
    const im = $('#lbImg');
    im.src = 'img/p/'+p.sku+'-lg.webp';
    im.alt = TIPO_LBL[p.t] + ' ' + p.n + ' ampliado';
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
    $('#lbClose').focus();
  };
  const closeLb = ()=>{
    if(!lb.classList.contains('open')) return;
    lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
    $('#pdZoom').focus();
  };
  $('#pdZoom').addEventListener('click', openLb);
  $('#pdZoom').addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLb(); } });
  lb.addEventListener('click', e=>{ if(e.target===lb || e.target.closest('#lbClose')) closeLb(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLb(); });

  /* relacionados: misma subcategoría primero, luego misma categoría */
  const rel = P.filter(x=>x.sku!==p.sku && x.c===p.c)
    .sort((a,b)=>((b.s===p.s)-(a.s===p.s)) || b.v-a.v)
    .slice(0,4);
  if(rel.length){
    $('#relatedSec').style.display='block';
    $('#relatedGrid').innerHTML = rel.map(card).join('');
  }

  /* JSON-LD Product */
  const ld = {
    '@context':'https://schema.org', '@type':'Product',
    name: p.n, sku: p.sku,
    image: CFG.web + '/img/p/' + p.sku + '-lg.webp',
    description: desc,
    brand: {'@type':'Brand', name:'PARCHATE.STORE'},
    offers: {
      '@type':'Offer', priceCurrency:'COP', price: p.sa||p.pr,
      availability:'https://schema.org/InStock',
      url: CFG.web + '/producto.html?sku=' + encodeURIComponent(p.sku)
    }
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

function updateWa(){
  const p = prod;
  const total = (p.sa||p.pr)*qty;
  $('#waBtn').href = waLink(
    'Hola PARCHATE.STORE 👋 Estoy interesado en el parche *' + p.n + '* (Ref ' + p.sku + ')' +
    '\n• Respaldo: ' + back + '\n• Cantidad: ' + qty + '\n• Valor: ' + fmt(total) +
    '\n\n¿Está disponible?'
  );
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(!prod){ notFound(); return; }
  render();
});
})();
