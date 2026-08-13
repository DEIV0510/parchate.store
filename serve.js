/* Servidor estático local — PARCHATE.STORE
   Uso: node serve.js  →  http://localhost:5244  */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5244;
const ROOT = __dirname;
const MIME = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.xml':'application/xml', '.txt':'text/plain', '.webmanifest':'application/manifest+json'
};

http.createServer((req, res)=>{
  let urlPath;
  try{ urlPath = decodeURIComponent(req.url.split('?')[0]); }
  catch(e){ res.writeHead(400, {'Content-Type':'text/plain'}); return res.end('400'); }
  if(urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, path.normalize(urlPath).replace(/^([.][.][/\\])+/, ''));
  if(!file.startsWith(ROOT)){ res.writeHead(403); return res.end('403'); }
  fs.readFile(file, (err, data)=>{
    if(err){ res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('404'); }
    const ext = path.extname(file).toLowerCase();
    /* los datos del catálogo (precios) y la config no se cachean: se actualizan sin busting */
    const isData = /[\\/]js[\\/](data[\\/]|config\.js)/.test(file);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': (ext==='.html' || isData) ? 'no-cache' : 'public, max-age=86400'
    });
    res.end(data);
  });
}).listen(PORT, ()=>console.log('PARCHATE.STORE → http://localhost:'+PORT));
