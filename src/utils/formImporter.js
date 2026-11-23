import mammoth from 'mammoth';

/**
 * Motor Inteligente (IA Heurística & Semântica) de Importação de Formulários
 * Suporta:
 * 1. Arquivos Word (.docx e .doc)
 * 2. Planilhas e listas (.csv)
 * 3. Arquivos de texto e JSON (.txt, .json)
 * 4. Texto colado de Google Forms, Typeform, Jotform, SurveyMonkey ou Microsoft Forms
 *
 * Detecta automaticamente o melhor componente:
 * - Cards Múltipla Escolha ('cards')
 * - Radio Button ('radio')
 * - Checkbox / Caixas de Seleção ('checkbox')
 * - Lista Suspensa / Dropdown ('dropdown')
 * - Slide / Escala Numérica 0-10 ('slider')
 * - Avaliação por Estrelas 1-5 ('rating')
 * - Texto Pequeno / Resposta Curta ('texto_curto')
 * - Campo Longo / Dissertativo ('texto')
 * - Data ('data') e Hora ('hora')
 * - Gavetas Condicionais (com suporte interno a Texto, Radio Button, Checkbox, Slide, Data/Hora)
 */

export async function parseAnyFile(file) {
  const name = (file?.name || '').toLowerCase();

  if (name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return parseTextToQuestions(result.value || '');
  }

  if (name.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    // Tenta extrair via mammoth caso seja docx renomeado; senão extrai strings legíveis do binário .doc
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 10) {
        return parseTextToQuestions(result.value);
      }
    } catch (e) {}
    const text = extractReadableTextFromBinaryDoc(arrayBuffer);
    return parseTextToQuestions(text);
  }

  if (name.endsWith('.csv')) {
    const csvText = await file.text();
    return parseCsvToQuestions(csvText);
  }

  const rawText = await file.text();
  return parseJsonOrText(rawText);
}

export async function parseDocxFile(file) {
  return parseAnyFile(file);
}

function extractReadableTextFromBinaryDoc(arrayBuffer) {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(arrayBuffer);
  // Filtra sequências de texto legíveis
  const cleaned = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, '\n')
    .split(/\r?\n/)
    .map(l => l.replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim())
    .filter(l => l.length > 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(l))
    .join('\n');
  return cleaned;
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

  // Verifica se tem cabeçalho tipo: Pergunta; Tipo; Opcoes; Gaveta
  const header = rows[0].map(h => h.toLowerCase());
  const hasHeader = header.some(h => h.includes('pergunta') || h.includes('titulo') || h.includes('question'));
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const screens = [];

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

    const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star', 'Sparkles'];
    const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];

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
      opcoes: opcoes.length > 0 ? opcoes : getDefaultOptionsForType(detectedType)
    });
  });

  if (screens.length === 0) {
    return parseTextToQuestions(csvText);
  }

  return buildConfigFromParsedScreens(screens);
}

export function parseJsonOrText(content) {
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.opcoesChegada || parsed.telasExtras || parsed.items) {
        return normalizeImportedConfig(parsed);
      }
    } catch (e) {}
  }

  return parseTextToQuestions(String(content || ''));
}

