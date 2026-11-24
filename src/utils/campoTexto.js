// ==========================================
// CAMPOS DE IDENTIFICAÇÃO (nome, e-mail, telefone): formato, máscara e validação
// tela.formatoCampo: '' (livre) | 'nome' | 'email' | 'telefone'    tela.maiusculas: sempre em caixa alta
// ==========================================
export const FORMATOS_CAMPO = [
  { id: '', label: 'Texto livre' },
  { id: 'nome', label: 'Nome', titulo: 'Qual é o seu nome?', dica: 'Digite seu nome completo' },
  { id: 'email', label: 'E-mail', titulo: 'Qual é o seu e-mail?', dica: 'nome@exemplo.com' },
  { id: 'telefone', label: 'Telefone', titulo: 'Qual é o seu telefone?', dica: '(61) 99999-9999' }
];
export const formatoPorId = (id) => FORMATOS_CAMPO.find((f) => f.id === id) || FORMATOS_CAMPO[0];
export const ehCampoTexto = (tela) => ['texto', 'texto_curto'].includes(tela?.tipo);
export const usaMaiusculas = (tela) => Boolean(tela?.maiusculas) && !['email', 'telefone'].includes(tela?.formatoCampo);

// (61) 99999-9999 enquanto digita. Número que começa com + (outro país) fica como foi digitado.
export function mascaraTelefone(valor) {
  const texto = String(valor ?? '').trimStart();
  let d = texto.replace(/\D/g, '');
  if (texto.startsWith('+') && !(d.startsWith('55') && d.length >= 12)) return `+${d.slice(0, 15)}`;
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  d = d.replace(/^0+/, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const meio = d.length > 10 ? 7 : 6;
  return d.length <= meio ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
}

// Valor como será gravado
export function valorGravado(tela, valor) {
  if (!ehCampoTexto(tela) || typeof valor !== 'string') return valor;
  if (tela.formatoCampo === 'email') return valor.trim().toLowerCase();
  if (tela.formatoCampo === 'telefone') return mascaraTelefone(valor);
  let v = tela.formatoCampo === 'nome' ? valor.replace(/\s+/g, ' ').trim() : valor;
  if (usaMaiusculas(tela)) v = v.toLocaleUpperCase('pt-BR');
  return v;
}

// '' = está certo. Campo vazio não é erro de formato (quem cuida disso é o "obrigatório").
export function erroDeFormato(tela, valor) {
  const v = String(valor ?? '').trim();
  if (!v || !ehCampoTexto(tela)) return '';
  if (tela.formatoCampo === 'email') {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v) && /\.[a-z]{2,}$/i.test(v) ? '' : 'Digite um e-mail válido, como nome@exemplo.com.';
  }
  if (tela.formatoCampo === 'telefone') {
    const m = mascaraTelefone(v);
    const n = m.replace(/\D/g, '').length;
    return (m.startsWith('+') ? n >= 8 : n === 10 || n === 11) ? '' : 'Digite o telefone com DDD, como (61) 99999-9999.';
  }
  return '';
}

// Mensagem de campo obrigatório vazio, com o nome do que falta
export function mensagemFalta(tela, titulo) {
  const t = String(titulo || '').replace(/\s+/g, ' ').trim();
  const questao = t.replace(/^\s*\d{1,3}[.)]\s+/, '').split(/\s[—–-]\s/).pop().replace(/[\s:*?.]+$/, '').trim();
  const formato = tela?.formatoCampo || (ehDadoPessoal(tela, questao) ? (/e-?mail/i.test(questao) ? 'email' : /telefone|celular|whats/i.test(questao) ? 'telefone' : /nome/i.test(questao) ? 'nome' : '') : '');
  if (formato === 'nome') return 'Por favor, preencha o nome.';
  if (formato === 'email') return 'Por favor, preencha o e-mail.';
  if (formato === 'telefone') return 'Por favor, preencha o telefone.';
  if (['texto', 'texto_curto', 'data', 'hora'].includes(tela?.tipo)) return questao ? `Por favor, preencha o campo “${questao}”.` : 'Por favor, preencha este campo.';
  return questao ? `Por favor, responda “${questao}”.` : 'Por favor, escolha uma resposta.';
}

// Atributos do campo no celular: teclado certo e preenchimento automático do aparelho
export function atributosCampo(tela) {
  if (tela.formatoCampo === 'email') return { type: 'text', inputMode: 'email', autoComplete: 'email', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false };
  if (tela.formatoCampo === 'telefone') return { type: 'tel', inputMode: 'tel', autoComplete: 'tel' };
  if (tela.formatoCampo === 'nome') return { type: 'text', autoComplete: 'name', autoCapitalize: usaMaiusculas(tela) ? 'characters' : 'words', spellCheck: false };
  return { type: 'text', autoCapitalize: usaMaiusculas(tela) ? 'characters' : undefined };
}

// Dado pessoal não vai para a tela cheia, o "passar sozinho" nem o PDF: só para a aba Respostas da planilha
const PERGUNTA_PESSOAL = /^(?:.*\b(?:seu|sua)\s+)?(?:nome(?:\s+completo)?|e-?mail(?:\s.*)?|telefone(?:\s.*)?|celular(?:\s.*)?|whats\s?app(?:\s.*)?|cpf(?:\s.*)?)\s*[?:*.]*$/i;
export function ehDadoPessoal(tela, titulo) {
  if (!ehCampoTexto(tela)) return false;
  if (['nome', 'email', 'telefone'].includes(tela.formatoCampo)) return true;
  const t = String(titulo || '').replace(/^\s*\d{1,3}[.)]\s+/, '').replace(/\s*\(.*\)\s*$/, '').trim();
  return PERGUNTA_PESSOAL.test(t);
}
