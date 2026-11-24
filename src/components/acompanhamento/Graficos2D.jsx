import React, { useEffect, useMemo, useRef, useState } from 'react';
import { coresNotas, fmtHora, fmtNum, fmtPct } from '../../utils/consolidar';

export const AZUL = '#3987e5';
export const OURO = '#fbbf24';
export const CATEGORIAS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c'];

// Número que "rola" até o valor novo
export function Numero({ valor, casas = 0 }) {
  const [v, setV] = useState(valor);
  const atual = useRef(valor);
  useEffect(() => {
    const de = atual.current;
    if (de === valor) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.hidden) { atual.current = valor; setV(valor); return undefined; }
    const t0 = performance.now();
    let q;
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 600);
      atual.current = de + (valor - de) * (1 - (1 - k) ** 3);
      setV(atual.current);
      if (k < 1) q = requestAnimationFrame(passo);
    };
    q = requestAnimationFrame(passo);
    // aba em segundo plano não roda animação: garante o valor final
    const fim = setTimeout(() => { atual.current = valor; setV(valor); }, 900);
    return () => { cancelAnimationFrame(q); clearTimeout(fim); };
  }, [valor]);
  return <>{fmtNum(v, casas)}</>;
}

// Marca o que acabou de crescer, para piscar uma vez
function useCresceu(itens) {
  const antes = useRef(null);
  const [vivos, setVivos] = useState({});
  useEffect(() => {
    const agora = Object.fromEntries(itens.map((i) => [i.chave, i.n]));
    if (antes.current) {
      const novos = Object.keys(agora).filter((k) => agora[k] > (antes.current[k] ?? 0) && agora[k] - (antes.current[k] ?? 0) <= 5);
      if (novos.length) setVivos((v) => ({ ...v, ...Object.fromEntries(novos.map((k) => [k, (v[k] || 0) + 1])) }));
    }
    antes.current = agora;
  }, [itens]);
  return vivos;
}

