const VALUE = String.raw`([<>≤≥]?\s*-?\d+(?:[.,]\d+)?)`;
const FLAGS = String.raw`\s*(?:(?:\*|H|I|ALTO|BAJO)\s*)*[:=]?\s*(?:RESULTADO\s*:?\s*)?`;

const rx = (name, unit = '', options = 'i') =>
  new RegExp(`${name}${FLAGS}${VALUE}${unit ? String.raw`\s*${unit}` : ''}`, options);

const qrx = (name, values, options = 'i') =>
  new RegExp(`${name}${FLAGS}(${values})`, options);

const units = {
  mgDl: String.raw`mg\s*\/?\s*d[lL]\b`,
  mgL: String.raw`mg\s*\/?\s*[lL]\b`,
  gDl: String.raw`g\s*\/?\s*d[lL]\b`,
  gL: String.raw`g\s*\/?\s*[lL]\b`,
  ngMl: String.raw`ng\s*\/?\s*m[lL]\b`,
  ngDl: String.raw`ng\s*\/?\s*d[lL]\b`,
  ngL: String.raw`ng\s*\/?\s*[lL]\b`,
  mUiMl: String.raw`m(?:UI|IU)\s*\/?\s*m[lL]\b`,
  mUiL: String.raw`m(?:UI|IU)\s*\/?\s*[lL]\b`,
  uiMl: String.raw`(?:m|u|µ|μ)?(?:UI|IU)\s*\/?\s*m[lL]\b`,
  uiL: String.raw`(?:UI|IU)\s*\/?\s*[lL]\b`,
  meqL: String.raw`mEq\s*\/?\s*[lL]\b`,
  uL: String.raw`U\s*\/?\s*[lL]\b`,
  pgMl: String.raw`pg\s*\/?\s*m[lL]\b`,
  ugDl: String.raw`(?:u|µ|μ|mc)g\s*\/?\s*d[lL]\b`,
  ugL: String.raw`(?:u|µ|μ|mc)g\s*\/?\s*[lL]\b`,
  pmolL: String.raw`pmol\s*\/?\s*[lL]\b`,
  nmolL: String.raw`nmol\s*\/?\s*[lL]\b`,
  mmolL: String.raw`mmol\s*\/?\s*[lL]\b`,
  umolL: String.raw`(?:u|µ|μ)mol\s*\/?\s*[lL]\b`,
  mosmKg: String.raw`mOsm\s*\/?\s*kg\b`,
  seconds: String.raw`(?:s|seg(?:undos?)?)\b`,
  mg24h: String.raw`mg\s*\/?\s*(?:24\s*h(?:oras?|rs?)?|d[ií]a)\b`,
  g24h: String.raw`g\s*\/?\s*(?:24\s*h(?:oras?|rs?)?|d[ií]a)\b`,
  ug24h: String.raw`(?:u|µ|μ|mc)g\s*\/?\s*(?:24\s*h(?:oras?)?|d[ií]a)\b`,
  nmol24h: String.raw`nmol\s*\/?\s*(?:24\s*h(?:oras?|rs?)?|d[ií]a)\b`,
  mmol24h: String.raw`mmol\s*\/?\s*(?:24\s*h(?:oras?|rs?)?|d[ií]a)\b`,
  meq24h: String.raw`mEq\s*\/?\s*(?:24\s*h(?:oras?|rs?)?|d[ií]a)\b`,
  count3Ul: String.raw`(?:10\^?3|10e3|x10\^?3)\s*\/?\s*(?:u|µ|μ)[lL]\b`,
  enzyme: String.raw`(?:U|UI|IU)\s*\/?\s*[lL]\b`,
  percent: String.raw`%`,
};

const qualitativeValue = String.raw`(?:NEGATIV[OA]S?|POSITIV[OA]S?|AUSENTE(?:S)?|PRESENTE(?:S)?|NO\s+SE\s+OBSERVAN|TRAZAS?|ESCAS[OA]S?|MODERAD[OA]S?|ABUNDANTE(?:S)?|NORMAL)`;
const urineFieldUnit = String.raw`(?:\/\s*CAMPO|POR\s+CAMPO|x\s*CAMPO|C[ÉE]LULAS?\s*\/\s*(?:u|µ|μ)[lL])\b`;
const urineRangeValue = String.raw`([<>≤≥]?\s*\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)?)`;

