// ==========================================
// GRAVADOR .XLS DE VERDADE (BIFF8, Excel 97-2003), com cores, bordas e formatos.
// Não é um HTML renomeado: abre sem o aviso de "formato diferente da extensão".
// ==========================================
import { ESTILOS, serialExcel, semControle } from './planilha';

class Bytes {
  constructor() { this.p = []; this.n = 0; }
  raw(u8) { this.p.push(u8); this.n += u8.length; return this; }
  u8(...v) { return this.raw(Uint8Array.from(v)); }
  u16(...v) { const b = new DataView(new ArrayBuffer(v.length * 2)); v.forEach((x, i) => b.setUint16(i * 2, x & 0xffff, true)); return this.raw(new Uint8Array(b.buffer)); }
  u32(...v) { const b = new DataView(new ArrayBuffer(v.length * 4)); v.forEach((x, i) => b.setUint32(i * 4, x >>> 0, true)); return this.raw(new Uint8Array(b.buffer)); }
  f64(v) { const b = new DataView(new ArrayBuffer(8)); b.setFloat64(0, v, true); return this.raw(new Uint8Array(b.buffer)); }
  // texto: 1 byte por letra quando cabe em Latin-1, senão UTF-16
  txt(t, curto = false) {
    const larga = /[^\u0000-ÿ]/.test(t);
    if (curto) this.u8(t.length); else this.u16(t.length);
    this.u8(larga ? 1 : 0);
    const b = new Uint8Array(t.length * (larga ? 2 : 1));
    for (let i = 0; i < t.length; i++) { const k = t.charCodeAt(i); if (larga) { b[i * 2] = k & 255; b[i * 2 + 1] = k >> 8; } else b[i] = k; }
    return this.raw(b);
  }
  reg(tipo, corpo) { const d = corpo ? corpo.out() : new Uint8Array(0); return this.u16(tipo, d.length).raw(d); }
  out() { const o = new Uint8Array(this.n); let i = 0; this.p.forEach((x) => { o.set(x, i); i += x.length; }); return o; }
}
const B = () => new Bytes();
const bof = (tipo) => B().u16(0x0600, tipo, 0x0dbb, 0x07cc).u32(0x41, 0x06);

// Paleta padrão do Excel (índices 8 a 63); as nossas cores ocupam as primeiras posições livres
const PADRAO = '000000 FFFFFF FF0000 00FF00 0000FF FFFF00 FF00FF 00FFFF 800000 008000 000080 808000 800080 008080 C0C0C0 808080 9999FF 993366 FFFFCC CCFFFF 660066 FF8080 0066CC CCCCFF 000080 FF00FF FFFF00 00FFFF 800080 800000 008080 0000FF 00CCFF CCFFFF CCFFCC FFFF99 99CCFF FF99CC CC99FF FFCC99 3366FF 33CCCC 99CC00 FFCC00 FF9900 FF6600 666699 969696 003366 339966 003300 333300 993300 993366 333399 333333'.split(' ');

function preparar() {
  const paleta = [...PADRAO];
  const meus = new Map();
  let livre = 16;
  const cor = (hex) => {
    const h = hex.slice(1).toUpperCase();
    if (!meus.has(h)) { const i = PADRAO.indexOf(h); if (i >= 0 && i < 8) meus.set(h, i + 8); else { paleta[livre] = h; meus.set(h, livre + 8); livre += 1; } }
    return meus.get(h);
  };
  const fontes = [], formatos = [];
  const idFonte = (e) => {
    const k = JSON.stringify([e.tam || 11, !!e.negrito, e.cor || '#1F2933']);
    let i = fontes.findIndex((f) => f.k === k);
    if (i < 0) { fontes.push({ k, tam: e.tam || 11, negrito: !!e.negrito, cor: cor(e.cor || '#1F2933') }); i = fontes.length - 1; }
    return i >= 4 ? i + 1 : i; // o índice 4 não existe no BIFF
  };
  idFonte({});
  const idFormato = (f) => { if (!f) return 0; let i = formatos.indexOf(f); if (i < 0) { formatos.push(f); i = formatos.length - 1; } return 164 + i; };
  const borda = cor('#D5DCE4');
  const xfs = Object.values(ESTILOS).map((e) => {
    const al = ({ left: 1, center: 2, right: 3 }[e.alinhar] || 0) | (e.quebra ? 8 : 0) | ((e.topo ? 0 : 1) << 4);
    const l = e.borda ? 1 : 0;
    const cb = e.borda ? borda : 0;
    return B().u16(idFonte(e), idFormato(e.formato), 0x0001).u8(al, 0, 0, 0xfc)
      .u32(l | (l << 4) | (l << 8) | (l << 12) | (cb << 16) | (cb << 23))
      .u32(cb | (cb << 7) | ((e.fundo ? 1 : 0) << 26))
      .u16((e.fundo ? cor(e.fundo) : 0x40) | (0x41 << 7));
  });
  return { paleta, fontes, formatos, xfs };
}

