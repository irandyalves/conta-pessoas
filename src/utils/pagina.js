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
  'espacoTitulos', 'espacoSub', 'espacoCards'
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
