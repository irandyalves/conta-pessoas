import {
  Anchor, Award, Baby, BadgeCheck, BookOpen, Briefcase, Building2, Bus, Calendar, Car, Check, ChevronsUp, Church,
  CircleQuestionMark, ClipboardList, Clock, Compass, Ellipsis, FileSearch, Flame, Frown, Gavel, Globe, GraduationCap,
  Handshake, Heart, HeartHandshake, House, IdCard, Landmark, Laptop, Library, Lightbulb, Mail, MapPin, Medal, Megaphone,
  Meh, MessageCircle, Mic, Music, Phone, Plane, Scale, School, ScrollText, Settings, Share2, Shield, ShieldCheck,
  ShieldHalf, Siren, Smile, Sparkles, Star, Stethoscope, Swords, Tag, Target, ThumbsDown, ThumbsUp, Tv, User, UserCog,
  Users, X
} from 'lucide-react';

// Ícones dos cards: lista única usada pelo editor e pelo celular
export const ICONES_CARDS = [
  // Justiça e instituições
  { id: 'Scale', label: 'Balança', icon: Scale },
  { id: 'Gavel', label: 'Martelo', icon: Gavel },
  { id: 'Landmark', label: 'Tribunal', icon: Landmark },
  { id: 'ScrollText', label: 'Lei', icon: ScrollText },
  { id: 'FileSearch', label: 'Fiscalização', icon: FileSearch },
  { id: 'Handshake', label: 'Defesa', icon: Handshake },
  { id: 'Briefcase', label: 'Advocacia', icon: Briefcase },
  { id: 'Building2', label: 'Órgão', icon: Building2 },
  // Militar e segurança
  { id: 'Shield', label: 'Escudo', icon: Shield },
  { id: 'ShieldHalf', label: 'Escudo estadual', icon: ShieldHalf },
  { id: 'ShieldCheck', label: 'Segurança', icon: ShieldCheck },
  { id: 'Medal', label: 'Medalha', icon: Medal },
  { id: 'Award', label: 'Oficial', icon: Award },
  { id: 'ChevronsUp', label: 'Praça', icon: ChevronsUp },
  { id: 'Swords', label: 'Forças', icon: Swords },
  { id: 'Anchor', label: 'Marinha', icon: Anchor },
  { id: 'Plane', label: 'Aeronáutica', icon: Plane },
  { id: 'Siren', label: 'Polícia', icon: Siren },
  { id: 'Flame', label: 'Bombeiros', icon: Flame },
  // Pessoas e trabalho
  { id: 'User', label: 'Pessoa', icon: User },
  { id: 'Users', label: 'Grupo', icon: Users },
  { id: 'IdCard', label: 'Servidor', icon: IdCard },
  { id: 'UserCog', label: 'Assessor', icon: UserCog },
  { id: 'BadgeCheck', label: 'Crachá', icon: BadgeCheck },
  { id: 'GraduationCap', label: 'Estudante', icon: GraduationCap },
  { id: 'School', label: 'Escola', icon: School },
  { id: 'BookOpen', label: 'Professor', icon: BookOpen },
  { id: 'Library', label: 'Biblioteca', icon: Library },
  { id: 'Stethoscope', label: 'Saúde', icon: Stethoscope },
  { id: 'Baby', label: 'Criança', icon: Baby },
  { id: 'Settings', label: 'Técnico', icon: Settings },
  { id: 'ClipboardList', label: 'Gestão', icon: ClipboardList },
  { id: 'Target', label: 'Meta', icon: Target },
  { id: 'Lightbulb', label: 'Ideia', icon: Lightbulb },
  // Comunicação e chegada
  { id: 'Megaphone', label: 'Anúncio', icon: Megaphone },
  { id: 'Share2', label: 'Redes sociais', icon: Share2 },
  { id: 'MessageCircle', label: 'Mensagem', icon: MessageCircle },
  { id: 'Mail', label: 'E-mail', icon: Mail },
  { id: 'Phone', label: 'Telefone', icon: Phone },
  { id: 'Globe', label: 'Site', icon: Globe },
  { id: 'Laptop', label: 'On-line', icon: Laptop },
  { id: 'Tv', label: 'TV', icon: Tv },
  { id: 'Mic', label: 'Palestra', icon: Mic },
  { id: 'Music', label: 'Música', icon: Music },
  { id: 'Calendar', label: 'Data', icon: Calendar },
  { id: 'Clock', label: 'Horário', icon: Clock },
  { id: 'MapPin', label: 'Lugar', icon: MapPin },
  { id: 'House', label: 'Casa', icon: House },
  { id: 'Car', label: 'Carro', icon: Car },
  { id: 'Bus', label: 'Ônibus', icon: Bus },
  { id: 'Compass', label: 'Visita', icon: Compass },
  { id: 'Church', label: 'Igreja', icon: Church },
  { id: 'HeartHandshake', label: 'Convite', icon: HeartHandshake },
  // Respostas
  { id: 'Check', label: 'Sim', icon: Check },
  { id: 'X', label: 'Não', icon: X },
  { id: 'ThumbsUp', label: 'Bom', icon: ThumbsUp },
  { id: 'ThumbsDown', label: 'Ruim', icon: ThumbsDown },
  { id: 'Smile', label: 'Satisfeito', icon: Smile },
  { id: 'Meh', label: 'Regular', icon: Meh },
  { id: 'Frown', label: 'Insatisfeito', icon: Frown },
  { id: 'Star', label: 'Estrela', icon: Star },
  { id: 'Heart', label: 'Coração', icon: Heart },
  { id: 'Sparkles', label: 'Especial', icon: Sparkles },
  { id: 'Tag', label: 'Etiqueta', icon: Tag },
  { id: 'CircleQuestionMark', label: 'Dúvida', icon: CircleQuestionMark },
  { id: 'Ellipsis', label: 'Outro', icon: Ellipsis }
];

