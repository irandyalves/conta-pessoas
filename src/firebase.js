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

  // Verifica variáveis de ambiente ou usa a configuração padrão oficial
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
