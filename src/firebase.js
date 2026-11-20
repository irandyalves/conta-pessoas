import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';

const STORAGE_KEY = 'church_firebase_config';
const LOCAL_DATA_KEY = 'church_local_attendance_data';

// Default config or empty template
export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler config do Firebase do localStorage', e);
  }

  // Check if env variables exist
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

  return null;
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  // Reload to re-initialize app cleanly
  window.location.reload();
}

// Initialize Firebase App & Firestore if valid config is found
let db = null;
let app = null;

const currentConfig = getSavedFirebaseConfig();
if (currentConfig && currentConfig.apiKey && currentConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    db = getFirestore(app);
    console.log('🔥 Firebase conectado com sucesso!');
  } catch (err) {
    console.warn('Erro ao inicializar Firebase:', err);
  }
}

export function isFirebaseReady() {
  return db !== null;
}

// Helper: Local fallback storage for demo / offline use
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

/**
 * Envia um registro de presença
 * @param {Object} data 
 * @param {string} data.comoChegou - "Vi a faixa na frente da igreja", "Sou membro", "Convidado", etc.
 * @param {number} data.qtdPessoas - Quantidade de pessoas no grupo (1, 2, 3, etc.)
 * @param {string} data.observacao - Observações opcionais
 */
export async function registrarPresenca({ comoChegou, qtdPessoas, observacao = '' }) {
  const payload = {
    comoChegou,
    qtdPessoas: Number(qtdPessoas) || 1,
    observacao,
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
      // Fallback to local if network fails
      const local = getLocalData();
      const localItem = { id: 'loc_' + Date.now(), ...payload };
      local.unshift(localItem);
      saveLocalData(local);
      return localItem;
    }
  } else {
    // Modo Local
    const local = getLocalData();
    const localItem = { id: 'loc_' + Date.now(), ...payload };
    local.unshift(localItem);
    saveLocalData(local);
    return localItem;
  }
}

/**
 * Escuta registros em tempo real (para o Telão e Painel)
 * @param {Function} callback 
 * @returns {Function} unsubscribe function
 */
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
              // Fallback se timestamp do server ainda não foi processado
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
    // Listener para o modo local
    const handler = () => callback(getLocalData());
    window.addEventListener('church_local_data_changed', handler);
    // Dispara imediatamente
    callback(getLocalData());
    return () => window.removeEventListener('church_local_data_changed', handler);
  }
}

/**
 * Limpa todos os dados locais
 */
export function limparDadosLocais() {
  localStorage.removeItem(LOCAL_DATA_KEY);
  window.dispatchEvent(new Event('church_local_data_changed'));
}
