import { extractAndFormat } from './extractor.js?v=2.0.4';

const sourceText = document.querySelector('#sourceText');
const resultText = document.querySelector('#resultText');
const emptyState = document.querySelector('#emptyState');
const characterCount = document.querySelector('#characterCount');
const resultCount = document.querySelector('#resultCount');
const groupResults = document.querySelector('#groupResults');
const copyButton = document.querySelector('#copyButton');
const clearButton = document.querySelector('#clearButton');
const sampleButton = document.querySelector('#sampleButton');
const toast = document.querySelector('#toast');

const sample = `HORMONA TIROESTIMULANTE (TSH) * < 0.005 uUI/mL [0.27 - 4.2] Método : ECLIA Nota: Valor inferior al límite de detección de la técnica. TETRAIDOTIRONINA LIBRE (T4L) 1.37 ng/dL [0.93 - 1.7]`;

let currentSummary = '';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 1800);
}

function render() {
  const text = sourceText.value;
  characterCount.textContent = `${text.length.toLocaleString('es-CL')} caracteres`;

  const mode = groupResults.checked ? 'grouped' : 'compact';
  const { results, summary } = extractAndFormat(text, mode);
  currentSummary = summary;

  const hasResults = Boolean(summary);
  resultText.hidden = !hasResults;
  emptyState.hidden = hasResults;
  copyButton.disabled = !hasResults;
  resultText.textContent = summary;
  resultCount.textContent = hasResults
    ? `${results.length} ${results.length === 1 ? 'resultado reconocido' : 'resultados reconocidos'}`
    : text.trim()
      ? 'No se reconocieron resultados'
      : 'Sin resultados';
}

async function copySummary() {
  if (!currentSummary) return;
  try {
    await navigator.clipboard.writeText(currentSummary);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(resultText);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
  showToast('Resumen copiado');
}

sourceText.addEventListener('input', render);
groupResults.addEventListener('change', render);
copyButton.addEventListener('click', copySummary);

clearButton.addEventListener('click', () => {
  sourceText.value = '';
  sourceText.focus();
  render();
});

sampleButton.addEventListener('click', () => {
  sourceText.value = sample;
  render();
  sourceText.focus();
});

render();
