import { extractAndFormat } from './extractor.js?v=2.1.0';
import { extractTasks, formatConsultationDraft, formatPendingList } from './consultation.js?v=2.1.0';

const byId = (id) => document.querySelector(`#${id}`);
const sourceText = byId('sourceText');
const resultText = byId('resultText');
const emptyState = byId('emptyState');
const characterCount = byId('characterCount');
const resultCount = byId('resultCount');
const groupResults = byId('groupResults');
const examColons = byId('examColons');
const copyButton = byId('copyButton');
const addToConsultButton = byId('addToConsultButton');
const clearButton = byId('clearButton');
const sampleButton = byId('sampleButton');
const consultDate = byId('consultDate');
const consultSummary = byId('consultSummary');
const consultLabs = byId('consultLabs');
const consultPlan = byId('consultPlan');
const consultDraft = byId('consultDraft');
const consultEmptyState = byId('consultEmptyState');
const consultTaskCount = byId('consultTaskCount');
const copyConsultButton = byId('copyConsultButton');
const sendToPendingButton = byId('sendToPendingButton');
const clearConsultButton = byId('clearConsultButton');
const consultSampleButton = byId('consultSampleButton');
const pendingList = byId('pendingList');
const pendingEmptyState = byId('pendingEmptyState');
const pendingFilter = byId('pendingFilter');
const totalPendingMetric = byId('totalPendingMetric');
const openPendingMetric = byId('openPendingMetric');
const completedPendingMetric = byId('completedPendingMetric');
const addPendingButton = byId('addPendingButton');
const clearPendingButton = byId('clearPendingButton');
const copyPendingButton = byId('copyPendingButton');
const toast = byId('toast');

const labSample = `Fecha/hora de recepción Muestra: 24/09/2026 08:42
HORMONA TIROESTIMULANTE (TSH) 2.10 uUI/mL [0.27 - 4.2]
TETRAIDOTIRONINA LIBRE (T4L) 1.37 ng/dL [0.93 - 1.7]`;
const consultationSample = {
  summary: 'Control ambulatorio. Se revisan antecedentes y exámenes disponibles.',
  plan: 'Solicitar perfil tiroideo. Derivar a nutrición. Avisar resultado por teléfono. Control en seis meses. Mantener tratamiento actual.',
};
const categoryOptions = ['Examen', 'Solicitud', 'Derivación', 'Control', 'Comunicación', 'Documento', 'Otro'];
const responsibleOptions = ['Sin asignar', 'Médico', 'Paciente', 'Enfermería', 'SOME/Secretaría', 'Otro'];
const statusOptions = ['Pendiente', 'Solicitado', 'En curso', 'Completado', 'Cancelado'];

let currentSummary = '';
let currentDraft = '';
let consultationTasks = [];
let pendingTasks = [];
let pendingSequence = 0;

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
  const mode = groupResults.checked ? 'grouped' : 'compact';
  const { results, summary } = extractAndFormat(text, mode, { showExamColons: examColons.checked });
  currentSummary = summary;
  const hasResults = Boolean(summary);
  resultText.hidden = !hasResults;
  emptyState.hidden = hasResults;
  copyButton.disabled = !hasResults;
  addToConsultButton.disabled = !hasResults;
  resultText.textContent = summary;
  resultCount.textContent = hasResults
    ? `${results.length} ${results.length === 1 ? 'resultado reconocido' : 'resultados reconocidos'}`
    : text.trim() ? 'No se reconocieron resultados' : 'Sin resultados';
}

function consultationData() {
  return { date: consultDate.value, summary: consultSummary.value, labs: consultLabs.value, plan: consultPlan.value };
}

function renderConsultation() {
  consultationTasks = extractTasks(consultPlan.value);
  currentDraft = formatConsultationDraft(consultationData(), consultationTasks);
  const hasContent = Boolean(consultSummary.value.trim() || consultLabs.value.trim() || consultPlan.value.trim());
  consultDraft.hidden = !hasContent;
  consultEmptyState.hidden = hasContent;
  consultDraft.textContent = hasContent ? currentDraft : '';
  copyConsultButton.disabled = !hasContent;
  sendToPendingButton.disabled = consultationTasks.length === 0;
  consultTaskCount.textContent = consultationTasks.length
    ? `${consultationTasks.length} ${consultationTasks.length === 1 ? 'acción reconocida' : 'acciones reconocidas'}`
    : 'Sin acciones reconocidas';
}

function createSelect(options, value, label) {
  const select = document.createElement('select');
  select.setAttribute('aria-label', label);
  for (const optionValue of options) {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    option.selected = optionValue === value;
    select.append(option);
  }
  return select;
}

function updatePendingTask(id, property, value) {
  const task = pendingTasks.find((item) => item.id === id);
  if (!task) return;
  task[property] = value;
  renderPending();
}

