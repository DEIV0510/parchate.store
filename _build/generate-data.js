/* Genera js/data/productos.js + js/data/categorias.js + _build/manifest.json
   a partir del export de WooCommerce y las imágenes locales/descargadas. */
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Lenovo/Desktop/PARCHADOS';
const ROOT = path.join(__dirname, '..');
const DL = path.join(__dirname, 'downloads');

const csvRaw = fs.readFileSync(path.join(SRC, 'wc-product-export-13-8-2026-1786639715104.csv'), 'utf8').replace(/^\uFEFF/, '');
function parseCSV(t){const rows=[];let row=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else{if(ch==='"')q=true;else if(ch===','){row.push(c);c=''}else if(ch==='\n'){row.push(c);rows.push(row);row=[];c=''}else if(ch!=='\r')c+=ch}}if(c!==''||row.length){row.push(c);rows.push(row)}return rows}
const rows = parseCSV(csvRaw);
const H = rows[0]; const idx = {}; H.forEach((h,i)=>idx[h]=i);
const g = (r,k)=>r[idx[k]] || '';

// ---- archivos locales (Fotos/**) ----
const localFiles = {};
(function walk(d){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=path.join(d,e.name);if(e.isDirectory())walk(f);else localFiles[e.name.toLowerCase()]=f;})})(path.join(SRC,'Fotos'));
const dlFiles = {};
fs.readdirSync(DL).forEach(f=>dlFiles[f.toLowerCase()]=path.join(DL,f));

// ---- taxonomía ----
const CATS = {
  moteros:        { name:'Moteros',            emoji:'🏍️', cover:'Harley collage.jpg' },
  musica:         { name:'Rock y Música',      emoji:'🎸', cover:'collage Metal.jpg' },
  animados:       { name:'Animados',           emoji:'🎮', cover:'collage simpson.jpg' },
  peliculas:      { name:'Películas',          emoji:'🎬', cover:'collage Star Wars.jpg' },
  banderas:       { name:'Banderas y Escudos', emoji:'🇨🇴', cover:'collage Banderas.jpg' },
  aeroespaciales: { name:'Aeroespaciales',     emoji:'🚀', cover:'collage Nasa.jpg' },
  deportes:       { name:'Deportes',           emoji:'⚽', cover:'collage Futbol.jpg' },
  autos:          { name:'Autos',              emoji:'🚗', cover:'Collage volkswagen.jpg' },
  laser:          { name:'Corte Láser',        emoji:'✂️', cover:null },
  varios:         { name:'Varios',             emoji:'🔥', cover:'collage superheroes.jpg' },
};
const SUBMAP = {
  'Moteros': ['moteros', null],
  'Moteros > Harley Davidson': ['moteros','Harley Davidson'],
  'Moteros > Royal Enfield': ['moteros','Royal Enfield'],
  'Moteros > Vespa': ['moteros','Vespa'],
  'Moteros > Yamaha': ['moteros','Yamaha'],
  'Moteros > BMW': ['moteros','BMW'],
  'Moteros > Suzuki': ['moteros','Suzuki'],
  'Moteros > Café Racer': ['moteros','Café Racer'],
  'Moteros > Honda': ['moteros','Honda'],
  'Moteros > Racing': ['moteros','Racing'],
  'Moteros > Triumph': ['moteros','Triumph'],
  'Moteros > Ducati': ['moteros','Ducati'],
  'Moteros > Kawasaki': ['moteros','Kawasaki'],
  'Moteros > KTM': ['moteros','KTM'],
  'Moteros > Husqvarna': ['moteros','Husqvarna'],
  'Moteros > Otros Parches Moteros': ['moteros','Otros'],
  'Música': ['musica', null],
  'Música > Rockeros': ['musica','Rock'],
  'Música > Rockeros > Metal': ['musica','Metal'],
  'Música > Rockeros > Classic Rock': ['musica','Classic Rock'],
  'Música > Rockeros > Hard Rock': ['musica','Hard Rock'],
  'Música > Rockeros > Rock en Español': ['musica','Rock en Español'],
  'Música > Rockeros > Punk': ['musica','Punk'],
  'Música > Rockeros > Pop': ['musica','Pop'],
  'Música > Rockeros > Grunge': ['musica','Grunge'],
  'Música > Rockeros > Otros Rockeros': ['musica','Otros Rockeros'],
  'Música > Reagge': ['musica','Reggae'],
  'Música > Merengue': ['musica','Merengue'],
  'Animados': ['animados', null],
  'Animados > Los Simpson': ['animados','Los Simpson'],
  'Animados > Disney': ['animados','Disney'],
  'Animados > Mario Bross': ['animados','Mario Bros'],
  'Animados > Video Juegos': ['animados','Videojuegos'],
  'Animados > Anime': ['animados','Anime'],
  'Animados > Dragon Ball': ['animados','Dragon Ball'],
  'Animados > Infantil': ['animados','Infantil'],
  'Animados > Películas': ['animados','Películas Animadas'],
  'Animados > Halloween': ['animados','Halloween'],
  'Animados > Otros Personajes Animados': ['animados','Otros Personajes'],
  'Peliculas': ['peliculas', null],
  'Peliculas > Star Wars': ['peliculas','Star Wars'],
  'Banderas y escudos': ['banderas', null],
  'Banderas y escudos > Banderas': ['banderas','Banderas'],
  'Banderas y escudos > Tácticos': ['banderas','Tácticos'],
  'Banderas y escudos > Rh': ['banderas','RH'],
  'Banderas y escudos > Rutas': ['banderas','Rutas'],
  'Banderas y escudos > Escudos': ['banderas','Escudos'],
  'Banderas y escudos > Fuerza Aérea': ['banderas','Fuerza Aérea'],
  'AeroEspaciales': ['aeroespaciales', null],
  'AeroEspaciales > Nasa': ['aeroespaciales','NASA'],
  'AeroEspaciales > Planetas': ['aeroespaciales','Planetas'],
  'AeroEspaciales > Ufo': ['aeroespaciales','UFO'],
  'Deportes': ['deportes', null],
  'Deportes > Futbol': ['deportes','Fútbol'],
  'Deportes > Baloncesto': ['deportes','Baloncesto'],
  'Deportes > Personajes': ['deportes','Personajes'],
  'Autos': ['autos', null],
  'Autos > Volkswagen': ['autos','Volkswagen'],
  'Autos > Land Rover': ['autos','Land Rover'],
  'Parches Corte Laser': ['laser', null],
  'Parches Varios': ['varios', null],
  'Personajes y Logos Icónicos': ['varios','Logos Icónicos'],
  'Amuletos': ['varios','Amuletos'],
  'Lentejuelas': ['varios','Lentejuelas'],
  'Llaveros': ['varios','Llaveros'],
  'Superhéroes': ['varios','Superhéroes'],
  'Pride': ['varios','Pride'],
  'Viajeros': ['varios','Viajeros'],
};

