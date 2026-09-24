import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClosureItems,
  buildSsasurOutputs,
  composeAnamnesis,
  findDocumentationWarnings,
  formatEncounterDate,
  formatFollowUp,
  normalizeLabSummary,
  parseListItems,
  suggestFollowUpFromPlan,
} from '../src/consultation.js';

const fictional = {
  date: '2026-09-24',
  am: 'HTA',
  medications: 'FÁRMACO A 1 COMP/DÍA',
  surgeries: 'APENDICECTOMÍA',
  obstetric: '',
  habits: 'TBQ NO',
  previousSummary: 'CONTROL PREVIO SIN CAMBIOS.',
  currentEvolution: 'SIN EVENTOS INTERCURRENTES.',
  labs: 'Exs 24.09.26\nTSH: 2.10, T4L: 1.20',
  physicalExam: 'BUEN ESTADO GENERAL.',
  diagnosticHypothesis: 'CONTROL ENDOCRINOLÓGICO',
  observations: '',
  complementaryExams: '',
  treatmentIndications: 'MANTENER INDICACIONES. CONTROL CON EXÁMENES EN 3 MESES.',
  orderHypothesis: '',
  orders: 'TSH\nT4 LIBRE\nHEMOGRAMA',
  prescriptions: '',
  followUpAction: 'CONTROL MISMA ESPECIALIDAD',
  followUpInterval: '3 MESES',
  followUpModality: 'PRESENCIAL EN ESTABLECIMIENTO',
  followUpPriority: 'P2',
  requiresObservation: false,
  counterRefer: false,
};

test('formatea la fecha y el resumen de laboratorio en el estilo observado', () => {
  assert.equal(formatEncounterDate('2026-09-24'), 'SEPT.26');
  assert.equal(normalizeLabSummary('Exs 24.09.26\nTSH: 2.10'), 'EXS 24.09.26\nTSH: 2.10');
});

test('compone anamnesis respetando antecedentes, cronología y control actual', () => {
  assert.equal(
    composeAnamnesis(fictional),
    `AM: HTA
MED: FÁRMACO A 1 COMP/DÍA
AQX: APENDICECTOMÍA
HAB: TBQ NO

CONTROL PREVIO SIN CAMBIOS.

SEPT.26
SIN EVENTOS INTERCURRENTES.
EXS 24.09.26
TSH: 2.10, T4L: 1.20
MANTENER INDICACIONES. CONTROL CON EXÁMENES EN 3 MESES.`,
  );
});

test('genera salidas separadas para las pantallas de SSASUR', () => {
  const outputs = buildSsasurOutputs(fictional);
  assert.equal(outputs.physicalExam, 'BUEN ESTADO GENERAL.');
  assert.equal(outputs.orderHypothesis, 'CONTROL ENDOCRINOLÓGICO');
  assert.equal(outputs.orderList, '- TSH\n- T4 LIBRE\n- HEMOGRAMA');
  assert.match(outputs.followUp, /ACCIÓN: CONTROL MISMA ESPECIALIDAD/);
  assert.match(outputs.followUp, /INTERVALO: 3 MESES/);
});

test('acepta listas por línea o punto y coma sin dividir por comas clínicas', () => {
  assert.deepEqual(parseListItems('TSH; T4 LIBRE\nHEMOGRAMA'), ['TSH', 'T4 LIBRE', 'HEMOGRAMA']);
});

test('detecta inconsistencias documentales sin proponer conductas', () => {
  assert.deepEqual(findDocumentationWarnings({
    ...fictional,
    followUpAction: 'ALTA MÉDICA',
    orders: '',
  }), [
    'La acción indica alta, pero el tratamiento/indicaciones todavía menciona un control.',
    'El tratamiento/indicaciones menciona exámenes, pero la lista de solicitud está vacía.',
  ]);
});

test('crea un checklist de cierre condicionado por las salidas preparadas', () => {
  const ids = buildClosureItems(fictional).map(({ id }) => id);
  assert.deepEqual(ids, ['evolution', 'diagnosis', 'activity', 'orders', 'follow-up', 'saved']);
});

test('formatea seguimiento sin inventar campos clínicos', () => {
  assert.equal(
    formatFollowUp(fictional),
    `ACCIÓN: CONTROL MISMA ESPECIALIDAD
INTERVALO: 3 MESES
MODALIDAD: PRESENCIAL EN ESTABLECIMIENTO
PRIORIDAD: P2
GESTIÓN/OBSERVACIÓN: NO
CONTRARREFERIR: NO`,
  );
});

test('sugiere únicamente acción e intervalo explícitos en las indicaciones', () => {
  assert.deepEqual(
    suggestFollowUpFromPlan('Mantener indicaciones. Control con exámenes en tres meses.'),
    { action: 'CONTROL MISMA ESPECIALIDAD', interval: '3 MESES' },
  );
  assert.deepEqual(
    suggestFollowUpFromPlan('Alta de especialidad.'),
    { action: 'ALTA MÉDICA', interval: '' },
  );
});

test('advierte diferencias entre el plazo escrito y el configurado', () => {
  assert.deepEqual(findDocumentationWarnings({
    ...fictional,
    followUpInterval: '6 MESES',
  }), ['El plan menciona 3 meses, pero el intervalo seleccionado es 6 meses.']);
});
