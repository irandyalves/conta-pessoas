import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  ChevronDown,
  Sparkles,
  TreePine,
  Clock,
  Star,
  Smile,
  MapPin,
  MessageCircle,
  HelpCircle,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import IconeEspera from './IconeEspera';
import EscalaVisual, { ESCALA_COM_VALOR_INICIAL, instrucaoDaEscala } from './EscalaVisual';
import { 
  registrarPresenca, 
  escutarTituloEvento, 
  escutarResetGlobal,
  escutarConfigPerguntas,
  normalizeQuestionsConfig,
  escutarStatusSessao,
  getActiveEventId,
  escutarEventoAtivoGlobal,
  DEFAULT_QUESTIONS_CONFIG,
  DEFAULT_EVENT_TITLE,
  DEFAULT_EVENT_ID
} from '../firebase';
import { componenteIcone, iconesDaTela } from '../utils/icones';
import { configSeta } from '../utils/setas';
import Rosto from './Rosto';
import BarraProgresso from './BarraProgresso';
import TelaFinal from './TelaFinal';
import { atributosCampo, erroDeFormato, mascaraTelefone, mensagemFalta, usaMaiusculas, valorGravado } from '../utils/campoTexto';
import { camposDoTexto, exemploDe, linhasFinais } from '../utils/telaFinal';
import { carregarFonteTema, classeTema } from '../utils/temas';
import { carregarFontes, fontesEmUso } from '../utils/fontes';
import { fonteEBorda, partesTitulo, subtituloRepeteLegenda, corLinhaHex, corTextoHex, lerGeral, caixaAlta, telaP1Cantos, estiloBotao, cantosCard, CARD_ESPACO_PADRAO, faixaEstilo, linhasCapa, medidasCard, espacos, getFaixaFundoClass, estiloLinhas, pesoFonte, corGradeSelecionada, getEfeitoStyle, getCorTextoLinhaClass, getAlinhamentoClass, getCaptionFundoClass, parseScaleLegendItems } from '../utils/estilos';

const DISPOSITIVO_BLOQUEADO_KEY = 'presenca_dispositivo_bloqueado_voto';
const DISPOSITIVO_VOTO_TIME_KEY = 'presenca_dispositivo_hora_voto';

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
  tema: 't-fundo',
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


const CARD_FONTE_TITULO_CLASSES = {
  tema: 't-cor',
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
  tema: 't-cor',
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
  tema: 't-num border',
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
  tema: 't-herda',
  branco: 'text-white',
  dourado: 'text-amber-300',
  amarelo: 'text-yellow-300',
  esmeralda: 'text-emerald-300',
  azul: 'text-sky-300',
  laranja: 'text-orange-300',
  rosa: 'text-pink-300',
  preto: 'text-slate-950',
};

const BTN_DESC_CLASSES = {
  tema: 't-herda opacity-75',
  branco_80: 'text-white/80',
  branco_puro: 'text-white',
  dourado: 'text-amber-300',
  amarelo: 'text-yellow-300',
  esmeralda: 'text-emerald-300',
  azul: 'text-sky-300',
  cinza: 'text-slate-300',
  laranja: 'text-orange-300',
};

// Progresso de quem está respondendo: fica só nesta aba do navegador, por evento
// Respostas usadas nos textos da tela final ({Nome}, {E-mail}): ficam só neste aparelho, até o admin zerar
const chaveFinal = (eventoId) => `responder_final_${eventoId}`;
const lerFinal = (eventoId) => {
  try { return JSON.parse(localStorage.getItem(chaveFinal(eventoId)) || '{}') || {}; } catch (e) { return {}; }
};
const chaveProgresso = (eventoId) => `responder_progresso_${eventoId}`;
const chaveResetVisto = (eventoId) => `responder_reset_visto_${eventoId}`;
const lerProgresso = (eventoId) => {
  try {
    const p = JSON.parse(sessionStorage.getItem(chaveProgresso(eventoId)) || 'null');
    return p && typeof p.passo === 'string' && p.passo !== 'final' ? p : null;
  } catch (e) {
    return null;
  }
};

// Título com número da seção e pergunta separados (os layouts dão destaque a cada parte)
function TituloRico({ texto }) {
  const { numero, secao, questao } = partesTitulo(texto);
  const corpo = secao
    ? <><span className="t-secao">{secao}</span><span className="t-traco"> — </span><span className="t-questao">{questao}</span></>
    : questao;
  if (!numero) return corpo;
  return <><span className="t-numero">{numero}</span><span className="t-ponto">. </span><span className="t-texto">{corpo}</span></>;
}

// Humor de uma coluna da grade: 0 (menor nota) a 1 (maior). NA e textos não têm rosto.
const humorColuna = (col, cols) => {
  const nums = cols.filter((c) => /^\d+([.,]\d+)?$/.test(String(c).trim()));
  const i = nums.indexOf(col);
  return i < 0 ? null : nums.length < 2 ? 1 : i / (nums.length - 1);
};

// Instrução da escala ("arraste para a direita ou para a esquerda")
function InstrucaoEscala({ tela, posicao }) {
  const texto = instrucaoDaEscala(tela);
  if (!String(texto || '').trim() || (tela.instrucaoPosicao || 'acima') !== posicao) return null;
  const fundo = tela.instrucaoFundo || 'transparente';
  const espaco = Number(tela.instrucaoEspaco ?? 16);
  return (
    <p
      style={{
        fontSize: `${tela.instrucaoTamanho || 14}px`,
        ...faixaEstilo(fundo, tela.instrucaoAltura),
        ...fonteEBorda(tela, 'instrucao', fundo !== 'transparente', false),
        color: corTextoHex(tela.instrucaoCor),
        [posicao === 'acima' ? 'marginBottom' : 'marginTop']: espaco
      }}
      className={`t-cor text-slate-200 leading-snug whitespace-pre-line ${getFaixaFundoClass(fundo, 'rounded-xl')} ${tela.instrucaoBold ? 'font-bold' : 'font-medium'} ${caixaAlta(tela.instrucaoCaixa)} ${getAlinhamentoClass(tela.instrucaoAlinhamento || 'center')}`}
    >
      {texto}
    </p>
  );
}

// Legenda da grade: alinhamento, 1 ou 2 colunas (ou corrida) e ícones opcionais
function LegendaGrade({ tela, className, style }) {
  const itens = parseScaleLegendItems(tela.legendaEscala);
  const cods = itens.map((i) => i.code).filter(Boolean);
  const colunas = Number(tela.legendaColunas) || 0;
  const al = tela.legendaAlinhamento || 'center';
  const lado = { left: 'start', center: 'center', right: 'end' }[al];
  const tam = Math.max(16, Math.round((tela.escalaTamanho || 9) * 1.7));
  const forma = colunas
    ? { display: 'grid', gridTemplateColumns: `repeat(${colunas}, minmax(0, max-content))`, gridTemplateRows: `repeat(${Math.ceil(itens.length / colunas)}, auto)`, gridAutoFlow: 'column', justifyContent: lado, columnGap: '1.6em', rowGap: '.5em', textAlign: 'left' }
    : { textAlign: al, justifyContent: lado, ...(tela.legendaIcones ? { display: 'flex', flexWrap: 'wrap', gap: '.4em 1em' } : {}) };
  const icone = (code) => {
    const p = humorColuna(code, cods);
    return p === null ? <Ban width={tam} height={tam} className="shrink-0 opacity-70" aria-hidden="true" /> : <span className="shrink-0"><Rosto p={p} tamanho={tam} vivo={false} /></span>;
  };
  return (
    <p style={{ ...style, ...forma }} className={className}>
      {itens.map((item, li) => (
        <span key={li} className="t-leg" style={colunas || tela.legendaIcones ? { display: 'inline-flex', alignItems: 'center', gap: '.45em' } : undefined}>
          {li > 0 && !colunas && !tela.legendaIcones && <span className="t-sep opacity-40"> · </span>}
          {tela.legendaIcones && item.code && icone(item.code)}
          {item.code && <strong className="text-amber-400 font-black">{item.code} </strong>}
          <span>{item.label}</span>
        </span>
      ))}
    </p>
  );
}

// Rodapé das telas sem botão Avançar: ← ANTERIOR • PRÓXIMA →
// PRÓXIMA só aparece quando a página não é obrigatória (ou já foi respondida).
function RodapeSetas({ onAnterior, onProxima, aceso, seta }) {
  if (!onAnterior && !onProxima) return null;
  return (
    <>
      <div className="h-20" />
      <div className="t-rodape fixed bottom-0 inset-x-0 z-30 flex items-center justify-center gap-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none">
        {onAnterior && <BotaoSeta seta={seta} lado="anterior" aceso={aceso === 'anterior'} onClick={onAnterior} className="w-24" />}
        {onAnterior && onProxima && <span className="w-1.5 h-1.5 rounded-full" style={{ background: seta.cor }} aria-hidden="true" />}
        {onProxima && <BotaoSeta seta={seta} lado="proxima" aceso={aceso === 'proxima'} onClick={onProxima} className="w-24" />}
      </div>
    </>
  );
}

function BotaoSeta({ seta, lado, aceso, onClick, className = '' }) {
  const anterior = lado === 'anterior';
  const Icone = anterior ? seta.Esq : seta.Dir;
  return (
    <button
      type="button"
      aria-label={anterior ? 'Voltar à pergunta anterior' : 'Ir para a próxima pergunta'}
      onClick={onClick}
      style={{ color: seta.cor }}
      className={`pointer-events-auto h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 ${className} ${aceso ? 'efeito-acender' : ''}`}
    >
      <Icone size={seta.tamanho} strokeWidth={seta.espessura} />
      <span className="text-[10px] font-light tracking-wide leading-none">{anterior ? seta.anterior : seta.proxima}</span>
    </button>
  );
}

