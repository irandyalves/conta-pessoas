import React, { useEffect, useRef, useState } from 'react';
import { Braces, Plus } from 'lucide-react';
import { CORES_TEXTO_LINHAS } from '../utils/estilos';
import { camposDoTexto, chaveCampo, nomeParaCampo, origensDeCampo } from '../utils/telaFinal';
import { Alternar, BarraFormato, Cores, MiniSlider, SeletorFonte } from './Controles';

const semPerderCursor = (e) => e.preventDefault();

// Botão da barra: coloca no texto o que a pessoa respondeu numa pergunta
export function InserirCampo({ config, texto, onTexto, setConfig }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);
  const campos = config.finalCampos || [];
  const origens = origensDeCampo(config);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => { if (!raiz.current?.contains(e.target)) setAberto(false); };
    document.addEventListener('pointerdown', fora, true);
    return () => document.removeEventListener('pointerdown', fora, true);
  }, [aberto]);

  const inserir = (o) => {
    const existente = campos.find((c) => c.origem === o.origem);
    const campo = existente || { id: `c${Date.now().toString(36)}`, nome: nomeParaCampo(o.titulo, campos), origem: o.origem };
    const marca = `{${campo.nome}}`;
    // onde o cursor estava; sem cursor no texto, vai para o fim
    const el = document.activeElement;
    const noTexto = el && typeof el.selectionStart === 'number' && el.value === texto;
    const [ini, fim] = noTexto ? [el.selectionStart, el.selectionEnd] : [texto.length, texto.length];
    const antes = texto.slice(0, ini);
    const depois = texto.slice(fim);
    const esp = antes && !/\s$/.test(antes) ? ' ' : '';
    if (!existente) setConfig((c) => ({ ...c, finalCampos: [...(c.finalCampos || []), campo] }));
    onTexto(`${antes}${esp}${marca}${depois}`);
    setAberto(false);
    if (noTexto) requestAnimationFrame(() => { const p = ini + esp.length + marca.length; try { el.setSelectionRange(p, p); } catch (e) { /* campo fechado */ } });
  };

  return (
    <div className="relative" ref={raiz}>
      <button
        type="button" aria-expanded={aberto} title="Inserir no texto o que a pessoa respondeu (nome, e-mail...)"
        onMouseDown={semPerderCursor} onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1 h-[30px] px-2 rounded-md text-[11px] font-semibold bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white transition"
      >
        <Plus className="w-[10px] h-[10px] -mr-1" /><Braces className="w-3 h-3" /><span className="sr-only">Inserir campo</span>
      </button>
      {aberto && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 max-h-64 overflow-y-auto rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-1.5">
          <p className="px-2 py-1 text-[11px] text-slate-400">Inserir campo com a resposta de:</p>
          {origens.length === 0 && <p className="px-2 py-1.5 text-xs text-slate-300">Este evento ainda não tem perguntas.</p>}
          {origens.map((o) => (
            <button key={o.origem} type="button" onMouseDown={semPerderCursor} onClick={() => inserir(o)} className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-700 hover:text-white">
              {o.titulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Barra de formatação de cada campo usado numa linha da tela final
export default function CamposFinais({ config, linha, texto, tamanhoLinha, min, max, setConfig }) {
  const origens = origensDeCampo(config);
  const set = (id, k) => (v) => setConfig((c) => ({ ...c, [chaveCampo(linha, id, k)]: v }));
  return camposDoTexto(texto, config.finalCampos || []).map((c) => {
    const ler = (k) => config[chaveCampo(linha, c.id, k)];
    return (
      <div key={c.id}>
        <BarraFormato>
          <span className="flex items-center gap-1 px-1 text-[11px] font-semibold text-amber-300 whitespace-nowrap"><Braces className="w-3.5 h-3.5" />{c.nome}</span>
          <SeletorFonte rotulo="" valor={ler('Familia')} onChange={set(c.id, 'Familia')} />
          <MiniSlider rotulo="Tamanho" icone="tamanho" valor={Number(ler('Tamanho')) || tamanhoLinha} min={min} max={max} onChange={set(c.id, 'Tamanho')} />
          <Cores rotulo="Texto" opcoes={CORES_TEXTO_LINHAS} valor={ler('Cor') || 'tema'} onChange={set(c.id, 'Cor')} />
          <span className="flex gap-0.5">
            <Alternar rotulo="B" nome="Negrito" valor={ler('Bold') ?? true} onChange={set(c.id, 'Bold')} />
            <Alternar rotulo={<em>I</em>} nome="Itálico" valor={ler('Italico')} onChange={set(c.id, 'Italico')} />
            <Alternar rotulo="AA" nome="Maiúsculas" valor={ler('Caixa')} onChange={set(c.id, 'Caixa')} />
          </span>
        </BarraFormato>
        {!origens.some((o) => o.origem === c.origem) && <p className="text-[11px] text-rose-300 mt-1">A pergunta deste campo foi apagada ou está oculta: ele não aparece no celular.</p>}
      </div>
    );
  });
}
