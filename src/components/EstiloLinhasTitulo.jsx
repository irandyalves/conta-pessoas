import React, { useState } from 'react';
import { Eye, EyeOff, MoveVertical, Plus } from 'lucide-react';
import { alturaFaixa, CORES_LINHA, CORES_TEXTO_LINHAS, FAIXA_MAX, FAIXA_MIN, FUNDOS_CAPTION } from '../utils/estilos';
import { Alinhamento, Alternar, Campo, Cores, Deslizante, Dobra, MiniSlider, QuestaoArrastavel, Secao, SeletorFonte } from './Controles';

/**
 * Textos de uma tela, um por linha, na mesma ordem em que aparecem no celular.
 * Cada linha mostra só os controles cujo "on..." foi informado:
 * { rotulo, texto?, onTexto?, multilinha?, tamanho, min, max, onTamanho, familia, onFamilia, cor, onCor, bold, onBold,
 *   caixa, onCaixa, alinhamento, onAlinhamento, fundo, onFundo, faixa, onFaixa, borda, onBorda, bordaLargura, onBordaLargura,
 *   espaco, onEspaco, extra e abaixo (controles próprios da linha) }
 * Altura e borda aparecem quando a linha tem cor de fundo. onEspaco: distância ENTRE esta linha e a próxima.
 * onOrdem (opcional): liga o arrastar e soltar; recebe as "chave" das linhas visíveis na ordem nova.
 * Linha { separador: true, ligado, onLigado } = linha divisória.
 */
