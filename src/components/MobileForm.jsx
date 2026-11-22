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
  ChevronLeft,
  Sparkles,
  TreePine,
  Clock,
  Star,
  Smile,
  MapPin,
  MessageCircle,
  HelpCircle,
  Radio,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  registrarPresenca, 
  escutarTituloEvento, 
  escutarResetGlobal,
  escutarConfigPerguntas,
  escutarStatusSessao,
  DEFAULT_QUESTIONS_CONFIG,
  DEFAULT_EVENT_TITLE 
} from '../firebase';

const DISPOSITIVO_BLOQUEADO_KEY = 'presenca_dispositivo_bloqueado_voto';
const DISPOSITIVO_VOTO_TIME_KEY = 'presenca_dispositivo_hora_voto';

// Dicionário de ícones dinâmicos
const ICON_COMPONENTS = {
  Tag,
  Church,
  HeartHandshake,
  Share2,
  Compass,
  Sparkles,
  Star,
  Smile,
  MapPin,
  MessageCircle,
  Users,
  User,
  HelpCircle
};

const COR_CLASSES = {
  amber: 'text-amber-400 bg-amber-500/15 border-amber-500/30 group-hover:border-amber-400',
  emerald: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30 group-hover:border-emerald-400',
  sky: 'text-sky-400 bg-sky-500/15 border-sky-500/30 group-hover:border-sky-400',
  purple: 'text-purple-400 bg-purple-500/15 border-purple-500/30 group-hover:border-purple-400',
  indigo: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30 group-hover:border-indigo-400',
  rose: 'text-rose-400 bg-rose-500/15 border-rose-500/30 group-hover:border-rose-400',
};

const CARD_FUNDO_CLASSES = {
  // 6 Originais
  escuro: 'bg-slate-900/90',
  gradiente: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-850',
  vidro: 'bg-slate-900/50 backdrop-blur-md',
  azul_profundo: 'bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950',
  esmeralda_suave: 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950',
  dourado_suave: 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950',
  // 10 Novas Opções
  preto_onix: 'bg-neutral-950',
  safira_real: 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-950',
  verde_floresta: 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950',
  ouro_nobre: 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950',
  roxo_imperial: 'bg-gradient-to-r from-slate-950 via-purple-950 to-purple-900',
  violeta_cosmico: 'bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950',
  rubi_vinho: 'bg-gradient-to-r from-slate-950 via-rose-950 to-red-950',
  carmim_noturno: 'bg-gradient-to-r from-red-950 via-rose-900 to-neutral-950',
  turquesa_ciano: 'bg-gradient-to-r from-slate-950 via-teal-950 to-cyan-950',
  sunset_laranja: 'bg-gradient-to-r from-slate-950 via-orange-950 to-amber-950',
};

const CARD_EFEITO_CLASSES = {
  padrao: 'border border-slate-700/80 hover:border-slate-600 shadow-md',
  efeito_3d: 'border border-slate-700/80 border-b-[5px] border-b-black/90 active:translate-y-1 active:border-b-2 shadow-xl',
  vidro: 'backdrop-blur-md bg-opacity-70 border border-white/20 hover:border-white/35 shadow-lg',
  entalhe: 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),0_1px_2px_rgba(255,255,255,0.06)] border border-slate-800 border-t-white/10 border-b-black/80',
  alto_relevo: 'border border-slate-700 shadow-lg',
  glow: 'border border-amber-400/50 hover:border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_22px_rgba(245,158,11,0.45)]',
};

