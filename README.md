# Bola de Ouro 2026 · Frontend

Site da enquete **não oficial** da Bola de Ouro 2026 (temporada 2025/26) com os 30 indicados: React + Vite + Tailwind, com um BFF em Express.

- Backend: [backend-golden-ball](../backend-golden-ball)
- Fluxo: `navegador → BFF (/api/poll/*) → backend (/graphql) → Postgres`

```
src/                 React (página única: ranking, voto, análise, comprovante)
server/              BFF Express — única porta pública da API
api/[...all].js      BFF como função serverless na Vercel
public/              fotos dos jogadores (players/) e imagem de prévia do link
```

## Rodando localmente

```bash
cp server/.env.local.example server/.env.local   # mesmo INTERNAL_API_SECRET do backend
cp .env.example .env.local
npm install
npm run dev        # Vite em :5173 e BFF em :5000
npm run dev:lan    # idem, acessível pelo celular na mesma rede Wi-Fi
```

Se a porta 5000 já estiver ocupada, rode o BFF em outra com `BFF_PORT` (no shell ou no `.env.local` da raiz, para o proxy do Vite, e no `server/.env.local`, para o BFF).

## Fotos dos jogadores

As 30 fotos em `public/players/` vêm da [Wikimedia Commons](https://commons.wikimedia.org) sob licenças livres (CC BY-SA 4.0, CC BY 3.0 e CC0). Essas licenças exigem crédito ao autor: os créditos ficam em `src/shared/constants/photo-credits.ts` e aparecem no rodapé do site. Ao trocar uma foto, atualize o crédito correspondente.

## Endpoints do BFF

| Método | Rota                        | Descrição                                                                     |
| ------ | --------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/poll/candidates`      | Os 30 indicados (cache de CDN de 1h)                                          |
| GET    | `/api/poll/results`         | Totais e % por indicado (cache de 5s)                                         |
| GET    | `/api/poll/analytics`       | Análise por período (cache de 10s)                                            |
| GET    | `/api/stats/leaderboard`    | Estatísticas dos 30 indicados, com filtros (cache de CDN de 30 min)           |
| GET    | `/api/stats/nominees/:slug` | Temporada de um indicado: competições, times e jogos (cache de CDN de 30 min) |
| GET    | `/api/auth/me`              | Quem está logado e se já votou                                                |
| POST   | `/api/auth/google`          | Login com a credencial do Google                                              |
| POST   | `/api/auth/logout`          | Sai (apaga o cookie de sessão)                                                |
| POST   | `/api/poll/votes`           | Registra o voto da conta logada                                               |

## Estatísticas dos indicados

A seção "Números da temporada" compara os 30 indicados (gols, assistências, jogos, minutos, por 90 minutos e nota média) com filtros por recorte (clubes, ligas, copas, continentais, seleção), competição, posição e minutagem. Ao clicar num jogador, abre a temporada completa: por competição, por time e jogo a jogo na Copa do Mundo 2026. Os filtros ficam na URL, então o link pode ser compartilhado.

Os números cobrem a janela da Bola de Ouro (temporada 25/26 dos clubes + Copa do Mundo 2026), já encerrada: o backend completa a carga uma vez e depois não consulta mais o provedor. O BFF só repassa os dados.

## Votação com Google

Não há tela de login: o botão do Google aparece só na etapa de confirmar o voto. O BFF troca a credencial do Google por uma sessão guardada em cookie `httpOnly` (o navegador nunca vê o token); "Sair" apaga o cookie. Cada conta Google vota uma vez, e o backend guarda só um hash irreversível da conta.

Configure `VITE_GOOGLE_CLIENT_ID` em `.env.local` (mesmo valor de `GOOGLE_CLIENT_ID` no backend) e cadastre `http://localhost:5173` e o domínio de produção nas **Origens JavaScript autorizadas** do cliente OAuth.

## Comprovante de votação

Depois de votar, o site gera no navegador uma imagem 1080×1920 (formato Stories do Instagram).

- **Voto visível por padrão**, com opção de esconder antes de compartilhar.
- **"Postar nos Stories":** abre o compartilhamento nativo do celular com a imagem anexada. Sites não podem postar direto nos Stories; isso é exclusivo de apps nativos.
- **WhatsApp, Telegram, X e Facebook:** no celular, enviam a imagem com um texto com emojis como legenda. No computador, abrem o link do app; a imagem chega pela prévia do link.
- **Privacidade:** nenhum dado da conta Google aparece. Para reabrir o comprovante, o navegador guarda localmente horário e opção escolhida; nada disso vai para o servidor.

### Prévia do link (Open Graph)

As tags ficam em `index.html` e a imagem em `public/og-image.png` (1200×630). As prévias exigem URL absoluta: o build usa `VITE_SITE_URL` ou, na Vercel, o domínio de produção (`VERCEL_PROJECT_PRODUCTION_URL`, exposto automaticamente por padrão).

## Segurança

- Sem CORS: SPA e BFF no mesmo domínio.
- CSP, HSTS e demais headers em `vercel.json`; helmet no BFF.
- Rate limit por IP no BFF, além do rate limit autoritativo no backend.
- Sessão em cookie `httpOnly` + `SameSite=Lax` (anti-CSRF).
- O BFF repassa só campos conhecidos do voto e a credencial do Google, nunca loga corpo de requisição e se autentica no backend com `INTERNAL_API_SECRET`.

## Deploy (Vercel)

O workflow `deploy.yml` publica após o CI passar na `master`.

- **Secrets do GitHub:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- **Variáveis de ambiente na Vercel:** `BACKEND_GRAPHQL_URL` (URL do backend + `/graphql`), `INTERNAL_API_SECRET`, `VITE_TURNSTILE_SITE_KEY`, `VITE_GOOGLE_CLIENT_ID` e, opcionalmente, `VITE_SITE_URL`.
