// 20 fontes para títulos, subtítulos, cards e botões. O celular só baixa as que estão em uso.
export const FONTES = [
  { id: 'jakarta', nome: 'Plus Jakarta Sans', css: "'Plus Jakarta Sans', sans-serif" }, // já vem com a página
  { id: 'montserrat', nome: 'Montserrat', google: 'Montserrat:wght@400;600;800' },
  { id: 'poppins', nome: 'Poppins', google: 'Poppins:wght@400;600;800' },
  { id: 'nunito', nome: 'Nunito', google: 'Nunito:wght@400;700;900' },
  { id: 'lato', nome: 'Lato', google: 'Lato:wght@400;700;900' },
  { id: 'sora', nome: 'Sora', google: 'Sora:wght@400;600;800' },
  { id: 'lexend', nome: 'Lexend', google: 'Lexend:wght@400;600;800' },
  { id: 'archivo', nome: 'Archivo', google: 'Archivo:wght@400;600;800' },
  { id: 'atkinson', nome: 'Atkinson Hyperlegible', google: 'Atkinson+Hyperlegible:wght@400;700' },
  { id: 'robotocond', nome: 'Roboto Condensed', google: 'Roboto+Condensed:wght@400;700' },
  { id: 'oswald', nome: 'Oswald', google: 'Oswald:wght@400;600;700' },
  { id: 'bebas', nome: 'Bebas Neue', google: 'Bebas+Neue' },
  { id: 'playfair', nome: 'Playfair Display', google: 'Playfair+Display:wght@400;700;900', serifa: true },
  { id: 'merriweather', nome: 'Merriweather', google: 'Merriweather:wght@400;700;900', serifa: true },
  { id: 'lora', nome: 'Lora', google: 'Lora:wght@400;700', serifa: true },
  { id: 'spectral', nome: 'Spectral', google: 'Spectral:wght@400;700', serifa: true },
  { id: 'cinzel', nome: 'Cinzel', google: 'Cinzel:wght@400;700', serifa: true },
  { id: 'marcellus', nome: 'Marcellus', google: 'Marcellus', serifa: true },
  { id: 'caveat', nome: 'Caveat', google: 'Caveat:wght@400;700', mao: true },
  { id: 'pacifico', nome: 'Pacifico', google: 'Pacifico', mao: true }
];

export const fontePorId = (id) => FONTES.find((f) => f.id === id);
export const familiaCss = (id) => {
  const f = fontePorId(id);
  return f ? f.css || `'${f.nome}', ${f.serifa ? 'Georgia, serif' : f.mao ? 'cursive' : 'sans-serif'}` : undefined;
};

export const carregarFontes = (ids) => {
  if (typeof document === 'undefined') return;
  ids.forEach((id) => {
    const f = fontePorId(id);
    const chave = `fonte-${id}`;
    if (!f?.google || document.getElementById(chave)) return;
    const l = document.createElement('link');
    l.id = chave;
    l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
    document.head.appendChild(l);
  });
};

// Fontes em uso numa configuração (campos terminados em "Familia", no evento e nas telas)
export const fontesEmUso = (cfg = {}) => {
  const ids = new Set();
  [cfg, ...(cfg.telasExtras || [])].forEach((o) => Object.entries(o || {}).forEach(([k, v]) => { if (k.endsWith('Familia') && v) ids.add(v); }));
  return [...ids];
};
