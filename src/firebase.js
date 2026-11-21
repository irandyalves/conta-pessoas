import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

const STORAGE_KEY = 'church_firebase_config';
const LOCAL_DATA_KEY = 'church_local_attendance_data';
const EVENT_STORAGE_KEY = 'church_event_title';
const SESSION_STORAGE_KEY = 'church_session_started';
export const DEFAULT_EVENT_TITLE = 'CANTATA DE NATAL 2026';

export const DEFAULT_QUESTIONS_CONFIG = {
  // Tela 1
  pergunta1Titulo: 'Como você chegou aqui?',
  pergunta1Titulo2: '', // Titulo 2 para quebrar o titulo
  pergunta1Subtitulo: '',
  pergunta1FonteTamanho: 18,
  cardsPorTela: 4, // Slider: quantidade de cards exibidos por tela/slide no celular (2 a 6)
  
  // Customizações Visuais dos Cards
  cardFonteTitulo: 16, // px (12 a 24)
  cardFonteSubtitulo: 12, // px (10 a 18)
  cardAltura: 82, // px (60 a 130)
  cardFundoEstilo: 'escuro', // 'escuro' | 'gradiente' | 'vidro' | 'azul_profundo' | 'esmeralda_suave' | 'dourado_suave'
  cardCorFonteTitulo: 'branco', // 'branco' | 'dourado' | 'esmeralda' | 'azul' | 'amarelo'
  cardCorFonteSubtitulo: 'cinza', // 'cinza' | 'cinza_claro' | 'branco_suave' | 'dourado_suave'

  // Configuração da Tela Inicial (Espera / Start do Admin)
  esperaLinha1: 'DENTRO DE INSTANTES',
  esperaLinha2: 'ESTARÁ LIBERADO',
  esperaLinha3: 'PARA RESPONDER.',
  esperaLinha1Tamanho: 26, // px
  esperaLinha2Tamanho: 26, // px
  esperaLinha3Tamanho: 26, // px
  esperaFonteTamanho: 26, // fallback

  // Configuração da Tela Final (Agradecimento)
  finalTitulo1: 'MUITO OBRIGADO',
  finalTitulo2: 'PELA SUA PRESENÇA.',
  finalTitulo: 'MUITO OBRIGADO PELA SUA PRESENÇA.',
  finalTituloFonteTamanho: 26, // px
  finalMensagem: 'será espetacular!',
  finalMensagemFonteTamanho: 16, // px
  finalStatus: 'REGISTRO CONCLUÍDO!',
  finalStatusFonteTamanho: 18, // px
  finalInstrucao: 'pode guardar seu celular',
  finalInstrucaoFonteTamanho: 13, // px
  finalFonteTamanho: 26, // fallback

  opcoesChegada: [
    {
      id: 'faixa',
      titulo: 'Vi a faixa na frente da igreja',
      subtitulo: 'Passei e vi o anúncio na fachada',
      ativo: true,
      icone: 'Tag',
      cor: 'amber'
    },
    {
      id: 'membro',
      titulo: 'Sou membro da igreja',
      subtitulo: 'Já congrego nesta comunidade',
      ativo: true,
      icone: 'Church',
      cor: 'sky'
    },
    {
      id: 'convidado',
      titulo: 'Fui convidado(a)',
      subtitulo: 'Vim por convite de amigo, irmão ou familiar',
      ativo: true,
      icone: 'HeartHandshake',
      cor: 'emerald'
    },
    {
      id: 'redes',
      titulo: 'Redes Sociais / Internet',
      subtitulo: 'Instagram, YouTube, Google ou WhatsApp',
      ativo: true,
      icone: 'Share2',
      cor: 'purple'
    },
    {
      id: 'outro',
      titulo: 'Passando em frente / Outro motivo',
      subtitulo: 'Curiosidade, visita espontânea ou retorno',
      ativo: true,
      icone: 'Compass',
      cor: 'indigo'
    }
  ],
  // Telas Adicionais Configuráveis (vazio por padrão - criadas quando o usuário clica em + Inserir Tela)
  telasExtras: [],
  // Tela 2 (Acompanhantes)
  pergunta2Titulo: 'Você está só ou tem mais pessoas te acompanhando?',
  pergunta2Titulo2: '',
  pergunta2Subtitulo: '',
  pergunta2FonteTamanho: 18,
  opcaoIndividualTitulo: 'SÓ EU',
  opcaoIndividualSubtitulo: ', vim sozinho',
  divisorQtdTexto: 'Quantas pessoas vieram com você?',

  // Estilo e Dimensões dos Botões Numéricos (Tela 2 - Acompanhantes)
  btnQtdAltura: 74, // px (48 a 100)
  btnQtdCor: 'slate', // 10 cores: 'slate' | 'esmeralda' | 'azul' | 'dourado' | 'roxo' | 'vermelho' | 'ciano' | 'laranja' | 'rosa' | 'indigo'
  btnQtdFonteNumero: 34, // px (18 a 48)
  btnQtdCorNumero: 'branco' // 'branco' | 'dourado' | 'amarelo' | 'esmeralda' | 'azul' | 'laranja' | 'rosa' | 'preto'
};

