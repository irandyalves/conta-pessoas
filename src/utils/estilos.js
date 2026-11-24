// ==========================================
// ESTILOS COMPARTILHADOS ENTRE O EDITOR (PREVIEW) E O CELULAR
// Fonte única: o que o admin vê no preview é o que o público vê.
// ==========================================

import { familiaCss } from './fontes';

export const CORES_TEXTO_LINHAS = [
  { id: 'tema', label: 'Do layout', bg: 'amostra-tema', textClass: 't-cor' },
  { id: 'branco', label: 'Branco', bg: 'bg-white', textClass: 'text-white' },
  { id: 'dourado', label: 'Dourado', bg: 'bg-amber-400', textClass: 'text-amber-300' },
  { id: 'verde', label: 'Verde', bg: 'bg-emerald-400', textClass: 'text-emerald-400' },
  { id: 'azul', label: 'Azul', bg: 'bg-sky-400', textClass: 'text-sky-300' },
  { id: 'cinza', label: 'Cinza Claro', bg: 'bg-slate-300', textClass: 'text-slate-300' },
  { id: 'laranja', label: 'Laranja', bg: 'bg-orange-400', textClass: 'text-orange-300' },
  { id: 'roxo', label: 'Roxo', bg: 'bg-purple-400', textClass: 'text-purple-300' },
  { id: 'rosa', label: 'Rosa', bg: 'bg-rose-400', textClass: 'text-rose-300' },
  { id: 'vermelho', label: 'Vermelho', bg: 'bg-red-500', textClass: 'text-red-500' },
  { id: 'preto', label: 'Preto', bg: 'bg-slate-950 border border-slate-500', textClass: 'text-slate-950' }
];
const HEX_TEXTO = { branco: '#ffffff', dourado: '#fcd34d', verde: '#34d399', azul: '#7dd3fc', cinza: '#cbd5e1', laranja: '#fdba74', roxo: '#d8b4fe', rosa: '#fda4af', vermelho: '#ef4444', preto: '#020617' };
// Cor escolhida pelo usuário (vence a cor do layout); "Do layout" = undefined
export const corTextoHex = (id) => HEX_TEXTO[id];

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
  { id: 'tema', label: 'Do layout', dot: 'amostra-tema', boxClass: 't-faixa' },
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
    case 'tema': // o acabamento vem do layout (temas.css)
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

