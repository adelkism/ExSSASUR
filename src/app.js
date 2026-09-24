import { extractAndFormat } from './extractor.js?v=2.2.0';
import {
  buildClosureItems,
  buildSsasurOutputs,
  findDocumentationWarnings,
  suggestFollowUpFromPlan,
} from './consultation.js?v=2.2.0';

const byId = (id) => document.querySelector(`#${id}`);
const toast = byId('toast');
const sourceText = byId('sourceText');
const resultText = byId('resultText');
const emptyState = byId('emptyState');
const characterCount = byId('characterCount');
const resultCount = byId('resultCount');
const groupResults = byId('groupResults');
const examColons = byId('examColons');
const copyButton = byId('copyButton');
const addToEvolutionButton = byId('addToEvolutionButton');
const clearButton = byId('clearButton');
const sampleButton = byId('sampleButton');
const outputsGrid = byId('outputsGrid');
const warningsList = byId('warningsList');
const warningSummary = byId('warningSummary');
const closureChecklist = byId('closureChecklist');
const closureProgress = byId('closureProgress');
const suggestFollowUpButton = byId('suggestFollowUpButton');

const fieldIds = [
  'encounterDate', 'am', 'medications', 'surgeries', 'obstetric', 'habits',
  'previousSummary', 'currentEvolution', 'evolutionLabs', 'physicalExam',
  'diagnosticHypothesis', 'treatmentIndications', 'orders', 'prescriptions',
  'observations', 'complementaryExams', 'orderHypothesis', 'followUpAction',
  'followUpInterval', 'followUpModality', 'followUpPriority',
];

const outputDefinitions = [
  ['anamnesis', 'Anamnesis', 'Anamnesis y Examen Físico'],
  ['physicalExam', 'Examen físico', 'Anamnesis y Examen Físico'],
  ['diagnosticHypothesis', 'Hipótesis diagnóstica', 'Diagnóstico'],
  ['observations', 'Observaciones', 'Plan y Tratamiento'],
  ['complementaryExams', 'Exámenes complementarios', 'Plan y Tratamiento'],
  ['treatmentIndications', 'Tratamiento e indicaciones', 'Plan y Tratamiento'],
  ['orderHypothesis', 'Hipótesis para la orden', 'OA / IC SOME'],
  ['orderList', 'Exámenes a seleccionar', 'Orden de atención'],
  ['prescriptionList', 'Prescripciones a emitir', 'Receta médica'],
  ['followUp', 'Próximo control', 'Acción a realizar'],
];

const labSample = `Fecha/hora de recepción Muestra: 24/09/2026 08:42
HORMONA TIROESTIMULANTE (TSH) 2.10 uUI/mL [0.27 - 4.2]
TETRAIDOTIRONINA LIBRE (T4L) 1.20 ng/dL [0.93 - 1.7]`;

const fictionalSample = {
  am: 'HTA',
  medications: 'FÁRMACO A 1 COMP C12 H',
  surgeries: 'APENDICECTOMÍA',
  obstetric: '',
  habits: 'TBQ NO',
  previousSummary: 'CONTROL PREVIO SIN CAMBIOS. SE SOLICITARON EXÁMENES DE SEGUIMIENTO.',
  currentEvolution: 'SIN EVENTOS INTERCURRENTES. EVOLUCIÓN CLÍNICA SIN CAMBIOS.',
  evolutionLabs: 'EXS 24.09.26\nTSH: 2.10, T4L: 1.20',
  physicalExam: 'BUEN ESTADO GENERAL.',
  diagnosticHypothesis: 'CONTROL ENDOCRINOLÓGICO',
  treatmentIndications: 'MANTENER INDICACIONES. CONTROL CON EXÁMENES EN 3 MESES.',
  orders: 'TSH\nT4 LIBRE\nHEMOGRAMA',
  prescriptions: '',
  observations: '',
  complementaryExams: '',
  orderHypothesis: '',
  followUpAction: 'CONTROL MISMA ESPECIALIDAD',
  followUpInterval: '3 MESES',
  followUpModality: 'PRESENCIAL EN ESTABLECIMIENTO',
  followUpPriority: 'P2',
};

