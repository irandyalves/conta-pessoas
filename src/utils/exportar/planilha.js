// ==========================================
// CONTEÚDO DAS PLANILHAS (igual no .xlsx e no .xls)
// Aqui só se decide O QUE vai em cada aba; xlsx.js e xls.js cuidam do formato do arquivo.
// Célula: { v: valor (texto, número ou Date), s: nome do estilo }
// ==========================================
import { tabelaRespostas, fmtDataHora, fmtPct, fmtNum, ehNota, coresNotas } from '../consolidar';

export const ESTILOS = {
  normal: {},
  titulo: { tam: 18, negrito: true, cor: '#0F2A4A' },
  subtitulo: { tam: 11, cor: '#52616F' },
  rotulo: { tam: 10, cor: '#52616F', fundo: '#EEF3F9', borda: true, alinhar: 'center', quebra: true },
  indicador: { tam: 16, negrito: true, cor: '#0F2A4A', fundo: '#EEF3F9', borda: true, alinhar: 'center', formato: '#,##0' },
  indicadorDec: { tam: 16, negrito: true, cor: '#0F2A4A', fundo: '#EEF3F9', borda: true, alinhar: 'center', formato: '#,##0.0' },
  indicadorTexto: { tam: 11, negrito: true, cor: '#0F2A4A', fundo: '#EEF3F9', borda: true, alinhar: 'center', quebra: true },
  cabecalho: { negrito: true, cor: '#FFFFFF', fundo: '#184F95', borda: true, quebra: true, alinhar: 'center' },
  cabecalhoEsq: { negrito: true, cor: '#FFFFFF', fundo: '#184F95', borda: true, quebra: true },
  pergunta: { tam: 13, negrito: true, cor: '#0F2A4A', quebra: true },
  detalhe: { tam: 10, cor: '#52616F', quebra: true },
  texto: { borda: true, quebra: true, topo: true },
  centro: { borda: true, alinhar: 'center', topo: true },
  inteiro: { borda: true, alinhar: 'center', topo: true, formato: '#,##0' },
  decimal: { borda: true, alinhar: 'center', topo: true, formato: '0.0' },
  nota: { borda: true, alinhar: 'center', topo: true, formato: '0.##' },
  pct: { borda: true, alinhar: 'center', topo: true, formato: '0.0%' },
  data: { borda: true, alinhar: 'center', topo: true, formato: 'dd/mm/yyyy' },
  hora: { borda: true, alinhar: 'center', topo: true, formato: 'hh:mm' },
  lider: { borda: true, quebra: true, topo: true, negrito: true, fundo: '#FFF4D6' },
  liderInteiro: { borda: true, alinhar: 'center', topo: true, negrito: true, fundo: '#FFF4D6', formato: '#,##0' },
  liderPct: { borda: true, alinhar: 'center', topo: true, negrito: true, fundo: '#FFF4D6', formato: '0.0%' },
  total: { borda: true, negrito: true, fundo: '#EEF3F9' },
  totalInteiro: { borda: true, negrito: true, fundo: '#EEF3F9', alinhar: 'center', formato: '#,##0' }
};

const c = (v, s = 'normal') => ({ v, s });
const numeroOuTexto = (v) => (ehNota(v) ? Number(String(v).replace(',', '.')) : v);
const num = (p) => (p.numero ? `${p.numero}. ` : '');
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export function destaqueDe(p) {
  if (!p.respondentes) return 'Sem respostas';
  if (p.tipo === 'texto') return plural(p.textos.length, 'comentário', 'comentários');
  if (p.tipo === 'grade') return p.media !== null ? `Média geral ${fmtNum(p.media)}` : `${p.itens.length} itens`;
  if (p.tipo === 'nota') return p.media !== null ? `Média ${fmtNum(p.media)}${p.unidadeMedia ? ` ${p.unidadeMedia}` : ''}` : '';
  const m = [...p.opcoes].sort((a, b) => b.n - a.n)[0];
  return m ? `${m.nome} (${fmtPct(m.pct)})` : '';
}

