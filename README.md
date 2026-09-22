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

## Uso local

Abre `index.html` en un servidor web local o utiliza GitHub Pages.

## Pruebas

Requiere Node.js 20 o superior:

```bash
npm test
```

## Aviso

ExSSASUR es una herramienta clínica independiente. El resultado debe verificarse antes de incorporarlo a una ficha clínica.
