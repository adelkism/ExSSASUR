import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTasks,
  extractTiming,
  formatConsultationDraft,
  formatPendingList,
  inferTaskCategory,
  splitPlan,
} from '../src/consultation.js';

test('separa el plan sin convertir fragmentos vacíos en acciones', () => {
  assert.deepEqual(
    splitPlan('Solicitar perfil tiroideo. Derivar a nutrición; Avisar por teléfono.\nControl en 6 meses.'),
    [
      'Solicitar perfil tiroideo',
      'Derivar a nutrición',
      'Avisar por teléfono',
      'Control en 6 meses',
    ],
  );
});

test('extrae únicamente acciones explícitas y las clasifica', () => {
  const tasks = extractTasks(
    'Paciente estable. Mantener tratamiento. Solicitar perfil tiroideo. Derivar a nutrición. Avisar resultado por teléfono. Control en seis meses.',
  );

  assert.deepEqual(
    tasks.map(({ description, category, timing }) => ({ description, category, timing })),
    [
      { description: 'Solicitar perfil tiroideo', category: 'Examen', timing: '' },
      { description: 'Derivar a nutrición', category: 'Derivación', timing: '' },
      { description: 'Avisar resultado por teléfono', category: 'Comunicación', timing: '' },
      { description: 'Control en seis meses', category: 'Control', timing: 'en seis meses' },
    ],
  );
});

test('reconoce categorías y plazos frecuentes', () => {
  assert.equal(inferTaskCategory('Emitir certificado laboral'), 'Documento');
  assert.equal(inferTaskCategory('Repetir examen de orina'), 'Examen');
  assert.equal(extractTiming('Agendar control para el 3/10/2026'), '03/10/2026');
  assert.equal(extractTiming('Revisar resultados dentro de 2 semanas'), 'dentro de 2 semanas');
});

test('genera borrador y lista de pendientes verificables', () => {
  const tasks = extractTasks('Solicitar TSH. Control en 6 meses.');
  const draft = formatConsultationDraft(
    {
      date: '2026-09-24',
      summary: 'Control ambulatorio.',
      labs: 'TSH: 2.1',
      plan: 'Solicitar TSH. Control en 6 meses.',
    },
    tasks,
  );

  assert.match(draft, /^Consulta 24\.09\.26/);
  assert.match(draft, /Exámenes:\nTSH: 2\.1/);
  assert.match(draft, /Pendientes:\n- \[ \] Solicitar TSH/);

  tasks[0].responsible = 'Paciente';
  tasks[0].status = 'Completado';
  assert.match(formatPendingList(tasks), /- \[x\] Solicitar TSH \(Solicitud · Paciente · Completado\)/);
});
