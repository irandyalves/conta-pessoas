import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  HelpCircle, 
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
  Smartphone, 
  ChevronRight, 
  ChevronLeft, 
  Info,
  TreePine,
  Wifi,
  Battery,
  User
} from 'lucide-react';
import { 
  getSavedQuestionsConfig, 
  saveQuestionsConfig, 
  getSavedEventTitle,
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';

// Lista de ícones disponíveis
const ICONES_DISPONIVEIS = [
  { id: 'Tag', label: 'Faixa/Tag', icon: Tag },
  { id: 'Church', label: 'Igreja', icon: Church },
  { id: 'HeartHandshake', label: 'Convite', icon: HeartHandshake },
  { id: 'Share2', label: 'Redes/Web', icon: Share2 },
  { id: 'Compass', label: 'Bússola', icon: Compass },
  { id: 'Sparkles', label: 'Brilho', icon: Sparkles },
  { id: 'Star', label: 'Estrela', icon: Star },
  { id: 'Smile', label: 'Sorriso', icon: Smile },
  { id: 'MapPin', label: 'Local', icon: MapPin },
  { id: 'MessageCircle', label: 'Mensagem', icon: MessageCircle },
];

const CORES_DISPONIVEIS = [
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-400', border: 'border-amber-400', badge: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-400', border: 'border-emerald-400', badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { id: 'sky', label: 'Azul', bg: 'bg-sky-400', border: 'border-sky-400', badge: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-400', border: 'border-purple-400', badge: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-400', border: 'border-indigo-400', badge: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-400', border: 'border-rose-400', badge: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
];

export default function QuestionsConfigModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'fluxo' | 'p2'
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

  // Se a aba mudar, ajusta a tela correspondente no preview
  useEffect(() => {
    if (activeTab === 'p2') {
      setPreviewScreen('p2');
    } else if (activeTab === 'cards') {
      setPreviewScreen('p1');
    }
  }, [activeTab]);

  if (!isOpen) return null;

  // Cálculos dinâmicos
  const cardsAtivos = (config.opcoesChegada || []).filter(c => c.ativo !== false);
  const cardsPorTela = Number(config.cardsPorTela) || 4;
  const totalPaginasPreview = Math.max(1, Math.ceil(cardsAtivos.length / cardsPorTela));

  // Garante que a página do preview não fique fora do range
  const safePreviewPage = Math.min(previewPage, totalPaginasPreview - 1);
  const cardsNaPaginaAtual = cardsAtivos.slice(
    safePreviewPage * cardsPorTela,
    (safePreviewPage + 1) * cardsPorTela
  );

  // Modificar campo de card
  const handleUpdateOpcaoP1 = (index, field, value) => {
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

  // Inserir novo card
  const handleAdicionarCard = () => {
    const novoIndex = (config.opcoesChegada || []).length + 1;
    const novoCard = {
      id: `card_${Date.now()}`,
      titulo: `Opção ${novoIndex}`,
      subtitulo: 'Motivo da visita',
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
      alert('Mantenha pelo menos 1 card cadastrado!');
      return;
    }
    const cardAlvo = config.opcoesChegada[index];
    if (confirm(`Excluir o card "${cardAlvo.titulo || 'Card'}"?`)) {
      setConfig((prev) => {
        const novas = prev.opcoesChegada.filter((_, idx) => idx !== index);
        return { ...prev, opcoesChegada: novas };
      });
    }
  };

  // Alterar slider de cards por tela
  const handleSliderCardsPorTela = (novoValor) => {
    const val = Number(novoValor);
    setConfig((prev) => ({
      ...prev,
      cardsPorTela: val
    }));
    setPreviewPage(0);
  };

  // Telas extras
  const handleToggleTelaExtra = (extraIdx) => {
    setConfig((prev) => {
      const telas = [...(prev.telasExtras || [])];
      telas[extraIdx] = {
        ...telas[extraIdx],
        ativa: !telas[extraIdx].ativa
      };
      return { ...prev, telasExtras: telas };
    });
  };

  const handleUpdateTelaExtra = (extraIdx, field, value) => {
    setConfig((prev) => {
      const telas = [...(prev.telasExtras || [])];
      telas[extraIdx] = { ...telas[extraIdx], [field]: value };
      return { ...prev, telasExtras: telas };
    });
  };

  const handleUpdateOpcaoExtra = (extraIdx, optIdx, field, value) => {
    setConfig((prev) => {
      const telas = [...(prev.telasExtras || [])];
      const opcoes = [...telas[extraIdx].opcoes];
      opcoes[optIdx] = { ...opcoes[optIdx], [field]: value };
      telas[extraIdx] = { ...telas[extraIdx], opcoes };
      return { ...prev, telasExtras: telas };
    });
  };

  const handleAdicionarOpcaoExtra = (extraIdx) => {
    setConfig((prev) => {
      const telas = [...(prev.telasExtras || [])];
      const opcoes = [...telas[extraIdx].opcoes];
      opcoes.push({
        id: `opt_${Date.now()}`,
        titulo: 'Nova Opção',
        subtitulo: 'Descrição rápida',
        ativo: true,
        icone: 'Sparkles',
        cor: 'emerald'
      });
      telas[extraIdx] = { ...telas[extraIdx], opcoes };
      return { ...prev, telasExtras: telas };
    });
  };

  const handleExcluirOpcaoExtra = (extraIdx, optIdx) => {
    setConfig((prev) => {
      const telas = [...(prev.telasExtras || [])];
      const opcoes = telas[extraIdx].opcoes.filter((_, idx) => idx !== optIdx);
      telas[extraIdx] = { ...telas[extraIdx], opcoes };
      return { ...prev, telasExtras: telas };
    });
  };

  const handleAdicionarNovaTelaExtra = () => {
    const novaNum = (config.telasExtras || []).length + 1;
    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      titulo: `Pergunta Adicional ${novaNum}`,
      subtitulo: 'Selecione uma das opções abaixo',
      cardsPorTela: 3,
      opcoes: [
        {
          id: `opt_${Date.now()}_1`,
          titulo: 'Opção 1',
          subtitulo: 'Detalhes da opção',
          ativo: true,
          icone: 'Sparkles',
          cor: 'emerald'
        },
        {
          id: `opt_${Date.now()}_2`,
          titulo: 'Opção 2',
          subtitulo: 'Outro detalhe',
          ativo: true,
          icone: 'sky',
          cor: 'sky'
        }
      ]
    };
    setConfig((prev) => ({
      ...prev,
      telasExtras: [...(prev.telasExtras || []), novaTela]
    }));
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Restaurar todas as perguntas, cards e configurações para o padrão original?')) {
      setConfig({ ...DEFAULT_QUESTIONS_CONFIG });
      setPreviewPage(0);
    }
  };

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

  // Mapeador de ícones para renderizar no preview
  const getIconComponent = (iconeId) => {
    const item = ICONES_DISPONIVEIS.find(i => i.id === iconeId);
    return item ? item.icon : Tag;
  };

  const getCorClasses = (corId) => {
    const item = CORES_DISPONIVEIS.find(c => c.id === corId);
    return item ? item.badge : 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Container aumentado em 40%: w-[96vw] max-w-6xl */}
      <div className="relative w-[96vw] max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL                                           */}
        {/* ============================================================ */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Configuração & Preview em Tempo Real</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Edite à esquerda e visualize no celular à direita como os visitantes verão as perguntas e trocarão de página
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* CORPO EM 2 COLUNAS LADO A LADO                               */}
        {/* ============================================================ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* ========================================================== */}
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES COMPACTAS E OTIMIZADAS       */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900/60">
            
            {/* ABAS COMPACTAS */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 shrink-0 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('cards')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'cards'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Cards 1ª Pergunta ({cardsAtivos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('fluxo')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fluxo'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3, 4 e 5 Telas</span>
              </button>

              <button
                onClick={() => setActiveTab('p2')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'p2'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Acompanhantes</span>
              </button>
            </div>

            {/* CONTEÚDO DA COLUNA ESQUERDA (ROLÁVEL) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 text-left custom-scrollbar">
              
              {/* ABA 1: CARDS DA 1ª PERGUNTA */}
              {activeTab === 'cards' && (
                <div className="space-y-3.5">
                  
                  {/* Título da Pergunta 1 (Reduzido e Otimizado) */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5 shadow-sm">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Título da 1ª Pergunta
                    </label>
                    <input
                      type="text"
                      value={config.pergunta1Titulo || ''}
                      onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                      placeholder="Ex: Como você chegou aqui?"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                    />
                  </div>

                  {/* SLIDER DE CARDS POR TELA (COMPACTO E ELEGANTE) */}
                  <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-xs border border-amber-400/40">
                          {cardsPorTela}
                        </span>
                        <div>
                          <span className="text-xs font-black text-white block">
                            Cards por Tela (Slide do Celular)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Evita botões espremidos no smartphone
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                          {cardsPorTela} por tela • {totalPaginasPreview} {totalPaginasPreview === 1 ? 'página' : 'páginas'}
                        </span>
                      </div>
                    </div>

                    {/* Slider Interativo */}
                    <div className="pt-0.5">
                      <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={cardsPorTela}
                        onChange={(e) => handleSliderCardsPorTela(e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5 pt-0.5">
                        <span className={cardsPorTela === 2 ? 'text-amber-400' : ''}>2 (Gigantes)</span>
                        <span className={cardsPorTela === 3 ? 'text-amber-400' : ''}>3</span>
                        <span className={cardsPorTela === 4 ? 'text-amber-400' : ''}>4 (Ideal)</span>
                        <span className={cardsPorTela === 5 ? 'text-amber-400' : ''}>5</span>
                        <span className={cardsPorTela === 6 ? 'text-amber-400' : ''}>6</span>
                      </div>
                    </div>
                  </div>

                  {/* LISTA COMPACTA DE CARDS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                          Cards Cadastrados
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded-full font-semibold">
                          {config.opcoesChegada?.length || 0} total ({cardsAtivos.length} ativos)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdicionarCard}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Card</span>
                      </button>
                    </div>

                    {/* CARDS OTIMIZADOS E COMPACTOS (SEM POLUIÇÃO VISUAL) */}
                    <div className="space-y-2">
                      {(config.opcoesChegada || []).map((opcao, idx) => {
                        const isAtivo = opcao.ativo !== false;
                        const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                        const paginaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTela)) : null;

                        return (
                          <div
                            key={opcao.id || idx}
                            className={`rounded-xl border transition-all p-2.5 space-y-2 ${
                              isAtivo 
                                ? 'bg-slate-950/90 border-slate-800 shadow-sm' 
                                : 'bg-slate-950/40 border-slate-900 opacity-60'
                            }`}
                          >
                            {/* Linha 1: Controles Rápidos */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {/* Toggle Ativo/Inativo */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivo(idx)}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 border ${
                                    isAtivo
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {isAtivo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  <span>{isAtivo ? 'Ativo no Celular' : 'Oculto'}</span>
                                </button>

                                {isAtivo && (
                                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.2 rounded-full font-bold">
                                    Pág {paginaDoCard}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Seletor Rápido de Ícone */}
                                <select
                                  value={opcao.icone || 'Tag'}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'icone', e.target.value)}
                                  className="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-[11px] text-slate-300"
                                >
                                  {ICONES_DISPONIVEIS.map(ic => (
                                    <option key={ic.id} value={ic.id}>{ic.label}</option>
                                  ))}
                                </select>

                                {/* Seletor Rápido de Cor */}
                                <div className="flex items-center gap-1">
                                  {CORES_DISPONIVEIS.map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => handleUpdateOpcaoP1(idx, 'cor', c.id)}
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
                                  title="Excluir card"
                                  className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Linha 2: Inputs de Título e Subtítulo em Grid Compacto */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="text"
                                  value={opcao.titulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
                                  placeholder="Título do card"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-inner"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={opcao.subtitulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
                                  placeholder="Subtítulo / Descrição"
                                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-inner"
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

              {/* ABA 2: FLUXO 3, 4 E 5 TELAS */}
              {activeTab === 'fluxo' && (
                <div className="space-y-3.5">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">Etapas Sequenciais do Celular</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        3, 4 ou 5 Telas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Adicione perguntas intermediárias antes dos acompanhantes.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Telas Adicionais</span>
                      <button
                        type="button"
                        onClick={handleAdicionarNovaTelaExtra}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Tela</span>
                      </button>
                    </div>

                    {(config.telasExtras || []).map((telaExtra, tIdx) => (
                      <div
                        key={telaExtra.id || tIdx}
                        className={`rounded-xl border p-3 space-y-2.5 ${
                          telaExtra.ativa
                            ? 'bg-slate-950/90 border-indigo-500/40'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">Tela #{tIdx + 3}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleTelaExtra(tIdx)}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                              telaExtra.ativa
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {telaExtra.ativa ? 'Ativa no Celular' : 'Desativada'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={telaExtra.titulo || ''}
                            onChange={(e) => handleUpdateTelaExtra(tIdx, 'titulo', e.target.value)}
                            placeholder="Título da pergunta"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                          />
                          <input
                            type="text"
                            value={telaExtra.subtitulo || ''}
                            onChange={(e) => handleUpdateTelaExtra(tIdx, 'subtitulo', e.target.value)}
                            placeholder="Subtítulo"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                          />
                        </div>

                        {/* Opções da tela extra */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>Opções de resposta:</span>
                            <button
                              type="button"
                              onClick={() => handleAdicionarOpcaoExtra(tIdx)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              + Opção
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {(telaExtra.opcoes || []).map((opt, optIdx) => (
                              <div key={opt.id || optIdx} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={opt.titulo || ''}
                                  onChange={(e) => handleUpdateOpcaoExtra(tIdx, optIdx, 'titulo', e.target.value)}
                                  placeholder="Opção"
                                  className="flex-1 min-w-0 bg-transparent text-xs font-bold text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleExcluirOpcaoExtra(tIdx, optIdx)}
                                  className="text-slate-500 hover:text-red-400 p-0.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: ACOMPANHANTES */}
              {activeTab === 'p2' && (
                <div className="space-y-3.5">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Título da Pergunta de Acompanhantes
                    </label>
                    <input
                      type="text"
                      value={config.pergunta2Titulo || ''}
                      onChange={(e) => setConfig({ ...config, pergunta2Titulo: e.target.value })}
                      placeholder="Ex: Você está só ou tem mais pessoas te acompanhando?"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                      Botão Individual (1 Pessoa)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={config.opcaoIndividualTitulo || ''}
                        onChange={(e) => setConfig({ ...config, opcaoIndividualTitulo: e.target.value })}
                        placeholder="Ex: SÓ EU"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                      />
                      <input
                        type="text"
                        value={config.opcaoIndividualSubtitulo || ''}
                        onChange={(e) => setConfig({ ...config, opcaoIndividualSubtitulo: e.target.value })}
                        placeholder="Ex: , vim sozinho"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Texto do Divisor de Quantidade
                    </label>
                    <input
                      type="text"
                      value={config.divisorQtdTexto || ''}
                      onChange={(e) => setConfig({ ...config, divisorQtdTexto: e.target.value })}
                      placeholder="Ex: Quantas pessoas vieram com você?"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* COLUNA DIREITA: PREVIEW INTERATIVO DO CELULAR              */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 bg-slate-950/90 flex flex-col min-h-0 p-3 sm:p-5 relative items-center justify-start overflow-y-auto">
            
            {/* Barra de Seleção de Tela do Preview */}
            <div className="w-full max-w-[320px] mb-3 flex items-center justify-between gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewScreen('p1')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'p1' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                1ª Pergunta
              </button>
              <button
                type="button"
                onClick={() => setPreviewScreen('p2')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'p2' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Acompanhantes
              </button>
              <button
                type="button"
                onClick={() => setPreviewScreen('espera')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                  previewScreen === 'espera' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Espera (Start)
              </button>
            </div>

            {/* MOCKUP DO SMARTPHONE REAL */}
            <div className="relative w-[300px] sm:w-[320px] rounded-[38px] border-[5px] border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden flex flex-col shrink-0 ring-1 ring-slate-800/80">
              
              {/* Ilha Dinâmica / Câmera Superior */}
              <div className="w-full pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 shrink-0">
                <span className="font-mono font-bold text-[10px]">19:30</span>
                <div className="w-16 h-3 bg-slate-900 rounded-full border border-slate-800" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-2.5 h-2.5" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Tela Interna do Celular (Fiel ao MobileForm) */}
              <div className="h-[460px] overflow-y-auto p-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-center select-none custom-scrollbar">
                
                {/* PREVIEW: 1ª PERGUNTA (COM MUDANÇA DE PÁGINAS) */}
                {previewScreen === 'p1' && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    
                    {/* Topo: Boas-vindas + Nome do Evento */}
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

                      {/* Título da Pergunta 1 em Tempo Real */}
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
                          const corCls = getCorClasses(opcao.cor);

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

                    {/* Botões de Mudança de Página (Navegação Interativa no Preview) */}
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
                      {/* Botão Individual 3D */}
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

                      {/* Divisor */}
                      <div className="flex items-center my-1">
                        <div className="flex-grow border-t border-slate-800" />
                        <span className="px-2 text-[9px] font-black text-amber-300 uppercase">
                          {config.divisorQtdTexto || 'Quantas pessoas vieram com você?'}
                        </span>
                        <div className="flex-grow border-t border-slate-800" />
                      </div>

                      {/* Grid 2 a +10 */}
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

                {/* PREVIEW: TELA DE ESPERA (START) */}
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
              Simulação idêntica à tela que abre no celular ao ler o QR Code
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RODAPÉ DO MODAL                                              */}
        {/* ============================================================ */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
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
