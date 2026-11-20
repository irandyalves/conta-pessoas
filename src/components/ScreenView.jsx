import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Settings
} from 'lucide-react';

export default function ScreenView() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [editUrl, setEditUrl] = useState(false);

  // Link do QR Code aponta direto para o formulário no celular
  const defaultUrl = `${window.location.origin}${window.location.pathname}?view=form`;
  const qrUrl = customUrl || defaultUrl;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-8 md:p-14 relative overflow-hidden select-none">
      {/* Luzes decorativas sutis de fundo */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Botões discretos de controle no canto superior direito (ocultos ou sutis) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
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

      {/* Editor do link se o operador quiser mudar */}
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
      {/* ÁREA CENTRAL LIMPA: TEXTO GIGANTE + QR CODE                   */}
      {/* ============================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-center my-auto relative z-10 max-w-7xl mx-auto w-full">
        {/* LADO ESQUERDO: APENAS AS DUAS FRASES SOLICITADAS */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* QUEREMOS TE CONHECER MELHOR (200% MAIOR) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider text-sky-400 flex items-center gap-3">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 shrink-0" />
            <span>QUEREMOS TE CONHECER MELHOR</span>
          </h1>

          {/* APONTE A CÂMERA DO SEU CELULAR */}
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
            Aponte a câmera <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              do seu celular
            </span>
          </h2>
        </div>

        {/* LADO DIREITO: O QR CODE GIGANTE */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="bg-white p-7 sm:p-9 md:p-10 rounded-3xl shadow-2xl qr-glow flex flex-col items-center border-4 border-sky-400/90">
            <QRCodeSVG 
              value={qrUrl} 
              size={300} 
              level="H" 
              includeMargin={false}
              className="rounded-xl"
            />
            <div className="mt-5 flex items-center gap-2.5 text-slate-900 font-black text-base sm:text-lg tracking-wider">
              <Smartphone className="w-6 h-6 text-sky-600 animate-bounce" />
              <span>ESCANEIE AQUI</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center max-w-xs truncate">
            {qrUrl}
          </p>
        </div>
      </main>

      {/* Rodapé completamente limpo */}
      <footer className="w-full" />
    </div>
  );
}
