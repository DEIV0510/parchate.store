/* ============================================================
   PARCHATE.STORE — CATÁLOGO
   Búsqueda, filtros, orden, paginación y URL sincronizada.
   ============================================================ */
(function(){
'use strict';
const P = window.PARCHATE_PRODUCTS || [];
const CATS = window.PARCHATE_CATS || [];
const card = p => window.PARCHATE_CARD(p);
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const catName = id => { const c = CATS.find(c=>c.id===id); return c ? c.name : id; };

/* Sinónimos de búsqueda → términos del catálogo */
const SYN = {
  'moto':'moteros','motos':'moteros','motero':'moteros','biker':'moteros','harley':'harley davidson',
  'rock':'musica rock','rockero':'rock','metal':'metal','banda':'rock','bandas':'rock',
  'caricatura':'animados','caricaturas':'animados','anime':'anime','cartoon':'animados',
  'pelicula':'peliculas','peliculas':'peliculas','movie':'peliculas',
  'bandera':'banderas','banderas':'banderas','pais':'banderas','escudo':'escudos',
  'espacio':'aeroespaciales nasa','nasa':'nasa','astronauta':'aeroespaciales',
  'futbol':'futbol deportes','deporte':'deportes','equipo':'deportes',
  'carro':'autos','carros':'autos','auto':'autos','car':'autos',
  'laser':'laser','lentejuela':'lentejuelas','llavero':'llaveros',
  'colombia':'colombia','calavera':'calavera skull','craneo':'calavera skull','skull':'calavera skull'
};

/* Índice de búsqueda */
const IDX = P.map(p=>({
  p,
  txt: norm([p.n, p.sku, catName(p.c), p.s||'', p.t].join(' '))
}));

/* ---------- Estado ---------- */
const state = {
  q: '', cat: '', sub: '', tipo: '', precio: '', col: '',
  orden: 'relevancia', page: 1
};
const PER_PAGE = 24;

/* Cargar estado desde URL */
const ORDENES = ['relevancia','vendidos','recientes','precio-menor','precio-mayor','az'];
(function fromURL(){
  const u = new URLSearchParams(location.search);
  state.q = u.get('q') || '';
  state.cat = u.get('cat') || '';
  state.sub = u.get('sub') || '';
  state.orden = u.get('orden') || (u.get('q') ? 'relevancia' : 'vendidos');
  if(!ORDENES.includes(state.orden)) state.orden = 'vendidos';
  if(state.cat && !CATS.some(c=>c.id===state.cat)) state.cat = '';
  /* la subcategoría debe existir dentro de la categoría elegida */
  if(state.sub && !P.some(p=>p.c===state.cat && p.s===state.sub)) state.sub = '';
})();

function toURL(){
  const u = new URLSearchParams();
  if(state.q) u.set('q', state.q);
  if(state.cat) u.set('cat', state.cat);
  if(state.sub) u.set('sub', state.sub);
  if(state.orden && state.orden!=='relevancia') u.set('orden', state.orden);
  const qs = u.toString();
  history.replaceState(null, '', 'parches.html' + (qs ? '?'+qs : ''));
}

/* ---------- Filtrado ---------- */
function expandQuery(q){
  const terms = norm(q).split(/\s+/).filter(Boolean);
  return terms.map(t=>{ const s = SYN[t]; return s ? t+' '+norm(s) : t; });
}
function filtered(){
  let list = IDX;
  if(state.cat) list = list.filter(x=>x.p.c===state.cat);
  if(state.sub) list = list.filter(x=>(x.p.s||'')===state.sub);
  if(state.tipo) list = list.filter(x=>x.p.t===state.tipo);
  if(state.col==='nuevos') list = list.filter(x=>x.p.nw);
  if(state.col==='destacados') list = list.filter(x=>x.p.f);
  if(state.col==='ofertas') list = list.filter(x=>x.p.sa);
  if(state.precio){
    const [min,max] = state.precio.split('-').map(Number);
    list = list.filter(x=>{ const v = x.p.sa||x.p.pr; return v>=min && (max ? v<=max : true); });
  }
  let scored = null;
  if(state.q){
    const groups = expandQuery(state.q);
    scored = [];
    for(const x of list){
      let score = 0, ok = true;
      for(const g of groups){
        const opts = g.split(/\s+/);
        const hit = opts.some(o=>x.txt.includes(o));
        if(!hit){ ok=false; break; }
        if(norm(x.p.n).includes(opts[0])) score += 3; else score += 1;
      }
      if(ok) scored.push({x, score});
    }
    list = scored.sort((a,b)=>b.score-a.score || b.x.p.v-a.x.p.v).map(s=>s.x);
  }
  let arr = list.map(x=>x.p);
  switch(state.orden){
    case 'vendidos': arr = [...arr].sort((a,b)=>b.v-a.v); break;
    case 'recientes': arr = [...arr].sort((a,b)=>(b.nw-a.nw) || b.v-a.v); break;
    case 'precio-menor': arr = [...arr].sort((a,b)=>(a.sa||a.pr)-(b.sa||b.pr)); break;
    case 'precio-mayor': arr = [...arr].sort((a,b)=>(b.sa||b.pr)-(a.sa||a.pr)); break;
    case 'az': arr = [...arr].sort((a,b)=>a.n.localeCompare(b.n,'es')); break;
    case 'relevancia': default: if(!state.q) arr = [...arr].sort((a,b)=>b.v-a.v); break;
  }
  return arr;
}

/* ---------- Render ---------- */
function activeFilters(){
  return ['sub','tipo','precio','col'].filter(k=>state[k]).length;
}
function render(){
  const arr = filtered();
  const grid = $('#grid'), empty = $('#empty');
  const shown = arr.slice(0, state.page*PER_PAGE);
  grid.innerHTML = shown.map(card).join('');
  empty.style.display = arr.length ? 'none' : 'block';
  $('#resultCount').innerHTML = arr.length
    ? 'Mostrando <strong>' + shown.length + '</strong> de <strong>' + arr.length + '</strong> parches'
    : '';
  $('#loadMoreWrap').style.display = arr.length > shown.length ? 'block' : 'none';
  const n = activeFilters();
  $('#fCount').textContent = n;
  $('#fCount').classList.toggle('show', n>0);
  $('#fpClear').classList.toggle('show', n>0 || !!state.cat || !!state.q);

  /* título de página según categoría */
  if(state.cat){
    $('#pageTitle').innerHTML = 'Parches <span class="hl">' + catName(state.cat) + '</span>';
    $('#bcHere').textContent = catName(state.cat);
    $('#pageSub').textContent = 'Diseños bordados de ' + catName(state.cat).toLowerCase() + ' listos para despacho. Pide por WhatsApp.';
  } else if(state.q){
    $('#pageTitle').innerHTML = 'Resultados: <span class="hl">' + state.q.replace(/</g,'') + '</span>';
    $('#bcHere').textContent = 'Búsqueda';
  } else {
    $('#pageTitle').innerHTML = 'Explora nuestros <span class="hl">parches</span>';
    $('#bcHere').textContent = 'Parches';
    $('#pageSub').textContent = 'Más de 1.000 diseños bordados listos para despacho. Busca, filtra y arma tu pedido.';
  }
  toURL();
}

/* ---------- Chips de categoría ---------- */
function renderChips(){
  const chips = [{id:'',name:'Todos'}].concat(CATS.map(c=>({id:c.id,name:c.name})));
  $('#catChips').innerHTML = chips.map(c=>
    '<button class="chip'+(state.cat===c.id?' active':'')+'" data-cat="'+c.id+'" aria-pressed="'+(state.cat===c.id)+'">'+c.name+'</button>'
  ).join('');
}

/* ---------- Subcategorías dinámicas ---------- */
function renderSubs(){
  const wrap = $('#fpSubWrap');
  if(!state.cat){ wrap.style.display='none'; state.sub=''; return; }
  const subs = [...new Set(P.filter(p=>p.c===state.cat && p.s).map(p=>p.s))].sort((a,b)=>a.localeCompare(b,'es'));
  if(!subs.length){ wrap.style.display='none'; state.sub=''; return; }
  wrap.style.display='block';
  $('#fpSub').innerHTML = subs.map(s=>
    '<button class="fp-opt'+(state.sub===s?' active':'')+'" data-sub="'+s.replace(/"/g,'&quot;')+'" aria-pressed="'+(state.sub===s)+'">'+s+'</button>'
  ).join('');
}

function renderFilterOpts(){
  const tipos = [['','Todos'],['bordado','Bordado'],['laser','Corte láser'],['lentejuelas','Lentejuelas'],['llavero','Llaveros']];
  $('#fpTipo').innerHTML = tipos.map(([v,l])=>
    '<button class="fp-opt'+(state.tipo===v?' active':'')+'" data-tipo="'+v+'" aria-pressed="'+(state.tipo===v)+'">'+l+'</button>').join('');
  const precios = [['','Todos'],['0-15000','Hasta $15.000'],['15001-25000','$15.000 – $25.000'],['25001-','Más de $25.000']];
  $('#fpPrecio').innerHTML = precios.map(([v,l])=>
    '<button class="fp-opt'+(state.precio===v?' active':'')+'" data-precio="'+v+'" aria-pressed="'+(state.precio===v)+'">'+l+'</button>').join('');
  const cols = [['','Todas'],['destacados','Top ventas'],['nuevos','Nuevos'],['ofertas','En oferta']];
  $('#fpCol').innerHTML = cols.map(([v,l])=>
    '<button class="fp-opt'+(state.col===v?' active':'')+'" data-col="'+v+'" aria-pressed="'+(state.col===v)+'">'+l+'</button>').join('');
}

/* ---------- Eventos ---------- */
function bind(){
  const q = $('#q');
  q.value = state.q;
  $('#qClear').classList.toggle('show', !!state.q);
  let debounce;
  q.addEventListener('input', ()=>{
    clearTimeout(debounce);
    debounce = setTimeout(()=>{
      state.q = q.value.trim(); state.page = 1;
      $('#qClear').classList.toggle('show', !!state.q);
      render();
    }, 220);
  });
  $('#qClear').addEventListener('click', ()=>{ q.value=''; state.q=''; state.page=1; $('#qClear').classList.remove('show'); render(); q.focus(); });

  const syncSort = v => { state.orden=v; state.page=1; $('#sort').value=v; $('#sortMobile').value=v; render(); };
  $('#sort').value = state.orden; $('#sortMobile').value = state.orden;
  $('#sort').addEventListener('change', e=>syncSort(e.target.value));
  $('#sortMobile').addEventListener('change', e=>syncSort(e.target.value));
  /* mostrar orden móvil si el de la barra está oculto */
  const mq = window.matchMedia('(max-width:640px)');
  const swap = ()=> $('#sortMobile').style.display = mq.matches ? 'block' : 'none';
  swap(); mq.addEventListener('change', swap);

  $('#filterToggle').addEventListener('click', ()=>{
    const p = $('#filterPanel');
    const open = p.classList.toggle('open');
    $('#filterToggle').setAttribute('aria-expanded', open);
  });

  $('#catChips').addEventListener('click', e=>{
    const b = e.target.closest('[data-cat]'); if(!b) return;
    state.cat = b.dataset.cat; state.sub=''; state.page=1;
    renderChips(); renderSubs(); render();
  });
  $('#filterPanel').addEventListener('click', e=>{
    const sub = e.target.closest('[data-sub]');
    if(sub){ state.sub = state.sub===sub.dataset.sub ? '' : sub.dataset.sub; state.page=1; renderSubs(); render(); return; }
    const tipo = e.target.closest('[data-tipo]');
    if(tipo){ state.tipo = tipo.dataset.tipo; state.page=1; renderFilterOpts(); render(); return; }
    const precio = e.target.closest('[data-precio]');
    if(precio){ state.precio = precio.dataset.precio; state.page=1; renderFilterOpts(); render(); return; }
    const col = e.target.closest('[data-col]');
    if(col){ state.col = col.dataset.col; state.page=1; renderFilterOpts(); render(); return; }
    if(e.target.closest('#fpClear')){
      state.q=''; state.sub=''; state.tipo=''; state.precio=''; state.col=''; state.cat=''; state.page=1;
      q.value=''; $('#qClear').classList.remove('show');
      renderChips(); renderSubs(); renderFilterOpts(); render();
    }
  });

  $('#loadMore').addEventListener('click', ()=>{ state.page++; render();
    /* mantener scroll aproximado: el botón queda visible */
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderChips(); renderSubs(); renderFilterOpts(); bind(); render();
});
})();
