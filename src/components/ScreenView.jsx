import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Church, 
  Users, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  HeartHandshake, 
  Tag, 
  Eye, 
  EyeOff, 
  Settings,
  Flame
} from 'lucide-react';
import { escutarPresencas, escutarTituloEvento, DEFAULT_EVENT_TITLE } from '../firebase';

export default function ScreenView({ onOpenConfig }) {
  const [presencas, setPresencas] = useState([]);
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCounter, setShowCounter] = useState(true);
  const [customUrl, setCustomUrl] = useState('');
  const [editUrl, setEditUrl] = useState(false);

  const defaultUrl = `${window.location.origin}${window.location.pathname}?view=form`;
  const qrUrl = customUrl || defaultUrl;

  useEffect(() => {
    const unsubPresencas = escutarPresencas((dados) => {
      setPresencas(dados || []);
    });
    const unsubTitulo = escutarTituloEvento((titulo) => {
      if (titulo) setEventoTitulo(titulo);
    });
    return () => {
      unsubPresencas && unsubPresencas();
      unsubTitulo && unsubTitulo();
    };
  }, []);

  const totalPessoas = presencas.reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);
  const totalRegistros = presencas.length;

  const membros = presencas
    .filter(p => p.comoChegou && p.comoChegou.toLowerCase().includes('membro'))
    .reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);

  const visitantesFaixa = presencas
    .filter(p => p.comoChegou && p.comoChegou.toLowerCase().includes('faixa'))
    .reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);

  const convidados = presencas
    .filter(p => p.comoChegou && p.comoChegou.toLowerCase().includes('convidado'))
    .reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);

  const outros = totalPessoas - (membros + visitantesFaixa + convidados);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-10 relative overflow-hidden select-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Topo do Telão */}
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Church className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ao Vivo
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1 uppercase">
              {eventoTitulo}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setShowCounter(!showCounter)}
            title={showCounter ? 'Ocultar contadores' : 'Mostrar contadores'}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            {showCounter ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setEditUrl(!editUrl)}
            title="Alterar link do QR Code"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Alternar Tela Cheia (F11)"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {editUrl && (
        <div className="relative z-20 my-2 p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 shrink-0">Link do QR Code:</span>
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder={defaultUrl}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
          />
          <button
            onClick={() => setEditUrl(false)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg"
          >
            Pronto
          </button>
        </div>
      )}

      {/* Área Central: QR Code + Chamada */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6 relative z-10">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-amber-400 font-extrabold text-sm md:text-base uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Bem-vindo(a) à {eventoTitulo}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Aponte a câmera <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                do seu celular
              </span>
            </h2>
            <p className="text-slate-300 text-base md:text-xl max-w-xl font-normal leading-relaxed">
              Conte-nos como você chegou até aqui! São apenas <strong className="text-amber-300">2 cliques rápidos</strong> no seu celular.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md">
            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-sm mb-2">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Aponte a Câmera</h4>
              <p className="text-xs text-slate-400 mt-1">Abra a câmera do seu celular e aponte para o QR Code</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm mb-2">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Toque na sua Opção</h4>
              <p className="text-xs text-slate-400 mt-1">Diga como chegou e quantas pessoas estão com você</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl qr-glow flex flex-col items-center border-4 border-amber-400/80">
            <QRCodeSVG 
              value={qrUrl} 
              size={260} 
              level="H" 
              includeMargin={false}
              className="rounded-lg"
            />
            <div className="mt-4 flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Smartphone className="w-5 h-5 text-amber-600 animate-bounce" />
              <span>ESCANEIE AQUI</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center max-w-xs truncate">
            {qrUrl}
          </p>
        </div>
      </main>

      {/* Rodapé com contadores */}
      {showCounter && (
        <footer className="relative z-10 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Total Presente
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {totalPessoas} <span className="text-sm font-semibold text-slate-400">({totalRegistros} respostas)</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Pela Faixa</span>
                  <span className="text-lg font-black text-white">{visitantesFaixa}</span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Convidados</span>
                  <span className="text-lg font-black text-white">{convidados}</span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center gap-2.5">
                <Church className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Membros</span>
                  <span className="text-lg font-black text-white">{membros}</span>
                </div>
              </div>

              {outros > 0 && (
                <div className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Outros</span>
                    <span className="text-lg font-black text-white">{outros}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
