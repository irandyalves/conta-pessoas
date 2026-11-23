import React from 'react';

// Ícones animados da tela de espera (SVG + CSS, sem bibliotecas).
// Animações definidas em index.css (classes ie-*).
export const ICONES_ESPERA = [
  { id: 'lapis', label: 'Lápis escrevendo' },
  { id: 'prancheta', label: 'Checklist' },
  { id: 'ampulheta', label: 'Ampulheta' },
  { id: 'relogio', label: 'Relógio' },
  { id: 'celular', label: 'Celular' },
  { id: 'conversa', label: 'Digitando' },
  { id: 'coracao', label: 'Coração' },
  { id: 'sino', label: 'Sino' },
  { id: 'estrela', label: 'Estrelas' },
  { id: 'roda', label: 'Roda de luz' }
];

const T = { stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

function Svg({ children, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`} aria-hidden="true">
      {children}
    </svg>
  );
}

const DESENHOS = {
  lapis: (
    <Svg className="text-amber-300">
      <rect x="12" y="8" width="34" height="46" rx="4" {...T} className="text-slate-300" />
      <path d="M19 22h20M19 30h20M19 38h12" {...T} strokeWidth="2.5" className="ie-escrever text-slate-400" />
      <g className="ie-lapis">
        <path d="M38 44l14-14 5 5-14 14-7 2z" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
        <path d="M36 51l2-7 5 5z" fill="#fde68a" />
      </g>
    </Svg>
  ),
  prancheta: (
    <Svg className="text-emerald-400">
      <rect x="14" y="10" width="36" height="46" rx="4" {...T} className="text-slate-300" />
      <rect x="24" y="6" width="16" height="8" rx="2" fill="#334155" />
      <path d="M21 24l3 3 6-6" {...T} className="ie-check ie-d1" />
      <path d="M21 36l3 3 6-6" {...T} className="ie-check ie-d2" />
      <path d="M21 48l3 3 6-6" {...T} className="ie-check ie-d3" />
      <path d="M34 25h10M34 37h10M34 49h10" {...T} strokeWidth="2.5" className="text-slate-500" />
    </Svg>
  ),
  ampulheta: (
    <Svg className="text-amber-300">
      <g className="ie-girar-lento">
        <path d="M18 8h28M18 56h28M20 8c0 14 24 14 24 24S20 42 20 56M44 8c0 14-24 14-24 24s24 10 24 24" {...T} />
        <path d="M26 16h12l-6 8z" fill="#fbbf24" className="ie-areia" />
        <path d="M24 52h16l-8-8z" fill="#fbbf24" />
      </g>
    </Svg>
  ),
  relogio: (
    <Svg className="text-sky-300">
      <circle cx="32" cy="32" r="24" {...T} />
      <path d="M32 32V16" {...T} className="ie-ponteiro-rapido" />
      <path d="M32 32h10" {...T} className="ie-ponteiro-lento" />
      <circle cx="32" cy="32" r="2.5" fill="currentColor" />
    </Svg>
  ),
  celular: (
    <Svg className="text-emerald-300">
      <g className="ie-vibrar">
        <rect x="20" y="6" width="24" height="52" rx="5" {...T} />
        <path d="M28 12h8" {...T} />
        <path d="M27 32l4 4 8-8" {...T} className="ie-check ie-d1" />
      </g>
      <path d="M12 24v16M52 24v16" {...T} className="ie-piscar" />
    </Svg>
  ),
  conversa: (
    <Svg className="text-sky-300">
      <path d="M10 14h44a4 4 0 014 4v22a4 4 0 01-4 4H28l-10 8v-8h-8a4 4 0 01-4-4V18a4 4 0 014-4z" {...T} />
      <circle cx="22" cy="29" r="3.5" fill="currentColor" className="ie-pulo ie-d1" />
      <circle cx="32" cy="29" r="3.5" fill="currentColor" className="ie-pulo ie-d2" />
      <circle cx="42" cy="29" r="3.5" fill="currentColor" className="ie-pulo ie-d3" />
    </Svg>
  ),
  coracao: (
    <Svg className="text-rose-400">
      <path d="M32 54S8 40 8 23a12 12 0 0124-5 12 12 0 0124 5c0 17-24 31-24 31z" fill="currentColor" className="ie-batida" />
    </Svg>
  ),
  sino: (
    <Svg className="text-amber-300">
      <g className="ie-balancar">
        <path d="M32 8v4M18 44V30a14 14 0 0128 0v14l4 6H14z" {...T} />
        <circle cx="32" cy="54" r="4" fill="currentColor" />
      </g>
    </Svg>
  ),
  estrela: (
    <Svg className="text-amber-300">
      <path d="M32 6l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" fill="currentColor" className="ie-brilho ie-d1" />
      <path d="M50 42l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#6ee7b7" className="ie-brilho ie-d2" />
      <path d="M12 42l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#7dd3fc" className="ie-brilho ie-d3" />
    </Svg>
  )
};

export default function IconeEspera({ tipo = 'lapis', tamanho = 128 }) {
  if (tipo === 'roda' || !DESENHOS[tipo]) {
    const s = tamanho;
    return (
      <div className="relative flex items-center justify-center" style={{ width: s, height: s }}>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-emerald-400 animate-spin" style={{ animationDuration: '2.5s' }} />
        <div className="absolute inset-[10%] rounded-full border-4 border-transparent border-b-sky-400 border-l-amber-300 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-xl animate-pulse" />
      </div>
    );
  }
  return (
    <div className="relative flex items-center justify-center" style={{ width: tamanho, height: tamanho }}>
      <div className="absolute inset-[12%] rounded-full bg-emerald-400/10 blur-xl animate-pulse" />
      <div className="relative w-[78%] h-[78%] drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]">{DESENHOS[tipo]}</div>
    </div>
  );
}
