import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLabs, extractAndFormat } from '../src/extractor.js';

const asObject = (text) =>
  Object.fromEntries(extractLabs(text).map(({ id, value }) => [id, value]));

test('extrae inmunología tiroidea y el bloque suprarrenal ampliado', () => {
  const text = `TRAb 2.3 UI/L Tiroglobulina 0.14 ng/mL
    Ac antitiroglobulina 12 UI/mL Ac anti TPO 35 UI/mL
    Cortisol libre urinario 24 horas 123 ug/24 h
    Cortisol post dexametasona 0.8 ug/dL
    Cortisol salival nocturno 1.9 nmol/L
    Metanefrina plasmática 45 pg/mL Normetanefrina plasmática 90 pg/mL
    3-metoxitiramina 12 pg/mL DHEA 4.1 ng/mL DHEA-S 220 ug/dL
    Androstenediona 1.8 ng/mL 17-OH progesterona 2.1 ng/mL`;

  assert.deepEqual(asObject(text), {
    thyroglobulin: '0.14',
    antiThyroglobulin: '12',
    antiTpo: '35',
    trab: '2.3',
    dheas: '220',
    dhea: '4.1',
    androstenedione: '1.8',
    urinaryCortisol24h: '123',
    postDexamethasoneCortisol: '0.8',
    lateNightSalivaryCortisol: '1.9',
    ohp17: '2.1',
    metanephrine: '45',
    normetanephrine: '90',
    methoxytyramine3: '12',
  });
});

test('acepta nomenclatura y unidades internacionales del bloque de metanefrinas', () => {
  const text = `Urine metanephrine 123 mcg/24 h
    Plasma normetanephrine free 0.45 nmol/L
    3-methoxytyramine 18 mcg/L`;

  assert.deepEqual(asObject(text), {
    metanephrine: '123',
    normetanephrine: '0.45',
    methoxytyramine3: '18',
  });
});

test('resume el test de Synacthen por tiempos sin duplicar cortisol basal', () => {
  const text = `Test de Synacthen Cortisol basal 6.2 ug/dL
    Cortisol 30 minutos 18.5 ug/dL Cortisol 60 minutos 22.0 ug/dL`;

  assert.deepEqual(asObject(text), {
    synacthen0: '6.2',
    synacthen30: '18.5',
    synacthen60: '22',
  });

  const { summary } = extractAndFormat(text, 'grouped');
  assert.equal(summary, "Endocrino: Synacthen: 0': 6.2, 30': 18.5, 60': 22");

  const parenthesized = `Synacthen Cortisol (0 min) 7.1 ug/dL
    Cortisol (30 min) 19.4 ug/dL Cortisol (60 min) 23.2 ug/dL`;
  assert.deepEqual(asObject(parenthesized), {
    synacthen0: '7.1',
    synacthen30: '19.4',
    synacthen60: '23.2',
  });
});

test('cubre brechas frecuentes de hematología, bioquímica, hígado y coagulación', () => {
  const text = `Reticulocitos 1.5 % Lactato 2.1 mmol/L Calcio iónico 1.16 mmol/L
    Bicarbonato 24 mmol/L Amilasa 80 U/L Lipasa 45 U/L
    Amonio 35 umol/L Osmolalidad plasmática 290 mOsm/kg
    Bilirrubina indirecta 0.4 mg/dL Proteínas totales 7.2 g/dL
    Vitamina B12 450 pg/mL Folato 8.2 ng/mL Prealbúmina 22 mg/dL
    Creatinkinasa total 90 U/L CK-MB 12 U/L
    Tiempo de protrombina 13.2 segundos Actividad de protrombina 92 %
    TTPK 29 segundos Fibrinógeno 320 mg/dL`;

  assert.deepEqual(asObject(text), {
    reticulocytes: '1.5%',
    ionizedCalcium: '1.16',
    lactate: '2.1',
    bicarbonate: '24',
    amylase: '80',
    lipase: '45',
    ammonia: '35',
    osmolality: '290',
    bilirubinIndirect: '0.4',
    proteins: '7.2',
    vitaminB12: '450',
    folate: '8.2',
    prealbumin: '22',
    ckTotal: '90',
    ckMb: '12',
    prothrombinTime: '13.2',
    prothrombinActivity: '92%',
    aptt: '29',
    fibrinogen: '320',
  });
});

test('extrae hormonas metabólicas y gonadales adicionales', () => {
  const text = `Insulina basal 8.4 uUI/mL Péptido C 2.1 ng/mL
    Progesterona 6.5 ng/mL SHBG 42 nmol/L
    Hormona de crecimiento (GH) 0.8 ng/mL Calcitonina 4.2 pg/mL`;

  assert.deepEqual(asObject(text), {
    progesterone: '6.5',
    insulin: '8.4',
    cPeptide: '2.1',
    shbg: '42',
    growthHormone: '0.8',
    calcitonin: '4.2',
  });
});

