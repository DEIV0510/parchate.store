/* ============================================================
   CONFIGURACIÓN GENERAL — PARCHATE.STORE
   Edita aquí los datos de contacto sin tocar el resto del código.
   ============================================================ */
window.PARCHATE_CONFIG = {
  nombre: 'PARCHATE.STORE',
  whatsapp: '573212173973',            // solo dígitos, con indicativo de país
  telefonoBonito: '321 217 3973',
  direccion: 'Carrera 24 # 45C-51',
  ciudad: 'Bogotá, Colombia',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Carrera+24+%2345C-51+Bogot%C3%A1',
  mapsEmbed: 'https://www.google.com/maps?q=Carrera+24+%2345C-51,+Bogot%C3%A1,+Colombia&output=embed',
  instagram: 'https://www.instagram.com/parchate.store',
  facebook: 'https://www.facebook.com/parchate.store',
  tiktok: 'https://www.tiktok.com/@parchate.store',
  web: 'https://www.parchate.store',
  horario: 'Lun – Sáb · 9:00 am – 6:00 pm',
  recargoVelcro: 3000,           // valor extra POR UNIDAD cuando eligen respaldo en velcro

  /* ---- Pasarela de pagos ePayco (la misma cuenta del WooCommerce anterior) ----
     Pega aquí la LLAVE PÚBLICA (PUBLIC_KEY) que aparece en
     dashboard.epayco.com → Integraciones → Llaves API.
     Con la llave puesta, el carrito muestra el botón "Pagar online". */
  epayco: {
    publicKey: '0765b80119f35ede2ce0267b9eb72d0b',  // llave PÚBLICA (la secreta nunca va aquí)
    test: false                  // true solo para pruebas
  }
};
