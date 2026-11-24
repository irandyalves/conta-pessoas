// ==========================================
// LAYOUTS PRONTOS (presets) DO FORMULÁRIO
// O desenho de cada layout está em src/temas.css (classe .tema-<id>).
// Trocar de layout muda só o visual (cores, fontes, fundos, bordas, efeitos, cantos).
// Textos, tamanhos, alturas e espaçamento são do usuário: nunca mudam.
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

const BOTAO_VAZIO = { Familia: 'padrao', Efeito: 'nenhum', Cor: 'padrao', CorTexto: 'padrao', Linha: 'padrao', LinhaEspessura: null, LinhaLado: 'inteira', Altura: null, Raio: null };
const comPrefixo = (p, o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [p + k, v]));

const fb = (p) => ({ [`${p}Familia`]: 'padrao', [`${p}Borda`]: 'padrao', [`${p}BordaLargura`]: null, [`${p}BordaLado`]: 'inteira' });
const CARDS = { ...fb('card'), cardFundoEstilo: 'tema', cardEfeitoEstilo: 'tema', cardCorFonteTitulo: 'tema', cardCorFonteSubtitulo: 'tema' };

const camposTela = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  ...comPrefixo('grade', BOTAO_VAZIO),
  ...fb('titulo'), ...fb('sub'), ...fb('legenda'), ...fb('item'), ...fb('instrucao'),
  instrucaoCor: 'tema', instrucaoFundo: 'transparente',
  tituloFundo: 'tema', titulo1Cor: 'tema', titulo2Cor: 'tema', titulo3Cor: 'tema',
  subFundo: 'tema', subtituloCor: 'tema',
  ...fb('pag_titulo'), ...fb('pag_sub'), // título da página (telas de campo)
  pag_tituloFundo: 'tema', pag_titulo1Cor: 'tema', pag_titulo2Cor: 'tema', pag_titulo3Cor: 'tema', pag_subFundo: 'tema', pag_subtituloCor: 'tema',
  legendaFundo: 'tema', legendaCor: 'tema', itemFundo: 'tema', itemCor: 'tema'
});

const camposP1 = (t) => ({
  ...CARDS,
  cardEspaco: t.espaco,
  ...fb('pergunta1Titulo'), ...fb('pergunta1Sub'),
  pergunta1TituloFundo: 'tema', pergunta1TituloCor: 'tema', pergunta1Titulo2Cor: 'tema', pergunta1Titulo3Cor: 'tema',
  pergunta1SubFundo: 'tema', pergunta1TextoAbaixoCor: 'tema'
});

const TEXTOS_CAPA = ['capaTitulo1', 'capaTitulo2', 'capaTitulo3', 'capaTitulo4', 'capaTitulo5', 'capaTitulo6', 'capaTextoAbaixo'];
const camposGerais = (t) => ({
  cardRaioEsq: t.raio,
  cardRaioDir: t.raioDir ?? t.raio,
  ...comPrefixo('grade', BOTAO_VAZIO),
  ...comPrefixo('avancar', BOTAO_VAZIO),
  ...comPrefixo('comecar', BOTAO_VAZIO),
  setaCor: t.seta,
  capaEfeito: 'nenhum',
  capaRaio: null,
  ...TEXTOS_CAPA.reduce((o, id) => ({ ...o, ...fb(id) }), {}),
  ...Object.fromEntries(TEXTOS_CAPA.flatMap((id) => [[`${id}Cor`, 'tema'], [`${id}Fundo`, 'tema']])),
  esperaLinha1Cor: 'tema', esperaLinha2Cor: 'tema', esperaLinha3Cor: 'tema',
  ...Object.fromEntries(['esperaLinha1', 'esperaLinha2', 'esperaLinha3', 'pergunta2', 'finalTitulo', 'finalTitulo1', 'finalTitulo2', 'finalMensagem', 'finalStatus', 'finalInstrucao'].map((id) => [`${id}Familia`, 'padrao'])),
  ...Object.fromEntries(['finalTitulo1', 'finalTitulo2', 'finalMensagem', 'finalStatus', 'finalInstrucao'].flatMap((id) => [[`${id}Cor`, 'tema'], [`${id}Fundo`, 'transparente'], [`${id}Borda`, 'padrao'], [`${id}BordaLargura`, null], [`${id}BordaLado`, 'inteira']])),
  ...comPrefixo('soeu', BOTAO_VAZIO),
  ...Object.fromEntries(['soeuTitulo', 'soeuCompl', 'divisorQtd'].flatMap((id) => [[`${id}Cor`, 'tema'], [`${id}Familia`, 'padrao']])),
  btnQtdCor: 'tema', btnQtdCorNumero: 'tema', btnQtdCorDescricao: 'tema', btnQtdEfeito: 'tema'
});

