// ==========================================
// TÍTULO DA PÁGINA x PERGUNTA
// Nas telas de campo (nome, e-mail, texto...) a PERGUNTA é o título da tela (é o nome dela nos relatórios).
// O TÍTULO DA PÁGINA ("Perfil do participante") fica na primeira pergunta, com os mesmos campos e o prefixo pag_.
// ==========================================
import { continuaNaMesmaPagina } from './estilos';

const TEXTOS = ['titulo1', 'titulo2', 'titulo3', 'subtitulo'];
const ESTILOS = [
  'titulo1Tamanho', 'titulo1Cor', 'titulo2Tamanho', 'titulo2Cor', 'titulo3Tamanho', 'titulo3Cor',
  'tituloBold', 'tituloCaixa', 'tituloFamilia', 'tituloItalico', 'tituloAlinhamento', 'tituloFundo', 'tituloBorda', 'tituloBordaLargura', 'tituloBordaLado',
  'subtituloTamanho', 'subtituloCor', 'subBold', 'subCaixa', 'subFamilia', 'subItalico', 'subAlinhamento', 'subFundo', 'subBorda', 'subBordaLargura', 'subBordaLado',
  'espacoTitulos', 'espacoSub', 'espacoCards', 'tituloFaixa',
  ...[2, 3].flatMap((n) => ['Bold', 'Caixa', 'Familia', 'Italico', 'Borda', 'BordaLargura', 'BordaLado', 'Alinhamento', 'Fundo', 'Faixa'].map((k) => `titulo${n}${k}`))
];
// titulosMais: títulos além do 3º ({ texto, tamanho, cor }), quantos quiser
export const chavePagina = (k) => (TEXTOS.includes(k) || ESTILOS.includes(k) || k === 'titulosMais' ? `pag_${k}` : k);
const ehTexto = (t) => ['texto', 'texto_curto'].includes(t?.tipo);
const limpo = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

export const temTituloPagina = (t) => TEXTOS.some((k) => limpo(t?.[`pag_${k}`])) || (t?.pag_titulosMais || []).some((x) => limpo(x?.texto));

// A tela vista como título da página: os campos pag_ no lugar dos da pergunta
export function paginaDe(t = {}) {
  const out = { ...t };
  TEXTOS.forEach((k) => { out[k] = t[`pag_${k}`] ?? ''; });
  ESTILOS.forEach((k) => { out[k] = t[`pag_${k}`] ?? t[k]; });
  out.titulosMais = t.pag_titulosMais || [];
  out.titulo = limpo(`${out.titulo1} ${out.titulo2}`);
  return out;
}

// Título novo nasce com a aparência da pergunta; depois cada um segue o seu caminho
export function comEstiloPagina(t) {
  const out = { ...t };
  ESTILOS.forEach((k) => { if (out[`pag_${k}`] === undefined && t[k] !== undefined) out[`pag_${k}`] = t[k]; });
  return out;
}
const ehPag = (k) => k.startsWith('pag_');
export const semPagina = (t) => Object.fromEntries(Object.entries(t).filter(([k]) => !ehPag(k)));
// Mudou a primeira pergunta da página: o título vai junto para a nova primeira
export const transferirPagina = (de, para) => ({ ...semPagina(para), ...Object.fromEntries(Object.entries(de).filter(([k]) => ehPag(k))) });

// Primeira tela da página em que a tela i aparece
export function primeiraDaPagina(telas, i) {
  let p = i;
  while (p > 0 && continuaNaMesmaPagina(telas[p - 1], telas[p])) p--;
  return p;
}

// Antes não havia título de página: quem precisava dele punha o título no lugar da pergunta
// e a pergunta no "texto abaixo". Separa uma vez só (pag_titulo1 definido = já separado).
export function separarTitulos(telas = []) {
  return telas.map((t, i) => {
    if (!ehTexto(t) || t.pag_titulo1 !== undefined) return t;
    if (i > 0 && continuaNaMesmaPagina(telas[i - 1], t)) return t;
    const pergunta = limpo(t.subtitulo);
    const titulo = limpo(t.titulo1 ?? t.titulo);
    if (!pergunta.endsWith('?') || !titulo || titulo.endsWith('?')) return { ...t, pag_titulo1: '' };
    return {
      ...comEstiloPagina(t),
      pag_titulo1: titulo, pag_titulo2: t.titulo2 || '', pag_titulo3: t.titulo3 || '', pag_subtitulo: '',
      titulo: pergunta, titulo1: pergunta, titulo2: '', titulo3: '', subtitulo: ''
    };
  });
}

// Copiar/colar/replicar formatação: havendo título de página, a formatação dos títulos vai para ele
export function aplicarNaPagina(t, aplicar) {
  if (!temTituloPagina(t)) return aplicar(t);
  const novo = aplicar(paginaDe(t));
  const out = { ...t };
  Object.entries(novo).forEach(([k, v]) => {
    if (ehPag(k) || k === 'titulo' || TEXTOS.includes(k)) return;
    out[chavePagina(k)] = v;
  });
  return out;
}