function aba(a, i) {
  const s = B();
  const linhas = a.linhas.slice(0, 65536);
  const nCols = Math.min(256, Math.max(1, ...linhas.map((l) => l.cels.length)));
  const nomes = Object.keys(ESTILOS);
  s.reg(0x0809, bof(0x0010));
  s.reg(0x0081, B().u16(0x04c1 | (a.escala ? 0 : 0x0100))); // WSBOOL: ajustar à página
  if (a.quebras?.length) { const q = B().u16(a.quebras.length); a.quebras.forEach((r) => q.u16(r, 0, 255)); s.reg(0x001b, q); }
  s.reg(0x0014, B()); // cabeçalho vazio
  s.reg(0x0015, B().txt('&RPágina &P de &N'));
  s.reg(0x0026, B().f64(0.4)); s.reg(0x0027, B().f64(0.4)); s.reg(0x0028, B().f64(0.5)); s.reg(0x0029, B().f64(0.6));
  s.reg(0x00a1, B().u16(9, a.escala || 100, 1, 1, 0, a.paisagem ? 0 : 2, 600, 600).f64(0.3).f64(0.3).u16(1));
  s.reg(0x0055, B().u16(10));
  a.larguras.slice(0, 256).forEach((w, c) => s.reg(0x007d, B().u16(c, c, Math.round(w * 256), 15, 0, 0)));
  s.reg(0x0200, B().u32(0, linhas.length).u16(0, nCols, 0));
  for (let b = 0; b < linhas.length; b += 32) {
    const bloco = linhas.slice(b, b + 32);
    bloco.forEach((l, k) => s.reg(0x0208, B().u16(b + k, 0, Math.max(1, Math.min(256, l.cels.length)), Math.round((l.alt || 18) * 20), 0, 0).u32(0x00000140 | (15 << 16))));
    bloco.forEach((l, k) => l.cels.slice(0, 256).forEach((cel, c) => {
      const xf = 16 + Math.max(0, nomes.indexOf(cel.s));
      const cab = () => B().u16(b + k, c, xf);
      if (cel.v instanceof Date) s.reg(0x0203, cab().f64(serialExcel(cel.v)));
      else if (typeof cel.v === 'number' && Number.isFinite(cel.v)) s.reg(0x0203, cab().f64(cel.v));
      else {
        const t = semControle(cel.v ?? '').slice(0, 4000);
        if (t) s.reg(0x0204, cab().txt(t)); else s.reg(0x0201, cab());
      }
    }));
  }
  const fixo = a.congelar ? 0x0108 : 0;
  s.reg(0x023e, B().u16(0x0414 | 0x0020 | 0x0080 | (a.filtro ? 2 : 0) | fixo | (i === 0 ? 0x0200 : 0), 0, 0, 64, 0, 0, 0).u32(0));
  if (a.congelar) {
    s.reg(0x0041, B().u16(0, a.congelar, a.congelar, 0).u8(2, 0));
    s.reg(0x001d, B().u8(2).u16(a.congelar, 0, 0, 1, a.congelar, a.congelar).u8(0, 0));
  } else s.reg(0x001d, B().u8(3).u16(0, 0, 0, 1, 0, 0).u8(0, 0));
  const mesclas = a.mesclas.filter((m) => m[3] < 256);
  for (let k = 0; k < mesclas.length; k += 1000) {
    const parte = mesclas.slice(k, k + 1000);
    const m = B().u16(parte.length);
    parte.forEach(([r1, c1, r2, c2]) => m.u16(r1, r2, c1, c2));
    s.reg(0x00e5, m);
  }
  s.reg(0x000a);
  return s.out();
}

