import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Maximize2, 
  Minimize2, 
  Settings
} from 'lucide-react';

export default function ScreenView() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [editUrl, setEditUrl] = useState(false);

  // Link do QR Code aponta para a raiz (que abre o formulário direto)
  const defaultUrl = `${window.location.origin}/`;
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
        </div>
      </main>

      {/* Espaçador inferior limpo */}
      <footer className="w-full pb-2" />
    </div>
  );
}
