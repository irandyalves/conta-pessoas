import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

// ==========================================
// ADMINISTRADOR AUTORIZADO (LOGIN GOOGLE)
// Deve ser o MESMO e-mail usado em firestore.rules
// ==========================================
export const ADMIN_EMAILS = ['irandyalves@gmail.com'];

export function isAdminEmail(email) {
  return Boolean(email) && ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
}

const STORAGE_KEY = 'church_firebase_config';
const LOCAL_DATA_KEY = 'church_local_attendance_data';
const EVENT_STORAGE_KEY = 'church_event_title';
const SESSION_STORAGE_KEY = 'church_session_started';
export const DEFAULT_EVENT_TITLE = 'CANTATA DE NATAL 2026';
export const DEFAULT_EVENT_ID = 'cantata-natal-2026';
const EVENT_ID_KEY = 'church_current_event_id';
const EVENTOS_LISTA_KEY = 'church_eventos_lista';
const EVENTO_ATIVO_GLOBAL_KEY = 'church_evento_ativo_global';

export function sanitizeEventId(targetEventId) {
  if (typeof targetEventId === 'string' && targetEventId.trim()) {
    return targetEventId
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  return getActiveEventId();
}

export function getActiveEventId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('e') || params.get('evento') || params.get('event');
    if (fromUrl) {
      const clean = fromUrl
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return clean;
    }
    // No painel admin (view=admin), recupera o último evento selecionado
    if (params.get('view') === 'admin') {
      const saved = localStorage.getItem(EVENT_ID_KEY);
      if (saved) return saved.trim();
    }

    // Se estiver no celular/público e não tiver parâmetro, checa o evento ativo global salvo
    const globalSaved = localStorage.getItem(EVENTO_ATIVO_GLOBAL_KEY);
    if (globalSaved) {
      try {
        const parsed = JSON.parse(globalSaved);
        if (parsed?.eventId) return parsed.eventId;
      } catch (e) {}
    }
  } catch (e) {}
  return DEFAULT_EVENT_ID;
}

export function setActiveEventId(eventId) {
  if (!eventId) return;
  const clean = sanitizeEventId(eventId);
  localStorage.setItem(EVENT_ID_KEY, clean);
  window.dispatchEvent(new CustomEvent('church_event_id_changed', { detail: clean }));
}

export async function salvarEventoAtivoGlobal(eventId, titulo = '') {
  if (!eventId) return;
  const cleanId = sanitizeEventId(eventId);
  const data = {
    eventId: cleanId,
    titulo: (titulo || getSavedEventTitle(cleanId) || cleanId.toUpperCase()).trim(),
    atualizadoEm: serverTimestamp()
  };

  localStorage.setItem(EVENTO_ATIVO_GLOBAL_KEY, JSON.stringify({ eventId: cleanId, titulo: data.titulo }));
  window.dispatchEvent(new CustomEvent('church_evento_ativo_global_changed', { detail: { eventId: cleanId, titulo: data.titulo } }));

  if (isFirebaseReady()) {
    try {
      await setDoc(doc(db, 'configuracoes', 'evento_ativo_padrao'), data, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar evento ativo global no Firestore:', e);
    }
  }
}

export function escutarEventoAtivoGlobal(callback) {
  try {
    const raw = localStorage.getItem(EVENTO_ATIVO_GLOBAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.eventId) callback(parsed.eventId, parsed.titulo || '');
    }
  } catch (e) {}

  const localHandler = (e) => {
    if (e?.detail?.eventId) callback(e.detail.eventId, e.detail.titulo || '');
  };
  window.addEventListener('church_evento_ativo_global_changed', localHandler);

  if (isFirebaseReady()) {
    try {
      const unsub = onSnapshot(doc(db, 'configuracoes', 'evento_ativo_padrao'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.eventId) {
            localStorage.setItem(EVENTO_ATIVO_GLOBAL_KEY, JSON.stringify({ eventId: data.eventId, titulo: data.titulo || '' }));
            callback(data.eventId, data.titulo || '');
          }
        }
      });
      return () => {
        unsub();
        window.removeEventListener('church_evento_ativo_global_changed', localHandler);
      };
    } catch (e) {
      console.warn('Erro ao escutar evento ativo global no Firestore:', e);
    }
  }

  return () => window.removeEventListener('church_evento_ativo_global_changed', localHandler);
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