let currentSummary = '';
let evolutionLabSummary = '';
let currentOutputs = {};
let checkedClosureItems = new Set();

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 1800);
}

async function copyText(text, successMessage) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.className = 'clipboard-helper';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast(successMessage);
}

function setView(viewName) {
  document.querySelectorAll('[data-view]').forEach((view) => {
    const active = view.dataset.view === viewName;
    view.hidden = !active;
    view.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-view-target]').forEach((tab) => {
    const active = tab.dataset.viewTarget === viewName;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-current', active ? 'page' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderResults() {
  const text = sourceText.value;
  characterCount.textContent = `${text.length.toLocaleString('es-CL')} caracteres`;
  const options = { showExamColons: examColons.checked };
  const mode = groupResults.checked ? 'grouped' : 'compact';
  const formatted = extractAndFormat(text, mode, options);
  const compact = extractAndFormat(text, 'compact', options);
  currentSummary = formatted.summary;
  evolutionLabSummary = compact.summary;
  const hasResults = Boolean(formatted.summary);
  resultText.hidden = !hasResults;
  emptyState.hidden = hasResults;
  copyButton.disabled = !hasResults;
  addToEvolutionButton.disabled = !hasResults;
  resultText.textContent = formatted.summary;
  resultCount.textContent = hasResults
    ? `${formatted.results.length} ${formatted.results.length === 1 ? 'resultado reconocido' : 'resultados reconocidos'}`
    : text.trim() ? 'No se reconocieron resultados' : 'Sin resultados';
}

function readEvolutionData() {
  const data = Object.fromEntries(fieldIds.map((id) => [id, byId(id).value]));
  return {
    date: data.encounterDate,
    am: data.am,
    medications: data.medications,
    surgeries: data.surgeries,
    obstetric: data.obstetric,
    habits: data.habits,
    previousSummary: data.previousSummary,
    currentEvolution: data.currentEvolution,
    labs: data.evolutionLabs,
    physicalExam: data.physicalExam,
    diagnosticHypothesis: data.diagnosticHypothesis,
    treatmentIndications: data.treatmentIndications,
    orders: data.orders,
    prescriptions: data.prescriptions,
    observations: data.observations,
    complementaryExams: data.complementaryExams,
    orderHypothesis: data.orderHypothesis,
    followUpAction: data.followUpAction,
    followUpInterval: data.followUpInterval,
    followUpModality: data.followUpModality,
    followUpPriority: data.followUpPriority,
    includeTreatmentInAnamnesis: byId('includeTreatmentInAnamnesis').checked,
    requiresObservation: byId('requiresObservation').checked,
    counterRefer: byId('counterRefer').checked,
  };
}

function outputCard([key, title, destination]) {
  const value = currentOutputs[key] ?? '';
  const article = document.createElement('article');
  article.className = `output-card${value ? '' : ' empty-output'}`;
  const heading = document.createElement('div');
  heading.className = 'output-card-heading';
  const headingText = document.createElement('div');
  const label = document.createElement('h2');
  label.textContent = title;
  const target = document.createElement('span');
  target.textContent = destination;
  headingText.append(label, target);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button';
  button.textContent = 'Copiar';
  button.disabled = !value;
  button.addEventListener('click', () => copyText(value, `${title} copiado`));
  heading.append(headingText, button);
  const content = document.createElement('pre');
  content.textContent = value || 'Sin contenido preparado.';
  article.append(heading, content);
  return article;
}

function renderOutputs(data) {
  currentOutputs = buildSsasurOutputs(data);
  outputsGrid.replaceChildren(...outputDefinitions.map(outputCard));
}

function renderWarnings(data) {
  const warnings = findDocumentationWarnings(data);
  warningSummary.textContent = warnings.length
    ? `${warnings.length} ${warnings.length === 1 ? 'punto para revisar' : 'puntos para revisar'}`
    : 'Sin alertas de consistencia.';
  warningsList.replaceChildren();
  if (!warnings.length) {
    const ok = document.createElement('p');
    ok.className = 'success-message';
    ok.textContent = 'No se detectaron contradicciones entre las salidas preparadas.';
    warningsList.append(ok);
    return;
  }
  for (const warning of warnings) {
    const item = document.createElement('div');
    item.className = 'warning-item';
    item.textContent = warning;
    warningsList.append(item);
  }
}

function updateClosureProgress(items) {
  const completed = items.filter(({ id }) => checkedClosureItems.has(id)).length;
  closureProgress.textContent = `${completed} de ${items.length} completados`;
}

function renderClosure(data) {
  renderWarnings(data);
  const items = buildClosureItems(data);
  const validIds = new Set(items.map(({ id }) => id));
  checkedClosureItems = new Set([...checkedClosureItems].filter((id) => validIds.has(id)));
  const nodes = items.map((item) => {
    const label = document.createElement('label');
    label.className = 'closure-item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checkedClosureItems.has(item.id);
    input.addEventListener('change', () => {
      if (input.checked) checkedClosureItems.add(item.id);
      else checkedClosureItems.delete(item.id);
      updateClosureProgress(items);
      label.classList.toggle('completed', input.checked);
    });
    const text = document.createElement('span');
    text.textContent = item.label;
    label.classList.toggle('completed', input.checked);
    label.append(input, text);
    return label;
  });
  closureChecklist.replaceChildren(...nodes);
  updateClosureProgress(items);
}

function renderEvolution() {
  const data = readEvolutionData();
  renderOutputs(data);
  renderClosure(data);
}

function setFictionalSample() {
  byId('encounterDate').value = localDateValue();
  for (const [id, value] of Object.entries(fictionalSample)) byId(id).value = value;
  byId('includeTreatmentInAnamnesis').checked = true;
  byId('requiresObservation').checked = false;
  byId('counterRefer').checked = false;
  checkedClosureItems.clear();
  renderEvolution();
}

function clearEvolution() {
  for (const id of fieldIds) byId(id).value = '';
  byId('encounterDate').value = localDateValue();
  byId('includeTreatmentInAnamnesis').checked = true;
  byId('requiresObservation').checked = false;
  byId('counterRefer').checked = false;
  checkedClosureItems.clear();
  renderEvolution();
}

document.querySelectorAll('[data-view-target]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.viewTarget)));
document.querySelectorAll('[data-go-to]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.goTo)));
sourceText.addEventListener('input', renderResults);
groupResults.addEventListener('change', renderResults);
examColons.addEventListener('change', renderResults);
copyButton.addEventListener('click', () => copyText(currentSummary, 'Resumen copiado'));
clearButton.addEventListener('click', () => { sourceText.value = ''; sourceText.focus(); renderResults(); });
sampleButton.addEventListener('click', () => { sourceText.value = labSample; renderResults(); sourceText.focus(); });
addToEvolutionButton.addEventListener('click', () => {
  byId('evolutionLabs').value = evolutionLabSummary;
  renderEvolution();
  setView('evolution');
  showToast('Exámenes agregados a la evolución');
});

for (const id of fieldIds) byId(id).addEventListener('input', renderEvolution);
for (const id of ['includeTreatmentInAnamnesis', 'requiresObservation', 'counterRefer']) byId(id).addEventListener('change', renderEvolution);
byId('evolutionSampleButton').addEventListener('click', setFictionalSample);
byId('clearEvolutionButton').addEventListener('click', clearEvolution);
byId('openOutputsButton').addEventListener('click', () => setView('outputs'));
suggestFollowUpButton.addEventListener('click', () => {
  const suggestion = suggestFollowUpFromPlan(byId('treatmentIndications').value);
  if (!suggestion.action && !suggestion.interval) {
    showToast('No se reconoció una acción o intervalo explícito');
    return;
  }
  if (suggestion.action) byId('followUpAction').value = suggestion.action;
  if (suggestion.interval) byId('followUpInterval').value = suggestion.interval;
  renderEvolution();
  showToast('Acción de seguimiento completada');
});
byId('resetClosureButton').addEventListener('click', () => { checkedClosureItems.clear(); renderClosure(readEvolutionData()); });

byId('encounterDate').value = localDateValue();
renderResults();
renderEvolution();