/**
 * Importa diretamente a partir do Link Público de um Google Forms (docs.google.com/forms/d/e/.../viewform ou forms.gle/...)
 * Extrai a estrutura real das perguntas (FB_PUBLIC_LOAD_DATA_) via proxies públicos de leitura HTML
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
    } catch (e) {
      // Tenta o próximo proxy
    }
  }

  if (!html) {
    throw new Error('Não foi possível acessar o link diretamente pelo navegador (o formulário pode estar restrito ou privado). Dica: Abra o Google Forms, pressione Ctrl+A e Ctrl+C e cole o texto na caixa abaixo!');
  }

  return parseGoogleFormsHtml(html);
}

export function parseGoogleFormsHtml(html) {
  // 1. Tenta extrair o JSON nativo do Google Forms: var FB_PUBLIC_LOAD_DATA_ = [...];
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

      // Tipos internos do Google Forms:
      // 0 = Texto Curto, 1 = Parágrafo (Texto Longo), 2 = Múltipla Escolha (Radio/Cards),
      // 3 = Lista Suspensa (Dropdown), 4 = Caixas de Seleção (Checkbox), 5 = Escala Linear (Slider),
      // 7 = Grade, 8 = Quebra de Seção/Página, 9 = Data, 10 = Hora
      rawItems.forEach((item, idx) => {
        if (!Array.isArray(item)) return;
        const qTitle = (item[1] || '').trim();
        const qDesc = (item[2] || '').trim();
        const gType = item[3];
        const qDetails = item[4]?.[0];

        if (!qTitle || gType === 8 || gType === 6) return; // Ignora cabeçalhos puros sem pergunta

        let tipo = 'cards';
        let opcoes = [];
        let sliderMin = 1;
        let sliderMax = 5;

        if (gType === 0) {
          tipo = 'texto_curto';
        } else if (gType === 1) {
          tipo = 'texto';
        } else if (gType === 2) {
          // Múltipla escolha única
          const rawChoices = qDetails?.[1] || [];
          tipo = rawChoices.length <= 6 ? 'cards' : 'radio';
          opcoes = rawChoices.map((c, oIdx) => ({
            id: `gf_opt_${idx}_${oIdx}`,
            titulo: String(c?.[0] || `Opção ${oIdx + 1}`).trim(),
            subtitulo: '',
            ativo: true,
            icone: icones[oIdx % icones.length],
            cor: cores[oIdx % cores.length],
            temGaveta: Boolean(c?.[4]), // Opção "Outro" no Google Forms vira Gaveta!
            gaveta: c?.[4] ? {
              tipo: 'texto_curto',
              pergunta: 'Especifique:',
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
            sliderMin = Number(rawScale[0]?.[0] ?? 1);
            sliderMax = Number(rawScale[rawScale.length - 1]?.[0] ?? 10);
          }
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
          opcoes: opcoes.length > 0 ? opcoes : getDefaultOptionsForType(tipo)
        });
      });

      if (screens.length > 0) {
        const built = buildConfigFromParsedScreens(screens);
        if (formDescription) {
          built.pergunta1TextoAbaixo = formDescription;
        }
        built.importedFormTitle = formTitle;
        return built;
      }
    } catch (err) {
      console.warn('Falha ao decodificar FB_PUBLIC_LOAD_DATA_:', err);
    }
  }

  // Fallback: Extrai textos visíveis do HTML caso o script tenha formato diferente
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

  throw new Error('Não encontramos perguntas públicas neste link. Verifique se o link está aberto para "Qualquer pessoa com o link".');
}

/**
 * Classificador Inteligente (IA Semântica) que identifica o tipo de componente ideal
 * baseado no enunciado da pergunta, tags colchetes [checkbox], [slide], [data], etc.
 */
