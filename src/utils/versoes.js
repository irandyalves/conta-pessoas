// Versões anteriores das perguntas. O Firestore guarda por 1 hora o estado de cada documento:
// basta pedir a leitura "como estava em tal minuto". Só lê, nunca grava.
import { getSavedFirebaseConfig, normalizeQuestionsConfig, sanitizeEventId } from '../firebase';

const endereco = (eventId) => {
  const { projectId, apiKey } = getSavedFirebaseConfig();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/eventos_perguntas/${sanitizeEventId(eventId)}?key=${apiKey}`;
};

const valor = (x) => {
  const tipo = Object.keys(x)[0];
  const v = x[tipo];
  if (tipo === 'mapValue') return campos(v.fields);
  if (tipo === 'arrayValue') return (v.values || []).map(valor);
  if (tipo === 'nullValue') return null;
  return tipo === 'integerValue' || tipo === 'doubleValue' ? Number(v) : v;
};
const campos = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valor(v)]));

const ler = async (eventId, quando, extra = '') => {
  const r = await fetch(`${endereco(eventId)}${quando ? `&readTime=${quando}` : ''}${extra}`);
  return r.ok ? r.json() : null;
};

// [{ salvoEm: Date, leitura: 'instante ISO em que ela valia' }], da mais nova para a mais antiga, sem a atual
export async function listarVersoes(eventId) {
  const agora = Date.now();
  const minutos = Array.from({ length: 59 }, (_, i) => `${new Date(agora - (i + 1) * 60000).toISOString().slice(0, 17)}00Z`);
  const [atual, ...docs] = await Promise.all([null, ...minutos].map((m) => ler(eventId, m, '&mask.fieldPaths=atualizadoEm').catch(() => null)));
  const vistas = new Set([atual?.updateTime]);
  return docs.map((d, i) => ({ doc: d, leitura: minutos[i] })).filter(({ doc }) => {
    if (!doc?.updateTime || vistas.has(doc.updateTime)) return false;
    vistas.add(doc.updateTime);
    return true;
  }).map(({ doc, leitura }) => ({ salvoEm: new Date(doc.updateTime), leitura }));
}

export async function abrirVersao(eventId, leitura) {
  const d = await ler(eventId, leitura);
  if (!d?.fields) throw new Error('Esta versão já passou de 1 hora e não está mais disponível.');
  const cfg = campos(d.fields);
  delete cfg.atualizadoEm;
  return normalizeQuestionsConfig(cfg);
}

export async function abrirArquivo(arquivo) {
  let cfg = null;
  try { cfg = JSON.parse(await arquivo.text()); } catch (e) { /* tratado abaixo */ }
  if (!cfg || !Array.isArray(cfg.opcoesChegada)) throw new Error('Este arquivo não é uma cópia das perguntas.');
  return normalizeQuestionsConfig(cfg);
}

// O que mudou entre a versão e o que está no editor
export function diferencas(versao, atual) {
  const telas = (c) => [
    { id: 'p1', nome: c.pergunta1Pergunta || c.pergunta1Titulo || 'Tela 1', opcoes: c.opcoesChegada || [] },
    ...(c.telasExtras || []).map((t) => ({ id: t.id, nome: t.titulo1 || t.titulo, opcoes: t.opcoes || [] }))
  ];
  const a = telas(versao);
  const b = telas(atual);
  const opcoes = (l) => l.flatMap((t) => t.opcoes.map((o) => ({ id: o.id, titulo: o.titulo, t: `${t.nome}: ${o.titulo}` })));
  const sobra = (l, m) => l.filter((o) => !m.some((x) => x.id === o.id && x.titulo === o.titulo)).map((o) => o.t);
  return {
    telasVoltam: a.filter((t) => !b.some((x) => x.id === t.id)).map((t) => t.nome),
    telasSaem: b.filter((t) => !a.some((x) => x.id === t.id)).map((t) => t.nome),
    opcoesVoltam: sobra(opcoes(a), opcoes(b)),
    opcoesSaem: sobra(opcoes(b), opcoes(a))
  };
}
