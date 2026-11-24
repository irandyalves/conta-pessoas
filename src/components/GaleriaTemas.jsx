import React, { useEffect } from 'react';
import { TEMAS, carregarFonteTema, classeTema, temaPorId } from '../utils/temas';

// Miniaturas dos layouts: usam o MESMO CSS do celular (temas.css), então o que se vê aqui é o que sai lá.
function Miniatura({ id, raio }) {
  if (id === 'original') {
    return (
      <div className="tema-mini bg-slate-950 h-[184px] flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-slate-600">
        O visual que você montou
      </div>
    );
  }
  return (
    <div className={`tema-mini t-pagina ${classeTema(id)} h-[184px]`} aria-hidden="true">
      <div className="t-titulo t-faixa pb-1.5" style={{ fontSize: 12 }}>
        <h2 className="t-cor font-bold leading-tight" style={{ fontSize: 12 }}>
          <span className="t-numero">1</span><span className="t-texto">Como foi?</span>
        </h2>
      </div>
      <div className="flex flex-col gap-2 mt-1">
        {['Excelente', 'Pode melhorar'].map((t) => (
          <div key={t} className="t-linha">
            <div className="t-card t-fundo px-2.5 py-1.5" style={{ borderRadius: Math.min(raio, 14) }}>
              <span className="t-cor" style={{ fontSize: 11 }}>{t}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 mt-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`t-num ${n === 5 ? 't-num-on bg-emerald-500 text-slate-950' : ''} border text-center font-bold py-0.5`} style={{ fontSize: 10, borderRadius: 6 }}>{n}</span>
        ))}
      </div>
      <div className="t-avancar mt-2 py-1 text-center font-bold" style={{ fontSize: 11, borderRadius: Math.min(raio, 12) }}>Avançar</div>
    </div>
  );
}

export default function GaleriaTemas({ atual, onEscolher }) {
  useEffect(() => { TEMAS.forEach((t) => carregarFonteTema(t.id)); }, []);
  const selecionado = temaPorId(atual) ? atual : 'original';
  const itens = [{ id: 'original', nome: 'Meu layout', descricao: 'Seus ajustes' }, ...TEMAS];
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
      {itens.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={selecionado === t.id}
          onClick={() => selecionado !== t.id && onEscolher(t.id, t.nome)}
          className={`rounded-xl p-1 text-left transition ${selecionado === t.id ? 'ring-2 ring-white' : 'hover:bg-slate-100/5'}`}
        >
          <Miniatura id={t.id} raio={t.raio} />
          <span className="block mt-1 px-1 text-xs font-semibold text-slate-100">{t.nome}</span>
          <span className="block px-1 text-[11px] leading-tight text-slate-400">{t.descricao}</span>
        </button>
      ))}
    </div>
  );
}
