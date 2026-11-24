import React, { useState, useEffect, Suspense, lazy } from 'react';
import MobileForm from './components/MobileForm';
import ScreenView from './components/ScreenView';
import { Lock, LogOut } from 'lucide-react';
import { escutarUsuarioAdmin, entrarComGoogle, sairAdmin, isAdminEmail } from './firebase';

// Painel e editor só são baixados quando o admin abre (celular do público fica leve)
const DashboardView = lazy(() => import('./components/DashboardView'));

function lerViewDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const path = window.location.pathname.toLowerCase();
  if (viewParam === 'admin' || path.includes('/admin')) return 'admin';
  if (viewParam === 'preview') return 'preview';
  if (viewParam === 'telao' || path.includes('/telao')) return 'telao';
  return 'form';
}

export default function App() {
  const [view, setView] = useState(lerViewDaUrl);
  const [usuario, setUsuario] = useState(null);
  const [authCarregando, setAuthCarregando] = useState(true);
  const [loginErro, setLoginErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  const adminAuthed = Boolean(usuario && isAdminEmail(usuario.email));

  useEffect(() => {
    const unsub = escutarUsuarioAdmin((user) => {
      setUsuario(user);
      setAuthCarregando(false);
    });
    return () => unsub && unsub();
  }, []);

  // Mantém a tela sincronizada com o botão voltar/avançar do navegador
  useEffect(() => {
    const onPop = () => setView(lerViewDaUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleChangeView = (newView) => {
    setView(newView);
    const url = new URL(window.location);
    if (newView === 'form') url.searchParams.delete('view');
    else url.searchParams.set('view', newView);
    window.history.pushState({}, '', url);
  };

  const handleEntrar = async () => {
    setLoginErro('');
    setEntrando(true);
    try {
      await entrarComGoogle();
    } catch (e) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setLoginErro(e?.message || 'Não foi possível entrar.');
      }
    } finally {
      setEntrando(false);
    }
  };

  const handleSair = async () => {
    await sairAdmin();
    handleChangeView('form');
  };

  const precisaLogin = view === 'admin' && !adminAuthed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <div className="flex-1">
        {view === 'form' && <MobileForm />}
        {view === 'preview' && <MobileForm preview />}

        {view === 'telao' && (
          <ScreenView 
            adminAuthed={adminAuthed}
            onReturnToAdmin={() => handleChangeView('admin')}
          />
        )}

        {view === 'admin' && adminAuthed && (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Carregando painel...</div>}>
            <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 shadow-lg print:hidden">
              <span className="max-w-[180px] truncate">{usuario?.email}</span>
              <button onClick={handleSair} className="flex items-center gap-1 text-rose-300 hover:text-rose-200 font-bold">
                <LogOut className="w-3 h-3" /> Sair
              </button>
            </div>
            <DashboardView onChangeView={handleChangeView} />
          </Suspense>
        )}
      </div>

      {/* Login do administrador com Google */}
      {precisaLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-white text-base">Acesso Administrativo</h3>

            {authCarregando ? (
              <p className="text-xs text-slate-400 mt-3">Verificando login...</p>
            ) : (
              <>
                {usuario && !adminAuthed ? (
                  <p className="text-xs text-rose-300 mt-1 mb-4">
                    A conta <strong>{usuario.email}</strong> não tem permissão. Entre com a conta do administrador.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 mb-4">Entre com a conta Google do administrador.</p>
                )}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleEntrar}
                    disabled={entrando}
                    className="w-full py-2.5 text-sm font-bold text-slate-900 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
                    </svg>
                    {entrando ? 'Abrindo Google...' : 'Entrar com Google'}
                  </button>
                  {usuario && !adminAuthed && (
                    <button type="button" onClick={sairAdmin} className="w-full py-2 text-xs font-semibold text-slate-300 rounded-xl bg-slate-800">
                      Trocar de conta
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleChangeView('form')}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
                {loginErro && <p className="text-[11px] text-rose-300 mt-3">{loginErro}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