const QUESTIONS_STORAGE_KEY = 'church_questions_config';

// Configuração padrão do Firebase conectada ao projeto oficial
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "conta-pessoas-iasd",
  appId: "1:779442735598:web:945db2c8e75004f76566ff",
  storageBucket: "conta-pessoas-iasd.firebasestorage.app",
  apiKey: "AIzaSyC4JJV16nhbFVEnl3xPT0mXuqjw5e99N9o",
  authDomain: "conta-pessoas-iasd.firebaseapp.com",
  messagingSenderId: "779442735598",
  projectNumber: "779442735598",
};

export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler config do Firebase do localStorage', e);
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  window.location.reload();
}

let db = null;
let app = null;

const currentConfig = getSavedFirebaseConfig();
if (currentConfig && currentConfig.apiKey && currentConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    db = getFirestore(app);
    console.log('🔥 Firebase conectado ao projeto:', currentConfig.projectId);
  } catch (err) {
    console.warn('Erro ao inicializar Firebase:', err);
  }
}

export function isFirebaseReady() {
  return db !== null;
}

// ==========================================
// CONFIGURAÇÃO DO EVENTO (TÍTULO CONFIGURÁVEL)
// ==========================================
export function getSavedEventTitle() {
  try {
    return localStorage.getItem(EVENT_STORAGE_KEY) || DEFAULT_EVENT_TITLE;
  } catch (e) {
    return DEFAULT_EVENT_TITLE;
  }
}

export async function saveEventTitle(title) {
  const cleanTitle = (title || DEFAULT_EVENT_TITLE).trim();
  localStorage.setItem(EVENT_STORAGE_KEY, cleanTitle);
  window.dispatchEvent(new CustomEvent('church_event_title_changed', { detail: cleanTitle }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'configuracoes', 'evento'), {
        titulo: cleanTitle,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar título no Firestore:', e);
    }
  }
}

export function escutarTituloEvento(callback) {
  callback(getSavedEventTitle());

  const localHandler = (e) => callback(e.detail || getSavedEventTitle());
  window.addEventListener('church_event_title_changed', localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'configuracoes', 'evento'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.titulo) {
            localStorage.setItem(EVENT_STORAGE_KEY, data.titulo);
            callback(data.titulo);
          }
        }
      });
      return () => {
        unsub();
        window.removeEventListener('church_event_title_changed', localHandler);
      };
    } catch (e) {
      console.warn('Erro no listener de título do Firestore:', e);
    }
  }

  return () => window.removeEventListener('church_event_title_changed', localHandler);
}

// ==========================================
// CONTROLE DE SESSÃO / START DO ADMIN
// ==========================================
export function getSavedSessionStatus() {
  try {
    const val = localStorage.getItem(SESSION_STORAGE_KEY);
    // Por padrão no primeiro carregamento: se não definido, false (aguardando o admin dar start)
    return val === 'true';
  } catch (e) {
    return false;
  }
}

