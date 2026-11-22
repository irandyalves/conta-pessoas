// ==========================================
// PRESETS / MODELOS DE PESQUISAS PRÉ-PRONTAS
// ==========================================

export const PRESETS_PESQUISAS = [
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
    id: 'apoio_pastoral_gaveta',
    nome: 'Pesquisa com Gaveta de Ajuda Pastoral',
    descricao: 'Pergunta se precisa de apoio com gaveta retrátil para digitar o pedido de oração.',
    tag: 'Gaveta Condicional',
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
          subtitulo: 'Clique para abrir e digitar seu pedido',
          ativo: true,
          icone: 'HeartHandshake',
          cor: 'emerald',
          temGaveta: true,
          gaveta: {
            tipo: 'texto',
            pergunta: 'Qual o seu pedido de oração ou tipo de ajuda?',
            placeholder: 'Digite aqui seu pedido, dúvida ou motivo de oração...',
            obrigatorio: false,
            linhas: 3,
            botaoConfirmar: 'Confirmar & Avançar'
          }
        },
        {
          id: 'estudo_biblico',
          titulo: 'Tenho interesse em conhecer a Bíblia',
          subtitulo: 'Gostaria de participar de um estudo bíblico',
          ativo: true,
          icone: 'Church',
          cor: 'sky',
          temGaveta: true,
          gaveta: {
            tipo: 'texto',
            pergunta: 'Como prefere o estudo?',
            placeholder: 'Ex: Online, presencial na igreja ou em casa...',
            obrigatorio: false,
            linhas: 2,
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
    id: 'avaliacao_evento_dissertativa',
    nome: 'Avaliação de Evento (com Campo para Digitar)',
    descricao: 'Avaliação completa com notas, sugestões por extenso (campo de digitação) e gavetas.',
    tag: 'Campo de Digitação',
    icone: 'Sparkles',
    config: {
      pergunta1Titulo: 'O que você achou da programação de hoje?',
      pergunta1Titulo2: 'Sua opinião é fundamental para melhorarmos',
      pergunta1FonteTamanho: 18,
      cardsPorTela: 4,
      cardFundoEstilo: 'azul_profundo',
      cardEfeitoEstilo: 'vidro',
      cardProfundidade: 6,
      cardCorFonteTitulo: 'branco',
      cardCorFonteSubtitulo: 'cinza_claro',
      opcoesChegada: [
        { id: 'excelente', titulo: 'Excelente! Superou expectativas', subtitulo: 'Tudo muito bem organizado e emocionante', ativo: true, icone: 'Star', cor: 'amber' },
        { id: 'muito_bom', titulo: 'Muito Bom! Gostei bastante', subtitulo: 'Momentos muito especiais e edificantes', ativo: true, icone: 'Smile', cor: 'sky' },
        { id: 'regular', titulo: 'Regular / Razoável', subtitulo: 'Foi bom, mas pode melhorar em alguns pontos', ativo: true, icone: 'Compass', cor: 'purple' },
        { id: 'melhorias', titulo: 'Tenho sugestões de melhoria', subtitulo: 'Gostaria de deixar minha observação', ativo: true, icone: 'Tag', cor: 'rose' }
      ],
      telasExtras: [
        {
          id: 'extra_comentario_aberto',
          tipo: 'texto',
          titulo1: 'Deixe sua mensagem ou sugestão',
          titulo2: 'Espaço aberto para sua opinião sincera',
          titulo: 'Deixe sua mensagem ou sugestão',
          subtitulo: 'O que você mais gostou ou gostaria que melhorássemos?',
          placeholder: 'Escreva aqui o que você achou do evento, mensagem para a equipe ou sugestões...',
          multiline: true,
          linhas: 4,
          obrigatorio: false,
          botaoTexto: 'Avançar para Acompanhantes'
        }
      ],
      pergunta2Titulo: 'Quantas pessoas vieram com você?',
      pergunta2Titulo2: '',
      pergunta2FonteTamanho: 18,
      opcaoIndividualTitulo: 'APENAS EU',
      opcaoIndividualSubtitulo: ', vim só',
      divisorQtdTexto: 'Ou selecione a quantidade do seu grupo:',
      btnQtdAltura: 72,
      btnQtdCor: 'azul',
      btnQtdEfeito: 'vidro',
      btnQtdProfundidade: 6,
      btnQtdFonteNumero: 34,
      btnQtdCorNumero: 'branco'
    }
  }
];
