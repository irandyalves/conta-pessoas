import React from 'react';
import { ALINHAMENTOS_TEXTO, FUNDOS_CAPTION } from '../utils/estilos';

/**
 * Controles independentes para Título e Subtítulo: tamanho, alinhamento e faixa de fundo.
 * linhas: [{ rotulo, tamanho, min, max, onTamanho, alinhamento, onAlinhamento, fundo, onFundo }]
 */
export default function EstiloLinhasTitulo({ linhas }) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-800/70">
      {linhas.map((l) => (
        <div key={l.rotulo} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-amber-300 w-20 shrink-0">{l.rotulo}</span>
            <input
              type="range"
              min={l.min ?? 10}
              max={l.max ?? 32}
              value={l.tamanho}
              onChange={(e) => l.onTamanho(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="font-mono text-[10px] font-bold text-amber-400 w-9 text-right">{l.tamanho}px</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {ALINHAMENTOS_TEXTO.map((al) => (
                <button
                  key={al.id}
                  type="button"
                  onClick={() => l.onAlinhamento(al.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                    l.alinhamento === al.id ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800" title="Faixa de fundo (de ponta a ponta)">
              <span className="text-[10px] text-slate-500 mr-0.5">Fundo</span>
              {FUNDOS_CAPTION.map((fc) => (
                <button
                  key={fc.id}
                  type="button"
                  onClick={() => l.onFundo(fc.id)}
                  title={fc.label}
                  className={`w-4 h-4 rounded-full transition-all ${fc.dot} ${
                    l.fundo === fc.id ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