// Do usuário, não do layout: textos, tamanhos, alturas e espaçamento. A troca não mexe nestes campos.
const doUsuario = (k) => /Altura$|Espaco$/.test(k);
const filtrar = (o, f) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => f(k, v)));
const doLayout = (campos) => filtrar(campos, (k) => !doUsuario(k));
const valor = (v) => (v === undefined ? null : v);
const guardar = (obj, campos) => Object.fromEntries(Object.keys(campos).map((k) => [k, valor(obj[k])]));
const herda = (tela) => tela?.herdarEstilo !== false;

// campos inseridos na tela final (finalCampo_<linha>_<id>_Cor/Familia)
const camposInseridos = (cfg) => Object.fromEntries(Object.keys(cfg).filter((k) => /^finalCampo_.+_(Cor|Familia)$/.test(k)).map((k) => [k, k.endsWith('_Cor') ? 'tema' : 'padrao']));
const visualGeral = (cfg, t) => doLayout({ ...camposGerais(t), ...camposInseridos(cfg), ...(cfg.herdarEstiloP1 === false ? {} : camposP1(t)) });
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
    v: 2,
    cfg: foto(cfg, visualGeral(cfg, base)),
    telas: Object.fromEntries((cfg.telasExtras || []).filter((x) => x?.id && herda(x)).map((x) => [x.id, foto(x, visualTela(base))]))
  });
};

// Formatos antigos da foto do "Meu layout" (layoutSalvo e v1), com um layout pronto em uso:
// - altura e espaço que a troca tinha mudado voltam ao que o usuário definiu;
// - campo de visual que a foto não tinha (a troca não mexia nele) é do "Meu layout": vai para a foto.
const migrar = (cfg, t) => {
  const antigo = cfg.layoutSalvo || lerSalvo(cfg, 'original');
  if (!t || !antigo || antigo.v === 2) return cfg;
  const separar = (obj, salvo, campos) => {
    const s = salvo || {};
    const devolver = filtrar(s, (k, v) => (/Altura$/.test(k) && v != null && obj[k] == null) || (k === 'cardEspaco' && obj[k] === t.espaco));
    const faltam = Object.keys(campos).filter((k) => !(k in s));
    return {
      atual: { ...obj, ...devolver, ...Object.fromEntries(faltam.map((k) => [k, campos[k]])) },
      foto: { ...doLayout(s), ...Object.fromEntries(faltam.map((k) => [k, valor(obj[k])])) }
    };
  };
  const geral = separar(cfg, antigo.cfg, visualGeral(cfg, t));
  const telas = { ...antigo.telas };
  const telasExtras = (cfg.telasExtras || []).map((x) => {
    if (!herda(x) || !telas[x?.id]) return x;
    const r = separar(x, telas[x.id], visualTela(t));
    telas[x.id] = r.foto;
    return r.atual;
  });
  return {
    ...geral.atual,
    telasExtras,
    layoutSalvo: null,
    layoutsSalvos: { ...cfg.layoutsSalvos, original: JSON.stringify({ v: 2, cfg: geral.foto, telas }) }
  };
};

export const aplicarTema = (cfgAtual, id) => {
  const de = temaPorId(cfgAtual.tema) ? cfgAtual.tema : 'original';
  const para = temaPorId(id) ? id : 'original';
  if (de === para) return cfgAtual;

  const cfg = migrar(cfgAtual, temaPorId(de));
  const t = temaPorId(para);
  const salvo = lerSalvo(cfg, para) || {};
  const layoutsSalvos = { ...cfg.layoutsSalvos, [de]: tirarFoto(cfg, de) };
  const camposDaTela = visualTela(t || TEMAS[0]);
  // "Meu layout": o que a foto não tem (opção criada depois dela) volta ao padrão, sem herdar do layout anterior
  const geral = t ? visualGeral(cfg, t) : salvo.cfg ? Object.fromEntries(Object.keys(visualGeral(cfg, TEMAS[0])).map((k) => [k, null])) : {};

  // "Meu layout" em página criada depois: segue o visual de outra página guardada
  const modelo = Object.values(salvo.telas || {})[0] || {};
  const semTema = (x) => Object.fromEntries(Object.keys(camposDaTela).filter((k) => x[k] === 'tema').map((k) => [k, null]));
  const visualDaTela = (x) => {
    const guardado = salvo.telas?.[x?.id];
    const base = t ? camposDaTela : guardado ? Object.fromEntries(Object.keys(camposDaTela).map((k) => [k, null])) : semTema(x);
    return { ...base, ...filtrar(guardado || (t ? {} : modelo), (k) => k in camposDaTela) };
  };

  return {
    ...cfg,
    ...geral,
    ...(t ? filtrar(salvo.cfg, (k) => k in geral) : doLayout(salvo.cfg)),
    tema: para,
    ...(t ? { mostrarProgresso: cfg.mostrarProgresso ?? true } : {}),
    layoutsSalvos,
    telasExtras: (cfg.telasExtras || []).map((x) => (herda(x) ? { ...x, ...visualDaTela(x) } : x))
  };
};