export async function saveSessionStatus(started) {
  const isStarted = Boolean(started);
  const now = new Date().toISOString();
  // Quando o admin ativa (START), gera um sessaoId novo para identificar a rodada de votação
  const sessaoId = isStarted ? `sessao_${Date.now()}` : null;
  localStorage.setItem(SESSION_STORAGE_KEY, String(isStarted));
  if (isStarted) {
    localStorage.setItem('church_session_started_at', now);
    localStorage.setItem('church_session_id', sessaoId);
  }
  
  const payload = {
    ativa: isStarted,
    sessaoId: isStarted ? sessaoId : null,
    iniciadoEm: isStarted ? now : null
  };

  window.dispatchEvent(new CustomEvent('church_session_status_changed', { 
    detail: payload 
  }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'configuracoes', 'sessao'), {
        ...payload,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
      console.log('✅ Sessão salva no Firestore com status:', isStarted, 'sessaoId:', sessaoId);
    } catch (e) {
      console.error('❌ Erro ao salvar status da sessao no Firestore:', e);
      throw e;
    }
  }
}

export function escutarStatusSessao(callback) {
  const localAtiva = getSavedSessionStatus();
  const localIniciadoEm = localStorage.getItem('church_session_started_at') || null;
  const localSessaoId = localStorage.getItem('church_session_id') || null;
  callback(localAtiva, { ativa: localAtiva, iniciadoEm: localIniciadoEm, sessaoId: localSessaoId });

  const localHandler = (e) => {
    const detail = e.detail;
    if (typeof detail === 'object' && detail !== null) {
      callback(Boolean(detail.ativa), detail);
    } else {
      callback(Boolean(detail), { ativa: Boolean(detail) });
    }
  };
  window.addEventListener('church_session_status_changed', localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(
        doc(db, 'configuracoes', 'sessao'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const ativa = Boolean(data?.ativa);
            const iniciadoEm = data?.iniciadoEm || null;
            const sessaoId = data?.sessaoId || (ativa ? 'sessao_ativa' : null);
            localStorage.setItem(SESSION_STORAGE_KEY, String(ativa));
            if (iniciadoEm) {
              localStorage.setItem('church_session_started_at', iniciadoEm);
            }
            if (sessaoId) {
              localStorage.setItem('church_session_id', sessaoId);
            }
            console.log('📡 [Realtime Firestore] Sessão ativa:', ativa, 'sessaoId:', sessaoId);
            callback(ativa, { ativa, iniciadoEm, sessaoId });
          } else {
            console.log('📡 [Realtime Firestore] Doc de sessão inexistente, padrão: false');
            callback(false, { ativa: false, iniciadoEm: null, sessaoId: null });
          }
        },
        (error) => {
          console.error('❌ Erro no listener de sessão do Firestore:', error);
        }
      );
      return () => {
        unsub();
        window.removeEventListener('church_session_status_changed', localHandler);
      };
    } catch (e) {
      console.warn('Erro ao escutar sessao no Firestore:', e);
    }
  }

  return () => window.removeEventListener('church_session_status_changed', localHandler);
}