test('reconoce IGF-1 y ACTH con los nombres completos del laboratorio', () => {
  const text = `Factor crecimiento insulínico tipo 1 (IGF-1) 645.00 ng/ml
    Adenocorticotrofina (ACTH) 22.20 pg/ml 7.20 - 63.60 ECLIA
    Cortisol 4.83 ug/dL`;

  assert.deepEqual(asObject(text), {
    cortisol: '4.83',
    acth: '22.2',
    igf1: '645',
  });

  assert.deepEqual(
    asObject('Factor de crecimiento similar a la insulina tipo I 210 ng/mL Adrenocorticotrópica 18 pg/mL'),
    { acth: '18', igf1: '210' },
  );
});

test('extrae perfil fosfocálcico cuando el calcio no trae unidad y VitD invierte el nombre', () => {
  const text = `Albúmina sangre 4.22 g/dl 3.40 - 4.80 4.37 Verde de bromocresol
    Fósforo * 2.2 mg/dl 2.5 - 4.5 2.2 Fosfomolibdato - UV
    Calcio * 11.0 Vitamina D 25-OH * 15.60 ng/ml >30.00 15.90 ECLIA
    Paratohormona * 88.60 pg/ml`;

  assert.deepEqual(asObject(text), {
    calcium: '11.0',
    phosphorus: '2.2',
    albumin: '4.2',
    pth: '88.6',
    vitaminD: '15.6',
  });

  assert.deepEqual(
    asObject('Calcio iónico 1.18 mmol/L Calcio en orina de 24 horas 245 mg/24 h'),
    { ionizedCalcium: '1.18', urineCalcium24h: '245' },
  );
});

test('extrae RAC con denominaciones y unidades habituales', () => {
  assert.deepEqual(asObject('RAC 28.4 mg/g'), { urineAcr: '28.4' });
  assert.deepEqual(
    asObject('Relación albúmina/creatinina en orina 3,2 mg/mmol'),
    { urineAcr: '3.2' },
  );
  assert.deepEqual(
    asObject('Índice de albúmina / creatinina 42 mcg/mg'),
    { urineAcr: '42' },
  );
});

test('extrae calciuria, creatininuria y electrolitos urinarios de 24 horas', () => {
  const text = `Calcio en orina de 24 horas 245 mg/24 h
    Creatininuria 24 horas 1.62 g/día
    Sodio en orina 24 h 168 mmol/24 h
    Potasio urinario de 24 horas 58 mEq/día
    Cloruria 24 hrs 152 mmol/24 hrs`;

  assert.deepEqual(asObject(text), {
    urineCalcium24h: '245',
    urineCreatinine24h: '1.62',
    urineSodium24h: '168',
    urinePotassium24h: '58',
    urineChloride24h: '152',
  });

  assert.deepEqual(
    asObject('Calcio 9.4 mg/dL Creatinina 1.0 mg/dL Sodio 140 mEq/L Potasio 4.2 mEq/L'),
    { calcium: '9.4', creatinine: '1.0', sodium: '140', potassium: '4.2' },
  );
});

test('extrae inmunoglobulinas cuantitativas y subclases de IgG', () => {
  const text = `Inmunoglobulina G 1240 mg/dL IgA 210 mg/dL IgM 96 mg/dL
    IgE total 72 UI/mL IgG1 650 mg/dL IgG2 310 mg/dL
    IgG3 48 mg/dL IgG4 82.5 mg/dL`;

  assert.deepEqual(asObject(text), {
    igg: '1240',
    iga: '210',
    igm: '96',
    ige: '72',
    igg1: '650',
    igg2: '310',
    igg3: '48',
    igg4: '82.5',
  });
});

test('extrae físico-químico y sedimento solo dentro de una orina completa', () => {
  const text = `ORINA COMPLETA Color amarillo claro Aspecto ligeramente turbio
    Densidad 1.020 pH 5.5 Proteínas negativo Glucosa negativo
    Cetonas trazas Bilirrubina ausente Urobilinógeno normal
    Sangre positivo Nitritos negativo Esterasa leucocitaria positivo
    Leucocitos 8-10 por campo Eritrocitos 3-5 /campo
    Bacterias moderadas Cilindros 0-1 por campo Cristales escasos`;

  assert.deepEqual(asObject(text), {
    urineColor: 'amarillo claro',
    urineAppearance: 'ligeramente turbio',
    urineDensity: '1.020',
    urinePh: '5.5',
    urineProtein: 'Neg',
    urineGlucose: 'Neg',
    urineKetones: 'Trazas',
    urineBilirubin: 'Neg',
    urineUrobilinogen: 'Normal',
    urineBlood: 'Pos',
    urineNitrite: 'Neg',
    urineLeukocyteEsterase: 'Pos',
    urineLeukocytes: '8-10',
    urineErythrocytes: '3-5',
    urineBacteria: 'Moderados',
    urineCasts: '0-1',
    urineCrystals: 'Escasos',
  });

  assert.deepEqual(asObject('Glucosa 95 mg/dL Proteínas 7.0 g/dL'), {
    glucose: '95',
    proteins: '7.0',
  });
});