const cortisolUnits = String.raw`(?:${units.ugDl}|${units.nmolL})`;
const urinaryCortisolUnits = String.raw`(?:${units.ug24h}|${units.nmol24h}|${units.ugL}|${units.nmolL})`;
const thyroidAntibodyUnits = String.raw`(?:${units.uiMl}|${units.uiL}|k(?:UI|IU)\s*\/?\s*[lL]\b)`;
const metanephrineUnits = String.raw`(?:${units.pgMl}|${units.ngL}|${units.nmolL}|${units.ugL}|${units.ug24h}|${units.nmol24h})`;
const ohp17Name = String.raw`(?:17\s*-?\s*HIDROXIPROGESTERONA|17\s*-?\s*(?:OH|HIDROXI)\s*-?\s*PROGESTERONA)`;

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
  { id: 'reticulocytes', label: 'Retic', group: 'Hemograma', format: 'trim1', suffix: '%', patterns: [rx(String.raw`\b(?:RECUENTO\s+DE\s+)?RETICULOCITOS\b`, units.percent)] },

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
  {
    id: 'calcium', label: 'Ca', group: 'Renal y metabólico', format: 'fixed1', patterns: [
      rx(String.raw`\bCALCIO(?:\s+S[ÉE]RICO)?\b`, units.mgDl),
      rx(String.raw`\bCALCIO(?:\s+S[ÉE]RICO)?\b(?!\s+(?:EN\s+ORINA|URINARIO|I[ÓO]NICO|24\s*H))`),
    ],
  },
  { id: 'ionizedCalcium', label: 'Ca iónico', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\bCALCIO\s+I[ÓO]NICO\b`, String.raw`(?:${units.mmolL}|${units.mgDl})`)] },
  { id: 'phosphorus', label: 'P', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\bF[ÓO]SFORO(?:\s+S[ÉE]RICO)?\b`, units.mgDl)] },
  { id: 'magnesium', label: 'Mg', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\bMAGNESIO(?:\s+S[ÉE]RICO)?\b`, units.mgDl)] },
  { id: 'uricAcid', label: 'Ác. úrico', group: 'Renal y metabólico', format: 'fixed1', patterns: [rx(String.raw`\b[ÁA]CIDO\s+[ÚU]RICO\b`, units.mgDl)] },
  { id: 'lactate', label: 'Lactato', group: 'Renal y metabólico', format: 'trim2', patterns: [rx(String.raw`\b(?:[ÁA]CIDO\s+L[ÁA]CTICO|LACTATO)\b`, String.raw`(?:${units.mmolL}|${units.mgDl})`)] },
  { id: 'bicarbonate', label: 'HCO3', group: 'Renal y metabólico', format: 'trim1', patterns: [rx(String.raw`\b(?:BICARBONATO|HCO3)\b`, String.raw`(?:${units.mmolL}|${units.meqL})`)] },
  { id: 'amylase', label: 'Amilasa', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\bAMILASA\b`, units.enzyme)] },
  { id: 'lipase', label: 'Lipasa', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\bLIPASA\b`, units.enzyme)] },
  { id: 'ammonia', label: 'Amonio', group: 'Renal y metabólico', format: 'trim1', patterns: [rx(String.raw`\b(?:AMONIO|AMONIACO)\b`, String.raw`(?:${units.umolL}|${units.ugDl})`)] },
  { id: 'osmolality', label: 'Osm', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\bOSMOLALIDAD(?:\s+PLASM[ÁA]TICA)?\b`, units.mosmKg)] },
  { id: 'ldh', label: 'LDH', group: 'Renal y metabólico', format: 'integer', patterns: [rx(String.raw`\b(?:LACTATO\s+DESHIDROGENASA|LDH)\b`, units.uL)] },

  // Renal y urinario
  {
    id: 'urineAcr', label: 'RAC', group: 'Renal y urinario', format: 'trim2', patterns: [
      new RegExp(String.raw`(?:^|\s)(?:RAC|ACR|RELACI[ÓO]N\s+(?:DE\s+)?(?:ALB[ÚU]MINA|ALBUMINURIA|MICROALBUMINURIA)\s*(?:\/|\s+CON\s+|\s*[-–]\s*|\s+)\s*CREATIN(?:INA|URIA)(?:\s+(?:EN\s+)?ORINA)?|[ÍI]NDICE\s+(?:DE\s+)?ALB[ÚU]MINA\s*(?:\/|\s*[-–]\s*)\s*CREATIN(?:INA|URIA))\b${FLAGS}${VALUE}\s*(?:RELACI[ÓO]N\s*)?(?:mg\s*\/\s*g(?:\s+CREATININA)?|mg\s*\/\s*mmol|(?:u|µ|μ|mc)g\s*\/\s*mg)\b`, 'i'),
    ],
  },
  {
    id: 'urineMicroalbumin', label: 'MicroalbU', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:MICROALB[ÚU]MINA(?:\s+(?:EN\s+)?ORINA)?|MICROALBUMINURIA)(?:\s*-?\s*AN[ÁA]LISIS)?\b`, String.raw`(?:${units.mgL}|${units.mgDl}|${units.ugL})`),
    ],
  },
  {
    id: 'urineCreatinine', label: 'CreaU', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:CREATININA\s+(?:EN\s+)?ORINA|CREATININURIA)(?:\s*-?\s*AN[ÁA]LISIS)?\b`, String.raw`(?:${units.mgDl}|${units.mmolL})`),
    ],
  },
  {
    id: 'urineCalcium24h', label: 'CaU 24h', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:CALCIURIA|CALCIO\s+(?:EN\s+ORINA|URINARIO))(?:\s+(?:DE\s+|EN\s+)?24\s*H(?:ORAS?|RS?)?)?\b`, String.raw`(?:${units.mg24h}|${units.mmol24h})`),
    ],
  },
  {
    id: 'urineCreatinine24h', label: 'CreaU 24h', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:CREATININURIA|CREATININA\s+(?:EN\s+ORINA|URINARIA))(?:\s+(?:DE\s+|EN\s+)?24\s*H(?:ORAS?|RS?)?)?\b`, String.raw`(?:${units.mg24h}|${units.g24h}|${units.mmol24h})`),
    ],
  },
  {
    id: 'urineSodium24h', label: 'NaU 24h', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:NATRIURIA|(?:SODIO|NA)\s+(?:EN\s+ORINA|URINARIO))(?:\s+(?:DE\s+|EN\s+)?24\s*H(?:ORAS?|RS?)?)?\b`, String.raw`(?:${units.mmol24h}|${units.meq24h})`),
    ],
  },
  {
    id: 'urinePotassium24h', label: 'KU 24h', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:(?:KALIURIA|CALIURIA)|(?:POTASIO|K)\s+(?:EN\s+ORINA|URINARIO))(?:\s+(?:DE\s+|EN\s+)?24\s*H(?:ORAS?|RS?)?)?\b`, String.raw`(?:${units.mmol24h}|${units.meq24h})`),
    ],
  },
  {
    id: 'urineChloride24h', label: 'ClU 24h', group: 'Renal y urinario', format: 'trim2', patterns: [
      rx(String.raw`\b(?:CLORURIA|(?:CLORO|CLORURO|CL)\s+(?:EN\s+ORINA|URINARIO))(?:\s+(?:DE\s+|EN\s+)?24\s*H(?:ORAS?|RS?)?)?\b`, String.raw`(?:${units.mmol24h}|${units.meq24h})`),
    ],
  },

  // Hepático
  { id: 'bilirubinTotal', label: 'BiliT', group: 'Hepático', format: 'trim2', patterns: [rx(String.raw`\bBILIRRUBINA\s+TOTAL\b`, units.mgDl)] },
  { id: 'bilirubinDirect', label: 'BiliD', group: 'Hepático', format: 'trim2', patterns: [rx(String.raw`\bBILIRRUBINA\s+DIRECTA\b`, units.mgDl)] },
  { id: 'bilirubinIndirect', label: 'BiliI', group: 'Hepático', format: 'trim2', patterns: [rx(String.raw`\bBILIRRUBINA\s+INDIRECTA\b`, units.mgDl)] },
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
  { id: 'ggt', label: 'GGT', group: 'Hepático', format: 'integer', patterns: [rx(String.raw`\b(?:GAM(?:M)?A[\s-]*GLUTAMIL(?:[\s-]*(?:TRANSPEPTIDASA|TRANSFERASA))?|GGT)\b(?:\s*\(GGT\))?`, units.uL)] },
  { id: 'albumin', label: 'Alb', group: 'Hepático', format: 'fixed1', patterns: [rx(String.raw`\bALB[ÚU]MINA(?:\s+SANGRE)?\b`, units.gDl)] },
  { id: 'proteins', label: 'Prot', group: 'Hepático', format: 'fixed1', patterns: [rx(String.raw`\bPROTE[IÍ]NAS(?:\s+TOTALES)?\b`, units.gDl)] },

  // Lípidos y nutrición
  { id: 'totalCholesterol', label: 'ColT', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\bCOLESTEROL\s+TOTAL\b`, units.mgDl)] },
  { id: 'hdl', label: 'HDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?HDL\b`, units.mgDl)] },
  { id: 'ldl', label: 'LDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?LDL\b`, units.mgDl)] },
  { id: 'vldl', label: 'VLDL', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:COLESTEROL\s+)?VLDL\b`, units.mgDl)] },
  { id: 'triglycerides', label: 'TGC', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\bTRIGLIC[ÉE]RIDOS\b`, units.mgDl)] },
  { id: 'hba1c', label: 'HbA1c', group: 'Lípidos y nutrición', format: 'fixed1', suffix: '%', patterns: [rx(String.raw`\b(?:HEMOGLOBINA\s+GLICADA(?:\s*\(HBA1C\))?|HBA1C)\b`, units.percent)] },
  { id: 'vitaminB12', label: 'VitB12', group: 'Lípidos y nutrición', format: 'integer', patterns: [rx(String.raw`\b(?:VITAMINA\s+B\s*-?\s*12|B12)\b`, String.raw`(?:${units.pgMl}|pmol\s*\/?\s*[lL]\b)`)] },
  { id: 'folate', label: 'Folato', group: 'Lípidos y nutrición', format: 'trim1', patterns: [rx(String.raw`\b(?:[ÁA]CIDO\s+F[ÓO]LICO|FOLATO)\b`, String.raw`(?:${units.ngMl}|${units.nmolL})`)] },
  { id: 'prealbumin', label: 'Prealb', group: 'Lípidos y nutrición', format: 'trim1', patterns: [rx(String.raw`\bPREALB[ÚU]MINA\b`, units.mgDl)] },

  // Inmunología y proteínas
  { id: 'igg', label: 'IgG', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+G|IGG)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'iga', label: 'IgA', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+A|IGA)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'igm', label: 'IgM', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+M|IGM)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'ige', label: 'IgE', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+E|IGE)(?:\s+TOTAL)?\b`, String.raw`(?:(?:k?U|k?UI|k?IU)\s*\/?\s*[lL]|${units.uiMl}|${units.mgDl})\b`)] },
  { id: 'igg1', label: 'IgG1', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+G\s*1|IGG\s*1)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'igg2', label: 'IgG2', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+G\s*2|IGG\s*2)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'igg3', label: 'IgG3', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+G\s*3|IGG\s*3)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'igg4', label: 'IgG4', group: 'Inmunología y proteínas', format: 'trim1', patterns: [rx(String.raw`\b(?:INMUNOGLOBULINA\s+G\s*4|IGG\s*4)\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },

  // Inflamación
  { id: 'crp', label: 'PCR', group: 'Inflamación', format: 'trim1', patterns: [rx(String.raw`\b(?:PROTE[IÍ]NA\s+C\s+REACTIVA(?:\s*\(CRP\))?|PCR)\b`, String.raw`mg\s*\/?\s*[lL]\b`)] },
  { id: 'procalcitonin', label: 'Proca', group: 'Inflamación', format: 'trim2', patterns: [rx(String.raw`\bPROCALCITONINA\b`, units.ngMl)] },
  { id: 'esr', label: 'VHS', group: 'Inflamación', format: 'integer', patterns: [rx(String.raw`\b(?:VHS|VELOCIDAD\s+DE\s+SEDIMENTACI[ÓO]N)\b`, String.raw`mm\s*\/?\s*h(?:r|ora)?\b`)] },

  // Cardíaco y coagulación
  { id: 'troponin', label: 'Tropo', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\bTROPONINA(?:\s+[TI])?\b`, String.raw`ng\s*\/?\s*[lL]\b`)] },
  { id: 'dDimer', label: 'DD', group: 'Cardíaco y coagulación', format: 'raw', patterns: [rx(String.raw`\b(?:D[IÍ]MERO\s+D|D-D[IÍ]MERO)\b`)] },
  { id: 'proBnp', label: 'ProBNP', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:NT\s*-?\s*PROBNP|PROBNP|PRO\s*P[ÉE]PTIDO\s+NATRIUR[ÉE]TICO\s+TIPO\s+B(?:\s*\(NTPROBNP\))?)\b`, units.pgMl)] },
  { id: 'ckTotal', label: 'CK', group: 'Cardíaco y coagulación', format: 'integer', patterns: [rx(String.raw`\b(?:CREATIN(?:A)?\s*(?:QUINASA|KINASA)(?:\s+TOTAL)?|CK\s+TOTAL|CK)\b`, units.enzyme)] },
  { id: 'ckMb', label: 'CK-MB', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:CREATIN(?:A)?\s*(?:QUINASA|KINASA)\s+MB|CK\s*-?\s*MB)\b`, String.raw`(?:${units.enzyme}|${units.ngMl})`)] },
  { id: 'prothrombinTime', label: 'TP', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:TIEMPO\s+DE\s+PROTROMBINA|TP)\b`, units.seconds)] },
  { id: 'prothrombinActivity', label: 'Act. prot.', group: 'Cardíaco y coagulación', format: 'integer', suffix: '%', patterns: [rx(String.raw`\b(?:ACTIVIDAD\s+DE\s+PROTROMBINA|PROTROMBINA)\b`, units.percent)] },
  { id: 'aptt', label: 'TTPK', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:TIEMPO\s+(?:PARCIAL\s+)?DE\s+TROMBOPLASTINA|TTPK|TTPA|APTT)\b`, units.seconds)] },
  { id: 'fibrinogen', label: 'Fibrinógeno', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\bFIBRIN[ÓO]GENO\b`, String.raw`(?:${units.mgDl}|${units.gL})`)] },
  { id: 'inr', label: 'INR', group: 'Cardíaco y coagulación', format: 'trim1', patterns: [rx(String.raw`\b(?:[ÍI]NDICE\s+INTERNACIONAL\s+NORMALIZADO(?:\s*\(INR\))?|INR)\b`)] },

  // Endocrino
  { id: 'tsh', label: 'TSH', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`(?:\bHORMONA\s+TIROESTIMULANTE\s*\(TSH\)|\bTSH\b\)?)`, units.uiMl)] },
  {
    id: 'totalT3', label: 'T3', group: 'Endocrino', format: 'raw', patterns: [
      rx(String.raw`\b(?:TRIYODOTIRONINA|TRIIODOTIRONINA)\b(?!\s+LIBRE)(?:\s+TOTAL)?(?:\s*\(T3\))?`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`),
      rx(String.raw`\bT3\s+TOTAL\b`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`),
      rx(String.raw`\bT3\b(?!\s*(?:LIBRE|L\b))`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`),
    ],
  },
  {
    id: 'freeT3', label: 'T3L', group: 'Endocrino', format: 'raw', patterns: [
      rx(String.raw`\b(?:TRIYODOTIRONINA|TRIIODOTIRONINA)\s+LIBRE(?:\s*\((?:T3L|FT3)\))?`, String.raw`(?:${units.pgMl}|pg\s*\/?\s*d[lL]\b|${units.pmolL})`),
      rx(String.raw`\b(?:T3\s+LIBRE|T3L|FT3)\b`, String.raw`(?:${units.pgMl}|pg\s*\/?\s*d[lL]\b|${units.pmolL})`),
    ],
  },
  {
    id: 'freeT4', label: 'T4L', group: 'Endocrino', format: 'raw', patterns: [
      rx(String.raw`\b(?:TIROXINA|TETRAIODOTIRONINA|TETRAIDOTIRONINA)\s+LIBRE(?:\s*\((?:T4L|FT4)\))?`, String.raw`(?:${units.ngDl}|${units.pmolL})`),
      rx(String.raw`\b(?:T4\s+LIBRE|T4L|FT4)\b`, String.raw`(?:${units.ngDl}|${units.pmolL})`),
    ],
  },
  {
    id: 'totalT4', label: 'T4T', group: 'Endocrino', format: 'raw', patterns: [
      rx(String.raw`\b(?:TIROXINA|TETRAIODOTIRONINA|TETRAIDOTIRONINA)\s+TOTAL(?:\s*\(T4\))?`, String.raw`(?:${units.ugDl}|${units.nmolL})`),
      rx(String.raw`\bT4\s+TOTAL\b`, String.raw`(?:${units.ugDl}|${units.nmolL})`),
      rx(String.raw`\bT4\b(?!\s*(?:LIBRE|L\b))`, String.raw`(?:${units.ugDl}|${units.nmolL})`),
    ],
  },
  { id: 'thyroglobulin', label: 'Tg', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`\bTIROGLOBULINA\b`, String.raw`(?:${units.ngMl}|${units.ugL})`)] },
  { id: 'antiThyroglobulin', label: 'Anti-Tg', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`\b(?:(?:ANTICUERPOS?|AC)\s+)?ANTI\s*-?\s*TIROGLOBULINA(?:\s*\(ANTI\s*-?\s*TG\))?`, thyroidAntibodyUnits)] },
  { id: 'antiTpo', label: 'Anti-TPO', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`\b(?:(?:ANTICUERPOS?|AC)\s+)?ANTI\s*-?\s*(?:PEROXIDASA\s+TIROIDEA|TPO)(?:\s*\(ANTI\s*-?\s*TPO\))?`, thyroidAntibodyUnits)] },
  { id: 'trab', label: 'TRAb', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`\b(?:TRAB|ANTICUERPOS?\s+(?:ANTI\s*)?RECEPTORES?\s+(?:DE\s+)?(?:TSH|TIROTROPINA))(?:\s*\(TRAB\))?`, thyroidAntibodyUnits)] },
  { id: 'bhcg', label: 'BHCG', group: 'Endocrino', format: 'raw', patterns: [rx(String.raw`(?:\bBETA\s+GONADOTROFINA\s+CORI[ÓO]NICA\s*\(BHCG\)(?:\s+HUMANA)?|\bBETA[-\s]?HCG\b|\bBHCG\b)`, units.mUiMl)] },
  { id: 'testosterone', label: 'Testo', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bTESTOSTERONA(?:\s+TOTAL)?\b`, units.ngMl)] },
  { id: 'lh', label: 'LH', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?:\bHORMONA\s+LUTEINIZANTE\s*\(LH\)|\bLH\b\)?)`, units.mUiMl)] },
  { id: 'fsh', label: 'FSH', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?:\bHORMONA\s+FOL[ÍI]CULO\s*ESTIMULANTE\s*\(FSH\)|\bFSH\b\)?)`, units.mUiMl)] },
  { id: 'prolactin', label: 'PRL', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bPROLACTINA(?:\s*\(PRL\))?\b`, units.ngMl)] },
  { id: 'estradiol', label: 'E2', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bESTRADIOL(?:\s*\(E2\))?\b`, String.raw`pg\s*\/?\s*m[lL]\b`)] },
  { id: 'progesterone', label: 'Prog', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?<!17OH\s)(?<!17-OH\s)(?<!17\sOH\s)\bPROGESTERONA\b`, String.raw`(?:${units.ngMl}|${units.nmolL})`)] },
  { id: 'insulin', label: 'Insulina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bINSULINA(?:\s+BASAL)?\b`, String.raw`(?:${units.uiMl}|${units.mUiL})`)] },
  { id: 'cPeptide', label: 'Péptido C', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bP[ÉE]PTIDO\s+C\b`, String.raw`(?:${units.ngMl}|${units.nmolL})`)] },
  { id: 'shbg', label: 'SHBG', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:SHBG|GLOBULINA\s+FIJADORA\s+DE\s+HORMONAS\s+SEXUALES)\b`, units.nmolL)] },
  { id: 'dheas', label: 'DHEAS', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:DHEA\s*-?\s*S|DEHIDROEPIANDROSTERONA\s+SULFATO|SULFATO\s+DE\s+DEHIDROEPIANDROSTERONA)\b`, String.raw`(?:${units.ugDl}|${units.umolL})`)] },
  { id: 'dhea', label: 'DHEA', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:DHEA|DEHIDROEPIANDROSTERONA)\b`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`)] },
  { id: 'androstenedione', label: 'Androst.', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bANDROSTENEDIONA\b`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`)] },
  { id: 'urinaryCortisol24h', label: 'CLU 24h', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCORTISOL\s+(?:LIBRE\s+)?(?:URINARIO|EN\s+ORINA)(?:\s+(?:DE\s+)?24\s*H(?:ORAS?)?)?\b`, urinaryCortisolUnits)] },
  { id: 'postDexamethasoneCortisol', label: 'Cort post-Dexa', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCORTISOL\s+(?:POST|TRAS)\s+(?:DEXA(?:METASONA)?|SUPRESI[ÓO]N\s+CON\s+DEXAMETASONA)\b`, cortisolUnits)] },
  { id: 'lateNightSalivaryCortisol', label: 'CSN', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCORTISOL\s+SALIVAL(?:\s+(?:NOCTURNO|DE\s+MEDIANOCHE|23\s*H))?\b`, String.raw`(?:${cortisolUnits}|${units.ngMl}|${units.ugL})`)] },
  { id: 'cortisol', label: 'Cortisol', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCORTISOL\b(?!\s+(?:(?:LIBRE\s+)?(?:URINARIO|EN\s+ORINA)|SALIVAL|POST|TRAS|\d+\s*MIN))`, cortisolUnits)] },
  {
    id: 'acth', label: 'ACTH', group: 'Endocrino', format: 'trim1', patterns: [
      rx(String.raw`\bACTH\b`, units.pgMl),
      rx(String.raw`\b(?:(?:HORMONA\s+)?(?:ADRENO|ADENO)CORTICOTROFINA|(?:HORMONA\s+)?ADRENOCORTICOTR[ÓO]PICA|CORTICOTROPINA)(?:\s*\(ACTH\))?`, units.pgMl),
    ],
  },
  {
    id: 'igf1', label: 'IGF-1', group: 'Endocrino', format: 'integer', patterns: [
      rx(String.raw`\b(?:IGF\s*-?\s*(?:1|I)|SOMATOMEDINA\s+C)\b`, units.ngMl),
      rx(String.raw`\bFACTOR\s+(?:DE\s+)?CRECIMIENTO\s+(?:INSUL[IÍ]NICO|INSULINO\s*-?\s*S[IÍ]MIL|SIMILAR\s+A\s+LA\s+INSULINA)(?:\s+TIPO)?\s+(?:1|I)(?:\s*\(IGF\s*-?\s*(?:1|I)\))?`, units.ngMl),
    ],
  },
  { id: 'growthHormone', label: 'GH', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`(?:\bHORMONA\s+DE\s+CRECIMIENTO\b(?:\s*\(GH\))?|\bGH\b)`, units.ngMl)] },
  { id: 'calcitonin', label: 'Calcitonina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bCALCITONINA\b`, String.raw`(?:${units.pgMl}|${units.ngL})`)] },
  {
    id: 'ohp17', label: '17OHP', group: 'Endocrino', format: 'trim2', patterns: [
      new RegExp(String.raw`\b${ohp17Name}${FLAGS}${VALUE}(?:\s+[<>≤≥]?\s*-?\d+(?:[.,]\d+)?){0,6}\s*(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`, 'i'),
      rx(String.raw`\b${ohp17Name}\b`, String.raw`(?:${units.ngMl}|${units.ngDl}|${units.nmolL})`),
    ],
  },
  { id: 'metanephrine', label: 'Metanefrina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:METANEFRINAS?|METANEPHRINES?)\b(?:\s+(?:LIBRES?|FREE|PLASM[ÁA]TICAS?|PLASMA|URINARIAS?|URINE))?`, metanephrineUnits)] },
  { id: 'normetanephrine', label: 'Normetanefrina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:NORMETANEFRINAS?|NORMETANEPHRINES?)\b(?:\s+(?:LIBRES?|FREE|PLASM[ÁA]TICAS?|PLASMA|URINARIAS?|URINE))?`, metanephrineUnits)] },
  { id: 'methoxytyramine3', label: '3-MT', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\b(?:3\s*-?\s*(?:METOXITIRAMINA|METHOXYTYRAMINE)|3MT)\b`, metanephrineUnits)] },
  { id: 'renin', label: 'Renina', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bRENINA(?:\s+DIRECTA)?\b`, units.uiMl)] },
  { id: 'aldosterone', label: 'Aldo', group: 'Endocrino', format: 'trim2', patterns: [rx(String.raw`\bALDOSTERONA\b`, String.raw`(?:pg\s*\/?\s*m[lL]|ng\s*\/?\s*d[lL])\b`)] },
  { id: 'pth', label: 'PTH', group: 'Endocrino', format: 'trim1', patterns: [rx(String.raw`\b(?:PARATOHORMONA(?:\s+INTACTA)?(?:\s*\(PTH\))?|PTH)\b`, units.pgMl)] },
  {
    id: 'vitaminD', label: 'VitD', group: 'Endocrino', format: 'trim1', patterns: [
      rx(String.raw`\b(?:25\s*-?\s*(?:OH|HIDROXI)\s*VITAMINA\s+D|VITAMINA\s+D(?:\s+TOTAL)?(?:\s*\(?\s*25\s*-?\s*(?:OH|HIDROXI)\s*\)?)?)\b`, String.raw`(?:${units.ngMl}|${units.nmolL})`),
    ],
  },
];

