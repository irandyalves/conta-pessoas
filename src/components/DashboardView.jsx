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
  ExternalLink,
  UploadCloud,
  FolderUp,
  Sparkles,
  Download,
  RotateCcw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QuestionsConfigModal from './QuestionsConfigModal';
import FirebaseConfigModal from './FirebaseConfigModal';
import ImportadorIA from './ImportadorIA';
import Acompanhamento from './acompanhamento/Acompanhamento';
import { exportar } from '../utils/exportar';
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
  excluirEvento,
  salvarEventoAtivoGlobal
} from '../firebase';

// Lista as respostas de um registro como [{ pergunta, resposta, tipo }].
// Registros novos têm "respostas" (lista ordenada); os antigos são lidos dos mapas.
function listarRespostas(item) {
  if (Array.isArray(item?.respostas) && item.respostas.length > 0) {
    return item.respostas
      .filter((r) => r && r.telaId !== 'p1')
      .map((r) => ({ pergunta: r.pergunta, resposta: r.resposta, tipo: String(r.pergunta || '').includes(' › ') ? 'gaveta' : 'texto' }));
  }
  const out = [];
  Object.entries(item?.respostasExtras || {}).forEach(([k, v]) => out.push({ pergunta: k, resposta: v, tipo: 'texto' }));
  Object.entries(item?.textoRespostas || {}).forEach(([k, v]) => out.push({ pergunta: k, resposta: v, tipo: 'texto' }));
  Object.entries(item?.gavetaRespostas || {}).forEach(([k, v]) => out.push({ pergunta: k, resposta: v, tipo: 'gaveta' }));
  return out.filter((r) => String(r.resposta ?? '').trim() !== '');
}

// Célula de CSV segura: escapa aspas e neutraliza fórmulas (=, +, -, @) que o Excel executaria
function celulaCsv(valor) {
  let t = Array.isArray(valor) ? valor.join(', ') : String(valor ?? '');
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return `"${t.replace(/"/g, '""')}"`;
}

