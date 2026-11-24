import { useEffect, useRef, useState } from 'react';

const LIMITE = 60;
const PAUSA = 800; // digitação e controles deslizantes seguidos contam como uma alteração só

// Desfazer / refazer do editor. Guarda a configuração e a aba em que a alteração foi feita.
export default function useDesfazer({ config, setConfig, baseRef, aba, setAba, ativo }) {
  const h = useRef({ passado: [], futuro: [], atual: null, aba, tempo: 0 }).current;
  const [, redesenhar] = useState(0);

  useEffect(() => {
    if (config !== h.atual) {
      if (!baseRef.current || config === baseRef.current) {
        // evento aberto ou versão do servidor carregada: começa do zero
        Object.assign(h, { passado: [], futuro: [], tempo: 0 });
      } else if (h.atual) {
        const agora = Date.now();
        if (!h.passado.length || agora - h.tempo > PAUSA || h.aba !== aba) h.passado = [...h.passado, { config: h.atual, aba: h.aba }].slice(-LIMITE);
        h.futuro = [];
        h.tempo = agora;
      }
      h.atual = config;
      redesenhar((n) => n + 1);
    }
    h.aba = aba;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, aba]);

  const ir = (de, para) => {
    const alvo = h[de][h[de].length - 1];
    if (!alvo) return;
    h[para] = [...h[para], { config: h.atual, aba: h.aba }];
    h[de] = h[de].slice(0, -1);
    h.atual = { ...alvo.config }; // objeto novo: o salvamento automático sempre grava
    h.tempo = 0;
    setConfig(h.atual);
    if (alvo.aba !== aba) setAba(alvo.aba);
    redesenhar((n) => n + 1);
  };
  const desfazer = () => ir('passado', 'futuro');
  const refazer = () => ir('futuro', 'passado');

  useEffect(() => {
    if (!ativo) return undefined;
    const tecla = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k !== 'z' && k !== 'y') return;
      // Dentro de um campo de texto vale o desfazer do próprio navegador
      const alvo = e.target;
      if (alvo?.isContentEditable || alvo?.tagName === 'TEXTAREA' || (alvo?.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'color'].includes(alvo.type))) return;
      e.preventDefault();
      if (k === 'y' || e.shiftKey) refazer(); else desfazer();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  return { desfazer, refazer, podeDesfazer: h.passado.length > 0, podeRefazer: h.futuro.length > 0 };
}
