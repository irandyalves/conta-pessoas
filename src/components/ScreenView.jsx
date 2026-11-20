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
  Flame,
  Radio
} from 'lucide-react';
import { escutarPresencas, isFirebaseReady } from '../firebase';

export default function ScreenView({ onOpenConfig }) {
  const [presencas, setPresencas] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCounter, setShowCounter] = useState(true);
  const [customUrl, setCustomUrl] = useState('');
  const [editUrl, setEditUrl] = useState(false);

  // Determina a URL para o QR Code (padrão é o formulário mobile)
  const defaultUrl = `${window.location.origin}${window.location.pathname}?view=form`;
  const qrUrl = customUrl || defaultUrl;

  useEffect(() => {
    // Escuta novas respostas em tempo real
    const unsubscribe = escutarPresencas((dados) => {
      setPresencas(dados || []);
    });

    return () => unsubscribe();
  }, []);

  // Totais
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
      {/* Luzes decorativas de fundo para efeito de telão cinematográfico */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Topo do Telão */}
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-xl shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sky-400">
              <Church className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Culto Presencial
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
              Registro de Boas-Vindas & Presença
            </h1>
          </div>
        </div>

        {/* Controles de Telão (discretos para o operador) */}
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

      {/* Editor do link do QR Code se solicitado pelo operador */}
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
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-xs font-bold rounded-lg text-white"
          >
            Pronto
          </button>
        </div>
      )}

      {/* Área Central: QR Code Gigante + Instruções */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6 relative z-10">
        {/* Lado Esquerdo: Chamada e Instruções */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-sky-400 font-extrabold text-sm md:text-base uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Queremos te conhecer melhor
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Aponte a câmera <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                do seu celular
              </span>
            </h2>
            <p className="text-slate-300 text-base md:text-xl max-w-xl font-normal leading-relaxed">
              Participe da contagem de presença e nos ajude a saber como você chegou à nossa igreja. São apenas <strong className="text-white">2 cliques rápidos</strong>.
            </p>
          </div>

          {/* 3 Passos Simples */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm mb-2">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Abra a Câmera</h4>
              <p className="text-xs text-slate-400 mt-1">Abra a câmera nativa do seu smartphone</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm mb-2">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Aponte ao QR Code</h4>
              <p className="text-xs text-slate-400 mt-1">Toque no link amarelo ou azul que surgir</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm mb-2">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Responda as 2 Perguntas</h4>
              <p className="text-xs text-slate-400 mt-1">Como chegou e quantas pessoas estão com você</p>
            </div>
          </div>
        </div>

        {/* Lado Direito: O QR Code com Moldura Luminosa */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl qr-glow flex flex-col items-center border-4 border-sky-400/80">
            <QRCodeSVG 
              value={qrUrl} 
              size={260} 
              level="H" 
              includeMargin={false}
              className="rounded-lg"
            />
            <div className="mt-4 flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Smartphone className="w-5 h-5 text-sky-600 animate-bounce" />
              <span>ESCANEIE AQUI</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center max-w-xs truncate">
            {qrUrl}
          </p>
        </div>
      </main>

      {/* Barra Inferior: Placar ao Vivo (Total de Pessoas Contadas) */}
      {showCounter && (
        <footer className="relative z-10 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Total Geral de Pessoas */}
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Total de Pessoas Presentes
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {totalPessoas} <span className="text-sm font-semibold text-slate-400">({totalRegistros} check-ins)</span>
                </span>
              </div>
            </div>

            {/* Distribuição por motivo */}
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
