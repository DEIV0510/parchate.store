# PARCHATE.STORE — Tienda / catálogo web

Tienda-catálogo profesional para **PARCHATE.STORE** (parches bordados, Bogotá):
891 productos reales, buscador, filtros, páginas de producto, carrito → WhatsApp
y cotizador de parches personalizados con carga de imagen.

## Ejecutar

```bash
node serve.js
```

→ http://localhost:5244 (sin dependencias).

## Estructura

```
index.html            Home (hero, categorías, destacados, personalizados, ubicación…)
parches.html          Catálogo completo (búsqueda, filtros, orden, paginación)
producto.html?sku=X   Detalle de producto (respaldo, cantidad, carrito, WhatsApp)
personalizados.html   Cotizador de parches personalizados (formulario + imagen)
css/                  base.css (tokens+componentes) · home.css · paginas.css
js/config.js          ★ Datos de contacto editables (WhatsApp, dirección, redes)
js/data/productos.js  ★ Catálogo (generado desde el export WooCommerce)
js/data/categorias.js Categorías con covers y conteos
js/core.js            Header, footer, carrito (localStorage), menú, buscador
js/home.js            Render del home
js/catalogo.js        Motor de búsqueda/filtros del catálogo
js/producto.js        Detalle + JSON-LD dinámico
js/personalizados.js  Formulario de cotización + preview de archivo
img/p/                Fotos de producto (sku.webp 480px + sku-lg.webp 1000px)
img/cat/              Covers de categorías (collages reales)
img/custom/           Trabajos personalizados reales
img/brand/            Logos, favicon, og-image
_build/               Scripts de generación (no publicar): descarga, datos, imágenes
```

## Cómo actualizar el catálogo

**Opción A (recomendada):** exporta de nuevo los productos desde WooCommerce
(CSV) a la carpeta `PARCHADOS` y corre:

```bash
node _build/generate-data.js
node _build/process-images.js
```

**Opción B (manual):** agrega un objeto en `js/data/productos.js`
(`{sku, n, pr, sa, c, s, m, v, t, f, nw}`) y sube su foto como
`img/p/<sku>.webp` (480px) y `img/p/<sku>-lg.webp` (1000px).

La arquitectura es data-driven: nada más que tocar. A futuro puede conectarse a
Google Sheets/Supabase reemplazando `js/data/productos.js` por un fetch.

## Pedidos

Todo el flujo convierte a WhatsApp (**321 217 3973**): tarjetas, detalle,
carrito (mensaje con lista + total) y cotizador (mensaje con los datos del
formulario; la imagen se adjunta en el chat).