export function detectQuestionTypeAI(questionText, explicitTag = '', optionsHint = '') {
  const combined = `${questionText} ${explicitTag} ${optionsHint}`.toLowerCase();

  // Tags explícitas ou palavras-chave diretas
  if (/\[(?:checkbox|caixas|multipla|múltipla|marque todas|várias)\]/i.test(combined) ||
      /\b(?:marque todas|selecione todas|mais de uma opção|quais dos|quais áreas|quais ministérios)\b/i.test(combined)) {
    return 'checkbox';
  }

  if (/\[(?:radio|única|unica|bolinha)\]/i.test(combined)) {
    return 'radio';
  }

  if (/\[(?:dropdown|lista|select|suspensa)\]/i.test(combined) ||
      /\b(?:lista suspensa|selecione na lista|escolha seu estado|escolha sua cidade|qual sua faixa etária|qual seu departamento)\b/i.test(combined)) {
    return 'dropdown';
  }

  if (/\[(?:slide|slider|escala|nps|0-10|nota)\]/i.test(combined) ||
      /\b(?:de 0 a 10|de 1 a 10|escala de|qual a probabilidade|nível de satisfação|nota para)\b/i.test(combined)) {
    return 'slider';
  }

  if (/\[(?:estrelas|rating|stars|1-5)\]/i.test(combined) ||
      /\b(?:quantas estrelas|avalie com estrelas|de 1 a 5 estrelas)\b/i.test(combined)) {
    return 'rating';
  }

  if (/\[(?:data|date|calendario|calendário)\]/i.test(combined) ||
      /\b(?:qual a data|data de nascimento|data do evento|que dia|aniversário)\b/i.test(combined)) {
    return 'data';
  }

  if (/\[(?:hora|time|horário|horario)\]/i.test(combined) ||
      /\b(?:qual o horário|que horas|melhor horário|hora de chegada)\b/i.test(combined)) {
    return 'hora';
  }

  if (/\[(?:texto curto|curto|nome|telefone|whatsapp|email|e-mail)\]/i.test(combined) ||
      /\b(?:seu nome|seu telefone|seu whatsapp|seu e-mail|seu bairro|sua cidade|qual seu nome)\b/i.test(combined)) {
    return 'texto_curto';
  }

  if (/\[(?:texto|texto longo|campo longo|dissertativa|parágrafo|paragrafo|digitar)\]/i.test(combined) ||
      /\b(?:deixe sua mensagem|sua sugestão|seu comentário|escreva abaixo|descreva|pedido de oração|o que podemos melhorar)\b/i.test(combined)) {
    return 'texto';
  }

  return 'cards';
}

