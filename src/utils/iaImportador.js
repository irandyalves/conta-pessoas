// ==========================================
// IMPORTADOR COM IA (Gemini via Firebase AI Logic)
// Lê PDF, Word, PowerPoint, Excel, TXT, texto colado ou Google Forms
// e transforma em telas prontas para o celular.
// Se a IA não estiver disponível, usa a leitura automática (regras fixas).
// ==========================================
import { getFirebaseApp } from '../firebase';
import {
  extrairTextoDeArquivo,
  parseTextToQuestions,
  parseCsvToQuestions,
  parseGoogleFormsUrl,
  buildConfigFromParsedScreens,
  parseOptionWithDrawerAI
} from './formImporter';

export const TIPOS_TELA_IA = ['cards', 'radio', 'checkbox', 'dropdown', 'grade', 'slider', 'rating', 'texto_curto', 'texto', 'data', 'hora'];

const ICONES = ['Sparkles', 'Star', 'Tag', 'Church', 'HeartHandshake', 'Compass', 'MapPin', 'Smile'];
const CORES = ['amber', 'sky', 'emerald', 'purple', 'indigo', 'rose'];
const LIMITE_TEXTO = 60000;

const INSTRUCOES = `Você converte questionários, formulários de avaliação, pesquisas e SIMULADOS/provas
em telas de um formulário para celular. Responda SOMENTE no JSON do esquema.

REGRAS:
1. Cada pergunta vira UMA tela, na mesma ordem do documento. Não invente perguntas nem opções.
   Copie os textos exatamente (pode remover numeração como "1.", "a)", "☐", "( )").
2. "secao": o título da seção/bloco a que a pergunta pertence (ex.: "1. Perfil do participante"), ou "".
3. Tipos:
   - cards: escolha ÚNICA com até 6 opções curtas.
   - radio: escolha ÚNICA com mais de 6 opções ou opções longas (frases).
   - checkbox: quando o texto diz "marque todas", "pode marcar mais de uma", "selecione as que se aplicam".
   - dropdown: listas longas de nomes (estados, cidades, mais de 12 opções).
   - grade: TABELA/MATRIZ em que vários itens são avaliados na mesma escala (ex.: colunas 1,2,3,4,5,NA).
     "opcoes" = os itens (linhas); "colunasGrade" = os rótulos das colunas.
   - slider: escala numérica contínua (ex.: 0 a 10, NPS). Preencha sliderMin/sliderMax e rótulos das pontas.
   - rating: "de 1 a 5 estrelas".
   - texto_curto: nome, e-mail, telefone, cidade, cargo, ou uma linha "______" curta.
   - texto: pergunta aberta/dissertativa, comentários, sugestões, linhas longas "______".
   - data / hora: quando pede data ou horário.
4. Opção do tipo "Outro: ______" ou "Outro (especifique)": titulo "Outro" e temCampoOutro = true.
5. Escala com legenda (ex.: "1 = Nada relevante; 5 = Muito relevante; NA = Não se aplica"):
   coloque o texto em "legendaEscala" da tela correspondente.
6. Escala de opções numeradas tipo "1 = Nada / 2 = Pouco / ... / Não sei avaliar" é escolha única (cards ou radio)
   com o texto completo de cada opção.
7. SIMULADO/PROVA: alternativas a), b), c), (A), A. etc. são opções da pergunta (cards ou radio).
   Se houver gabarito/resposta indicada, marque "correta": true na alternativa certa. Sem gabarito, todas false.
8. "obrigatorio": true só se o documento indicar (asterisco, "obrigatório"). Seções "(opcional)" = false.
9. "titulo"/"subtitulo"/"introducao" do formulário: nome do evento/prova, subtítulo e texto de apresentação.
10. Ignore cabeçalhos, rodapés, números de página e instruções de impressão.`;