export const BLANK_QUESTIONS_CONFIG = {
  isBlankEvent: true,
  pergunta1Titulo: '',
  pergunta1Titulo2: '',
  pergunta1Subtitulo: '',
  pergunta1TextoAbaixo: '', // Texto livre digitado abaixo do título na Tela 1
  pergunta1BotaoComecarTexto: 'COMEÇAR',
  mostrarBotaoComecar: true,
  pergunta1FonteTamanho: 18,
  cardsPorTela: 4,
  cardFonteTitulo: 16,
  cardFonteSubtitulo: 12,
  cardAltura: 82,
  cardFundoEstilo: 'escuro',
  cardEfeitoEstilo: 'efeito_3d',
  cardProfundidade: 5,
  cardCorFonteTitulo: 'branco',
  cardCorFonteSubtitulo: 'cinza',
  esperaLinha1: 'DENTRO DE INSTANTES',
  esperaLinha2: 'ESTARÁ LIBERADO',
  esperaLinha3: 'PARA RESPONDER.',
  esperaLinha1Tamanho: 26,
  esperaLinha2Tamanho: 26,
  esperaLinha3Tamanho: 26,
  esperaFonteTamanho: 26,
  finalTitulo1: 'MUITO OBRIGADO',
  finalTitulo2: 'PELA SUA PRESENÇA.',
  finalTitulo: 'MUITO OBRIGADO PELA SUA PRESENÇA.',
  finalTituloFonteTamanho: 26,
  finalMensagem: 'será espetacular!',
  finalMensagemFonteTamanho: 16,
  finalStatus: 'REGISTRO CONCLUÍDO!',
  finalStatusFonteTamanho: 18,
  finalInstrucao: 'pode guardar seu celular',
  finalInstrucaoFonteTamanho: 13,
  finalFonteTamanho: 26,
  opcoesChegada: [],
  telasExtras: [],
  mostrarTelaAcompanhantes: false,
  pergunta2Titulo: '',
  pergunta2Titulo2: '',
  pergunta2Subtitulo: '',
  pergunta2FonteTamanho: 18,
  opcaoIndividualTitulo: 'SÓ EU',
  opcaoIndividualSubtitulo: ', vim sozinho',
  divisorQtdTexto: 'Quantas pessoas vieram com você?',
  btnQtdAltura: 74,
  btnQtdCor: 'slate',
  btnQtdEfeito: 'efeito_3d',
  btnQtdProfundidade: 5,
  btnQtdFonteNumero: 34,
  btnQtdCorNumero: 'branco'
};

export async function criarNovoEvento(id, titulo, presetConfig = null) {
  const cleanId = sanitizeEventId(id || (titulo ? titulo.toLowerCase() : `evento_${Date.now()}`));
  const cleanTitle = (titulo || cleanId.toUpperCase()).trim();
  const listaAtual = getSavedEventosLista();
  
  const existe = listaAtual.find(e => e.id === cleanId);
  const novaLista = existe 
    ? listaAtual.map(e => e.id === cleanId ? { ...e, titulo: cleanTitle } : e)
    : [...listaAtual, { id: cleanId, titulo: cleanTitle, ativo: true, sessaoAtiva: false }];

  await salvarEventosLista(novaLista);
  setActiveEventId(cleanId);
  await saveEventTitle(cleanTitle, cleanId);
  await salvarEventoAtivoGlobal(cleanId, cleanTitle);

  // Ao criar um evento novo, salva tudo 100% EM BRANCO (sem nenhuma pergunta pré-cadastrada)
  const initialConfig = presetConfig || {
    ...BLANK_QUESTIONS_CONFIG,
    opcoesChegada: [],
    telasExtras: []
  };
  await saveQuestionsConfig(initialConfig, cleanId);

  return { id: cleanId, titulo: cleanTitle };
}

