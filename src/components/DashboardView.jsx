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
  Radio
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QuestionsConfigModal from './QuestionsConfigModal';
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
  const [showModalZerar, setShowModalZerar] = useState(false);
  const [feedbackZerar, setFeedbackZerar] = useState(false);
  const [modalPerguntasOpen, setModalPerguntasOpen] = useState(false);
  const [sessaoAtiva, setSessaoAtiva] = useState(false);
  const [alternandoSessao, setAlternandoSessao] = useState(false);
  const [questionsConfig, setQuestionsConfig] = useState(null);

  // CONTROLE DA SIDEBAR LATERAL ESQUERDA (EXPANSÍVEL / RETRÁTIL + DRAWER MOBILE)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'links'

  // GESTÃO DE MÚLTIPLOS EVENTOS & QR CODES FIXOS
  const [activeEventId, setActiveEventIdState] = useState(() => getActiveEventId());
  const [eventosLista, setEventosLista] = useState([]);
  const [showModalQrCode, setShowModalQrCode] = useState(false);
  const [showModalNovoEvento, setShowModalNovoEvento] = useState(false);
  const [showModalEventosSimultaneos, setShowModalEventosSimultaneos] = useState(false);
  const [novoEventoNome, setNovoEventoNome] = useState('');
  const [criandoEvento, setCriandoEvento] = useState(false);

  // MODAL PADRÃO DE AVISOS, ERROS E CONFIRMAÇÕES (DESIGN SYSTEM DO SISTEMA)
  const [modalFeedback, setModalFeedback] = useState({
    isOpen: false,
    tipo: 'aviso', // 'erro' | 'sucesso' | 'aviso' | 'confirm'
    titulo: '',
    mensagem: '',
    onConfirm: null,
    btnTexto: 'OK'
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
      setShowModalNovoEvento(true);
      return;
    }
    setActiveEventId(val);
    setActiveEventIdState(val);
    const ev = eventosLista.find(item => item.id === val);
    if (ev && ev.titulo) {
      setEventoTitulo(ev.titulo);
      setInputTitulo(ev.titulo);
    }
    // Sincroniza evento ativo global para celulares sem ?e=
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
      setShowModalNovoEvento(false);
      setNovoEventoNome('');
    } catch (err) {
      mostrarFeedback('Erro ao Criar Evento', err?.message || String(err), 'erro');
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
      // Ao liberar a sessão, define como o evento ativo global prioritário da igreja
      if (novoStatus === true) {
        await salvarEventoAtivoGlobal(cleanId, ev?.titulo || eventoTitulo);
      }
    } catch (e) {
      mostrarFeedback('Erro ao Alterar Status da Sessão', e?.message || String(e), 'erro');
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
      setShowModalZerar(false);
      setFeedbackZerar(true);
      setTimeout(() => setFeedbackZerar(false), 4500);
    } catch (e) {
      mostrarFeedback('Erro ao Zerar Dados', e?.message || String(e), 'erro');
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

  // 1. Exportar para CSV / Excel com UTF-8
  const handleExportCSV = () => {
    if (presencasFiltradas.length === 0) {
      mostrarFeedback('Exportar CSV', 'Não há registros no período selecionado para exportar.', 'aviso');
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
    mostrarConfirm(
      'Limpar Dados Locais', 
      'Atenção: Deseja apagar os dados locais de teste armazenados neste navegador?', 
      () => limparDadosLocais()
    );
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

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
      {/* SLIDE BAR LATERAL À ESQUERDA (MENUS E NAVEGAÇÃO)               */}
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

          {/* LISTA DE MENUS DA SIDEBAR */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* GRUPO 1: PAINEL & EVENTOS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Visão & Eventos
                </span>
              )}

              <button
                onClick={() => { setActiveSection('dashboard'); closeMobileMenu(); }}
                title="Visão Geral do Painel"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'dashboard'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Painel Principal</span>}
              </button>

              <button
                onClick={() => { setShowModalEventosSimultaneos(true); closeMobileMenu(); }}
                title="Eventos Simultâneos e Controle de Pausa"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition`}
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
                onClick={() => { setShowModalNovoEvento(true); closeMobileMenu(); }}
                title="Criar Novo Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition gap-3`}
              >
                <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Novo Evento</span>}
              </button>
            </div>

            {/* GRUPO 2: PESQUISA & EXIBIÇÃO */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Pesquisa & Telão
                </span>
              )}

              <button
                onClick={() => { setModalPerguntasOpen(true); closeMobileMenu(); }}
                title="Configurar Perguntas e Cards"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3`}
              >
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Configurar Perguntas</span>}
              </button>

              <button
                onClick={() => { setShowModalQrCode(true); closeMobileMenu(); }}
                title="QR Code Fixo do Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3`}
              >
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">QR Code Fixo</span>}
              </button>

              <button
                onClick={() => { onChangeView('telao'); closeMobileMenu(); }}
                title="Abrir Modo Telão"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3`}
              >
                <Tv className="w-4 h-4 text-purple-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Abrir Telão</span>}
              </button>

              <button
                onClick={() => { setActiveSection(activeSection === 'links' ? 'dashboard' : 'links'); closeMobileMenu(); }}
                title="Links Rápidos (Celular, Telão e Admin)"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'links'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Links de Acesso</span>}
              </button>
            </div>

            {/* GRUPO 3: RELATÓRIOS & DADOS */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              {!sidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Relatórios & Ações
                </span>
              )}

              <button
                onClick={() => { handlePrint(); closeMobileMenu(); }}
                title="Imprimir ou Salvar Relatório PDF"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3`}
              >
                <Printer className="w-4 h-4 text-sky-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Imprimir / PDF</span>}
              </button>

              <button
                onClick={() => { handleExportCSV(); closeMobileMenu(); }}
                title="Exportar Planilha Excel (CSV)"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Exportar Excel (CSV)</span>}
              </button>

              <button
                onClick={() => { setShowModalZerar(true); closeMobileMenu(); }}
                disabled={zerando}
                title="Zerar Dados deste Evento"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition gap-3`}
              >
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{zerando ? 'Zerando...' : 'Zerar Dados'}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* RODAPÉ DA SIDEBAR: STATUS DO FIREBASE */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <button
            onClick={() => { onOpenConfig(); closeMobileMenu(); }}
            title="Configurações e Status da Conexão Firebase"
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-bold border transition ${
              isFirebaseReady()
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
      {/* ÁREA DE CONTEÚDO PRINCIPAL À DIREITA                           */}
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

        {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
          
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
          {/* FAIXA DE STATUS E LINKS RÁPIDOS                                */}
          {/* ============================================================== */}
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
                  onClick={() => setShowModalQrCode(true)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-300 transition"
                  title="Mostrar QR Code Fixo"
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
            <div className={`xl:col-span-5 bg-slate-900/90 border rounded-2xl p-3.5 flex flex-col justify-center gap-2 transition ${
              activeSection === 'links' ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Links do Evento Ativo
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
                  ID: {activeEventId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Celular */}
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

                {/* Telão */}
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

                {/* Admin */}
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

          {/* ============================================================== */}
          {/* CARDS DE KPI / MÉTRICAS (4 COLUNAS)                            */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
            {/* Total de Pessoas */}
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

            {/* Aparelhos / Respostas */}
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

            {/* Cards Ativos */}
            <div 
              onClick={() => setModalPerguntasOpen(true)}
              className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm cursor-pointer transition"
              title="Clique para configurar perguntas e cards"
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

            {/* Status da Pesquisa (Clique rápido para alternar) */}
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

          {/* ============================================================== */}
          {/* GRID PRINCIPAL: DISTRIBUIÇÃO & REGISTROS                       */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* COLUNA ESQUERDA DO CONTEÚDO: DISTRIBUIÇÃO DAS RESPOSTAS */}
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

            {/* COLUNA DIREITA DO CONTEÚDO: TABELA DE REGISTROS INDIVIDUAIS */}
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

      {/* ============================================================== */}
      {/* MODAL MODERNO E ELEGANTE: CONFIRMAÇÃO DE ZERAR TUDO            */}
      {/* ============================================================== */}
      {showModalZerar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Zerar Todas as Presenças?
                </h3>
                <p className="text-xs text-slate-400">
                  Esta ação reinicia a contagem oficial e libera todos os celulares.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>Todos os registros serão <strong>apagados</strong> do banco.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>Os contadores de presença voltarão a <strong>zero</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <span>Todos os celulares que já votaram serão <strong>destravados</strong>.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowModalZerar(false)}
                disabled={zerando}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarZerar}
                disabled={zerando}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{zerando ? 'Zerando...' : 'Sim, Zerar Tudo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback de Sucesso */}
      {feedbackZerar && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="text-xs font-bold">Banco zerado e todos os celulares destravados com sucesso!</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: QR CODE FIXO E PERMANENTE DO EVENTO                     */}
      {/* ============================================================== */}
      {showModalQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">QR Code Fixo do Evento</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Evento: {activeEventId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalQrCode(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xl inline-block mx-auto border-4 border-emerald-400/30">
              <QRCodeSVG
                value={linkMobile}
                size={230}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-amber-300">
                🔒 QR Code 100% Permanente e Imutável!
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Você pode mandar imprimir em folhetos, cartazes e telões com meses de antecedência. O link não muda nunca.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-left">
              <span className="text-[11px] font-mono text-emerald-400 truncate select-all">
                {linkMobile}
              </span>
              <button
                onClick={() => copyToClipboard(linkMobile, 'qrcode_modal')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 transition active:scale-95 flex items-center gap-1"
              >
                {copiedLink === 'qrcode_modal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'qrcode_modal' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModalQrCode(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition active:scale-95"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CRIAR NOVO EVENTO COM QR CODE PRÓPRIO                   */}
      {/* ============================================================== */}
      {showModalNovoEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Criar Novo Evento</h3>
                  <p className="text-xs text-slate-400">Gera um QR Code fixo exclusivo para este evento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalNovoEvento(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarEvento} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">
                  Nome do Evento / Culto
                </label>
                <input
                  type="text"
                  autoFocus
                  value={novoEventoNome}
                  onChange={(e) => setNovoEventoNome(e.target.value)}
                  placeholder="Ex: Culto de Jovens, Retiro Espiritual, Avaliação 2026..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white font-bold placeholder-slate-500 focus:outline-none shadow-inner"
                />
              </div>

              {novoEventoNome && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                  <span className="text-slate-400 block font-mono">
                    ID/Slug do Evento: <strong className="text-amber-300">{novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}</strong>
                  </span>
                  <span className="text-emerald-400 block font-mono text-[10px]">
                    URL Fixa: .../?e={novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalNovoEvento(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoEvento || !novoEventoNome.trim()}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition disabled:opacity-50"
                >
                  {criandoEvento ? 'Criando...' : 'Criar & Ativar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONTROLE DE EVENTOS SIMULTÂNEOS & PAUSA INDEPENDENTE   */}
      {/* ============================================================== */}
      {showModalEventosSimultaneos && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Eventos Simultâneos & Controle de Pausa
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pause ou libere cada evento individualmente. Eventos em lugares diferentes continuam independentes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModalEventosSimultaneos(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {eventosLista.map((ev) => {
                const isSelected = ev.id === activeEventId;
                const isLive = isSelected ? sessaoAtiva : Boolean(ev.sessaoAtiva);
                const evLink = `${originUrl}/?e=${ev.id}`;

                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-slate-850/90 border-sky-500/50 shadow-md' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white truncate">{ev.titulo}</h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              ATIVO NO PAINEL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[11px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            ID: {ev.id}
                          </code>
                          <button
                            onClick={() => copyToClipboard(evLink, `ev_${ev.id}`)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                            title="Copiar link fixo"
                          >
                            {copiedLink === `ev_${ev.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedLink === `ev_${ev.id}` ? 'Copiado!' : 'Copiar Link'}</span>
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
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                            }`}
                          />
                          {isLive ? 'AO VIVO' : 'PAUSADO'}
                        </span>

                        {isLive ? (
                          <button
                            onClick={() => handleToggleSessao(ev.id, false)}
                            disabled={alternandoSessao}
                            className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                            title={`Pausar ${ev.titulo}`}
                          >
                            <Pause className="w-3.5 h-3.5 fill-amber-400" />
                            <span>Pausar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSessao(ev.id, true)}
                            disabled={alternandoSessao}
                            className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                            title={`Liberar ${ev.titulo}`}
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
                              setShowModalEventosSimultaneos(false);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            title="Visualizar este evento no painel admin"
                          >
                            Selecionar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowModalEventosSimultaneos(false);
                  setShowModalNovoEvento(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Outro Evento Simultâneo</span>
              </button>

              <button
                onClick={() => setShowModalEventosSimultaneos(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Perguntas e Subtítulos no Firebase */}
      <QuestionsConfigModal 
        isOpen={modalPerguntasOpen} 
        onClose={() => setModalPerguntasOpen(false)} 
        activeEventId={activeEventId}
        eventTitle={eventoTitulo}
      />

      {/* ============================================================== */}
      {/* MODAL PADRÃO DE AVISOS, ERROS E CONFIRMAÇÕES (NOVO DESIGN)    */}
      {/* ============================================================== */}
      {modalFeedback.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
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
  );
}
