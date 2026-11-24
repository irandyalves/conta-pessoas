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


// Acabamentos. O fundo do formulário é quase preto, então o volume vem da LUZ (bordas e reflexos claros):
// sombra preta sozinha não aparece. `rgb` = cor do brilho.
export function getEfeitoStyle(efeito = 'padrao', profundidade = 5, rgb = '251, 191, 36') {
  const p = Math.max(1, Math.min(10, Number(profundidade) || 5));
  const r = (n) => Math.round(n * 10) / 10;

  switch (efeito) {
    case 'nenhum':
      return {};
    case 'efeito_3d':
      return {
        borderColor: 'rgba(255, 255, 255, 0.22)',
        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 ${r(1 + p * 0.7)}px 0 #3b4a63, 0 ${r(3 + p * 1.2)}px ${r(p * 1.8)}px rgba(0, 0, 0, 0.7)`
      };
    case 'entalhe':
      return {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: `inset 0 ${r(1 + p * 0.7)}px ${r(3 + p * 1.2)}px rgba(0, 0, 0, 0.95), inset 0 -1px 0 rgba(255, 255, 255, ${(0.1 + p * 0.02).toFixed(2)}), 0 1px 0 rgba(255, 255, 255, 0.16)`
      };
    case 'alto_relevo':
      return {
        borderColor: 'rgba(255, 255, 255, 0.14)',
        boxShadow: `inset 0 ${r(1 + p * 0.25)}px ${r(1 + p * 0.4)}px rgba(255, 255, 255, ${(0.16 + p * 0.024).toFixed(2)}), inset 0 -${r(1 + p * 0.4)}px ${r(2 + p * 0.8)}px rgba(0, 0, 0, 0.6), 0 ${r(1 + p * 0.5)}px ${r(2 + p)}px rgba(0, 0, 0, 0.7)`
      };
    case 'vidro':
      return {
        backdropFilter: `blur(${p * 2.5}px)`,
        WebkitBackdropFilter: `blur(${p * 2.5}px)`,
        borderColor: `rgba(255, 255, 255, ${(0.16 + p * 0.025).toFixed(2)})`,
        boxShadow: `inset 0 1px 1px rgba(255, 255, 255, ${(0.18 + p * 0.03).toFixed(2)}), inset 0 ${r(8 + p * 2)}px ${r(10 + p * 2)}px -${r(6 + p)}px rgba(255, 255, 255, ${(0.1 + p * 0.025).toFixed(2)}), 0 ${r(p)}px ${r(p * 2)}px rgba(0, 0, 0, 0.5)`
      };
    case 'glow':
      return {
        borderColor: `rgba(${rgb}, 0.7)`,
        boxShadow: `0 0 ${r(4 + p * 2.2)}px rgba(${rgb}, ${(0.25 + p * 0.04).toFixed(2)}), inset 0 0 ${r(p * 1.6)}px rgba(${rgb}, 0.18)`
      };
    case 'padrao':
    default:
      return {
        boxShadow: `0 ${p}px ${r(p * 1.5)}px rgba(0, 0, 0, 0.35)`
      };
  }
}

// Altura dos cards de opção. O mínimo real era 82px (ícone + margens fixas travavam o card);
// agora é 60% disso e o ícone e as margens encolhem junto. 49px ainda é confortável para o dedo.
export const CARD_ALTURA_MIN = 49;
export const CARD_ALTURA_MAX = 130;
export const alturaCard = (valor) => Math.max(CARD_ALTURA_MIN, Math.min(CARD_ALTURA_MAX, Number(valor) || 82));
export const CARD_ESPACO_PADRAO = 12;
export const CARD_RAIO_PADRAO = 16;
export const medidasCard = (valor, raio) => {
  const h = alturaCard(valor);
  const f = Math.max(0, Math.min(1, (h - CARD_ALTURA_MIN) / (82 - CARD_ALTURA_MIN)));
  const icone = Math.round(28 + 20 * f);
  const py = Math.round(4 + 12 * f);
  return {
    caixa: { borderRadius: `${Number(raio ?? CARD_RAIO_PADRAO)}px`, minHeight: `${h}px`, paddingTop: `${py}px`, paddingBottom: `${py}px` },
    icone: { width: `${icone}px`, height: `${icone}px` }
  };
};

// ==========================================
// TELA DE INÍCIO (CAPA): cada título é um card com espaço, altura e acabamento
// ==========================================
export const CAPA_ESPACO_PADRAO = 10;
const RGB_FUNDO = {
  escuro: '148, 163, 184', dourado: '251, 191, 36', verde: '16, 185, 129', azul: '14, 165, 233',
  roxo: '168, 85, 247', laranja: '249, 115, 22', rosa: '244, 63, 94'
};

