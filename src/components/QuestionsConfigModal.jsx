import React, { useState, useEffect, useRef } from 'react';
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
  buscarConfigPerguntasRemota,
  saveQuestionsConfig, 
  getSavedEventTitle,
  saveEventTitle,
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';
import GaleriaTemas from './GaleriaTemas';
import { aplicarTema } from '../utils/temas';
import { configSeta, CORES_SETA, DESENHOS_SETA } from '../utils/setas';
import { alturaFaixa, FAIXA_MAX, FAIXA_MIN, gravarFaixaPadrao, lerGeral, gravarHerdado, herdaEstilo, ligarHeranca, semCamposHerdados, telaP1Cantos, CORES_BOTAO, CORES_LINHA, CORES_TEXTO_BOTAO, CARD_ESPACO_PADRAO, raiosCard, linhasCapa, alturaCard, CAPA_ESPACO_PADRAO, CARD_ALTURA_MAX, CARD_ALTURA_MIN, espacos, continuaNaMesmaPagina, extrairEstilo, aplicarEstilo, getFaixaFundoClass, estiloLinhas, pesoFonte, corGradeSelecionada, getCorTextoLinhaClass, getAlinhamentoClass, getCaptionFundoClass, parseScaleLegendItems, getEfeitoStyle, CORES_TEXTO_LINHAS, ALINHAMENTOS_TEXTO, FUNDOS_CAPTION } from '../utils/estilos';
import ImportadorIA from './ImportadorIA';
import IconeEspera, { ICONES_ESPERA } from './IconeEspera';
import PreviewCelular from './PreviewCelular';
import CamposFinais from './CamposFinais';
import { FORMATOS_CAMPO, formatoPorId } from '../utils/campoTexto';
import { chaveTamanho, estiloLinhaFinal, LINHAS_FINAL } from '../utils/telaFinal';
import BarraProgresso, { CORES_PROGRESSO, CORES_PROGRESSO_LAYOUT, ESTILOS_PROGRESSO, usaDuasCores } from './BarraProgresso';
import { Columns2, Rows3, Smile as IconeRosto, WrapText } from 'lucide-react';
import EscalaVisual, { ESTILOS_ESCALA, INSTRUCAO_PADRAO, instrucaoDaEscala } from './EscalaVisual';
import EstiloLinhasTitulo, { ControleEspacos } from './EstiloLinhasTitulo';
import { BotaoObrigatorio, OlhoTela, Campo, Chave, Cores, Deslizante, Lista, MiniSlider, QuestaoArrastavel, Secao, Segmentos, SeletorFonte, SeletorIcone } from './Controles';
import { ICONES_CARDS, iconesDaTela } from '../utils/icones';
import { PRESETS_PESQUISAS } from '../utils/presets';

