import React from 'react';
import { MoveVertical } from 'lucide-react';
import { FUNDOS_CAPTION, CORES_TEXTO_LINHAS } from '../utils/estilos';
import { Alinhamento, Campo, Cores, Deslizante, Dobra, Secao } from './Controles';

/**
 * Textos de uma tela, um por linha, na mesma ordem em que aparecem no celular.
 * Cada linha mostra só os controles cujo "on..." foi informado:
 * { rotulo, texto?, onTexto?, multilinha?, tamanho, min, max, onTamanho, cor, onCor, bold, onBold,
 *   alinhamento, onAlinhamento, fundo, onFundo, espaco, onEspaco }
 * onEspaco: mostra o slider de distância ENTRE esta linha e a próxima.
 */
export default function EstiloLinhasTitulo({ linhas }) {
  return (
    <div className="space-y-1.5">
      {linhas.map((l, i) => {
        const cor = CORES_TEXTO_LINHAS.find((c) => c.id === l.cor);
        const fundo = l.onFundo && l.fundo !== 'transparente' && FUNDOS_CAPTION.find((f) => f.id === l.fundo);
        return (
          <React.Fragment key={l.rotulo}>
            <Dobra
              titulo={l.rotulo}
              resumo={l.texto}
              aberta={i === 0}
              lateral={
                <span className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                  {cor && <span className={`w-2.5 h-2.5 rounded-full ${cor.bg}`} />}
                  {fundo && <span className={`w-2.5 h-2.5 rounded-sm ${fundo.dot}`} />}
                  <span className="text-xs tabular-nums text-slate-400 w-9 text-right">{l.tamanho}px</span>
                </span>
              }
            >
              {l.onTexto && <Campo valor={l.texto} onChange={l.onTexto} multilinha={l.multilinha} placeholder={l.placeholder} />}
              {l.onTamanho && <Deslizante rotulo="Tamanho" valor={l.tamanho} min={l.min ?? 9} max={l.max ?? 32} onChange={l.onTamanho} />}
              {l.onCor && <Cores rotulo="Cor do texto" opcoes={CORES_TEXTO_LINHAS} valor={l.cor} onChange={l.onCor} />}
              {l.onFundo && <Cores rotulo="Cor de fundo" opcoes={FUNDOS_CAPTION} campo="dot" valor={l.fundo} onChange={l.onFundo} />}
              {(l.onAlinhamento || l.onBold) && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 shrink-0">Estilo</span>
                  {l.onAlinhamento && <Alinhamento valor={l.alinhamento} onChange={l.onAlinhamento} />}
                  {l.onBold && (
                    <div className="rounded-lg bg-slate-950/60 p-1">
                      <button
                        type="button"
                        title="Negrito"
                        aria-pressed={Boolean(l.bold)}
                        onClick={() => l.onBold(!l.bold)}
                        className={`w-7 h-6 rounded-md text-xs font-bold transition ${l.bold ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      >
                        B
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Dobra>
            {l.onEspaco && (
              <div className="flex items-center gap-2 pl-4 pr-4">
                <MoveVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <Deslizante rotulo="Espaço" valor={l.espaco} min={0} max={80} onChange={l.onEspaco} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Espaços entre títulos, subtítulo e cards (valores em px)
export function ControleEspacos({ valores, onChange }) {
  return (
    <Secao titulo="Espaçamento">
      <Deslizante rotulo="Entre títulos" valor={valores.tit} min={0} max={40} onChange={(v) => onChange('tit', v)} />
      <Deslizante rotulo="Antes do texto" valor={valores.sub} min={0} max={60} onChange={(v) => onChange('sub', v)} />
      <Deslizante rotulo="Antes das opções" valor={valores.cards} min={0} max={80} onChange={(v) => onChange('cards', v)} />
    </Secao>
  );
}
