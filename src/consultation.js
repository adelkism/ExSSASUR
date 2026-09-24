const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'];

function clean(value) {
  return String(value ?? '').replace(/\r/g, '').trim();
}

export function formatEncounterDate(dateValue) {
  const match = clean(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return clean(dateValue).toUpperCase();
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month}.${match[1].slice(-2)}` : '';
}

export function normalizeLabSummary(value) {
  const text = clean(value);
  if (!text) return '';
  return text.replace(/^Exs\b/i, 'EXS');
}

export function parseListItems(value) {
  if (!clean(value)) return [];
  return value
    .replace(/\r/g, '')
    .split(/\n+|\s*;\s*/)
    .map((item) => item.replace(/^[\s•·–—-]+/, '').trim())
    .filter(Boolean);
}

const IMPORT_FIELD_LABELS = new Map([
  ['AM', 'am'],
  ['MED', 'medications'],
  ['AQX', 'surgeries'],
  ['AOBST', 'obstetric'],
  ['HAB', 'habits'],
]);

const IMPORT_SECTION_HEADINGS = new Map([
  ['ANAMNESIS', 'anamnesis'],
  ['EXAMEN FISICO', 'previousPhysicalExam'],
  ['HIPOTESIS DIAGNOSTICA', 'previousDiagnosticHypothesis'],
  ['DIAGNOSTICO', 'previousDiagnosis'],
  ['TRATAMIENTO E INDICACIONES', 'previousTreatmentIndications'],
  ['PLAN Y TRATAMIENTO', 'previousTreatmentIndications'],
  ['OBSERVACIONES', 'previousObservations'],
  ['EXAMENES COMPLEMENTARIOS', 'previousComplementaryExams'],
]);

const IMPORTABLE_EVOLUTION_FIELDS = [
  'am',
  'medications',
  'surgeries',
  'obstetric',
  'habits',
  'previousSummary',
];

function normalizedHeading(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/^\*+\s*/, '')
    .replace(/\s*\(\d+\s+CARACTERES[^)]*\)\s*$/i, '')
    .replace(/[:.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sectionForLine(line) {
  return IMPORT_SECTION_HEADINGS.get(normalizedHeading(line)) ?? '';
}

function antecedentsFromLine(line) {
  const matches = [];
  const pattern = /(?:^|\s)(AM|MED|AQX|AOBST|HAB)\s*:\s*(.*?)(?=\s+(?:AM|MED|AQX|AOBST|HAB)\s*:|$)/gi;
  for (const match of line.matchAll(pattern)) {
    matches.push({ label: match[1].toUpperCase(), value: clean(match[2]) });
  }
  return matches;
}

function isAdministrativeEvolutionLine(line) {
  return /^(?:ESTADO ATENCI[ÓO]N|ICS? ASOCIADAS?|CONTROL ASOCIADO|RESPONSABLE DE LA ATENCI[ÓO]N|ACCI[ÓO]N A REALIZAR)\b/i.test(clean(line));
}

function compactImportedBlock(lines) {
  const compacted = [];
  for (const rawLine of lines) {
    const line = rawLine.replace(/[ \t]+$/g, '');
    if (!line.trim() && (!compacted.length || !compacted.at(-1))) continue;
    compacted.push(line.trim());
  }
  while (compacted.at(-1) === '') compacted.pop();
  return compacted.join('\n').trim();
}

export function extractEvolutionImport(sourceText) {
  const imported = {
    am: '',
    medications: '',
    surgeries: '',
    obstetric: '',
    habits: '',
    previousSummary: '',
    previousPhysicalExam: '',
    previousDiagnosticHypothesis: '',
    previousDiagnosis: '',
    previousTreatmentIndications: '',
    previousObservations: '',
    previousComplementaryExams: '',
  };
  const sections = { preamble: [], anamnesis: [] };
  let currentSection = 'preamble';
  let explicitAnamnesis = false;

  for (const rawLine of String(sourceText ?? '').replace(/\r/g, '').split('\n')) {
    const heading = sectionForLine(rawLine);
    if (heading) {
      currentSection = heading;
      sections[currentSection] ??= [];
      if (heading === 'anamnesis') explicitAnamnesis = true;
      continue;
    }

    const antecedents = antecedentsFromLine(rawLine);
    if (antecedents.length) {
      for (const { label, value } of antecedents) {
        const field = IMPORT_FIELD_LABELS.get(label);
        if (field && value) imported[field] = value;
      }
      continue;
    }

    if (/^[\s._–—-]+$/.test(rawLine) || isAdministrativeEvolutionLine(rawLine)) continue;
    sections[currentSection] ??= [];
    sections[currentSection].push(rawLine);
  }

  imported.previousSummary = compactImportedBlock(
    explicitAnamnesis ? sections.anamnesis : sections.preamble,
  );
  for (const field of Object.keys(imported).filter((key) => key.startsWith('previous') && key !== 'previousSummary')) {
    imported[field] = compactImportedBlock(sections[field] ?? []);
  }
  return imported;
}

export function formatEvolutionImportPreview(imported) {
  const antecedents = [
    ['AM', imported.am],
    ['MED', imported.medications],
    ['AQX', imported.surgeries],
    ['AOBST', imported.obstetric],
    ['HAB', imported.habits],
  ]
    .filter(([, value]) => clean(value))
    .map(([label, value]) => `${label}: ${clean(value)}`);
  return [antecedents.join('\n'), clean(imported.previousSummary)].filter(Boolean).join('\n\n');
}

export function mergeEvolutionImport(currentData, imported) {
  const values = { ...currentData };
  const applied = [];
  const skipped = [];
  for (const field of IMPORTABLE_EVOLUTION_FIELDS) {
    const importedValue = clean(imported[field]);
    if (!importedValue) continue;
    if (clean(currentData[field])) {
      skipped.push(field);
      continue;
    }
    values[field] = importedValue;
    applied.push(field);
  }
  return { values, applied, skipped };
}

export function composeAnamnesis(data) {
  const antecedents = [
    ['AM', data.am],
    ['MED', data.medications],
    ['AQX', data.surgeries],
    ['AOBST', data.obstetric],
    ['HAB', data.habits],
  ]
    .filter(([, value]) => clean(value))
    .map(([label, value]) => `${label}: ${clean(value)}`);

  const currentContent = [
    clean(data.currentEvolution),
    normalizeLabSummary(data.labs),
    data.includeTreatmentInAnamnesis === false ? '' : clean(data.treatmentIndications),
  ].filter(Boolean);
  const current = currentContent.length
    ? [formatEncounterDate(data.date), ...currentContent].filter(Boolean)
    : [];

  return [
    antecedents.join('\n'),
    clean(data.previousSummary),
    current.join('\n'),
  ].filter(Boolean).join('\n\n');
}

export function formatOrderList(value) {
  return parseListItems(value).map((item) => `- ${item}`).join('\n');
}

export function formatPrescriptionList(value) {
  return parseListItems(value).map((item) => `- ${item}`).join('\n');
}

export function formatFollowUp(data) {
  const hasFollowUp = [
    data.followUpAction,
    data.followUpInterval,
    data.followUpModality,
    data.followUpPriority,
  ].some((value) => clean(value)) || data.requiresObservation || data.counterRefer;
  if (!hasFollowUp) return '';

  const fields = [
    ['ACCIÓN', data.followUpAction],
    ['INTERVALO', data.followUpInterval],
    ['MODALIDAD', data.followUpModality],
    ['PRIORIDAD', data.followUpPriority],
    ['GESTIÓN/OBSERVACIÓN', data.requiresObservation ? 'SÍ' : 'NO'],
    ['CONTRARREFERIR', data.counterRefer ? 'SÍ' : 'NO'],
  ];
  return fields
    .filter(([, value]) => clean(value))
    .map(([label, value]) => `${label}: ${clean(value).toUpperCase()}`)
    .join('\n');
}

const numberWords = new Map([
  ['UN', '1'], ['UNO', '1'], ['UNA', '1'], ['DOS', '2'], ['TRES', '3'],
  ['CUATRO', '4'], ['SEIS', '6'], ['DOCE', '12'],
]);

export function suggestFollowUpFromPlan(planText) {
  const plan = clean(planText);
  const suggestion = { action: '', interval: '' };
  if (/\balta\b/i.test(plan)) suggestion.action = 'ALTA MÉDICA';
  else if (/\bcontrol\b/i.test(plan)) suggestion.action = 'CONTROL MISMA ESPECIALIDAD';

  const match = plan.match(/\b(?:en|a)\s+(\d+|un[oa]?|dos|tres|cuatro|seis|doce)\s+mes(?:es)?\b/i);
  if (match) {
    const raw = match[1].toUpperCase();
    const number = numberWords.get(raw) ?? raw;
    suggestion.interval = `${number} ${number === '1' ? 'MES' : 'MESES'}`;
  }
  return suggestion;
}

export function buildSsasurOutputs(data) {
  const hypothesis = clean(data.diagnosticHypothesis);
  return {
    anamnesis: composeAnamnesis(data),
    physicalExam: clean(data.physicalExam),
    diagnosticHypothesis: hypothesis,
    observations: clean(data.observations),
    complementaryExams: clean(data.complementaryExams),
    treatmentIndications: clean(data.treatmentIndications),
    orderHypothesis: clean(data.orderHypothesis) || hypothesis,
    orderList: formatOrderList(data.orders),
    prescriptionList: formatPrescriptionList(data.prescriptions),
    followUp: formatFollowUp(data),
  };
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

export function findDocumentationWarnings(data) {
  const plan = clean(data.treatmentIndications);
  const action = clean(data.followUpAction);
  const warnings = [];

  if (/\bcontrol\b/i.test(plan) && !action) {
    warnings.push('El tratamiento/indicaciones menciona control, pero no se definió la acción a realizar.');
  }
  if (/\bcontrol\b/i.test(action) && !clean(data.followUpInterval)) {
    warnings.push('Se seleccionó una acción de control, pero falta indicar el intervalo.');
  }
  const suggested = suggestFollowUpFromPlan(plan);
  if (
    suggested.interval &&
    clean(data.followUpInterval) &&
    suggested.interval !== clean(data.followUpInterval).toUpperCase()
  ) {
    warnings.push(`El plan menciona ${suggested.interval.toLowerCase()}, pero el intervalo seleccionado es ${clean(data.followUpInterval).toLowerCase()}.`);
  }
  if (/\balta\b/i.test(action) && /\bcontrol\b/i.test(plan)) {
    warnings.push('La acción indica alta, pero el tratamiento/indicaciones todavía menciona un control.');
  }
  if (
    includesAny(plan, [/\bexámenes?\b/i, /\bexs\b/i, /\bsolicitar\b/i, /\bperfil\b/i]) &&
    parseListItems(data.orders).length === 0
  ) {
    warnings.push('El tratamiento/indicaciones menciona exámenes, pero la lista de solicitud está vacía.');
  }
  if (
    includesAny(plan, [/\biniciar\b/i, /\bsuspender\b/i, /\baumentar\b/i, /\bdisminuir\b/i, /\bcambiar\b/i]) &&
    parseListItems(data.prescriptions).length === 0
  ) {
    warnings.push('El tratamiento/indicaciones contiene un cambio farmacológico; revisa si requiere receta.');
  }
  if (parseListItems(data.orders).length && !clean(data.orderHypothesis) && !clean(data.diagnosticHypothesis)) {
    warnings.push('Hay exámenes preparados, pero falta una hipótesis diagnóstica para la orden.');
  }

  return warnings;
}

export function buildClosureItems(data) {
  const items = [
    { id: 'evolution', label: 'Anamnesis y examen físico revisados' },
    { id: 'diagnosis', label: 'Hipótesis y diagnóstico codificado registrados' },
    { id: 'activity', label: 'Actividad de la atención registrada' },
  ];

  if (parseListItems(data.orders).length) {
    items.push({ id: 'orders', label: 'Exámenes seleccionados y orden guardada' });
  }
  if (parseListItems(data.prescriptions).length) {
    items.push({ id: 'prescription', label: 'Receta emitida y guardada' });
  }
  if (clean(data.followUpAction)) {
    items.push({ id: 'follow-up', label: 'Acción, intervalo, modalidad y prioridad confirmados' });
  }
  if (data.counterRefer) {
    items.push({ id: 'counter-reference', label: 'Contrarreferencia completada' });
  }
  items.push({ id: 'saved', label: 'Atención guardada y cerrada en SSASUR' });
  return items;
}
