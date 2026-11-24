// ==========================================
// TELA FINAL: linhas de texto e campos inseridos ({Nome}, {E-mail}...)
// Campo inserido: config.finalCampos = [{ id, nome, origem }], usado no texto como {nome}.
// Estilo de cada campo em cada linha: finalCampo_<linha>_<id>_Familia | Cor | Tamanho | Bold
// ==========================================

// cls = cor original do texto; hex entra por cima quando o usuário escolhe uma cor
export const LINHAS_FINAL = [
  { id: 'finalTitulo1', rotulo: 'Título 1', padrao: 'MUITO OBRIGADO', tamanho: 26, min: 14, max: 48, espaco: 0, cls: 'text-white font-black tracking-tight leading-snug', h1: true },
  { id: 'finalTitulo2', rotulo: 'Título 2', padrao: 'PELA SUA PRESENÇA.', tamanho: 26, min: 14, max: 48, espaco: 12, cls: 'text-white font-black tracking-tight leading-snug', h1: true },
  { id: 'finalMensagem', rotulo: 'Mensagem', padrao: '', tamanho: 16, min: 10, max: 32, espaco: 44, cls: 'text-amber-400 font-extrabold tracking-wide leading-tight', multilinha: true },
  { id: 'finalStatus', rotulo: 'Conclusão', padrao: 'REGISTRO CONCLUÍDO!', tamanho: 18, min: 10, max: 32, espaco: 6, cls: 'text-emerald-400 font-black tracking-wide', caixa: true },
  { id: 'finalInstrucao', rotulo: 'Instrução', padrao: 'pode guardar seu celular', tamanho: 13, min: 9, max: 28, espaco: 0, cls: 'text-slate-300 font-bold', multilinha: true }
];

const ehTitulo = (id) => id === 'finalTitulo1' || id === 'finalTitulo2';

// Espaço padrão depois de uma linha: maior quando a próxima que aparece fica do outro lado da linha divisória
const BAIXO = ['finalStatus', 'finalInstrucao'];
function espacoPadrao(cfg, l) {
  const i = LINHAS_FINAL.findIndex((x) => x.id === l.id);
  const prox = LINHAS_FINAL.slice(i + 1).find((x) => String(cfg[x.id] ?? x.padrao).trim());
  return prox && BAIXO.includes(prox.id) && !BAIXO.includes(l.id) ? 44 : Math.min(l.espaco, 12);
}

// Valores em uso de uma linha. Os títulos 1 e 2 herdam o estilo antigo, que era dos dois juntos.
export function estiloLinhaFinal(cfg = {}, l) {
  return {
    texto: cfg[l.id] ?? l.padrao,
    familia: cfg[`${l.id}Familia`] ?? (ehTitulo(l.id) ? cfg.finalTituloFamilia : undefined),
    tamanho: ehTitulo(l.id)
      ? Number(cfg[`${l.id}Tamanho`]) || Number(cfg.finalTituloFonteTamanho) || Number(cfg.finalFonteTamanho) || l.tamanho
      : Number(cfg[`${l.id}FonteTamanho`]) || l.tamanho,
    cor: cfg[`${l.id}Cor`] || 'tema',
    bold: cfg[`${l.id}Bold`] ?? true,
    caixa: cfg[`${l.id}Caixa`] ?? Boolean(l.caixa),
    alinhamento: cfg[`${l.id}Alinhamento`] || 'center',
    fundo: cfg[`${l.id}Fundo`] || 'transparente',
    altura: cfg[`${l.id}Altura`],
    espaco: Number(cfg[`${l.id}Espaco`] ?? espacoPadrao(cfg, l))
  };
}
export const chaveTamanho = (l) => (ehTitulo(l.id) ? `${l.id}Tamanho` : `${l.id}FonteTamanho`);

// Linhas que aparecem no celular, com o espaço antes de cada uma
export function linhasFinais(cfg = {}) {
  const todas = LINHAS_FINAL.map((l) => ({ ...l, ...estiloLinhaFinal(cfg, l) })).filter((l) => String(l.texto || '').trim());
  return todas.map((l, i) => ({
    ...l,
    antes: i ? todas[i - 1].espaco : 0,
    // a linha divisória separa os títulos/mensagem da conclusão/instrução
    divisor: i > 0 && BAIXO.includes(l.id) && !BAIXO.includes(todas[i - 1].id)
  }));
}

