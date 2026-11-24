import React from 'react';
import { corHumor, useMola } from './Rosto';

// Avatares de corpo inteiro da escala. p: 0 = péssimo, 1 = ótimo.
// Mesma linguagem do Boneco: desanimado embaixo, festa em cima.
const entre = (a, b, t) => a + (b - a) * t;
const limitar = (t) => Math.max(0, Math.min(1, t));

// Pálpebra: fatia de cima (ou de baixo) do olho
function palpebra(cx, cy, r, f, baixo = false) {
  if (f <= 0.01) return '';
  const y = baixo ? cy + r - 2 * r * f : cy - r + 2 * r * f;
  const w = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2));
  return `M${cx - w} ${y} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} ${baixo ? 0 : 1} ${cx + w} ${y} Z`;
}

function Quadro({ p, tamanho, children }) {
  const [x, v] = useMola(p, 130, 11);
  const t = limitar(x);
  const inclina = Math.max(-10, Math.min(10, v * 4));
  const olhar = Math.max(-4, Math.min(4, v * 2));
  return (
    <svg viewBox="0 0 160 190" width={tamanho * 0.84} height={tamanho} aria-hidden="true" className={`boneco ${t > 0.86 ? 'boneco-festa' : ''}`} style={{ overflow: 'visible' }}>
      <ellipse cx="80" cy="184" rx={entre(44, 34, t)} ry="5" fill="#000" opacity=".28" />
      <g transform={`rotate(${inclina} 80 180)`}>
        <g className="boneco-corpo"><g transform={`translate(0 ${entre(6, 0, limitar(t * 1.6))})`}>{children(t, olhar)}</g></g>
      </g>
    </svg>
  );
}

const Lagrima = ({ x, y, t }) => <path d={`M${x} ${y} q-5 9 0 12 q5 -3 0 -12 z`} fill="#7dd3fc" opacity={limitar((0.16 - t) / 0.16)} className="rosto-lagrima" />;

export function Coruja({ p = 0.5, tamanho = 150 }) {
  return (
    <Quadro p={p} tamanho={tamanho}>
      {(t, olhar) => {
        const asa = entre(6, 128, t);
        const fecha = entre(0.52, 0, limitar(t * 1.7));
        const sorri = entre(0, 0.3, limitar((t - 0.7) / 0.3));
        const tomba = entre(16, 0, limitar(t * 2));
        const orelha = entre(34, -6, t);
        const bico = entre(0, 9, limitar((t - 0.55) / 0.45));
        return (
          <>
            <g fill="#f59e0b" stroke="#b45309" strokeWidth="1.5">
              <path d="M54 172 q-8 10 -10 10 h10 l4 -3 l4 3 h8 q-2 -8 -4 -12 z" />
              <path d="M106 172 q8 10 10 10 h-10 l-4 -3 l-4 3 h-8 q2 -8 4 -12 z" />
            </g>
            <ellipse cx="29" cy="122" rx="15" ry="36" fill="#1d4ed8" transform={`rotate(${asa} 35 92)`} />
            <ellipse cx="131" cy="122" rx="15" ry="36" fill="#1d4ed8" transform={`rotate(${-asa} 125 92)`} />
            <path d="M38 66 L34 26 L68 48 Z" fill="#1d4ed8" transform={`rotate(${-orelha} 52 58)`} />
            <path d="M122 66 L126 26 L92 48 Z" fill="#1d4ed8" transform={`rotate(${orelha} 108 58)`} />
            <path d="M80 40 C120 40 134 74 134 112 C134 154 112 176 80 176 C48 176 26 154 26 112 C26 74 40 40 80 40 Z" fill="#3b82f6" />
            <ellipse cx="62" cy="54" rx="22" ry="8" fill="#fff" opacity=".18" transform="rotate(-18 62 54)" />
            <ellipse cx="80" cy="140" rx="34" ry="33" fill="#dbeafe" />
            <g fill="none" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M62 130 l6 6 l6 -6 M86 130 l6 6 l6 -6 M74 143 l6 6 l6 -6 M62 154 l6 6 l6 -6 M86 154 l6 6 l6 -6" />
            </g>
            <circle cx="58" cy="86" r="27" fill="#bfdbfe" />
            <circle cx="102" cy="86" r="27" fill="#bfdbfe" />
            {[58, 102].map((cx, i) => (
              <g key={cx}>
                <circle cx={cx} cy="86" r="20" fill="#fff" />
                <circle cx={cx + olhar} cy={entre(91, 85, t)} r={entre(8.5, 11, t)} fill="#0f172a" />
                <circle cx={cx + olhar - 3.5} cy={entre(87, 81, t)} r="3.4" fill="#fff" />
                <g fill="#60a5fa" transform={`rotate(${i ? tomba : -tomba} ${cx} 86)`}>
                  <path d={palpebra(cx, 86, 20.5, fecha)} />
                </g>
                <path d={palpebra(cx, 86, 20.5, sorri, true)} fill="#bfdbfe" />
              </g>
            ))}
            <path d={`M72 100 L88 100 L80 ${112 + bico} Z`} fill="#b45309" />
            <path d="M70 98 Q80 91 90 98 L80 112 Z" fill="#f59e0b" />
            <Lagrima x={46} y={104} t={t} />
          </>
        );
      }}
    </Quadro>
  );
}

