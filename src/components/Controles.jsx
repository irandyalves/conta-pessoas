import { LADOS_BORDA, bordaQueSome } from '../utils/estilos';
import React, { useEffect, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown, GripVertical, Eye, EyeOff, ALargeSmall, MoveVertical, PenLine, Trash2 } from 'lucide-react';
import { carregarFontes, familiaCss, FONTES, fontePorId } from '../utils/fontes';
import Cores from './SeletorCor';

export { Cores };

// =====================================================================
// CONTROLES DO EDITOR
// Regra visual: o editor é neutro. Cor só aparece onde se ESCOLHE uma cor.
// Todo ajuste é uma linha: nome à esquerda, controle à direita.
// =====================================================================

// Barra única de formatação: tudo o que muda a aparência de um texto ou botão, na mesma linha e na mesma ordem
export const BarraFormato = ({ children }) => <div className="barra-formato">{children}</div>;

const ROTULO = 'text-[11px] leading-tight text-slate-400 w-[74px] shrink-0 whitespace-nowrap';

// Os ajustes pequenos (.ed-cel) ficam lado a lado em colunas; o resto ocupa a linha toda.
export function Secao({ titulo, descricao, acao, children }) {
  return (
    <section className="rounded-lg bg-slate-800/40 px-3 py-2.5">
      {(titulo || acao) && (
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-xs font-semibold text-slate-100">{titulo}{descricao && <span className="ml-2 font-normal text-[11px] text-slate-400">{descricao}</span>}</h3>
          {acao}
        </div>
      )}
      <div className="ed-grade">{children}</div>
    </section>
  );
}

export function Deslizante({ rotulo, valor, min, max, passo = 1, unidade = 'px', onChange }) {
  return (
    <label className="ed-cel flex items-center gap-1.5 min-w-0">
      <span className={ROTULO}>{rotulo}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        aria-label={rotulo}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ed-range flex-1 min-w-[40px] max-w-[64px]"
        style={{ '--p': `${Math.max(0, Math.min(100, ((valor - min) / (max - min)) * 100))}%` }}
      />
      <span className="text-[11px] tabular-nums text-slate-200 w-10 shrink-0 whitespace-nowrap">{valor}{unidade}</span>
    </label>
  );
}

// Slider curtinho, para usar ao lado de cores
const ICONE_SLIDER = { tamanho: ALargeSmall, espaco: MoveVertical, espessura: PenLine };
export function MiniSlider({ rotulo, icone, valor, min, max, passo = 1, unidade = 'px', onChange }) {
  const Icone = ICONE_SLIDER[icone];
  return (
    <label className={`flex items-center shrink-0 ${Icone ? 'gap-0.5' : 'gap-1.5'}`} title={rotulo}>
      {Icone ? <Icone className="w-[14px] h-[14px] text-slate-400" aria-hidden="true" /> : <span className="text-[11px] text-slate-400">{rotulo}</span>}
      <input
        type="range"
        aria-label={rotulo}
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`ed-range ${Icone ? 'w-[32px]' : 'w-[72px]'}`}
        style={{ '--p': `${Math.max(0, Math.min(100, ((valor - min) / (max - min)) * 100))}%` }}
      />
      <span className={`text-[11px] tabular-nums text-slate-200 ${!Icone ? 'w-9' : passo < 1 ? 'w-7' : 'w-5'}`}>{valor}{Icone ? '' : unidade}</span>
    </label>
  );
}