function montarSchema(Schema) {
  const opcao = Schema.object({
    properties: {
      titulo: Schema.string(),
      temCampoOutro: Schema.boolean(),
      correta: Schema.boolean()
    },
    optionalProperties: ['temCampoOutro', 'correta']
  });
  const tela = Schema.object({
    properties: {
      tipo: Schema.enumString({ enum: TIPOS_TELA_IA }),
      secao: Schema.string(),
      titulo: Schema.string(),
      descricao: Schema.string(),
      obrigatorio: Schema.boolean(),
      opcoes: Schema.array({ items: opcao }),
      colunasGrade: Schema.array({ items: Schema.string() }),
      legendaEscala: Schema.string(),
      sliderMin: Schema.integer(),
      sliderMax: Schema.integer(),
      sliderLabelMin: Schema.string(),
      sliderLabelMax: Schema.string()
    },
    optionalProperties: ['secao', 'descricao', 'obrigatorio', 'opcoes', 'colunasGrade', 'legendaEscala', 'sliderMin', 'sliderMax', 'sliderLabelMin', 'sliderLabelMax']
  });
  return Schema.object({
    properties: {
      titulo: Schema.string(),
      subtitulo: Schema.string(),
      introducao: Schema.string(),
      ehSimulado: Schema.boolean(),
      telas: Schema.array({ items: tela })
    },
    optionalProperties: ['subtitulo', 'introducao', 'ehSimulado']
  });
}

// App Check (reCAPTCHA v3): o Firebase AI Logic só aceita pedidos de apps verificados.
// Coloque a chave do site do reCAPTCHA v3 aqui (ou em VITE_RECAPTCHA_SITE_KEY no .env).
export const RECAPTCHA_SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || '';
let appCheckPronto = false;
async function garantirAppCheck(app) {
  if (appCheckPronto || !RECAPTCHA_SITE_KEY) return;
  const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
  appCheckPronto = true;
}

async function analisarComGemini(texto) {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase não configurado.');
  await garantirAppCheck(app);
  const { getAI, getGenerativeModel, GoogleAIBackend, Schema } = await import('firebase/ai');
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    systemInstruction: INSTRUCOES,
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: montarSchema(Schema)
    }
  });
  const result = await model.generateContent(`DOCUMENTO:\n"""\n${texto.slice(0, LIMITE_TEXTO)}\n"""`);
  const json = JSON.parse(result.response.text());
  if (!Array.isArray(json?.telas) || json.telas.length === 0) throw new Error('A IA não encontrou perguntas.');
  return json;
}

// ------------------------------------------
// Leitura automática de SIMULADOS e questionários numerados (sem IA)
// "1. Pergunta" / "Questão 2 -" + alternativas a) b) (C) D. / ( ) ☐ [ ]
// (na mesma linha ou uma por linha) + "Gabarito: 1-A, 2-B"
// ------------------------------------------
const RE_QUESTAO = /^\s*(?:quest[aã]o\s*)?(\d{1,3})\s*[.)\-–:]\s*(.+)$/i;
const RE_LETRA = /\(?\b([a-eA-E])\s*[).]\s+/;          // a) b. (C)
const RE_MARCA = /(?:\(\s*\)|\[\s*\]|☐|□|○)\s*/;        // ( ) [ ] ☐

function separarAlternativas(texto) {
  const t = ` ${texto}`;
  let partes = t.split(/\s(?=\(?[a-eA-E]\s*[).]\s+)/).map((p) => p.trim()).filter(Boolean);
  if (partes.length > 1 || RE_LETRA.test(partes[0] || '')) {
    const lista = [];
    partes.forEach((p) => {
      const m = p.match(/^\(?([a-eA-E])\s*[).]\s+(.+)$/);
      if (m) lista.push({ letra: m[1].toUpperCase(), titulo: m[2].trim() });
    });
    if (lista.length) return { enunciado: '', lista, tipoMarca: 'letra' };
  }
  partes = texto.split(/(?:\(\s*\)|\[\s*\]|☐|□|○)/).map((p) => p.trim());
  if (partes.length > 1) {
    return { enunciado: partes[0], lista: partes.slice(1).filter(Boolean).map((t) => ({ letra: '', titulo: t })), tipoMarca: 'marca' };
  }
  return null;
}

