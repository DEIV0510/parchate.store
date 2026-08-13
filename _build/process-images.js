/* Optimiza todas las imágenes del proyecto a WebP con sharp. */
const sharp = require('C:/Users/Lenovo/Desktop/PROYECTOS-CLAUDE/samira-bienestar/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Lenovo/Desktop/PARCHADOS';
const ROOT = path.join(__dirname, '..');
const manifest = require('./manifest.json');

const P = path.join(ROOT,'img','p');
const CAT = path.join(ROOT,'img','cat');
const CUS = path.join(ROOT,'img','custom');
const BR = path.join(ROOT,'img','brand');
[P,CAT,CUS,BR].forEach(d=>fs.mkdirSync(d,{recursive:true}));

const fail = [];
async function toWebp(src, dest, width, q, extra={}){
  try{
    let img = sharp(src).rotate();
    img = img.resize({ width, withoutEnlargement:true, ...extra });
    await img.webp({ quality:q }).toFile(dest);
    return true;
  }catch(e){ fail.push(dest+' <- '+src+' : '+e.message); return false; }
}

(async()=>{
  // 1) productos: thumb 480 + lg 1000
  const skus = Object.keys(manifest);
  console.log('Procesando', skus.length, 'productos…');
  const CONC = 8;
  let done=0;
  for (let i=0;i<skus.length;i+=CONC){
    await Promise.all(skus.slice(i,i+CONC).map(async sku=>{
      const src = manifest[sku];
      const t = path.join(P, sku+'.webp'), l = path.join(P, sku+'-lg.webp');
      if (!fs.existsSync(t)) await toWebp(src, t, 480, 78);
      if (!fs.existsSync(l)) await toWebp(src, l, 1000, 84);
      done++;
    }));
    if (i % 160 === 0) console.log(' ', done, '/', skus.length);
  }

  // 2) covers de categorías (collages)
  const covers = {
    moteros: 'Fotos/collage/Harley collage.jpg',
    musica: 'Fotos/collage/collage Metal.jpg',
    animados: 'Fotos/collage/collage simpson.jpg',
    peliculas: 'Fotos/collage/collage Star Wars.jpg',
    banderas: 'Fotos/collage/collage Banderas.jpg',
    aeroespaciales: 'Fotos/collage/collage Nasa.jpg',
    deportes: 'Fotos/collage/collage Futbol.jpg',
    autos: 'Fotos/collage/Collage volkswagen.jpg',
    varios: 'Fotos/collage/collage superheroes.jpg',
  };
  for (const [id, rel] of Object.entries(covers)){
    await toWebp(path.join(SRC, rel), path.join(CAT, id+'.webp'), 900, 76);
  }
  // cover láser: composición 2x2 de parches láser sobre fondo oscuro
  try{
    const laserDir = path.join(SRC,'Fotos','LASER');
    const picks = ['L1001.png','L1005.png','L1012.png','L1020.png'].filter(f=>fs.existsSync(path.join(laserDir,f)));
    const cell = 450;
    const tiles = await Promise.all(picks.slice(0,4).map(f=>
      sharp(path.join(laserDir,f)).resize(cell,cell,{fit:'contain',background:{r:19,g:16,b:25,alpha:1}}).toBuffer()
    ));
    const composite = tiles.map((buf,i)=>({ input:buf, left:(i%2)*cell, top:Math.floor(i/2)*cell }));
    await sharp({create:{width:cell*2,height:cell*2,channels:3,background:{r:19,g:16,b:25}}})
      .composite(composite).webp({quality:78}).toFile(path.join(CAT,'laser.webp'));
    console.log('cover laser OK');
  }catch(e){ fail.push('laser cover: '+e.message); }

  // collages extra para el home (marquee / hero strips)
  const extra = { 'hero-harley':'Fotos/collage/Harley collage.jpg', 'hero-metal':'Fotos/collage/collage Metal.jpg', 'hero-nasa':'Fotos/collage/collage Nasa.jpg', 'hero-starwars':'Fotos/collage/collage Star Wars.jpg', 'hero-banderas':'Fotos/collage/collage Banderas.jpg', 'hero-simpson':'Fotos/collage/collage simpson.jpg' };
  for (const [n, rel] of Object.entries(extra)) await toWebp(path.join(SRC,rel), path.join(CAT,n+'.webp'), 1200, 72);

  // 3) personalizados (solo jpg, sin HEIC)
  const cdir = path.join(SRC,'Fotos','personalizados');
  const cfiles = fs.readdirSync(cdir).filter(f=>/\.(jpe?g|png)$/i.test(f));
  let ci=1;
  for (const f of cfiles){
    await toWebp(path.join(cdir,f), path.join(CUS,'custom-'+String(ci).padStart(2,'0')+'.webp'), 800, 78);
    ci++;
  }
  console.log('personalizados:', ci-1);

  // 4) marca
  await toWebp(path.join(SRC,'Logos','P logo.png'), path.join(BR,'logo-mark.webp'), 512, 92);
  await toWebp(path.join(SRC,'Logos','Solo palabra.png'), path.join(BR,'logo-word.webp'), 900, 92);
  await toWebp(path.join(SRC,'Logos','Logo instagram.png'), path.join(BR,'logo-full.webp'), 800, 92);
  // favicon png 96
  try{
    await sharp(path.join(SRC,'Logos','P logo.png')).resize(96,96).png().toFile(path.join(BR,'favicon.png'));
    await sharp(path.join(SRC,'Logos','P logo.png')).resize(192,192).png().toFile(path.join(BR,'icon-192.png'));
    await sharp(path.join(SRC,'Logos','P logo.png')).resize(512,512).png().toFile(path.join(BR,'icon-512.png'));
  }catch(e){ fail.push('favicon: '+e.message); }
  // og-image 1200x630: fondo oscuro + wordmark centrado
  try{
    const word = await sharp(path.join(SRC,'Logos','Solo palabra.png')).resize({width:900}).toBuffer();
    const wmeta = await sharp(word).metadata();
    await sharp({create:{width:1200,height:630,channels:3,background:{r:10,g:8,b:15}}})
      .composite([{input:word,left:Math.round((1200-wmeta.width)/2),top:Math.round((630-wmeta.height)/2)}])
      .jpeg({quality:88}).toFile(path.join(BR,'og-image.jpg'));
  }catch(e){ fail.push('og: '+e.message); }

  console.log('FALLOS:', fail.length); fail.forEach(f=>console.log('  '+f));
  // tamaño total
  let total=0, count=0;
  (function du(d){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=path.join(d,e.name);if(e.isDirectory())du(f);else{total+=fs.statSync(f).size;count++}})})(path.join(ROOT,'img'));
  console.log('img/: '+count+' archivos, '+(total/1024/1024).toFixed(1)+' MB');
})();
