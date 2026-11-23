// mammoth e jszip são carregados sob demanda (só quando o admin importa um arquivo)
const carregarMammoth = async () => (await import('mammoth')).default;
const carregarJSZip = async () => (await import('jszip')).default;

/**
 * Motor Inteligente (IA Semântica & Estrutural) de Importação de Formulários e Questionários
 * Suporta:
 * 1. Arquivos PDF (.pdf)
 * 2. Apresentações PowerPoint (.pptx, .ppt)
 * 3. Documentos Word (.docx, .doc) — incluindo tabelas, grades de avaliação e caixas de seleção nativas
 * 4. Planilhas (.xlsx, .csv)
 * 5. Arquivos de texto e JSON (.txt, .json, .md)
 * 6. Texto colado diretamente ou link do Google Forms
 */

export async function parseAnyFile(file) {
  const name = (file?.name || '').toLowerCase();

  if (name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromDocxBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const docxText = await extractTextFromDocxBuffer(arrayBuffer);
      if (docxText && docxText.trim().length > 20) {
        return parseTextToQuestions(docxText, file.name);
      }
    } catch (e) {}
    const text = extractReadableTextFromBinaryBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.pptx')) {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPptxBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.ppt')) {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const pptxText = await extractTextFromPptxBuffer(arrayBuffer);
      if (pptxText && pptxText.trim().length > 20) {
        return parseTextToQuestions(pptxText, file.name);
      }
    } catch (e) {}
    const text = extractReadableTextFromBinaryBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPdfBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.xlsx')) {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromXlsxBuffer(arrayBuffer);
    return parseTextToQuestions(text, file.name);
  }

  if (name.endsWith('.csv')) {
    const csvText = await file.text();
    return parseCsvToQuestions(csvText);
  }

  const rawText = await file.text();
  return parseJsonOrText(rawText, file.name);
}

// Extrai SOMENTE o texto de qualquer arquivo suportado (usado pela IA)
export async function extrairTextoDeArquivo(file) {
  const name = (file?.name || '').toLowerCase();
  const buf = () => file.arrayBuffer();
  if (name.endsWith('.docx')) return extractTextFromDocxBuffer(await buf());
  if (name.endsWith('.pptx')) return extractTextFromPptxBuffer(await buf());
  if (name.endsWith('.pdf')) return extractTextFromPdfBuffer(await buf());
  if (name.endsWith('.xlsx')) return extractTextFromXlsxBuffer(await buf());
  if (name.endsWith('.doc') || name.endsWith('.ppt')) {
    const b = await buf();
    try {
      const t = name.endsWith('.doc') ? await extractTextFromDocxBuffer(b) : await extractTextFromPptxBuffer(b);
      if (t && t.trim().length > 20) return t;
    } catch (e) {}
    return extractReadableTextFromBinaryBuffer(b);
  }
  return file.text();
}

export async function parseDocxFile(file) {
  return parseAnyFile(file);
}

/**
 * Extrai texto estruturado de .DOCX preservando parágrafos, listas, checkboxes nativos do Word e Tabelas (| col1 | col2 |)
 */
async function extractTextFromDocxBuffer(arrayBuffer) {
  // 1. Tenta extrair direto do XML word/document.xml via JSZip para preservar checkboxes nativos (<w:checkBox>, <w14:checkbox>, <w:sym>) e tabelas (<w:tbl>)
  try {
    const zip = await (await carregarJSZip()).loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      const xmlStr = await docXmlFile.async('string');
      const parsedFromXml = parseWordDocumentXml(xmlStr);
      if (parsedFromXml && parsedFromXml.trim().length > 20) {
        return parsedFromXml;
      }
    }
  } catch (e) {
    // Continua para o Mammoth caso não seja um zip padrão
  }

  // 2. Fallback para Mammoth convertToHtml (preservando <table>, <tr>, <td>, <p>, <li>)
  try {
    const htmlResult = await (await carregarMammoth()).convertToHtml({ arrayBuffer });
    if (htmlResult.value && htmlResult.value.trim().length > 0) {
      return convertHtmlToStructuredText(htmlResult.value);
    }
  } catch (e) {}

  const rawResult = await (await carregarMammoth()).extractRawText({ arrayBuffer });
  return rawResult.value || '';
}

function parseWordDocumentXml(xmlStr) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  const body = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.documentElement;
  if (!body) return '';

  const outputLines = [];

  const extractParagraphText = (pNode) => {
    let text = '';
    const walk = (node) => {
      if (!node) return;
      const nodeName = node.nodeName || '';
      if (nodeName === 'w:t') {
        text += node.textContent || '';
      } else if (nodeName === 'w:tab') {
        text += '   ';
      } else if (nodeName === 'w:br' || nodeName === 'w:cr') {
        text += '\n';
      } else if (
        nodeName === 'w:checkBox' ||
        nodeName === 'w14:checkbox' ||
        (nodeName === 'w:fldSimple' && /FORMCHECKBOX/i.test(node.getAttribute?.('w:instr') || ''))
      ) {
        text += '☐ ';
      } else if (nodeName === 'w:instrText' && /FORMCHECKBOX/i.test(node.textContent || '')) {
        text += '☐ ';
      } else if (nodeName === 'w:sym') {
        const charCode = (node.getAttribute?.('w:char') || '').toUpperCase();
        // Wingdings / Webdings códigos clássicos de checkbox
        if (['F06F', 'F0FE', 'F0A8', 'F071', 'F072', '00A8', '006F'].includes(charCode)) {
          text += '☐ ';
        }
      } else if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };
    walk(pNode);
    return text.replace(/\s+/g, ' ').trim();
  };

  for (let i = 0; i < body.childNodes.length; i++) {
    const child = body.childNodes[i];
    const name = child.nodeName || '';

    if (name === 'w:p') {
      const pText = extractParagraphText(child);
      if (pText) outputLines.push(pText);
    } else if (name === 'w:tbl') {
      const rows = child.getElementsByTagName('w:tr');
      for (let r = 0; r < rows.length; r++) {
        const tr = rows[r];
        // Garante que estamos pegando apenas células diretas desta linha
        const cells = [];
        for (let c = 0; c < tr.childNodes.length; c++) {
          if (tr.childNodes[c].nodeName === 'w:tc') {
            const tc = tr.childNodes[c];
            const pNodes = tc.getElementsByTagName('w:p');
            const cellTexts = [];
            for (let p = 0; p < pNodes.length; p++) {
              const t = extractParagraphText(pNodes[p]);
              if (t) cellTexts.push(t);
            }
            const cellStr = cellTexts.join(' ').trim();
            cells.push(cellStr || (c > 0 ? '☐' : ''));
          }
        }
        if (cells.some(c => c && c !== '☐')) {
          outputLines.push(`| ${cells.join(' | ')} |`);
        }
      }
    }
  }

  return outputLines.join('\n');
}

