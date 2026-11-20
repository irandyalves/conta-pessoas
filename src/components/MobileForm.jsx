import React, { useState, useEffect } from 'react';
import { 
  Church, 
  Users, 
  User, 
  HeartHandshake, 
  Tag, 
  Share2, 
  Compass,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { registrarPresenca, escutarTituloEvento, DEFAULT_EVENT_TITLE } from '../firebase';

export default function MobileForm() {
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [step, setStep] = useState(1);
  const [comoChegou, setComoChegou] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [finalizado, setFinalizado] = useState(false);

  // Escuta título do evento configurável pelo Admin
  useEffect(() => {
    const unsub = escutarTituloEvento((titulo) => {
      if (titulo) setEventoTitulo(titulo);
    });
    return () => unsub && unsub();
  }, []);

  // Timer de 10 segundos na tela final
  useEffect(() => {
    let timer;
    if (step === 3 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && countdown === 0) {
      setFinalizado(true);
      try {
        window.close();
      } catch (e) {
        // Alguns navegadores móveis bloqueiam window.close() se não foi aberto por script
      }
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Opções da Pergunta 1
  const opcoesChegada = [
    {
      id: 'faixa',
      titulo: 'Vi a faixa na frente da igreja',
      subtitulo: 'Passei e vi o anúncio na fachada',
      icone: Tag,
      iconeCor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'membro',
      titulo: 'Sou membro da igreja',
      subtitulo: 'Já congrego nesta comunidade',
      icone: Church,
      iconeCor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    },
    {
      id: 'convidado',
      titulo: 'Fui convidado(a)',
      subtitulo: 'Vim por convite de amigo, irmão ou familiar',
      icone: HeartHandshake,
      iconeCor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    },
    {
      id: 'redes',
      titulo: 'Redes Sociais / Internet',
      subtitulo: 'Instagram, YouTube, Google ou WhatsApp',
      icone: Share2,
      iconeCor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    },
    {
      id: 'outro',
      titulo: 'Passando em frente / Outro motivo',
      subtitulo: 'Curiosidade, visita espontânea ou retorno',
      icone: Compass,
      iconeCor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    }
  ];

  // Opções da Pergunta 2 (SÓ EU, 2, 3, 4, 5, 6, 7, 8, 9, +10)
  const opcoesQuantidade = [
    { valor: 2, label: '2' },
    { valor: 3, label: '3' },
    { valor: 4, label: '4' },
    { valor: 5, label: '5' },
    { valor: 6, label: '6' },
    { valor: 7, label: '7' },
    { valor: 8, label: '8' },
    { valor: 9, label: '9' },
    { valor: 10, label: '+10' },
  ];

  // Ao clicar numa opção na pergunta 1, abre IMEDIATAMENTE a segunda tela
  const handleSelectComoChegou = (opcao) => {
    setComoChegou(opcao.titulo);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ao escolher uma opção na pergunta 2, registra e abre IMEDIATAMENTE a tela final
  const handleSelectQtd = (qtd) => {
    // 1. Registra automaticamente no banco para o relatório
    registrarPresenca({
      comoChegou,
      qtdPessoas: qtd,
      evento: eventoTitulo
    });

    // 2. Dispara confetes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    // 3. Abre imediatamente a tela final
    setStep(3);
  };

  // ==============================================================
  // TELA 3: TELA FINAL (MUITO OBRIGADO PELA SUA PRESENÇA. A CANTATA SERÁ ESPETACULAR!!)
  // 10SEG FECHA TUDO
  // ==============================================================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none fade-in">
        <div className="w-full max-w-sm bg-slate-900/95 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Efeitos sutis de luz */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              MUITO OBRIGADO PELA SUA PRESENÇA.
            </h1>

            <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent tracking-wide">
              A CANTATA SERÁ ESPETACULAR!!
            </p>
          </div>

          {/* Contador de 10s e fechamento */}
          <div className="pt-4 border-t border-slate-800/80">
            {!finalizado ? (
              <div className="space-y-1">
                <div className="w-full bg-slate-800/60 rounded-full h-1 overflow-hidden mb-2">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Fechando em {countdown}s... Você já pode aproveitar o momento!
                </p>
              </div>
            ) : (
              <p className="text-xs text-emerald-400 font-bold">
                ✓ Registro concluído. Guarde seu celular e tenha uma excelente Cantata!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* ============================================================== */}
      {/* CABEÇALHO DO EVENTO                                            */}
      {/* ============================================================== */}
      <header className="w-full pt-4 pb-2 text-center">
        {/* TÍTULO CONFIGURÁVEL DO ADMIN: CANTATA DE NATAL 2026 */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 uppercase">
          {eventoTitulo}
        </h1>

        <p className="text-sm font-semibold text-slate-300 mt-1">
          Seja muito bem-vindo!
        </p>

        {/* PERGUNTA 1: 150% MAIOR NO CABEÇALHO APÓS O SEJA MUITO BEM-VINDO */}
        {step === 1 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Como você chegou na Cantata de Natal?
            </h2>
          </div>
        )}

        {/* PERGUNTA 2: 150% MAIOR */}
        {step === 2 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Você está só ou tem mais pessoas te acompanhando?
            </h2>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* CONTEÚDO PRINCIPAL (TELAS 1 E 2)                               */}
      {/* ============================================================== */}
      <main className="w-full flex-1 my-auto py-2">
        {/* TELA 1: COMO CHEGOU */}
        {step === 1 && (
          <div className="space-y-2.5 fade-in">
            {opcoesChegada.map((opcao) => {
              const Icon = opcao.icone;
              return (
                <button
                  key={opcao.id}
                  onClick={() => handleSelectComoChegou(opcao)}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-900/85 hover:bg-slate-800/90 active:scale-[0.98] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${opcao.iconeCor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                        {opcao.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {opcao.subtitulo}
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TELA 2: ACOMPANHANTES */}
        {step === 2 && (
          <div className="space-y-4 fade-in">
            {/* Opção em Destaque: SÓ EU */}
            <button
              onClick={() => handleSelectQtd(1)}
              className="w-full p-4 rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 hover:border-emerald-600/50 active:scale-[0.98] transition-all flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 mb-0.5">
                    Individual
                  </span>
                  <h3 className="font-black text-lg text-white">
                    SÓ EU
                  </h3>
                  <p className="text-xs text-slate-400">Vim sozinho(a)</p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                1
              </div>
            </button>

            {/* Divisor */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                OU COM MAIS PESSOAS
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Grid dos Botões 2 a +10 */}
            <div className="grid grid-cols-3 gap-2.5">
              {opcoesQuantidade.map((op) => (
                <button
                  key={op.valor}
                  onClick={() => handleSelectQtd(op.valor)}
                  className="py-3.5 px-2 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 active:scale-95 transition-all text-slate-200 flex flex-col items-center justify-center shadow-sm"
                >
                  <span className="text-2xl font-black tracking-tight">{op.label}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {op.valor === 10 ? 'Pessoas ou +' : 'Pessoas'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Rodapé invisível ou mínimo */}
      <footer className="w-full text-center py-2" />
    </div>
  );
}