// ==========================================
// NORMALIZAÇÃO DE CONFIGURAÇÕES DE PERGUNTAS
// ==========================================
function normalizeQuestionsConfig(config) {
  if (!config) return DEFAULT_QUESTIONS_CONFIG;
  const merged = { ...DEFAULT_QUESTIONS_CONFIG, ...config };
  
  // Garantir que cardsPorTela seja um número válido entre 2 e 6
  merged.cardsPorTela = Number(merged.cardsPorTela) || 4;
  if (merged.cardsPorTela < 2) merged.cardsPorTela = 2;
  if (merged.cardsPorTela > 8) merged.cardsPorTela = 8;

  // Garantir fontes e tamanhos dos cards
  merged.cardFonteTitulo = Number(merged.cardFonteTitulo) || 16;
  if (merged.cardFonteTitulo < 12) merged.cardFonteTitulo = 12;
  if (merged.cardFonteTitulo > 28) merged.cardFonteTitulo = 28;

  merged.cardFonteSubtitulo = Number(merged.cardFonteSubtitulo) || 12;
  if (merged.cardFonteSubtitulo < 9) merged.cardFonteSubtitulo = 9;
  if (merged.cardFonteSubtitulo > 20) merged.cardFonteSubtitulo = 20;

  merged.cardAltura = Number(merged.cardAltura) || 82;
  if (merged.cardAltura < 50) merged.cardAltura = 50;
  if (merged.cardAltura > 150) merged.cardAltura = 150;

  // Fundo e cores de fontes dos cards
  merged.cardFundoEstilo = merged.cardFundoEstilo || 'escuro';
  merged.cardCorFonteTitulo = merged.cardCorFonteTitulo || 'branco';
  merged.cardCorFonteSubtitulo = merged.cardCorFonteSubtitulo || 'cinza';

  // Garantir tela inicial (espera)
  merged.esperaLinha1 = (merged.esperaLinha1 || 'DENTRO DE INSTANTES').trim();
  merged.esperaLinha2 = (merged.esperaLinha2 || 'ESTARÁ LIBERADO').trim();
  merged.esperaLinha3 = (merged.esperaLinha3 || 'PARA RESPONDER.').trim();
  const baseEspera = Number(merged.esperaFonteTamanho) || 26;
  merged.esperaLinha1Tamanho = Number(merged.esperaLinha1Tamanho) || baseEspera;
  merged.esperaLinha2Tamanho = Number(merged.esperaLinha2Tamanho) || baseEspera;
  merged.esperaLinha3Tamanho = Number(merged.esperaLinha3Tamanho) || baseEspera;
  merged.esperaFonteTamanho = baseEspera;

  // Garantir tela final (agradecimento) com Titulo 1 e Titulo 2 para quebrar
  if (!merged.finalTitulo1 && !merged.finalTitulo2) {
    if (merged.finalTitulo && merged.finalTitulo.includes('PELA SUA PRESENÇA')) {
      merged.finalTitulo1 = 'MUITO OBRIGADO';
      merged.finalTitulo2 = 'PELA SUA PRESENÇA.';
    } else {
      merged.finalTitulo1 = merged.finalTitulo || 'MUITO OBRIGADO';
      merged.finalTitulo2 = '';
    }
  } else {
    merged.finalTitulo1 = (merged.finalTitulo1 || '').trim();
    merged.finalTitulo2 = (merged.finalTitulo2 || '').trim();
  }
  merged.finalTitulo = `${merged.finalTitulo1} ${merged.finalTitulo2}`.trim() || 'MUITO OBRIGADO PELA SUA PRESENÇA.';
  merged.finalMensagem = (merged.finalMensagem || 'será espetacular!').trim();
  merged.finalStatus = (merged.finalStatus || 'REGISTRO CONCLUÍDO!').trim();
  merged.finalInstrucao = (merged.finalInstrucao || 'pode guardar seu celular').trim();

  const baseFinal = Number(merged.finalFonteTamanho) || 26;
  merged.finalTituloFonteTamanho = Number(merged.finalTituloFonteTamanho) || baseFinal;
  merged.finalMensagemFonteTamanho = Number(merged.finalMensagemFonteTamanho) || 16;
  merged.finalStatusFonteTamanho = Number(merged.finalStatusFonteTamanho) || 18;
  merged.finalInstrucaoFonteTamanho = Number(merged.finalInstrucaoFonteTamanho) || 13;
  merged.finalFonteTamanho = merged.finalTituloFonteTamanho;

  // Tela 1 e Tela 2 (Perguntas)
  merged.pergunta1Titulo = merged.pergunta1Titulo || 'Como você chegou aqui?';
  merged.pergunta1Titulo2 = merged.pergunta1Titulo2 || '';
  merged.pergunta1FonteTamanho = Number(merged.pergunta1FonteTamanho) || 18;

  merged.pergunta2Titulo = merged.pergunta2Titulo || 'Você está só ou tem mais pessoas te acompanhando?';
  merged.pergunta2Titulo2 = merged.pergunta2Titulo2 || '';
  merged.pergunta2FonteTamanho = Number(merged.pergunta2FonteTamanho) || 18;

  // Botões Numéricos da Tela 2 (Acompanhantes)
  merged.btnQtdAltura = Number(merged.btnQtdAltura) || 74;
  if (merged.btnQtdAltura < 40) merged.btnQtdAltura = 40;
  if (merged.btnQtdAltura > 120) merged.btnQtdAltura = 120;

  merged.btnQtdCor = merged.btnQtdCor || 'slate';

  merged.btnQtdFonteNumero = Number(merged.btnQtdFonteNumero) || 34;
  if (merged.btnQtdFonteNumero < 16) merged.btnQtdFonteNumero = 16;
  if (merged.btnQtdFonteNumero > 56) merged.btnQtdFonteNumero = 56;

  merged.btnQtdCorNumero = merged.btnQtdCorNumero || 'branco';

  // Garantir que cada opção tenha o campo 'ativo' e 'id'
  if (Array.isArray(merged.opcoesChegada)) {
    merged.opcoesChegada = merged.opcoesChegada.map((op, idx) => ({
      id: op.id || `card_${idx + 1}`,
      titulo: op.titulo || '',
      subtitulo: op.subtitulo || '',
      ativo: op.ativo !== false,
      icone: op.icone || 'Tag',
      cor: op.cor || 'amber'
    }));
  } else {
    merged.opcoesChegada = DEFAULT_QUESTIONS_CONFIG.opcoesChegada;
  }

  // Garantir telas extras (somente telas reais criadas pelo usuário, sem telas fantasmas)
  if (!Array.isArray(merged.telasExtras)) {
    merged.telasExtras = [];
  } else {
    merged.telasExtras = merged.telasExtras
      .filter(t => t && t.id !== 'extra_1') // remove tela fantasma antiga
      .map((tela, idx) => ({
        id: tela.id || `extra_${idx + 1}`,
        ativa: true,
        titulo: tela.titulo || `Pergunta da Tela ${idx + 2}`,
        subtitulo: tela.subtitulo || '',
        cardsPorTela: Number(tela.cardsPorTela) || 3,
        opcoes: Array.isArray(tela.opcoes) ? tela.opcoes.map((op, oIdx) => ({
          id: op.id || `opt_${oIdx + 1}`,
          titulo: op.titulo || '',
          subtitulo: op.subtitulo || '',
          ativo: op.ativo !== false,
          icone: op.icone || 'Sparkles',
          cor: op.cor || 'emerald'
        })) : []
      }));
  }

  return merged;
}

