import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Tag, 
  Church, 
  Trash2, 
  Settings, 
  Printer,
  FileSpreadsheet,
  Tv,
  Smartphone,
  CheckCircle2,
  Filter,
  BarChart2,
  FileText,
  Edit3,
  Save,
  X,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Play,
  Pause,
  Sliders,
  Layers,
  QrCode,
  Plus,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  Share2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QuestionsConfigModal from './QuestionsConfigModal';
import FirebaseConfigModal from './FirebaseConfigModal';
import { 
  escutarPresencas, 
  limparDadosLocais, 
  zerarTudo,
  isFirebaseReady,
  escutarTituloEvento,
  saveEventTitle,
  DEFAULT_EVENT_TITLE,
  escutarStatusSessao,
  saveSessionStatus,
  escutarConfigPerguntas,
  getActiveEventId,
  setActiveEventId,
  escutarEventosLista,
  criarNovoEvento,
  salvarEventoAtivoGlobal
} from '../firebase';

export default function DashboardView({ onOpenConfig, onChangeView }) {
  const [presencas, setPresencas] = useState([]);
  const [eventoTitulo, setEventoTitulo] = useState(DEFAULT_EVENT_TITLE);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [inputTitulo, setInputTitulo] = useState('');
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [filtroData, setFiltroData] = useState('hoje');
  const [dataPersonalizada, setDataPersonalizada] = useState(new Date().toISOString().slice(0, 10));
  const [copiedLink, setCopiedLink] = useState('');
  const [zerando, setZerando] = useState(false);
  const [feedbackZerar, setFeedbackZerar] = useState(false);
  const [sessaoAtiva, setSessaoAtiva] = useState(false);
  const [alternandoSessao, setAlternandoSessao] = useState(false);
  const [questionsConfig, setQuestionsConfig] = useState(null);

  // CONTROLE DA SIDEBAR LATERAL ESQUERDA E ABA ATIVA (100% INLINE SEM MODAIS POR CIMA)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Abas disponíveis: 'dashboard' | 'eventos' | 'novo_evento' | 'perguntas' | 'qrcode' | 'links' | 'zerar' | 'firebase'
  const [activeSection, setActiveSection] = useState('dashboard');

  // GESTÃO DE MÚLTIPLOS EVENTOS & QR CODES FIXOS
  const [activeEventId, setActiveEventIdState] = useState(() => getActiveEventId());
  const [eventosLista, setEventosLista] = useState([]);
  const [novoEventoNome, setNovoEventoNome] = useState('');
  const [criandoEvento, setCriandoEvento] = useState(false);

  // AVISO INLINE NO TOPO (SEM MODAL POR CIMA)
  const [inlineToast, setInlineToast] = useState(null);

  const mostrarAvisoInline = (titulo, mensagem, tipo = 'aviso') => {
    setInlineToast({ titulo, mensagem, tipo });
    setTimeout(() => setInlineToast(null), 5000);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  const originUrl = window.location.origin;
  const linkMobile = `${originUrl}/?e=${activeEventId}`;
  const linkTelao = `${originUrl}/?view=telao&e=${activeEventId}`;
  const linkAdmin = `${originUrl}/?view=admin&e=${activeEventId}`;

  useEffect(() => {
    const unsubEventos = escutarEventosLista((lista) => {
      setEventosLista(lista || []);
    });
    return () => unsubEventos && unsubEventos();
  }, []);

  useEffect(() => {
    const unsubPresencas = escutarPresencas((dados) => {
      setPresencas(dados || []);
    }, activeEventId);
    return () => unsubPresencas && unsubPresencas();
  }, [activeEventId]);

  useEffect(() => {
    const unsubTitulo = escutarTituloEvento((titulo) => {
      if (titulo) {
        setEventoTitulo(titulo);
        setInputTitulo(titulo);
      }
    }, activeEventId);
    const unsubSessao = escutarStatusSessao((ativa) => {
      setSessaoAtiva(ativa);
    }, activeEventId);
    const unsubConfig = escutarConfigPerguntas((cfg) => {
      setQuestionsConfig(cfg);
    }, activeEventId);
    return () => {
      unsubTitulo && unsubTitulo();
      unsubSessao && unsubSessao();
      unsubConfig && unsubConfig();
    };
  }, [activeEventId]);

  const handleSelectEvent = async (e) => {
    const val = e.target.value;
    if (val === '__novo__') {
      setActiveSection('novo_evento');
      return;
    }
    setActiveEventId(val);
    setActiveEventIdState(val);
    const ev = eventosLista.find(item => item.id === val);
    if (ev && ev.titulo) {
      setEventoTitulo(ev.titulo);
      setInputTitulo(ev.titulo);
    }
    await salvarEventoAtivoGlobal(val, ev?.titulo || '');
  };

  const handleCriarEvento = async (e) => {
    e?.preventDefault();
    if (!novoEventoNome.trim()) return;
    setCriandoEvento(true);
    try {
      const created = await criarNovoEvento(null, novoEventoNome.trim());
      setActiveEventIdState(created.id);
      setEventoTitulo(created.titulo);
      setInputTitulo(created.titulo);
      setNovoEventoNome('');
      setActiveSection('dashboard');
      mostrarAvisoInline('Evento Criado!', `"${created.titulo}" foi criado e ativado no painel.`, 'sucesso');
    } catch (err) {
      mostrarAvisoInline('Erro ao Criar Evento', err?.message || String(err), 'erro');
    } finally {
      setCriandoEvento(false);
    }
  };

  const handleToggleSessao = async (targetId = null, forceStatus = null) => {
    setAlternandoSessao(true);
    try {
      const cleanId = (typeof targetId === 'string' && targetId.trim()) ? targetId.trim() : activeEventId;
      const ev = eventosLista.find(e => e.id === cleanId);
      const isTargetActive = cleanId === activeEventId ? sessaoAtiva : Boolean(ev?.sessaoAtiva);
      const novoStatus = typeof forceStatus === 'boolean' ? forceStatus : !isTargetActive;
      await saveSessionStatus(novoStatus, cleanId);
      if (novoStatus === true) {
        await salvarEventoAtivoGlobal(cleanId, ev?.titulo || eventoTitulo);
      }
    } catch (e) {
      mostrarAvisoInline('Erro ao Alterar Status', e?.message || String(e), 'erro');
    } finally {
      setAlternandoSessao(false);
    }
  };

  const handleSalvarTitulo = async () => {
    if (!inputTitulo.trim()) return;
    await saveEventTitle(inputTitulo.trim(), activeEventId);
    await salvarEventoAtivoGlobal(activeEventId, inputTitulo.trim());
    setEditandoTitulo(false);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const handleConfirmarZerar = async () => {
    setZerando(true);
    try {
      await zerarTudo(activeEventId);
      setActiveSection('dashboard');
      setFeedbackZerar(true);
      setTimeout(() => setFeedbackZerar(false), 4500);
    } catch (e) {
      mostrarAvisoInline('Erro ao Zerar Dados', e?.message || String(e), 'erro');
    } finally {
      setZerando(false);
    }
  };

  const hoje = new Date().toLocaleDateString('pt-BR');

  const presencasFiltradas = presencas.filter((item) => {
    if (filtroData === 'hoje') {
      return item.dataCulto === hoje;
    }
    if (filtroData === 'personalizado') {
      const [y, m, d] = dataPersonalizada.split('-');
      const dataFormatada = `${d}/${m}/${y}`;
      return item.dataCulto === dataFormatada;
    }
    return true;
  });

  // Estatísticas
  const totalPessoas = presencasFiltradas.reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);
  const totalCheckins = presencasFiltradas.length;
  const mediaPorGrupo = totalCheckins > 0 ? (totalPessoas / totalCheckins).toFixed(1) : '0';

  // Contagens por categoria
  const contagemCategorias = presencasFiltradas.reduce((acc, curr) => {
    const cat = curr.comoChegou || 'Outro';
    const qtd = Number(curr.qtdPessoas) || 1;
    acc[cat] = (acc[cat] || 0) + qtd;
    return acc;
  }, {});

  // Lista dinâmica de categorias unindo o que está cadastrado e o que recebeu votos
  const listaOpcoesConfig = questionsConfig?.opcoesChegada || [];
  const categoriasUnicas = Array.from(new Set([
    ...listaOpcoesConfig.filter(o => o.ativo !== false).map(o => o.titulo),
    ...Object.keys(contagemCategorias)
  ])).filter(Boolean);

  const paletteColors = [
    'bg-amber-500 text-amber-300',
    'bg-sky-500 text-sky-300',
    'bg-emerald-500 text-emerald-300',
    'bg-purple-500 text-purple-300',
    'bg-rose-500 text-rose-300',
    'bg-teal-500 text-teal-300',
    'bg-indigo-500 text-indigo-300',
    'bg-orange-500 text-orange-300'
  ];

  // Exportar para CSV / Excel com UTF-8
  const handleExportCSV = () => {
    if (presencasFiltradas.length === 0) {
      mostrarAvisoInline('Exportar CSV', 'Não há registros no período selecionado para exportar.', 'aviso');
      return;
    }

    const headers = [
      'Evento',
      'Data do Culto',
      'Horário',
      'Como Chegou',
      'Quantidade de Pessoas no Grupo',
      'Respostas Gavetas (Subperguntas)',
      'Respostas de Texto (Dissertativas)',
      'ID do Registro'
    ];
    const rows = presencasFiltradas.map(p => {
      const gavetasStr = p.gavetaRespostas 
        ? Object.entries(p.gavetaRespostas).map(([k, v]) => `${k}: ${v}`).join(' | ') 
        : '';
      const textosStr = p.textoRespostas 
        ? Object.entries(p.textoRespostas).map(([k, v]) => `${k}: ${v}`).join(' | ') 
        : '';
      return [
        `"${p.evento || eventoTitulo}"`,
        `"${p.dataCulto || hoje}"`,
        `"${p.hora || ''}"`,
        `"${(p.comoChegou || '').replace(/"/g, '""')}"`,
        p.qtdPessoas || 1,
        `"${gavetasStr.replace(/"/g, '""')}"`,
        `"${textosStr.replace(/"/g, '""')}"`,
        `"${p.id || ''}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${eventoTitulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLimpar = () => {
    limparDadosLocais();
    mostrarAvisoInline('Dados Locais Apagados', 'Os registros de teste locais foram removidos.', 'sucesso');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const selectMenu = (section) => {
    setActiveSection(section);
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* ============================================================== */}
      {/* OVERLAY MOBILE PARA O SLIDE BAR                                */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div 
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden print:hidden"
        />
      )}

      {/* ============================================================== */}
      {/* SLIDE BAR LATERAL À ESQUERDA (MENUS E NAVEGAÇÃO DE ABAS)       */}
      {/* ============================================================== */}
      <aside
        className={`print:hidden fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-900/95 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-300 shadow-2xl shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* TOPO DA SIDEBAR: LOGO & BOTÃO RETRAIR */}
        <div>
          <div className={`h-16 px-4 border-b border-slate-800/80 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Church className="w-5 h-5" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="text-xs font-black tracking-wider uppercase text-amber-400 block truncate">
                    Conta Pessoas
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block truncate">
                    Painel de Controle
                  </span>
                </div>
              )}
            </div>

            {/* Botão Retrair/Expandir (Desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Botão Fechar (Mobile) */}
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* LISTA DE MENUS DA SIDEBAR (TODOS ABREM ABAS INLINE) */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* GRUPO 1: VISÃO & EVENTOS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Visão & Eventos
                </span>
              )}

              <button
                onClick={() => selectMenu('dashboard')}
                title="Painel Principal"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'dashboard'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Painel Principal</span>}
              </button>

              <button
                onClick={() => selectMenu('eventos')}
                title="Eventos Simultâneos e Controle de Pausa"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold transition ${
                  activeSection === 'eventos'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">Eventos Simultâneos</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {eventosLista.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => selectMenu('novo_evento')}
                title="Criar Novo Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'novo_evento'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-emerald-300 hover:bg-emerald-500/10 border border-transparent'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Novo Evento</span>}
              </button>
            </div>

            {/* GRUPO 2: PESQUISA & TELÃO */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Pesquisa & Telão
                </span>
              )}

              <button
                onClick={() => selectMenu('perguntas')}
                title="Configurar Perguntas e Cards"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'perguntas'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Configurar Perguntas</span>}
              </button>

              <button
                onClick={() => selectMenu('qrcode')}
                title="QR Code Fixo do Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'qrcode'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">QR Code Fixo</span>}
              </button>

              <button
                onClick={() => { onChangeView('telao'); closeMobileMenu(); }}
                title="Abrir Modo Telão"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent`}
              >
                <Tv className="w-4 h-4 text-purple-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Abrir Telão</span>}
              </button>

              <button
                onClick={() => selectMenu('links')}
                title="Links Rápidos (Celular, Telão e Admin)"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'links'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Links de Acesso</span>}
              </button>
            </div>

            {/* GRUPO 3: RELATÓRIOS & AÇÕES */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Relatórios & Ações
                </span>
              )}

              <button
                onClick={() => {
                  setActiveSection('dashboard');
                  closeMobileMenu();
                  setTimeout(() => handlePrint(), 150);
                }}
                title="Imprimir ou Salvar Relatório PDF"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent`}
              >
                <Printer className="w-4 h-4 text-sky-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Imprimir / PDF</span>}
              </button>

              <button
                onClick={() => { handleExportCSV(); closeMobileMenu(); }}
                title="Exportar Planilha Excel (CSV)"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Exportar Excel (CSV)</span>}
              </button>

              <button
                onClick={() => selectMenu('zerar')}
                disabled={zerando}
                title="Zerar Dados deste Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'zerar'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 border border-transparent'
                }`}
              >
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{zerando ? 'Zerando...' : 'Zerar Dados'}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* RODAPÉ DA SIDEBAR: ABA FIREBASE */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <button
            onClick={() => selectMenu('firebase')}
            title="Configurações e Status da Conexão Firebase"
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-bold border transition ${
              activeSection === 'firebase'
                ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md'
                : isFirebaseReady()
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Settings className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">
                  {isFirebaseReady() ? 'Firebase Ativo' : 'Conectar Firebase'}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${isFirebaseReady() ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            )}
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* ÁREA DE CONTEÚDO PRINCIPAL À DIREITA (ABAS INLINE)             */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR FIXA: SELETOR DE EVENTO + CONTROLE DE SESSÃO + FILTRO */}
        <header className="print:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Esquerda: Botão Menu Mobile + Seletor do Evento Ativo */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Abrir Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {editandoTitulo ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={inputTitulo}
                    onChange={(e) => setInputTitulo(e.target.value)}
                    placeholder="Nome do Evento"
                    className="bg-slate-900 border border-amber-500 rounded-xl px-3 py-1.5 text-sm sm:text-base font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSalvarTitulo}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                  <button
                    onClick={() => {
                      setInputTitulo(eventoTitulo);
                      setEditandoTitulo(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={activeEventId}
                    onChange={handleSelectEvent}
                    className="bg-slate-900 border border-slate-700/80 hover:border-amber-400 focus:border-amber-400 rounded-xl px-3 py-1.5 text-sm sm:text-base font-black text-amber-300 cursor-pointer shadow-sm transition max-w-[230px] sm:max-w-md truncate"
                  >
                    {eventosLista.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-slate-900 text-white font-bold">
                        {ev.titulo}
                      </option>
                    ))}
                    <option value="__novo__" className="bg-slate-900 text-emerald-400 font-bold">
                      + Criar Novo Evento...
                    </option>
                  </select>

                  <button
                    onClick={() => setEditandoTitulo(true)}
                    title="Editar nome deste evento"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-slate-400 hover:text-amber-400 transition shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {salvoFeedback && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Salvo
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Direita: Status Ao Vivo / Pausa Rápido + Filtro de Período */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
              {/* Filtro de Período Integrado na Barra Superior */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <div className="flex items-center gap-1 px-2 text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">Período:</span>
                </div>
                <button
                  onClick={() => setFiltroData('hoje')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filtroData === 'hoje' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hoje ({hoje})
                </button>
                <button
                  onClick={() => setFiltroData('todos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filtroData === 'todos' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroData('personalizado')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filtroData === 'personalizado' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Data
                </button>
                {filtroData === 'personalizado' && (
                  <input
                    type="date"
                    value={dataPersonalizada}
                    onChange={(e) => setDataPersonalizada(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200"
                  />
                )}
              </div>

              {/* Botão de Ação Principal: Liberar / Pausar Sessão */}
              {sessaoAtiva ? (
                <button
                  onClick={() => handleToggleSessao(activeEventId, false)}
                  disabled={alternandoSessao}
                  className="px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-900/30 active:scale-95 transition flex items-center gap-1.5"
                  title="Pausar este evento e voltar celulares para tela de espera"
                >
                  <Pause className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{alternandoSessao ? 'Pausando...' : 'PAUSAR SESSÃO'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleSessao(activeEventId, true)}
                  disabled={alternandoSessao}
                  className="px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center gap-1.5"
                  title="Liberar celulares para responder este evento"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{alternandoSessao ? 'Liberando...' : 'LIBERAR SESSÃO'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL DO DASHBOARD (RENDERIZA A ABA SELECIONADA NA SLIDEBAR) */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
          
          {/* BANNER DE AVISO INLINE (SE HOUVER) */}
          {inlineToast && (
            <div className={`print:hidden p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
              inlineToast.tipo === 'erro'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : inlineToast.tipo === 'sucesso'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            }`}>
              <div className="flex items-center gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div>
                  <strong className="font-black mr-1.5">{inlineToast.titulo}:</strong>
                  <span>{inlineToast.mensagem}</span>
                </div>
              </div>
              <button onClick={() => setInlineToast(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* CABEÇALHO DO RELATÓRIO OFICIAL (SÓ APARECE NA IMPRESSÃO/PDF)  */}
          {/* ============================================================== */}
          <div className="hidden print:block text-slate-900 border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wide">{eventoTitulo}</h1>
                <p className="text-sm text-slate-600 font-semibold mt-0.5">Relatório Oficial de Presença e Acompanhantes</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p><strong>Data de Extração:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                <p><strong>Filtro:</strong> {filtroData === 'hoje' ? `Culto de Hoje (${hoje})` : 'Todos os Registros'}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-5 p-4 bg-slate-100 rounded-lg border border-slate-300 text-center">
              <div>
                <span className="text-xs text-slate-600 block">Total de Presentes</span>
                <span className="text-2xl font-black text-slate-900">{totalPessoas}</span>
              </div>
              <div>
                <span className="text-xs text-slate-600 block">Total de Grupos/Aparelhos</span>
                <span className="text-2xl font-black text-slate-900">{totalCheckins}</span>
              </div>
              <div>
                <span className="text-xs text-slate-600 block">Média por Grupo</span>
                <span className="text-2xl font-black text-slate-900">{mediaPorGrupo}</span>
              </div>
              <div>
                <span className="text-xs text-slate-600 block">Status da Sessão</span>
                <span className="text-2xl font-black text-slate-900">{sessaoAtiva ? 'Aberta' : 'Aguardando'}</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ABA 1: PAINEL PRINCIPAL (DASHBOARD)                            */}
          {/* ============================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              {/* FAIXA DE STATUS E LINKS RÁPIDOS */}
              <div className="print:hidden grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* Banner Status do Evento */}
                <div className={`xl:col-span-7 p-4 rounded-2xl border transition-all shadow-lg flex items-center justify-between gap-4 ${
                  sessaoAtiva 
                    ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/60 border-emerald-500/40' 
                    : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                      sessaoAtiva 
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' 
                        : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                    }`}>
                      {sessaoAtiva ? <Radio className="w-5 h-5 animate-pulse" /> : <Pause className="w-5 h-5 fill-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sessaoAtiva 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${sessaoAtiva ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                          {sessaoAtiva ? 'RECEBENDO RESPOSTAS AO VIVO' : 'EM ESPERA (AGUARDANDO LIBERAÇÃO)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {sessaoAtiva 
                          ? `Celulares conectados em "${eventoTitulo}" estão liberados para votar.` 
                          : `Os celulares em "${eventoTitulo}" estão na tela de espera aguardando você liberar.`}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveSection('qrcode')}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-300 transition"
                      title="Abrir Aba QR Code Fixo"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onChangeView('telao')}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-300 transition"
                      title="Abrir Telão"
                    >
                      <Tv className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Compacto de Links Diretos */}
                <div className="xl:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-center gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Links do Evento Ativo
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
                      ID: {activeEventId}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => copyToClipboard(linkMobile, 'mobile')}
                      className="bg-slate-950/90 hover:bg-slate-950 border border-emerald-900/50 hover:border-emerald-500/50 rounded-xl px-2.5 py-2 flex items-center justify-between gap-1.5 transition group"
                      title="Copiar link para celulares"
                    >
                      <span className="text-xs font-bold text-emerald-300 truncate">📱 Celular</span>
                      <span className="px-2 py-0.5 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded text-[10px] font-bold shrink-0">
                        {copiedLink === 'mobile' ? '✓' : 'Copiar'}
                      </span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(linkTelao, 'telao')}
                      className="bg-slate-950/90 hover:bg-slate-950 border border-sky-900/50 hover:border-sky-500/50 rounded-xl px-2.5 py-2 flex items-center justify-between gap-1.5 transition group"
                      title="Copiar link do Telão"
                    >
                      <span className="text-xs font-bold text-sky-300 truncate">📺 Telão</span>
                      <span className="px-2 py-0.5 bg-sky-600 group-hover:bg-sky-500 text-white rounded text-[10px] font-bold shrink-0">
                        {copiedLink === 'telao' ? '✓' : 'Copiar'}
                      </span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(linkAdmin, 'admin')}
                      className="bg-slate-950/90 hover:bg-slate-950 border border-indigo-900/50 hover:border-indigo-500/50 rounded-xl px-2.5 py-2 flex items-center justify-between gap-1.5 transition group"
                      title="Copiar link deste Painel Admin"
                    >
                      <span className="text-xs font-bold text-indigo-300 truncate">📊 Admin</span>
                      <span className="px-2 py-0.5 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded text-[10px] font-bold shrink-0">
                        {copiedLink === 'admin' ? '✓' : 'Copiar'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARDS DE KPI / MÉTRICAS (4 COLUNAS) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Pessoas</span>
                      <span className="text-2xl font-black text-white leading-tight">{totalPessoas}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Respostas</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white leading-tight">{totalCheckins}</span>
                        {totalCheckins > 0 && (
                          <span className="text-[11px] text-slate-400 font-medium">({mediaPorGrupo}/grupo)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSection('perguntas')}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm cursor-pointer transition"
                  title="Clique para abrir a aba Configurar Perguntas"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block truncate">Cards Ativos</span>
                      <span className="text-2xl font-black text-emerald-300 leading-tight">
                        {listaOpcoesConfig.filter(c => c.ativo !== false).length}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSessao(activeEventId)}
                  disabled={alternandoSessao}
                  title={sessaoAtiva ? 'Clique para pausar a pesquisa' : 'Clique para liberar a pesquisa'}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition active:scale-95 text-left shadow-sm cursor-pointer ${
                    sessaoAtiva 
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400/80' 
                      : 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      sessaoAtiva ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {sessaoAtiva ? <Pause className="w-5 h-5 fill-emerald-400" /> : <Play className="w-5 h-5 fill-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[11px] font-bold uppercase tracking-wider block truncate ${
                        sessaoAtiva ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        Status
                      </span>
                      <span className={`text-lg font-black leading-tight ${
                        sessaoAtiva ? 'text-emerald-300' : 'text-amber-300'
                      }`}>
                        {sessaoAtiva ? 'AO VIVO' : 'EM ESPERA'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* GRID PRINCIPAL: DISTRIBUIÇÃO & REGISTROS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* COLUNA ESQUERDA: DISTRIBUIÇÃO DAS RESPOSTAS */}
                <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3.5 print:hidden">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      <span>Distribuição das Respostas</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                      {categoriasUnicas.length} {categoriasUnicas.length === 1 ? 'opção' : 'opções'}
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {categoriasUnicas.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Nenhum card cadastrado ou votado ainda.</p>
                    ) : (
                      categoriasUnicas.map((catNome, idx) => {
                        const qtd = contagemCategorias[catNome] || 0;
                        const pct = totalPessoas > 0 ? Math.round((qtd / totalPessoas) * 100) : 0;
                        const corEstilo = paletteColors[idx % paletteColors.length];
                        const corBg = corEstilo.split(' ')[0];
                        const corTexto = corEstilo.split(' ')[1];

                        return (
                          <div key={catNome} className="space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                            <div className="flex justify-between items-center text-xs font-semibold gap-2">
                              <span className={`flex items-center gap-1.5 truncate ${corTexto}`}>
                                <Tag className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{catNome}</span>
                              </span>
                              <span className="text-slate-300 font-mono shrink-0">
                                {qtd} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`${corBg} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLUNA DIREITA: TABELA DE REGISTROS INDIVIDUAIS */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300 print:bg-white print:text-black">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between print:border-slate-300">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400 print:text-black" />
                      <h3 className="font-bold text-white print:text-black text-sm">Registros Individuais</h3>
                      <span className="text-xs bg-slate-800 print:bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-300 print:text-black font-semibold">
                        {presencasFiltradas.length} respostas
                      </span>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        onClick={handleExportCSV}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
                        title="Baixar planilha Excel (CSV)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>

                      {!isFirebaseReady() && (
                        <button
                          onClick={handleLimpar}
                          title="Zerar dados locais"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold border-b border-slate-800/80 print:border-slate-300">
                        <tr>
                          <th className="py-2.5 px-3.5">#</th>
                          <th className="py-2.5 px-3.5">Horário</th>
                          <th className="py-2.5 px-3.5">Data</th>
                          <th className="py-2.5 px-3.5">Como Chegou</th>
                          <th className="py-2.5 px-3.5">Respostas (Gavetas & Textos)</th>
                          <th className="py-2.5 px-3.5 text-center">Grupo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-200 print:text-black">
                        {presencasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400">
                              Nenhum registro encontrado no filtro selecionado.
                            </td>
                          </tr>
                        ) : (
                          presencasFiltradas.map((item, index) => {
                            const temGaveta = item.gavetaRespostas && Object.keys(item.gavetaRespostas).length > 0;
                            const temTexto = item.textoRespostas && Object.keys(item.textoRespostas).length > 0;

                            return (
                              <tr key={item.id || index} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                                <td className="py-2.5 px-3.5 font-mono text-slate-400">{index + 1}</td>
                                <td className="py-2.5 px-3.5 font-mono">{item.hora || '--:--'}</td>
                                <td className="py-2.5 px-3.5">{item.dataCulto || hoje}</td>
                                <td className="py-2.5 px-3.5 font-semibold text-white print:text-black">
                                  {item.comoChegou}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  {temGaveta && (
                                    <div className="space-y-1">
                                      {Object.entries(item.gavetaRespostas).map(([cardId, txt]) => (
                                        <span key={cardId} className="inline-block text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg mr-1 mb-1 font-sans">
                                          🗄️ {txt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {temTexto && (
                                    <div className="space-y-1">
                                      {Object.entries(item.textoRespostas).map(([telaId, txt]) => (
                                        <span key={telaId} className="inline-block text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg mr-1 mb-1 font-sans">
                                          ✍️ "{txt}"
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {!temGaveta && !temTexto && (
                                    <span className="text-slate-500 text-[11px]">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3.5 text-center">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 print:bg-slate-200 text-amber-300 print:text-black border border-amber-500/30 print:border-slate-300 whitespace-nowrap">
                                    {item.qtdPessoas === 1 ? '1 (Só eu)' : `${item.qtdPessoas} pessoas`}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: EVENTOS SIMULTÂNEOS (ABA INLINE)                        */}
          {/* ============================================================== */}
          {activeSection === 'eventos' && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Eventos Simultâneos & Controle de Pausa
                    </h2>
                    <p className="text-xs text-slate-400">
                      Pause ou libere cada evento individualmente. Eventos em salas ou lugares diferentes funcionam de forma independente.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSection('novo_evento')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Criar Novo Evento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {eventosLista.map((ev) => {
                  const isSelected = ev.id === activeEventId;
                  const isLive = isSelected ? sessaoAtiva : Boolean(ev.sessaoAtiva);
                  const evLink = `${originUrl}/?e=${ev.id}`;

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-slate-800/60 border-sky-500/50 shadow-md' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-white truncate">{ev.titulo}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                SELECIONADO NO PAINEL
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <code className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              ID: {ev.id}
                            </code>
                            <button
                              onClick={() => copyToClipboard(evLink, `ev_${ev.id}`)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
                            >
                              {copiedLink === `ev_${ev.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedLink === `ev_${ev.id}` ? 'Link Copiado!' : 'Copiar Link Celular'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                              isLive
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                            {isLive ? 'AO VIVO' : 'PAUSADO'}
                          </span>

                          {isLive ? (
                            <button
                              onClick={() => handleToggleSessao(ev.id, false)}
                              disabled={alternandoSessao}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 flex items-center gap-1.5 transition active:scale-95"
                            >
                              <Pause className="w-3.5 h-3.5 fill-amber-400" />
                              <span>Pausar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleSessao(ev.id, true)}
                              disabled={alternandoSessao}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 transition active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-400" />
                              <span>Liberar</span>
                            </button>
                          )}

                          {!isSelected && (
                            <button
                              onClick={() => {
                                setActiveEventId(ev.id);
                                setActiveEventIdState(ev.id);
                                if (ev.titulo) {
                                  setEventoTitulo(ev.titulo);
                                  setInputTitulo(ev.titulo);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            >
                              Ativar no Painel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: CRIAR NOVO EVENTO (ABA INLINE)                          */}
          {/* ============================================================== */}
          {activeSection === 'novo_evento' && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-2xl shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Criar Novo Evento</h2>
                  <p className="text-xs text-slate-400">Gera um link e um QR Code fixo exclusivo para este evento ou culto</p>
                </div>
              </div>

              <form onSubmit={handleCriarEvento} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-amber-300 block mb-1.5">
                    Nome do Evento / Culto / Programa
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={novoEventoNome}
                    onChange={(e) => setNovoEventoNome(e.target.value)}
                    placeholder="Ex: Culto de Jovens, Retiro Espiritual, Avaliação Restinga..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {novoEventoNome && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <span className="text-slate-400 block font-mono">
                      ID Fixo do Evento: <strong className="text-amber-300">{novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}</strong>
                    </span>
                    <span className="text-emerald-400 block font-mono">
                      Link Permanente: {originUrl}/?e={novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('dashboard')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Voltar ao Painel
                  </button>
                  <button
                    type="submit"
                    disabled={criandoEvento || !novoEventoNome.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition disabled:opacity-50"
                  >
                    {criandoEvento ? 'Criando Evento...' : 'Criar & Ativar Evento'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 4: CONFIGURAR PERGUNTAS (ABA INLINE COM SIMULADOR)         */}
          {/* ============================================================== */}
          {activeSection === 'perguntas' && (
            <div className="print:hidden">
              <QuestionsConfigModal 
                inline={true}
                isOpen={true} 
                onClose={() => setActiveSection('dashboard')} 
                activeEventId={activeEventId}
                eventTitle={eventoTitulo}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 5: QR CODE FIXO DO EVENTO (ABA INLINE)                     */}
          {/* ============================================================== */}
          {activeSection === 'qrcode' && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">QR Code Fixo — {eventoTitulo}</h2>
                    <p className="text-xs text-slate-400 font-mono">ID do Evento: {activeEventId}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-xl border-4 border-emerald-400/30 shrink-0">
                  <QRCodeSVG
                    value={linkMobile}
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-4 flex-1 w-full">
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="font-bold text-amber-300 text-sm">
                      🔒 QR Code 100% Permanente e Imutável
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Este QR Code aponta diretamente para o evento <strong>{eventoTitulo}</strong>. Você pode imprimir em cartazes, boletins ou projetar no telão com antecedência — o endereço nunca muda.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-emerald-400 truncate select-all">
                      {linkMobile}
                    </span>
                    <button
                      onClick={() => copyToClipboard(linkMobile, 'qrcode_tab')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5"
                    >
                      {copiedLink === 'qrcode_tab' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'qrcode_tab' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onChangeView('telao')}
                      className="px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs transition flex items-center gap-2"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Exibir no Telão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Folha</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 6: LINKS DE ACESSO DO EVENTO (ABA INLINE)                  */}
          {/* ============================================================== */}
          {activeSection === 'links' && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-3xl shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Links Diretos — {eventoTitulo}</h2>
                  <p className="text-xs text-slate-400">Compartilhe ou abra cada módulo do evento ativo</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Link Celular */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                      📱 Link do Formulário Mobile (Visitantes & Membros)
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate block mt-1 select-all">
                      {linkMobile}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(linkMobile, 'tab_mobile')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {copiedLink === 'tab_mobile' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'tab_mobile' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                    <a
                      href={linkMobile}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                      title="Abrir em nova guia"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Link Telão */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-sky-300 uppercase tracking-wider block">
                      📺 Link do Telão da Igreja (Projeção com QR Code Ao Vivo)
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate block mt-1 select-all">
                      {linkTelao}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(linkTelao, 'tab_telao')}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {copiedLink === 'tab_telao' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'tab_telao' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                    <a
                      href={linkTelao}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                      title="Abrir em nova guia"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Link Admin */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block">
                      📊 Link Direto deste Painel Admin
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate block mt-1 select-all">
                      {linkAdmin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(linkAdmin, 'tab_admin')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {copiedLink === 'tab_admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'tab_admin' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 7: ZERAR DADOS DO EVENTO (ABA INLINE)                      */}
          {/* ============================================================== */}
          {activeSection === 'zerar' && (
            <div className="print:hidden bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 max-w-xl shadow-xl space-y-5">
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-800">
                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Zerar Presenças — {eventoTitulo}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Esta ação reinicia a contagem deste evento e libera os celulares para votar novamente.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>Todos os registros de <strong>{eventoTitulo}</strong> serão apagados do banco.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>Os contadores de presença deste evento voltarão a <strong>zero</strong>.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                  <span>Todos os celulares que já votaram neste evento serão <strong>destravados</strong>.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('dashboard')}
                  disabled={zerando}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancelar e Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarZerar}
                  disabled={zerando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{zerando ? 'Zerando Dados...' : 'Confirmar e Zerar Tudo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 8: CONFIGURAÇÃO DO FIREBASE (ABA INLINE)                   */}
          {/* ============================================================== */}
          {activeSection === 'firebase' && (
            <div className="print:hidden">
              <FirebaseConfigModal 
                inline={true}
                isOpen={true} 
                onClose={() => setActiveSection('dashboard')} 
              />
            </div>
          )}

          {/* Assinatura no rodapé da impressão */}
          <div className="hidden print:flex justify-between pt-16 text-center text-xs text-slate-700">
            <div className="w-64 border-t border-slate-400 pt-2">
              <p className="font-bold">Recepção / Secretaria</p>
            </div>
            <div className="w-64 border-t border-slate-400 pt-2">
              <p className="font-bold">Pastor / Direção do Evento</p>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Feedback de Sucesso ao Zerar */}
      {feedbackZerar && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="text-xs font-bold">Banco zerado e todos os celulares destravados com sucesso!</span>
        </div>
      )}
    </div>
  );
}
