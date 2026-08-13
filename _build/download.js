const fs=require('fs'),path=require('path');
const SRC='C:/Users/Lenovo/Desktop/PARCHADOS';
const OUT=path.join(__dirname,'downloads');
fs.mkdirSync(OUT,{recursive:true});
const csvRaw=fs.readFileSync(path.join(SRC,'wc-product-export-13-8-2026-1786639715104.csv'),'utf8').replace(/^\uFEFF/,'');
function parseCSV(t){const rows=[];let row=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else{if(ch==='"')q=true;else if(ch===','){row.push(c);c=''}else if(ch==='\n'){row.push(c);rows.push(row);row=[];c=''}else if(ch!=='\r')c+=ch}}if(c!==''||row.length){row.push(c);rows.push(row)}return rows}
const rows=parseCSV(csvRaw);const h=rows[0];const idx={};h.forEach((x,i)=>idx[x]=i);
const localFiles={};
(function walk(d){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=path.join(d,e.name);if(e.isDirectory())walk(f);else localFiles[e.name.toLowerCase()]=f})})(path.join(SRC,'Fotos'));
// URLs a bajar: primera imagen de cada producto sin archivo local
const jobs=[];
rows.slice(1).filter(r=>r.length>5).forEach(r=>{
  const sku=String(r[idx['SKU']]);
  const urls=(r[idx['Imágenes']]||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(!urls.length) return;
  const hasLocal = urls.some(u=>localFiles[decodeURIComponent(u.split('/').pop()).toLowerCase()]) || ['jpg','png','jpeg'].some(e=>localFiles[(sku+'.'+e).toLowerCase()]);
  if(hasLocal) return;
  const u=urls[0];
  const ext=(u.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z]/g,'')||'jpg';
  jobs.push({sku,url:u,dest:path.join(OUT,sku+'.'+ext)});
});
console.log('A descargar:',jobs.length);
let ok=0,fail=[];
async function grab(j,attempt=1){
  try{
    const res=await fetch(j.url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const buf=Buffer.from(await res.arrayBuffer());
    if(buf.length<1000) throw new Error('too small '+buf.length);
    fs.writeFileSync(j.dest,buf); ok++;
  }catch(e){
    if(attempt<3){ await new Promise(r=>setTimeout(r,800*attempt)); return grab(j,attempt+1); }
    fail.push(j.sku+' '+j.url+' -> '+e.message);
  }
}
(async()=>{
  const CONC=6;
  for(let i=0;i<jobs.length;i+=CONC){
    await Promise.all(jobs.slice(i,i+CONC).map(j=>fs.existsSync(j.dest)?(ok++,Promise.resolve()):grab(j)));
    if((i/CONC)%10===0) console.log('progreso',Math.min(i+CONC,jobs.length),'/',jobs.length);
  }
  console.log('OK:',ok,'FALLOS:',fail.length);
  fail.forEach(f=>console.log('  FAIL '+f));
  fs.writeFileSync(path.join(__dirname,'download-report.json'),JSON.stringify({ok,fail},null,2));
})();
