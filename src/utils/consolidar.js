// ==========================================
// CONSOLIDAÇÃO DAS RESPOSTAS
// Transforma a lista de presenças + a configuração das perguntas em números prontos
// para os gráficos, o PDF e as planilhas. Tudo sai daqui: tela e arquivos sempre batem.
// ==========================================
import { parseScaleLegendItems } from './estilos';

export const limpar = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const TIPOS_ESCOLHA = ['cards', 'dropdown', 'radio'];
const numero = (v) => {
  const m = /-?\d+(?:[.,]\d+)?/.exec(String(v ?? ''));
  return m ? Number(m[0].replace(',', '.')) : null;
};
const media = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);
export const ehNota = (col) => /^-?\d+(?:[.,]\d+)?$/.test(String(col).trim());

// Mesmo rótulo que o celular grava (MobileForm.montarRespostas)
const tituloTela = (t, i) => t.titulo || [t.titulo1, t.titulo2].filter(Boolean).join(' ') || `Tela ${i + 2}`;

// "A, B" => ['A', 'B'] respeitando opções que têm vírgula no próprio nome
export function separarMultipla(valor, opcoes = []) {
  let resto = String(valor ?? '').trim();
  const nomes = [...opcoes].filter(Boolean).sort((a, b) => b.length - a.length);
  const out = [];
  while (resto) {
    const achou = nomes.find((n) => resto === n || resto.startsWith(`${n}, `));
    if (achou) {
      out.push(achou);
      resto = resto.slice(achou.length).replace(/^, /, '');
    } else {
      const i = resto.indexOf(', ');
      out.push(i < 0 ? resto : resto.slice(0, i));
      resto = i < 0 ? '' : resto.slice(i + 2);
    }
  }
  return [...new Set(out)];
}

// "Item: 5 | Outro item: 4" => { Item: '5', 'Outro item': '4' } (o nome do item pode ter ":" ou "|")
export function separarGrade(valor, itens = []) {
  const texto = String(valor ?? '');
  const marcas = [];
  let de = 0;
  itens.forEach((nome) => {
    const alvo = `${nome}: `;
    let p = texto.indexOf(alvo, de);
    while (p > 0 && texto.slice(p - 3, p) !== ' | ') p = texto.indexOf(alvo, p + 1);
    if (p >= 0) { marcas.push({ nome, p, v: p + alvo.length }); de = p + alvo.length; }
  });
  const mapa = {};
  if (marcas.length) {
    marcas.forEach((m, i) => { mapa[m.nome] = texto.slice(m.v, i + 1 < marcas.length ? marcas[i + 1].p - 3 : undefined).trim(); });
    return mapa;
  }
  // itens renomeados depois da resposta
  texto.split(' | ').forEach((parte) => {
    const i = parte.lastIndexOf(': ');
    if (i > 0) mapa[parte.slice(0, i)] = parte.slice(i + 2).trim();
  });
  return mapa;
}

// Respostas de um registro: [{ telaId, pergunta, resposta }]. Registros antigos só têm os mapas.
function respostasDe(item) {
  if (Array.isArray(item?.respostas) && item.respostas.length) return item.respostas.filter(Boolean);
  const out = [];
  ['respostasExtras', 'textoRespostas', 'gavetaRespostas'].forEach((m) => {
    Object.entries(item?.[m] || {}).forEach(([pergunta, resposta]) => out.push({ telaId: null, pergunta, resposta }));
  });
  return out;
}

const contar = (valores, nomes = []) => {
  const mapa = new Map(nomes.filter(Boolean).map((n) => [n, 0]));
  valores.forEach((v) => mapa.set(v, (mapa.get(v) || 0) + 1));
  return mapa;
};
const opcoesDe = (mapa, base) => [...mapa].map(([nome, n]) => ({ nome, n, pct: base ? n / base : 0 }));

