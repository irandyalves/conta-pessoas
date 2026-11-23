// ==========================================
// PRESETS / MODELOS DE PESQUISAS MUNDIAIS (GOOGLE FORMS, TYPEFORM, JOTFORM, SURVEYMONKEY)
// ==========================================
import { parseTextToQuestions, TEXTO_AVALIACAO_JMU_ENAJUM } from './formImporter';

export const PRESETS_PESQUISAS = [
  {
    id: 'avaliacao_jmu_enajum',
    nome: 'Avaliação I Encontro Nacional Diretores de Secretaria JMU (ENAJUM)',
    descricao: '15 telas completas: Perfil (Instituição, Cargo, Nome), Grades de Avaliação 1 a 5 + NA (Conteúdo, Palestras, Metodologia, Organização), Escala 0-10 e Dissertativas.',
    tag: 'Oficial JMU / ENAJUM',
    icone: 'Award',
    config: parseTextToQuestions(TEXTO_AVALIACAO_JMU_ENAJUM)
  },
  {
    id: 'culto_recepcao',
    nome: 'Recepção de Culto / Visitantes',
    descricao: 'Fluxo clássico para recepção: como conheceu a igreja e acompanhantes.',
    tag: 'Mais Usado',
    icone: 'Church',
    config: {
      pergunta1Titulo: 'Como você chegou aqui?',
      pergunta1Titulo2: '',
      pergunta1FonteTamanho: 18,
      cardsPorTela: 4,
      cardFundoEstilo: 'escuro',
      cardEfeitoEstilo: 'efeito_3d',
      cardProfundidade: 5,
      cardCorFonteTitulo: 'branco',
      cardCorFonteSubtitulo: 'cinza',
      opcoesChegada: [
        { id: 'faixa', titulo: 'Vi a faixa na frente da igreja', subtitulo: 'Passei e vi o anúncio na fachada', ativo: true, icone: 'Tag', cor: 'amber' },
        { id: 'membro', titulo: 'Sou membro da igreja', subtitulo: 'Já congrego nesta comunidade', ativo: true, icone: 'Church', cor: 'sky' },
        { id: 'convidado', titulo: 'Fui convidado(a)', subtitulo: 'Vim por convite de amigo, irmão ou familiar', ativo: true, icone: 'HeartHandshake', cor: 'emerald' },
        { id: 'redes', titulo: 'Redes Sociais / Internet', subtitulo: 'Instagram, YouTube, Google ou WhatsApp', ativo: true, icone: 'Share2', cor: 'purple' },
        { id: 'outro', titulo: 'Passando em frente / Outro motivo', subtitulo: 'Curiosidade, visita espontânea ou retorno', ativo: true, icone: 'Compass', cor: 'indigo' }
      ],
      telasExtras: [],
      pergunta2Titulo: 'Você veio só ou com mais pessoas?',
      pergunta2Titulo2: '',
      pergunta2FonteTamanho: 18,
      opcaoIndividualTitulo: 'SÓ EU',
      opcaoIndividualSubtitulo: ', vim sozinho',
      divisorQtdTexto: 'Quantas pessoas vieram com você?',
      btnQtdAltura: 74,
      btnQtdCor: 'slate',
      btnQtdEfeito: 'efeito_3d',
      btnQtdProfundidade: 5,
      btnQtdFonteNumero: 34,
      btnQtdCorNumero: 'branco'
    }
  },
  {
    id: 'avaliacao_reacao_completa',
    nome: 'Avaliação de Reação & Satisfação (NPS + Checkbox + Gaveta)',
    descricao: 'Modelo padrão mundial (Typeform / Google Forms) com Escala Slide 0-10, Checkbox de áreas e Gavetas.',
    tag: 'Padrão Mundial IA',
    icone: 'Sparkles',
    config: {
      pergunta1Titulo: 'Como você avalia o evento de hoje?',
      pergunta1Titulo2: 'Toque na opção que melhor representa sua experiência',
      pergunta1FonteTamanho: 18,
      cardsPorTela: 4,
      cardFundoEstilo: 'azul_profundo',
      cardEfeitoEstilo: 'efeito_3d',
      cardProfundidade: 6,
      cardCorFonteTitulo: 'branco',
      cardCorFonteSubtitulo: 'cinza_claro',
      opcoesChegada: [
        {
          id: 'superou',
          titulo: 'Superou minhas expectativas!',
          subtitulo: 'Excelente organização, conteúdo e recepção',
          ativo: true,
          icone: 'Star',
          cor: 'amber',
          temGaveta: true,
          gaveta: {
            tipo: 'checkbox',
            pergunta: 'O que você mais gostou? (Pode marcar vários)',
            opcoes: ['Recepção e Acolhimento', 'Louvor e Música', 'Mensagem / Palestra', 'Ambiente e Organização'],
            obrigatorio: false,
            botaoConfirmar: 'Confirmar & Avançar'
          }
        },
        {
          id: 'muito_bom',
          titulo: 'Muito bom, gostei bastante',
          subtitulo: 'Atendeu bem ao esperado',
          ativo: true,
          icone: 'Smile',
          cor: 'emerald',
          temGaveta: false
        },
        {
          id: 'pode_melhorar',
          titulo: 'Regular, pode melhorar em alguns pontos',
          subtitulo: 'Toque para indicar o que podemos aperfeiçoar',
          ativo: true,
          icone: 'Compass',
          cor: 'sky',
          temGaveta: true,
          gaveta: {
            tipo: 'radio',
            pergunta: 'Qual área precisa de mais atenção?',
            opcoes: ['Som e Acústica', 'Climatização / Assentos', 'Pontualidade / Horário', 'Estacionamento / Acesso'],
            obrigatorio: false,
            botaoConfirmar: 'Confirmar & Avançar'
          }
        }
      ],
      telasExtras: [
        {
          id: 'extra_nps_slider',
          ativa: true,
          tipo: 'slider',
          titulo1: 'De 0 a 10, qual sua nota geral',
          titulo2: 'para a programação de hoje?',
          titulo: 'De 0 a 10, qual sua nota geral para a programação de hoje?',
          subtitulo: 'Arraste o controle deslizante (Slide) abaixo:',
          sliderMin: 0,
          sliderMax: 10,
          sliderStep: 1,
          sliderUnidade: ' pts',
          botaoTexto: 'Confirmar Nota & Avançar'
        },
        {
          id: 'extra_temas_checkbox',
          ativa: true,
          tipo: 'checkbox',
          titulo1: 'Quais temas você gostaria de ver',
          titulo2: 'nos próximos encontros?',
          titulo: 'Quais temas você gostaria de ver nos próximos encontros?',
          subtitulo: 'Selecione quantas caixas desejar (Checkbox):',
          botaoTexto: 'Avançar',
          opcoes: [
            { id: 'chk_1', titulo: 'Família, Casamento e Filhos', ativo: true, icone: 'HeartHandshake', cor: 'emerald' },
            { id: 'chk_2', titulo: 'Saúde Emocional e Qualidade de Vida', ativo: true, icone: 'Smile', cor: 'sky' },
            { id: 'chk_3', titulo: 'Estudo Bíblico e Profecias', ativo: true, icone: 'Church', cor: 'amber' },
            { id: 'chk_4', titulo: 'Juventude, Música e Louvor', ativo: true, icone: 'Sparkles', cor: 'purple' }
          ]
        },
        {
          id: 'extra_comentario_longo',
          ativa: true,
          tipo: 'texto',
          titulo1: 'Deseja deixar algum comentário',
          titulo2: 'ou sugestão por escrito?',
          titulo: 'Deseja deixar algum comentário ou sugestão por escrito?',
          subtitulo: 'Campo longo aberto (opcional):',
          placeholder: 'Digite livremente sua opinião, elogio ou sugestão...',
          multiline: true,
          linhas: 4,
          obrigatorio: false,
          botaoTexto: 'Avançar para Acompanhantes'
        }
      ],
      pergunta2Titulo: 'Quantas pessoas vieram com você?',
      pergunta2Titulo2: '',
      pergunta2FonteTamanho: 18,
      opcaoIndividualTitulo: 'SÓ EU',
      opcaoIndividualSubtitulo: ', vim sozinho(a)',
      divisorQtdTexto: 'Ou selecione o total do seu grupo:',
      btnQtdAltura: 74,
      btnQtdCor: 'azul',
      btnQtdEfeito: 'efeito_3d',
      btnQtdProfundidade: 6,
      btnQtdFonteNumero: 34,
      btnQtdCorNumero: 'branco'
    }
  },
  {
    id: 'apoio_pastoral_gaveta',
    nome: 'Apoio Pastoral & Estudo Bíblico (Gavetas Múltiplas)',
    descricao: 'Cards com gaveta de texto, gaveta de Radio Button (turno preferido) e Checkbox.',
    tag: 'Gavetas Inteligentes',
    icone: 'HeartHandshake',
    config: {
      pergunta1Titulo: 'Gostaria de receber apoio ou oração?',
      pergunta1Titulo2: 'Nossa equipe pastoral está à disposição',
      pergunta1FonteTamanho: 18,
      cardsPorTela: 3,
      cardFundoEstilo: 'esmeralda_suave',
      cardEfeitoEstilo: 'efeito_3d',
      cardProfundidade: 6,
      cardCorFonteTitulo: 'branco',
      cardCorFonteSubtitulo: 'branco_suave',
      opcoesChegada: [
        {
          id: 'sim_ajuda',
          titulo: 'Sim, gostaria de apoio pastoral',
          subtitulo: 'Clique para abrir a gaveta e digitar seu pedido',
          ativo: true,
          icone: 'HeartHandshake',
          cor: 'emerald',
          temGaveta: true,
          gaveta: {
            tipo: 'texto_longo',
            pergunta: 'Qual o seu pedido de oração ou nome/WhatsApp?',
            placeholder: 'Digite aqui seu pedido, nome e telefone se desejar visita...',
            obrigatorio: false,
            linhas: 3,
            botaoConfirmar: 'Confirmar & Avançar'
          }
        },
        {
          id: 'estudo_biblico',
          titulo: 'Tenho interesse em conhecer a Bíblia',
          subtitulo: 'Escolha na gaveta como prefere estudar',
          ativo: true,
          icone: 'Church',
          cor: 'sky',
          temGaveta: true,
          gaveta: {
            tipo: 'radio',
            pergunta: 'Qual formato de estudo você prefere?',
            opcoes: ['Presencial na Igreja', 'Em minha casa com a família', 'Pelo WhatsApp / Online', 'Receber revista de estudo'],
            obrigatorio: false,
            botaoConfirmar: 'Confirmar & Avançar'
          }
        },
        {
          id: 'apenas_visita',
          titulo: 'Apenas visitando hoje, obrigado(a)',
          subtitulo: 'Vim para assistir e acompanhar o culto',
          ativo: true,
          icone: 'Smile',
          cor: 'amber',
          temGaveta: false
        }
      ],
      telasExtras: [],
      pergunta2Titulo: 'Você está acompanhado(a)?',
      pergunta2Titulo2: '',
      pergunta2FonteTamanho: 18,
      opcaoIndividualTitulo: 'VIM SOZINHO(A)',
      opcaoIndividualSubtitulo: '',
      divisorQtdTexto: 'Quantas pessoas vieram com você?',
      btnQtdAltura: 76,
      btnQtdCor: 'esmeralda',
      btnQtdEfeito: 'efeito_3d',
      btnQtdProfundidade: 6,
      btnQtdFonteNumero: 34,
      btnQtdCorNumero: 'branco'
    }
  },
  {
    id: 'inscricao_cadastro_completo',
    nome: 'Inscrição & Agendamento (Texto Curto, Lista Suspensa, Data e Hora)',
    descricao: 'Formulário estilo Jotform/Microsoft Forms com Nome, Dropdown de faixa etária, Data e Horário.',
    tag: 'Cadastro & Agenda',
    icone: 'Star',
    config: {
      pergunta1Titulo: 'Em qual categoria você se inscreve?',
      pergunta1Titulo2: '',
      pergunta1FonteTamanho: 18,
      cardsPorTela: 4,
      cardFundoEstilo: 'gradiente',
      cardEfeitoEstilo: 'efeito_3d',
      cardProfundidade: 5,
      cardCorFonteTitulo: 'branco',
      cardCorFonteSubtitulo: 'cinza_claro',
      opcoesChegada: [
        { id: 'cat_visitante', titulo: 'Visitante / Convidado Especial', subtitulo: 'Primeira participação no evento', ativo: true, icone: 'Sparkles', cor: 'amber' },
        { id: 'cat_membro', titulo: 'Membro / Participante Local', subtitulo: 'Já faço parte da comunidade', ativo: true, icone: 'Church', cor: 'sky' },
        { id: 'cat_equipe', titulo: 'Voluntário / Equipe de Apoio', subtitulo: 'Atuando na organização', ativo: true, icone: 'HeartHandshake', cor: 'emerald' }
      ],
      telasExtras: [
        {
          id: 'extra_nome_curto',
          ativa: true,
          tipo: 'texto_curto',
          titulo1: 'Qual o seu nome e WhatsApp?',
          titulo2: '(Opcional para sorteios e avisos)',
          titulo: 'Qual o seu nome e WhatsApp?',
          subtitulo: 'Campo de texto pequeno:',
          placeholder: 'Ex: João Silva - (51) 99999-0000',
          multiline: false,
          obrigatorio: false,
          botaoTexto: 'Avançar'
        },
        {
          id: 'extra_dropdown_faixa',
          ativa: true,
          tipo: 'dropdown',
          titulo1: 'Selecione sua Faixa Etária ou Grupo',
          titulo2: '',
          titulo: 'Selecione sua Faixa Etária ou Grupo',
          subtitulo: 'Toque na lista suspensa abaixo:',
          botaoTexto: 'Avançar',
          opcoes: [
            { id: 'dd_1', titulo: 'Jovens (15 a 29 anos)', ativo: true },
            { id: 'dd_2', titulo: 'Adultos (30 a 59 anos)', ativo: true },
            { id: 'dd_3', titulo: 'Melhor Idade (60+ anos)', ativo: true },
            { id: 'dd_4', titulo: 'Família com Crianças', ativo: true }
          ]
        },
        {
          id: 'extra_data_visita',
          ativa: true,
          tipo: 'data',
          titulo1: 'Qual a melhor data para retorno',
          titulo2: 'ou próximo encontro?',
          titulo: 'Qual a melhor data para retorno ou próximo encontro?',
          subtitulo: 'Escolha uma data no calendário:',
          botaoTexto: 'Avançar'
        }
      ],
      pergunta2Titulo: 'Quantas pessoas estão com você?',
      pergunta2Titulo2: '',
      pergunta2FonteTamanho: 18,
      opcaoIndividualTitulo: 'APENAS EU',
      opcaoIndividualSubtitulo: ', individual',
      divisorQtdTexto: 'Ou selecione o tamanho da sua família/grupo:',
      btnQtdAltura: 74,
      btnQtdCor: 'indigo',
      btnQtdEfeito: 'efeito_3d',
      btnQtdProfundidade: 5,
      btnQtdFonteNumero: 34,
      btnQtdCorNumero: 'branco'
    }
  }
];
