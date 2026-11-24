// ==========================================
// RELATÓRIO EM PDF (A4): texto selecionável e gráficos vetoriais.
// Nenhum bloco é cortado: barra, linha de tabela e comentário só quebram de página inteiros.
// ==========================================
import { jsPDF } from 'jspdf';
import { consolidar, coresNotas, fmtDataHora, fmtHora, fmtNum, fmtPct } from '../consolidar';

const A4 = { w: 210, h: 297 };
const M = { e: 18, d: 18, t: 18, b: 20 };
const LARG = A4.w - M.e - M.d;
const COR = { tinta: '#0F2A4A', texto: '#26323E', suave: '#5B6875', linha: '#DCE2E9', trilho: '#EEF2F6', barra: '#2A78D6', lider: '#E0A100', faixa: '#0F2A4A' };

// A fonte embutida cobre Latin-1 e pontuação; o resto (emoji etc.) sairia como quadrado
const TROCAS = { '→': '->', '←': '<-', '≥': '>=', '≤': '<=', '★': 'estrelas', '✓': 'ok', '\u00a0': ' ', '\u2028': '\n', '\u2029': '\n', '\t': ' ' };
export const textoPdf = (t) => String(t ?? '').normalize('NFC')
  .replace(/[→←≥≤★✓\u00a0\u2028\u2029\t]/g, (k) => TROCAS[k])
  .replace(/[^\n -~¡-ÿıŒœ\u2010-\u2015‘-\u201e\u2020-\u2022…\u2030\u2039›€™]/gu, '')
  .replace(/[ ]{2,}/g, ' ').trim();

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const claro = (h) => { const [r, g, b] = rgb(h).map((v) => v / 255); return 0.299 * r + 0.587 * g + 0.114 * b > 0.6; };