function convertHtmlToStructuredText(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const lines = [];

  const walk = (node) => {
    if (!node) return;
    const tag = (node.tagName || '').toLowerCase();

    if (tag === 'table') {
      const trs = node.querySelectorAll('tr');
      trs.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('th, td'));
        const cells = tds.map((td, idx) => {
          const txt = (td.textContent || '').replace(/\s+/g, ' ').trim();
          return txt || (idx > 0 ? '☐' : '');
        });
        if (cells.some(c => c && c !== '☐')) {
          lines.push(`| ${cells.join(' | ')} |`);
        }
      });
      return;
    }

    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tag)) {
      const txt = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (txt) {
        if (tag === 'li' && !/^[☐☑☒□○•\-*]|\d+[\.\)]/.test(txt)) {
          lines.push(`☐ ${txt}`);
        } else {
          lines.push(txt);
        }
      }
      return;
    }

    if (node.childNodes && node.childNodes.length > 0) {
      node.childNodes.forEach(child => walk(child));
    }
  };

  walk(doc.body);
  return lines.join('\n');
}

/**
 * Extrai texto de apresentações PowerPoint (.PPTX) via JSZip lendo todos os slides e tabelas
 */
async function extractTextFromPptxBuffer(arrayBuffer) {
  const zip = await (await carregarJSZip()).loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files)
    .filter(path => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return numA - numB;
    });

  const parser = new DOMParser();
  const lines = [];

  for (const slidePath of slideFiles) {
    const xmlStr = await zip.file(slidePath).async('string');
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

    // Extrai tabelas (<a:tbl>)
    const tables = xmlDoc.getElementsByTagName('a:tbl');
    const tableNodes = new Set();
    for (let t = 0; t < tables.length; t++) {
      const tbl = tables[t];
      tableNodes.add(tbl);
      const rows = tbl.getElementsByTagName('a:tr');
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getElementsByTagName('a:tc');
        const rowCells = [];
        for (let c = 0; c < cells.length; c++) {
          const tNodes = cells[c].getElementsByTagName('a:t');
          let cellText = '';
          for (let k = 0; k < tNodes.length; k++) {
            cellText += (tNodes[k].textContent || '') + ' ';
          }
          rowCells.push(cellText.replace(/\s+/g, ' ').trim() || (c > 0 ? '☐' : ''));
        }
        if (rowCells.some(c => c && c !== '☐')) {
          lines.push(`| ${rowCells.join(' | ')} |`);
        }
      }
    }

    // Extrai parágrafos fora de tabelas (<a:p>)
    const paragraphs = xmlDoc.getElementsByTagName('a:p');
    for (let p = 0; p < paragraphs.length; p++) {
      const pNode = paragraphs[p];
      // Verifica se está dentro de uma tabela já processada
      let insideTable = false;
      let parent = pNode.parentNode;
      while (parent) {
        if (parent.nodeName === 'a:tbl') {
          insideTable = true;
          break;
        }
        parent = parent.parentNode;
      }
      if (insideTable) continue;

      const tNodes = pNode.getElementsByTagName('a:t');
      let pText = '';
      for (let k = 0; k < tNodes.length; k++) {
        pText += tNodes[k].textContent || '';
      }
      pText = pText.replace(/\s+/g, ' ').trim();
      if (pText) lines.push(pText);
    }
  }

  return lines.join('\n');
}

/**
 * Extrai texto de Planilhas Excel (.XLSX) via JSZip
 */
async function extractTextFromXlsxBuffer(arrayBuffer) {
  const zip = await (await carregarJSZip()).loadAsync(arrayBuffer);
  const parser = new DOMParser();
  const sharedStrings = [];

  const ssFile = zip.file('xl/sharedStrings.xml');
  if (ssFile) {
    const ssXml = await ssFile.async('string');
    const ssDoc = parser.parseFromString(ssXml, 'application/xml');
    const siNodes = ssDoc.getElementsByTagName('si');
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName('t');
      let val = '';
      for (let k = 0; k < tNodes.length; k++) {
        val += tNodes[k].textContent || '';
      }
      sharedStrings.push(val.trim());
    }
  }

  const sheetFiles = Object.keys(zip.files)
    .filter(p => /^xl\/worksheets\/sheet\d+\.xml$/i.test(p))
    .sort();

  const lines = [];
  for (const sheetPath of sheetFiles) {
    const sheetXml = await zip.file(sheetPath).async('string');
    const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');
    const rows = sheetDoc.getElementsByTagName('row');
    for (let r = 0; r < rows.length; r++) {
      const cNodes = rows[r].getElementsByTagName('c');
      const rowVals = [];
      for (let c = 0; c < cNodes.length; c++) {
        const cell = cNodes[c];
        const type = cell.getAttribute('t');
        const vNode = cell.getElementsByTagName('v')[0];
        let val = vNode ? vNode.textContent : '';
        if (type === 's' && val !== '') {
          val = sharedStrings[parseInt(val, 10)] || val;
        }
        if (val) rowVals.push(val.trim());
      }
      if (rowVals.length === 1) {
        lines.push(rowVals[0]);
      } else if (rowVals.length > 1) {
        lines.push(`| ${rowVals.join(' | ')} |`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Extrai texto de arquivos PDF (.PDF) agrupando fragmentos por coordenada Y (linhas) e X (colunas/tabelas)
 */
async function extractTextFromPdfBuffer(arrayBuffer) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Worker empacotado junto com o site (versão sempre igual à biblioteca; sem depender de CDN)
      const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const allLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items || [];

      // Agrupa fragmentos de texto pela coordenada Y (tolerância de 3.5 unidades para mesma linha)
      const rowBuckets = [];
      items.forEach(item => {
        const str = (item.str || '').trim();
        if (!str) return;
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;

        let bucket = rowBuckets.find(b => Math.abs(b.y - y) <= 3.5);
        if (!bucket) {
          bucket = { y, items: [] };
          rowBuckets.push(bucket);
        }
        bucket.items.push({ x, str });
      });

      // Ordena de cima para baixo (Y decrescente no PDF)
      rowBuckets.sort((a, b) => b.y - a.y);

      rowBuckets.forEach(bucket => {
        bucket.items.sort((a, b) => a.x - b.x);
        // Verifica se parece linha de tabela com múltiplas colunas espaçadas
        const parts = [];
        let lastX = null;
        let hasWideGaps = 0;

        bucket.items.forEach(it => {
          if (lastX !== null && (it.x - lastX) > 45) {
            hasWideGaps++;
            parts.push('|');
          }
          parts.push(it.str);
          lastX = it.x + (it.str.length * 4.5);
        });

        const joined = parts.join(' ').replace(/\s+\|\s+/g, ' | ').replace(/\s+/g, ' ').trim();
        if (hasWideGaps >= 2 && !joined.startsWith('|')) {
          allLines.push(`| ${joined} |`);
        } else {
          allLines.push(joined.replace(/\s*\|\s*/g, ' '));
        }
      });
    }

    if (allLines.length > 0) {
      return allLines.join('\n');
    }
  } catch (err) {
    console.warn('Fallback de extração PDF acionado:', err);
  }

  // Fallback caso o worker CDN esteja offline: extrai strings de texto dos streams do PDF
  return extractReadableTextFromBinaryBuffer(arrayBuffer);
}

/**
 * Extrator binário universal (UTF-16LE e UTF-8/Latin1) para arquivos .DOC e .PPT legados
 */
function extractReadableTextFromBinaryBuffer(arrayBuffer) {
  const results = [];

  // 1. Tenta extrair blocos UTF-16LE (usado pelo Word 97-2003 .doc e PowerPoint .ppt para textos com acentos e ☐)
  try {
    const utf16Decoder = new TextDecoder('utf-16le', { fatal: false });
    const raw16 = utf16Decoder.decode(arrayBuffer);
    const lines16 = raw16
      .split(/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]+/)
      .map(l => l.replace(/[^\x20-\x7E\xA0-\xFF☐☑☒✓✔□■○●—–]/g, '').trim())
      .filter(l => l.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(l));
    if (lines16.length > 5) {
      results.push(...lines16);
    }
  } catch (e) {}

  // 2. Extrai blocos UTF-8 / Windows-1252
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
    const raw8 = utf8Decoder.decode(arrayBuffer);
    const lines8 = raw8
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, '\n')
      .split(/\r?\n/)
      .map(l => l.replace(/[^\x20-\x7E\xA0-\xFF☐☑☒✓✔□■○●—–]/g, '').trim())
      .filter(l => l.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(l) && !/^(?:Root Entry|WordDocument|SummaryInformation|Microsoft|Normal\.dot|Times New Roman|Calibri|Arial|obj|endobj|stream|endstream|xref)/i.test(l));
    if (lines8.length > results.length) {
      return lines8.join('\n');
    }
  } catch (e) {}

  return results.join('\n');
}