function livro(plan) {
  const { paleta, fontes, formatos, xfs } = preparar();
  const folhas = plan.abas.map(aba);
  const antes = B();
  antes.reg(0x0809, bof(0x0005));
  antes.reg(0x0042, B().u16(0x04b0));
  antes.reg(0x003d, B().u16(0, 0, 24000, 12000, 0x0038, 0, 0, 1, 600));
  const lista = [...fontes];
  while (lista.length < 5) lista.push(fontes[0]);
  lista.forEach((f) => antes.reg(0x0031, B().u16(f.tam * 20, 0, f.cor, f.negrito ? 700 : 400, 0).u8(0, 2, 0, 0).txt('Calibri', true)));
  formatos.forEach((f, i) => antes.reg(0x041e, B().u16(164 + i).txt(f)));
  for (let i = 0; i < 15; i++) antes.reg(0x00e0, B().u16(0, 0, 0xfff5).u8(0x20, 0, 0, i === 0 ? 0 : 0xf4).u32(0, 0).u16(0x20c0));
  antes.reg(0x00e0, B().u16(0, 0, 0x0001).u8(0x20, 0, 0, 0).u32(0, 0).u16(0x20c0));
  xfs.forEach((x) => antes.reg(0x00e0, x));
  antes.reg(0x0293, B().u16(0x8000).u8(0, 0xff));
  const pal = B().u16(56);
  paleta.forEach((h) => pal.u8(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 0));
  antes.reg(0x0092, pal);
  const a = antes.out();
  const entrada = (nome, pos) => B().u32(pos).u16(0).txt(nome.slice(0, 31), true);
  const tam = plan.abas.reduce((t, s) => t + 4 + entrada(s.nome, 0).n, 0);
  let pos = a.length + tam + 4;
  const tudo = B().raw(a);
  plan.abas.forEach((s, i) => { tudo.reg(0x0085, entrada(s.nome, pos)); pos += folhas[i].length; });
  tudo.reg(0x000a);
  folhas.forEach((f) => tudo.raw(f));
  return tudo.out();
}

// Contêiner OLE (CFB v3) com um único fluxo "Workbook"
function ole(dados) {
  const S = 512, FIM = 0xfffffffe, LIVRE = 0xffffffff, FAT = 0xfffffffd, DIF = 0xfffffffc;
  const nDados = Math.max(8, Math.ceil(dados.length / S)); // mínimo 4096 bytes: evita o mini-fluxo
  let nFat = 1, nDif = 0;
  for (;;) {
    const f = Math.ceil((nDados + 1 + nFat + nDif) / 128);
    const d = f > 109 ? Math.ceil((f - 109) / 127) : 0;
    if (f === nFat && d === nDif) break;
    nFat = f; nDif = d;
  }
  const total = nDados + 1 + nFat + nDif; // dados | diretório | FAT | DIFAT
  const out = new Uint8Array(S * (total + 1));
  const v = new DataView(out.buffer);
  out.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);
  v.setUint16(24, 0x3e, true); v.setUint16(26, 3, true); v.setUint16(28, 0xfffe, true); v.setUint16(30, 9, true); v.setUint16(32, 6, true);
  const iDir = nDados, iFat = nDados + 1, iDif = iFat + nFat;
  v.setUint32(44, nFat, true); v.setUint32(48, iDir, true); v.setUint32(56, 4096, true); v.setUint32(60, FIM, true); v.setUint32(64, 0, true);
  v.setUint32(68, nDif ? iDif : FIM, true); v.setUint32(72, nDif, true);
  for (let i = 0; i < 109; i++) v.setUint32(76 + i * 4, i < nFat ? iFat + i : LIVRE, true);
  out.set(dados, S);
  const d = S * (iDir + 1);
  const entrada = (n, nome, tipo, filho, ini, tam) => {
    const o = d + n * 128;
    for (let i = 0; i < nome.length; i++) v.setUint16(o + i * 2, nome.charCodeAt(i), true);
    v.setUint16(o + 64, nome ? (nome.length + 1) * 2 : 0, true);
    out[o + 66] = tipo; out[o + 67] = 1;
    v.setUint32(o + 68, LIVRE, true); v.setUint32(o + 72, LIVRE, true); v.setUint32(o + 76, filho, true);
    v.setUint32(o + 116, ini, true); v.setUint32(o + 120, tam, true);
  };
  entrada(0, 'Root Entry', 5, 1, FIM, 0);
  entrada(1, 'Workbook', 2, LIVRE, 0, Math.max(dados.length, nDados * S >= 4096 && dados.length < 4096 ? 4096 : dados.length));
  entrada(2, '', 0, LIVRE, 0, 0); entrada(3, '', 0, LIVRE, 0, 0);
  const f = S * (iFat + 1);
  for (let i = 0; i < nFat * 128; i++) {
    let x = LIVRE;
    if (i < nDados) x = i === nDados - 1 ? FIM : i + 1;
    else if (i === iDir) x = FIM;
    else if (i < iFat + nFat) x = FAT;
    else if (i < total) x = DIF;
    v.setUint32(f + i * 4, x, true);
  }
  for (let k = 0; k < nDif; k++) {
    const o = S * (iDif + k + 1);
    for (let i = 0; i < 127; i++) { const n = 109 + k * 127 + i; v.setUint32(o + i * 4, n < nFat ? iFat + n : LIVRE, true); }
    v.setUint32(o + 508, k + 1 < nDif ? iDif + k + 1 : FIM, true);
  }
  return out;
}

export const gerarXls = (plan) => ole(livro(plan));