export const linhasCapa = (cfg = {}) => {
  const ehCard = (cfg.capaFormato || 'card') === 'card';
  const efeito = cfg.capaEfeito || 'alto_relevo';
  const base = [
    { id: 'capaTitulo1', conteudo: cfg.capaTitulo1, tamanho: cfg.capaFonteTamanho || 18, cor: 'branco', fundo: cfg.capaCaptionFundo || 'transparente' },
    { id: 'capaTitulo2', conteudo: cfg.capaTitulo2, tamanho: 16, cor: 'dourado', fundo: 'transparente' },
    { id: 'capaTitulo3', conteudo: cfg.capaTitulo3, tamanho: 15, cor: 'verde', fundo: 'transparente' },
    { id: 'capaTextoAbaixo', conteudo: cfg.capaTextoAbaixo || cfg.pergunta1TextoAbaixo, tamanho: 14, cor: 'cinza', fundo: 'escuro', texto: true }
  ];

  return base.filter((l) => l.conteudo).map((l) => {
    const fundo = cfg[`${l.id}Fundo`] || l.fundo;
    const classes = getCaptionFundoClass(fundo);
    const pct = alturaFaixa(cfg[`${l.id}Altura`] ?? cfg.capaAltura);
    const aperto = Math.min(1, pct / 100); // abaixo de 100% as linhas do texto também se aproximam
    const cor = classes.split(' ').filter((c) => /^(bg-|border)/.test(c)).join(' ');
    return {
      id: l.id,
      conteudo: l.conteudo,
      texto: Boolean(l.texto),
      tamanho: Number(cfg[`${l.id}Tamanho`]) || l.tamanho,
      cor: cfg[`${l.id}Cor`] || l.cor,
      bold: cfg[`${l.id}Bold`],
      alinhamento: cfg[`${l.id}Alinhamento`] || cfg.capaAlinhamento || 'center',
      espaco: Number(cfg[`${l.id}Espaco`] ?? CAPA_ESPACO_PADRAO),
      entrelinha: l.texto ? Math.max(1.12, 1.6 * aperto) : Math.max(1.05, 1.25 * aperto),
      classeCaixa: !classes ? '' : ehCard ? `${cor} rounded-2xl` : `${cor} border-x-0 -mx-4 sm:-mx-6`,
      caixa: {
        ...faixaEstilo(fundo, pct),
        paddingLeft: classes ? 14 : 0,
        paddingRight: classes ? 14 : 0,
        ...(classes && ehCard ? getEfeitoStyle(efeito, cfg.capaProfundidade || 5, RGB_FUNDO[fundo]) : {})
      }
    };
  });
};

// Altura da faixa de fundo, em % (100 = altura original). 60% cola no texto; 300% é uma faixa bem alta.
export const FAIXA_MIN = 60;
export const FAIXA_MAX = 300;
export const alturaFaixa = (valor) => Math.max(FAIXA_MIN, Math.min(FAIXA_MAX, Number(valor) || 100));
export const faixaEstilo = (fundo, valor) => {
  if (!getCaptionFundoClass(fundo)) return {};
  const y = (alturaFaixa(valor) - FAIXA_MIN) * 0.15;
  return { paddingTop: y, paddingBottom: y };
};

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

// Peso da fonte: negrito ligado/desligado (undefined = padrão informado)
export const pesoFonte = (bold, padraoNegrito = true) => ((bold ?? padraoNegrito) ? 'font-black' : 'font-medium');

// Cor do botão MARCADO na grade/escala: menor nota vermelha → laranja → amarelo → azul → maior verde (com brilho).
// Colunas não numéricas (NA) ficam cinza.
const CORES_ESCALA = [
  'bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.75)]',
  'bg-orange-500 text-white border-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.75)]',
  'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.75)]',
  'bg-sky-500 text-white border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.75)]',
  'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
];
export const corGradeSelecionada = (col, cols = []) => {
  const numericas = cols.filter((c) => /^\d+([.,]\d+)?$/.test(String(c).trim()));
  const i = numericas.indexOf(col);
  if (i < 0) return 'bg-slate-500 text-white border-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.6)]';
  const pos = numericas.length <= 1 ? CORES_ESCALA.length - 1 : Math.round((i / (numericas.length - 1)) * (CORES_ESCALA.length - 1));
  return CORES_ESCALA[pos];
};