function classify(catsStr){
  const parts = (catsStr||'').split(',').map(s=>s.trim()).filter(Boolean);
  let best = null; // prefer deepest specific mapping, avoiding 'Parches Varios' when something better exists
  for (const p of parts){
    const m = SUBMAP[p];
    if (!m) continue;
    const specificity = (p.match(/>/g)||[]).length + (p==='Parches Varios' ? -1 : 0);
    if (!best || specificity > best.spec) best = { cat:m[0], sub:m[1], spec:specificity };
  }
  if (!best) return { cat:'varios', sub:null };
  return { cat:best.cat, sub:best.sub };
}

// ---- productos ----
const products = [];
const manifest = {};
let skipped = [];
const seenSku = new Set();
rows.slice(1).filter(r=>r.length>5).forEach(r=>{
  if (g(r,'Publicado')!=='1') { skipped.push([g(r,'SKU'),'no publicado']); return; }
  const sku = String(g(r,'SKU')).trim();
  if (!sku || seenSku.has(sku)) { if(sku) skipped.push([sku,'sku duplicado']); return; }
  const name = g(r,'Nombre').trim();
  const urls = (g(r,'Imágenes')||'').split(',').map(s=>s.trim()).filter(Boolean);
  // resolver imagen: basename del CSV en local → sku.ext local → descargada
  let src = null;
  for (const u of urls){ const b=decodeURIComponent(u.split('/').pop()).toLowerCase(); if (localFiles[b]) { src=localFiles[b]; break; } }
  if (!src) for (const e of ['jpg','png','jpeg']) { const k=(sku+'.'+e).toLowerCase(); if (localFiles[k]) { src=localFiles[k]; break; } }
  if (!src) for (const e of ['jpg','png','jpeg','webp']) { const k=(sku+'.'+e).toLowerCase(); if (dlFiles[k]) { src=dlFiles[k]; break; } }
  if (!src){ skipped.push([sku,'sin imagen']); return; }
  seenSku.add(sku);
  const { cat, sub } = classify(g(r,'Categorías'));
  const isLaser = /Parches Corte Laser/i.test(g(r,'Categorías'));
  const isLente = /Lentejuelas/i.test(g(r,'Categorías'));
  const isLlavero = /Llaveros/i.test(g(r,'Categorías'));
  const short = g(r,'Descripción corta');
  const sizeM = short.match(/Medida:?\s*([^\\\n]+?)(?:\\n|$)/i);
  const size = sizeM ? sizeM[1].trim() : null;
  const price = parseFloat(g(r,'Precio normal')) || 0;
  const saleRaw = parseFloat(g(r,'Precio rebajado'));
  const sale = (!isNaN(saleRaw) && saleRaw>0 && saleRaw<price) ? saleRaw : null;
  const views = (parseInt(g(r,'Meta: woolentor_views_count_product'))||0) + (parseInt(g(r,'Meta: ekit_post_views_count'))||0) + (parseInt(g(r,'Meta: _eael_post_view_count'))||0);
  manifest[sku] = src;
  const tipo = isLaser ? 'laser' : isLente ? 'lentejuelas' : isLlavero ? 'llavero' : 'bordado';
  products.push({ sku, name, price, sale, cat, sub, size, views, tipo, id: parseInt(g(r,'ID'))||0 });
});

