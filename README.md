# ExSSASUR

Herramienta clínica independiente para convertir texto copiado desde el HIS en un resumen breve y preparar los distintos campos documentales usados durante una atención en SSASUR.

## Características

- Reconoce paneles de laboratorio escritos en una sola línea o con saltos de línea.
- Conserva comparadores como `<`, `>`, `≤` y `≥`.
- Acepta coma o punto decimal y variaciones habituales de unidades.
- Agrupa creatinina/VFG y electrolitos en un formato clínico compacto.
- Permite activar o desactivar los encabezados por categorías.
- Deduplica exámenes repetidos.
- Permite enviar el resumen de laboratorio directamente a la evolución.
- Importa una evolución previa y distribuye antecedentes y resumen cronológico en campos vacíos.
- Compone la anamnesis en el formato `AM`, `MED`, `AQX`, `AOBST` y `HAB`.
- Prepara bloques separados para Anamnesis, Diagnóstico, Plan y Tratamiento, OA/IC, Receta y Acción a realizar.
- Convierte la conducta documentada en una lista operativa de exámenes, prescripciones y parámetros del próximo control.
- Detecta inconsistencias documentales, sin evaluar ni sugerir decisiones clínicas.
- Incluye un checklist manual para cerrar la atención en SSASUR.
- Procesa todo localmente en el navegador: no almacena ni transmite el texto pegado.

## Evolución, salidas y cierre

Los módulos `Evolución`, `Salidas SSASUR` y `Cierre` trabajan exclusivamente en la memoria de la pestaña. Los datos desaparecen al recargar o cerrar la página. La aplicación no es una agenda multipaciente y no reemplaza la ficha clínica ni los sistemas institucionales de seguimiento.

Las alertas comparan únicamente la coherencia entre los textos y parámetros ingresados por el profesional. Cada bloque debe revisarse antes de copiarlo.

El importador de evoluciones usa encabezados explícitos para separar `AM`, `MED`, `AQX`, `AOBST`, `HAB` y Anamnesis. El examen físico, el diagnóstico y las indicaciones anteriores se muestran como detectados, pero no se trasladan a los campos del control actual. Tampoco se reemplazan campos que ya tengan contenido.

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
