import mammoth from 'mammoth';

/**
 * Utilitário de Importação Inteligente de Formulários e Avaliações
 * Suporta:
 * 1. Arquivos Word (.docx)
 * 2. Arquivos de texto (.txt, .json, .csv)
 * 3. Texto colado de Google Forms / Docs
 */

export async function parseDocxFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  return parseTextToQuestions(rawText);
}

export function parseJsonOrText(content) {
  // Se for JSON estruturado (ex: export de Google Forms ou backup do sistema)
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.opcoesChegada || parsed.telasExtras || parsed.items) {
        return normalizeImportedConfig(parsed);
      }
    } catch (e) {
      // Segue para parser de texto
    }
  }

  return parseTextToQuestions(String(content || ''));
}

/**
 * Parser de texto livre para perguntas e gavetas condicionais
 * Reconhece formatos comuns como:
 * 1. Você precisa de ajuda?
 *   - Sim (Gaveta: Qual tipo de ajuda?)
 *   - Não
 * 2. O que você achou do evento? [Texto]
 */
export function parseTextToQuestions(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    throw new Error('O arquivo ou texto está vazio.');
  }

  const screens = [];
  let currentScreen = null;

  const isQuestionLine = (line) => {
    // Detecta "1. Pergunta", "1) Pergunta", "Pergunta:", "Pergunta?"
    return /^(?:(?:Pergunta\s*)?\d+[\.\)\-:]\s*|\bQ\d+[\.\)\-:]\s*)/i.test(line) ||
      (line.endsWith('?') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('['));
  };

  const isOptionLine = (line) => {
    return /^[-*•–—\+]\s+/i.test(line) ||
      /^(?:\[\s*\]|\(\s*\)|[a-eA-E][\.\)\-])\s+/i.test(line);
  };

  const isTextQuestion = (line) => {
    return /\b(?:texto|digitar|dissertativa|resposta curta|parágrafo|escreva|opinião|mensagem)\b/i.test(line) ||
      /\[\s*(?:texto|resposta|digitar)\s*\]/i.test(line);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isQuestionLine(line)) {
      if (currentScreen) {
        screens.push(currentScreen);
      }

      const cleanTitle = line
        .replace(/^(?:(?:Pergunta\s*)?\d+[\.\)\-:]\s*|\bQ\d+[\.\)\-:]\s*)/i, '')
        .replace(/\[.*?\]/g, '')
        .trim();

      const isText = isTextQuestion(line);

      currentScreen = {
        id: `tela_import_${Date.now()}_${screens.length + 1}`,
        tipo: isText ? 'texto' : 'cards',
        titulo: cleanTitle || 'Pergunta',
        titulo1: cleanTitle || 'Pergunta',
        titulo2: '',
        subtitulo: '',
        placeholder: isText ? 'Digite sua resposta aqui...' : '',
        multiline: isText,
        linhas: 3,
        opcoes: []
      };
    } else if (currentScreen && isOptionLine(line) && currentScreen.tipo === 'cards') {
      const cleanOption = line
        .replace(/^[-*•–—\+]\s+|^\[\s*\]\s*|^\(\s*\)\s*|^[a-eA-E][\.\)\-]\s+/i, '')
        .trim();

      // Checa se tem gaveta condicional anotada ex: "Sim (Gaveta: Qual tipo de ajuda?)"
      // ou "Sim -> Descreva o motivo" ou "Sim: Qual o motivo?"
      let optionTitle = cleanOption;
      let temGaveta = false;
      let gavetaPergunta = '';
      let gavetaTipo = 'texto';

      const gavetaMatch = cleanOption.match(/\((?:gaveta|se sim|condição|detalhe|especifique):\s*(.*?)\)/i) ||
                          cleanOption.match(/->\s*(?:gaveta:)?\s*(.*)$/i);

      if (gavetaMatch) {
        temGaveta = true;
        gavetaPergunta = gavetaMatch[1].trim();
        optionTitle = cleanOption.replace(gavetaMatch[0], '').trim();
      } else if (/^(?:sim|yes|quero|desejo|preciso)\b/i.test(cleanOption) && (cleanOption.includes(':') || cleanOption.includes('?'))) {
        const parts = cleanOption.split(/[:\?]/);
        if (parts.length > 1 && parts[1].trim().length > 0) {
          temGaveta = true;
          optionTitle = parts[0].trim();
          gavetaPergunta = parts.slice(1).join(' ').trim();
        }
      }

      const icones = ['Tag', 'Church', 'HeartHandshake', 'Share2', 'Compass', 'Smile', 'Star'];
      const cores = ['amber', 'emerald', 'sky', 'purple', 'indigo', 'rose'];
      const optIdx = currentScreen.opcoes.length;

      currentScreen.opcoes.push({
        id: `opt_import_${Date.now()}_${optIdx + 1}`,
        titulo: optionTitle || 'Opção',
        subtitulo: '',
        ativo: true,
        icone: icones[optIdx % icones.length],
        cor: cores[optIdx % cores.length],
        temGaveta,
        gaveta: temGaveta ? {
          tipo: gavetaTipo,
          pergunta: gavetaPergunta || 'Por favor, detalhe sua resposta:',
          placeholder: 'Digite aqui...',
          obrigatorio: false,
          linhas: 3,
          botaoConfirmar: 'Confirmar & Continuar'
        } : null
      });
    } else if (currentScreen && !currentScreen.subtitulo && !isOptionLine(line)) {
      currentScreen.subtitulo = line;
    }
  }

  if (currentScreen) {
    screens.push(currentScreen);
  }

  // Se não identificou pelo padrão de números, cria uma tela com as opções
  if (screens.length === 0) {
    const fallbackOpcoes = lines.slice(1).map((l, idx) => ({
      id: `opt_fb_${idx + 1}`,
      titulo: l.replace(/^[-*•]\s*/, '').trim(),
      subtitulo: '',
      ativo: true,
      icone: 'Tag',
      cor: 'amber'
    }));

    screens.push({
      id: `tela_import_fallback`,
      tipo: 'cards',
      titulo: lines[0] || 'Pergunta Importada',
      titulo1: lines[0] || 'Pergunta Importada',
      titulo2: '',
      subtitulo: '',
      opcoes: fallbackOpcoes.length > 0 ? fallbackOpcoes : [
        { id: 'opt_1', titulo: 'Opção 1', subtitulo: '', ativo: true, icone: 'Tag', cor: 'amber' },
        { id: 'opt_2', titulo: 'Opção 2', subtitulo: '', ativo: true, icone: 'Church', cor: 'sky' }
      ]
    });
  }

  return buildConfigFromParsedScreens(screens);
}