export default function MobileForm({ preview = false }) {
  // preview = true: tela dentro do editor (iframe). Recebe a config por postMessage,
  // não lê/grava no Firestore e não trava o aparelho. Renderiza EXATAMENTE como o celular.
  const [activeEventId, setActiveEventIdState] = useState(() => getActiveEventId());
  
  // Detecta se a URL tem parâmetro de evento fixo (ex: lido via QR Code ?e=...)
  const isUrlFixo = Boolean(new URLSearchParams(window.location.search).get('e') || 
                            new URLSearchParams(window.location.search).get('evento') || 
                            new URLSearchParams(window.location.search).get('event'));

  // Se NÃO for URL fixo, escuta a transmissão em tempo real do evento ativo do admin
  useEffect(() => {
    if (!isUrlFixo && !preview) {
      const unsub = escutarEventoAtivoGlobal((globalEventId) => {
        if (globalEventId && globalEventId !== activeEventId) {
          setActiveEventIdState(globalEventId);
        }
      });
      return () => unsub && unsub();
    }
  }, [isUrlFixo, activeEventId]);

  const DISPOSITIVO_BLOQUEADO_EVENTO_KEY = `presenca_dispositivo_bloqueado_voto_${activeEventId}`;
  const DISPOSITIVO_VOTO_TIME_EVENTO_KEY = `presenca_dispositivo_hora_voto_${activeEventId}`;

  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [questionsConfig, setQuestionsConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [sessaoAtiva, setSessaoAtiva] = useState(false);
  
  // BLOQUEIO PERMANENTE DO DISPOSITIVO APÓS O VOTO POR EVENTO
  const [dispositivoBloqueado, setDispositivoBloqueado] = useState(() => {
    if (preview) return false;
    try {
      return localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
        (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
    } catch (e) {
      return false;
    }
  });

  // Evento cujo progresso já foi lido (só depois disso é permitido gravar por cima)
  const [eventoProgresso, setEventoProgresso] = useState(null);
  const slideRestauradoRef = useRef(null);

  // Reavalia o bloqueio e reset caso o activeEventId mude dinamicamente
  useEffect(() => {
    if (preview) return;
    const jaVotou = localStorage.getItem(`presenca_dispositivo_bloqueado_voto_${activeEventId}`) === 'true' ||
      (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
    setDispositivoBloqueado(jaVotou);
    if (jaVotou) {
      setCurrentStep('final');
      setFinalizado(true);
    } else {
      // Atualizar a página (F5 ou puxar para baixo) continua na mesma tela, com as respostas já dadas
      const salvo = lerProgresso(activeEventId);
      slideRestauradoRef.current = salvo ? { passo: salvo.passo, slide: salvo.extraSlide || 0 } : null;
      setCurrentStep(salvo?.passo || 'p1');
      setFinalizado(false);
      setP1SlideIndex(salvo?.p1Slide || 0);
      setMotivo(salvo?.motivo || '');
      setExtras(salvo?.extras || {});
      setGavetasAbertas(salvo?.gavetasAbertas || {});
      setGavetas(salvo?.gavetas || {});
      setGavetaRespondidas(salvo?.gavetaRespondidas || {});
      setTextos(salvo?.textos || {});
      setJaClicouComecar(Boolean(salvo?.jaClicouComecar));
    }
    setEventoProgresso(activeEventId);
  }, [activeEventId]);

  // Etapa inicial: se já votou, fica travado em 'final'; se não, começa em 'p1'
  const [currentStep, setCurrentStep] = useState(() => {
    if (preview) return 'p1';
    try {
      const travado = localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
        (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
      return travado ? 'final' : 'p1';
    } catch (e) {
      return 'p1';
    }
  });

  const [p1SlideIndex, setP1SlideIndex] = useState(0);
  const [comoChegou, setComoChegou] = useState('');
  const [respostasExtras, setRespostasExtras] = useState({});
  const [gavetasAbertas, setGavetasAbertas] = useState({});
  const [gavetaTextos, setGavetaTextos] = useState({});
  const [gavetaRespondidas, setGavetaRespondidas] = useState({});
  const [dissertativaTextos, setDissertativaTextos] = useState({});
  const [campoObrigatorioErro, setCampoObrigatorioErro] = useState(null);
  const [avisoGrade, setAvisoGrade] = useState(null); // { id, faltam, vez }
  useEffect(() => {
    if (!avisoGrade) return undefined;
    const t = setTimeout(() => setAvisoGrade((a) => (a === avisoGrade ? { ...a, oculto: true } : a)), 3800);
    return () => clearTimeout(t);
  }, [avisoGrade]);
  useEffect(() => { setAvisoGrade(null); }, [currentStep]);
  const [jaClicouComecar, setJaClicouComecar] = useState(false);
  const [extraSlideIndex, setExtraSlideIndex] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [envioPendente, setEnvioPendente] = useState(false);
  // "+10": abre um seletor para informar o número exato (antes gravava só 10)
  const [qtdGrande, setQtdGrande] = useState(null);
  const enviandoRef = useRef(false);
  const ultimoEnvioRef = useRef(null);

  // Refs espelham o estado para que o envio final use SEMPRE os valores mais recentes
  // (antes o envio podia sair com respostas antigas por causa de closures).
  const motivoRef = useRef('');
  const extrasRef = useRef({});
  const [valoresFinais, setValoresFinais] = useState({});
  useEffect(() => { if (!preview) setValoresFinais(lerFinal(activeEventId)); }, [activeEventId, preview]);
  const gavetasRef = useRef({});
  const textosRef = useRef({});
  const aplicar = (ref, setter) => (upd) => {
    const next = typeof upd === 'function' ? upd(ref.current) : upd;
    ref.current = next;
    setter(next);
  };
  const setMotivo = aplicar(motivoRef, setComoChegou);
  const setExtras = aplicar(extrasRef, setRespostasExtras);
  const setGavetas = aplicar(gavetasRef, setGavetaTextos);
  const setTextos = aplicar(textosRef, setDissertativaTextos);
  const [countdown, setCountdown] = useState(10);
  const [finalizado, setFinalizado] = useState(() => {
    if (preview) return false;
    try {
      return localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
        (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
    } catch (e) {
      return false;
    }
  });

  // 0. MODO PREVIEW DO EDITOR: recebe config/título/tela por postMessage
  const ultimoPassoRef = useRef(null);
  useEffect(() => {
    if (!preview) return;
    const aoReceber = (e) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.tipo !== 'responder-preview') return;
      if (d.config) setQuestionsConfig(normalizeQuestionsConfig(d.config));
      if (typeof d.titulo === 'string') setEventoTitulo(d.titulo || DEFAULT_EVENT_TITLE);
      if (d.passo && (d.forcar || d.passo !== ultimoPassoRef.current)) {
        ultimoPassoRef.current = d.passo;
        const passo = d.passo;
        setSessaoAtiva(passo !== 'espera');
        setJaClicouComecar(passo !== 'comecar');
        setP1SlideIndex(0);
        setMotivo('');
        setExtras({});
        setGavetasAbertas({});
        setGavetas({});
        setGavetaRespondidas({});
        setTextos({});
        setCountdown(10);
        setCurrentStep(['espera', 'comecar', 'tela_1'].includes(passo) ? 'p1' : passo);
      }
    };
    window.addEventListener('message', aoReceber);
    try { window.parent.postMessage({ tipo: 'responder-preview-pronto' }, window.location.origin); } catch (e) {}
    return () => window.removeEventListener('message', aoReceber);
  }, [preview]);

  // Prévia: ao avançar/voltar tocando no celular, avisa o editor, que seleciona a tela certa
  useEffect(() => {
    if (!preview || !ultimoPassoRef.current) return;
    const atual = !sessaoAtiva ? 'espera'
      : currentStep === 'p1' ? (questionsConfig?.mostrarBotaoComecar !== false && !jaClicouComecar ? 'comecar' : 'tela_1')
      : currentStep;
    if (atual === ultimoPassoRef.current) return;
    try { window.parent.postMessage({ tipo: 'responder-preview-navegou', passo: atual }, window.location.origin); } catch (e) {}
  }, [preview, currentStep, jaClicouComecar, sessaoAtiva, questionsConfig]);

  // 1. ESCUTA O BOTÃO "ZERAR TUDO" DO ADMIN PARA ESTE EVENTO
  useEffect(() => {
    if (preview) return;
    const unsub = escutarResetGlobal((resetEm) => {
      const horaVoto = localStorage.getItem(DISPOSITIVO_VOTO_TIME_EVENTO_KEY) || localStorage.getItem(DISPOSITIVO_VOTO_TIME_KEY);
      if (!resetEm) return;
      const travado = localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
        (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
      // Quem ainda está respondendo só volta ao início se o admin zerar DE NOVO.
      // (o servidor reenvia o último "zerar" a cada atualização da página)
      let resetVisto = null;
      try {
        resetVisto = sessionStorage.getItem(chaveResetVisto(activeEventId));
        if (!resetVisto || new Date(resetEm) > new Date(resetVisto)) sessionStorage.setItem(chaveResetVisto(activeEventId), resetEm);
      } catch (e) {}
      const zerar = travado
        ? (!horaVoto || new Date(resetEm) > new Date(horaVoto))
        : Boolean(resetVisto && new Date(resetEm) > new Date(resetVisto));
      if (zerar) {
        localStorage.removeItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY);
        localStorage.removeItem(DISPOSITIVO_VOTO_TIME_EVENTO_KEY);
        localStorage.removeItem(DISPOSITIVO_BLOQUEADO_KEY);
        localStorage.removeItem(DISPOSITIVO_VOTO_TIME_KEY);
        localStorage.removeItem(chaveFinal(activeEventId));
        setValoresFinais({});
        setDispositivoBloqueado(false);
        setCurrentStep('p1');
        setP1SlideIndex(0);
        setMotivo('');
        setExtras({});
        setGavetasAbertas({});
        setGavetas({});
        setGavetaRespondidas({});
        setTextos({});
        setJaClicouComecar(false);
        setFinalizado(false);
        setCountdown(10);
      }
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // 2. ESCUTA O STATUS DA SESSÃO (START / PAUSAR DESTE EVENTO) EM TEMPO REAL
  useEffect(() => {
    if (preview) return;
    const unsub = escutarStatusSessao((ativa) => {
      setSessaoAtiva(ativa);

      // SE ESTE DISPOSITIVO JÁ VOTOU NESTE EVENTO, NUNCA SAI DA TELA FINAL
      const jaVotou = localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
        (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');

      if (jaVotou) {
        setDispositivoBloqueado(true);
        setCurrentStep('final');
        return;
      }

      // Liberar, pausar ou atualizar a página não tira ninguém da tela em que estava:
      // só o "Zerar tudo" do admin volta ao início.
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // Cada tela extra começa na primeira página de opções (ou na página em que estava antes de atualizar)
  useEffect(() => {
    const r = slideRestauradoRef.current;
    if (r && r.passo === currentStep) {
      slideRestauradoRef.current = null;
      setExtraSlideIndex(r.slide);
    } else {
      setExtraSlideIndex(0);
    }
    setCampoObrigatorioErro(null);
  }, [currentStep]);

  // Guarda o progresso a cada mudança de tela ou resposta
  useEffect(() => {
    if (preview || eventoProgresso !== activeEventId) return;
    try {
      if (currentStep === 'final') {
        sessionStorage.removeItem(chaveProgresso(activeEventId));
        return;
      }
      sessionStorage.setItem(chaveProgresso(activeEventId), JSON.stringify({
        passo: currentStep,
        p1Slide: p1SlideIndex,
        extraSlide: extraSlideIndex,
        motivo: comoChegou,
        extras: respostasExtras,
        gavetasAbertas,
        gavetas: gavetaTextos,
        gavetaRespondidas,
        textos: dissertativaTextos,
        jaClicouComecar
      }));
    } catch (e) {}
  }, [preview, eventoProgresso, activeEventId, currentStep, p1SlideIndex, extraSlideIndex, comoChegou, respostasExtras,
    gavetasAbertas, gavetaTextos, gavetaRespondidas, dissertativaTextos, jaClicouComecar]);

  // 4. BLOQUEIO DO BOTÃO "VOLTAR" DO NAVEGADOR
  useEffect(() => {
    if (preview) return;
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

  // Escuta título do evento configurável pelo Admin para este evento
  useEffect(() => {
    if (preview) return;
    const unsub = escutarTituloEvento((titulo) => {
      if (titulo) setEventoTitulo(titulo);
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // Escuta configuração de perguntas e subtítulos do Firebase para este evento
  useEffect(() => {
    if (preview) return;
    const unsub = escutarConfigPerguntas((cfg) => {
      if (cfg) setQuestionsConfig(cfg);
    }, activeEventId);
    return () => unsub && unsub();
  }, [activeEventId]);

  // Timer de 10 segundos na tela final
  useEffect(() => {
    if (preview) return;
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
  // Tela 1 oculta pelo olho do editor: não aparece e não vira resposta
  const p1Oculta = Boolean(questionsConfig?.p1Oculta) && !preview;
  const cardsAtivosP1 = p1Oculta ? [] : todosCardsP1.filter((c) => c.ativo !== false);
  const iconesP1 = iconesDaTela(cardsAtivosP1);
  const cardsPorTela = Number(questionsConfig?.cardsPorTela) || 4;
  
  // Total de slides da Pergunta 1
  const totalSlidesP1 = Math.max(1, Math.ceil(cardsAtivosP1.length / cardsPorTela));
  const cardsDoSlideAtual = cardsAtivosP1.slice(
    p1SlideIndex * cardsPorTela,
    (p1SlideIndex + 1) * cardsPorTela
  );

  // Ao abrir uma subpergunta (ex.: "Outro") perto do rodapé, a tela sobe sozinha até ela ficar visível
  const cabecalhoRef = useRef(null);
  const ultimoToqueRef = useRef(0);
  const trocaTelaRef = useRef(0);
  useEffect(() => { trocaTelaRef.current = Date.now(); }, [currentStep, jaClicouComecar]);
  useEffect(() => {
    const aoTocar = () => { ultimoToqueRef.current = Date.now(); };
    window.addEventListener('pointerdown', aoTocar, true);
    return () => window.removeEventListener('pointerdown', aoTocar, true);
  }, []);
  const mostrarGaveta = useCallback((el) => {
    if (!el) return;
    const agora = Date.now();
    // só quando a pessoa acabou de tocar (não ao entrar na tela com a resposta já aberta)
    if (agora - ultimoToqueRef.current > 1500 || agora - trocaTelaRef.current < 700) return;
    setTimeout(() => {
      const bloco = (el.parentElement || el).getBoundingClientRect();
      const topo = cabecalhoRef.current && getComputedStyle(cabecalhoRef.current).position === 'sticky' ? cabecalhoRef.current.offsetHeight : 0;
      const rodape = 100;
      const subir = Math.min(el.getBoundingClientRect().bottom + rodape - window.innerHeight, bloco.top - topo - 10);
      if (subir > 4) window.scrollBy({ top: subir, behavior: 'smooth' });
    }, 60);
  }, []);

  // Telas extras ativas configuradas pelo admin
  const telasExtrasAtivas = (questionsConfig?.telasExtras || []).filter((t) => t.ativa !== false);

  // Se o admin ocultar ou mostrar telas no meio da pesquisa, a pessoa continua na mesma pergunta
  const idsTelas = telasExtrasAtivas.map((t) => t.id).join('|');
  const telaAtualRef = useRef({ ids: '', id: null });
  useEffect(() => {
    if (preview) return;
    const i = currentStep.startsWith('extra_') ? parseInt(currentStep.split('_')[1], 10) : -1;
    const antes = telaAtualRef.current;
    if (i >= 0 && antes.id && antes.ids && antes.ids !== idsTelas) {
      const novo = telasExtrasAtivas.findIndex((t) => t.id === antes.id);
      if (novo >= 0 && novo !== i) {
        telaAtualRef.current = { ids: idsTelas, id: antes.id };
        setCurrentStep(`extra_${novo}`);
        return;
      }
    }
    telaAtualRef.current = { ids: idsTelas, id: i >= 0 ? telasExtrasAtivas[i]?.id || null : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, currentStep, idsTelas]);

  // Se o admin remover a tela em que a pessoa estava, vai para a última tela que ainda existe
  // (espera um pouco: ao atualizar, a configuração do evento chega logo depois)
  useEffect(() => {
    if (preview || !currentStep.startsWith('extra_')) return undefined;
    const total = telasExtrasAtivas.length;
    if (parseInt(currentStep.split('_')[1], 10) < total) return undefined;
    const t = setTimeout(() => setCurrentStep(total > 0 ? `extra_${total - 1}` : 'p1'), 8000);
    return () => clearTimeout(t);
  }, [preview, currentStep, telasExtrasAtivas.length]);

  // Renderizador universal de conteúdo de Gaveta (Texto, Radio, Checkbox, Slide, Data, Hora)
  // ---------- toque nas opções: vibra, destaca e só avança depois de 500ms ----------
  const [clicado, setClicado] = useState(null);
  const cliqueRef = useRef(false);
  // Tela cheia no Android: no toque em Começar (ou no 1º toque, se não houver capa).
  // Uma vez por abertura: quem sair da tela cheia de propósito não é forçado de novo.
  const telaCheiaRef = useRef(false);
  const entrarTelaCheia = () => {
    if (preview || telaCheiaRef.current || !/Android/i.test(navigator.userAgent)) return;
    telaCheiaRef.current = true;
    try {
      const el = document.documentElement;
      if (document.fullscreenElement) return;
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el, { navigationUI: 'hide' })?.catch?.(() => {});
    } catch (e) {}
  };
  const comFeedback = (chave, acao, imediato = false) => {
    if (cliqueRef.current) return;
    entrarTelaCheia();
    try { navigator.vibrate?.(45); } catch (e) {}
    setClicado(chave);
    if (imediato) { acao(); setTimeout(() => setClicado(null), 500); return; }
    cliqueRef.current = true;
    setTimeout(() => {
      cliqueRef.current = false;
      setClicado(null);
      acao();
    }, 500);
  };
  const efeitoClique = (chave) => (clicado === chave ? 'efeito-clique ring-2 ring-emerald-400 shadow-[0_0_26px_rgba(16,185,129,0.65)]' : '');

  // ---------- páginas com várias perguntas ----------
  const TIPOS_CAMPO = ['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating', 'dropdown', 'radio', 'checkbox', 'grade'];
  const ehTelaCampo = (t) => Boolean(t) && TIPOS_CAMPO.includes(t.tipo);
  // Texto longo seguido de texto longo fica na mesma página por padrão; outros tipos só se marcado no editor
  const continuaNaMesmaPagina = (anterior, atual) => {
    if (!ehTelaCampo(anterior) || !ehTelaCampo(atual)) return false;
    if (atual.mesmaPagina === true) return true;
    if (atual.mesmaPagina === false) return false;
    return atual.tipo === 'texto' && anterior.tipo === 'texto';
  };

  // ---------- utilitários de respostas ----------
  const gavetaKey = (scope, opcao) => `${scope}::${opcao.id}`;
  const paraLista = (v) => (Array.isArray(v) ? v : (v ? String(v).split(', ').filter(Boolean) : []));
  const temValor = (v) => (Array.isArray(v) ? v.length > 0 : String(v ?? '').trim().length > 0);
  const textoResposta = (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''));
  const isGavetaAbertaDe = (scope, opcao) => {
    if (!opcao.temGaveta) return false;
    const k = gavetaKey(scope, opcao);
    return Boolean(gavetasAbertas[k] || gavetaRespondidas[k] || temValor(gavetaTextos[k]));
  };

  const renderGavetaContent = (opcao, onConfirmar, scope = 'p1') => {
    const gk = gavetaKey(scope, opcao);
    const g = opcao.gaveta || {};
    const gTipo = g.tipo || 'texto_longo';
    const valAtual = gavetaTextos[gk] ?? '';
    const opcoesLista = Array.isArray(g.opcoes) && g.opcoes.length > 0 ? g.opcoes : ['Opção 1', 'Opção 2'];
    const selectedChecks = paraLista(valAtual);

    return (
      <div ref={mostrarGaveta} className="t-gaveta p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500/50 shadow-xl space-y-3 animate-fade-in text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{g.pergunta || 'Por favor, detalhe sua resposta:'}</span>
          </p>
          {gavetaRespondidas[gk] && (
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Respondido
            </span>
          )}
        </div>

        {gTipo === 'radio' ? (
          <div className="space-y-2">
            {opcoesLista.map((itemStr, i) => (
              <label
                key={i}
                onClick={() => setGavetas((prev) => ({ ...prev, [gk]: itemStr }))}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  valAtual === itemStr
                    ? 'bg-amber-500/15 border-amber-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={`gav_radio_${gk}`}
                  checked={valAtual === itemStr}
                  onChange={() => setGavetas((prev) => ({ ...prev, [gk]: itemStr }))}
                  className="w-4 h-4 accent-amber-400"
                />
                <span className="text-xs sm:text-sm font-bold">{itemStr}</span>
              </label>
            ))}
          </div>
        ) : gTipo === 'checkbox' ? (
          <div className="space-y-2">
            {opcoesLista.map((itemStr, i) => {
              const isChecked = selectedChecks.includes(itemStr);
              return (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked
                        ? selectedChecks.filter(x => x !== itemStr)
                        : [...selectedChecks, itemStr];
                      setGavetas((prev) => ({ ...prev, [gk]: next }));
                    }}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span className="text-xs sm:text-sm font-bold">{itemStr}</span>
                </label>
              );
            })}
          </div>
        ) : gTipo === 'slider' ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-3xl font-black text-amber-400">
              {valAtual !== '' ? valAtual : (g.sliderMax ?? 10)}{g.sliderUnidade || ''}
            </div>
            <input
              type="range"
              min={g.sliderMin ?? 0}
              max={g.sliderMax ?? 10}
              step={g.sliderStep ?? 1}
              value={valAtual !== '' ? Number(valAtual) : (g.sliderMax ?? 10)}
              onChange={(e) => setGavetas((prev) => ({ ...prev, [gk]: e.target.value }))}
              className="w-full h-2.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{g.sliderMin ?? 0}</span>
              <span>{g.sliderMax ?? 10}</span>
            </div>
          </div>
        ) : gTipo === 'data' ? (
          <input
            type="date"
            value={valAtual}
            onChange={(e) => setGavetas((prev) => ({ ...prev, [gk]: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white focus:outline-none"
          />
        ) : gTipo === 'hora' ? (
          <input
            type="time"
            value={valAtual}
            onChange={(e) => setGavetas((prev) => ({ ...prev, [gk]: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white focus:outline-none"
          />
        ) : gTipo === 'texto_curto' ? (
          <input
            type="text"
            value={valAtual}
            onChange={(e) => setGavetas((prev) => ({ ...prev, [gk]: e.target.value }))}
            placeholder={g.placeholder || 'Digite sua resposta...'}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        ) : (
          <textarea
            rows={g.linhas || 3}
            value={valAtual}
            onChange={(e) => setGavetas((prev) => ({ ...prev, [gk]: e.target.value }))}
            placeholder={g.placeholder || 'Digite aqui sua resposta, pedido ou comentário...'}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none shadow-inner"
          />
        )}

        {campoObrigatorioErro === gk && (
          <p className="text-[11px] font-bold text-rose-300">Por favor, responda antes de continuar.</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            {temValor(valAtual) ? `Selecionado: ${textoResposta(valAtual)}` : (g.obrigatorio ? '* Obrigatório' : 'Opcional')}
          </span>
          <button
            type="button"
            onClick={() => {
              // Slider não tocado: grava o valor que está sendo mostrado
              if (gTipo === 'slider' && !temValor(gavetasRef.current[gk])) {
                setGavetas((prev) => ({ ...prev, [gk]: String(g.sliderMax ?? 10) }));
              }
              if (g.obrigatorio && gTipo !== 'slider' && !temValor(gavetasRef.current[gk])) {
                setCampoObrigatorioErro(gk);
                return;
              }
              setCampoObrigatorioErro(null);
              onConfirmar();
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition flex items-center gap-1.5"
          >
            <span>{g.botaoConfirmar || 'Confirmar & Avançar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Ao clicar no botão COMEÇAR na Tela 1 (quando habilitado pelo admin)
  const handleClicarComecar = () => {
    entrarTelaCheia();
    setJaClicouComecar(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Se a Tela 1 tem opções cadastradas, agora libera as opções da Tela 1 para responder
    if (cardsAtivosP1.length > 0) {
      return;
    }
    // Se a Tela 1 não tem opções (é apenas uma capa com texto + botão COMEÇAR), já avança para a próxima tela
    avancarDeP1();
  };
  // Avançar após Tela 1 (seja clicando num card ou no botão COMEÇAR)
  const avancarDeP1 = (motivoEscolhido = '') => {
    const finalMotivo = motivoEscolhido || comoChegou || questionsConfig?.pergunta1Titulo || 'Participante';
    setMotivo(finalMotivo);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (telasExtrasAtivas.length > 0) {
      setCurrentStep('extra_0');
    } else if (questionsConfig?.mostrarTelaAcompanhantes !== false) {
      setCurrentStep('acompanhantes');
    } else {
      handleSelectQtd(1, finalMotivo);
    }
  };

  // Tela 1 oculta: quem cairia nela vai direto para a próxima (nunca envia sozinho)
  const podePular = telasExtrasAtivas.length > 0 || questionsConfig?.mostrarTelaAcompanhantes !== false;
  const naTela1 = currentStep === 'p1' && (questionsConfig?.mostrarBotaoComecar === false || jaClicouComecar);
  useEffect(() => {
    if (p1Oculta && naTela1 && podePular && sessaoAtiva && !dispositivoBloqueado) avancarDeP1();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p1Oculta, naTela1, podePular, sessaoAtiva, dispositivoBloqueado]);

  // PRÓXIMA na Tela 1: segue sem gravar resposta (mantém a que já tiver sido dada)
  const pularP1 = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (telasExtrasAtivas.length > 0) setCurrentStep('extra_0');
    else if (questionsConfig?.mostrarTelaAcompanhantes !== false) setCurrentStep('acompanhantes');
    else handleSelectQtd(1);
  };

  // Avançar após selecionar um card na Pergunta 1
  const handleSelectComoChegou = (opcao) => {
    setMotivo(opcao.titulo);

    // Se o card tem gaveta condicional (campo para digitar ou sub-pergunta), expande a gaveta
    if (opcao.temGaveta) {
      setGavetasAbertas((prev) => ({
        ...prev,
        [gavetaKey('p1', opcao)]: true
      }));
      return;
    }

    avancarDeP1(opcao.titulo);
  };

  // Confirmar resposta da gaveta na Pergunta 1 e avançar
  const handleConfirmarGavetaP1 = (opcao) => {
    setMotivo(opcao.titulo);
    setGavetaRespondidas((prev) => ({ ...prev, [gavetaKey('p1', opcao)]: true }));
    avancarDeP1(opcao.titulo);
  };

  // Avançar após selecionar opção em tela extra
  const handleSelectOpcaoExtra = (telaIndex, opcao) => {
    const tela = telasExtrasAtivas[telaIndex];
    const nextExtras = { ...extrasRef.current, [tela.id]: opcao.titulo };
    setExtras(nextExtras);

    // Se o card tem gaveta condicional, abre a gaveta para o respondente digitar
    if (opcao.temGaveta) {
      setGavetasAbertas((prev) => ({
        ...prev,
        [gavetaKey(tela.id, opcao)]: true
      }));
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (telaIndex + 1 < telasExtrasAtivas.length) {
      setCurrentStep(`extra_${telaIndex + 1}`);
    } else if (questionsConfig?.mostrarTelaAcompanhantes !== false) {
      setCurrentStep('acompanhantes');
    } else {
      handleSelectQtd(1, motivoRef.current || (cardsAtivosP1.length > 0 ? null : opcao.titulo));
    }
  };

  // Confirmar resposta da gaveta em tela extra e avançar
  const handleConfirmarGavetaExtra = (telaIndex, opcao) => {
    const tela = telasExtrasAtivas[telaIndex];
    const nextExtras = { ...extrasRef.current, [tela.id]: opcao.titulo };
    setExtras(nextExtras);
    setGavetaRespondidas((prev) => ({ ...prev, [gavetaKey(tela.id, opcao)]: true }));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (telaIndex + 1 < telasExtrasAtivas.length) {
      setCurrentStep(`extra_${telaIndex + 1}`);
    } else if (questionsConfig?.mostrarTelaAcompanhantes !== false) {
      setCurrentStep('acompanhantes');
    } else {
      handleSelectQtd(1, motivoRef.current || (cardsAtivosP1.length > 0 ? null : opcao.titulo));
    }
  };

  // Monta as respostas com NOMES legíveis (título da pergunta), na ordem das telas.
  // Internamente tudo é guardado pelo ID da tela/opção, então telas com o mesmo
  // título ou opções com o mesmo id não se sobrescrevem mais.
  const montarRespostas = (motivo) => {
    const extras = extrasRef.current;
    const textos = textosRef.current;
    const gavetas = gavetasRef.current;
    const usados = {};
    const rotuloUnico = (base) => {
      const r = String(base || 'Pergunta').trim() || 'Pergunta';
      usados[r] = (usados[r] || 0) + 1;
      return usados[r] > 1 ? `${r} (${usados[r]})` : r;
    };

    const respostas = [];
    const respostasExtras = {};
    const textoRespostas = {};
    const gavetaRespostas = {};

    const tituloP1 = [questionsConfig?.pergunta1Titulo, questionsConfig?.pergunta1Titulo2].filter(Boolean).join(' ') || 'Tela 1';
    const rotuloP1 = rotuloUnico(tituloP1);
    if (cardsAtivosP1.length > 0 && motivo) {
      respostas.push({ telaId: 'p1', pergunta: rotuloP1, resposta: motivo });
    }
    // Só grava a gaveta da(s) opção(ões) realmente escolhida(s)
    const addGavetas = (scope, rotulo, opcoes, escolhida) => {
      (opcoes || []).forEach((op) => {
        const v = gavetas[gavetaKey(scope, op)];
        if (op.temGaveta && temValor(v) && escolhida(op)) {
          const r = rotuloUnico(`${rotulo} › ${op.titulo}`);
          gavetaRespostas[r] = textoResposta(v);
          respostas.push({ telaId: scope, pergunta: r, resposta: textoResposta(v) });
        }
      });
    };
    addGavetas('p1', rotuloP1, cardsAtivosP1, (op) => op.titulo === motivo);

    telasExtrasAtivas.forEach((tela, i) => {
      const titulo = tela.titulo || [tela.titulo1, tela.titulo2].filter(Boolean).join(' ') || `Tela ${i + 2}`;
      const rotulo = rotuloUnico(titulo);
      const isCards = !['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating', 'dropdown', 'radio', 'checkbox', 'grade'].includes(tela.tipo);
      const valor = isCards ? extras[tela.id] : textos[tela.id];
      if (temValor(valor)) {
        if (isCards) respostasExtras[rotulo] = textoResposta(valor);
        else textoRespostas[rotulo] = textoResposta(valor);
        respostas.push({ telaId: tela.id, pergunta: rotulo, resposta: textoResposta(valor) });
      }
      addGavetas(tela.id, rotulo, tela.opcoes, (op) => paraLista(valor).includes(op.titulo) || valor === op.titulo);
    });

    return { respostas, respostasExtras, textoRespostas, gavetaRespostas };
  };

  // ---------- campos da tela final ----------
  const respostaDe = (origem) => {
    if (origem === 'p1') return motivoRef.current || '';
    if (String(origem).startsWith('gaveta|')) return textoResposta(gavetasRef.current[origem.slice(7)]);
    return textoResposta(extrasRef.current[origem] ?? textosRef.current[origem]);
  };
  const guardarFinal = () => {
    const campos = questionsConfig?.finalCampos || [];
    const usados = linhasFinais(questionsConfig).flatMap((l) => camposDoTexto(l.texto, campos));
    const valores = Object.fromEntries(usados.map((c) => [c.origem, respostaDe(c.origem)]));
    setValoresFinais(valores);
    try {
      if (usados.length) localStorage.setItem(chaveFinal(activeEventId), JSON.stringify(valores));
      else localStorage.removeItem(chaveFinal(activeEventId));
    } catch (e) {}
  };
  const valorNoFinal = (campo) => (preview ? respostaDe(campo.origem) || exemploDe(campo) : valoresFinais[campo.origem] || respostaDe(campo.origem));

  const travarDispositivo = () => {
    guardarFinal();
    const agoraIso = new Date().toISOString();
    localStorage.setItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY, 'true');
    localStorage.setItem(DISPOSITIVO_VOTO_TIME_EVENTO_KEY, agoraIso);
    if (activeEventId === DEFAULT_EVENT_ID) {
      localStorage.setItem(DISPOSITIVO_BLOQUEADO_KEY, 'true');
      localStorage.setItem(DISPOSITIVO_VOTO_TIME_KEY, agoraIso);
    }
    setDispositivoBloqueado(true);
    setCurrentStep('final');
  };

  const enviarRegistro = async (registro) => {
    enviandoRef.current = true;
    setEnviando(true);
    setErroEnvio('');
    try {
      const resultado = await registrarPresenca(registro);
      // Só trava o celular DEPOIS que a resposta foi aceita (ou ficou guardada para envio automático)
      setEnvioPendente(Boolean(resultado?.pendente));
      travarDispositivo();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
    } catch (e) {
      console.error('Erro ao enviar resposta:', e);
      setErroEnvio('Não conseguimos enviar sua resposta. Verifique a internet e toque em "Tentar novamente".');
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  // Ao escolher quantidade de acompanhantes (ou finalizar na última tela): registra e trava este dispositivo
  const handleSelectQtd = (qtd, overrideComoChegou = null) => {
    if (preview) { setCurrentStep('final'); return; }
    const estaBloqueadoAntes = enviandoRef.current || dispositivoBloqueado || currentStep === 'final' || 
      localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' || 
      (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');
    if (estaBloqueadoAntes) return;

    const motivo = overrideComoChegou || motivoRef.current || comoChegou || '';
    const montadas = montarRespostas(motivo);
    const registro = {
      // Tela 1 pulada (PRÓXIMA) não pode virar resposta
      comoChegou: motivo || (cardsAtivosP1.length > 0 ? 'Não respondeu' : questionsConfig?.pergunta1Titulo) || 'Participante',
      qtdPessoas: qtd,
      evento: eventoTitulo,
      ...montadas,
      eventoId: activeEventId
    };
    ultimoEnvioRef.current = registro;
    enviarRegistro(registro);
  };

  // Layout (tema) da página: o geral, ou o próprio da página que não herda
  const temaAtual = lerGeral(questionsConfig, currentStep.startsWith('extra_') ? telasExtrasAtivas[parseInt(currentStep.split('_')[1], 10)] : null, '')('tema');
  const temaCls = classeTema(temaAtual);
  useEffect(() => { carregarFonteTema(temaAtual); }, [temaAtual]);
  const fontesUsadas = fontesEmUso(questionsConfig).join(',');
  useEffect(() => { carregarFontes(fontesUsadas.split(',').filter(Boolean)); }, [fontesUsadas]);

  // ==============================================================
  // ENVIANDO / ERRO NO ENVIO (o celular só trava depois que a resposta foi aceita)
  // ==============================================================
  if (enviando || erroEnvio) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none t-pagina ${temaCls}`}>
        <div className="t-painel w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
          {enviando ? (
            <>
              <div className="w-14 h-14 mx-auto rounded-full border-4 border-slate-700 border-t-amber-400 animate-spin" />
              <p className="font-black text-white text-lg">Enviando sua resposta...</p>
              <p className="text-xs text-slate-400">Não feche esta tela.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
              <p className="font-black text-white text-lg">Ops! Não foi enviado</p>
              <p className="text-sm text-slate-300">{erroEnvio}</p>
              <button
                type="button"
                onClick={() => ultimoEnvioRef.current && enviarRegistro(ultimoEnvioRef.current)}
                className="w-full py-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==============================================================
  // PRIORIDADE 1: SE O APARELHO JÁ VOTOU NESTE EVENTO, FICA BLOQUEADO NA TELA FINAL!
  // NÃO ADIANTA ATUALIZAR A PÁGINA (F5) NEM REABRIR O NAVEGADOR!
  // ==============================================================
  const isVotadoNesteEvento = preview ? currentStep === 'final' : dispositivoBloqueado || currentStep === 'final' || 
    localStorage.getItem(DISPOSITIVO_BLOQUEADO_EVENTO_KEY) === 'true' ||
    (activeEventId === DEFAULT_EVENT_ID && localStorage.getItem(DISPOSITIVO_BLOQUEADO_KEY) === 'true');

  if (isVotadoNesteEvento) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none fade-in t-pagina ${temaCls}`}>
        <div className="t-painel w-full max-w-sm bg-slate-900/95 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <TelaFinal config={questionsConfig} valorDe={valorNoFinal}>
            {envioPendente && (
              <p className="text-[11px] text-amber-300/90 pt-3">
                Internet lenta: sua resposta foi guardada e será enviada automaticamente. Mantenha esta página aberta por alguns instantes.
              </p>
            )}
          </TelaFinal>
        </div>
      </div>
    );
  }

  // ==============================================================
  // PRIORIDADE 2: SE NÃO VOTOU AINDA E A SESSÃO NÃO FOI INICIADA
  // ==============================================================
  if (!sessaoAtiva) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in relative overflow-hidden t-pagina ${temaCls}`}>
        {/* Luzes decorativas de fundo */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="t-painel w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl relative space-y-7 flex flex-col items-center">
          
          {/* ÍCONE ANIMADO ESCOLHIDO PELO ADMIN */}
          <IconeEspera tipo={questionsConfig.esperaIcone || 'lapis'} tamanho={128} />

          {/* TEXTO EM EXATAS 3 LINHAS COM FONTES E CORES INDIVIDUAIS */}
          <div className="space-y-1 text-center">
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha1Tamanho || questionsConfig.esperaFonteTamanho || 26}px`, ...fonteEBorda(questionsConfig, 'esperaLinha1', false) }}
              className={`font-black tracking-wide uppercase leading-tight drop-shadow-sm ${getCorTextoLinhaClass(questionsConfig.esperaLinha1Cor, 'text-white')}`}
            >
              {questionsConfig.esperaLinha1 ?? 'DENTRO DE INSTANTES'}
            </h2>
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha2Tamanho || questionsConfig.esperaFonteTamanho || 26}px`, ...fonteEBorda(questionsConfig, 'esperaLinha2', false) }}
              className={`font-black tracking-wide uppercase leading-tight drop-shadow-sm ${getCorTextoLinhaClass(questionsConfig.esperaLinha2Cor, 'text-amber-300')}`}
            >
              {questionsConfig.esperaLinha2 ?? 'ESTARÁ LIBERADO'}
            </h2>
            <h2 
              style={{ fontSize: `${questionsConfig.esperaLinha3Tamanho || questionsConfig.esperaFonteTamanho || 26}px`, ...fonteEBorda(questionsConfig, 'esperaLinha3', false) }}
              className={`font-black tracking-wide uppercase leading-tight drop-shadow-sm ${getCorTextoLinhaClass(questionsConfig.esperaLinha3Cor, 'text-emerald-400')}`}
            >
              {questionsConfig.esperaLinha3 ?? 'PARA RESPONDER.'}
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

  const etapas = telasExtrasAtivas.length + (p1Oculta ? 0 : 1) + (questionsConfig?.mostrarTelaAcompanhantes !== false ? 1 : 0);
  const progresso = (currentStep === 'p1' ? 1 : currentStep === 'acompanhantes' ? etapas : parseInt(currentStep.split('_')[1], 10) + 2) / Math.max(1, etapas + 1);

  // Cabeçalho preso no alto: só onde há título (não na capa nem em página com várias perguntas)
  const cabecalhoTravado = questionsConfig?.travarCabecalho !== false &&
    !(currentStep === 'p1' && questionsConfig?.mostrarBotaoComecar !== false && !jaClicouComecar) &&
    !(currentStep.startsWith('extra_') && (() => {
      const i = parseInt(currentStep.split('_')[1], 10);
      return continuaNaMesmaPagina(telasExtrasAtivas[i], telasExtrasAtivas[i + 1]);
    })());

  // ==============================================================
  // FLUXO PRINCIPAL: TELAS 1, 2, 3, 4, 5
  // ==============================================================
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto t-pagina ${temaCls}`}>
      
      {/* ============================================================ */}
      {/* CABEÇALHO DA ETAPA ATUAL                                     */}
      {/* ============================================================ */}
      {questionsConfig?.mostrarProgresso && !(currentStep === 'p1' && questionsConfig?.mostrarBotaoComecar !== false && !jaClicouComecar) && (
        <BarraProgresso config={questionsConfig} valor={progresso} etapas={etapas} />
      )}
      <header
        ref={cabecalhoRef}
        className={`t-cabecalho text-center pb-2 ${cabecalhoTravado ? 'sticky top-0 z-20 bg-slate-950 -mx-4 px-4 -mt-4 pt-6 sm:-mx-6 sm:px-6 sm:-mt-6 sm:pt-8 shadow-lg shadow-slate-950/60' : 'w-full pt-2'}`}
      >
        {/* TÍTULO DA CAPA (QUANDO BOTÃO COMEÇAR ESTÁ ATIVO E AINDA NÃO CLICOU) */}
        {currentStep === 'p1' && questionsConfig.mostrarBotaoComecar !== false && !jaClicouComecar && (
          <div className="mt-2 pt-3 flex flex-col">
            {linhasCapa(questionsConfig).map((l, i, todas) => {
              const Linha = l.texto ? 'p' : 'h3';
              return (
                <div
                  key={l.id}
                  style={{ ...l.caixa, marginBottom: i < todas.length - 1 ? l.espaco : 0 }}
                  className={`t-capa ${l.texto ? 't-capa-texto' : 't-titulo'} ${getAlinhamentoClass(l.alinhamento)} ${l.classeCaixa}`}
                >
                  <Linha
                    style={{ fontSize: `${l.tamanho}px`, lineHeight: l.entrelinha }}
                    className={`${pesoFonte(l.bold, !l.texto)} ${caixaAlta(l.maiusculas)} whitespace-pre-line ${getCorTextoLinhaClass(l.cor)}`}
                  >
                    {l.conteudo}
                  </Linha>
                </div>
              );
            })}
          </div>
        )}

        {/* TÍTULO DA ETAPA ATUAL: TELA 1 */}
        {currentStep === 'p1' && (questionsConfig.mostrarBotaoComecar === false || jaClicouComecar) && (
          <div className="mt-2 pt-2 flex flex-col" style={{ gap: espacos(questionsConfig, true).sub, marginBottom: espacos(questionsConfig, true).cards }}>
            {(questionsConfig.pergunta1Titulo || questionsConfig.pergunta1Titulo2 || questionsConfig.pergunta1Titulo3) && (
              <div style={{ gap: espacos(questionsConfig, true).tit, ...faixaEstilo(estiloLinhas(questionsConfig, 'pergunta1').tituloFundo, questionsConfig.pergunta1TituloFaixa ?? questionsConfig.faixaPadrao), ...fonteEBorda(questionsConfig, 'pergunta1Titulo', estiloLinhas(questionsConfig, 'pergunta1').tituloFundo !== 'transparente') }} className={`t-titulo flex flex-col ${getAlinhamentoClass(estiloLinhas(questionsConfig, 'pergunta1').tituloAl)} ${getFaixaFundoClass(estiloLinhas(questionsConfig, 'pergunta1').tituloFundo, '-mx-4 px-4 sm:-mx-6 sm:px-6')}`}>
                {questionsConfig.pergunta1Titulo && (
                  <h2 
                    style={{ fontSize: `${questionsConfig.pergunta1FonteTamanho || 22}px` }}
                    className={`${pesoFonte(questionsConfig.pergunta1TituloBold)} ${caixaAlta(questionsConfig.pergunta1TituloCaixa)} leading-tight ${getCorTextoLinhaClass(questionsConfig.pergunta1TituloCor, 'text-white')}`}
                  >
                    <TituloRico texto={questionsConfig.pergunta1Titulo} />
                  </h2>
                )}
                {questionsConfig.pergunta1Titulo2 && (
                  <h2 
                    style={{ fontSize: `${questionsConfig.pergunta1Titulo2Tamanho || 18}px` }}
                    className={`${pesoFonte(questionsConfig.pergunta1TituloBold)} ${caixaAlta(questionsConfig.pergunta1TituloCaixa)} leading-tight ${getCorTextoLinhaClass(questionsConfig.pergunta1Titulo2Cor, 'text-amber-300')}`}
                  >
                    {questionsConfig.pergunta1Titulo2}
                  </h2>
                )}
                {questionsConfig.pergunta1Titulo3 && (
                  <h2 
                    style={{ fontSize: `${questionsConfig.pergunta1Titulo3Tamanho || 16}px` }}
                    className={`${pesoFonte(questionsConfig.pergunta1TituloBold)} ${caixaAlta(questionsConfig.pergunta1TituloCaixa)} leading-tight ${getCorTextoLinhaClass(questionsConfig.pergunta1Titulo3Cor, 'text-emerald-400')}`}
                  >
                    {questionsConfig.pergunta1Titulo3}
                  </h2>
                )}
              </div>
            )}
            {/* SUBTÍTULO DA TELA 1 (alinhamento, tamanho e fundo próprios — igual ao preview) */}
            {questionsConfig.pergunta1TextoAbaixo && (
              <p
                style={{ fontSize: `${questionsConfig.pergunta1TextoAbaixoTamanho || 14}px`, ...faixaEstilo(estiloLinhas(questionsConfig, 'pergunta1').subFundo, questionsConfig.pergunta1SubFaixa ?? questionsConfig.faixaPadrao), ...fonteEBorda(questionsConfig, 'pergunta1Sub', estiloLinhas(questionsConfig, 'pergunta1').subFundo !== 'transparente') }}
                className={`t-sub leading-relaxed whitespace-pre-line ${getAlinhamentoClass(estiloLinhas(questionsConfig, 'pergunta1').subAl)} ${getFaixaFundoClass(estiloLinhas(questionsConfig, 'pergunta1').subFundo, '-mx-4 px-4 sm:-mx-6 sm:px-6')} ${questionsConfig.pergunta1SubBold ? 'font-bold' : ''} ${caixaAlta(questionsConfig.pergunta1SubCaixa)} ${getCorTextoLinhaClass(questionsConfig.pergunta1TextoAbaixoCor, 'text-slate-300')}`}
              >
                {questionsConfig.pergunta1TextoAbaixo}
              </p>
            )}
          </div>
        )}

        {/* TELA EXTRA (SE HOUVER) — mesmos títulos, cores, tamanhos e alinhamento do preview */}
        {currentStep.startsWith('extra_') && (() => {
          const idx = parseInt(currentStep.split('_')[1], 10);
          const tela = telasExtrasAtivas[idx];
          if (!tela) return null;
          // Página com várias perguntas: a primeira também é pergunta, não título
          if (continuaNaMesmaPagina(tela, telasExtrasAtivas[idx + 1])) return null;
          const linha1 = tela.titulo1 || tela.titulo || `Pergunta da Tela ${idx + 2}`;
          return (
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col" style={{ gap: espacos(tela).sub, marginBottom: espacos(tela).cards }}>
              <div style={{ gap: espacos(tela).tit, ...faixaEstilo(estiloLinhas(tela).tituloFundo, tela.tituloFaixa ?? questionsConfig?.faixaPadrao), ...fonteEBorda(tela, 'titulo', estiloLinhas(tela).tituloFundo !== 'transparente') }} className={`t-titulo flex flex-col ${getAlinhamentoClass(estiloLinhas(tela).tituloAl)} ${getFaixaFundoClass(estiloLinhas(tela).tituloFundo, '-mx-4 px-4 sm:-mx-6 sm:px-6')}`}>
              <h2 style={{ fontSize: `${tela.titulo1Tamanho || 20}px` }} className={`${pesoFonte(tela.tituloBold)} ${caixaAlta(tela.tituloCaixa)} leading-tight ${getCorTextoLinhaClass(tela.titulo1Cor, 'text-white')}`}>
                <TituloRico texto={linha1} />
              </h2>
              {tela.titulo2 && (
                <h2 style={{ fontSize: `${tela.titulo2Tamanho || 15}px` }} className={`${pesoFonte(tela.tituloBold)} ${caixaAlta(tela.tituloCaixa)} leading-tight ${getCorTextoLinhaClass(tela.titulo2Cor, 'text-amber-300')}`}>
                  {tela.titulo2}
                </h2>
              )}
              {tela.titulo3 && (
                <h2 style={{ fontSize: `${tela.titulo3Tamanho || 14}px` }} className={`${pesoFonte(tela.tituloBold)} ${caixaAlta(tela.tituloCaixa)} leading-tight ${getCorTextoLinhaClass(tela.titulo3Cor, 'text-emerald-400')}`}>
                  {tela.titulo3}
                </h2>
              )}
              </div>
              {tela.subtitulo && !subtituloRepeteLegenda(tela) && (
                <p style={{ fontSize: `${tela.subtituloTamanho || 13}px`, ...faixaEstilo(estiloLinhas(tela).subFundo, tela.subFaixa ?? questionsConfig?.faixaPadrao), ...fonteEBorda(tela, 'sub', estiloLinhas(tela).subFundo !== 'transparente') }} className={`t-sub leading-snug ${getAlinhamentoClass(estiloLinhas(tela).subAl)} ${getFaixaFundoClass(estiloLinhas(tela).subFundo, '-mx-4 px-4 sm:-mx-6 sm:px-6')} ${tela.subBold ? 'font-bold' : ''} ${caixaAlta(tela.subCaixa)} ${getCorTextoLinhaClass(tela.subtituloCor, 'text-slate-300')}`}>
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
              style={{ fontSize: `${questionsConfig.pergunta2FonteTamanho || 22}px`, ...fonteEBorda(questionsConfig, 'pergunta2', false) }}
              className="t-pergunta t-cor font-black text-white leading-tight whitespace-pre-line"
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
              <p className="t-sub t-cor text-xs sm:text-sm text-slate-400 mt-1">
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
        {/* ETAPA 1: PERGUNTA 1 / CAPA COM BOTÃO COMEÇAR (SE HABILITADO) */}
        {/* ============================================================ */}
        {currentStep === 'p1' && (
          <div className="space-y-3.5 fade-in">
            
            {/* SE O BOTÃO COMEÇAR ESTIVER HABILITADO E O USUÁRIO AINDA NÃO CLICOU NELE: EXIBE APENAS O BOTÃO COMEÇAR */}
            {questionsConfig.mostrarBotaoComecar !== false && !jaClicouComecar ? (
              <>
              <div className="h-24" />
              <div className="t-rodape fixed bottom-0 inset-x-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
                {(() => {
                  const ler = (k) => questionsConfig?.[`comecar${k}`];
                  const st = estiloBotao(ler);
                  const linha = corLinhaHex(ler('Linha'));
                  const raio = ler('Raio');
                  return (
                <button
                  type="button"
                  onClick={handleClicarComecar}
                  style={{
                    width: `${ler('Largura') ?? 100}%`,
                    ...(raio !== undefined ? { borderRadius: raio } : {}),
                    ...(ler('LinhaEspessura') !== undefined ? { padding: ler('LinhaEspessura') } : {}),
                    ...(st.boxShadow ? { boxShadow: st.boxShadow } : {})
                  }}
                  className="t-comecar-borda relative max-w-md mx-auto block p-[2.5px] rounded-2xl overflow-hidden shadow-[0_0_28px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all group"
                >
                  {/* Brilho suave girando no contorno (sentido horário) */}
                  {linha !== 'transparent' && (
                    <div
                      className="t-comecar-giro absolute inset-[-200%] animate-spin"
                      style={{
                        animationDuration: '3.5s',
                        background: linha
                          ? `conic-gradient(from 0deg, transparent 0%, ${linha}55 60%, ${linha} 85%, transparent 100%)`
                          : 'conic-gradient(from 0deg, transparent 0%, transparent 60%, #6ee7b7 80%, #10b981 90%, transparent 100%)'
                      }}
                    />
                  )}
                  <div
                    style={{
                      ...(st.background ? { background: st.background } : {}),
                      ...(st.color ? { color: st.color } : {}),
                      ...(st.boxShadow ? { boxShadow: st.boxShadow } : {}),
                      ...(st.height ? { height: st.height, paddingTop: 0, paddingBottom: 0 } : {}),
                      ...(st.fontSize ? { fontSize: st.fontSize } : {}),
                      ...(st.fontFamily ? { fontFamily: st.fontFamily } : {}),
                      ...(raio !== undefined ? { borderRadius: Math.max(0, raio - 2) } : {})
                    }}
                    className="t-comecar relative w-full py-4 px-6 rounded-[14px] bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-black text-base uppercase tracking-widest flex items-center justify-center gap-2.5"
                  >
                    <Sparkles className="w-5 h-5 opacity-90 animate-pulse" />
                    <span>{questionsConfig.pergunta1BotaoComecarTexto || 'COMEÇAR'}</span>
                    <ChevronRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                  );
                })()}
              </div>
              </>
            ) : (
              <>
                {/* SE DESABILITADO (COMEÇA DIRETO) OU JÁ CLICOU EM COMEÇAR: MOSTRA AS PERGUNTAS/OPÇÕES */}
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

                {/* Cards do Slide Atual */}
                <div className="flex flex-col" style={{ gap: Number(questionsConfig?.cardEspaco ?? CARD_ESPACO_PADRAO) }}>
                  {cardsDoSlideAtual.map((opcao) => {
                    const IconComponent = componenteIcone(iconesP1[opcao.id]);
                    const corCls = COR_CLASSES[opcao.cor] || COR_CLASSES.amber;
                    const cardFundoCls = CARD_FUNDO_CLASSES[questionsConfig?.cardFundoEstilo] || CARD_FUNDO_CLASSES.escuro;
                    const cardFonteTituloCls = CARD_FONTE_TITULO_CLASSES[questionsConfig?.cardCorFonteTitulo] || 'text-white';
                    const cardFonteSubtituloCls = CARD_FONTE_SUBTITULO_CLASSES[questionsConfig?.cardCorFonteSubtitulo] || 'text-slate-400';
                    const cardEfeitoInline = getEfeitoStyle(questionsConfig?.cardEfeitoEstilo, questionsConfig?.cardProfundidade);
                    const medidas = medidasCard(questionsConfig?.cardAltura, cantosCard(questionsConfig, telaP1Cantos(questionsConfig)));

                    const isGavetaAberta = isGavetaAbertaDe('p1', opcao);

                    return (
                      <div key={opcao.id} className="t-linha space-y-2">
                        <button
                          type="button"
                          onClick={() => comFeedback(`p1_${opcao.id}`, () => handleSelectComoChegou(opcao), opcao.temGaveta)}
                          style={{ ...medidas.caixa, ...cardEfeitoInline, ...fonteEBorda(questionsConfig, 'card', true, false) }}
                          className={`t-card w-full text-left px-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-between group border border-white/15 ${cardFundoCls} ${
                            isGavetaAberta ? 'border-amber-400/80 ring-1 ring-amber-400/40' : ''
                          } ${efeitoClique(`p1_${opcao.id}`)
                          }`}
                        >
                          <div className="flex items-center gap-4 pr-2 min-w-0">
                            {questionsConfig?.mostrarIconesCards !== false && (
                              <div style={medidas.icone} className={`t-icone rounded-xl flex items-center justify-center shrink-0 border ${corCls}`}>
                                <IconComponent className="w-1/2 h-1/2" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 
                                style={{ fontSize: `${questionsConfig.cardFonteTitulo || 16}px` }}
                                className={`font-bold transition leading-snug line-clamp-2 ${cardFonteTituloCls}`}
                              >
                                {opcao.titulo}
                              </h3>
                              {opcao.subtitulo && (
                                <p 
                                  style={{ fontSize: `${questionsConfig.cardFonteSubtitulo || 12}px` }}
                                  className={`t-desc mt-0.5 line-clamp-2 leading-snug ${cardFonteSubtituloCls}`}
                                >
                                  {opcao.subtitulo}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="t-ir w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300 group-hover:border-amber-400/50 transition">
                            {opcao.temGaveta ? (
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGavetaAberta ? 'rotate-180 text-amber-400' : ''}`} />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {/* GAVETA ACCORDION MULTI-COMPONENTE NA TELA 1 */}
                        {opcao.temGaveta && isGavetaAberta && renderGavetaContent(opcao, () => handleConfirmarGavetaP1(opcao), 'p1')}
                      </div>
                    );
                  })}
                </div>

                {/* Controles de Navegação de Slide */}
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

                {/* Caso não haja opções e o botão Começar estivesse desabilitado, exibe botão para avançar */}
                {cardsAtivosP1.length === 0 && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => avancarDeP1()}
                      className="w-full py-4 px-6 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>{questionsConfig.pergunta1BotaoComecarTexto || 'COMEÇAR'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {cardsAtivosP1.length > 0 && (
                  <RodapeSetas
                    seta={configSeta(lerGeral(questionsConfig, null, 'seta'))}
                    aceso={clicado === 'voltar_p1' ? 'anterior' : clicado === 'proxima_p1' ? 'proxima' : ''}
                    onAnterior={questionsConfig.mostrarBotaoComecar !== false ? () => comFeedback('voltar_p1', () => setJaClicouComecar(false)) : null}
                    onProxima={!questionsConfig.pergunta1Obrigatoria || temValor(comoChegou) ? () => comFeedback('proxima_p1', () => {
                      if (p1SlideIndex < totalSlidesP1 - 1) setP1SlideIndex(p1SlideIndex + 1);
                      else pularP1();
                    }) : null}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TELAS EXTRAS (TODOS OS 10 COMPONENTES MUNDIAIS)              */}
        {/* ============================================================ */}
        {currentStep.startsWith('extra_') && (() => {
          const idx = parseInt(currentStep.split('_')[1], 10);
          const tela = telasExtrasAtivas[idx];
          if (!tela) return null;

          // Telas de campo que continuam na MESMA página da anterior (rola com o dedo e responde)
          let fimGrupo = idx;
          while (fimGrupo + 1 < telasExtrasAtivas.length && continuaNaMesmaPagina(telasExtrasAtivas[fimGrupo], telasExtrasAtivas[fimGrupo + 1])) fimGrupo++;
          const grupo = ehTelaCampo(tela) ? telasExtrasAtivas.slice(idx, fimGrupo + 1) : [tela];
          const proximoIdx = idx + grupo.length;

          const avancarParaProxima = (valorSalvo = null) => {
            if (valorSalvo !== null) {
              setTextos((prev) => ({ ...prev, [tela.id]: valorSalvo }));
            }
            setCampoObrigatorioErro(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (proximoIdx < telasExtrasAtivas.length) {
              setCurrentStep(`extra_${proximoIdx}`);
            } else if (questionsConfig?.mostrarTelaAcompanhantes !== false) {
              setCurrentStep('acompanhantes');
            } else {
              handleSelectQtd(1, motivoRef.current || (cardsAtivosP1.length > 0 ? null : 'Participante'));
            }
          };

          const voltarParaAnterior = () => {
            if (idx === 0) {
              if (p1Oculta) setJaClicouComecar(false);
              setCurrentStep('p1');
            } else {
              // volta para o INÍCIO da página anterior
              let alvo = idx - 1;
              while (alvo > 0 && continuaNaMesmaPagina(telasExtrasAtivas[alvo - 1], telasExtrasAtivas[alvo])) alvo--;
              setCurrentStep(`extra_${alvo}`);
            }
          };

          const confirmarDentro = (t, v) => {
            if (grupo.length > 1) {
              if (v !== null) setTextos((prev) => ({ ...prev, [t.id]: v }));
              return;
            }
            avancarParaProxima(v);
          };

          const valKey = tela.id;
          const valAtual = dissertativaTextos[valKey] ?? '';

          // 1. TEXTO LONGO, TEXTO CURTO, DATA, HORA, SLIDER, RATING, DROPDOWN, RADIO, CHECKBOX, GRADE
          if (['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating', 'dropdown', 'radio', 'checkbox', 'grade'].includes(tela.tipo)) {
            // Várias perguntas de campo longo: os campos dividem a altura da tela para caber tudo na mesma página
            const cabeTudo = grupo.length > 1 && grupo.every((t) => t.tipo === 'texto');
            const renderCampoTela = (tela, mostrarTitulo, primeira) => {
            const valKey = tela.id;
            const valAtual = dissertativaTextos[valKey] ?? '';
            const opcoesAtivas = (tela.opcoes || []).filter(o => o.ativo !== false);
            const selectedChecks = paraLista(valAtual);
            // Obrigatória e ainda sem resposta: borda vermelha suave
            // some sozinho assim que o campo fica certo
            const erroCampo = campoObrigatorioErro === tela.id
              ? erroDeFormato(tela, valAtual) || (temValor(valAtual) ? '' : mensagemFalta(tela, [tela.titulo1 || tela.titulo, tela.titulo2].filter(Boolean).join(' ')))
              : '';
            const bordaCampo = erroCampo ? 'campo-erro' : tela.obrigatorio && !temValor(valAtual) ? 'border-rose-400/50' : 'border-slate-700';
            const defaultSliderVal = Math.round(((tela.sliderMin ?? 0) + (tela.sliderMax ?? 10)) / 2);
            return (
              <div key={tela.id} id={`campo_${tela.id}`} className={`scroll-mt-4 ${cabeTudo ? 'flex-1 flex flex-col' : ''}`}>
                {mostrarTitulo && (
                  <div style={{ gap: espacos(tela).sub, marginBottom: cabeTudo ? Math.min(8, espacos(tela).cards) : espacos(tela).cards }} className={`flex flex-col ${primeira ? '' : `${cabeTudo ? 'pt-2' : 'pt-4'} border-t border-slate-800/60`} ${getAlinhamentoClass(estiloLinhas(tela).tituloAl)}`}>
                    <h3 style={{ fontSize: `${tela.titulo1Tamanho || 18}px`, ...fonteEBorda(tela, 'titulo', false) }} className={`t-pergunta ${pesoFonte(tela.tituloBold)} ${caixaAlta(tela.tituloCaixa)} leading-tight ${getCorTextoLinhaClass(tela.titulo1Cor, 'text-white')}`}>
                      <TituloRico texto={[tela.titulo1 || tela.titulo, tela.titulo2, tela.titulo3].filter(Boolean).join(' ')} />
                    </h3>
                    {tela.subtitulo && (
                      <p style={{ fontSize: `${tela.subtituloTamanho || 13}px`, ...fonteEBorda(tela, 'sub', false) }} className={`leading-snug ${getAlinhamentoClass(estiloLinhas(tela).subAl)} ${tela.subBold ? 'font-bold' : ''} ${caixaAlta(tela.subCaixa)} ${getCorTextoLinhaClass(tela.subtituloCor, 'text-slate-300')}`}>
                        {tela.subtitulo}
                      </p>
                    )}
                  </div>
                )}
                <div className={cabeTudo ? 'flex-1 flex flex-col' : 'space-y-4'}>
                  {tela.tipo === 'texto' && (
                    <textarea
                      rows={cabeTudo ? 1 : tela.linhas || 4}
                      onInput={cabeTudo ? (e) => { const el = e.currentTarget; if (el.scrollHeight > el.clientHeight) el.style.minHeight = `${el.scrollHeight + 2}px`; } : undefined}
                      value={valAtual}
                      onChange={(e) => setTextos((prev) => ({ ...prev, [valKey]: e.target.value }))}
                      placeholder={tela.placeholder || 'Digite sua resposta aqui...'}
                      style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                      className={`t-campo w-full bg-slate-950 border ${bordaCampo} focus:border-amber-400 rounded-2xl ${usaMaiusculas(tela) ? 'uppercase placeholder:normal-case' : ''} ${cabeTudo ? 'flex-1 min-h-[52px] px-4 py-2.5' : 'p-4'} text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none transition resize-none shadow-inner`}
                    />
                  )}

                  {tela.tipo === 'texto_curto' && (
                    <input
                      {...atributosCampo(tela)}
                      value={valAtual}
                      aria-invalid={Boolean(erroCampo)}
                      aria-describedby={erroCampo ? `erro_${tela.id}` : undefined}
                      onChange={(e) => {
                        const el = e.currentTarget;
                        // a máscara só entra digitando no fim: corrigir no meio não faz o cursor pular
                        const noFim = el.selectionStart === el.value.length;
                        const apagando = el.value.length < String(valAtual).length;
                        const v = tela.formatoCampo === 'telefone' && noFim && !apagando ? mascaraTelefone(el.value) : el.value;
                        setTextos((prev) => ({ ...prev, [valKey]: v }));
                      }}
                      onBlur={() => { if (tela.formatoCampo) setTextos((prev) => ({ ...prev, [valKey]: valorGravado(tela, prev[valKey] ?? '') })); }}
                      placeholder={tela.placeholder || 'Digite sua resposta curta...'}
                      style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                      className={`${usaMaiusculas(tela) ? 'uppercase placeholder:normal-case' : ''} t-campo w-full bg-slate-950 border ${bordaCampo} focus:border-amber-400 rounded-2xl p-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none transition shadow-inner`}
                    />
                  )}

                  {tela.tipo === 'data' && (
                    <input
                      type="date"
                      value={valAtual}
                      onChange={(e) => setTextos((prev) => ({ ...prev, [valKey]: e.target.value }))}
                      style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                      className={`t-campo w-full bg-slate-950 border ${bordaCampo} focus:border-amber-400 rounded-2xl p-4 text-base text-white focus:outline-none`}
                    />
                  )}

                  {tela.tipo === 'hora' && (
                    <input
                      type="time"
                      value={valAtual}
                      onChange={(e) => setTextos((prev) => ({ ...prev, [valKey]: e.target.value }))}
                      style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                      className={`t-campo w-full bg-slate-950 border ${bordaCampo} focus:border-amber-400 rounded-2xl p-4 text-base text-white focus:outline-none`}
                    />
                  )}

                  {tela.tipo === 'slider' && (
                    <div className="t-caixa p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                      <div>
                        <InstrucaoEscala tela={tela} posicao="acima" />
                        <EscalaVisual
                          tela={tela}
                          valor={valAtual}
                          onChange={(v) => setTextos((prev) => ({ ...prev, [valKey]: v }))}
                        />
                        <InstrucaoEscala tela={tela} posicao="abaixo" />
                      </div>
                      {tela.legendaEscala && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                          {parseScaleLegendItems(tela.legendaEscala).map((item, li) => (
                            <span key={li} style={{ fontSize: `${tela.escalaTamanho || 11}px` }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-amber-500/30 text-amber-200 leading-tight">
                              {item.code && <strong className="text-amber-400 font-black">{item.code}:</strong>}
                              <span>{item.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tela.tipo === 'rating' && (
                    <div className="t-caixa p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((st) => {
                        const activeStars = parseInt(String(valAtual), 10) || 0;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setTextos((prev) => ({ ...prev, [valKey]: `${st} estrelas` }))}
                            className="p-1.5 transition active:scale-90"
                          >
                            <Star className={`w-9 h-9 ${st <= activeStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {tela.tipo === 'dropdown' && (
                    <select
                      value={valAtual}
                      onChange={(e) => setTextos((prev) => ({ ...prev, [valKey]: e.target.value }))}
                      style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                      className={`t-campo w-full bg-slate-950 border ${bordaCampo} focus:border-amber-400 rounded-2xl p-4 text-sm sm:text-base font-bold text-white focus:outline-none`}
                    >
                      <option value="">Toque para selecionar na lista...</option>
                      {opcoesAtivas.map((opt) => (
                        <option key={opt.id} value={opt.titulo}>{opt.titulo}</option>
                      ))}
                    </select>
                  )}

                  {tela.tipo === 'radio' && (
                    <div className="space-y-2.5">
                      {opcoesAtivas.map((opt) => {
                        const isSel = valAtual === opt.titulo;
                        const isGavetaAberta = Boolean(opt.temGaveta && isSel);
                        return (
                          <div key={opt.id} className="t-linha space-y-2">
                            <label
                              onClick={() => setTextos((prev) => ({ ...prev, [valKey]: opt.titulo }))}
                              style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                              className={`t-opcao flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                                isSel
                                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`extra_radio_${tela.id}`}
                                checked={isSel}
                                onChange={() => setTextos((prev) => ({ ...prev, [valKey]: opt.titulo }))}
                                className="w-5 h-5 accent-amber-400"
                              />
                              <div className="min-w-0 flex-1 text-left">
                                <span className="text-sm font-bold block">{opt.titulo}</span>
                                {opt.subtitulo && <span className="text-xs text-slate-400 block mt-0.5">{opt.subtitulo}</span>}
                              </div>
                            </label>
                            {isGavetaAberta && renderGavetaContent(opt, () => confirmarDentro(tela, opt.titulo), tela.id)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {tela.tipo === 'checkbox' && (
                    <div className="space-y-2.5">
                      {opcoesAtivas.map((opt) => {
                        const isChecked = selectedChecks.includes(opt.titulo);
                        return (
                          <div key={opt.id} className="t-linha space-y-2">
                            <label
                              style={{ borderRadius: cantosCard(questionsConfig, tela) }}
                              className={`t-opcao flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                                isChecked
                                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const next = isChecked
                                    ? selectedChecks.filter(x => x !== opt.titulo)
                                    : [...selectedChecks, opt.titulo];
                                  setTextos((prev) => ({ ...prev, [valKey]: next }));
                                }}
                                className="w-5 h-5 accent-amber-400 rounded"
                              />
                              <div className="min-w-0 flex-1 text-left">
                                <span className="text-sm font-bold block">{opt.titulo}</span>
                                {opt.subtitulo && <span className="text-xs text-slate-400 block mt-0.5">{opt.subtitulo}</span>}
                              </div>
                            </label>
                            {opt.temGaveta && isChecked && renderGavetaContent(opt, () => {
                              // Respeita "obrigatório" da tela também ao confirmar pela gaveta
                              if (tela.obrigatorio && !temValor(textosRef.current[valKey])) {
                                setCampoObrigatorioErro(tela.id);
                                return;
                              }
                              confirmarDentro(tela, null);
                            }, tela.id)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {tela.tipo === 'grade' && (
                    <div className="space-y-2">
                      {tela.legendaEscala && (
                        <LegendaGrade
                          tela={tela}
                          style={{ fontSize: `${tela.escalaTamanho || 9}px`, ...faixaEstilo(tela.legendaFundo || 'escuro', tela.legendaFaixa), ...fonteEBorda(tela, 'legenda', tela.legendaFundo !== 'transparente') }}
                          className={`t-legenda leading-snug ${tela.legendaBold ? 'font-bold' : ''} ${caixaAlta(tela.legendaCaixa)} ${getCorTextoLinhaClass(tela.legendaCor, 'text-slate-300')} ${getFaixaFundoClass(tela.legendaFundo || 'escuro', '-mx-4 px-4 sm:-mx-6 sm:px-6')}`}
                        />
                      )}

                      {opcoesAtivas.map((opt, oi) => {
                        const cols = tela.colunasGrade || ['1', '2', '3', '4', '5', 'NA'];
                        // Lê o valor salvo para este item a partir do mapa de respostas da grade
                        const itemKey = `${valKey}__item_${oi}`;
                        const currentItemVal = dissertativaTextos[itemKey] || '';

                        const handleSelectGradeCol = (colVal) => {
                          setTextos((prev) => {
                            const updated = { ...prev, [itemKey]: colVal };
                            const summaryParts = opcoesAtivas
                              .map((o, idx) => {
                                const v = idx === oi ? colVal : updated[`${valKey}__item_${idx}`];
                                return v ? `${o.titulo}: ${v}` : null;
                              })
                              .filter(Boolean);
                            updated[valKey] = summaryParts.join(' | ');
                            return updated;
                          });
                        };

                        return (
                          <div
                            key={opt.id || oi}
                            style={{ ...faixaEstilo(tela.itemFundo || 'escuro', tela.itemFaixa), ...fonteEBorda(tela, 'item', tela.itemFundo !== 'transparente') }}
                            id={`item_${valKey}_${oi}`}
                            className={`t-item ${avisoGrade?.id === tela.id && !currentItemVal ? 'item-falta' : ''} space-y-2 text-left border-y ${getFaixaFundoClass(tela.itemFundo || 'escuro', '-mx-4 px-4 sm:-mx-6 sm:px-6')} rounded-none`}
                          >
                            <span
                              style={{ fontSize: `${tela.itemTamanho || 13}px` }}
                              className={`${pesoFonte(tela.itemBold, true)} ${caixaAlta(tela.itemCaixa)} block leading-snug ${getCorTextoLinhaClass(tela.itemCor, 'text-white')}`}
                            >
                              {opt.titulo}
                            </span>
                            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.max(1, cols.length)}, minmax(0, 1fr))` }}>
                              {cols.map((col) => {
                                const isActive = currentItemVal === col;
                                return (
                                  <button
                                    key={col}
                                    type="button"
                                    onClick={() => comFeedback(`gr_${itemKey}_${col}`, () => handleSelectGradeCol(col), true)}
                                    style={estiloBotao((k) => tela[`grade${k}`] ?? questionsConfig?.[`grade${k}`], isActive)}
                                    className={`t-num ${isActive ? 't-num-on' : ''} py-2.5 rounded-xl text-xs sm:text-sm font-black border transition-colors ${clicado === `gr_${itemKey}_${col}` ? 'efeito-acender' : ''} ${
                                      isActive
                                        ? corGradeSelecionada(col, cols)
                                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                                    }`}
                                  >
                                    {(tela.gradeFormato ?? questionsConfig?.gradeFormato) === 'rostos' && humorColuna(col, cols) !== null ? (
                                      <span className="flex flex-col items-center gap-0.5">
                                        <Rosto p={humorColuna(col, cols)} tamanho={isActive ? 34 : 28} apagado={Boolean(currentItemVal) && !isActive} vivo={isActive} anel={isActive} />
                                        <span className="text-[10px] leading-none">{col}</span>
                                      </span>
                                    ) : col}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {erroCampo && (
                  <p id={`erro_${tela.id}`} role="alert" className="campo-erro-msg">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <span>{erroCampo}</span>
                  </p>
                )}
              </div>
            );
            };

            const valorFinal = (t) => {
              const v = dissertativaTextos[t.id] ?? '';
              const dsv = Math.round(((t.sliderMin ?? 0) + (t.sliderMax ?? 10)) / 2);
              // só os estilos que já mostram um valor (slide, número, carinhas, termômetro) gravam o valor do meio se não tocar
              return t.tipo === 'slider' && v === '' && ESCALA_COM_VALOR_INICIAL.includes(t.estiloEscala || 'slider') ? `${dsv}${t.sliderUnidade || ''}` : valorGravado(t, v);
            };

            // Grade obrigatória só está respondida com TODOS os itens marcados
            const itensFaltando = (t) => (t.tipo !== 'grade' ? [] : (t.opcoes || []).filter((o) => o.ativo !== false).map((_, i) => i).filter((i) => !temValor(dissertativaTextos[`${t.id}__item_${i}`])));
            const faltaResposta = (t) => Boolean(erroDeFormato(t, dissertativaTextos[t.id])) ||
              (t.obrigatorio && (t.tipo === 'grade' ? itensFaltando(t).length > 0 : !temValor(valorFinal(t))));
            const faltaObrigatoria = grupo.some(faltaResposta);

            return (
              <div
                className={`fade-in ${cabeTudo ? 'flex flex-col gap-2' : 'space-y-4 py-2'}`}
                style={cabeTudo ? { minHeight: 'calc(100dvh - 80px)' } : undefined}
              >
                {grupo.map((t, gi) => renderCampoTela(t, grupo.length > 1, gi === 0))}

                {avisoGrade && !avisoGrade.oculto && createPortal(
                  <div className="aviso-desce" role="alert" onClick={() => setAvisoGrade((a) => a && { ...a, oculto: true })}>
                    <AlertTriangle className="w-7 h-7" aria-hidden="true" />
                    <div>
                      <strong>Você deve marcar todas as opções</strong>
                      <span>{avisoGrade.faltam === 1 ? 'Falta 1 item, marcado em vermelho.' : `Faltam ${avisoGrade.faltam} itens, marcados em vermelho.`}</span>
                    </div>
                  </div>,
                  document.body
                )}

                {/* Espaço para o rodapé fixo não cobrir o conteúdo */}
                <div className={cabeTudo ? 'h-20 shrink-0' : 'h-28'} />
                <div className="t-rodape fixed bottom-0 inset-x-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
                <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between gap-2">
                <BotaoSeta
                  seta={configSeta(lerGeral(questionsConfig, tela, 'seta'))}
                  lado="anterior"
                  aceso={clicado === `voltar_${tela.id}`}
                  onClick={() => comFeedback(`voltar_${tela.id}`, voltarParaAnterior)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Valida TODAS as perguntas desta página, NA HORA do toque: só assim o celular aceita pôr o cursor no campo
                    const faltando = grupo.find(faltaResposta);
                    if (faltando) { try { navigator.vibrate?.(45); } catch (e) {} }
                    if (faltando?.tipo === 'grade') {
                      const itens = itensFaltando(faltando);
                      setCampoObrigatorioErro(null);
                      setAvisoGrade({ id: faltando.id, faltam: itens.length });
                      document.getElementById(`item_${faltando.id}_${itens[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      return;
                    }
                    if (faltando) {
                      setCampoObrigatorioErro(faltando.id);
                      const bloco = document.getElementById(`campo_${faltando.id}`);
                      bloco?.querySelector('input, textarea, select, button')?.focus({ preventScroll: true });
                      bloco?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      return;
                    }
                    comFeedback(`avancar_${tela.id}`, () => {
                      setTextos((prev) => {
                        const novo = { ...prev };
                        grupo.forEach((t) => { novo[t.id] = valorFinal(t); });
                        return novo;
                      });
                      avancarParaProxima(null);
                    });
                  }}
                  style={estiloBotao(lerGeral(questionsConfig, tela, 'avancar'), faltaObrigatoria)}
                  className={`t-avancar ${faltaObrigatoria ? 't-falta' : ''} w-3/4 py-4 px-4 rounded-2xl font-black text-base border flex items-center justify-center gap-2 transition-colors ${faltaObrigatoria ? 'bg-red-900 border-red-800 text-white' : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-950/60 border-amber-300'} ${clicado === `avancar_${tela.id}` ? 'efeito-acender' : ''}`}
                >
                  <span>{questionsConfig?.botaoAvancarTexto || 'Avançar'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                </div>
                </div>
                </div>
              </div>
            );
          }

          // Estilo próprio da tela (definido no editor) com fallback para o estilo geral
          const opcoesTela = (tela.opcoes || []).filter(o => o.ativo !== false);
          const iconesTela = iconesDaTela(opcoesTela);
          const porPagina = Math.max(1, Number(tela.cardsPorTela) || opcoesTela.length || 1);
          const totalPaginas = Math.max(1, Math.ceil(opcoesTela.length / porPagina));
          const paginaAtual = Math.min(extraSlideIndex, totalPaginas - 1);
          const opcoesPagina = opcoesTela.slice(paginaAtual * porPagina, (paginaAtual + 1) * porPagina);
          const mostrarIcones = tela.mostrarIcones !== undefined ? tela.mostrarIcones !== false : questionsConfig?.mostrarIconesCards !== false;
          const estiloFundo = tela.cardFundoEstilo || questionsConfig?.cardFundoEstilo;
          const estiloEfeito = tela.cardEfeitoEstilo || questionsConfig?.cardEfeitoEstilo;
          const estiloProf = tela.cardProfundidade || questionsConfig?.cardProfundidade;
          const fonteTitulo = tela.cardFonteTitulo || questionsConfig.cardFonteTitulo || 16;
          const fonteSub = tela.cardFonteSubtitulo || questionsConfig.cardFonteSubtitulo || 12;

          return (
            <div className="space-y-3.5 fade-in">
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-bold text-amber-300">Opções (Página {paginaAtual + 1} de {totalPaginas})</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPaginas }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setExtraSlideIndex(i)} className={`h-2 rounded-full transition-all ${paginaAtual === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col" style={{ gap: Number(tela.cardEspaco ?? questionsConfig?.cardEspaco ?? CARD_ESPACO_PADRAO) }}>
                {opcoesPagina.map((opt) => {
                  const IconComp = componenteIcone(iconesTela[opt.id]);
                  const corCls = COR_CLASSES[opt.cor] || COR_CLASSES.emerald;
                  const cardFundoCls = CARD_FUNDO_CLASSES[estiloFundo] || CARD_FUNDO_CLASSES.escuro;
                  const cardFonteTituloCls = CARD_FONTE_TITULO_CLASSES[tela.cardCorFonteTitulo || questionsConfig?.cardCorFonteTitulo] || 'text-white';
                  const cardFonteSubtituloCls = CARD_FONTE_SUBTITULO_CLASSES[tela.cardCorFonteSubtitulo || questionsConfig?.cardCorFonteSubtitulo] || 'text-slate-400';
                  const cardEfeitoInline = getEfeitoStyle(estiloEfeito, estiloProf);
                  const medidas = medidasCard(tela.cardAltura || questionsConfig?.cardAltura, cantosCard(questionsConfig, tela));

                  const isGavetaAberta = isGavetaAbertaDe(tela.id, opt);

                  return (
                    <div key={opt.id} className="t-linha space-y-2">
                      <button
                        type="button"
                        onClick={() => comFeedback(`ex_${tela.id}_${opt.id}`, () => handleSelectOpcaoExtra(idx, opt), opt.temGaveta)}
                        style={{ ...medidas.caixa, ...cardEfeitoInline, ...fonteEBorda({ cardFamilia: tela.cardFamilia ?? questionsConfig?.cardFamilia, cardItalico: tela.cardItalico ?? questionsConfig?.cardItalico, cardBorda: tela.cardBorda ?? questionsConfig?.cardBorda, cardBordaLargura: tela.cardBordaLargura ?? questionsConfig?.cardBordaLargura, cardBordaLado: tela.cardBordaLado ?? questionsConfig?.cardBordaLado }, 'card', true, false) }}
                        className={`t-card w-full text-left px-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-between group border border-white/15 ${cardFundoCls} ${
                          isGavetaAberta ? 'border-amber-400/80 ring-1 ring-amber-400/40' : ''
                        } ${efeitoClique(`ex_${tela.id}_${opt.id}`)
                        }`}
                      >
                        <div className="flex items-center gap-4 pr-2 min-w-0">
                          {mostrarIcones && (
                            <div style={medidas.icone} className={`t-icone rounded-xl flex items-center justify-center shrink-0 border ${corCls}`}>
                              <IconComp className="w-1/2 h-1/2" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 
                              style={{ fontSize: `${fonteTitulo}px` }}
                              className={`font-bold transition leading-snug line-clamp-2 ${cardFonteTituloCls}`}
                            >
                              {opt.titulo}
                            </h3>
                            {opt.subtitulo && (
                              <p 
                                style={{ fontSize: `${fonteSub}px` }}
                                className={`t-desc mt-0.5 line-clamp-2 leading-snug ${cardFonteSubtituloCls}`}
                              >
                                {opt.subtitulo}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="t-ir w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-300 transition">
                          {opt.temGaveta ? (
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGavetaAberta ? 'rotate-180 text-amber-400' : ''}`} />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* GAVETA ACCORDION MULTI-COMPONENTE EM TELA EXTRA */}
                      {opt.temGaveta && isGavetaAberta && renderGavetaContent(opt, () => handleConfirmarGavetaExtra(idx, opt), tela.id)}
                    </div>
                  );
                })}
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => setExtraSlideIndex(Math.max(0, paginaAtual - 1))} disabled={paginaAtual === 0} className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 disabled:opacity-30 flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" /><span>Anterior</span>
                  </button>
                  <button type="button" onClick={() => setExtraSlideIndex(Math.min(totalPaginas - 1, paginaAtual + 1))} disabled={paginaAtual >= totalPaginas - 1} className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 disabled:opacity-30 flex items-center gap-1.5">
                    <span>Ver mais opções</span><ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <RodapeSetas
                seta={configSeta(lerGeral(questionsConfig, tela, 'seta'))}
                aceso={clicado === `voltar_${tela.id}` ? 'anterior' : clicado === `proxima_${tela.id}` ? 'proxima' : ''}
                onAnterior={() => comFeedback(`voltar_${tela.id}`, voltarParaAnterior)}
                onProxima={!tela.obrigatorio || temValor(respostasExtras[tela.id]) ? () => comFeedback(`proxima_${tela.id}`, () => {
                  if (paginaAtual < totalPaginas - 1) setExtraSlideIndex(paginaAtual + 1);
                  else avancarParaProxima(null);
                }) : null}
              />
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
              onClick={() => comFeedback('qtd_1', () => handleSelectQtd(1))}
              className={`${efeitoClique('qtd_1')} t-avancar t-soeu w-full p-5 sm:p-6 min-h-[96px] rounded-3xl border border-emerald-500/30 border-b-[6px] border-b-emerald-950 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 active:translate-y-1.5 active:border-b-2 active:shadow-md transition-all flex items-center justify-between shadow-xl shadow-emerald-950/60`}
            >
              <div className="flex items-center gap-4">
                <div className="t-selo w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-emerald-200 p-2.5 shadow-inner">
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
              <div className="t-selo w-12 h-12 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 font-black text-2xl shadow-inner">
                1
              </div>
            </button>

            {/* Divisor */}
            <div className="relative flex py-6 my-2 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="t-cor flex-shrink mx-3 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider text-center">
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
                const descCorCls = BTN_DESC_CLASSES[questionsConfig?.btnQtdCorDescricao] || 'text-white/80';
                const btnAltura = questionsConfig?.btnQtdAltura || 74;
                const btnLargura = questionsConfig?.btnQtdLargura ? `${questionsConfig.btnQtdLargura}%` : '100%';
                const bordaEspessura = questionsConfig?.btnQtdBordaEspessura ? `${questionsConfig.btnQtdBordaEspessura}px` : '1px';
                const numFonte = questionsConfig?.btnQtdFonteNumero || 34;
                const descFonte = questionsConfig?.btnQtdFonteDescricao || 11;
                const btnEfeitoInline = getEfeitoStyle(questionsConfig?.btnQtdEfeito || 'efeito_3d', questionsConfig?.btnQtdProfundidade || 5);

                return (
                  <button
                    key={op.valor}
                    onClick={() => comFeedback(`qtd_${op.valor}`, () => (op.valor === 10 ? setQtdGrande(10) : handleSelectQtd(op.valor)))}
                    style={{ 
                      minHeight: `${btnAltura}px`, 
                      width: btnLargura,
                      borderWidth: bordaEspessura,
                      margin: '0 auto',
                      ...btnEfeitoInline 
                    }}
                    className={`px-2 py-2 rounded-2xl active:scale-[0.98] transition-all flex flex-col items-center justify-center group ${btnCorCls} ${efeitoClique(`qtd_${op.valor}`)}`}
                  >
                    <span 
                      style={{ fontSize: `${numFonte}px` }}
                      className={`font-black tracking-tight drop-shadow-md leading-none transition-colors ${numCorCls}`}
                    >
                      {op.label}
                    </span>
                    <span 
                      style={{ fontSize: `${descFonte}px` }}
                      className={`font-bold transition-colors mt-1 ${descCorCls}`}
                    >
                      {op.valor === 10 ? 'Pessoas +' : 'Pessoas'}
                    </span>
                  </button>
                );
              })}
            </div>

            {qtdGrande !== null && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setQtdGrande(null)}>
                <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 text-center" onClick={(e) => e.stopPropagation()}>
                  <p className="font-black text-white text-lg">Quantas pessoas?</p>
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => setQtdGrande((n) => Math.max(10, n - 1))} className="w-14 h-14 rounded-2xl bg-slate-800 text-white text-3xl font-black active:scale-95">−</button>
                    <span className="w-20 text-5xl font-black text-amber-400 tabular-nums">{qtdGrande}</span>
                    <button type="button" onClick={() => setQtdGrande((n) => Math.min(100, n + 1))} className="w-14 h-14 rounded-2xl bg-slate-800 text-white text-3xl font-black active:scale-95">+</button>
                  </div>
                  <button type="button" onClick={() => { const n = qtdGrande; setQtdGrande(null); handleSelectQtd(n); }} className="w-full py-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider">Confirmar</button>
                  <button type="button" onClick={() => setQtdGrande(null)} className="text-xs text-slate-400">Cancelar</button>
                </div>
              </div>
            )}

            {/* Botão Voltar */}
            <RodapeSetas
              seta={configSeta(lerGeral(questionsConfig, null, 'seta'))}
              aceso={clicado === 'voltar_acomp' ? 'anterior' : ''}
              onAnterior={() => comFeedback('voltar_acomp', () => {
                let alvo = telasExtrasAtivas.length - 1;
                while (alvo > 0 && continuaNaMesmaPagina(telasExtrasAtivas[alvo - 1], telasExtrasAtivas[alvo])) alvo--;
                if (alvo < 0 && p1Oculta) setJaClicouComecar(false);
                setCurrentStep(alvo >= 0 ? `extra_${alvo}` : 'p1');
              })}
            />
          </div>
        )}
      </main>

      {/* Rodapé invisível */}
      <footer className="w-full text-center py-2" />
    </div>
  );
}