export function parseCsvToQuestions(csvText) {
  const lines = String(csvText || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('O arquivo CSV está vazio.');
  }

  const sep = lines[0].includes(';') ? ';' : ',';
  const rows = lines.map(line =>
    line.split(sep).map(cell => cell.replace(/^["']|["']$/g, '').trim())
  );

  const header = rows[0].map(h => h.toLowerCase());
  const hasHeader = header.some(h => h.includes('pergunta') || h.includes('titulo') || h.includes('question'));
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const screens = [];
  const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star', 'Sparkles'];
  const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];

  dataRows.forEach((cols, idx) => {
    const titulo = cols[0];
    if (!titulo) return;

    const rawTipo = (cols[1] || '').toLowerCase();
    const rawOpcoes = cols[2] || '';
    const rawGaveta = cols[3] || '';

    const detectedType = detectQuestionTypeAI(titulo, rawTipo, rawOpcoes);
    const opcoesStrings = rawOpcoes
      ? rawOpcoes.split(/[|\/,]/).map(s => s.trim()).filter(Boolean)
      : (cols.slice(2).filter(Boolean));

    const opcoes = opcoesStrings.map((optStr, oIdx) => {
      const parsedOpt = parseOptionWithDrawerAI(optStr, oIdx === 0 ? rawGaveta : '');
      return {
        id: `csv_opt_${Date.now()}_${idx}_${oIdx}`,
        titulo: parsedOpt.titulo,
        subtitulo: '',
        ativo: true,
        icone: icones[oIdx % icones.length],
        cor: cores[oIdx % cores.length],
        temGaveta: parsedOpt.temGaveta,
        gaveta: parsedOpt.gaveta
      };
    });

    screens.push({
      id: `csv_tela_${Date.now()}_${idx}`,
      tipo: detectedType,
      titulo,
      titulo1: titulo,
      titulo2: '',
      subtitulo: '',
      placeholder: getSmartPlaceholder(detectedType, titulo),
      multiline: detectedType === 'texto',
      linhas: detectedType === 'texto' ? 4 : 1,
      sliderMin: 0,
      sliderMax: 10,
      sliderStep: 1,
      cardsPorTela: Math.min(10, Math.max(4, opcoes.length)),
      opcoes: opcoes.length > 0 ? opcoes : getDefaultOptionsForType(detectedType)
    });
  });

  if (screens.length === 0) {
    return parseTextToQuestions(csvText);
  }

  return buildConfigFromParsedScreens(screens);
}

export function parseJsonOrText(content, fileName = '') {
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.opcoesChegada || parsed.telasExtras || parsed.items) {
        return normalizeImportedConfig(parsed);
      }
    } catch (e) {}
  }

  return parseTextToQuestions(String(content || ''), fileName);
}

/**
 * Importa diretamente a partir do Link Público de um Google Forms
 */
export async function parseGoogleFormsUrl(url) {
  const cleanUrl = String(url || '').trim();
  if (!cleanUrl.startsWith('http')) {
    throw new Error('Por favor, cole um link válido do Google Forms (começando com https://).');
  }

  const proxyGenerators = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
  ];

  let html = '';
  for (const makeProxy of proxyGenerators) {
    try {
      const resp = await fetch(makeProxy(cleanUrl));
      if (resp.ok) {
        const text = await resp.text();
        if (text && (text.includes('FB_PUBLIC_LOAD_DATA_') || text.includes('docs-title') || text.length > 500)) {
          html = text;
          break;
        }
      }
    } catch (e) {}
  }

  if (!html) {
    throw new Error('Não foi possível acessar o link diretamente pelo navegador. Dica: Abra o formulário, pressione Ctrl+A e Ctrl+C e cole o texto na caixa abaixo!');
  }

  return parseGoogleFormsHtml(html);
}

