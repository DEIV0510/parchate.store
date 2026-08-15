/* ============================================================
   PARCHATE.STORE — CORE
   Header, footer, carrito, menú móvil, buscador, utilidades.
   Se inyecta en todas las páginas (single source of truth).
   ============================================================ */
(function(){
'use strict';
const CFG = window.PARCHATE_CONFIG;
const PRODUCTS = window.PARCHATE_PRODUCTS || [];
const CATS = window.PARCHATE_CATS || [];
const $ = (s,ctx)=> (ctx||document).querySelector(s);
const $$ = (s,ctx)=> Array.from((ctx||document).querySelectorAll(s));

/* ---------- Utilidades ---------- */
const fmt = n => '$' + Number(n).toLocaleString('es-CO');
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const waLink = msg => 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg);
const bySku = {}; PRODUCTS.forEach(p=>bySku[p.sku]=p);
/* Recargo por respaldo: el velcro cuesta CFG.recargoVelcro extra por unidad */
const backSurcharge = back => back==='Velcro' ? (CFG.recargoVelcro||0) : 0;
const unitPrice = (p, back) => (p.sa||p.pr) + backSurcharge(back);
window.PARCHATE_PRICE = { backSurcharge, unitPrice };
const catName = id => { const c = CATS.find(c=>c.id===id); return c ? c.name : id; };
const imgP  = sku => 'img/p/' + sku + '.webp';
const imgPL = sku => 'img/p/' + sku + '-lg.webp';

/* ---------- SVG ---------- */
const SVG = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3.2-.5v-.5c0-.1-.5-1.4-.7-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.4l.4 1.5m0 0L6 13.5h12l2.3-8.25H4.05ZM7.5 18.75a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Zm11 0a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" d="m21 21-4.8-4.8m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>',
  burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" d="M4 6.5h16M4 12h16M4 17.5h10"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.7 9-.3 9m-4.8 0-.3-9m9.9-3.2.9.1M4.8 5.8l1-.1m0 0a48 48 0 0 1 12.4 0m-12.4 0L6.6 19a2 2 0 0 0 2 1.8h6.8a2 2 0 0 0 2-1.8l.8-13.2M9.7 5.6V4.5a1.6 1.6 0 0 1 1.6-1.6h1.4a1.6 1.6 0 0 1 1.6 1.6v1.1"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7-7.5 11.25-7.5 11.25S4.5 17.5 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.4V5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3Z"/></svg>',
  tk: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.4 1.9 1.7 3.3 3.9 3.5v3c-1.5 0-2.8-.5-3.9-1.3v5.8a5.9 5.9 0 1 1-5.9-5.9c.3 0 .7 0 1 .1v3.1a2.9 2.9 0 1 0 2 2.7V3h2.9Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.8 15.9 9 19l-.8-3.1a4 4 0 0 0-2.9-2.9L2.3 12l3-.8a4 4 0 0 0 2.9-2.9L9 5.2l.8 3.1a4 4 0 0 0 2.9 2.9l3.1.8-3.1.8a4 4 0 0 0-2.9 2.9ZM18.3 8.7 18 10l-.4-1.3a3 3 0 0 0-2-2L14.3 6l1.3-.4a3 3 0 0 0 2-2L18 2.3l.4 1.3a3 3 0 0 0 2 2l1.3.4-1.3.4a3 3 0 0 0-2.1 2.3ZM19 22l-.5-1.8a2.5 2.5 0 0 0-1.7-1.7L15 18l1.8-.5a2.5 2.5 0 0 0 1.7-1.7L19 14l.5 1.8a2.5 2.5 0 0 0 1.7 1.7L23 18l-1.8.5a2.5 2.5 0 0 0-1.7 1.7L19 22Z"/></svg>'
};
window.PARCHATE_SVG = SVG;

