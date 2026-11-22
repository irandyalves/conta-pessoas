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
  getDoc,
  getDocs,
  deleteDoc,
  where
} from 'firebase/firestore';

const STORAGE_KEY = 'church_firebase_config';
const LOCAL_DATA_KEY = 'church_local_attendance_data';
const EVENT_STORAGE_KEY = 'church_event_title';
const SESSION_STORAGE_KEY = 'church_session_started';
export const DEFAULT_EVENT_TITLE = 'CANTATA DE NATAL 2026';
export const DEFAULT_EVENT_ID = 'cantata-natal-2026';
const EVENT_ID_KEY = 'church_current_event_id';
const EVENTOS_LISTA_KEY = 'church_eventos_lista';

export function getActiveEventId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('e') || params.get('evento') || params.get('event');
    if (fromUrl) {
      const clean = fromUrl.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      return clean;
    }
    // No painel admin (view=admin), recupera o último evento selecionado
    if (params.get('view') === 'admin') {
      const saved = localStorage.getItem(EVENT_ID_KEY);
      if (saved) return saved.trim();
    }
  } catch (e) {}
  return DEFAULT_EVENT_ID;
}

export function setActiveEventId(eventId) {
  if (!eventId) return;
  const clean = eventId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  localStorage.setItem(EVENT_ID_KEY, clean);
  window.dispatchEvent(new CustomEvent('church_event_id_changed', { detail: clean }));
}

export function getSavedEventosLista() {
  try {
    const raw = localStorage.getItem(EVENTOS_LISTA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { id: 'cantata-natal-2026', titulo: 'CANTATA DE NATAL 2026', ativo: true, sessaoAtiva: false },
    { id: 'culto-domingo', titulo: 'CULTO DE CELEBRAÇÃO', ativo: false, sessaoAtiva: false }
  ];
}

export async function salvarEventosLista(lista) {
  if (!Array.isArray(lista)) return;
  localStorage.setItem(EVENTOS_LISTA_KEY, JSON.stringify(lista));
  window.dispatchEvent(new CustomEvent('church_eventos_lista_changed', { detail: lista }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'configuracoes', 'eventos_lista'), {
        lista,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar lista de eventos no Firestore:', e);
    }
  }
}

export function escutarEventosLista(callback) {
  callback(getSavedEventosLista());

  const localHandler = (e) => callback(e.detail || getSavedEventosLista());
  window.addEventListener('church_eventos_lista_changed', localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'configuracoes', 'eventos_lista'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.lista)) {
            localStorage.setItem(EVENTOS_LISTA_KEY, JSON.stringify(data.lista));
            callback(data.lista);
          }
        }
      });
      return () => {
        unsub();
        window.removeEventListener('church_eventos_lista_changed', localHandler);
      };
    } catch (e) {
      console.warn('Erro ao escutar eventos lista no Firestore:', e);
    }
  }

  return () => window.removeEventListener('church_eventos_lista_changed', localHandler);
}

export async function criarNovoEvento(id, titulo, presetConfig = null) {
  const cleanId = (id || `evento_${Date.now()}`).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanTitle = (titulo || cleanId.toUpperCase()).trim();
  const listaAtual = getSavedEventosLista();
  
  const existe = listaAtual.find(e => e.id === cleanId);
  const novaLista = existe 
    ? listaAtual.map(e => e.id === cleanId ? { ...e, titulo: cleanTitle } : e)
    : [...listaAtual, { id: cleanId, titulo: cleanTitle, ativo: true }];

  await salvarEventosLista(novaLista);
  setActiveEventId(cleanId);
  await saveEventTitle(cleanTitle, cleanId);

  if (presetConfig) {
    await saveQuestionsConfig(presetConfig, cleanId);
  }

  return { id: cleanId, titulo: cleanTitle };
}

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
  cardFundoEstilo: 'escuro', // 16 opções de cores/degradês
  cardEfeitoEstilo: 'padrao', // 'padrao' | 'efeito_3d' | 'vidro' | 'entalhe' | 'alto_relevo' | 'glow'
  cardProfundidade: 5, // 1 a 10 (intensidade/profundidade do relevo/sombra)
  cardCorFonteTitulo: 'branco', // 'branco' | 'dourado' | 'esmeralda' | 'azul' | 'amarelo' ...
  cardCorFonteSubtitulo: 'cinza', // 'cinza' | 'cinza_claro' | 'branco_suave' | 'dourado_suave' ...

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
  btnQtdEfeito: 'efeito_3d', // 'padrao' | 'efeito_3d' | 'vidro' | 'entalhe' | 'alto_relevo' | 'glow'
  btnQtdProfundidade: 5, // 1 a 10 (intensidade/profundidade do relevo/sombra)
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
export function getSavedEventTitle(targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  try {
    const specific = localStorage.getItem(`${EVENT_STORAGE_KEY}_${eventId}`);
    if (specific) return specific;
    if (eventId === DEFAULT_EVENT_ID) {
      return localStorage.getItem(EVENT_STORAGE_KEY) || DEFAULT_EVENT_TITLE;
    }
    const lista = getSavedEventosLista();
    const ev = lista.find(e => e.id === eventId);
    if (ev?.titulo) return ev.titulo;
  } catch (e) {}
  return DEFAULT_EVENT_TITLE;
}