export default function EstiloLinhasTitulo({ linhas, onOrdem }) {
  // Só aparecem os textos que estão no celular. Os vazios ficam num botão "adicionar";
  // quem já foi aberto ou editado continua visível mesmo que o texto seja apagado.
  const [mantidas, setMantidas] = useState({});
  const manter = (rotulo) => setMantidas((m) => (m[rotulo] ? m : { ...m, [rotulo]: true }));
  const visivel = (l) => l.separador || Boolean(String(l.texto || '').trim()) || Boolean(mantidas[l.rotulo]);
  const visiveis = linhas.filter(visivel);
  const vazias = linhas.filter((l) => !visivel(l));
  const mover = (de, para) => {
    const ids = visiveis.map((l) => l.chave);
    ids.splice(para, 0, ids.splice(de, 1)[0]);
    onOrdem(ids);
  };
  const Item = (l, i, conteudo) => (onOrdem ? (
    <QuestaoArrastavel
      key={l.rotulo}
      lista="linhas_texto"
      indice={i}
      total={visiveis.length}
      onMover={mover}
      className="-mx-3 px-5 py-2 flex flex-col gap-1.5 border-t border-dashed border-slate-600"
    >
      {conteudo}
    </QuestaoArrastavel>
  ) : <React.Fragment key={l.rotulo}>{conteudo}</React.Fragment>);
  return (
    <div className={onOrdem ? '' : 'space-y-1'}>
      {visiveis.map((l, i) => {
        if (l.separador) {
          return Item(l, i, (
            <div className="flex items-center gap-3 px-1 py-1">
              <span className="text-[11px] text-slate-400 shrink-0">{l.rotulo}</span>
              <span className={`flex-1 border-t ${l.ligado ? 'border-slate-300' : 'border-slate-700 border-dashed'}`} />
              <button type="button" aria-pressed={!l.ligado} title={l.ligado ? 'Ocultar a linha divisória' : 'Mostrar a linha divisória'} aria-label={l.ligado ? 'Ocultar a linha divisória' : 'Mostrar a linha divisória'} onClick={() => l.onLigado(!l.ligado)} className={`p-1 rounded-md transition ${l.ligado ? 'text-slate-500 hover:text-white' : 'text-rose-300 bg-rose-500/15'}`}>
                {l.ligado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ));
        }
        const cor = CORES_TEXTO_LINHAS.find((c) => c.id === l.cor);
        const fundo = l.onFundo && l.fundo !== 'transparente' && FUNDOS_CAPTION.find((f) => f.id === l.fundo);
        return Item(l, i, (
          <>
            <Dobra
              semFundo={Boolean(onOrdem)}
              titulo={l.rotulo}
              resumo={l.texto}
              aberta={i === 0 || Boolean(mantidas[l.rotulo])}
              lateral={
                <span className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                  {cor && <span className={`w-2 h-2 rounded-full ${cor.bg}`} />}
                  {fundo && <span className={`w-2 h-2 rounded-sm ${fundo.dot}`} />}
                  {l.tamanho && <span className="text-[11px] tabular-nums text-slate-400 w-8 text-right">{l.tamanho}px</span>}
                </span>
              }
            >
              {l.onTexto && <Campo valor={l.texto} onChange={(v) => { manter(l.rotulo); l.onTexto(v); }} multilinha={l.multilinha} placeholder={l.placeholder} />}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {l.onFamilia && <SeletorFonte rotulo="" valor={l.familia} onChange={l.onFamilia} />}
                {l.onTamanho && <MiniSlider rotulo="Tamanho" valor={l.tamanho} min={l.min ?? 9} max={l.max ?? 32} onChange={l.onTamanho} />}
                {l.onAlinhamento && <Alinhamento valor={l.alinhamento} onChange={l.onAlinhamento} />}
                {l.extra}
                {(l.onBold || l.onCaixa) && (
                  <span className="flex gap-1">
                    {l.onBold && <Alternar rotulo="B" nome="Negrito" valor={l.bold} onChange={l.onBold} />}
                    {l.onCaixa && <Alternar rotulo="AA" nome="Caixa alta" valor={l.caixa} onChange={l.onCaixa} />}
                  </span>
                )}
              </div>
              {l.onCor && <Cores rotulo="Texto" opcoes={CORES_TEXTO_LINHAS} valor={l.cor} onChange={l.onCor} lateral={<span />} />}
              {l.onFundo && (
                <Cores
                  rotulo="Fundo"
                  opcoes={FUNDOS_CAPTION}
                  campo="dot"
                  valor={l.fundo}
                  onChange={l.onFundo}
                  lateral={l.onFaixa && fundo ? <MiniSlider rotulo="Altura" valor={alturaFaixa(l.faixa)} min={FAIXA_MIN} max={FAIXA_MAX} passo={5} unidade="%" onChange={l.onFaixa} /> : <span />}
                />
              )}
              {l.onBorda && fundo && (
                <Cores
                  rotulo="Borda"
                  opcoes={CORES_LINHA}
                  campo="hex"
                  valor={l.borda || 'padrao'}
                  onChange={l.onBorda}
                  lateral={<MiniSlider rotulo="Largura" valor={l.bordaLargura ?? 1} min={0} max={10} passo={0.5} onChange={l.onBordaLargura} />}
                />
              )}
              {l.abaixo}
            </Dobra>
            {l.onEspaco && (
              <div className={`flex items-center gap-1.5 h-5 ${onOrdem ? 'pl-1' : 'pl-3'}`}>
                <MoveVertical className="w-3 h-3 text-slate-500 shrink-0" />
                <MiniSlider rotulo="Espaço" valor={l.espaco} min={0} max={80} onChange={l.onEspaco} />
              </div>
            )}
          </>
        ));
      })}
      {vazias.length > 0 && (
        <div className={`flex flex-wrap items-center gap-1 ${onOrdem ? '-mx-3 px-5 py-2 border-t border-dashed border-slate-600' : 'pt-0.5'}`}>
          {vazias.map((l) => (
            <button key={l.rotulo} type="button" onClick={() => manter(l.rotulo)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <Plus className="w-3 h-3" />
              <span>{l.rotulo}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Espaços entre títulos, subtítulo e cards (valores em px)
export function ControleEspacos({ valores, onChange, titulos = [], subtitulo = '' }) {
  // Só os espaços que existem no celular com os textos atuais
  const qtd = titulos.filter((t) => String(t || '').trim()).length;
  const temTexto = Boolean(String(subtitulo || '').trim());
  return (
    <Secao titulo="Espaçamento">
      {qtd > 1 && <Deslizante rotulo="Entre títulos" valor={valores.tit} min={0} max={40} onChange={(v) => onChange('tit', v)} />}
      {qtd > 0 && temTexto && <Deslizante rotulo="Antes do texto" valor={valores.sub} min={0} max={60} onChange={(v) => onChange('sub', v)} />}
      <Deslizante rotulo="Antes da resposta" valor={valores.cards} min={0} max={80} onChange={(v) => onChange('cards', v)} />
    </Secao>
  );
}
