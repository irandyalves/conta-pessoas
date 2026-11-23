# ⛪ RESPONDER - Sistema de Presença no Culto (Mobile + Telão + Painel Admin + Firebase)

Sistema completo com banco de dados no **Firebase Firestore**, hospedagem pronta para **Firebase Hosting**, layout mobile e módulo de **extração de relatórios para Excel e PDF**.

---

## 📱 1. O Layout Mobile (Para quem lê o QR Code)

Desenvolvido com foco total na experiência no smartphone:
- **Design moderno e acolhedor:** Cores suaves, efeito vidro (glassmorphism), animações de toque e barra de progresso.
- **Pergunta 1:** *"Como você chegou aqui hoje?"*
  - 🏷️ **Vi a faixa na frente da igreja** (destaque especial)
  - ⛪ **Sou membro da igreja**
  - 🤝 **Fui convidado(a)**
  - 📱 **Redes Sociais / Internet**
  - 📍 **Passando em frente / Outro motivo**
- **Pergunta 2:** *"Você está só ou tem mais pessoas com você?"*
  - 🧍 Botão de destaque **SÓ EU (1 pessoa)**
  - 👥 Grid rápido: **2, 3, 4, 5, 6, 7, 8, 9 e +10 pessoas**
- **Tela de Sucesso:**
  - Animação de confetes, resumo do que foi registrado e mensagem de bênção para a família.
- **Segurança:** O visitante comum **NÃO vê** a barra de admin. Cada celular responde 1 vez por evento e só é travado depois que a resposta foi aceita pelo servidor.

---

## 📊 2. Painel Admin & Extração de Relatórios

Acessível via link `?view=admin`. O acesso é feito com **login Google** e só a conta autorizada entra
(definida em `ADMIN_EMAILS` no `src/firebase.js` **e** em `firestore.rules` — mantenha as duas iguais).

### Primeira configuração do login (uma vez só)
1. Firebase Console → **Authentication** → **Sign-in method** → ative **Google**.
2. Authentication → **Settings → Authorized domains**: confirme `localhost` e o domínio do site (ex.: `conta-pessoas-iasd.web.app`).
3. Publique as regras de segurança: `npm run deploy:regras`.

### Formas de Extrair o Relatório:
1. **Exportar Excel (CSV):**
   - Gera arquivo `.csv` compatível com Excel, Google Planilhas e LibreOffice.
   - Já vem com codificação UTF-8 para não desconfigurar acentuação.
   - Inclui data, hora exata do registro, motivo da vinda e quantidade de pessoas no grupo.
2. **Imprimir / Gerar PDF Oficial:**
   - Botão **"Imprimir / PDF"** com formatação de folha A4.
   - Inclui resumo executivo (total de pessoas, percentual pela faixa, convidados e membros), tabela completa e campos de assinatura para a **Recepção/Secretaria** e para o **Pastor/Dirigente do Culto**.
3. **Filtros por Período:**
   - Culto de Hoje, Todos os Cultos ou Selecionar Outra Data no calendário.

---

## 🌐 3. Como Publicar no Firebase Hosting

O projeto já contém os arquivos `firebase.json` e `firestore.rules` configurados.

### Passo 1: Fazer login no Firebase (se ainda não fez)
```bash
npx firebase login
```

### Passo 2: Vincular ao seu projeto do Firebase
```bash
npx firebase use --add
```
*(Selecione o projeto que você criou no console do Firebase)*

### Passo 3: Publicar com 1 comando (site + regras do Firestore)
```bash
npm run deploy
```
Pronto! O Firebase fornecerá um link gratuito e seguro com HTTPS (ex: `https://seu-projeto.web.app`), que você poderá colocar no telão para todo mundo escanear.

---

## 💻 4. Como Rodar Localmente

Para testar ou usar no computador da igreja:
```bash
npm run dev
```

- **No Telão da Igreja:** `http://localhost:3000/?view=telao`
- **No Celular das Pessoas:** `http://localhost:3000/?view=form` *(ou o link do Firebase Hosting)*
- **No Painel Admin:** `http://localhost:3000/?view=admin` (login Google)