export function Gato({ p = 0.5, tamanho = 150 }) {
  return (
    <Quadro p={p} tamanho={tamanho}>
      {(t, olhar) => {
        const orelha = entre(32, 0, t);
        const feliz = limitar((t - 0.72) / 0.28);
        const fecha = entre(0.46, 0, limitar(t * 1.8));
        const pata = entre(0, 108, limitar((t - 0.35) / 0.65));
        const boca = entre(-7, 7, t);
        return (
          <>
            <path d="M112 160 C150 160 150 120 132 104" fill="none" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" transform={`rotate(${entre(52, -8, t)} 112 160)`} />
            <path d="M80 92 C112 92 120 130 118 160 Q116 178 80 178 Q44 178 42 160 C40 130 48 92 80 92 Z" fill="#fbbf24" />
            <ellipse cx="80" cy="148" rx="22" ry="27" fill="#fff7e0" />
            <g fill="#f59e0b">
              <ellipse cx="48" cy="140" rx="10" ry="26" transform={`rotate(${pata} 50 116)`} />
              <ellipse cx="112" cy="140" rx="10" ry="26" transform={`rotate(${-pata} 110 116)`} />
            </g>
            <g fill="#fff7e0"><ellipse cx="62" cy="177" rx="14" ry="8" /><ellipse cx="98" cy="177" rx="14" ry="8" /></g>
            <g transform={`rotate(${-orelha} 50 48)`}><path d="M36 62 L34 14 L72 40 Z" fill="#fbbf24" /><path d="M42 48 L41 26 L59 39 Z" fill="#fda4af" /></g>
            <g transform={`rotate(${orelha} 110 48)`}><path d="M124 62 L126 14 L88 40 Z" fill="#fbbf24" /><path d="M118 48 L119 26 L101 39 Z" fill="#fda4af" /></g>
            <ellipse cx="80" cy="74" rx="49" ry="43" fill="#fbbf24" />
            <g stroke="#d97706" strokeWidth="5" strokeLinecap="round"><path d="M80 34 V48 M66 37 L68 48 M94 37 L92 48 M33 74 H43 M127 74 H117" /></g>
            {[59, 101].map((cx, i) => (
              <g key={cx}>
                <g opacity={1 - feliz}>
                  <circle cx={cx} cy="72" r="12" fill="#fff" />
                  <ellipse cx={cx + olhar} cy="73" rx={entre(4.5, 7.5, t)} ry="9.5" fill="#1e293b" />
                  <circle cx={cx + olhar - 2.5} cy="69" r="2.6" fill="#fff" />
                  <g fill="#f5b21b" transform={`rotate(${i ? entre(16, 0, t) : entre(-16, 0, t)} ${cx} 72)`}><path d={palpebra(cx, 72, 12.5, fecha)} /></g>
                </g>
                <path d={`M${cx - 12} 76 Q${cx} 60 ${cx + 12} 76`} fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" opacity={feliz} />
              </g>
            ))}
            <g fill="#fb7185" opacity={entre(0, 0.5, t)}><circle cx="42" cy="90" r="8" /><circle cx="118" cy="90" r="8" /></g>
            <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".85">
              <path d={`M40 ${entre(90, 84, t)} L14 ${entre(100, 76, t)} M40 96 L14 ${entre(108, 94, t)} M120 ${entre(90, 84, t)} L146 ${entre(100, 76, t)} M120 96 L146 ${entre(108, 94, t)}`} />
            </g>
            <path d={`M66 ${97 - boca * 0.4} Q73 ${97 + boca} 80 93 Q87 ${97 + boca} 94 ${97 - boca * 0.4}`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M72 97 Q80 ${99 + feliz * 18} 88 97 Z`} fill="#be123c" opacity={feliz} />
            <path d="M73 84 H87 L80 92 Z" fill="#fb7185" stroke="#fb7185" strokeWidth="2" strokeLinejoin="round" />
            <Lagrima x={46} y={84} t={t} />
          </>
        );
      }}
    </Quadro>
  );
}

export function Robo({ p = 0.5, tamanho = 150 }) {
  return (
    <Quadro p={p} tamanho={tamanho}>
      {(t, olhar) => {
        const cor = corHumor(t);
        const braco = entre(10, 122, t);
        const boca = entre(-12, 14, t);
        const feliz = limitar((t - 0.72) / 0.28);
        const antena = entre(38, 0, t);
        return (
          <>
            <g stroke="#64748b" strokeWidth="11" strokeLinecap="round"><path d="M66 148 V172 M94 148 V172" /></g>
            <g fill="#334155"><rect x="50" y="168" width="28" height="14" rx="7" /><rect x="82" y="168" width="28" height="14" rx="7" /></g>
            <g transform={`rotate(${braco} 46 108)`}><path d="M46 108 V138" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" /><circle cx="46" cy="144" r="9" fill="#475569" /></g>
            <g transform={`rotate(${-braco} 114 108)`}><path d="M114 108 V138" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" /><circle cx="114" cy="144" r="9" fill="#475569" /></g>
            <rect x="48" y="98" width="64" height="58" rx="16" fill="#cbd5e1" />
            <rect x="48" y="130" width="64" height="26" rx="13" fill="#94a3b8" opacity=".55" />
            <path d="M80 138 C70 130 64 125 64 118 A8 8 0 0 1 80 115 A8 8 0 0 1 96 118 C96 125 90 130 80 138 Z" fill={cor} style={{ filter: `drop-shadow(0 0 ${entre(2, 8, t)}px ${cor})` }} />
            <g transform={`rotate(${antena} 80 32)`}>
              <path d="M80 32 V14" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
              <circle cx="80" cy="10" r="8" fill={cor} style={{ filter: `drop-shadow(0 0 ${entre(2, 9, t)}px ${cor})` }} />
            </g>
            <rect x="22" y="52" width="14" height="26" rx="6" fill="#64748b" /><rect x="124" y="52" width="14" height="26" rx="6" fill="#64748b" />
            <rect x="30" y="30" width="100" height="70" rx="24" fill="#e2e8f0" />
            <rect x="39" y="39" width="82" height="52" rx="17" fill="#0f172a" />
            <ellipse cx="60" cy="46" rx="16" ry="4" fill="#fff" opacity=".14" />
            {[61, 99].map((cx, i) => (
              <g key={cx} style={{ filter: `drop-shadow(0 0 4px ${cor})` }}>
                <g opacity={1 - feliz} className="rosto-olhos">
                  <rect x={cx - 7 + olhar} y={entre(60, 52, t)} width="14" height={entre(7, 18, limitar(t * 1.6))} rx="5" fill={cor} transform={`rotate(${(i ? 1 : -1) * entre(18, 0, limitar(t * 2))} ${cx} 62)`} />
                </g>
                <path d={`M${cx - 9} 66 Q${cx} 50 ${cx + 9} 66`} fill="none" stroke={cor} strokeWidth="5.5" strokeLinecap="round" opacity={feliz} />
              </g>
            ))}
            <path d={`M66 ${79 - boca * 0.28} Q80 ${79 + boca} 94 ${79 - boca * 0.28}`} fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${cor})` }} />
            <Lagrima x={52} y={70} t={t} />
          </>
        );
      }}
    </Quadro>
  );
}