const POR_ID = Object.fromEntries(ICONES_CARDS.map((i) => [i.id, i.icon]));
POR_ID.HelpCircle = CircleQuestionMark; // nome antigo
export const componenteIcone = (id) => POR_ID[id] || Tag;

// Do mais específico para o mais geral. O 2º ícone é usado se o 1º já saiu em outro card da mesma tela.
const REGRAS = [
  [/justica militar da uniao|\bstm\b|\bjmu\b/, ['Shield', 'ShieldCheck']],
  [/justica militar/, ['ShieldHalf', 'Shield']],
  [/justica federal/, ['Landmark', 'Building2']],
  [/justica (estadual|do trabalho|eleitoral)|tribunal|\bt[jr][a-z]?\b/, ['Scale', 'Landmark', 'Building2']],
  [/ministerio publico|promotor|procurador/, ['FileSearch', 'ScrollText']],
  [/magistrad|juiz|juiza|desembargador|ministr[oa]\b/, ['Gavel', 'Scale']],
  [/defensor/, ['Handshake', 'Briefcase']],
  [/advoga|advocacia|\boab\b/, ['Briefcase', 'Scale']],
  [/marinha|naval/, ['Anchor']],
  [/aeronautica|forca aerea|\bfab\b/, ['Plane']],
  [/bombeir/, ['Flame']],
  [/polici|seguranca|guarda/, ['Siren', 'ShieldCheck']],
  [/oficial|oficiais/, ['Award', 'Medal']],
  [/\bpracas?\b/, ['ChevronsUp', 'Medal']],
  [/forcas armadas|exercito|militar/, ['Medal', 'Swords', 'Shield']],
  [/estagi|estudant|\balun|academic|universit/, ['GraduationCap', 'School']],
  [/professor|docente|instrutor|ensino/, ['BookOpen', 'GraduationCap']],
  [/universidade|faculdade|escola/, ['School', 'GraduationCap']],
  [/pesquisador/, ['Library', 'BookOpen']],
  [/assessor|analista|tecnic/, ['UserCog', 'Settings']],
  [/servidor|funcionari/, ['IdCard', 'BadgeCheck']],
  [/gest[ao]|diretor|chefe|coordena|lider/, ['ClipboardList', 'Target']],
  [/prefeitura|executivo|legislativo|camara|senado|governo|orgao|autarquia/, ['Building2', 'Landmark']],
  [/empresa|iniciativa privada|negocio/, ['Building2', 'Briefcase']],
  [/saude|medic|enferm|hospital/, ['Stethoscope']],
  [/sociedade civil|cidad|comunidade|grupo|familia/, ['Users', 'User']],
  [/crianc|filh|bebe/, ['Baby']],
  [/whats|mensagem|conversa/, ['MessageCircle']],
  [/insta|facebook|youtube|rede social|redes sociais|internet/, ['Share2', 'Globe']],
  [/e-?mail/, ['Mail']],
  [/telefone|ligacao|celular/, ['Phone']],
  [/\bsite\b|portal|pagina/, ['Globe']],
  [/on-?line|virtual|remoto|\bead\b/, ['Laptop']],
  [/presencial/, ['MapPin']],
  [/televis|\btv\b|radio/, ['Tv']],
  [/faixa|cartaz|anuncio|divulga|panfleto|folheto|convite impresso/, ['Megaphone', 'Tag']],
  [/amig|convid|convite|indica/, ['HeartHandshake', 'Users']],
  [/igreja|culto|membro|adventista/, ['Church']],
  [/visita|primeira vez|passando|passei/, ['Compass', 'MapPin']],
  [/bairro|\bmoro\b|vizinh|perto|endereco|cidade/, ['MapPin', 'House']],
  [/onibus|transporte/, ['Bus']],
  [/carro|\buber\b|taxi/, ['Car']],
  [/palestra|painel|debate/, ['Mic']],
  [/musica|louvor/, ['Music']],
  [/\bnada\b/, ['Frown', 'ThumbsDown']],
  [/\bpouc/, ['ThumbsDown', 'Frown']],
  [/moderad/, ['Meh']],
  [/insatisf|pessim|\bruim/, ['Frown', 'ThumbsDown']],
  [/regular|razoavel|indiferente|neutro|talvez|parcial/, ['Meh']],
  [/otim|excelente/, ['Star', 'ThumbsUp']],
  [/\bbom\b|\bboa\b|satisf/, ['Smile', 'ThumbsUp']],
  [/bastante/, ['ThumbsUp', 'Smile']],
  [/nao se aplica|nao sei/, ['CircleQuestionMark']],
  [/\bmuito\b/, ['Star', 'Award']],
  [/^nao\b|nenhum|nunca/, ['X']],
  [/^sim\b|sempre|concordo/, ['Check']],
  [/outr[oa]s?\b|demais/, ['Ellipsis']]
];

const limpar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Ícone de cada opção da tela: o escolhido à mão (iconeManual) ou o que combina com o texto.
// Devolve { [id da opção]: id do ícone }
export function iconesDaTela(opcoes = []) {
  const usados = new Set(opcoes.filter((o) => o.iconeManual).map((o) => o.icone));
  const mapa = {};
  opcoes.forEach((o) => {
    if (o.iconeManual) { mapa[o.id] = o.icone; return; }
    const texto = limpar(o.titulo);
    const regra = REGRAS.find(([re]) => re.test(texto));
    const id = regra ? (regra[1].find((i) => !usados.has(i)) || regra[1][0]) : (o.icone || 'Tag');
    usados.add(id);
    mapa[o.id] = id;
  });
  return mapa;
}
