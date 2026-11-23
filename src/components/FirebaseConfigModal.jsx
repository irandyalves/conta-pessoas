import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Trash2,
  KeyRound
} from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, isFirebaseReady } from '../firebase';

export default function FirebaseConfigModal({ isOpen, onClose, inline = false }) {
  const current = getSavedFirebaseConfig() || {};
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [projectId, setProjectId] = useState(current.projectId || '');
  const [authDomain, setAuthDomain] = useState(current.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(current.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current.messagingSenderId || '');
  const [appId, setAppId] = useState(current.appId || '');

  const [rawConfig, setRawConfig] = useState('');
  const [mode, setMode] = useState('fields'); // 'fields' | 'paste'
  const [aviso, setAviso] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen && !inline) return null;

  const handlePasteRaw = (text) => {
    setRawConfig(text);
    try {
      // Tenta extrair valores de um objeto copiado do console do Firebase
      // Lê cada chave por expressão regular (sem executar o texto colado)
      const pegar = (chave) => {
        const m = text.match(new RegExp(`["']?${chave}["']?\\s*:\\s*["']([^"']+)["']`));
        return m ? m[1] : '';
      };
      const parsed = {
        apiKey: pegar('apiKey'),
        projectId: pegar('projectId'),
        authDomain: pegar('authDomain'),
        storageBucket: pegar('storageBucket'),
        messagingSenderId: pegar('messagingSenderId'),
        appId: pegar('appId')
      };
      if (parsed && parsed.apiKey) {
        setApiKey(parsed.apiKey || '');
        setProjectId(parsed.projectId || '');
        setAuthDomain(parsed.authDomain || '');
        setStorageBucket(parsed.storageBucket || '');
        setMessagingSenderId(parsed.messagingSenderId || '');
        setAppId(parsed.appId || '');
        setMode('fields');
        setAviso('');
      }
    } catch (e) {
      // Ignora erro de parse enquanto digita
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setAviso('Por favor, informe pelo menos a apiKey e o projectId do Firebase.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(config);
  };

  const handleClear = () => {
    setShowConfirmReset(true);
  };

  return (
    <div className={inline ? "w-full animate-fade-in" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"}>
      <div className={inline ? "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col" : "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Configurar Firebase</h3>
              <p className="text-xs text-slate-400">Conecte com seu banco de dados Firestore</p>
            </div>
          </div>
          {!inline && onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status atual */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isFirebaseReady() 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {isFirebaseReady() ? (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <strong>Firebase Conectado!</strong>
                  <p className="text-xs text-emerald-400/80">Projeto: {projectId || 'Ativo'}</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <strong>Modo Local / Demonstração</strong>
                  <p className="text-xs text-amber-400/80">Os dados estão sendo salvos na memória local do navegador.</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 p-1 bg-slate-950 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMode('fields')}
              className={`flex-1 py-1.5 rounded-md transition ${mode === 'fields' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Preencher Campos
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 py-1.5 rounded-md transition ${mode === 'paste' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Colar Código Direto
            </button>
          </div>

          {mode === 'paste' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cole o bloco firebaseConfig do console do Firebase:
              </label>
              <textarea
                value={rawConfig}
                onChange={(e) => handlePasteRaw(e.target.value)}
                placeholder={'const firebaseConfig = {\n  apiKey: "...",\n  projectId: "...",\n  ...\n};'}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  apiKey <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  projectId <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="minha-igreja-123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  authDomain (opcional)
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="minha-igreja-123.firebaseapp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  appId (opcional)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Aviso inline */}
          {aviso && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{aviso}</span>
            </div>
          )}

          {/* Dica rápida de configuração */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" /> Como obter suas chaves:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
              <li>Acesse <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Crie um projeto gratuito e adicione um app Web (&lt;/&gt;)</li>
              <li>No menu lateral, ative o <strong>Firestore Database</strong> no modo de teste (Test Mode)</li>
              <li>Copie as chaves do objeto <code className="bg-slate-800 px-1 py-0.5 rounded text-sky-300">firebaseConfig</code> e cole aqui</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-between gap-3">
          {isFirebaseReady() ? (
            <button
              onClick={handleClear}
              className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Desconectar
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {!inline && onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-lg shadow-sky-500/25 transition active:scale-95"
            >
              Salvar e Conectar
            </button>
          </div>
        </div>

        {/* Modal de Confirmação de Desconexão */}
        {showConfirmReset && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Desconectar Firebase?</h4>
                <p className="text-xs text-slate-400 mt-1">O sistema voltará a utilizar a demonstração local temporária.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmReset(false);
                    saveFirebaseConfig(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-500"
                >
                  Desconectar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
