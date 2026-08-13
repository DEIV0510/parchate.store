const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
// docx = zip; extract word/document.xml via PowerShell Expand-Archive alternative: use node with no deps -> use unzip? Try tar (bsdtar supports zip)
const src = 'C:/Users/Lenovo/Desktop/PARCHADOS/Cuestionario.docx';
const out = 'C:/Users/Lenovo/Desktop/PROYECTOS-CLAUDE/parchate-store/_build/docx_extract';
fs.mkdirSync(out, { recursive: true });
try { execSync(`tar -xf "${src}" -C "${out}" word/document.xml`, {stdio:'inherit'}); } catch(e){ console.log('tar failed', e.message); }
const xml = fs.readFileSync(path.join(out,'word/document.xml'),'utf8');
const text = xml.replace(/<w:p [^>]*>|<w:p>/g,'\n').replace(/<[^>]+>/g,'').replace(/\n{2,}/g,'\n').trim();
console.log(text.slice(0,6000));
