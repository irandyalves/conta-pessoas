import React from 'react';
import { ALINHAMENTOS_TEXTO, FUNDOS_CAPTION, CORES_TEXTO_LINHAS } from '../utils/estilos';

/**
 * Controles independentes por linha de texto (título, subtítulo, legenda, itens...).
 * Cada linha mostra só os controles cujo "on..." foi informado:
 * { rotulo, texto?, onTexto?, multilinha?, tamanho, min, max, onTamanho, cor, onCor, bold, onBold,
 *   alinhamento, onAlinhamento, fundo, onFundo }
 */
export default function EstiloLinhasTitulo({ linhas }) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-800/70">
      {linhas.map((l) => (
        <div key={l.rotulo} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-amber-300 shrink-0 min-w-[64px]">{l.rotulo}</span>
            {l.onTamanho && (
              <>
                <input
                  type="range"
                  min={l.min ?? 9}
                  max={l.max ?? 32}
                  value={l.tamanho}
                  onChange={(e) => l.onTamanho(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-[10px] font-bold text-amber-400 w-9 text-right">{l.tamanho}px</span>
              </>
            )}
            {l.onBold && (
              <button
                type="button"
                onClick={() => l.onBold(!l.bold)}
                title="Negrito"
                className={`w-7 h-6 rounded-md text-xs font-black border transition ${l.bold ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
              >
                B
              </button>
            )}
          </div>

          {l.onTexto && (
            l.multilinha ? (
              <textarea
                rows={3}
                value={l.texto || ''}
                onChange={(e) => l.onTexto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-white resize-y focus:outline-none"
              />
            ) : (
              <input
                type="text"
                value={l.texto || ''}
                onChange={(e) => l.onTexto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
              />
            )
          )}

          <div className="flex flex-wrap items-center gap-2">
            {l.onCor && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 mr-0.5">Cor</span>
                {CORES_TEXTO_LINHAS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => l.onCor(c.id)}
                    title={c.label}
                    className={`w-4 h-4 rounded-full transition-all ${c.bg} ${l.cor === c.id ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            )}
            {l.onAlinhamento && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {ALINHAMENTOS_TEXTO.map((al) => (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => l.onAlinhamento(al.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${l.alinhamento === al.id ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    {al.label}
                  </button>
                ))}
              </div>
            )}
            {l.onFundo && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800" title="Faixa de fundo (de ponta a ponta)">
                <span className="text-[10px] text-slate-500 mr-0.5">Fundo</span>
                {FUNDOS_CAPTION.map((fc) => (
                  <button
                    key={fc.id}
                    type="button"
                    onClick={() => l.onFundo(fc.id)}
                    title={fc.label}
                    className={`w-4 h-4 rounded-full transition-all ${fc.dot} ${l.fundo === fc.id ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