function getEfeitoStyle(efeito = 'padrao', profundidade = 5) {
  const p = Math.max(1, Math.min(10, Number(profundidade) || 5));
  
  switch (efeito) {
    case 'efeito_3d':
      return {
        borderBottomWidth: `${p}px`,
        borderBottomColor: 'rgba(0, 0, 0, 0.95)',
        boxShadow: `0 ${p * 1.5}px ${p * 2.5}px rgba(0, 0, 0, 0.6)`,
      };
    case 'entalhe':
      return {
        boxShadow: `inset 0 ${p * 1.2}px ${p * 2}px rgba(0, 0, 0, 0.9), inset 0 -${Math.round(p * 0.5)}px ${p}px rgba(255, 255, 255, 0.08)`,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomColor: 'rgba(0, 0, 0, 0.9)',
      };
    case 'alto_relevo':
      return {
        boxShadow: `0 ${p * 1.5}px ${p * 2.5}px rgba(0, 0, 0, 0.7), inset 0 ${Math.max(1, Math.round(p * 0.4))}px ${Math.max(1, Math.round(p * 0.4))}px rgba(255, 255, 255, 0.25), inset 0 -${Math.max(1, Math.round(p * 0.4))}px ${Math.max(1, Math.round(p * 0.4))}px rgba(0, 0, 0, 0.6)`,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomColor: 'rgba(0, 0, 0, 0.8)',
      };
    case 'vidro':
      return {
        backdropFilter: `blur(${p * 2.5}px)`,
        WebkitBackdropFilter: `blur(${p * 2.5}px)`,
        boxShadow: `0 ${p * 1.2}px ${p * 2.5}px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, ${0.1 + p * 0.02})`,
        borderColor: `rgba(255, 255, 255, ${0.15 + p * 0.025})`,
      };
    case 'glow':
      return {
        boxShadow: `0 0 ${p * 2.5}px rgba(245, 158, 11, ${0.2 + p * 0.04}), inset 0 0 ${p * 1.2}px rgba(245, 158, 11, 0.15)`,
        borderColor: 'rgba(251, 191, 36, 0.6)',
      };
    case 'padrao':
    default:
      return {
        boxShadow: `0 ${p}px ${p * 1.5}px rgba(0, 0, 0, 0.35)`,
      };
  }
}

const CARD_FONTE_TITULO_CLASSES = {
  branco: 'text-white',
  dourado: 'text-amber-300',
  amarelo: 'text-yellow-300',
  esmeralda: 'text-emerald-300',
  azul: 'text-sky-300',
  ciano: 'text-cyan-300',
  laranja: 'text-orange-300',
  rosa: 'text-pink-300',
  roxo: 'text-purple-300',
  prata: 'text-slate-200',
};

const CARD_FONTE_SUBTITULO_CLASSES = {
  cinza: 'text-slate-400',
  cinza_claro: 'text-slate-300',
  branco_suave: 'text-white/80',
  dourado_suave: 'text-amber-200/90',
  amarelo_suave: 'text-yellow-200/80',
  esmeralda_suave: 'text-emerald-200/80',
  azul_suave: 'text-sky-200/80',
  rosa_suave: 'text-pink-200/80',
};

const BTN_QTD_CLASSES = {
  slate: 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-slate-700/80 border-b-slate-950 text-slate-100 shadow-black/50',
  esmeralda: 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 border-emerald-500/60 border-b-emerald-950 text-white shadow-emerald-950/60',
  azul: 'bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 border-blue-500/60 border-b-blue-950 text-white shadow-blue-950/60',
  dourado: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 border-amber-500/60 border-b-amber-950 text-white shadow-amber-950/60',
  roxo: 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 border-purple-500/60 border-b-purple-950 text-white shadow-purple-950/60',
  vermelho: 'bg-gradient-to-b from-red-600 via-red-700 to-red-800 border-red-500/60 border-b-red-950 text-white shadow-red-950/60',
  ciano: 'bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800 border-teal-500/60 border-b-teal-950 text-white shadow-teal-950/60',
  laranja: 'bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 border-orange-500/60 border-b-orange-950 text-white shadow-orange-950/60',
  rosa: 'bg-gradient-to-b from-pink-600 via-pink-700 to-pink-800 border-pink-500/60 border-b-pink-950 text-white shadow-pink-950/60',
  indigo: 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 border-indigo-500/60 border-b-indigo-950 text-white shadow-indigo-950/60',
};

const BTN_NUM_CLASSES = {
  branco: 'text-white',
  dourado: 'text-amber-300',
  amarelo: 'text-yellow-300',
  esmeralda: 'text-emerald-300',
  azul: 'text-sky-300',
  laranja: 'text-orange-300',
  rosa: 'text-pink-300',
  preto: 'text-slate-950',
};