const groupOrder = [
  'Hemograma',
  'Perfil de hierro',
  'Renal y metabólico',
  'Renal y urinario',
  'Hepático',
  'Lípidos y nutrición',
  'Inmunología y proteínas',
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

export function extractReceptionDate(sourceText) {
  const text = normalizeText(sourceText);
  if (!text) return null;

  const dateToken = String.raw`(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})`;
  const formatDate = (date) => {
    const parts = date.split(/[\/.\-]/);
    const isoOrder = parts[0].length === 4;
    const day = Number(isoOrder ? parts[2] : parts[0]);
    const month = Number(parts[1]);
    const fullYear = Number(isoOrder ? parts[0] : parts[2]);
    const year = fullYear < 100 ? 2000 + fullYear : fullYear;
    const validDate = new Date(Date.UTC(year, month - 1, day));
    if (
      validDate.getUTCFullYear() !== year
      || validDate.getUTCMonth() !== month - 1
      || validDate.getUTCDate() !== day
    ) return null;
    return {
      display: `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${String(year).slice(-2)}`,
      key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      year,
    };
  };
  const labelsByPriority = [
    String.raw`FECHA(?:\s*\/\s*HORA|\s+Y\s+HORA)?\s+(?:DE\s+)?(?:TOMA|OBTENCI[ÓO]N|EXTRACCI[ÓO]N|RECOLECCI[ÓO]N)(?:\s+DE(?:\s+LA)?)?\s+MUESTRA`,
    String.raw`FECHA(?:\s*\/\s*HORA|\s+Y\s+HORA)?\s+(?:DE\s+)?RECEPCI[ÓO]N(?:\s+DE(?:\s+LA)?\s+MUESTRA)?`,
    String.raw`RECEPCI[ÓO]N\s+(?:DE(?:\s+LA)?\s+)?MUESTRA`,
  ];

  let date = null;
  for (const label of labelsByPriority) {
    const afterLabel = new RegExp(
      String.raw`${label}(?:\s*[:;|–—-]\s*|\s+)(?:MUESTRA\s*[:;|–—-]?\s*)?[^\d]{0,50}${dateToken}\b`,
      'i',
    ).exec(text);
    if (afterLabel) {
      date = afterLabel[1];
      break;
    }
  }
  if (date) return formatDate(date)?.display ?? null;

  // El PDF del HHHA copia primero todas las etiquetas de la tabla y después
  // sus valores. En ese formato la fecha ya no queda junto a su etiqueta.
  const hasFlattenedHisHeader = /FECHA\s*\/\s*HORA\s+DE\s+T\.?\s*MUESTRA/i.test(text)
    && /FECHA\s*\/\s*HORA\s+DE\s+RECEPCI[ÓO]N\s+MUESTRA/i.test(text)
    && /N(?:[º°]|O\.?|RO\.?|[ÚU]MERO)?\s*PETICI[ÓO]N\s*:/i.test(text);
  if (!hasFlattenedHisHeader) return null;

  const header = text.slice(0, 2200);
  const petitionMatch = /N(?:[º°]|O\.?|RO\.?|[ÚU]MERO)?\s*PETICI[ÓO]N\s*:\s*(\d{2})(\d{2})(\d{2})\d{2,}/i.exec(header);
  const petitionDate = petitionMatch
    ? formatDate(`${petitionMatch[3]}/${petitionMatch[2]}/20${petitionMatch[1]}`)
    : null;

  const candidates = [...header.matchAll(new RegExp(dateToken, 'g'))]
    .map((match) => formatDate(match[1]))
    .filter(Boolean);
  const episodeCandidates = petitionDate
    ? candidates.filter((candidate) => Math.abs(candidate.year - petitionDate.year) <= 1)
    : candidates;
  if (!episodeCandidates.length) return null;

  const counts = new Map();
  for (const candidate of episodeCandidates) {
    const current = counts.get(candidate.key) ?? { ...candidate, count: 0 };
    current.count += 1;
    counts.set(candidate.key, current);
  }
  const ranked = [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (petitionDate && a.key === petitionDate.key) return -1;
    if (petitionDate && b.key === petitionDate.key) return 1;
    return 0;
  });
  return ranked[0]?.display ?? null;
}

