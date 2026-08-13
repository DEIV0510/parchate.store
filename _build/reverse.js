const fs=require('fs'),path=require('path');
const SRC='C:/Users/Lenovo/Desktop/PARCHADOS';
const csvRaw=fs.readFileSync(path.join(SRC,'wc-product-export-13-8-2026-1786639715104.csv'),'utf8').replace(/^\uFEFF/,'');
function parseCSV(t){const rows=[];let row=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else{if(ch==='"')q=true;else if(ch===','){row.push(c);c=''}else if(ch==='\n'){row.push(c);rows.push(row);row=[];c=''}else if(ch!=='\r')c+=ch}}if(c!==''||row.length){row.push(c);rows.push(row)}return rows}
const rows=parseCSV(csvRaw);const h=rows[0];const idx={};h.forEach((x,i)=>idx[x]=i);
const skus=new Set(), csvBases=new Set();
rows.slice(1).filter(r=>r.length>5).forEach(r=>{ skus.add(String(r[idx['SKU']]).toLowerCase()); (r[idx['Imágenes']]||'').split(',').forEach(u=>{u=u.trim();if(u)csvBases.add(decodeURIComponent(u.split('/').pop()).toLowerCase())}); });
// local product photos (exclude collage/personalizados)
const dirs=['1 Animados','2 moteros','3 rockeros','5 escudos y banderas','6 Aeroespaciales','LASER'];
let orphans=[];
dirs.forEach(d=>{ fs.readdirSync(path.join(SRC,'Fotos',d)).forEach(f=>{ if(/\.db$/i.test(f))return; const base=f.toLowerCase(); const stem=base.replace(/\.(jpg|png|jpeg|heic)$/,''); if(!csvBases.has(base) && !skus.has(stem)) orphans.push(d+'/'+f); }); });
console.log('Fotos locales SIN fila en CSV:', orphans.length);
orphans.slice(0,30).forEach(o=>console.log('  '+o));
// dimensiones de muestra
