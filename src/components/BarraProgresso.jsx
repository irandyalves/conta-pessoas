import React from 'react';

// Barra de progresso do celular: 5 estilos. O editor mostra as mesmas barras em miniatura.
export const ESTILOS_PROGRESSO = [
  { id: 'degrade', nome: 'Degradê', detalhe: 'Começa numa cor e termina em outra' },
  { id: 'cor', nome: 'Cor única', detalhe: 'Simples, uma cor só' },
  { id: 'blocos', nome: 'Blocos', detalhe: 'Um bloco por página' },
  { id: 'brilho', nome: 'Brilho', detalhe: 'Luz correndo pela barra' },
  { id: 'marcador', nome: 'Marcador', detalhe: 'Bolinha com a porcentagem' }
];
export const CORES_PROGRESSO = [
  { id: 'vermelho', label: 'Vermelho', hex: '#f5142f' },
  { id: 'laranja', label: 'Laranja', hex: '#ff7a00' },
  { id: 'amarelo', label: 'Amarelo', hex: '#ffd400' },
  { id: 'verde', label: 'Verde', hex: '#00c853' },
  { id: 'ciano', label: 'Turquesa', hex: '#00c2d1' },
  { id: 'azul', label: 'Azul', hex: '#0a6cff' },
  { id: 'roxo', label: 'Roxo', hex: '#8b3dff' },
  { id: 'rosa', label: 'Rosa', hex: '#ff2d87' },
  { id: 'branco', label: 'Branco', hex: '#ffffff' }
];
export const CORES_PROGRESSO_LAYOUT = [{ id: 'layout', label: 'Do layout', hex: 'conic-gradient(#8c2438, #ffcf5c, #5fe3c0, #1b49d6, #8c2438)' }, ...CORES_PROGRESSO];
export const usaDuasCores = (estilo) => ['degrade', 'blocos', 'marcador'].includes(estilo);

const hexDe = (id, padrao) => CORES_PROGRESSO.find((c) => c.id === id)?.hex || padrao;

function hsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  const h = !d ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, d ? d / (1 - Math.abs(2 * l - 1)) : 0, l];
}
// Mistura pela roda de cores: vermelho → verde passa por laranja e amarelo, sem virar marrom
export function corEntre(a, b, t) {
  const [h1, s1, l1] = hsl(a), [h2, s2, l2] = hsl(b);
  const semCor = s1 < 0.05 || s2 < 0.05;
  const dh = semCor ? 0 : ((h2 - h1 + 540) % 360) - 180;
  const h = s1 < 0.05 ? h2 : h1 + dh * t;
  return `hsl(${Math.round((h + 360) % 360)} ${Math.round((s1 + (s2 - s1) * t) * 100)}% ${Math.round((l1 + (l2 - l1) * t) * 100)}%)`;
}

export default function BarraProgresso({ config = {}, valor = 0, etapas = 5, demo = false }) {
  const estilo = config.progressoEstilo || 'cor';
  const p = Math.max(0, Math.min(1, valor));
  const c1 = hexDe(config.progressoCor1, '#f5142f');
  const c2 = hexDe(config.progressoCor2, '#00c853');
  const unica = hexDe(config.progressoCor, 'var(--acento, #fbbf24)');
  const altura = demo ? 6 : Number(config.progressoAltura) || 4;
  const raiz = `t-progresso t-progresso-${estilo} ${demo ? 't-progresso-demo' : ''}`;
  const pct = `${Math.round(p * 100)}%`;
  const acess = demo ? { 'aria-hidden': true } : { role: 'progressbar', 'aria-label': 'Progresso', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(p * 100) };

  if (estilo === 'blocos') {
    const n = Math.max(1, Math.min(40, etapas));
    const cheios = Math.round(p * n);
    return (
      <div className={raiz} style={{ height: Math.max(altura, 4) }} {...acess}>
        {Array.from({ length: n }, (_, i) => <b key={i} style={i < cheios ? { background: corEntre(c1, c2, n > 1 ? i / (n - 1) : 1) } : undefined} />)}
      </div>
    );
  }
  const atual = corEntre(c1, c2, p);
  const fundo = usaDuasCores(estilo)
    ? `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((k) => corEntre(c1, c2, p * k)).join(', ')})`
    : unica;
  return (
    <div className={raiz} style={{ height: altura }} {...acess}>
      <i style={{ width: pct, background: fundo, ...(estilo === 'degrade' ? { boxShadow: `0 0 10px ${atual}` } : {}) }} />
      {estilo === 'marcador' && <em style={{ left: `clamp(17px, ${pct}, calc(100% - 17px))`, background: atual }}>{pct}</em>}
    </div>
  );
}