export function parseSimulado(texto) {
  const bruto = String(texto || '');
  const gabarito = {};
  const gabTxt = (bruto.match(/gabarito[\s\S]*$/i) || [''])[0];
  for (const m of gabTxt.matchAll(/(\d{1,3})\s*[-–:.)]\s*([a-eA-E])\b/g)) gabarito[m[1]] = m[2].toUpperCase();

  const linhas = bruto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questoes = [];
  let titulo = '';
  let atual = null;
  for (const linha of linhas) {
    if (/^gabarito/i.test(linha)) break;
    const ehAlternativa = /^\(?[a-eA-E]\s*[).]\s+/.test(linha) || RE_MARCA.test(linha.slice(0, 3));
    const q = !ehAlternativa && linha.match(RE_QUESTAO);
    if (q) {
      atual = { numero: q[1], titulo: q[2].trim(), opcoes: [] };
      const sep = separarAlternativas(atual.titulo);
      if (sep && sep.lista.length >= 2) {
        atual.titulo = sep.enunciado || atual.titulo.split(RE_MARCA)[0].trim();
        atual.opcoes.push(...sep.lista);
      }
      questoes.push(atual);
      continue;
    }
    if (!atual) {
      if (!titulo) titulo = linha;
      continue;
    }
    const sep = ehAlternativa ? separarAlternativas(linha) : null;
    if (sep) atual.opcoes.push(...sep.lista);
    else if (atual.opcoes.length === 0) atual.titulo += ' ' + linha;
    else atual.opcoes[atual.opcoes.length - 1].titulo += ' ' + linha;
  }

  const comLetras = questoes.filter((q) => q.opcoes.some((o) => o.letra)).length;
  if (questoes.length < 2 || comLetras < 1) return null;

  return {
    titulo,
    ehSimulado: Object.keys(gabarito).length > 0 || comLetras >= questoes.length * 0.6,
    telas: questoes.map((q) => {
      const enunciado = q.titulo.replace(/\s*_{3,}\s*$/, '').trim();
      if (q.opcoes.length >= 2) {
        const multipla = /marque (todas|mais de uma|quantas)|pode marcar|selecione as/i.test(q.titulo);
        const longas = q.opcoes.some((o) => o.titulo.length > 45) || q.opcoes.length > 6;
        return {
          tipo: multipla ? 'checkbox' : longas ? 'radio' : 'cards',
          titulo: enunciado,
          secao: `Questão ${q.numero}`,
          opcoes: q.opcoes.map((o) => ({
            titulo: o.titulo.replace(/\s*_{2,}\s*$/, '').replace(/:\s*$/, '').trim(),
            temCampoOutro: /^outr[oa]s?\b/i.test(o.titulo) && /:|_{2,}/.test(o.titulo),
            correta: Boolean(o.letra) && gabarito[q.numero] === o.letra
          }))
        };
      }
      const escala = q.titulo.match(/(\d{1,2})\s*(?:a|-|–|até)\s*(\d{1,2})/i);
      if (escala && Number(escala[2]) > Number(escala[1]) && Number(escala[2]) <= 10) {
        return { tipo: 'slider', titulo: enunciado, secao: `Questão ${q.numero}`, sliderMin: Number(escala[1]), sliderMax: Number(escala[2]) };
      }
      const curta = /^(nome|e-?mail|telefone|whats|celular|cidade|idade|cargo|fun[cç][aã]o)\b/i.test(enunciado);
      return { tipo: curta ? 'texto_curto' : 'texto', titulo: enunciado.replace(/:\s*$/, ''), secao: `Questão ${q.numero}` };
    })
  };
}

