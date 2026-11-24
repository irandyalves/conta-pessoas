// Desfaz o "Daqui em diante, nova tela": as opções voltam para o fim da tela anterior.
const COM_OPCOES = ['cards', 'grade', 'radio', 'checkbox', 'dropdown'];

export function telaAnterior(config, i) {
  const tela = config.telasExtras?.[i];
  if (!tela || !COM_OPCOES.includes(tela.tipo)) return null;
  if (i === 0) return tela.tipo === 'cards' && (config.opcoesChegada || []).length > 0 ? { aba: 'tela_1', titulo: config.pergunta1Titulo || '' } : null;
  const ant = config.telasExtras[i - 1];
  return ant?.tipo === tela.tipo ? { aba: `extra_${i - 1}`, titulo: ant.titulo1 || ant.titulo || '' } : null;
}

export function juntarComAnterior(config, i) {
  if (!telaAnterior(config, i)) return config;
  const opcoes = config.telasExtras[i].opcoes || [];
  const telas = config.telasExtras.filter((_, k) => k !== i);
  // Quem dividia a página com a tela que saiu não pula sozinho para a página anterior
  if (telas[i]?.mesmaPagina) telas[i] = { ...telas[i], mesmaPagina: false };
  if (i === 0) return { ...config, opcoesChegada: [...(config.opcoesChegada || []), ...opcoes], telasExtras: telas };
  telas[i - 1] = { ...telas[i - 1], opcoes: [...(telas[i - 1].opcoes || []), ...opcoes] };
  return { ...config, telasExtras: telas };
}
