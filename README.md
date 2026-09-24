# ExSSASUR

Herramienta clínica independiente para convertir texto copiado desde el HIS en un resumen breve y verificable, preparar el cierre documental de una consulta y ordenar pendientes de la sesión.

## Características

- Reconoce paneles de laboratorio escritos en una sola línea o con saltos de línea.
- Conserva comparadores como `<`, `>`, `≤` y `≥`.
- Acepta coma o punto decimal y variaciones habituales de unidades.
- Agrupa creatinina/VFG y electrolitos en un formato clínico compacto.
- Permite activar o desactivar los encabezados por categorías.
- Deduplica exámenes repetidos.
- Permite enviar el resumen de laboratorio al borrador de una consulta.
- Estructura resumen, exámenes y plan en un cierre verificable.
- Reconoce acciones explícitas del plan y las transforma en pendientes editables.
- Permite asignar tipo, responsable, plazo y estado a cada pendiente.
- Procesa todo localmente en el navegador: no almacena ni transmite el texto pegado.

## Consulta y pendientes

Los módulos `Consulta` y `Pendientes` trabajan exclusivamente en la memoria de la pestaña. Los datos desaparecen al recargar o cerrar la página. Esta primera versión no es una agenda multipaciente y no reemplaza la ficha clínica ni los sistemas institucionales de seguimiento.

La extracción de pendientes se limita a verbos de acción explícitos, como `solicitar`, `derivar`, `avisar` o `controlar`. El borrador y cada pendiente deben revisarse antes de copiarlos.

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
