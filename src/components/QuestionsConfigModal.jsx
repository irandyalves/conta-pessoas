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
  Info
} from 'lucide-react';
import { 
  getSavedQuestionsConfig, 
  saveQuestionsConfig, 
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';

// Lista de ícones disponíveis para seleção rápida
const ICONES_DISPONIVEIS = [
  { id: 'Tag', label: 'Faixa/Tag', icon: Tag },
  { id: 'Church', label: 'Igreja', icon: Church },
  { id: 'HeartHandshake', label: 'Convite', icon: HeartHandshake },
  { id: 'Share2', label: 'Redes/Internet', icon: Share2 },
  { id: 'Compass', label: 'Bússola/Visita', icon: Compass },
  { id: 'Sparkles', label: 'Brilho/Especial', icon: Sparkles },
  { id: 'Star', label: 'Estrela', icon: Star },
  { id: 'Smile', label: 'Sorriso', icon: Smile },
  { id: 'MapPin', label: 'Localização', icon: MapPin },
  { id: 'MessageCircle', label: 'Mensagem', icon: MessageCircle },
];

const CORES_DISPONIVEIS = [
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { id: 'sky', label: 'Azul Céu', bg: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' },
  { id: 'rose', label: 'Rosa/Vinho', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
];

export default function QuestionsConfigModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'fluxo' | 'p2'
  const [config, setConfig] = useState(DEFAULT_QUESTIONS_CONFIG);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedQuestionsConfig());
      setSalvo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Quantidade de cards ativos que irão para o celular
  const cardsAtivos = (config.opcoesChegada || []).filter(c => c.ativo !== false);
  const cardsPorTela = Number(config.cardsPorTela) || 4;
  const telasCalculadas = Math.max(1, Math.ceil(cardsAtivos.length / cardsPorTela));

  // Modificar campo de uma opção específica
  const handleUpdateOpcaoP1 = (index, field, value) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { ...novasOpcoes[index], [field]: value };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  // Alternar ativo/inativo (dizer se vai ou não para o celular)
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
      subtitulo: 'Descrição ou motivo da visita',
      ativo: true,
      icone: 'Sparkles',
      cor: 'amber'
    };
    setConfig((prev) => ({
      ...prev,
      opcoesChegada: [...(prev.opcoesChegada || []), novoCard]
    }));
  };

  // Excluir card
  const handleExcluirCard = (index) => {
    const cardAlvo = config.opcoesChegada[index];
    if (config.opcoesChegada.length <= 1) {
      alert('Você precisa manter pelo menos 1 card cadastrado!');
      return;
    }
    if (confirm(`Deseja realmente excluir o card "${cardAlvo.titulo || 'Card'}"?`)) {
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
  };

  // Alterar telas extras (fluxo 3, 4, 5 telas)
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
    if (confirm('Deseja restaurar todas as perguntas, cards e configurações para o padrão original?')) {
      setConfig({ ...DEFAULT_QUESTIONS_CONFIG });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ============================================================ */}
        {/* CABEÇALHO DO MODAL                                           */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Gerenciar Cards & Telas do Celular</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Escolha quais cards vão para o celular, ajuste a quantidade por tela e monte fluxos de 3, 4 ou 5 telas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* ABAS MODERNAS                                                */}
        {/* ============================================================ */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 sm:px-6 pt-2 shrink-0 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Cards da 1ª Pergunta ({cardsAtivos.length} ativos)</span>
          </button>

          <button
            onClick={() => setActiveTab('fluxo')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fluxo'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fluxo de Telas (3, 4 e 5 Telas)</span>
          </button>

          <button
            onClick={() => setActiveTab('p2')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'p2'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Acompanhantes</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CORPO ROLÁVEL                                                */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-left">
          
          {/* ============================================================ */}
          {/* ABA 1: CARDS DA 1ª PERGUNTA + SLIDER DE CARDS POR TELA      */}
          {/* ============================================================ */}
          {activeTab === 'cards' && (
            <div className="space-y-5">
              
              {/* Título da Pergunta 1 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Título da 1ª Pergunta no Celular
                </label>
                <input
                  type="text"
                  value={config.pergunta1Titulo || ''}
                  onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                  placeholder="Ex: Como você chegou aqui?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm font-bold text-white shadow-inner"
                />
              </div>

              {/* ======================================================= */}
              {/* SLIDER DE QUANTIDADE DE CARDS POR TELA (SOLICITADO)     */}
              {/* ======================================================= */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-sm border border-amber-400/30">
                      {cardsPorTela}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Slide: Quantidade de Cards por Tela</span>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                          Limite Visual
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300">
                        Evita cards espremidos e pequenos no celular.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30">
                      {cardsPorTela} cards por tela
                    </span>
                  </div>
                </div>

                {/* Slider Interativo */}
                <div className="space-y-1.5 pt-1">
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={cardsPorTela}
                    onChange={(e) => handleSliderCardsPorTela(e.target.value)}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  
                  {/* Marcadores do Slider */}
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
                    <span className={cardsPorTela === 2 ? 'text-amber-400 font-black' : ''}>2 (Cards Gigantes)</span>
                    <span className={cardsPorTela === 3 ? 'text-amber-400 font-black' : ''}>3</span>
                    <span className={cardsPorTela === 4 ? 'text-amber-400 font-black' : ''}>4 (Recomendado)</span>
                    <span className={cardsPorTela === 5 ? 'text-amber-400 font-black' : ''}>5</span>
                    <span className={cardsPorTela === 6 ? 'text-amber-400 font-black' : ''}>6 (Mais Opções)</span>
                  </div>
                </div>

                {/* Resumo da Divisão de Telas gerada */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Com <strong>{cardsAtivos.length} cards ativos</strong> e limite de <strong>{cardsPorTela} por tela</strong>, o celular dividirá automaticamente em <strong>{telasCalculadas} {telasCalculadas === 1 ? 'tela' : 'telas (slides)'}</strong> com navegação tátil e botões confortáveis.
                  </span>
                </div>
              </div>

              {/* ======================================================= */}
              {/* LISTA DE CARDS: INSERIR, EXCLUIR E SELECIONAR QUAIS VÃO  */}
              {/* ======================================================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Gerenciar Cards da Pergunta
                    </h3>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                      {config.opcoesChegada?.length || 0} cadastrados ({cardsAtivos.length} ativos no celular)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdicionarCard}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir Novo Card</span>
                  </button>
                </div>

                {/* Cards cadastrados */}
                <div className="space-y-3">
                  {(config.opcoesChegada || []).map((opcao, idx) => {
                    const isAtivo = opcao.ativo !== false;
                    // Calcula em qual tela/slide esse card vai aparecer no celular se estiver ativo
                    const ativosAteAqui = (config.opcoesChegada || []).slice(0, idx + 1).filter(c => c.ativo !== false).length;
                    const telaDoCard = isAtivo ? Math.max(1, Math.ceil(ativosAteAqui / cardsPorTela)) : null;

                    return (
                      <div 
                        key={opcao.id || idx} 
                        className={`rounded-2xl border transition-all p-3.5 space-y-3 ${
                          isAtivo 
                            ? 'bg-slate-950/80 border-slate-700/80 shadow-md' 
                            : 'bg-slate-950/30 border-slate-800/60 opacity-60'
                        }`}
                      >
                        {/* Linha Superior: Switch de Enviar para Celular + Identificador + Botão Excluir */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            {/* BOTÃO TOGGLE (DIZER QUAIS CARDS IRÃO PARA O CELULAR) */}
                            <button
                              type="button"
                              onClick={() => handleToggleAtivo(idx)}
                              title={isAtivo ? 'Clique para ocultar do celular' : 'Clique para exibir no celular'}
                              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 border ${
                                isAtivo 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              {isAtivo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{isAtivo ? 'Vai para o Celular' : 'Oculto no Celular'}</span>
                            </button>

                            {isAtivo && (
                              <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                Slide / Tela {telaDoCard}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500">#{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleExcluirCard(idx)}
                              title="Excluir este card"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Campos de Título e Subtítulo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Título do Card (Texto Principal)
                            </label>
                            <input
                              type="text"
                              value={opcao.titulo || ''}
                              onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
                              placeholder="Ex: Vi a faixa na frente da igreja"
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Subtítulo / Descrição Explicativa
                            </label>
                            <input
                              type="text"
                              value={opcao.subtitulo || ''}
                              onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
                              placeholder="Ex: Passei e vi o anúncio na fachada"
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Escolha rápida de Ícone e Cor */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          {/* Ícone */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ícone:</span>
                            <select
                              value={opcao.icone || 'Tag'}
                              onChange={(e) => handleUpdateOpcaoP1(idx, 'icone', e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200"
                            >
                              {ICONES_DISPONIVEIS.map(ic => (
                                <option key={ic.id} value={ic.id}>{ic.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Cor */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tema:</span>
                            <div className="flex items-center gap-1">
                              {CORES_DISPONIVEIS.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleUpdateOpcaoP1(idx, 'cor', c.id)}
                                  className={`w-5 h-5 rounded-md border transition-all ${c.bg} ${
                                    (opcao.cor || 'amber') === c.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                                  }`}
                                  title={c.label}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: FLUXO DE TELAS (3, 4 E 5 TELAS SOLICITADO PELO USER)  */}
          {/* ============================================================ */}
          {activeTab === 'fluxo' && (
            <div className="space-y-5">
              
              {/* Apresentação do Fluxo Completo */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white">Fluxo Sequencial de Telas no Celular</h3>
                  </div>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/30">
                    Suporta 3, 4 e 5 Telas
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aqui você pode definir quantas telas de perguntas o visitante verá antes de informar a quantidade de acompanhantes. Você pode ativar perguntas extras para saber se é a primeira vez dele, faixa etária ou outras pesquisas da comunidade.
                </p>

                {/* Linha do Tempo Visual do Fluxo */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">1. Espera (Start)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">2. Como Chegou</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  {(config.telasExtras || []).map((t, i) => (
                    <React.Fragment key={t.id || i}>
                      <span className={`px-2.5 py-1 rounded-lg border ${t.ativa ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-900 text-slate-600 border-slate-800 line-through'}`}>
                        {i + 3}. {t.titulo ? t.titulo.slice(0, 18) + '...' : `Tela Extra ${i + 1}`}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </React.Fragment>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Acompanhantes</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">Agradecimento</span>
                </div>
              </div>

              {/* Telas Extras Configuradas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Perguntas e Telas Adicionais
                  </h4>
                  <button
                    type="button"
                    onClick={handleAdicionarNovaTelaExtra}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Nova Tela de Pergunta</span>
                  </button>
                </div>

                {(config.telasExtras || []).map((telaExtra, tIdx) => (
                  <div 
                    key={telaExtra.id || tIdx}
                    className={`rounded-2xl border p-4 space-y-3.5 transition-all ${
                      telaExtra.ativa 
                        ? 'bg-slate-950/90 border-indigo-500/40 shadow-lg' 
                        : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    }`}
                  >
                    {/* Header da Tela Extra com Ativar/Desativar */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-xs border border-indigo-500/30">
                          {tIdx + 3}ª
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white">Tela Extra #{tIdx + 1}</h4>
                          <span className="text-[10px] text-slate-400">Inserida no celular entre a 1ª pergunta e os acompanhantes</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleTelaExtra(tIdx)}
                          className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 border ${
                            telaExtra.ativa
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {telaExtra.ativa ? 'Tela Ativa no Celular' : 'Tela Desativada'}
                        </button>
                      </div>
                    </div>

                    {/* Título e Subtítulo da Pergunta Extra */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Título da Pergunta
                        </label>
                        <input
                          type="text"
                          value={telaExtra.titulo || ''}
                          onChange={(e) => handleUpdateTelaExtra(tIdx, 'titulo', e.target.value)}
                          placeholder="Ex: É a sua primeira vez conosco?"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Subtítulo
                        </label>
                        <input
                          type="text"
                          value={telaExtra.subtitulo || ''}
                          onChange={(e) => handleUpdateTelaExtra(tIdx, 'subtitulo', e.target.value)}
                          placeholder="Ex: Queremos te dar as boas-vindas"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Cards desta tela extra */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>Cards de Resposta desta Tela:</span>
                        <button
                          type="button"
                          onClick={() => handleAdicionarOpcaoExtra(tIdx)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Card
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(telaExtra.opcoes || []).map((opt, optIdx) => (
                          <div key={opt.id || optIdx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Opção #{optIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleExcluirOpcaoExtra(tIdx, optIdx)}
                                className="text-slate-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={opt.titulo || ''}
                              onChange={(e) => handleUpdateOpcaoExtra(tIdx, optIdx, 'titulo', e.target.value)}
                              placeholder="Título da opção"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                            />
                            <input
                              type="text"
                              value={opt.subtitulo || ''}
                              onChange={(e) => handleUpdateOpcaoExtra(tIdx, optIdx, 'subtitulo', e.target.value)}
                              placeholder="Subtítulo da opção"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: PERGUNTA 2 (ACOMPANHANTES)                            */}
          {/* ============================================================ */}
          {activeTab === 'p2' && (
            <div className="space-y-4">
              {/* Título da Pergunta 2 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Título da Pergunta de Acompanhantes
                </label>
                <textarea
                  rows={2}
                  value={config.pergunta2Titulo || ''}
                  onChange={(e) => setConfig({ ...config, pergunta2Titulo: e.target.value })}
                  placeholder="Ex: Você está só ou tem mais pessoas te acompanhando?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm font-bold text-white resize-none shadow-inner"
                />
              </div>

              {/* Botão Individual (SÓ EU) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                  Texto do Botão Individual (1 Pessoa)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Texto Principal (Amarelo)
                    </label>
                    <input
                      type="text"
                      value={config.opcaoIndividualTitulo || ''}
                      onChange={(e) => setConfig({ ...config, opcaoIndividualTitulo: e.target.value })}
                      placeholder="Ex: SÓ EU"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Complemento / Subtítulo
                    </label>
                    <input
                      type="text"
                      value={config.opcaoIndividualSubtitulo || ''}
                      onChange={(e) => setConfig({ ...config, opcaoIndividualSubtitulo: e.target.value })}
                      placeholder="Ex: , vim sozinho"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Divisor das Opções com Acompanhantes */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Texto do Divisor das Quantidades
                </label>
                <input
                  type="text"
                  value={config.divisorQtdTexto || ''}
                  onChange={(e) => setConfig({ ...config, divisorQtdTexto: e.target.value })}
                  placeholder="Ex: Quantas pessoas vieram com você?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RODAPÉ COM AÇÕES                                             */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRestaurarPadroes}
            className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-750 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
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
