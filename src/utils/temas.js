// ==========================================
// LAYOUTS PRONTOS (presets) DO FORMULÁRIO
// O desenho de cada layout está em src/temas.css (classe .tema-<id>).
// Aplicar um layout = trocar o tema e deixar os ajustes em "Do layout";
// qualquer ajuste manual feito depois continua valendo por cima.
// ==========================================
export const TEMAS = [
  { id: 'tribunal', nome: 'Tribunal', descricao: 'Sóbrio e institucional', fonte: 'Spectral:wght@500;700', raio: 4, espaco: 8, seta: 'branco' },
  { id: 'papel', nome: 'Papel', descricao: 'Claro, o mais fácil de ler', fonte: 'Atkinson+Hyperlegible:wght@400;700', raio: 10, espaco: 10, seta: 'preto' },
  { id: 'vitral', nome: 'Vitral', descricao: 'Cores de vidro e luz', fonte: 'Marcellus', raio: 18, espaco: 8, seta: 'branco' },
  { id: 'aurora', nome: 'Aurora', descricao: 'Vidro sobre luz em movimento', fonte: 'Sora:wght@400;600;700', raio: 22, espaco: 10, seta: 'branco' },
  { id: 'teclado', nome: 'Teclado', descricao: 'Teclas que afundam no toque', fonte: 'Lexend:wght@400;600;700', raio: 14, espaco: 14, seta: 'branco' }
];

export const temaPorId = (id) => TEMAS.find((t) => t.id === id);
export const classeTema = (id) => (temaPorId(id) ? `tema tema-${id}` : '');

// Baixa a fonte só do layout em uso (celular do público continua leve)
export const carregarFonteTema = (id) => {
  const t = temaPorId(id);
  if (!t || typeof document === 'undefined') return;
  const chave = `fonte-tema-${id}`;
  if (document.getElementById(chave)) return;
  const l = document.createElement('link');
  l.id = chave;
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${t.fonte}&display=swap`;
  document.head.appendChild(l);
};

const BOTAO_VAZIO = { Efeito: 'nenhum', Cor: 'padrao', CorTexto: 'padrao', Linha: 'padrao', LinhaEspessura: null, Altura: null, Raio: null };
const comPrefixo = (p, o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [p + k, v]));

const CARDS = { cardFundoEstilo: 'tema', cardEfeitoEstilo: 'tema', cardCorFonteTitulo: 'tema', cardCorFonteSubtitulo: 'tema' };

const camposTela = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  ...comPrefixo('grade', BOTAO_VAZIO),
  tituloFundo: 'tema', titulo1Cor: 'tema', titulo2Cor: 'tema', titulo3Cor: 'tema',
  subFundo: 'tema', subtituloCor: 'tema',
  legendaFundo: 'tema', legendaCor: 'tema', itemFundo: 'tema', itemCor: 'tema'
});

const camposP1 = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  pergunta1TituloFundo: 'tema', pergunta1TituloCor: 'tema', pergunta1Titulo2Cor: 'tema', pergunta1Titulo3Cor: 'tema',
  pergunta1SubFundo: 'tema', pergunta1TextoAbaixoCor: 'tema'
});

const camposGerais = (t) => ({
  cardRaioEsq: t.raio,
  cardRaioDir: t.raio,
  ...comPrefixo('grade', BOTAO_VAZIO),
  ...comPrefixo('avancar', BOTAO_VAZIO),
  ...comPrefixo('comecar', BOTAO_VAZIO),
  setaCor: t.seta,
  capaEfeito: 'nenhum',
  ...Object.fromEntries(['capaTitulo1', 'capaTitulo2', 'capaTitulo3', 'capaTextoAbaixo'].flatMap((id) => [[`${id}Cor`, 'tema'], [`${id}Fundo`, 'tema']])),
  esperaLinha1Cor: 'tema', esperaLinha2Cor: 'tema', esperaLinha3Cor: 'tema'
});

const guardar = (obj, campos) => Object.fromEntries(Object.keys(campos).map((k) => [k, obj[k] === undefined ? null : obj[k]]));

export const aplicarTema = (cfg, id) => {
  const usandoTema = Boolean(temaPorId(cfg.tema));

  // "Meu layout": volta exatamente ao que estava antes do primeiro preset
  if (!temaPorId(id)) {
    if (!usandoTema) return cfg;
    const salvo = cfg.layoutSalvo || {};
    const limpo = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, v]));
    return {
      ...cfg,
      ...limpo(salvo.cfg),
      tema: 'original',
      layoutSalvo: null,
      telasExtras: (cfg.telasExtras || []).map((t) => (t?.herdarEstilo === false ? t : { ...t, ...limpo(salvo.telas?.[t.id]) }))
    };
  }

  const t = temaPorId(id);
  const geral = { ...camposGerais(t), ...(cfg.herdarEstiloP1 === false ? {} : camposP1(t)) };
  const salvo = usandoTema ? cfg.layoutSalvo : {
    cfg: guardar(cfg, geral),
    telas: Object.fromEntries((cfg.telasExtras || []).filter((x) => x?.id).map((x) => [x.id, guardar(x, camposTela(t))]))
  };
  return {
    ...cfg,
    ...geral,
    tema: id,
    mostrarProgresso: cfg.mostrarProgresso ?? true,
    layoutSalvo: salvo,
    telasExtras: (cfg.telasExtras || []).map((x) => (x?.herdarEstilo === false ? x : { ...x, ...camposTela(t) }))
  };
};