function getSmartPlaceholder(tipo, titulo = '') {
  const t = titulo.toLowerCase();
  if (tipo === 'texto_curto') {
    if (t.includes('nome')) return 'Digite seu nome completo...';
    if (t.includes('whatsapp') || t.includes('telefone') || t.includes('celular')) return '(00) 00000-0000';
    if (t.includes('email') || t.includes('e-mail')) return 'seuemail@exemplo.com';
    return 'Digite sua resposta curta...';
  }
  if (tipo === 'texto') {
    return 'Escreva aqui sua resposta detalhada, comentário ou sugestão...';
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
 * Analisa uma linha de opção e detecta se há Gaveta Condicional e qual o tipo da gaveta:
 * Ex: "Sim (Gaveta Radio: Manhã | Tarde | Noite)"
 * Ex: "Quero participar (Gaveta Checkbox: Louvor | Recepção | Mídia)"
 * Ex: "Sim (Gaveta Slide: Qual sua disponibilidade de 0 a 10?)"
 * Ex: "Sim (Gaveta: Qual seu pedido de oração?)"
 */
function parseOptionWithDrawerAI(cleanOption, extraGavetaHint = '') {
  let optionTitle = cleanOption;
  let temGaveta = false;
  let gavetaTipo = 'texto_longo';
  let gavetaPergunta = 'Por favor, detalhe sua resposta:';
  let gavetaOpcoes = ['Opção 1', 'Opção 2', 'Opção 3'];

  const fullStr = extraGavetaHint ? `${cleanOption} (Gaveta: ${extraGavetaHint})` : cleanOption;

  const gavetaMatch =
    fullStr.match(/\((?:gaveta|subpergunta|se sim|condição|detalhe|especifique)([^:)]*):\s*(.*?)\)/i) ||
    fullStr.match(/->\s*(?:gaveta)?([^:]*):\s*(.*)$/i);

  if (gavetaMatch) {
    temGaveta = true;
    const修饰 = (gavetaMatch[1] || '').toLowerCase();
    const conteudo = (gavetaMatch[2] || '').trim();
    optionTitle = cleanOption.replace(gavetaMatch[0], '').trim();

    if (修饰.includes('radio') || 修饰.includes('única')) {
      gavetaTipo = 'radio';
    } else if (修饰.includes('check') || 修饰.includes('múltipla')) {
      gavetaTipo = 'checkbox';
    } else if (修饰.includes('slide') || 修饰.includes('escala')) {
      gavetaTipo = 'slider';
    } else if (修饰.includes('curto') || 修饰.includes('nome') || 修饰.includes('whats')) {
      gavetaTipo = 'texto_curto';
    } else if (修饰.includes('data')) {
      gavetaTipo = 'data';
    } else if (修饰.includes('hora')) {
      gavetaTipo = 'hora';
    }

    // Se o conteúdo tiver barras "|" ou "/", extrai pergunta e opções para radio/checkbox
    if (conteudo.includes('|') || (conteudo.includes('/') && !conteudo.includes('?'))) {
      const parts = conteudo.split('?');
      if (parts.length > 1) {
        gavetaPergunta = parts[0].trim() + '?';
        gavetaOpcoes = parts[1].split(/[|\/]/).map(s => s.trim()).filter(Boolean);
      } else {
        gavetaPergunta = 'Selecione uma opção:';
        gavetaOpcoes = conteudo.split(/[|\/]/).map(s => s.trim()).filter(Boolean);
      }
      if (gavetaTipo === 'texto_longo') gavetaTipo = 'radio';
    } else {
      gavetaPergunta = conteudo || 'Por favor, detalhe sua resposta:';
    }
  } else if (/^(?:sim|quero|desejo|preciso|outro)\b/i.test(cleanOption) && (cleanOption.includes(':') || cleanOption.includes('?'))) {
    const parts = cleanOption.split(/[:\?]/);
    if (parts.length > 1 && parts[1].trim().length > 0) {
      temGaveta = true;
      optionTitle = parts[0].trim();
      gavetaPergunta = parts.slice(1).join(' ').trim();
      if (/whatsapp|telefone|nome|celular/i.test(gavetaPergunta)) {
        gavetaTipo = 'texto_curto';
      }
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

export function parseTextToQuestions(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    throw new Error('O arquivo ou texto está vazio.');
  }

  const screens = [];
  let currentScreen = null;

  const isQuestionLine = (line) => {
    return /^(?:(?:Pergunta|Questão|Tela)\s*)?\d+[\.\)\-:]\s*|\bQ\d+[\.\)\-:]\s*/i.test(line) ||
      (line.endsWith('?') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('[') && !line.startsWith('('));
  };

  const isOptionLine = (line) => {
    return /^[-*•–—\+]\s+/i.test(line) ||
      /^(?:\[\s*[xX]?\s*\]|\(\s*[oO•]?\s*\)|[a-hA-H][\.\)\-])\s+/i.test(line);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isQuestionLine(line)) {
      if (currentScreen) {
        screens.push(currentScreen);
      }

      const detectedType = detectQuestionTypeAI(line);
      const cleanTitle = line
        .replace(/^(?:(?:Pergunta|Questão|Tela)\s*)?\d+[\.\)\-:]\s*|\bQ\d+[\.\)\-:]\s*/i, '')
        .replace(/\[.*?\]/g, '')
        .trim();

      currentScreen = {
        id: `tela_import_${Date.now()}_${screens.length + 1}`,
        tipo: detectedType,
        titulo: cleanTitle || 'Pergunta',
        titulo1: cleanTitle || 'Pergunta',
        titulo2: '',
        subtitulo: '',
        placeholder: getSmartPlaceholder(detectedType, cleanTitle),
        multiline: detectedType === 'texto',
        linhas: detectedType === 'texto' ? 4 : 1,
        sliderMin: 0,
        sliderMax: 10,
        sliderStep: 1,
        opcoes: []
      };
    } else if (currentScreen && isOptionLine(line)) {
      // Se a opção começa com [ ], sugere checkbox; se começa com ( ), sugere radio
      if (/^\[\s*[xX]?\s*\]/.test(line) && currentScreen.tipo === 'cards') {
        currentScreen.tipo = 'checkbox';
      } else if (/^\(\s*[oO•]?\s*\)/.test(line) && currentScreen.tipo === 'cards') {
        currentScreen.tipo = 'radio';
      }

      const cleanOption = line
        .replace(/^[-*•–—\+]\s+|^\[\s*[xX]?\s*\]\s*|^\(\s*[oO•]?\s*\)\s*|^[a-hA-H][\.\)\-]\s+/i, '')
        .trim();

      const parsedOpt = parseOptionWithDrawerAI(cleanOption);
      const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star', 'Sparkles'];
      const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];
      const optIdx = currentScreen.opcoes.length;

      currentScreen.opcoes.push({
        id: `opt_import_${Date.now()}_${optIdx + 1}`,
        titulo: parsedOpt.titulo,
        subtitulo: '',
        ativo: true,
        icone: icones[optIdx % icones.length],
        cor: cores[optIdx % cores.length],
        temGaveta: parsedOpt.temGaveta,
        gaveta: parsedOpt.gaveta
      });
    } else if (currentScreen && !currentScreen.subtitulo && !isOptionLine(line)) {
      currentScreen.subtitulo = line;
    }
  }

  if (currentScreen) {
    screens.push(currentScreen);
  }

  if (screens.length === 0) {
    const detectedType = detectQuestionTypeAI(lines[0]);
    const fallbackOpcoes = lines.slice(1).map((l, idx) => {
      const parsedOpt = parseOptionWithDrawerAI(l.replace(/^[-*•]\s*/, '').trim());
      return {
        id: `opt_fb_${idx + 1}`,
        titulo: parsedOpt.titulo,
        subtitulo: '',
        ativo: true,
        icone: 'Tag',
        cor: 'amber',
        temGaveta: parsedOpt.temGaveta,
        gaveta: parsedOpt.gaveta
      };
    });

    screens.push({
      id: `tela_import_fallback`,
      tipo: detectedType,
      titulo: lines[0] || 'Pergunta Importada',
      titulo1: lines[0] || 'Pergunta Importada',
      titulo2: '',
      subtitulo: '',
      opcoes: fallbackOpcoes.length > 0 ? fallbackOpcoes : getDefaultOptionsForType(detectedType)
    });
  }

  return buildConfigFromParsedScreens(screens);
}

