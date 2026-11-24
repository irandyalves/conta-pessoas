// ==========================================
// GRAVADOR .XLSX (Excel 2007 em diante): estilos, filtros, painéis fixos e
// gráficos NATIVOS do Excel (editáveis), não imagens.
// ==========================================
import JSZip from 'jszip';
import { ESTILOS, serialExcel, semControle } from './planilha';

const esc = (t) => semControle(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const letra = (i) => { let s = ''; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
const ref = (r, col) => `${letra(col)}${r + 1}`;
const abs = (r, col) => `$${letra(col)}$${r + 1}`;
const argb = (h) => `FF${h.slice(1).toUpperCase()}`;
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const RELS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function estilosXml() {
  const nomes = Object.keys(ESTILOS);
  const fontes = [], fundos = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'], formatos = [];
  const id = (lista, x) => { let i = lista.indexOf(x); if (i < 0) { lista.push(x); i = lista.length - 1; } return i; };
  const fonte = (e) => `<font>${e.negrito ? '<b/>' : ''}<sz val="${e.tam || 11}"/><color rgb="${argb(e.cor || '#1F2933')}"/><name val="Calibri"/><family val="2"/></font>`;
  id(fontes, fonte({}));
  const xfs = nomes.map((n) => {
    const e = ESTILOS[n];
    const f = id(fontes, fonte(e));
    const fu = e.fundo ? id(fundos, `<fill><patternFill patternType="solid"><fgColor rgb="${argb(e.fundo)}"/><bgColor indexed="64"/></patternFill></fill>`) : 0;
    const nf = e.formato ? 164 + id(formatos, e.formato) : 0;
    const al = `<alignment vertical="${e.topo ? 'top' : 'center'}"${e.alinhar ? ` horizontal="${e.alinhar}"` : ''}${e.quebra ? ' wrapText="1"' : ''}/>`;
    return `<xf numFmtId="${nf}" fontId="${f}" fillId="${fu}" borderId="${e.borda ? 1 : 0}" xfId="0" applyFont="1" applyAlignment="1"${nf ? ' applyNumberFormat="1"' : ''}${fu ? ' applyFill="1"' : ''}${e.borda ? ' applyBorder="1"' : ''}>${al}</xf>`;
  });
  const lado = (n) => `<${n} style="thin"><color rgb="FFD5DCE4"/></${n}>`;
  return `${XML}<styleSheet xmlns="${NS}">${formatos.length ? `<numFmts count="${formatos.length}">${formatos.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${esc(f)}"/>`).join('')}</numFmts>` : ''}<fonts count="${fontes.length}">${fontes.join('')}</fonts><fills count="${fundos.length}">${fundos.join('')}</fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border>${['left', 'right', 'top', 'bottom'].map(lado).join('')}<diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

const texto = (tam, cor = '404B57', negrito = false) => `<a:defRPr sz="${tam * 100}" b="${negrito ? 1 : 0}"><a:solidFill><a:srgbClr val="${cor}"/></a:solidFill></a:defRPr>`;

function graficoXml(g, aba) {
  const q = `'${aba.replace(/'/g, "''")}'`;
  const empilhado = g.tipo === 'empilhado';
  const n = g.categorias.length;
  const cat = `<c:cat><c:strRef><c:f>${esc(`${q}!${abs(g.primeira, 0)}:${abs(g.ultima, 0)}`)}</c:f><c:strCache><c:ptCount val="${n}"/>${g.categorias.map((t, i) => `<c:pt idx="${i}"><c:v>${esc(t)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`;
  const series = g.series.map((s, i) => {
    const pontos = (s.destaque || []).map((d, k) => (d ? `<c:dPt><c:idx val="${k}"/><c:invertIfNegative val="0"/><c:bubble3D val="0"/><c:spPr><a:solidFill><a:srgbClr val="E0A100"/></a:solidFill></c:spPr></c:dPt>` : '')).join('');
    const rotulos = empilhado
      ? ''
      : `<c:dLbls><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>${texto(10, '1F2933', true)}</a:pPr><a:endParaRPr lang="pt-BR"/></a:p></c:txPr><c:dLblPos val="outEnd"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`;
    return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>${esc(`${q}!${abs(...s.nomeRef)}`)}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${esc(s.nome)}</c:v></c:pt></c:strCache></c:strRef></c:tx><c:spPr><a:solidFill><a:srgbClr val="${s.cor.slice(1).toUpperCase()}"/></a:solidFill></c:spPr><c:invertIfNegative val="0"/>${pontos}${rotulos}${cat}<c:val><c:numRef><c:f>${esc(`${q}!${abs(g.primeira, s.col)}:${abs(g.ultima, s.col)}`)}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${n}"/>${s.valores.map((v, k) => `<c:pt idx="${k}"><c:v>${v}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:val></c:ser>`;
  }).join('');
  const titulo = `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr>${texto(12, '0F2A4A', true)}</a:pPr><a:r><a:rPr lang="pt-BR" sz="1200" b="1"><a:solidFill><a:srgbClr val="0F2A4A"/></a:solidFill></a:rPr><a:t>${esc(g.titulo.length > 110 ? `${g.titulo.slice(0, 108)}…` : g.titulo)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>`;
  const txEixo = `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>${texto(9)}</a:pPr><a:endParaRPr lang="pt-BR"/></a:p></c:txPr>`;
  return `${XML}<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${RELS}"><c:roundedCorners val="0"/><c:chart>${titulo}<c:autoTitleDeleted val="0"/><c:plotArea><c:layout/><c:barChart><c:barDir val="bar"/><c:grouping val="${empilhado ? 'percentStacked' : 'clustered'}"/><c:varyColors val="0"/>${series}<c:gapWidth val="${empilhado ? 45 : 60}"/>${empilhado ? '<c:overlap val="100"/>' : ''}<c:axId val="111"/><c:axId val="222"/></c:barChart><c:catAx><c:axId val="111"/><c:scaling><c:orientation val="maxMin"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="low"/><c:spPr><a:ln><a:solidFill><a:srgbClr val="C3C9D1"/></a:solidFill></a:ln></c:spPr>${txEixo}<c:crossAx val="222"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx><c:valAx><c:axId val="222"/><c:scaling><c:orientation val="minMax"/><c:min val="0"/></c:scaling><c:delete val="${empilhado ? 0 : 1}"/><c:axPos val="b"/>${empilhado ? '<c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="E1E5EA"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>' : ''}<c:numFmt formatCode="${empilhado ? '0%' : '0'}" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="high"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr>${txEixo}<c:crossAx val="111"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx><c:spPr><a:noFill/></c:spPr></c:plotArea>${empilhado ? `<c:legend><c:legendPos val="b"/><c:overlay val="0"/>${txEixo}</c:legend>` : ''}<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="D5DCE4"/></a:solidFill></a:ln></c:spPr></c:chartSpace>`;
}

export async function gerarXlsx(plan, saida = 'uint8array') {
  const zip = new JSZip();
  const nomesEstilo = Object.keys(ESTILOS);
  const textos = new Map();
  let usos = 0;
  const idTexto = (t) => { usos += 1; if (!textos.has(t)) textos.set(t, textos.size); return textos.get(t); };
  const tipos = [];
  let nGrafico = 0;

  plan.abas.forEach((aba, a) => {
    const nCols = Math.max(1, ...aba.linhas.map((l) => l.cels.length));
    const rows = aba.linhas.map((l, r) => `<row r="${r + 1}"${l.alt ? ` ht="${l.alt}" customHeight="1"` : ''}>${l.cels.map((cel, i) => {
      const s = Math.max(0, nomesEstilo.indexOf(cel.s));
      if (cel.v instanceof Date) return `<c r="${ref(r, i)}" s="${s}"><v>${serialExcel(cel.v)}</v></c>`;
      if (typeof cel.v === 'number' && Number.isFinite(cel.v)) return `<c r="${ref(r, i)}" s="${s}"><v>${cel.v}</v></c>`;
      const t = semControle(cel.v ?? '').slice(0, 32767);
      return t === '' ? `<c r="${ref(r, i)}" s="${s}"/>` : `<c r="${ref(r, i)}" s="${s}" t="s"><v>${idTexto(t)}</v></c>`;
    }).join('')}</row>`).join('');
    const graficos = aba.graficos || [];
    const ultimaCol = Math.max(nCols - 1, ...graficos.map((g) => g.ate[1]));
    const ultimaLin = Math.max(aba.linhas.length - 1, ...graficos.map((g) => g.ate[0]));
    aba.areaImpressao = `${abs(0, 0)}:${abs(ultimaLin, ultimaCol)}`;
    const vista = aba.congelar
      ? `<pane ySplit="${aba.congelar}" topLeftCell="A${aba.congelar + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A${aba.congelar + 1}" sqref="A${aba.congelar + 1}"/>`
      : '<selection activeCell="A1" sqref="A1"/>';
    aba.faixaFiltro = aba.filtro ? `${abs(0, 0)}:${abs(aba.linhas.length - 1, nCols - 1)}` : null;
    const xml = `${XML}<worksheet xmlns="${NS}" xmlns:r="${RELS}">${aba.escala ? '' : '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'}<dimension ref="A1:${ref(aba.linhas.length - 1, nCols - 1)}"/><sheetViews><sheetView${aba.filtro ? '' : ' showGridLines="0"'}${a === 0 ? ' tabSelected="1"' : ''} workbookViewId="0">${vista}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18" customHeight="1"/><cols>${aba.larguras.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData>${aba.faixaFiltro ? `<autoFilter ref="${aba.faixaFiltro.replace(/\$/g, '')}"/>` : ''}${aba.mesclas.length ? `<mergeCells count="${aba.mesclas.length}">${aba.mesclas.map((m) => `<mergeCell ref="${ref(m[0], m[1])}:${ref(m[2], m[3])}"/>`).join('')}</mergeCells>` : ''}<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9"${aba.escala ? ` scale="${aba.escala}"` : ''} orientation="${aba.paisagem ? 'landscape' : 'portrait'}"${aba.escala ? '' : ' fitToWidth="1" fitToHeight="0"'}/><headerFooter><oddFooter>&amp;L${esc(esc(plan.titulo).slice(0, 120))}&amp;RPágina &amp;P de &amp;N</oddFooter></headerFooter>${aba.quebras?.length ? `<rowBreaks count="${aba.quebras.length}" manualBreakCount="${aba.quebras.length}">${aba.quebras.map((r) => `<brk id="${r}" max="16383" man="1"/>`).join('')}</rowBreaks>` : ''}${graficos.length ? '<drawing r:id="rId1"/>' : ''}</worksheet>`;
    zip.file(`xl/worksheets/sheet${a + 1}.xml`, xml);
    tipos.push(`<Override PartName="/xl/worksheets/sheet${a + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);

    if (graficos.length) {
      zip.file(`xl/worksheets/_rels/sheet${a + 1}.xml.rels`, `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RELS}/drawing" Target="../drawings/drawing${a + 1}.xml"/></Relationships>`);
      tipos.push(`<Override PartName="/xl/drawings/drawing${a + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`);
      const rel = [], anc = [];
      graficos.forEach((g, i) => {
        nGrafico += 1;
        zip.file(`xl/charts/chart${nGrafico}.xml`, graficoXml(g, aba.nome));
        tipos.push(`<Override PartName="/xl/charts/chart${nGrafico}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`);
        rel.push(`<Relationship Id="rId${i + 1}" Type="${RELS}/chart" Target="../charts/chart${nGrafico}.xml"/>`);
        const p = (n, [r, col]) => `<xdr:${n}><xdr:col>${col}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${r}</xdr:row><xdr:rowOff>60000</xdr:rowOff></xdr:${n}>`;
        anc.push(`<xdr:twoCellAnchor>${p('from', g.de)}${p('to', g.ate)}<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${i + 2}" name="Gráfico ${i + 1}" descr="${esc(g.titulo)}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rId${i + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`);
      });
      zip.file(`xl/drawings/drawing${a + 1}.xml`, `${XML}<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${RELS}">${anc.join('')}</xdr:wsDr>`);
      zip.file(`xl/drawings/_rels/drawing${a + 1}.xml.rels`, `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel.join('')}</Relationships>`);
    }
  });

  const nomes = plan.abas.flatMap((aba, a) => {
    const q = `'${aba.nome.replace(/'/g, "''")}'!`;
    return [
      ...(aba.faixaFiltro ? [['_xlnm._FilterDatabase', a, q + aba.faixaFiltro, true]] : []),
      ['_xlnm.Print_Area', a, q + aba.areaImpressao],
      ...(aba.repetir ? [['_xlnm.Print_Titles', a, `${q}$1:$${aba.repetir}`]] : [])
    ];
  }).sort((x, y) => x[0].localeCompare(y[0]) || x[1] - y[1]);

  zip.file('xl/workbook.xml', `${XML}<workbook xmlns="${NS}" xmlns:r="${RELS}"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews><sheets>${plan.abas.map((s, i) => `<sheet name="${esc(s.nome)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><definedNames>${nomes.map(([n, i, f, h]) => `<definedName name="${n}" localSheetId="${i}"${h ? ' hidden="1"' : ''}>${esc(f)}</definedName>`).join('')}</definedNames></workbook>`);
  const n = plan.abas.length;
  zip.file('xl/_rels/workbook.xml.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${plan.abas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${RELS}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${n + 1}" Type="${RELS}/styles" Target="styles.xml"/><Relationship Id="rId${n + 2}" Type="${RELS}/sharedStrings" Target="sharedStrings.xml"/></Relationships>`);
  zip.file('xl/styles.xml', estilosXml());
  zip.file('xl/sharedStrings.xml', `${XML}<sst xmlns="${NS}" count="${usos}" uniqueCount="${textos.size}">${[...textos.keys()].map((t) => `<si><t xml:space="preserve">${esc(t)}</t></si>`).join('')}</sst>`);
  zip.file('_rels/.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RELS}/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file('docProps/core.xml', `${XML}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(plan.titulo)}</dc:title><dc:creator>RESPONDER</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`);
  zip.file('[Content_Types].xml', `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>${tipos.join('')}</Types>`);
  return zip.generateAsync({ type: saida, compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
