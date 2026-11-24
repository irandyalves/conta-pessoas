// ==========================================
// LAYOUTS PRONTOS (presets) DO FORMULÁRIO
// O desenho de cada layout está em src/temas.css (classe .tema-<id>).
// Trocar de layout muda só o visual (cores, fundos, efeitos, cantos, espaço).
// Fontes, bordas dos títulos, alturas, tamanhos e textos são do usuário: nunca mudam.
// Cada layout guarda os próprios ajustes de visual: voltar a ele traz tudo de volta.
// ==========================================
export const TEMAS = [
  { id: 'tribunal', nome: 'Tribunal', descricao: 'Sóbrio e institucional', fonte: 'Spectral:wght@500;700', raio: 4, espaco: 8, seta: 'branco' },
  { id: 'papel', nome: 'Papel', descricao: 'Claro, o mais fácil de ler', fonte: 'Atkinson+Hyperlegible:wght@400;700', raio: 10, espaco: 10, seta: 'preto' },
  { id: 'vitral', nome: 'Vitral', descricao: 'Cores de vidro e luz', fonte: 'Marcellus', raio: 18, espaco: 8, seta: 'branco' },
  { id: 'aurora', nome: 'Aurora', descricao: 'Vidro sobre luz em movimento', fonte: 'Sora:wght@400;600;700', raio: 22, espaco: 10, seta: 'branco' },
  { id: 'teclado', nome: 'Teclado', descricao: 'Teclas que afundam no toque', fonte: 'Lexend:wght@400;600;700', raio: 14, espaco: 14, seta: 'branco' },
  { id: 'quadro', nome: 'Quadro', descricao: 'Lousa verde e giz', fonte: 'Kalam:wght@400;700', raio: 16, espaco: 9, seta: 'branco' },
  { id: 'bilhete', nome: 'Bilhete', descricao: 'Ingressos picotados', fonte: 'Barlow:wght@400;600;700&family=Barlow+Condensed:wght@500;700', raio: 8, espaco: 9, seta: 'branco' },
  { id: 'gibi', nome: 'Gibi', descricao: 'Traço grosso e retícula', fonte: 'Bangers&family=Comic+Neue:wght@400;700', raio: 12, espaco: 13, seta: 'preto' },
  { id: 'jardim', nome: 'Jardim', descricao: 'Claro, com folhas', fonte: 'Fraunces:wght@500;700&family=Nunito:wght@400;700;900', raio: 24, raioDir: 8, espaco: 10, seta: 'preto' },
  { id: 'painel', nome: 'Painel', descricao: 'Placa de embarque', fonte: 'B612:wght@400;700&family=B612+Mono:wght@400;700', raio: 6, espaco: 7, seta: 'dourado' }
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

const BOTAO_VAZIO = { Familia: 'padrao', Efeito: 'nenhum', Cor: 'padrao', CorTexto: 'padrao', Linha: 'padrao', LinhaEspessura: null, Altura: null, Raio: null };
const comPrefixo = (p, o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [p + k, v]));

const fb = (p) => ({ [`${p}Familia`]: 'padrao', [`${p}Borda`]: 'padrao', [`${p}BordaLargura`]: null });
const CARDS = { ...fb('card'), cardFundoEstilo: 'tema', cardEfeitoEstilo: 'tema', cardCorFonteTitulo: 'tema', cardCorFonteSubtitulo: 'tema' };

const camposTela = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  ...comPrefixo('grade', BOTAO_VAZIO),
  ...fb('titulo'), ...fb('sub'), ...fb('legenda'), ...fb('item'),
  tituloFundo: 'tema', titulo1Cor: 'tema', titulo2Cor: 'tema', titulo3Cor: 'tema',
  subFundo: 'tema', subtituloCor: 'tema',
  legendaFundo: 'tema', legendaCor: 'tema', itemFundo: 'tema', itemCor: 'tema'
});

const camposP1 = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  ...fb('pergunta1Titulo'), ...fb('pergunta1Sub'),
  pergunta1TituloFundo: 'tema', pergunta1TituloCor: 'tema', pergunta1Titulo2Cor: 'tema', pergunta1Titulo3Cor: 'tema',
  pergunta1SubFundo: 'tema', pergunta1TextoAbaixoCor: 'tema'
});

const camposGerais = (t) => ({
  cardRaioEsq: t.raio,
  cardRaioDir: t.raioDir ?? t.raio,
  ...comPrefixo('grade', BOTAO_VAZIO),
  ...comPrefixo('avancar', BOTAO_VAZIO),
  ...comPrefixo('comecar', BOTAO_VAZIO),
  setaCor: t.seta,
  capaEfeito: 'nenhum',
  ...['capaTitulo1', 'capaTitulo2', 'capaTitulo3', 'capaTextoAbaixo'].reduce((o, id) => ({ ...o, ...fb(id) }), {}),
  ...Object.fromEntries(['capaTitulo1', 'capaTitulo2', 'capaTitulo3', 'capaTextoAbaixo'].flatMap((id) => [[`${id}Cor`, 'tema'], [`${id}Fundo`, 'tema']])),
  esperaLinha1Cor: 'tema', esperaLinha2Cor: 'tema', esperaLinha3Cor: 'tema'
});