// ------------------------------------------
// Converte o resultado (IA ou simulado) nas telas do sistema
// ------------------------------------------
export function questionarioParaConfig(q) {
  const telas = (q.telas || []).map((t, i) => {
    let tipo = TIPOS_TELA_IA.includes(t.tipo) ? t.tipo : 'cards';
    const opcoesBrutas = (t.opcoes || []).filter((o) => String(o?.titulo || '').trim());
    if (tipo === 'cards' && (opcoesBrutas.length > 6 || opcoesBrutas.some((o) => o.titulo.length > 60))) tipo = 'radio';
    if (['cards', 'radio', 'checkbox', 'dropdown', 'grade'].includes(tipo) && opcoesBrutas.length === 0) tipo = 'texto';

    const opcoes = opcoesBrutas.map((o, oi) => {
      const base = parseOptionWithDrawerAI(o.titulo.trim());
      const temGaveta = Boolean(o.temCampoOutro) || base.temGaveta;
      return {
        id: `ia_${i + 1}_${oi + 1}`,
        titulo: (base.titulo || o.titulo).trim(),
        subtitulo: '',
        ativo: true,
        icone: ICONES[oi % ICONES.length],
        cor: CORES[oi % CORES.length],
        correta: Boolean(o.correta),
        temGaveta,
        gaveta: temGaveta ? { tipo: 'texto_curto', pergunta: 'Qual? Especifique:', placeholder: 'Digite aqui...', obrigatorio: false } : null
      };
    });

    return {
      id: `tela_ia_${i + 1}`,
      tipo,
      titulo: t.titulo,
      titulo1: t.titulo,
      titulo2: '',
      subtitulo: [t.secao, t.descricao].filter(Boolean).join(' — '),
      obrigatorio: Boolean(t.obrigatorio),
      opcoes,
      colunasGrade: tipo === 'grade' && t.colunasGrade?.length ? t.colunasGrade : undefined,
      legendaEscala: t.legendaEscala || '',
      sliderMin: t.sliderMin ?? 0,
      sliderMax: t.sliderMax ?? 10,
      sliderLabelMin: t.sliderLabelMin || '',
      sliderLabelMax: t.sliderLabelMax || '',
      cardsPorTela: Math.min(8, Math.max(4, opcoes.length))
    };
  });

  const config = buildConfigFromParsedScreens(telas, {
    eventTitle: q.titulo || '',
    eventSubtitle: q.subtitulo || '',
    introText: q.introducao || ''
  });
  // buildConfig não conhece estes campos: repassa obrigatório, rótulos do slider e alternativas corretas
  const porId = Object.fromEntries(telas.map((t) => [t.id, t]));
  config.telasExtras = (config.telasExtras || []).map((t) => ({
    ...t,
    obrigatorio: porId[t.id]?.obrigatorio ?? t.obrigatorio,
    sliderLabelMin: porId[t.id]?.sliderLabelMin || t.sliderLabelMin,
    sliderLabelMax: porId[t.id]?.sliderLabelMax || t.sliderLabelMax
  }));
  config.ehSimulado = Boolean(q.ehSimulado);
  return config;
}

// Resumo das telas para a revisão antes de aplicar
export function resumirTelas(config) {
  const telas = [];
  if ((config.opcoesChegada || []).length > 0) {
    telas.push({ tipo: 'cards', titulo: config.pergunta1Titulo, secao: config.pergunta1Subtitulo, opcoes: config.opcoesChegada.map((o) => o.titulo + (o.correta ? ' ✔' : '')) });
  }
  (config.telasExtras || []).forEach((t) => {
    telas.push({ tipo: t.tipo, titulo: t.titulo1 || t.titulo, secao: t.subtitulo, opcoes: (t.opcoes || []).map((o) => o.titulo + (o.correta ? ' ✔' : '')) });
  });
  return telas;
}

/**
 * Importa de { arquivo } | { texto } | { url } e devolve:
 * { config, motor: 'ia' | 'automatico', aviso }
 */
export async function importarQuestionario({ arquivo, texto, url, usarIA = true }) {
  if (url) {
    const config = await parseGoogleFormsUrl(url);
    return { config, motor: 'automatico', aviso: '' };
  }

  let conteudo = texto || '';
  if (arquivo) {
    if (arquivo.name?.toLowerCase().endsWith('.csv')) {
      return { config: parseCsvToQuestions(await arquivo.text()), motor: 'automatico', aviso: '' };
    }
    conteudo = await extrairTextoDeArquivo(arquivo);
  }
  conteudo = String(conteudo || '').trim();
  if (conteudo.length < 10) throw new Error('Não encontramos texto nesse arquivo. Se for um PDF escaneado (imagem), cole o texto manualmente.');

  // JSON exportado do próprio sistema
  if (/^[{[]/.test(conteudo)) {
    try {
      const data = JSON.parse(conteudo);
      if (data?.telasExtras || data?.opcoesChegada) return { config: data, motor: 'automatico', aviso: '' };
    } catch (e) {}
  }

  let aviso = '';
  if (usarIA) {
    try {
      const q = await analisarComGemini(conteudo);
      return { config: questionarioParaConfig(q), motor: 'ia', aviso: '' };
    } catch (e) {
      console.warn('IA indisponível, usando leitura automática:', e);
      const appCheck = /app check/i.test(e?.message || '');
      aviso = appCheck
        ? 'A IA está bloqueada pela proteção App Check (falta a chave reCAPTCHA). Usamos a leitura automática — revise as telas.'
        : 'A IA não respondeu (' + (e?.message || 'erro') + '). Usamos a leitura automática — revise as telas.';
    }
  }

  const simulado = parseSimulado(conteudo);
  const config = simulado ? questionarioParaConfig(simulado) : parseTextToQuestions(conteudo, arquivo?.name || '');
  return { config, motor: 'automatico', aviso };
}
