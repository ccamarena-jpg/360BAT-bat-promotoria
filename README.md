# BAT 360 Promotoría

Web independiente de promotoría (separada de BAT 360). Menú lateral: **Radar de cobertura**, **Materiales**, **Cobertura y calendario**.

## Archivos
- `index.html` — shell: login con Google + menú lateral + una vista por entrada (no se edita).
- `site-config.js` — **aquí se cambia todo**: usuarios con acceso, vistas del menú y los links de SharePoint (`links`).
- `radar.html`, `materiales.html`, `cobertura.html` — las vistas.
- `config/materiales.json` — materiales de cada mes (se conserva el histórico).

## Agregar una vista nueva
1. Subir su página `.html` a esta carpeta.
2. Agregar una entrada en `vistas` de `site-config.js`.

## Publicar (una sola vez)
1. Crear el repositorio en GitHub y subir esta carpeta.
2. En Vercel: *Add New → Project* → importar el repo (sin build, es estático).
3. **Google Cloud** → Credenciales → el Client ID de BAT 360 → *Orígenes JavaScript autorizados* → agregar el dominio nuevo de Vercel.
4. **Entra ID** → App registrations → bat360 → Authentication → plataforma *Single-page application* → agregar como Redirect URI:
   `https://<dominio-nuevo>/radar.html`, `https://<dominio-nuevo>/materiales.html` y `https://<dominio-nuevo>/cobertura.html`.
5. (Para guardar motivos en SharePoint) Entra → API permissions → agregar `Files.ReadWrite.All` (delegado) y dar consentimiento.
