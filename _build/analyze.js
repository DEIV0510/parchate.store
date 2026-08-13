const fs = require('fs');
const path = require('path');
const SRC = 'C:/Users/Lenovo/Desktop/PARCHADOS';
const csvRaw = fs.readFileSync(path.join(SRC, 'wc-product-export-13-8-2026-1786639715104.csv'), 'utf8').replace(/^\uFEFF/, '');

// RFC4180 parser
function parseCSV(text){
  const rows=[]; let row=[], cell='', inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){
      if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else inQ=false; }
      else cell+=c;
    } else {
      if(c==='"') inQ=true;
      else if(c===','){ row.push(cell); cell=''; }
      else if(c==='\n'){ row.push(cell); rows.push(row); row=[]; cell=''; }
      else if(c==='\r'){}
      else cell+=c;
    }
  }
  if(cell!==''||row.length){ row.push(cell); rows.push(row); }
  return rows;
}
const rows = parseCSV(csvRaw);
const header = rows[0];
const idx = {};
header.forEach((h,i)=>idx[h]=i);
console.log('COLUMNAS CLAVE:', ['SKU','Nombre','Publicado','¿Está destacado?','Descripción corta','Precio rebajado','Precio normal','Categorías','Imágenes','Inventario','¿En inventario?'].map(k=>k+'='+idx[k]).join(' | '));
const prods = rows.slice(1).filter(r=>r.length>5).map(r=>({
  id:r[idx['ID']], sku:r[idx['SKU']], name:r[idx['Nombre']], pub:r[idx['Publicado']],
  feat:r[idx['¿Está destacado?']], short:r[idx['Descripción corta']],
  sale:r[idx['Precio rebajado']], price:r[idx['Precio normal']],
  cats:r[idx['Categorías']], img:r[idx['Imágenes']], type:r[idx['Tipo']]
}));
console.log('TOTAL FILAS PRODUCTO:', prods.length);
console.log('Publicados:', prods.filter(p=>p.pub==='1').length, '| Destacados:', prods.filter(p=>p.feat==='1').length);
console.log('Tipos:', [...new Set(prods.map(p=>p.type))].join(', '));

// categorías
const catCount={};
prods.forEach(p=>{ (p.cats||'').split(',').forEach(c=>{ c=c.trim(); if(c) catCount[c]=(catCount[c]||0)+1; }); });
console.log('\n=== CATEGORIAS (todas) ===');
Object.entries(catCount).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(`${n}\t${c}`));

// precios
const prices = prods.map(p=>parseFloat(p.price)).filter(n=>!isNaN(n)&&n>0);
console.log('\nPrecios: min', Math.min(...prices), 'max', Math.max(...prices), 'con precio:', prices.length, 'sin precio:', prods.length-prices.length);
const dist={}; prices.forEach(p=>dist[p]=(dist[p]||0)+1);
console.log('Distribución:', Object.entries(dist).sort((a,b)=>a[0]-b[0]).map(([p,n])=>`$${p}×${n}`).join(' '));

// mapear imágenes locales
const localFiles = {};
function walk(d){ fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{ const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else localFiles[e.name.toLowerCase()]=f; }); }
walk(path.join(SRC,'Fotos'));

let matched=0, unmatched=[];
prods.forEach(p=>{
  const imgs=(p.img||'').split(',').map(s=>s.trim()).filter(Boolean);
  const found = imgs.some(u=>{ const base=decodeURIComponent(u.split('/').pop()).toLowerCase(); return localFiles[base]; });
  // también probar por SKU
  const bySku = ['jpg','png','jpeg'].some(ext=>localFiles[(p.sku+'.'+ext).toLowerCase()]);
  if(found||bySku) matched++; else unmatched.push(p.sku+' | '+p.name+' | '+(p.img||'').slice(0,80));
});
console.log('\nMATCH imagen local: ', matched, '/', prods.length);
console.log('SIN imagen local (primeros 25):');
unmatched.slice(0,25).forEach(u=>console.log('  '+u));
console.log('Total sin imagen:', unmatched.length);

// SKUs con multiples imágenes en CSV
const multi = prods.filter(p=>(p.img||'').includes(','));
console.log('\nProductos con galería (multi-imagen):', multi.length);
multi.slice(0,5).forEach(p=>console.log('  '+p.sku+': '+p.img));
