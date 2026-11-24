import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { alturaFaixa, CORES_LINHA, CORES_TEXTO_LINHAS, FAIXA_MAX, FAIXA_MIN, FUNDOS_CAPTION } from '../utils/estilos';
import { Alinhamento, Alternar, BarraFormato, Cores, Deslizante, MiniSlider, QuestaoArrastavel, Secao, SeletorFonte } from './Controles';

/**
 * PADRÃO DE TEXTO DO SISTEMA: cada texto ocupa duas linhas, nome + texto e a barra de formatação.
 * A barra tem sempre a mesma ordem: fonte, tamanho, Texto, Fundo, Borda, alinhamento, B I AA, espaço e extras.
 * Cada linha mostra só os controles cujo "on..." foi informado:
 * { rotulo, texto?, onTexto?, multilinha?, tamanho, min, max, onTamanho, familia, onFamilia, cor, onCor, bold, onBold,
 *   italico, onItalico, caixa, onCaixa, alinhamento, onAlinhamento, fundo, onFundo, faixa, onFaixa, borda, onBorda,
 *   bordaLargura, onBordaLargura, espaco, onEspaco, aoLado (do texto), extra (fim da barra) e abaixo = controles próprios da linha }
 * Altura fica no cartão do Fundo e largura no da Borda. onEspaco: distância ENTRE esta linha e a próxima.
 * onOrdem (opcional): liga o arrastar e soltar das linhas que têm "chave"; recebe as chaves visíveis na ordem nova.
 * slotAcoes: elemento do cabeçalho (linha do entalhe) que recebe os botões de adicionar.
 * topo (opcional): configuração que vale para a lista, acima dos textos. removivel: mostra a lixeira na linha.
 * Linha { separador: true, ligado, onLigado } = linha divisória.
 */