function buildConfigFromParsedScreens(screens) {
  const tela1 = screens[0];
  const telasExtras = screens.slice(1);

  return {
    isBlankEvent: false,
    pergunta1Titulo: tela1?.titulo || '',
    pergunta1Titulo2: tela1?.titulo2 || '',
    pergunta1TextoAbaixo: tela1?.subtitulo || '',
    pergunta1BotaoComecarTexto: 'COMEÇAR',
    mostrarBotaoComecar: true,
    pergunta1FonteTamanho: 18,
    tela1Tipo: tela1?.tipo || 'cards',
    tela1TextoPlaceholder: tela1?.placeholder || 'Digite sua resposta...',
    opcoesChegada: (tela1?.opcoes && tela1.opcoes.length > 0) ? tela1.opcoes : [],
    mostrarTelaAcompanhantes: false,
    telasExtras: telasExtras.map((t, idx) => ({
      id: t.id || `extra_${idx}`,
      ativa: true,
      tipo: t.tipo || 'cards',
      titulo: t.titulo || `Pergunta ${idx + 2}`,
      titulo1: t.titulo1 || t.titulo || `Pergunta ${idx + 2}`,
      titulo2: t.titulo2 || '',
      subtitulo: t.subtitulo || '',
      placeholder: t.placeholder || 'Digite sua resposta...',
      multiline: t.tipo === 'texto',
      linhas: t.linhas || 4,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      cardsPorTela: 4,
      sliderMin: t.sliderMin ?? 0,
      sliderMax: t.sliderMax ?? 10,
      sliderStep: t.sliderStep ?? 1,
      opcoes: (t.opcoes && t.opcoes.length > 0) ? t.opcoes : getDefaultOptionsForType(t.tipo)
    }))
  };
}

function normalizeImportedConfig(data) {
  return {
    pergunta1Titulo: data.pergunta1Titulo || data.titulo || 'Pergunta Principal',
    pergunta1Titulo2: data.pergunta1Titulo2 || '',
    opcoesChegada: Array.isArray(data.opcoesChegada) ? data.opcoesChegada : [],
    telasExtras: Array.isArray(data.telasExtras) ? data.telasExtras : []
  };
}