export function gerarPdf({ presencas, config, titulo, periodo, fontes }) {
  const dados = consolidar(presencas, config);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  let F = 'helvetica';
  if (fontes?.regular && fontes?.negrito) {
    doc.addFileToVFS('Jakarta-Regular.ttf', fontes.regular);
    doc.addFont('Jakarta-Regular.ttf', 'Jakarta', 'normal');
    doc.addFileToVFS('Jakarta-Bold.ttf', fontes.negrito);
    doc.addFont('Jakarta-Bold.ttf', 'Jakarta', 'bold');
    F = 'Jakarta';
  }
  doc.setProperties({ title: textoPdf(`${titulo}: relatório de respostas`), author: 'RESPONDER', creator: 'RESPONDER' });
  doc.setLanguage('pt-BR');

  let y = M.t;
  const fonte = (tam, negrito = false, cor = COR.texto) => { doc.setFont(F, negrito ? 'bold' : 'normal'); doc.setFontSize(tam); doc.setTextColor(...rgb(cor)); };
  const alt = (tam) => tam * 0.3528 * 1.32;
  const quebrar = (t, larg) => doc.splitTextToSize(textoPdf(t) || ' ', larg).flatMap((linha) => {
    // palavra gigante sem espaço (link): corta na largura
    if (doc.getTextWidth(linha) <= larg + 0.5) return [linha];
    const out = []; let a = '';
    for (const ch of linha) { if (doc.getTextWidth(a + ch) > larg) { out.push(a); a = ch; } else a += ch; }
    return [...out, a];
  });
  // escreve linhas com o topo em yTopo
  const escrever = (linhas, x, yTopo, tam, op) => linhas.forEach((l, i) => doc.text(l, x, yTopo + alt(tam) * i + tam * 0.3528 * 0.98, op));
  const caixa = (x, yy, w, h, cor, r = 0) => { if (w <= 0 || h <= 0) return; doc.setFillColor(...rgb(cor)); if (r && w > r * 2) doc.roundedRect(x, yy, w, h, r, r, 'F'); else doc.rect(x, yy, w, h, 'F'); };
  const limite = A4.h - M.b;
  const novaPagina = () => { doc.addPage(); y = M.t; };
  const caber = (h) => { if (y + h > limite) { novaPagina(); return true; } return false; };

  // ---------- capa ----------
  caixa(0, 0, A4.w, 4, COR.faixa);
  caixa(0, 4, A4.w, 0.9, COR.lider);
  y = 17;
  fonte(21, true, COR.tinta);
  const lt = quebrar(titulo || 'Evento', LARG);
  escrever(lt, M.e, y, 21);
  y += alt(21) * lt.length + 1;
  fonte(10.5, false, COR.suave);
  escrever(['Relatório consolidado de respostas'], M.e, y, 10.5);
  y += alt(10.5);
  escrever([textoPdf(`Período: ${periodo}`)], M.e, y, 10.5);
  y += alt(10.5) + 5;

  const kpis = [
    [dados.total.toLocaleString('pt-BR'), dados.total === 1 ? 'resposta recebida' : 'respostas recebidas'],
    ...(dados.pessoas !== dados.total ? [[dados.pessoas.toLocaleString('pt-BR'), 'pessoas representadas']] : []),
    [String(dados.perguntas.filter((p) => !p.filha).length), 'perguntas'],
    ...(dados.primeira ? [[`${fmtHora(dados.primeira)} a ${fmtHora(dados.ultima)}`, 'primeira e última resposta']] : [])
  ];
  const lk = LARG / kpis.length;
  doc.setDrawColor(...rgb(COR.linha)); doc.setLineWidth(0.3);
  doc.line(M.e, y, A4.w - M.d, y);
  kpis.forEach(([v, r], i) => {
    fonte(i === 0 ? 22 : 16, true, COR.tinta);
    doc.text(textoPdf(v), M.e + lk * i + (i ? 4 : 0), y + 11.5);
    fonte(8.5, false, COR.suave);
    doc.text(textoPdf(r), M.e + lk * i + (i ? 4 : 0), y + 17);
    if (i) doc.line(M.e + lk * i, y + 4, M.e + lk * i, y + 18);
  });
  y += 21;
  doc.line(M.e, y, A4.w - M.d, y);
  y += 7;

  // ritmo de chegada
  const pts = dados.ritmo.pontos;
  if (pts.length > 2) {
    const passo = dados.ritmo.passoMin;
    fonte(10, true, COR.tinta);
    escrever([`Respostas a cada ${passo === 1 ? 'minuto' : passo < 60 ? `${passo} minutos` : passo === 60 ? 'hora' : passo < 1440 ? `${passo / 60} horas` : 'dia'}`], M.e, y, 10);
    y += 7;
    const h = 20, max = Math.max(...pts.map((p) => p.n)), lw = LARG / pts.length;
    pts.forEach((p, i) => { if (p.n) caixa(M.e + lw * i + lw * 0.12, y + h - (h * p.n) / max, lw * 0.76, (h * p.n) / max, COR.barra); });
    doc.setDrawColor(...rgb('#B8C1CB')); doc.line(M.e, y + h, A4.w - M.d, y + h);
    fonte(8, false, COR.suave);
    const rot = (t) => (passo >= 1440 ? new Date(t).toLocaleDateString('pt-BR') : fmtHora(new Date(t).toISOString()));
    doc.text(rot(pts[0].t), M.e, y + h + 4.2);
    doc.text(rot(pts[pts.length - 1].t), A4.w - M.d, y + h + 4.2, { align: 'right' });
    doc.text(`pico: ${max}`, A4.w / 2, y + h + 4.2, { align: 'center' });
    y += h + 11;
  }

  if (!dados.total) {
    fonte(11, false, COR.suave);
    escrever(quebrar('Ainda não há respostas neste período.', LARG), M.e, y, 11);
  }

  // ---------- perguntas ----------
  const cabecalho = (p, continua = false) => {
    const num = p.numero ? `${p.numero}. ` : '';
    fonte(12.5, true, COR.tinta);
    const lin = quebrar(`${num}${p.titulo}${continua ? ' (continuação)' : ''}`, LARG);
    const sub = continua ? '' : [p.detalhe, `${p.respondentes} ${p.respondentes === 1 ? 'resposta' : 'respostas'}`, p.media !== undefined && p.media !== null ? `média ${fmtNum(p.media)}` : '', p.tipo === 'multipla' ? 'cada pessoa pôde marcar mais de uma opção' : ''].filter(Boolean).join('; ');
    fonte(9, false, COR.suave);
    const ls = sub ? quebrar(sub, LARG) : [];
    return {
      h: alt(12.5) * lin.length + alt(9) * ls.length + 3.5,
      desenhar: () => {
        fonte(12.5, true, COR.tinta); escrever(lin, M.e, y, 12.5); y += alt(12.5) * lin.length;
        fonte(9, false, COR.suave); escrever(ls, M.e, y, 9); y += alt(9) * ls.length + 3.5;
      }
    };
  };

  // desenha linhas indivisíveis, repetindo o título quando a página vira
  const blocos = (p, linhas, preparo) => {
    const cab = cabecalho(p);
    const pre = preparo?.h || 0;
    const total = cab.h + pre + linhas.reduce((a, l) => a + l.h, 0);
    const util = limite - M.t;
    const minimo = cab.h + pre + linhas.slice(0, 2).reduce((a, l) => a + l.h, 0);
    if (y > M.t + 1 && y + (total <= util ? total : minimo) > limite) novaPagina();
    cab.desenhar();
    preparo?.desenhar();
    linhas.forEach((l) => {
      if (caber(l.h)) { cabecalho(p, true).desenhar(); preparo?.desenhar(); }
      l.desenhar();
      y += l.h;
    });
    y += 8;
  };

  const linhasBarras = (p) => {
    const ordenadas = ['escolha', 'multipla'].includes(p.tipo) ? [...p.opcoes].sort((a, b) => b.n - a.n) : p.opcoes;
    const maior = Math.max(1, ...ordenadas.map((o) => o.n));
    const lNome = p.tipo === 'nota' ? 26 : 66, lVal = 26, x0 = M.e + lNome + 3, lBar = LARG - lNome - 3 - lVal;
    return ordenadas.map((o) => {
      fonte(9.5);
      const nome = quebrar(o.nome, lNome);
      const h = Math.max(7, alt(9.5) * nome.length + 2.6);
      const lider = o.n > 0 && o.n === maior;
      return {
        h,
        desenhar: () => {
          fonte(9.5, lider, COR.texto);
          const hTxt = alt(9.5) * nome.length;
          escrever(nome, M.e, y + (h - hTxt) / 2, 9.5);
          caixa(x0, y + h / 2 - 2.1, lBar, 4.2, COR.trilho, 1);
          caixa(x0, y + h / 2 - 2.1, (lBar * o.n) / maior, 4.2, lider ? COR.lider : COR.barra, 1);
          fonte(9.5, true, COR.tinta);
          doc.text(String(o.n), x0 + lBar + 10, y + h / 2 + 1.2, { align: 'right' });
          fonte(9, false, COR.suave);
          doc.text(fmtPct(o.pct), A4.w - M.d, y + h / 2 + 1.2, { align: 'right' });
        }
      };
    });
  };

  const desenharGrade = (p) => {
    const cores = coresNotas(p.colunas, 'claro');
    fonte(8.5);
    // legenda
    const itensLeg = p.colunas.map((k) => textoPdf(k.rotulo ? `${k.codigo} ${k.rotulo}` : k.codigo));
    let lx = 0, ly = 0;
    const pos = itensLeg.map((t) => { const w = doc.getTextWidth(t) + 9; if (lx + w > LARG && lx > 0) { lx = 0; ly += 5; } const r = [lx, ly]; lx += w; return r; });
    const preparo = {
      h: ly + 8,
      desenhar: () => {
        itensLeg.forEach((t, i) => {
          const [dx, dy] = pos[i];
          caixa(M.e + dx, y + dy, 3.2, 3.2, cores[p.colunas[i].codigo], 0.6);
          fonte(8.5, false, COR.texto);
          doc.text(t, M.e + dx + 4.6, y + dy + 2.75);
        });
        fonte(8.5, true, COR.suave);
        doc.text('Média', A4.w - M.d, y + 2.75 + ly, { align: 'right' });
        y += ly + 8;
      }
    };
    const lNome = 66, lVal = 14, x0 = M.e + lNome + 3, lBar = LARG - lNome - 3 - lVal;
    const linhas = p.itens.map((it) => {
      fonte(9.5);
      const nome = quebrar(it.nome, lNome);
      const h = Math.max(9, alt(9.5) * nome.length + 3);
      return {
        h,
        desenhar: () => {
          fonte(9.5);
          escrever(nome, M.e, y + (h - alt(9.5) * nome.length) / 2, 9.5);
          let x = x0;
          if (!it.total) caixa(x0, y + h / 2 - 2.8, lBar, 5.6, COR.trilho);
          p.colunas.forEach((k) => {
            const n = it.notas[k.codigo];
            if (!n) return;
            const w = (lBar * n) / it.total;
            caixa(x, y + h / 2 - 2.8, Math.max(0.2, w - 0.4), 5.6, cores[k.codigo]);
            fonte(8, true, claro(cores[k.codigo]) ? '#1A222B' : '#FFFFFF');
            const t = String(n);
            if (doc.getTextWidth(t) + 1.6 < w) doc.text(t, x + (w - 0.4) / 2, y + h / 2 + 1, { align: 'center' });
            x += w;
          });
          fonte(10, true, COR.tinta);
          doc.text(it.media === null ? '' : fmtNum(it.media), A4.w - M.d, y + h / 2 + 1.2, { align: 'right' });
        }
      };
    });
    blocos(p, linhas, preparo);
  };

  const desenharTextos = (p) => {
    const linhas = p.textos.flatMap((t) => {
      fonte(9.5);
      const todas = t.texto.split(/\n+/).flatMap((par) => (textoPdf(par) ? quebrar(par, LARG - 22) : []));
      if (!todas.length) return [];
      const pedacos = [];
      for (let i = 0; i < todas.length; i += 30) pedacos.push(todas.slice(i, i + 30)); // comentário enorme
      return pedacos.map((ls, i) => ({
        h: alt(9.5) * ls.length + (i === pedacos.length - 1 ? 3.6 : 0),
        desenhar: () => {
          const h = alt(9.5) * ls.length;
          caixa(M.e, y + 0.3, 0.8, h - 0.2, COR.barra);
          fonte(9.5); escrever(ls, M.e + 4, y, 9.5);
          if (i === 0) { fonte(8, false, COR.suave); doc.text(fmtHora(t.quando), A4.w - M.d, y + 3.4, { align: 'right' }); }
        }
      }));
    });
    blocos(p, linhas);
  };

  if (dados.total) {
    dados.perguntas.forEach((p) => {
      if (!p.respondentes) {
        fonte(9.5, false, COR.suave);
        blocos(p, [{ h: 5, desenhar: () => { fonte(9.5, false, COR.suave); escrever(['Nenhuma resposta nesta pergunta.'], M.e, y, 9.5); } }]);
      } else if (p.tipo === 'grade') desenharGrade(p);
      else if (p.tipo === 'texto') desenharTextos(p);
      else blocos(p, linhasBarras(p));
    });
  }

  // ---------- rodapé ----------
  const n = doc.getNumberOfPages();
  const gerado = `Gerado em ${fmtDataHora(new Date().toISOString())}`;
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...rgb(COR.linha)); doc.setLineWidth(0.3);
    doc.line(M.e, A4.h - 14, A4.w - M.d, A4.h - 14);
    fonte(8, false, COR.suave);
    let nome = textoPdf(titulo);
    while (doc.getTextWidth(nome) > 78 && nome.length > 5) nome = `${nome.slice(0, -4).trim()}…`;
    doc.text(nome, M.e, A4.h - 9.5);
    doc.text(gerado, A4.w / 2 + 10, A4.h - 9.5, { align: 'center' });
    doc.text(`Página ${i} de ${n}`, A4.w - M.d, A4.h - 9.5, { align: 'right' });
  }
  return doc;
}