export default function MobileForm() {
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [questionsConfig, setQuestionsConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [sessaoAtiva, setSessaoAtiva] = useState(false);
  
  // BLOQUEIO PERMANENTE DO DISPOSITIVO APÓS O VOTO
  const [dispositivoBloqueado, setDispositivoBloqueado] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('novo') === '1' || params.get('reset') === '1') {
        localStorage.removeItem(DISPOSITIVO_BLOQUEADO_KEY);
        localStorage.removeItem(DISPOSITIVO_VOTO_TIME_KEY);
        return false;
      }
      return localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Etapa inicial: se já votou, fica travado em 'final'; se não, começa em 'p1'
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('novo') === '1' || params.get('reset') === '1') {
        return 'p1';
      }
      return localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true' ? 'final' : 'p1';
    } catch (e) {
      return 'p1';
    }
  });

  const [p1SlideIndex, setP1SlideIndex] = useState(0);
  const [comoChegou, setComoChegou] = useState('');
  const [respostasExtras, setRespostasExtras] = useState({});
  const [countdown, setCountdown] = useState(10);
  const [finalizado, setFinalizado] = useState(() => {
    try {
      return localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // 1. ESCUTA O BOTÃO "ZERAR TUDO" DO ADMIN: Única ação que destrava os celulares
  useEffect(() => {
    const unsub = escutarResetGlobal((resetEm) => {
      const horaVoto = localStorage.getItem(DISPOSITIVO_VOTO_TIME_KEY);
      if (resetEm && (!horaVoto || new Date(resetEm) > new Date(horaVoto))) {
        localStorage.removeItem(DISPOSITIVO_BLOQUEADO_KEY);
        localStorage.removeItem(DISPOSITIVO_VOTO_TIME_KEY);
        setDispositivoBloqueado(false);
        setCurrentStep('p1');
        setP1SlideIndex(0);
        setComoChegou('');
        setRespostasExtras({});
        setFinalizado(false);
        setCountdown(10);
      }
    });
    return () => unsub && unsub();
  }, []);

  // 2. ESCUTA O STATUS DA SESSÃO (START / PAUSAR DO ADMIN) EM TEMPO REAL
  useEffect(() => {
    const unsub = escutarStatusSessao((ativa) => {
      setSessaoAtiva(ativa);

      // SE ESTE DISPOSITIVO JÁ VOTOU, NUNCA SAI DA TELA FINAL MESMO QUE A SESSÃO MUDE!
      if (localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true') {
        setDispositivoBloqueado(true);
        setCurrentStep('final');
        return;
      }

      if (ativa) {
        // Se a sessão foi liberada e não votou, vai para as perguntas
        setCurrentStep('p1');
      }
    });
    return () => unsub && unsub();
  }, []);

  // 4. BLOQUEIO DO BOTÃO "VOLTAR" DO NAVEGADOR
  useEffect(() => {
    if (currentStep === 'final') {
      const handlePop = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [currentStep]);

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

  // Timer de 10 segundos na tela final
  useEffect(() => {
    let timer;
    if (currentStep === 'final' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (currentStep === 'final' && countdown === 0) {
      setFinalizado(true);
      try {
        window.open('', '_self', '');
        window.close();
      } catch (e) {}
    }
    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  // Lista de cards ativos da Pergunta 1
  const todosCardsP1 = questionsConfig?.opcoesChegada || DEFAULT_QUESTIONS_CONFIG.opcoesChegada;
  const cardsAtivosP1 = todosCardsP1.filter((c) => c.ativo !== false);
  const cardsPorTela = Number(questionsConfig?.cardsPorTela) || 4;
  
  // Total de slides da Pergunta 1
  const totalSlidesP1 = Math.max(1, Math.ceil(cardsAtivosP1.length / cardsPorTela));
  const cardsDoSlideAtual = cardsAtivosP1.slice(
    p1SlideIndex * cardsPorTela,
    (p1SlideIndex + 1) * cardsPorTela
  );

  // Telas extras ativas configuradas pelo admin
  const telasExtrasAtivas = (questionsConfig?.telasExtras || []).filter((t) => t.ativa !== false);

  // Avançar após selecionar um card na Pergunta 1
  const handleSelectComoChegou = (opcao) => {
    setComoChegou(opcao.titulo);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (telasExtrasAtivas.length > 0) {
      setCurrentStep('extra_0');
    } else {
      setCurrentStep('acompanhantes');
    }
  };

  // Avançar após selecionar opção em tela extra
  const handleSelectOpcaoExtra = (telaIndex, opcao) => {
    const tela = telasExtrasAtivas[telaIndex];
    setRespostasExtras((prev) => ({
      ...prev,
      [tela.titulo || `Pergunta_${telaIndex + 1}`]: opcao.titulo
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (telaIndex + 1 < telasExtrasAtivas.length) {
      setCurrentStep(`extra_${telaIndex + 1}`);
    } else {
      setCurrentStep('acompanhantes');
    }
  };

  // Ao escolher quantidade de acompanhantes: registra e trava definitivamente este dispositivo
  const handleSelectQtd = (qtd) => {
    // Se já votou ou já está bloqueado, barra qualquer nova tentativa
    if (dispositivoBloqueado || currentStep === 'final' || localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true') {
      return;
    }

    // Grava bloqueio definitivo no navegador deste celular
    localStorage.setItem(DISPOSITIVO_BLOQUEADO_KEY, 'true');
    localStorage.setItem(DISPOSITIVO_VOTO_TIME_KEY, new Date().toISOString());
    setDispositivoBloqueado(true);
    setCurrentStep('final');

    try {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function() {
        window.history.pushState(null, '', window.location.href);
      };
    } catch (e) {}

    registrarPresenca({
      comoChegou,
      qtdPessoas: qtd,
      evento: eventoTitulo,
      respostasExtras
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}
  };

  // ==============================================================
  // PRIORIDADE 1: SE O APARELHO JÁ VOTOU, FICA BLOQUEADO NA TELA FINAL!
  // NÃO ADIANTA ATUALIZAR A PÁGINA (F5) NEM REABRIR O NAVEGADOR!
  // ==============================================================
  if (dispositivoBloqueado || currentStep === 'final' || localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none fade-in">
        <div className="w-full max-w-sm bg-slate-900/95 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3">
            <h1 
              style={{ fontSize: `${questionsConfig.finalTituloFonteTamanho || questionsConfig.finalFonteTamanho || 26}px` }}
              className="font-black text-white tracking-tight leading-snug"
            >
              {questionsConfig.finalTitulo1 && questionsConfig.finalTitulo2 ? (
                <>
                  <span className="block">{questionsConfig.finalTitulo1}</span>
                  <span className="block">{questionsConfig.finalTitulo2}</span>
                </>
              ) : (
                questionsConfig.finalTitulo || 'MUITO OBRIGADO PELA SUA PRESENÇA.'
              )}
            </h1>

            <div className="space-y-1">
              <span className="block text-[17px] sm:text-[20px] font-black bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent uppercase tracking-wide leading-tight">
                A {eventoTitulo}
              </span>
              <span 
                style={{ fontSize: `${questionsConfig.finalMensagemFonteTamanho || 16}px` }}
                className="block font-extrabold text-amber-400 tracking-wide leading-tight"
              >
                {questionsConfig.finalMensagem || 'será espetacular!'}
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            <div className="space-y-1.5 text-slate-200">
              <p 
                style={{ fontSize: `${questionsConfig.finalStatusFonteTamanho || 18}px` }}
                className="font-black text-emerald-400 uppercase tracking-wide"
              >
                {questionsConfig.finalStatus || 'REGISTRO CONCLUÍDO!'}
              </p>
              <p 
                style={{ fontSize: `${questionsConfig.finalInstrucaoFonteTamanho || 13}px` }}
                className="font-bold text-slate-300"
              >
                {questionsConfig.finalInstrucao || 'pode guardar seu celular'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // PRIORIDADE 2: SE NÃO VOTOU AINDA E A SESSÃO NÃO FOI INICIADA
  // ==============================================================
  if (!sessaoAtiva) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in relative overflow-hidden">
        {/* Luzes decorativas de fundo */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl relative space-y-7 flex flex-col items-center">
          
          {/* Nome do Evento discreto no topo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <TreePine className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[220px]">{eventoTitulo}</span>
          </div>

          {/* RODA DE EFEITOS (SHOW DE PROCESSAMENTO TECNOLÓGICO) */}
          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-emerald-400 animate-spin"
              style={{ animationDuration: '2.5s' }}
            />
            <div 
              className="absolute inset-2.5 rounded-full border-4 border-transparent border-b-sky-400 border-l-amber-300 animate-spin"
              style={{ animationDuration: '4s', animationDirection: 'reverse' }}
            />
            <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-sky-500/20 border border-white/10 animate-pulse backdrop-blur-sm" />
            <div className="relative w-14 h-14 rounded-full bg-slate-950 border-2 border-slate-700/80 flex items-center justify-center shadow-xl">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-xl pointer-events-none animate-pulse" />
          </div>

          {/* TEXTO EM EXATAS 3 LINHAS COM FONTES INDIVIDUAIS */}
          <div className="space-y-1 text-center">
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha1Tamanho || questionsConfig.esperaFonteTamanho || 26}px` }}
              className="font-black text-white tracking-wide uppercase leading-tight drop-shadow-sm"
            >
              {questionsConfig.esperaLinha1 || 'DENTRO DE INSTANTES'}
            </h2>
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha2Tamanho || questionsConfig.esperaFonteTamanho || 26}px` }}
              className="font-black bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent tracking-wide uppercase leading-tight drop-shadow-sm"
            >
              {questionsConfig.esperaLinha2 || 'ESTARÁ LIBERADO'}
            </h2>
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha3Tamanho || questionsConfig.esperaFonteTamanho || 26}px` }}
              className="font-black text-emerald-400 tracking-wide uppercase leading-tight drop-shadow-sm"
            >
              {questionsConfig.esperaLinha3 || 'PARA RESPONDER.'}
            </h2>
          </div>

          {/* Barra de Progresso e Aviso de Mudança Automática */}
          <div className="w-full pt-1 space-y-2">
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 h-full w-2/3 rounded-full animate-pulse mx-auto" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              A tela mudará automaticamente assim que o admin liberar
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==============================================================
  // FLUXO PRINCIPAL: TELAS 1, 2, 3, 4, 5
  // ==============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      
      {/* ============================================================ */}
      {/* CABEÇALHO DO EVENTO                                          */}
      {/* ============================================================ */}
      <header className="w-full pt-2 pb-2 text-center">
        <p className="text-lg sm:text-xl font-extrabold text-emerald-400 tracking-wide drop-shadow-sm">
          Seja muito bem-vindo!
        </p>

        <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2 rounded-2xl bg-slate-900/95 border-2 border-amber-500/40 text-amber-300 mt-2 mb-2 shadow-lg">
          <TreePine className="w-5 h-5 text-emerald-400 shrink-0" />
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-wider uppercase text-amber-300 drop-shadow">
            {eventoTitulo}
          </h1>
        </div>

        {/* TÍTULO DA ETAPA ATUAL: TELA 1 */}
        {currentStep === 'p1' && (
          <div className="mt-2 pt-2 border-t border-slate-800/60">
            <h2 
              style={{ fontSize: `${questionsConfig.pergunta1FonteTamanho || 22}px` }}
              className="font-black text-white leading-tight"
            >
              {questionsConfig.pergunta1Titulo2 ? (
                <>
                  <span className="block">{questionsConfig.pergunta1Titulo}</span>
                  <span className="block">{questionsConfig.pergunta1Titulo2}</span>
                </>
              ) : (
                questionsConfig.pergunta1Titulo || 'Como você chegou aqui?'
              )}
            </h2>
            {questionsConfig.pergunta1Subtitulo && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {questionsConfig.pergunta1Subtitulo}
              </p>
            )}
          </div>
        )}

        {/* TELA EXTRA (SE HOUVER) */}
        {currentStep.startsWith('extra_') && (() => {
          const idx = parseInt(currentStep.split('_')[1], 10);
          const tela = telasExtrasAtivas[idx];
          if (!tela) return null;
          return (
            <div className="mt-2 pt-2 border-t border-slate-800/60">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {tela.titulo1 && tela.titulo2 ? (
                  <>
                    <span className="block">{tela.titulo1}</span>
                    <span className="block">{tela.titulo2}</span>
                  </>
                ) : (
                  tela.titulo || `Pergunta da Tela ${idx + 3}`
                )}
              </h2>
              {tela.subtitulo && (
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {tela.subtitulo}
                </p>
              )}
            </div>
          );
        })()}

        {/* PERGUNTA 2: ACOMPANHANTES (TELA 2) */}
        {currentStep === 'acompanhantes' && (
          <div className="mt-2 pt-2 border-t border-slate-800/60">
            <h2 
              style={{ fontSize: `${questionsConfig.pergunta2FonteTamanho || 22}px` }}
              className="font-black text-white leading-tight whitespace-pre-line"
            >
              {questionsConfig.pergunta2Titulo2 ? (
                <>
                  <span className="block">{questionsConfig.pergunta2Titulo}</span>
                  <span className="block">{questionsConfig.pergunta2Titulo2}</span>
                </>
              ) : (
                questionsConfig.pergunta2Titulo || 'Você está só ou tem mais pessoas te acompanhando?'
              )}
            </h2>
            {questionsConfig.pergunta2Subtitulo && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {questionsConfig.pergunta2Subtitulo}
              </p>
            )}
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* CORPO DINÂMICO CONFORME A ETAPA                              */}
      {/* ============================================================ */}
      <main className="w-full flex-1 my-auto py-2">
        
        {/* ============================================================ */}
        {/* ETAPA 1: PERGUNTA 1 COM SLIDER / PAGINAÇÃO DE CARDS GRANDES   */}
        {/* ============================================================ */}
        {currentStep === 'p1' && (
          <div className="space-y-3.5 fade-in">
            
            {/* Indicador de Paginação/Slide se houver mais cards do que o limite */}
            {totalSlidesP1 > 1 && (
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-amber-300">
                  Opções (Página {p1SlideIndex + 1} de {totalSlidesP1})
                </span>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSlidesP1 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setP1SlideIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        p1SlideIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={`Ir para página ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cards do Slide Atual (Grandes, fáceis de tocar, não encolhem!) */}
            <div className="space-y-3">
              {cardsDoSlideAtual.map((opcao) => {
                const IconComponent = ICON_COMPONENTS[opcao.icone] || Tag;
                const corCls = COR_CLASSES[opcao.cor] || COR_CLASSES.amber;
                const cardFundoCls = CARD_FUNDO_CLASSES[questionsConfig?.cardFundoEstilo] || CARD_FUNDO_CLASSES.escuro;
                const cardEfeitoCls = CARD_EFEITO_CLASSES[questionsConfig?.cardEfeitoEstilo] || CARD_EFEITO_CLASSES.padrao;
                const cardFonteTituloCls = CARD_FONTE_TITULO_CLASSES[questionsConfig?.cardCorFonteTitulo] || 'text-white';
                const cardFonteSubtituloCls = CARD_FONTE_SUBTITULO_CLASSES[questionsConfig?.cardCorFonteSubtitulo] || 'text-slate-400';

                const cardEfeitoInline = getEfeitoStyle(questionsConfig?.cardEfeitoEstilo, questionsConfig?.cardProfundidade);

                return (
                  <button
                    key={opcao.id}
                    onClick={() => handleSelectComoChegou(opcao)}
                    style={{ minHeight: `${questionsConfig.cardAltura || 82}px`, ...cardEfeitoInline }}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-between group border ${cardFundoCls}`}
                  >
                    <div className="flex items-center gap-4 pr-2 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${corCls}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 
                          style={{ fontSize: `${questionsConfig.cardFonteTitulo || 16}px` }}
                          className={`font-bold transition leading-snug truncate ${cardFonteTituloCls}`}
                        >
                          {opcao.titulo}
                        </h3>
                        {opcao.subtitulo && (
                          <p 
                            style={{ fontSize: `${questionsConfig.cardFonteSubtitulo || 12}px` }}
                            className={`mt-1 line-clamp-2 leading-snug ${cardFonteSubtituloCls}`}
                          >
                            {opcao.subtitulo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300 group-hover:border-amber-400/50 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controles de Navegação de Slide (se houver múltiplas páginas de cards) */}
            {totalSlidesP1 > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setP1SlideIndex(Math.max(0, p1SlideIndex - 1))}
                  disabled={p1SlideIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setP1SlideIndex(Math.min(totalSlidesP1 - 1, p1SlideIndex + 1))}
                  disabled={p1SlideIndex >= totalSlidesP1 - 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5"
                >
                  <span>Ver mais opções</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TELAS EXTRAS (3, 4 E 5 TELAS ADICIONADAS PELO ADMIN)         */}
        {/* ============================================================ */}
        {currentStep.startsWith('extra_') && (() => {
          const idx = parseInt(currentStep.split('_')[1], 10);
          const tela = telasExtrasAtivas[idx];
          if (!tela) return null;

          return (
            <div className="space-y-3.5 fade-in">
              <div className="space-y-3">
                {(tela.opcoes || []).filter(o => o.ativo !== false).map((opt) => {
                  const IconComp = ICON_COMPONENTS[opt.icone] || Sparkles;
                  const corCls = COR_CLASSES[opt.cor] || COR_CLASSES.emerald;
                  const cardFundoCls = CARD_FUNDO_CLASSES[questionsConfig?.cardFundoEstilo] || CARD_FUNDO_CLASSES.escuro;
                  const cardEfeitoCls = CARD_EFEITO_CLASSES[questionsConfig?.cardEfeitoEstilo] || CARD_EFEITO_CLASSES.padrao;
                  const cardFonteTituloCls = CARD_FONTE_TITULO_CLASSES[questionsConfig?.cardCorFonteTitulo] || 'text-white';
                  const cardFonteSubtituloCls = CARD_FONTE_SUBTITULO_CLASSES[questionsConfig?.cardCorFonteSubtitulo] || 'text-slate-400';

                  const cardEfeitoInline = getEfeitoStyle(questionsConfig?.cardEfeitoEstilo, questionsConfig?.cardProfundidade);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOpcaoExtra(idx, opt)}
                      style={{ minHeight: `${questionsConfig.cardAltura || 82}px`, ...cardEfeitoInline }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-between group border ${cardFundoCls}`}
                    >
                      <div className="flex items-center gap-4 pr-2 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${corCls}`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 
                            style={{ fontSize: `${questionsConfig.cardFonteTitulo || 16}px` }}
                            className={`font-bold transition leading-snug truncate ${cardFonteTituloCls}`}
                          >
                            {opt.titulo}
                          </h3>
                          {opt.subtitulo && (
                            <p 
                              style={{ fontSize: `${questionsConfig.cardFonteSubtitulo || 12}px` }}
                              className={`mt-1 line-clamp-2 leading-snug ${cardFonteSubtituloCls}`}
                            >
                              {opt.subtitulo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300 transition">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botão para voltar à etapa anterior */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (idx === 0) {
                      setCurrentStep('p1');
                    } else {
                      setCurrentStep(`extra_${idx - 1}`);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mx-auto py-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Voltar para pergunta anterior</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* ETAPA FINAL DE PERGUNTAS: ACOMPANHANTES (BOTÕES 3D)          */}
        {/* ============================================================ */}
        {currentStep === 'acompanhantes' && (
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

            {/* Divisor */}
            <div className="relative flex py-6 my-2 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider text-center">
                {questionsConfig.divisorQtdTexto || 'Quantas pessoas vieram com você?'}
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* Grid dos Botões 2 a +10 */}
            <div className="grid grid-cols-3 gap-3.5 pt-1">
              {[
                { valor: 2, label: '2' },
                { valor: 3, label: '3' },
                { valor: 4, label: '4' },
                { valor: 5, label: '5' },
                { valor: 6, label: '6' },
                { valor: 7, label: '7' },
                { valor: 8, label: '8' },
                { valor: 9, label: '9' },
                { valor: 10, label: '+10' },
              ].map((op) => {
                const btnCorCls = BTN_QTD_CLASSES[questionsConfig?.btnQtdCor] || BTN_QTD_CLASSES.slate;
                const numCorCls = BTN_NUM_CLASSES[questionsConfig?.btnQtdCorNumero] || 'text-white';
                const btnAltura = questionsConfig?.btnQtdAltura || 74;
                const numFonte = questionsConfig?.btnQtdFonteNumero || 34;
                const btnEfeitoInline = getEfeitoStyle(questionsConfig?.btnQtdEfeito || 'efeito_3d', questionsConfig?.btnQtdProfundidade || 5);

                return (
                  <button
                    key={op.valor}
                    onClick={() => handleSelectQtd(op.valor)}
                    style={{ minHeight: `${btnAltura}px`, ...btnEfeitoInline }}
                    className={`px-2 py-2 rounded-2xl border active:scale-[0.98] transition-all flex flex-col items-center justify-center group ${btnCorCls}`}
                  >
                    <span 
                      style={{ fontSize: `${numFonte}px` }}
                      className={`font-black tracking-tight drop-shadow-md leading-none transition-colors ${numCorCls}`}
                    >
                      {op.label}
                    </span>
                    <span className="text-[11px] font-bold text-white/80 group-hover:text-amber-300 transition-colors mt-1">
                      {op.valor === 10 ? 'Pessoas +' : 'Pessoas'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botão Voltar */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  if (telasExtrasAtivas.length > 0) {
                    setCurrentStep(`extra_${telasExtrasAtivas.length - 1}`);
                  } else {
                    setCurrentStep('p1');
                  }
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto py-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar à pergunta anterior</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé invisível */}
      <footer className="w-full text-center py-2" />
    </div>
  );
}
