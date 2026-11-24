import React from 'react';
import { User } from 'lucide-react';
import { corTextoHex, estiloBotao } from '../utils/estilos';
import { familiaCss } from '../utils/fontes';

// Textos da tela de acompanhantes. Campos: <prefixo>Tamanho, Familia, Cor, Bold, Italico, Caixa
const estiloTexto = (config, p) => ({
  fontSize: config[`${p}Tamanho`] ? `${config[`${p}Tamanho`]}px` : undefined,
  fontFamily: familiaCss(config[`${p}Familia`]),
  color: corTextoHex(config[`${p}Cor`]),
  fontWeight: config[`${p}Bold`] === undefined ? undefined : config[`${p}Bold`] ? 900 : 400,
  fontStyle: config[`${p}Italico`] ? 'italic' : undefined,
  textTransform: config[`${p}Caixa`] === undefined ? undefined : config[`${p}Caixa`] ? 'uppercase' : 'none'
});
const propria = (st) => (st.color ? 't-cor-propria' : '');

export const ESPACOS_ACOMP = { soeuAntesEspaco: 0, divisorAntesEspaco: 40, divisorDepoisEspaco: 44 };
export const espacoAcomp = (config, campo) => Number(config?.[campo] ?? ESPACOS_ACOMP[campo]);

export default function BotaoSoEu({ config, className = '', onClick }) {
  const ler = (k) => config[`soeu${k}`] ?? undefined;
  const st = estiloBotao(ler);
  const altura = ler('Altura');
  const largura = ler('Largura') ?? 100;
  const selo = altura ? Math.max(20, Math.min(56, altura - 16)) : null;
  // cor escolhida para o botão: ícone, número e textos acompanham
  const herdar = st.color ? { color: 'inherit' } : {};
  const estiloSelo = {
    ...herdar,
    ...(selo ? { width: selo, height: selo, padding: Math.round(selo / 6), fontSize: Math.round(selo * 0.42), borderRadius: Math.round(selo * 0.28), flex: 'none' } : {}),
    ...(st.background ? { background: 'rgba(0, 0, 0, .18)', borderColor: 'currentColor' } : {})
  };
  const titulo = estiloTexto(config, 'soeuTitulo');
  const compl = estiloTexto(config, 'soeuCompl');
  const complemento = config.opcaoIndividualSubtitulo ?? ', vim sozinho';
  // a base grossa escura é do botão original: com cor, borda ou efeito próprios ela sai
  const semBase = st.background || st.borderColor || st.boxShadow ? { borderBottomWidth: st.borderWidth ?? '1px' } : {};

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...semBase, ...st, ...(altura ? { minHeight: 0 } : {}), width: `${largura}%`, marginLeft: 'auto', marginRight: 'auto', marginTop: espacoAcomp(config, 'soeuAntesEspaco') }}
      className={`${className} t-avancar t-soeu p-5 sm:p-6 min-h-[96px] rounded-3xl border border-emerald-500/30 border-b-[6px] border-b-emerald-950 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 active:translate-y-1.5 active:border-b-2 active:shadow-md transition-all flex items-center justify-between shadow-xl shadow-emerald-950/60`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div style={estiloSelo} className="t-selo w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-emerald-200 p-2.5 shadow-inner">
          <User className="w-8 h-8 max-w-full max-h-full drop-shadow" />
        </div>
        <div className="text-left min-w-0">
          <h3 style={herdar} className="font-black text-2xl text-amber-300 drop-shadow-md flex items-baseline gap-1 flex-wrap leading-tight">
            <span className={propria(titulo)} style={titulo}>{config.opcaoIndividualTitulo || 'SÓ EU'}</span>
            {complemento && (
              <span className={`text-sm sm:text-base font-semibold text-white ${propria(compl)}`} style={{ ...herdar, ...compl, color: compl.color || herdar.color }}>
                {complemento}
              </span>
            )}
          </h3>
        </div>
      </div>
      <div style={estiloSelo} className="t-selo w-12 h-12 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 font-black text-2xl shadow-inner">
        1
      </div>
    </button>
  );
}

export function DivisorQtd({ config }) {
  const st = estiloTexto(config, 'divisorQtd');
  const texto = config.divisorQtdTexto ?? 'Quantas pessoas vieram com você?';
  return (
    <div className="relative flex items-center" style={{ marginTop: espacoAcomp(config, 'divisorAntesEspaco'), marginBottom: espacoAcomp(config, 'divisorDepoisEspaco') }}>
      <div className="flex-grow border-t border-slate-800/80" />
      {texto && (
        <span style={st} className="t-cor flex-shrink mx-3 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider text-center">
          {texto}
        </span>
      )}
      <div className="flex-grow border-t border-slate-800/80" />
    </div>
  );
}
