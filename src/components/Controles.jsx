import React, { useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';

// =====================================================================
// CONTROLES DO EDITOR
// Regra visual: o editor é neutro. Cor só aparece onde se ESCOLHE uma cor.
// Todo ajuste é uma linha: nome à esquerda, controle à direita.
// =====================================================================

const ROTULO = 'text-xs text-slate-400 w-28 shrink-0';

export function Secao({ titulo, descricao, acao, children }) {
  return (
    <section className="rounded-xl bg-slate-800/40 p-4 space-y-3.5">
      {(titulo || acao) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{titulo}</h3>
            {descricao && <p className="text-xs text-slate-400 mt-0.5">{descricao}</p>}
          </div>
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

export function Deslizante({ rotulo, valor, min, max, passo = 1, unidade = 'px', onChange }) {
  return (
    <label className="flex items-center gap-3">
      <span className={ROTULO}>{rotulo}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        aria-label={rotulo}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ed-range flex-1 min-w-0"
        style={{ '--p': `${Math.max(0, Math.min(100, ((valor - min) / (max - min)) * 100))}%` }}
      />
      <span className="text-xs tabular-nums text-slate-200 w-12 text-right shrink-0">{valor}{unidade}</span>
    </label>
  );
}

// Amostra de cor: bolinha (13px) ou quadrinho (20px). A área de toque é maior que o desenho.
function Amostra({ classe, quadrado, selecionada, nome, onClick }) {
  return (
    <button
      type="button"
      title={nome}
      aria-label={nome}
      aria-pressed={selecionada}
      onClick={onClick}
      className={`p-1 rounded-md transition ${selecionada ? 'bg-slate-100/15' : 'hover:bg-slate-100/10'}`}
    >
      <span
        className={`block ${quadrado ? 'w-5 h-5 rounded border border-white/20' : 'w-[13px] h-[13px] rounded-full'} ${classe} ${selecionada ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
      />
    </button>
  );
}

export function Cores({ rotulo, opcoes, valor, onChange, campo = 'bg', quadrado = false }) {
  const atual = opcoes.find((o) => o.id === valor) || opcoes[0];
  return (
    <div className="flex items-center gap-3">
      <span className={ROTULO}>{rotulo}</span>
      <div className="flex flex-wrap items-center gap-0.5 flex-1 min-w-0">
        {opcoes.map((o) => (
          <Amostra key={o.id} nome={o.label} quadrado={quadrado} classe={o[campo]} selecionada={o.id === atual.id} onClick={() => onChange(o.id)} />
        ))}
      </div>
      <span className="text-xs text-slate-300 shrink-0 max-w-[110px] truncate">{atual.label}</span>
    </div>
  );
}

export function Segmentos({ rotulo, opcoes, valor, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {rotulo && <span className={ROTULO}>{rotulo}</span>}
      <div className="flex flex-wrap gap-1 rounded-lg bg-slate-950/60 p-1">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={valor === o.id}
            title={o.dica || o.label}
            onClick={() => onChange(o.id)}
            className={`px-2.5 py-1 rounded-md text-xs transition ${valor === o.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            {o.conteudo || o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Chave({ rotulo, descricao, valor, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={Boolean(valor)} onClick={() => onChange(!valor)} className="w-full flex items-center justify-between gap-3 text-left">
      <span>
        <span className="block text-xs text-slate-200">{rotulo}</span>
        {descricao && <span className="block text-xs text-slate-400 mt-0.5">{descricao}</span>}
      </span>
      <span className={`w-9 h-5 rounded-full relative shrink-0 transition ${valor ? 'bg-slate-100' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${valor ? 'left-[18px] bg-slate-900' : 'left-0.5 bg-slate-400'}`} />
      </span>
    </button>
  );
}

export function Campo({ rotulo, valor, onChange, placeholder, multilinha, linhas = 3 }) {
  const classe = 'w-full bg-slate-950/60 border border-slate-700 focus:border-slate-300 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none';
  return (
    <label className="block">
      {rotulo && <span className="block text-xs text-slate-400 mb-1">{rotulo}</span>}
      {multilinha
        ? <textarea rows={linhas} value={valor ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${classe} resize-y`} />
        : <input type="text" value={valor ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={classe} />}
    </label>
  );
}

export function Lista({ rotulo, opcoes, valor, onChange }) {
  return (
    <label className="flex items-center gap-3">
      <span className={ROTULO}>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="flex-1 min-w-0 bg-slate-950/60 border border-slate-700 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white">
        {opcoes.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

const ICONE_ALINHAMENTO = { left: AlignLeft, center: AlignCenter, right: AlignRight };
export function Alinhamento({ valor, onChange }) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-slate-950/60 p-1">
      {[['left', 'Alinhar à esquerda'], ['center', 'Centralizar'], ['right', 'Alinhar à direita']].map(([id, nome]) => {
        const Icone = ICONE_ALINHAMENTO[id];
        return (
          <button key={id} type="button" title={nome} aria-label={nome} aria-pressed={valor === id} onClick={() => onChange(id)}
            className={`w-7 h-6 rounded-md flex items-center justify-center transition ${valor === id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Icone className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

// Linha que abre e fecha. Fechada mostra o conteúdo atual, então dá para ler a tela inteira de relance.
export function Dobra({ titulo, resumo, lateral, aberta: inicial = false, children }) {
  const [aberta, setAberta] = useState(inicial);
  return (
    <div className={`rounded-xl transition-colors ${aberta ? 'bg-slate-800/60' : 'bg-slate-800/40 hover:bg-slate-800/60'}`}>
      <button type="button" aria-expanded={aberta} onClick={() => setAberta(!aberta)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
        <span className="text-xs text-slate-400 w-24 shrink-0">{titulo}</span>
        <span className={`flex-1 min-w-0 truncate text-sm ${resumo ? 'text-slate-100' : 'text-slate-500'}`}>{resumo || 'Vazio, não aparece no celular'}</span>
        {lateral}
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${aberta ? 'rotate-180' : ''}`} />
      </button>
      {aberta && <div className="px-4 pb-4 pt-1 space-y-3.5">{children}</div>}
    </div>
  );
}