function formatValue(token, format) {
  const textValue = String(token).trim().replace(/\s+/g, ' ');
  if (format === 'text') {
    const key = textValue.toUpperCase();
    if (/^(?:NEGATIV[OA]S?|AUSENTE(?:S)?|NO SE OBSERVAN)$/.test(key)) return 'Neg';
    if (/^(?:POSITIV[OA]S?|PRESENTE(?:S)?)$/.test(key)) return 'Pos';
    if (/^TRAZAS?$/.test(key)) return 'Trazas';
    if (/^ESCAS[OA]S?$/.test(key)) return 'Escasos';
    if (/^MODERAD[OA]S?$/.test(key)) return 'Moderados';
    if (/^ABUNDANTE(?:S)?$/.test(key)) return 'Abundantes';
    if (key === 'NORMAL') return 'Normal';
    return textValue;
  }

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

function appendSynacthenResults(text, results) {
  if (!/\b(?:SYNACTHEN|COSYNTROPINA|TETRACOS[ÁA]CTID[OA])\b/i.test(text)) return;

  const points = [
    {
      id: 'synacthen0',
      label: "0'",
      patterns: [
        rx(String.raw`\bCORTISOL\s*\(?\s*(?:BASAL\b|0\s*(?:MIN(?:UTOS?)?\b|'))\s*\)?`, cortisolUnits),
        rx(String.raw`\bCORTISOL\s+PRE\s+SYNACTHEN\b`, cortisolUnits),
        rx(String.raw`\b(?:BASAL|0\s*MIN(?:UTOS?)?)\s*[-:]?\s*CORTISOL\b`, cortisolUnits),
      ],
    },
    {
      id: 'synacthen30',
      label: "30'",
      patterns: [
        rx(String.raw`\bCORTISOL\s*\(?\s*(?:A\s+LOS\s+)?30\s*(?:MIN(?:UTOS?)?\b|')\s*\)?`, cortisolUnits),
        rx(String.raw`\bCORTISOL\s+POST\s+SYNACTHEN\s*\(?\s*30\s*(?:MIN(?:UTOS?)?\b|')\s*\)?`, cortisolUnits),
      ],
    },
    {
      id: 'synacthen60',
      label: "60'",
      patterns: [
        rx(String.raw`\bCORTISOL\s*\(?\s*(?:A\s+LOS\s+)?60\s*(?:MIN(?:UTOS?)?\b|')\s*\)?`, cortisolUnits),
        rx(String.raw`\bCORTISOL\s+POST\s+SYNACTHEN\s*\(?\s*60\s*(?:MIN(?:UTOS?)?\b|')\s*\)?`, cortisolUnits),
      ],
    },
  ];

  let foundPoint = false;
  for (const point of points) {
    const token = findValue(text, point.patterns);
    if (token === null) continue;
    foundPoint = true;
    results.push({
      id: point.id,
      label: point.label,
      group: 'Endocrino',
      value: formatValue(token, 'trim2'),
      rawValue: token,
    });
  }

  if (foundPoint) {
    const genericCortisol = results.findIndex((result) => result.id === 'cortisol');
    if (genericCortisol !== -1) results.splice(genericCortisol, 1);
  }
}

function appendUrinalysisResults(text, results) {
  if (!/\b(?:ORINA\s+COMPLETA|EXAMEN\s+(?:GENERAL\s+)?DE\s+ORINA|UROAN[ÁA]LISIS|SEDIMENTO\s+URINARIO|F[IÍ]SICO\s*[- ]?QU[IÍ]MICO\s+(?:DE\s+)?ORINA)\b/i.test(text)) return;

  const fields = [
    { id: 'urineColor', label: 'Color', format: 'text', patterns: [qrx(String.raw`\bCOLOR\b`, String.raw`(?:AMARILLO(?:\s+(?:CLARO|OSCURO))?|INCOLORO|[ÁA]MBAR|ROJIZO|CAF[ÉE])`)] },
    { id: 'urineAppearance', label: 'Aspecto', format: 'text', patterns: [qrx(String.raw`\bASPECTO\b`, String.raw`(?:TRANSPARENTE|CLARO|LIGERAMENTE\s+TURBIO|TURBIO)`)] },
    { id: 'urineDensity', label: 'Dens', format: 'raw', patterns: [rx(String.raw`\b(?:DENSIDAD|GRAVEDAD\s+ESPEC[ÍI]FICA)\b`)] },
    { id: 'urinePh', label: 'pH', format: 'trim1', patterns: [rx(String.raw`\bpH\b`)] },
    { id: 'urineProtein', label: 'Prot orina', format: 'text', patterns: [qrx(String.raw`\bPROTE[IÍ]NAS?\b`, qualitativeValue), rx(String.raw`\bPROTE[IÍ]NAS?\b`, String.raw`(?:${units.mgDl}|${units.mgL})`)] },
    { id: 'urineGlucose', label: 'Gluc orina', format: 'text', patterns: [qrx(String.raw`\bGLUCOSA\b`, qualitativeValue), rx(String.raw`\bGLUCOSA\b`, units.mgDl)] },
    { id: 'urineKetones', label: 'Cetonas', format: 'text', patterns: [qrx(String.raw`\b(?:CETONAS|CUERPOS\s+CET[ÓO]NICOS)\b`, qualitativeValue), rx(String.raw`\b(?:CETONAS|CUERPOS\s+CET[ÓO]NICOS)\b`, units.mgDl)] },
    { id: 'urineBilirubin', label: 'Bili orina', format: 'text', patterns: [qrx(String.raw`\bBILIRRUBINA\b`, qualitativeValue)] },
    { id: 'urineUrobilinogen', label: 'Urobilinógeno', format: 'text', patterns: [qrx(String.raw`\bUROBILIN[ÓO]GENO\b`, qualitativeValue), rx(String.raw`\bUROBILIN[ÓO]GENO\b`, units.mgDl)] },
    { id: 'urineBlood', label: 'Sangre', format: 'text', patterns: [qrx(String.raw`\b(?:SANGRE|HEMOGLOBINA)\b`, qualitativeValue)] },
    { id: 'urineNitrite', label: 'Nitritos', format: 'text', patterns: [qrx(String.raw`\bNITRITOS?\b`, qualitativeValue)] },
    { id: 'urineLeukocyteEsterase', label: 'Esterasa L', format: 'text', patterns: [qrx(String.raw`\bESTERASA\s+LEUCOCITARIA\b`, qualitativeValue)] },
    { id: 'urineLeukocytes', label: 'Leuco orina', format: 'text', patterns: [new RegExp(String.raw`\bLEUCOCITOS\b${FLAGS}${urineRangeValue}\s*${urineFieldUnit}`, 'i'), qrx(String.raw`\bLEUCOCITOS\b`, qualitativeValue)] },
    { id: 'urineErythrocytes', label: 'Eritro orina', format: 'text', patterns: [new RegExp(String.raw`\b(?:ERITROCITOS|HEMAT[IÍ]ES)\b${FLAGS}${urineRangeValue}\s*${urineFieldUnit}`, 'i'), qrx(String.raw`\b(?:ERITROCITOS|HEMAT[IÍ]ES)\b`, qualitativeValue)] },
    { id: 'urineBacteria', label: 'Bacterias', format: 'text', patterns: [qrx(String.raw`\bBACTERIAS?\b`, qualitativeValue)] },
    { id: 'urineCasts', label: 'Cilindros', format: 'text', patterns: [new RegExp(String.raw`\bCILINDROS?\b${FLAGS}${urineRangeValue}\s*${urineFieldUnit}`, 'i'), qrx(String.raw`\bCILINDROS?\b`, qualitativeValue)] },
    { id: 'urineCrystals', label: 'Cristales', format: 'text', patterns: [qrx(String.raw`\bCRISTALES?\b`, qualitativeValue)] },
  ];

  for (const field of fields) {
    const token = findValue(text, field.patterns);
    if (token === null) continue;
    results.push({
      id: field.id,
      label: field.label,
      group: 'Renal y urinario',
      value: formatValue(token, field.format),
      rawValue: token,
    });
  }
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

  appendSynacthenResults(text, results);
  appendUrinalysisResults(text, results);

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

function compactItems(results, showExamColons = true) {
  const byId = new Map(results.map((result) => [result.id, result]));
  const consumed = new Set();
  const items = [];
  const labeledValue = (label, value) => `${label}${showExamColons ? ':' : ''} ${value}`;

  const creatinine = byId.get('creatinine');
  const egfr = byId.get('egfr');
  if (creatinine) {
    const egfrText = egfr ? ` (${labeledValue('VFG', egfr.value)})` : '';
    items.push({ group: creatinine.group, text: `${labeledValue('Crea', creatinine.value)}${egfrText}` });
    consumed.add('creatinine');
    if (egfr) consumed.add('egfr');
  }

  const sodium = byId.get('sodium');
  const potassium = byId.get('potassium');
  const chloride = byId.get('chloride');
  if (sodium && potassium && chloride) {
    items.push({
      group: sodium.group,
      text: labeledValue('ELP', `${sodium.value}/${potassium.value}/${chloride.value}`),
    });
    consumed.add('sodium');
    consumed.add('potassium');
    consumed.add('chloride');
  }

  for (const result of results) {
    if (consumed.has(result.id)) continue;

    if (['synacthen0', 'synacthen30', 'synacthen60'].includes(result.id)) {
      const synacthenPoints = [
        byId.get('synacthen0'),
        byId.get('synacthen30'),
        byId.get('synacthen60'),
      ].filter(Boolean);
      items.push({
        group: result.group,
        text: labeledValue(
          'Synacthen',
          synacthenPoints.map((point) => labeledValue(point.label, point.value)).join(', '),
        ),
      });
      for (const point of synacthenPoints) consumed.add(point.id);
      continue;
    }

    if (result.id === 'wbc' && byId.has('anc')) {
      items.push({
        group: result.group,
        text: `${labeledValue('GB', result.value)} (${labeledValue('RAN', byId.get('anc').value)})`,
      });
      consumed.add('anc');
      continue;
    }

    items.push({ group: result.group, text: labeledValue(result.label, result.value) });
  }

  return items;
}

export function formatClinicalSummary(results, mode = 'grouped', options = {}) {
  if (!results.length) return '';
  const showExamColons = options.showExamColons ?? true;
  const items = compactItems(results, showExamColons);

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

export function extractAndFormat(text, mode = 'grouped', options = {}) {
  const results = extractLabs(text);
  const receptionDate = extractReceptionDate(text);
  const clinicalSummary = formatClinicalSummary(results, mode, options);
  const summary = [receptionDate ? `Exs ${receptionDate}` : '', clinicalSummary]
    .filter(Boolean)
    .join('\n');
  return { results, receptionDate, summary };
}
