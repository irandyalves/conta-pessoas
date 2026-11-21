import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  ListOrdered, 
  Users, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Tag, 
  Church, 
  HeartHandshake, 
  Share2, 
  Compass, 
  Star, 
  Smile, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  TreePine,
  Wifi,
  Battery,
  User,
  Info,
  SlidersHorizontal,
  Type,
  Hourglass,
  CheckCircle2,
  Smartphone,
  Layers,
  ArrowRight,
  Palette
} from 'lucide-react';
import { 
  getSavedQuestionsConfig, 
  saveQuestionsConfig, 
  getSavedEventTitle,
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';

// Lista de ícones amigáveis
const ICONES = [
  { id: 'Tag', label: 'Faixa', icon: Tag },
  { id: 'Church', label: 'Igreja', icon: Church },
  { id: 'HeartHandshake', label: 'Convite', icon: HeartHandshake },
  { id: 'Share2', label: 'Internet', icon: Share2 },
  { id: 'Compass', label: 'Visita', icon: Compass },
  { id: 'Sparkles', label: 'Especial', icon: Sparkles },
  { id: 'Star', label: 'Estrela', icon: Star },
  { id: 'Smile', label: 'Amigo', icon: Smile },
  { id: 'MapPin', label: 'Bairro', icon: MapPin },
];

const CORES = [
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-400', badge: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { id: 'sky', label: 'Azul', bg: 'bg-sky-400', badge: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-400', badge: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-400', badge: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-400', badge: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
];

// OPÇÕES DE FUNDO DOS CARDS (16 CORES / DEGRADÊS)
export const FUNDOS_CARDS = [
  // 6 Originais
  { id: 'escuro', label: 'Slate Escuro', classe: 'bg-slate-900 border-slate-750' },
  { id: 'gradiente', label: 'Gradiente Noturno', classe: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-850 border-slate-750' },
  { id: 'vidro', label: 'Efeito Vidro', classe: 'bg-slate-900/50 backdrop-blur-md border-white/20' },
  { id: 'azul_profundo', label: 'Azul Meia-Noite', classe: 'bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border-sky-900/60' },
  { id: 'esmeralda_suave', label: 'Toque Esmeralda', classe: 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-emerald-900/60' },
  { id: 'dourado_suave', label: 'Toque Dourado', classe: 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 border-amber-900/60' },
  // 10 Novas Cores / Degradês
  { id: 'preto_onix', label: 'Preto Ônix', classe: 'bg-neutral-950 border-neutral-800' },
  { id: 'safira_real', label: 'Safira Real', classe: 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-950 border-blue-800/60' },
  { id: 'verde_floresta', label: 'Verde Floresta', classe: 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-emerald-800/60' },
  { id: 'ouro_nobre', label: 'Ouro Nobre', classe: 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 border-amber-800/60' },
  { id: 'roxo_imperial', label: 'Roxo Imperial', classe: 'bg-gradient-to-r from-slate-950 via-purple-950 to-purple-900 border-purple-800/60' },
  { id: 'violeta_cosmico', label: 'Violeta Cósmico', classe: 'bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 border-violet-800/60' },
  { id: 'rubi_vinho', label: 'Rubi Vinho', classe: 'bg-gradient-to-r from-slate-950 via-rose-950 to-red-950 border-rose-800/60' },
  { id: 'carmim_noturno', label: 'Carmim Noturno', classe: 'bg-gradient-to-r from-red-950 via-rose-900 to-neutral-950 border-red-800/60' },
  { id: 'turquesa_ciano', label: 'Turquesa Ciano', classe: 'bg-gradient-to-r from-slate-950 via-teal-950 to-cyan-950 border-teal-800/60' },
  { id: 'sunset_laranja', label: 'Sunset Laranja', classe: 'bg-gradient-to-r from-slate-950 via-orange-950 to-amber-950 border-orange-800/60' },
];

// OPÇÕES DE EFEITOS E ACABAMENTOS DOS CARDS (3D, VIDRO, ENTALHE, ETC.)
export const EFEITOS_CARDS = [
  { id: 'padrao', label: 'Normal / Flat', desc: 'Borda sutil elegante', classe: 'border border-slate-700/80 shadow-md' },
  { id: 'efeito_3d', label: 'Efeito 3D', desc: 'Relevo tátil com base', classe: 'border border-slate-700/80 border-b-[4px] border-b-black/90 shadow-xl' },
  { id: 'vidro', label: 'Efeito Vidro', desc: 'Translúcido com blur', classe: 'backdrop-blur-md bg-opacity-70 border border-white/25 shadow-lg' },
  { id: 'entalhe', label: 'Entalhe', desc: 'Profundidade chanfrada', classe: 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),0_1px_2px_rgba(255,255,255,0.06)] border border-slate-800' },
  { id: 'glow', label: 'Glow Neon', desc: 'Iluminação de contorno', classe: 'border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]' },
];

// OPÇÕES DE CORES DA FONTE DO TÍTULO DOS CARDS (EM BOLINHAS)
export const CORES_FONTE_TITULO = [
  { id: 'branco', label: 'Branco', classe: 'text-white', dot: 'bg-white' },
  { id: 'dourado', label: 'Dourado', classe: 'text-amber-300', dot: 'bg-amber-300' },
  { id: 'amarelo', label: 'Amarelo', classe: 'text-yellow-300', dot: 'bg-yellow-300' },
  { id: 'esmeralda', label: 'Esmeralda', classe: 'text-emerald-300', dot: 'bg-emerald-300' },
  { id: 'azul', label: 'Azul Céu', classe: 'text-sky-300', dot: 'bg-sky-300' },
  { id: 'ciano', label: 'Ciano', classe: 'text-cyan-300', dot: 'bg-cyan-300' },
  { id: 'laranja', label: 'Laranja', classe: 'text-orange-400', dot: 'bg-orange-400' },
  { id: 'rosa', label: 'Rosa Pink', classe: 'text-pink-300', dot: 'bg-pink-400' },
  { id: 'roxo', label: 'Roxo Claro', classe: 'text-purple-300', dot: 'bg-purple-400' },
  { id: 'prata', label: 'Prata', classe: 'text-slate-200', dot: 'bg-slate-300' },
];

// OPÇÕES DE CORES DA FONTE DO SUBTÍTULO DOS CARDS (EM BOLINHAS)
export const CORES_FONTE_SUBTITULO = [
  { id: 'cinza', label: 'Cinza Médio', classe: 'text-slate-400', dot: 'bg-slate-400' },
  { id: 'cinza_claro', label: 'Cinza Claro', classe: 'text-slate-300', dot: 'bg-slate-300' },
  { id: 'branco_suave', label: 'Branco Suave', classe: 'text-white/80', dot: 'bg-slate-100' },
  { id: 'dourado_suave', label: 'Dourado Suave', classe: 'text-amber-200/90', dot: 'bg-amber-200' },
  { id: 'amarelo_suave', label: 'Amarelo Suave', classe: 'text-yellow-200/80', dot: 'bg-yellow-200' },
  { id: 'esmeralda_suave', label: 'Verde Suave', classe: 'text-emerald-200/80', dot: 'bg-emerald-300' },
  { id: 'azul_suave', label: 'Azul Suave', classe: 'text-sky-200/80', dot: 'bg-sky-300' },
  { id: 'rosa_suave', label: 'Rosa Suave', classe: 'text-pink-200/80', dot: 'bg-pink-300' },
];

// 10 OPÇÕES DE CORES EM BOLINHAS PARA OS BOTÕES NUMÉRICOS (TELA 2)
export const CORES_BOTAO_QTD = [
  { id: 'slate', label: 'Grafite', hex: '#475569', dot: 'bg-slate-600', classe: 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-slate-700/80 border-b-slate-950 text-slate-100', simClass: 'bg-slate-800 border-slate-700 border-b-slate-950' },
  { id: 'esmeralda', label: 'Esmeralda', hex: '#10b981', dot: 'bg-emerald-500', classe: 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 border-emerald-500/60 border-b-emerald-950 text-white', simClass: 'bg-emerald-700 border-emerald-600 border-b-emerald-950' },
  { id: 'azul', label: 'Azul Real', hex: '#3b82f6', dot: 'bg-blue-600', classe: 'bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 border-blue-500/60 border-b-blue-950 text-white', simClass: 'bg-blue-700 border-blue-600 border-b-blue-950' },
  { id: 'dourado', label: 'Dourado', hex: '#f59e0b', dot: 'bg-amber-500', classe: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 border-amber-500/60 border-b-amber-950 text-white', simClass: 'bg-amber-700 border-amber-600 border-b-amber-950' },
  { id: 'roxo', label: 'Roxo', hex: '#8b5cf6', dot: 'bg-purple-600', classe: 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 border-purple-500/60 border-b-purple-950 text-white', simClass: 'bg-purple-700 border-purple-600 border-b-purple-950' },
  { id: 'vermelho', label: 'Rubi', hex: '#ef4444', dot: 'bg-red-600', classe: 'bg-gradient-to-b from-red-600 via-red-700 to-red-800 border-red-500/60 border-b-red-950 text-white', simClass: 'bg-red-700 border-red-600 border-b-red-950' },
  { id: 'ciano', label: 'Turquesa', hex: '#14b8a6', dot: 'bg-teal-500', classe: 'bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800 border-teal-500/60 border-b-teal-950 text-white', simClass: 'bg-teal-700 border-teal-600 border-b-teal-950' },
  { id: 'laranja', label: 'Laranja', hex: '#f97316', dot: 'bg-orange-500', classe: 'bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 border-orange-500/60 border-b-orange-950 text-white', simClass: 'bg-orange-700 border-orange-600 border-b-orange-950' },
  { id: 'rosa', label: 'Pink', hex: '#ec4899', dot: 'bg-pink-600', classe: 'bg-gradient-to-b from-pink-600 via-pink-700 to-pink-800 border-pink-500/60 border-b-pink-950 text-white', simClass: 'bg-pink-700 border-pink-600 border-b-pink-950' },
  { id: 'indigo', label: 'Índigo', hex: '#6366f1', dot: 'bg-indigo-600', classe: 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 border-indigo-500/60 border-b-indigo-950 text-white', simClass: 'bg-indigo-700 border-indigo-600 border-b-indigo-950' },
];

// OPÇÕES DE CORES DA FONTE DO NÚMERO (TELA 2)
export const CORES_NUMERO_QTD = [
  { id: 'branco', label: 'Branco Puro', hex: '#ffffff', dot: 'bg-white', classe: 'text-white' },
  { id: 'dourado', label: 'Dourado', hex: '#fcd34d', dot: 'bg-amber-300', classe: 'text-amber-300' },
  { id: 'amarelo', label: 'Amarelo', hex: '#fde047', dot: 'bg-yellow-300', classe: 'text-yellow-300' },
  { id: 'esmeralda', label: 'Esmeralda', hex: '#6ee7b7', dot: 'bg-emerald-300', classe: 'text-emerald-300' },
  { id: 'azul', label: 'Azul Céu', hex: '#7dd3fc', dot: 'bg-sky-300', classe: 'text-sky-300' },
  { id: 'laranja', label: 'Laranja', hex: '#fb923c', dot: 'bg-orange-400', classe: 'text-orange-300' },
  { id: 'rosa', label: 'Rosa Claro', hex: '#f472b6', dot: 'bg-pink-400', classe: 'text-pink-300' },
  { id: 'preto', label: 'Preto', hex: '#0f172a', dot: 'bg-slate-900 border border-slate-600', classe: 'text-slate-950' },
];

// 6 PRESETS DE MODELOS DE CELULARES PARA VISUALIZAÇÃO
const MODELOS_CELULARES = [
  {
    id: 'iphone16pro',
    nome: 'iPhone 16 Pro',
    marca: 'Apple',
    moldura: 'rounded-[46px] border-[6px] border-slate-700/90 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-[310px] sm:w-[325px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'dynamic-island'
  },
  {
    id: 's24ultra',
    nome: 'Samsung S24 Ultra',
    marca: 'Samsung',
    moldura: 'rounded-[14px] border-[5px] border-slate-700/80 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-[320px] sm:w-[335px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'xiaomi14pro',
    nome: 'Xiaomi 14 Pro',
    marca: 'Xiaomi',
    moldura: 'rounded-[36px] border-[5px] border-slate-600/80 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-[315px] sm:w-[330px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'pixel9pro',
    nome: 'Pixel 9 Pro',
    marca: 'Google',
    moldura: 'rounded-[44px] border-[5px] border-slate-700/90 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-[310px] sm:w-[325px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'iphone_notch',
    nome: 'iPhone Notch',
    marca: 'Apple',
    moldura: 'rounded-[40px] border-[6px] border-slate-800 shadow-2xl ring-1 ring-slate-750',
    largura: 'w-[310px] sm:w-[325px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'notch'
  },
  {
    id: 'moto_edge',
    nome: 'Motorola Edge',
    marca: 'Motorola',
    moldura: 'rounded-[28px] border-[4px] border-slate-600/70 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-[305px] sm:w-[320px]',
    alturaTela: 'h-[460px]',
    tipoTopo: 'punch-hole-center'
  }
];

export default function QuestionsConfigModal({ isOpen, onClose }) {
  // Abas: 'inicio' | 'tela_1' | 'extra_0', 'extra_1'... | 'acompanhantes' | 'fim'
  const [activeTab, setActiveTab] = useState('inicio');
  const [config, setConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Preset de Celular Ativo
  const [modeloCelularId, setModeloCelularId] = useState('iphone16pro');

  // Estado do Preview do Celular: 'inicio' | 'tela_1' | 'extra_0', 'extra_1'... | 'acompanhantes' | 'fim'
  const [previewScreen, setPreviewScreen] = useState('inicio');
  const [previewPage, setPreviewPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedQuestionsConfig());
      setEventoTitulo(getSavedEventTitle() || 'CANTATA DE NATAL 2026');
      setSalvo(false);
      setActiveTab('inicio');
      setPreviewScreen('inicio');
      setPreviewPage(0);
    }
  }, [isOpen]);

  // Alinha a tela do preview sempre que a aba ativa mudar
  useEffect(() => {
    setPreviewScreen(activeTab);
    setPreviewPage(0);
  }, [activeTab]);

  if (!isOpen) return null;

  const modeloAtual = MODELOS_CELULARES.find(m => m.id === modeloCelularId) || MODELOS_CELULARES[0];

  // Cálculos dinâmicos da Tela 1
  const cardsAtivosP1 = (config.opcoesChegada || []).filter(c => c.ativo !== false);
  const cardsPorTelaP1 = Number(config.cardsPorTela) || 4;
  const totalPaginasPreviewP1 = Math.max(1, Math.ceil(cardsAtivosP1.length / cardsPorTelaP1));
  const safePreviewPageP1 = Math.min(previewPage, totalPaginasPreviewP1 - 1);
  const cardsNaPaginaAtualP1 = cardsAtivosP1.slice(
    safePreviewPageP1 * cardsPorTelaP1,
    (safePreviewPageP1 + 1) * cardsPorTelaP1
  );

  // Modificar campo de uma opção da Tela 1
  const handleUpdateOpcaoP1 = (index, field, value) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { ...novasOpcoes[index], [field]: value };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  // Alternar ativo/inativo na Tela 1
  const handleToggleAtivoP1 = (index) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { 
        ...novasOpcoes[index], 
        ativo: novasOpcoes[index].ativo === false ? true : false 
      };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  // Adicionar novo card na Tela 1
  const handleAdicionarCardP1 = () => {
    const novoIndex = (config.opcoesChegada || []).length + 1;
    const novoCard = {
      id: `card_${Date.now()}`,
      titulo: `Nova Opção ${novoIndex}`,
      subtitulo: 'Descreva este motivo',
      ativo: true,
      icone: 'Tag',
      cor: 'amber'
    };
    setConfig((prev) => ({
      ...prev,
      opcoesChegada: [...(prev.opcoesChegada || []), novoCard]
    }));
  };

  // Excluir card da Tela 1
  const handleExcluirCardP1 = (index) => {
    if (config.opcoesChegada.length <= 1) {
      alert('Você precisa manter pelo menos 1 opção na Tela 1!');
      return;
    }
    const cardAlvo = config.opcoesChegada[index];
    if (confirm(`Excluir "${cardAlvo.titulo || 'esta opção'}" da Tela 1?`)) {
      setConfig((prev) => {
        const novas = prev.opcoesChegada.filter((_, idx) => idx !== index);
        return { ...prev, opcoesChegada: novas };
      });
    }
  };

  // ============================================================
  // GESTÃO DE TELAS EXTRAS (TELA 3, TELA 4, ETC. COM CARDS PRÉ-PRONTOS)
  // ============================================================
  const handleAdicionarTela = () => {
    const totalExtras = (config.telasExtras || []).length;
    const novoNumeroTela = totalExtras + 3; // Tela 1 e Tela 2 (Acompanhantes) já existem
    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      titulo: 'É a sua primeira vez conosco?',
      titulo1: 'É a sua primeira vez',
      titulo2: 'conosco?',
      subtitulo: 'Queremos te dar as boas-vindas com muito carinho',
      cardsPorTela: 4,
      opcoes: [
        {
          id: `opt_${Date.now()}_1`,
          titulo: 'Sim, pela primeira vez',
          subtitulo: 'Vim conhecer e prestigiar a programação',
          ativo: true,
          icone: 'Sparkles',
          cor: 'emerald'
        },
        {
          id: `opt_${Date.now()}_2`,
          titulo: 'Já visitei em outras ocasiões',
          subtitulo: 'Venho aos cultos e ocasiões especiais',
          ativo: true,
          icone: 'Star',
          cor: 'amber'
        },
        {
          id: `opt_${Date.now()}_3`,
          titulo: 'Frequento com regularidade',
          subtitulo: 'Já congrego ou acompanho os cultos',
          ativo: true,
          icone: 'Church',
          cor: 'sky'
        },
        {
          id: `opt_${Date.now()}_4`,
          titulo: 'Vim com família ou amigos',
          subtitulo: 'Convite especial de alguém querido',
          ativo: true,
          icone: 'HeartHandshake',
          cor: 'rose'
        }
      ]
    };
    setConfig((prev) => ({
      ...prev,
      telasExtras: [...(prev.telasExtras || []), novaTela]
    }));
    setActiveTab(`extra_${totalExtras}`);
  };

  const handleExcluirTela = (extraIndex) => {
    const numTela = extraIndex + 3;
    if (confirm(`Tem certeza que deseja excluir a Tela ${numTela}?`)) {
      setConfig((prev) => {
        const novas = (prev.telasExtras || []).filter((_, i) => i !== extraIndex);
        return { ...prev, telasExtras: novas };
      });
      setActiveTab('inicio');
    }
  };

  const handleUpdateTelaProp = (extraIndex, field, value) => {
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      novasTelas[extraIndex] = { ...novasTelas[extraIndex], [field]: value };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  const handleAddCardExtra = (extraIndex) => {
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      const telaAlvo = novasTelas[extraIndex];
      const novoCard = {
        id: `opt_${Date.now()}`,
        titulo: `Nova Opção ${(telaAlvo.opcoes || []).length + 1}`,
        subtitulo: '',
        ativo: true,
        icone: 'Sparkles',
        cor: 'emerald'
      };
      novasTelas[extraIndex] = {
        ...telaAlvo,
        opcoes: [...(telaAlvo.opcoes || []), novoCard]
      };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  const handleUpdateCardExtra = (extraIndex, cardIndex, field, value) => {
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      const telaAlvo = novasTelas[extraIndex];
      const novasOpcoes = [...(telaAlvo.opcoes || [])];
      novasOpcoes[cardIndex] = { ...novasOpcoes[cardIndex], [field]: value };
      novasTelas[extraIndex] = { ...telaAlvo, opcoes: novasOpcoes };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  const handleToggleCardExtra = (extraIndex, cardIndex) => {
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      const telaAlvo = novasTelas[extraIndex];
      const novasOpcoes = [...(telaAlvo.opcoes || [])];
      novasOpcoes[cardIndex] = { 
        ...novasOpcoes[cardIndex], 
        ativo: novasOpcoes[cardIndex].ativo === false ? true : false 
      };
      novasTelas[extraIndex] = { ...telaAlvo, opcoes: novasOpcoes };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  const handleExcluirCardExtra = (extraIndex, cardIndex) => {
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      const telaAlvo = novasTelas[extraIndex];
      if ((telaAlvo.opcoes || []).length <= 1) {
        alert('Mantenha pelo menos 1 opção nesta tela!');
        return prev;
      }
      novasTelas[extraIndex] = {
        ...telaAlvo,
        opcoes: telaAlvo.opcoes.filter((_, i) => i !== cardIndex)
      };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  // Salvar no Firebase
  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await saveQuestionsConfig(config);
      setSalvo(true);
      setTimeout(() => {
        setSalvo(false);
        onClose();
      }, 1000);
    } catch (e) {
      alert('Erro ao salvar no Firebase: ' + (e?.message || e));
    } finally {
      setSalvando(false);
    }
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja restaurar todas as configurações de telas para o padrão original?')) {
      setConfig({ ...DEFAULT_QUESTIONS_CONFIG });
      setActiveTab('inicio');
      setPreviewScreen('inicio');
      setPreviewPage(0);
    }
  };

  const getIconComponent = (iconeId) => {
    const item = ICONES.find(i => i.id === iconeId);
    return item ? item.icon : Tag;
  };

  const getCorBadge = (corId) => {
    const item = CORES.find(c => c.id === corId);
    return item ? item.badge : 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  };

  const getCardFundoClass = (fundoId) => {
    const item = FUNDOS_CARDS.find(f => f.id === (fundoId || config.cardFundoEstilo || 'escuro'));
    return item ? item.classe : FUNDOS_CARDS[0].classe;
  };

  const getCardEfeitoClass = (efeitoId) => {
    const item = EFEITOS_CARDS.find(e => e.id === (efeitoId || config.cardEfeitoEstilo || 'padrao'));
    return item ? item.classe : EFEITOS_CARDS[0].classe;
  };

  const getCardFonteTituloClass = (corId) => {
    const item = CORES_FONTE_TITULO.find(c => c.id === (corId || config.cardCorFonteTitulo || 'branco'));
    return item ? item.classe : 'text-white';
  };

  const getCardFonteSubtituloClass = (corId) => {
    const item = CORES_FONTE_SUBTITULO.find(c => c.id === (corId || config.cardCorFonteSubtitulo || 'cinza'));
    return item ? item.classe : 'text-slate-400';
  };

  const getBtnQtdSimClass = (corId) => {
    const item = CORES_BOTAO_QTD.find(c => c.id === (corId || config.btnQtdCor || 'slate'));
    return item ? item.simClass : CORES_BOTAO_QTD[0].simClass;
  };

  const getBtnNumClass = (numCorId) => {
    const item = CORES_NUMERO_QTD.find(c => c.id === (numCorId || config.btnQtdCorNumero || 'branco'));
    return item ? item.classe : 'text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-[96vw] max-w-6xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden shrink-0">
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL (FIXO NO TOPO)                            */}
        {/* ============================================================ */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Configurar Abas & Telas do Celular</h2>
              <p className="text-xs text-slate-400">Monte o fluxo de telas (Tela 1, Tela 2, Tela 3...), adicione mais abas e visualize à direita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* CORPO EM 2 COLUNAS: ESQUERDA (CONFIG) + DIREITA (CELULAR)    */}
        {/* ============================================================ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* ========================================================== */}
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES ORGANIZADAS POR ABAS        */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900/50">
            
            {/* BARRA DE ABAS: TELA INÍCIO, TELA 1, TELA 2 (ACOMP.), TELAS EXTRAS, TELA FIM + BOTÃO INSERIR NO FIM */}
            <div className="flex border-b border-slate-800 bg-slate-950/70 px-3 pt-2.5 shrink-0 gap-1.5 overflow-x-auto items-center custom-scrollbar">
              
              {/* Tela Início */}
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'inicio'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hourglass className="w-4 h-4" />
                <span>Tela Início</span>
              </button>

              {/* Tela 1 */}
              <button
                type="button"
                onClick={() => setActiveTab('tela_1')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tela_1'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Tela 1</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                  {cardsAtivosP1.length}
                </span>
              </button>

              {/* Tela 2 (Acompanhantes) */}
              <button
                type="button"
                onClick={() => setActiveTab('acompanhantes')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'acompanhantes'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tela 2</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                  Acomp.
                </span>
              </button>

              {/* Telas Extras Criadas Dinamicamente (Tela 3, Tela 4, etc.) */}
              {(config.telasExtras || []).map((tela, idx) => {
                const tabKey = `extra_${idx}`;
                const numTela = idx + 3;
                const cardsAtivos = (tela.opcoes || []).filter(o => o.ativo !== false).length;
                return (
                  <button
                    key={tela.id || idx}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === tabKey
                        ? 'border-amber-400 text-amber-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Tela {numTela}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                      {cardsAtivos}
                    </span>
                  </button>
                );
              })}

              {/* Tela Fim */}
              <button
                type="button"
                onClick={() => setActiveTab('fim')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fim'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tela Fim</span>
              </button>

              {/* Botão + Inserir Tela NO FIM DE TUDO (com cards pré-prontos) */}
              <button
                type="button"
                onClick={handleAdicionarTela}
                className="mb-2 px-3 py-1.5 text-xs font-black text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ml-auto sm:ml-2 shadow-sm"
                title="Inserir mais uma tela com cards pré-prontos no fluxo de perguntas"
              >
                <Plus className="w-4 h-4" />
                <span>+ Inserir Tela</span>
              </button>

            </div>

            {/* CONTEÚDO ROLÁVEL DA ESQUERDA */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-left custom-scrollbar">
              
              {/* ====================================================== */}
              {/* ABA: TELA INÍCIO (ESPERA / START DO ADMIN)             */}
              {/* ====================================================== */}
              {activeTab === 'inicio' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div>
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wide block">
                        Textos das 3 Linhas de Espera
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Exibido no celular enquanto a pesquisa não for iniciada ou estiver pausada pelo admin.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">1ª Linha (Texto Branco)</label>
                        <input
                          type="text"
                          value={config.esperaLinha1 ?? 'DENTRO DE INSTANTES'}
                          onChange={(e) => setConfig({ ...config, esperaLinha1: e.target.value })}
                          placeholder="DENTRO DE INSTANTES"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">2ª Linha (Texto Dourado)</label>
                        <input
                          type="text"
                          value={config.esperaLinha2 ?? 'ESTARÁ LIBERADO'}
                          onChange={(e) => setConfig({ ...config, esperaLinha2: e.target.value })}
                          placeholder="ESTARÁ LIBERADO"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">3ª Linha (Texto Verde)</label>
                        <input
                          type="text"
                          value={config.esperaLinha3 ?? 'PARA RESPONDER.'}
                          onChange={(e) => setConfig({ ...config, esperaLinha3: e.target.value })}
                          placeholder="PARA RESPONDER."
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VÁRIOS SLIDERS: TAMANHO DE CADA UMA DAS 3 LINHAS DE ESPERA */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Tamanho das Fontes da Tela de Espera
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1ª Linha */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">1ª Linha (Branco)</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.esperaLinha1Tamanho || config.esperaFonteTamanho || 26}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="40"
                          step="1"
                          value={config.esperaLinha1Tamanho || config.esperaFonteTamanho || 26}
                          onChange={(e) => setConfig({ ...config, esperaLinha1Tamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>16px</span>
                          <span>40px</span>
                        </div>
                      </div>

                      {/* 2ª Linha */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300">2ª Linha (Dourado)</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.esperaLinha2Tamanho || config.esperaFonteTamanho || 26}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="40"
                          step="1"
                          value={config.esperaLinha2Tamanho || config.esperaFonteTamanho || 26}
                          onChange={(e) => setConfig({ ...config, esperaLinha2Tamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>16px</span>
                          <span>40px</span>
                        </div>
                      </div>

                      {/* 3ª Linha */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400">3ª Linha (Verde)</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.esperaLinha3Tamanho || config.esperaFonteTamanho || 26}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="40"
                          step="1"
                          value={config.esperaLinha3Tamanho || config.esperaFonteTamanho || 26}
                          onChange={(e) => setConfig({ ...config, esperaLinha3Tamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>16px</span>
                          <span>40px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: TELA 1 (COM TÍTULO 1 & 2 E SLIDERS DE DESIGN)    */}
              {/* ====================================================== */}
              {activeTab === 'tela_1' && (
                <div className="space-y-4">
                  
                  {/* 1. TÍTULO 1 E TÍTULO 2 DA TELA 1 PARA QUEBRAR O TÍTULO */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                        Título da Pergunta (Tela 1)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Use Título 1 e 2 para quebrar em 2 linhas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 1 (1ª Linha)</label>
                        <input
                          type="text"
                          value={config.pergunta1Titulo || ''}
                          onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                          placeholder="Ex: Como você"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 2 (2ª Linha - Opcional)</label>
                        <input
                          type="text"
                          value={config.pergunta1Titulo2 || ''}
                          onChange={(e) => setConfig({ ...config, pergunta1Titulo2: e.target.value })}
                          placeholder="Ex: chegou aqui?"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Slider de Tamanho da Fonte da Pergunta 1 */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">Tamanho da Fonte da Pergunta 1</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                          {config.pergunta1FonteTamanho || 18}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="28"
                        step="1"
                        value={config.pergunta1FonteTamanho || 18}
                        onChange={(e) => setConfig({ ...config, pergunta1FonteTamanho: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>14px (Menor)</span>
                        <span>18px (Padrão)</span>
                        <span>28px (Maior)</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. CONFIGURAÇÕES VISUAIS: FUNDO, CORES DAS FONTES E DIMENSÕES DOS CARDS */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-4 shadow-lg">
                    
                    {/* CABEÇALHO DO BLOCO VISUAL */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Personalização Visual dos Cards
                      </span>
                    </div>

                    {/* OPÇÃO PARA FUNDO DE CARDS (16 QUADRADOS VISUAIS) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-300 block">
                          Fundo dos Cards no Celular (16 Opções)
                        </label>
                        <span className="text-[10px] text-amber-200/90 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {FUNDOS_CARDS.find(f => f.id === (config.cardFundoEstilo || 'escuro'))?.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800/80">
                        {FUNDOS_CARDS.map((fundo) => {
                          const isSel = (config.cardFundoEstilo || 'escuro') === fundo.id;
                          return (
                            <button
                              key={fundo.id}
                              type="button"
                              onClick={() => setConfig({ ...config, cardFundoEstilo: fundo.id })}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all relative flex items-center justify-center border shadow-md ${
                                fundo.classe
                              } ${
                                isSel 
                                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg z-10' 
                                  : 'opacity-75 hover:opacity-100 hover:scale-105'
                              }`}
                              title={fundo.label}
                            >
                              {isSel && (
                                <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] stroke-[3]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* OPÇÕES DE EFEITOS E ACABAMENTOS (3D, VIDRO, ENTALHE, ETC.) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-850">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          Efeito & Acabamento do Card (3D, Vidro, Entalhe, etc.)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {EFEITOS_CARDS.find(e => e.id === (config.cardEfeitoEstilo || 'padrao'))?.desc}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {EFEITOS_CARDS.map((ef) => {
                          const isSel = (config.cardEfeitoEstilo || 'padrao') === ef.id;
                          return (
                            <button
                              key={ef.id}
                              type="button"
                              onClick={() => setConfig({ ...config, cardEfeitoEstilo: ef.id })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 ${
                                isSel
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md ring-1 ring-amber-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                              }`}
                              title={ef.desc}
                            >
                              <span>{ef.label}</span>
                              {isSel && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* COR DAS FONTES (TÍTULO E SUBTÍTULO) - SOMENTE BOLINHAS COMPACTAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                      {/* Cor do Título */}
                      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-200 block">
                            Cor da Fonte do Título
                          </span>
                          <span className="text-[10px] text-amber-300 font-bold">
                            {CORES_FONTE_TITULO.find(c => c.id === (config.cardCorFonteTitulo || 'branco'))?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {CORES_FONTE_TITULO.map((cf) => {
                            const isSel = (config.cardCorFonteTitulo || 'branco') === cf.id;
                            return (
                              <button
                                key={cf.id}
                                type="button"
                                onClick={() => setConfig({ ...config, cardCorFonteTitulo: cf.id })}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${cf.dot} shadow-md transition-all flex items-center justify-center relative ${
                                  isSel
                                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg z-10'
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                title={cf.label}
                              >
                                {isSel && (
                                  <Check className={`w-3.5 h-3.5 stroke-[3] drop-shadow ${cf.id === 'branco' ? 'text-slate-950' : 'text-white'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cor da Descrição */}
                      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-200 block">
                            Cor da Fonte da Descrição
                          </span>
                          <span className="text-[10px] text-amber-300 font-bold">
                            {CORES_FONTE_SUBTITULO.find(c => c.id === (config.cardCorFonteSubtitulo || 'cinza'))?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {CORES_FONTE_SUBTITULO.map((cf) => {
                            const isSel = (config.cardCorFonteSubtitulo || 'cinza') === cf.id;
                            return (
                              <button
                                key={cf.id}
                                type="button"
                                onClick={() => setConfig({ ...config, cardCorFonteSubtitulo: cf.id })}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${cf.dot} shadow-md transition-all flex items-center justify-center relative ${
                                  isSel
                                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg z-10'
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                title={cf.label}
                              >
                                {isSel && (
                                  <Check className={`w-3.5 h-3.5 stroke-[3] drop-shadow ${cf.id === 'branco_suave' ? 'text-slate-950' : 'text-white'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SLIDERS DE DIMENSÕES: FONTE DO TÍTULO, SUBTÍTULO E ALTURA DOS CARDS */}
                    <div className="pt-2 border-t border-slate-855 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        Dimensões dos Cards
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Slider Tamanho Fonte Título */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">Fonte Título</span>
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                              {config.cardFonteTitulo || 16}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="13"
                            max="24"
                            step="1"
                            value={config.cardFonteTitulo || 16}
                            onChange={(e) => setConfig({ ...config, cardFonteTitulo: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>13px</span>
                            <span>24px</span>
                          </div>
                        </div>

                        {/* Slider Tamanho Fonte Subtítulo */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">Fonte Subtítulo</span>
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                              {config.cardFonteSubtitulo || 12}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="18"
                            step="1"
                            value={config.cardFonteSubtitulo || 12}
                            onChange={(e) => setConfig({ ...config, cardFonteSubtitulo: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>10px</span>
                            <span>18px</span>
                          </div>
                        </div>

                        {/* Slider Altura do Card */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">Altura do Card</span>
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                              {config.cardAltura || 82}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="130"
                            step="2"
                            value={config.cardAltura || 82}
                            onChange={(e) => setConfig({ ...config, cardAltura: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>60px</span>
                            <span>130px</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantidade de Cards por Tela (Botões Rápidos) */}
                    <div className="pt-2 border-t border-slate-855 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          Limite de Cards por Tela no Celular:
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Gera páginas automáticas caso ultrapasse
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, cardsPorTela: num }));
                              setPreviewPage(0);
                            }}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                              cardsPorTelaP1 === num
                                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. LISTA REFEITA DE OPÇÕES / CARDS DA TELA 1 */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-200 uppercase tracking-wider block">
                          Opções de Resposta Cadastradas
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {config.opcoesChegada?.length || 0} total • {cardsAtivosP1.length} ativas no celular
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdicionarCardP1}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Opção</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(config.opcoesChegada || []).map((opcao, idx) => {
                        const isAtivo = opcao.ativo !== false;
                        const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                        const paginaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTelaP1)) : null;

                        return (
                          <div
                            key={opcao.id || idx}
                            className={`rounded-2xl border transition-all p-3.5 space-y-3 shadow-md ${
                              isAtivo 
                                ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' 
                                : 'bg-slate-950/40 border-slate-900 opacity-50'
                            }`}
                          >
                            {/* Barra Superior do Card */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-850">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivoP1(idx)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border ${
                                    isAtivo
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                                  }`}
                                >
                                  {isAtivo ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                                  <span>{isAtivo ? 'Visível no Celular' : 'Oculto'}</span>
                                </button>

                                {isAtivo && (
                                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                    Página {paginaDoCard}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Seletor de Ícone */}
                                <select
                                  value={opcao.icone || 'Tag'}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'icone', e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-200 focus:border-amber-400 cursor-pointer"
                                >
                                  {ICONES.map(ic => (
                                    <option key={ic.id} value={ic.id} className="bg-slate-900 text-slate-200">{ic.label}</option>
                                  ))}
                                </select>

                                {/* Seletor de Cor do Ícone */}
                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                                  {CORES.map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => handleUpdateOpcaoP1(idx, 'cor', c.id)}
                                      className={`w-3.5 h-3.5 rounded-full transition-transform ${c.bg} ${
                                        (opcao.cor || 'amber') === c.id ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-40 hover:opacity-100'
                                      }`}
                                      title={c.label}
                                    />
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleExcluirCardP1(idx)}
                                  title="Excluir opção"
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Inputs de Título e Subtítulo */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                  Título da Opção (Texto Principal)
                                </label>
                                <input
                                  type="text"
                                  value={opcao.titulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
                                  placeholder="Ex: Vi a faixa na igreja"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                  Descrição / Detalhe (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={opcao.subtitulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
                                  placeholder="Ex: Passei em frente e vi o anúncio"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ====================================================== */}
              {/* ABAS DINÂMICAS: TELAS EXTRAS (TELA 2, TELA 3, ETC.)     */}
              {/* ====================================================== */}
              {activeTab.startsWith('extra_') && (() => {
                const extraIndex = parseInt(activeTab.split('_')[1], 10);
                const telaAlvo = (config.telasExtras || [])[extraIndex];
                if (!telaAlvo) return null;

                const numTela = extraIndex + 3;
                const cardsAtivos = (telaAlvo.opcoes || []).filter(o => o.ativo !== false);
                const limitCards = Number(telaAlvo.cardsPorTela) || 4;

                return (
                  <div className="space-y-4">
                    {/* Barra Superior da Tela Extra */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-400">
                          Configurando Tela {numTela}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                          ✓ Ativa no Celular
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExcluirTela(extraIndex)}
                        className="px-2.5 py-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition flex items-center gap-1"
                        title="Excluir esta tela inteira do fluxo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Tela {numTela}</span>
                      </button>
                    </div>

                    {/* Título e Subtítulo da Tela Extra com Título 1 e Título 2 */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-1">
                            Título 1 (Linha 1)
                          </label>
                          <input
                            type="text"
                            value={telaAlvo.titulo1 ?? telaAlvo.titulo ?? ''}
                            onChange={(e) => {
                              handleUpdateTelaProp(extraIndex, 'titulo1', e.target.value);
                              handleUpdateTelaProp(extraIndex, 'titulo', `${e.target.value} ${telaAlvo.titulo2 || ''}`.trim());
                            }}
                            placeholder={`Ex: Pergunta da Tela ${numTela}`}
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            Título 2 (Linha 2 - Opcional)
                          </label>
                          <input
                            type="text"
                            value={telaAlvo.titulo2 ?? ''}
                            onChange={(e) => {
                              handleUpdateTelaProp(extraIndex, 'titulo2', e.target.value);
                              handleUpdateTelaProp(extraIndex, 'titulo', `${telaAlvo.titulo1 || telaAlvo.titulo || ''} ${e.target.value}`.trim());
                            }}
                            placeholder="Ex: Quebra do título"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                          Subtítulo ou Instrução (Opcional)
                        </label>
                        <input
                          type="text"
                          value={telaAlvo.subtitulo || ''}
                          onChange={(e) => handleUpdateTelaProp(extraIndex, 'subtitulo', e.target.value)}
                          placeholder="Ex: Queremos te dar as boas-vindas com muito carinho"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">Cards por tela nesta etapa:</span>
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleUpdateTelaProp(extraIndex, 'cardsPorTela', num)}
                              className={`w-6 h-6 rounded-lg font-black text-[11px] transition ${
                                limitCards === num
                                  ? 'bg-amber-400 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cards desta Tela Extra */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                          Cards Cadastrados na Tela {numTela} ({telaAlvo.opcoes?.length || 0})
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddCardExtra(extraIndex)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Card</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(telaAlvo.opcoes || []).map((opcao, optIdx) => {
                          const isAtivo = opcao.ativo !== false;

                          return (
                            <div
                              key={opcao.id || optIdx}
                              className={`rounded-xl border transition-all p-3 space-y-2 ${
                                isAtivo 
                                  ? 'bg-slate-950 border-slate-800 shadow-sm' 
                                  : 'bg-slate-950/40 border-slate-900 opacity-55'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCardExtra(extraIndex, optIdx)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition border ${
                                    isAtivo
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  {isAtivo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span>{isAtivo ? 'Visível' : 'Oculto'}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                  <select
                                    value={opcao.icone || 'Sparkles'}
                                    onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'icone', e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-xs text-slate-200"
                                  >
                                    {ICONES.map(ic => (
                                      <option key={ic.id} value={ic.id}>{ic.label}</option>
                                    ))}
                                  </select>

                                  <div className="flex items-center gap-1">
                                    {CORES.map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleUpdateCardExtra(extraIndex, optIdx, 'cor', c.id)}
                                        className={`w-3.5 h-3.5 rounded-full ${c.bg} ${
                                          (opcao.cor || 'emerald') === c.id ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'
                                        }`}
                                        title={c.label}
                                      />
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleExcluirCardExtra(extraIndex, optIdx)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título do Card</label>
                                  <input
                                    type="text"
                                    value={opcao.titulo || ''}
                                    onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'titulo', e.target.value)}
                                    placeholder="Ex: Sim, é minha primeira vez!"
                                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-inner"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Descrição (Opcional)</label>
                                  <input
                                    type="text"
                                    value={opcao.subtitulo || ''}
                                    onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'subtitulo', e.target.value)}
                                    placeholder="Ex: Vim conhecer a igreja"
                                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-inner"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ====================================================== */}
              {/* ABA: TELA FINAL (AGRADECIMENTO / CONCLUÍDO)            */}
              {/* ====================================================== */}
              {activeTab === 'fim' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div>
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wide block">
                        Textos da Tela de Agradecimento (Tela Fim)
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Aparece assim que o visitante confirma a quantidade de pessoas.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {/* TÍTULO 1 E TÍTULO 2 PARA QUEBRAR O TÍTULO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            Título 1 (Linha 1)
                          </label>
                          <input
                            type="text"
                            value={config.finalTitulo1 ?? 'MUITO OBRIGADO'}
                            onChange={(e) => setConfig({ 
                              ...config, 
                              finalTitulo1: e.target.value,
                              finalTitulo: `${e.target.value} ${config.finalTitulo2 || ''}`.trim()
                            })}
                            placeholder="MUITO OBRIGADO"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            Título 2 (Linha 2 - Quebra do Título)
                          </label>
                          <input
                            type="text"
                            value={config.finalTitulo2 ?? 'PELA SUA PRESENÇA.'}
                            onChange={(e) => setConfig({ 
                              ...config, 
                              finalTitulo2: e.target.value,
                              finalTitulo: `${config.finalTitulo1 || ''} ${e.target.value}`.trim()
                            })}
                            placeholder="PELA SUA PRESENÇA."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          Mensagem / Complemento (Após o nome do evento)
                        </label>
                        <input
                          type="text"
                          value={config.finalMensagem ?? 'será espetacular!'}
                          onChange={(e) => setConfig({ ...config, finalMensagem: e.target.value })}
                          placeholder="será espetacular!"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            Status de Conclusão
                          </label>
                          <input
                            type="text"
                            value={config.finalStatus ?? 'REGISTRO CONCLUÍDO!'}
                            onChange={(e) => setConfig({ ...config, finalStatus: e.target.value })}
                            placeholder="REGISTRO CONCLUÍDO!"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            Instrução ao Visitante
                          </label>
                          <input
                            type="text"
                            value={config.finalInstrucao ?? 'pode guardar seu celular'}
                            onChange={(e) => setConfig({ ...config, finalInstrucao: e.target.value })}
                            placeholder="pode guardar seu celular"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VÁRIOS SLIDERS: TÍTULO, MENSAGEM, STATUS E INSTRUÇÃO DA TELA FIM */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Tamanho das Fontes da Tela de Agradecimento
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Slider 1: Título Principal */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Título (Linhas 1 e 2)</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.finalTituloFonteTamanho || config.finalFonteTamanho || 26}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="40"
                          step="1"
                          value={config.finalTituloFonteTamanho || config.finalFonteTamanho || 26}
                          onChange={(e) => setConfig({ 
                            ...config, 
                            finalTituloFonteTamanho: Number(e.target.value),
                            finalFonteTamanho: Number(e.target.value)
                          })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>16px (Menor)</span>
                          <span>40px (Maior)</span>
                        </div>
                      </div>

                      {/* Slider 2: Mensagem / Complemento */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300">Mensagem do Evento</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.finalMensagemFonteTamanho || 16}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="28"
                          step="1"
                          value={config.finalMensagemFonteTamanho || 16}
                          onChange={(e) => setConfig({ ...config, finalMensagemFonteTamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>12px</span>
                          <span>28px</span>
                        </div>
                      </div>

                      {/* Slider 3: Status de Conclusão */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400">Status de Conclusão</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.finalStatusFonteTamanho || 18}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="28"
                          step="1"
                          value={config.finalStatusFonteTamanho || 18}
                          onChange={(e) => setConfig({ ...config, finalStatusFonteTamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>12px</span>
                          <span>28px</span>
                        </div>
                      </div>

                      {/* Slider 4: Instrução ao Visitante */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">Instrução ao Visitante</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            {config.finalInstrucaoFonteTamanho || 13}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="22"
                          step="1"
                          value={config.finalInstrucaoFonteTamanho || 13}
                          onChange={(e) => setConfig({ ...config, finalInstrucaoFonteTamanho: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>10px</span>
                          <span>22px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: TELA 2 (ACOMPANHANTES / QUANTAS PESSOAS VIERAM)   */}
              {/* ====================================================== */}
              {activeTab === 'acompanhantes' && (
                <div className="space-y-4">
                  {/* Título da Tela 2 com Título 1 e Título 2 */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                        Título da Pergunta (Tela 2)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Use Título 1 e 2 para quebrar em 2 linhas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 1 (1ª Linha)</label>
                        <input
                          type="text"
                          value={config.pergunta2Titulo || ''}
                          onChange={(e) => setConfig({ ...config, pergunta2Titulo: e.target.value })}
                          placeholder="Ex: Você está só ou tem mais"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 2 (2ª Linha - Opcional)</label>
                        <input
                          type="text"
                          value={config.pergunta2Titulo2 || ''}
                          onChange={(e) => setConfig({ ...config, pergunta2Titulo2: e.target.value })}
                          placeholder="Ex: pessoas te acompanhando?"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300"
                        />
                      </div>
                    </div>

                    {/* Slider de Tamanho da Fonte da Pergunta 2 */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">Tamanho da Fonte da Pergunta 2</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                          {config.pergunta2FonteTamanho || 18}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="28"
                        step="1"
                        value={config.pergunta2FonteTamanho || 18}
                        onChange={(e) => setConfig({ ...config, pergunta2FonteTamanho: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>14px (Menor)</span>
                        <span>18px (Padrão)</span>
                        <span>28px (Maior)</span>
                      </div>
                    </div>
                  </div>

                  {/* DESIGN & ESTILO DOS BOTÕES NUMÉRICOS (TELA 2) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                          Estilo dos Botões de Quantidade (Tela 2)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Customização dos botões 2 a +10
                      </span>
                    </div>

                    {/* 1. SLIDE: TAMANHO / ALTURA DO BOTÃO */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">Tamanho / Altura do Botão</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px]">
                          {config.btnQtdAltura || 74}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="48"
                        max="100"
                        step="2"
                        value={config.btnQtdAltura || 74}
                        onChange={(e) => setConfig({ ...config, btnQtdAltura: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>48px (Compacto)</span>
                        <span>74px (Padrão)</span>
                        <span>100px (Grande)</span>
                      </div>
                    </div>

                    {/* 2. COR DO BOTÃO (10 OPÇÕES EM BOLINHAS) */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Cor do Botão (10 Opções)
                        </span>
                        <span className="text-[11px] font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {CORES_BOTAO_QTD.find(c => c.id === (config.btnQtdCor || 'slate'))?.label || 'Grafite'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80">
                        {CORES_BOTAO_QTD.map((c) => {
                          const isSelected = (config.btnQtdCor || 'slate') === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setConfig({ ...config, btnQtdCor: c.id })}
                              className={`w-8 h-8 rounded-full ${c.dot} shadow-md transition-all flex items-center justify-center relative ${
                                isSelected 
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg' 
                                  : 'opacity-70 hover:opacity-100 hover:scale-105'
                              }`}
                              title={c.label}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. SLIDE: TAMANHO DO NÚMERO DENTRO DO BOTÃO */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">Tamanho do Número no Botão</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px]">
                          {config.btnQtdFonteNumero || 34}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="48"
                        step="1"
                        value={config.btnQtdFonteNumero || 34}
                        onChange={(e) => setConfig({ ...config, btnQtdFonteNumero: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>18px (Menor)</span>
                        <span>34px (Padrão)</span>
                        <span>48px (Gigante)</span>
                      </div>
                    </div>

                    {/* 4. COR DO NÚMERO (OPÇÕES EM BOLINHAS) */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Cor do Número (Dígitos)
                        </span>
                        <span className="text-[11px] font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {CORES_NUMERO_QTD.find(c => c.id === (config.btnQtdCorNumero || 'branco'))?.label || 'Branco'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80">
                        {CORES_NUMERO_QTD.map((c) => {
                          const isSelected = (config.btnQtdCorNumero || 'branco') === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setConfig({ ...config, btnQtdCorNumero: c.id })}
                              className={`w-7 h-7 rounded-full ${c.dot} shadow-md transition-all flex items-center justify-center relative ${
                                isSelected 
                                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg' 
                                  : 'opacity-70 hover:opacity-100 hover:scale-105'
                              }`}
                              title={c.label}
                            >
                              {isSelected && (
                                <Check className={`w-3.5 h-3.5 stroke-[3] drop-shadow ${c.id === 'branco' ? 'text-slate-900' : 'text-white'}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                      Texto do Botão Individual (1 Pessoa)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Texto Principal</label>
                        <input
                          type="text"
                          value={config.opcaoIndividualTitulo || ''}
                          onChange={(e) => setConfig({ ...config, opcaoIndividualTitulo: e.target.value })}
                          placeholder="Ex: SÓ EU"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Complemento</label>
                        <input
                          type="text"
                          value={config.opcaoIndividualSubtitulo || ''}
                          onChange={(e) => setConfig({ ...config, opcaoIndividualSubtitulo: e.target.value })}
                          placeholder="Ex: , vim sozinho"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Texto do Divisor das Quantidades
                    </label>
                    <input
                      type="text"
                      value={config.divisorQtdTexto || ''}
                      onChange={(e) => setConfig({ ...config, divisorQtdTexto: e.target.value })}
                      placeholder="Ex: Quantas pessoas vieram com você?"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ========================================================== */}
          {/* COLUNA DIREITA: PREVIEW DO CELULAR CENTRALIZADO VERTICAL   */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 bg-slate-950/90 flex flex-col min-h-0 p-3 sm:p-5 relative items-center justify-center overflow-y-auto">
            
            {/* SELETOR DOS 6 PRESETS DE MODELOS DE CELULARES */}
            <div className="w-full max-w-[340px] mb-2.5 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Modelo do Celular:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {modeloAtual.marca}
                </span>
              </div>

              {/* Botões dos 6 Presets */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {MODELOS_CELULARES.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setModeloCelularId(mod.id)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition text-center truncate ${
                      modeloCelularId === mod.id
                        ? 'bg-amber-400 text-slate-950 shadow scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={mod.nome}
                  >
                    {mod.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* SELETOR DE TELAS DO PREVIEW (SINCRONIZADO COM AS ABAS: INÍCIO, TELA 1, TELA 2, EXTRAS, TELA FIM) */}
            <div className="w-full max-w-[340px] mb-3 flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto shrink-0 custom-scrollbar">
              <button
                type="button"
                onClick={() => setPreviewScreen('inicio')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'inicio' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Início
              </button>
              
              <button
                type="button"
                onClick={() => setPreviewScreen('tela_1')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'tela_1' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tela 1
              </button>

              <button
                type="button"
                onClick={() => setPreviewScreen('acompanhantes')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'acompanhantes' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tela 2
              </button>

              {(config.telasExtras || []).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewScreen(`extra_${idx}`)}
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                    previewScreen === `extra_${idx}` ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tela {idx + 3}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPreviewScreen('fim')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'fim' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tela Fim
              </button>
            </div>

            {/* MOCKUP DO SMARTPHONE COM MOLDURA DINÂMICA DO PRESET */}
            <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 my-auto transition-all duration-300`}>
              
              {/* Barra de Status com Notch / Dynamic Island / Punch Hole */}
              <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                <span className="font-mono font-bold text-[10px]">19:30</span>
                
                {/* Elemento de Topo Específico do Modelo */}
                {modeloAtual.tipoTopo === 'dynamic-island' && (
                  <div className="w-20 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-between px-2 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                )}

                {modeloAtual.tipoTopo === 'punch-hole-center' && (
                  <div className="w-3 h-3 rounded-full bg-black border border-slate-800 shadow-inner" />
                )}

                {modeloAtual.tipoTopo === 'notch' && (
                  <div className="w-24 h-3 bg-black rounded-b-xl border-b border-slate-800 shadow-inner" />
                )}

                <div className="flex items-center gap-1.5">
                  <Wifi className="w-2.5 h-2.5" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Tela Interna do Celular */}
              <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
                
                {/* PREVIEW: TELA INÍCIO */}
                {previewScreen === 'inicio' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 my-auto">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-emerald-400 animate-spin" />
                      <div className="relative w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                    </div>

                    <div className="space-y-1 text-center px-2">
                      <span 
                        style={{ fontSize: `${(config.esperaLinha1Tamanho || config.esperaFonteTamanho || 26) * 0.58}px` }}
                        className="block font-black text-white tracking-wide uppercase leading-tight"
                      >
                        {config.esperaLinha1 || 'DENTRO DE INSTANTES'}
                      </span>
                      <span 
                        style={{ fontSize: `${(config.esperaLinha2Tamanho || config.esperaFonteTamanho || 26) * 0.58}px` }}
                        className="block font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent tracking-wide uppercase leading-tight"
                      >
                        {config.esperaLinha2 || 'ESTARÁ LIBERADO'}
                      </span>
                      <span 
                        style={{ fontSize: `${(config.esperaLinha3Tamanho || config.esperaFonteTamanho || 26) * 0.58}px` }}
                        className="block font-black text-emerald-400 tracking-wide uppercase leading-tight"
                      >
                        {config.esperaLinha3 || 'PARA RESPONDER.'}
                      </span>
                    </div>

                    <div className="w-2/3 bg-slate-950 rounded-full h-1 overflow-hidden">
                      <div className="bg-amber-400 h-full w-1/2 rounded-full animate-pulse mx-auto" />
                    </div>
                  </div>
                )}

                {/* PREVIEW: TELA 1 */}
                {previewScreen === 'tela_1' && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div className="shrink-0 space-y-1">
                      <p className="text-xs font-black text-emerald-400 tracking-wide">
                        Seja muito bem-vindo!
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 shadow">
                        <TreePine className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-black tracking-wide uppercase truncate max-w-[180px]">
                          {eventoTitulo}
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-800/60">
                        <h3 
                          style={{ fontSize: `${(config.pergunta1FonteTamanho || 18) * 0.72}px` }}
                          className="font-black text-white leading-tight"
                        >
                          {config.pergunta1Titulo2 ? (
                            <>
                              <span className="block">{config.pergunta1Titulo}</span>
                              <span className="block">{config.pergunta1Titulo2}</span>
                            </>
                          ) : (
                            config.pergunta1Titulo || 'Como você chegou aqui?'
                          )}
                        </h3>
                      </div>

                      {totalPaginasPreviewP1 > 1 && (
                        <div className="flex items-center justify-between pt-1 px-1">
                          <span className="text-[9px] font-bold text-amber-300">
                            Página {safePreviewPageP1 + 1} de {totalPaginasPreviewP1}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPaginasPreviewP1 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewPage(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                  safePreviewPageP1 === i ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cards da Tela 1 */}
                    <div className="flex-1 my-auto space-y-2 py-1">
                      {cardsNaPaginaAtualP1.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Nenhum card ativo nesta tela.
                        </div>
                      ) : (
                        cardsNaPaginaAtualP1.map((opcao) => {
                          const IconComp = getIconComponent(opcao.icone);
                          const corCls = getCorBadge(opcao.cor);

                          return (
                            <div
                              key={opcao.id}
                              style={{ minHeight: `${config.cardAltura || 82}px` }}
                              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${getCardFundoClass(config.cardFundoEstilo)} ${getCardEfeitoClass(config.cardEfeitoEstilo)}`}
                            >
                              <div className="flex items-center gap-2.5 pr-1 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${corCls}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 
                                    style={{ fontSize: `${config.cardFonteTitulo || 16}px` }}
                                    className={`font-bold truncate leading-snug ${getCardFonteTituloClass(config.cardCorFonteTitulo)}`}
                                  >
                                    {opcao.titulo || 'Opção sem título'}
                                  </h4>
                                  {opcao.subtitulo && (
                                    <p 
                                      style={{ fontSize: `${config.cardFonteSubtitulo || 12}px` }}
                                      className={`truncate mt-0.5 leading-snug ${getCardFonteSubtituloClass(config.cardCorFonteSubtitulo)}`}
                                    >
                                      {opcao.subtitulo}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {totalPaginasPreviewP1 > 1 && (
                      <div className="shrink-0 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.max(0, safePreviewPageP1 - 1))}
                          disabled={safePreviewPageP1 === 0}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>Anterior</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.min(totalPaginasPreviewP1 - 1, safePreviewPageP1 + 1))}
                          disabled={safePreviewPageP1 >= totalPaginasPreviewP1 - 1}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <span>Ver mais</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PREVIEW: TELAS EXTRAS (TELA 3, TELA 4, ETC.) */}
                {previewScreen.startsWith('extra_') && (() => {
                  const extraIdx = parseInt(previewScreen.split('_')[1], 10);
                  const telaExtra = (config.telasExtras || [])[extraIdx];
                  if (!telaExtra) return null;

                  const numTela = extraIdx + 3;
                  const cardsAtivos = (telaExtra.opcoes || []).filter(o => o.ativo !== false);

                  return (
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="shrink-0 space-y-1">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase">
                          <span>Tela {numTela} de {2 + (config.telasExtras || []).length + 1}</span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {telaExtra.titulo1 && telaExtra.titulo2 ? (
                            <>
                              <span className="block">{telaExtra.titulo1}</span>
                              <span className="block">{telaExtra.titulo2}</span>
                            </>
                          ) : (
                            telaExtra.titulo || `Pergunta da Tela ${numTela}`
                          )}
                        </h3>
                        {telaExtra.subtitulo && (
                          <p className="text-[10px] text-slate-400">
                            {telaExtra.subtitulo}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 my-auto space-y-2 py-1">
                        {cardsAtivos.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            Nenhum card ativo nesta tela.
                          </div>
                        ) : (
                          cardsAtivos.map((opt) => {
                            const IconComp = getIconComponent(opt.icone);
                            const corCls = getCorBadge(opt.cor);

                            return (
                              <div
                                key={opt.id}
                                style={{ minHeight: `${config.cardAltura || 82}px` }}
                                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${getCardFundoClass(config.cardFundoEstilo)} ${getCardEfeitoClass(config.cardEfeitoEstilo)}`}
                              >
                                <div className="flex items-center gap-2.5 pr-1 min-w-0">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${corCls}`}>
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 
                                      style={{ fontSize: `${config.cardFonteTitulo || 16}px` }}
                                      className={`font-bold truncate leading-snug ${getCardFonteTituloClass(config.cardCorFonteTitulo)}`}
                                    >
                                      {opt.titulo || 'Opção sem título'}
                                    </h4>
                                    {opt.subtitulo && (
                                      <p 
                                        style={{ fontSize: `${config.cardFonteSubtitulo || 12}px` }}
                                        className={`truncate mt-0.5 leading-snug ${getCardFonteSubtituloClass(config.cardCorFonteSubtitulo)}`}
                                      >
                                        {opt.subtitulo}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="shrink-0 pt-1 border-t border-slate-800/80">
                        <span className="text-[9px] text-emerald-400 font-bold">
                          ✓ Esta tela aparecerá no celular
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* PREVIEW: TELA 2 (ACOMPANHANTES) */}
                {previewScreen === 'acompanhantes' && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div className="shrink-0 space-y-1">
                      <p className="text-xs font-black text-emerald-400 tracking-wide">
                        Seja muito bem-vindo!
                      </p>
                      <h3 
                        style={{ fontSize: `${(config.pergunta2FonteTamanho || 18) * 0.72}px` }}
                        className="font-black text-white leading-tight"
                      >
                        {config.pergunta2Titulo2 ? (
                          <>
                            <span className="block">{config.pergunta2Titulo}</span>
                            <span className="block">{config.pergunta2Titulo2}</span>
                          </>
                        ) : (
                          config.pergunta2Titulo || 'Você está só ou tem mais pessoas te acompanhando?'
                        )}
                      </h3>
                    </div>

                    <div className="flex-1 my-auto space-y-2.5 py-1">
                      <div className="w-full p-2.5 rounded-2xl border border-emerald-500/30 border-b-4 border-b-emerald-950 bg-gradient-to-b from-emerald-600 to-emerald-700 flex items-center justify-between shadow-lg text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-200">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black text-sm text-amber-300 block">
                              {config.opcaoIndividualTitulo || 'SÓ EU'}
                            </span>
                            <span className="text-[10px] text-white/90 block">
                              {config.opcaoIndividualSubtitulo || ', vim sozinho'}
                            </span>
                          </div>
                        </div>
                        <span className="w-7 h-7 rounded-xl bg-emerald-950/80 text-emerald-300 font-black text-xs flex items-center justify-center">
                          1
                        </span>
                      </div>

                      <div className="flex items-center my-1">
                        <div className="flex-grow border-t border-slate-800" />
                        <span className="px-2 text-[9px] font-black text-amber-300 uppercase">
                          {config.divisorQtdTexto || 'Quantas pessoas vieram com você?'}
                        </span>
                        <div className="flex-grow border-t border-slate-800" />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {['2', '3', '4', '5', '6', '7', '8', '9', '+10'].map((num) => {
                          const btnCorCls = getBtnQtdSimClass(config.btnQtdCor);
                          const numCorCls = getBtnNumClass(config.btnQtdCorNumero);
                          const simBtnHeight = Math.round((config.btnQtdAltura || 74) * 0.58);
                          const simNumSize = Math.round((config.btnQtdFonteNumero || 34) * 0.58);

                          return (
                            <div
                              key={num}
                              style={{ minHeight: `${simBtnHeight}px` }}
                              className={`py-1 px-1 rounded-xl border border-b-2 text-center flex flex-col items-center justify-center transition-all ${btnCorCls}`}
                            >
                              <span 
                                style={{ fontSize: `${simNumSize}px` }}
                                className={`font-black leading-none block ${numCorCls}`}
                              >
                                {num}
                              </span>
                              <span className="text-[8px] font-bold text-white/80 block mt-0.5">
                                {num === '+10' ? 'Pessoas +' : 'Pessoas'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: TELA FIM */}
                {previewScreen === 'fim' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-3.5 my-auto px-2">
                    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                      <h3 
                        style={{ fontSize: `${(config.finalTituloFonteTamanho || config.finalFonteTamanho || 26) * 0.58}px` }}
                        className="font-black text-white tracking-tight leading-snug"
                      >
                        {config.finalTitulo1 && config.finalTitulo2 ? (
                          <>
                            <span className="block">{config.finalTitulo1}</span>
                            <span className="block">{config.finalTitulo2}</span>
                          </>
                        ) : (
                          config.finalTitulo || 'MUITO OBRIGADO PELA SUA PRESENÇA.'
                        )}
                      </h3>

                      <div className="space-y-0.5">
                        <span className="block text-[11px] font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent uppercase tracking-wide">
                          A {eventoTitulo}
                        </span>
                        <span 
                          style={{ fontSize: `${(config.finalMensagemFonteTamanho || 16) * 0.65}px` }}
                          className="block font-extrabold text-amber-400"
                        >
                          {config.finalMensagem || 'será espetacular!'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden mb-2">
                          <div className="bg-amber-400 h-full w-2/3 rounded-full mx-auto" />
                        </div>
                        <p 
                          style={{ fontSize: `${(config.finalStatusFonteTamanho || 18) * 0.65}px` }}
                          className="font-black text-emerald-400 uppercase tracking-wide"
                        >
                          {config.finalStatus || 'REGISTRO CONCLUÍDO!'}
                        </p>
                        <p 
                          style={{ fontSize: `${(config.finalInstrucaoFonteTamanho || 13) * 0.72}px` }}
                          className="font-bold text-slate-400"
                        >
                          {config.finalInstrucao || 'pode guardar seu celular'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-medium text-center shrink-0">
              {modeloAtual.nome} • Simulação interativa centralizada
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RODAPÉ COM AÇÕES                                             */}
        {/* ============================================================ */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRestaurarPadroes}
            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-750 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="px-5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {salvo ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo no Firebase!</span>
                </>
              ) : salvando ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
