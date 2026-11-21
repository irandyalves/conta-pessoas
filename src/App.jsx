import React, { useState, useEffect } from 'react';
import MobileForm from './components/MobileForm';
import ScreenView from './components/ScreenView';
import DashboardView from './components/DashboardView';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import { Lock } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('form');
  const [configOpen, setConfigOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(() => {
    try {
      return sessionStorage.getItem('church_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const ADMIN_PIN = 'a34156162';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const path = window.location.pathname.toLowerCase();

    if (viewParam === 'admin' || path.includes('/admin')) {
      if (!adminAuthed) {
        setShowPinModal(true);
        setView('form');
      } else {
        setView('admin');
      }
    } else if (viewParam === 'telao' || path.includes('/telao')) {
      setView('telao');
    } else {
      setView('form');
    }
  }, [adminAuthed]);

  const handleChangeView = (newView) => {
    if (newView === 'admin' && !adminAuthed) {
      setShowPinModal(true);
      return;
    }
    setView(newView);
    const url = new URL(window.location);
    url.searchParams.set('view', newView);
    window.history.pushState({}, '', url);
  };

  const handleCancelPin = () => {
    setShowPinModal(false);
    setPinInput('');
    setView('form');
    const url = new URL(window.location);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setAdminAuthed(true);
      try {
        sessionStorage.setItem('church_admin_auth', 'true');
      } catch (err) {}
      setShowPinModal(false);
      setPinInput('');
      setView('admin');
      const url = new URL(window.location);
      url.searchParams.set('view', 'admin');
      window.history.pushState({}, '', url);
    } else {
      alert('Senha incorreta!');
      setPinInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Telas */}
      <div className="flex-1">
        {view === 'form' && <MobileForm />}

        {view === 'telao' && (
          <ScreenView 
            adminAuthed={adminAuthed}
            onReturnToAdmin={() => handleChangeView('admin')}
          />
        )}

        {view === 'admin' && (
          <DashboardView 
            onOpenConfig={() => setConfigOpen(true)} 
            onChangeView={handleChangeView}
          />
        )}
      </div>

      {/* Modal de Senha para Acesso Admin */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-white text-base">Acesso Administrativo</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Digite a senha para acessar os relatórios:</p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={30}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Digite a senha"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-base font-mono text-white tracking-widest focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelPin}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuração do Firebase */}
      <FirebaseConfigModal 
        isOpen={configOpen} 
        onClose={() => setConfigOpen(false)} 
      />
    </div>
  );
}
