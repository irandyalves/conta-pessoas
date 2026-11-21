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
  Layers, 
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
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  TreePine,
  Wifi,
  Battery,
  User,
  Info
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

export default function QuestionsConfigModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('pergunta1'); // 'pergunta1' | 'acompanhantes' | 'extras'
  const [config, setConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Estado do Preview do Celular
  const [previewScreen, setPreviewScreen] = useState('p1'); // 'p1' | 'p2' | 'espera'
  const [previewPage, setPreviewPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedQuestionsConfig());
      setEventoTitulo(getSavedEventTitle() || 'CANTATA DE NATAL 2026');
      setSalvo(false);
      setPreviewPage(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'acompanhantes') {
      setPreviewScreen('p2');
    } else if (activeTab === 'pergunta1') {
      setPreviewScreen('p1');
    }
  }, [activeTab]);

  if (!isOpen) return null;

  // Cálculos dinâmicos
  const cardsAtivos = (config.opcoesChegada || []).filter(c => c.ativo !== false);
  const cardsPorTela = Number(config.cardsPorTela) || 4;
  const totalPaginasPreview = Math.max(1, Math.ceil(cardsAtivos.length / cardsPorTela));
  const safePreviewPage = Math.min(previewPage, totalPaginasPreview - 1);
  const cardsNaPaginaAtual = cardsAtivos.slice(
    safePreviewPage * cardsPorTela,
    (safePreviewPage + 1) * cardsPorTela
  );

  // Modificar campo de uma opção
  const handleUpdateOpcao = (index, field, value) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { ...novasOpcoes[index], [field]: value };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  // Alternar ativo/inativo
  const handleToggleAtivo = (index) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { 
        ...novasOpcoes[index], 
        ativo: novasOpcoes[index].ativo === false ? true : false 
      };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  // Adicionar novo card
  const handleAdicionarCard = () => {
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

  // Excluir card
  const handleExcluirCard = (index) => {
    if (config.opcoesChegada.length <= 1) {
      alert('Você precisa manter pelo menos 1 opção!');
      return;
    }
    const cardAlvo = config.opcoesChegada[index];
    if (confirm(`Excluir "${cardAlvo.titulo || 'esta opção'}"?`)) {
      setConfig((prev) => {
        const novas = prev.opcoesChegada.filter((_, idx) => idx !== index);
        return { ...prev, opcoesChegada: novas };
      });
    }
  };

  // Definir quantidade de cards por tela com botões rápidos
  const handleSetCardsPorTela = (qtd) => {
    setConfig((prev) => ({ ...prev, cardsPorTela: qtd }));
    setPreviewPage(0);
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
    if (confirm('Deseja restaurar todas as perguntas para o padrão original?')) {
      setConfig({ ...DEFAULT_QUESTIONS_CONFIG });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-[96vw] max-w-6xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL (SIMPLES E DIRETO)                        */}
        {/* ============================================================ */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Configurar Perguntas do Celular</h2>
              <p className="text-xs text-slate-400">Edite as perguntas à esquerda e veja a prévia exata no celular à direita</p>
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
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES CLARAS E INTUITIVAS         */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900/50">
            
            {/* ABAS INTUITIVAS */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2.5 shrink-0 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pergunta1')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'pergunta1'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>1ª Pergunta: Como Chegou ({cardsAtivos.length} opções)</span>
              </button>

              <button
                onClick={() => setActiveTab('acompanhantes')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'acompanhantes'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>2ª Pergunta: Acompanhantes</span>
              </button>
            </div>

            {/* CONTEÚDO ROLÁVEL DA ESQUERDA */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-left custom-scrollbar">
              
              {/* ====================================================== */}
              {/* ABA 1: 1ª PERGUNTA (COMO CHEGOU)                      */}
              {/* ====================================================== */}
              {activeTab === 'pergunta1' && (
                <div className="space-y-4">
                  
                  {/* 1. TÍTULO DA PERGUNTA */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Texto da Pergunta Principal
                    </label>
                    <input
                      type="text"
                      value={config.pergunta1Titulo || ''}
                      onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                      placeholder="Ex: Como você chegou aqui?"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                    />
                  </div>

                  {/* 2. QUANTOS CARDS POR TELA (MUITO MAIS INTUITIVO: BOTÕES RÁPIDOS) */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-white block">
                          Quantos cards cabem por tela no celular?
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Escolha o limite para os botões ficarem grandes e fáceis de tocar
                        </span>
                      </div>

                      {/* Botões Seletores 2, 3, 4, 5, 6 */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSetCardsPorTela(num)}
                            className={`w-8 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                              cardsPorTela === num
                                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Com <strong>{cardsAtivos.length} opções ativas</strong> e <strong>{cardsPorTela} por tela</strong>, o celular exibirá em <strong>{totalPaginasPreview} {totalPaginasPreview === 1 ? 'página' : 'páginas'}</strong> com botões de avançar.
                      </span>
                    </div>
                  </div>

                  {/* 3. LISTA DE OPÇÕES / CARDS */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Opções Cadastradas ({config.opcoesChegada?.length || 0})
                      </span>

                      <button
                        type="button"
                        onClick={handleAdicionarCard}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Opção</span>
                      </button>
                    </div>

                    {/* Itens da Lista */}
                    <div className="space-y-2">
                      {(config.opcoesChegada || []).map((opcao, idx) => {
                        const isAtivo = opcao.ativo !== false;
                        const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                        const paginaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTela)) : null;

                        return (
                          <div
                            key={opcao.id || idx}
                            className={`rounded-xl border transition-all p-3 space-y-2 ${
                              isAtivo 
                                ? 'bg-slate-950 border-slate-800 shadow-sm' 
                                : 'bg-slate-950/40 border-slate-900 opacity-55'
                            }`}
                          >
                            {/* Barra Superior da Opção */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {/* Botão Toggle Ativo / Inativo */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivo(idx)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 border ${
                                    isAtivo
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  {isAtivo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
                                  onChange={(e) => handleUpdateOpcao(idx, 'icone', e.target.value)}
                                  className="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-xs text-slate-200"
                                >
                                  {ICONES.map(ic => (
                                    <option key={ic.id} value={ic.id}>{ic.label}</option>
                                  ))}
                                </select>

                                {/* Seletor de Cor */}
                                <div className="flex items-center gap-1">
                                  {CORES.map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => handleUpdateOpcao(idx, 'cor', c.id)}
                                      className={`w-3.5 h-3.5 rounded-full ${c.bg} ${
                                        (opcao.cor || 'amber') === c.id ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'
                                      }`}
                                      title={c.label}
                                    />
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleExcluirCard(idx)}
                                  title="Excluir opção"
                                  className="p-1 text-slate-500 hover:text-red-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Campos de Texto Claros */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                                  Título da Opção
                                </label>
                                <input
                                  type="text"
                                  value={opcao.titulo || ''}
                                  onChange={(e) => handleUpdateOpcao(idx, 'titulo', e.target.value)}
                                  placeholder="Ex: Vi a faixa na igreja"
                                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-inner"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                                  Descrição / Detalhe (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={opcao.subtitulo || ''}
                                  onChange={(e) => handleUpdateOpcao(idx, 'subtitulo', e.target.value)}
                                  placeholder="Ex: Passei em frente e vi o anúncio"
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
              )}

              {/* ====================================================== */}
              {/* ABA 2: 2ª PERGUNTA (ACOMPANHANTES)                    */}
              {/* ====================================================== */}
              {activeTab === 'acompanhantes' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Pergunta sobre Acompanhantes
                    </label>
                    <input
                      type="text"
                      value={config.pergunta2Titulo || ''}
                      onChange={(e) => setConfig({ ...config, pergunta2Titulo: e.target.value })}
                      placeholder="Ex: Você está só ou tem mais pessoas te acompanhando?"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    />
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
          {/* COLUNA DIREITA: PREVIEW DO CELULAR INTERATIVO              */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 bg-slate-950/90 flex flex-col min-h-0 p-3 sm:p-5 relative items-center justify-start overflow-y-auto">
            
            {/* Seletor de Telas do Preview */}
            <div className="w-full max-w-[320px] mb-3 flex items-center justify-between gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewScreen('p1')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'p1' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                1ª Pergunta
              </button>
              <button
                type="button"
                onClick={() => setPreviewScreen('p2')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'p2' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Acompanhantes
              </button>
              <button
                type="button"
                onClick={() => setPreviewScreen('espera')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'espera' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Espera (Start)
              </button>
            </div>

            {/* MOCKUP DO SMARTPHONE REAL */}
            <div className="relative w-[300px] sm:w-[320px] rounded-[38px] border-[5px] border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden flex flex-col shrink-0 ring-1 ring-slate-800">
              
              {/* Barra de Status */}
              <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0">
                <span className="font-mono font-bold text-[10px]">19:30</span>
                <div className="w-16 h-3 bg-slate-900 rounded-full border border-slate-800" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-2.5 h-2.5" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Tela Interna do Celular */}
              <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
                
                {/* PREVIEW: 1ª PERGUNTA COM MUDANÇA DE PÁGINAS */}
                {previewScreen === 'p1' && (
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

                      {/* Título Atualizado em Tempo Real */}
                      <div className="pt-1 border-t border-slate-800/60">
                        <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {config.pergunta1Titulo || 'Como você chegou aqui?'}
                        </h3>
                      </div>

                      {/* Indicador de Páginas Interativo */}
                      {totalPaginasPreview > 1 && (
                        <div className="flex items-center justify-between pt-1 px-1">
                          <span className="text-[9px] font-bold text-amber-300">
                            Página {safePreviewPage + 1} de {totalPaginasPreview}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPaginasPreview }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewPage(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                  safePreviewPage === i ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cards Renderizados da Página Atual */}
                    <div className="flex-1 my-auto space-y-2 py-1">
                      {cardsNaPaginaAtual.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Nenhum card ativo nesta página.
                        </div>
                      ) : (
                        cardsNaPaginaAtual.map((opcao) => {
                          const IconComp = getIconComponent(opcao.icone);
                          const corCls = getCorBadge(opcao.cor);

                          return (
                            <div
                              key={opcao.id}
                              className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 flex items-center justify-between shadow-sm"
                            >
                              <div className="flex items-center gap-2.5 pr-1 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${corCls}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-white truncate">
                                    {opcao.titulo || 'Opção sem título'}
                                  </h4>
                                  {opcao.subtitulo && (
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
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

                    {/* Botões de Troca de Página no Preview */}
                    {totalPaginasPreview > 1 && (
                      <div className="shrink-0 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.max(0, safePreviewPage - 1))}
                          disabled={safePreviewPage === 0}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>Anterior</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.min(totalPaginasPreview - 1, safePreviewPage + 1))}
                          disabled={safePreviewPage >= totalPaginasPreview - 1}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <span>Ver mais</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* PREVIEW: 2ª PERGUNTA (ACOMPANHANTES) */}
                {previewScreen === 'p2' && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div className="shrink-0 space-y-1">
                      <p className="text-xs font-black text-emerald-400 tracking-wide">
                        Seja muito bem-vindo!
                      </p>
                      <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                        {config.pergunta2Titulo || 'Você está só ou tem mais pessoas te acompanhando?'}
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
                        {['2', '3', '4', '5', '6', '7', '8', '9', '+10'].map((num) => (
                          <div
                            key={num}
                            className="py-1.5 rounded-xl border border-slate-700 border-b-2 border-b-slate-950 bg-slate-800 text-center"
                          >
                            <span className="text-sm font-black text-white block">{num}</span>
                            <span className="text-[8px] font-bold text-sky-400 block">Pessoas</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: TELA DE ESPERA */}
                {previewScreen === 'espera' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 my-auto">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-emerald-400 animate-spin" />
                      <div className="relative w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-xs font-black text-white tracking-wide uppercase">
                        DENTRO DE INSTANTES
                      </span>
                      <span className="block text-xs font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent tracking-wide uppercase">
                        ESTARÁ LIBERADO
                      </span>
                      <span className="block text-xs font-black text-emerald-400 tracking-wide uppercase">
                        PARA RESPONDER.
                      </span>
                    </div>

                    <div className="w-2/3 bg-slate-950 rounded-full h-1 overflow-hidden">
                      <div className="bg-amber-400 h-full w-1/2 rounded-full animate-pulse mx-auto" />
                    </div>
                  </div>
                )}

              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-medium text-center">
              Simulação em tempo real do celular
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
