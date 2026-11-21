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
  ArrowRight
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
  // GESTÃO DE TELAS EXTRAS (TELA 2, TELA 3, ETC.)
  // ============================================================
  const handleAdicionarTela = () => {
    const totalExtras = (config.telasExtras || []).length;
    const novoNumeroTela = totalExtras + 2; // Tela 1 já existe, então começa na Tela 2
    const novaTela = {
      id: `extra_${Date.now()}`,
      ativa: true,
      titulo: `Pergunta da Tela ${novoNumeroTela}`,
      subtitulo: 'Descreva o objetivo desta tela adicional',
      cardsPorTela: 3,
      opcoes: [
        {
          id: `opt_${Date.now()}_1`,
          titulo: 'Primeira Opção',
          subtitulo: 'Descrição explicativa',
          ativo: true,
          icone: 'Sparkles',
          cor: 'emerald'
        },
        {
          id: `opt_${Date.now()}_2`,
          titulo: 'Segunda Opção',
          subtitulo: 'Outro detalhe importante',
          ativo: true,
          icone: 'Smile',
          cor: 'sky'
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
    const numTela = extraIndex + 2;
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
            
            {/* BARRA DE ABAS: TELA INÍCIO, TELA 1, TELA 2... ACOMPANHANTES, TELA FIM + BOTÃO ADICIONAR TELA */}
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

              {/* Telas Extras Configuradas Dinamicamente (Tela 2, Tela 3, etc.) */}
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
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                      {cardsAtivos}
                    </span>
                  </button>
                );
              })}

              {/* Botão + Nova Tela para Inserir Mais Abas / Telas */}
              <button
                type="button"
                onClick={handleAdicionarTela}
                className="mb-2 px-2.5 py-1 text-xs font-black text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95"
                title="Inserir mais uma tela no fluxo de perguntas do celular"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Inserir Tela</span>
              </button>

              {/* Acompanhantes */}
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
                <span>Acompanhantes</span>
              </button>

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

                  {/* Slider de Tamanho da Fonte da Tela de Espera */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Tamanho da Fonte das Frases</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                        {config.esperaFonteTamanho || 26}px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="18"
                      max="38"
                      step="1"
                      value={config.esperaFonteTamanho || 26}
                      onChange={(e) => setConfig({ ...config, esperaFonteTamanho: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>18px (Menor)</span>
                      <span>26px (Padrão)</span>
                      <span>38px (Maior)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: TELA 1 (COM SLIDERS DE DESIGN GLOBAIS DOS CARDS)  */}
              {/* ====================================================== */}
              {activeTab === 'tela_1' && (
                <div className="space-y-4">
                  
                  {/* 1. TÍTULO DA TELA 1 */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Texto da Pergunta Principal (Tela 1)
                    </label>
                    <input
                      type="text"
                      value={config.pergunta1Titulo || ''}
                      onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                      placeholder="Ex: Como você chegou aqui?"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                    />
                  </div>

                  {/* 2. SLIDERS DE DESIGN: FONTE DO TÍTULO, SUBTÍTULO E ALTURA DOS CARDS */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Design & Dimensões dos Cards no Celular
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Slider Tamanho Fonte Título */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
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
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
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
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
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

                    {/* Quantidade de Cards por Tela (Botões Rápidos) */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

                  {/* 3. LISTA DE OPÇÕES / CARDS DA TELA 1 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Cards da Tela 1 ({config.opcoesChegada?.length || 0})
                      </span>

                      <button
                        type="button"
                        onClick={handleAdicionarCardP1}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Opção</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(config.opcoesChegada || []).map((opcao, idx) => {
                        const isAtivo = opcao.ativo !== false;
                        const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                        const paginaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTelaP1)) : null;

                        return (
                          <div
                            key={opcao.id || idx}
                            className={`rounded-xl border transition-all p-3 space-y-2 ${
                              isAtivo 
                                ? 'bg-slate-950 border-slate-800 shadow-sm' 
                                : 'bg-slate-950/40 border-slate-900 opacity-55'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivoP1(idx)}
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
                                <select
                                  value={opcao.icone || 'Tag'}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'icone', e.target.value)}
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
                                  onClick={() => handleExcluirCardP1(idx)}
                                  title="Excluir opção"
                                  className="p-1 text-slate-500 hover:text-red-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                                  Título da Opção
                                </label>
                                <input
                                  type="text"
                                  value={opcao.titulo || ''}
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
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
                                  onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
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
              {/* ABAS DINÂMICAS: TELAS EXTRAS (TELA 2, TELA 3, ETC.)     */}
              {/* ====================================================== */}
              {activeTab.startsWith('extra_') && (() => {
                const extraIndex = parseInt(activeTab.split('_')[1], 10);
                const telaAlvo = (config.telasExtras || [])[extraIndex];
                if (!telaAlvo) return null;

                const numTela = extraIndex + 2;
                const cardsAtivos = (telaAlvo.opcoes || []).filter(o => o.ativo !== false);
                const limitCards = Number(telaAlvo.cardsPorTela) || 3;

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

                    {/* Título e Subtítulo da Tela Extra */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-1">
                          Título da Pergunta (Tela {numTela})
                        </label>
                        <input
                          type="text"
                          value={telaAlvo.titulo || ''}
                          onChange={(e) => handleUpdateTelaProp(extraIndex, 'titulo', e.target.value)}
                          placeholder={`Ex: Pergunta da Tela ${numTela}`}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                        />
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
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          Título Principal (Agradecimento)
                        </label>
                        <input
                          type="text"
                          value={config.finalTitulo ?? 'MUITO OBRIGADO PELA SUA PRESENÇA.'}
                          onChange={(e) => setConfig({ ...config, finalTitulo: e.target.value })}
                          placeholder="MUITO OBRIGADO PELA SUA PRESENÇA."
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                        />
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

                  {/* Slider de Tamanho da Fonte do Título de Agradecimento */}
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Tamanho da Fonte do Título Principal</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                        {config.finalFonteTamanho || 26}px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="18"
                      max="38"
                      step="1"
                      value={config.finalFonteTamanho || 26}
                      onChange={(e) => setConfig({ ...config, finalFonteTamanho: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>18px (Menor)</span>
                      <span>26px (Padrão)</span>
                      <span>38px (Maior)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* ABA: ACOMPANHANTES (QUANTAS PESSOAS VIERAM)            */}
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

            {/* SELETOR DE TELAS DO PREVIEW (SINCRONIZADO COM AS ABAS) */}
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

              {(config.telasExtras || []).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewScreen(`extra_${idx}`)}
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                    previewScreen === `extra_${idx}` ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tela {idx + 2}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPreviewScreen('acompanhantes')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'acompanhantes' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Acomp.
              </button>

              <button
                type="button"
                onClick={() => setPreviewScreen('fim')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition text-center shrink-0 ${
                  previewScreen === 'fim' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fim
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
                        style={{ fontSize: `${(config.esperaFonteTamanho || 26) * 0.58}px` }}
                        className="block font-black text-white tracking-wide uppercase leading-tight"
                      >
                        {config.esperaLinha1 || 'DENTRO DE INSTANTES'}
                      </span>
                      <span 
                        style={{ fontSize: `${(config.esperaFonteTamanho || 26) * 0.58}px` }}
                        className="block font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent tracking-wide uppercase leading-tight"
                      >
                        {config.esperaLinha2 || 'ESTARÁ LIBERADO'}
                      </span>
                      <span 
                        style={{ fontSize: `${(config.esperaFonteTamanho || 26) * 0.58}px` }}
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
                        <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {config.pergunta1Titulo || 'Como você chegou aqui?'}
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
                              className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 flex items-center justify-between shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-2.5 pr-1 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${corCls}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 
                                    style={{ fontSize: `${config.cardFonteTitulo || 16}px` }}
                                    className="font-bold text-white truncate leading-snug"
                                  >
                                    {opcao.titulo || 'Opção sem título'}
                                  </h4>
                                  {opcao.subtitulo && (
                                    <p 
                                      style={{ fontSize: `${config.cardFonteSubtitulo || 12}px` }}
                                      className="text-slate-400 truncate mt-0.5 leading-snug"
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

                {/* PREVIEW: TELAS EXTRAS (TELA 2, TELA 3, ETC.) */}
                {previewScreen.startsWith('extra_') && (() => {
                  const extraIdx = parseInt(previewScreen.split('_')[1], 10);
                  const telaExtra = (config.telasExtras || [])[extraIdx];
                  if (!telaExtra) return null;

                  const numTela = extraIdx + 2;
                  const cardsAtivos = (telaExtra.opcoes || []).filter(o => o.ativo !== false);

                  return (
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="shrink-0 space-y-1">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase">
                          <span>Tela {numTela} de {1 + (config.telasExtras || []).length + 1}</span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {telaExtra.titulo || `Pergunta da Tela ${numTela}`}
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
                                className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 flex items-center justify-between shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-2.5 pr-1 min-w-0">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${corCls}`}>
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 
                                      style={{ fontSize: `${config.cardFonteTitulo || 16}px` }}
                                      className="font-bold text-white truncate leading-snug"
                                    >
                                      {opt.titulo || 'Opção sem título'}
                                    </h4>
                                    {opt.subtitulo && (
                                      <p 
                                        style={{ fontSize: `${config.cardFonteSubtitulo || 12}px` }}
                                        className="text-slate-400 truncate mt-0.5 leading-snug"
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
                        <span className="text-[9px] text-slate-400">
                          {isTelaAtiva ? '✓ Esta tela aparecerá no celular' : '✕ Esta tela está oculta no celular'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* PREVIEW: ACOMPANHANTES */}
                {previewScreen === 'acompanhantes' && (
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

                {/* PREVIEW: TELA FIM */}
                {previewScreen === 'fim' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-3.5 my-auto px-2">
                    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                      <h3 
                        style={{ fontSize: `${(config.finalFonteTamanho || 26) * 0.58}px` }}
                        className="font-black text-white tracking-tight leading-snug"
                      >
                        {config.finalTitulo || 'MUITO OBRIGADO PELA SUA PRESENÇA.'}
                      </h3>

                      <div className="space-y-0.5">
                        <span className="block text-[11px] font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent uppercase tracking-wide">
                          A {eventoTitulo}
                        </span>
                        <span className="block text-[10px] font-extrabold text-amber-400">
                          {config.finalMensagem || 'será espetacular!'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden mb-2">
                          <div className="bg-amber-400 h-full w-2/3 rounded-full mx-auto" />
                        </div>
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wide">
                          {config.finalStatus || 'REGISTRO CONCLUÍDO!'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
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
