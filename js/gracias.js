/* ============================================================
   PARCHATE.STORE — RESPUESTA DE PAGO (ePayco)
   Lee ref_payco de la URL, valida contra la API pública de
   ePayco y muestra el estado con el resumen del pedido.
   ============================================================ */
(function(){
'use strict';
const CFG = window.PARCHATE_CONFIG;
const $ = s => document.querySelector(s);
const fmt = n => '$' + Number(n).toLocaleString('es-CO');
const waLink = m => 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(m);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const ICONS = {
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>',
  bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>',
  wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 7v5l3 2"/></svg>'
};

function lastOrder(){
  try{ return JSON.parse(localStorage.getItem('parchate_last_order')); }catch(e){ return null; }
}

function show(kind, title, msg, data){
  $('#paySpin').style.display = 'none';
  const icon = document.createElement('div');
  icon.className = 'pay-icon ' + kind;
  icon.innerHTML = ICONS[kind];
  $('#payCard').prepend(icon);
  $('#payTitle').textContent = title;
  $('#payMsg').textContent = msg;
  if(data && data.length){
    const box = $('#payData');
    box.style.display = 'grid';
    box.innerHTML = data.map(([k,v])=>'<div><span class="k">'+esc(k)+'</span><span class="v">'+esc(v)+'</span></div>').join('');
  }
}

function ctas(extraWaMsg){
  const wa = window.PARCHATE_SVG ? window.PARCHATE_SVG.wa : '';
  $('#payCtas').innerHTML =
    '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' + waLink(extraWaMsg) + '">' + wa + ' Confirmar por WhatsApp</a>' +
    '<a class="btn btn-ghost btn-block" href="parches.html">Seguir explorando parches</a>';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const ref = new URLSearchParams(location.search).get('ref_payco');
  const order = lastOrder();

  if(!ref){
    show('wait', 'No encontramos la transacción', 'Si acabas de pagar, revisa tu correo o escríbenos por WhatsApp con tu comprobante.');
    ctas('Hola PARCHATE.STORE 👋 Acabo de intentar un pago online y quiero confirmar mi pedido.');
    return;
  }

  fetch('https://secure.epayco.co/validation/v1/reference/' + encodeURIComponent(ref))
    .then(r=>r.json())
    .then(res=>{
      const d = res && res.data ? res.data : {};
      const estado = String(d.x_response || d.x_transaction_state || '').toLowerCase();
      const valor = d.x_amount ? fmt(d.x_amount) : (order ? fmt(order.total) : '—');
      const factura = d.x_id_invoice || (order ? order.invoice : '—');
      const rows = [
        ['Referencia ePayco', ref],
        ['Pedido', factura],
        ['Valor', valor],
        ['Medio de pago', d.x_franchise || d.x_bank_name || '—']
      ];
      const waMsg = 'Hola PARCHATE.STORE 👋 Ya realicé el pago de mi pedido.' +
        '\n• Pedido: ' + factura + '\n• Referencia ePayco: ' + ref + '\n• Valor: ' + valor +
        (order && order.items ? '\n\nMi pedido:\n' + order.items.map(i=>'• ' + i.sku + ' ×' + i.qty + (i.back && i.back!=='Por definir' ? ' ('+i.back+')' : '')).join('\n') : '') +
        '\n\nQuedo atento a la confirmación de envío. ¡Gracias!';

      if(estado.includes('acept') || estado.includes('aprob')){
        show('ok', '¡Pago aprobado! 🎉', 'Recibimos tu pago. Envíanos el mensaje de confirmación y coordinamos tu envío de una vez.', rows);
        localStorage.removeItem('parchate_cart');
        ctas(waMsg);
      } else if(estado.includes('pendiente')){
        show('wait', 'Pago pendiente', 'Tu pago está en proceso (PSE y algunos medios pueden tardar unos minutos). Te llegará confirmación de ePayco al correo.', rows);
        ctas(waMsg);
      } else if(estado.includes('rechaz') || estado.includes('fallid') || estado.includes('cancel')){
        show('bad', 'Pago no aprobado', 'La transacción no fue aprobada. Puedes intentarlo de nuevo desde tu pedido o escribirnos por WhatsApp para ayudarte.', rows);
        ctas('Hola PARCHATE.STORE 👋 Intenté pagar online (ref ' + ref + ') pero no fue aprobado. ¿Me ayudan a completar mi pedido?');
      } else {
        show('wait', 'Estado: ' + (d.x_response || 'desconocido'), 'Consulta tu correo o escríbenos por WhatsApp con la referencia para verificarlo.', rows);
        ctas(waMsg);
      }
    })
    .catch(()=>{
      show('wait', 'No pudimos verificar el estado', 'Tu pago puede haberse procesado igual. Escríbenos por WhatsApp con la referencia ' + ref + ' y lo confirmamos.');
      ctas('Hola PARCHATE.STORE 👋 Hice un pago online con referencia ' + ref + ' y quiero confirmar mi pedido.');
    });
});
})();
