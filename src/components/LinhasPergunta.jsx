import React, { useState } from 'react';
import EstiloLinhasTitulo from './EstiloLinhasTitulo';

// Uma pergunta da página: cabeçalho (número, obrigatória, formato, excluir) e os textos dela no padrão do editor.
// Os textos vazios (ex.: texto de apoio) viram botões "+" no próprio cabeçalho.
export default function LinhasPergunta({ cabecalho, fim, children, ...linhas }) {
  const [slot, setSlot] = useState(null);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {cabecalho}
        <div className="ml-auto flex items-center gap-1.5">
          <div ref={setSlot} className="flex flex-wrap gap-1.5" />
          {fim}
        </div>
      </div>
      <EstiloLinhasTitulo {...linhas} slotAcoes={slot} />
      {children}
    </>
  );
}