// Largura da borda e o lado em que ela some (cartão da cor "Borda")
export function AjustesBorda({ largura, onLargura, max = 10, lado, onLado, cor }) {
  return (
    <div className="flex flex-col gap-2">
      <MiniSlider rotulo="Largura" valor={largura} min={0} max={max} passo={0.5} onChange={onLargura} />
      {onLado && (
        <div className="flex items-center gap-1" role="group" aria-label="Lado em que a borda some">
          {LADOS_BORDA.map((l) => {
            const ativo = (lado || 'inteira') === l.id;
            return (
              <button key={l.id} type="button" aria-pressed={ativo} title={l.label} aria-label={l.label} onClick={() => onLado(l.id)} className={`w-9 h-7 rounded-md flex items-center justify-center transition ${ativo ? 'bg-slate-600' : 'hover:bg-slate-700'}`}>
                <span className="block w-6 h-4 rounded-[5px] border border-white" style={bordaQueSome(l.id, cor, 1.5) || undefined} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Segmentos({ rotulo, opcoes, valor, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {rotulo && <span className={ROTULO}>{rotulo}</span>}
      <div className="flex flex-wrap gap-0.5 rounded-md bg-slate-950/60 p-0.5">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={valor === o.id}
            title={o.dica || o.label}
            onClick={() => onChange(o.id)}
            className={`px-2 py-0.5 rounded text-[11px] transition ${valor === o.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            {o.conteudo || o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Chave({ rotulo, descricao, valor, onChange, vermelha = false }) {
  return (
    <button type="button" role="switch" aria-checked={Boolean(valor)} title={descricao} onClick={() => onChange(!valor)} className="ed-cel flex items-center gap-2 text-left">
      <span className={`w-7 h-4 rounded-full relative shrink-0 transition ${valor ? (vermelha ? 'bg-red-700' : 'bg-slate-100') : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${valor ? (vermelha ? 'left-[14px] bg-white' : 'left-[14px] bg-slate-900') : 'left-0.5 bg-slate-400'}`} />
      </span>
      <span className="text-[11px] text-slate-200">{rotulo}</span>
    </button>
  );
}

export function Campo({ rotulo, valor, onChange, placeholder, multilinha, linhas = 2 }) {
  const classe = 'w-full bg-slate-950/60 border border-slate-700 focus:border-slate-300 rounded-md px-2.5 py-1.5 text-[13px] text-white placeholder-slate-500 focus:outline-none';
  return (
    <label className={`block ${multilinha ? '' : 'ed-cel'}`}>
      {rotulo && <span className="block text-[11px] text-slate-400 mb-0.5">{rotulo}</span>}
      {multilinha
        ? <textarea rows={linhas} value={valor ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${classe} resize-y`} />
        : <input type="text" value={valor ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={classe} />}
    </label>
  );
}

export function Lista({ rotulo, opcoes, valor, onChange }) {
  return (
    <label className="ed-cel flex items-center gap-2">
      <span className={ROTULO}>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="flex-1 min-w-0 max-w-[180px] bg-slate-950/60 border border-slate-700 focus:border-slate-300 rounded-md px-2 py-1 text-[11px] text-white">
        {opcoes.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

// Fonte: cada nome aparece escrito na própria fonte
export function SeletorFonte({ valor, onChange, rotulo = 'Fonte' }) {
  const [aberto, setAberto] = useState(false);
  useEffect(() => { carregarFontes(aberto ? FONTES.map((f) => f.id) : [valor]); }, [aberto, valor]);
  const atual = fontePorId(valor);
  const escolher = (id) => { onChange(id); setAberto(false); };
  return (
    <div className="ed-cel relative flex items-center gap-2 min-w-0">
      {rotulo && <span className={ROTULO}>{rotulo}</span>}
      <button type="button" aria-expanded={aberto} onClick={() => setAberto(!aberto)}
        className={`flex items-center justify-between gap-1 rounded-md border text-[12px] text-white ${rotulo ? 'w-[150px] px-2 py-1 bg-slate-950/60 border-slate-700 hover:border-slate-500' : 'w-[68px] h-[22px] pl-px pr-1 border-transparent hover:border-slate-600'}`}>
        <span className="truncate" style={{ fontFamily: familiaCss(valor) }}>{atual?.nome || 'Padrão'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>
      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto rounded-lg bg-slate-800 border border-slate-700 shadow-2xl p-1">
            <button type="button" onClick={() => escolher('padrao')} className={`w-full text-left px-2 py-1 rounded text-[12px] ${!atual ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}>Padrão</button>
            {FONTES.map((f) => (
              <button key={f.id} type="button" onClick={() => escolher(f.id)} style={{ fontFamily: familiaCss(f.id) }}
                className={`w-full text-left px-2 py-1 rounded text-[15px] leading-snug ${valor === f.id ? 'bg-slate-100 text-slate-900' : 'text-slate-100 hover:bg-slate-700'}`}>
                {f.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ICONE_ALINHAMENTO = { left: AlignLeft, center: AlignCenter, right: AlignRight };
export function Alinhamento({ valor, onChange }) {
  return (
    <div className="flex gap-px">
      {[['left', 'Alinhar à esquerda'], ['center', 'Centralizar'], ['right', 'Alinhar à direita']].map(([id, nome]) => {
        const Icone = ICONE_ALINHAMENTO[id];
        return (
          <button key={id} type="button" title={nome} aria-label={nome} aria-pressed={valor === id} onClick={() => onChange(id)}
            className={`w-[19px] h-[17px] rounded flex items-center justify-center transition ${valor === id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Icone className="w-[10px] h-[10px]" />
          </button>
        );
      })}
    </div>
  );
}

// Liga/desliga pequeno (B, AA)
export function Alternar({ rotulo, nome, valor, onChange }) {
  return (
    <button type="button" title={nome} aria-label={nome} aria-pressed={Boolean(valor)} onClick={() => onChange(!valor)}
      className={`px-0.5 min-w-[20px] h-[20px] rounded-[5px] text-[10px] font-bold transition ${valor ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {rotulo}
    </button>
  );
}

// Escolha do ícone de um card, vendo os desenhos. "Automático" escolhe pelo texto da opção.
export function SeletorIcone({ opcoes, atual, manual, onChange }) {
  const [aberto, setAberto] = useState(false);
  const Atual = (opcoes.find((o) => o.id === atual) || opcoes[0]).icon;
  const escolher = (id) => { onChange(id); setAberto(false); };
  return (
    <div className="relative">
      <button type="button" aria-expanded={aberto} title="Trocar ícone" onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200">
        <Atual className="w-4 h-4" />
        <span>{manual ? 'Ícone' : 'Automático'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2">
            <button type="button" onClick={() => escolher(null)} className={`w-full text-left px-2.5 py-2 rounded-lg text-xs mb-1 ${manual ? 'text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-900 font-semibold'}`}>
              Automático, pelo texto da opção
            </button>
            <div className="grid grid-cols-8 gap-0.5 max-h-56 overflow-y-auto">
              {opcoes.map(({ id, label, icon: Icone }) => (
                <button key={id} type="button" title={label} aria-label={label} onClick={() => escolher(id)}
                  className={`h-8 rounded-md flex items-center justify-center ${id === atual ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                  <Icone className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Questão arrastável: segure em qualquer ponto (menos nos campos e botões) e solte acima ou abaixo de outra.
// Pelo teclado: foque a alça e use as setas.
let arrastando = null; // { lista, indice }
export function QuestaoArrastavel({ lista, indice, total, onMover, className = '', children }) {
  const [alvo, setAlvo] = useState('');
  const [movendo, setMovendo] = useState(false);
  const metade = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2 ? 'antes' : 'depois';
  };
  return (
    <div
      className={`questao ${indice % 2 ? 'questao-par' : ''} ${movendo ? 'questao-arrastando' : ''} ${alvo ? `questao-alvo-${alvo}` : ''} ${className}`}
      onMouseDown={(e) => { e.currentTarget.draggable = !e.target.closest('input,textarea,select,button:not([data-alca])'); }}
      onDragStart={(e) => {
        arrastando = { lista, indice };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        setMovendo(true);
      }}
      onDragEnd={(e) => { arrastando = null; e.currentTarget.draggable = false; setMovendo(false); setAlvo(''); }}
      onDragOver={(e) => {
        if (!arrastando || arrastando.lista !== lista) return;
        e.preventDefault();
        setAlvo(arrastando.indice === indice ? '' : metade(e));
      }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setAlvo(''); }}
      onDrop={(e) => {
        setAlvo('');
        if (!arrastando || arrastando.lista !== lista) return;
        e.preventDefault();
        const de = arrastando.indice;
        let para = indice + (metade(e) === 'depois' ? 1 : 0);
        if (para > de) para -= 1;
        arrastando = null;
        if (para !== de) onMover(de, para);
      }}
    >
      <button
        type="button"
        data-alca="1"
        title="Arraste para mudar a ordem (ou use as setas do teclado)"
        aria-label={`Mover questão ${indice + 1}`}
        onKeyDown={(e) => {
          const para = e.key === 'ArrowUp' ? indice - 1 : e.key === 'ArrowDown' ? indice + 1 : -1;
          if (para < 0 || para >= total) return;
          e.preventDefault();
          onMover(indice, para);
        }}
        className="absolute left-0 top-4 w-4 sm:w-5 h-7 flex items-center justify-center text-slate-500 hover:text-white"
        style={{ cursor: 'grab' }}
      >
        <GripVertical className="w-[14px] h-[14px]" />
      </button>
      {children}
    </div>
  );
}

// Pergunta obrigatória ou opcional. Vermelho = obrigatória.
export function BotaoObrigatorio({ valor, onChange }) {
  return <Chave vermelha rotulo="Resp. obrigatória" descricao={valor ? 'A pessoa só avança se responder' : 'A pessoa pode pular esta pergunta'} valor={Boolean(valor)} onChange={onChange} />;
}

// Olho: mostra ou oculta uma tela da pesquisa
export function OlhoTela({ oculta, rotulo, onClick, className = '' }) {
  const Icone = oculta ? EyeOff : Eye;
  const nome = oculta ? `Mostrar ${rotulo} na pesquisa` : `Ocultar ${rotulo}: a pesquisa pula esta tela`;
  return (
    <button
      type="button" title={nome} aria-label={nome} aria-pressed={oculta}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`p-1 rounded-md transition ${oculta ? 'text-rose-300 bg-rose-500/15 hover:bg-rose-500/30' : 'text-slate-500 hover:text-white hover:bg-slate-800'} ${className}`}
    >
      <Icone className="w-4 h-4" />
    </button>
  );
}

// Efeito e intensidade na mesma linha, em todo o sistema
export function LinhaEfeito({ rotulo, opcoes, valor, onChange, intensidade }) {
  return (
    <div className="linha-efeito">
      {rotulo && <span>{rotulo}</span>}
      <Segmentos opcoes={opcoes} valor={valor} onChange={onChange} />
      {intensidade && <MiniSlider rotulo="Intensidade" min={1} max={10} unidade="" {...intensidade} />}
    </div>
  );
}

// Cabeçalho de seção em entalhe: nome da tela em amarelo pastel e, quando dá para excluir, a lixeira
// slot = onde a lista de textos da tela põe os botões de adicionar
export function TopoPainel({ titulo, onExcluir, slot, children }) {
  return (
    <div className="painel-topo">
      <div className="entalhe">
        <h2>{titulo}</h2>
        {onExcluir && (
          <button type="button" className="entalhe-lixeira" title={`Excluir ${titulo}`} aria-label={`Excluir ${titulo}`} onClick={onExcluir}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="painel-topo-lado">
        {children}
        {slot && <div ref={slot} className="painel-topo-acoes" />}
      </div>
    </div>
  );
}