export const nomeLimpo = (t) => String(t || '').replace(/[{}]/g, '').replace(/^\s*\d{1,3}[.)]\s+/, '').replace(/[:*?]+\s*$/, '').replace(/\s+/g, ' ').trim();

// Perguntas que podem virar campo: [{ origem, titulo, tipo }]. As de texto vêm primeiro (nome, e-mail...)
export function origensDeCampo(cfg = {}) {
  const out = [];
  const gavetas = (dono, opcoes, pai) => (opcoes || []).forEach((o) => {
    if (o?.ativo !== false && o?.temGaveta) out.push({ origem: `gaveta|${dono}::${o.id}`, titulo: `${pai} › ${o.titulo}`, texto: true });
  });
  if ((cfg.opcoesChegada || []).some((o) => o?.ativo !== false)) {
    const t = nomeLimpo([cfg.pergunta1Titulo, cfg.pergunta1Titulo2].filter(Boolean).join(' ')) || 'Tela 1';
    out.push({ origem: 'p1', titulo: t, texto: false });
    gavetas('p1', cfg.opcoesChegada, t);
  }
  (cfg.telasExtras || []).filter((x) => x && x.ativa !== false).forEach((x, i) => {
    const t = nomeLimpo(x.titulo || [x.titulo1, x.titulo2].filter(Boolean).join(' ')) || `Tela ${i + 2}`;
    if (x.tipo !== 'grade') out.push({ origem: x.id, titulo: t, texto: ['texto', 'texto_curto'].includes(x.tipo) });
    gavetas(x.id, x.opcoes, t);
  });
  return out.sort((a, b) => Number(b.texto) - Number(a.texto));
}

// Nome curto e único para o campo novo: "E-mail institucional (para certificado)" → "E-mail institucional"
export function nomeParaCampo(titulo, campos = []) {
  let base = nomeLimpo(titulo).replace(/\s*\(.*\)\s*$/, '') || 'Campo';
  if (/e-?mail/i.test(base)) base = 'E-mail';
  else if (/\bnome\b/i.test(base)) base = 'Nome';
  else if (base.length > 24) base = `${base.slice(0, 24).replace(/\s+\S*$/, '')}`;
  let nome = base;
  for (let n = 2; campos.some((c) => c.nome.toLowerCase() === nome.toLowerCase()); n++) nome = `${base} ${n}`;
  return nome;
}

// "Olá {Nome}!" → ['Olá ', { campo }, '!']. {coisa} que não é campo continua como texto.
export function partesDoTexto(texto, campos = []) {
  const out = [];
  let resto = String(texto ?? '');
  const re = /\{([^{}]+)\}/g;
  let de = 0, m;
  while ((m = re.exec(resto))) {
    const campo = (campos || []).find((c) => c.nome.toLowerCase() === m[1].trim().toLowerCase());
    if (!campo) continue;
    if (m.index > de) out.push(resto.slice(de, m.index));
    out.push({ campo });
    de = m.index + m[0].length;
  }
  if (de < resto.length) out.push(resto.slice(de));
  return out;
}
export const camposDoTexto = (texto, campos) => [...new Map(partesDoTexto(texto, campos).filter((p) => p.campo).map((p) => [p.campo.id, p.campo])).values()];
export const chaveCampo = (linha, campoId, k) => `finalCampo_${linha}_${campoId}_${k}`;

// Troca os campos pelos valores. Campo vazio sai do texto sem deixar espaço sobrando.
export function preencher(texto, campos, valorDe) {
  const partes = partesDoTexto(texto, campos).map((p) => (p.campo ? { campo: p.campo, valor: String(valorDe(p.campo) ?? '').trim() } : p)).filter((p) => typeof p === 'string' || p.valor);
  return partes.map((p, i) => {
    if (typeof p !== 'string') return p;
    let t = p;
    if (typeof partes[i - 1] === 'string' && /\s$/.test(partes[i - 1])) t = t.replace(/^[ \t]+/, '');
    return t;
  });
}

// O que aparece na prévia do editor, onde ninguém respondeu
export const exemploDe = (campo) => (/e-?mail/i.test(campo.nome) ? 'nome@email.com' : /nome/i.test(campo.nome) ? 'Maria Silva' : campo.nome);
