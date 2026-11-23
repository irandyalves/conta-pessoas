// ==========================================
// ESTILOS COMPARTILHADOS ENTRE O EDITOR (PREVIEW) E O CELULAR
// Fonte única: o que o admin vê no preview é o que o público vê.
// ==========================================

export const CORES_TEXTO_LINHAS = [
  { id: 'branco', label: 'Branco', bg: 'bg-white', textClass: 'text-white' },
  { id: 'dourado', label: 'Dourado', bg: 'bg-amber-400', textClass: 'text-amber-300' },
  { id: 'verde', label: 'Verde', bg: 'bg-emerald-400', textClass: 'text-emerald-400' },
  { id: 'azul', label: 'Azul', bg: 'bg-sky-400', textClass: 'text-sky-300' },
  { id: 'cinza', label: 'Cinza Claro', bg: 'bg-slate-300', textClass: 'text-slate-300' },
  { id: 'laranja', label: 'Laranja', bg: 'bg-orange-400', textClass: 'text-orange-300' },
  { id: 'roxo', label: 'Roxo', bg: 'bg-purple-400', textClass: 'text-purple-300' },
  { id: 'rosa', label: 'Rosa', bg: 'bg-rose-400', textClass: 'text-rose-300' }
];

export const getCorTextoLinhaClass = (corId, defaultClass = 'text-white') => {
  return CORES_TEXTO_LINHAS.find(c => c.id === corId)?.textClass || defaultClass;
};

export const ALINHAMENTOS_TEXTO = [
  { id: 'left', label: 'Esquerda', class: 'text-left' },
  { id: 'center', label: 'Centro', class: 'text-center' },
  { id: 'right', label: 'Direita', class: 'text-right' }
];

export const getAlinhamentoClass = (alignId = 'center') => {
  return ALINHAMENTOS_TEXTO.find(a => a.id === alignId)?.class || 'text-center';
};

export const FUNDOS_CAPTION = [
  { id: 'transparente', label: 'Sem Fundo', dot: 'bg-transparent border border-dashed border-slate-500', boxClass: '' },
  { id: 'escuro', label: 'Escuro', dot: 'bg-slate-900 border border-slate-700', boxClass: 'bg-slate-900/85 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'dourado', label: 'Dourado', dot: 'bg-amber-500', boxClass: 'bg-amber-500/15 border border-amber-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'verde', label: 'Verde', dot: 'bg-emerald-500', boxClass: 'bg-emerald-500/15 border border-emerald-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'azul', label: 'Azul', dot: 'bg-sky-500', boxClass: 'bg-sky-500/15 border border-sky-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'roxo', label: 'Roxo', dot: 'bg-purple-500', boxClass: 'bg-purple-500/15 border border-purple-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'laranja', label: 'Laranja', dot: 'bg-orange-500', boxClass: 'bg-orange-500/15 border border-orange-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' },
  { id: 'rosa', label: 'Rosa', dot: 'bg-rose-500', boxClass: 'bg-rose-500/15 border border-rose-500/35 rounded-xl px-2.5 py-1.5 shadow-sm' }
];

export const getCaptionFundoClass = (fundoId = 'transparente') => {
  return FUNDOS_CAPTION.find(f => f.id === fundoId)?.boxClass || '';
};

export const parseScaleLegendItems = (rawLegend = '') => {
  if (!rawLegend || !rawLegend.trim()) return [];
  const cleaned = rawLegend.replace(/^escala\s*:\s*/i, '').trim();
  const parts = cleaned.split(/\s*[;|]\s*/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return [{ code: '', label: cleaned }];
  return parts.map(p => {
    const m = p.match(/^([0-9A-Za-z/+-]{1,4})\s*[=:-]\s*(.+)$/);
    if (m) return { code: m[1].trim(), label: m[2].trim() };
    return { code: '', label: p };
  });
};


export function getEfeitoStyle(efeito = 'padrao', profundidade = 5) {
  const p = Math.max(1, Math.min(10, Number(profundidade) || 5));
  
  switch (efeito) {
    case 'efeito_3d':
      return {
        borderBottomWidth: `${p}px`,
        borderBottomColor: 'rgba(0, 0, 0, 0.95)',
        boxShadow: `0 ${p * 1.5}px ${p * 2.5}px rgba(0, 0, 0, 0.6)`,
      };
    case 'entalhe':
      return {
        boxShadow: `inset 0 ${p * 1.2}px ${p * 2}px rgba(0, 0, 0, 0.9), inset 0 -${Math.round(p * 0.5)}px ${p}px rgba(255, 255, 255, 0.08)`,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomColor: 'rgba(0, 0, 0, 0.9)',
      };
    case 'alto_relevo':
      return {
        boxShadow: `0 ${p * 1.5}px ${p * 2.5}px rgba(0, 0, 0, 0.7), inset 0 ${Math.max(1, Math.round(p * 0.4))}px ${Math.max(1, Math.round(p * 0.4))}px rgba(255, 255, 255, 0.25), inset 0 -${Math.max(1, Math.round(p * 0.4))}px ${Math.max(1, Math.round(p * 0.4))}px rgba(0, 0, 0, 0.6)`,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomColor: 'rgba(0, 0, 0, 0.8)',
      };
    case 'vidro':
      return {
        backdropFilter: `blur(${p * 2.5}px)`,
        WebkitBackdropFilter: `blur(${p * 2.5}px)`,
        boxShadow: `0 ${p * 1.2}px ${p * 2.5}px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, ${0.1 + p * 0.02})`,
        borderColor: `rgba(255, 255, 255, ${0.15 + p * 0.025})`,
      };
    case 'glow':
      return {
        boxShadow: `0 0 ${p * 2.5}px rgba(245, 158, 11, ${0.2 + p * 0.04}), inset 0 0 ${p * 1.2}px rgba(245, 158, 11, 0.15)`,
        borderColor: 'rgba(251, 191, 36, 0.6)',
      };
    case 'padrao':
    default:
      return {
        boxShadow: `0 ${p}px ${p * 1.5}px rgba(0, 0, 0, 0.35)`,
      };
  }
}

// Faixa de fundo "de fora a fora" para UMA linha de texto (título OU subtítulo).
// sangria = classes de margem negativa iguais ao padding do container (ex.: '-mx-2.5 px-2.5').
export const getFaixaFundoClass = (fundoId = 'transparente', sangria = '') => {
  const f = FUNDOS_CAPTION.find((x) => x.id === fundoId);
  if (!f || !f.boxClass) return '';
  const base = f.boxClass.replace(/rounded-\S+/g, '').replace(/px-\S+/g, '');
  return `${base} border-x-0 rounded-none py-1.5 ${sangria}`;
};

// Estilo efetivo do título e do subtítulo (campos novos com fallback nos antigos, que valiam para os dois)
export const estiloLinhas = (cfg = {}, prefixo = '') => {
  const k = (n) => (prefixo ? prefixo + n.charAt(0).toUpperCase() + n.slice(1) : n);
  const alGeral = cfg[k('alinhamento')] || 'center';
  const fundoGeral = cfg[k('captionFundo')] || 'transparente';
  return {
    tituloAl: cfg[k('tituloAlinhamento')] || alGeral,
    tituloFundo: cfg[k('tituloFundo')] || fundoGeral,
    subAl: cfg[k('subAlinhamento')] || alGeral,
    subFundo: cfg[k('subFundo')] || 'transparente'
  };
};
