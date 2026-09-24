import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLabs, extractAndFormat, extractReceptionDate } from '../src/extractor.js';

const asObject = (text) =>
  Object.fromEntries(extractLabs(text).map(({ id, value }) => [id, value]));

test('conserva comparador y precisión en TSH, y reconoce T4L con denominación HIS', () => {
  const text = `HORMONA TIROESTIMULANTE (TSH) * < 0.006 uUI/mL [0.27 - 4.2]
    Método : ECLIA Nota: Valor inferior al límite de detección de la técnica.
    TETRAIDOTIRONINA LIBRE (T4L) 1.31 ng/dL [0.93 - 1.7]`;

  assert.deepEqual(asObject(text), {
    tsh: '<0.006',
    freeT4: '1.31',
  });
});

test('extrae T3 y T4 libres y totales sin confundir sus denominaciones', () => {
  const conventional = `TSH 1.25 uUI/mL T3 1.21 ng/mL
    Triyodotironina libre (T3L) 3.4 pg/mL
    T4 libre 1.18 ng/dL T4 total 7.8 ug/dL`;

  assert.deepEqual(asObject(conventional), {
    tsh: '1.25',
    totalT3: '1.21',
    freeT3: '3.4',
    freeT4: '1.18',
    totalT4: '7.8',
  });

  const international = `FT3 5.1 pmol/L FT4 15.2 pmol/L
    Triiodotironina total 1.8 nmol/L Tiroxina total 104 nmol/L`;

  assert.deepEqual(asObject(international), {
    totalT3: '1.8',
    freeT3: '5.1',
    freeT4: '15.2',
    totalT4: '104',
  });

  const { summary } = extractAndFormat(conventional, 'grouped');
  assert.equal(summary, 'Endocrino: TSH: 1.25, T3: 1.21, T3L: 3.4, T4L: 1.18, T4T: 7.8');
});

test('reconoce las denominaciones HIS de GGT y T3 y antepone la fecha de recepción', () => {
  const text = `Fecha/hora de recepción Muestra: 21/08/2026 09:17
    Gamaglutamil transferasa (GGT) 18 U/l 5 - 39
    Triyodotironina (T3) 1.10 ng/ml 0.80 - 2.00 ECLIA`;

  assert.deepEqual(asObject(text), {
    ggt: '18',
    totalT3: '1.10',
  });
  assert.equal(extractReceptionDate(text), '21.08.26');

  const { receptionDate, summary } = extractAndFormat(text, 'grouped');
  assert.equal(receptionDate, '21.08.26');
  assert.equal(summary, 'Exs 21.08.26\nHepático: GGT: 18\nEndocrino: T3: 1.10');
});

test('conserva el encabezado de fecha sin agrupación y acepta variantes de toma de muestra', () => {
  const text = 'Fecha y hora de toma de muestra 3-3-2026 10:15 TSH 2.1 uUI/mL';
  assert.equal(extractAndFormat(text, 'compact').summary, 'Exs 03.03.26\nTSH: 2.1');

  const variants = [
    'Fecha/hora de recepción: 21/08/2026 09:17 Muestra: Sangre',
    'Fecha recepción muestra | 21.08.2026 09:17',
    'Fecha de obtención de la muestra: 2026-08-21 09:17',
    'Fecha extracción muestra - 21/8/26',
  ];
  for (const variant of variants) {
    assert.equal(extractReceptionDate(variant), '21.08.26');
  }
});

test('extrae la fecha cuando el PDF del HHHA separa etiquetas y valores', () => {
  const text = `Nº Petición: 2608219999
    F.de nacimiento Fecha/hora de solicitud: Servicio
    INFORME DE RESULTADOS LABORATORIO CLÍNICO
    Nombre U. Toma de Muestra Fecha/hora de T. Muestra
    Fecha/hora de recepción Muestra Fecha impresión de informe
    : : : : : :
    PERSONA FICTICIA Sexo X
    10:21:33 09:17:04 01/01/1990 21/08/2026
    21/08/2026 21/08/2026 12:05:41 Edad:
    21/08/2026 09:11:22
    TSH 2.3 uUI/mL`;

  assert.equal(extractReceptionDate(text), '21.08.26');
  assert.equal(extractAndFormat(text, 'compact').summary, 'Exs 21.08.26\nTSH: 2.3');
});

