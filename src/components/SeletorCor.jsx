import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// =====================================================================
// COR PADRÃO DO EDITOR
// Uma palavra na barra ("Texto", "Fundo", "Borda"...) que já aparece na cor escolhida.
// Passou o mouse (ou clicou/tocou): um cartão abre na frente dela com as cores.
// Tirou o mouse: fecha depois de 0,3 s.
// =====================================================================
const ABRE_MS = 90; // só atravessar a barra não abre nada
const FECHA_MS = 300;
let fecharAberto = null; // um cartão por vez

const TIPO = {
  Texto: 'texto', 'Cor do texto': 'texto', Título: 'texto', Descrição: 'texto', 'Cor do número': 'texto', Número: 'texto',
  Fundo: 'fundo', 'Fundo do card': 'fundo', 'Cor do botão': 'fundo', Botão: 'fundo',
  Borda: 'borda'
};

const corClara = (css) => {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(css || '');
  if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) return false;
  return 0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3] > 150;
};

export default function Cores({ rotulo, opcoes, valor, onChange, campo = 'bg', quadrado = false, lateral = null, como, desativado = '' }) {
  const atual = opcoes.find((o) => o.id === valor) || opcoes[0];
  const tipo = como || TIPO[rotulo] || 'ponto';
  const [pos, setPos] = useState(null);
  const [tinta, setTinta] = useState('');
  const chip = useRef(null);
  const cartao = useRef(null);
  const relogio = useRef(0);
  const dispensado = useRef(false); // fechou de propósito: não reabre até o mouse sair da palavra
  const classeDe = (o) => (campo === 'hex' ? o.dot : o[campo]) || '';
  const hexDe = (o) => (campo === 'hex' ? o.hex : undefined);
  const semCor = atual.id === 'transparente' || atual.id === 'nenhum';
  const original = atual.id === 'padrao'; // cor de fábrica: a palavra fica neutra

  const fechar = useCallback(() => {
    clearTimeout(relogio.current);
    setPos(null);
  }, []);
  const abrir = () => {
    clearTimeout(relogio.current);
    if (pos || desativado) return;
    if (fecharAberto && fecharAberto !== fechar) fecharAberto();
    fecharAberto = fechar;
    const r = chip.current.getBoundingClientRect();
    setPos({ x: r.left - 8, y: r.top - 8 });
  };
  const daquiAPouco = (f, ms) => { clearTimeout(relogio.current); relogio.current = setTimeout(f, ms); };
  const sair = (e) => {
    if (e.buttons) return; // arrastando um controle de dentro do cartão
    daquiAPouco(fechar, FECHA_MS);
  };
  const ehMouse = (e) => e.pointerType !== 'touch';

  useEffect(() => () => { clearTimeout(relogio.current); if (fecharAberto === fechar) fecharAberto = null; }, [fechar]);

  // cabe sempre na tela
  useLayoutEffect(() => {
    if (!pos || !cartao.current) return;
    const { offsetWidth: w, offsetHeight: h } = cartao.current;
    const x = Math.max(8, Math.min(pos.x, window.innerWidth - w - 8));
    const y = Math.max(8, Math.min(pos.y, window.innerHeight - h - 8));
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos]);

  useEffect(() => {
    if (!pos) return undefined;
    const fora = (e) => { if (!cartao.current?.contains(e.target) && !chip.current?.contains(e.target)) { dispensado.current = true; fechar(); } };
    const tecla = (e) => { if (e.key === 'Escape') { dispensado.current = true; fechar(); chip.current?.focus(); } };
    // soltou um controle deslizante fora do cartão
    const soltou = (e) => { if (!cartao.current?.contains(e.target) && !chip.current?.contains(e.target)) daquiAPouco(fechar, FECHA_MS); };
    const rolou = (e) => { if (!cartao.current?.contains(e.target)) fechar(); };
    document.addEventListener('pointerdown', fora, true);
    document.addEventListener('pointerup', soltou, true);
    document.addEventListener('keydown', tecla);
    document.addEventListener('scroll', rolou, true);
    return () => {
      document.removeEventListener('pointerdown', fora, true);
      document.removeEventListener('pointerup', soltou, true);
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('scroll', rolou, true);
    };
  }, [pos, fechar]);

  // palavra legível sobre o fundo escolhido
  useLayoutEffect(() => {
    if (tipo !== 'fundo' || !chip.current) { setTinta(''); return; }
    const css = getComputedStyle(chip.current.querySelector('[data-cor]')).backgroundColor;
    setTinta(semCor || original ? '' : corClara(css) ? '#0b1220' : '#ffffff');
  }, [tipo, atual.id, semCor, original, opcoes]);

  const escura = ['preto', 'noite'].includes(atual.id);
  const hex = hexDe(atual);
  const palavra = original && tipo !== 'ponto'
    ? <><span data-cor className={tipo === 'borda' ? 'cor-contorno' : ''} /><span className="cor-rotulo">{rotulo}</span></>
    : tipo === 'texto'
    ? <span data-cor className={`cor-palavra ${hex ? '' : classeDe(atual).replace(/\bborder\S*/g, '')}`} style={hex ? { background: hex } : undefined}>{rotulo}</span>
    : tipo === 'fundo'
      ? <><span data-cor className={`cor-cheia ${semCor ? 'cor-vazia' : hex ? '' : classeDe(atual)}`} style={hex && !semCor ? { background: hex } : undefined} /><span className="cor-rotulo" style={tinta ? { color: tinta, textShadow: tinta === '#ffffff' ? '0 1px 2px rgba(0,0,0,.7)' : 'none' } : undefined}>{rotulo}</span></>
      : tipo === 'borda'
        ? <><span data-cor className={`cor-contorno ${semCor ? 'cor-vazia' : ''}`} style={!semCor && hex?.startsWith('#') ? { borderColor: hex } : undefined} /><span className="cor-rotulo">{rotulo}</span></>
        : <><span data-cor className={`cor-ponto ${quadrado ? 'rounded-[4px]' : 'rounded-full'} ${hex ? '' : classeDe(atual)}`} style={hex ? { background: hex } : undefined} /><span className="cor-rotulo">{rotulo}</span></>;

  return (
    <>
      <button
        ref={chip}
        type="button"
        disabled={Boolean(desativado)}
        aria-haspopup="dialog"
        aria-expanded={Boolean(pos)}
        aria-label={`${rotulo}: ${atual.label}`}
        title={desativado || (pos ? undefined : `${rotulo}: ${atual.label}`)}
        className={`cor-chip cor-chip-${tipo} ${tipo === 'texto' && escura ? 'cor-chip-claro' : ''}`}
        onPointerEnter={(e) => { if (ehMouse(e) && !e.buttons && !dispensado.current) daquiAPouco(abrir, pos ? 0 : ABRE_MS); }}
        onPointerLeave={(e) => { dispensado.current = false; if (ehMouse(e)) sair(e); }}
        onClick={() => { dispensado.current = false; abrir(); }}
      >
        {palavra}
      </button>
      {pos && createPortal(
        <div
          ref={cartao}
          role="dialog"
          aria-label={`Cores de ${rotulo}`}
          className="editor cor-cartao"
          style={{ left: pos.x, top: pos.y }}
          onPointerEnter={() => clearTimeout(relogio.current)}
          onPointerLeave={(e) => { if (ehMouse(e)) sair(e); }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <p><b>{rotulo}</b><span>{atual.label}</span></p>
          <div className={quadrado ? 'cor-lista cor-lista-larga' : 'cor-lista'} role="listbox" aria-label={rotulo}>
            {opcoes.map((o) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={o.id === atual.id}
                title={o.label}
                aria-label={o.label}
                onClick={() => onChange(o.id)}
              >
                <i className={`${hexDe(o) && o.id !== 'transparente' ? '' : classeDe(o)} ${o.id === 'transparente' ? 'cor-vazia' : ''}`} style={hexDe(o) && o.id !== 'transparente' ? { background: hexDe(o) } : undefined} />
              </button>
            ))}
          </div>
          {lateral && <div className="cor-lateral">{lateral}</div>}
        </div>,
        document.body
      )}
    </>
  );
}