export function parseGoogleFormsHtml(html) {
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/i) ||
                html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/i);

  if (match && match[1]) {
    try {
      const data = JSON.parse(match[1]);
      const formBody = data?.[1];
      const formDescription = formBody?.[0] || '';
      const rawItems = formBody?.[1] || [];
      const formTitle = data?.[3] || formBody?.[8] || 'Formulário Importado';

      const screens = [];
      const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star', 'Sparkles'];
      const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];

      rawItems.forEach((item, idx) => {
        if (!Array.isArray(item)) return;
        const qTitle = (item[1] || '').trim();
        const qDesc = (item[2] || '').trim();
        const gType = item[3];
        const qDetails = item[4]?.[0];

        if (!qTitle || gType === 8 || gType === 6) return;

        let tipo = 'cards';
        let opcoes = [];
        let sliderMin = 0;
        let sliderMax = 10;

        if (gType === 0) {
          tipo = 'texto_curto';
        } else if (gType === 1) {
          tipo = 'texto';
        } else if (gType === 2) {
          const rawChoices = qDetails?.[1] || [];
          tipo = 'cards';
          opcoes = rawChoices.map((c, oIdx) => ({
            id: `gf_opt_${idx}_${oIdx}`,
            titulo: String(c?.[0] || `Opção ${oIdx + 1}`).trim(),
            subtitulo: '',
            ativo: true,
            icone: icones[oIdx % icones.length],
            cor: cores[oIdx % cores.length],
            temGaveta: Boolean(c?.[4]),
            gaveta: c?.[4] ? {
              tipo: 'texto_curto',
              pergunta: 'Qual? Especifique:',
              placeholder: 'Digite aqui...',
              obrigatorio: false,
              botaoConfirmar: 'Confirmar & Avançar'
            } : null
          }));
        } else if (gType === 3) {
          tipo = 'dropdown';
          const rawChoices = qDetails?.[1] || [];
          opcoes = rawChoices.map((c, oIdx) => ({
            id: `gf_dd_${idx}_${oIdx}`,
            titulo: String(c?.[0] || `Opção ${oIdx + 1}`).trim(),
            subtitulo: '',
            ativo: true,
            icone: 'Tag',
            cor: 'amber'
          }));
        } else if (gType === 4) {
          tipo = 'checkbox';
          const rawChoices = qDetails?.[1] || [];
          opcoes = rawChoices.map((c, oIdx) => ({
            id: `gf_chk_${idx}_${oIdx}`,
            titulo: String(c?.[0] || `Opção ${oIdx + 1}`).trim(),
            subtitulo: '',
            ativo: true,
            icone: icones[oIdx % icones.length],
            cor: cores[oIdx % cores.length]
          }));
        } else if (gType === 5) {
          tipo = 'slider';
          const rawScale = qDetails?.[1] || [];
          if (rawScale.length >= 2) {
            sliderMin = Number(rawScale[0]?.[0] ?? 0);
            sliderMax = Number(rawScale[rawScale.length - 1]?.[0] ?? 10);
          }
        } else if (gType === 7) {
          // Grade no Google Forms!
          tipo = 'grade';
          const allRows = item[4] || [];
          opcoes = allRows.map((r, rIdx) => ({
            id: `gf_grd_${idx}_${rIdx}`,
            titulo: String(r?.[3]?.[0] || `Item ${rIdx + 1}`).trim(),
            subtitulo: '',
            ativo: true,
            icone: icones[rIdx % icones.length],
            cor: cores[rIdx % cores.length]
          }));
        } else if (gType === 9) {
          tipo = 'data';
        } else if (gType === 10) {
          tipo = 'hora';
        } else {
          tipo = detectQuestionTypeAI(qTitle);
        }

        screens.push({
          id: `gf_tela_${Date.now()}_${idx}`,
          tipo,
          titulo: qTitle,
          titulo1: qTitle,
          titulo2: '',
          subtitulo: qDesc,
          placeholder: getSmartPlaceholder(tipo, qTitle),
          multiline: tipo === 'texto',
          linhas: tipo === 'texto' ? 4 : 1,
          sliderMin,
          sliderMax,
          sliderStep: 1,
          cardsPorTela: Math.min(10, Math.max(4, opcoes.length)),
          opcoes: opcoes.length > 0 ? opcoes : getDefaultOptionsForType(tipo)
        });
      });

      if (screens.length > 0) {
        return buildConfigFromParsedScreens(screens, {
          eventTitle: formTitle,
          introText: formDescription
        });
      }
    } catch (err) {
      console.warn('Falha ao decodificar FB_PUBLIC_LOAD_DATA_:', err);
    }
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const extractedLines = [];
  doc.querySelectorAll('[role="heading"], [role="listitem"], .M7eMe, .docssharedWizToggleLabeledLabelText').forEach(el => {
    const t = (el.textContent || '').trim();
    if (t) extractedLines.push(t);
  });

  if (extractedLines.length > 0) {
    return parseTextToQuestions(extractedLines.join('\n'));
  }

  throw new Error('Não encontramos perguntas públicas neste link.');
}

/**
 * Classificador Inteligente (IA Semântica) que identifica o tipo de componente ideal
 */
export function detectQuestionTypeAI(questionText, explicitTag = '', optionsHint = '') {
  const combined = `${questionText} ${explicitTag} ${optionsHint}`.toLowerCase();

  if (/\[(?:grade|matriz|tabela)\]/i.test(combined)) {
    return 'grade';
  }

  if (/\[(?:checkbox|caixas|multipla|múltipla|marque todas|várias)\]/i.test(combined) ||
      /\b(?:marque todas|selecione todas|mais de uma opção|quais das opções)\b/i.test(combined)) {
    return 'checkbox';
  }

  if (/\[(?:radio|única|unica|bolinha)\]/i.test(combined)) {
    return 'radio';
  }

  if (/\[(?:dropdown|lista|select|suspensa)\]/i.test(combined) ||
      /\b(?:lista suspensa|selecione na lista|escolha seu estado)\b/i.test(combined)) {
    return 'dropdown';
  }

  if (/\[(?:slide|slider|escala|nps|0-10|nota)\]/i.test(combined) ||
      /\b(?:escala de 0 a 10|de 0 a 10|de 1 a 10|qual a probabilidade|grau de satisfação geral)\b/i.test(combined)) {
    return 'slider';
  }

  if (/\[(?:estrelas|rating|stars|1-5)\]/i.test(combined) ||
      /\b(?:quantas estrelas|avalie com estrelas|de 1 a 5 estrelas)\b/i.test(combined)) {
    return 'rating';
  }

  if (/\[(?:data|date|calendario|calendário)\]/i.test(combined) ||
      /\b(?:qual a data|data de nascimento|data do evento)\b/i.test(combined)) {
    return 'data';
  }

  if (/\[(?:hora|time|horário|horario)\]/i.test(combined) ||
      /\b(?:qual o horário|que horas|hora de chegada)\b/i.test(combined)) {
    return 'hora';
  }

  if (/\[(?:texto curto|curto|nome|telefone|whatsapp|email|e-mail)\]/i.test(combined) ||
      /^(?:nome|nome completo|seu nome|telefone|whatsapp|celular|e-?mail|cpf|matrícula|matricula)\s*:?\s*$/i.test(questionText.replace(/_+/g, '').trim())) {
    return 'texto_curto';
  }

  if (/\[(?:texto|texto longo|campo longo|dissertativa|parágrafo|paragrafo|digitar)\]/i.test(combined) ||
      /\b(?:que conhecimentos|quais temas|quais aspectos|quais oportunidades|deixe sua mensagem|sua sugestão|sugestões|seu comentário|comentários|escreva abaixo|descreva|pedido de oração|o que podemos melhorar|incorporar à sua atuação|priorizados nos próximos)\b/i.test(combined)) {
    return 'texto';
  }

  return 'cards';
}

function getSmartPlaceholder(tipo, titulo = '') {
  const t = titulo.toLowerCase();
  if (tipo === 'texto_curto') {
    if (t.includes('nome')) return 'Digite seu nome (opcional)...';
    if (t.includes('whatsapp') || t.includes('telefone') || t.includes('celular')) return '(00) 00000-0000';
    if (t.includes('email') || t.includes('e-mail')) return 'seuemail@exemplo.com';
    return 'Digite sua resposta curta...';
  }
  if (tipo === 'texto') {
    return 'Escreva aqui sua resposta, reflexão, comentário ou sugestão...';
  }
  return 'Digite sua resposta aqui...';
}

function getDefaultOptionsForType(tipo) {
  if (['texto', 'texto_curto', 'slider', 'rating', 'data', 'hora'].includes(tipo)) {
    return [];
  }
  return [
    { id: `opt_${Date.now()}_1`, titulo: 'Opção 1', subtitulo: '', ativo: true, icone: 'Tag', cor: 'amber', temGaveta: false, gaveta: null },
    { id: `opt_${Date.now()}_2`, titulo: 'Opção 2', subtitulo: '', ativo: true, icone: 'Church', cor: 'sky', temGaveta: false, gaveta: null },
    { id: `opt_${Date.now()}_3`, titulo: 'Opção 3', subtitulo: '', ativo: true, icone: 'Sparkles', cor: 'emerald', temGaveta: false, gaveta: null }
  ];
}

