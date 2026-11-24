import React from 'react';
import Rosto, { Boneco, corHumor } from './Rosto';
import { Coruja, Gato, Robo } from './Avatares';

// Estilos de escala para telas do tipo "slider" (nota de X a Y).
// O MESMO componente é usado no celular e no preview do editor (escala = zoom do preview).
export const ESTILOS_ESCALA = [
  { id: 'slider', label: 'Slide clássico' },
  { id: 'numero', label: 'Número animado' },
  { id: 'carinhas', label: 'Carinha viva' },
  { id: 'boneco', label: 'Boneco' },
  { id: 'coruja', label: 'Coruja azul' },
  { id: 'gato', label: 'Gato' },
  { id: 'robo', label: 'Robô' },
  { id: 'nps', label: 'Botões coloridos' },
  { id: 'estrelas', label: 'Estrelas' },
  { id: 'coracoes', label: 'Corações' },
  { id: 'termometro', label: 'Termômetro' },
  { id: 'emojis', label: '5 carinhas' }
];

// Estilos que mostram um valor inicial (o participante só arrasta)
export const ESCALA_COM_VALOR_INICIAL = ['slider', 'numero', 'carinhas', 'boneco', 'coruja', 'gato', 'robo', 'termometro'];
const AVATARES = { boneco: Boneco, coruja: Coruja, gato: Gato, robo: Robo };

const corDoValor = (v, min, max) => corHumor(max > min ? (v - min) / (max - min) : 1);

