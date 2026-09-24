const actionPattern = /\b(?:solicitar|pedir|ordenar|realizar|repetir|tomar|agendar|citar|control(?:ar)?|derivar|interconsulta|avisar|informar|comunicar|llamar|contactar|enviar|entregar|emitir|coordinar|gestionar|revisar)\b/i;

const categoryRules = [
  {
    category: 'Derivación',
    pattern: /\b(?:derivar|derivación|interconsulta)\b/i,
  },
  {
    category: 'Comunicación',
    pattern: /\b(?:avisar|informar|comunicar|llamar|contactar)\b/i,
  },
  {
    category: 'Control',
    pattern: /\b(?:agendar|citar|control(?:ar)?|próxim[oa]\s+consulta)\b/i,
  },
  {
    category: 'Documento',
    pattern: /\b(?:receta|certificado|licencia|informe|formulario|entregar|emitir)\b/i,
  },
  {
    category: 'Examen',
    pattern: /\b(?:examen(?:es)?|laboratorio|perfil|ecograf[ií]a|tac|tomograf[ií]a|resonancia|radiograf[ií]a|densitometr[ií]a|biopsia|muestra|orina|sangre)\b/i,
  },
];

function cleanSentence(sentence) {
  return sentence
    .replace(/^[\s•·–—-]+/, '')
    .replace(/[\s.;]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitPlan(planText) {
  if (!planText?.trim()) return [];

  return planText
    .replace(/\r/g, '')
    .split(/\n+|\s*;\s*|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/u)
    .map(cleanSentence)
    .filter(Boolean);
}

export function inferTaskCategory(description) {
  const match = categoryRules.find(({ pattern }) => pattern.test(description));
  if (match) return match.category;
  if (/\b(?:solicitar|pedir|ordenar|realizar|repetir|tomar|revisar)\b/i.test(description)) {
    return 'Solicitud';
  }
  return 'Otro';
}

export function extractTiming(description) {
  const exactDate = description.match(/\b([0-3]?\d)[/-]([01]?\d)[/-]((?:19|20)?\d{2})\b/);
  if (exactDate) {
    const [, day, month, rawYear] = exactDate;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  const relative = description.match(
    /\b(?:en|dentro de)\s+(\d+|un[ao]?|dos|tres|seis|doce)\s+(d[ií]as?|semanas?|mes(?:es)?|años?)\b/i,
  );
  if (relative) return relative[0].toLowerCase();

  const temporalPhrase = description.match(
    /\b(?:esta semana|la próxima semana|el próximo mes|próximo control|a la brevedad)\b/i,
  );
  return temporalPhrase ? temporalPhrase[0].toLowerCase() : '';
}

export function extractTasks(planText) {
  return splitPlan(planText)
    .filter((sentence) => actionPattern.test(sentence))
    .map((description, index) => ({
      id: `task-${index + 1}`,
      description,
      category: inferTaskCategory(description),
      responsible: 'Sin asignar',
      timing: extractTiming(description),
      status: 'Pendiente',
    }));
}

function normalizeDate(dateValue) {
  if (!dateValue) return '';
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateValue;
  return `${match[3]}.${match[2]}.${match[1].slice(-2)}`;
}

export function formatConsultationDraft({ date, summary, labs, plan }, tasks = []) {
  const sections = [];
  const formattedDate = normalizeDate(date);
  sections.push(formattedDate ? `Consulta ${formattedDate}` : 'Consulta');

  if (summary?.trim()) sections.push(`Resumen:\n${summary.trim()}`);
  if (labs?.trim()) sections.push(`Exámenes:\n${labs.trim()}`);
  if (plan?.trim()) sections.push(`Plan:\n${plan.trim()}`);

  if (tasks.length) {
    const taskLines = tasks.map((task) => {
      const timing = task.timing ? ` · ${task.timing}` : '';
      return `- [ ] ${task.description} (${task.category}${timing})`;
    });
    sections.push(`Pendientes:\n${taskLines.join('\n')}`);
  }

  return sections.join('\n\n');
}

export function formatPendingList(tasks) {
  if (!tasks.length) return '';
  return tasks
    .map((task) => {
      const check = task.status === 'Completado' ? 'x' : ' ';
      const details = [task.category, task.responsible, task.timing, task.status]
        .filter(Boolean)
        .join(' · ');
      return `- [${check}] ${task.description}${details ? ` (${details})` : ''}`;
    })
    .join('\n');
}