export const TIPOS_PERGUNTA = [
  { id: 'cards', label: '🃏 Cards Múltipla Escolha', short: 'Cards', desc: 'Cards grandes táteis com ícones e gavetas' },
  { id: 'grade', label: '📊 Grade / Matriz de Avaliação (1 a 5 / NA)', short: 'Grade / Escala', desc: 'Tabela de itens avaliados por escala (ex: 1 a 5 e NA)' },
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

export { CORES_TEXTO_LINHAS, getCorTextoLinhaClass, ALINHAMENTOS_TEXTO, getAlinhamentoClass, FUNDOS_CAPTION, getCaptionFundoClass, parseScaleLegendItems, getEfeitoStyle } from '../utils/estilos';

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
  { id: 'tema', label: 'Do layout', classe: 'amostra-tema' },
  // 6 Originais
  { id: 'escuro', label: 'Slate Escuro', classe: 'bg-slate-900 border-slate-700' },
  { id: 'gradiente', label: 'Gradiente Noturno', classe: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border-slate-700' },
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

// Amostra do editor = só o fundo, sem a borda do card
FUNDOS_CARDS.forEach((f) => { f.amostra = f.classe.replace(/\bborder-\S+/g, ''); });

// OPÇÕES DE EFEITOS E ACABAMENTOS DOS CARDS (3D, VIDRO, ENTALHE, ALTO-RELEVO, ETC.)
export const EFEITOS_CARDS = [
  { id: 'tema', label: 'Do layout', desc: 'Acabamento do layout escolhido' },
  { id: 'padrao', label: 'Liso', desc: 'Borda sutil e limpa' },
  { id: 'efeito_3d', label: '3D', desc: 'Base tátil saliente com profundidade' },
  { id: 'vidro', label: 'Vidro', desc: 'Translúcido com blur e reflexo' },
  { id: 'entalhe', label: 'Entalhe', desc: 'Profundidade esculpida para dentro' },
  { id: 'alto_relevo', label: 'Alto-relevo', desc: 'Relevo saltado para fora (emboss)' },
  { id: 'glow', label: 'Brilho', desc: 'Iluminação de contorno' },
];

// Fonte e borda de uma linha de texto (ler/gravar recebem 'Familia', 'Borda' ou 'BordaLargura')
const fonteBordaLinha = (ler, gravar) => ({
  familia: ler('Familia'), onFamilia: (v) => gravar('Familia', v),
  borda: ler('Borda'), onBorda: (v) => gravar('Borda', v),
  bordaLargura: ler('BordaLargura'), onBordaLargura: (v) => gravar('BordaLargura', v)
});

const EFEITOS_CAPA = [{ id: 'nenhum', label: 'Nenhum' }, ...EFEITOS_CARDS.filter((e) => e.id !== 'padrao' && e.id !== 'tema')];

// Sub-abas de uma tela (Textos, Opções, Aparência)
const rotuloPerguntas = (n) => <>Perguntas <strong className="font-bold text-amber-300">({n})</strong></>;
const SubAbas = ({ opcoes, valor, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-slate-950/60 p-1">
    {opcoes.map((o) => (
      <button
        key={o.id}
        type="button"
        aria-pressed={valor === o.id}
        onClick={() => onChange(o.id)}
        className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition ${valor === o.id ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// OPÇÕES DE CORES DA FONTE DO TÍTULO DOS CARDS (EM BOLINHAS)
export const CORES_FONTE_TITULO = [
  { id: 'tema', label: 'Do layout', classe: 't-cor', dot: 'amostra-tema' },
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
  { id: 'tema', label: 'Do layout', classe: 't-cor', dot: 'amostra-tema' },
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
  { id: 'tema', label: 'Do layout', dot: 'amostra-tema', classe: 't-num', simClass: 't-num' },
  { id: 'slate', label: 'Grafite', hex: '#475569', dot: 'bg-slate-600', classe: 'bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-slate-700/80 border-b-slate-950 text-slate-100', simClass: 'bg-slate-800 border-slate-700 border-b-slate-950' },
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
  { id: 'tema', label: 'Do layout', dot: 'amostra-tema', classe: 't-cor' },
  { id: 'branco', label: 'Branco Puro', hex: '#ffffff', dot: 'bg-white', classe: 'text-white' },
  { id: 'dourado', label: 'Dourado', hex: '#fcd34d', dot: 'bg-amber-300', classe: 'text-amber-300' },
  { id: 'amarelo', label: 'Amarelo', hex: '#fde047', dot: 'bg-yellow-300', classe: 'text-yellow-300' },
  { id: 'esmeralda', label: 'Esmeralda', hex: '#6ee7b7', dot: 'bg-emerald-300', classe: 'text-emerald-300' },
  { id: 'azul', label: 'Azul Céu', hex: '#7dd3fc', dot: 'bg-sky-300', classe: 'text-sky-300' },
  { id: 'laranja', label: 'Laranja', hex: '#fb923c', dot: 'bg-orange-400', classe: 'text-orange-300' },
  { id: 'rosa', label: 'Rosa Claro', hex: '#f472b6', dot: 'bg-pink-400', classe: 'text-pink-300' },
  { id: 'preto', label: 'Preto', hex: '#0f172a', dot: 'bg-slate-900 border border-slate-600', classe: 'text-slate-950' },
];

// OPÇÕES DE CORES DA DESCRIÇÃO ("PESSOAS") (TELA 2)
export const CORES_DESCRICAO_QTD = [
  { id: 'tema', label: 'Do layout', classe: 't-cor' },
  { id: 'branco_80', label: 'Branco 80%', classe: 'text-white/80' },
  { id: 'branco_puro', label: 'Branco Puro', classe: 'text-white' },
  { id: 'dourado', label: 'Dourado', classe: 'text-amber-300' },
  { id: 'amarelo', label: 'Amarelo', classe: 'text-yellow-300' },
  { id: 'esmeralda', label: 'Esmeralda', classe: 'text-emerald-300' },
  { id: 'azul', label: 'Azul Céu', classe: 'text-sky-300' },
  { id: 'cinza', label: 'Cinza Suave', classe: 'text-slate-300' },
  { id: 'laranja', label: 'Laranja', classe: 'text-orange-300' },
];

// 6 PRESETS DE MODELOS DE CELULARES PARA VISUALIZAÇÃO
const MODELOS_CELULARES = [
  {
    id: 'iphone16pro',
    viewport: { w: 402, h: 750 }, // área visível do navegador em pixels CSS
    nome: 'iPhone 16 Pro',
    marca: 'Apple',
    moldura: 'rounded-[38px] border-[5px] border-slate-700/90 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-full max-w-[240px] sm:max-w-[255px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'dynamic-island'
  },
  {
    id: 's24ultra',
    viewport: { w: 384, h: 700 }, // área visível do navegador em pixels CSS
    nome: 'Samsung S24 Ultra / S24 FE',
    marca: 'Samsung',
    moldura: 'rounded-[14px] border-[4px] border-slate-700/80 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-full max-w-[245px] sm:max-w-[260px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'xiaomi14pro',
    viewport: { w: 393, h: 740 }, // área visível do navegador em pixels CSS
    nome: 'Xiaomi 14 Pro',
    marca: 'Xiaomi',
    moldura: 'rounded-[30px] border-[4px] border-slate-600/80 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-full max-w-[242px] sm:max-w-[258px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'pixel9pro',
    viewport: { w: 410, h: 780 }, // área visível do navegador em pixels CSS
    nome: 'Pixel 9 Pro',
    marca: 'Google',
    moldura: 'rounded-[36px] border-[4px] border-slate-700/90 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-full max-w-[240px] sm:max-w-[255px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'punch-hole-center'
  },
  {
    id: 'iphone_notch',
    viewport: { w: 390, h: 664 }, // área visível do navegador em pixels CSS
    nome: 'iPhone Notch',
    marca: 'Apple',
    moldura: 'rounded-[34px] border-[5px] border-slate-800 shadow-2xl ring-1 ring-slate-700',
    largura: 'w-full max-w-[240px] sm:max-w-[255px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'notch'
  },
  {
    id: 'moto_edge',
    viewport: { w: 412, h: 780 }, // área visível do navegador em pixels CSS
    nome: 'Motorola Edge',
    marca: 'Motorola',
    moldura: 'rounded-[24px] border-[4px] border-slate-600/70 shadow-2xl ring-1 ring-slate-800',
    largura: 'w-full max-w-[238px] sm:max-w-[252px]',
    alturaTela: 'h-[374px]',
    tipoTopo: 'punch-hole-center'
  }
];

const moverItem = (lista, de, para) => {
  const nova = [...(lista || [])];
  nova.splice(para, 0, nova.splice(de, 1)[0]);
  return nova;
};

export default function QuestionsConfigModal({ isOpen, onClose, activeEventId = null, eventTitle = '', inline = false }) {
  // Abas: 'inicio' | 'tela_1' | 'extra_0', 'extra_1'... | 'acompanhantes' | 'fim'
  const [activeTab, setActiveTabEstado] = useState('inicio');
  const chaveAba = `responder_editor_aba_${activeEventId || 'padrao'}`;
  const setActiveTab = (aba) => {
    setActiveTabEstado(aba);
    try { sessionStorage.setItem(chaveAba, aba); } catch (e) {}
  };
  const [config, setConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Sub-navegações internas minimalistas para evitar poluição visual
  const [subTabTela1, setSubTabTela1] = useState('pergunta'); // 'pergunta' (textos) | 'opcoes' | 'aparencia'
  const [subTabExtra, setSubTabExtra] = useState('pergunta'); // 'pergunta' (textos) | 'opcoes' | 'aparencia'
  const [subTabTela2, setSubTabTela2] = useState('pergunta'); // 'botoes' | 'pergunta' | 'individual'

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

  // Splitter / Linha Editável para redimensionar colunas (Configurações vs Celulares)
  const [splitPercent, setSplitPercent] = useState(() => {
    try {
      const saved = localStorage.getItem('questions_modal_split');
      return saved ? Math.min(78, Math.max(22, Number(saved))) : 50;
    } catch {
      return 50;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const previewColRef = useRef(null);
  const configColRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newPercent = (relativeX / rect.width) * 100;
      const clamped = Math.min(78, Math.max(22, newPercent));
      setSplitPercent(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem('questions_modal_split', String(splitPercent));
        } catch {}
      }
    };

    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, splitPercent]);
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

  // Config carregada do banco; se "config" ainda é este mesmo objeto, o admin não editou nada
  const configBaseRef = useRef(null);
  const configAtualRef = useRef(config);
  configAtualRef.current = config;

  useEffect(() => {
    if (!(isOpen || inline)) return;
    let cancelado = false;
    const local = getSavedQuestionsConfig(activeEventId);
    configBaseRef.current = local;
    setConfig(local);
    setEventoTitulo(eventTitle || getSavedEventTitle(activeEventId) || '');
    setSalvo(false);
    // Atualizar a página volta para a mesma aba do editor
    let aba = 'inicio';
    try { aba = sessionStorage.getItem(chaveAba) || 'inicio'; } catch (e) {}
    setActiveTabEstado(aba);
    setPreviewScreen('inicio');
    setPreviewPage(0);

    // Busca a versão do servidor: evita editar (e depois salvar por cima) uma cópia antiga/padrão
    buscarConfigPerguntasRemota(activeEventId).then((remota) => {
      if (cancelado || !remota) return;
      if (configAtualRef.current === configBaseRef.current) {
        configBaseRef.current = remota;
        setConfig(remota);
      }
    });
    return () => { cancelado = true; };
    // eventTitle fora das dependências: mudar o título não pode apagar edições não salvas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, inline, activeEventId]);

  // Fora do mapa das telas extras não há grupo (evita erro nas telas Acompanhantes/Fim)
  const grupoPreview = [];
  const TIPOS_CAMPO_PAGINA = ['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating', 'dropdown', 'radio', 'checkbox', 'grade'];

  // COPIAR / COLAR / REPLICAR FORMATAÇÃO ENTRE TELAS
  const [estiloCopiado, setEstiloCopiado] = useState(null);
  const copiarEstilo = (ehP1, extraIndex) => {
    const origem = ehP1 ? config : (config.telasExtras || [])[extraIndex];
    setEstiloCopiado(extrairEstilo(origem, ehP1));
  };
  const colarEstilo = (ehP1, extraIndex) => {
    if (!estiloCopiado) return;
    // Página que herda: cards e botões já são os de todas, então cola só a formatação dos títulos
    const colar = herdaEstilo(config, ehP1 ? 'p1' : extraIndex) ? semCamposHerdados(estiloCopiado) : estiloCopiado;
    setConfig((prev) => ehP1
      ? aplicarEstilo(prev, colar, true)
      : { ...prev, telasExtras: (prev.telasExtras || []).map((t, i) => (i === extraIndex ? aplicarEstilo(t, colar, false) : t)) });
  };
  const replicarEmTodas = (ehP1, extraIndex) => {
    const origem = ehP1 ? config : (config.telasExtras || [])[extraIndex];
    const e = extrairEstilo(origem, ehP1);
    mostrarConfirm(
      'Replicar formatação',
      'Aplicar o tamanho, cor, negrito, alinhamento e fundo do título/subtítulo, além do estilo dos cards, legenda e itens desta tela em TODAS as telas? Páginas que não herdam configurações mantêm os próprios cards e botões.',
      () => setConfig((prev) => ({
        ...aplicarEstilo(prev, herdaEstilo(prev, 'p1') || ehP1 ? e : semCamposHerdados(e), true),
        telasExtras: (prev.telasExtras || []).map((t) => aplicarEstilo(t, t.herdarEstilo === false ? semCamposHerdados(e) : e, false))
      })),
      'Replicar em todas'
    );
  };
  const iconesEditorP1 = iconesDaTela((config.opcoesChegada || []).filter((o) => o.ativo !== false));
  const setCampo = (campo, valor) => setConfig((c) => ({ ...c, [campo]: valor }));

  const BarraFormatacao = ({ ehP1, extraIndex }) => {
    const classe = 'px-2.5 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-700 hover:text-white transition disabled:opacity-40';
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 w-[74px] pl-3">Formatação</span>
        <button type="button" onClick={() => copiarEstilo(ehP1, extraIndex)} className={classe}>Copiar</button>
        <button type="button" disabled={!estiloCopiado} onClick={() => colarEstilo(ehP1, extraIndex)} className={classe}>Colar aqui</button>
        <button type="button" onClick={() => replicarEmTodas(ehP1, extraIndex)} className={classe}>Usar em todas as telas</button>
      </div>
    );
  };

  // Perguntas que dividem a mesma página: cada uma é uma tela ligada à anterior por "mesmaPagina"
  const comPagina = (telas, indices, primeira) => telas.map((t, i) => {
    const pos = indices.indexOf(i);
    if (pos < 0) return t;
    return { ...t, mesmaPagina: pos === 0 ? primeira : true };
  });
  const moverPergunta = (indices, de, para) => setConfig((c) => {
    const telas = [...c.telasExtras];
    const primeira = telas[indices[0]].mesmaPagina;
    const ordem = moverItem(indices.map((i) => telas[i]), de, para);
    indices.forEach((i, k) => { telas[i] = ordem[k]; });
    return { ...c, telasExtras: comPagina(telas, indices, primeira) };
  });
  const adicionarPergunta = (depoisDe, formato = '') => setConfig((c) => {
    const base = c.telasExtras[depoisDe];
    const f = formatoPorId(formato);
    const nova = {
      ...base,
      id: `tela_${Date.now()}`,
      tipo: formato ? 'texto_curto' : 'texto',
      titulo: f.titulo || 'Nova pergunta',
      titulo1: f.titulo || 'Nova pergunta',
      titulo2: '',
      titulo3: '',
      subtitulo: '',
      placeholder: f.dica || '',
      formatoCampo: formato,
      maiusculas: false,
      opcoes: [],
      obrigatorio: false,
      ativa: base.ativa !== false,
      mesmaPagina: true
    };
    const telas = [...c.telasExtras];
    // a pergunta seguinte que já estava nesta página continua nela
    const seguinte = telas[depoisDe + 1];
    if (seguinte && continuaNaMesmaPagina(base, seguinte)) telas[depoisDe + 1] = { ...seguinte, mesmaPagina: true };
    telas.splice(depoisDe + 1, 0, nova);
    return { ...c, telasExtras: telas };
  });
  const excluirPagina = (indices, numero) => mostrarConfirm(
    'Excluir página',
    `A Tela ${numero} tem ${indices.length} perguntas. Excluir a página com todas elas?`,
    () => {
      setConfig((c) => ({ ...c, telasExtras: c.telasExtras.filter((_, i) => !indices.includes(i)) }));
      setActiveTab('inicio');
    },
    'Excluir'
  );
  const excluirPergunta = (indices, pos) => mostrarConfirm(
    'Excluir pergunta',
    'Excluir esta pergunta da página?',
    () => {
      setConfig((c) => {
        const primeira = c.telasExtras[indices[0]].mesmaPagina;
        const restantes = indices.filter((_, k) => k !== pos);
        const telas = comPagina(c.telasExtras, restantes, primeira);
        return { ...c, telasExtras: telas.filter((_, i) => i !== indices[pos]) };
      });
      setActiveTab(indices.length > 1 ? `extra_${indices[0]}` : 'inicio');
    },
    'Excluir'
  );

  // Efeitos de um botão: os mesmos dos cards, mais cores, linha, altura e cantos
  const EfeitosBotao = ({ titulo, descricao, ler, gravar, alturaPadrao, alturaMax, raioPadrao, espessuraPadrao = 1, fontePadrao, comLargura, topo = null }) => {
    const efeito = ler('Efeito') || 'nenhum';
    return (
      <Secao titulo={titulo} descricao={descricao}>
        {topo}
        <Segmentos rotulo="Efeito" opcoes={EFEITOS_CAPA} valor={efeito} onChange={(v) => gravar('Efeito', v)} />
        <SeletorFonte valor={ler('Familia')} onChange={(v) => gravar('Familia', v)} />
        {efeito !== 'nenhum' && <Deslizante rotulo="Profundidade" valor={ler('Profundidade') || 5} min={1} max={10} unidade="" onChange={(v) => gravar('Profundidade', v)} />}
        <Cores rotulo="Cor do botão" opcoes={CORES_BOTAO} campo="hex" valor={ler('Cor') || 'padrao'} onChange={(v) => gravar('Cor', v)} />
        <Cores rotulo="Cor do texto" opcoes={CORES_TEXTO_BOTAO} campo="hex" valor={ler('CorTexto') || 'padrao'} onChange={(v) => gravar('CorTexto', v)} />
        <Cores rotulo="Borda" opcoes={CORES_LINHA} campo="hex" valor={ler('Linha') || 'padrao'} onChange={(v) => gravar('Linha', v)} />
        <Deslizante rotulo="Largura borda" valor={ler('LinhaEspessura') ?? espessuraPadrao} min={0} max={6} passo={0.5} onChange={(v) => gravar('LinhaEspessura', v)} />
        {fontePadrao && <Deslizante rotulo="Tamanho texto" valor={ler('Fonte') ?? fontePadrao} min={11} max={32} onChange={(v) => gravar('Fonte', v)} />}
        {comLargura && <Deslizante rotulo="Largura" valor={ler('Largura') ?? 100} min={40} max={100} passo={5} unidade="%" onChange={(v) => gravar('Largura', v)} />}
        <Deslizante rotulo="Altura" valor={ler('Altura') ?? alturaPadrao} min={28} max={alturaMax} onChange={(v) => gravar('Altura', v)} />
        <Deslizante rotulo="Cantos" valor={ler('Raio') ?? raioPadrao} min={0} max={40} onChange={(v) => gravar('Raio', v)} />
      </Secao>
    );
  };

  // Setas ANTERIOR e PRÓXIMA
  const ConfigSetas = (ler, gravar) => {
    const seta = configSeta(ler);
    return (
      <Secao titulo="Setas Anterior e Próxima">
        <Segmentos
          rotulo="Desenho"
          opcoes={DESENHOS_SETA.map(({ id, label, esq: Esq, dir: Dir }) => ({ id, label, dica: label, conteudo: <span className="flex items-center gap-0.5"><Esq className="w-4 h-4" /><Dir className="w-4 h-4" /></span> }))}
          valor={ler('Desenho') || 'seta'}
          onChange={(v) => gravar('Desenho', v)}
        />
        <Cores rotulo="Cor" opcoes={CORES_SETA} campo="hex" valor={ler('Cor') || 'branco'} onChange={(v) => gravar('Cor', v)} />
        <Deslizante rotulo="Tamanho" valor={seta.tamanho} min={16} max={36} onChange={(v) => gravar('Tamanho', v)} />
        <Deslizante rotulo="Espessura" valor={seta.espessura} min={1} max={4} passo={0.25} unidade="" onChange={(v) => gravar('Espessura', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Texto da esquerda" valor={seta.anterior} onChange={(v) => gravar('TextoAnterior', v)} placeholder="ANTERIOR" />
          <Campo rotulo="Texto da direita" valor={seta.proxima} onChange={(v) => gravar('TextoProxima', v)} placeholder="PRÓXIMA" />
        </div>
      </Secao>
    );
  };

  // Cards e botões: mexeu numa página, muda em todas que herdam
  const gravarEstilo = (origem, campo, valor) => setConfig((c) => gravarHerdado(c, origem, campo, valor));
  // origens: 'p1' ou a lista de índices da página
  const Heranca = (origens) => {
    const lista = Array.isArray(origens) ? origens : [origens];
    const herda = herdaEstilo(config, lista[0]);
    return (
      <button
        type="button"
        role="switch"
        aria-checked={herda}
        title={herda ? 'Ligado: cards, botões, setas e altura das faixas são os mesmos de todas as páginas' : 'Desligado: esta página tem configurações próprias'}
        onClick={() => mostrarConfirm(
          herda ? 'Parar de herdar' : 'Voltar a herdar',
          herda
            ? 'Esta página passa a ter cards, botões, setas e altura das faixas próprios: mudanças nas outras não chegam aqui, e as daqui não vão para as outras.'
            : 'Cards, botões, setas e altura das faixas desta página voltam a ser iguais aos das outras. Os ajustes próprios dela serão perdidos.',
          () => setConfig((c) => lista.reduce((acc, o) => ligarHeranca(acc, o, !herda), c)),
          herda ? 'Não herdar' : 'Herdar'
        )}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
      >
        <span>Herdar configurações</span>
        <span className={`w-7 h-4 rounded-full relative transition ${herda ? 'bg-slate-100' : 'bg-slate-600'}`}>
          <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${herda ? 'left-[14px] bg-slate-900' : 'left-0.5 bg-slate-300'}`} />
        </span>
      </button>
    );
  };

  // Aparência dos cards de opção: a mesma para a Tela 1 e para as telas extras
  const AparenciaCards = ({ ler, gravar, campoIcones, porPagina, opcoes, raios }) => {
    // Só mostra ajuste do que aparece no celular (ex.: sem descrição nos cards, nada de descrição aqui)
    const temDescricao = opcoes.some((o) => String(o.subtitulo || '').trim());
    return (
    <>
      <Secao titulo="Tamanho">
        <Deslizante rotulo="Altura do card" valor={alturaCard(ler('cardAltura'))} min={CARD_ALTURA_MIN} max={CARD_ALTURA_MAX} onChange={(v) => gravar('cardAltura', v)} />
        <Deslizante rotulo="Espaço entre cards" valor={Number(ler('cardEspaco') ?? CARD_ESPACO_PADRAO)} min={0} max={40} onChange={(v) => gravar('cardEspaco', v)} />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Deslizante rotulo="Cantos esquerda" valor={raios.esq} min={0} max={40} onChange={(v) => gravar('cardRaioEsq', v)} />
          <Deslizante rotulo="Cantos direita" valor={raios.dir} min={0} max={40} onChange={(v) => gravar('cardRaioDir', v)} />
        </div>
        <SeletorFonte valor={ler('cardFamilia')} onChange={(v) => gravar('cardFamilia', v)} />
        <Deslizante rotulo="Título" valor={ler('cardFonteTitulo') || 16} min={12} max={24} onChange={(v) => gravar('cardFonteTitulo', v)} />
        {temDescricao && <Deslizante rotulo="Descrição" valor={ler('cardFonteSubtitulo') || 12} min={9} max={18} onChange={(v) => gravar('cardFonteSubtitulo', v)} />}
        {opcoes.length > 2 && <Deslizante rotulo="Cards por página" valor={Math.min(15, porPagina)} min={2} max={15} unidade="" onChange={(v) => gravar('cardsPorTela', v)} />}
        <Chave rotulo="Mostrar ícones nos cards" valor={ler(campoIcones) !== false} onChange={(v) => gravar('mostrarIcones', v)} />
      </Secao>
      <Secao titulo="Efeito">
        <Segmentos rotulo="Acabamento" opcoes={EFEITOS_CARDS} valor={ler('cardEfeitoEstilo') || 'padrao'} onChange={(v) => gravar('cardEfeitoEstilo', v)} />
        <Deslizante rotulo="Intensidade" valor={ler('cardProfundidade') || 5} min={1} max={10} unidade="" onChange={(v) => gravar('cardProfundidade', v)} />
      </Secao>
      <Secao titulo="Cores">
        <Cores rotulo="Fundo do card" opcoes={FUNDOS_CARDS} campo="amostra" quadrado valor={ler('cardFundoEstilo') || 'escuro'} onChange={(v) => gravar('cardFundoEstilo', v)} />
        <Cores rotulo="Borda" opcoes={CORES_LINHA} campo="hex" valor={ler('cardBorda') || 'padrao'} onChange={(v) => gravar('cardBorda', v)} lateral={<MiniSlider rotulo="Largura" valor={ler('cardBordaLargura') ?? 1} min={0} max={10} passo={0.5} onChange={(v) => gravar('cardBordaLargura', v)} />} />
        <Cores rotulo="Título" opcoes={CORES_FONTE_TITULO} campo="dot" valor={ler('cardCorFonteTitulo') || 'branco'} onChange={(v) => gravar('cardCorFonteTitulo', v)} />
        {temDescricao && <Cores rotulo="Descrição" opcoes={CORES_FONTE_SUBTITULO} campo="dot" valor={ler('cardCorFonteSubtitulo') || 'cinza'} onChange={(v) => gravar('cardCorFonteSubtitulo', v)} />}
      </Secao>
    </>
    );
  };

  // SALVAMENTO AUTOMÁTICO NO BANCO: 1,5s depois da última alteração
  const [autoSalvo, setAutoSalvo] = useState('');
  useEffect(() => {
    if (!(isOpen || inline) || !configBaseRef.current || config === configBaseRef.current) {
      setAutoSalvo((a) => (a === 'pendente' ? '' : a));
      return undefined;
    }
    setAutoSalvo('pendente');
    const t = setTimeout(async () => {
      try {
        await saveQuestionsConfig(config, activeEventId);
        configBaseRef.current = config;
        setAutoSalvo('salvo');
      } catch (e) {
        setAutoSalvo('erro');
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (eventTitle && configAtualRef.current === configBaseRef.current) {
      setEventoTitulo(eventTitle);
    }
  }, [eventTitle]);

  // Alinha a tela do preview sempre que a aba ativa mudar
  useEffect(() => {
    setPreviewScreen(activeTab);
    setPreviewPage(0);
    // Configurações da tela escolhida começam do topo
    if (configColRef.current) configColRef.current.scrollTop = 0;
  }, [activeTab]);

  if (!isOpen && !inline) return null;

  const modeloAtual = MODELOS_CELULARES.find(m => m.id === modeloCelularId) || MODELOS_CELULARES[0];

  // Cálculos dinâmicos da Tela 1
  // Uma aba por PÁGINA do celular: perguntas na mesma página ficam juntas numa aba só
  const paginasExtras = [];
  {
    let anterior = null;
    let anteriorOculta = null; // perguntas da mesma página, quando ela está oculta
    (config.telasExtras || []).forEach((t, i) => {
      if (!t) return;
      const ativa = t.ativa !== false;
      const base = ativa ? anterior : anteriorOculta;
      const junta = Boolean(base) && (ativa || base.i === i - 1) && continuaNaMesmaPagina(base.tela, t);
      const pagina = junta ? base.pagina : { membros: [], numero: paginasExtras.length + 2, oculta: !ativa };
      if (!junta) paginasExtras.push(pagina);
      pagina.membros.push(i);
      if (ativa) { anterior = { tela: t, pagina }; anteriorOculta = null; } else anteriorOculta = { tela: t, pagina, i };
    });
  }
  const numeroDaTela = (i) => paginasExtras.find((pg) => pg.membros.includes(i))?.numero ?? i + 2;
  // OLHO: tela oculta não faz parte da pesquisa (o celular pula), mas nada dela é apagado
  const telaOculta = (chave) => {
    if (chave === 'tela_1') return Boolean(config.p1Oculta);
    if (chave === 'inicio_comecar') return config.mostrarBotaoComecar === false;
    if (chave === 'acompanhantes') return config.mostrarTelaAcompanhantes === false;
    const m = /^extra_(\d+)$/.exec(chave || '');
    return m ? config.telasExtras?.[Number(m[1])]?.ativa === false : false;
  };
  const alternarTela = (chave, membros = []) => setConfig((c) => {
    if (chave === 'tela_1') return { ...c, p1Oculta: !c.p1Oculta };
    if (chave === 'inicio_comecar') return { ...c, mostrarBotaoComecar: c.mostrarBotaoComecar === false };
    if (chave === 'acompanhantes') return { ...c, mostrarTelaAcompanhantes: c.mostrarTelaAcompanhantes === false };
    const ocultar = membros.some((i) => c.telasExtras[i]?.ativa !== false);
    // a página seguinte continua sendo outra página, mesmo com esta oculta
    const seguinte = ocultar ? c.telasExtras.findIndex((t, i) => i > Math.max(...membros) && t && t.ativa !== false) : -1;
    return { ...c, telasExtras: c.telasExtras.map((t, i) => (membros.includes(i) ? { ...t, ativa: !ocultar } : i === seguinte ? { ...t, mesmaPagina: false } : t)) };
  });
  const membrosDaAba = (chave) => {
    const m = /^extra_(\d+)$/.exec(chave || '');
    return m ? paginasExtras.find((pg) => pg.membros.includes(Number(m[1])))?.membros || [] : [];
  };
  const abrirPagina = (membros) => {
    setActiveTab(`extra_${membros[0]}`);
    if (membros.length > 1) setSubTabExtra('lista');
  };

  const cardsAtivosP1 = (config.opcoesChegada || []).filter(c => c.ativo !== false);
  const subAtualP1 = subTabTela1 === 'aparencia' && cardsAtivosP1.length === 0 ? 'opcoes' : subTabTela1;
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

    // A nova tela herda TODA a formatação da Tela 1
    const novaTela = aplicarEstilo({
      id: `extra_${Date.now()}`,
      ativa: true,
      tipo: 'cards',
      // mantém o MESMO título e subtítulo da Tela 1
      titulo: [config.pergunta1Titulo, config.pergunta1Titulo2].filter(Boolean).join(' ') || `Pergunta da Tela ${totalExtras + 2}`,
      titulo1: config.pergunta1Titulo || '',
      titulo2: config.pergunta1Titulo2 || '',
      titulo3: config.pergunta1Titulo3 || '',
      subtitulo: config.pergunta1TextoAbaixo || config.pergunta1Subtitulo || '',
      cardsPorTela: config.cardsPorTela || 4,
      obrigatorio: false,
      botaoTexto: 'Avançar',
      opcoes: vaoParaNovaTela
    }, extrairEstilo(config, true), false);

    setConfig((prev) => ({
      ...prev,
      opcoesChegada: ficamNaTela1,
      telasExtras: [novaTela, ...(prev.telasExtras || [])]
    }));
    setActiveTab('extra_0');
  };

  const handleDividirParaNovaTelaExtra = (extraIndex, splitOptIndex) => {
    const telas = [...(config.telasExtras || [])];
    const telaAtual = telas[extraIndex];
    if (!telaAtual || !Array.isArray(telaAtual.opcoes)) return;
    if (splitOptIndex <= 0 || splitOptIndex >= telaAtual.opcoes.length) return;

    const ficam = telaAtual.opcoes.slice(0, splitOptIndex);
    const vao = telaAtual.opcoes.slice(splitOptIndex);

    telas[extraIndex] = { ...telaAtual, opcoes: ficam };
    // A nova tela é uma cópia da anterior (toda a formatação), só com outras opções e título
    const novaTela = {
      ...telaAtual,
      id: `extra_${Date.now()}`,
      ativa: true,
      // mantém o MESMO título e subtítulo da tela anterior
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

  // Aplica as telas criadas pela IA: substitui tudo ou adiciona depois das telas atuais
  const handleAplicarImportacao = (importado, modo = 'substituir') => {
    if (modo === 'adicionar') {
      setConfig((prev) => {
        const novas = [...(importado.telasExtras || [])];
        if ((importado.opcoesChegada || []).length > 0) {
          novas.unshift({
            id: `tela_ia_p1_${Date.now()}`,
            tipo: 'cards',
            titulo: importado.pergunta1Titulo,
            titulo1: importado.pergunta1Titulo,
            subtitulo: importado.pergunta1Subtitulo || '',
            opcoes: importado.opcoesChegada
          });
        }
        return { ...prev, telasExtras: [...(prev.telasExtras || []), ...novas] };
      });
    } else {
      setConfig((prev) => ({ ...prev, ...importado }));
      if (importado.capaTitulo1) setEventoTitulo(importado.capaTitulo1);
    }
    setShowImportModal(false);
    setActiveTab('inicio');
  };

  const handleExcluirTela = (extraIndex) => {
    const numTela = numeroDaTela(extraIndex);
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
    if (((config.telasExtras || [])[extraIndex]?.opcoes || []).length <= 1) {
      mostrarFeedback('Atenção', 'Mantenha pelo menos 1 opção nesta tela!', 'aviso');
      return;
    }
    setConfig((prev) => {
      const novasTelas = [...(prev.telasExtras || [])];
      const telaAlvo = novasTelas[extraIndex];
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
      configBaseRef.current = config;
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

  const getCorBadge = (corId) => {
    const item = CORES.find(c => c.id === corId);
    return item ? item.badge : 'text-slate-200 bg-slate-700/40 border-slate-700';
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

  const getBtnDescClass = (descCorId) => {
    const item = CORES_DESCRICAO_QTD.find(c => c.id === (descCorId || config.btnQtdCorDescricao || 'branco_80'));
    return item ? item.classe : 'text-white/80';
  };

  return (
    <div className={inline ? "editor w-full" : "editor fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"}>
      <div className={inline ? "relative w-full h-[calc(100vh-1.5rem)] bg-slate-900 border border-slate-800 rounded-r-2xl rounded-l-none border-l-0 shadow-xl flex flex-col overflow-hidden" : "relative w-[96vw] max-w-7xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden shrink-0"}>
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL (FIXO NO TOPO)                            */}
        {/* ============================================================ */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-200 border border-slate-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Perguntas e telas</h2>

            {/* Listbox do Modelo de Celular movido para o Topo à Esquerda */}
            <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-3 border-l border-slate-800">
              <Smartphone className="w-4 h-4 text-slate-200 shrink-0" />
              <select
                value={modeloCelularId}
                onChange={(e) => setModeloCelularId(e.target.value)}
                className="bg-slate-950 border border-slate-700 hover:border-slate-400 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer shadow-inner transition"
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
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-700/40 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Carregar modelos mundiais prontos (NPS, Checkbox, Gavetas, Inscrição)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modelos prontos</span>
              <span className="sm:hidden">Modelos</span>
            </button>

            {/* Botão Importar Form */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-700/40 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Importar com IA arquivos .pdf, .pptx, .ppt, .docx, .doc, .xlsx, .csv, .txt ou Google Forms"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Criar com IA (arquivo)</span>
              <span className="sm:hidden">IA</span>
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
        <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
          
          {/* ========================================================== */}
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES ORGANIZADAS POR ABAS        */}
          {/* ========================================================== */}
          <div 
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${splitPercent}%` : '100%' }} 
            className="flex flex-col min-h-0 max-h-[50%] lg:max-h-none overflow-hidden bg-slate-900/50 shrink-0 border-b lg:border-b-0 border-slate-800"
          >
            
            {/* BARRA DE ABAS: BOAS-VINDAS, INÍCIO, TELA 1..X, FIM + BOTÃO + ADD TAB EM VERDE */}
            <div className="flex border-b border-slate-800 bg-slate-950/70 px-3 pt-2.5 shrink-0 gap-1.5 overflow-x-auto items-center custom-scrollbar">
              
              {/* Boas-vindas (Espera / Entrada) */}
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'inicio'
                    ? 'border-slate-200 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Boas-vindas</span>
              </button>

              {/* Início (Capa / Botão COMEÇAR) */}
              <div className="flex items-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inicio_comecar');
                }}
                className={`${telaOculta('inicio_comecar') ? 'line-through opacity-60' : ''} pb-2.5 pl-3 pr-1 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'inicio_comecar'
                    ? 'border-slate-200 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Início</span>
              </button>
              <OlhoTela oculta={telaOculta('inicio_comecar')} rotulo="o Início" onClick={() => alternarTela('inicio_comecar')} className="mt-0.5" />
              </div>

              {/* Tela 1 (Perguntas / Cards) */}
              <div className="flex items-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tela_1');
                }}
                className={`${telaOculta('tela_1') ? 'line-through opacity-60' : ''} pb-2.5 pl-3 pr-1 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tela_1'
                    ? 'border-slate-200 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Tela 1</span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full tabular-nums">
                  {cardsAtivosP1.length}
                </span>
              </button>
              <OlhoTela oculta={telaOculta('tela_1')} rotulo="a Tela 1" onClick={() => alternarTela('tela_1')} className="mt-0.5" />
              </div>

              {/* Telas Extras Criadas Dinamicamente (Tela 2, Tela 3, etc. conforme ordem real) */}
              {paginasExtras.map(({ membros, numero: numTela }) => {
                const idx = membros[0];
                const tela = config.telasExtras[idx];
                const tabKey = `extra_${idx}`;
                const cardsAtivos = (tela.opcoes || []).filter(o => o.ativo !== false).length;
                const oculta = telaOculta(tabKey);
                return (
                  <div key={tela.id || idx} className="flex items-start">
                  <button
                    type="button"
                    onClick={() => abrirPagina(membros)}
                    className={`${oculta ? 'line-through opacity-60' : ''} pb-2.5 pl-3 pr-1 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                      membros.some((m) => activeTab === `extra_${m}`)
                        ? 'border-slate-200 text-slate-200'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Tela {numTela}</span>
                    {(membros.length > 1 || ['cards', 'radio', 'checkbox', 'dropdown', 'grade'].includes(tela.tipo || 'cards')) && (
                      <span className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full tabular-nums">
                        {membros.length > 1 ? membros.length : cardsAtivos}
                      </span>
                    )}
                  </button>
                  <OlhoTela oculta={oculta} rotulo={`a Tela ${numTela}`} onClick={() => alternarTela(tabKey, membros)} className="mt-0.5" />
                  </div>
                );
              })}

              {/* Tela Acompanhantes (Opcional - se ativa aparece na sequência, ou pode ser ativada) */}
              <div className="flex items-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('acompanhantes')}
                  title="Contagem de pessoas no grupo"
                  className={`${telaOculta('acompanhantes') ? 'line-through opacity-60' : ''} pb-2.5 pl-3 pr-1 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'acompanhantes'
                      ? 'border-slate-200 text-slate-200'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{telaOculta('acompanhantes') ? 'Acompanhantes' : `Tela ${paginasExtras.length + 2}`}</span>
                </button>
                <OlhoTela oculta={telaOculta('acompanhantes')} rotulo="a tela de acompanhantes" onClick={() => alternarTela('acompanhantes')} className="mt-0.5" />
              </div>

              {/* Fim */}
              <button
                type="button"
                onClick={() => setActiveTab('fim')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fim'
                    ? 'border-slate-200 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Fim</span>
              </button>

              {/* Botão + Add Tab em verde (com apenas um +) */}
              <button
                type="button"
                onClick={() => setShowTipoNovaTelaModal(true)}
                className="mb-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-700/40 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ml-auto sm:ml-2 shadow-sm"
                title="Adicionar mais uma tela / aba no fluxo de perguntas"
              >
                <Plus className="w-4 h-4" />
                <span>Nova tela</span>
              </button>

            </div>

            {/* CONTEÚDO ROLÁVEL DA ESQUERDA */}
            <div ref={configColRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-left custom-scrollbar">
              
              {telaOculta(activeTab) && (
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/10 text-xs text-rose-200">
                  <EyeOff className="w-4 h-4 shrink-0" />
                  <span className="flex-1 min-w-[160px]">Tela oculta: não faz parte da pesquisa. O celular pula direto para a próxima.</span>
                  <button type="button" onClick={() => alternarTela(activeTab, membrosDaAba(activeTab))} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-white transition">Mostrar tela</button>
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: BOAS-VINDAS (ESPERA / START DO ADMIN)             */}
              {/* ====================================================== */}
              {activeTab === 'inicio' && (
                <div className="space-y-2.5">
                  <Secao titulo="Ícone animado" descricao="Aparece no celular enquanto a pesquisa não foi liberada.">
                    <div className="grid grid-cols-5 gap-1.5">
                      {ICONES_ESPERA.map((ic) => {
                        const sel = (config.esperaIcone || 'lapis') === ic.id;
                        return (
                          <button
                            key={ic.id}
                            type="button"
                            title={ic.label}
                            aria-pressed={sel}
                            onClick={() => setCampo('esperaIcone', ic.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${sel ? 'bg-slate-100/10 border-slate-200' : 'border-transparent hover:bg-slate-100/5'}`}
                          >
                            <IconeEspera tipo={ic.id} tamanho={34} />
                            <span className={`text-[11px] leading-tight text-center ${sel ? 'text-white' : 'text-slate-400'}`}>{ic.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Secao>
                  <EstiloLinhasTitulo
                    key={activeTab}
                    linhas={[['1', 'DENTRO DE INSTANTES', 'branco'], ['2', 'ESTARÁ LIBERADO', 'dourado'], ['3', 'PARA RESPONDER.', 'verde']].map(([n, texto, cor]) => ({
                      rotulo: `Linha ${n}`,
                      texto: config[`esperaLinha${n}`] ?? texto,
                      onTexto: (v) => setCampo(`esperaLinha${n}`, v),
                      tamanho: config[`esperaLinha${n}Tamanho`] || config.esperaFonteTamanho || 26,
                      min: 14,
                      max: 42,
                      onTamanho: (v) => setCampo(`esperaLinha${n}Tamanho`, v),
                      cor: config[`esperaLinha${n}Cor`] || cor,
                      onCor: (v) => setCampo(`esperaLinha${n}Cor`, v),
                      familia: config[`esperaLinha${n}Familia`],
                      onFamilia: (v) => setCampo(`esperaLinha${n}Familia`, v)
                    }))}
                  />

                  <div className="pt-4 border-t border-dashed border-slate-600">
                    <h2 className="text-sm font-semibold text-white">Todas as páginas</h2>
                    <p className="text-xs text-slate-400 mt-0.5">O que você muda aqui vale para todas, menos nas páginas com "Herdar" desligado.</p>
                  </div>

                  <Secao titulo="Layout pronto" descricao="Clique e troca cores, fontes, fundos e efeitos. Textos, tamanhos, alturas e espaçamento ficam, e cada layout guarda os próprios ajustes.">
                    <GaleriaTemas
                      atual={config.tema}
                      onEscolher={(id) => setConfig((c) => aplicarTema(c, id))}
                    />
                  </Secao>

                  <Secao titulo="Barra de progresso" descricao="No alto do celular, mostra quanto falta para terminar.">
                    <Chave rotulo="Mostrar barra" valor={Boolean(config.mostrarProgresso)} onChange={(v) => setCampo('mostrarProgresso', v)} />
                    {config.mostrarProgresso && (
                      <>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
                          {ESTILOS_PROGRESSO.map((e) => {
                            const ativo = (config.progressoEstilo || 'cor') === e.id;
                            return (
                              <button
                                key={e.id}
                                type="button"
                                aria-pressed={ativo}
                                onClick={() => setCampo('progressoEstilo', e.id)}
                                className={`rounded-lg p-2.5 text-left bg-slate-950/60 transition ${ativo ? 'ring-2 ring-white' : 'hover:bg-slate-800'}`}
                              >
                                <span className="h-5 flex items-center"><BarraProgresso demo config={{ ...config, progressoEstilo: e.id }} valor={0.75} etapas={8} /></span>
                                <span className="block mt-1.5 text-xs font-semibold text-slate-100">{e.nome}</span>
                                <span className="block text-[11px] leading-tight text-slate-400">{e.detalhe}</span>
                              </button>
                            );
                          })}
                        </div>
                        {usaDuasCores(config.progressoEstilo) ? (
                          <>
                            <Cores rotulo="Começa em" campo="hex" opcoes={CORES_PROGRESSO} valor={config.progressoCor1 || 'vermelho'} onChange={(v) => setCampo('progressoCor1', v)} lateral={<span />} />
                            <Cores rotulo="Termina em" campo="hex" opcoes={CORES_PROGRESSO} valor={config.progressoCor2 || 'verde'} onChange={(v) => setCampo('progressoCor2', v)} lateral={<span />} />
                          </>
                        ) : (
                          <Cores rotulo="Cor" campo="hex" opcoes={CORES_PROGRESSO_LAYOUT} valor={config.progressoCor || 'layout'} onChange={(v) => setCampo('progressoCor', v)} lateral={<span />} />
                        )}
                        <Deslizante rotulo="Altura" valor={Number(config.progressoAltura) || 4} min={2} max={14} onChange={(v) => setCampo('progressoAltura', v)} />
                      </>
                    )}
                  </Secao>

                  <Secao titulo="Cabeçalho">
                    <Deslizante rotulo="Altura dos fundos" valor={alturaFaixa(config.faixaPadrao)} min={FAIXA_MIN} max={FAIXA_MAX} passo={5} unidade="%" onChange={(v) => setConfig((c) => gravarFaixaPadrao(c, v))} />
                    <Chave rotulo="Travar cabeçalho" descricao="O título fica preso no alto do celular enquanto a pessoa rola a página." valor={config.travarCabecalho !== false} onChange={(v) => setCampo('travarCabecalho', v)} />
                  </Secao>

                  {config.mostrarBotaoComecar === false && (
                    <Secao titulo="Botão Começar">
                      <Chave rotulo="Mostrar botão de começar" descricao="Desligado, o participante cai direto na Tela 1." valor={false} onChange={(v) => setCampo('mostrarBotaoComecar', v)} />
                    </Secao>
                  )}
                  {config.mostrarBotaoComecar !== false && EfeitosBotao({
                    titulo: 'Botão Começar',
                    topo: (
                      <>
                        <Campo valor={config.pergunta1BotaoComecarTexto ?? 'COMEÇAR'} onChange={(v) => setCampo('pergunta1BotaoComecarTexto', v)} placeholder="Texto do botão" />
                        <Chave rotulo="Mostrar botão de começar" descricao="Desligado, o participante cai direto na Tela 1." valor onChange={(v) => setCampo('mostrarBotaoComecar', v)} />
                      </>
                    ),
                    ler: (k) => config[`comecar${k}`],
                    gravar: (k, v) => setCampo(`comecar${k}`, v),
                    alturaPadrao: 56,
                    alturaMax: 100,
                    raioPadrao: 16,
                    espessuraPadrao: 2.5,
                    fontePadrao: 16,
                    comLargura: true
                  })}

                  {EfeitosBotao({
                    titulo: 'Botão Avançar',
                    topo: <Campo valor={config.botaoAvancarTexto ?? 'Avançar'} onChange={(v) => setCampo('botaoAvancarTexto', v)} placeholder="Texto do botão" />,
                    ler: (k) => config[`avancar${k}`],
                    gravar: (k, v) => setCampo(`avancar${k}`, v),
                    alturaPadrao: 58,
                    alturaMax: 80,
                    raioPadrao: 16,
                    fontePadrao: 16
                  })}
                  {ConfigSetas((k) => config[`seta${k}`], (k, v) => setCampo(`seta${k}`, v))}
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: INÍCIO (CAPA DO EVENTO COM BOTÃO COMEÇAR)         */}
              {/* ====================================================== */}
              {activeTab === 'inicio_comecar' && (
                <div className="space-y-2.5">
                  {/* Mesma ordem do celular: o slider entre dois títulos é o espaço entre eles */}
                  <EstiloLinhasTitulo
                    key={activeTab}
                    linhas={[
                      { id: 'capaTitulo1', rotulo: 'Título 1', tam: config.capaFonteTamanho || 18, min: 12, max: 36, cor: 'branco', fundo: config.capaCaptionFundo || 'transparente', bold: true },
                      { id: 'capaTitulo2', rotulo: 'Título 2', tam: 16, min: 10, max: 32, cor: 'dourado', fundo: 'transparente', bold: true },
                      { id: 'capaTitulo3', rotulo: 'Título 3', tam: 15, min: 10, max: 30, cor: 'verde', fundo: 'transparente', bold: true },
                      { id: 'capaTextoAbaixo', rotulo: 'Texto abaixo', tam: 14, min: 9, max: 26, cor: 'cinza', fundo: 'escuro', bold: false, multilinha: true }
                    ].map((l) => {
                      const texto = l.multilinha ? (config.capaTextoAbaixo || config.pergunta1TextoAbaixo || '') : (config[l.id] ?? '');
                      return {
                        rotulo: l.rotulo,
                        texto,
                        onTexto: (v) => setCampo(l.id, v),
                        multilinha: Boolean(l.multilinha),
                        tamanho: config[`${l.id}Tamanho`] || l.tam,
                        min: l.min,
                        max: l.max,
                        onTamanho: (v) => setCampo(`${l.id}Tamanho`, v),
                        cor: config[`${l.id}Cor`] || l.cor,
                        onCor: (v) => setCampo(`${l.id}Cor`, v),
                        bold: config[`${l.id}Bold`] ?? l.bold,
                        onBold: (v) => setCampo(`${l.id}Bold`, v),
                        caixa: config[`${l.id}Caixa`],
                        onCaixa: (v) => setCampo(`${l.id}Caixa`, v),
                        ...fonteBordaLinha((k) => config[`${l.id}${k}`], (k, v) => setCampo(`${l.id}${k}`, v)),
                        alinhamento: config[`${l.id}Alinhamento`] || config.capaAlinhamento || 'center',
                        onAlinhamento: (v) => setCampo(`${l.id}Alinhamento`, v),
                        fundo: config[`${l.id}Fundo`] || l.fundo,
                        onFundo: (v) => setCampo(`${l.id}Fundo`, v),
                        faixa: config[`${l.id}Altura`] ?? config.capaAltura ?? config.faixaPadrao,
                        onFaixa: (v) => setCampo(`${l.id}Altura`, v),
                        espaco: Number(config[`${l.id}Espaco`] ?? CAPA_ESPACO_PADRAO),
                        onEspaco: !l.multilinha && texto ? (v) => setCampo(`${l.id}Espaco`, v) : undefined
                      };
                    })}
                  />

                  {linhasCapa(config).some((l) => l.classeCaixa) && (
                  <Secao titulo="Cards dos títulos" descricao="Vale para os títulos que têm cor de fundo. A altura de cada um fica dentro do título.">
                    <Segmentos rotulo="Formato" opcoes={[{ id: 'card', label: 'Card' }, { id: 'faixa', label: 'Faixa de ponta a ponta' }]} valor={config.capaFormato || 'card'} onChange={(v) => setCampo('capaFormato', v)} />
                    {(config.capaFormato || 'card') === 'card' && (
                      <>
                        <Segmentos rotulo="Efeito" opcoes={EFEITOS_CAPA} valor={config.capaEfeito || 'alto_relevo'} onChange={(v) => setCampo('capaEfeito', v)} />
                        {config.capaEfeito !== 'nenhum' && (
                          <Deslizante rotulo="Intensidade" valor={config.capaProfundidade || 5} min={1} max={10} unidade="" onChange={(v) => setCampo('capaProfundidade', v)} />
                        )}
                      </>
                    )}
                  </Secao>
                  )}
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: TELA 1 (COM TÍTULO 1 & 2 E SLIDERS DE DESIGN)    */}
              {/* ====================================================== */}
              {activeTab === 'tela_1' && (
                <div className="space-y-2.5">
                  <SubAbas
                    valor={subAtualP1}
                    onChange={setSubTabTela1}
                    opcoes={[
                      { id: 'pergunta', label: 'Títulos' },
                      { id: 'opcoes', label: rotuloPerguntas(cardsAtivosP1.length) },
                      ...(cardsAtivosP1.length > 0 ? [{ id: 'aparencia', label: 'Aparência dos cards' }] : [])
                    ]}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    {cardsAtivosP1.length > 0 && <BotaoObrigatorio valor={config.pergunta1Obrigatoria} onChange={(v) => setCampo('pergunta1Obrigatoria', v)} />}
                    {Heranca('p1')}
                  </div>

                  {subAtualP1 === 'pergunta' && (
                    <div className="space-y-2.5">
                      <EstiloLinhasTitulo
                        key={activeTab}
                        linhas={(() => {
                          const e = estiloLinhas(config, 'pergunta1');
                          return [
                            { rotulo: 'Título 1', texto: config.pergunta1Titulo ?? '', onTexto: (v) => setCampo('pergunta1Titulo', v), tamanho: config.pergunta1FonteTamanho || 18, min: 12, max: 36, onTamanho: (v) => setCampo('pergunta1FonteTamanho', v), cor: config.pergunta1TituloCor || 'branco', onCor: (v) => setCampo('pergunta1TituloCor', v), bold: config.pergunta1TituloBold !== false, onBold: (v) => setCampo('pergunta1TituloBold', v), caixa: config.pergunta1TituloCaixa, onCaixa: (v) => setCampo('pergunta1TituloCaixa', v), ...fonteBordaLinha((k) => config[`pergunta1Titulo${k}`], (k, v) => setCampo(`pergunta1Titulo${k}`, v)), alinhamento: e.tituloAl, onAlinhamento: (v) => setCampo('pergunta1TituloAlinhamento', v), fundo: e.tituloFundo, onFundo: (v) => setCampo('pergunta1TituloFundo', v), faixa: config.pergunta1TituloFaixa ?? config.faixaPadrao, onFaixa: (v) => gravarEstilo('p1', 'tituloFaixa', v) },
                            { rotulo: 'Título 2', texto: config.pergunta1Titulo2 ?? '', onTexto: (v) => setCampo('pergunta1Titulo2', v), tamanho: config.pergunta1Titulo2Tamanho || 16, min: 10, max: 32, onTamanho: (v) => setCampo('pergunta1Titulo2Tamanho', v), cor: config.pergunta1Titulo2Cor || 'dourado', onCor: (v) => setCampo('pergunta1Titulo2Cor', v) },
                            { rotulo: 'Título 3', texto: config.pergunta1Titulo3 ?? '', onTexto: (v) => setCampo('pergunta1Titulo3', v), tamanho: config.pergunta1Titulo3Tamanho || 15, min: 10, max: 30, onTamanho: (v) => setCampo('pergunta1Titulo3Tamanho', v), cor: config.pergunta1Titulo3Cor || 'verde', onCor: (v) => setCampo('pergunta1Titulo3Cor', v) },
                            { rotulo: 'Texto abaixo', texto: config.pergunta1TextoAbaixo ?? '', onTexto: (v) => setCampo('pergunta1TextoAbaixo', v), multilinha: true, tamanho: config.pergunta1TextoAbaixoTamanho || 14, min: 9, max: 26, onTamanho: (v) => setCampo('pergunta1TextoAbaixoTamanho', v), cor: config.pergunta1TextoAbaixoCor || 'cinza', onCor: (v) => setCampo('pergunta1TextoAbaixoCor', v), bold: Boolean(config.pergunta1SubBold), onBold: (v) => setCampo('pergunta1SubBold', v), caixa: config.pergunta1SubCaixa, onCaixa: (v) => setCampo('pergunta1SubCaixa', v), ...fonteBordaLinha((k) => config[`pergunta1Sub${k}`], (k, v) => setCampo(`pergunta1Sub${k}`, v)), alinhamento: e.subAl, onAlinhamento: (v) => setCampo('pergunta1SubAlinhamento', v), fundo: e.subFundo, onFundo: (v) => setCampo('pergunta1SubFundo', v), faixa: config.pergunta1SubFaixa ?? config.faixaPadrao, onFaixa: (v) => gravarEstilo('p1', 'subFaixa', v) }
                          ];
                        })()}
                      />
                      <ControleEspacos
                        valores={espacos(config, true)}
                        titulos={[config.pergunta1Titulo, config.pergunta1Titulo2, config.pergunta1Titulo3]}
                        subtitulo={config.pergunta1TextoAbaixo}
                        onChange={(k, v) => setCampo('pergunta1' + { tit: 'EspacoTitulos', sub: 'EspacoSub', cards: 'EspacoCards' }[k], v)}
                      />
                      {BarraFormatacao({ ehP1: true })}
                    </div>
                  )}

                  {subAtualP1 === 'aparencia' && (
                    <div className="space-y-2.5">
                      {AparenciaCards({ ler: (k) => config[k], gravar: (k, v) => gravarEstilo('p1', k, v), campoIcones: 'mostrarIconesCards', porPagina: cardsPorTelaP1, opcoes: cardsAtivosP1, raios: raiosCard(config, telaP1Cantos(config)) })}
                      {BarraFormatacao({ ehP1: true })}
                    </div>
                  )}

                  {/* 3. LISTA REFEITA DE OPÇÕES / CARDS DA TELA 1 */}
                  {subAtualP1 === 'opcoes' && (
                  <div className="space-y-3 pt-1 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {rotuloPerguntas(config.opcoesChegada?.length || 0)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cardsAtivosP1.length} de {config.opcoesChegada?.length || 0} visíveis no celular
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdicionarCardP1}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-white active:scale-95 text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" strokeWidth={4} />
                        <span>Add Questões</span>
                      </button>
                    </div>

                    <div>
                      {(config.opcoesChegada || []).length === 0 && (
                        <div className="py-6 border-t border-slate-800 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-300">
                            Tela 1 em branco (sem opções cadastradas ainda)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Clique em <strong>"Add Questões"</strong> acima, use <strong>"+ Inserir Tela"</strong> para montar Tela 2, Tela 3... ou clique em <strong>"Importar IA"</strong>.
                          </p>
                        </div>
                      )}
                      {(config.opcoesChegada || []).map((opcao, idx) => {
                        const isAtivo = opcao.ativo !== false;
                        const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                        const paginaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTelaP1)) : null;

                        return (
                          <QuestaoArrastavel
                            key={opcao.id || idx}
                            lista="p1"
                            indice={idx}
                            total={(config.opcoesChegada || []).length}
                            onMover={(de, para) => setConfig((c) => ({ ...c, opcoesChegada: moverItem(c.opcoesChegada, de, para) }))}
                            className={`-mx-3 px-5 py-2.5 flex flex-col gap-2 border-t border-dashed border-slate-600 ${isAtivo ? '' : 'opacity-50'}`}
                          >
                            {/* Barra Superior do Card */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivoP1(idx)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border ${
                                    isAtivo
                                      ? 'bg-slate-700/40 text-slate-200 border-slate-700 hover:bg-slate-700'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  {isAtivo ? <Eye className="w-3.5 h-3.5 text-slate-200" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                                  <span>{isAtivo ? 'Visível' : 'Oculto'}</span>
                                </button>

                                {isAtivo && (
                                  <span className="text-[11px] bg-slate-700/40 border border-slate-700 text-slate-200 px-2 py-0.5 rounded-full font-bold">
                                    Página {paginaDoCard}
                                  </span>
                                )}

                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDividirParaNovaTelaP1(idx)}
                                    title="Mover esta opção e as próximas para uma nova Tela (Tela 2, Tela 3...)"
                                    className="px-2 py-0.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    <span>Daqui em diante, nova tela</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Seletor de Ícone */}
                                <SeletorIcone
                                  opcoes={ICONES_CARDS}
                                  atual={iconesEditorP1[opcao.id]}
                                  manual={Boolean(opcao.iconeManual)}
                                  onChange={(id) => {
                                    if (id) handleUpdateOpcaoP1(idx, 'icone', id);
                                    handleUpdateOpcaoP1(idx, 'iconeManual', Boolean(id));
                                  }}
                                />

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
                                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                                  Título
                                </label>
                                <input
                                  type="text"
                                  value={opcao.titulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
                                  placeholder="Ex: Vi a faixa na igreja"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                                  Descrição (opcional)
                                </label>
                                <input
                                  type="text"
                                  value={opcao.subtitulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
                                  placeholder="Ex: Passei em frente e vi o anúncio"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner"
                                />
                              </div>
                            </div>

                            {/* CONFIGURAÇÃO DE GAVETA CONDICIONAL NA TELA 1 (MULTI-COMPONENTE) */}
                            <div>
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
                                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-slate-200 focus:ring-slate-200"
                                />
                                <span className={`text-xs font-bold ${opcao.temGaveta ? 'text-slate-200' : 'text-slate-400'}`}>
                                  Abrir uma subpergunta ao escolher esta opção
                                </span>
                              </label>

                              {opcao.temGaveta && (
                                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2.5 animate-fade-in">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-200 block mb-1">
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
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-200"
                                      >
                                        {TIPOS_GAVETA.map(tg => (
                                          <option key={tg.id} value={tg.id}>{tg.label}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-[11px] font-bold text-slate-200 block mb-1">
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
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1 text-xs text-white"
                                      />
                                    </div>
                                  </div>

                                  {/* Opções da Gaveta se for Radio ou Checkbox */}
                                  {(opcao.gaveta?.tipo === 'radio' || opcao.gaveta?.tipo === 'checkbox') && (
                                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-200">
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
                                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-white text-slate-900 text-[11px] font-bold flex items-center gap-1"
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
                                        <label className="text-[11px] text-slate-400 block">Mínimo</label>
                                        <input
                                          type="number"
                                          value={opcao.gaveta?.sliderMin ?? 0}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), sliderMin: Number(e.target.value) })}
                                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[11px] text-slate-400 block">Máximo</label>
                                        <input
                                          type="number"
                                          value={opcao.gaveta?.sliderMax ?? 10}
                                          onChange={(e) => handleUpdateOpcaoP1(idx, 'gaveta', { ...(opcao.gaveta || {}), sliderMax: Number(e.target.value) })}
                                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[11px] text-slate-400 block">Unidade</label>
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
                                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
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
                                          className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
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
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </QuestaoArrastavel>
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

                const numTela = numeroDaTela(extraIndex);
                const cardsAtivos = (telaAlvo.opcoes || []).filter(o => o.ativo !== false);
                const limitCards = Number(telaAlvo.cardsPorTela) || 4;
                const iconesEditorTela = iconesDaTela(cardsAtivos);
                const ehCards = (telaAlvo.tipo || 'cards') === 'cards';
                // Página com várias perguntas: no celular cada uma é pergunta simples, sem faixa de título
                const telasLigadas = (config.telasExtras || []).filter((t) => t && t.ativa !== false);
                const posLigada = telasLigadas.indexOf(telaAlvo);
                const emGrupo = posLigada < 0 ? membrosDaAba(`extra_${extraIndex}`).length > 1 : (continuaNaMesmaPagina(telasLigadas[posLigada - 1], telaAlvo) || continuaNaMesmaPagina(telaAlvo, telasLigadas[posLigada + 1]));
                // Perguntas que aparecem juntas nesta página (índices reais em telasExtras)
                let iniGrupo = posLigada;
                let fimGrupo = posLigada;
                while (iniGrupo > 0 && continuaNaMesmaPagina(telasLigadas[iniGrupo - 1], telasLigadas[iniGrupo])) iniGrupo--;
                while (fimGrupo >= 0 && fimGrupo + 1 < telasLigadas.length && continuaNaMesmaPagina(telasLigadas[fimGrupo], telasLigadas[fimGrupo + 1])) fimGrupo++;
                const membros = posLigada < 0 ? membrosDaAba(`extra_${extraIndex}`) : telasLigadas.slice(iniGrupo, fimGrupo + 1).map((t) => (config.telasExtras || []).indexOf(t));
                const ehTexto = ['texto', 'texto_curto'].includes(telaAlvo.tipo);
                const temLista = emGrupo || ehTexto;
                const propria = telaAlvo.herdarEstilo === false;
                const temEfeitos = telaAlvo.tipo === 'grade' || propria;
                const temAparencia = ehCards && cardsAtivos.length > 0;
                // Data, hora e estrelas não têm nada para ajustar no campo
                const semCampo = ehTexto || ['data', 'hora', 'rating'].includes(telaAlvo.tipo);
                const subAtual = (() => {
                  if (subTabExtra === 'opcoes' && semCampo) return temLista ? 'lista' : 'pergunta';
                  if (subTabExtra === 'lista' && !temLista) return semCampo ? 'pergunta' : 'opcoes';
                  if (subTabExtra === 'aparencia' && !temAparencia) return temEfeitos ? 'efeitos' : 'pergunta';
                  if (subTabExtra === 'efeitos' && !temEfeitos) return temAparencia ? 'aparencia' : 'pergunta';
                  return subTabExtra;
                })();

                return (
                  <div className="space-y-2.5">
                    {/* Barra Superior da Tela Extra */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">
                          Tela {numTela}
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
                          className="bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200"
                        >
                          {TIPOS_PERGUNTA.map(tp => (
                            <option key={tp.id} value={tp.id}>{tp.label}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => (membros.length > 1 ? excluirPagina(membros, numTela) : handleExcluirTela(extraIndex))}
                        className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition flex items-center gap-1"
                        title="Excluir esta tela inteira do fluxo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Tela {numTela}</span>
                      </button>
                    </div>

                    <SubAbas
                      valor={subAtual}
                      onChange={setSubTabExtra}
                      opcoes={[
                        ...(temLista ? [{ id: 'lista', label: rotuloPerguntas(membros.length) }] : []),
                        { id: 'pergunta', label: 'Títulos' },
                        ...(semCampo ? [] : [{
                          id: 'opcoes',
                          label: ['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating'].includes(telaAlvo.tipo)
                            ? 'Campo de resposta'
                            : temLista ? `Itens da Tela ${numTela} (${cardsAtivos.length})` : rotuloPerguntas(cardsAtivos.length)
                        }]),
                        ...(temAparencia ? [{ id: 'aparencia', label: 'Aparência dos cards' }] : []),
                        ...(temEfeitos ? [{ id: 'efeitos', label: 'Efeitos' }] : [])
                      ]}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {subAtual !== 'lista' && <BotaoObrigatorio valor={telaAlvo.obrigatorio} onChange={(v) => handleUpdateTelaProp(extraIndex, 'obrigatorio', v)} />}
                      {Heranca(membros)}
                    </div>

                    {subAtual === 'lista' && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200 mr-auto">{rotuloPerguntas(membros.length)} nesta página</span>
                          {FORMATOS_CAMPO.filter((f) => f.id).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              title={`Coloca o campo ${f.label} nesta mesma página`}
                              onClick={() => adicionarPergunta(membros[membros.length - 1], f.id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> {f.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => adicionarPergunta(membros[membros.length - 1])}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4 text-emerald-600" strokeWidth={4} />
                            <span>Add Questões</span>
                          </button>
                        </div>
                        <div>
                          {membros.map((iTela, pos) => {
                            const t = config.telasExtras[iTela];
                            const set = (k) => (v) => handleUpdateTelaProp(iTela, k, v);
                            return (
                              <QuestaoArrastavel
                                key={t.id || iTela}
                                lista={`pagina_${membros[0]}`}
                                indice={pos}
                                total={membros.length}
                                onMover={(de, para) => moverPergunta(membros, de, para)}
                                className="-mx-3 px-5 py-2.5 flex flex-col gap-2 border-t border-dashed border-slate-600"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-200 w-4">{pos + 1}</span>
                                  <BotaoObrigatorio valor={t.obrigatorio} onChange={set('obrigatorio')} />
                                  <select
                                    value={t.tipo}
                                    aria-label="Tipo da pergunta"
                                    onChange={(e) => set('tipo')(e.target.value)}
                                    className={`bg-slate-950/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 ${['texto', 'texto_curto'].includes(t.tipo) ? '' : 'hidden'}`}
                                  >
                                    <option value="texto">Campo longo</option>
                                    <option value="texto_curto">Campo de uma linha</option>
                                  </select>
                                  {['texto', 'texto_curto'].includes(t.tipo) && (
                                    <select
                                      value={t.formatoCampo || ''}
                                      aria-label="Formato da resposta"
                                      title="Formato da resposta"
                                      onChange={(e) => {
                                        const f = e.target.value;
                                        set('formatoCampo')(f);
                                        if (f) set('tipo')('texto_curto');
                                      }}
                                      className="bg-slate-950/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                                    >
                                      {FORMATOS_CAMPO.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => { setActiveTab(`extra_${iTela}`); setSubTabExtra('pergunta'); }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
                                  >
                                    Formatar texto
                                  </button>
                                  <button type="button" title="Excluir pergunta" aria-label="Excluir pergunta" onClick={() => excluirPergunta(membros, pos)} className="ml-auto p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <Campo
                                  rotulo="Pergunta"
                                  multilinha
                                  linhas={2}
                                  valor={[t.titulo1 ?? t.titulo, t.titulo2, t.titulo3].filter(Boolean).join(' ')}
                                  onChange={(v) => setConfig((c) => ({
                                    ...c,
                                    telasExtras: c.telasExtras.map((x, i) => (i === iTela ? { ...x, titulo: v, titulo1: v, titulo2: '', titulo3: '' } : x))
                                  }))}
                                />
                                {['texto', 'texto_curto'].includes(t.tipo) && (
                                  <Campo rotulo="Dica dentro do campo" valor={t.placeholder} onChange={set('placeholder')} placeholder="Digite sua resposta aqui..." />
                                )}
                                {['texto', 'texto_curto'].includes(t.tipo) && !['email', 'telefone'].includes(t.formatoCampo) && (
                                  <Chave rotulo={t.formatoCampo === 'nome' ? 'Nome sempre em MAIÚSCULAS' : 'Resposta sempre em MAIÚSCULAS'} descricao="Mesmo que a pessoa digite em minúsculas, aparece e fica gravado em maiúsculas." valor={Boolean(t.maiusculas)} onChange={set('maiusculas')} />
                                )}
                                {t.tipo === 'texto' && membros.length === 1 && (
                                  <Deslizante rotulo="Altura do campo" valor={t.linhas || 4} min={2} max={10} unidade=" linhas" onChange={set('linhas')} />
                                )}
                              </QuestaoArrastavel>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {subAtual === 'efeitos' && (
                      <div className="space-y-2.5">
                        {telaAlvo.tipo === 'grade' && (
                          <Secao titulo="Notas">
                            <Segmentos rotulo="Mostrar" opcoes={[{ id: 'numeros', label: 'Números' }, { id: 'rostos', label: 'Carinhas' }]} valor={(telaAlvo.gradeFormato ?? config.gradeFormato) || 'numeros'} onChange={(v) => gravarEstilo(extraIndex, 'gradeFormato', v)} />
                          </Secao>
                        )}
                        {telaAlvo.tipo === 'grade' && EfeitosBotao({
                          titulo: 'Botões de resposta',
                          ler: (k) => telaAlvo[`grade${k}`] ?? config[`grade${k}`],
                          gravar: (k, v) => gravarEstilo(extraIndex, `grade${k}`, v),
                          alturaPadrao: 38,
                          alturaMax: 72,
                          raioPadrao: 12
                        })}
                        {propria && !ehCards && EfeitosBotao({
                          titulo: 'Botão Avançar desta página',
                          ler: (k) => lerGeral(config, telaAlvo, 'avancar')(k),
                          gravar: (k, v) => membros.forEach((m) => handleUpdateTelaProp(m, `avancar${k}`, v)),
                          alturaPadrao: 58,
                          alturaMax: 80,
                          raioPadrao: 16,
                          fontePadrao: 16
                        })}
                        {propria && ConfigSetas(lerGeral(config, telaAlvo, 'seta'), (k, v) => membros.forEach((m) => handleUpdateTelaProp(m, `seta${k}`, v)))}
                        {BarraFormatacao({ ehP1: false, extraIndex })}
                      </div>
                    )}

                    {subAtual === 'pergunta' && (
                      <div className="space-y-2.5">
                        {membros.length > 1 && (
                          <Segmentos
                            rotulo="Formatar pergunta"
                            opcoes={membros.map((m, i) => ({ id: m, label: String(i + 1) }))}
                            valor={extraIndex}
                            onChange={(m) => setActiveTab(`extra_${m}`)}
                          />
                        )}
                        <EstiloLinhasTitulo
                          key={activeTab}
                          linhas={(() => {
                            const e = estiloLinhas(telaAlvo);
                            const set = (k) => (v) => handleUpdateTelaProp(extraIndex, k, v);
                            const linhasTela = [
                              { rotulo: 'Título 1', texto: telaAlvo.titulo1 ?? telaAlvo.titulo ?? '', onTexto: (v) => { set('titulo1')(v); set('titulo')(`${v} ${telaAlvo.titulo2 || ''}`.trim()); }, tamanho: telaAlvo.titulo1Tamanho || 18, min: 11, max: 36, onTamanho: set('titulo1Tamanho'), cor: telaAlvo.titulo1Cor || 'branco', onCor: set('titulo1Cor'), bold: telaAlvo.tituloBold !== false, onBold: set('tituloBold'), caixa: telaAlvo.tituloCaixa, onCaixa: set('tituloCaixa'), ...fonteBordaLinha((k) => telaAlvo[`titulo${k}`], (k, v) => handleUpdateTelaProp(extraIndex, `titulo${k}`, v)), alinhamento: e.tituloAl, onAlinhamento: set('tituloAlinhamento'), fundo: e.tituloFundo, onFundo: set('tituloFundo'), faixa: telaAlvo.tituloFaixa ?? config.faixaPadrao, onFaixa: (v) => gravarEstilo(extraIndex, 'tituloFaixa', v) },
                              { rotulo: 'Título 2', texto: telaAlvo.titulo2 ?? '', onTexto: (v) => { set('titulo2')(v); set('titulo')(`${telaAlvo.titulo1 || telaAlvo.titulo || ''} ${v}`.trim()); }, tamanho: telaAlvo.titulo2Tamanho || 15, min: 11, max: 36, onTamanho: set('titulo2Tamanho'), cor: telaAlvo.titulo2Cor || 'dourado', onCor: set('titulo2Cor') },
                              { rotulo: 'Título 3', texto: telaAlvo.titulo3 ?? '', onTexto: set('titulo3'), tamanho: telaAlvo.titulo3Tamanho || 14, min: 11, max: 36, onTamanho: set('titulo3Tamanho'), cor: telaAlvo.titulo3Cor || 'verde', onCor: set('titulo3Cor') },
                              { rotulo: 'Texto abaixo', texto: telaAlvo.subtitulo ?? '', onTexto: set('subtitulo'), multilinha: true, tamanho: telaAlvo.subtituloTamanho || 12, min: 9, max: 26, onTamanho: set('subtituloTamanho'), cor: telaAlvo.subtituloCor || 'cinza', onCor: set('subtituloCor'), bold: Boolean(telaAlvo.subBold), onBold: set('subBold'), caixa: telaAlvo.subCaixa, onCaixa: set('subCaixa'), ...fonteBordaLinha((k) => telaAlvo[`sub${k}`], (k, v) => handleUpdateTelaProp(extraIndex, `sub${k}`, v)), alinhamento: e.subAl, onAlinhamento: set('subAlinhamento'), fundo: e.subFundo, onFundo: set('subFundo'), faixa: telaAlvo.subFaixa ?? config.faixaPadrao, onFaixa: (v) => gravarEstilo(extraIndex, 'subFaixa', v) },
                              ...(telaAlvo.tipo === 'slider' ? [
                                {
                                  rotulo: 'Instrução', texto: instrucaoDaEscala(telaAlvo), onTexto: set('sliderInstrucao'), multilinha: true, placeholder: INSTRUCAO_PADRAO,
                                  tamanho: telaAlvo.instrucaoTamanho || 14, min: 9, max: 28, onTamanho: set('instrucaoTamanho'),
                                  cor: telaAlvo.instrucaoCor || 'tema', onCor: set('instrucaoCor'),
                                  bold: Boolean(telaAlvo.instrucaoBold), onBold: set('instrucaoBold'), caixa: telaAlvo.instrucaoCaixa, onCaixa: set('instrucaoCaixa'),
                                  ...fonteBordaLinha((k) => telaAlvo[`instrucao${k}`], (k, v) => handleUpdateTelaProp(extraIndex, `instrucao${k}`, v)),
                                  alinhamento: telaAlvo.instrucaoAlinhamento || 'center', onAlinhamento: set('instrucaoAlinhamento'),
                                  fundo: telaAlvo.instrucaoFundo || 'transparente', onFundo: set('instrucaoFundo'), faixa: telaAlvo.instrucaoAltura, onFaixa: set('instrucaoAltura'),
                                  abaixo: (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                      <Segmentos rotulo="Posição" opcoes={[{ id: 'acima', label: 'Acima da escala' }, { id: 'abaixo', label: 'Abaixo da escala' }]} valor={telaAlvo.instrucaoPosicao || 'acima'} onChange={set('instrucaoPosicao')} />
                                      <MiniSlider rotulo="Espaço" valor={Number(telaAlvo.instrucaoEspaco ?? 16)} min={0} max={60} onChange={set('instrucaoEspaco')} />
                                      <button type="button" onClick={() => set('sliderInstrucao')(INSTRUCAO_PADRAO)} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white transition">Usar texto sugerido</button>
                                    </div>
                                  )
                                }
                              ] : []),
                              ...(telaAlvo.tipo === 'grade' ? [
                                { rotulo: 'Legenda', texto: telaAlvo.legendaEscala ?? '', onTexto: set('legendaEscala'), placeholder: '1 = Péssimo; 5 = Ótimo; NA = Não se aplica', tamanho: telaAlvo.escalaTamanho || 9, min: 7, max: 18, onTamanho: set('escalaTamanho'), cor: telaAlvo.legendaCor || 'cinza', onCor: set('legendaCor'), alinhamento: telaAlvo.legendaAlinhamento || 'center', onAlinhamento: set('legendaAlinhamento'),
                                  extra: (
                                    <>
                                      <Segmentos
                                        rotulo=""
                                        opcoes={[
                                          { id: 0, label: 'Corrida', dica: 'Uma ao lado da outra', conteudo: <WrapText className="w-3.5 h-3.5" /> },
                                          { id: 1, label: '1 coluna', conteudo: <span className="flex items-center gap-1"><Rows3 className="w-3.5 h-3.5" />1</span> },
                                          { id: 2, label: '2 colunas', conteudo: <span className="flex items-center gap-1"><Columns2 className="w-3.5 h-3.5" />2</span> }
                                        ]}
                                        valor={Number(telaAlvo.legendaColunas) || 0}
                                        onChange={set('legendaColunas')}
                                      />
                                      <button
                                        type="button"
                                        aria-pressed={Boolean(telaAlvo.legendaIcones)}
                                        title="Mostrar uma carinha ao lado de cada nota da legenda"
                                        onClick={() => set('legendaIcones')(!telaAlvo.legendaIcones)}
                                        className={`flex items-center gap-1 px-2 h-6 rounded-md text-[11px] font-semibold transition ${telaAlvo.legendaIcones ? 'bg-slate-100 text-slate-900' : 'bg-slate-950/60 text-slate-400 hover:text-white'}`}
                                      >
                                        <IconeRosto className="w-3.5 h-3.5" /> Ícones
                                      </button>
                                    </>
                                  ),
                                  bold: Boolean(telaAlvo.legendaBold), onBold: set('legendaBold'), caixa: telaAlvo.legendaCaixa, onCaixa: set('legendaCaixa'), ...fonteBordaLinha((k) => telaAlvo[`legenda${k}`], (k, v) => handleUpdateTelaProp(extraIndex, `legenda${k}`, v)), fundo: telaAlvo.legendaFundo || 'escuro', onFundo: set('legendaFundo'), faixa: telaAlvo.legendaFaixa, onFaixa: set('legendaFaixa') },
                                { rotulo: 'Itens da grade', texto: cardsAtivos.map((o) => o.titulo).join(', '), tamanho: telaAlvo.itemTamanho || 12, min: 8, max: 20, onTamanho: set('itemTamanho'), cor: telaAlvo.itemCor || 'branco', onCor: set('itemCor'), bold: telaAlvo.itemBold !== false, onBold: set('itemBold'), caixa: telaAlvo.itemCaixa, onCaixa: set('itemCaixa'), ...fonteBordaLinha((k) => telaAlvo[`item${k}`], (k, v) => handleUpdateTelaProp(extraIndex, `item${k}`, v)), fundo: telaAlvo.itemFundo || 'escuro', onFundo: set('itemFundo'), faixa: telaAlvo.itemFaixa, onFaixa: set('itemFaixa') }
                              ] : [])
                            ];
                            if (!emGrupo) return linhasTela;
                            return linhasTela.map((l) => {
                              if (l.rotulo === 'Título 1') return { ...l, rotulo: 'Pergunta', multilinha: true, onFundo: undefined, onFaixa: undefined };
                              if (l.rotulo === 'Texto abaixo') return { ...l, onFundo: undefined, onFaixa: undefined };
                              // Títulos 2 e 3 entram na mesma frase da pergunta, com o estilo dela
                              if (l.rotulo === 'Título 2' || l.rotulo === 'Título 3') return String(l.texto || '').trim() ? { rotulo: l.rotulo.replace('Título', 'Parte'), texto: l.texto, onTexto: l.onTexto } : null;
                              return l;
                            }).filter(Boolean);
                          })()}
                        />
                        <ControleEspacos
                          valores={espacos(telaAlvo, false)}
                          titulos={emGrupo ? [telaAlvo.titulo1 || telaAlvo.titulo] : [telaAlvo.titulo1 || telaAlvo.titulo, telaAlvo.titulo2, telaAlvo.titulo3]}
                          subtitulo={telaAlvo.subtitulo}
                          onChange={(k, v) => handleUpdateTelaProp(extraIndex, { tit: 'espacoTitulos', sub: 'espacoSub', cards: 'espacoCards' }[k], v)}
                        />
                        {extraIndex > 0 && TIPOS_CAMPO_PAGINA.includes(telaAlvo.tipo) && TIPOS_CAMPO_PAGINA.includes((config.telasExtras || [])[extraIndex - 1]?.tipo) && (
                          <Secao>
                            <Chave
                              rotulo="Continuar na mesma página da tela anterior"
                              descricao="O participante rola a tela e responde em sequência."
                              valor={telaAlvo.mesmaPagina ?? (telaAlvo.tipo === 'texto' && (config.telasExtras || [])[extraIndex - 1]?.tipo === 'texto')}
                              onChange={(v) => handleUpdateTelaProp(extraIndex, 'mesmaPagina', v)}
                            />
                          </Secao>
                        )}
                        {BarraFormatacao({ ehP1: false, extraIndex })}
                      </div>
                    )}

                    {subAtual === 'aparencia' && (
                      <div className="space-y-2.5">
                        {AparenciaCards({
                          ler: (k) => telaAlvo[k] ?? config[k],
                          gravar: (k, v) => gravarEstilo(extraIndex, k, v),
                          raios: raiosCard(config, telaAlvo),
                          campoIcones: 'mostrarIcones',
                          porPagina: limitCards,
                          opcoes: cardsAtivos
                        })}
                        {BarraFormatacao({ ehP1: false, extraIndex })}
                      </div>
                    )}

                    {subAtual === 'opcoes' && (
                      <div className="space-y-3">
                    {/* CONFIGURAÇÃO ESPECÍFICA CONFORME O TIPO DA TELA EXTRA */}
                    {['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating'].includes(telaAlvo.tipo) ? (
                      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 space-y-3.5 shadow-lg animate-fade-in">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                          <AlignLeft className="w-4 h-4 text-slate-200" />
                          <span className="text-xs font-semibold text-slate-200">
                            {TIPOS_PERGUNTA.find(t => t.id === telaAlvo.tipo)?.label || 'Configurações do Campo'}
                          </span>
                        </div>

                        {telaAlvo.tipo === 'slider' && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-semibold text-slate-200 block">Estilo da escala</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {ESTILOS_ESCALA.map((es) => {
                                const sel = (telaAlvo.estiloEscala || 'slider') === es.id;
                                return (
                                  <button
                                    key={es.id}
                                    type="button"
                                    onClick={() => handleUpdateTelaProp(extraIndex, 'estiloEscala', es.id)}
                                    className={`p-2 rounded-xl border text-left transition ${sel ? 'bg-slate-700/40 border-slate-200' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                  >
                                    <div className="pointer-events-none h-[86px] overflow-hidden flex items-center">
                                      <div className="w-full"><EscalaVisual tela={{ ...telaAlvo, estiloEscala: es.id }} mini escala={0.45} valor={String(Math.round(((telaAlvo.sliderMin ?? 0) + (telaAlvo.sliderMax ?? 10)) * (es.id === 'carinhas' || ['boneco', 'coruja', 'gato', 'robo'].includes(es.id) ? 0.8 : 0.7)))} onChange={() => {}} /></div>
                                    </div>
                                    <span className={`block text-[11px] font-bold mt-1 ${sel ? 'text-slate-200' : 'text-slate-400'}`}>{es.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {telaAlvo.tipo === 'slider' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Valor Mínimo</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderMin ?? 0}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderMin', Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Valor Máximo</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderMax ?? 10}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderMax', Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Passo (Step)</label>
                              <input
                                type="number"
                                value={telaAlvo.sliderStep ?? 1}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderStep', Number(e.target.value) || 1)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Sufixo/Unidade</label>
                              <input
                                type="text"
                                value={telaAlvo.sliderUnidade || ''}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'sliderUnidade', e.target.value)}
                                placeholder="Ex: pts, %"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(telaAlvo.tipo === 'texto' || telaAlvo.tipo === 'texto_curto') && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                                Placeholder da Caixa (Texto de Dica)
                              </label>
                              <input
                                type="text"
                                value={telaAlvo.placeholder || ''}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'placeholder', e.target.value)}
                                placeholder={telaAlvo.tipo === 'texto_curto' ? 'Ex: Digite seu nome ou WhatsApp...' : 'Ex: Digite sua sugestão ou comentário...'}
                                className="w-full bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                              />
                            </div>
                          )}

                        </div>

                        <div className={telaAlvo.tipo === 'texto' && !emGrupo ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800' : 'hidden'}>
                          {telaAlvo.tipo === 'texto' && !emGrupo && (
                            <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-300 font-bold">Altura (Linhas):</span>
                              <div className="flex items-center gap-1">
                                {[2, 3, 4, 5, 6].map((l) => (
                                  <button
                                    key={l}
                                    type="button"
                                    onClick={() => handleUpdateTelaProp(extraIndex, 'linhas', l)}
                                    className={`w-6 h-6 rounded-lg font-bold text-xs ${
                                      (telaAlvo.linhas || 4) === l ? 'bg-slate-100 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ) : (
                      /* CONFIGURAÇÃO ESPECÍFICA: CARDS, GRADE/MATRIZ, RADIO BUTTON, CHECKBOX OU LISTA SUSPENSA */
                      <div className="space-y-3">
                        {telaAlvo.tipo === 'grade' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2 border-b border-slate-800/80">
                            <div>
                              <label className="text-[11px] font-bold text-slate-200 block mb-1">
                                Colunas da Escala (separadas por vírgula)
                              </label>
                              <input
                                type="text"
                                value={(telaAlvo.colunasGrade || ['1', '2', '3', '4', '5', 'NA']).join(', ')}
                                onChange={(e) => {
                                  const cols = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  handleUpdateTelaProp(extraIndex, 'colunasGrade', cols.length > 0 ? cols : ['1', '2', '3', '4', '5', 'NA']);
                                }}
                                placeholder="Ex: 1, 2, 3, 4, 5, NA"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                                Legenda da Escala (Exibida no topo da grade)
                              </label>
                              <input
                                type="text"
                                value={telaAlvo.legendaEscala || ''}
                                onChange={(e) => handleUpdateTelaProp(extraIndex, 'legendaEscala', e.target.value)}
                                placeholder="Ex: 1 = Péssimo a 5 = Ótimo | NA = Não se aplica"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                              />
                            </div>
                          </div>
                        )}

                        {/* Opções / Itens desta Tela Extra */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300">
                              {rotuloPerguntas(telaAlvo.opcoes?.length || 0)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAddCardExtra(extraIndex)}
                              className="px-3 py-1 bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4 text-emerald-600" strokeWidth={4} />
                              <span>Add Questões</span>
                            </button>
                          </div>

                          <div>
                            {(telaAlvo.opcoes || []).map((opcao, optIdx) => {
                              const isAtivo = opcao.ativo !== false;

                              return (
                                <QuestaoArrastavel
                                  key={opcao.id || optIdx}
                                  lista={`extra_${extraIndex}`}
                                  indice={optIdx}
                                  total={(telaAlvo.opcoes || []).length}
                                  onMover={(de, para) => setConfig((c) => ({
                                    ...c,
                                    telasExtras: (c.telasExtras || []).map((t, i) => (i === extraIndex ? { ...t, opcoes: moverItem(t.opcoes, de, para) } : t))
                                  }))}
                                  className={`-mx-3 px-5 py-2.5 flex flex-col gap-2 border-t border-dashed border-slate-600 ${isAtivo ? '' : 'opacity-50'}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCardExtra(extraIndex, optIdx)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition border ${
                                          isAtivo
                                            ? 'bg-slate-700/40 text-slate-200 border-slate-700 hover:bg-slate-700'
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
                                          className="px-2 py-0.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition"
                                        >
                                          <ArrowRight className="w-3 h-3" />
                                          <span>Daqui em diante, Tela {numTela + 1}</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {ehCards && (
                                        <SeletorIcone
                                          opcoes={ICONES_CARDS}
                                          atual={iconesEditorTela[opcao.id]}
                                          manual={Boolean(opcao.iconeManual)}
                                          onChange={(id) => {
                                            if (id) handleUpdateCardExtra(extraIndex, optIdx, 'icone', id);
                                            handleUpdateCardExtra(extraIndex, optIdx, 'iconeManual', Boolean(id));
                                          }}
                                        />
                                      )}

                                      <div className={ehCards ? 'flex items-center gap-1' : 'hidden'}>
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

                                  <div className={`grid grid-cols-1 gap-2 ${telaAlvo.tipo === 'grade' ? '' : 'sm:grid-cols-2'}`}>
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Título</label>
                                      <input
                                        type="text"
                                        value={opcao.titulo || ''}
                                        onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'titulo', e.target.value)}
                                        placeholder="Ex: Sim, é minha primeira vez!"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-inner"
                                      />
                                    </div>
                                    <div className={telaAlvo.tipo === 'grade' ? 'hidden' : ''}>
                                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Descrição (opcional)</label>
                                      <input
                                        type="text"
                                        value={opcao.subtitulo || ''}
                                        onChange={(e) => handleUpdateCardExtra(extraIndex, optIdx, 'subtitulo', e.target.value)}
                                        placeholder="Ex: Detalhe complementar"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-inner"
                                      />
                                    </div>
                                  </div>

                                  {/* CONFIGURAÇÃO DE GAVETA CONDICIONAL MULTI-COMPONENTE NA OPÇÃO EXTRA */}
                                  <div className={['cards', 'radio', 'checkbox'].includes(telaAlvo.tipo || 'cards') ? '' : 'hidden'}>
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
                                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-slate-200 focus:ring-slate-200"
                                      />
                                      <span className={`text-[11px] font-bold ${opcao.temGaveta ? 'text-slate-200' : 'text-slate-400'}`}>
                                        Abrir uma subpergunta ao escolher esta opção
                                      </span>
                                    </label>

                                    {opcao.temGaveta && (
                                      <div className="mt-2 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700 space-y-2 animate-fade-in">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-[11px] font-bold text-slate-200 block mb-0.5">
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
                                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-200"
                                            >
                                              {TIPOS_GAVETA.map(tg => (
                                                <option key={tg.id} value={tg.id}>{tg.label}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="text-[11px] font-bold text-slate-200 block mb-0.5">
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
                                              className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2 py-1 text-xs text-white"
                                            />
                                          </div>
                                        </div>

                                        {(opcao.gaveta?.tipo === 'radio' || opcao.gaveta?.tipo === 'checkbox') && (
                                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[11px] font-bold text-slate-200">Opções da Gaveta</span>
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
                                                className="px-2 py-0.5 rounded bg-slate-100 text-white text-[11px] font-bold"
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
                                              <label className="text-[11px] font-bold text-slate-400 block mb-0.5">
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
                                                className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-200"
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <label className="text-[11px] font-bold text-slate-400 block mb-0.5">
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
                                              className="w-full bg-slate-950 border border-slate-700 focus:border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </QuestaoArrastavel>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ====================================================== */}
              {/* ABA: TELA FINAL (AGRADECIMENTO / CONCLUÍDO)            */}
              {/* ====================================================== */}
              {activeTab === 'fim' && (
                <EstiloLinhasTitulo
                  key={activeTab}
                  linhas={LINHAS_FINAL.map((l, i) => {
                    const e = estiloLinhaFinal(config, l);
                    const onTexto = (v) => setConfig((c) => {
                      const novo = { ...c, [l.id]: v };
                      if (l.h1) novo.finalTitulo = `${novo.finalTitulo1 ?? ''} ${novo.finalTitulo2 ?? ''}`.trim();
                      return novo;
                    });
                    return {
                      rotulo: l.rotulo, texto: e.texto, onTexto, multilinha: l.multilinha,
                      tamanho: e.tamanho, min: l.min, max: l.max, onTamanho: (v) => setCampo(chaveTamanho(l), v),
                      familia: e.familia, onFamilia: (v) => setCampo(`${l.id}Familia`, v),
                      cor: e.cor, onCor: (v) => setCampo(`${l.id}Cor`, v),
                      bold: e.bold, onBold: (v) => setCampo(`${l.id}Bold`, v),
                      caixa: e.caixa, onCaixa: (v) => setCampo(`${l.id}Caixa`, v),
                      alinhamento: e.alinhamento, onAlinhamento: (v) => setCampo(`${l.id}Alinhamento`, v),
                      fundo: e.fundo, onFundo: (v) => setCampo(`${l.id}Fundo`, v),
                      faixa: e.altura, onFaixa: (v) => setCampo(`${l.id}Altura`, v),
                      borda: config[`${l.id}Borda`], onBorda: (v) => setCampo(`${l.id}Borda`, v),
                      bordaLargura: config[`${l.id}BordaLargura`], onBordaLargura: (v) => setCampo(`${l.id}BordaLargura`, v),
                      espaco: e.espaco,
                      onEspaco: i < LINHAS_FINAL.length - 1 && LINHAS_FINAL.slice(i + 1).some((x) => String(estiloLinhaFinal(config, x).texto || '').trim()) ? (v) => setCampo(`${l.id}Espaco`, v) : undefined,
                      abaixo: <CamposFinais config={config} linha={l.id} texto={e.texto} tamanhoLinha={e.tamanho} min={l.min} max={l.max} onTexto={onTexto} setConfig={setConfig} />
                    };
                  })}
                />
              )}

              {/* ====================================================== */}
              {/* ABA: TELA DE ACOMPANHANTES (OPCIONAL)                  */}
              {/* ====================================================== */}
              {activeTab === 'acompanhantes' && (
                <div className="space-y-2.5">
                  <SubAbas
                    valor={subTabTela2}
                    onChange={setSubTabTela2}
                    opcoes={[
                      { id: 'pergunta', label: 'Títulos' },
                      { id: 'botoes', label: 'Botões de quantidade' },
                      { id: 'individual', label: 'Botão "Só eu"' }
                    ]}
                  />

                  {subTabTela2 === 'pergunta' && (
                    <Secao titulo="Pergunta">
                      <Campo rotulo="Título, linha 1" valor={config.pergunta2Titulo} onChange={(v) => setCampo('pergunta2Titulo', v)} placeholder="Você está só ou tem mais" />
                      <Campo rotulo="Título, linha 2 (opcional)" valor={config.pergunta2Titulo2} onChange={(v) => setCampo('pergunta2Titulo2', v)} placeholder="pessoas te acompanhando?" />
                      <SeletorFonte valor={config.pergunta2Familia} onChange={(v) => setCampo('pergunta2Familia', v)} />
                      <Deslizante rotulo="Tamanho" valor={config.pergunta2FonteTamanho || 18} min={14} max={28} onChange={(v) => setCampo('pergunta2FonteTamanho', v)} />
                    </Secao>
                  )}

                  {subTabTela2 === 'botoes' && (
                    <>
                      <Secao titulo="Forma">
                        <Deslizante rotulo="Altura" valor={config.btnQtdAltura || 74} min={44} max={100} onChange={(v) => setCampo('btnQtdAltura', v)} />
                        <Deslizante rotulo="Largura" valor={config.btnQtdLargura || 100} min={60} max={100} passo={2} unidade="%" onChange={(v) => setCampo('btnQtdLargura', v)} />
                        <Deslizante rotulo="Borda" valor={config.btnQtdBordaEspessura || 1} min={1} max={6} onChange={(v) => setCampo('btnQtdBordaEspessura', v)} />
                      </Secao>
                      <Secao titulo="Cor e efeito">
                        <Cores rotulo="Cor do botão" opcoes={CORES_BOTAO_QTD} campo="dot" valor={config.btnQtdCor || 'slate'} onChange={(v) => setCampo('btnQtdCor', v)} />
                        <Segmentos rotulo="Efeito" opcoes={EFEITOS_CARDS} valor={config.btnQtdEfeito || 'efeito_3d'} onChange={(v) => setCampo('btnQtdEfeito', v)} />
                        <Deslizante rotulo="Intensidade" valor={config.btnQtdProfundidade || 5} min={1} max={10} unidade="" onChange={(v) => setCampo('btnQtdProfundidade', v)} />
                      </Secao>
                      <Secao titulo="Número e legenda">
                        <Deslizante rotulo="Número" valor={config.btnQtdFonteNumero || 34} min={18} max={48} onChange={(v) => setCampo('btnQtdFonteNumero', v)} />
                        <Cores rotulo="Cor do número" opcoes={CORES_NUMERO_QTD} campo="dot" valor={config.btnQtdCorNumero || 'branco'} onChange={(v) => setCampo('btnQtdCorNumero', v)} />
                        <Deslizante rotulo="Legenda" valor={config.btnQtdFonteDescricao || 11} min={9} max={16} onChange={(v) => setCampo('btnQtdFonteDescricao', v)} />
                        <Lista rotulo="Cor da legenda" opcoes={CORES_DESCRICAO_QTD} valor={config.btnQtdCorDescricao || 'branco_80'} onChange={(v) => setCampo('btnQtdCorDescricao', v)} />
                      </Secao>
                    </>
                  )}

                  {subTabTela2 === 'individual' && (
                    <Secao titulo="Textos">
                      <Campo rotulo="Botão de 1 pessoa" valor={config.opcaoIndividualTitulo} onChange={(v) => setCampo('opcaoIndividualTitulo', v)} placeholder="SÓ EU" />
                      <Campo rotulo="Complemento" valor={config.opcaoIndividualSubtitulo} onChange={(v) => setCampo('opcaoIndividualSubtitulo', v)} placeholder=", vim sozinho" />
                      <Campo rotulo="Divisor antes das quantidades" valor={config.divisorQtdTexto} onChange={(v) => setCampo('divisorQtdTexto', v)} placeholder="Quantas pessoas vieram com você?" />
                    </Secao>
                  )}

                  <button
                    type="button"
                    onClick={() => alternarTela('acompanhantes')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{telaOculta('acompanhantes') ? 'Usar esta tela neste evento' : 'Não usar esta tela neste evento'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ========================================================== */}
          {/* LINHA RESIZER / SPLITTER EDITÁVEL COM BRILHO VERDE        */}
          {/* ========================================================== */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            className="hidden lg:flex w-3.5 -mx-[7px] cursor-col-resize items-center justify-center z-30 group relative select-none shrink-0"
            title="Arraste para redimensionar colunas (esquerda ou celulares)"
          >
            {/* Linha vertical que brilha em verde no hover ou durante o arrasto */}
            <div className={`h-full transition-all duration-150 ${
              isDragging
                ? 'w-[3px] bg-slate-100'
                : 'w-[2px] bg-slate-800 group-hover:w-[3px] group-hover:bg-slate-400 group-hover:'
            }`} />

            {/* Pílula / Botão de pegada central com efeito verde */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-10 rounded-full border flex flex-col items-center justify-center gap-1 transition-all ${
              isDragging
                ? 'bg-slate-100 border-slate-700 scale-110'
                : 'bg-slate-900 border-slate-700 group-hover:border-slate-400 group-hover:bg-slate-400 group-hover:'
            }`}>
              <div className={`w-1 h-1 rounded-full transition-colors ${isDragging ? 'bg-black' : 'bg-slate-400 group-hover:bg-slate-400'}`} />
              <div className={`w-1 h-1 rounded-full transition-colors ${isDragging ? 'bg-black' : 'bg-slate-400 group-hover:bg-slate-400'}`} />
              <div className={`w-1 h-1 rounded-full transition-colors ${isDragging ? 'bg-black' : 'bg-slate-400 group-hover:bg-slate-400'}`} />
            </div>
          </div>

          {/* ========================================================== */}
          {/* COLUNA DIREITA: PREVIEW DOS CELULARES (GRID 3 EM 3 COMPACTO) */}
          {/* ========================================================== */}
          <div
            ref={previewColRef}
            onClickCapture={(e) => {
              const card = e.target.closest('[data-preview]');
              const col = previewColRef.current;
              if (!card || !col) return;
              const topo = card.getBoundingClientRect().top - col.getBoundingClientRect().top + col.scrollTop - 8;
              col.scrollTo({ top: Math.max(0, topo), behavior: 'smooth' });
            }}
            className="flex-1 min-w-0 min-h-0 bg-slate-950/90 flex flex-col p-2 sm:p-3 relative overflow-y-auto custom-scrollbar"
          >
            
            {/* GRID DOS CELULARES: 3 POR LINHA FLUIDO E RESPONSIVO */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-6 place-items-center mt-1">
              {(() => {
                // Mesma sequência de telas que o celular percorre
                const todas = config.telasExtras || [];
                const ativas = todas.map((t, i) => ({ t, i })).filter(({ t }) => t && t.ativa !== false);
                const telas = [
                  { chave: 'inicio', passo: 'espera', rotulo: 'Espera (pesquisa não liberada)', fixa: true },
                  { chave: 'inicio_comecar', passo: 'comecar', rotulo: 'Início (botão Começar)' },
                  { chave: 'tela_1', passo: 'tela_1', rotulo: 'Tela 1' },
                  // Telas que "continuam na mesma página" aparecem dentro do celular anterior (igual ao aparelho)
                  ...paginasExtras.map(({ membros, numero }) => ({
                    chave: `extra_${membros[0]}`,
                    membros: membros.map((m) => `extra_${m}`),
                    passo: `extra_${ativas.findIndex(({ i }) => i === membros[0])}`,
                    indices: membros,
                    rotulo: `Tela ${numero}`
                  })),
                  { chave: 'acompanhantes', passo: 'acompanhantes', rotulo: 'Acompanhantes' },
                  { chave: 'fim', passo: 'final', rotulo: 'Tela final', fixa: true }
                ].map((t) => ({ ...t, oculta: telaOculta(t.chave) }));

                return (
                  <>
                    {telas.map((tl) => {
                      const olho = tl.fixa ? null : <OlhoTela oculta={tl.oculta} rotulo={tl.rotulo} onClick={() => alternarTela(tl.chave, tl.indices)} />;
                      if (tl.oculta) {
                        const sel = (tl.membros || [tl.chave]).includes(activeTab);
                        return (
                          <div key={`prev_off_${tl.chave}`} data-preview="1" className="w-full flex flex-col items-center gap-1.5 p-0.5">
                            <button
                              type="button"
                              onClick={() => (tl.indices ? abrirPagina(tl.indices) : setActiveTab(tl.chave))}
                              className={`w-full max-w-[260px] aspect-[9/16] rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3 p-4 text-center text-xs transition ${sel ? 'border-slate-200 text-slate-200' : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}
                            >
                              <EyeOff className="w-8 h-8" />
                              <span>Oculta: o celular pula esta tela</span>
                            </button>
                            <span className="flex items-center gap-1">
                              <span className={`text-xs line-through ${sel ? 'text-white font-semibold' : 'text-slate-500'}`}>{tl.rotulo}</span>
                              {olho}
                            </span>
                          </div>
                        );
                      }
                      return (
                      <PreviewCelular
                        acao={olho}
                        key={`prev_${tl.chave}`}
                        config={config}
                        titulo={eventoTitulo}
                        passo={tl.passo}
                        viewport={modeloAtual.viewport}
                        moldura={modeloAtual.moldura}
                        rotulo={tl.rotulo}
                        selecionado={(tl.membros || [tl.chave]).includes(activeTab)}
                        onSelecionar={() => (tl.indices ? abrirPagina(tl.indices) : setActiveTab(tl.chave))}
                        onNavegar={(passo) => {
                          const m = /^extra_(\d+)$/.exec(passo);
                          const chaveReal = m && ativas[Number(m[1])] ? `extra_${ativas[Number(m[1])].i}` : null;
                          const alvo = telas.find((t) => t.passo === passo && !t.oculta) || telas.find((t) => chaveReal && (t.membros || []).includes(chaveReal));
                          if (alvo) { if (alvo.indices) abrirPagina(alvo.indices); else setActiveTab(alvo.chave); }
                        }}
                      />
                      );
                    })}
                  </>
                );
              })()}
            </div>

            <p className="text-[11px] text-slate-500 mt-auto py-2 font-medium text-center shrink-0">
              {modeloAtual.nome} • tamanho real do aparelho em escala — o celular selecionado é interativo
            </p>
          </div>

        </div>

                {/* ============================================================ */}
        {/* RODAPÉ COM AÇÕES                                             */}
        {/* ============================================================ */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {!inline && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                className="px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
            )}

            <span className={`text-[11px] font-bold ${autoSalvo === 'erro' ? 'text-rose-300' : autoSalvo === 'pendente' ? 'text-slate-200' : 'text-slate-200'}`}>
              {autoSalvo === 'pendente' ? 'Salvando automaticamente...' : autoSalvo === 'salvo' ? '✓ Salvo no banco' : autoSalvo === 'erro' ? 'Erro ao salvar — verifique o login' : ''}
            </span>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="px-5 py-1.5 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-xl shadow-lg  active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {salvo ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo</span>
                </>
              ) : salvando ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
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
                  <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-200 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Inserir Nova Tela</h3>
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
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-400 hover:bg-slate-900 text-left transition group space-y-1 shadow-sm"
                  >
                    <h4 className="text-xs font-semibold text-white group-hover:text-white transition-colors">
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
                  <div className="w-9 h-9 rounded-xl bg-slate-700/40 text-slate-200 border border-slate-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Modelos Prontos de Pesquisa</h3>
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
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/40 border border-slate-700 text-slate-200">
                          {preset.tag}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
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
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0"
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
        {/* MODAL 3: IMPORTADOR INTELIGENTE (.PDF / .PPTX / .DOCX / TXT)  */}
        {/* ============================================================ */}
        {showImportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-slate-200" /> Criar telas com IA</h3>
                  <p className="text-xs text-slate-400">Envie um questionário, avaliação ou simulado e revise as telas antes de aplicar.</p>
                </div>
                <button type="button" onClick={() => setShowImportModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ImportadorIA permitirAdicionar onAplicar={handleAplicarImportacao} textoAplicar="Aplicar no evento" />
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
                  ? 'bg-slate-700/40 text-slate-200 border-slate-700 shadow-emerald-950/40'
                  : 'bg-slate-700/40 text-slate-200 border-slate-700 shadow-amber-950/40'
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
                <h3 className="text-base sm:text-lg font-semibold text-white">
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
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition active:scale-95"
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
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs transition active:scale-95 shadow-lg ${
                    modalFeedback.tipo === 'erro'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30'
                      : 'bg-slate-100 hover:bg-white text-slate-950 shadow-amber-900/30'
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