function buildConfigFromParsedScreens(screens) {
  // A primeira tela vira a pergunta 1 (ou Tela 1)
  const tela1 = screens[0];
  const telasExtras = screens.slice(1);

  return {
    pergunta1Titulo: tela1?.titulo || 'Como você chegou aqui?',
    pergunta1Titulo2: tela1?.titulo2 || '',
    pergunta1FonteTamanho: 18,
    tela1Tipo: tela1?.tipo || 'cards',
    tela1TextoPlaceholder: tela1?.placeholder || 'Digite sua resposta...',
    opcoesChegada: (tela1?.opcoes && tela1.opcoes.length > 0) ? tela1.opcoes : [
      { id: 'opt_1', titulo: 'Opção 1', subtitulo: '', ativo: true, icone: 'Tag', cor: 'amber' },
      { id: 'opt_2', titulo: 'Opção 2', subtitulo: '', ativo: true, icone: 'Church', cor: 'sky' }
    ],
    telasExtras: telasExtras.map((t, idx) => ({
      id: t.id || `extra_${idx}`,
      tipo: t.tipo || 'cards',
      titulo: t.titulo || `Pergunta ${idx + 2}`,
      titulo1: t.titulo1 || t.titulo || `Pergunta ${idx + 2}`,
      titulo2: t.titulo2 || '',
      subtitulo: t.subtitulo || '',
      placeholder: t.placeholder || 'Digite sua resposta...',
      multiline: t.multiline !== false,
      linhas: t.linhas || 3,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      cardsPorTela: 4,
      opcoes: t.opcoes || []
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
