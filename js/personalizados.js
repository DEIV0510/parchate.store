/* ============================================================
   PARCHATE.STORE — PERSONALIZADOS
   Formulario de cotización con carga/preview de imagen y
   envío por WhatsApp.
   ============================================================ */
(function(){
'use strict';
const CFG = window.PARCHATE_CONFIG;
const $ = s => document.querySelector(s);
const waLink = m => 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(m);

const MAX_MB = 10;
const OK_TYPES = ['image/jpeg','image/png','image/webp','application/pdf'];
let file = null;

document.addEventListener('DOMContentLoaded', ()=>{

  /* Galerías de trabajos reales */
  const hg = $('#heroGallery');
  for(let i=1;i<=6;i++){
    hg.innerHTML += '<img src="img/custom/custom-'+String(i).padStart(2,'0')+'.webp" alt="Parche personalizado n.º '+i+' fabricado por PARCHATE.STORE" loading="lazy">';
  }
  const qa = $('#qaGallery');
  for(let i=7;i<=12;i++){
    qa.innerHTML += '<img src="img/custom/custom-'+String(i).padStart(2,'0')+'.webp" alt="Parche personalizado n.º '+i+' fabricado por PARCHATE.STORE" loading="lazy">';
  }
  const chk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>';
  $('#qaList').innerHTML = [
    'Logos de clubes moteros y equipos',
    'Emblemas para chaquetas y chalecos',
    'Parches para empresas, bandas y colectivos',
    'Nombres, banderas y escudos a medida',
    'Diseños desde tu dibujo o foto'
  ].map(t=>'<li>'+chk+'<span>'+t+'</span></li>').join('');

  /* WhatsApp rápido */
  $('#quickWa').href = waLink('Hola PARCHATE.STORE 👋 Quiero cotizar un parche personalizado. Te comparto mi idea:');

  /* ---------- Dropzone ---------- */
  const dz = $('#dropzone'), input = $('#fFile'), prev = $('#dzPreview');
  const fileErr = $('#fileErr');

  function showErr(msg){ fileErr.textContent = msg; fileErr.style.display='block'; }
  function clearErr(){ fileErr.style.display='none'; }

  function setFile(f){
    clearErr();
    if(!f) return;
    if(!OK_TYPES.includes(f.type)){ showErr('Formato no permitido. Usa JPG, PNG, WEBP o PDF.'); return; }
    if(f.size > MAX_MB*1024*1024){ showErr('El archivo pesa más de '+MAX_MB+' MB. Comprímelo e inténtalo de nuevo.'); return; }
    file = f;
    $('#dzName').textContent = f.name;
    $('#dzSize').textContent = (f.size/1024/1024).toFixed(2)+' MB';
    const isPdf = f.type==='application/pdf';
    $('#dzImg').style.display = isPdf?'none':'block';
    $('#dzPdf').style.display = isPdf?'flex':'none';
    if(!isPdf){
      const r = new FileReader();
      r.onload = e => $('#dzImg').src = e.target.result;
      r.readAsDataURL(f);
    }
    prev.classList.add('show');
    dz.style.display='none';
  }
  function removeFile(){
    file = null; input.value='';
    prev.classList.remove('show');
    dz.style.display='block';
    clearErr();
  }
  dz.addEventListener('click', ()=>input.click());
  dz.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); input.click(); } });
  input.addEventListener('change', ()=>setFile(input.files[0]));
  ['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e=>setFile(e.dataTransfer.files[0]));
  $('#dzRemove').addEventListener('click', removeFile);

  /* ---------- Validación ---------- */
  const form = $('#quoteForm');
  const RULES = {
    fName: () => $('#fName').value.trim().length < 2,
    fWa:   () => $('#fWa').value.replace(/\D/g,'').length < 10,
    fEmail:() => !!$('#fEmail').value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#fEmail').value.trim()),
    fTipo: () => !$('#fTipo').value,
    fQty:  () => !(parseInt($('#fQty').value) >= 1),
    fDesc: () => $('#fDesc').value.trim().length < 10
  };
  function setInvalid(id, bad){
    $('#'+id).closest('.field').classList.toggle('invalid', bad);
    return bad;
  }
  /* validación completa: solo en el submit (ahí sí se enfoca el primer error) */
  function validate(){
    let firstBad = null;
    Object.keys(RULES).forEach(id=>{ if(setInvalid(id, RULES[id]()) && !firstBad) firstBad = id; });
    if(firstBad){ $('#'+firstBad).focus(); return false; }
    return true;
  }
  /* en blur solo se valida el campo que se acaba de tocar, sin robar el foco */
  Object.keys(RULES).forEach(id=>{
    $('#'+id).addEventListener('blur', ()=>setInvalid(id, RULES[id]()));
    $('#'+id).addEventListener('input', ()=>$('#'+id).closest('.field').classList.remove('invalid'));
  });

  let sending = false;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    if(sending) return;
    if(!validate()){ window.PARCHATE_TOAST('Revisa los campos marcados en rojo.'); return; }
    sending = true;
    const sb = $('#submitBtn');
    sb.disabled = true; sb.style.opacity = '.6';
    setTimeout(()=>{ sending = false; sb.disabled = false; sb.style.opacity = ''; }, 2500);
    const v = id => $('#'+id).value.trim();
    let msg = 'Hola PARCHATE.STORE 👋\n*Solicitud de parche personalizado*\n' +
      '\n• Nombre: ' + v('fName') +
      '\n• WhatsApp: ' + v('fWa') +
      (v('fEmail') ? '\n• Correo: ' + v('fEmail') : '') +
      '\n• Tipo de parche: ' + v('fTipo') +
      '\n• Cantidad: ' + v('fQty') +
      (v('fSize') ? '\n• Tamaño aprox.: ' + v('fSize') : '') +
      '\n• Fijación: ' + $('#fBack').value +
      '\n\n📝 Mi idea:\n' + v('fDesc');
    msg += file
      ? '\n\n📎 En seguida te adjunto la imagen de referencia (' + file.name + ').'
      : '\n\n(No tengo imagen aún, parto de la descripción.)';
    msg += '\n\nQuedo atento a la cotización. ¡Gracias!';
    window.open(waLink(msg), '_blank', 'noopener');
    window.PARCHATE_TOAST(file
      ? 'WhatsApp abierto: recuerda adjuntar tu imagen en el chat 📎'
      : 'WhatsApp abierto con tu solicitud ✓');
  });
});
})();