export async function saveEventTitle(title, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  const cleanTitle = (title || DEFAULT_EVENT_TITLE).trim();
  localStorage.setItem(`${EVENT_STORAGE_KEY}_${eventId}`, cleanTitle);
  if (eventId === DEFAULT_EVENT_ID) {
    localStorage.setItem(EVENT_STORAGE_KEY, cleanTitle);
  }

  // Atualiza na lista de eventos locais
  const lista = getSavedEventosLista();
  const novaLista = lista.map(e => e.id === eventId ? { ...e, titulo: cleanTitle } : e);
  if (!lista.some(e => e.id === eventId)) {
    novaLista.push({ id: eventId, titulo: cleanTitle, ativo: true });
  }
  localStorage.setItem(EVENTOS_LISTA_KEY, JSON.stringify(novaLista));

  window.dispatchEvent(new CustomEvent(`church_event_title_changed_${eventId}`, { detail: cleanTitle }));
  window.dispatchEvent(new CustomEvent('church_event_title_changed', { detail: cleanTitle }));
  window.dispatchEvent(new CustomEvent('church_eventos_lista_changed', { detail: novaLista }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'eventos_titulos', eventId), {
        titulo: cleanTitle,
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      if (eventId === DEFAULT_EVENT_ID) {
        await setDoc(doc(db, 'configuracoes', 'evento'), {
          titulo: cleanTitle,
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }

      await salvarEventosLista(novaLista);
    } catch (e) {
      console.warn('Erro ao salvar título no Firestore:', e);
    }
  }
}

export function escutarTituloEvento(callback, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  callback(getSavedEventTitle(eventId));

  const localHandler = (e) => callback(e.detail || getSavedEventTitle(eventId));
  window.addEventListener(`church_event_title_changed_${eventId}`, localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'eventos_titulos', eventId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.titulo) {
            localStorage.setItem(`${EVENT_STORAGE_KEY}_${eventId}`, data.titulo);
            callback(data.titulo);
            return;
          }
        }
        if (eventId === DEFAULT_EVENT_ID) {
          getDoc(doc(db, 'configuracoes', 'evento')).then(legacySnap => {
            if (legacySnap?.exists() && legacySnap.data()?.titulo) {
              callback(legacySnap.data().titulo);
            }
          }).catch(() => {});
        }
      });
      return () => {
        unsub();
        window.removeEventListener(`church_event_title_changed_${eventId}`, localHandler);
      };
    } catch (e) {
      console.warn('Erro no listener de título do Firestore:', e);
    }
  }

  return () => window.removeEventListener(`church_event_title_changed_${eventId}`, localHandler);
}

