import React, { useState } from 'react';
import { 
  Church, 
  Users, 
  User, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  HeartHandshake, 
  Tag, 
  Share2, 
  Compass,
  CheckCircle2, 
  Loader2,
  Heart,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { registrarPresenca } from '../firebase';

export default function MobileForm() {
  const [step, setStep] = useState(1);
  const [comoChegou, setComoChegou] = useState('');
  const [qtdPessoas, setQtdPessoas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Opções da Pergunta 1
  const opcoesChegada = [
    {
      id: 'faixa',
      titulo: 'Vi a faixa na frente da igreja',
      subtitulo: 'Passei e vi o anúncio na fachada',
      icone: Tag,
      gradiente: 'from-amber-500/20 to-orange-500/10',
      iconeCor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      bordaAtiva: 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/10'
    },
    {
      id: 'membro',
      titulo: 'Sou membro da igreja',
      subtitulo: 'Já congrego nesta comunidade',
      icone: Church,
      gradiente: 'from-sky-500/20 to-blue-500/10',
      iconeCor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
      bordaAtiva: 'border-sky-400 ring-2 ring-sky-400/30 bg-sky-500/10'
    },
    {
      id: 'convidado',
      titulo: 'Fui convidado(a)',
      subtitulo: 'Vim por convite de amigo, irmão ou familiar',
      icone: HeartHandshake,
      gradiente: 'from-emerald-500/20 to-teal-500/10',
      iconeCor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      bordaAtiva: 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-500/10'
    },
    {
      id: 'redes',
      titulo: 'Redes Sociais / Internet',
      subtitulo: 'Instagram, YouTube, Google ou WhatsApp',
      icone: Share2,
      gradiente: 'from-purple-500/20 to-pink-500/10',
      iconeCor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      bordaAtiva: 'border-purple-400 ring-2 ring-purple-400/30 bg-purple-500/10'
    },
    {
      id: 'outro',
      titulo: 'Passando em frente / Outro motivo',
      subtitulo: 'Curiosidade, visita espontânea ou retorno',
      icone: Compass,
      gradiente: 'from-indigo-500/20 to-blue-500/10',
      iconeCor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      bordaAtiva: 'border-indigo-400 ring-2 ring-indigo-400/30 bg-indigo-500/10'
    }
  ];

  // Opções da Pergunta 2 (SÓ EU, 2, 3, 4, 5, 6, 7, 8, 9, +10)
  const opcoesQuantidade = [
    { valor: 2, label: '2', sub: 'Comigo + 1' },
    { valor: 3, label: '3', sub: 'Comigo + 2' },
    { valor: 4, label: '4', sub: 'Comigo + 3' },
    { valor: 5, label: '5', sub: 'Comigo + 4' },
    { valor: 6, label: '6', sub: 'Comigo + 5' },
    { valor: 7, label: '7', sub: 'Comigo + 6' },
    { valor: 8, label: '8', sub: 'Comigo + 7' },
    { valor: 9, label: '9', sub: 'Comigo + 8' },
    { valor: 10, label: '+10', sub: '10 ou mais' },
  ];

  const handleSelectComoChegou = (opcao) => {
    setComoChegou(opcao.titulo);
    setTimeout(() => {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const handleSelectQtd = async (qtd) => {
    setQtdPessoas(qtd);
    setLoading(true);

    try {
      await registrarPresenca({
        comoChegou,
        qtdPessoas: qtd
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      setEnviado(true);
    } catch (e) {
      console.error('Erro ao enviar:', e);
      alert('Houve um problema ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReiniciar = () => {
    setStep(1);
    setComoChegou('');
    setQtdPessoas(null);
    setEnviado(false);
  };

  // TELA DE SUCESSO / AGRADECIMENTO
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-5 text-center fade-in">
        <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
          {/* Efeitos de iluminação de fundo */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Ícone de Sucesso */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25 mb-5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9 animate-pulse" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Presença Registrada
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Seja Muito Bem-vindo(a)!
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
            Sua presença alegra o nosso coração. <br />
            <strong className="text-sky-400 font-semibold">Que você e seus acompanhantes tenham um culto muito abençoado! 🙏</strong>
          </p>

          {/* Card Resumo */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 mb-6 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Como chegou:</span>
              <span className="font-bold text-slate-200 text-right max-w-[180px] truncate">{comoChegou}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Total no grupo:</span>
              <span className="font-black text-emerald-400 text-sm">
                {qtdPessoas === 1 ? '1 pessoa (Só eu)' : `${qtdPessoas} pessoas`}
              </span>
            </div>
          </div>

          <button
            onClick={handleReiniciar}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 shadow"
          >
            Registrar mais alguém
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Topo / Header da Igreja */}
      <header className="w-full pt-2 pb-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-sky-400 text-xs font-semibold shadow-inner mb-3">
          <Church className="w-3.5 h-3.5 text-sky-400" />
          <span>Controle de Presença</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          Boas-Vindas ao Culto
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Responda em 10 segundos pelo seu celular
        </p>

        {/* Indicador de Passos com Barra Gradiente */}
        <div className="w-full mt-4 space-y-1.5">
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 px-1">
            <span>{step === 1 ? 'Etapa 1: Como você chegou' : 'Etapa 2: Acompanhantes'}</span>
            <span className="text-sky-400 font-bold">{step} de 2</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full flex-1 my-auto py-2">
        {step === 1 && (
          <div className="space-y-3 fade-in">
            <div className="mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Como você chegou aqui hoje?
              </h2>
              <p className="text-xs text-slate-400">
                Toque na opção que melhor representa sua vinda:
              </p>
            </div>

            <div className="space-y-2.5">
              {opcoesChegada.map((opcao) => {
                const Icon = opcao.icone;
                const isSelected = comoChegou === opcao.titulo;
                return (
                  <button
                    key={opcao.id}
                    onClick={() => handleSelectComoChegou(opcao)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between group active:scale-[0.98] ${
                      isSelected
                        ? opcao.bordaAtiva
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${opcao.iconeCor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition">
                          {opcao.titulo}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {opcao.subtitulo}
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-sky-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-in">
            <div>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Alterar resposta anterior</span>
              </button>
              
              <h2 className="text-base font-bold text-white">
                Você está só ou tem mais pessoas com você?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Considere adultos e crianças no mesmo grupo familiar:
              </p>
            </div>

            {/* Destaque Gigante para "SÓ EU" */}
            <button
              onClick={() => handleSelectQtd(1)}
              disabled={loading}
              className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.98] shadow-lg ${
                qtdPessoas === 1
                  ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-900/60 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 mb-0.5">
                    Individual
                  </span>
                  <h3 className="font-black text-lg text-white">
                    SÓ EU
                  </h3>
                  <p className="text-xs text-slate-400">Vim sozinho(a) ao culto</p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                1
              </div>
            </button>

            {/* Divisor Visual */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                OU COMIGO + PESSOAS
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Grid dos Botões 2, 3, 4, 5, 6, 7, 8, 9, +10 */}
            <div className="grid grid-cols-3 gap-2.5">
              {opcoesQuantidade.map((op) => {
                const isSelected = qtdPessoas === op.valor;
                return (
                  <button
                    key={op.valor}
                    onClick={() => handleSelectQtd(op.valor)}
                    disabled={loading}
                    className={`py-3.5 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-sm ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400'
                        : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <span className="text-2xl font-black tracking-tight">{op.label}</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                      {op.valor === 10 ? 'Pessoas ou +' : 'Pessoas'}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 p-3 text-sky-400 text-xs font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gravando sua presença no culto...</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rodapé elegante */}
      <footer className="w-full text-center pt-3 pb-1 text-[11px] text-slate-400">
        <p className="flex items-center justify-center gap-1">
          <span>Que alegria ter você conosco hoje</span> <Heart className="w-3 h-3 text-red-500 fill-red-500" />
        </p>
      </footer>
    </div>
  );
}
