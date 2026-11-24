import React, { useEffect, useRef, useState } from 'react';

// =====================================================================
// PREVIEW FIEL DO CELULAR
// Em vez de redesenhar cada tela (o que sempre ficava diferente do aparelho),
// carrega o PRÓPRIO formulário do celular (/?view=preview) num iframe com a
// largura real do aparelho em pixels CSS e reduz tudo proporcionalmente.
// Mesmo código, mesma fonte, mesma largura => mesmas quebras de linha.
// =====================================================================
export default function PreviewCelular({
  config,
  titulo,
  passo,
  viewport,
  moldura = '',
  selecionado = false,
  onSelecionar,
  rotulo = ''
}) {
  const caixaRef = useRef(null);
  const frameRef = useRef(null);
  const [escala, setEscala] = useState(0.65);
  // Conta quantas vezes o iframe ficou pronto (se recarregar, reenvia a config)
  const [pronto, setPronto] = useState(0);

  // Escala = largura disponível / largura real do aparelho
  useEffect(() => {
    const el = caixaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entrada]) => {
      const w = entrada.contentRect.width;
      if (w > 0) setEscala(w / viewport.w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewport.w]);

  // O iframe avisa quando o formulário está pronto para receber a config
  useEffect(() => {
    const aoReceber = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.source === frameRef.current?.contentWindow && e.data?.tipo === 'responder-preview-pronto') {
        setPronto((n) => n + 1);
      }
    };
    window.addEventListener('message', aoReceber);
    return () => window.removeEventListener('message', aoReceber);
  }, []);

  // Envia a config ao vivo (cada edição aparece na hora, sem salvar)
  useEffect(() => {
    if (!pronto) return;
    try {
      frameRef.current?.contentWindow?.postMessage(
        { tipo: 'responder-preview', config, titulo, passo },
        window.location.origin
      );
    } catch (e) {
      console.error('Falha ao atualizar o preview:', e);
    }
  }, [pronto, config, titulo, passo]);

  return (
    <div className="w-full flex flex-col items-center gap-1.5 p-0.5" data-preview="1">
      <div
        className={`relative w-full max-w-[260px] ${moldura} bg-black overflow-hidden transition-shadow duration-300 ${
          selecionado
            ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-950 border-slate-700'
            : 'border-slate-800 shadow-xl'
        }`}
      >
        <div ref={caixaRef} className="relative w-full" style={{ height: `${viewport.h * escala}px` }}>
          <iframe
            ref={frameRef}
            src="/?view=preview"
            title={rotulo || 'Prévia do celular'}
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${viewport.w}px`,
              height: `${viewport.h}px`,
              border: 0,
              transform: `scale(${escala})`,
              transformOrigin: '0 0',
              background: '#020617'
            }}
          />
          {/* Celulares não selecionados: um toque seleciona a aba. O selecionado fica interativo. */}
          {!selecionado && (
            <button
              type="button"
              onClick={onSelecionar}
              aria-label={`Editar ${rotulo}`}
              className="absolute inset-0 w-full h-full cursor-pointer bg-transparent hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            />
          )}
        </div>
      </div>
      {rotulo && (
        <span className={`text-xs ${selecionado ? 'text-white font-semibold' : 'text-slate-400'}`}>{rotulo}</span>
      )}
    </div>
  );
}
