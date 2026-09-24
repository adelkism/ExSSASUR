import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClosureItems,
  buildSsasurOutputs,
  composeAnamnesis,
  extractEvolutionImport,
  findDocumentationWarnings,
  formatEvolutionImportPreview,
  formatEncounterDate,
  formatFollowUp,
  mergeEvolutionImport,
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

const previousEvolutionFixture = `AM: HIPERTENSIÓN ARTERIAL
MED: MEDICAMENTO X 1 COMP/DÍA
AQX: CIRUGÍA FICTICIA
HAB: TABACO NO

AGO.26
CONTROL PREVIO SIN EVENTOS. SE REVISARON EXÁMENES DE SEGUIMIENTO.
EXS 21.08.26 TSH 2.30, T4L 1.10

Examen Físico
BUEN ESTADO GENERAL.

Hipótesis Diagnóstica
CONTROL ENDOCRINOLÓGICO FICTICIO

Diagnóstico
DIAGNÓSTICO FICTICIO

Tratamiento e Indicaciones
MANTENER INDICACIONES PREVIAS.`;

test('extrae antecedentes y resumen desde una evolución previa', () => {
  const imported = extractEvolutionImport(previousEvolutionFixture);
  assert.equal(imported.am, 'HIPERTENSIÓN ARTERIAL');
  assert.equal(imported.medications, 'MEDICAMENTO X 1 COMP/DÍA');
  assert.equal(imported.surgeries, 'CIRUGÍA FICTICIA');
  assert.equal(imported.habits, 'TABACO NO');
  assert.equal(
    imported.previousSummary,
    'AGO.26\nCONTROL PREVIO SIN EVENTOS. SE REVISARON EXÁMENES DE SEGUIMIENTO.\nEXS 21.08.26 TSH 2.30, T4L 1.10',
  );
  assert.equal(imported.previousPhysicalExam, 'BUEN ESTADO GENERAL.');
  assert.equal(imported.previousDiagnosticHypothesis, 'CONTROL ENDOCRINOLÓGICO FICTICIO');
  assert.equal(imported.previousDiagnosis, 'DIAGNÓSTICO FICTICIO');
  assert.equal(imported.previousTreatmentIndications, 'MANTENER INDICACIONES PREVIAS.');
});

test('prioriza el bloque Anamnesis cuando la evolución contiene encabezados de SSASUR', () => {
  const imported = extractEvolutionImport(`Texto administrativo que no debe formar el resumen
Anamnesis (18500 Caracteres restantes)
AM: DISLIPIDEMIA
JUL.26
EVOLUCIÓN PREVIA FICTICIA.
Examen Físico
SIN REGISTRO RELEVANTE.`);

  assert.equal(imported.am, 'DISLIPIDEMIA');
  assert.equal(imported.previousSummary, 'JUL.26\nEVOLUCIÓN PREVIA FICTICIA.');
});

test('muestra una vista previa y solo completa campos vacíos', () => {
  const imported = extractEvolutionImport(previousEvolutionFixture);
  assert.match(formatEvolutionImportPreview(imported), /^AM: HIPERTENSIÓN ARTERIAL/m);
  assert.doesNotMatch(formatEvolutionImportPreview(imported), /BUEN ESTADO GENERAL/);

  const merged = mergeEvolutionImport({
    am: 'ANTECEDENTE YA ESCRITO',
    medications: '',
    surgeries: '',
    obstetric: '',
    habits: '',
    previousSummary: '',
  }, imported);
  assert.equal(merged.values.am, 'ANTECEDENTE YA ESCRITO');
  assert.equal(merged.values.medications, 'MEDICAMENTO X 1 COMP/DÍA');
  assert.deepEqual(merged.skipped, ['am']);
  assert.deepEqual(merged.applied, ['medications', 'surgeries', 'habits', 'previousSummary']);
});

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
