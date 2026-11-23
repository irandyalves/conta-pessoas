import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Maximize2, 
  Minimize2, 
  Settings,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { escutarStatusSessao, escutarTituloEvento, getActiveEventId, DEFAULT_EVENT_TITLE, DEFAULT_EVENT_ID } from '../firebase';

export default function ScreenView({ adminAuthed, onReturnToAdmin }) {
  const [activeEventId] = useState(() => getActiveEventId());
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [editUrl, setEditUrl] = useState(false);
  const [sessaoAtiva, setSessaoAtiva] = useState(false);

  // SOMENTE PARA O ADMIN: Escuta tecla Esc para voltar ao painel admin
  useEffect(() => {
    if (!adminAuthed || !onReturnToAdmin) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onReturnToAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminAuthed, onReturnToAdmin]);

  // Escuta status da sessão do evento exibido no telão
  useEffect(() => {
    const unsub = escutarStatusSessao((ativa) => {
      setSessaoAtiva(ativa);
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // Escuta título do evento exibido no telão
  useEffect(() => {
    const unsub = escutarTituloEvento((titulo) => {
      if (titulo) setEventoTitulo(titulo);
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // Link do QR Code aponta para o evento específico ou para a raiz
  const defaultUrl = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const eventParam = params.get('e') || activeEventId;
      if (eventParam && eventParam !== DEFAULT_EVENT_ID) {
        return `${window.location.origin}/?e=${encodeURIComponent(eventParam)}`;
      }
    } catch (e) {}
    return `${window.location.origin}/`;
  })();
  const qrUrl = customUrl || defaultUrl;

  // Texto amigável e limpo para digitar no celular: conta-pessoas-iasd.web.app
  const displayUrl = (customUrl || defaultUrl)
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .replace(/\/?\?view=form$/i, '');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      {/* Luzes decorativas de fundo */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Botão de Voltar ao Admin (EXCLUSIVO PARA ADMIN AUTENTICADO) */}
      {adminAuthed && onReturnToAdmin && (
        <button
          onClick={onReturnToAdmin}
          className="absolute top-6 left-6 z-20 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md transition active:scale-95 group opacity-40 hover:opacity-100"
          title="Voltar ao Painel Administrativo (ou pressione Esc)"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao Admin</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">Esc</kbd>
        </button>
      )}

      {/* Botões discretos de controle no canto superior direito */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 opacity-25 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditUrl(!editUrl)}
          title="Alterar link do QR Code"
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 border border-slate-800 transition"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          title="Alternar Tela Cheia (F11)"
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 border border-slate-800 transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor de link do operador */}
      {editUrl && (
        <div className="absolute top-20 right-6 z-30 p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 shadow-2xl">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder={defaultUrl}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-80"
          />
          <button
            onClick={() => setEditUrl(false)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg"
          >
            OK
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* ÁREA CENTRAL: APONTE A CÂMERA ALINHADO COM O QR CODE         */}
      {/* ============================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 items-center justify-center my-auto relative z-10 max-w-7xl mx-auto w-full">
        {/* LADO ESQUERDO: APONTE A CÂMERA DO SEU CELULAR */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
            Aponte a câmera <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              do seu celular
            </span>
          </h2>
        </div>

        {/* LADO DIREITO: QR CODE LIMPO (+20% MAIOR) + LINK MAIS LARGO (+15%) E MAIS BAIXO */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* Card Branco com o QR Code (+20% de tamanho: 385px) */}
          <div className="bg-white p-7 sm:p-9 md:p-10 rounded-3xl shadow-2xl qr-glow flex flex-col items-center border-4 border-sky-400/90">
            <QRCodeSVG 
              value={qrUrl} 
              size={385} 
              level="H" 
              includeMargin={false}
              className="rounded-xl"
            />
          </div>

          {/* LINK SUPER LIMPO E FÁCIL DE DIGITAR (EX: conta-pessoas-iasd.web.app) */}
          <div className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-white font-bold text-base sm:text-lg md:text-xl tracking-wide text-center">
            <span>{displayUrl}</span>
          </div>

          {/* Status do Start em tempo real */}
          <div className="mt-4 flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border backdrop-blur-md transition-all ${
              sessaoAtiva
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${sessaoAtiva ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
              <span>{sessaoAtiva ? 'Pesquisa Aberta • Participe agora!' : 'Aponte a câmera • Início em instantes'}</span>
            </span>
          </div>
        </div>
      </main>

      {/* Espaçador inferior limpo */}
      <footer className="w-full pb-2" />
    </div>
  );
}