export function Barras({ itens, destaque, onDestaque }) {
  const maior = Math.max(1, ...itens.map((i) => i.n));
  const vivos = useCresceu(itens);
  return (
    <ol className="ac-barras">
      {itens.map((it) => {
        const lider = it.n > 0 && it.n === maior;
        return (
          <li
            key={it.chave}
            tabIndex={0}
            className={`ac-barra ${destaque === it.chave ? 'ac-on' : ''} ${destaque && destaque !== it.chave ? 'ac-off' : ''}`}
            onMouseEnter={() => onDestaque(it.chave)} onMouseLeave={() => onDestaque(null)}
            onFocus={() => onDestaque(it.chave)} onBlur={() => onDestaque(null)}
          >
            <span className="ac-barra-nome">{it.nome}</span>
            <span className="ac-barra-trilho">
              <span className="ac-barra-cheia" style={{ width: `${(it.n / maior) * 100}%`, background: lider ? OURO : AZUL }}>
                {vivos[it.chave] ? <i key={vivos[it.chave]} className="ac-brilho" /> : null}
              </span>
            </span>
            <strong className="ac-barra-n"><Numero valor={it.n} /></strong>
            <span className="ac-barra-pct">{fmtPct(it.pct)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Colunas({ itens, destaque, onDestaque, media }) {
  const maior = Math.max(1, ...itens.map((i) => i.n));
  const vivos = useCresceu(itens);
  return (
    <div className="ac-colunas" style={{ gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}>
      {itens.map((it) => {
        const lider = it.n > 0 && it.n === maior;
        return (
          <div
            key={it.chave}
            tabIndex={0}
            className={`ac-coluna ${destaque === it.chave ? 'ac-on' : ''} ${destaque && destaque !== it.chave ? 'ac-off' : ''}`}
            onMouseEnter={() => onDestaque(it.chave)} onMouseLeave={() => onDestaque(null)}
            onFocus={() => onDestaque(it.chave)} onBlur={() => onDestaque(null)}
            aria-label={`${it.nome}: ${it.n} (${fmtPct(it.pct)})`}
          >
            <div className="ac-coluna-area">
              <strong><Numero valor={it.n} /></strong>
              <span className="ac-coluna-cheia" style={{ height: `${(it.n / maior) * 100}%`, background: lider ? OURO : AZUL }}>
                {vivos[it.chave] ? <i key={vivos[it.chave]} className="ac-brilho ac-brilho-v" /> : null}
              </span>
            </div>
            <span className="ac-coluna-nome">{it.nome}</span>
            <span className="ac-coluna-pct">{fmtPct(it.pct)}</span>
          </div>
        );
      })}
      {media !== null && media !== undefined && <span className="sr-only">Média {fmtNum(media)}</span>}
    </div>
  );
}

export function Rosca({ itens, total, destaque, onDestaque }) {
  const soma = Math.max(1, itens.reduce((a, i) => a + i.n, 0));
  const R = 80, C = 2 * Math.PI * R;
  let ac = 0;
  const foco = itens.find((i) => i.chave === destaque);
  return (
    <div className="ac-rosca">
      <svg viewBox="0 0 220 220" role="img" aria-label={itens.map((i) => `${i.nome}: ${i.n}`).join('; ')}>
        <circle cx="110" cy="110" r={R} className="ac-rosca-trilho" />
        {itens.map((it) => {
          const f = it.n / soma;
          const ini = ac; ac += f;
          const folga = f > 0.02 && f < 1 ? 2.5 : 0;
          return (
            <circle
              key={it.chave} cx="110" cy="110" r={R} stroke={it.cor}
              className={`ac-rosca-fatia ${destaque === it.chave ? 'ac-on' : ''} ${destaque && destaque !== it.chave ? 'ac-off' : ''}`}
              strokeDasharray={`${Math.max(0, f * C - folga)} ${C}`} strokeDashoffset={-ini * C}
              onMouseEnter={() => onDestaque(it.chave)} onMouseLeave={() => onDestaque(null)}
            />
          );
        })}
      </svg>
      <div className="ac-rosca-centro" aria-hidden="true">
        <strong>{foco ? fmtPct(foco.pct) : <Numero valor={total} />}</strong>
        <span>{foco ? foco.nome : total === 1 ? 'resposta' : 'respostas'}</span>
      </div>
    </div>
  );
}

// Lista com todos os valores: acompanha os gráficos que não escrevem tudo no desenho
export function Legenda({ itens, destaque, onDestaque, chaves }) {
  return (
    <ol className="ac-legenda">
      {itens.map((it, i) => (
        <li
          key={it.chave} tabIndex={0}
          className={`${destaque === it.chave ? 'ac-on' : ''} ${destaque && destaque !== it.chave ? 'ac-off' : ''}`}
          onMouseEnter={() => onDestaque(it.chave)} onMouseLeave={() => onDestaque(null)}
          onFocus={() => onDestaque(it.chave)} onBlur={() => onDestaque(null)}
        >
          {chaves ? <b className="ac-legenda-chave">{it.curto || i + 1}</b> : <i style={{ background: it.cor }} />}
          <span>{it.nome}</span>
          <strong>{it.valor ?? <Numero valor={it.n} />}</strong>
          <em>{it.lateral ?? fmtPct(it.pct)}</em>
        </li>
      ))}
    </ol>
  );
}

export function LegendaNotas({ colunas }) {
  const cores = coresNotas(colunas);
  return (
    <div className="ac-notas">
      {colunas.map((c) => <span key={c.codigo}><i style={{ background: cores[c.codigo] }} /><b>{c.codigo}</b>{c.rotulo}</span>)}
    </div>
  );
}

export function Grade({ pergunta, destaque, onDestaque }) {
  const cores = coresNotas(pergunta.colunas);
  return (
    <div className="ac-grade">
      <LegendaNotas colunas={pergunta.colunas} />
      <ol>
        {pergunta.itens.map((it) => (
          <li
            key={it.nome} className={destaque && destaque !== it.nome ? 'ac-off' : ''}
            onMouseEnter={() => onDestaque(it.nome)} onMouseLeave={() => onDestaque(null)}
          >
            <span className="ac-grade-nome">{it.nome}</span>
            <span className="ac-grade-barra">
              {pergunta.colunas.map((c) => {
                const n = it.notas[c.codigo];
                const f = it.total ? n / it.total : 0;
                return (
                  <span
                    key={c.codigo} tabIndex={n ? 0 : -1} title={`${c.codigo}${c.rotulo ? ` ${c.rotulo}` : ''}: ${n} (${fmtPct(f)})`}
                    style={{ flexGrow: f * 1000, background: cores[c.codigo], visibility: n ? 'visible' : 'hidden' }}
                  >
                    {f >= 0.07 ? n : ''}
                  </span>
                );
              })}
            </span>
            <strong className="ac-grade-media">{it.media === null ? '' : <Numero valor={it.media} casas={1} />}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Comentarios({ pergunta, novosIds }) {
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return [...pergunta.textos].reverse().filter((t) => !b || t.texto.toLowerCase().includes(b));
  }, [pergunta.textos, busca]);
  return (
    <div className="ac-comentarios">
      <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Procurar nos comentários" aria-label="Procurar nos comentários" />
      {lista.length === 0 ? <p className="ac-vazio-texto">{busca ? 'Nenhum comentário com essa palavra.' : 'Os comentários aparecem aqui assim que chegarem.'}</p> : (
        <ul>
          {lista.map((t, i) => (
            <li key={`${t.id}-${i}`} className={novosIds.has(t.id) ? 'ac-novo' : ''}>
              <p>{t.texto}</p>
              <time>{fmtHora(t.quando)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Ritmo({ ritmo }) {
  const pts = ritmo.pontos.slice(-48);
  const max = Math.max(1, ...pts.map((p) => p.n));
  const un = ritmo.passoMin === 1 ? 'minuto' : ritmo.passoMin < 60 ? `${ritmo.passoMin} min` : ritmo.passoMin === 60 ? 'hora' : ritmo.passoMin < 1440 ? `${ritmo.passoMin / 60} h` : 'dia';
  if (pts.length < 2) return null;
  return (
    <div className="ac-ritmo" role="img" aria-label={`Respostas a cada ${un}; pico de ${max}`} title={`Respostas a cada ${un}; pico de ${max}`}>
      <div>{pts.map((p) => <i key={p.t} style={{ height: `${Math.max(p.n ? 10 : 3, (p.n / max) * 100)}%` }} />)}</div>
      <span>Respostas por {un}, pico de {max}</span>
    </div>
  );
}