export async function excluirEvento(id) {
  const cleanId = sanitizeEventId(id);
  const listaAtual = getSavedEventosLista();
  if (listaAtual.length <= 1) {
    throw new Error('É necessário manter pelo menos 1 evento cadastrado no sistema.');
  }

  const novaLista = listaAtual.filter(e => e.id !== cleanId);
  await salvarEventosLista(novaLista);

  // Remove dados locais deste evento
  localStorage.removeItem(`${EVENT_STORAGE_KEY}_${cleanId}`);
  localStorage.removeItem(`${SESSION_STORAGE_KEY}_${cleanId}`);
  localStorage.removeItem(`church_session_started_at_${cleanId}`);
  localStorage.removeItem(`church_session_id_${cleanId}`);
  localStorage.removeItem(`${QUESTIONS_STORAGE_KEY}_${cleanId}`);

  if (isFirebaseReady()) {
    // Apaga também as presenças do evento (antes ficavam órfãs no banco)
    await apagarPresencasDoEvento(cleanId);
    const batch = writeBatch(db);
    ['eventos_titulos', 'sessoes_eventos', 'eventos_perguntas', 'resets_eventos'].forEach((col) => {
      batch.delete(doc(db, col, cleanId));
    });
    await batch.commit();
  }

  return novaLista;
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
let auth = null;

const currentConfig = getSavedFirebaseConfig();
if (currentConfig && currentConfig.apiKey && currentConfig.projectId) {
  try {
    const isNewApp = getApps().length === 0;
    // No site publicado, o login usa o próprio domínio (evita falha do redirecionamento
    // em navegadores que bloqueiam cookies de terceiros)
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const appConfig = host.endsWith('.web.app') || host.endsWith('.firebaseapp.com')
      ? { ...currentConfig, authDomain: host }
      : currentConfig;
    app = isNewApp ? initializeApp(appConfig) : getApp();
    try {
      // Cache persistente: gravações feitas sem internet ficam guardadas no aparelho
      // e são enviadas automaticamente quando a conexão voltar (mesmo após recarregar).
      db = isNewApp
        ? initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
          })
        : getFirestore(app);
    } catch (cacheErr) {
      console.warn('Cache persistente indisponível, usando padrão:', cacheErr);
      db = getFirestore(app);
    }
    auth = getAuth(app);
  } catch (err) {
    console.warn('Erro ao inicializar Firebase:', err);
  }
}

export function getFirebaseApp() {
  return app;
}

export function isFirebaseReady() {
  return db !== null;
}

// ==========================================
// AUTENTICAÇÃO DO ADMIN (GOOGLE)
// ==========================================
export function escutarUsuarioAdmin(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  // Conclui login iniciado por redirecionamento (fallback do celular)
  getRedirectResult(auth).catch((e) => console.warn('Login por redirecionamento falhou:', e));
  return onAuthStateChanged(auth, (user) => callback(user || null));
}

export async function entrarComGoogle() {
  if (!auth) throw new Error('Firebase não está configurado.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(auth, provider);
    if (!isAdminEmail(cred.user?.email)) {
      await signOut(auth);
      throw new Error(`A conta ${cred.user?.email || ''} não tem permissão de administrador.`);
    }
    return cred.user;
  } catch (e) {
    // Popup bloqueado (comum em celulares): usa redirecionamento
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
  }
}

export async function sairAdmin() {
  if (auth) await signOut(auth);
}

// ==========================================
// CONFIGURAÇÃO DO EVENTO (TÍTULO CONFIGURÁVEL)
// ==========================================
export function getSavedEventTitle(targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
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
  const eventId = sanitizeEventId(targetEventId);
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

      await setDoc(doc(db, 'configuracoes', 'eventos_lista'), {
        lista: novaLista,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar título no Firestore:', e);
      throw e;
    }
  }
}

