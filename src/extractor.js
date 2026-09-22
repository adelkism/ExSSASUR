const VALUE = String.raw`([<>≤≥]?\s*-?\d+(?:[.,]\d+)?)`;
const FLAGS = String.raw`\s*(?:(?:\*|H|I|ALTO|BAJO)\s*)*[:=]?\s*(?:RESULTADO\s*:?\s*)?`;

const rx = (name, unit = '', options = 'i') =>
  new RegExp(`${name}${FLAGS}${VALUE}${unit ? String.raw`\s*${unit}` : ''}`, options);

const units = {
  mgDl: String.raw`mg\s*\/?\s*d[lL]\b`,
  gDl: String.raw`g\s*\/?\s*d[lL]\b`,
  ngMl: String.raw`ng\s*\/?\s*m[lL]\b`,
  ngDl: String.raw`ng\s*\/?\s*d[lL]\b`,
  mUiMl: String.raw`m(?:UI|IU)\s*\/?\s*m[lL]\b`,
  uiMl: String.raw`(?:u|µ|μ)?UI\s*\/?\s*m[lL]\b`,
  meqL: String.raw`mEq\s*\/?\s*[lL]\b`,
  uL: String.raw`U\s*\/?\s*[lL]\b`,
  pgMl: String.raw`pg\s*\/?\s*m[lL]\b`,
  ugDl: String.raw`(?:u|µ|μ)g\s*\/?\s*d[lL]\b`,
  count3Ul: String.raw`(?:10\^?3|10e3|x10\^?3)\s*\/?\s*(?:u|µ|μ)[lL]\b`,
  enzyme: String.raw`(?:U|UI|IU)\s*\/?\s*[lL]\b`,
  percent: String.raw`%`,
};