// Pergunta sozinha na página: título e pergunta são uma coisa só. Se o texto ficou no título
// da página e a pergunta está vazia, o título passa a ser a própria pergunta.
export function tituloParaPergunta(t) {
  if (!t || !temTituloPagina(t) || limpo(t.titulo1 ?? t.titulo) || limpo(t.titulo2) || limpo(t.titulo3)) return t;
  const out = { ...t };
  TEXTOS.forEach((k) => { out[k] = t[`pag_${k}`] ?? ''; out[`pag_${k}`] = ''; });
  ESTILOS.forEach((k) => { if (t[`pag_${k}`] !== undefined) out[k] = t[`pag_${k}`]; });
  out.titulosMais = t.pag_titulosMais || [];
  out.pag_titulosMais = [];
  out.titulo = limpo(`${out.titulo1} ${out.titulo2}`);
  return out;
}

// ==========================================
// PADRÃO DE PERGUNTA (pergunta sozinha na tela)
// títulos: blocos separados, cada um com seu estilo; abaixo=true fica depois da pergunta.
// pergunta: titulo1 (+ subtitulo = texto de apoio). Título 2/3 e título de página viram títulos.
// ==========================================
const novoId = () => `tit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
export const novoTitulo = (extra = {}) => ({ id: novoId(), texto: '', tamanho: 18, cor: 'branco', bold: true, alinhamento: 'center', fundo: 'transparente', espaco: 12, abaixo: false, ...extra });

export function padraoPergunta(t) {
  if (!t) return t;
  const sobra = temTituloPagina(t) || limpo(t.titulo2) || limpo(t.titulo3) || (t.titulosMais || []).some((x) => limpo(x?.texto));
  if (Array.isArray(t.titulos) && !sobra) return t;
  const acima = [];
  const abaixo = [];
  const pag = paginaDe(t);
  [1, 2, 3].forEach((n) => {
    const texto = limpo(pag[`titulo${n}`]);
    if (texto) acima.push(novoTitulo({ texto, tamanho: pag[`titulo${n}Tamanho`] || [18, 15, 14][n - 1], cor: pag[`titulo${n}Cor`] || ['branco', 'dourado', 'verde'][n - 1], bold: pag.tituloBold !== false, caixa: pag.tituloCaixa, alinhamento: pag.tituloAlinhamento || 'center', fundo: n === 1 ? (pag.tituloFundo || 'transparente') : 'transparente', familia: pag.tituloFamilia, italico: pag.tituloItalico }));
  });
  (pag.titulosMais || []).forEach((x) => { if (limpo(x?.texto)) acima.push(novoTitulo({ texto: limpo(x.texto), tamanho: x.tamanho || 14, cor: x.cor || 'branco' })); });
  if (limpo(pag.subtitulo)) acima.push(novoTitulo({ texto: limpo(pag.subtitulo), tamanho: pag.subtituloTamanho || 12, cor: pag.subtituloCor || 'cinza', bold: Boolean(pag.subBold), alinhamento: pag.subAlinhamento || 'center' }));
  [2, 3].forEach((n) => {
    const texto = limpo(t[`titulo${n}`]);
    if (texto) {
      abaixo.push(novoTitulo({
        texto, abaixo: true, tamanho: t[`titulo${n}Tamanho`] || [15, 14][n - 2], cor: t[`titulo${n}Cor`] || ['dourado', 'verde'][n - 2],
        bold: t[`titulo${n}Bold`] ?? (t.tituloBold !== false), caixa: t[`titulo${n}Caixa`] ?? t.tituloCaixa,
        alinhamento: t[`titulo${n}Alinhamento`] || t.tituloAlinhamento || 'center', fundo: t[`titulo${n}Fundo`] || 'transparente', faixa: t[`titulo${n}Faixa`],
        familia: t[`titulo${n}Familia`], italico: t[`titulo${n}Italico`], borda: t[`titulo${n}Borda`], bordaLargura: t[`titulo${n}BordaLargura`], bordaLado: t[`titulo${n}BordaLado`]
      }));
    }
  });
  (t.titulosMais || []).forEach((x) => { if (limpo(x?.texto)) abaixo.push(novoTitulo({ texto: limpo(x.texto), tamanho: x.tamanho || 14, cor: x.cor || 'branco', abaixo: true })); });
  const out = { ...t };
  TEXTOS.forEach((k) => { if (t[`pag_${k}`] !== undefined || k === 'titulo1') out[`pag_${k}`] = ''; });
  out.pag_titulosMais = [];
  out.titulo2 = '';
  out.titulo3 = '';
  out.titulosMais = [];
  // Pergunta vazia: o primeiro título de cima vira a pergunta
  if (!limpo(t.titulo1 ?? t.titulo) && acima.length) {
    const p = acima.shift();
    Object.assign(out, { titulo1: p.texto, titulo1Tamanho: p.tamanho, titulo1Cor: p.cor });
  }
  out.titulo = limpo(out.titulo1 ?? t.titulo);
  out.titulos = [...acima, ...(t.titulos || []), ...abaixo];
  return out;
}