// ==========================================
// BOTÕES (números da grade e Avançar): cor, linha, efeito e profundidade
// Campos: <prefixo>Efeito, Profundidade, Cor, CorTexto, Linha, LinhaEspessura, Altura, Raio
// ==========================================
export const CORES_BOTAO = [
  { id: 'padrao', label: 'Original', hex: 'conic-gradient(#0f172a 0 50%, #fbbf24 50% 100%)' },
  { id: 'transparente', label: 'Sem cor', hex: 'transparent', dot: 'border border-dashed border-slate-400' },
  { id: 'noite', label: 'Noite', hex: '#0f172a', dot: 'border border-slate-600' },
  { id: 'grafite', label: 'Grafite', hex: '#475569' },
  { id: 'branco', label: 'Branco', hex: '#f1f5f9' },
  { id: 'dourado', label: 'Dourado', hex: '#fbbf24' },
  { id: 'laranja', label: 'Laranja', hex: '#c2410c' },
  { id: 'vermelho', label: 'Vermelho', hex: '#991b1b' },
  { id: 'rosa', label: 'Rosa', hex: '#be185d' },
  { id: 'roxo', label: 'Roxo', hex: '#6d28d9' },
  { id: 'azul', label: 'Azul', hex: '#1d4ed8' },
  { id: 'ciano', label: 'Turquesa', hex: '#0f766e' },
  { id: 'verde', label: 'Verde', hex: '#047857' }
];
export const CORES_LINHA = [
  { id: 'padrao', label: 'Original', hex: 'conic-gradient(#334155 0 50%, #fbbf24 50% 100%)' },
  { id: 'transparente', label: 'Sem linha', hex: 'transparent', dot: 'border border-dashed border-slate-400' },
  { id: 'cinza', label: 'Cinza', hex: '#64748b' },
  { id: 'branco', label: 'Branco', hex: '#ffffff' },
  { id: 'preto', label: 'Preto', hex: '#020617', dot: 'border border-slate-600' },
  { id: 'dourado', label: 'Dourado', hex: '#fbbf24' },
  { id: 'laranja', label: 'Laranja', hex: '#fb923c' },
  { id: 'vermelho', label: 'Vermelho', hex: '#f87171' },
  { id: 'rosa', label: 'Rosa', hex: '#f472b6' },
  { id: 'roxo', label: 'Roxo', hex: '#c084fc' },
  { id: 'azul', label: 'Azul', hex: '#38bdf8' },
  { id: 'verde', label: 'Verde', hex: '#34d399' }
];
export const CORES_TEXTO_BOTAO = CORES_LINHA.filter((c) => c.id !== 'transparente');
const hexDe = (lista, id) => (id && id !== 'padrao' ? lista.find((c) => c.id === id)?.hex : undefined);
const rgbDe = (hex) => (/^#[0-9a-f]{6}$/i.test(hex || '') ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ') : undefined);

export const corLinhaHex = (id) => hexDe(CORES_LINHA, id);
// Borda que vai afinando e some em um lado (o desenho fica em index.css, no ::before de quem tem --borda-cor)
export const LADOS_BORDA = [
  { id: 'inteira', label: 'Borda inteira' },
  { id: 'baixo', label: 'Some para baixo', dir: 'to bottom' },
  { id: 'cima', label: 'Some para cima', dir: 'to top' },
  { id: 'direita', label: 'Some para a direita', dir: 'to right' },
  { id: 'esquerda', label: 'Some para a esquerda', dir: 'to left' }
];
export const bordaQueSome = (lado, cor, largura = 1, faixa = false) => {
  const dir = LADOS_BORDA.find((l) => l.id === lado)?.dir;
  const w = Number(largura);
  if (!dir || cor === 'transparent' || !(w > 0)) return null;
  const fino = Math.max(0.6, w * 0.55);
  const vertical = lado === 'baixo' || lado === 'cima';
  const lados = {
    cima: lado === 'cima' ? 0 : vertical ? w : fino,
    baixo: lado === 'baixo' ? 0 : vertical ? w : fino,
    esquerda: faixa || lado === 'esquerda' ? 0 : vertical ? fino : w,
    direita: faixa || lado === 'direita' ? 0 : vertical ? fino : w
  };
  if (faixa && !vertical) { lados.cima = w; lados.baixo = w; }
  return {
    borderColor: 'transparent',
    '--borda-cor': cor || 'rgba(255, 255, 255, .7)',
    '--borda-dir': dir,
    '--borda-fora': faixa ? `-${w}px 0` : `-${w}px`,
    '--borda-p': `${lados.cima}px ${lados.direita}px ${lados.baixo}px ${lados.esquerda}px`
  };
};
// Fonte e borda de um título, subtítulo ou card. Campos: <prefixo>Familia, Borda, BordaLargura, BordaLado.
// faixa = fundo de ponta a ponta (borda só em cima e embaixo)
export const fonteEBorda = (obj, prefixo, temFundo = true, faixa = true) => {
  const st = {};
  const familia = familiaCss(obj?.[`${prefixo}Familia`]);
  if (familia) st.fontFamily = familia;
  if (obj?.[`${prefixo}Italico`]) st.fontStyle = 'italic';
  const cor = hexDe(CORES_LINHA, obj?.[`${prefixo}Borda`]);
  const largura = obj?.[`${prefixo}BordaLargura`];
  const some = temFundo ? bordaQueSome(obj?.[`${prefixo}BordaLado`], cor, largura ?? 1, faixa) : null;
  if (temFundo && (cor || largura != null || some)) {
    const w = `${largura ?? 1}px`;
    st.borderStyle = 'solid';
    if (faixa) Object.assign(st, { borderTopWidth: w, borderBottomWidth: w, borderLeftWidth: 0, borderRightWidth: 0 });
    else st.borderWidth = w;
    if (cor) st.borderColor = cor;
    if (some) Object.assign(st, some, { backgroundOrigin: 'border-box' });
  }
  return st;
};
// ler = (campo) => valor. soForma: botão já marcado/vermelho mantém a própria cor e só muda o formato.
export const estiloBotao = (ler, soForma = false) => {
  const efeito = ler('Efeito');
  const cor = hexDe(CORES_BOTAO, ler('Cor'));
  const linha = hexDe(CORES_LINHA, ler('Linha'));
  const texto = hexDe(CORES_TEXTO_BOTAO, ler('CorTexto'));
  const usaEfeito = efeito && efeito !== 'nenhum';
  const { borderColor, ...fx } = usaEfeito ? getEfeitoStyle(efeito, ler('Profundidade') || 5, rgbDe(linha) || rgbDe(cor)) : {};
  const st = {};
  if (ler('LinhaEspessura') != null) st.borderWidth = `${ler('LinhaEspessura')}px`;
  if (ler('Raio') != null) st.borderRadius = `${ler('Raio')}px`;
  if (familiaCss(ler('Familia'))) st.fontFamily = familiaCss(ler('Familia'));
  if (ler('Italico')) st.fontStyle = 'italic';
  if (ler('Fonte') != null) st.fontSize = `${ler('Fonte')}px`;
  if (ler('Altura') != null) Object.assign(st, { height: `${ler('Altura')}px`, paddingTop: 0, paddingBottom: 0 });
  if (soForma) return st;
  Object.assign(st, fx);
  if (cor) st.background = efeito === 'vidro' && cor.startsWith('#') ? `${cor}99` : cor;
  else if (efeito === 'vidro') st.opacity = 0.95;
  if (linha || borderColor) st.borderColor = linha || borderColor;
  if (texto) st.color = texto;
  const some = bordaQueSome(ler('LinhaLado'), linha || borderColor, ler('LinhaEspessura') ?? 1);
  if (some) Object.assign(st, some, { borderWidth: `${ler('LinhaEspessura') ?? 1}px`, borderStyle: 'solid' });
  return st;
};

// Altura dos cards de opção. O mínimo real era 82px (ícone + margens fixas travavam o card);
// agora é 60% disso e o ícone e as margens encolhem junto. 49px ainda é confortável para o dedo.
export const CARD_ALTURA_MIN = 49;
export const CARD_ALTURA_MAX = 130;
export const alturaCard = (valor) => Math.max(CARD_ALTURA_MIN, Math.min(CARD_ALTURA_MAX, Number(valor) || 82));
export const CARD_ESPACO_PADRAO = 12;
export const CARD_RAIO_PADRAO = 16;
// Cantos da esquerda e da direita: valem para todas as perguntas do evento
// (página que não herda usa os próprios cantos)
export const raiosCard = (cfg = {}, tela = {}) => {
  const antigo = tela?.cardRaio ?? cfg?.cardRaio ?? CARD_RAIO_PADRAO;
  const proprio = tela?.herdarEstilo === false ? tela : {};
  return {
    esq: Number(proprio.cardRaioEsq ?? cfg?.cardRaioEsq ?? antigo),
    dir: Number(proprio.cardRaioDir ?? cfg?.cardRaioDir ?? antigo)
  };
};
// A Tela 1 guarda seus cantos próprios com outro nome (os nomes comuns são os de todas as páginas)
export const telaP1Cantos = (cfg = {}) => ({ herdarEstilo: cfg?.herdarEstiloP1, cardRaioEsq: cfg?.p1RaioEsq, cardRaioDir: cfg?.p1RaioDir });
export const cantosCard = (cfg, tela) => {
  const { esq, dir } = raiosCard(cfg, tela);
  return `${esq}px ${dir}px ${dir}px ${esq}px`;
};
export const medidasCard = (valor, cantos) => {
  const h = alturaCard(valor);
  const f = Math.max(0, Math.min(1, (h - CARD_ALTURA_MIN) / (82 - CARD_ALTURA_MIN)));
  const icone = Math.round(28 + 20 * f);
  const py = Math.round(4 + 12 * f);
  return {
    caixa: { borderRadius: cantos, minHeight: `${h}px`, paddingTop: `${py}px`, paddingBottom: `${py}px` },
    icone: { width: `${icone}px`, height: `${icone}px` }
  };
};

// ==========================================
// TELA DE INÍCIO (CAPA): cada título é um card com espaço, altura e acabamento
// ==========================================
export const CAPA_ESPACO_PADRAO = 10;
export const CAPA_LARGURA_MIN = 40;
// Sem escolha do usuário, o canto é o do layout (a antiga "faixa" vira card de canto reto)
export const raioCapa = (cfg = {}) => cfg.capaRaio ?? (cfg.capaFormato === 'faixa' ? 0 : null);
const RGB_FUNDO = {
  escuro: '148, 163, 184', dourado: '251, 191, 36', verde: '16, 185, 129', azul: '14, 165, 233',
  roxo: '168, 85, 247', laranja: '249, 115, 22', rosa: '244, 63, 94'
};

// Textos da capa: até 6 títulos e o texto, na ordem que o usuário arrastar
export const LINHAS_CAPA = [
  { id: 'capaTitulo1', rotulo: 'Título 1', tamanho: 18, min: 12, max: 36, cor: 'branco' },
  { id: 'capaTitulo2', rotulo: 'Título 2', tamanho: 16, min: 10, max: 32, cor: 'dourado' },
  { id: 'capaTitulo3', rotulo: 'Título 3', tamanho: 15, min: 10, max: 30, cor: 'verde' },
  { id: 'capaTitulo4', rotulo: 'Título 4', tamanho: 15, min: 10, max: 30, cor: 'branco' },
  { id: 'capaTitulo5', rotulo: 'Título 5', tamanho: 15, min: 10, max: 30, cor: 'branco' },
  { id: 'capaTitulo6', rotulo: 'Título 6', tamanho: 15, min: 10, max: 30, cor: 'branco' },
  { id: 'capaTextoAbaixo', rotulo: 'Texto abaixo', tamanho: 14, min: 9, max: 26, cor: 'cinza', fundo: 'escuro', texto: true }
];
export const ordemCapa = (cfg = {}) => {
  const ids = LINHAS_CAPA.map((l) => l.id);
  const salva = (Array.isArray(cfg.capaOrdem) ? cfg.capaOrdem : []).filter((id, i, l) => ids.includes(id) && l.indexOf(id) === i);
  return [...salva, ...ids.filter((id) => !salva.includes(id))];
};
// visiveis = ids que estão na tela, já na ordem nova; os que não aparecem guardam o lugar deles
export const reordenar = (ordem, visiveis) => {
  const fila = [...visiveis];
  return ordem.map((id) => (visiveis.includes(id) ? fila.shift() : id));
};
// Troca de lugar o CONTEÚDO de linhas numeradas (título 1, 2, 3): cada texto leva o tamanho e a cor.
// linhas = { chave: { campo: valorAtual } } na ordem dos lugares; campos na mesma posição trocam entre si.
export const permutar = (linhas, novaOrdem) => {
  const lugares = Object.keys(linhas).filter((k) => novaOrdem.includes(k));
  const out = {};
  lugares.forEach((lugar, i) => {
    const destino = Object.keys(linhas[lugar]);
    const valores = Object.values(linhas[novaOrdem[i]]);
    destino.forEach((campo, k) => { out[campo] = valores[k]; });
  });
  return out;
};

// Sem texto próprio, a capa usa o da Tela 1; capaSemTexto = o usuário apagou (não mexe no da Tela 1)
export const textoCapa = (cfg = {}) => (cfg.capaSemTexto ? '' : cfg.capaTextoAbaixo || cfg.pergunta1TextoAbaixo || '');

export const linhasCapa = (cfg = {}) => {
  const largura = Math.max(CAPA_LARGURA_MIN, Math.min(100, Number(cfg.capaLargura) || 100));
  const efeito = cfg.capaEfeito || 'alto_relevo';
  const base = ordemCapa(cfg).map((id) => {
    const l = LINHAS_CAPA.find((x) => x.id === id);
    const primeiro = id === 'capaTitulo1';
    return {
      id,
      conteudo: l.texto ? textoCapa(cfg) : cfg[id],
      tamanho: primeiro ? cfg.capaFonteTamanho || 18 : l.tamanho,
      cor: l.cor,
      fundo: l.fundo || (primeiro && cfg.capaCaptionFundo) || 'transparente',
      texto: l.texto
    };
  });

  return base.filter((l) => l.conteudo).map((l) => {
    const fundo = cfg[`${l.id}Fundo`] || l.fundo;
    const classes = getCaptionFundoClass(fundo);
    const pct = alturaFaixa(cfg[`${l.id}Altura`] ?? cfg.capaAltura ?? cfg.faixaPadrao);
    const aperto = Math.min(1, pct / 100); // abaixo de 100% as linhas do texto também se aproximam
    const cor = classes.split(' ').filter((c) => /^(bg-|border|t-)/.test(c)).join(' ');
    return {
      id: l.id,
      conteudo: l.conteudo,
      texto: Boolean(l.texto),
      tamanho: Number(cfg[`${l.id}Tamanho`]) || l.tamanho,
      cor: cfg[`${l.id}Cor`] || l.cor,
      bold: cfg[`${l.id}Bold`],
      maiusculas: cfg[`${l.id}Caixa`] === true,
      alinhamento: cfg[`${l.id}Alinhamento`] || cfg.capaAlinhamento || 'center',
      espaco: Number(cfg[`${l.id}Espaco`] ?? CAPA_ESPACO_PADRAO),
      entrelinha: l.texto ? Math.max(1.12, 1.6 * aperto) : Math.max(1.05, 1.25 * aperto),
      classeCaixa: !classes ? '' : `${cor} rounded-2xl`,
      caixa: {
        ...faixaEstilo(fundo, pct),
        paddingLeft: classes ? 14 : 0,
        paddingRight: classes ? 14 : 0,
        ...(classes ? getEfeitoStyle(efeito, cfg.capaProfundidade || 5, RGB_FUNDO[fundo]) : {}),
        ...(classes && largura < 100 ? { width: `${largura}%`, alignSelf: { left: 'flex-start', right: 'flex-end' }[cfg[`${l.id}Alinhamento`] || cfg.capaAlinhamento] || 'center' } : {}),
        ...(classes && raioCapa(cfg) !== null ? { borderRadius: `${raioCapa(cfg)}px` } : {}),
        ...fonteEBorda(cfg, l.id, Boolean(classes), false)
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

// CAIXA ALTA ligada/desligada
export const caixaAlta = (ligada) => (ligada ? 'uppercase' : '');
// Peso da fonte: negrito ligado/desligado (undefined = padrão informado)
export const pesoFonte = (bold, padraoNegrito = true) => ((bold ?? padraoNegrito) ? 'font-black' : 'font-medium');

// Cor do botão MARCADO na grade/escala: menor nota vermelha → laranja → amarelo → azul → maior verde (com brilho).
// Colunas não numéricas (NA) ficam cinza.
const CORES_ESCALA = ['nota-viva nota-1', 'nota-viva nota-2', 'nota-viva nota-3', 'nota-viva nota-4', 'nota-viva nota-5']; // cores e brilho em index.css
export const corGradeSelecionada = (col, cols = []) => {
  const numericas = cols.filter((c) => /^\d+([.,]\d+)?$/.test(String(c).trim()));
  const i = numericas.indexOf(col);
  if (i < 0) return 'nota-viva nota-na';
  const pos = numericas.length <= 1 ? CORES_ESCALA.length - 1 : Math.round((i / (numericas.length - 1)) * (CORES_ESCALA.length - 1));
  return CORES_ESCALA[pos];
};

// ==========================================
// COPIAR / REPLICAR FORMATAÇÃO ENTRE TELAS
// A Tela 1 guarda os estilos com nomes "pergunta1..."; as telas extras com nomes próprios.
// ==========================================
const MAPA_P1 = {
  tituloTamanho: 'pergunta1FonteTamanho', tituloCor: 'pergunta1TituloCor', tituloBold: 'pergunta1TituloBold',
  tituloFaixa: 'pergunta1TituloFaixa', subFaixa: 'pergunta1SubFaixa', tituloCaixa: 'pergunta1TituloCaixa', tituloFamilia: 'pergunta1TituloFamilia', tituloBorda: 'pergunta1TituloBorda', tituloBordaLargura: 'pergunta1TituloBordaLargura', tituloBordaLado: 'pergunta1TituloBordaLado', subBordaLado: 'pergunta1SubBordaLado', subFamilia: 'pergunta1SubFamilia', subBorda: 'pergunta1SubBorda', subBordaLargura: 'pergunta1SubBordaLargura', subCaixa: 'pergunta1SubCaixa', tituloItalico: 'pergunta1TituloItalico', subItalico: 'pergunta1SubItalico',
  tituloAlinhamento: 'pergunta1TituloAlinhamento', tituloFundo: 'pergunta1TituloFundo',
  subTamanho: 'pergunta1TextoAbaixoTamanho', subCor: 'pergunta1TextoAbaixoCor', subBold: 'pergunta1SubBold',
  subAlinhamento: 'pergunta1SubAlinhamento', subFundo: 'pergunta1SubFundo',
  mostrarIcones: 'mostrarIconesCards',
  espacoTitulos: 'pergunta1EspacoTitulos', espacoSub: 'pergunta1EspacoSub', espacoCards: 'pergunta1EspacoCards'
};
const MAPA_EXTRA = {
  tituloTamanho: 'titulo1Tamanho', tituloCor: 'titulo1Cor', tituloBold: 'tituloBold',
  tituloFaixa: 'tituloFaixa', subFaixa: 'subFaixa', tituloCaixa: 'tituloCaixa', tituloFamilia: 'tituloFamilia', tituloBorda: 'tituloBorda', tituloBordaLargura: 'tituloBordaLargura', tituloBordaLado: 'tituloBordaLado', subBordaLado: 'subBordaLado', subFamilia: 'subFamilia', subBorda: 'subBorda', subBordaLargura: 'subBordaLargura', subCaixa: 'subCaixa', tituloItalico: 'tituloItalico', subItalico: 'subItalico',
  tituloAlinhamento: 'tituloAlinhamento', tituloFundo: 'tituloFundo',
  subTamanho: 'subtituloTamanho', subCor: 'subtituloCor', subBold: 'subBold',
  subAlinhamento: 'subAlinhamento', subFundo: 'subFundo',
  mostrarIcones: 'mostrarIcones',
  espacoTitulos: 'espacoTitulos', espacoSub: 'espacoSub', espacoCards: 'espacoCards'
};
// Campos com o mesmo nome nos dois lugares
const COMUNS = ['cardBordaLado', 'legendaBordaLado', 'itemBordaLado', 'instrucaoBordaLado', 'gradeLinhaLado', 'cardItalico', 'gradeItalico', 'legendaItalico', 'itemItalico', 'instrucaoItalico', 'cardFamilia', 'cardBorda', 'cardBordaLargura', 'gradeFamilia', 'legendaFamilia', 'legendaBorda', 'legendaBordaLargura', 'itemFamilia', 'itemBorda', 'itemBordaLargura', 'gradeFormato', 'gradeEfeito', 'gradeProfundidade', 'gradeCor', 'gradeCorTexto', 'gradeLinha', 'gradeLinhaEspessura', 'gradeAltura', 'gradeRaio', 'cardAltura', 'cardEspaco', 'cardRaio', 'cardsPorTela', 'cardFundoEstilo', 'cardEfeitoEstilo', 'cardProfundidade', 'cardCorFonteTitulo',
  'cardCorFonteSubtitulo', 'cardFonteTitulo', 'cardFonteSubtitulo', 'escalaTamanho', 'legendaCor', 'legendaBold', 'legendaFundo', 'legendaAlinhamento', 'legendaColunas', 'legendaIcones', 'instrucaoTamanho', 'instrucaoCor', 'instrucaoBold', 'instrucaoCaixa', 'instrucaoFamilia', 'instrucaoBorda', 'instrucaoBordaLargura', 'instrucaoAlinhamento', 'instrucaoFundo', 'instrucaoAltura', 'instrucaoEspaco', 'instrucaoPosicao',
  'itemTamanho', 'itemCor', 'itemBold', 'itemFundo', 'legendaFaixa', 'itemFaixa', 'legendaCaixa', 'itemCaixa'];

export const soComuns = (estilo = {}) => Object.fromEntries(Object.entries(estilo).filter(([k]) => COMUNS.includes(k)));

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

// ==========================================
// HERANÇA: mexeu nos cards ou botões de uma página, muda em todas
// (menos nas páginas em que "Herdar configurações" foi desligado)
// origem = 'p1' (Tela 1) ou o índice em telasExtras
// ==========================================
const PADROES_HERDADOS = {
  cardAltura: 82, cardEspaco: CARD_ESPACO_PADRAO, cardsPorTela: 4, cardFundoEstilo: 'escuro', cardEfeitoEstilo: 'padrao',
  cardProfundidade: 5, cardCorFonteTitulo: 'branco', cardCorFonteSubtitulo: 'cinza', cardFonteTitulo: 16, cardFonteSubtitulo: 12,
  cardFamilia: 'padrao', cardItalico: false, gradeItalico: false, cardBorda: 'padrao', cardBordaLargura: null, cardBordaLado: 'inteira', gradeFamilia: 'padrao',
  mostrarIcones: true, tituloFaixa: 100, subFaixa: 100,
  gradeEfeito: 'nenhum', gradeProfundidade: 5, gradeCor: 'padrao', gradeCorTexto: 'padrao', gradeLinha: 'padrao',
  gradeLinhaEspessura: 1, gradeLinhaLado: 'inteira', gradeAltura: 38, gradeRaio: 12, gradeFormato: 'numeros'
};
const CANTOS = { cardRaioEsq: 'p1RaioEsq', cardRaioDir: 'p1RaioDir' };
const NOMES_P1 = { mostrarIcones: 'mostrarIconesCards', tituloFaixa: 'pergunta1TituloFaixa', subFaixa: 'pergunta1SubFaixa' };
const noP1 = (campo) => NOMES_P1[campo] || campo;
const ehFaixa = (campo) => campo === 'tituloFaixa' || campo === 'subFaixa';
// Avançar e setas são de todas as páginas; a página que não herda guarda uma cópia própria
const camposGerais = (cfg) => Object.fromEntries(Object.entries(cfg).filter(([k]) => /^(avancar|seta)[A-Z]/.test(k) || k === 'tema'));
export const lerGeral = (cfg, tela, prefixo) => (k) =>
  (tela?.herdarEstilo === false ? tela[`${prefixo}${k}`] : undefined) ?? cfg?.[`${prefixo}${k}`];

// Altura padrão dos fundos dos títulos: muda em todas as páginas que herdam (e no Início)
export const gravarFaixaPadrao = (cfg, valor) => {
  const out = {
    ...cfg,
    faixaPadrao: valor,
    telasExtras: (cfg.telasExtras || []).map((t) => (t?.herdarEstilo === false ? t : { ...t, tituloFaixa: valor, subFaixa: valor }))
  };
  LINHAS_CAPA.forEach(({ id }) => { out[`${id}Altura`] = valor; });
  if (cfg.herdarEstiloP1 !== false) { out.pergunta1TituloFaixa = valor; out.pergunta1SubFaixa = valor; }
  return out;
};
const lerHerdado = (cfg, origem, campo) =>
  (origem === 'p1' ? cfg[noP1(campo)] : cfg.telasExtras?.[origem]?.[campo] ?? (ehFaixa(campo) ? cfg.faixaPadrao : cfg[noP1(campo)]))
    ?? (ehFaixa(campo) ? cfg.faixaPadrao : undefined) ?? PADROES_HERDADOS[campo];
export const herdaEstilo = (cfg, origem) => (origem === 'p1' ? cfg.herdarEstiloP1 : cfg.telasExtras?.[origem]?.herdarEstilo) !== false;
export const semCamposHerdados = (estilo = {}) =>
  Object.fromEntries(Object.entries(estilo).filter(([k]) => !(k in PADROES_HERDADOS) && k !== 'cardRaio'));

const trocarTela = (cfg, i, mudancas) => ({ ...cfg, telasExtras: (cfg.telasExtras || []).map((t, k) => (k === i ? { ...t, ...mudancas } : t)) });

export const gravarHerdado = (cfg, origem, campo, valor) => {
  const herda = herdaEstilo(cfg, origem);
  if (CANTOS[campo]) {
    if (herda) return { ...cfg, [campo]: valor };
    return origem === 'p1' ? { ...cfg, [CANTOS[campo]]: valor } : trocarTela(cfg, origem, { [campo]: valor });
  }
  if (!herda) return origem === 'p1' ? { ...cfg, [noP1(campo)]: valor } : trocarTela(cfg, origem, { [campo]: valor });
  const out = { ...cfg, telasExtras: (cfg.telasExtras || []).map((t) => (t?.herdarEstilo === false ? t : { ...t, [campo]: valor })) };
  if (herdaEstilo(cfg, 'p1') || campo.startsWith('grade')) out[noP1(campo)] = valor;
  return out;
};

export const ligarHeranca = (cfg, origem, ligar) => {
  const campos = Object.keys(PADROES_HERDADOS);
  if (!ligar) {
    // Congela a aparência atual: a página passa a ter configurações próprias
    if (origem === 'p1') {
      const { esq, dir } = raiosCard(cfg);
      return {
        ...cfg,
        herdarEstiloP1: false,
        p1RaioEsq: esq,
        p1RaioDir: dir,
        telasExtras: (cfg.telasExtras || []).map((t, i) => ({
          ...t,
          ...Object.fromEntries(campos.filter((k) => t[k] === undefined).map((k) => [k, lerHerdado(cfg, i, k)]))
        }))
      };
    }
    const { esq, dir } = raiosCard(cfg, cfg.telasExtras[origem]);
    return trocarTela(cfg, origem, {
      ...Object.fromEntries(campos.map((k) => [k, lerHerdado(cfg, origem, k)])),
      ...camposGerais(cfg),
      cardRaioEsq: esq,
      cardRaioDir: dir,
      herdarEstilo: false
    });
  }
  // Volta a seguir as outras: copia de uma página que herda
  const herdeiras = (cfg.telasExtras || []).map((t, i) => ({ t, i })).filter(({ t, i }) => i !== origem && t?.herdarEstilo !== false);
  const fonteTela = (herdeiras.find(({ t }) => (t.tipo || 'cards') === 'cards') || herdeiras[0])?.i;
  const fonte = origem !== 'p1' && herdaEstilo(cfg, 'p1') ? 'p1' : fonteTela;
  const copia = fonte === undefined ? {} : Object.fromEntries(campos.map((k) => [k, lerHerdado(cfg, fonte, k)]));
  // os botões da grade não são da Tela 1: vêm de outra página
  if (fonte === 'p1' && fonteTela !== undefined) campos.filter((k) => k.startsWith('grade')).forEach((k) => { copia[k] = lerHerdado(cfg, fonteTela, k); });
  if (origem === 'p1') {
    return { ...cfg, ...Object.fromEntries(Object.entries(copia).filter(([k]) => !k.startsWith('grade')).map(([k, v]) => [noP1(k), v])), herdarEstiloP1: true };
  }
  return trocarTela(cfg, origem, { ...copia, herdarEstilo: true });
};

// "7. Seção — Pergunta" => { numero: '7', secao: 'Seção', questao: 'Pergunta' }
export const partesTitulo = (texto = '') => {
  const m = /^\s*(\d{1,3})[.)]\s+([\s\S]+)$/.exec(texto);
  const corpo = m ? m[2] : texto;
  const corte = corpo.indexOf(' — ');
  return {
    numero: m ? m[1] : '',
    secao: corte > 0 ? corpo.slice(0, corte) : '',
    questao: corte > 0 ? corpo.slice(corte + 3) : corpo
  };
};

// Subtítulo que só repete a legenda da escala ("1 = Péssimo; 2 = Ruim; ...") não precisa aparecer duas vezes
export const subtituloRepeteLegenda = (tela) => {
  if (tela?.tipo !== 'grade' || !tela.legendaEscala || !tela.subtitulo) return false;
  const cod = (t) => parseScaleLegendItems(t).map((i) => i.code).filter(Boolean).join('|');
  const a = cod(tela.subtitulo);
  return a.split('|').length >= 3 && a === cod(tela.legendaEscala);
};