// precio $10 es un error de datos (Llavero a $10) -> revisar
products.filter(p=>p.price<1000).forEach(p=>console.log('PRECIO SOSPECHOSO:', p.sku, p.name, p.price));

// popularidad → feat (top 16 con diversidad de categoría, max 3 por cat)
const byViews = [...products].sort((a,b)=>b.views-a.views);
const featSet = new Set(); const perCat = {};
for (const p of byViews){ if (featSet.size>=16) break; if ((perCat[p.cat]||0)>=3) continue; featSet.add(p.sku); perCat[p.cat]=(perCat[p.cat]||0)+1; }
// nuevos = 24 IDs más altos
const newSet = new Set([...products].sort((a,b)=>b.id-a.id).slice(0,24).map(p=>p.sku));

const out = products.map(p=>({ sku:p.sku, n:p.name, pr:p.price, sa:p.sale, c:p.cat, s:p.sub, m:p.size, v:p.views, t:p.tipo, f:featSet.has(p.sku)?1:0, nw:newSet.has(p.sku)?1:0 }));

fs.mkdirSync(path.join(ROOT,'js','data'), {recursive:true});
const banner = `/* ============================================================\n   CATÁLOGO PARCHATE.STORE — generado desde el export WooCommerce\n   ${out.length} productos · ${new Date().toISOString().slice(0,10)}\n   Campos: sku, n(ombre), pr(ecio), sa(precio rebajado|null), c(ategoría),\n           s(ubcategoría|null), m(edida|null), v(istas), f(destacado), nw(nuevo)\n   Para AGREGAR un producto: añade un objeto igual y sube su foto a img/p/<sku>.webp\n   (miniatura) y img/p/<sku>-lg.webp (grande). Regenerable con _build/generate-data.js\n   ============================================================ */\nwindow.PARCHATE_PRODUCTS = `;
fs.writeFileSync(path.join(ROOT,'js','data','productos.js'), banner + JSON.stringify(out) + ';\n');

const catOut = Object.entries(CATS).map(([id,c])=>({ id, name:c.name, cover:'img/cat/'+id+'.webp', count: products.filter(p=>p.cat===id).length }));
fs.writeFileSync(path.join(ROOT,'js','data','categorias.js'),
`/* Categorías del catálogo. cover = imagen en img/cat/ */\nwindow.PARCHATE_CATS = ` + JSON.stringify(catOut, null, 2) + ';\n');

fs.writeFileSync(path.join(__dirname,'manifest.json'), JSON.stringify(manifest,null,1));
console.log('Productos:', out.length, '| destacados:', featSet.size, '| nuevos:', newSet.size);
console.log('Por categoría:', JSON.stringify(Object.fromEntries(catOut.map(c=>[c.id,c.count]))));
console.log('Con medida:', out.filter(p=>p.m).length, '| con rebaja:', out.filter(p=>p.sa).length);
console.log('Saltados:', skipped.length, JSON.stringify(skipped.slice(0,15)));
console.log('Top10 vistos:', byViews.slice(0,10).map(p=>`${p.name}(${p.views})`).join(', '));