// ==========================================
// CONTROLE DE SESSÃO / START / PAUSAR POR EVENTO
// ==========================================
export function getSavedSessionStatus(targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  try {
    const val = localStorage.getItem(`${SESSION_STORAGE_KEY}_${eventId}`);
    if (val !== null) return val === 'true';
    if (eventId === DEFAULT_EVENT_ID) {
      const legacy = localStorage.getItem(SESSION_STORAGE_KEY);
      return legacy === 'true';
    }
    const lista = getSavedEventosLista();
    const ev = lista.find(e => e.id === eventId);
    if (ev && typeof ev.sessaoAtiva === 'boolean') {
      return ev.sessaoAtiva;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function saveSessionStatus(started, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  const isStarted = Boolean(started);
  const now = new Date().toISOString();
  const sessaoId = isStarted ? `sessao_${eventId}_${Date.now()}` : null;

  localStorage.setItem(`${SESSION_STORAGE_KEY}_${eventId}`, String(isStarted));
  if (isStarted) {
    localStorage.setItem(`church_session_started_at_${eventId}`, now);
    localStorage.setItem(`church_session_id_${eventId}`, sessaoId);
  } else {
    localStorage.removeItem(`church_session_started_at_${eventId}`);
    localStorage.removeItem(`church_session_id_${eventId}`);
  }

  if (eventId === DEFAULT_EVENT_ID) {
    localStorage.setItem(SESSION_STORAGE_KEY, String(isStarted));
    if (isStarted) {
      localStorage.setItem('church_session_started_at', now);
      localStorage.setItem('church_session_id', sessaoId);
    } else {
      localStorage.removeItem('church_session_started_at');
      localStorage.removeItem('church_session_id');
    }
  }

  // Atualiza também na lista de eventos para exibição global
  const lista = getSavedEventosLista();
  const novaLista = lista.map(e => e.id === eventId ? { ...e, sessaoAtiva: isStarted } : e);
  if (!lista.some(e => e.id === eventId)) {
    novaLista.push({ id: eventId, titulo: eventId.toUpperCase(), ativo: true, sessaoAtiva: isStarted });
  }
  localStorage.setItem(EVENTOS_LISTA_KEY, JSON.stringify(novaLista));

  const payload = {
    ativa: isStarted,
    sessaoId: isStarted ? sessaoId : null,
    iniciadoEm: isStarted ? now : null,
    eventId
  };

  window.dispatchEvent(new CustomEvent(`church_session_status_changed_${eventId}`, { detail: payload }));
  window.dispatchEvent(new CustomEvent('church_session_status_changed', { detail: payload }));
  window.dispatchEvent(new CustomEvent('church_eventos_lista_changed', { detail: novaLista }));

  if (isFirebaseReady()) {
    try {
      // Salva sessão exclusiva do evento
      await setDoc(doc(db, 'sessoes_eventos', eventId), {
        ...payload,
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      // Se for o evento default, mantém sincronizado também no legado
      if (eventId === DEFAULT_EVENT_ID) {
        await setDoc(doc(db, 'configuracoes', 'sessao'), {
          ...payload,
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }

      // Atualiza também a lista geral com o status sessaoAtiva de cada evento
      await setDoc(doc(db, 'configuracoes', 'eventos_lista'), {
        lista: novaLista,
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      console.log(`✅ [${eventId}] Sessão salva no Firestore:`, isStarted, 'sessaoId:', sessaoId);
    } catch (e) {
      console.error(`❌ Erro ao salvar status da sessão de ${eventId} no Firestore:`, e);
      throw e;
    }
  }
}

export function escutarStatusSessao(callback, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  const localAtiva = getSavedSessionStatus(eventId);
  const localIniciadoEm = localStorage.getItem(`church_session_started_at_${eventId}`) || null;
  const localSessaoId = localStorage.getItem(`church_session_id_${eventId}`) || null;
  callback(localAtiva, { ativa: localAtiva, iniciadoEm: localIniciadoEm, sessaoId: localSessaoId, eventId });

  const localHandler = (e) => {
    const detail = e.detail;
    if (typeof detail === 'object' && detail !== null) {
      callback(Boolean(detail.ativa), detail);
    } else {
      callback(Boolean(detail), { ativa: Boolean(detail), eventId });
    }
  };
  window.addEventListener(`church_session_status_changed_${eventId}`, localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(
        doc(db, 'sessoes_eventos', eventId),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const ativa = Boolean(data?.ativa);
            const iniciadoEm = data?.iniciadoEm || null;
            const sessaoId = data?.sessaoId || (ativa ? `sessao_${eventId}` : null);
            localStorage.setItem(`${SESSION_STORAGE_KEY}_${eventId}`, String(ativa));
            if (iniciadoEm) {
              localStorage.setItem(`church_session_started_at_${eventId}`, iniciadoEm);
            }
            if (sessaoId) {
              localStorage.setItem(`church_session_id_${eventId}`, sessaoId);
            }
            console.log(`📡 [Realtime Firestore] [${eventId}] Sessão ativa:`, ativa, 'sessaoId:', sessaoId);
            callback(ativa, { ativa, iniciadoEm, sessaoId, eventId });
          } else if (eventId === DEFAULT_EVENT_ID) {
            // Fallback legado se ainda não tiver em sessoes_eventos
            getDoc(doc(db, 'configuracoes', 'sessao')).then((legSnap) => {
              if (legSnap?.exists()) {
                const legData = legSnap.data();
                const ativa = Boolean(legData?.ativa);
                callback(ativa, { ativa, iniciadoEm: legData?.iniciadoEm, sessaoId: legData?.sessaoId, eventId });
              } else {
                callback(false, { ativa: false, iniciadoEm: null, sessaoId: null, eventId });
              }
            }).catch(() => {});
          } else {
            callback(false, { ativa: false, iniciadoEm: null, sessaoId: null, eventId });
          }
        },
        (error) => {
          console.error(`❌ Erro no listener de sessão do Firestore para ${eventId}:`, error);
        }
      );
      return () => {
        unsub();
        window.removeEventListener(`church_session_status_changed_${eventId}`, localHandler);
      };
    } catch (e) {
      console.warn(`Erro ao escutar sessao de ${eventId} no Firestore:`, e);
    }
  }

  return () => window.removeEventListener(`church_session_status_changed_${eventId}`, localHandler);
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

  // Fundo, efeitos e cores de fontes dos cards
  merged.cardFundoEstilo = merged.cardFundoEstilo || 'escuro';
  merged.cardEfeitoEstilo = merged.cardEfeitoEstilo || 'padrao';
  merged.cardProfundidade = Number(merged.cardProfundidade) || 5;
  if (merged.cardProfundidade < 1) merged.cardProfundidade = 1;
  if (merged.cardProfundidade > 10) merged.cardProfundidade = 10;
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
  merged.btnQtdEfeito = merged.btnQtdEfeito || 'efeito_3d';
  merged.btnQtdProfundidade = Number(merged.btnQtdProfundidade) || 5;
  if (merged.btnQtdProfundidade < 1) merged.btnQtdProfundidade = 1;
  if (merged.btnQtdProfundidade > 10) merged.btnQtdProfundidade = 10;

  merged.btnQtdFonteNumero = Number(merged.btnQtdFonteNumero) || 34;
  if (merged.btnQtdFonteNumero < 16) merged.btnQtdFonteNumero = 16;
  if (merged.btnQtdFonteNumero > 56) merged.btnQtdFonteNumero = 56;

  merged.btnQtdCorNumero = merged.btnQtdCorNumero || 'branco';

  merged.tela1Tipo = merged.tela1Tipo || 'cards';
  merged.tela1TextoPlaceholder = merged.tela1TextoPlaceholder || 'Digite sua resposta aqui...';

  // Garantir que cada opção tenha o campo 'ativo', 'id' e suporte a gaveta condicional
  if (Array.isArray(merged.opcoesChegada)) {
    merged.opcoesChegada = merged.opcoesChegada.map((op, idx) => ({
      id: op.id || `card_${idx + 1}`,
      titulo: op.titulo || '',
      subtitulo: op.subtitulo || '',
      ativo: op.ativo !== false,
      icone: op.icone || 'Tag',
      cor: op.cor || 'amber',
      temGaveta: Boolean(op.temGaveta),
      gaveta: op.temGaveta ? {
        tipo: op.gaveta?.tipo || 'texto',
        pergunta: op.gaveta?.pergunta || 'Por favor, detalhe sua resposta:',
        placeholder: op.gaveta?.placeholder || 'Digite sua resposta aqui...',
        obrigatorio: Boolean(op.gaveta?.obrigatorio),
        linhas: Number(op.gaveta?.linhas) || 3,
        botaoConfirmar: op.gaveta?.botaoConfirmar || 'Confirmar & Continuar',
        opcoes: Array.isArray(op.gaveta?.opcoes) ? op.gaveta.opcoes : []
      } : null
    }));
  } else {
    merged.opcoesChegada = DEFAULT_QUESTIONS_CONFIG.opcoesChegada;
  }

  // Garantir telas extras (somente telas reais criadas pelo usuário, cards ou dissertativas)
  if (!Array.isArray(merged.telasExtras)) {
    merged.telasExtras = [];
  } else {
    merged.telasExtras = merged.telasExtras
      .filter(t => t && t.id !== 'extra_1') // remove tela fantasma antiga
      .map((tela, idx) => ({
        id: tela.id || `extra_${idx + 1}`,
        ativa: true,
        tipo: tela.tipo || 'cards', // 'cards' ou 'texto' (dissertativa/aberta)
        titulo: tela.titulo || `Pergunta da Tela ${idx + 2}`,
        titulo1: tela.titulo1 || tela.titulo || `Pergunta da Tela ${idx + 2}`,
        titulo2: tela.titulo2 || '',
        subtitulo: tela.subtitulo || '',
        placeholder: tela.placeholder || 'Digite sua resposta aqui...',
        multiline: tela.multiline !== false,
        linhas: Number(tela.linhas) || 4,
        obrigatorio: Boolean(tela.obrigatorio),
        botaoTexto: tela.botaoTexto || 'Avançar',
        cardsPorTela: Number(tela.cardsPorTela) || 3,
        opcoes: Array.isArray(tela.opcoes) ? tela.opcoes.map((op, oIdx) => ({
          id: op.id || `opt_${oIdx + 1}`,
          titulo: op.titulo || '',
          subtitulo: op.subtitulo || '',
          ativo: op.ativo !== false,
          icone: op.icone || 'Sparkles',
          cor: op.cor || 'emerald',
          temGaveta: Boolean(op.temGaveta),
          gaveta: op.temGaveta ? {
            tipo: op.gaveta?.tipo || 'texto',
            pergunta: op.gaveta?.pergunta || 'Por favor, detalhe sua resposta:',
            placeholder: op.gaveta?.placeholder || 'Digite sua resposta aqui...',
            obrigatorio: Boolean(op.gaveta?.obrigatorio),
            linhas: Number(op.gaveta?.linhas) || 3,
            botaoConfirmar: op.gaveta?.botaoConfirmar || 'Confirmar & Continuar',
            opcoes: Array.isArray(op.gaveta?.opcoes) ? op.gaveta.opcoes : []
          } : null
        })) : []
      }));
  }

  return merged;
}

// ==========================================
// CONFIGURAÇÃO DAS PERGUNTAS E SUBTÍTULOS POR EVENTO
// ==========================================
export function getSavedQuestionsConfig(targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  try {
    const rawSpecific = localStorage.getItem(`${QUESTIONS_STORAGE_KEY}_${eventId}`);
    if (rawSpecific) {
      return normalizeQuestionsConfig(JSON.parse(rawSpecific));
    }
    if (eventId === DEFAULT_EVENT_ID) {
      const rawLegacy = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (rawLegacy) {
        return normalizeQuestionsConfig(JSON.parse(rawLegacy));
      }
    }
  } catch (e) {
    console.error('Erro ao ler perguntas do localStorage:', e);
  }
  return DEFAULT_QUESTIONS_CONFIG;
}

export async function saveQuestionsConfig(config, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  const normalized = normalizeQuestionsConfig(config);
  localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${eventId}`, JSON.stringify(normalized));
  if (eventId === DEFAULT_EVENT_ID) {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(normalized));
  }

  window.dispatchEvent(new CustomEvent(`church_questions_changed_${eventId}`, { detail: normalized }));
  window.dispatchEvent(new CustomEvent('church_questions_changed', { detail: normalized }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'eventos_perguntas', eventId), {
        ...normalized,
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      if (eventId === DEFAULT_EVENT_ID) {
        await setDoc(doc(db, 'configuracoes', 'perguntas'), {
          ...normalized,
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn(`Erro ao salvar perguntas de ${eventId} no Firestore:`, e);
    }
  }
}

export function escutarConfigPerguntas(callback, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  callback(getSavedQuestionsConfig(eventId));

  const localHandler = (e) => callback(normalizeQuestionsConfig(e.detail));
  window.addEventListener(`church_questions_changed_${eventId}`, localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'eventos_perguntas', eventId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const normalized = normalizeQuestionsConfig(data);
            localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${eventId}`, JSON.stringify(normalized));
            callback(normalized);
            return;
          }
        }
        if (eventId === DEFAULT_EVENT_ID) {
          getDoc(doc(db, 'configuracoes', 'perguntas')).then(legSnap => {
            if (legSnap?.exists() && legSnap.data()) {
              const legNorm = normalizeQuestionsConfig(legSnap.data());
              callback(legNorm);
            }
          }).catch(() => {});
        }
      });
      return () => {
        unsub();
        window.removeEventListener(`church_questions_changed_${eventId}`, localHandler);
      };
    } catch (e) {
      console.warn(`Erro no listener de perguntas do Firestore para ${eventId}:`, e);
    }
  }

  return () => window.removeEventListener(`church_questions_changed_${eventId}`, localHandler);
}