export function escutarTituloEvento(callback, targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
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
  const eventId = sanitizeEventId(targetEventId);
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
  const eventId = sanitizeEventId(targetEventId);
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
    novaLista.push({ id: eventId, titulo: String(eventId || '').toUpperCase(), ativo: true, sessaoAtiva: isStarted });
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
  const eventId = sanitizeEventId(targetEventId);
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
export function normalizeQuestionsConfig(config) {
  if (!config) return DEFAULT_QUESTIONS_CONFIG;
  const merged = { ...DEFAULT_QUESTIONS_CONFIG, ...config };
  
  // Garantir que cardsPorTela seja um número válido entre 2 e 15
  merged.cardsPorTela = Number(merged.cardsPorTela) || 4;
  if (merged.cardsPorTela < 2) merged.cardsPorTela = 2;
  if (merged.cardsPorTela > 15) merged.cardsPorTela = 15;

  // Garantir fontes e tamanhos dos cards
  merged.cardFonteTitulo = Number(merged.cardFonteTitulo) || 16;
  if (merged.cardFonteTitulo < 12) merged.cardFonteTitulo = 12;
  if (merged.cardFonteTitulo > 28) merged.cardFonteTitulo = 28;

  merged.cardFonteSubtitulo = Number(merged.cardFonteSubtitulo) || 12;
  if (merged.cardFonteSubtitulo < 9) merged.cardFonteSubtitulo = 9;
  if (merged.cardFonteSubtitulo > 20) merged.cardFonteSubtitulo = 20;

  merged.cardAltura = Number(merged.cardAltura) || 48;
  if (merged.cardAltura < 16) merged.cardAltura = 16;
  if (merged.cardAltura > 150) merged.cardAltura = 150;

  // Fundo, efeitos, ícones e cores de fontes dos cards
  merged.mostrarIconesCards = config.mostrarIconesCards !== undefined ? Boolean(config.mostrarIconesCards) : true;
  merged.cardFundoEstilo = merged.cardFundoEstilo || 'escuro';
  merged.cardEfeitoEstilo = merged.cardEfeitoEstilo || 'padrao';
  merged.cardProfundidade = Number(merged.cardProfundidade) || 5;
  if (merged.cardProfundidade < 1) merged.cardProfundidade = 1;
  if (merged.cardProfundidade > 10) merged.cardProfundidade = 10;
  merged.cardCorFonteTitulo = merged.cardCorFonteTitulo || 'branco';
  merged.cardCorFonteSubtitulo = merged.cardCorFonteSubtitulo || 'cinza';

  // Garantir tela inicial (espera) sem "AVALIAÇÃO DE REAÇÃO" legado
  merged.esperaLinha1 = (merged.esperaLinha1 || 'DENTRO DE INSTANTES').trim();
  const rawEspera2 = (merged.esperaLinha2 || 'ESTARÁ LIBERADO').trim();
  merged.esperaLinha2 = /avalia[cç][aã]o de rea[cç][aã]o/i.test(rawEspera2) ? 'ESTARÁ LIBERADO' : rawEspera2;
  merged.esperaLinha3 = (merged.esperaLinha3 || 'PARA RESPONDER.').trim();
  const baseEspera = Number(merged.esperaFonteTamanho) || 26;
  merged.esperaLinha1Tamanho = Number(merged.esperaLinha1Tamanho) || baseEspera;
  merged.esperaLinha2Tamanho = Number(merged.esperaLinha2Tamanho) || baseEspera;
  merged.esperaLinha3Tamanho = Number(merged.esperaLinha3Tamanho) || baseEspera;
  merged.esperaLinha1Cor = merged.esperaLinha1Cor || 'branco';
  merged.esperaLinha2Cor = merged.esperaLinha2Cor || 'dourado';
  merged.esperaLinha3Cor = merged.esperaLinha3Cor || 'verde';
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

  // Tela 1 e Tela 2 (Perguntas) - Se for evento criado em branco, preserva strings vazias e arrays vazios
  const isBlank = Boolean(config.isBlankEvent);
  merged.isBlankEvent = isBlank;
  merged.capaTitulo1 = config.capaTitulo1 !== undefined ? config.capaTitulo1 : (config.importedFormTitle || '');
  merged.capaTitulo2 = config.capaTitulo2 !== undefined ? config.capaTitulo2 : (config.importedFormSubtitle || '');
  merged.capaTitulo3 = config.capaTitulo3 || '';
  merged.capaTextoAbaixo = config.capaTextoAbaixo !== undefined ? config.capaTextoAbaixo : (config.importedIntroText || config.pergunta1TextoAbaixo || '');
  merged.capaFonteTamanho = Number(config.capaFonteTamanho) || 18;
  merged.capaTitulo1Tamanho = Number(config.capaTitulo1Tamanho) || merged.capaFonteTamanho || 18;
  merged.capaTitulo2Tamanho = Number(config.capaTitulo2Tamanho) || 16;
  merged.capaTitulo3Tamanho = Number(config.capaTitulo3Tamanho) || 15;
  merged.capaTextoAbaixoTamanho = Number(config.capaTextoAbaixoTamanho) || 14;
  merged.capaTitulo1Cor = config.capaTitulo1Cor || 'branco';
  merged.capaTitulo2Cor = config.capaTitulo2Cor || 'dourado';
  merged.capaTitulo3Cor = config.capaTitulo3Cor || 'verde';
  merged.capaTextoAbaixoCor = config.capaTextoAbaixoCor || 'cinza';
  merged.capaAlinhamento = config.capaAlinhamento || 'center';
  merged.capaCaptionFundo = config.capaCaptionFundo || 'transparente';

  merged.pergunta1Titulo = config.pergunta1Titulo !== undefined ? config.pergunta1Titulo : (isBlank ? '' : 'Como você chegou aqui?');
  merged.pergunta1Titulo2 = config.pergunta1Titulo2 || '';
  merged.pergunta1Titulo3 = config.pergunta1Titulo3 || '';
  merged.pergunta1Subtitulo = config.pergunta1Subtitulo || '';
  merged.pergunta1TextoAbaixo = config.pergunta1TextoAbaixo || '';
  merged.pergunta1BotaoComecarTexto = config.pergunta1BotaoComecarTexto || 'COMEÇAR';
  merged.mostrarBotaoComecar = config.mostrarBotaoComecar !== undefined ? Boolean(config.mostrarBotaoComecar) : true;
  merged.pergunta1FonteTamanho = Number(config.pergunta1FonteTamanho) || 18;
  merged.pergunta1Titulo2Tamanho = Number(config.pergunta1Titulo2Tamanho) || 16;
  merged.pergunta1Titulo3Tamanho = Number(config.pergunta1Titulo3Tamanho) || 15;
  merged.pergunta1TextoAbaixoTamanho = Number(config.pergunta1TextoAbaixoTamanho) || 14;
  merged.pergunta1TituloCor = config.pergunta1TituloCor || 'branco';
  merged.pergunta1Titulo2Cor = config.pergunta1Titulo2Cor || 'dourado';
  merged.pergunta1Titulo3Cor = config.pergunta1Titulo3Cor || 'verde';
  merged.pergunta1TextoAbaixoCor = config.pergunta1TextoAbaixoCor || 'cinza';
  merged.pergunta1Alinhamento = config.pergunta1Alinhamento || 'center';
  merged.pergunta1CaptionFundo = config.pergunta1CaptionFundo || 'transparente';

  merged.mostrarTelaAcompanhantes = config.mostrarTelaAcompanhantes !== undefined ? Boolean(config.mostrarTelaAcompanhantes) : !isBlank;
  merged.pergunta2Titulo = config.pergunta2Titulo !== undefined ? config.pergunta2Titulo : (isBlank ? '' : 'Você está só ou tem mais pessoas te acompanhando?');
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
  merged.tela1SliderMin = Number(merged.tela1SliderMin ?? 0);
  merged.tela1SliderMax = Number(merged.tela1SliderMax ?? 10);
  merged.tela1SliderStep = Number(merged.tela1SliderStep ?? 1);
  merged.tela1SliderUnidade = merged.tela1SliderUnidade || '';

  const normalizeGaveta = (op) => {
    if (!op?.temGaveta) return null;
    const g = op.gaveta || {};
    return {
      tipo: g.tipo || 'texto_longo', // 'texto_longo' | 'texto_curto' | 'radio' | 'checkbox' | 'slider' | 'select' | 'data' | 'hora'
      pergunta: g.pergunta || 'Por favor, detalhe sua resposta:',
      placeholder: g.placeholder || 'Digite sua resposta aqui...',
      obrigatorio: Boolean(g.obrigatorio),
      linhas: Number(g.linhas) || 3,
      sliderMin: Number(g.sliderMin ?? 0),
      sliderMax: Number(g.sliderMax ?? 10),
      sliderStep: Number(g.sliderStep ?? 1),
      sliderUnidade: g.sliderUnidade || '',
      botaoConfirmar: g.botaoConfirmar || 'Confirmar & Continuar',
      opcoes: Array.isArray(g.opcoes) && g.opcoes.length > 0 ? g.opcoes : ['Opção 1', 'Opção 2', 'Opção 3']
    };
  };

  // Garantir que cada opção tenha o campo 'ativo', 'id' e suporte a gaveta condicional rica
  if (Array.isArray(config.opcoesChegada)) {
    merged.opcoesChegada = config.opcoesChegada.map((op, idx) => ({
      ...op,
      id: op.id || `card_${idx + 1}`,
      titulo: op.titulo || '',
      subtitulo: op.subtitulo || '',
      ativo: op.ativo !== false,
      icone: op.icone || 'Tag',
      cor: op.cor || 'amber',
      correta: Boolean(op.correta),
      temGaveta: Boolean(op.temGaveta),
      gaveta: normalizeGaveta(op)
    }));
  } else {
    merged.opcoesChegada = isBlank ? [] : DEFAULT_QUESTIONS_CONFIG.opcoesChegada;
  }

  // Garantir telas extras com todos os tipos de componentes mundiais
  if (!Array.isArray(merged.telasExtras)) {
    merged.telasExtras = [];
  } else {
    merged.telasExtras = merged.telasExtras
      // Remove apenas a "tela fantasma" antiga (id extra_1 SEM nenhum conteúdo próprio)
      .filter(t => t && !(t.id === 'extra_1' && !t.titulo && !(Array.isArray(t.opcoes) && t.opcoes.length)))
      .map((tela, idx) => ({
        ...tela,
        // id estável e que nunca colide com o filtro acima
        id: tela.id || `tela_auto_${idx + 1}`,
        ativa: tela.ativa !== false,
        // Tipos: 'cards' | 'grade' | 'radio' | 'checkbox' | 'dropdown' | 'slider' | 'rating' | 'texto_curto' | 'texto' | 'data' | 'hora'
        tipo: tela.tipo || 'cards',
        titulo: tela.titulo || `Pergunta da Tela ${idx + 2}`,
        titulo1: tela.titulo1 !== undefined ? tela.titulo1 : (tela.titulo || `Pergunta da Tela ${idx + 2}`),
        titulo2: tela.titulo2 || '',
        titulo3: tela.titulo3 || '',
        subtitulo: tela.subtitulo || '',
        titulo1Tamanho: Number(tela.titulo1Tamanho) || 18,
        titulo2Tamanho: Number(tela.titulo2Tamanho) || 15,
        titulo3Tamanho: Number(tela.titulo3Tamanho) || 14,
        subtituloTamanho: Number(tela.subtituloTamanho) || 12,
        escalaTamanho: Number(tela.escalaTamanho) || 11,
        titulo1Cor: tela.titulo1Cor || 'branco',
        titulo2Cor: tela.titulo2Cor || 'dourado',
        titulo3Cor: tela.titulo3Cor || 'verde',
        subtituloCor: tela.subtituloCor || 'cinza',
        alinhamento: tela.alinhamento || 'center',
        captionFundo: tela.captionFundo || 'transparente',
        mostrarIcones: tela.mostrarIcones !== undefined ? Boolean(tela.mostrarIcones) : true,
        cardFonteTitulo: Number(tela.cardFonteTitulo) || merged.cardFonteTitulo || 15,
        cardFonteSubtitulo: Number(tela.cardFonteSubtitulo) || merged.cardFonteSubtitulo || 11,
        cardCorFonteTitulo: tela.cardCorFonteTitulo || merged.cardCorFonteTitulo || 'branco',
        cardCorFonteSubtitulo: tela.cardCorFonteSubtitulo || merged.cardCorFonteSubtitulo || 'cinza',
        cardFundoEstilo: tela.cardFundoEstilo || merged.cardFundoEstilo || 'escuro',
        cardEfeitoEstilo: tela.cardEfeitoEstilo || merged.cardEfeitoEstilo || 'padrao',
        cardProfundidade: Number(tela.cardProfundidade) || merged.cardProfundidade || 5,
        legendaEscala: tela.legendaEscala || '',
        colunasGrade: Array.isArray(tela.colunasGrade) && tela.colunasGrade.length > 0 ? tela.colunasGrade : ['1', '2', '3', '4', '5', 'NA'],
        placeholder: tela.placeholder || 'Digite sua resposta aqui...',
        multiline: tela.tipo === 'texto_curto' ? false : (tela.multiline !== false),
        linhas: Number(tela.linhas) || 4,
        obrigatorio: Boolean(tela.obrigatorio),
        botaoTexto: tela.botaoTexto || 'Avançar',
        cardAltura: Math.max(16, Number(tela.cardAltura) || merged.cardAltura || 36),
        cardsPorTela: Number(tela.cardsPorTela) || 4,
        sliderMin: Number(tela.sliderMin ?? 0),
        sliderMax: Number(tela.sliderMax ?? 10),
        sliderStep: Number(tela.sliderStep ?? 1),
        sliderLabelMin: tela.sliderLabelMin || 'Mínimo',
        sliderLabelMax: tela.sliderLabelMax || 'Máximo',
        sliderUnidade: tela.sliderUnidade || '',
        opcoes: Array.isArray(tela.opcoes) ? tela.opcoes.map((op, oIdx) => ({
          ...op,
          id: op.id || `opt_${oIdx + 1}`,
          titulo: op.titulo || '',
          subtitulo: op.subtitulo || '',
          ativo: op.ativo !== false,
          icone: op.icone || 'Sparkles',
          cor: op.cor || 'emerald',
          correta: Boolean(op.correta),
          temGaveta: Boolean(op.temGaveta),
          gaveta: normalizeGaveta(op)
        })) : []
      }));
  }

  return merged;
}

// ==========================================
// CONFIGURAÇÃO DAS PERGUNTAS E SUBTÍTULOS POR EVENTO
// ==========================================
export function getSavedQuestionsConfig(targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
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
  return eventId === DEFAULT_EVENT_ID ? DEFAULT_QUESTIONS_CONFIG : BLANK_QUESTIONS_CONFIG;
}

export async function saveQuestionsConfig(config, targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
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
      throw e;
    }
  }
}