export default function DashboardView({ onChangeView }) {
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
  // Atualizar a página continua na mesma seção do painel
  const [activeSection, setActiveSection] = useState(() => {
    try { return sessionStorage.getItem('responder_painel_secao') || 'dashboard'; } catch (e) { return 'dashboard'; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('responder_painel_secao', activeSection); } catch (e) {}
  }, [activeSection]);

  // GESTÃO DE MÚLTIPLOS EVENTOS & QR CODES FIXOS
  const [activeEventId, setActiveEventIdState] = useState(() => getActiveEventId());
  const [eventosLista, setEventosLista] = useState([]);
  const [novoEventoNome, setNovoEventoNome] = useState('');
  const [novoEventoConfigIA, setNovoEventoConfigIA] = useState(null);
  const [criandoEvento, setCriandoEvento] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState(null);
  const [excluindoEvento, setExcluindoEvento] = useState(false);

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
    const finalName = novoEventoNome.trim() || novoEventoConfigIA?.capaTitulo1 || novoEventoConfigIA?.importedFormTitle || '';
    if (!finalName) return;
    setCriandoEvento(true);
    try {
      const hadIAConfig = Boolean(novoEventoConfigIA);
      const totalTelasIA = hadIAConfig ? ((novoEventoConfigIA.opcoesChegada?.length ? 1 : 0) + (novoEventoConfigIA.telasExtras?.length || 0)) : 0;
      const created = await criarNovoEvento(null, finalName, novoEventoConfigIA);
      setActiveEventIdState(created.id);
      setEventoTitulo(created.titulo);
      setInputTitulo(created.titulo);
      setNovoEventoNome('');
      setNovoEventoConfigIA(null);
      setActiveSection(hadIAConfig ? 'perguntas' : 'dashboard');
      mostrarAvisoInline(
        'Evento Criado com Sucesso!',
        hadIAConfig
          ? `"${created.titulo}" foi criado e ativado com ${totalTelasIA} telas geradas pela IA!`
          : `"${created.titulo}" foi criado e ativado no painel.`,
        'sucesso'
      );
    } catch (err) {
      mostrarAvisoInline('Erro ao Criar Evento', err?.message || String(err), 'erro');
    } finally {
      setCriandoEvento(false);
    }
  };

  const handleExcluirEvento = async (ev) => {
    if (eventosLista.length <= 1) {
      mostrarAvisoInline('Ação Bloqueada', 'Você precisa manter pelo menos 1 evento ativo no sistema.', 'aviso');
      setConfirmDeleteEventId(null);
      return;
    }
    setExcluindoEvento(true);
    try {
      const novaLista = await excluirEvento(ev.id);
      setConfirmDeleteEventId(null);
      if (ev.id === activeEventId && novaLista.length > 0) {
        const proximo = novaLista[0];
        setActiveEventId(proximo.id);
        setActiveEventIdState(proximo.id);
        setEventoTitulo(proximo.titulo);
        setInputTitulo(proximo.titulo);
        await salvarEventoAtivoGlobal(proximo.id, proximo.titulo);
      }
      mostrarAvisoInline('Evento Excluído', `O evento "${ev.titulo}" foi removido com sucesso.`, 'sucesso');
    } catch (err) {
      mostrarAvisoInline('Erro ao Excluir Evento', err?.message || String(err), 'erro');
    } finally {
      setExcluindoEvento(false);
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
    try {
      await saveEventTitle(inputTitulo.trim(), activeEventId);
      await salvarEventoAtivoGlobal(activeEventId, inputTitulo.trim());
    } catch (e) {
      mostrarAvisoInline('Erro ao Salvar Título', e?.message || String(e), 'erro');
      return;
    }
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

  // Data do "dia do culto" calculada no relógio do ADMIN a partir de criadoEm.
  // Respostas até as 04:00 contam para o dia anterior (evento que passa da meia-noite).
  const diaDoCulto = (iso, fallback) => {
    const t = Date.parse(iso || '');
    if (Number.isNaN(t)) return fallback || '';
    return new Date(t - 4 * 3600 * 1000).toLocaleDateString('pt-BR');
  };
  const hoje = diaDoCulto(new Date().toISOString());

  const presencasFiltradas = presencas.filter((item) => {
    const dia = diaDoCulto(item.criadoEm, item.dataCulto);
    if (filtroData === 'hoje') {
      return dia === hoje;
    }
    if (filtroData === 'personalizado') {
      const [y, m, d] = dataPersonalizada.split('-');
      const dataFormatada = `${d}/${m}/${y}`;
      return dia === dataFormatada;
    }
    return true;
  });

  // Estatísticas
  const totalPessoas = presencasFiltradas.reduce((acc, curr) => acc + (Number(curr.qtdPessoas) || 1), 0);
  const totalCheckins = presencasFiltradas.length;
  const mediaPorGrupo = totalCheckins > 0 ? (totalPessoas / totalCheckins).toFixed(1) : '0';

  const listaOpcoesConfig = questionsConfig?.opcoesChegada || [];
  const periodoTexto = filtroData === 'hoje' ? hoje : filtroData === 'personalizado' ? dataPersonalizada.split('-').reverse().join('/') : 'todas as datas';

  const [exportando, setExportando] = useState('');
  const handleExportar = async (formato) => {
    if (presencasFiltradas.length === 0) {
      mostrarAvisoInline('Nada para exportar', 'Não há registros no período selecionado.', 'aviso');
      return;
    }
    setExportando(formato);
    try {
      const nome = await exportar(formato, { presencas: presencasFiltradas, config: questionsConfig, titulo: eventoTitulo, periodo: periodoTexto });
      mostrarAvisoInline('Arquivo baixado', nome, 'sucesso');
    } catch (e) {
      mostrarAvisoInline('O arquivo não foi gerado', e?.message || String(e), 'erro');
    } finally {
      setExportando('');
    }
  };

  // Exportar para CSV / Excel com UTF-8
  const handleExportCSV = () => {
    if (presencasFiltradas.length === 0) {
      mostrarAvisoInline('Exportar CSV', 'Não há registros no período selecionado para exportar.', 'aviso');
      return;
    }

    // Uma coluna por pergunta, na ordem em que aparecem nos registros
    const perguntas = [];
    presencasFiltradas.forEach((p) => {
      listarRespostas(p).forEach((r) => {
        if (!perguntas.includes(r.pergunta)) perguntas.push(r.pergunta);
      });
    });

    const tituloP1 = questionsConfig?.pergunta1Pergunta || questionsConfig?.pergunta1Titulo || 'Como Chegou';
    const headers = [
      'Evento',
      'Data',
      'Horário',
      tituloP1,
      'Quantidade de Pessoas no Grupo',
      ...perguntas,
      'ID do Registro'
    ].map(celulaCsv);
    const rows = presencasFiltradas.map((p) => {
      const mapa = {};
      listarRespostas(p).forEach((r) => { mapa[r.pergunta] = r.resposta; });
      return [
        celulaCsv(p.evento || eventoTitulo),
        celulaCsv(p.dataCulto || hoje),
        celulaCsv(p.hora || ''),
        celulaCsv(p.comoChegou || ''),
        Number(p.qtdPessoas) || 1,
        ...perguntas.map((q) => celulaCsv(mapa[q] ?? '')),
        celulaCsv(p.id || '')
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${eventoTitulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    <div className="campos-luz min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
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
        className={`print:hidden fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-900/95 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-300 shadow-[6px_0_24px_rgba(0,0,0,0.5)] shrink-0 ${
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
                {!sidebarCollapsed && <span className="truncate">Painel principal</span>}
              </button>

              <button
                onClick={() => selectMenu('eventos')}
                title="Eventos Simultâneos e Controle de Pausa"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold transition ${
                  activeSection === 'eventos' || activeSection === 'novo_evento'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">Eventos</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {eventosLista.length}
                  </span>
                )}
              </button>
            </div>

            {/* GRUPO 2: PESQUISA & TELÃO */}
            <div className="space-y-1 pt-3 border-t border-slate-700/80">

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
                {!sidebarCollapsed && <span className="truncate">Perguntas</span>}
              </button>

              <button
                onClick={() => selectMenu('qrcode')}
                title="QR Code Fixo & Links de Acesso"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold transition gap-3 ${
                  activeSection === 'qrcode' || activeSection === 'links'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">QR Code e Links</span>}
              </button>

              <button
                onClick={() => { onChangeView('telao'); closeMobileMenu(); }}
                title="Abrir Modo Telão"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent`}
              >
                <Tv className="w-4 h-4 text-purple-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Abrir Telão</span>}
              </button>
            </div>

            {/* GRUPO 3: RELATÓRIOS & AÇÕES */}
            <div className="space-y-1 pt-3 border-t border-slate-700/80">

              {[
                { id: 'pdf', nome: 'PDF', Icone: Download, cor: 'text-sky-400' },
                { id: 'xlsx', nome: 'Excel', Icone: Download, cor: 'text-emerald-400' },
                { id: 'xls', nome: 'Excel antigo', Icone: Download, cor: 'text-emerald-400' }
              ].map(({ id, nome, Icone, cor }) => (
                <button
                  key={id}
                  onClick={() => { handleExportar(id); closeMobileMenu(); }}
                  disabled={Boolean(exportando)}
                  title={`Baixar ${nome}`}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent disabled:opacity-60`}
                >
                  <Icone className={`w-4 h-4 ${cor} shrink-0`} />
                  {!sidebarCollapsed && <span className="truncate">{exportando === id ? 'Gerando arquivo...' : nome}</span>}
                </button>
              ))}

              <button
                onClick={() => { handleExportCSV(); closeMobileMenu(); }}
                title="Baixar CSV"
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition gap-3 border border-transparent`}
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">CSV</span>}
              </button>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-700/80">

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
                <span className="relative w-4 h-4 shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <RotateCcw className="absolute -right-1.5 -bottom-1 w-2.5 h-2.5 text-rose-300 bg-slate-900 rounded-full" strokeWidth={3} />
                </span>
                {!sidebarCollapsed && <span className="truncate">{zerando ? 'Zerando...' : 'Zerar dados'}</span>}
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
        <header className="print:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 md:px-6 py-2 md:py-3">
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
            
            {/* Esquerda: Botão Menu Mobile + Seletor do Evento Ativo */}
            <div className="flex items-center lg:gap-2.5 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden self-stretch px-2 rounded-l-xl rounded-r-none bg-slate-900 border border-r-0 border-slate-700/80 text-slate-300 hover:text-white"
                title="Abrir Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {editandoTitulo ? (
                <div className="flex items-center gap-2 flex-1 ml-2 lg:ml-0">
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
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <select
                    value={activeEventId}
                    onChange={handleSelectEvent}
                    className="bg-slate-900 border border-slate-700/80 hover:border-amber-400 focus:border-amber-400 rounded-r-xl rounded-l-none lg:rounded-l-xl px-3 py-1.5 text-sm sm:text-base font-black text-amber-300 cursor-pointer shadow-sm transition min-w-0 w-full sm:w-auto sm:max-w-md truncate"
                  >
                    {eventosLista.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-slate-900 text-white font-bold">
                        {ev.titulo}
                      </option>
                    ))}
                    <option value="__novo__" className="bg-slate-900 text-emerald-400 font-bold">
                      Criar Novo Evento...
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
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
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
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL DO DASHBOARD (RENDERIZA A ABA SELECIONADA NA SLIDEBAR) */}
        <main className={`flex-1 w-full space-y-4 ${
          activeSection === 'perguntas'
            ? 'p-0 md:py-3 md:pr-4 md:pl-0 max-w-none'
            : 'p-3 md:p-5 max-w-none'
        }`}>
          
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
            <div className="space-y-3 md:space-y-4 -mt-2 md:mt-0">
              {/* TOPO DO DASHBOARD UNIFICADO & ESMAGADO EM UMA LINHA SÓ DE PONTA A PONTA */}
              <div className="print:hidden grid grid-cols-3 md:grid-cols-6 xl:grid-cols-12 gap-2 md:gap-2.5 items-stretch">
                {/* Celular: sessão + números + atalhos num bloco só */}
                <div className={`md:hidden col-span-3 flex items-center gap-2 p-2 rounded-2xl border ${sessaoAtiva ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-amber-500/40 bg-amber-950/30'}`}>
                  <button
                    type="button"
                    onClick={() => handleToggleSessao(activeEventId)}
                    disabled={alternandoSessao}
                    className={`h-9 px-3.5 rounded-xl text-xs font-black shrink-0 transition active:scale-95 disabled:opacity-60 ${sessaoAtiva ? 'bg-slate-900 border border-emerald-500/50 text-emerald-300' : 'bg-amber-400 text-slate-950'}`}
                  >
                    {sessaoAtiva ? 'Pausar' : 'Liberar'}
                  </button>
                  <div className="flex-1 grid grid-cols-3 min-w-0 text-center">
                    {[['Pessoas', totalPessoas, 'text-white'], ['Respostas', totalCheckins, 'text-white'], ['Cards', listaOpcoesConfig.filter(c => c.ativo !== false).length, 'text-emerald-300']].map(([nome, valor, cor]) => (
                      <div key={nome} className="min-w-0">
                        <div className={`text-base font-black leading-none ${cor}`}>{valor}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{nome}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveSection('qrcode')} className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-emerald-300 shrink-0" title="QR Code e links"><QrCode className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onChangeView('telao')} className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sky-300 shrink-0" title="Abrir Telão"><Tv className="w-3.5 h-3.5" /></button>
                </div>

                {/* 1. Status do Evento (Ao Vivo / Em Espera) */}
                <div className={`hidden md:flex md:col-span-3 xl:col-span-3 p-3 rounded-2xl border transition-all shadow-md items-center justify-between gap-3 ${
                  sessaoAtiva 
                    ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/60 border-emerald-500/40' 
                    : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                      sessaoAtiva 
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' 
                        : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                    }`}>
                      {sessaoAtiva ? <Radio className="w-4 h-4 animate-pulse" /> : <Pause className="w-4 h-4 fill-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        sessaoAtiva 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sessaoAtiva ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                        {sessaoAtiva ? 'AO VIVO' : 'EM ESPERA'}
                      </span>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5" title={eventoTitulo}>
                        {eventoTitulo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setActiveSection('qrcode')}
                      className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-300 transition"
                      title="Abrir QR Code & Links"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onChangeView('telao')}
                      className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-300 transition"
                      title="Abrir Telão"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* 2. Total Pessoas */}
                <div className="hidden md:flex md:col-span-1 xl:col-span-1 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="hidden md:flex w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Pessoas</span>
                      <span className="text-xl font-black text-white leading-tight">{totalPessoas}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Respostas */}
                <div className="hidden md:flex md:col-span-1 xl:col-span-1 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="hidden md:flex w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Respostas</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white leading-tight">{totalCheckins}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Cards Ativos */}
                <div 
                  onClick={() => setActiveSection('perguntas')}
                  className="hidden md:flex md:col-span-1 xl:col-span-1 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-2xl items-center justify-between gap-2 shadow-sm cursor-pointer transition"
                  title="Configurar Perguntas / Telas"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="hidden md:flex w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 items-center justify-center shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">Cards</span>
                      <span className="text-xl font-black text-emerald-300 leading-tight">
                        {listaOpcoesConfig.filter(c => c.ativo !== false).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Botão de Status / Liberar / Pausar */}
                <button
                  type="button"
                  onClick={() => handleToggleSessao(activeEventId)}
                  disabled={alternandoSessao}
                  title={sessaoAtiva ? 'Clique para pausar a pesquisa' : 'Clique para liberar a pesquisa'}
                  className={`hidden md:flex col-span-1 md:col-span-1 xl:col-span-2 p-2.5 rounded-2xl border items-center justify-between gap-2 transition active:scale-95 text-left shadow-sm cursor-pointer ${
                    sessaoAtiva 
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400/80' 
                      : 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      sessaoAtiva ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {sessaoAtiva ? <Pause className="w-4 h-4 fill-emerald-400" /> : <Play className="w-4 h-4 fill-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block truncate ${
                        sessaoAtiva ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        Sessão
                      </span>
                      <span className={`text-xs font-black leading-tight ${
                        sessaoAtiva ? 'text-emerald-300' : 'text-amber-300'
                      }`}>
                        {sessaoAtiva ? 'PAUSAR' : 'LIBERAR'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* 6. Links Rápidos (Celular, Telão, Admin) */}
                <div className="col-span-3 md:col-span-2 xl:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 md:p-2 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => copyToClipboard(linkMobile, 'mobile')}
                    className="flex-1 bg-slate-950/90 hover:bg-slate-950 border border-emerald-900/50 hover:border-emerald-500/50 rounded-xl px-2 py-1.5 flex items-center justify-center gap-1 transition group text-center"
                    title="Copiar link para celulares"
                  >
                    <span className="text-[11px] font-bold text-emerald-300 truncate">📱 Celular</span>
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold shrink-0">
                      {copiedLink === 'mobile' ? '✓' : 'Copiar'}
                    </span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(linkTelao, 'telao')}
                    className="flex-1 bg-slate-950/90 hover:bg-slate-950 border border-sky-900/50 hover:border-sky-500/50 rounded-xl px-2 py-1.5 flex items-center justify-center gap-1 transition group text-center"
                    title="Copiar link do Telão"
                  >
                    <span className="text-[11px] font-bold text-sky-300 truncate">📺 Telão</span>
                    <span className="px-1.5 py-0.5 bg-sky-600 text-white rounded text-[9px] font-bold shrink-0">
                      {copiedLink === 'telao' ? '✓' : 'Copiar'}
                    </span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(linkAdmin, 'admin')}
                    className="flex-1 bg-slate-950/90 hover:bg-slate-950 border border-indigo-900/50 hover:border-indigo-500/50 rounded-xl px-2 py-1.5 flex items-center justify-center gap-1 transition group text-center"
                    title="Copiar link deste Painel Admin"
                  >
                    <span className="text-[11px] font-bold text-indigo-300 truncate">📊 Admin</span>
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-bold shrink-0">
                      {copiedLink === 'admin' ? '✓' : 'Copiar'}
                    </span>
                  </button>
                </div>
              </div>

              {/* ACOMPANHAMENTO AO VIVO (gráficos 2D/3D e exportações) */}
              <Acompanhamento
                key={activeEventId}
                presencas={presencasFiltradas}
                config={questionsConfig}
                titulo={eventoTitulo}
                periodo={periodoTexto}
                sessaoAtiva={sessaoAtiva}
                onAviso={mostrarAvisoInline}
              />

              <div className="space-y-4">
                {/* TABELA DE REGISTROS INDIVIDUAIS */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300 print:bg-white print:text-black">
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

                  <ul className="md:hidden print:hidden divide-y divide-slate-800/70">
                    {presencasFiltradas.length === 0 ? (
                      <li className="py-8 px-4 text-center text-xs text-slate-400">Nenhuma resposta neste período.</li>
                    ) : presencasFiltradas.map((item, index) => {
                      const respostasItem = listarRespostas(item);
                      return (
                        <li key={item.id || index} className="px-4 py-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-slate-500">{index + 1}</span>
                            <span className="font-mono text-slate-200">{item.hora || '--:--'}</span>
                            <span className="text-slate-500">{item.dataCulto || hoje}</span>
                            <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              {item.qtdPessoas === 1 ? 'Só eu' : `${item.qtdPessoas} pessoas`}
                            </span>
                          </div>
                          {item.comoChegou && <p className="text-sm font-semibold text-white">{item.comoChegou}</p>}
                          {respostasItem.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {respostasItem.map((r, ri) => (
                                <span key={ri} className={`text-[11px] px-2 py-0.5 rounded-lg border ${r.tipo === 'gaveta' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                                  <strong className="font-bold">{r.pergunta}:</strong> {String(r.resposta)}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="hidden md:block print:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold border-b border-slate-800/80 print:border-slate-300">
                        <tr>
                          <th className="py-2.5 px-3.5">#</th>
                          <th className="py-2.5 px-3.5">Horário</th>
                          <th className="py-2.5 px-3.5">Data</th>
                          <th className="py-2.5 px-3.5">Como Chegou</th>
                          <th className="py-2.5 px-3.5">Respostas</th>
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
                            const respostasItem = listarRespostas(item);

                            return (
                              <tr key={item.id || index} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                                <td className="py-2.5 px-3.5 font-mono text-slate-400">{index + 1}</td>
                                <td className="py-2.5 px-3.5 font-mono">{item.hora || '--:--'}</td>
                                <td className="py-2.5 px-3.5">{item.dataCulto || hoje}</td>
                                <td className="py-2.5 px-3.5 font-semibold text-white print:text-black">
                                  {item.comoChegou}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  {respostasItem.length > 0 ? (
                                    <div className="space-y-1">
                                      {respostasItem.map((r, ri) => (
                                        <span key={ri} className={`inline-block text-[11px] px-2 py-0.5 rounded-lg mr-1 mb-1 font-sans border ${r.tipo === 'gaveta' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'} print:bg-transparent print:text-black print:border-slate-300`}>
                                          <strong className="font-bold">{r.pergunta}:</strong> {String(r.resposta)}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
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
                  <span>Criar Novo Evento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {eventosLista.map((ev) => {
                  const isSelected = ev.id === activeEventId;
                  const isLive = isSelected ? sessaoAtiva : Boolean(ev.sessaoAtiva);
                  const evLink = `${originUrl}/?e=${ev.id}`;
                  const isConfirmingDelete = confirmDeleteEventId === ev.id;

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-slate-800/80 border-sky-500/60 shadow-lg opacity-100 ring-1 ring-sky-500/20' 
                          : 'bg-slate-950/40 border-slate-800/60 opacity-40 hover:opacity-65 grayscale-[35%]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-black truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                              {ev.titulo}
                            </h4>
                            {isSelected ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                SELECIONADO NO PAINEL
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
                                INATIVO NO PAINEL
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <code className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              ID: {ev.id}
                            </code>
                            <button
                              onClick={() => copyToClipboard(evLink, `ev_${ev.id}`)}
                              className={`text-xs flex items-center gap-1 font-semibold transition ${
                                isSelected ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {copiedLink === `ev_${ev.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedLink === `ev_${ev.id}` ? 'Link Copiado!' : 'Copiar Link Celular'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                              !isSelected
                                ? 'bg-slate-900 text-slate-500 border-slate-800'
                                : isLive
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              !isSelected ? 'bg-slate-600' : isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                            }`} />
                            {isLive ? 'AO VIVO' : 'PAUSADO'}
                          </span>

                          {isLive ? (
                            <button
                              onClick={() => handleToggleSessao(ev.id, false)}
                              disabled={alternandoSessao || !isSelected}
                              title={!isSelected ? 'Ative este evento no painel para controlar' : 'Pausar sessão'}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-black border flex items-center gap-1.5 transition ${
                                isSelected
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 active:scale-95'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Pause className={`w-3.5 h-3.5 ${isSelected ? 'fill-amber-400' : 'fill-slate-600'}`} />
                              <span>Pausar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleSessao(ev.id, true)}
                              disabled={alternandoSessao || !isSelected}
                              title={!isSelected ? 'Ative este evento no painel para liberar' : 'Liberar sessão'}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-black border flex items-center gap-1.5 transition ${
                                isSelected
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300 active:scale-95'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Play className={`w-3.5 h-3.5 ${isSelected ? 'fill-emerald-400' : 'fill-slate-600'}`} />
                              <span>Liberar</span>
                            </button>
                          )}

                          {!isSelected && (
                            <button
                              onClick={async () => {
                                setActiveEventId(ev.id);
                                setActiveEventIdState(ev.id);
                                if (ev.titulo) {
                                  setEventoTitulo(ev.titulo);
                                  setInputTitulo(ev.titulo);
                                }
                                await salvarEventoAtivoGlobal(ev.id, ev.titulo || '');
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/40 border border-slate-700 text-slate-300 transition"
                            >
                              Ativar no Painel
                            </button>
                          )}

                          {/* Botão Excluir Evento com Confirmação Inline */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/50 px-2 py-1 rounded-lg">
                              <span className="text-[10px] font-bold text-rose-200">Excluir?</span>
                              <button
                                onClick={() => handleExcluirEvento(ev)}
                                disabled={excluindoEvento}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black transition"
                              >
                                {excluindoEvento ? '...' : 'Sim'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteEventId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteEventId(ev.id)}
                              disabled={eventosLista.length <= 1}
                              title={eventosLista.length <= 1 ? 'Não é possível excluir o único evento' : `Excluir evento "${ev.titulo}"`}
                              className={`p-1.5 rounded-lg border transition ${
                                isSelected
                                  ? 'bg-rose-500/10 hover:bg-rose-500/25 border-rose-500/30 text-rose-400 hover:text-rose-300'
                                  : 'bg-slate-900 hover:bg-rose-500/20 border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-300'
                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          {/* ABA 3: CRIAR NOVO EVENTO COM IMPORTAÇÃO IA AUTOMÁTICA          */}
          {/* ============================================================== */}
          {activeSection === 'novo_evento' && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-xl space-y-5">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">Criar Novo Evento (Manual ou com IA)</h2>
                    <p className="text-xs text-slate-400">Gera um link exclusivo, QR Code fixo e pode montar todas as telas automaticamente a partir de um arquivo (.pdf, .pptx, .docx, .doc, .txt)</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCriarEvento} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-amber-300 block mb-1.5">
                    1. Nome do Evento / Encontro / Avaliação
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={novoEventoNome}
                    onChange={(e) => setNovoEventoNome(e.target.value)}
                    placeholder="Digite o nome ou envie o arquivo abaixo para a IA preencher automaticamente..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {novoEventoNome && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 block font-mono">
                      ID Fixo do Evento: <strong className="text-amber-300">{novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}</strong>
                    </span>
                    <span className="text-emerald-400 block font-mono">
                      Link Permanente: {originUrl}/?e={novoEventoNome.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                    </span>
                  </div>
                )}

                {/* PERGUNTAS: em branco ou criadas pela IA a partir de um arquivo */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    2. Perguntas (opcional) — a IA cria as telas a partir do seu arquivo
                  </label>
                  {novoEventoConfigIA ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        {(novoEventoConfigIA.opcoesChegada?.length ? 1 : 0) + (novoEventoConfigIA.telasExtras?.length || 0)} telas prontas para este evento
                      </span>
                      <button type="button" onClick={() => setNovoEventoConfigIA(null)} className="text-rose-300 hover:text-rose-200 underline">
                        Remover
                      </button>
                    </div>
                  ) : (
                    <ImportadorIA
                      textoAplicar="Usar estas telas no novo evento"
                      onAplicar={(cfg) => {
                        setNovoEventoConfigIA(cfg);
                        if (!novoEventoNome.trim() && cfg.capaTitulo1) setNovoEventoNome(cfg.capaTitulo1);
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('eventos')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Voltar aos Eventos
                  </button>
                  <button
                    type="submit"
                    disabled={criandoEvento || (!novoEventoNome.trim() && !novoEventoConfigIA?.importedFormTitle)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition disabled:opacity-50"
                  >
                    {criandoEvento
                      ? 'Criando Evento...'
                      : novoEventoConfigIA
                        ? `Criar Evento & Inserir ${1 + (novoEventoConfigIA.telasExtras?.length || 0)} Telas IA`
                        : 'Criar & Ativar Evento'}
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
          {/* ABA UNIFICADA: QR CODE FIXO & LINKS DE ACESSO (2 COLUNAS)     */}
          {/* ============================================================== */}
          {(activeSection === 'qrcode' || activeSection === 'links') && (
            <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 w-full">
              {/* CABEÇALHO DA ABA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-white truncate">
                      QR Code Fixo & Links de Acesso — {eventoTitulo}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      ID do Evento: {activeEventId} • Acesso permanente e instantâneo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeView('telao')}
                    className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Abrir Telão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Folha</span>
                  </button>
                </div>
              </div>

              {/* 2 COLUNAS: ESQUERDA = QR CODE FIXO | DIREITA = LINKS DE ACESSO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUNA 1: QR CODE FIXO (5 colunas) */}
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      QR Code Oficial do Evento
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-3.5 rounded-2xl shadow-xl border-4 border-emerald-400/30 shrink-0 mx-auto sm:mx-0">
                      <QRCodeSVG
                        value={linkMobile}
                        size={170}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 flex-1">
                      <p className="font-bold text-amber-300 text-xs">
                        🔒 Imutável & Permanente
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Este código aponta diretamente para o formulário de <strong>{eventoTitulo}</strong>. Nunca expira e pode ser impresso em cartazes ou folhas.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-emerald-400 truncate select-all min-w-0 flex-1">
                      {linkMobile}
                    </span>
                    <button
                      onClick={() => copyToClipboard(linkMobile, 'qrcode_tab')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shrink-0 transition flex items-center gap-1"
                    >
                      {copiedLink === 'qrcode_tab' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'qrcode_tab' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* COLUNA 2: LINKS DE ACESSO (7 colunas) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Links Diretos para Compartilhar & Projetar
                    </h3>
                  </div>

                  {/* Link Celular */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                        📱 Link Mobile (Visitantes & Membros)
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 truncate block mt-0.5 select-all">
                        {linkMobile}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(linkMobile, 'tab_mobile')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {copiedLink === 'tab_mobile' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink === 'tab_mobile' ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>
                      <a
                        href={linkMobile}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                        title="Abrir em nova guia"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Link Telão */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-sky-300 uppercase tracking-wider block">
                        📺 Link do Telão (Projeção com QR Code Ao Vivo)
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 truncate block mt-0.5 select-all">
                        {linkTelao}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(linkTelao, 'tab_telao')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {copiedLink === 'tab_telao' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink === 'tab_telao' ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>
                      <a
                        href={linkTelao}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                        title="Abrir em nova guia"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Link Admin */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block">
                        📊 Link deste Painel Admin
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 truncate block mt-0.5 select-all">
                        {linkAdmin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(linkAdmin, 'tab_admin')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {copiedLink === 'tab_admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink === 'tab_admin' ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 7: ZERAR DADOS DO EVENTO (ABA INLINE)                      */}
          {/* ============================================================== */}
          {activeSection === 'zerar' && (
            <div className="print:hidden bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-xl space-y-5">
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