export default function EstiloLinhasTitulo({ linhas, onOrdem, topo = null, slotAcoes = null }) {
  // Só aparecem os textos que estão no celular. Os vazios ficam num botão "adicionar";
  // quem já foi aberto ou editado continua visível mesmo que o texto seja apagado.
  const [mantidas, setMantidas] = useState({});
  const idDe = (l) => l.chave || l.rotulo;
  const manter = (l) => setMantidas((m) => (m[idDe(l)] ? m : { ...m, [idDe(l)]: true }));
  const remover = (l) => { setMantidas((m) => ({ ...m, [idDe(l)]: false })); l.onTexto(''); };
  const visivel = (l) => l.separador || Boolean(String(l.texto || '').trim()) || Boolean(mantidas[idDe(l)]);
  // numerar: o número segue a posição na tela, não o nome do campo
  let conta = 0;
  const visiveis = linhas.filter(visivel).map((l) => (l.numerar ? { ...l, rotulo: l.rotulo.replace(/d+$/, String(++conta)) } : l));
  // "Título 2", "Título 3"... viram um botão só: adiciona o próximo que estiver vazio
  const grupo = (l) => l.rotulo.replace(/\s*\d+$/, '');
  const vazias = linhas.filter((l) => !visivel(l)).filter((l, i, t) => t.findIndex((x) => grupo(x) === grupo(l)) === i);
  const moveis = onOrdem ? visiveis.filter((l) => l.chave) : [];
  const podeMover = moveis.length > 1;
  const mover = (de, para) => {
    const ids = moveis.map((l) => l.chave);
    ids.splice(para, 0, ids.splice(de, 1)[0]);
    onOrdem(ids);
  };
  const Item = (l, i, conteudo) => (podeMover && l.chave ? (
    <QuestaoArrastavel key={idDe(l)} lista="linhas_texto" indice={moveis.indexOf(l)} total={moveis.length} onMover={mover} className="texto-linha texto-linha-movel">
      {conteudo}
    </QuestaoArrastavel>
  ) : <div key={idDe(l)} className={`questao questao-fixa texto-linha ${podeMover ? 'texto-linha-movel' : ''} ${i % 2 ? 'questao-par' : ''}`}>{conteudo}</div>);

  return (
    <div className="texto-lista">
      {slotAcoes && vazias.length > 0 && createPortal(vazias.map((l) => {
        const principal = /\d$/.test(l.rotulo);
        return (
          <button key={idDe(l)} type="button" onClick={() => manter(l)} className={`texto-add ${principal ? '' : 'texto-add-2'}`}>
            <Plus className="w-4 h-4" strokeWidth={4} />
            <span>{principal ? `Add ${grupo(l)}` : l.rotulo}</span>
          </button>
        );
      }), slotAcoes)}
      {topo && <div className="texto-topo">{topo}</div>}
      {visiveis.map((l, i) => {
        if (l.separador) {
          return Item(l, i, (
            <div className="flex items-center gap-3">
              <span className="texto-nome">{l.rotulo}</span>
              <span className={`flex-1 border-t ${l.ligado ? 'border-slate-300' : 'border-slate-700 border-dashed'}`} />
              <button type="button" aria-pressed={!l.ligado} title={l.ligado ? 'Ocultar a linha divisória' : 'Mostrar a linha divisória'} aria-label={l.ligado ? 'Ocultar a linha divisória' : 'Mostrar a linha divisória'} onClick={() => l.onLigado(!l.ligado)} className={`p-1 rounded-md transition ${l.ligado ? 'text-slate-500 hover:text-white' : 'text-rose-300 bg-rose-500/15'}`}>
                {l.ligado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ));
        }
        const temFundo = Boolean(l.onFundo) && l.fundo !== 'transparente';
        const editar = (e) => { manter(l); l.onTexto(e.target.value); };
        return Item(l, i, (
          <>
            <div className="flex items-start gap-2">
              <span className="texto-nome pt-[7px]">{l.rotulo}</span>
              {!l.onTexto
                ? <span className="flex-1 min-w-0 truncate text-[13px] text-slate-300 py-[5px]" title={l.texto}>{l.texto}</span>
                : l.multilinha
                  ? <textarea rows={1} aria-label={l.rotulo} value={l.texto ?? ''} placeholder={l.placeholder || 'Vazio, não aparece no celular'} onChange={editar} className="texto-campo texto-campo-cresce" />
                  : <input type="text" aria-label={l.rotulo} value={l.texto ?? ''} placeholder={l.placeholder || 'Vazio, não aparece no celular'} onChange={editar} className="texto-campo" />}
              {l.aoLado}
              {l.removivel && <button type="button" className="texto-lixeira" title={`Remover ${l.rotulo}`} aria-label={`Remover ${l.rotulo}`} onClick={() => remover(l)}><Trash2 className="w-4 h-4" /></button>}
            </div>
            <BarraFormato>
              {l.onFamilia && <SeletorFonte rotulo="" valor={l.familia} onChange={l.onFamilia} />}
              {l.onTamanho && <MiniSlider rotulo="Tamanho" icone="tamanho" valor={l.tamanho} min={l.min ?? 9} max={l.max ?? 32} onChange={l.onTamanho} />}
              {l.onCor && <Cores rotulo="Texto" opcoes={CORES_TEXTO_LINHAS} valor={l.cor} onChange={l.onCor} />}
              {l.onFundo && (
                <Cores
                  rotulo="Fundo" opcoes={FUNDOS_CAPTION} campo="dot" valor={l.fundo} onChange={l.onFundo}
                  lateral={l.onFaixa && temFundo && <MiniSlider rotulo="Altura" valor={alturaFaixa(l.faixa)} min={FAIXA_MIN} max={FAIXA_MAX} passo={5} unidade="%" onChange={l.onFaixa} />}
                />
              )}
              {l.onBorda && l.onFundo && (
                <Cores
                  rotulo="Borda" opcoes={CORES_LINHA} campo="hex" valor={l.borda || 'padrao'} onChange={l.onBorda}
                  desativado={temFundo ? '' : 'Escolha um fundo para poder usar a borda'}
                  lateral={<MiniSlider rotulo="Largura" valor={l.bordaLargura ?? 1} min={0} max={10} passo={0.5} onChange={l.onBordaLargura} />}
                />
              )}
              {l.onAlinhamento && <Alinhamento valor={l.alinhamento} onChange={l.onAlinhamento} />}
              {(l.onBold || l.onItalico || l.onCaixa) && (
                <span className="flex gap-0.5">
                  {l.onBold && <Alternar rotulo="B" nome="Negrito" valor={l.bold} onChange={l.onBold} />}
                  {l.onItalico && <Alternar rotulo={<em>I</em>} nome="Itálico" valor={l.italico} onChange={l.onItalico} />}
                  {l.onCaixa && <Alternar rotulo="AA" nome="Maiúsculas" valor={l.caixa} onChange={l.onCaixa} />}
                </span>
              )}
              {l.onEspaco && <MiniSlider rotulo="Espaço até o próximo texto" icone="espaco" valor={l.espaco} min={0} max={80} onChange={l.onEspaco} />}
              {l.extra}
            </BarraFormato>
            {l.abaixo}
          </>
        ));
      })}
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
      {qtd > 0 && temTexto && <Deslizante rotulo="Até o texto" valor={valores.sub} min={0} max={60} onChange={(v) => onChange('sub', v)} />}
      <Deslizante rotulo="Até a resposta" valor={valores.cards} min={0} max={80} onChange={(v) => onChange('cards', v)} />
    </Secao>
  );
}