// Lê a configuração direto do servidor (usado pelo editor para não editar uma cópia antiga)
export async function buscarConfigPerguntasRemota(targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
  if (!isFirebaseReady()) return null;
  try {
    const snap = await getDoc(doc(db, 'eventos_perguntas', eventId));
    if (snap.exists()) {
      const normalized = normalizeQuestionsConfig(snap.data());
      localStorage.setItem(`${QUESTIONS_STORAGE_KEY}_${eventId}`, JSON.stringify(normalized));
      return normalized;
    }
    if (eventId === DEFAULT_EVENT_ID) {
      const leg = await getDoc(doc(db, 'configuracoes', 'perguntas'));
      if (leg.exists()) return normalizeQuestionsConfig(leg.data());
    }
  } catch (e) {
    console.warn('Erro ao buscar configuração remota:', e);
  }
  return null;
}

export function escutarConfigPerguntas(callback, targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
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
  const eventId = sanitizeEventId(targetEventId);
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
  respostas = [],
  eventoId = '' 
}) {
  const activeEventId = eventoId || getActiveEventId();
  const nomeEvento = evento || getSavedEventTitle(activeEventId);
  const agora = new Date();
  const payload = {
    eventoId: activeEventId,
    comoChegou: String(comoChegou || '').slice(0, 500),
    qtdPessoas: Math.max(1, Math.min(100, Number(qtdPessoas) || 1)),
    evento: String(nomeEvento || '').slice(0, 300),
    respostasExtras: respostasExtras || {},
    gavetaRespostas: gavetaRespostas || {},
    textoRespostas: textoRespostas || {},
    // Lista estruturada (pergunta → resposta), na ordem das telas. Usada pelo relatório.
    respostas: Array.isArray(respostas) ? respostas.slice(0, 200) : [],
    criadoEm: agora.toISOString(),
    dataCulto: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };

  if (!isFirebaseReady()) {
    // Modo de teste sem Firebase configurado (somente neste navegador)
    const local = getLocalData();
    const localItem = { id: 'loc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), ...payload };
    local.unshift(localItem);
    saveLocalData(local);
    return { ...localItem, pendente: false };
  }

  // Gera o ID antes de gravar: a gravação fica no cache persistente do aparelho
  // e é reenviada sozinha se a internet cair. Erros reais (ex.: permissão) rejeitam.
  const ref = doc(collection(db, 'presencas'));
  const gravacao = setDoc(ref, { ...payload, timestamp: serverTimestamp() });

  const TIMEOUT_MS = 8000;
  const resultado = await Promise.race([
    gravacao.then(() => 'ok'),
    new Promise((resolve) => setTimeout(() => resolve('pendente'), TIMEOUT_MS))
  ]);

  if (resultado === 'pendente') {
    // Internet lenta/offline: o Firestore continua tentando em segundo plano.
    gravacao.catch((e) => console.error('Falha ao sincronizar presença pendente:', e));
  }
  return { id: ref.id, ...payload, pendente: resultado === 'pendente' };
}

export function escutarPresencas(callback, targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
  if (isFirebaseReady()) {
    try {
      // Busca SOMENTE as presenças deste evento (antes baixava a coleção inteira)
      const q = query(collection(db, 'presencas'), where('eventoId', '==', eventId));
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const items = [];
          snapshot.forEach((d) => {
            const data = d.data();
            items.push({
              id: d.id,
              ...data,
              criadoEm: data.criadoEm || new Date().toISOString(),
            });
          });
          // Ordena no cliente (evita exigir índice composto no Firestore)
          items.sort((x, y) => String(y.criadoEm).localeCompare(String(x.criadoEm)));
          callback(items);
        },
        (error) => {
          console.error('Erro no listener do Firestore:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error('Falha ao registrar listener Firestore:', e);
      callback([]);
      return () => {};
    }
  } else {
    const handler = () => callback(getLocalData().filter((i) => !i.eventoId || i.eventoId === eventId));
    window.addEventListener('church_local_data_changed', handler);
    handler();
    return () => window.removeEventListener('church_local_data_changed', handler);
  }
}

async function apagarPresencasDoEvento(eventId) {
  const snap = await getDocs(query(collection(db, 'presencas'), where('eventoId', '==', eventId)));
  const refs = snap.docs.map((d) => d.ref);
  // writeBatch aceita até 500 operações; usa lotes de 400
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }
  return refs.length;
}

export function limparDadosLocais() {
  localStorage.removeItem(LOCAL_DATA_KEY);
  window.dispatchEvent(new Event('church_local_data_changed'));
}

// ZERA OS REGISTROS DE UM EVENTO NO FIRESTORE
export async function zerarTudo(targetEventId = null) {
  const eventId = sanitizeEventId(targetEventId);
  limparDadosLocais();
  localStorage.removeItem(`presenca_dispositivo_bloqueado_voto_${eventId}`);
  localStorage.removeItem(`presenca_dispositivo_hora_voto_${eventId}`);
  if (eventId === DEFAULT_EVENT_ID) {
    localStorage.removeItem('presenca_dispositivo_bloqueado_voto');
    localStorage.removeItem('presenca_dispositivo_hora_voto');
  }

  if (!isFirebaseReady()) return 0;

  // Erros sobem para a tela (antes ficavam só no console e o admin via "sucesso")
  const apagados = await apagarPresencasDoEvento(eventId);

  const resetEm = new Date().toISOString();
  const resetId = `reset_${eventId}_${Date.now()}`;
  const novaSessaoId = `sessao_${eventId}_${Date.now()}`;

  const batch = writeBatch(db);
  batch.set(doc(db, 'resets_eventos', eventId), { resetEm, resetId, eventId }, { merge: true });
  batch.set(doc(db, 'sessoes_eventos', eventId), { sessaoId: novaSessaoId, iniciadoEm: resetEm }, { merge: true });
  if (eventId === DEFAULT_EVENT_ID) {
    batch.set(doc(db, 'configuracoes', 'reset'), { resetEm, resetId }, { merge: true });
    batch.set(doc(db, 'configuracoes', 'sessao'), { sessaoId: novaSessaoId, iniciadoEm: resetEm }, { merge: true });
  }
  await batch.commit();
  return apagados;
}
