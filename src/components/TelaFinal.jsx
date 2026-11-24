import React from 'react';
import { caixaAlta, corTextoHex, faixaEstilo, fonteEBorda, getAlinhamentoClass, getCaptionFundoClass } from '../utils/estilos';
import { familiaCss } from '../utils/fontes';
import { chaveCampo, linhasFinais, preencher } from '../utils/telaFinal';

// Textos da tela final (celular e prévia). valorDe(campo) devolve o que a pessoa respondeu.
export default function TelaFinal({ config, valorDe, children }) {
  const campos = config.finalCampos || [];
  return (
    <div className="relative">
      {linhasFinais(config).map((l) => {
        const Tag = l.h1 ? 'h1' : 'p';
        const partes = preencher(l.texto, campos, valorDe);
        if (!partes.length) return null;
        const fundo = getCaptionFundoClass(l.fundo);
        return (
          <React.Fragment key={l.id}>
            {l.divisor && <div className="border-t border-slate-800/80" style={{ marginTop: l.antes / 2 }} aria-hidden="true" />}
            <Tag
              style={{
                marginTop: l.divisor ? l.antes / 2 : l.antes,
                fontSize: `${l.tamanho}px`,
                ...faixaEstilo(l.fundo, l.altura),
                ...fonteEBorda(config, l.id, Boolean(fundo), false),
                fontFamily: familiaCss(l.familia),
                color: corTextoHex(l.cor),
                fontWeight: l.bold ? undefined : 400,
                overflowWrap: 'anywhere'
              }}
              className={`${l.cls} ${fundo} whitespace-pre-line ${getAlinhamentoClass(l.alinhamento)} ${l.caixa ? 'uppercase' : caixaAlta(l.caixa)}`}
            >
              {partes.map((p, i) => {
                if (typeof p === 'string') return p;
                const ler = (k) => config[chaveCampo(l.id, p.campo.id, k)];
                const tamanho = Number(ler('Tamanho'));
                return (
                  <span
                    key={i}
                    style={{
                      fontFamily: familiaCss(ler('Familia')),
                      fontSize: tamanho ? `${tamanho}px` : undefined,
                      color: corTextoHex(ler('Cor')),
                      fontWeight: (ler('Bold') ?? true) ? 800 : 400,
                      fontStyle: ler('Italico') ? 'italic' : undefined,
                      // e-mail em caixa alta fica difícil de conferir
                      textTransform: p.valor.includes('@') ? 'none' : ler('Caixa') ? 'uppercase' : undefined
                    }}
                  >
                    {p.valor}
                  </span>
                );
              })}
            </Tag>
          </React.Fragment>
        );
      })}
      {children}
    </div>
  );
}