// Do usuário, não do layout: a troca não mexe nestes campos
const doUsuario = (k) => /Familia$|Altura$/.test(k) || (/Borda(Largura)?$/.test(k) && !k.startsWith('card'));
const filtrar = (o, f) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => f(k, v)));
const doLayout = (campos) => filtrar(campos, (k) => !doUsuario(k));
const vazio = (v) => v === undefined || v === null || v === 'padrao';
const guardar = (obj, campos) => Object.fromEntries(Object.keys(campos).map((k) => [k, obj[k] === undefined ? null : obj[k]]));
const herda = (tela) => tela?.herdarEstilo !== false;

const visualGeral = (cfg, t) => doLayout({ ...camposGerais(t), ...(cfg.herdarEstiloP1 === false ? {} : camposP1(t)) });
const visualTela = (t) => doLayout(camposTela(t));

// Os ajustes ficam em texto (JSON): o Firestore troca o valor inteiro em vez de misturar com o antigo
const lerSalvo = (cfg, id) => {
  try { return JSON.parse(cfg.layoutsSalvos?.[id] || 'null'); } catch { return null; }
};

const tirarFoto = (cfg, id) => {
  const t = temaPorId(id);
  const base = t || TEMAS[0]; // "Meu layout": só importam os nomes dos campos
  const foto = (obj, campos) => {
    const tudo = guardar(obj, campos);
    return t ? filtrar(tudo, (k, v) => v !== campos[k]) : tudo; // layout pronto: só o que foi mexido
  };
  return JSON.stringify({
    cfg: foto(cfg, visualGeral(cfg, base)),
    telas: Object.fromEntries((cfg.telasExtras || []).filter((x) => x?.id && herda(x)).map((x) => [x.id, foto(x, visualTela(base))]))
  });
};

// Formato antigo (layoutSalvo): vira a foto do "Meu layout" e devolve as fontes/bordas/alturas que a troca tinha apagado
const migrar = (cfg) => {
  const antigo = cfg.layoutSalvo;
  if (!antigo) return cfg;
  const recuperar = (obj, salvo) => filtrar(salvo, (k, v) => doUsuario(k) && !vazio(v) && vazio(obj[k]));
  return {
    ...cfg,
    ...recuperar(cfg, antigo.cfg),
    telasExtras: (cfg.telasExtras || []).map((x) => (herda(x) ? { ...x, ...recuperar(x, antigo.telas?.[x?.id]) } : x)),
    layoutSalvo: null,
    layoutsSalvos: {
      ...cfg.layoutsSalvos,
      original: JSON.stringify({
        cfg: doLayout(antigo.cfg),
        telas: Object.fromEntries(Object.entries(antigo.telas || {}).map(([k, v]) => [k, doLayout(v)]))
      })
    }
  };
};

export const aplicarTema = (cfgAtual, id) => {
  const de = temaPorId(cfgAtual.tema) ? cfgAtual.tema : 'original';
  const para = temaPorId(id) ? id : 'original';
  if (de === para) return cfgAtual;

  const cfg = migrar(cfgAtual);
  const t = temaPorId(para);
  const salvo = lerSalvo(cfg, para) || {};
  const layoutsSalvos = { ...cfg.layoutsSalvos, [de]: tirarFoto(cfg, de) };

  // "Meu layout" em página criada depois: segue o visual de outra página guardada
  const modelo = Object.values(salvo.telas || {})[0] || {};
  const semTema = (x) => Object.fromEntries(Object.keys(visualTela(TEMAS[0])).filter((k) => x[k] === 'tema').map((k) => [k, null]));
  const visualDaTela = (x) => {
    const guardado = salvo.telas?.[x?.id];
    if (t) return { ...visualTela(t), ...guardado };
    return guardado || { ...semTema(x), ...modelo };
  };
  const geral = t ? visualGeral(cfg, t) : null;

  return {
    ...cfg,
    ...(t ? { ...geral, ...filtrar(salvo.cfg, (k) => k in geral) } : salvo.cfg),
    tema: para,
    ...(t ? { mostrarProgresso: cfg.mostrarProgresso ?? true } : {}),
    layoutsSalvos,
    telasExtras: (cfg.telasExtras || []).map((x) => (herda(x) ? { ...x, ...visualDaTela(x) } : x))
  };
};
