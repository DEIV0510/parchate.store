# Respaldo zona DNS parchate.store — 2026-08-13 (antes de apuntar a Vercel)

Nameservers: ns1.dns-parking.com / ns2.dns-parking.com (Hostinger, cuenta vistetuparche@gmail.com)

| Tipo | Nombre | Prioridad | Contenido | TTL |
|---|---|---|---|---|
| CNAME | hostingermail-c._domainkey | 0 | hostingermail-c.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-b._domainkey | 0 | hostingermail-b.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-a._domainkey | 0 | hostingermail-a.dkim.mail.hostinger.com | 300 |
| CNAME | www | 0 | www.parchate.store.cdn.hstgr.net | 300 |
| CNAME | autodiscover | 0 | autodiscover.mail.hostinger.com | 300 |
| A | ftp | 0 | 82.29.86.138 | 1800 |
| CNAME | autoconfig | 0 | autoconfig.mail.hostinger.com | 300 |
| ALIAS | @ | 0 | parchate.store.cdn.hstgr.net | 300 |
| TXT | @ | 0 | "v=spf1 include:_spf.mail.hostinger.com ~all" | 14400 |
| TXT | @ | 0 | "google-site-verification=bPhiGPNJH_GpL26FDYuaydDJ-m9WStlbRwZ8bOSkk48" | 14400 |
| MX | @ | 10 | mx2.hostinger.com | 14400 |
| MX | @ | 5 | mx1.hostinger.com | 14400 |
| A | @ | 0 | 82.29.86.138 | 14400 |

## Cambios aplicados para Vercel (proyecto deiv0510s-projects/parchate-store)
- A @ : 82.29.86.138 → 76.76.21.21
- CNAME www : www.parchate.store.cdn.hstgr.net → cname.vercel-dns.com
- ALIAS @ → eliminado (apuntaba al CDN del hosting WordPress anterior)

Para revertir al WordPress anterior: restaurar los 3 valores de arriba tal como están en la tabla.
