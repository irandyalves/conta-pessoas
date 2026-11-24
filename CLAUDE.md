# RESPONDER — instruções para o Claude

Sistema de presença/pesquisa em cultos e eventos (React 18 + Vite + Tailwind + Firestore).
- GitHub: https://github.com/irandyalves/responder (branch `main`)
- Firebase: projeto `conta-pessoas-iasd` → https://conta-pessoas-iasd.web.app (público), `/admin` (painel, login Google irandyalves@gmail.com), `/telao`
- Pastas locais: casa `D:\_SISTEMAS\RESPONDER`, trabalho `F:\_SISTEMAS\RESPONDER`

## Antes de começar
```
git pull
npm install
```
(Trabalhamos em dois computadores; sempre puxar antes de editar.)

## SEMPRE ao terminar alterações: atualizar GitHub e Firebase
Rodar `publicar.bat` (na raiz do projeto). Ele faz, nesta ordem, e para se algo der erro:
1. `npm run build` — testa o build
2. `git add -A` + `git commit -m "Atualizacao <data hora>"` + `git push`
3. `npx firebase deploy --only hosting,firestore:rules --non-interactive`

Equivalente manual:
```
npm run build
git add -A
git commit -m "descricao da alteracao"
git push
npx firebase deploy --only hosting,firestore:rules
```

## Regras do projeto
- Admin: só login Google. E-mails de admin em `ADMIN_EMAILS` (src/firebase.js) **e** em `firestore.rules` — mudar nos dois.
- Público só lê config e só cria presença (validada em `firestore.rules`).
- A prévia do editor (`PreviewCelular.jsx`) carrega o próprio formulário em `/?view=preview` num iframe na largura real do aparelho. Não redesenhar telas no editor: qualquer mudança visual vai em `MobileForm.jsx` e aparece igual na prévia e no celular.
- Padrão de formatação do editor: texto usa `EstiloLinhasTitulo` (barra em cima, nome da linha centralizado na altura, campo e lixeira vermelha à direita em todas as linhas); qualquer outro ajuste de aparência vai numa `BarraFormato` (uma linha, nesta ordem: fonte, tamanho, Texto, Fundo, Borda, alinhamento, B I AA, espaço). Cor sempre pelo `Cores` (cartão ao passar o mouse). Nada de paletas abertas nem botões soltos fora da seção.
- Ser econômico em créditos e eficiente.
