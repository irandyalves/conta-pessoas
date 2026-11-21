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
  Sparkles,
  TreePine
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  registrarPresenca, 
  escutarTituloEvento, 
  escutarResetGlobal,
  escutarConfigPerguntas,
  DEFAULT_QUESTIONS_CONFIG,
  DEFAULT_EVENT_TITLE 
} from '../firebase';

const CHECKIN_LOCK_KEY = 'presenca_finalizada_cantata_2026';
const CHECKIN_TIME_KEY = 'presenca_hora_registro';

export default function MobileForm() {
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [questionsConfig, setQuestionsConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [step, setStep] = useState(1);
  const [comoChegou, setComoChegou] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [finalizado, setFinalizado] = useState(false);

  // 1. BLOQUEIO DEFINITIVO: Se o aparelho já registrou, impede de votar novamente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('novo') === '1' || params.get('reset') === '1') {
      localStorage.removeItem(CHECKIN_LOCK_KEY);
      localStorage.removeItem(CHECKIN_TIME_KEY);
      setStep(1);
      setFinalizado(false);
      setCountdown(10);
      return;
    }

    const jaRegistrou = localStorage.getItem(CHECKIN_LOCK_KEY);
    if (jaRegistrou) {
      setStep(3);
      setFinalizado(true);
      setCountdown(0);
    }
  }, []);

  // 2. ESCUTA O BOTÃO "ZERAR TUDO" DO ADMIN: Destrava o celular na hora!
  useEffect(() => {
    const unsub = escutarResetGlobal((resetEm) => {
      const horaRegistro = localStorage.getItem(CHECKIN_TIME_KEY);
      if (resetEm && (!horaRegistro || new Date(resetEm) > new Date(horaRegistro))) {
        localStorage.removeItem(CHECKIN_LOCK_KEY);
        localStorage.removeItem(CHECKIN_TIME_KEY);
        setStep(1);
        setFinalizado(false);
        setCountdown(10);
      }
    });
    return () => unsub && unsub();
  }, []);

  // 3. BLOQUEIO DO BOTÃO "VOLTAR" DO NAVEGADOR / CELULAR
  useEffect(() => {
    if (step === 3) {
      const handlePop = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [step]);

  // Escuta título do evento configurável pelo Admin
  useEffect(() => {
    const unsub = escutarTituloEvento((titulo) => {
      if (titulo) setEventoTitulo(titulo);
    });
    return () => unsub && unsub();
  }, []);

  // Escuta configuração de perguntas e subtítulos do Firebase
  useEffect(() => {
    const unsub = escutarConfigPerguntas((cfg) => {
      if (cfg) setQuestionsConfig(cfg);
    });
    return () => unsub && unsub();
  }, []);

  // Timer de 10 segundos na tela final para fechar
  useEffect(() => {
    let timer;
    if (step === 3 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && countdown === 0) {
      setFinalizado(true);
      try {
        window.open('', '_self', '');
        window.close();
      } catch (e) {
        // Bloqueio de segurança nativo de navegadores móveis para scripts
      }
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Ícones padrão associados por ID
  const iconesChegadaMap = {
    faixa: { icone: Tag, iconeCor: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    membro: { icone: Church, iconeCor: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
    convidado: { icone: HeartHandshake, iconeCor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    redes: { icone: Share2, iconeCor: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
    outro: { icone: Compass, iconeCor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' }
  };

  // Opções dinâmicas da Pergunta 1 vindas do Firebase
  const listaOpcoesConfig = questionsConfig?.opcoesChegada?.length > 0 
    ? questionsConfig.opcoesChegada 
    : DEFAULT_QUESTIONS_CONFIG.opcoesChegada;

  const opcoesChegada = listaOpcoesConfig.map((opcao, idx) => {
    const fallbackId = ['faixa', 'membro', 'convidado', 'redes', 'outro'][idx] || 'outro';
    const iconeInfo = iconesChegadaMap[opcao.id] || iconesChegadaMap[fallbackId] || iconesChegadaMap.outro;
    return {
      ...opcao,
      ...iconeInfo
    };
  });

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

  // Ao escolher uma opção na pergunta 2, registra e TRAVA IMEDIATAMENTE este aparelho
  const handleSelectQtd = (qtd) => {
    if (step === 3) return; // Impede duplo clique

    // 1. Grava a trava definitiva e o horário neste aparelho
    localStorage.setItem(CHECKIN_LOCK_KEY, 'true');
    localStorage.setItem(CHECKIN_TIME_KEY, new Date().toISOString());

    // 2. Trava o botão Voltar do Android/iPhone
    try {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function() {
        window.history.pushState(null, '', window.location.href);
      };
    } catch (e) {}

    // 3. Registra automaticamente no banco para o relatório
    registrarPresenca({
      comoChegou,
      qtdPessoas: qtd,
      evento: eventoTitulo
    });

    // 4. Dispara confetes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    // 5. Abre imediatamente a tela final
    setStep(3);
  };

  // ==============================================================
  // TELA 3: TELA FINAL (MUITO OBRIGADO PELA SUA PRESENÇA. A CANTATA...)
  // ==============================================================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none fade-in">
        <div className="w-full max-w-sm bg-slate-900/95 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Efeitos sutis de luz */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* PARTE 1: MUITO OBRIGADO + EVENTO */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              MUITO OBRIGADO PELA SUA PRESENÇA.
            </h1>

            <div className="space-y-1">
              {/* Frase do evento reduzida em 15% */}
              <span className="block text-[17px] sm:text-[20px] font-black bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent uppercase tracking-wide leading-tight">
                A {eventoTitulo}
              </span>
              {/* 2ª frase reduzida em 10% */}
              <span className="block text-[16px] sm:text-[18px] font-extrabold text-amber-400 tracking-wide leading-tight">
                será espetacular!
              </span>
            </div>
          </div>

          {/* PARTE 2: REGISTRO CONCLUÍDO + PODE GUARDAR SEU CELULAR */}
          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            {!finalizado && (
              <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden mb-3">
                <div 
                  className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5 text-slate-200">
              <p className="text-base sm:text-lg font-black text-emerald-400 uppercase tracking-wide">
                registro concluído!
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-300">
                pode guardar seu celular
              </p>
            </div>
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
      <header className="w-full pt-3 pb-2 text-center">
        {/* 1. SEJA MUITO BEM-VINDO (REDUZIDO EM 20%) */}
        <p className="text-lg sm:text-xl font-extrabold text-emerald-400 tracking-wide drop-shadow-sm">
          Seja muito bem-vindo!
        </p>

        {/* 2. TÍTULO DO EVENTO AUMENTADO (CONFIGURÁVEL NO ADMIN) */}
        <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2 rounded-2xl bg-slate-900/95 border-2 border-amber-500/40 text-amber-300 mt-2 mb-2 shadow-lg">
          <TreePine className="w-5 h-5 text-emerald-400 shrink-0" />
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-wider uppercase text-amber-300 drop-shadow">
            {eventoTitulo}
          </h1>
        </div>

        {/* 3. PERGUNTA 1: Título e Subtítulo configuráveis */}
        {step === 1 && (
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {questionsConfig.pergunta1Titulo || 'Como você chegou aqui?'}
            </h2>
            {questionsConfig.pergunta1Subtitulo && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {questionsConfig.pergunta1Subtitulo}
              </p>
            )}
          </div>
        )}

        {/* PERGUNTA 2: Título e Subtítulo configuráveis */}
        {step === 2 && (
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight whitespace-pre-line">
              {questionsConfig.pergunta2Titulo || 'Você está só ou tem mais pessoas te acompanhando?'}
            </h2>
            {questionsConfig.pergunta2Subtitulo && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {questionsConfig.pergunta2Subtitulo}
              </p>
            )}
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* CONTEÚDO PRINCIPAL (TELAS 1 E 2)                               */}
      {/* ============================================================== */}
      <main className="w-full flex-1 my-auto py-2">
        {/* TELA 1: COMO CHEGOU (CARDS +25% ALTURA E +20% FONTE) */}
        {step === 1 && (
          <div className="space-y-3 fade-in">
            {opcoesChegada.map((opcao) => {
              const Icon = opcao.icone;
              return (
                <button
                  key={opcao.id}
                  onClick={() => handleSelectComoChegou(opcao)}
                  className="w-full text-left p-5 sm:p-5.5 min-h-[82px] rounded-2xl border border-slate-800 bg-slate-900/85 hover:bg-slate-800/90 active:scale-[0.98] transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-4 pr-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${opcao.iconeCor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      {/* FONTE DOS CARDS +20% */}
                      <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition leading-snug">
                        {opcao.titulo}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-slate-400 mt-1 line-clamp-1">
                        {opcao.subtitulo}
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TELA 2: ACOMPANHANTES (EFEITO 3D E NÚMEROS +20%) */}
        {step === 2 && (
          <div className="space-y-4 fade-in">
            {/* Opção em Destaque: SÓ EU (BOTÃO 3D TÁTIL) */}
            <button
              onClick={() => handleSelectQtd(1)}
              className="w-full p-5 sm:p-6 min-h-[96px] rounded-3xl border border-emerald-500/30 border-b-[6px] border-b-emerald-950 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 active:translate-y-1.5 active:border-b-2 active:shadow-md transition-all flex items-center justify-between shadow-xl shadow-emerald-950/60"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-emerald-200 p-2.5 shadow-inner">
                  <User className="w-8 h-8 drop-shadow" />
                </div>
                <div className="text-left">
                  {/* Título e Subtítulo configuráveis do Botão Individual */}
                  <h3 className="font-black text-2xl text-amber-300 drop-shadow-md flex items-baseline gap-1 flex-wrap">
                    <span>{questionsConfig.opcaoIndividualTitulo || 'SÓ EU'}</span>
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {questionsConfig.opcaoIndividualSubtitulo || ', vim sozinho'}
                    </span>
                  </h3>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 font-black text-2xl shadow-inner">
                1
              </div>
            </button>

            {/* Divisor com o DOBRO DE ESPAÇO empurrando os números para baixo */}
            <div className="relative flex py-6 my-2 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider text-center">
                {questionsConfig.divisorQtdTexto || 'Quantas pessoas vieram com você?'}
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* Grid dos Botões 2 a +10 (BOTÕES 3D EMPURRADOS PARA BAIXO) */}
            <div className="grid grid-cols-3 gap-3.5 pt-1">
              {opcoesQuantidade.map((op) => (
                <button
                  key={op.valor}
                  onClick={() => handleSelectQtd(op.valor)}
                  className="py-4 sm:py-5 px-2 rounded-2xl border border-slate-700/80 border-b-[6px] border-b-slate-950 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 active:translate-y-1.5 active:border-b-2 active:shadow-md transition-all text-slate-100 flex flex-col items-center justify-center shadow-lg shadow-black/50 group"
                >
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md group-hover:text-amber-300 transition-colors">
                    {op.label}
                  </span>
                  <span className="text-[11px] font-bold text-sky-400/90 group-hover:text-amber-400 transition-colors mt-1">
                    {op.valor === 10 ? 'Pessoas +' : 'Pessoas'}
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
