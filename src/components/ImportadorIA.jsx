import React, { useState, useRef } from 'react';
import { Upload, FileText, Link2, Sparkles, Loader2, Trash2, ArrowLeft, CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';
import { importarQuestionario, resumirTelas } from '../utils/iaImportador';

const NOME_TIPO = {
  cards: 'Cards', radio: 'Escolha única', checkbox: 'Múltipla escolha', dropdown: 'Lista',
  grade: 'Grade / Escala', slider: 'Nota 0–10', rating: 'Estrelas', texto_curto: 'Texto curto',
  texto: 'Texto longo', data: 'Data', hora: 'Hora'
};

const FONTES = [
  { id: 'arquivo', icon: Upload, titulo: 'Enviar arquivo', desc: 'PDF, Word, PowerPoint, Excel ou TXT' },
  { id: 'texto', icon: FileText, titulo: 'Colar texto', desc: 'Copie as perguntas e cole aqui' },
  { id: 'link', icon: Link2, titulo: 'Link do Google Forms', desc: 'Formulário público' }
];

/**
 * Importador único (novo evento e editor de perguntas).
 * Etapas: 1) escolher a fonte  2) a IA analisa  3) revisar as telas e aplicar.
 * onAplicar(config, modo) — modo: 'substituir' | 'adicionar'
 */
export default function ImportadorIA({ onAplicar, permitirAdicionar = false, textoAplicar = 'Usar estas telas' }) {
  const [fonte, setFonte] = useState('arquivo');
  const [texto, setTexto] = useState('');
  const [url, setUrl] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null); // { config, motor, aviso, nomeArquivo }
  const [modo, setModo] = useState('substituir');
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef(null);

  const analisar = async (entrada) => {
    setErro('');
    setAnalisando(true);
    try {
      const r = await importarQuestionario(entrada);
      setResultado({ ...r, nomeArquivo: entrada.arquivo?.name || '' });
    } catch (e) {
      setErro(e?.message || String(e));
    } finally {
      setAnalisando(false);
    }
  };

  const removerTela = (indice) => {
    setResultado((prev) => {
      const cfg = { ...prev.config };
      const temP1 = (cfg.opcoesChegada || []).length > 0;
      if (temP1 && indice === 0) {
        cfg.opcoesChegada = [];
      } else {
        const iExtra = temP1 ? indice - 1 : indice;
        cfg.telasExtras = (cfg.telasExtras || []).filter((_, i) => i !== iExtra);
      }
      return { ...prev, config: cfg };
    });
  };

  // ---------- ETAPA 2: analisando ----------
  if (analisando) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <p className="font-black text-white">A IA está lendo o documento...</p>
        <p className="text-xs text-slate-400">Identificando perguntas, opções, escalas e tabelas. Pode levar alguns segundos.</p>
      </div>
    );
  }

  // ---------- ETAPA 3: revisão ----------
  if (resultado) {
    const telas = resumirTelas(resultado.config);
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {telas.length} {telas.length === 1 ? 'tela encontrada' : 'telas encontradas'}
              {resultado.config.ehSimulado && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">Simulado</span>}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {resultado.motor === 'ia' ? '✨ Analisado pela IA (Gemini)' : '⚙️ Leitura automática'}
              {resultado.nomeArquivo ? ` · ${resultado.nomeArquivo}` : ''}
              {resultado.config.capaTitulo1 ? ` · ${resultado.config.capaTitulo1}` : ''}
            </p>
          </div>
          <button type="button" onClick={() => setResultado(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Trocar arquivo
          </button>
        </div>

        {resultado.aviso && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{resultado.aviso}</span>
          </div>
        )}

        <ol className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {telas.map((t, i) => (
            <li key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">{NOME_TIPO[t.tipo] || t.tipo}</span>
                  {t.secao && <span className="text-[10px] text-slate-500 truncate">{t.secao}</span>}
                </div>
                <p className="text-xs font-bold text-white mt-1 leading-snug">{t.titulo}</p>
                {t.opcoes.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.opcoes.join(' · ')}</p>
                )}
              </div>
              <button type="button" onClick={() => removerTela(i)} title="Remover esta tela" className="p-1.5 h-fit rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ol>

        {permitirAdicionar && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'substituir', t: 'Substituir as perguntas atuais' },
              { id: 'adicionar', t: 'Adicionar depois das atuais' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModo(m.id)}
                className={`p-2.5 rounded-xl text-xs font-bold border ${modo === m.id ? 'bg-amber-500/15 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                {m.t}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={telas.length === 0}
          onClick={() => onAplicar(resultado.config, modo)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-sm disabled:opacity-40"
        >
          {textoAplicar}
        </button>
        <p className="text-[10px] text-slate-500 text-center">Depois de aplicar, você pode ajustar textos, cores e tipos no editor de perguntas.</p>
      </div>
    );
  }

  // ---------- ETAPA 1: escolher a fonte ----------
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {FONTES.map((f) => {
          const Icon = f.icon;
          const ativo = fonte === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFonte(f.id); setErro(''); }}
              className={`p-3 rounded-xl border text-left transition ${ativo ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
            >
              <Icon className={`w-5 h-5 ${ativo ? 'text-amber-300' : 'text-slate-400'}`} />
              <p className={`text-xs font-black mt-1.5 ${ativo ? 'text-white' : 'text-slate-300'}`}>{f.titulo}</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.desc}</p>
            </button>
          );
        })}
      </div>

      {fonte === 'arquivo' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            const f = e.dataTransfer.files?.[0];
            if (f) analisar({ arquivo: f });
          }}
          className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition ${arrastando ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700 hover:border-amber-400/60 bg-slate-950'}`}
        >
          <Upload className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm font-black text-white mt-2">Arraste o arquivo aqui ou clique para escolher</p>
          <p className="text-[11px] text-slate-400 mt-1">Questionários, avaliações de reação, pesquisas e simulados (com ou sem gabarito)</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.csv,.txt,.md,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) analisar({ arquivo: f });
            }}
          />
        </div>
      )}

      {fonte === 'texto' && (
        <div className="space-y-2">
          <textarea
            rows={8}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={'Cole as perguntas. Exemplo:\n\n1. Como você avalia o evento?\na) Ótimo\nb) Bom\nc) Regular\n\n2. Deixe sua sugestão: ________'}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-600 resize-y focus:outline-none"
          />
          <button
            type="button"
            disabled={!texto.trim()}
            onClick={() => analisar({ texto })}
            className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" /> Criar telas com IA
          </button>
        </div>
      )}

      {fonte === 'link' && (
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            type="button"
            disabled={!url.trim()}
            onClick={() => analisar({ url })}
            className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Ler formulário
          </button>
        </div>
      )}

      {erro && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{erro}</span>
        </div>
      )}
    </div>
  );
}
