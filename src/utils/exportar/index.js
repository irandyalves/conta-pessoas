// Exportações do painel. As bibliotecas só são baixadas quando o admin clica em exportar.
import fonteRegular from '../../assets/fontes/PlusJakartaSans-Regular.ttf?url';
import fonteNegrito from '../../assets/fontes/PlusJakartaSans-Bold.ttf?url';
import { nomeArquivo } from '../consolidar';

export const FORMATOS = [
  { id: 'pdf', nome: 'PDF', detalhe: 'Relatório pronto para imprimir' },
  { id: 'xlsx', nome: 'Excel (.xlsx)', detalhe: 'Com gráficos e filtros' },
  { id: 'xls', nome: 'Excel 97-2003 (.xls)', detalhe: 'Para versões antigas' }
];

const base64 = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Não foi possível carregar a fonte do PDF.');
  const b = new Uint8Array(await r.arrayBuffer());
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};

const baixar = (conteudo, tipo, nome) => {
  const url = URL.createObjectURL(conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

// entrada = { presencas, config, titulo, periodo }
export async function exportar(formato, entrada) {
  const nome = nomeArquivo(entrada.titulo, formato);
  if (formato === 'pdf') {
    const [{ gerarPdf }, regular, negrito] = await Promise.all([import('./pdf'), base64(fonteRegular), base64(fonteNegrito)]);
    baixar(gerarPdf({ ...entrada, fontes: { regular, negrito } }).output('blob'), 'application/pdf', nome);
    return nome;
  }
  const { montarPlanilha } = await import('./planilha');
  const plan = montarPlanilha(entrada, formato === 'xlsx');
  if (formato === 'xlsx') {
    const { gerarXlsx } = await import('./xlsx');
    baixar(await gerarXlsx(plan, 'blob'), '', nome);
  } else {
    const { gerarXls } = await import('./xls');
    baixar(gerarXls(plan), 'application/vnd.ms-excel', nome);
  }
  return nome;
}