/**
 * Analisa uma opção individual e detecta automaticamente Gavetas Condicionais
 * Inclui detecção automática de "Outro: _____________" ou "Qual? _____"
 */
export function parseOptionWithDrawerAI(cleanOption, extraGavetaHint = '') {
  let optionTitle = String(cleanOption || '').trim();
  let temGaveta = false;
  let gavetaTipo = 'texto_curto';
  let gavetaPergunta = 'Qual? Especifique:';
  let gavetaOpcoes = ['Opção 1', 'Opção 2', 'Opção 3'];

  // 1. Detecta padrão "Outro: _______________" ou "Outro (especifique): ____"
  if (/^(?:outro|outra|outros|outras)\b/i.test(optionTitle) && (optionTitle.includes(':') || /_{2,}/.test(optionTitle))) {
    temGaveta = true;
    gavetaTipo = 'texto_curto';
    gavetaPergunta = 'Qual? Especifique abaixo:';
    optionTitle = optionTitle
      .replace(/[:\-–—]\s*_*.*$/i, '')
      .replace(/_+/g, '')
      .trim() || 'Outro';
  } else if (/_{3,}/.test(optionTitle)) {
    // Qualquer opção que tenha linha de preenchimento "______" ganha gaveta de texto curto
    temGaveta = true;
    gavetaTipo = 'texto_curto';
    gavetaPergunta = 'Especifique:';
    optionTitle = optionTitle.replace(/[:\-–—]?\s*_{3,}.*$/, '').trim() || 'Outro';
  }

  const fullStr = extraGavetaHint ? `${optionTitle} (Gaveta: ${extraGavetaHint})` : optionTitle;

  const gavetaMatch =
    fullStr.match(/\((?:gaveta|subpergunta|se sim|condição|detalhe|especifique)([^:)]*):\s*(.*?)\)/i) ||
    fullStr.match(/->\s*(?:gaveta)?([^:]*):\s*(.*)$/i);

  if (gavetaMatch) {
    temGaveta = true;
    const mod = (gavetaMatch[1] || '').toLowerCase();
    const conteudo = (gavetaMatch[2] || '').trim();
    optionTitle = optionTitle.replace(gavetaMatch[0], '').trim();

    if (mod.includes('radio') || mod.includes('única')) {
      gavetaTipo = 'radio';
    } else if (mod.includes('check') || mod.includes('múltipla')) {
      gavetaTipo = 'checkbox';
    } else if (mod.includes('slide') || mod.includes('escala')) {
      gavetaTipo = 'slider';
    } else if (mod.includes('longo') || mod.includes('dissertat')) {
      gavetaTipo = 'texto_longo';
    } else if (mod.includes('data')) {
      gavetaTipo = 'data';
    } else if (mod.includes('hora')) {
      gavetaTipo = 'hora';
    } else {
      gavetaTipo = 'texto_curto';
    }

    if (conteudo.includes('|') || (conteudo.includes('/') && !conteudo.includes('?'))) {
      const parts = conteudo.split('?');
      if (parts.length > 1) {
        gavetaPergunta = parts[0].trim() + '?';
        gavetaOpcoes = parts[1].split(/[|\/]/).map(s => s.trim()).filter(Boolean);
      } else {
        gavetaPergunta = 'Selecione uma opção:';
        gavetaOpcoes = conteudo.split(/[|\/]/).map(s => s.trim()).filter(Boolean);
      }
      if (gavetaTipo === 'texto_curto' || gavetaTipo === 'texto_longo') gavetaTipo = 'radio';
    } else if (conteudo) {
      gavetaPergunta = conteudo;
    }
  }

  return {
    titulo: optionTitle || 'Opção',
    temGaveta,
    gaveta: temGaveta ? {
      tipo: gavetaTipo,
      pergunta: gavetaPergunta,
      placeholder: gavetaTipo === 'texto_curto' ? 'Digite aqui...' : 'Escreva aqui sua resposta...',
      obrigatorio: false,
      linhas: 3,
      sliderMin: 0,
      sliderMax: 10,
      sliderStep: 1,
      sliderUnidade: '',
      opcoes: gavetaOpcoes,
      botaoConfirmar: 'Confirmar & Avançar'
    } : null
  };
}

/**
 * PARSER ESTRUTURAL E SEMÂNTICO COMPLETO PARA TEXTOS, DOCUMENTOS WORD, PDF E POWERPOINT
 */
