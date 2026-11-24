import React, { useState } from 'react';
import { Braces, Plus } from 'lucide-react';
import { CORES_TEXTO_LINHAS } from '../utils/estilos';
import { camposDoTexto, chaveCampo, nomeParaCampo, origensDeCampo } from '../utils/telaFinal';
import { Alternar, Cores, MiniSlider, SeletorFonte } from './Controles';

// Editor dos campos inseridos em UMA linha da tela final: botão "Inserir campo" + estilo de cada campo usado nela
export default function CamposFinais({ config, linha, texto, tamanhoLinha, min, max, onTexto, setConfig }) {
  const [aberto, setAberto] = useState(false);
  const campos = config.finalCampos || [];
  const origens = origensDeCampo(config);
  const usados = camposDoTexto(texto, campos);
  const set = (id, k) => (v) => setConfig((c) => ({ ...c, [chaveCampo(linha, id, k)]: v }));

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
  const semPerderCursor = (e) => e.preventDefault();

  return (
    <div className="space-y-2 pt-1">
      <div className="relative">
        <button
          type="button"
          aria-expanded={aberto}
          onMouseDown={semPerderCursor}
          onClick={() => setAberto(!aberto)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white transition"
        >
          <Plus className="w-3.5 h-3.5" /> Inserir campo
        </button>
        {aberto && (
          <>
            <div className="fixed inset-0 z-40" onMouseDown={semPerderCursor} onClick={() => setAberto(false)} />
            <div className="absolute left-0 top-full mt-1 z-50 w-72 max-h-64 overflow-y-auto rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-1.5">
              <p className="px-2 py-1 text-[11px] text-slate-400">Mostra o que a pessoa respondeu em:</p>
              {origens.length === 0 && <p className="px-2 py-1.5 text-xs text-slate-300">Este evento ainda não tem perguntas.</p>}
              {origens.map((o) => (
                <button key={o.origem} type="button" onMouseDown={semPerderCursor} onClick={() => inserir(o)} className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-700 hover:text-white">
                  {o.titulo}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {usados.map((c) => {
        const ler = (k) => config[chaveCampo(linha, c.id, k)];
        const orfao = !origens.some((o) => o.origem === c.origem);
        return (
          <div key={c.id} className="rounded-lg bg-slate-950/40 px-2.5 py-2 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300"><Braces className="w-3.5 h-3.5" />{c.nome}</span>
              <SeletorFonte rotulo="" valor={ler('Familia')} onChange={set(c.id, 'Familia')} />
              <MiniSlider rotulo="Tamanho" valor={Number(ler('Tamanho')) || tamanhoLinha} min={min} max={max} onChange={set(c.id, 'Tamanho')} />
              <Alternar rotulo="B" nome="Negrito" valor={ler('Bold') ?? true} onChange={set(c.id, 'Bold')} />
            </div>
            <Cores rotulo="Texto" opcoes={CORES_TEXTO_LINHAS} valor={ler('Cor') || 'tema'} onChange={set(c.id, 'Cor')} lateral={<span />} />
            {orfao && <p className="text-[11px] text-rose-300">A pergunta deste campo foi apagada: ele não aparece no celular.</p>}
          </div>
        );
      })}
    </div>
  );
}