export default function EscalaVisual({ tela, valor, onChange, escala = 1, mini = false }) {
  const min = Number(tela.sliderMin ?? 0);
  const max = Number(tela.sliderMax ?? 10);
  const step = Number(tela.sliderStep ?? 1) || 1;
  const estilo = tela.estiloEscala || 'slider';
  const unidade = tela.sliderUnidade || '';
  const meio = Math.round((min + max) / 2);
  const temValor = valor !== '' && valor !== undefined && valor !== null;
  const v = temValor ? Number(valor) : meio;
  const p = max > min ? (v - min) / (max - min) : 1;
  const cor = corDoValor(v, min, max);
  const px = (n) => `${Math.round(n * escala)}px`;
  const valores = [];
  for (let x = min; x <= max && valores.length < 21; x += step) valores.push(x);

  // mini = miniatura do editor: sem os rótulos, para nada ficar cortado
  const rotulos = mini ? null : (
    <div className="flex justify-between font-mono text-slate-400" style={{ fontSize: px(11) }}>
      <span>{min}{tela.sliderLabelMin && tela.sliderLabelMin !== 'Mínimo' ? ` · ${tela.sliderLabelMin}` : ''}</span>
      <span>{tela.sliderLabelMax && tela.sliderLabelMax !== 'Máximo' ? `${tela.sliderLabelMax} · ` : ''}{max}</span>
    </div>
  );

  const range = (classe = '') => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Nota"
      className={`es-range w-full cursor-pointer ${classe}`}
      style={{ '--es-cor': cor, '--es-p': `${p * 100}%` }}
    />
  );

  if (estilo === 'numero') {
    return (
      <div className="space-y-2 text-center">
        <div
          key={v}
          className="font-black tabular-nums transition-all duration-300 animate-[esNum_.35s_ease-out]"
          style={{ fontSize: px(64), lineHeight: 1.1, color: cor, textShadow: `0 0 ${px(24)} ${cor}` }}
        >
          {v}{unidade}
        </div>
        {range()}
        {rotulos}
      </div>
    );
  }

  if (estilo === 'carinhas' || AVATARES[estilo]) {
    const Avatar = AVATARES[estilo];
    if (mini) return <div className="flex justify-center">{Avatar ? <Avatar p={p} tamanho={72} /> : <Rosto p={p} tamanho={62} />}</div>;
    return (
      <div className="space-y-2 text-center">
        <div className="flex justify-center">
          {Avatar ? <Avatar p={p} tamanho={Math.round(170 * escala)} /> : <Rosto p={p} tamanho={Math.round(116 * escala)} />}
        </div>
        <div className="font-black tabular-nums" style={{ fontSize: px(26), color: cor }}>{v}{unidade}</div>
        {range()}
        {rotulos}
      </div>
    );
  }

  if (estilo === 'termometro') {
    return (
      <div className="space-y-2 text-center">
        <div className="relative pt-8">
          <div
            className="absolute -translate-x-1/2 px-2 py-0.5 rounded-lg font-black text-slate-950 transition-all duration-200"
            style={{ left: `${p * 100}%`, top: 0, background: cor, fontSize: px(14) }}
          >
            {v}{unidade}
          </div>
          <div className="relative rounded-full" style={{ height: px(14), background: 'linear-gradient(90deg,#ef4444,#f97316,#facc15,#38bdf8,#10b981)' }}>
            <div className="absolute inset-y-0 right-0 rounded-r-full bg-slate-900/80 transition-all duration-200" style={{ width: `${(1 - p) * 100}%` }} />
          </div>
          {range('absolute inset-x-0 bottom-0 opacity-0')}
        </div>
        {rotulos}
      </div>
    );
  }

  if (estilo === 'nps') {
    return (
      <div className="space-y-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(valores.length, 11)}, minmax(0,1fr))` }}>
          {valores.map((x) => {
            const ativo = temValor && Number(valor) === x;
            const c = corDoValor(x, min, max);
            return (
              <button
                key={x}
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(String(x)); }}
                className="rounded-lg font-black border transition-all duration-200"
                style={{
                  fontSize: px(13), paddingTop: px(8), paddingBottom: px(8),
                  background: ativo ? c : 'rgba(15,23,42,.9)', color: ativo ? '#0f172a' : c,
                  borderColor: c, boxShadow: ativo ? `0 0 ${px(14)} ${c}` : 'none', transform: ativo ? 'scale(1.12)' : 'none'
                }}
              >
                {x}
              </button>
            );
          })}
        </div>
        {rotulos}
      </div>
    );
  }

  if (estilo === 'estrelas' || estilo === 'coracoes') {
    const icone = estilo === 'estrelas' ? '★' : '♥';
    const corOn = estilo === 'estrelas' ? '#fbbf24' : '#f43f5e';
    const itens = valores.filter((x) => x > min || valores.length <= 5);
    return (
      <div className="space-y-2 text-center">
        <div className="flex flex-wrap justify-center gap-0.5">
          {itens.map((x) => {
            const on = temValor && x <= Number(valor);
            return (
              <button
                key={x}
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(String(x)); }}
                className="leading-none transition-transform duration-200 active:scale-90"
                style={{ fontSize: px(itens.length > 6 ? 26 : 38), color: on ? corOn : '#334155', transform: on ? 'scale(1.1)' : 'none', textShadow: on ? `0 0 ${px(10)} ${corOn}` : 'none' }}
              >
                {icone}
              </button>
            );
          })}
        </div>
        <div className="font-black text-slate-200" style={{ fontSize: px(14) }}>{temValor ? `${valor}${unidade}` : 'Toque para avaliar'}</div>
      </div>
    );
  }

  if (estilo === 'emojis') {
    const pontos = [0, 1, 2, 3, 4].map((i) => Math.round(min + (i * (max - min)) / 4));
    return (
      <div className="space-y-2 text-center">
        <div className="flex justify-between items-center">
          {pontos.map((pt, i) => {
            const ativo = temValor && Number(valor) === pt;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Nota ${pt}`}
                aria-pressed={ativo}
                onClick={(e) => { e.stopPropagation(); onChange(String(pt)); }}
                className="rounded-full transition-transform duration-200 active:scale-90"
                style={{ transform: ativo ? 'scale(1.25)' : 'none', padding: px(3) }}
              >
                <Rosto p={ativo ? i / 4 : temValor ? 0.5 : i / 4} tamanho={Math.round(46 * escala)} apagado={temValor && !ativo} />
              </button>
            );
          })}
        </div>
        {rotulos}
      </div>
    );
  }

  // slider clássico
  return (
    <div className="space-y-2 text-center">
      <div className="font-black text-amber-400" style={{ fontSize: px(36) }}>{v}{unidade}</div>
      {range()}
      {rotulos}
    </div>
  );
}