export function parseTextToQuestions(rawText, fileName = '') {
  const rawLines = String(rawText || '')
    .split(/\r?\n/)
    .map(l => l.replace(/\u00A0/g, ' ').trim())
    .filter(l => l.length > 0);

  if (rawLines.length === 0) {
    throw new Error('O arquivo ou texto está vazio.');
  }

  const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star', 'Sparkles'];
  const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];

  // Expressões auxiliares
  const CHECKBOX_CHARS = /^[☐☑☒✓✔□■○●◯🔘☑️]\s*/;
  const BULLET_OPTION_REGEX = /^(?:[☐☑☒✓✔□■○●◯🔘☑️]|[-*•–—\+]|\[\s*[xX]?\s*\]|\(\s*[oO•]?\s*\)|[a-hA-H][\.\)])\s*(.+)$/i;
  const NUMBERED_SECTION_REGEX = /^(\d+)[\.\)\-]\s+(.+)$/;
  const PURE_UNDERSCORES_REGEX = /^[_\-\s]{4,}$/;
  const SCALE_LEGEND_REGEX = /^(?:escala\s*:|\d+\s*=\s*[^;|]+[;|]\s*\d+\s*=|0\s*=\s*totalmente)/i;
  const SCALE_CONTINUATION_REGEX = /^\d+\s*=\s*[^;|]+(?:;\s*NA\s*=|\s*\|\s*\d+\s*=)/i;

  const isTableLine = (line) => {
    return (line.startsWith('|') && line.endsWith('|') && (line.match(/\|/g) || []).length >= 3) ||
           ((line.match(/\|/g) || []).length >= 3 && !SCALE_LEGEND_REGEX.test(line));
  };

  const parseTableCells = (line) => {
    const raw = line.split('|').map(c => c.trim());
    if (raw[0] === '') raw.shift();
    if (raw[raw.length - 1] === '') raw.pop();
    return raw;
  };

  // Verifica se uma linha de tabela é uma régua 0 a 10 (ex: | 0☐ | 1☐ | ... | 10☐ |)
  const isZeroToTenScaleTableLine = (cells) => {
    if (cells.length < 5) return false;
    const numericMatches = cells.filter(c => /^\d{1,2}\s*[☐☑☒□○]?$/.test(c));
    return numericMatches.length >= 6;
  };

  // Verifica se é cabeçalho de tabela (ex: | Item | 1 | 2 | 3 | 4 | 5 | NA |)
  const isTableHeaderCells = (cells) => {
    if (cells.length < 3) return false;
    const first = cells[0].toLowerCase().replace(/[☐☑☒□○]/g, '').trim();
    const rest = cells.slice(1);
    const restAreScaleCols = rest.every(c => /^(?:[1-5]|10|na|n\/a|sim|não|nao|ruim|regular|bom|ótimo|otimo|péssimo|pessimo)$/i.test(c));
    return restAreScaleCols || /^(?:item|itens|aspecto|aspectos|critério|criterio|eixo|tema|afirmação|afirmacao|avaliação|avaliacao|pergunta)$/i.test(first);
  };

  // Verifica se uma linha comum tem múltiplos checkboxes inline (ex: ☐ 1 = Nada  ☐ 2 = Pouco  ☐ 3 = Moderadamente...)
  const extractInlineCheckboxOptions = (line) => {
    if (isTableLine(line)) return null;
    const matches = line.split(/[☐☑☒□○◯🔘☑️]/).map(s => s.trim()).filter(Boolean);
    const checkboxCount = (line.match(/[☐☑☒□○◯🔘☑️]/g) || []).length;
    if (checkboxCount >= 2 && matches.length >= 2) {
      return matches;
    }
    return null;
  };

  // Verifica se a linha tem um item seguido de 3+ checkboxes no final (tabela extraída sem pipes)
  const extractTrailingCheckboxesRow = (line) => {
    const m = line.match(/^(.+?)\s+(?:[☐☑☒□○]\s*){3,}$/);
    if (m && m[1] && m[1].trim().length > 2) {
      return m[1].trim();
    }
    return null;
  };

  // 1. Extração de Cabeçalho do Documento (Título do Evento, Subtítulo e Texto de Boas-vindas)
  let eventTitle = '';
  let eventSubtitle = '';
  let introText = '';
  let startIndex = 0;

  const firstLines = [];
  for (let i = 0; i < Math.min(6, rawLines.length); i++) {
    const l = rawLines[i];
    if (
      NUMBERED_SECTION_REGEX.test(l) ||
      BULLET_OPTION_REGEX.test(l) ||
      isTableLine(l) ||
      l.endsWith('?') ||
      l.endsWith(':') ||
      /_{4,}/.test(l)
    ) {
      break;
    }
    firstLines.push(l);
    startIndex = i + 1;
  }

  if (firstLines.length >= 1) {
    eventTitle = firstLines[0];
  }
  if (firstLines.length >= 2) {
    if (firstLines[1].length <= 110 && firstLines.length >= 3) {
      eventSubtitle = firstLines[1];
      introText = firstLines.slice(2).join(' ');
    } else {
      introText = firstLines.slice(1).join(' ');
    }
  }

  // 2. Percorre as linhas construindo Seções e Telas de Pergunta
  const screens = [];
  let currentSectionPrefix = '';
  let currentScreen = null;
  let pendingScaleLegend = '';

  const pushCurrentScreenIfValid = () => {
    if (!currentScreen) return;

    // Se a tela tem opções ou é de tipo aberto/slider/grade, é uma tela válida
    const hasOptions = currentScreen.opcoes && currentScreen.opcoes.length > 0;
    const isInputOrScale = ['texto', 'texto_curto', 'slider', 'rating', 'data', 'hora', 'grade'].includes(currentScreen.tipo);

    if (hasOptions || isInputOrScale || currentScreen.wasExplicitQuestion) {
      if (pendingScaleLegend && !currentScreen.legendaEscala) {
        currentScreen.legendaEscala = pendingScaleLegend;
        pendingScaleLegend = '';
      }
      // Ajusta cardsPorTela para exibir todas as opções sem esconder
      if (currentScreen.opcoes && currentScreen.opcoes.length > 0) {
        currentScreen.cardsPorTela = Math.min(12, Math.max(4, currentScreen.opcoes.length));
      }
      screens.push(currentScreen);
    }
    currentScreen = null;
  };

  const createNewScreen = (rawTitle, sectionPrefix = '', forcedType = null) => {
    const cleanQ = rawTitle
      .replace(/[:\-–—]?\s*_{3,}.*$/, (m) => (m.trim().startsWith(':') ? ':' : ''))
      .replace(/_+/g, '')
      .trim();

    const detectedType = forcedType || detectQuestionTypeAI(cleanQ);
    const shortPrefix = sectionPrefix
      ? sectionPrefix.replace(/\s*\(opcional\)\s*/i, '').trim()
      : '';

    const hasDistinctPrefix = Boolean(shortPrefix && !cleanQ.toLowerCase().startsWith(shortPrefix.toLowerCase()));
    const fullTitle = hasDistinctPrefix
      ? `${shortPrefix} — ${cleanQ}`
      : cleanQ;

    return {
      id: `tela_imp_${Date.now()}_${screens.length + 1}_${Math.random().toString(36).slice(2, 6)}`,
      tipo: detectedType,
      titulo: fullTitle || 'Pergunta',
      titulo1: hasDistinctPrefix ? shortPrefix : (cleanQ || 'Pergunta'),
      titulo2: hasDistinctPrefix ? cleanQ : '',
      titulo3: '',
      subtitulo: '',
      legendaEscala: pendingScaleLegend || '',
      colunasGrade: ['1', '2', '3', '4', '5', 'NA'],
      placeholder: getSmartPlaceholder(detectedType, cleanQ),
      multiline: detectedType === 'texto',
      linhas: detectedType === 'texto' ? 4 : 1,
      sliderMin: 0,
      sliderMax: 10,
      sliderStep: 1,
      cardsPorTela: 6,
      opcoes: [],
      wasExplicitQuestion: cleanQ.endsWith('?') || /_{3,}/.test(rawTitle)
    };
  };

  const addOptionToCurrentScreen = (optText) => {
    if (!currentScreen) {
      currentScreen = createNewScreen(currentSectionPrefix || 'Selecione uma opção:');
    }
    const parsedOpt = parseOptionWithDrawerAI(optText);
    const optIdx = currentScreen.opcoes.length;
    currentScreen.opcoes.push({
      id: `opt_imp_${Date.now()}_${screens.length}_${optIdx + 1}`,
      titulo: parsedOpt.titulo,
      subtitulo: '',
      ativo: true,
      icone: icones[optIdx % icones.length],
      cor: cores[optIdx % cores.length],
      temGaveta: parsedOpt.temGaveta,
      gaveta: parsedOpt.gaveta
    });
  };

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i];

    // A) Ignora linhas puras de sublinhado "________________" (mas marca a pergunta atual como campo aberto!)
    if (PURE_UNDERSCORES_REGEX.test(line)) {
      if (currentScreen && currentScreen.opcoes.length === 0) {
        if (!['texto', 'texto_curto', 'slider', 'grade'].includes(currentScreen.tipo)) {
          const isShortField = /^(?:.*—\s*)?(?:nome|nome completo|e-?mail|telefone|celular|whatsapp|cpf|cargo)\s*:?$/i.test(currentScreen.titulo);
          currentScreen.tipo = isShortField ? 'texto_curto' : 'texto';
          currentScreen.multiline = currentScreen.tipo === 'texto';
          currentScreen.linhas = currentScreen.tipo === 'texto' ? 4 : 1;
          currentScreen.placeholder = getSmartPlaceholder(currentScreen.tipo, currentScreen.titulo);
        }
        currentScreen.wasExplicitQuestion = true;
      }
      continue;
    }

    // B) Linhas de Legenda de Escala ("Escala: 1 = Nada relevante...", "0 = Totalmente insatisfeito | 10 = ...")
    if (SCALE_LEGEND_REGEX.test(line) || SCALE_CONTINUATION_REGEX.test(line)) {
      const cleanLegend = line.replace(/^escala\s*:\s*/i, '').trim();
      if (currentScreen) {
        currentScreen.legendaEscala = currentScreen.legendaEscala
          ? `${currentScreen.legendaEscala} ${cleanLegend}`
          : cleanLegend;
        if (!currentScreen.subtitulo) {
          currentScreen.subtitulo = currentScreen.legendaEscala;
        }
      } else {
        pendingScaleLegend = pendingScaleLegend ? `${pendingScaleLegend} ${cleanLegend}` : cleanLegend;
      }
      continue;
    }

    // C) Linhas de Tabela (| Item | 1 | 2 | 3 | 4 | 5 | NA | ou | 0☐ | 1☐ | ... | 10☐ |)
    if (isTableLine(line)) {
      const cells = parseTableCells(line);
      if (cells.length === 0) continue;

      // Ignora separador markdown |---|---|
      if (cells.every(c => /^[-:]+$/.test(c))) continue;

      // C.1) Régua de 0 a 10 (| 0☐ | 1☐ | ... | 10☐ |)
      if (isZeroToTenScaleTableLine(cells)) {
        if (!currentScreen) {
          currentScreen = createNewScreen(currentSectionPrefix || 'Satisfação Geral', '', 'slider');
        }
        currentScreen.tipo = 'slider';
        currentScreen.sliderMin = 0;
        currentScreen.sliderMax = 10;
        currentScreen.sliderStep = 1;
        currentScreen.wasExplicitQuestion = true;
        continue;
      }

      // C.2) Cabeçalho de Tabela (| Item | 1 | 2 | 3 | 4 | 5 | NA |)
      if (isTableHeaderCells(cells)) {
        // Se já havia uma grade com itens preenchidos, fecha a anterior e abre nova grade
        if (currentScreen && currentScreen.opcoes.length > 0) {
          pushCurrentScreenIfValid();
        }
        if (!currentScreen) {
          currentScreen = createNewScreen(currentSectionPrefix || 'Avaliação de Itens', '', 'grade');
        }
        currentScreen.tipo = 'grade';
        const scaleCols = cells.slice(1).map(c => c.replace(/[☐☑☒□○]/g, '').trim()).filter(Boolean);
        if (scaleCols.length >= 2) {
          currentScreen.colunasGrade = scaleCols;
        }
        continue;
      }

      // C.3) Linha de Item da Tabela (| 24/11 — Inovação e Tecnologia Judiciária | ☐ | ☐ | ... |)
      const itemLabel = cells[0].replace(/^[☐☑☒□○]\s*/, '').trim();
      if (itemLabel && itemLabel.toLowerCase() !== 'item') {
        if (!currentScreen) {
          currentScreen = createNewScreen(currentSectionPrefix || 'Avaliação', '', 'grade');
        }
        currentScreen.tipo = 'grade';
        addOptionToCurrentScreen(itemLabel);
      }
      continue;
    }

    // D) Linha com item de tabela e 3+ checkboxes no final (sem pipes)
    const trailingRowItem = extractTrailingCheckboxesRow(line);
    if (trailingRowItem) {
      if (!currentScreen) {
        currentScreen = createNewScreen(currentSectionPrefix || 'Avaliação', '', 'grade');
      }
      currentScreen.tipo = 'grade';
      addOptionToCurrentScreen(trailingRowItem);
      continue;
    }

    // E) Linha com múltiplos checkboxes inline (ex: ☐ 1 = Nada  ☐ 2 = Pouco  ☐ 3 = Moderadamente...)
    const inlineOptions = extractInlineCheckboxOptions(line);
    if (inlineOptions) {
      // Verifica se são números de 0 a 10
      const allZeroToTen = inlineOptions.length >= 7 && inlineOptions.every(o => /^\d{1,2}$/.test(o));
      if (allZeroToTen) {
        if (!currentScreen) {
          currentScreen = createNewScreen(currentSectionPrefix || 'Escala 0 a 10', '', 'slider');
        }
        currentScreen.tipo = 'slider';
        currentScreen.sliderMin = 0;
        currentScreen.sliderMax = 10;
        currentScreen.wasExplicitQuestion = true;
      } else {
        if (!currentScreen) {
          currentScreen = createNewScreen(currentSectionPrefix || 'Selecione uma opção:', '', 'cards');
        }
        inlineOptions.forEach(opt => addOptionToCurrentScreen(opt));
      }
      continue;
    }

    // F) Linha de Opção Individual (começa com ☐, ☑, -, *, [ ], ( ), a), etc.)
    const bulletMatch = line.match(BULLET_OPTION_REGEX);
    if (bulletMatch && !NUMBERED_SECTION_REGEX.test(line)) {
      const optContent = bulletMatch[1].trim();
      if (optContent) {
        addOptionToCurrentScreen(optContent);
      }
      continue;
    }

    // G) Seção Numerada de Topo (ex: "1. Perfil do participante (opcional)", "2. Conteúdo programático", "6. Satisfação geral")
    const numberedMatch = line.match(NUMBERED_SECTION_REGEX);
    if (numberedMatch) {
      pushCurrentScreenIfValid();
      pendingScaleLegend = '';

      const secNum = numberedMatch[1];
      const secRest = numberedMatch[2].trim();
      currentSectionPrefix = `${secNum}. ${secRest.replace(/\s*\(opcional\)\s*/i, '').trim()}`;

      // Se a própria linha numerada já termina com "?" ou tem "____", ela já é uma pergunta direta
      if (secRest.endsWith('?') || /_{3,}/.test(secRest)) {
        currentScreen = createNewScreen(`${secNum}. ${secRest}`, '');
        currentScreen.wasExplicitQuestion = true;
      } else {
        // Caso contrário, pode ser um cabeçalho de seção (que receberá subperguntas ou uma tabela logo abaixo)
        currentScreen = createNewScreen(`${secNum}. ${secRest}`, '');
      }
      continue;
    }

    // H) Pergunta ou Sub-pergunta (termina com "?", termina com ":", ou possui linha de resposta "_____")
    const hasInlineUnderscore = /_{3,}/.test(line);
    const cleanWithoutUnderscore = line.replace(/\s*_{3,}.*$/, '').trim();
    const endsWithQuestionOrColon =
      cleanWithoutUnderscore.endsWith('?') ||
      (cleanWithoutUnderscore.endsWith(':') && !/^escala\s*:/i.test(cleanWithoutUnderscore));

    if (endsWithQuestionOrColon || hasInlineUnderscore) {
      const isShortInputLabel = /^(?:nome|nome completo|e-?mail|telefone|celular|whatsapp|cpf|matrícula|matricula)\s*:?$/i.test(cleanWithoutUnderscore);
      const forcedType = hasInlineUnderscore
        ? (isShortInputLabel ? 'texto_curto' : 'texto')
        : (isShortInputLabel ? 'texto_curto' : null);

      // Se a tela atual era apenas um cabeçalho de seção recém-aberto (sem opções e não era pergunta explícita),
      // funde o cabeçalho da seção com esta pergunta!
      if (
        currentScreen &&
        currentScreen.opcoes.length === 0 &&
        !currentScreen.wasExplicitQuestion &&
        currentScreen.tipo !== 'grade'
      ) {
        const mergedScreen = createNewScreen(cleanWithoutUnderscore, currentSectionPrefix, forcedType);
        if (currentScreen.subtitulo && !mergedScreen.subtitulo) {
          mergedScreen.subtitulo = currentScreen.subtitulo;
        }
        currentScreen = mergedScreen;
        currentScreen.wasExplicitQuestion = true;
      } else {
        // Fecha a pergunta anterior e abre uma nova pergunta dentro da mesma seção
        pushCurrentScreenIfValid();
        currentScreen = createNewScreen(cleanWithoutUnderscore, currentSectionPrefix, forcedType);
        currentScreen.wasExplicitQuestion = true;
      }
      continue;
    }

    // I) Linha de instrução / subtítulo (ex: "Avalie a relevância de cada eixo temático para sua atuação profissional.")
    if (currentScreen && currentScreen.opcoes.length === 0) {
      currentScreen.subtitulo = currentScreen.subtitulo
        ? `${currentScreen.subtitulo} ${line}`
        : line;
    } else if (currentScreen && currentScreen.opcoes.length > 0) {
      // Se já tinha opções e apareceu um novo enunciado antes de outra tabela/opções, abre nova tela
      pushCurrentScreenIfValid();
      currentScreen = createNewScreen(line, currentSectionPrefix);
    }
  }

  pushCurrentScreenIfValid();

  // Fallback caso o texto seja uma lista simples sem numeração
  if (screens.length === 0) {
    const detectedType = detectQuestionTypeAI(rawLines[0]);
    const fallbackOpcoes = rawLines.slice(1).map((l, idx) => {
      const parsedOpt = parseOptionWithDrawerAI(l.replace(/^[☐☑☒□○•\-*]\s*/, '').trim());
      return {
        id: `opt_fb_${idx + 1}`,
        titulo: parsedOpt.titulo,
        subtitulo: '',
        ativo: true,
        icone: icones[idx % icones.length],
        cor: cores[idx % cores.length],
        temGaveta: parsedOpt.temGaveta,
        gaveta: parsedOpt.gaveta
      };
    });

    screens.push({
      id: `tela_import_fallback`,
      tipo: detectedType,
      titulo: rawLines[0] || 'Pergunta Importada',
      titulo1: rawLines[0] || 'Pergunta Importada',
      titulo2: '',
      subtitulo: '',
      cardsPorTela: Math.min(10, Math.max(4, fallbackOpcoes.length)),
      opcoes: fallbackOpcoes.length > 0 ? fallbackOpcoes : getDefaultOptionsForType(detectedType)
    });
  }

  return buildConfigFromParsedScreens(screens, {
    eventTitle: eventTitle || fileName.replace(/\.[^.]+$/, ''),
    eventSubtitle,
    introText
  });
}

