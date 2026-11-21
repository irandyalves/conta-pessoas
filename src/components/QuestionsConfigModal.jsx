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
  CloudCheck
} from 'lucide-react';
import { 
  getSavedQuestionsConfig, 
  saveQuestionsConfig, 
  DEFAULT_QUESTIONS_CONFIG 
} from '../firebase';

export default function QuestionsConfigModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('p1');
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

  const handleUpdateOpcaoP1 = (index, field, value) => {
    setConfig((prev) => {
      const novasOpcoes = [...prev.opcoesChegada];
      novasOpcoes[index] = { ...novasOpcoes[index], [field]: value };
      return { ...prev, opcoesChegada: novasOpcoes };
    });
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja restaurar as perguntas e textos para o padrão original?')) {
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
      }, 1200);
    } catch (e) {
      alert('Erro ao salvar no Firebase: ' + (e?.message || e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Configurar Perguntas e Textos</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Firebase Firestore
                </span>
              </div>
              <p className="text-xs text-slate-400">Edite as perguntas, opções e subtítulos exibidos no celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ABAS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('p1')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'p1'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>1ª Pergunta (Como Chegou)</span>
          </button>
          <button
            onClick={() => setActiveTab('p2')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'p2'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2ª Pergunta (Acompanhantes)</span>
          </button>
        </div>

        {/* CORPO ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-left">
          
          {/* ============================================================ */}
          {/* ABA 1: PERGUNTA 1 E SUAS OPÇÕES COM SUBTÍTULOS               */}
          {/* ============================================================ */}
          {activeTab === 'p1' && (
            <div className="space-y-4">
              {/* Título da Pergunta 1 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Título da 1ª Pergunta
                </label>
                <input
                  type="text"
                  value={config.pergunta1Titulo}
                  onChange={(e) => setConfig({ ...config, pergunta1Titulo: e.target.value })}
                  placeholder="Ex: Como você chegou aqui?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-bold text-white"
                />
              </div>

              {/* Opções e seus Subtítulos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Opções de Resposta e Subtítulos
                  </span>
                  <span className="text-[11px] text-slate-400">Total: {config.opcoesChegada.length} opções</span>
                </div>

                {config.opcoesChegada.map((opcao, idx) => (
                  <div key={opcao.id || idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Card #{idx + 1}</span>
                      <span className="text-[10px] font-mono text-slate-500">ID: {opcao.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Título do Card
                        </label>
                        <input
                          type="text"
                          value={opcao.titulo}
                          onChange={(e) => handleUpdateOpcaoP1(idx, 'titulo', e.target.value)}
                          placeholder="Título da opção"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Subtítulo / Descrição
                        </label>
                        <input
                          type="text"
                          value={opcao.subtitulo}
                          onChange={(e) => handleUpdateOpcaoP1(idx, 'subtitulo', e.target.value)}
                          placeholder="Subtítulo que aparece abaixo"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: PERGUNTA 2 (ACOMPANHANTES)                            */}
          {/* ============================================================ */}
          {activeTab === 'p2' && (
            <div className="space-y-4">
              {/* Título da Pergunta 2 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Título da 2ª Pergunta (Topo da tela)
                </label>
                <textarea
                  rows={2}
                  value={config.pergunta2Titulo}
                  onChange={(e) => setConfig({ ...config, pergunta2Titulo: e.target.value })}
                  placeholder="Ex: Você está só ou tem mais pessoas te acompanhando?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-bold text-white resize-none"
                />
              </div>

              {/* Botão Individual (SÓ EU) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3">
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
                      value={config.opcaoIndividualTitulo}
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
                      value={config.opcaoIndividualSubtitulo}
                      onChange={(e) => setConfig({ ...config, opcaoIndividualSubtitulo: e.target.value })}
                      placeholder="Ex: , vim sozinho"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Divisor das Opções com Acompanhantes */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Texto do Divisor das Quantidades
                </label>
                <input
                  type="text"
                  value={config.divisorQtdTexto}
                  onChange={(e) => setConfig({ ...config, divisorQtdTexto: e.target.value })}
                  placeholder="Ex: Quantas pessoas vieram com você?"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
              className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
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
                  <span>Salvar no Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