const definitions = [
  // Hemograma
  { id: 'hb', label: 'Hb', group: 'Hemograma', format: 'fixed1', patterns: [rx(String.raw`\bHEMOGLOBINA\b`, units.gDl)] },
  { id: 'hcto', label: 'Hcto', group: 'Hemograma', format: 'integer', patterns: [rx(String.raw`\bHEMATOCRITO\b`, units.percent)] },
  { id: 'vcm', label: 'VCM', group: 'Hemograma', format: 'trim1', patterns: [rx(String.raw`\b(?:VCM(?:\s*-\s*VOLUMEN\s+CORPUSCULAR\s+MEDIO)?|VOLUMEN\s+CORPUSCULAR\s+MEDIO)\b`, String.raw`f[lL]\b`)] },
  { id: 'chcm', label: 'CHCM', group: 'Hemograma', format: 'trim1', patterns: [rx(String.raw`\b(?:CHCM(?:\s*-\s*(?:CONC\.?\s*)?(?:HB\s+)?CORPUSCULAR\s+MEDIA)?|CONCENTRACI[ÓO]N\s+DE\s+HEMOGLOBINA\s+CORPUSCULAR\s+MEDIA)\b`, units.gDl)] },
  { id: 'wbc', label: 'GB', group: 'Hemograma', format: 'raw', patterns: [rx(String.raw`\b(?:RECUENTO\s+(?:DE\s+)?LEUCOCITOS|LEUCOCITOS)\b`, units.count3Ul)] },
  { id: 'anc', label: 'RAN', group: 'Hemograma', format: 'raw', patterns: [rx(String.raw`\b(?:RECUENTO\s+ABSOLUTO\s+DE\s+NEUTR[ÓO]FILOS|NEUTR[ÓO]FILOS\s+ABSOLUTOS?|RAN)\b`, units.count3Ul)] },
  { id: 'neutrophils', label: 'N', group: 'Hemograma', format: 'integer', suffix: '%', patterns: [rx(String.raw`\bNEUTR[ÓO]FILOS(?:\s+SEGMENTADOS)?\b\s*%?`, units.percent)] },
  { id: 'lymphocytes', label: 'L', group: 'Hemograma', format: 'integer', suffix: '%', patterns: [rx(String.raw`\bLINFOCITOS\b\s*%?`, units.percent)] },
  { id: 'platelets', label: 'Plaq', group: 'Hemograma', format: 'integer', patterns: [rx(String.raw`\b(?:RECUENTO\s+(?:DE\s+)?PLAQUETAS|PLAQUETAS)\b`, units.count3Ul)] },

  // Perfil de hierro
  { id: 'serumIron', label: 'Ferremia', group: 'Perfil de hierro', format: 'raw', patterns: [rx(String.raw`\bFERREMIA\b`, units.ugDl)] },
  { id: 'tibc', label: 'TIBC', group: 'Perfil de hierro', format: 'raw', patterns: [rx(String.raw`\bTIBC\b`, units.ugDl)] },
  { id: 'uibc', label: 'UIBC', group: 'Perfil de hierro', format: 'raw', patterns: [rx(String.raw`\bUIBC\b`, units.ugDl)] },
  { id: 'ferritin', label: 'Ferritina', group: 'Perfil de hierro', format: 'raw', patterns: [rx(String.raw`\bFERRITINA\b`, units.ngMl)] },
  { id: 'transferrinSaturation', label: 'Sat. transf.', group: 'Perfil de hierro', format: 'raw', suffix: '%', patterns: [rx(String.raw`\bSATURACI[ÓO]N\s+(?:DE\s+)?TRANSFERRINA\b`, units.percent)] },
  { id: 'transferrin', label: 'Transferrina', group: 'Perfil de hierro', format: 'raw', patterns: [rx(String.raw`\bTRANSFERRINA\b`, units.mgDl)] },

  // Renal y metabólico
  { id: 'glucose', label: 'Glic', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\b(?:GLUCOSA|GLICEMIA)(?:\s+BASAL)?\b`, units.mgDl)] },
  { id: 'creatinine', label: 'Crea', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\bCREATININA\b`, units.mgDl)] },
  {
    id: 'egfr', label: 'VFG', group: 'Renal y metabólico', format: 'integer', patterns: [
      new RegExp(String.raw`\b(?:VFG|VELOCIDAD\s+DE\s+FILTRACI[ÓO]N\s+GLOMERULAR)(?:\s*\([^)]*\))?${FLAGS}${VALUE}(?:\s*m[lL]\s*\/\s*min(?:\s*\/\s*1[.,]73\s*m(?:2|²))?)?`, 'i'),
    ],
  },
  { id: 'bun', label: 'BUN', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\bNITR[ÓO]GENO\s+UREICO(?:\s+(?:EN\s+)?SANGRE)?(?:\s*\(BUN\))?\b`, units.mgDl)] },
  { id: 'urea', label: 'Urea', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\bUREA\b`, units.mgDl)] },
  { id: 'sodium', label: 'Na', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\b(?:ELECTROLITO\s+)?SODIO\b`, units.meqL)] },
  { id: 'potassium', label: 'K', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\b(?:ELECTROLITO\s+)?POTASIO\b`, units.meqL)] },
  { id: 'chloride', label: 'Cl', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\b(?:ELECTROLITO\s+)?CLORO\b`, units.meqL)] },
  { id: 'calcium', label: 'Ca', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\bCALCIO(?:\s+S[ÉE]RICO)?\b`, units.mgDl)] },
  { id: 'phosphorus', label: 'P', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\bF[ÓO]SFORO(?:\s+S[ÉE]RICO)?\b`, units.mgDl)] },
  { id: 'magnesium', label: 'Mg', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\bMAGNESIO(?:\s+S[ÉE]RICO)?\b`, units.mgDl)] },
  { id: 'uricAcid', label: 'Ác. úrico', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\b[ÁA]CIDO\s+[ÚU]RICO\b`, units.mgDl)] },
  { id: 'ldh', label: 'LDH', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\b(?:LACTATO\s+DESHIDROGENASA|LDH)\b`, units.uL)] },

  // Hepático
  { id: 'bilirubinTotal', label: 'BiliT', group: 'Hepático', format: 'trim2', patterns: [rx(String.raw`\bBILIRRUBINA\s+TOTAL\b`, units.mgDl)] },
  { id: 'bilirubinDirect', label: 'BiliD', group: 'Hepático', format: 'trim2', patterns: [rx(String.raw`\bBILIRRUBINA\s+DIRECTA\b`, units.mgDl)] },
  {
    id: 'got', label: 'GOT', group: 'Hepático', format: 'integer', patterns: [
      rx(String.raw`\b(?:TRANSAMINASA\s+)?(?:GOT|TGO|ASAT|AST|SGOT)\b(?:\s*(?:\/|-)\s*(?:GOT|TGO|ASAT|AST|SGOT)\b|\s*\((?:GOT|TGO|ASAT|AST|SGOT)\))?`, units.enzyme),
      rx(String.raw`\bTRANSAMINASA\s+(?:GLUT[ÁA]MICO[\s-]+OXALAC[ÉE]TICA|OXALAC[ÉE]TICA)(?:\s*\((?:GOT|TGO|ASAT|AST|SGOT)\))?`, units.enzyme),
    ],
  },
  {
    id: 'gpt', label: 'GPT', group: 'Hepático', format: 'integer', patterns: [
      rx(String.raw`\b(?:TRANSAMINASA\s+)?(?:GPT|TGP|ALAT|ALT|SGPT)\b(?:\s*(?:\/|-)\s*(?:GPT|TGP|ALAT|ALT|SGPT)\b|\s*\((?:GPT|TGP|ALAT|ALT|SGPT)\))?`, units.enzyme),
      rx(String.raw`\bTRANSAMINASA\s+(?:GLUT[ÁA]MICO[\s-]+PIR[ÚU]VICA|PIR[ÚU]VICA)(?:\s*\((?:GPT|TGP|ALAT|ALT|SGPT)\))?`, units.enzyme),
    ],
  },
  { id: 'alkalinePhosphatase', label: 'FA', group: 'Hepático', format: 'integer', patterns: [rx(String.raw`\bFOSFATASA(?:S)?\s+ALCALINA(?:S)?\b`, units.uL)] },
  { id: 'ggt', label: 'GGT', group: 'Hepático', format: 'integer', patterns: [rx(String.raw`\b(?:GAMMA\s+GLUTAMIL(?:TRANSPEPTIDASA|\s+TRANSFERASA)?|GGT)\b`, units.uL)] },
  { id: 'albumin', label: 'Alb', group: 'Hepático', format: 'fixed1', patterns: [rx(String.raw`\bALB[ÚU]MINA(?:\s+SANGRE)?\b`, units.gDl)] },

  // Lípidos y nutrición
  { id: 'totalCholesterol', label: 'ColT', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\bCOLESTEROL\s+TOTAL\b`, units.mgDl)] },
  { id: 'hdl', label: 'HDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?HDL\b`, units.mgDl)] },
  { id: 'ldl', label: 'LDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?LDL\b`, units.mgDl)] },
  { id: 'vldl', label: 'VLDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?VLDL\b`, units.mgDl)] },
  { id: 'triglycerides', label: 'TGC', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\bTRIGLIC[ÉE]RIDOS\b`, units.mgDl)] },
  { id: 'proteins', label: 'Prot', group: 'Lípidos y nutrición', format: 'fixed1', patterns: [rx(String.raw`\bPROTE[IÍ]NAS(?:\s+TOTALES)?\b`, units.gDl)] },
  { id: 'hba1c', label: 'HbA1c', group: 'Lípidos y nutrición', format: 'fixed1', suffix: '%', patterns: [rx(String.raw`\b(?:HEMOGLOBINA\s+GLICADA(?:\s*\(HBA1C\))?|HBA1C)\b`, units.percent)] },

  // Inflamación
  { id: 'crp', label: 'PCR', group: 'Inflamación', format: 'trim1', patterns: [rx(String.raw`\b(?:PROTE[IÍ]NA\s+C\s+REACTIVA(?:\s*\(CRP\))?|PCR)\b`, String.raw`mg\s*\/?\s*[lL]\b`)] },
  { id: 'procalcitonin', label: 'Proca', group: 'Inflamación', format: 'trim2', patterns: [rx(String.raw`\bPROCALCITONINA\b`, units.ngMl)] },
  { id: 'esr', label: 'VHS', group: 'Inflamación', format: 'integer', patterns: [rx(String.raw`\b(?:VHS|VELOCIDAD\s+DE\s+SEDIMENTACI[ÓO]N)\b`, String.raw`mm\s*\/?\s*h(?:r|ora)?\b`)] },

  // Cardíaco y coagulación
  { id: 'troponin', label: 'Tropo', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\bTROPONINA(?:\s+[TI])?\b`, String.raw`ng\s*\/?\s*[lL]\b`)] },
  { id: 'dDimer', label: 'DD', group: 'Cardíaco y coagulación', format: 'raw', patterns: [rx(String.raw`\b(?:D[IÍ]MERO\s+D|D-D[IÍ]MERO)\b`)] },
  { id: 'proBnp', label: 'ProBNP', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:NT\s*-?\s*PROBNP|PROBNP|PRO\s*P[ÉE]PTIDO\s+NATRIUR[ÉE]TICO\s+TIPO\s+B(?:\s*\(NTPROBNP\))?)\b`, units.pgMl)] },
  { id: 'inr', label: 'INR', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:[ÍI]NDICE\s+INTERNACIONAL\s+NORMALIZADO(?:\s*\(INR\))?|INR)\b`)] },

  // Endocrino
  { id: 'tsh', label: 'TSH', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`(?:\bHORMONA\s+TIROESTIMULANTE\s*\(TSH\)|\bTSH\b\)?)`, units.uiMl)] },
  { id: 'freeT4', label: 'T4L', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`(?:(?:TIROXINA|TETRAIODOTIRONINA|TETRAIDOTIRONINA)\s+LIBRE\s*\(T4L\)|\bT4L\b\)?)`, units.ngDl)] },
  { id: 'bhcg', label: 'BHCG', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`(?:\bBETA\s+GONADOTROFINA\s+CORI[ÓO]NICA\s*\(BHCG\)(?:\s+HUMANA)?|\bBETA[-\s]?HCG\b|\bBHCG\b)`, units.mUiMl)] },
  { id: 'testosterone', label: 'Testo', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bTESTOSTERONA(?:\s+TOTAL)?\b`, units.ngMl)] },
  { id: 'lh', label: 'LH', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?:\bHORMONA\s+LUTEINIZANTE\s*\(LH\)|\bLH\b\)?)`, units.mUiMl)] },
  { id: 'fsh', label: 'FSH', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?:\bHORMONA\s+FOL[ÍI]CULO\s*ESTIMULANTE\s*\(FSH\)|\bFSH\b\)?)`, units.mUiMl)] },
  { id: 'prolactin', label: 'PRL', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bPROLACTINA(?:\s*\(PRL\))?\b`, units.ngMl)] },
  { id: 'estradiol', label: 'E2', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bESTRADIOL(?:\s*\(E2\))?\b`, String.raw`pg\s*\/?\s*m[lL]\b`)] },
  { id: 'cortisol', label: 'Cortisol', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCORTISOL\b`, String.raw`(?:µ|μ|u)?g\s*\/?\s*d[lL]\b`)] },
  { id: 'acth', label: 'ACTH', group: 'Endocrino', format: 'trim1', patterns: [rx(String.raw`\bACTH\b`, units.pgMl)] },
  { id: 'igf1', label: 'IGF-1', group: 'Endocrino', format: 'integer', patterns: [rx(String.raw`\b(?:IGF\s*-?\s*1|SOMATOMEDINA\s+C)\b`, units.ngMl)] },
  {
    id: 'ohp17', label: '17OHP', group: 'Endocrino', format: 'trim2', patterns: [
      new RegExp(String.raw`\b17(?:\s*-?\s*OH)?\s+HIDROXIPROGESTERONA${FLAGS}${VALUE}(?:\s+[<>≤≥]?\s*-?\d+(?:[.,]\d+)?){0,6}\s*${units.ngMl}`, 'i'),
      rx(String.raw`\b17(?:\s*-?\s*OH)?\s+HIDROXIPROGESTERONA\b`, units.ngMl),
    ],
  },
  { id: 'renin', label: 'Renina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bRENINA(?:\s+DIRECTA)?\b`, units.uiMl)] },
  { id: 'aldosterone', label: 'Aldo', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bALDOSTERONA\b`, String.raw`(?:pg\s*\/?\s*m[lL]|ng\s*\/?\s*d[lL])\b`)] },
  { id: 'pth', label: 'PTH', group: 'Endocrino', format: 'trim1', patterns: [rx(String.raw`\b(?:PARATOHORMONA(?:\s+INTACTA)?(?:\s*\(PTH\))?|PTH)\b`, units.pgMl)] },
  { id: 'vitaminD', label: 'VitD', group: 'Endocrino', format: 'trim1', patterns: [rx(String.raw`\b(?:25\s*-?\s*OH\s+VITAMINA\s+D|VITAMINA\s+D(?:\s+TOTAL)?)\b`, units.ngMl)] },
];

const groupOrder = [
  'Hemograma',
  'Perfil de hierro',
  'Renal y metabólico',
  'Hepático',
  'Lípidos y nutrición',
  'Inflamación',
  'Cardíaco y coagulación',
  'Endocrino',
];

export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFKC')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatValue(token, format) {
  const normalized = String(token).replace(/\s+/g, '').replace(',', '.');
  const parsed = normalized.match(/^([<>≤≥]?)(-?\d+(?:\.\d+)?)$/);
  if (!parsed) return normalized;

  const [, comparator, lexicalNumber] = parsed;
  if (comparator) return `${comparator}${lexicalNumber}`;

  const number = Number(lexicalNumber);
  if (!Number.isFinite(number)) return normalized;

  if (format === 'integer') return String(Math.round(number));
  if (format === 'fixed1') return number.toFixed(1);
  if (format === 'fixed2') return number.toFixed(2);
  if (format === 'trim1') return String(Number(number.toFixed(1)));
  if (format === 'trim2') return String(Number(number.toFixed(2)));
  if (format === 'trim3') return String(Number(number.toFixed(3)));
  return lexicalNumber;
}

function numericPart(value) {
  const match = String(value ?? '').replace(/\s+/g, '').replace(',', '.').match(/^([<>≤≥]?)(-?\d+(?:\.\d+)?)/);
  return match ? { comparator: match[1], number: Number(match[2]) } : null;
}

function hemoglobinIsBelow12(rawValue) {
  const parsed = numericPart(rawValue);
  if (!parsed || !Number.isFinite(parsed.number)) return false;
  if (parsed.comparator === '>' || parsed.comparator === '≥') return false;
  if (parsed.comparator === '<' || parsed.comparator === '≤') return parsed.number <= 12;
  return parsed.number < 12;
}

function findValue(text, patterns) {
  let best = null;

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && (!best || match.index < best.index)) {
      best = { index: match.index, token: match[1] };
    }
  }

  return best?.token ?? null;
}

export function extractLabs(sourceText) {
  const text = normalizeText(sourceText);
  if (!text) return [];

  const results = [];
  for (const definition of definitions) {
    const token = findValue(text, definition.patterns);
    if (token === null) continue;

    let value = formatValue(token, definition.format);
    if (definition.suffix) value += definition.suffix;

    results.push({
      id: definition.id,
      label: definition.label,
      group: definition.group,
      value,
      rawValue: token,
    });
  }

  const hb = results.find((result) => result.id === 'hb');
  if (!hemoglobinIsBelow12(hb?.rawValue)) {
    for (const id of ['vcm', 'chcm']) {
      const index = results.findIndex((result) => result.id === id);
      if (index !== -1) results.splice(index, 1);
    }
  }

  const directAnc = results.find((result) => result.id === 'anc');
  if (!directAnc) {
    const wbc = results.find((result) => result.id === 'wbc');
    const neutrophils = results.find((result) => result.id === 'neutrophils');
    const wbcNumber = numericPart(wbc?.rawValue)?.number;
    const neutrophilPercent = numericPart(neutrophils?.rawValue)?.number;

    if (Number.isFinite(wbcNumber) && Number.isFinite(neutrophilPercent)) {
      const ancValue = formatValue(String((wbcNumber * neutrophilPercent) / 100), 'trim3');
      const wbcIndex = results.findIndex((result) => result.id === 'wbc');
      results.splice(wbcIndex + 1, 0, {
        id: 'anc',
        label: 'RAN',
        group: 'Hemograma',
        value: ancValue,
        rawValue: ancValue,
        calculated: true,
      });
    }
  }

  return results;
}

function compactItems(results) {
  const byId = new Map(results.map((result) => [result.id, result]));
  const consumed = new Set();
  const items = [];

  const creatinine = byId.get('creatinine');
  const egfr = byId.get('egfr');
  if (creatinine) {
    const egfrText = egfr ? ` (VFG: ${egfr.value})` : '';
    items.push({ group: creatinine.group, text: `Crea: ${creatinine.value}${egfrText}` });
    consumed.add('creatinine');
    if (egfr) consumed.add('egfr');
  }

  const sodium = byId.get('sodium');
  const potassium = byId.get('potassium');
  const chloride = byId.get('chloride');
  if (sodium && potassium && chloride) {
    items.push({
      group: sodium.group,
      text: `ELP: ${sodium.value}/${potassium.value}/${chloride.value}`,
    });
    consumed.add('sodium');
    consumed.add('potassium');
    consumed.add('chloride');
  }

  for (const result of results) {
    if (consumed.has(result.id)) continue;

    if (result.id === 'wbc' && byId.has('anc')) {
      items.push({
        group: result.group,
        text: `GB: ${result.value} (RAN: ${byId.get('anc').value})`,
      });
      consumed.add('anc');
      continue;
    }

    items.push({ group: result.group, text: `${result.label}: ${result.value}` });
  }

  return items;
}

export function formatClinicalSummary(results, mode = 'grouped') {
  if (!results.length) return '';
  const items = compactItems(results);

  if (mode === 'compact') {
    return items.map((item) => item.text).join(', ');
  }

  return groupOrder
    .map((group) => {
      const groupItems = items.filter((item) => item.group === group);
      if (!groupItems.length) return null;
      return `${group}: ${groupItems.map((item) => item.text).join(', ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function extractAndFormat(text, mode = 'grouped') {
  const results = extractLabs(text);
  return { results, summary: formatClinicalSummary(results, mode) };
}