export function buildConfigFromParsedScreens(screens, meta = {}) {
  // A Tela 1 do celular só sabe mostrar CARDS. Se a primeira pergunta importada for de
  // outro tipo (grade, texto, slider...), ela vira uma tela extra e a Tela 1 fica só como capa.
  const primeiraECards = !screens[0]?.tipo || screens[0].tipo === 'cards';
  const tela1 = primeiraECards ? screens[0] : null;
  const telasExtras = primeiraECards ? screens.slice(1) : screens;
  const t1Count = (tela1?.opcoes || []).length;

  return {
    isBlankEvent: false,
    esperaLinha1: 'DENTRO DE INSTANTES',
    esperaLinha2: 'ESTARÁ LIBERADO',
    esperaLinha3: 'PARA RESPONDER.',
    importedFormTitle: meta.eventTitle || '',
    importedFormSubtitle: meta.eventSubtitle || '',
    importedIntroText: meta.introText || '',
    capaTitulo1: meta.eventTitle || '',
    capaTitulo2: meta.eventSubtitle || '',
    capaTextoAbaixo: meta.introText || '',
    capaFonteTamanho: 16,
    pergunta1Titulo: tela1 ? (tela1.titulo1 || tela1.titulo || 'Pergunta 1') : '',
    pergunta1Titulo2: tela1?.titulo2 || '',
    pergunta1Titulo3: tela1?.titulo3 || '',
    pergunta1Subtitulo: tela1?.subtitulo || '',
    pergunta1TextoAbaixo: tela1?.subtitulo || '',
    pergunta1BotaoComecarTexto: 'COMEÇAR',
    mostrarBotaoComecar: true,
    pergunta1FonteTamanho: 18,
    cardAltura: t1Count >= 5 ? 36 : 52,
    cardsPorTela: tela1?.cardsPorTela || Math.min(12, Math.max(4, t1Count)),
    tela1Tipo: tela1?.tipo || 'cards',
    tela1TextoPlaceholder: tela1?.placeholder || 'Digite sua resposta...',
    opcoesChegada: (tela1?.opcoes && tela1.opcoes.length > 0) ? tela1.opcoes : [],
    mostrarTelaAcompanhantes: false,
    telasExtras: telasExtras.map((t, idx) => {
      const optCount = (t.opcoes || []).length;
      return {
        id: t.id || `tela_imp_${idx + 1}`,
        ativa: true,
        tipo: t.tipo || 'cards',
        titulo: t.titulo || `Pergunta ${idx + 2}`,
        titulo1: t.titulo1 || t.titulo || `Pergunta ${idx + 2}`,
        titulo2: t.titulo2 || '',
        titulo3: t.titulo3 || '',
        subtitulo: t.subtitulo || '',
        legendaEscala: t.legendaEscala || '',
        colunasGrade: t.colunasGrade || ['1', '2', '3', '4', '5', 'NA'],
        placeholder: t.placeholder || 'Digite sua resposta...',
        multiline: t.tipo === 'texto',
        linhas: t.linhas || 4,
        obrigatorio: false,
        botaoTexto: 'Avançar',
        cardAltura: optCount >= 5 ? 34 : 50,
        cardsPorTela: t.cardsPorTela || Math.min(12, Math.max(4, optCount)),
        sliderMin: t.sliderMin ?? 0,
        sliderMax: t.sliderMax ?? 10,
        sliderStep: t.sliderStep ?? 1,
        opcoes: (t.opcoes && t.opcoes.length > 0) ? t.opcoes : getDefaultOptionsForType(t.tipo)
      };
    })
  };
}

function normalizeImportedConfig(data) {
  return {
    importedFormTitle: data.importedFormTitle || data.titulo || '',
    pergunta1Titulo: data.pergunta1Titulo || data.titulo || 'Pergunta Principal',
    pergunta1Titulo2: data.pergunta1Titulo2 || '',
    opcoesChegada: Array.isArray(data.opcoesChegada) ? data.opcoesChegada : [],
    telasExtras: Array.isArray(data.telasExtras) ? data.telasExtras : []
  };
}