// ==========================================
// CONFIGURAÇÃO DAS PERGUNTAS E SUBTÍTULOS
// ==========================================
export function getSavedQuestionsConfig() {
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (raw) {
      return normalizeQuestionsConfig(JSON.parse(raw));
    }
  } catch (e) {
    console.error('Erro ao ler perguntas do localStorage:', e);
  }
  return DEFAULT_QUESTIONS_CONFIG;
}

export async function saveQuestionsConfig(config) {
  const normalized = normalizeQuestionsConfig(config);
  localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('church_questions_changed', { detail: normalized }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'configuracoes', 'perguntas'), {
        ...normalized,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar perguntas no Firestore:', e);
    }
  }
}

export function escutarConfigPerguntas(callback) {
  callback(getSavedQuestionsConfig());

  const localHandler = (e) => callback(normalizeQuestionsConfig(e.detail));
  window.addEventListener('church_questions_changed', localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'configuracoes', 'perguntas'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const normalized = normalizeQuestionsConfig(data);
            localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(normalized));
            callback(normalized);
          }
        }
      });
      return () => {
        unsub();
        window.removeEventListener('church_questions_changed', localHandler);
      };
    } catch (e) {
      console.warn('Erro no listener de perguntas do Firestore:', e);
    }
  }

  return () => window.removeEventListener('church_questions_changed', localHandler);
}

