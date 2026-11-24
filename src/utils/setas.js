import {
  ArrowBigLeft, ArrowBigRight, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CircleArrowLeft, CircleArrowRight, MoveLeft, MoveRight
} from 'lucide-react';
import { CORES_TEXTO_BOTAO } from './estilos';

// Setas de ANTERIOR e PRÓXIMA: desenho, cor, tamanho, espessura e textos
export const DESENHOS_SETA = [
  { id: 'seta', label: 'Seta', esq: ArrowLeft, dir: ArrowRight },
  { id: 'longa', label: 'Longa', esq: MoveLeft, dir: MoveRight },
  { id: 'simples', label: 'Simples', esq: ChevronLeft, dir: ChevronRight },
  { id: 'dupla', label: 'Dupla', esq: ChevronsLeft, dir: ChevronsRight },
  { id: 'circulo', label: 'Círculo', esq: CircleArrowLeft, dir: CircleArrowRight },
  { id: 'cheia', label: 'Larga', esq: ArrowBigLeft, dir: ArrowBigRight }
];

export const CORES_SETA = CORES_TEXTO_BOTAO.filter((c) => c.id !== 'padrao');

// ler = (campo) => valor de seta<Campo>
export const configSeta = (ler) => {
  const d = DESENHOS_SETA.find((x) => x.id === ler('Desenho')) || DESENHOS_SETA[0];
  return {
    Esq: d.esq,
    Dir: d.dir,
    cor: CORES_SETA.find((c) => c.id === ler('Cor'))?.hex || '#ffffff',
    tamanho: Number(ler('Tamanho') ?? 24),
    espessura: Number(ler('Espessura') ?? 2.75),
    anterior: ler('TextoAnterior') ?? 'ANTERIOR',
    proxima: ler('TextoProxima') ?? 'PRÓXIMA'
  };
};