export function montarPlanilha({ presencas, config, titulo, periodo }, comGraficos = true) {
  const { dados, colunas, linhas } = tabelaRespostas(presencas, config);
  const gerado = `Gerado em ${fmtDataHora(new Date().toISOString())}`;
  const abas = [];

  // ---------- Resumo ----------
  const resumo = { nome: 'Resumo', larguras: [8, 58, 16, 44], linhas: [], mesclas: [], paisagem: false };
  const L = resumo.linhas;
  L.push({ alt: 30, cels: [c(titulo, 'titulo')] });
  L.push({ cels: [c(`Relatório consolidado de respostas. Período: ${periodo}`, 'subtitulo')] });
  L.push({ cels: [c(gerado, 'subtitulo')] });
  L.push({ cels: [] });
  resumo.mesclas.push([0, 0, 0, 3], [1, 0, 1, 3], [2, 0, 2, 3]);
  const primeira = dados.primeira ? fmtDataHora(dados.primeira) : 'Sem respostas';
  const ultima = dados.ultima ? fmtDataHora(dados.ultima) : 'Sem respostas';
  [['Respostas recebidas', dados.total, 'totalInteiro'], ['Pessoas representadas', dados.pessoas, 'totalInteiro'], ['Primeira resposta', primeira, 'totalInteiro'], ['Última resposta', ultima, 'totalInteiro']].forEach(([r, v, s]) => {
    const i = L.length;
    L.push({ cels: [c(r, 'total'), c('', 'total'), c(v, s), c('', s)] });
    resumo.mesclas.push([i, 0, i, 1], [i, 2, i, 3]);
  });
  L.push({ cels: [] });
  L.push({ cels: [c('Nº', 'cabecalho'), c('Pergunta', 'cabecalhoEsq'), c('Respostas', 'cabecalho'), c('Destaque', 'cabecalhoEsq')] });
  dados.perguntas.forEach((p) => L.push({
    cels: [c(p.numero ? Number(p.numero) : '', 'inteiro'), c(p.filha ? `${p.titulo} (${p.detalhe})` : p.titulo, 'texto'), c(p.respondentes, 'inteiro'), c(destaqueDe(p), 'texto')]
  }));
  abas.push(resumo);

  // ---------- Consolidado ----------
  const fechadas = dados.perguntas.filter((p) => p.tipo !== 'texto');
  if (fechadas.length) {
    const maxCols = Math.max(0, ...fechadas.filter((p) => p.tipo === 'grade').map((p) => p.colunas.length));
    const colsTabela = Math.max(3, maxCols + 3);
    const aba = { nome: 'Consolidado', larguras: [48, ...Array(colsTabela - 1).fill(13)], linhas: [], mesclas: [], graficos: [], blocos: [], paisagem: true };
    const R = aba.linhas;
    fechadas.forEach((p) => {
      const inicio = R.length;
      aba.blocos.push(inicio);
      aba.mesclas.push([R.length, 0, R.length, colsTabela - 1]);
      R.push({ alt: Math.max(22, 18 * Math.ceil((num(p).length + p.titulo.length) / 88)), cels: [c(`${num(p)}${p.titulo}`, 'pergunta')] });
      const extra = [p.detalhe, plural(p.respondentes, 'resposta', 'respostas'), p.media !== undefined && p.media !== null ? `média ${fmtNum(p.media)}` : '', p.tipo === 'multipla' ? 'aceita mais de uma opção' : ''].filter(Boolean).join('; ');
      aba.mesclas.push([R.length, 0, R.length, colsTabela - 1]);
      R.push({ cels: [c(extra, 'detalhe')] });
      const cab = R.length;
      let grafico = null;
      if (p.tipo === 'grade') {
        R.push({ cels: [c('Item', 'cabecalhoEsq'), ...p.colunas.map((k) => c(k.rotulo ? `${k.codigo}\n${k.rotulo}` : k.codigo, 'cabecalho')), c('Total', 'cabecalho'), c('Média', 'cabecalho')] });
        p.itens.forEach((it) => R.push({ cels: [c(it.nome, 'texto'), ...p.colunas.map((k) => c(it.notas[k.codigo], 'inteiro')), c(it.total, 'inteiro'), it.media === null ? c('', 'centro') : c(it.media, 'decimal')] }));
        if (p.itens.length && p.respondentes) {
          const cores = coresNotas(p.colunas, 'claro');
          grafico = { tipo: 'empilhado', series: p.colunas.map((k, i) => ({ nome: k.rotulo ? `${k.codigo} ${k.rotulo}` : k.codigo, nomeRef: [cab, 1 + i], col: 1 + i, cor: cores[k.codigo], valores: p.itens.map((it) => it.notas[k.codigo]) })), categorias: p.itens.map((it) => it.nome) };
        }
      } else {
        const ordenadas = p.tipo === 'escolha' || p.tipo === 'multipla' ? [...p.opcoes].sort((a, b) => b.n - a.n) : p.opcoes;
        const maior = Math.max(0, ...ordenadas.map((o) => o.n));
        R.push({ cels: [c(p.tipo === 'nota' ? 'Nota' : 'Opção', 'cabecalhoEsq'), c('Respostas', 'cabecalho'), c('%', 'cabecalho')] });
        ordenadas.forEach((o) => {
          const l = maior > 0 && o.n === maior;
          R.push({ cels: [c(o.nome, l ? 'lider' : 'texto'), c(o.n, l ? 'liderInteiro' : 'inteiro'), c(o.pct, l ? 'liderPct' : 'pct')] });
        });
        if (p.tipo !== 'multipla') R.push({ cels: [c('Total', 'total'), c(p.respondentes, 'totalInteiro'), c('', 'total')] });
        if (ordenadas.length && p.respondentes) grafico = { tipo: 'barras', series: [{ nome: 'Respostas', nomeRef: [cab, 1], col: 1, cor: '#2A78D6', valores: ordenadas.map((o) => o.n), destaque: ordenadas.map((o) => o.n === maior) }], categorias: ordenadas.map((o) => o.nome) };
      }
      if (grafico && comGraficos) {
        const n = grafico.categorias.length;
        const altura = Math.max(11, Math.min(34, n * 2 + (grafico.tipo === 'empilhado' ? 6 : 4)));
        aba.graficos.push({ ...grafico, titulo: p.titulo, primeira: cab + 1, ultima: cab + n, de: [inicio, colsTabela + 1], ate: [inicio + altura, colsTabela + 11] });
        // o próximo bloco só começa depois do gráfico
        while (R.length < inicio + altura + 1) R.push({ cels: [] });
      }
      R.push({ cels: [] });
    });
    abas.push(aba);
  }

  // ---------- Comentários ----------
  const textos = dados.perguntas.filter((p) => p.tipo === 'texto' && p.textos.length);
  if (textos.length) {
    const aba = { nome: 'Comentários', larguras: [46, 90, 13, 10], linhas: [], mesclas: [], congelar: 1, filtro: true, paisagem: true, repetir: 1 };
    aba.linhas.push({ cels: [c('Pergunta', 'cabecalhoEsq'), c('Comentário', 'cabecalhoEsq'), c('Data', 'cabecalho'), c('Hora', 'cabecalho')] });
    textos.forEach((p) => p.textos.forEach((t) => {
      const d = new Date(t.quando || NaN);
      const ok = !Number.isNaN(d.getTime());
      aba.linhas.push({ cels: [c(`${num(p)}${p.titulo}`, 'texto'), c(t.texto, 'texto'), c(ok ? d : '', 'data'), c(ok ? d : '', 'hora')] });
    }));
    abas.push(aba);
  }

  // ---------- Respostas ----------
  const comGrupo = dados.itens.some((i) => Number(i.qtdPessoas) > 1);
  const aba = {
    nome: 'Respostas',
    larguras: [7, 13, 10, ...(comGrupo ? [12] : []), ...colunas.map((k) => (k.largo ? 50 : k.nota ? 16 : 30))],
    linhas: [], mesclas: [], congelar: 1, filtro: true, paisagem: true, repetir: 1
  };
  aba.linhas.push({ cels: [c('Nº', 'cabecalho'), c('Data', 'cabecalho'), c('Hora', 'cabecalho'), ...(comGrupo ? [c('Pessoas', 'cabecalho')] : []), ...colunas.map((k) => c(k.titulo, 'cabecalho'))] });
  linhas.forEach(({ item, valores }, i) => {
    const d = new Date(item.criadoEm || NaN);
    const ok = !Number.isNaN(d.getTime());
    aba.linhas.push({
      cels: [
        c(i + 1, 'inteiro'), c(ok ? d : '', 'data'), c(ok ? d : '', 'hora'),
        ...(comGrupo ? [c(Number(item.qtdPessoas) || 1, 'inteiro')] : []),
        ...colunas.map((k) => {
          const v = valores[k.chave] ?? '';
          if (!k.nota) return c(v, 'texto');
          const n = numeroOuTexto(v);
          return c(n, typeof n === 'number' ? 'nota' : 'centro');
        })
      ]
    });
  });
  abas.push(aba);

  abas.forEach(ajustarAlturas);
  abas.filter((a) => a.blocos).forEach(paginar);
  return { titulo, abas, dados };
}