/* ---------- Carrito (localStorage) ---------- */
const CART_KEY = 'parchate_cart';
function cartGet(){
  try{
    const v = JSON.parse(localStorage.getItem(CART_KEY));
    if(!Array.isArray(v)) return [];
    /* purga items malformados y SKUs que ya no existen en el catálogo */
    return v.filter(i => i && typeof i.sku==='string' && bySku[i.sku] &&
      Number.isFinite(i.qty) && i.qty>0 && typeof i.back==='string');
  }catch(e){ return []; }
}
function cartSet(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartBadge(); renderCart(); }
function cartCount(){ return cartGet().reduce((a,i)=>a+i.qty,0); }
function cartTotal(){ return cartGet().reduce((a,i)=>{ const p=bySku[i.sku]; return a + (p ? unitPrice(p, i.back)*i.qty : 0); },0); }
function cartAdd(sku, qty, back){
  const p = bySku[sku]; if(!p) return;
  qty = qty||1; back = back||'Por definir';
  const items = cartGet();
  const found = items.find(i=>i.sku===sku && i.back===back);
  let clipped = false;
  if(found){
    const want = found.qty + qty;
    found.qty = Math.min(want, 99);
    clipped = want > 99;
  } else {
    items.push({sku, qty: Math.min(qty,99), back});
    clipped = qty > 99;
  }
  cartSet(items);
  toast(clipped ? 'Máximo 99 unidades por referencia — ajustamos tu pedido' : '“' + p.n + '” agregado al pedido');
  bumpCartIcon();
}
function cartRemove(sku, back){ cartSet(cartGet().filter(i=>!(i.sku===sku && i.back===back))); }
function cartQty(sku, back, delta){
  const items = cartGet();
  const it = items.find(i=>i.sku===sku && i.back===back); if(!it) return;
  it.qty += delta;
  if(it.qty<=0) return cartRemove(sku, back);
  if(it.qty>99) it.qty=99;
  cartSet(items);
}
function cartMessage(){
  const items = cartGet();
  const lines = items.map(i=>{
    const p = bySku[i.sku]; if(!p) return '';
    const extra = backSurcharge(i.back);
    const back = i.back!=='Por definir' ? ' · ' + i.back + (extra ? ' (+' + fmt(extra) + ' c/u)' : '') : '';
    return '• ' + p.n + ' (Ref ' + p.sku + ')' + back + ' ×' + i.qty + ' — ' + fmt(unitPrice(p, i.back)*i.qty);
  }).filter(Boolean);
  return 'Hola PARCHATE.STORE 👋\nQuiero realizar el siguiente pedido:\n\n' + lines.join('\n') +
    '\n\nTotal: ' + fmt(cartTotal()) + '\n\nQuedo atento para confirmar disponibilidad y envío.';
}
window.PARCHATE_CART = { add: cartAdd, get: cartGet, open: openCart };

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg){
  let t = $('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2600);
}
window.PARCHATE_TOAST = toast;

/* ---------- Header / Footer / Drawers ---------- */
function catMenuLinks(){
  return CATS.map(c=>'<a href="parches.html?cat='+c.id+'">'+esc(c.name)+'<span class="cat-n">'+c.count+'</span></a>').join('');
}
function buildChrome(){
  const page = document.body.dataset.page || '';
  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#main';
  skip.textContent = 'Saltar al contenido';
  document.body.prepend(skip);
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML =
    '<div class="header-in">' +
      '<a class="brand" href="index.html" aria-label="PARCHATE.STORE — inicio">' +
        '<img src="img/brand/logo-word.webp" alt="Parchate" width="170" height="52">' +
        '<span class="brand-store">Store</span>' +
      '</a>' +
      '<nav class="nav" aria-label="Navegación principal">' +
        '<a href="index.html"' + (page==='home'?' class="active"':'') + '>Inicio</a>' +
        '<a href="parches.html"' + (page==='catalogo'?' class="active"':'') + '>Parches</a>' +
        '<div class="nav-drop"><button type="button" aria-expanded="false">Categorías ' + SVG.chev + '</button>' +
          '<div class="nav-menu">' + catMenuLinks() + '</div></div>' +
        '<a href="personalizados.html"' + (page==='personalizados'?' class="active"':'') + '>Personalizados</a>' +
        '<a href="index.html#nosotros">Nosotros</a>' +
        '<a href="index.html#contacto">Contacto</a>' +
      '</nav>' +
      '<div class="header-actions">' +
        '<button class="icon-btn" id="searchToggle" aria-label="Buscar parches">' + SVG.search + '</button>' +
        '<button class="icon-btn" id="cartToggle" aria-label="Ver pedido">' + SVG.cart + '<span class="cart-count" id="cartCount">0</span></button>' +
        '<a class="btn btn-wa" href="' + waLink('Hola PARCHATE.STORE 👋 Quiero información sobre sus parches.') + '" target="_blank" rel="noopener">' + SVG.wa + ' WhatsApp</a>' +
        '<button class="icon-btn burger" id="burger" aria-label="Abrir menú">' + SVG.burger + '</button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  const search = document.createElement('div');
  search.className = 'search-bar'; search.id = 'searchBar';
  search.innerHTML =
    '<form action="parches.html" method="get" role="search">' +
      '<input type="search" name="q" id="searchInput" placeholder="Busca tu parche: moto, rock, calavera, Colombia…" autocomplete="off" aria-label="Buscar parches">' +
      '<button class="btn btn-primary btn-sm" type="submit">Buscar</button>' +
    '</form>';
  header.after(search);

  const mm = document.createElement('div');
  mm.className = 'mobile-menu'; mm.id='mobileMenu';
  mm.setAttribute('aria-hidden','true');
  mm.innerHTML =
    '<div class="mm-scrim" data-close-mm></div>' +
    '<div class="mm-panel" role="dialog" aria-modal="true" aria-label="Menú">' +
      '<div class="mm-top"><img src="img/brand/logo-word.webp" alt="Parchate">' +
        '<button class="icon-btn" data-close-mm aria-label="Cerrar menú">' + SVG.close + '</button></div>' +
      '<nav class="mm-nav">' +
        '<a href="index.html">Inicio</a>' +
        '<a href="parches.html">Parches</a>' +
        '<div class="mm-cats"><div class="mm-cats-label">Categorías</div>' +
          CATS.map(c=>'<a href="parches.html?cat='+c.id+'">'+esc(c.name)+'<span>'+c.count+'</span></a>').join('') +
        '</div>' +
        '<a href="personalizados.html">Personalizados</a>' +
        '<a href="index.html#nosotros">Nosotros</a>' +
        '<a href="index.html#contacto">Contacto</a>' +
      '</nav>' +
      '<div class="mm-foot">' +
        '<a class="btn btn-wa btn-block" href="' + waLink('Hola PARCHATE.STORE 👋 Quiero información sobre sus parches.') + '" target="_blank" rel="noopener">' + SVG.wa + ' Pedir por WhatsApp</a>' +
        '<a class="btn btn-ghost btn-block" href="personalizados.html">Crear mi parche</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(mm);

  const cart = document.createElement('div');
  cart.className='cart-drawer'; cart.id='cartDrawer';
  cart.setAttribute('aria-hidden','true');
  cart.innerHTML =
    '<div class="cart-scrim" data-close-cart></div>' +
    '<aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Tu pedido">' +
      '<div class="cart-head"><h2 class="cart-title">Tu pedido</h2>' +
        '<button class="icon-btn" data-close-cart aria-label="Cerrar pedido">' + SVG.close + '</button></div>' +
      '<div class="cart-items" id="cartItems"></div>' +
      '<div class="cart-foot" id="cartFoot"></div>' +
    '</aside>';
  document.body.appendChild(cart);

  const wa = document.createElement('a');
  wa.className='wa-float'; wa.target='_blank'; wa.rel='noopener';
  wa.href = waLink('Hola PARCHATE.STORE 👋 Quiero información sobre sus parches.');
  wa.setAttribute('aria-label','Escríbenos por WhatsApp');
  wa.innerHTML = SVG.wa;
  document.body.appendChild(wa);

  const footer = document.createElement('footer');
  footer.className='footer';
  footer.id='contacto';
  footer.innerHTML =
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand">' +
          '<img src="img/brand/logo-word.webp" alt="PARCHATE.STORE">' +
          '<p>Fabricamos parches bordados en Bogotá. Más de 1.000 diseños listos y parches personalizados con tu idea. Velcro o adhesivo.</p>' +
          '<div class="socials">' +
            '<a href="' + CFG.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + SVG.ig + '</a>' +
            '<a href="' + CFG.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + SVG.fb + '</a>' +
            '<a href="' + CFG.tiktok + '" target="_blank" rel="noopener" aria-label="TikTok">' + SVG.tk + '</a>' +
          '</div>' +
        '</div>' +
        '<div><div class="f-title">Explora</div><div class="f-links">' +
          '<a href="index.html">Inicio</a>' +
          '<a href="parches.html">Todos los parches</a>' +
          '<a href="index.html#categorias">Categorías</a>' +
          '<a href="personalizados.html">Personalizados</a>' +
          '<a href="index.html#nosotros">Nosotros</a>' +
        '</div></div>' +
        '<div><div class="f-title">Categorías top</div><div class="f-links">' +
          '<a href="parches.html?cat=moteros">Moteros</a>' +
          '<a href="parches.html?cat=musica">Rock y Música</a>' +
          '<a href="parches.html?cat=animados">Animados</a>' +
          '<a href="parches.html?cat=banderas">Banderas</a>' +
          '<a href="parches.html?cat=laser">Corte Láser</a>' +
        '</div></div>' +
        '<div><div class="f-title">Contacto</div><div class="f-links">' +
          '<a href="' + waLink('Hola PARCHATE.STORE 👋') + '" target="_blank" rel="noopener">' + SVG.wa + ' ' + CFG.telefonoBonito + '</a>' +
          '<a href="' + CFG.mapsUrl + '" target="_blank" rel="noopener">' + SVG.pin + ' ' + esc(CFG.direccion) + ', ' + esc(CFG.ciudad) + '</a>' +
          '<span style="color:var(--muted);font-size:13.5px">' + esc(CFG.horario) + '</span>' +
        '</div></div>' +
      '</div>' +
      '<div class="footer-bottom">© ' + new Date().getFullYear() + ' ' + CFG.nombre + ' — Parches bordados hechos con <span class="heart">♥</span> en Bogotá, Colombia.</div>' +
    '</div>';
  document.body.appendChild(footer);
}

/* ---------- Render carrito ---------- */
function renderCart(){
  const box = $('#cartItems'), foot = $('#cartFoot');
  if(!box) return;
  const items = cartGet();
  if(!items.length){
    box.innerHTML = '<div class="cart-empty">' + SVG.cart +
      '<p><strong>Tu pedido está vacío.</strong><br>Explora el catálogo y agrega tus parches favoritos.</p>' +
      '<a class="btn btn-primary btn-sm" style="margin-top:16px" href="parches.html">Explorar parches</a></div>';
    foot.innerHTML = '';
    return;
  }
  box.innerHTML = items.map(i=>{
    const p = bySku[i.sku]; if(!p) return '';
    return '<div class="cart-item">' +
      '<img src="' + imgP(p.sku) + '" alt="' + esc(p.n) + '" loading="lazy">' +
      '<div><div class="ci-name">' + esc(p.n) + '</div>' +
        '<div class="ci-meta">Ref ' + esc(p.sku) + (i.back!=='Por definir' ? ' · ' + esc(i.back) + (backSurcharge(i.back) ? ' (+' + fmt(backSurcharge(i.back)) + ')' : '') : '') + '</div>' +
        '<div class="ci-price">' + fmt(unitPrice(p, i.back)*i.qty) + '</div></div>' +
      '<div class="ci-right">' +
        '<button class="ci-remove" data-rm="' + esc(p.sku) + '|' + esc(i.back) + '" aria-label="Quitar ' + esc(p.n) + '">' + SVG.trash + '</button>' +
        '<div class="qty">' +
          '<button data-q="' + esc(p.sku) + '|' + esc(i.back) + '|-1" aria-label="Restar uno">−</button>' +
          '<span>' + i.qty + '</span>' +
          '<button data-q="' + esc(p.sku) + '|' + esc(i.back) + '|1" aria-label="Sumar uno">+</button>' +
        '</div>' +
      '</div></div>';
  }).join('');
  const canPay = CFG.epayco && CFG.epayco.publicKey;
  foot.innerHTML =
    '<div class="cart-total"><span class="lbl">Total (' + cartCount() + ' parches)</span><span class="val">' + fmt(cartTotal()) + '</span></div>' +
    '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' + waLink(cartMessage()) + '">' + SVG.wa + ' Pedir por WhatsApp</a>' +
    (canPay ? '<button class="btn btn-primary btn-block" id="payBtn" style="margin-top:10px">💳 Pagar online</button>' : '') +
    '<p class="cart-note">' + (canPay ? 'Paga con tarjeta, PSE o Nequi vía ePayco, o pide por WhatsApp.' : 'Al enviar tu pedido confirmamos disponibilidad, envío y forma de pago.') + '</p>';
  const payBtn = $('#payBtn');
  if(payBtn) payBtn.addEventListener('click', payOnline);
}

/* ---------- Pago online (ePayco checkout onpage) ---------- */
let epaycoLoading = null;
function loadEpayco(){
  if(window.ePayco) return Promise.resolve();
  if(epaycoLoading) return epaycoLoading;
  epaycoLoading = new Promise((res, rej)=>{
    const s = document.createElement('script');
    s.src = 'https://checkout.epayco.co/checkout.js';
    s.onload = res;
    s.onerror = ()=>{ epaycoLoading = null; rej(new Error('epayco load')); };
    document.head.appendChild(s);
  });
  return epaycoLoading;
}
function payOnline(){
  const items = cartGet();
  if(!items.length) return;
  const total = cartTotal();
  const btn = $('#payBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Abriendo pago seguro…'; }
  const invoice = 'PS-' + Date.now();
  const resumen = items.map(i=>{ const p=bySku[i.sku]; return p ? p.n + ' x' + i.qty : ''; }).filter(Boolean).join(', ').slice(0,180);
  /* guarda el pedido para la página de gracias */
  localStorage.setItem('parchate_last_order', JSON.stringify({ invoice, total, items, fecha: new Date().toISOString() }));
  loadEpayco().then(()=>{
    const handler = window.ePayco.checkout.configure({ key: CFG.epayco.publicKey, test: !!CFG.epayco.test });
    handler.open({
      name: 'Pedido PARCHATE.STORE',
      description: resumen || 'Parches bordados',
      invoice: invoice,
      currency: 'cop',
      amount: String(total),
      tax_base: '0',
      tax: '0',
      country: 'co',
      lang: 'es',
      external: 'false',
      response: CFG.web + '/gracias.html',
      methodsDisable: []
    });
  }).catch(()=>{
    toast('No pudimos abrir el pago online. Intenta de nuevo o pide por WhatsApp.');
  }).finally(()=>{
    if(btn){ btn.disabled = false; btn.innerHTML = '💳 Pagar online'; }
  });
}
function updateCartBadge(){
  const el = $('#cartCount'); if(!el) return;
  const n = cartCount();
  el.textContent = n;
  el.classList.toggle('show', n>0);
}
function bumpCartIcon(){
  const b = $('#cartToggle'); if(!b) return;
  b.style.transform='scale(1.18)';
  setTimeout(()=>b.style.transform='', 180);
}
/* Foco accesible en diálogos: guarda el origen, enfoca el panel y atrapa Tab */
let lastFocus = null;
function trapFocus(panel, e){
  const focusables = panel.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if(!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length-1];
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
}
function dialogOpened(root, panelSel){
  lastFocus = document.activeElement;
  const panel = root.querySelector(panelSel);
  const closeBtn = panel.querySelector('button');
  (closeBtn||panel).focus();
  root._trap = e=>{ if(e.key==='Tab') trapFocus(panel, e); };
  root.addEventListener('keydown', root._trap);
}
function dialogClosed(root){
  if(root._trap){ root.removeEventListener('keydown', root._trap); root._trap=null; }
  if(lastFocus && document.contains(lastFocus)){ lastFocus.focus(); lastFocus=null; }
}
function openCart(){ const d=$('#cartDrawer'); d.classList.add('open'); d.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; dialogOpened(d,'.cart-panel'); }
function closeCart(){ const d=$('#cartDrawer'); if(!d.classList.contains('open')) return; d.classList.remove('open'); d.setAttribute('aria-hidden','true'); document.body.style.overflow=''; dialogClosed(d); }

/* ---------- Tarjeta de producto (compartida) ---------- */
function cardHTML(p, eager){
  const badges = [];
  if(p.sa) badges.push('<span class="badge badge-sale">Oferta</span>');
  if(p.f) badges.push('<span class="badge badge-hot">Top ventas</span>');
  if(p.nw) badges.push('<span class="badge badge-new">Nuevo</span>');
  if(p.t==='laser') badges.push('<span class="badge badge-laser">Láser</span>');
  if(p.t==='lentejuelas') badges.push('<span class="badge badge-laser">Lentejuelas</span>');
  return '<article class="p-card">' +
    '<a class="p-media" href="producto.html?sku=' + encodeURIComponent(p.sku) + '" aria-label="Ver ' + esc(p.n) + '">' +
      (badges.length ? '<div class="p-badges">' + badges.join('') + '</div>' : '') +
      '<img src="' + imgP(p.sku) + '" alt="Parche bordado ' + esc(p.n) + '" ' + (eager?'fetchpriority="high"':'loading="lazy"') + ' width="480" height="480">' +
    '</a>' +
    '<div class="p-info">' +
      '<span class="p-cat">' + esc(p.s || catName(p.c)) + '</span>' +
      '<a href="producto.html?sku=' + encodeURIComponent(p.sku) + '"><h3 class="p-name">' + esc(p.n) + '</h3></a>' +
      '<div class="p-price">' +
        '<span class="now">' + fmt(p.sa||p.pr) + '</span>' +
        (p.sa ? '<span class="was">' + fmt(p.pr) + '</span>' : '') +
      '</div>' +
      '<div class="p-actions">' +
        '<button class="btn btn-primary btn-sm" data-add="' + esc(p.sku) + '">Agregar</button>' +
        '<a class="p-wa" target="_blank" rel="noopener" aria-label="Pedir ' + esc(p.n) + ' por WhatsApp" href="' +
          waLink('Hola PARCHATE.STORE 👋 Estoy interesado en el parche *' + p.n + '* (Ref ' + p.sku + ') — ' + fmt(p.sa||p.pr) + '. ¿Está disponible?') + '">' + SVG.wa + '</a>' +
      '</div>' +
    '</div></article>';
}
window.PARCHATE_CARD = cardHTML;

/* ---------- Eventos globales ---------- */
function bindEvents(){
  const header = $('.header');
  const onScroll = ()=> header.classList.toggle('scrolled', window.scrollY>10);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // dropdown categorías (desktop)
  const drop = $('.nav-drop');
  if(drop){
    const btn = drop.querySelector('button');
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', ()=>{ drop.classList.remove('open'); btn.setAttribute('aria-expanded','false'); });
  }

  // buscador
  $('#searchToggle').addEventListener('click', ()=>{
    const sb = $('#searchBar');
    const open = sb.classList.toggle('open');
    if(open) setTimeout(()=>$('#searchInput').focus(), 120);
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ $('#searchBar').classList.remove('open'); closeCart(); closeMM(); }
  });

  // menú móvil
  const mm = $('#mobileMenu');
  function openMM(){ mm.classList.add('open'); mm.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; dialogOpened(mm,'.mm-panel'); }
  function closeMM(){ if(!mm.classList.contains('open')) return; mm.classList.remove('open'); mm.setAttribute('aria-hidden','true'); document.body.style.overflow=''; dialogClosed(mm); }
  window.closeMM = closeMM;
  $('#burger').addEventListener('click', openMM);
  mm.addEventListener('click', e=>{ if(e.target.closest('[data-close-mm]') || e.target.closest('a')) closeMM(); });

  // carrito
  $('#cartToggle').addEventListener('click', openCart);
  $('#cartDrawer').addEventListener('click', e=>{
    if(e.target.closest('[data-close-cart]')) closeCart();
    const rm = e.target.closest('[data-rm]');
    if(rm){ const [sku,back] = rm.dataset.rm.split('|'); cartRemove(sku, back); }
    const q = e.target.closest('[data-q]');
    if(q){ const [sku,back,d] = q.dataset.q.split('|'); cartQty(sku, back, parseInt(d)); }
  });

  // agregar al pedido (delegado, funciona en cualquier grid)
  document.addEventListener('click', e=>{
    const add = e.target.closest('[data-add]');
    if(add){ cartAdd(add.dataset.add, 1); }
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const els = $$('.rv');
  if(!('IntersectionObserver' in window)){ els.forEach(el=>el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
}
window.PARCHATE_REVEAL = initReveal;

/* ---------- Loader ---------- */
function initLoader(){
  const l = $('.loader'); if(!l) return;
  const hide = ()=> l.classList.add('hide');
  if(document.readyState==='complete') setTimeout(hide, 350);
  else window.addEventListener('load', ()=>setTimeout(hide, 350));
  setTimeout(hide, 2600); // seguro: nunca más de 2.6s
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  buildChrome();
  bindEvents();
  /* persiste el carrito ya depurado (quita SKUs retirados del catálogo) */
  const clean = cartGet();
  localStorage.setItem(CART_KEY, JSON.stringify(clean));
  renderCart();
  updateCartBadge();
  initLoader();
  initReveal();
});

/* Al volver con el botón atrás (bfcache) el carrito puede haber cambiado */
window.addEventListener('pageshow', e=>{ if(e.persisted){ renderCart(); updateCartBadge(); } });
/* Sincroniza el carrito entre pestañas abiertas */
window.addEventListener('storage', e=>{ if(e.key===CART_KEY){ renderCart(); updateCartBadge(); } });
})();
