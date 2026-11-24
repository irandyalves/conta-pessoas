import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Box, ChevronLeft, ChevronRight, Donut, Download, FileSpreadsheet, FileText, Loader2, Maximize2, MessageSquareText, Minimize2, PauseCircle, PlayCircle } from 'lucide-react';
import { consolidar, coresNotas, fmtHora, fmtNum, fmtPct, limpar } from '../../utils/consolidar';
import { exportar, FORMATOS } from '../../utils/exportar';
import { AZUL, Barras, CATEGORIAS, Colunas, Comentarios, Grade, Legenda, LegendaNotas, Numero, OURO, Ritmo, Rosca } from './Graficos2D';
import './acompanhamento.css';

// A biblioteca 3D só é baixada quando o gráfico 3D é aberto
const Grafico3D = lazy(() => import('./Grafico3D'));
const GIRO_MS = 12000;
const lerPref = (k, p) => { try { return localStorage.getItem(k) || p; } catch { return p; } };
const gravarPref = (k, v) => { try { localStorage.setItem(k, v); } catch { /* navegação privada */ } };

function haQuanto(iso, agora) {
  const s = Math.max(0, Math.round((agora - Date.parse(iso)) / 1000));
  if (Number.isNaN(s)) return '';
  if (s < 5) return 'agora';
  if (s < 60) return `há ${s} s`;
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} d`;
}

// Respostas que chegaram com o painel aberto. Carga inicial e troca de filtro não contam.
function useChegadas(presencas) {
  const vistos = useRef(null);
  const [novos, setNovos] = useState(() => new Set());
  useEffect(() => {
    const ids = presencas.map((p) => p.id);
    if (vistos.current) {
      const chegaram = ids.filter((id) => !vistos.current.has(id));
      if (chegaram.length && chegaram.length <= 8) {
        setNovos((s) => new Set([...s, ...chegaram]));
        const t = setTimeout(() => setNovos((s) => new Set([...s].filter((id) => !chegaram.includes(id)))), 6000);
        ids.forEach((id) => vistos.current.add(id));
        return () => clearTimeout(t);
      }
    }
    vistos.current = new Set(ids);
    return undefined;
  }, [presencas]);
  return novos;
}

// Itens prontos para desenhar. A cor acompanha a opção, nunca a posição.
function itensDe(p) {
  const maior = Math.max(1, ...p.opcoes.map((o) => o.n));
  const itens = p.opcoes.map((o, i) => ({ chave: o.nome, nome: o.nome, n: o.n, pct: o.pct, cor: o.n > 0 && o.n === maior ? OURO : AZUL, corCategoria: CATEGORIAS[i % CATEGORIAS.length] }));
  return p.tipo === 'escolha' || p.tipo === 'multipla' ? itens.sort((a, b) => b.n - a.n) : itens;
}

const VARIANTES = {
  barras: { nome: 'Barras', Icone: BarChart3 },
  rosca: { nome: 'Rosca', Icone: Donut }
};

function Palco({ pergunta: p, modo, variante, novosIds, onFalha3D }) {
  const [destaque, setDestaque] = useState(null);
  useEffect(() => setDestaque(null), [p.id]);
  const itens = useMemo(() => (p.opcoes ? itensDe(p) : []), [p]);
  const numerado = itens.length > 6;

  const tresD = useMemo(() => {
    if (modo !== '3d' || p.tipo === 'texto') return null;
    if (p.tipo === 'grade') {
      const cores = coresNotas(p.colunas);
      return {
        tipo: 'grade', colunas: p.colunas.map((c) => c.codigo), linhas: p.itens.map((_, i) => String(i + 1)),
        itens: p.itens.flatMap((it, z) => p.colunas.map((c, x) => ({ chave: `${it.nome}|${c.codigo}`, nome: it.nome, n: it.notas[c.codigo], cor: cores[c.codigo], x, z })))
      };
    }
    if (variante === 'rosca') return { tipo: 'pizza', itens: itens.map((i) => ({ ...i, cor: i.corCategoria, rotulo: fmtPct(i.pct) })) };
    return { tipo: 'colunas', itens: itens.map((i, k) => ({ ...i, rotulo: String(i.n), curto: numerado ? String(k + 1) : '' })) };
  }, [p, modo, variante, itens, numerado]);

  if (p.tipo === 'texto') return <Comentarios pergunta={p} novosIds={novosIds} />;
  if (!p.respondentes) return <p className="ac-vazio">Ninguém respondeu esta pergunta ainda.<br />O gráfico se monta sozinho com a primeira resposta.</p>;

  if (tresD) {
    const legenda = p.tipo === 'grade'
      ? p.itens.map((it, i) => ({ chave: it.nome, nome: it.nome, curto: String(i + 1), valor: it.media === null ? '' : fmtNum(it.media), lateral: '', n: it.total, pct: 0 }))
      : itens.map((i, k) => ({ ...i, cor: variante === 'rosca' ? i.corCategoria : i.cor, curto: String(k + 1) }));
    return (
      <div className="ac-palco-3d">
        <div className="ac-palco-cena">
          {p.tipo === 'grade' && <LegendaNotas colunas={p.colunas} />}
          <Suspense fallback={<p className="ac-vazio">Montando o gráfico 3D…</p>}>
            <Grafico3D
              key={`${p.id}-${tresD.tipo}`} {...tresD} destaque={destaque} onFalha={onFalha3D}
              onDestaque={(k) => setDestaque(k && p.tipo === 'grade' ? k.slice(0, k.lastIndexOf('|')) : k)}
              descricao={`${p.titulo}. ${legenda.map((l) => `${l.nome}: ${l.valor || l.n}`).join('; ')}`}
            />
          </Suspense>
          <span className="ac-dica">Arraste para girar</span>
        </div>
        <Legenda itens={legenda} destaque={destaque} onDestaque={setDestaque} chaves={p.tipo === 'grade' || (numerado && variante !== 'rosca')} />
      </div>
    );
  }

  if (p.tipo === 'grade') return <Grade pergunta={p} destaque={destaque} onDestaque={setDestaque} />;
  if (p.tipo === 'nota' && itens.length <= 14) return <Colunas itens={itens} media={p.media} destaque={destaque} onDestaque={setDestaque} />;
  if (variante === 'rosca') {
    const coloridos = itens.map((i) => ({ ...i, cor: i.corCategoria }));
    return (
      <div className="ac-palco-rosca">
        <Rosca itens={coloridos} total={p.respondentes} destaque={destaque} onDestaque={setDestaque} />
        <Legenda itens={coloridos} destaque={destaque} onDestaque={setDestaque} />
      </div>
    );
  }
  return <Barras itens={itens} destaque={destaque} onDestaque={setDestaque} />;
}

function MenuExportar({ entrada, desativado, onAviso }) {
  const [aberto, setAberto] = useState(false);
  const [gerando, setGerando] = useState('');
  const raiz = useRef(null);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => { if (!raiz.current?.contains(e.target)) setAberto(false); };
    const esc = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);
  const gerar = async (f) => {
    setGerando(f.id);
    try {
      const nome = await exportar(f.id, entrada);
      setAberto(false);
      onAviso?.('Arquivo baixado', nome, 'sucesso');
    } catch (e) {
      console.error(e);
      onAviso?.('O arquivo não foi gerado', e?.message || String(e), 'erro');
    } finally {
      setGerando('');
    }
  };
  return (
    <div className="ac-exportar" ref={raiz}>
      <button type="button" className="ac-botao ac-botao-forte" aria-expanded={aberto} disabled={desativado} title={desativado ? 'Ainda não há respostas para exportar' : 'Baixar relatório'} onClick={() => setAberto((v) => !v)}>
        <Download size={16} /> Exportar
      </button>
      {aberto && (
        <div className="ac-menu">
          {FORMATOS.map((f) => (
            <button key={f.id} type="button" disabled={Boolean(gerando)} onClick={() => gerar(f)}>
              {gerando === f.id ? <Loader2 size={18} className="ac-roda" /> : f.id === 'pdf' ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
              <span><b>{f.nome}</b><small>{gerando === f.id ? 'Gerando…' : f.detalhe}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Acompanhamento({ presencas, config, titulo, periodo, sessaoAtiva, onAviso }) {
  const dados = useMemo(() => consolidar(presencas, config), [presencas, config]);
  const novosIds = useChegadas(presencas);
  const [atualId, setAtualId] = useState(null);
  const [modo, setModo] = useState(() => lerPref('responder_painel_modo', '3d'));
  const [variante, setVariante] = useState('barras');
  const [girando, setGirando] = useState(false);
  const [cheia, setCheia] = useState(false);
  const [agora, setAgora] = useState(Date.now());
  const [sem3D, setSem3D] = useState(false);
  const raiz = useRef(null);
  const indice = useRef(null);

  const perguntas = dados.perguntas;
  const pos = Math.max(0, perguntas.findIndex((p) => p.id === atualId));
  const p = perguntas[pos];
  const ir = useCallback((n) => setAtualId(perguntas[(n + perguntas.length) % perguntas.length]?.id ?? null), [perguntas]);
  const escolher = (id) => { setAtualId(id); setGirando(false); };

  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!girando || perguntas.length < 2) return undefined;
    const t = setTimeout(() => ir(pos + 1), GIRO_MS);
    return () => clearTimeout(t);
  }, [girando, pos, ir, perguntas.length]);
  useEffect(() => {
    const f = () => setCheia(document.fullscreenElement === raiz.current);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  // mantém a pergunta atual visível no índice, sem rolar a página
  useEffect(() => {
    const c = indice.current; const b = c?.querySelector('[aria-current="true"]');
    if (!b || c.scrollHeight <= c.clientHeight) return;
    c.scrollTo({ top: b.offsetTop - c.clientHeight / 2 + b.clientHeight / 2, behavior: 'smooth' });
  }, [p?.id]);

  const mudarModo = (m) => { setModo(m); gravarPref('responder_painel_modo', m); };
  const modoReal = sem3D ? '2d' : modo;
  const temRosca = Boolean(p) && p.tipo === 'escolha' && p.opcoes.length >= 2 && p.opcoes.length <= 6;
  const varReal = temRosca ? variante : 'barras';
  const maximo = Math.max(1, ...perguntas.map((x) => x.respondentes));
  const ultimas = useMemo(() => [...dados.itens].reverse().slice(0, 14), [dados.itens]);
  const resumoDe = (item) => {
    const lista = (item.respostas || []).filter((r) => r && limpar(r.resposta) && !String(r.resposta).includes(' | '));
    return limpar(lista[0]?.resposta || item.comoChegou) || 'Resposta enviada';
  };
  const telaCheia = () => (document.fullscreenElement ? document.exitFullscreen() : raiz.current?.requestFullscreen?.())?.catch?.(() => {});

  return (
    <section ref={raiz} className={`ac print:hidden ${cheia ? 'ac-cheia' : ''}`} aria-label="Acompanhamento das respostas">
      <header className="ac-topo">
        <div className="ac-placar" aria-live="polite">
          <strong key={dados.total} className={novosIds.size ? 'ac-pulo' : ''}><Numero valor={dados.total} /></strong>
          <div>
            <span>{dados.total === 1 ? 'resposta' : 'respostas'}{dados.pessoas !== dados.total ? `, ${dados.pessoas} pessoas` : ''}</span>
            <span className={`ac-estado ${sessaoAtiva ? 'ac-vivo' : ''}`}>
              <i />{sessaoAtiva ? (dados.ultima ? `Última ${haQuanto(dados.ultima, agora)}` : 'Aguardando a primeira') : 'Sessão pausada'}
            </span>
          </div>
        </div>
        <Ritmo ritmo={dados.ritmo} />
        {cheia && <h2 className="ac-evento">{titulo}</h2>}
        <div className="ac-acoes">
          <div className="ac-chave" role="group" aria-label="Tipo de gráfico">
            <button type="button" aria-pressed={modoReal === '2d'} onClick={() => mudarModo('2d')}><BarChart3 size={15} /> 2D</button>
            <button type="button" aria-pressed={modoReal === '3d'} disabled={sem3D} title={sem3D ? 'Este navegador não mostra gráficos 3D' : undefined} onClick={() => mudarModo('3d')}><Box size={15} /> 3D</button>
          </div>
          <button type="button" className="ac-botao" aria-pressed={girando} disabled={perguntas.length < 2} title="Passa as perguntas sozinho, a cada 12 segundos" onClick={() => setGirando((g) => !g)}>
            {girando ? <PauseCircle size={16} /> : <PlayCircle size={16} />} {girando ? 'Parar' : 'Passar sozinho'}
          </button>
          <button type="button" className="ac-botao" onClick={telaCheia} aria-label={cheia ? 'Sair da tela cheia' : 'Tela cheia'} title={cheia ? 'Sair da tela cheia' : 'Tela cheia'}>
            {cheia ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <MenuExportar entrada={{ presencas, config, titulo, periodo }} desativado={!dados.total} onAviso={onAviso} />
        </div>
      </header>

      {!p ? (
        <p className="ac-vazio ac-vazio-grande">Este evento ainda não tem perguntas.<br />Abra “Configurar Perguntas” no menu para criar a primeira.</p>
      ) : (
        <div className="ac-corpo">
          <nav className="ac-indice" aria-label="Perguntas" ref={indice}>
            {perguntas.map((x) => (
              <button key={x.id} type="button" aria-current={x.id === p.id} className={x.filha ? 'ac-filha' : ''} onClick={() => escolher(x.id)}>
                <b>{x.numero}</b>
                <span className="ac-indice-nome">{x.titulo}</span>
                <span className="ac-indice-n">{x.respondentes}</span>
                <span className="ac-indice-fio"><i style={{ width: `${(x.respondentes / maximo) * 100}%` }} /></span>
              </button>
            ))}
          </nav>

          <div className="ac-palco">
            <div className="ac-palco-topo">
              <button type="button" className="ac-seta" aria-label="Pergunta anterior" onClick={() => { ir(pos - 1); setGirando(false); }}><ChevronLeft size={20} /></button>
              <div className="ac-palco-titulo" key={p.id}>
                <h3>{p.numero ? `${p.numero}. ` : ''}{p.titulo}</h3>
                <p>
                  {[p.detalhe, `${p.respondentes} ${p.respondentes === 1 ? 'resposta' : 'respostas'}`, p.tipo === 'multipla' ? 'mais de uma opção por pessoa' : ''].filter(Boolean).join('; ')}
                </p>
              </div>
              {p.media !== undefined && p.media !== null && <div className="ac-media"><strong><Numero valor={p.media} casas={1} /></strong><span>média</span></div>}
              {temRosca && (
                <div className="ac-chave" role="group" aria-label="Formato do gráfico">
                  {Object.entries(VARIANTES).map(([id, { nome, Icone }]) => (
                    <button key={id} type="button" aria-pressed={varReal === id} title={modoReal === '3d' && id === 'barras' ? 'Colunas' : nome} aria-label={nome} onClick={() => setVariante(id)}><Icone size={15} /></button>
                  ))}
                </div>
              )}
              <button type="button" className="ac-seta" aria-label="Próxima pergunta" onClick={() => { ir(pos + 1); setGirando(false); }}><ChevronRight size={20} /></button>
            </div>
            {girando && <span className="ac-giro" key={`${p.id}-giro`} style={{ animationDuration: `${GIRO_MS}ms` }} />}
            <div className="ac-palco-area" key={`${p.id}-${modoReal}-${varReal}`}>
              <Palco pergunta={p} modo={modoReal} variante={varReal} novosIds={novosIds} onFalha3D={() => setSem3D(true)} />
            </div>
          </div>

          <aside className="ac-feed" aria-label="Últimas respostas">
            <h4>Chegando agora</h4>
            {ultimas.length === 0 ? <p className="ac-vazio-texto">As respostas aparecem aqui no instante em que são enviadas.</p> : (
              <ol>
                {ultimas.map((item) => (
                  <li key={item.id} className={novosIds.has(item.id) ? 'ac-novo' : ''}>
                    <time>{fmtHora(item.criadoEm)}</time>
                    <span>{resumoDe(item)}</span>
                    {(item.respostas || []).some((r) => perguntas.some((x) => x.id === r?.telaId && x.tipo === 'texto')) && <MessageSquareText size={14} aria-label="Com comentário" />}
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