function taskCard(task) {
  const card = document.createElement('article');
  card.className = `task-card${task.status === 'Completado' ? ' completed' : ''}`;
  const top = document.createElement('div');
  top.className = 'task-card-top';
  const description = document.createElement('textarea');
  description.className = 'task-description';
  description.value = task.description;
  description.placeholder = 'Describe el pendiente…';
  description.setAttribute('aria-label', 'Descripción del pendiente');
  description.addEventListener('change', (event) => updatePendingTask(task.id, 'description', event.target.value.trim()));
  const remove = document.createElement('button');
  remove.className = 'icon-button danger';
  remove.type = 'button';
  remove.textContent = 'Eliminar';
  remove.addEventListener('click', () => {
    pendingTasks = pendingTasks.filter((item) => item.id !== task.id);
    renderPending();
  });
  top.append(description, remove);

  const fields = document.createElement('div');
  fields.className = 'task-fields';
  const category = createSelect(categoryOptions, task.category, 'Tipo de pendiente');
  category.addEventListener('change', (event) => updatePendingTask(task.id, 'category', event.target.value));
  const responsible = createSelect(responsibleOptions, task.responsible, 'Responsable');
  responsible.addEventListener('change', (event) => updatePendingTask(task.id, 'responsible', event.target.value));
  const timing = document.createElement('input');
  timing.type = 'text';
  timing.value = task.timing;
  timing.placeholder = 'Plazo o fecha';
  timing.setAttribute('aria-label', 'Plazo');
  timing.addEventListener('change', (event) => updatePendingTask(task.id, 'timing', event.target.value.trim()));
  const status = createSelect(statusOptions, task.status, 'Estado');
  status.addEventListener('change', (event) => updatePendingTask(task.id, 'status', event.target.value));
  fields.append(category, responsible, timing, status);
  card.append(top, fields);
  return card;
}

function filteredPendingTasks() {
  if (pendingFilter.value === 'completed') return pendingTasks.filter((task) => task.status === 'Completado');
  if (pendingFilter.value === 'open') return pendingTasks.filter((task) => task.status !== 'Completado');
  return pendingTasks;
}

function renderPending() {
  const completed = pendingTasks.filter((task) => task.status === 'Completado').length;
  totalPendingMetric.textContent = String(pendingTasks.length);
  completedPendingMetric.textContent = String(completed);
  openPendingMetric.textContent = String(pendingTasks.length - completed);
  copyPendingButton.disabled = pendingTasks.length === 0;
  const visibleTasks = filteredPendingTasks();
  pendingList.replaceChildren(...visibleTasks.map(taskCard));
  pendingEmptyState.hidden = visibleTasks.length > 0;
  pendingEmptyState.querySelector('p').textContent = !visibleTasks.length && pendingTasks.length
    ? 'No hay pendientes para este filtro.'
    : 'Todavía no hay pendientes en esta sesión.';
}

function addTask(task = {}) {
  pendingSequence += 1;
  pendingTasks.push({
    id: `pending-${pendingSequence}`,
    description: task.description ?? '',
    category: task.category ?? 'Otro',
    responsible: task.responsible ?? 'Sin asignar',
    timing: task.timing ?? '',
    status: task.status ?? 'Pendiente',
  });
}

document.querySelectorAll('[data-view-target]').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.viewTarget)));
sourceText.addEventListener('input', renderResults);
groupResults.addEventListener('change', renderResults);
examColons.addEventListener('change', renderResults);
copyButton.addEventListener('click', () => copyText(currentSummary, 'Resumen copiado'));
clearButton.addEventListener('click', () => { sourceText.value = ''; sourceText.focus(); renderResults(); });
sampleButton.addEventListener('click', () => { sourceText.value = labSample; renderResults(); sourceText.focus(); });
addToConsultButton.addEventListener('click', () => {
  consultLabs.value = currentSummary;
  renderConsultation();
  setView('consultation');
  showToast('Exámenes agregados a la consulta');
});

[consultDate, consultSummary, consultLabs, consultPlan].forEach((field) => field.addEventListener('input', renderConsultation));
consultSampleButton.addEventListener('click', () => {
  consultSummary.value = consultationSample.summary;
  consultPlan.value = consultationSample.plan;
  renderConsultation();
});
clearConsultButton.addEventListener('click', () => {
  consultSummary.value = '';
  consultLabs.value = '';
  consultPlan.value = '';
  renderConsultation();
  consultSummary.focus();
});
copyConsultButton.addEventListener('click', () => copyText(currentDraft, 'Borrador copiado'));
sendToPendingButton.addEventListener('click', () => {
  const existing = new Set(pendingTasks.map((task) => task.description.toLocaleLowerCase('es')));
  let added = 0;
  for (const task of consultationTasks) {
    const normalized = task.description.toLocaleLowerCase('es');
    if (existing.has(normalized)) continue;
    addTask(task);
    existing.add(normalized);
    added += 1;
  }
  renderPending();
  setView('pending');
  showToast(`${added} ${added === 1 ? 'pendiente creado' : 'pendientes creados'}`);
});

pendingFilter.addEventListener('change', renderPending);
addPendingButton.addEventListener('click', () => {
  addTask();
  pendingFilter.value = 'all';
  renderPending();
  pendingList.lastElementChild?.querySelector('.task-description')?.focus();
});
clearPendingButton.addEventListener('click', () => { pendingTasks = []; renderPending(); });
copyPendingButton.addEventListener('click', () => copyText(formatPendingList(pendingTasks), 'Pendientes copiados'));

consultDate.value = localDateValue();
renderResults();
renderConsultation();
renderPending();