// ==========================================
// COPIAR / REPLICAR FORMATAÇÃO ENTRE TELAS
// A Tela 1 guarda os estilos com nomes "pergunta1..."; as telas extras com nomes próprios.
// ==========================================
const MAPA_P1 = {
  tituloTamanho: 'pergunta1FonteTamanho', tituloCor: 'pergunta1TituloCor', tituloBold: 'pergunta1TituloBold',
  tituloFaixa: 'pergunta1TituloFaixa', subFaixa: 'pergunta1SubFaixa',
  tituloAlinhamento: 'pergunta1TituloAlinhamento', tituloFundo: 'pergunta1TituloFundo',
  subTamanho: 'pergunta1TextoAbaixoTamanho', subCor: 'pergunta1TextoAbaixoCor', subBold: 'pergunta1SubBold',
  subAlinhamento: 'pergunta1SubAlinhamento', subFundo: 'pergunta1SubFundo',
  mostrarIcones: 'mostrarIconesCards',
  espacoTitulos: 'pergunta1EspacoTitulos', espacoSub: 'pergunta1EspacoSub', espacoCards: 'pergunta1EspacoCards'
};
const MAPA_EXTRA = {
  tituloTamanho: 'titulo1Tamanho', tituloCor: 'titulo1Cor', tituloBold: 'tituloBold',
  tituloFaixa: 'tituloFaixa', subFaixa: 'subFaixa',
  tituloAlinhamento: 'tituloAlinhamento', tituloFundo: 'tituloFundo',
  subTamanho: 'subtituloTamanho', subCor: 'subtituloCor', subBold: 'subBold',
  subAlinhamento: 'subAlinhamento', subFundo: 'subFundo',
  mostrarIcones: 'mostrarIcones',
  espacoTitulos: 'espacoTitulos', espacoSub: 'espacoSub', espacoCards: 'espacoCards'
};
// Campos com o mesmo nome nos dois lugares
const COMUNS = ['cardAltura', 'cardEspaco', 'cardRaio', 'cardsPorTela', 'cardFundoEstilo', 'cardEfeitoEstilo', 'cardProfundidade', 'cardCorFonteTitulo',
  'cardCorFonteSubtitulo', 'cardFonteTitulo', 'cardFonteSubtitulo', 'escalaTamanho', 'legendaCor', 'legendaBold', 'legendaFundo',
  'itemTamanho', 'itemCor', 'itemBold', 'itemFundo', 'legendaFaixa', 'itemFaixa'];

export function extrairEstilo(origem, ehP1) {
  const mapa = ehP1 ? MAPA_P1 : MAPA_EXTRA;
  const e = {};
  Object.entries(mapa).forEach(([k, campo]) => { if (origem?.[campo] !== undefined) e[k] = origem[campo]; });
  COMUNS.forEach((c) => { if (origem?.[c] !== undefined) e[c] = origem[c]; });
  return e;
}

export function aplicarEstilo(destino, estilo, ehP1) {
  const mapa = ehP1 ? MAPA_P1 : MAPA_EXTRA;
  const out = { ...destino };
  Object.entries(estilo || {}).forEach(([k, v]) => {
    if (v === undefined) return;
    if (mapa[k]) out[mapa[k]] = v;
    else if (COMUNS.includes(k)) out[k] = v;
  });
  return out;
}

// Páginas com várias perguntas: texto longo seguido de texto longo fica na mesma página por padrão;
// os outros tipos de campo só quando marcado "Continuar na mesma página".
export const TIPOS_CAMPO = ['texto', 'texto_curto', 'data', 'hora', 'slider', 'rating', 'dropdown', 'radio', 'checkbox', 'grade'];
export const continuaNaMesmaPagina = (anterior, atual) => {
  if (!anterior || !atual || !TIPOS_CAMPO.includes(anterior.tipo) || !TIPOS_CAMPO.includes(atual.tipo)) return false;
  if (atual.mesmaPagina === true) return true;
  if (atual.mesmaPagina === false) return false;
  return atual.tipo === 'texto' && anterior.tipo === 'texto';
};

// Espaços (px) entre as linhas de título, antes do subtítulo e antes dos cards/campo
export const espacos = (cfg = {}, ehP1 = false, escala = 1) => {
  const g = (n, padrao) => Math.round((Number(cfg[ehP1 ? 'pergunta1' + n : 'e' + n.slice(1)]) || (cfg[ehP1 ? 'pergunta1' + n : 'e' + n.slice(1)] === 0 ? 0 : padrao)) * escala);
  return { tit: g('EspacoTitulos', 4), sub: g('EspacoSub', 6), cards: g('EspacoCards', 12) };
};