// Altura das linhas: o Excel não recalcula sozinho a altura de linha com quebra em arquivo gerado
function ajustarAlturas(aba) {
  aba.linhas.forEach((l, r) => {
    if (l.alt) return;
    let linhas = 1;
    l.cels.forEach((cel, i) => {
      const st = ESTILOS[cel.s] || {};
      if (!st.quebra || typeof cel.v !== 'string' || !cel.v) return;
      const mescla = aba.mesclas.find((m) => m[0] === r && m[1] === i);
      const larg = mescla ? aba.larguras.slice(mescla[1], mescla[3] + 1).reduce((a, b) => a + b, 0) : aba.larguras[i] || 10;
      const porLinha = Math.max(4, (larg - 1.5) * (st.negrito ? 0.92 : 1) * (11 / (st.tam || 11)));
      const n = cel.v.split('\n').reduce((a, t) => a + Math.max(1, quebras(t, porLinha)), 0);
      linhas = Math.max(linhas, n);
    });
    l.alt = Math.min(409, Math.max(18, linhas * 15 + 3));
  });
}

// Cada pergunta (tabela + gráfico) começa e termina na mesma folha impressa
function paginar(aba) {
  const pt = (w) => (w * 7 + 5) * 0.75;
  const fimGraf = Math.max(0, ...(aba.graficos || []).map((g) => g.ate[1]));
  const largura = aba.larguras.reduce((a, w) => a + pt(w), 0) + Math.max(0, fimGraf - aba.larguras.length) * pt(8.43);
  aba.escala = Math.max(10, Math.min(100, Math.floor((760 / largura) * 100)));
  const util = 480 / (aba.escala / 100);
  const soma = (de, ate) => aba.linhas.slice(de, ate).reduce((a, l) => a + (l.alt || 18), 0);
  aba.quebras = [];
  let acumulado = 0;
  aba.blocos.forEach((ini, i) => {
    const h = soma(ini, aba.blocos[i + 1] ?? aba.linhas.length);
    if (acumulado > 0 && acumulado + h > util) { aba.quebras.push(ini); acumulado = 0; }
    acumulado += h;
    while (acumulado > util) acumulado -= util;
  });
}

function quebras(texto, porLinha) {
  let n = 1, atual = 0;
  texto.split(' ').forEach((p) => {
    let w = p.length;
    if (atual && atual + 1 + w > porLinha) { n += 1; atual = 0; }
    while (w > porLinha) { n += 1; w -= porLinha; }
    atual += (atual ? 1 : 0) + w;
  });
  return n;
}

// Data local => número de série do Excel
export const serialExcel = (d) => (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()) - Date.UTC(1899, 11, 30)) / 86400000;
export const semControle = (t) => String(t ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\ufffe\uffff]/g, '').replace(/\r\n?/g, '\n').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