test('extrae panel corrido, deduplica testosterona y selecciona el valor actual de 17OHP', () => {
  const text = `Glucosa 91.3 mg/dl 70.0 - 100.0 Hexoquinasa
    Creatinina 0.9 mg/dl 0.7 - 1.2 Jaffé cinético
    Velocidad de Filtración Glomerular (MDRD4) 96.40 Calculado
    Lactato deshidrogenasa 172.00 U/l 135.00 - 225.00 Fotometría
    Colesterol total 187.00 mg/dl 0.00 - 200.00
    Colesterol HDL 51.00 mg/dl 35.00 - 80.00
    Colesterol LDL * 116.00 mg/dl 0.00 - 99.00
    Colesterol VLDL 20.20 mg/dl 0.00 - 40.00
    Triglicéridos 101.00 mg/dl <150.00
    Sodio 141.2 mEq/L 136.0 - 145.0
    Potasio 4.31 mEq/L 3.50 - 5.10
    Cloro 102 mEq/L 98 - 107
    Testosterona 4.12 ng/ml 2.49 - 8.36
    Beta gonadotrofina coriónica (BHCG) Humana <0.100 mUI/mL 0.00 - 2.00
    Testosterona 4.12 ng/ml 2.49 - 8.36
    Hormona luteinizante (LH) 4.80 mUI/mL 1.70 - 8.60
    17 HIDROXIPROGESTERONA Muestra : 21/08/2026 20/08/2025 19/08/2024 Sangre Unidad
    17 HIDROXIPROGESTERONA 3.4 2.8 3.0 ng/mL
    VALORES DE REFERENCIA Femenino Masculino >1 año - 13 años < 2.3 ng/mL
    RENINA Muestra : 21/08/2026 Sangre Unidad RENINA 72 uUI/mL
    Técnica: Quimioluminiscencia Valores de referencia Posición vertical 4.2 - 45.6`;

  const values = asObject(text);
  assert.deepEqual(values, {
    glucose: '91',
    creatinine: '0.9',
    egfr: '96',
    sodium: '141',
    potassium: '4.3',
    chloride: '102',
    ldh: '172',
    totalCholesterol: '187',
    hdl: '51',
    ldl: '116',
    vldl: '20',
    triglycerides: '101',
    bhcg: '<0.100',
    testosterone: '4.12',
    lh: '4.8',
    ohp17: '3.4',
    renin: '72',
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

test('clasifica albúmina como hepática y permite omitir encabezados de grupos', () => {
  const text = 'Bilirrubina total 0.8 mg/dL Albúmina 4.2 g/dL Colesterol total 180 mg/dL';

  const { summary: grouped } = extractAndFormat(text, 'grouped');
  assert.equal(
    grouped,
    'Hepático: BiliT: 0.8, Alb: 4.2\nLípidos y nutrición: ColT: 180',
  );

  const { summary: ungrouped } = extractAndFormat(text, 'compact');
  assert.equal(ungrouped, 'BiliT: 0.8, Alb: 4.2, ColT: 180');
});

test('permite ocultar los dos puntos posteriores a cada examen', () => {
  const text = `Creatinina 1.0 mg/dL Velocidad de Filtración Glomerular 84
    Sodio 140 mEq/L Potasio 4.2 mEq/L Cloro 101 mEq/L
    TSH 2.1 uUI/mL`;

  assert.equal(
    extractAndFormat(text, 'grouped', { showExamColons: false }).summary,
    'Renal y metabólico: Crea 1.0 (VFG 84), ELP 140/4.2/101\nEndocrino: TSH 2.1',
  );
  assert.equal(
    extractAndFormat(text, 'compact', { showExamColons: false }).summary,
    'Crea 1.0 (VFG 84), ELP 140/4.2/101, TSH 2.1',
  );
});

test('reconoce transaminasas con nomenclaturas y unidades habituales', () => {
  const cases = [
    [
      'Transaminasa Oxalacética (GOT) 34 U/L Transaminasa Pirúvica (GPT) 41 U/L',
      { got: '34', gpt: '41' },
    ],
    ['AST (GOT) 28 UI/L ALT (GPT) 35 IU/L', { got: '28', gpt: '35' }],
    ['TGO 22 U/L TGP 25 U/L', { got: '22', gpt: '25' }],
  ];

  for (const [text, expected] of cases) {
    assert.deepEqual(asObject(text), expected);
  }

  const { summary } = extractAndFormat(cases[0][0], 'grouped');
  assert.equal(summary, 'Hepático: GOT: 34, GPT: 41');
});

test('reconoce perfil de hierro y no captura rangos de referencia', () => {
  const text = `Ferremia 81.4 ug/dL [ 33.0 - 193.0 ] Ferrosina
    TIBC 301.5 ug/dL [ 228.0 - 428.0 ] Calculado
    UIBC 220.1 ug/dL [ 135.0 - 392.0 ] Ferrosina
    Ferritina 98.6 ng/mL
    Saturación transferrina 27.00 % [ 16.00 - 45.00 ] Calculado
    Transferrina 245.0 mg/dL [ 130.0 - 360.0 ] Inmunoturbidimétrico`;

  assert.deepEqual(asObject(text), {
    serumIron: '81.4',
    tibc: '301.5',
    uibc: '220.1',
    ferritin: '98.6',
    transferrinSaturation: '27.00%',
    transferrin: '245.0',
  });

  const { summary } = extractAndFormat(text, 'grouped');
  assert.equal(
    summary,
    'Perfil de hierro: Ferremia: 81.4, TIBC: 301.5, UIBC: 220.1, Ferritina: 98.6, Sat. transf.: 27.00%, Transferrina: 245.0',
  );
});

test('incluye VCM y CHCM si Hb es menor de 12 y calcula RAN', () => {
  const text = `Hemoglobina 11.4 g/dL Hematocrito 35.2 %
    VCM 82.5 fL CHCM 31.8 g/dL
    Recuento de leucocitos 6.40 10^3/uL Neutrófilos % 60.5 %
    Recuento de plaquetas 230 10^3/uL VHS 20 mm/hr`;

  assert.deepEqual(asObject(text), {
    hb: '11.4',
    hcto: '35',
    vcm: '82.5',
    chcm: '31.8',
    wbc: '6.40',
    anc: '3.872',
    neutrophils: '61%',
    platelets: '230',
    esr: '20',
  });

  const { summary } = extractAndFormat(text, 'grouped');
  assert.equal(
    summary,
    'Hemograma: Hb: 11.4, Hcto: 35, VCM: 82.5, CHCM: 31.8, GB: 6.40 (RAN: 3.872), N: 61%, Plaq: 230\nInflamación: VHS: 20',
  );
});

test('omite VCM y CHCM cuando Hb es 12 o mayor y prioriza RAN directo', () => {
  const text = `Hemoglobina 13.2 g/dL Hematocrito 40 % VCM 90 fL CHCM 33 g/dL
    Leucocitos 5.20 10^3/uL Neutrófilos % 50 %
    Recuento absoluto de neutrófilos 2.75 10^3/uL Plaquetas 250 10^3/uL`;

  assert.deepEqual(asObject(text), {
    hb: '13.2',
    hcto: '40',
    wbc: '5.20',
    anc: '2.75',
    neutrophils: '50%',
    platelets: '250',
  });
});
