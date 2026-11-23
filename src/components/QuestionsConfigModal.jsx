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
  Palette,
  FileText,
  UploadCloud,
  FolderUp,
  ChevronDown,
  AlignLeft,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { 
  getSavedQuestionsConfig, 
  saveQuestionsConfig, 
  getSavedEventTitle,
  saveEventTitle,
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';
import { parseAnyFile, parseJsonOrText, parseGoogleFormsUrl } from '../utils/formImporter';
import { PRESETS_PESQUISAS } from '../utils/presets';

export const TIPOS_PERGUNTA = [
  { id: 'cards', label: '🃏 Cards Múltipla Escolha', short: 'Cards', desc: 'Cards grandes táteis com ícones e gavetas' },
  { id: 'radio', label: '🔘 Radio Button (Escolha Única)', short: 'Radio Button', desc: 'Lista clássica com bolinhas de seleção única' },
  { id: 'checkbox', label: '☑️ Checkbox (Múltipla Seleção)', short: 'Checkbox', desc: 'Caixas para marcar uma ou várias opções' },
  { id: 'dropdown', label: '📋 Lista Suspensa (Dropdown)', short: 'Lista Suspensa', desc: 'Menu seletor compacto para listas de opções' },
  { id: 'slider', label: '🎚️ Slide / Escala (0 a 10)', short: 'Slide / Escala', desc: 'Barra deslizante interativa para notas e NPS' },
  { id: 'rating', label: '⭐ Avaliação Estrelas (1 a 5)', short: 'Estrelas', desc: 'Classificação rápida por estrelas' },
  { id: 'texto_curto', label: '🔤 Texto Pequeno (Curto)', short: 'Texto Pequeno', desc: 'Campo de 1 linha (Nome, WhatsApp, Bairro, etc.)' },
  { id: 'texto', label: '📝 Campo Longo (Dissertativo)', short: 'Campo Longo', desc: 'Caixa de texto ampla para comentários e sugestões' },
  { id: 'data', label: '📅 Data (Calendário)', short: 'Data', desc: 'Seletor de data dia/mês/ano' },
  { id: 'hora', label: '⏰ Hora (Relógio)', short: 'Hora', desc: 'Seletor de horário (hora:minuto)' }
];

export const TIPOS_GAVETA = [
  { id: 'texto_longo', label: '📝 Campo Longo (Texto Aberto)' },
  { id: 'texto_curto', label: '🔤 Texto Pequeno (1 Linha)' },
  { id: 'radio', label: '🔘 Radio Button (Escolha Única)' },
  { id: 'checkbox', label: '☑️ Checkbox (Várias Opções)' },
  { id: 'slider', label: '🎚️ Slide / Escala Numérica' },
  { id: 'data', label: '📅 Seletor de Data' },
  { id: 'hora', label: '⏰ Seletor de Hora' }
];

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

// OPÇÕES DE EFEITOS E ACABAMENTOS DOS CARDS (3D, VIDRO, ENTALHE, ALTO-RELEVO, ETC.)
export const EFEITOS_CARDS = [
  { id: 'padrao', label: 'Normal / Flat', desc: 'Borda sutil e limpa' },
  { id: 'efeito_3d', label: 'Efeito 3D', desc: 'Base tátil saliente com profundidade' },
  { id: 'vidro', label: 'Efeito Vidro', desc: 'Translúcido com blur e reflexo' },
  { id: 'entalhe', label: 'Entalhe (Baixo-Relevo)', desc: 'Profundidade esculpida para dentro' },
  { id: 'alto_relevo', label: 'Alto-Relevo', desc: 'Relevo saltado para fora (emboss)' },
  { id: 'glow', label: 'Glow Neon', desc: 'Iluminação de contorno' },
];

export function getEfeitoStyle(efeito = 'padrao', profundidade = 5) {
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

export default function QuestionsConfigModal({ isOpen, onClose, activeEventId = null, eventTitle = '', inline = false }) {
  // Abas: 'inicio' | 'tela_1' | 'extra_0', 'extra_1'... | 'acompanhantes' | 'fim'
  const [activeTab, setActiveTab] = useState('inicio');
  const [config, setConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Sub-navegações internas minimalistas para evitar poluição visual
  const [subTabTela1, setSubTabTela1] = useState('opcoes'); // 'opcoes' | 'aparencia' | 'pergunta'
  const [subTabTela2, setSubTabTela2] = useState('botoes'); // 'botoes' | 'pergunta' | 'individual'

  // Preset de Celular Ativo
  const [modeloCelularId, setModeloCelularId] = useState('iphone16pro');

  // Estado do Preview do Celular: 'inicio' | 'tela_1' | 'extra_0', 'extra_1'... | 'acompanhantes' | 'fim'
  const [previewScreen, setPreviewScreen] = useState('inicio');
  const [previewPage, setPreviewPage] = useState(0);
  const [previewOpenGavetaId, setPreviewOpenGavetaId] = useState(null);
  const [previewInteractiveVal, setPreviewInteractiveVal] = useState({});

  // Modais de Modelos Prontos e Importação de Arquivos / Formulários
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTexto, setImportTexto] = useState('');
  const [googleFormsUrl, setGoogleFormsUrl] = useState('');
  const [importando, setImportando] = useState(false);
  const [previewImportado, setPreviewImportado] = useState(null);
  const [showTipoNovaTelaModal, setShowTipoNovaTelaModal] = useState(false);

  // Modal Padronizado de Avisos, Erros e Confirmações
  const [modalFeedback, setModalFeedback] = useState({
    isOpen: false,
    tipo: 'aviso',
    titulo: '',
    mensagem: '',
    onConfirm: null,
    btnTexto: 'Entendido'
  });

  const mostrarFeedback = (titulo, mensagem, tipo = 'erro') => {
    setModalFeedback({
      isOpen: true,
      tipo,
      titulo,
      mensagem,
      onConfirm: null,
      btnTexto: 'Entendido'
    });
  };

  const mostrarConfirm = (titulo, mensagem, onConfirm, btnTexto = 'Confirmar') => {
    setModalFeedback({
      isOpen: true,
      tipo: 'confirm',
      titulo,
      mensagem,
      onConfirm,
      btnTexto
    });
  };

  useEffect(() => {
    if (isOpen || inline) {
      setConfig(getSavedQuestionsConfig(activeEventId));
      setEventoTitulo(eventTitle || getSavedEventTitle(activeEventId) || 'CANTATA DE NATAL 2026');
      setSalvo(false);
      setActiveTab('inicio');
      setPreviewScreen('inicio');
      setPreviewPage(0);
    }
  }, [isOpen, inline, activeEventId, eventTitle]);

  // Alinha a tela do preview sempre que a aba ativa mudar
  useEffect(() => {
    setPreviewScreen(activeTab);
    setPreviewPage(0);
  }, [activeTab]);

  if (!isOpen && !inline) return null;

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

  // Excluir card da Tela 1 (Permite deixar 100% em branco se o admin quiser apenas texto + botão COMEÇAR)
  const handleExcluirCardP1 = (index) => {
    const cardAlvo = config.opcoesChegada[index];
    mostrarConfirm(
      'Excluir Opção',
      `Deseja realmente excluir "${cardAlvo.titulo || 'esta opção'}" da Tela 1?`,
      () => {
        setConfig((prev) => {
          const novas = prev.opcoesChegada.filter((_, idx) => idx !== index);
          return { ...prev, opcoesChegada: novas };
        });
      },
      'Excluir'
    );
  };

  // DIVISOR DE TELA: "Daqui pra frente vira Tela 2, Tela 3..."
  const handleDividirParaNovaTelaP1 = (splitIndex) => {
    const todas = config.opcoesChegada || [];
    if (splitIndex <= 0 || splitIndex >= todas.length) return;

    const ficamNaTela1 = todas.slice(0, splitIndex);
    const vaoParaNovaTela = todas.slice(splitIndex);
    const totalExtras = (config.telasExtras || []).length;

    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      tipo: 'cards',
      titulo: vaoParaNovaTela[0]?.titulo || `Pergunta da Tela ${totalExtras + 2}`,
      titulo1: vaoParaNovaTela[0]?.titulo || `Pergunta da Tela ${totalExtras + 2}`,
      titulo2: '',
      subtitulo: '',
      cardsPorTela: 4,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      opcoes: vaoParaNovaTela
    };

    setConfig((prev) => ({
      ...prev,
      opcoesChegada: ficamNaTela1,
      telasExtras: [...(prev.telasExtras || []), novaTela]
    }));
    setActiveTab(`extra_${totalExtras}`);
  };

  const handleDividirParaNovaTelaExtra = (extraIndex, splitOptIndex) => {
    const telas = [...(config.telasExtras || [])];
    const telaAtual = telas[extraIndex];
    if (!telaAtual || !Array.isArray(telaAtual.opcoes)) return;
    if (splitOptIndex <= 0 || splitOptIndex >= telaAtual.opcoes.length) return;

    const ficam = telaAtual.opcoes.slice(0, splitOptIndex);
    const vao = telaAtual.opcoes.slice(splitOptIndex);

    telas[extraIndex] = { ...telaAtual, opcoes: ficam };
    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      tipo: telaAtual.tipo || 'cards',
      titulo: vao[0]?.titulo || `Nova Tela`,
      titulo1: vao[0]?.titulo || `Nova Tela`,
      titulo2: '',
      subtitulo: '',
      cardsPorTela: 4,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      opcoes: vao
    };

    telas.splice(extraIndex + 1, 0, novaTela);
    setConfig((prev) => ({ ...prev, telasExtras: telas }));
    setActiveTab(`extra_${extraIndex + 1}`);
  };

  // ============================================================
  // GESTÃO DE TELAS EXTRAS (TODOS OS 10 COMPONENTES MUNDIAIS)
  // ============================================================
  const handleAdicionarTela = (tipo = 'cards') => {
    const totalExtras = (config.telasExtras || []).length;
    setShowTipoNovaTelaModal(false);

    const defaultsByType = {
      texto: {
        titulo: 'Deixe seu comentário ou sugestão:',
        titulo1: 'Deixe seu comentário',
        titulo2: 'ou sugestão:',
        subtitulo: 'Espaço aberto para você digitar livremente:',
        placeholder: 'Digite sua mensagem ou opinião aqui...',
        multiline: true,
        linhas: 4,
        opcoes: []
      },
      texto_curto: {
        titulo: 'Qual o seu nome ou contato?',
        titulo1: 'Qual o seu nome',
        titulo2: 'ou contato?',
        subtitulo: 'Resposta curta em 1 linha:',
        placeholder: 'Digite aqui...',
        multiline: false,
        linhas: 1,
        opcoes: []
      },
      slider: {
        titulo: 'De 0 a 10, qual sua nota para o evento?',
        titulo1: 'De 0 a 10, qual sua nota',
        titulo2: 'para o evento?',
        subtitulo: 'Arraste o controle deslizante (Slide):',
        sliderMin: 0,
        sliderMax: 10,
        sliderStep: 1,
        sliderUnidade: '',
        opcoes: []
      },
      rating: {
        titulo: 'Como você avalia a programação?',
        titulo1: 'Como você avalia',
        titulo2: 'a programação?',
        subtitulo: 'Toque nas estrelas de 1 a 5:',
        opcoes: []
      },
      data: {
        titulo: 'Selecione a data desejada:',
        titulo1: 'Selecione a data',
        titulo2: 'desejada:',
        subtitulo: 'Escolha no calendário abaixo:',
        opcoes: []
      },
      hora: {
        titulo: 'Qual o melhor horário para você?',
        titulo1: 'Qual o melhor horário',
        titulo2: 'para você?',
        subtitulo: 'Selecione o horário:',
        opcoes: []
      },
      dropdown: {
        titulo: 'Selecione uma opção na lista:',
        titulo1: 'Selecione uma opção',
        titulo2: 'na lista suspensa:',
        subtitulo: 'Toque na caixa para abrir as opções:',
        opcoes: [
          { id: `opt_${Date.now()}_1`, titulo: 'Opção 1 da Lista', ativo: true, icone: 'Tag', cor: 'amber' },
          { id: `opt_${Date.now()}_2`, titulo: 'Opção 2 da Lista', ativo: true, icone: 'Sparkles', cor: 'sky' },
          { id: `opt_${Date.now()}_3`, titulo: 'Opção 3 da Lista', ativo: true, icone: 'Star', cor: 'emerald' }
        ]
      },
      checkbox: {
        titulo: 'Quais opções se aplicam a você?',
        titulo1: 'Quais opções se aplicam',
        titulo2: 'a você? (Marque várias)',
        subtitulo: 'Você pode selecionar uma ou mais caixas:',
        opcoes: [
          { id: `opt_${Date.now()}_1`, titulo: 'Primeira opção selecionável', ativo: true, icone: 'Sparkles', cor: 'emerald' },
          { id: `opt_${Date.now()}_2`, titulo: 'Segunda opção selecionável', ativo: true, icone: 'Star', cor: 'amber' },
          { id: `opt_${Date.now()}_3`, titulo: 'Terceira opção selecionável', ativo: true, icone: 'Church', cor: 'sky' }
        ]
      },
      radio: {
        titulo: 'Escolha uma das alternativas abaixo:',
        titulo1: 'Escolha uma das',
        titulo2: 'alternativas abaixo:',
        subtitulo: 'Seleção única (Radio Button):',
        opcoes: [
          { id: `opt_${Date.now()}_1`, titulo: 'Alternativa A', ativo: true, icone: 'Sparkles', cor: 'emerald', temGaveta: false, gaveta: null },
          { id: `opt_${Date.now()}_2`, titulo: 'Alternativa B', ativo: true, icone: 'Star', cor: 'amber', temGaveta: false, gaveta: null },
          { id: `opt_${Date.now()}_3`, titulo: 'Alternativa C', ativo: true, icone: 'Church', cor: 'sky', temGaveta: false, gaveta: null }
        ]
      },
      cards: {
        titulo: 'É a sua primeira vez conosco?',
        titulo1: 'É a sua primeira vez',
        titulo2: 'conosco?',
        subtitulo: 'Queremos te dar as boas-vindas com muito carinho',
        opcoes: [
          { id: `opt_${Date.now()}_1`, titulo: 'Sim, pela primeira vez', subtitulo: 'Vim conhecer a programação', ativo: true, icone: 'Sparkles', cor: 'emerald', temGaveta: false, gaveta: null },
          { id: `opt_${Date.now()}_2`, titulo: 'Já visitei em outras ocasiões', subtitulo: 'Venho em ocasiões especiais', ativo: true, icone: 'Star', cor: 'amber', temGaveta: false, gaveta: null },
          { id: `opt_${Date.now()}_3`, titulo: 'Frequento regularmente', subtitulo: 'Já acompanho os encontros', ativo: true, icone: 'Church', cor: 'sky', temGaveta: false, gaveta: null }
        ]
      }
    };

    const base = defaultsByType[tipo] || defaultsByType.cards;
    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      tipo,
      cardsPorTela: 4,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      sliderMin: 0,
      sliderMax: 10,
      sliderStep: 1,
      sliderUnidade: '',
      ...base
    };

    setConfig((prev) => ({
      ...prev,
      telasExtras: [...(prev.telasExtras || []), novaTela]
    }));
    setActiveTab(`extra_${totalExtras}`);
  };

  // Aplicar modelo pré-pronto
  const handleAplicarPreset = (presetId) => {
    const p = PRESETS_PESQUISAS.find(pr => pr.id === presetId);
    if (!p) return;
    setConfig((prev) => ({
      ...prev,
      ...p.config
    }));
    setShowPresetsModal(false);
    setActiveTab('tela_1');
  };

  // Importar arquivo (.docx / .doc / .csv / .txt / .json) com IA
  const handleImportarArquivo = async (file) => {
    try {
      setImportando(true);
      const imported = await parseAnyFile(file);
      setPreviewImportado(imported);
    } catch (err) {
      mostrarFeedback('Erro ao Importar Arquivo', err?.message || String(err), 'erro');
    } finally {
      setImportando(false);
    }
  };

  // Importar pelo link direto do Google Forms com IA
  const handleImportarGoogleFormsUrl = async () => {
    if (!googleFormsUrl.trim()) {
      mostrarFeedback('Link Vazio', 'Cole o link do Google Forms antes de clicar em Analisar Link.', 'aviso');
      return;
    }
    try {
      setImportando(true);
      const imported = await parseGoogleFormsUrl(googleFormsUrl);
      setPreviewImportado(imported);
    } catch (err) {
      mostrarFeedback('Aviso ao Ler Link do Google Forms', err?.message || String(err), 'aviso');
    } finally {
      setImportando(false);
    }
  };
  // Importar texto colado do Forms ou Google Docs
  const handleImportarTextoColado = () => {
    if (!importTexto.trim()) {
      mostrarFeedback('Campo em Branco', 'Por favor, cole o texto das perguntas ou formulário antes de prosseguir.', 'aviso');
      return;
    }
    try {
      const imported = parseJsonOrText(importTexto);
      setPreviewImportado(imported);
    } catch (err) {
      mostrarFeedback('Erro ao Analisar Texto', err?.message || String(err), 'erro');
    }
  };

  // Confirmar aplicação de formulário importado
  const handleConfirmarImportacao = () => {
    if (!previewImportado) return;
    setConfig((prev) => ({
      ...prev,
      ...previewImportado
    }));
    setPreviewImportado(null);
    setImportTexto('');
    setShowImportModal(false);
    setActiveTab('tela_1');
  };

  const handleExcluirTela = (extraIndex) => {
    const numTela = extraIndex + 3;
    mostrarConfirm(
      'Excluir Tela',
      `Tem certeza que deseja excluir a Tela ${numTela}?`,
      () => {
        setConfig((prev) => {
          const novas = (prev.telasExtras || []).filter((_, i) => i !== extraIndex);
          return { ...prev, telasExtras: novas };
        });
        setActiveTab('inicio');
      },
      'Excluir'
    );
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
        mostrarFeedback('Atenção', 'Mantenha pelo menos 1 opção nesta tela!', 'aviso');
        return prev;
      }
      novasTelas[extraIndex] = {
        ...telaAlvo,
        opcoes: telaAlvo.opcoes.filter((_, i) => i !== cardIndex)
      };
      return { ...prev, telasExtras: novasTelas };
    });
  };

  // Salvar no Firebase para o evento atual
  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await saveQuestionsConfig(config, activeEventId);
      if (eventoTitulo.trim()) {
        await saveEventTitle(eventoTitulo.trim(), activeEventId);
      }
      setSalvo(true);
      setTimeout(() => {
        setSalvo(false);
        if (!inline && onClose) onClose();
      }, 1000);
    } catch (e) {
      mostrarFeedback('Erro ao Salvar no Firebase', e?.message || String(e), 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleRestaurarPadroes = () => {
    mostrarConfirm(
      'Restaurar Padrões',
      'Deseja restaurar todas as configurações de telas para o padrão original?',
      () => {
        setConfig({ ...DEFAULT_QUESTIONS_CONFIG });
        setActiveTab('inicio');
        setPreviewScreen('inicio');
        setPreviewPage(0);
      },
      'Restaurar'
    );
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
    <div className={inline ? "w-full animate-fade-in" : "fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"}>
      <div className={inline ? "relative w-full bg-slate-900 border border-slate-800 rounded-r-2xl rounded-l-none border-l-0 shadow-xl flex flex-col overflow-hidden" : "relative w-[96vw] max-w-7xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden shrink-0"}>
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL (FIXO NO TOPO)                            */}
        {/* ============================================================ */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">Configurar Perguntas & Telas</h2>

            {/* Listbox do Modelo de Celular movido para o Topo à Esquerda */}
            <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-3 border-l border-slate-800">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={modeloCelularId}
                onChange={(e) => setModeloCelularId(e.target.value)}
                className="bg-slate-950 border border-slate-700 hover:border-amber-400 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-inner transition"
              >
                {MODELOS_CELULARES.map((mod) => (
                  <option key={mod.id} value={mod.id} className="bg-slate-900 text-white py-1">
                    {mod.nome} ({mod.marca})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Modelos Prontos */}
            <button
              type="button"
              onClick={() => setShowPresetsModal(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Carregar modelos mundiais prontos (NPS, Checkbox, Gavetas, Inscrição)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modelos Mundiais IA</span>
              <span className="sm:hidden">Modelos</span>
            </button>

            {/* Botão Importar Form */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Importar com IA arquivos .docx, .doc, .csv, .txt ou Google Forms"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importar IA (.docx / .doc / .csv / .txt)</span>
              <span className="sm:hidden">Importar IA</span>
            </button>

            {!inline && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CORPO EM 2 COLUNAS: ESQUERDA (CONFIG) + DIREITA (CELULAR)    */}
        {/* ============================================================ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* ========================================================== */}
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES ORGANIZADAS POR ABAS        */}
          {/* ========================================================== */}
          <div className="lg:col-span-6 flex flex-col min-h-0 bg-slate-900/50">
            
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

              {/* Telas Extras Criadas Dinamicamente (Tela 2, Tela 3, etc. conforme ordem real) */}
              {(config.telasExtras || []).map((tela, idx) => {
                const tabKey = `extra_${idx}`;
                const numTela = idx + 2;
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
                    {['cards', 'radio', 'checkbox', 'dropdown'].includes(tela.tipo || 'cards') && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                        {cardsAtivos}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Tela Acompanhantes (Opcional - se ativa aparece na sequência, ou pode ser ativada) */}
              {config.mostrarTelaAcompanhantes !== false ? (
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
                  <span>Tela {(config.telasExtras || []).length + 2} (Acomp.)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfig(prev => ({ ...prev, mostrarTelaAcompanhantes: true }));
                    setActiveTab('acompanhantes');
                  }}
                  title="Ativar tela de contagem de acompanhantes/grupo"
                  className="pb-2.5 px-2.5 text-[11px] font-bold border-b-2 border-transparent text-slate-500 hover:text-emerald-300 transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Acompanhantes</span>
                </button>
              )}

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

              {/* Botão + Inserir Tela NO FIM DE TUDO (com escolha entre Cards ou Digitação) */}
              <button
                type="button"
                onClick={() => setShowTipoNovaTelaModal(true)}
                className="mb-2 px-3 py-1.5 text-xs font-black text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ml-auto sm:ml-2 shadow-sm"
                title="Inserir mais uma tela no fluxo de perguntas"
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
                  {/* Navegação Secundária Minimalista da Tela 1 */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 self-start">
                    <button
                      type="button"
                      onClick={() => setSubTabTela1('opcoes')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela1 === 'opcoes'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>Opções de Resposta ({cardsAtivosP1.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubTabTela1('aparencia')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela1 === 'aparencia'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Aparência & Efeitos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubTabTela1('pergunta')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela1 === 'pergunta'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Título, Texto & Botão COMEÇAR</span>
                    </button>
                  </div>

                  {/* 1. TÍTULO 1, TÍTULO 2, TEXTO ABAIXO DO TÍTULO E BOTÃO COMEÇAR COM LUZES */}
                  {subTabTela1 === 'pergunta' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                          Título, Texto de Introdução & Botão COMEÇAR (Tela 1)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Aparece ao vivo no celular à direita
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 1 (1ª Linha)</label>
                          <input
                            type="text"
                            value={config.pergunta1Titulo ?? ''}
                            onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                            placeholder="Digite o título da Tela 1..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título 2 (2ª Linha - Opcional)</label>
                          <input
                            type="text"
                            value={config.pergunta1Titulo2 ?? ''}
                            onChange={(e) => setConfig({ ...config, pergunta1Titulo2: e.target.value })}
                            placeholder="Complemento do título (opcional)..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 shadow-inner"
                          />
                        </div>
                      </div>

                      {/* TEXTO PARA SER INSERIDO ABAIXO DO TÍTULO NA TELA 1 */}
                      <div>
                        <label className="text-[10px] font-bold text-emerald-300 block mb-1">
                          Texto Abaixo do Título (Boas-vindas, Instrução ou Explicação na Tela 1)
                        </label>
                        <textarea
                          rows={2}
                          value={config.pergunta1TextoAbaixo ?? ''}
                          onChange={(e) => setConfig({ ...config, pergunta1TextoAbaixo: e.target.value })}
                          placeholder="Digite aqui um texto para aparecer logo abaixo do título na Tela 1..."
                          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 shadow-inner resize-none"
                        />
                      </div>

                      {/* BOTÃO COMEÇAR NO RODAPÉ COM EFEITO DE LUZES GIRANDO SUAVE */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={config.mostrarBotaoComecar !== false}
                              onChange={(e) => {
                                setConfig({ ...config, mostrarBotaoComecar: e.target.checked });
                                setPreviewInteractiveVal(p => ({ ...p, previewStarted: false }));
                              }}
                              className="w-4 h-4 rounded accent-amber-400"
                            />
                            <span className="text-xs font-black text-amber-300">
                              ✨ Habilitar Botão "{config.pergunta1BotaoComecarTexto || 'COMEÇAR'}" (Se ativado, precisa clicar para iniciar; se desativado, começa direto nas perguntas)
                            </span>
                          </label>
                        </div>

                        {config.mostrarBotaoComecar !== false && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                              Caption / Texto Configurável do Botão
                            </label>
                            <input
                              type="text"
                              value={config.pergunta1BotaoComecarTexto ?? 'COMEÇAR'}
                              onChange={(e) => setConfig({ ...config, pergunta1BotaoComecarTexto: e.target.value })}
                              placeholder="COMEÇAR"
                              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-black text-amber-300 uppercase tracking-wider"
                            />
                          </div>
                        )}
                      </div>

                      {/* Slider de Tamanho da Fonte da Pergunta 1 */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300">Tamanho da Fonte do Título</span>
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
                      </div>
                    </div>
                  )}

                  {/* 2. CONFIGURAÇÕES VISUAIS: FUNDO, CORES DAS FONTES E DIMENSÕES DOS CARDS */}
                  {subTabTela1 === 'aparencia' && (
                    <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-4 shadow-lg animate-fade-in">
                    
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

                    {/* OPÇÕES DE EFEITOS E ACABAMENTOS (3D, VIDRO, ENTALHE, ALTO-RELEVO, ETC.) */}
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          Efeito & Acabamento do Card (3D, Vidro, Entalhe, Alto-Relevo)
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

                      {/* SLIDE: PROFUNDIDADE DO EFEITO DOS CARDS (TELA 1) */}
                      <div className="pt-1.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300">Profundidade / Intensidade do Efeito</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px]">
                            Nível {config.cardProfundidade || 5}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={config.cardProfundidade || 5}
                          onChange={(e) => setConfig({ ...config, cardProfundidade: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>1 (Sutil)</span>
                          <span>5 (Padrão)</span>
                          <span>10 (Profundidade Máxima)</span>
                        </div>
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
                  )}

                  {/* 3. LISTA REFEITA DE OPÇÕES / CARDS DA TELA 1 */}
                  {subTabTela1 === 'opcoes' && (
                  <div className="space-y-3 pt-1 animate-fade-in">
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

                    {/* Campo Rápido de Texto Abaixo do Título & Botão COMEÇAR também visíveis direto na aba principal da Tela 1 */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-amber-300 block mb-0.5">
                            Título da Tela 1
                          </label>
                          <input
                            type="text"
                            value={config.pergunta1Titulo ?? ''}
                            onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                            placeholder="Digite o título ou pergunta da Tela 1..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-emerald-300 block mb-0.5">
                            Texto Abaixo do Título (Tela 1)
                          </label>
                          <input
                            type="text"
                            value={config.pergunta1TextoAbaixo ?? ''}
                            onChange={(e) => setConfig({ ...config, pergunta1TextoAbaixo: e.target.value })}
                            placeholder="Texto complementar abaixo do título..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-900">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={config.mostrarBotaoComecar !== false}
                            onChange={(e) => {
                              setConfig({ ...config, mostrarBotaoComecar: e.target.checked });
                              setPreviewInteractiveVal(p => ({ ...p, previewStarted: false }));
                            }}
                            className="w-3.5 h-3.5 rounded accent-amber-400"
                          />
                          <span className="text-[11px] font-bold text-amber-300">
                            ✨ Exigir Clique em "{config.pergunta1BotaoComecarTexto || 'COMEÇAR'}" (Desmarcado = começa direto)
                          </span>
                        </label>
                        {config.mostrarBotaoComecar !== false && (
                          <input
                            type="text"
                            value={config.pergunta1BotaoComecarTexto ?? 'COMEÇAR'}
                            onChange={(e) => setConfig({ ...config, pergunta1BotaoComecarTexto: e.target.value })}
                            placeholder="Caption do botão..."
                            title="Editar texto (caption) do botão"
                            className="bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-lg px-2.5 py-1 text-[11px] font-black text-amber-300 w-36 text-center"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {(config.opcoesChegada || []).length === 0 && (
                        <div className="p-6 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-300">
                            Tela 1 em branco (sem opções cadastradas ainda)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Clique em <strong>"Adicionar Opção"</strong> acima, use <strong>"+ Inserir Tela"</strong> para montar Tela 2, Tela 3... ou clique em <strong>"Importar IA"</strong>.
                          </p>
                        </div>
                      )}
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

                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDividirParaNovaTelaP1(idx)}
                                    title="Mover esta opção e as próximas para uma nova Tela (Tela 2, Tela 3...)"
                                    className="px-2 py-0.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1 transition"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    <span>Daqui p/ frente → Nova Tela</span>
                                  </button>
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

                            {/* CONFIGURAÇÃO DE GAVETA CONDICIONAL NA TELA 1 (MULTI-COMPONENTE) */}
                            <div className="pt-2 border-t border-slate-850">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(opcao.temGaveta)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    handleUpdateOpcaoP1(idx, 'temGaveta', checked);
                                    if (checked) {
                                      setPreviewOpenGavetaId(opcao.id);
                                      if (!opcao.gaveta) {
                                        handleUpdateOpcaoP1(idx, 'gaveta', {
                                          tipo: 'texto_longo',
                                          pergunta: 'Por favor, detalhe sua resposta:',
                                          placeholder: 'Digite sua resposta ou pedido...',
                                          linhas: 3,
                                          sliderMin: 0,
                                          sliderMax: 10,
                                          sliderStep: 1,
                                          opcoes: ['Opção 1', 'Opção 2', 'Opção 3'],
                                          obrigatorio: false,
                                          botaoConfirmar: 'Confirmar & Avançar'
                                        });
                                      }
                                    } else if (previewOpenGavetaId === opcao.id) {
                                      setPreviewOpenGavetaId(null);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                                />
                                <span className={`text-xs font-bold ${opcao.temGaveta ? 'text-amber-300' : 'text-slate-400'}`}>
                                  🗄️ Abrir Gaveta ao Selecionar (Subpergunta: Texto, Radio Button, Checkbox, Slide, Data/Hora)
                                </span>
                              </label>

                              {opcao.temGaveta && (
                                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2.5 animate-fade-in">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-amber-300 block mb-1">
                                        Tipo de Componente dentro da Gaveta
                                      </label>
                                      <select
                                        value={opcao.gaveta?.tipo || 'texto_longo'}
                                        onChange={(e) => {
                                          setPreviewOpenGavetaId(opcao.id);
                                          handleUpdateOpcaoP1(idx, 'gaveta', {
                                            ...(opcao.gaveta || {}),
                                            tipo: e.target.value,
                                            opcoes: Array.isArray(opcao.gaveta?.opcoes) && opcao.gaveta.opcoes.length > 0
                                              ? opcao.gaveta.opcoes
                                              : ['Opção 1', 'Opção 2', 'Opção 3']
                                          });
                                        }}
                                        className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-200"
                                      >
                                        {TIPOS_GAVETA.map(tg => (
                                          <option key={tg.id} value={tg.id}>{tg.label}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-[10px] font-bold text-amber-300 block mb-1">
                                        Pergunta ou Instrução da Gaveta
                                      </label>
                                      <input
                                        type="text"
                                        value={opcao.gaveta?.pergunta || ''}
                                        onChange={(e) => {
                                          setPreviewOpenGavetaId(opcao.id);
                                          handleUpdateOpcaoP1(idx, 'gaveta', {
                                            ...(opcao.gaveta || {}),
                                            pergunta: e.target.value
                                          });
                                        }}
                                        placeholder="Ex: Qual tipo de ajuda você precisa?"
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white"
                                      />
                                    </div>
                                  </div>

                                  {/* Opções da Gaveta se for Radio ou Checkbox */}
                                  {(opcao.gaveta?.tipo === 'radio' || opcao.gaveta?.tipo === 'checkbox') && (
                                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-sky-300 uppercase">
                                          Opções da Gaveta ({opcao.gaveta?.tipo === 'radio' ? 'Radio Button' : 'Checkbox'})
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewOpenGavetaId(opcao.id);
                                            const atuais = Array.isArray(opcao.gaveta?.opcoes) ? opcao.gaveta.opcoes : [];
                                            handleUpdateOpcaoP1(idx, 'gaveta', {
                                              ...(opcao.gaveta || {}),
                                              opcoes: [...atuais, `Opção ${atuais.length + 1}`]
                                            });
                                          }}
                                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> Adicionar
                                        </button>
                                      </div>
                                      <div className="space-y-1.5">
                                        {(opcao.gaveta?.opcoes || ['Opção 1', 'Opção 2']).map((gOpt, gIdx) => (
                                          <div key={gIdx} className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              value={gOpt}
                                              onChange={(e) => {
                                                setPreviewOpenGavetaId(opcao.id);
                                                const novas = [...(opcao.gaveta?.opcoes || [])];
                                                novas[gIdx] = e.target.value;
                                                handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), opcoes: novas });
                                              }}
                                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const novas = (opcao.gaveta?.opcoes || []).filter((_, i) => i !== gIdx);
                                                handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), opcoes: novas.length ? novas : ['Opção 1'] });
                                              }}
                                              className="p-1 text-slate-500 hover:text-rose-400"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Configuração de Slide dentro da Gaveta */}
                                  {opcao.gaveta?.tipo === 'slider' && (
                                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                                      <div>
                                        <label className="text-[10px] text-slate-400 block">Mínimo</label>
                                        <input
                                          type="number"
                                          value={opcao.gaveta?.sliderMin ?? 0}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), sliderMin: Number(e.target.value) })}
                                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block">Máximo</label>
                                        <input
                                          type="number"
                                          value={opcao.gaveta?.sliderMax ?? 10}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), sliderMax: Number(e.target.value) })}
                                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block">Unidade</label>
                                        <input
                                          type="text"
                                          value={opcao.gaveta?.sliderUnidade || ''}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), sliderUnidade: e.target.value })}
                                          placeholder="Ex: pts, %"
                                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(opcao.gaveta?.tipo === 'texto_longo' || opcao.gaveta?.tipo === 'texto_curto' || !opcao.gaveta?.tipo || opcao.gaveta?.tipo === 'texto') && (
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                          Placeholder da Caixa de Texto
                                        </label>
                                        <input
                                          type="text"
                                          value={opcao.gaveta?.placeholder || ''}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', {
                                            ...(opcao.gaveta || {}),
                                            placeholder: e.target.value
                                          })}
                                          placeholder="Ex: Digite seu pedido..."
                                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                        Texto do Botão da Gaveta
                                      </label>
                                      <input
                                        type="text"
                                        value={opcao.gaveta?.botaoConfirmar || ''}
                                        onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', {
                                          ...(opcao.gaveta || {}),
                                          botaoConfirmar: e.target.value
                                        })}
                                        placeholder="Confirmar & Avançar"
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  )}

                </div>
              )}

              {/* ====================================================== */}
              {/* ABAS DINÂMICAS: TELAS EXTRAS (TELA 2, TELA 3, ETC.)     */}
              {/* ====================================================== */}
              {activeTab.startsWith('extra_') && (() => {
                const extraIndex = parseInt(activeTab.split('_')[1], 10);
                const telaAlvo = (config.telasExtras || [])[extraIndex];
                if (!telaAlvo) return null;

                const numTela = extraIndex + 2;
                const cardsAtivos = (telaAlvo.opcoes || []).filter(o => o.ativo !== false);
                const limitCards = Number(telaAlvo.cardsPorTela) || 4;

                return (
                  <div className="space-y-4">
                    {/* Barra Superior da Tela Extra */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-400">
                          Configurando Tela {numTela}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                          ✓ Ativa no Celular
                        </span>
                      </div>

                      {/* Seletor Completo de Tipo da Tela Extra (10 Tipos Mundiais) */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Tipo:</span>
                        <select
                          value={telaAlvo.tipo || 'cards'}
                          onChange={(e) => {
                            const novoTipo = e.target.value;
                            handleUpdateTelaProp(extraIndex, 'tipo', novoTipo);
                            if (['cards', 'radio', 'checkbox', 'dropdown'].includes(novoTipo) && (!telaAlvo.opcoes || telaAlvo.opcoes.length === 0)) {
                              handleUpdateTelaProp(extraIndex, 'opcoes', [
                                { id: `opt_${Date.now()}_1`, titulo: 'Opção 1', ativo: true, icone: 'Sparkles', cor: 'emerald' },
                                { id: `opt_${Date.now()}_2`, titulo: 'Opção 2', ativo: true, icone: 'Star', cor: 'amber' }
                              ]);
                            }
                          }}
                          className="bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-black text-amber-300"
                        >
                          {TIPOS_PERGUNTA.map(tp => (
                            <option key={tp.id} value={tp.id}>{tp.label}</option>
                          ))}
                        </select>
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
                    </div>

                    {/* CONFIGURAÇÃO ESPECÍFICA CONFORME O TIPO DA TELA EXTRA */}
                    {['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating'].includes(telaAlvo.tipo) ? (
                      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-3.5 shadow-lg animate-fade-in">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                          <AlignLeft className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                            {TIPOS_PERGUNTA.find(t => t.id === telaAlvo.tipo)?.label || 'Configurações do Campo'}
                          </span>
                        </div>

                        {telaAlvo.tipo === 'slider' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">Valor Mínimo</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderMin ?? 0}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderMin', Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">Valor Máximo</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderMax ?? 10}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderMax', Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">Passo (Step)</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderStep ?? 1}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderStep', Number(e.target.value) || 1)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">Sufixo/Unidade</label>
                              <input
                                type="text"
                                value={telaAlvo.sliderUnidade || ''}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderUnidade', e.target.value)}
                                placeholder="Ex: pts, %"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(telaAlvo.tipo === 'texto' || telaAlvo.tipo === 'texto_curto') && (
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                Placeholder da Caixa (Texto de Dica)
                              </label>
                              <input
                                type="text"
                                value={telaAlvo.placeholder || ''}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'placeholder', e.target.value)}
                                placeholder={telaAlvo.tipo === 'texto_curto' ? 'Ex: Digite seu nome ou WhatsApp...' : 'Ex: Digite sua sugestão ou comentário...'}
                                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">
                              Texto do Botão de Avançar
                            </label>
                            <input
                              type="text"
                              value={telaAlvo.botaoTexto || ''}
                              onChange={(e) => handleUpdateTelaProp(extraIndex, 'botaoTexto', e.target.value)}
                              placeholder="Avançar"
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-850">
                          {telaAlvo.tipo === 'texto' && (
                            <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-300 font-bold">Altura (Linhas):</span>
                              <div className="flex items-center gap-1">
                                {[2, 3, 4, 5, 6].map((l) => (
                                  <button
                                    key={l}
                                    type="button"
                                    onClick={() => handleUpdateTelaProp(extraIndex, 'linhas', l)}
                                    className={`w-6 h-6 rounded-lg font-bold text-xs ${
                                      (telaAlvo.linhas || 4) === l ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-300 font-bold">Obrigatoriedade:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateTelaProp(extraIndex, 'obrigatorio', !telaAlvo.obrigatorio)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                telaAlvo.obrigatorio
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {telaAlvo.obrigatorio ? 'Obrigatório' : 'Opcional'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* CONFIGURAÇÃO ESPECÍFICA: CARDS, RADIO BUTTON, CHECKBOX OU LISTA SUSPENSA (COM GAVETAS) */
                      <div className="space-y-3">
                        {telaAlvo.tipo === 'cards' && (
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
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
                        )}

                        {/* Opções desta Tela Extra */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                              Opções Cadastradas ({telaAlvo.opcoes?.length || 0}) — {TIPOS_PERGUNTA.find(t => t.id === telaAlvo.tipo)?.short || 'Opções'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAddCardExtra(extraIndex)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar Opção</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(telaAlvo.opcoes || []).map((opcao, optIdx) => {
                              const isAtivo = opcao.ativo !== false;

                              return (
                                <div
                                  key={opcao.id || optIdx}
                                  className={`rounded-xl border transition-all p-3 space-y-2.5 ${
                                    isAtivo 
                                      ? 'bg-slate-950 border-slate-800 shadow-sm' 
                                      : 'bg-slate-950/40 border-slate-900 opacity-55'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
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

                                      {optIdx > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDividirParaNovaTelaExtra(extraIndex, optIdx)}
                                          title="Mover esta opção e as próximas para uma nova Tela"
                                          className="px-2 py-0.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1 transition"
                                        >
                                          <ArrowRight className="w-3 h-3" />
                                          <span>Daqui p/ frente → Tela {numTela + 1}</span>
                                        </button>
                                      )}
                                    </div>

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
                                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Título da Opção</label>
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
                                        placeholder="Ex: Detalhe complementar"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-inner"
                                      />
                                    </div>
                                  </div>

                                  {/* CONFIGURAÇÃO DE GAVETA CONDICIONAL MULTI-COMPONENTE NA OPÇÃO EXTRA */}
                                  <div className="pt-1.5 border-t border-slate-850">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(opcao.temGaveta)}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          handleUpdateCardExtra(extraIndex, optIdx, 'temGaveta', checked);
                                          if (checked) {
                                            setPreviewOpenGavetaId(opcao.id);
                                            if (!opcao.gaveta) {
                                              handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                tipo: 'texto_longo',
                                                pergunta: 'Por favor, detalhe sua resposta:',
                                                placeholder: 'Digite sua resposta ou observação...',
                                                linhas: 3,
                                                sliderMin: 0,
                                                sliderMax: 10,
                                                sliderStep: 1,
                                                opcoes: ['Opção 1', 'Opção 2', 'Opção 3'],
                                                obrigatorio: false,
                                                botaoConfirmar: 'Confirmar & Avançar'
                                              });
                                            }
                                          } else if (previewOpenGavetaId === opcao.id) {
                                            setPreviewOpenGavetaId(null);
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                                      />
                                      <span className={`text-[11px] font-bold ${opcao.temGaveta ? 'text-amber-300' : 'text-slate-400'}`}>
                                        🗄️ Abrir Gaveta ao Selecionar (Texto, Radio, Checkbox, Slide, Data/Hora)
                                      </span>
                                    </label>

                                    {opcao.temGaveta && (
                                      <div className="mt-2 p-2.5 rounded-lg bg-slate-900/95 border border-amber-500/30 space-y-2 animate-fade-in">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-[10px] font-bold text-amber-300 block mb-0.5">
                                              Tipo da Gaveta
                                            </label>
                                            <select
                                              value={opcao.gaveta?.tipo || 'texto_longo'}
                                              onChange={(e) => {
                                                setPreviewOpenGavetaId(opcao.id);
                                                handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                  ...(opcao.gaveta || {}),
                                                  tipo: e.target.value,
                                                  opcoes: Array.isArray(opcao.gaveta?.opcoes) && opcao.gaveta.opcoes.length > 0
                                                    ? opcao.gaveta.opcoes
                                                    : ['Opção 1', 'Opção 2', 'Opção 3']
                                                });
                                              }}
                                              className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-bold text-amber-200"
                                            >
                                              {TIPOS_GAVETA.map(tg => (
                                                <option key={tg.id} value={tg.id}>{tg.label}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold text-amber-300 block mb-0.5">
                                              Pergunta da Gaveta
                                            </label>
                                            <input
                                              type="text"
                                              value={opcao.gaveta?.pergunta || ''}
                                              onChange={(e) => {
                                                setPreviewOpenGavetaId(opcao.id);
                                                handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                  ...(opcao.gaveta || {}),
                                                  pergunta: e.target.value
                                                });
                                              }}
                                              placeholder="Ex: Qual o tipo de ajuda ou sugestão?"
                                              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-xs text-white"
                                            />
                                          </div>
                                        </div>

                                        {(opcao.gaveta?.tipo === 'radio' || opcao.gaveta?.tipo === 'checkbox') && (
                                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-sky-300 uppercase">Opções da Gaveta</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setPreviewOpenGavetaId(opcao.id);
                                                  const atuais = Array.isArray(opcao.gaveta?.opcoes) ? opcao.gaveta.opcoes : [];
                                                  handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                    ...(opcao.gaveta || {}),
                                                    opcoes: [...atuais, `Opção ${atuais.length + 1}`]
                                                  });
                                                }}
                                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                                              >
                                                + Opção
                                              </button>
                                            </div>
                                            {(opcao.gaveta?.opcoes || ['Opção 1', 'Opção 2']).map((gOpt, gIdx) => (
                                              <div key={gIdx} className="flex items-center gap-1.5">
                                                <input
                                                  type="text"
                                                  value={gOpt}
                                                  onChange={(e) => {
                                                    const novas = [...(opcao.gaveta?.opcoes || [])];
                                                    novas[gIdx] = e.target.value;
                                                    handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', { ...(opcao.gaveta || {}), opcoes: novas });
                                                  }}
                                                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const novas = (opcao.gaveta?.opcoes || []).filter((_, i) => i !== gIdx);
                                                    handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', { ...(opcao.gaveta || {}), opcoes: novas.length ? novas : ['Opção 1'] });
                                                  }}
                                                  className="p-1 text-slate-500 hover:text-rose-400"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {(opcao.gaveta?.tipo === 'texto_longo' || opcao.gaveta?.tipo === 'texto_curto' || !opcao.gaveta?.tipo || opcao.gaveta?.tipo === 'texto') && (
                                            <div>
                                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                                                Placeholder
                                              </label>
                                              <input
                                                type="text"
                                                value={opcao.gaveta?.placeholder || ''}
                                                onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                  ...(opcao.gaveta || {}),
                                                  placeholder: e.target.value
                                                })}
                                                placeholder="Digite aqui..."
                                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-xs text-slate-200"
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                                              Texto do Botão
                                            </label>
                                            <input
                                              type="text"
                                              value={opcao.gaveta?.botaoConfirmar || ''}
                                              onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'gaveta', {
                                                ...(opcao.gaveta || {}),
                                                botaoConfirmar: e.target.value
                                              })}
                                              placeholder="Confirmar & Avançar"
                                              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
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
              {/* ABA: TELA DE ACOMPANHANTES (OPCIONAL)                  */}
              {/* ====================================================== */}
              {activeTab === 'acompanhantes' && (
                <div className="space-y-4">
                  {/* Barra Superior com botão de Desativar/Ocultar esta tela caso o admin não queira no fluxo */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white">
                        Tela de Contagem de Acompanhantes / Grupo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig(prev => ({ ...prev, mostrarTelaAcompanhantes: false }));
                        setActiveTab('tela_1');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 transition"
                      title="Remover tela de acompanhantes deste evento"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar Tela de Acompanhantes</span>
                    </button>
                  </div>

                  {/* Navegação Secundária Minimalista da Tela 2 */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 self-start">
                    <button
                      type="button"
                      onClick={() => setSubTabTela2('botoes')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela2 === 'botoes'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Botões Numéricos (2 a 10)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubTabTela2('pergunta')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela2 === 'pergunta'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Título da Pergunta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubTabTela2('individual')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        subTabTela2 === 'individual'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Botão "Só Eu" (1 Pessoa)</span>
                    </button>
                  </div>

                  {/* 1. TÍTULO DA PERGUNTA TELA 2 */}
                  {subTabTela2 === 'pergunta' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-sm animate-fade-in">
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
                  )}

                  {/* 2. DESIGN & ESTILO DOS BOTÕES NUMÉRICOS (TELA 2) */}
                  {subTabTela2 === 'botoes' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm animate-fade-in">
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

                    {/* 3. EFEITO DOS BOTÕES NUMÉRICOS (3D, VIDRO, ENTALHE, ALTO-RELEVO, ETC.) */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Efeito & Acabamento dos Botões
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {EFEITOS_CARDS.find(e => e.id === (config.btnQtdEfeito || 'efeito_3d'))?.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {EFEITOS_CARDS.map((ef) => {
                          const isSel = (config.btnQtdEfeito || 'efeito_3d') === ef.id;
                          return (
                            <button
                              key={ef.id}
                              type="button"
                              onClick={() => setConfig({ ...config, btnQtdEfeito: ef.id })}
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

                      {/* SLIDE: PROFUNDIDADE DOS BOTÕES (TELA 2) */}
                      <div className="pt-1.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300">Profundidade / Relevo do Botão</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px]">
                            Nível {config.btnQtdProfundidade || 5}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={config.btnQtdProfundidade || 5}
                          onChange={(e) => setConfig({ ...config, btnQtdProfundidade: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>1 (Sutil)</span>
                          <span>5 (Padrão)</span>
                          <span>10 (Profundidade Máxima)</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. SLIDE: TAMANHO DO NÚMERO DENTRO DO BOTÃO */}
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
                  )}

                  {/* 3. BOTÃO INDIVIDUAL E DIVISOR */}
                  {subTabTela2 === 'individual' && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 shadow-sm">
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

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-sm">
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
              )}

            </div>
          </div>

          {/* ========================================================== */}
          {/* COLUNA DIREITA: PREVIEW DOS CELULARES (GRID 3 EM 3 COMPACTO) */}
          {/* ========================================================== */}
          <div className="lg:col-span-6 bg-slate-950/90 flex flex-col min-h-0 p-2 sm:p-3 relative overflow-y-auto custom-scrollbar">
            
            {/* GRID DOS CELULARES: 3 POR LINHA COM ESPAÇAMENTO 70% REDUZIDO */}
            <div className="w-full max-w-[800px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pb-6 place-items-center mt-1">
              {/* 1. TELA INÍCIO */}
              {(() => {
                const isSelected = activeTab === 'inicio';
                return (
                  <div
                    key="prev_inicio"
                    onClick={() => setActiveTab('inicio')}
                    className="flex justify-center items-center cursor-pointer p-0.5"
                    style={{ zoom: 0.8 }}
                  >
                    <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.55)] scale-[1.03]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-2xl opacity-80 hover:opacity-100'
                    }`}>
                      <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                        <span className="font-mono font-bold text-[10px]">19:30</span>
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

                      <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
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
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. TELA 1 (PERGUNTAS / CARDS) */}
              {(() => {
                const isSelected = activeTab === 'tela_1';
                return (
                  <div
                    key="prev_tela_1"
                    onClick={() => setActiveTab('tela_1')}
                    className="flex justify-center items-center cursor-pointer p-0.5"
                    style={{ zoom: 0.8 }}
                  >
                    <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.55)] scale-[1.03]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-2xl opacity-80 hover:opacity-100'
                    }`}>
                      <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                        <span className="font-mono font-bold text-[10px]">19:30</span>
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

                      <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
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
                              {(config.pergunta1Titulo || config.pergunta1Titulo2) ? (
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
                                    config.pergunta1Titulo
                                  )}
                                </h3>
                              ) : (
                                <h3 className="text-xs font-bold text-slate-500 italic">
                                  (Sem título na Tela 1)
                                </h3>
                              )}

                              {config.pergunta1TextoAbaixo && (
                                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line bg-slate-900/60 border border-slate-800/80 rounded-xl p-2">
                                  {config.pergunta1TextoAbaixo}
                                </p>
                              )}
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
                                      onClick={(e) => { e.stopPropagation(); setPreviewPage(i); }}
                                      className={`h-1.5 rounded-full transition-all ${
                                        safePreviewPageP1 === i ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {config.mostrarBotaoComecar !== false && !previewInteractiveVal.previewStarted ? (
                            <div className="flex-1 flex flex-col justify-end py-3 space-y-3">
                              <div className="my-auto px-3 py-4 rounded-2xl bg-slate-900/40 border border-slate-800/70 text-[10px] text-slate-400">
                                🔒 O botão <strong>"{config.pergunta1BotaoComecarTexto || 'COMEÇAR'}"</strong> está habilitado.
                              </div>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cardsAtivosP1.length > 0) {
                                    setPreviewInteractiveVal(p => ({ ...p, previewStarted: true }));
                                  } else if ((config.telasExtras || []).length > 0) {
                                    setActiveTab('extra_0');
                                  } else if (config.mostrarTelaAcompanhantes !== false) {
                                    setActiveTab('acompanhantes');
                                  } else {
                                    setActiveTab('fim');
                                  }
                                }}
                                className="relative p-[2px] rounded-2xl overflow-hidden shadow-lg shadow-amber-500/20 group cursor-pointer active:scale-95 transition"
                              >
                                <div
                                  className="absolute inset-[-150%] animate-spin"
                                  style={{
                                    animationDuration: '4s',
                                    background: 'conic-gradient(from 0deg, transparent 0%, #f59e0b 25%, #10b981 50%, #38bdf8 75%, transparent 100%)'
                                  }}
                                />
                                <div className="relative w-full py-3 px-4 rounded-[14px] bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>{config.pergunta1BotaoComecarTexto || 'COMEÇAR'}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {config.mostrarBotaoComecar !== false && previewInteractiveVal.previewStarted && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setPreviewInteractiveVal(p => ({ ...p, previewStarted: false })); }}
                                    className="text-[9px] text-amber-300 hover:underline flex items-center gap-1"
                                  >
                                    <ChevronLeft className="w-2.5 h-2.5" /> Voltar para capa
                                  </button>
                                </div>
                              )}

                              <div className="flex-1 my-auto space-y-2 py-1">
                                {cardsNaPaginaAtualP1.length === 0 ? (
                                  <div className="py-8 text-center text-xs text-slate-500">
                                    Nenhum card ativo nesta tela.
                                  </div>
                                ) : (
                                  cardsNaPaginaAtualP1.map((opcao) => {
                                    const IconComp = getIconComponent(opcao.icone);
                                    const corCls = getCorBadge(opcao.cor);
                                    const isGavetaOpen = Boolean(opcao.temGaveta && previewOpenGavetaId === opcao.id);

                                    return (
                                      <div key={opcao.id} className="space-y-1.5">
                                        <div
                                          onClick={(e) => {
                                            if (opcao.temGaveta) {
                                              e.stopPropagation();
                                              setPreviewOpenGavetaId(isGavetaOpen ? null : opcao.id);
                                            }
                                          }}
                                          style={{ 
                                            minHeight: `${config.cardAltura || 82}px`,
                                            ...getEfeitoStyle(config.cardEfeitoEstilo, config.cardProfundidade)
                                          }}
                                          className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${getCardFundoClass(config.cardFundoEstilo)} ${
                                            isGavetaOpen ? 'ring-1 ring-amber-400 border-amber-400/70' : ''
                                          }`}
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
                                            {opcao.temGaveta ? (
                                              <ChevronDown className={`w-3 h-3 transition-transform ${isGavetaOpen ? 'rotate-180 text-amber-400' : ''}`} />
                                            ) : (
                                              <ChevronRight className="w-3 h-3" />
                                            )}
                                          </div>
                                        </div>

                                        {isGavetaOpen && (
                                          <div className="p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/50 text-left space-y-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                                            <span className="text-[10px] font-black text-amber-300 block">
                                              🗄️ {opcao.gaveta?.pergunta || 'Por favor, detalhe sua resposta:'}
                                            </span>

                                            {opcao.gaveta?.tipo === 'radio' ? (
                                              <div className="space-y-1">
                                                {(opcao.gaveta?.opcoes || ['Opção 1', 'Opção 2']).map((gOpt, gi) => (
                                                  <label key={gi} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-200 cursor-pointer">
                                                    <input type="radio" name={`prev_gav_${opcao.id}`} defaultChecked={gi === 0} className="accent-amber-400" />
                                                    <span>{gOpt}</span>
                                                  </label>
                                                ))}
                                              </div>
                                            ) : opcao.gaveta?.tipo === 'checkbox' ? (
                                              <div className="space-y-1">
                                                {(opcao.gaveta?.opcoes || ['Opção 1', 'Opção 2']).map((gOpt, gi) => (
                                                  <label key={gi} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-200 cursor-pointer">
                                                    <input type="checkbox" defaultChecked={gi === 0} className="accent-amber-400 rounded" />
                                                    <span>{gOpt}</span>
                                                  </label>
                                                ))}
                                              </div>
                                            ) : opcao.gaveta?.tipo === 'slider' ? (
                                              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold text-amber-300">
                                                  <span>Valor:</span>
                                                  <span>{previewInteractiveVal[`gav_${opcao.id}`] ?? opcao.gaveta?.sliderMax ?? 10}{opcao.gaveta?.sliderUnidade || ''}</span>
                                                </div>
                                                <input
                                                  type="range"
                                                  min={opcao.gaveta?.sliderMin ?? 0}
                                                  max={opcao.gaveta?.sliderMax ?? 10}
                                                  step={opcao.gaveta?.sliderStep ?? 1}
                                                  value={previewInteractiveVal[`gav_${opcao.id}`] ?? opcao.gaveta?.sliderMax ?? 10}
                                                  onChange={(e) => setPreviewInteractiveVal(p => ({ ...p, [`gav_${opcao.id}`]: e.target.value }))}
                                                  className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400"
                                                />
                                              </div>
                                            ) : opcao.gaveta?.tipo === 'data' ? (
                                              <input type="date" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-white" />
                                            ) : opcao.gaveta?.tipo === 'hora' ? (
                                              <input type="time" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-white" />
                                            ) : opcao.gaveta?.tipo === 'texto_curto' ? (
                                              <input
                                                type="text"
                                                placeholder={opcao.gaveta?.placeholder || 'Digite aqui...'}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-white"
                                              />
                                            ) : (
                                              <textarea
                                                rows={2}
                                                placeholder={opcao.gaveta?.placeholder || 'Digite sua resposta...'}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-[10px] text-white resize-none"
                                              />
                                            )}

                                            <div className="text-right">
                                              <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[9px]">
                                                {opcao.gaveta?.botaoConfirmar || 'Confirmar & Avançar'} →
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {totalPaginasPreviewP1 > 1 && (
                                <div className="shrink-0 flex items-center justify-between pt-1 border-t border-slate-800/80">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setPreviewPage(Math.max(0, safePreviewPageP1 - 1)); }}
                                    disabled={safePreviewPageP1 === 0}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                    <span>Anterior</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setPreviewPage(Math.min(totalPaginasPreviewP1 - 1, safePreviewPageP1 + 1)); }}
                                    disabled={safePreviewPageP1 >= totalPaginasPreviewP1 - 1}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                                  >
                                    <span>Ver mais</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. TELAS EXTRAS */}
              {(config.telasExtras || []).map((telaExtra, extraIdx) => {
                const tabKey = `extra_${extraIdx}`;
                const isSelected = activeTab === tabKey;
                const numTela = extraIdx + 3;
                const cardsAtivos = (telaExtra.opcoes || []).filter(o => o.ativo !== false);

                return (
                  <div
                    key={`prev_${tabKey}`}
                    onClick={() => setActiveTab(tabKey)}
                    className="flex justify-center items-center cursor-pointer p-0.5"
                    style={{ zoom: 0.8 }}
                  >
                    <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.55)] scale-[1.03]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-2xl opacity-80 hover:opacity-100'
                    }`}>
                      <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                        <span className="font-mono font-bold text-[10px]">19:30</span>
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

                      <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
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

                          <div className="flex-1 my-auto space-y-2 py-1 text-left">
                            {telaExtra.tipo === 'texto' ? (
                              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5" onClick={e => e.stopPropagation()}>
                                <textarea
                                  rows={telaExtra.linhas || 4}
                                  placeholder={telaExtra.placeholder || 'Digite sua resposta aqui...'}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 resize-none"
                                />
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'texto_curto' ? (
                              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5" onClick={e => e.stopPropagation()}>
                                <input
                                  type="text"
                                  placeholder={telaExtra.placeholder || 'Digite sua resposta curta...'}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500"
                                />
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'slider' ? (
                              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-center" onClick={e => e.stopPropagation()}>
                                <div className="text-3xl font-black text-amber-400">
                                  {previewInteractiveVal[`extra_sl_${extraIdx}`] ?? Math.round(((telaExtra.sliderMin ?? 0) + (telaExtra.sliderMax ?? 10)) / 2)}{telaExtra.sliderUnidade || ''}
                                </div>
                                <input
                                  type="range"
                                  min={telaExtra.sliderMin ?? 0}
                                  max={telaExtra.sliderMax ?? 10}
                                  step={telaExtra.sliderStep ?? 1}
                                  value={previewInteractiveVal[`extra_sl_${extraIdx}`] ?? Math.round(((telaExtra.sliderMin ?? 0) + (telaExtra.sliderMax ?? 10)) / 2)}
                                  onChange={(e) => setPreviewInteractiveVal(p => ({ ...p, [`extra_sl_${extraIdx}`]: e.target.value }))}
                                  className="w-full h-2 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                  <span>{telaExtra.sliderMin ?? 0}</span>
                                  <span>{telaExtra.sliderMax ?? 10}</span>
                                </div>
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'rating' ? (
                              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-center" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2 py-2">
                                  {[1, 2, 3, 4, 5].map((st) => {
                                    const cur = previewInteractiveVal[`extra_rt_${extraIdx}`] ?? 5;
                                    return (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => setPreviewInteractiveVal(p => ({ ...p, [`extra_rt_${extraIdx}`]: st }))}
                                        className="p-1 transition hover:scale-110"
                                      >
                                        <Star className={`w-7 h-7 ${st <= cur ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'data' ? (
                              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3" onClick={e => e.stopPropagation()}>
                                <input
                                  type="date"
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                                />
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'hora' ? (
                              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3" onClick={e => e.stopPropagation()}>
                                <input
                                  type="time"
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                                />
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'dropdown' ? (
                              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3" onClick={e => e.stopPropagation()}>
                                <select className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white">
                                  <option value="">Selecione uma opção...</option>
                                  {cardsAtivos.map((opt) => (
                                    <option key={opt.id} value={opt.titulo}>{opt.titulo}</option>
                                  ))}
                                </select>
                                <div className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : telaExtra.tipo === 'radio' || telaExtra.tipo === 'checkbox' ? (
                              <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                {cardsAtivos.map((opt, oi) => (
                                  <label
                                    key={opt.id || oi}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 cursor-pointer"
                                  >
                                    <input
                                      type={telaExtra.tipo === 'radio' ? 'radio' : 'checkbox'}
                                      name={`prev_extra_${extraIdx}`}
                                      defaultChecked={oi === 0}
                                      className="w-4 h-4 accent-amber-400"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <span className="text-xs font-bold text-white block truncate">{opt.titulo}</span>
                                      {opt.subtitulo && <span className="text-[10px] text-slate-400 block truncate">{opt.subtitulo}</span>}
                                    </div>
                                  </label>
                                ))}
                                <div className="w-full py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow mt-2">
                                  {telaExtra.botaoTexto || 'Avançar'} →
                                </div>
                              </div>
                            ) : cardsAtivos.length === 0 ? (
                              <div className="py-8 text-center text-xs text-slate-500">
                                Nenhum card ativo nesta tela.
                              </div>
                            ) : (
                              cardsAtivos.map((opt) => {
                                const IconComp = getIconComponent(opt.icone);
                                const corCls = getCorBadge(opt.cor);
                                const isGavetaOpen = Boolean(opt.temGaveta && previewOpenGavetaId === opt.id);

                                return (
                                  <div key={opt.id} className="space-y-1.5">
                                    <div
                                      onClick={(e) => {
                                        if (opt.temGaveta) {
                                          e.stopPropagation();
                                          setPreviewOpenGavetaId(isGavetaOpen ? null : opt.id);
                                        }
                                      }}
                                      style={{ 
                                        minHeight: `${config.cardAltura || 82}px`,
                                        ...getEfeitoStyle(config.cardEfeitoEstilo, config.cardProfundidade)
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${getCardFundoClass(config.cardFundoEstilo)}`}
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
                                        {opt.temGaveta ? (
                                          <ChevronDown className={`w-3 h-3 transition-transform ${isGavetaOpen ? 'rotate-180 text-amber-400' : ''}`} />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </div>
                                    </div>

                                    {isGavetaOpen && (
                                      <div className="p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/50 text-left space-y-2" onClick={e => e.stopPropagation()}>
                                        <span className="text-[10px] font-black text-amber-300 block">
                                          🗄️ {opt.gaveta?.pergunta || 'Por favor, detalhe sua resposta:'}
                                        </span>
                                        {opt.gaveta?.tipo === 'radio' || opt.gaveta?.tipo === 'checkbox' ? (
                                          <div className="space-y-1">
                                            {(opt.gaveta?.opcoes || ['Opção 1', 'Opção 2']).map((gOpt, gi) => (
                                              <label key={gi} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-200">
                                                <input type={opt.gaveta?.tipo === 'radio' ? 'radio' : 'checkbox'} defaultChecked={gi === 0} className="accent-amber-400" />
                                                <span>{gOpt}</span>
                                              </label>
                                            ))}
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            placeholder={opt.gaveta?.placeholder || 'Digite aqui...'}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-white"
                                          />
                                        )}
                                      </div>
                                    )}
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
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 4. TELA ACOMPANHANTES (SE ATIVA) */}
              {config.mostrarTelaAcompanhantes !== false && (() => {
                const isSelected = activeTab === 'acompanhantes';
                return (
                  <div
                    key="prev_acompanhantes"
                    onClick={() => setActiveTab('acompanhantes')}
                    className="flex justify-center items-center cursor-pointer p-0.5"
                    style={{ zoom: 0.8 }}
                  >
                    <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.55)] scale-[1.03]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-2xl opacity-80 hover:opacity-100'
                    }`}>
                      <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                        <span className="font-mono font-bold text-[10px]">19:30</span>
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

                      <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
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
                                    style={{ 
                                      minHeight: `${simBtnHeight}px`,
                                      ...getEfeitoStyle(config.btnQtdEfeito || 'efeito_3d', Math.max(1, Math.round((config.btnQtdProfundidade || 5) * 0.7)))
                                    }}
                                    className={`py-1 px-1 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${btnCorCls}`}
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
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. TELA FIM (AGRADECIMENTO / STATUS) */}
              {(() => {
                const isSelected = activeTab === 'fim';
                return (
                  <div
                    key="prev_fim"
                    onClick={() => setActiveTab('fim')}
                    className="flex justify-center items-center cursor-pointer p-0.5"
                    style={{ zoom: 0.8 }}
                  >
                    <div className={`relative ${modeloAtual.largura} ${modeloAtual.moldura} bg-slate-950 overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.55)] scale-[1.03]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] shadow-2xl opacity-80 hover:opacity-100'
                    }`}>
                      <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0 relative">
                        <span className="font-mono font-bold text-[10px]">19:30</span>
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

                      <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
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
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <p className="text-[10px] text-slate-500 mt-auto py-2 font-medium text-center shrink-0">
              {modeloAtual.nome} • Simulação interativa ao vivo de todas as telas (reduzido em 20%)
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
            {!inline && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                className="px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-750 transition"
              >
                Cancelar
              </button>
            )}

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

        {/* ============================================================ */}
        {/* MODAL 1: ESCOLHER TIPO DA NOVA TELA (+ INSERIR TELA)         */}
        {/* ============================================================ */}
        {showTipoNovaTelaModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-2xl w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Inserir Nova Tela</h3>
                    <p className="text-[11px] text-slate-400">Qual o tipo de pergunta deseja adicionar?</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTipoNovaTelaModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                {TIPOS_PERGUNTA.map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => handleAdicionarTela(tp.id)}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/80 hover:bg-slate-900 text-left transition group space-y-1 shadow-sm"
                  >
                    <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                      {tp.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {tp.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-1 text-right">
                <button
                  type="button"
                  onClick={() => setShowTipoNovaTelaModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: MODELOS PRONTOS DE PESQUISAS (PRESETS)              */}
        {/* ============================================================ */}
        {showPresetsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Modelos Prontos de Pesquisa</h3>
                    <p className="text-xs text-slate-400">Selecione um preset para carregar um fluxo completo pré-configurado com 1 toque</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPresetsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                {PRESETS_PESQUISAS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/15 border border-sky-500/30 text-sky-300">
                          {preset.tag}
                        </span>
                        <h4 className="text-sm font-black text-white group-hover:text-sky-300 transition-colors">
                          {preset.nome}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {preset.descricao}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAplicarPreset(preset.id)}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Modelo</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-right">
                <button
                  type="button"
                  onClick={() => setShowPresetsModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: IMPORTADOR INTELIGENTE (WORD .DOCX / FORMS / TEXTO)  */}
        {/* ============================================================ */}
        {showImportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Importador Inteligente de Avaliações</h3>
                    <p className="text-xs text-slate-400">Importe arquivos Word (.docx) ou cole perguntas do Google Forms/Docs</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. IMPORTAR PELO LINK DIRETO DO GOOGLE FORMS (IA) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-2">
                <label className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Importar pelo Link do Google Forms (Análise Automática IA):</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={googleFormsUrl}
                    onChange={(e) => setGoogleFormsUrl(e.target.value)}
                    placeholder="Cole aqui o link: https://docs.google.com/forms/d/e/.../viewform ou https://forms.gle/..."
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleImportarGoogleFormsUrl}
                    disabled={importando || !googleFormsUrl.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 transition disabled:opacity-40 shrink-0"
                  >
                    {importando ? 'Analisando Link...' : 'Analisar Link Forms'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Lê todas as perguntas, múltipla escolha, checkboxes, lista suspensa, escalas 0-10 e textos do Google Forms e distribui nas Telas 1, 2, 3...
                </p>
              </div>

              {/* 2. Upload de Arquivo Word (.docx, .doc), Planilha (.csv) ou Texto (.txt, .json) */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 transition text-center space-y-2">
                <UploadCloud className="w-7 h-7 text-emerald-400 mx-auto" />
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-500/25 active:scale-95 transition">
                    <FolderUp className="w-4 h-4" />
                    <span>Selecionar Arquivo (.docx, .doc, .csv, .txt, .json)</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.csv,.txt,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportarArquivo(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  A IA analisa o arquivo e monta automaticamente Cards, Checkboxes, Radio Buttons, Slides 0-10, Datas, Horas e Gavetas!
                </p>
              </div>

              {/* Ou Colar Texto */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Ou cole o texto copiado do Google Forms / Word aqui:
                </label>
                <textarea
                  rows={5}
                  value={importTexto}
                  onChange={(e) => setImportTexto(e.target.value)}
                  placeholder={`Exemplo:
1. Você precisa de apoio ou ajuda?
- Sim (Gaveta: Qual tipo de ajuda você precisa?)
- Não

2. O que você achou do evento? [texto]`}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none transition resize-none font-mono"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportarTextoColado}
                    disabled={importando || !importTexto.trim()}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 active:scale-95 transition disabled:opacity-40"
                  >
                    Analisar Texto Colado
                  </button>
                </div>
              </div>

              {/* Preview da Importação */}
              {previewImportado && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Formulário Analisado com Sucesso!
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      1 Tela Principal + {(previewImportado.telasExtras || []).length} Telas Extras
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p><strong>Tela 1:</strong> {previewImportado.pergunta1Titulo} ({previewImportado.opcoesChegada?.length || 0} opções)</p>
                    {(previewImportado.telasExtras || []).map((t, i) => (
                      <p key={i}><strong>Tela {i + 2}:</strong> {t.titulo} ({t.tipo === 'texto' ? '✍️ Campo Aberto' : `${t.opcoes?.length || 0} opções`})</p>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmarImportacao}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aplicar Este Formulário à Pesquisa</span>
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 text-right">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL PADRÃO DE AVISOS, ERROS E CONFIRMAÇÕES (NOVO DESIGN)    */}
        {/* ============================================================== */}
        {modalFeedback.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xl ${
                modalFeedback.tipo === 'erro' 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-950/40' 
                  : modalFeedback.tipo === 'sucesso'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-950/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-950/40'
              }`}>
                {modalFeedback.tipo === 'erro' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : modalFeedback.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <HelpCircle className="w-7 h-7" />
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {modalFeedback.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {modalFeedback.mensagem}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {modalFeedback.tipo === 'confirm' && (
                  <button
                    type="button"
                    onClick={() => setModalFeedback(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition active:scale-95"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (modalFeedback.onConfirm) {
                      modalFeedback.onConfirm();
                    }
                    setModalFeedback(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition active:scale-95 shadow-lg ${
                    modalFeedback.tipo === 'erro'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-900/30'
                  }`}
                >
                  {modalFeedback.btnTexto || 'Entendido'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
