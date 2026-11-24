import React, { useEffect, useRef, useState } from 'react';

// Mola: o valor "corre atrás" do alvo com um pequeno balanço. É isso que dá vida à carinha ao arrastar.
export function useMola(alvo, rigidez = 170, amortecimento = 15) {
  const [x, setX] = useState(alvo);
  const st = useRef({ x: alvo, v: 0 });
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { st.current = { x: alvo, v: 0 }; setX(alvo); return undefined; }
    let id;
    let antes = performance.now();
    const passo = (agora) => {
      const dt = Math.min(0.032, (agora - antes) / 1000);
      antes = agora;
      const s = st.current;
      s.v += ((alvo - s.x) * rigidez - s.v * amortecimento) * dt;
      s.x += s.v * dt;
      if (Math.abs(alvo - s.x) < 0.002 && Math.abs(s.v) < 0.01) { s.x = alvo; s.v = 0; setX(alvo); return; }
      setX(s.x);
      id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [alvo, rigidez, amortecimento]);
  return [x, st.current.v];
}

const entre = (a, b, t) => a + (b - a) * t;
const limitar = (t) => Math.max(0, Math.min(1, t));
export const corHumor = (p) => `hsl(${Math.round(limitar(p) * 135)}, 78%, 58%)`;

// Traços do rosto num quadro 100x100. p: 0 = péssimo, 1 = ótimo.
function Tracos({ p, olhar = 0 }) {
  const t = limitar(p);
  const pontas = entre(72, 58, t);
  const meio = entre(54, 86, t);
  const aberta = limitar((t - 0.7) / 0.3);
  const sobrancelha = entre(16, -8, t);
  const olho = entre(5.2, 6.4, t);
  return (
    <g>
      <g stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M24 30 L42 30" transform={`rotate(${sobrancelha} 33 30)`} />
        <path d="M58 30 L76 30" transform={`rotate(${-sobrancelha} 67 30)`} />
      </g>
      <g className="rosto-olhos" fill="#1e293b">
        <ellipse cx={34 + olhar} cy="43" rx={olho - 0.6} ry={olho} />
        <ellipse cx={66 + olhar} cy="43" rx={olho - 0.6} ry={olho} />
        <circle cx={32 + olhar} cy="41" r="1.7" fill="#fff" />
        <circle cx={64 + olhar} cy="41" r="1.7" fill="#fff" />
      </g>
      <g fill="#f43f5e" opacity={limitar((t - 0.6) / 0.4) * 0.35}>
        <circle cx="22" cy="57" r="7" />
        <circle cx="78" cy="57" r="7" />
      </g>
      <path d={`M30 ${pontas} Q50 ${meio} 70 ${pontas} Q50 ${entre(meio, pontas - 2, aberta)} 30 ${pontas} Z`} fill="#7f1d1d" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M27 52 q-5 9 0 12 q5 -3 0 -12 z" fill="#38bdf8" opacity={limitar((0.16 - t) / 0.16)} className="rosto-lagrima" />
    </g>
  );
}

export default function Rosto({ p = 0.5, tamanho = 90, vivo = true, apagado = false, anel = false, className = '' }) {
  const [x, v] = useMola(p);
  const giro = vivo ? Math.max(-14, Math.min(14, v * 5)) : 0;
  const pulo = vivo ? Math.min(0.1, Math.abs(v) * 0.04) : 0;
  return (
    <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} className={`rosto ${className}`} aria-hidden="true"
      style={{ transform: `rotate(${giro}deg) scale(${1 + pulo}, ${1 - pulo * 0.6})`, filter: apagado ? 'grayscale(1) opacity(.45)' : undefined, overflow: 'visible' }}>
      <circle cx="50" cy="50" r="46" fill={corHumor(x)} stroke="#fff" strokeWidth={anel ? 7 : 0} />
      <ellipse cx="38" cy="22" rx="20" ry="10" fill="#fff" opacity=".22" />
      <Tracos p={x} olhar={vivo ? Math.max(-4, Math.min(4, v * 2)) : 0} />
    </svg>
  );
}

// Boneco de corpo inteiro: ombros caídos na nota baixa, braços para cima e pulo na nota alta
export function Boneco({ p = 0.5, tamanho = 150 }) {
  const [x, v] = useMola(p, 130, 11);
  const t = limitar(x);
  const cor = corHumor(t);
  const braco = entre(18, 152, t);
  const curva = entre(9, 0, limitar(t * 1.6));
  const inclina = Math.max(-10, Math.min(10, v * 4));
  return (
    <svg viewBox="0 0 160 190" width={tamanho * 0.84} height={tamanho} aria-hidden="true" className={`boneco ${t > 0.86 ? 'boneco-festa' : ''}`} style={{ overflow: 'visible' }}>
      <ellipse cx="80" cy="184" rx={entre(40, 30, t)} ry="5" fill="#000" opacity=".28" />
      <g transform={`rotate(${inclina} 80 180)`}>
        <g className="boneco-corpo">
          <g stroke={cor} strokeWidth="15" strokeLinecap="round">
            <path d={`M68 138 L${entre(62, 58, t)} 176`} />
            <path d={`M92 138 L${entre(98, 102, t)} 176`} />
          </g>
          <g transform={`translate(0 ${curva})`}>
            <g stroke={cor} strokeWidth="13" strokeLinecap="round">
              <path d="M56 98 L56 136" transform={`rotate(${braco} 56 98)`} />
              <path d="M104 98 L104 136" transform={`rotate(${-braco} 104 98)`} />
            </g>
            <rect x="50" y="88" width="60" height="58" rx="26" fill={cor} />
            <rect x="50" y="88" width="60" height="58" rx="26" fill="#000" opacity=".12" />
            <g transform={`translate(36 ${curva}) scale(.88)`}>
              <circle cx="50" cy="50" r="46" fill={cor} />
              <ellipse cx="38" cy="22" rx="20" ry="10" fill="#fff" opacity=".22" />
              <Tracos p={x} olhar={Math.max(-4, Math.min(4, v * 2))} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
