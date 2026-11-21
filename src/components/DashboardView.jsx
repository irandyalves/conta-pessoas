import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  HeartHandshake, 
  Tag, 
  Church, 
  Calendar, 
  Download, 
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
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  Play,
  Pause,
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';
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
  escutarConfigPerguntas
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  const originUrl = window.location.origin;
  const linkMobile = `${originUrl}/`;
  const linkTelao = `${originUrl}/?view=telao`;
  const linkAdmin = `${originUrl}/?view=admin`;

  useEffect(() => {
    const unsubPresencas = escutarPresencas((dados) => {
      setPresencas(dados || []);
    });
    const unsubTitulo = escutarTituloEvento((titulo) => {
      if (titulo) {
        setEventoTitulo(titulo);
        setInputTitulo(titulo);
      }
    });
    const unsubSessao = escutarStatusSessao((ativa) => {
      setSessaoAtiva(ativa);
    });
    const unsubConfig = escutarConfigPerguntas((cfg) => {
      setQuestionsConfig(cfg);
    });
    return () => {
      unsubPresencas && unsubPresencas();
      unsubTitulo && unsubTitulo();
      unsubSessao && unsubSessao();
      unsubConfig && unsubConfig();
    };
  }, []);

  const handleToggleSessao = async () => {
    setAlternandoSessao(true);
    try {
      await saveSessionStatus(!sessaoAtiva);
    } catch (e) {
      alert('Erro ao alterar status da sessão: ' + (e?.message || e));
    } finally {
      setAlternandoSessao(false);
    }
  };

  const handleSalvarTitulo = async () => {
    if (!inputTitulo.trim()) return;
    await saveEventTitle(inputTitulo.trim());
    setEditandoTitulo(false);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const handleConfirmarZerar = async () => {
    setZerando(true);
    try {
      await zerarTudo();
      setShowModalZerar(false);
      setFeedbackZerar(true);
      setTimeout(() => setFeedbackZerar(false), 4500);
    } catch (e) {
      alert("Erro ao zerar: " + (e?.message || e));
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
      alert('Não há registros no período selecionado para exportar.');
      return;
    }

    const headers = ['Evento', 'Data do Culto', 'Horário', 'Como Chegou', 'Quantidade de Pessoas no Grupo', 'ID do Registro'];
    const rows = presencasFiltradas.map(p => [
      `"${p.evento || eventoTitulo}"`,
      `"${p.dataCulto || hoje}"`,
      `"${p.hora || ''}"`,
      `"${(p.comoChegou || '').replace(/"/g, '""')}"`,
      p.qtdPessoas || 1,
      `"${p.id || ''}"`
    ]);

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
    if (confirm('Atenção: Deseja apagar os dados locais de teste?')) {
      limparDadosLocais();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6 max-w-7xl mx-auto space-y-3">
      
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
      {/* CABEÇALHO EM TELA (NÃO IMPRIME NO PDF)                         */}
      {/* ============================================================== */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Church className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold tracking-wide uppercase">
                Área Administrativa
              </div>
              
              {/* CONFIGURAÇÃO DO TÍTULO DO EVENTO (EX: CANTATA DE NATAL 2026) */}
              {editandoTitulo ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="text"
                    value={inputTitulo}
                    onChange={(e) => setInputTitulo(e.target.value)}
                    placeholder="Nome do Evento"
                    className="bg-slate-900 border border-amber-500 rounded-lg px-2.5 py-0.5 text-sm font-bold text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSalvarTitulo}
                    className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-md flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" /> Salvar
                  </button>
                  <button
                    onClick={() => {
                      setInputTitulo(eventoTitulo);
                      setEditandoTitulo(false);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.2">
                  <h1 className="text-xl font-black text-white">{eventoTitulo}</h1>
                  <button
                    onClick={() => setEditandoTitulo(true)}
                    title="Editar nome do evento que aparece no celular"
                    className="p-1 text-slate-400 hover:text-amber-400 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-sky-300 flex items-center gap-1.5 transition active:scale-95 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => onChangeView('telao')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Telão</span>
          </button>

          <button
            onClick={() => setModalPerguntasOpen(true)}
            title="Configurar perguntas, opções e subtítulos salvos no Firebase"
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Configurar Perguntas</span>
          </button>

          {/* BOTÃO CONFIG FIREBASE NO CANTO DIREITO */}
          <button
            onClick={onOpenConfig}
            title="Configurações e status da conexão Firebase"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition ml-auto sm:ml-1 ${
              isFirebaseReady()
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isFirebaseReady() ? 'Firebase Ativo' : 'Conectar Firebase'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BANNER DE CONTROLE: PESQUISA EM ESPERA / AO VIVO COM ZERAR TUDO */}
      {/* ============================================================== */}
      <div className={`print:hidden p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3.5 ${
        sessaoAtiva 
          ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500/50 shadow-emerald-950/40' 
          : 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500/50 shadow-amber-950/40'
      }`}>
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
            sessaoAtiva 
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' 
              : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
          }`}>
            {sessaoAtiva ? <Play className="w-5 h-5 fill-emerald-400" /> : <Pause className="w-5 h-5 fill-amber-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                sessaoAtiva 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${sessaoAtiva ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {sessaoAtiva ? 'PESQUISA AO VIVO • CELULARES LIBERADOS' : 'PESQUISA EM ESPERA • AGUARDANDO SEU START'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {sessaoAtiva 
                ? 'Os celulares já podem responder e avançar pelas telas. O QR Code está totalmente ativo.' 
                : 'O QR Code é fixo, mas os celulares ficam na tela de espera até você clicar em Dar Start.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
          {/* BOTÃO DAR START (QUANDO EM ESPERA) */}
          {!sessaoAtiva && (
            <button
              onClick={handleToggleSessao}
              disabled={alternandoSessao}
              className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 shadow-xl active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{alternandoSessao ? 'Iniciando...' : 'DAR START / LIBERAR PERGUNTAS'}</span>
            </button>
          )}

          {/* BOTÃO ZERAR TUDO NO LUGAR DO BOTÃO PAUSE */}
          <button
            onClick={() => setShowModalZerar(true)}
            disabled={zerando}
            title="Zera todas as presenças do banco e destrava todos os celulares"
            className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-red-600/30 border border-red-500/50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-100" />
            <span>{zerando ? 'Zerando...' : 'ZERAR TUDO'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BARRA UNIFICADA COMPACTA: NOME DO EVENTO + LINKS RÁPIDOS       */}
      {/* ============================================================== */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* LADO ESQUERDO: NOME DO EVENTO (COMPACTO) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-2 flex flex-col justify-between gap-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Nome do Evento (Celular / Telão)
            </span>
            {salvoFeedback && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Salvo!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputTitulo}
              onChange={(e) => setInputTitulo(e.target.value)}
              placeholder="Ex: CANTATA DE NATAL 2026"
              className="flex-1 min-w-0 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-bold text-white tracking-wide"
            />
            <button
              onClick={handleSalvarTitulo}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-lg transition flex items-center gap-1 shrink-0 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </button>
          </div>
        </div>

        {/* LADO DIREITO: LINKS RÁPIDOS COMPACTOS */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex flex-col justify-between gap-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Links Rápidos (1 Toque para Copiar)
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Toque para copiar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Celular */}
            <div className="bg-slate-950 border border-emerald-900/50 rounded-lg px-2.5 py-1 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-400 block truncate">📱 Celular</span>
                <span className="text-[9px] font-mono text-slate-400 block truncate">...web.app</span>
              </div>
              <button
                onClick={() => copyToClipboard(linkMobile, 'mobile')}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded text-[10px] font-bold shrink-0 transition"
              >
                {copiedLink === 'mobile' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            {/* Telão */}
            <div className="bg-slate-950 border border-sky-900/50 rounded-lg px-2.5 py-1 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-sky-400 block truncate">📺 Telão</span>
                <span className="text-[9px] font-mono text-slate-400 block truncate">?view=telao</span>
              </div>
              <button
                onClick={() => copyToClipboard(linkTelao, 'telao')}
                className="px-2 py-0.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded text-[10px] font-bold shrink-0 transition"
              >
                {copiedLink === 'telao' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            {/* Admin */}
            <div className="bg-slate-950 border border-indigo-900/50 rounded-lg px-2.5 py-1 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-indigo-400 block truncate">📊 Admin</span>
                <span className="text-[9px] font-mono text-slate-400 block truncate">?view=admin</span>
              </div>
              <button
                onClick={() => copyToClipboard(linkAdmin, 'admin')}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded text-[10px] font-bold shrink-0 transition"
              >
                {copiedLink === 'admin' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTROS DE DATA (COMPACTO)                                     */}
      {/* ============================================================== */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Filtrar período:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFiltroData('hoje')}
              className={`px-2.5 py-0.5 rounded-md transition ${
                filtroData === 'hoje' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hoje ({hoje})
            </button>
            <button
              onClick={() => setFiltroData('todos')}
              className={`px-2.5 py-0.5 rounded-md transition ${
                filtroData === 'todos' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos os Registros
            </button>
            <button
              onClick={() => setFiltroData('personalizado')}
              className={`px-2.5 py-0.5 rounded-md transition ${
                filtroData === 'personalizado' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Outra Data
            </button>
          </div>

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

      {/* ============================================================== */}
      {/* CARDS DE RESUMO (ALTURA REDUZIDA EM 40%)                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 print:hidden">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Pessoas</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalPessoas}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Soma de todos os acompanhantes</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aparelhos / Respostas</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalCheckins}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Média de {mediaPorGrupo} pessoas/grupo</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Cards Ativos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {listaOpcoesConfig.filter(c => c.ativo !== false).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Limite: {questionsConfig?.cardsPorTela || 4} cards/tela
          </p>
        </div>

        <div className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
          sessaoAtiva 
            ? 'bg-emerald-950/40 border-emerald-500/40' 
            : 'bg-amber-950/40 border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              sessaoAtiva ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              Status da Pesquisa
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              sessaoAtiva ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {sessaoAtiva ? <Play className="w-3.5 h-3.5 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 fill-amber-400" />}
            </div>
          </div>
          <div className={`text-xl font-black tracking-tight ${sessaoAtiva ? 'text-emerald-300' : 'text-amber-300'}`}>
            {sessaoAtiva ? 'AO VIVO' : 'EM ESPERA'}
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {sessaoAtiva ? 'Celulares respondendo' : 'Aguardando Start do Admin'}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BARRAS DE PROPORÇÃO (DINÂMICAS COM TODOS OS CARDS)             */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Distribuição das Respostas: Como Chegaram</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {categoriasUnicas.length} {categoriasUnicas.length === 1 ? 'opção cadastrada/votada' : 'opções cadastradas/votadas'}
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {categoriasUnicas.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Nenhum card cadastrado ou votado ainda.</p>
          ) : (
            categoriasUnicas.map((catNome, idx) => {
              const qtd = contagemCategorias[catNome] || 0;
              const pct = totalPessoas > 0 ? Math.round((qtd / totalPessoas) * 100) : 0;
              const corEstilo = paletteColors[idx % paletteColors.length];
              const corBg = corEstilo.split(' ')[0];
              const corTexto = corEstilo.split(' ')[1];

              return (
                <div key={catNome} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={`flex items-center gap-1.5 ${corTexto}`}>
                      <Tag className="w-3.5 h-3.5" /> {catNome}
                    </span>
                    <span className="text-slate-300 font-mono">
                      {qtd} {qtd === 1 ? 'pessoa' : 'pessoas'} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
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

      {/* ============================================================== */}
      {/* TABELA DE REGISTROS                                            */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300 print:bg-white print:text-black">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between print:border-slate-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400 print:text-black" />
            <h3 className="font-bold text-white print:text-black text-sm">Registros Individuais</h3>
            <span className="text-xs bg-slate-800 print:bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-300 print:text-black font-semibold">
              {presencasFiltradas.length} respostas
            </span>
          </div>

          {!isFirebaseReady() && (
            <button
              onClick={handleLimpar}
              title="Zerar dados locais"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition print:hidden"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold border-b border-slate-800/80 print:border-slate-300">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Horário</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Como Chegou</th>
                <th className="py-2.5 px-4 text-center">Pessoas no Grupo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-200 print:text-black">
              {presencasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum registro encontrado no filtro selecionado.
                  </td>
                </tr>
              ) : (
                presencasFiltradas.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-4 font-mono">{item.hora || '--:--'}</td>
                    <td className="py-2.5 px-4">{item.dataCulto || hoje}</td>
                    <td className="py-2.5 px-4 font-semibold text-white print:text-black">
                      {item.comoChegou}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 print:bg-slate-200 text-amber-300 print:text-black border border-amber-500/30 print:border-slate-300">
                        {item.qtdPessoas === 1 ? '1 (Só eu)' : `${item.qtdPessoas} pessoas`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* ============================================================== */}
      {/* MODAL MODERNO E ELEGANTE: CONFIRMAÇÃO DE ZERAR TUDO            */}
      {/* ============================================================== */}
      {showModalZerar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5">
            {/* Glow de fundo */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Cabeçalho */}
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

            {/* Lista dos impactos */}
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

            {/* Botões de Ação */}
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

      {/* Modal de Configuração de Perguntas e Subtítulos no Firebase */}
      <QuestionsConfigModal 
        isOpen={modalPerguntasOpen} 
        onClose={() => setModalPerguntasOpen(false)} 
      />
    </div>
  );
}