function resumirNotas(valores, { min, max, passo = 1, unidade = '' } = {}) {
  const nums = valores.map(numero).filter((n) => n !== null);
  const nomes = [];
  if (min !== undefined && max !== undefined && passo > 0 && (max - min) / passo <= 20) {
    for (let v = min; v <= max + 1e-9; v += passo) nomes.push(Math.round(v * 1000) / 1000);
  }
  const mapa = contar(nums, []);
  const todos = [...new Set([...nomes, ...mapa.keys()])].sort((a, b) => a - b);
  return {
    opcoes: todos.map((v) => ({ nome: `${String(v).replace('.', ',')}${typeof unidade === 'function' ? unidade(v) : unidade}`, n: mapa.get(v) || 0, pct: nums.length ? (mapa.get(v) || 0) / nums.length : 0 })),
    media: media(nums),
    respondentes: nums.length
  };
}

// Pergunta que não existe mais na configuração: decide pelo conteúdo
function adivinharTipo(valores) {
  const distintos = new Set(valores);
  const curtas = valores.every((v) => v.length <= 60);
  return curtas && distintos.size <= 12 && (distintos.size < valores.length || distintos.size <= 3) ? 'escolha' : 'texto';
}

function montar(base, tipo, entradas, extra = {}) {
  const valores = entradas.map((e) => limpar(e.resposta)).filter(Boolean);
  const comum = { ...base, tipo, respondentes: valores.length };
  if (tipo === 'escolha') {
    return { ...comum, opcoes: opcoesDe(contar(valores, extra.nomes), valores.length) };
  }
  if (tipo === 'multipla') {
    const nomes = (extra.nomes || []).filter(Boolean);
    return { ...comum, opcoes: opcoesDe(contar(valores.flatMap((v) => separarMultipla(v, nomes)), nomes), valores.length) };
  }
  if (tipo === 'nota') return { ...comum, ...resumirNotas(valores, extra) };
  if (tipo === 'valor') {
    const mapa = new Map([...contar(valores)].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
    return { ...comum, opcoes: opcoesDe(mapa, valores.length).map((o) => ({ ...o, nome: o.nome.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1') })) };
  }
  if (tipo === 'grade') {
    const nomes = extra.nomes || [];
    const legenda = Object.fromEntries(parseScaleLegendItems(extra.legenda || '').filter((l) => l.code).map((l) => [l.code, l.label]));
    const mapas = valores.map((v) => separarGrade(v, nomes));
    const itensVistos = [...new Set([...nomes, ...mapas.flatMap((m) => Object.keys(m))])];
    const colsVistas = [...new Set([...(extra.colunas || []), ...mapas.flatMap((m) => Object.values(m))])].filter((c) => c !== '');
    const itens = itensVistos.map((nome) => {
      const notas = mapas.map((m) => m[nome]).filter((v) => v !== undefined && v !== '');
      const mapa = contar(notas);
      return {
        nome,
        total: notas.length,
        media: media(notas.filter(ehNota).map(numero)),
        notas: Object.fromEntries(colsVistas.map((c) => [c, mapa.get(c) || 0]))
      };
    });
    return {
      ...comum,
      colunas: colsVistas.map((c) => ({ codigo: c, rotulo: legenda[c] || '' })),
      itens,
      media: media(itens.map((i) => i.media).filter((m) => m !== null))
    };
  }
  return {
    ...comum,
    textos: entradas.map((e) => ({ texto: String(e.resposta ?? '').trim(), quando: e.item?.criadoEm, id: e.item?.id })).filter((t) => t.texto)
  };
}

function ritmoDe(itens) {
  const tempos = itens.map((i) => Date.parse(i.criadoEm || '')).filter((t) => !Number.isNaN(t)).sort((a, b) => a - b);
  if (!tempos.length) return { passoMin: 1, pontos: [] };
  const minutos = (tempos[tempos.length - 1] - tempos[0]) / 60000;
  const passoMin = [1, 2, 5, 10, 15, 30, 60, 180, 720, 1440].find((p) => minutos / p <= 40) || 10080;
  const passo = passoMin * 60000;
  const inicio = Math.floor(tempos[0] / passo) * passo;
  const qtd = Math.floor((tempos[tempos.length - 1] - inicio) / passo) + 1;
  const pontos = Array.from({ length: Math.min(qtd, 400) }, (_, i) => ({ t: inicio + i * passo, n: 0, total: 0 }));
  tempos.forEach((t) => { const p = pontos[Math.min(pontos.length - 1, Math.floor((t - inicio) / passo))]; p.n += 1; });
  pontos.reduce((ac, p) => { p.total = ac + p.n; return p.total; }, 0);
  return { passoMin, pontos };
}

export function consolidar(presencas = [], config = null) {
  const cfg = config || {};
  const itens = [...presencas].sort((a, b) => String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')));
  const cardsP1 = (cfg.opcoesChegada || []).filter((o) => o?.ativo !== false && limpar(o?.titulo));
  const telas = (cfg.telasExtras || []).filter((t) => t && t.ativa !== false);
  const tituloP1 = [cfg.pergunta1Titulo, cfg.pergunta1Titulo2].filter(Boolean).join(' ') || 'Tela 1';

  // rótulo gravado => tela (para registros antigos, sem telaId)
  const usados = { [limpar(tituloP1)]: 1 };
  const porRotulo = {};
  telas.forEach((t, i) => {
    const r = limpar(tituloTela(t, i));
    usados[r] = (usados[r] || 0) + 1;
    porRotulo[usados[r] > 1 ? `${r} (${usados[r]})` : r] = t.id;
  });

  const principais = {}; // telaId => entradas
  const gavetas = {}; // telaId => { opcao => entradas }
  const orfas = new Map(); // rótulo => entradas
  const ids = new Set(telas.map((t) => t.id));

  itens.forEach((item) => {
    respostasDe(item).forEach((r) => {
      const rotulo = limpar(r.pergunta);
      const entrada = { item, resposta: Array.isArray(r.resposta) ? r.resposta.join(', ') : r.resposta };
      if (!limpar(entrada.resposta)) return;
      // gaveta = "Pergunta › Opção" (o título da própria pergunta também pode ter "›")
      const corte = rotulo.lastIndexOf(' › ');
      const pai = corte > 0 ? rotulo.slice(0, corte) : '';
      const ehGaveta = corte > 0 && (r.telaId ? porRotulo[rotulo] !== r.telaId : !porRotulo[rotulo]);
      if (ehGaveta) {
        const dono = r.telaId || porRotulo[pai] || (pai === limpar(tituloP1) ? 'p1' : null);
        if (dono === 'p1' || ids.has(dono)) {
          const op = rotulo.slice(corte + 3).replace(/ \(\d+\)$/, (m) => ((cfg.opcoesChegada || []).concat(telas.flatMap((t) => t.opcoes || [])).some((o) => limpar(o?.titulo) === rotulo.slice(corte + 3)) ? m : ''));
          gavetas[dono] = gavetas[dono] || {};
          (gavetas[dono][op] = gavetas[dono][op] || []).push(entrada);
          return;
        }
      } else if (r.telaId === 'p1') {
        return; // a Tela 1 vem de comoChegou
      } else {
        const dono = ids.has(r.telaId) ? r.telaId : !r.telaId ? porRotulo[rotulo] : null;
        if (dono) { (principais[dono] = principais[dono] || []).push(entrada); return; }
      }
      if (!orfas.has(rotulo)) orfas.set(rotulo, []);
      orfas.get(rotulo).push(entrada);
    });
  });

  const perguntas = [];
  const addGavetas = (dono, opcoes) => {
    Object.entries(gavetas[dono] || {}).forEach(([op, entradas]) => {
      const g = (opcoes || []).find((o) => limpar(o?.titulo) === op)?.gaveta || {};
      const base = { id: `${dono}__${op}`, titulo: limpar(g.pergunta || g.titulo || '') || `Quem respondeu "${op}"`, detalhe: `Complemento de "${op}"`, filha: true };
      const t = g.tipo || 'texto_longo';
      const tipo = ['radio', 'dropdown', 'cards', 'opcoes', 'select'].includes(t) ? 'escolha' : t === 'checkbox' ? 'multipla' : ['slider', 'rating'].includes(t) ? 'nota' : ['data', 'hora'].includes(t) ? 'valor' : 'texto';
      const nomes = (g.opcoes || []).map((o) => limpar(typeof o === 'string' ? o : o?.titulo));
      perguntas.push(montar(base, tipo, entradas, { nomes, min: g.sliderMin, max: g.sliderMax, passo: g.sliderStep, unidade: g.sliderUnidade }));
    });
  };

  if (cardsP1.length) {
    const ignorar = new Set(['Não respondeu', 'Participante', limpar(tituloP1), limpar(cfg.pergunta1Titulo), '']);
    const entradas = itens.filter((i) => !ignorar.has(limpar(i.comoChegou))).map((item) => ({ item, resposta: item.comoChegou }));
    perguntas.push(montar({ id: 'p1', titulo: limpar(tituloP1) }, 'escolha', entradas, { nomes: cardsP1.map((o) => limpar(o.titulo)) }));
    addGavetas('p1', cfg.opcoesChegada);
  }

  telas.forEach((t, i) => {
    const entradas = principais[t.id] || [];
    const nomes = (t.opcoes || []).filter((o) => o?.ativo !== false).map((o) => limpar(o?.titulo)).filter(Boolean);
    const base = { id: t.id, titulo: limpar(tituloTela(t, i)), detalhe: limpar(t.subtitulo) };
    const tipo = t.tipo || 'cards';
    if (TIPOS_ESCOLHA.includes(tipo)) perguntas.push(montar(base, 'escolha', entradas, { nomes }));
    else if (tipo === 'checkbox') perguntas.push(montar(base, 'multipla', entradas, { nomes }));
    else if (tipo === 'grade') perguntas.push(montar(base, 'grade', entradas, { nomes, colunas: t.colunasGrade, legenda: t.legendaEscala }));
    else if (tipo === 'rating') perguntas.push(montar(base, 'nota', entradas, { min: 1, max: 5, passo: 1, unidade: (v) => (v === 1 ? ' estrela' : ' estrelas') }));
    else if (tipo === 'slider') perguntas.push(montar(base, 'nota', entradas, { min: Number(t.sliderMin ?? 0), max: Number(t.sliderMax ?? 10), passo: Number(t.sliderStep) || 1, unidade: limpar(t.sliderUnidade) }));
    else if (tipo === 'data' || tipo === 'hora') perguntas.push(montar(base, 'valor', entradas));
    else perguntas.push(montar(base, 'texto', entradas));
    addGavetas(t.id, t.opcoes);
  });

  [...orfas].forEach(([rotulo, entradas], i) => {
    const valores = entradas.map((e) => limpar(e.resposta));
    perguntas.push(montar({ id: `antiga_${i}`, titulo: rotulo, detalhe: 'Pergunta que não está mais no formulário' }, adivinharTipo(valores), entradas));
  });

  const pessoas = itens.reduce((a, i) => a + (Number(i.qtdPessoas) || 1), 0);
  if (cfg.mostrarTelaAcompanhantes !== false && itens.some((i) => Number(i.qtdPessoas) > 1)) {
    const mapa = contar(itens.map((i) => Number(i.qtdPessoas) || 1));
    perguntas.push({
      id: 'grupo', tipo: 'nota', titulo: limpar([cfg.pergunta2Titulo, cfg.pergunta2Titulo2].filter(Boolean).join(' ')) || 'Pessoas por grupo',
      respondentes: itens.length, media: pessoas / itens.length, unidadeMedia: 'pessoas',
      opcoes: [...mapa].sort((a, b) => a[0] - b[0]).map(([v, n]) => ({ nome: `${v} ${v === 1 ? 'pessoa' : 'pessoas'}`, n, pct: n / itens.length }))
    });
  }

  let numeroAtual = 0;
  perguntas.forEach((p) => {
    // "3. Título" já vem numerado pelo usuário: não numerar duas vezes
    const m = p.filha ? null : /^\s*(\d{1,3})[.)]\s+(.+)$/.exec(p.titulo);
    if (m) p.titulo = m[2];
    numeroAtual = m ? Number(m[1]) : numeroAtual + (p.filha ? 0 : 1);
    p.numero = p.filha ? '' : String(numeroAtual);
  });

  return {
    total: itens.length,
    pessoas,
    mediaGrupo: itens.length ? pessoas / itens.length : 0,
    primeira: itens[0]?.criadoEm || null,
    ultima: itens[itens.length - 1]?.criadoEm || null,
    ritmo: ritmoDe(itens),
    perguntas,
    itens
  };
}

// Uma coluna por pergunta (grade vira uma coluna por item): usado na aba "Respostas" das planilhas
export function tabelaRespostas(presencas = [], config = null) {
  const dados = consolidar(presencas, config);
  const colunas = [];
  const celulas = new Map(dados.itens.map((i) => [i, {}]));
  dados.perguntas.forEach((p) => {
    if (p.id === 'grupo') return;
    if (p.tipo === 'grade') p.itens.forEach((it) => colunas.push({ chave: `${p.id}|${it.nome}`, titulo: `${p.numero ? `${p.numero}. ` : ''}${p.titulo} | ${it.nome}`, nota: true }));
    else colunas.push({ chave: p.id, titulo: `${p.numero ? `${p.numero}. ` : ''}${p.titulo}${p.filha ? ` (${p.detalhe})` : ''}`, nota: p.tipo === 'nota', largo: p.tipo === 'texto' });
  });
  // reconsolida registro a registro: garante a mesma leitura dos gráficos
  dados.itens.forEach((item) => {
    const um = consolidar([item], config);
    const alvo = celulas.get(item);
    um.perguntas.forEach((p) => {
      const par = dados.perguntas.find((x) => x.id === p.id || (String(p.id).startsWith('antiga_') && x.titulo === p.titulo && String(x.id).startsWith('antiga_')));
      if (!par || p.id === 'grupo') return;
      if (p.tipo === 'grade') {
        p.itens.forEach((it) => {
          const col = Object.entries(it.notas).find(([, n]) => n > 0)?.[0];
          if (col !== undefined) alvo[`${par.id}|${it.nome}`] = col;
        });
      } else if (p.tipo === 'nota') {
        if (p.media !== null) alvo[par.id] = p.media;
      } else if (p.textos) {
        alvo[par.id] = p.textos.map((t) => t.texto).join('\n');
      } else {
        alvo[par.id] = p.opcoes.filter((o) => o.n > 0).map((o) => o.nome).join('; ');
      }
    });
  });
  return { dados, colunas, linhas: dados.itens.map((item) => ({ item, valores: celulas.get(item) })) };
}

// ---------- formatação comum (tela e arquivos) ----------
export const fmtPct = (p) => `${(p * 100).toLocaleString('pt-BR', { maximumFractionDigits: p > 0 && p < 0.1 ? 1 : 0 })}%`;
export const fmtNum = (n, casas = 1) => (n === null || n === undefined ? '' : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }));
export const fmtDataHora = (iso) => {
  const d = new Date(iso || NaN);
  return Number.isNaN(d.getTime()) ? '' : `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};
export const fmtHora = (iso) => {
  const d = new Date(iso || NaN);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
export const nomeArquivo = (titulo, ext) => {
  const base = String(titulo || 'evento').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'evento';
  const d = new Date();
  const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `relatorio_${base}_${dia}.${ext}`;
};

// Cores das notas (pior → melhor), com cinza no meio; sem nota (NA) fica neutro
const mistura = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};
const ESCALAS = {
  escuro: { ruim: '#e66767', meio: '#64748b', bom: '#3987e5', sem: '#334155' },
  claro: { ruim: '#d03b3b', meio: '#dddcd6', bom: '#2a78d6', sem: '#f0efec' }
};
export function coresNotas(colunas, modo = 'escuro') {
  const e = ESCALAS[modo];
  const notas = colunas.filter((c) => ehNota(c.codigo)).map((c) => numero(c.codigo)).sort((a, b) => a - b);
  const textuais = notas.length === 0 ? colunas.filter((c) => !/^n\/?a$/i.test(c.codigo)) : [];
  return Object.fromEntries(colunas.map((c) => {
    let p = null;
    if (ehNota(c.codigo)) p = notas.length > 1 ? notas.indexOf(numero(c.codigo)) / (notas.length - 1) : 1;
    else if (textuais.length) p = textuais.length > 1 ? textuais.indexOf(c) / (textuais.length - 1) : 1;
    if (p === null || p < 0) return [c.codigo, e.sem];
    return [c.codigo, p < 0.5 ? mistura(e.ruim, e.meio, p * 2) : mistura(e.meio, e.bom, (p - 0.5) * 2)];
  }));
}
