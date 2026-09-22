# ExSSASUR

Extractor clínico independiente de resultados de laboratorio, diseñado para convertir texto copiado desde el HIS en un resumen breve y verificable.

## Características

- Reconoce paneles de laboratorio escritos en una sola línea o con saltos de línea.
- Conserva comparadores como `<`, `>`, `≤` y `≥`.
- Acepta coma o punto decimal y variaciones habituales de unidades.
- Agrupa creatinina/VFG y electrolitos en un formato clínico compacto.
- Permite activar o desactivar los encabezados por categorías.
- Deduplica exámenes repetidos.
- Procesa todo localmente en el navegador: no almacena ni transmite el texto pegado.

La lista detallada de prestaciones reconocidas está en [CATALOGO.md](CATALOGO.md).

## Uso local

Abre `index.html` en un servidor web local o utiliza GitHub Pages.

## Publicación privada en Cloudflare

La carpeta `cloudflare/` contiene un Worker que protege todos los archivos mediante un enlace secreto. El enlace se intercambia por una cookie `HttpOnly` y luego se elimina de la barra de direcciones. El secreto debe configurarse como `ACCESS_TOKEN` en Cloudflare y nunca guardarse en el repositorio.

1. Ejecuta `npm run build:cloudflare`.
2. Configura `ACCESS_TOKEN` como secreto del Worker.
3. Despliega usando `wrangler.jsonc`.
4. Ingresa inicialmente mediante `https://<worker>.workers.dev/?access=<token>`.

Cambiar `ACCESS_TOKEN` invalida tanto el enlace anterior como las sesiones existentes.

## Pruebas

Requiere Node.js 20 o superior:

```bash
npm test
```

## Aviso

ExSSASUR es una herramienta clínica independiente. El resultado debe verificarse antes de incorporarlo a una ficha clínica.
