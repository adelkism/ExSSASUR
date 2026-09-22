import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLabs, extractAndFormat } from '../src/extractor.js';

const asObject = (text) =>
  Object.fromEntries(extractLabs(text).map(({ id, value }) => [id, value]));

test('conserva comparador y precisión en TSH, y reconoce T4L con denominación HIS', () => {
  const text = `HORMONA TIROESTIMULANTE (TSH) * < 0.005 uUI/mL [0.27 - 4.2]
    Método : ECLIA Nota: Valor inferior al límite de detección de la técnica.
    TETRAIDOTIRONINA LIBRE (T4L) 1.37 ng/dL [0.93 - 1.7]`;

  assert.deepEqual(asObject(text), {
    tsh: '<0.005',
    freeT4: '1.37',
  });
});

test('extrae panel corrido, deduplica testosterona y selecciona el valor actual de 17OHP', () => {
  const text = `Glucosa 95.2 mg/dl 70.0 - 100.0 Hexoquinasa
    Creatinina 1.0 mg/dl 0.7 - 1.2 Jaffé cinético
    Velocidad de Filtración Glomerular (MDRD4) 84.11 Calculado
    Lactato deshidrogenasa 159.00 U/l 135.00 - 225.00 Fotometría
    Colesterol total * 203.00 mg/dl 0.00 - 200.00
    Colesterol HDL 42.00 mg/dl 35.00 - 80.00
    Colesterol LDL * 147.00 mg/dl 0.00 - 99.00
    Colesterol VLDL 21.40 mg/dl 0.00 - 40.00
    Triglicéridos 107.00 mg/dl <150.00
    Sodio 139.6 mEq/L 136.0 - 145.0
    Potasio 5.01 mEq/L 3.50 - 5.10
    Cloro 99 mEq/L 98 - 107
    Testosterona 2.57 ng/ml 2.49 - 8.36
    Beta gonadotrofina coriónica (BHCG) Humana <0.200 mUI/mL 0.00 - 2.00
    Testosterona 2.57 ng/ml 2.49 - 8.36
    Hormona luteinizante (LH) 5.23 mUI/mL 1.70 - 8.60
    17 HIDROXIPROGESTERONA Muestra : 29/07/2026 18/08/2025 19/08/2025 Sangre Unidad
    17 HIDROXIPROGESTERONA 19.9 18.9 19.7 ng/mL
    VALORES DE REFERENCIA Femenino Masculino >1 año - 13 años < 2.3 ng/mL
    RENINA Muestra : 29/07/2026 Sangre Unidad RENINA 497 uUI/mL
    Técnica: Quimioluminiscencia Valores de referencia Posición vertical 4.2 - 45.6`;

  const values = asObject(text);
  assert.deepEqual(values, {
    glucose: '95',
    creatinine: '1.0',
    egfr: '84',
    sodium: '140',
    potassium: '5.0',
    chloride: '99',
    ldh: '159',
    totalCholesterol: '203',
    hdl: '42',
    ldl: '147',
    vldl: '21',
    triglycerides: '107',
    bhcg: '<0.200',
    testosterone: '2.57',
    lh: '5.23',
    ohp17: '19.9',
    renin: '497',
  });

  assert.equal(extractLabs(text).filter(({ id }) => id === 'testosterone').length, 1);
});

test('acepta coma decimal, espacios y comparadores en marcadores', () => {
  const text = 'TSH * < 0,005 uUI/mL Procalcitonina < 0,02 ng/mL Troponina T > 1000 ng/L';
  assert.deepEqual(asObject(text), {
    procalcitonin: '<0.02',
    troponin: '>1000',
    tsh: '<0.005',
  });
});

test('genera resumen clínico compacto con Crea/VFG y ELP agrupados', () => {
  const text = 'Creatinina 1.0 mg/dL Velocidad de Filtración Glomerular (MDRD4) 84.11 Sodio 139.6 mEq/L Potasio 5.01 mEq/L Cloro 99 mEq/L';
  const { summary } = extractAndFormat(text, 'compact');
  assert.equal(summary, 'Crea: 1.0 (VFG: 84), ELP: 140/5.0/99');
});
