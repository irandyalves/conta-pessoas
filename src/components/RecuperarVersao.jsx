import React, { useEffect, useState } from 'react';
import { Download, FolderOpen, History, Loader2, X } from 'lucide-react';
import { abrirArquivo, abrirVersao, diferencas, listarVersoes } from '../utils/versoes';

const hora = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function Mudancas({ titulo, itens, cor }) {
  if (!itens.length) return null;
  return (
    <div>
      <p className={`text-xs font-semibold ${cor}`}>{titulo} ({itens.length})</p>
      <ul className="text-xs text-slate-300 list-disc pl-5 max-h-32 overflow-y-auto custom-scrollbar">
        {itens.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}

// Volta as perguntas para como estavam na última hora (ou para uma cópia salva em arquivo)
export default function RecuperarVersao({ eventId, config, onRecuperar, onFechar }) {
  const [versoes, setVersoes] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState('');
  const [escolhida, setEscolhida] = useState(null); // { nome, cfg }

  useEffect(() => {
    let vivo = true;
    listarVersoes(eventId).then((v) => vivo && setVersoes(v)).catch(() => vivo && setVersoes([]));
    return () => { vivo = false; };
  }, [eventId]);

  const abrir = async (nome, buscar) => {
    setErro('');
    setCarregando(nome);
    try { setEscolhida({ nome, cfg: await buscar() }); } catch (e) { setEscolhida(null); setErro(e.message); }
    setCarregando('');
  };

  const baixar = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(config)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `recuperacao-${eventId || 'evento'}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const dif = escolhida && diferencas(escolhida.cfg, config);
  const botao = 'h-8 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition cursor-pointer';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><History className="w-4 h-4" /> Recuperar versão</h3>
            <p className="text-xs text-slate-400">Volta todas as telas deste evento para como estavam. Vai até 1 hora atrás.</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={onFechar} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        {versoes === null && <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Procurando as versões da última hora...</p>}
        {versoes?.length === 0 && <p className="text-xs text-slate-400">Nenhuma outra versão na última hora. Se você tem uma cópia em arquivo, abra abaixo.</p>}
        {versoes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {versoes.map((v) => {
              const nome = `Salva às ${hora(v.salvoEm)}`;
              return (
                <button key={v.leitura} type="button" onClick={() => abrir(nome, () => abrirVersao(eventId, v.leitura))} className={`${botao} ${escolhida?.nome === nome ? 'ring-2 ring-emerald-400' : ''}`}>
                  {carregando === nome && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{hora(v.salvoEm)}
                </button>
              );
            })}
          </div>
        )}

        {erro && <p className="text-xs text-rose-300">{erro}</p>}

        {dif && (
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60">
            <p className="text-sm font-semibold text-white">{escolhida.nome}</p>
            <Mudancas titulo="Opções que voltam" itens={dif.opcoesVoltam} cor="text-emerald-300" />
            <Mudancas titulo="Telas que voltam" itens={dif.telasVoltam} cor="text-emerald-300" />
            <Mudancas titulo="Opções que saem" itens={dif.opcoesSaem} cor="text-amber-300" />
            <Mudancas titulo="Telas que saem" itens={dif.telasSaem} cor="text-amber-300" />
            {!dif.opcoesVoltam.length && !dif.telasVoltam.length && !dif.opcoesSaem.length && !dif.telasSaem.length && (
              <p className="text-xs text-slate-400">As telas e opções são as mesmas de agora. Muda só a aparência, os títulos ou a ordem.</p>
            )}
            <button type="button" onClick={() => onRecuperar(escolhida.cfg)} className="h-9 px-4 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition">Recuperar esta versão</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
          <label className={botao}>
            <FolderOpen className="w-3.5 h-3.5" /> Abrir cópia em arquivo
            <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) abrir(f.name, () => abrirArquivo(f)); }} />
          </label>
          <button type="button" onClick={baixar} className={botao}><Download className="w-3.5 h-3.5" /> Baixar cópia de agora</button>
        </div>
      </div>
    </div>
  );
}