// ==========================================
// RESET DE DISPOSITIVOS POR EVENTO
// ==========================================
export function escutarResetGlobal(callback, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'resets_eventos', eventId), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.resetEm) {
            callback(data.resetEm);
            return;
          }
        }
        if (eventId === DEFAULT_EVENT_ID) {
          getDoc(doc(db, 'configuracoes', 'reset')).then(legacySnap => {
            if (legacySnap?.exists() && legacySnap.data()?.resetEm) {
              callback(legacySnap.data().resetEm);
            }
          }).catch(() => {});
        }
      });
      return unsub;
    } catch (e) {
      console.warn(`Erro ao escutar reset de ${eventId}:`, e);
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

export async function registrarPresenca({ 
  comoChegou, 
  qtdPessoas, 
  evento = '', 
  respostasExtras = {}, 
  gavetaRespostas = {},
  textoRespostas = {},
  eventoId = '' 
}) {
  const activeEventId = eventoId || getActiveEventId();
  const nomeEvento = evento || getSavedEventTitle(activeEventId);
  const payload = {
    eventoId: activeEventId,
    comoChegou: comoChegou || '',
    qtdPessoas: Number(qtdPessoas) || 1,
    evento: nomeEvento,
    respostasExtras: respostasExtras || {},
    gavetaRespostas: gavetaRespostas || {},
    textoRespostas: textoRespostas || {},
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

export function escutarPresencas(callback, targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  if (isFirebaseReady()) {
    try {
      const q = query(collection(db, 'presencas'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Se targetEventId for especificado, filtra estritamente por eventoId
            if (!eventId || !data.eventoId || data.eventoId === eventId) {
              items.push({
                id: doc.id,
                ...data,
                criadoEm: data.criadoEm || new Date().toISOString(),
              });
            }
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

// ZERA REGISTROS POR EVENTO OU GLOBAL NO FIRESTORE
export async function zerarTudo(targetEventId = null) {
  const eventId = targetEventId || getActiveEventId();
  limparDadosLocais();
  localStorage.removeItem(`presenca_dispositivo_bloqueado_voto_${eventId}`);
  localStorage.removeItem(`presenca_dispositivo_hora_voto_${eventId}`);
  localStorage.removeItem('presenca_dispositivo_bloqueado_voto');
  localStorage.removeItem('presenca_dispositivo_hora_voto');
  localStorage.removeItem('presenca_finalizada_cantata_2026');
  localStorage.removeItem('presenca_hora_registro');
  localStorage.removeItem('presenca_votou_sessao_id');

  if (isFirebaseReady()) {
    try {
      // Se targetEventId informado, apaga somente presenças deste evento
      let snap;
      if (eventId) {
        snap = await getDocs(query(collection(db, 'presencas'), where('eventoId', '==', eventId)));
      } else {
        snap = await getDocs(collection(db, 'presencas'));
      }

      const promises = [];
      snap.forEach((d) => {
        promises.push(deleteDoc(doc(db, 'presencas', d.id)));
      });
      await Promise.all(promises);

      const resetEm = new Date().toISOString();
      const resetId = `reset_${eventId}_${Date.now()}`;
      
      // Marca o reset específico deste evento
      await setDoc(doc(db, 'resets_eventos', eventId), {
        resetEm,
        resetId,
        eventId
      }, { merge: true });

      if (eventId === DEFAULT_EVENT_ID) {
        await setDoc(doc(db, 'configuracoes', 'reset'), {
          resetEm,
          resetId
        }, { merge: true });
      }

      // Atualiza também a sessão com novo sessaoId para destravar imediatamente
      const novaSessaoId = `sessao_${eventId}_${Date.now()}`;
      await setDoc(doc(db, 'sessoes_eventos', eventId), {
        sessaoId: novaSessaoId,
        iniciadoEm: resetEm
      }, { merge: true });

      if (eventId === DEFAULT_EVENT_ID) {
        await setDoc(doc(db, 'configuracoes', 'sessao'), {
          sessaoId: novaSessaoId,
          iniciadoEm: resetEm
        }, { merge: true });
      }
    } catch (e) {
      console.error('Erro ao zerar banco Firestore:', e);
    }
  }
}