// ==========================================
// RESET GLOBAL PARA DESTRAVAR APARELHOS
// ==========================================
export function escutarResetGlobal(callback) {
  if (isFirebaseReady()) {
    try {
      return onSnapshot(doc(db, 'configuracoes', 'reset'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.resetEm) {
            callback(data.resetEm);
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao escutar reset:', e);
    }
  }
  return () => {};
}

// ==========================================
// REGISTRO DE PRESENÇAS
// ==========================================
function getLocalData() {
  try {
    const data = localStorage.getItem(LOCAL_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalData(items) {
  try {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('church_local_data_changed'));
  } catch (e) {
    console.error(e);
  }
}

export async function registrarPresenca({ comoChegou, qtdPessoas, evento = '', respostasExtras = {} }) {
  const nomeEvento = evento || getSavedEventTitle();
  const payload = {
    comoChegou,
    qtdPessoas: Number(qtdPessoas) || 1,
    evento: nomeEvento,
    respostasExtras: respostasExtras || {},
    criadoEm: new Date().toISOString(),
    dataCulto: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };

  if (isFirebaseReady()) {
    try {
      const docRef = await addDoc(collection(db, 'presencas'), {
        ...payload,
        timestamp: serverTimestamp(),
      });
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Erro ao salvar no Firestore, usando fallback local:', error);
      const local = getLocalData();
      const localItem = { id: 'loc_' + Date.now(), ...payload };
      local.unshift(localItem);
      saveLocalData(local);
      return localItem;
    }
  } else {
    const local = getLocalData();
    const localItem = { id: 'loc_' + Date.now(), ...payload };
    local.unshift(localItem);
    saveLocalData(local);
    return localItem;
  }
}

export function escutarPresencas(callback) {
  if (isFirebaseReady()) {
    try {
      const q = query(collection(db, 'presencas'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              ...data,
              criadoEm: data.criadoEm || new Date().toISOString(),
            });
          });
          callback(items);
        },
        (error) => {
          console.error('Erro no listener do Firestore:', error);
          callback(getLocalData());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error('Falha ao registrar listener Firestore:', e);
      callback(getLocalData());
      return () => {};
    }
  } else {
    const handler = () => callback(getLocalData());
    window.addEventListener('church_local_data_changed', handler);
    callback(getLocalData());
    return () => window.removeEventListener('church_local_data_changed', handler);
  }
}

export function limparDadosLocais() {
  localStorage.removeItem(LOCAL_DATA_KEY);
  window.dispatchEvent(new Event('church_local_data_changed'));
}

// ZERA TUDO NO FIRESTORE E NOTIFICA TODOS OS APARELHOS
export async function zerarTudo() {
  limparDadosLocais();
  localStorage.removeItem('presenca_dispositivo_bloqueado_voto');
  localStorage.removeItem('presenca_dispositivo_hora_voto');
  localStorage.removeItem('presenca_finalizada_cantata_2026');
  localStorage.removeItem('presenca_hora_registro');
  localStorage.removeItem('presenca_votou_sessao_id');

  if (isFirebaseReady()) {
    try {
      const snap = await getDocs(collection(db, 'presencas'));
      const promises = [];
      snap.forEach((d) => {
        promises.push(deleteDoc(doc(db, 'presencas', d.id)));
      });
      await Promise.all(promises);

      const resetEm = new Date().toISOString();
      const resetId = `reset_${Date.now()}`;
      // Marca o reset global no Firestore
      await setDoc(doc(db, 'configuracoes', 'reset'), {
        resetEm,
        resetId
      }, { merge: true });

      // Atualiza também a sessão com novo sessaoId para destravar imediatamente qualquer celular conectado
      const novaSessaoId = `sessao_${Date.now()}`;
      await setDoc(doc(db, 'configuracoes', 'sessao'), {
        sessaoId: novaSessaoId,
        iniciadoEm: resetEm
      }, { merge: true });
    } catch (e) {
      console.error('Erro ao zerar banco Firestore:', e);
    }
  }
}
