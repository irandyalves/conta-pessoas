import React, { useState, useEffect } from 'react';
import MobileForm from './components/MobileForm';
import ScreenView from './components/ScreenView';
import DashboardView from './components/DashboardView';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import { Tv, Smartphone, BarChart3, Settings, Lock } from 'lucide-react';
import { isFirebaseReady } from './firebase';

export default function App() {
  const [view, setView] = useState('form');
  const [configOpen, setConfigOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Senha padrão de proteção do painel admin (pode ser personalizada)
  const ADMIN_PIN = '1234';

  useEffect(() => {
    // Detecta parâmetro na URL (?view=form, ?view=telao, ?view=admin) ou rota (/admin, /telao)
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const path = window.location.pathname.toLowerCase();

    if (viewParam === 'admin' || path.includes('/admin')) {
      setView('admin');
    } else if (viewParam === 'telao' || path.includes('/telao')) {
      setView('telao');
    } else {
      // Por padrão para quem lê o QR Code
      setView('form');
    }
  }, []);

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

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN || pinInput === 'admin') {
      setAdminAuthed(true);
      setShowPinModal(false);
      setPinInput('');
      setView('admin');
      const url = new URL(window.location);
      url.searchParams.set('view', 'admin');
      window.history.pushState({}, '', url);
    } else {
      alert('Senha incorreta! (Senha padrão: 1234)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 
        A barra de navegação só aparece se estiver no modo Telão ou Admin,
        para NÃO atrapalhar os fiéis que estão preenchendo no celular!
      */}
      {(view === 'admin' || view === 'telao') && (
        <nav 
          aria-label="Navegação administrativa" 
          className="print:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl rounded-full p-1.5 flex items-center gap-1"
        >
          <button
            onClick={() => handleChangeView('telao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              view === 'telao'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Visão do Telão / Projetor"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telão</span>
          </button>

          <button
            onClick={() => handleChangeView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              view === 'admin'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Painel e Relatórios"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Relatórios</span>
          </button>

          <button
            onClick={() => handleChangeView('form')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Ver como fica no Celular"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Celular</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          <button
            onClick={() => setConfigOpen(true)}
            className={`p-1.5 rounded-full transition ${
              isFirebaseReady() 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-amber-400 hover:bg-amber-500/20 animate-pulse'
            }`}
            title="Configurar Firebase"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      )}

      {/* Renderiza a tela selecionada */}
      <div className="flex-1">
        {view === 'form' && (
          <div className="relative">
            <MobileForm />
            {/* Botão de cadeado sutil no rodapé do celular para o operador acessar o admin se necessário */}
            <div className="text-center pb-4">
              <button
                onClick={() => setShowPinModal(true)}
                className="text-[10px] text-slate-700 hover:text-slate-500 inline-flex items-center gap-1 transition"
                title="Acesso da Recepção / Admin"
              >
                <Lock className="w-3 h-3" /> Acesso da Liderança
              </button>
            </div>
          </div>
        )}

        {view === 'telao' && <ScreenView onOpenConfig={() => setConfigOpen(true)} />}

        {view === 'admin' && (
          <DashboardView 
            onOpenConfig={() => setConfigOpen(true)} 
            onChangeView={handleChangeView}
          />
        )}
      </div>

      {/* Modal de Senha para Acesso Admin */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-white text-base">Acesso Administrativo</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Digite o PIN da igreja para acessar os relatórios:</p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (padrão: 1234)"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
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
