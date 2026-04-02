# DeepStudy - Product Requirements Document

## 1. Contexto do Projeto

Rensei nesse projeto porque percebi um padrão nos meus próprios estudos: eu estudava um assunto novo, juntava informação, mas depois esquecia tudo. Pior ainda era tentar lembrar quando revisar aquilo.

Eu usava ferramentas genéricas tipo Notion ou até arquivo de texto mesmo. Mas nada disso tinha uma coisa essencial: **saber quando era o momento certo pra revisar**. Eu sabia da técnica Spaced Repetition - revisitar conteúdo em intervalos crescentes - mas aplicar manualmente era chato demais.

Então pensei: por que não faço uma ferramenta simples, focada em Uma coisa só - organizar sessões de estudo e saber o que revisar hoje? Simples assim. Sem complicação.

Meu problema real era esse e alguns mais:
- Perder a noção de quais tópicos já estudei
- Não saber quando revisar (deixava passar os intervalos)
- Estudar desordenado, sem planejamento
- Não conseguir medir se um tópico foi realmente difícil ou fácil pra mim

Quando me passaram o Miniprojeto, pensei logo em criar uma ferramenta focada nisso, que resolveria 80% dos meus problemas.

---

## 2. Objetivo

O DeepStudy existe pra uma coisa bem clara: **você registra uma sessão de estudo e sabe quando deve revisar aquilo**.

Mais especificamente, quero que o usuário consiga:
- Criar uma sessão de estudo com contexto (assunto, tópico específico, quão difícil é para ele no momento)
- Visualizar o que precisa revisar hoje (revisões agendadas pra hoje)
- Marcar quando revisou algo (e registrar se conseguiu lembrar muito ou pouco)
- Acompanhar dificuldade real vs esperada

Do ponto de vista de experiência do usuário, pensei em algo bem direto:
1. Você entra em revisões através da sessão escolhida, vê se "na aba Hoje tem 1 revisão pra fazer"
2. Você clica, faz a revisão do dia
3. As próximas revisões já estarão agendadas automaticamente

Nada de configurar intervalos. Nada de UI complicada. Só o necessário.

---

## 3. Decisões de Produto

### Por que esses campos?

**Assunto**: Tipo "Desenvolvimento Web". Preciso saber o grande contexto do que estou estudando.

**Tópico**: O detalhe real - "Async/Await em JavaScript". Isso é o que vou revisar depois.

**Dificuldade esperada**: Escala 1-10. Quando comecei, pensei em categorias tipo "Fácil/Médio/Difícil", mas percebi que dificuldade é relativa. Alguém acha fácil, outro acha muito difícil. Então uma escala numérica deixa bem claro sem ser genérico.

**Dias pra revisão**: É o intervalo. Eu falo "preciso revisar isso em 3 dias" ou "deixa 7 dias pra assimilar mais". Simples assim.

**Status**: Concluído ou Pendente. Na época pensei em ter vários status (iniciado, em progresso, revisado, etc), mas percebi que ia ficar muito complicado. O usuário só quer saber: tá feito ou não?

### Por que manter simples

Eu poderia ter adicionado:
- Prioridades
- Tags
- Notas anexadas
- Integração com calendário
- Estatísticas complexas
- Modo offline
- Sincronização multinúcleo

Mas aí me lembrei do que realmente me deixa frustrado com ferramentas que ja existem. Você entra, quer fazer algo simples, e se vê com 10 abas de configuração.

Decidi que melhor é começar bem focado, fazer funcionar direito, e depois adicionar coisas que usuários realmente pedem.

---

## 4. Decisão Técnica (Arquitetura)

Essa parte é importante porque é onde as coisas ficam interessantes.

### Por que backend + frontend separado?

Sinceramente, eu poderia ter feito um tudo-em-um tipo, backend e frontend no mesmo lugar. Mas escolhi separar por alguns motivos que pensei racionalmente:

1. **Escalabilidade**: Se o projeto cresce (mais usuários, processamento pesado), preciso escalar frontend e backend independentemente. Frontend pode estar em AWS S3 + CloudFront, backend em instâncias separadas.

2. **Reutilização de API**: Se eu criar um app mobile depois, tenho a API pronta. Se criar integração com Telegram ou Discord, mesma coisa.

3. **Clareza de responsabilidade**: Frontend é "como mostrar", backend é "como armazenar e processar". Separar isso deixa tudo mais simples de manter.

4. **Autenticação**: Com separação, eu controlo autenticação e autorização direto no backend. Token JWT, refresh tokens, rate limiting - tudo fica num lugar.

Então architetetura ficou assim:
- **Frontend** (React + TypeScript + Vite): Interface do usuário, lógica de apresentação, validação no cliente
- **Backend** (Node.js + Express + Prisma): API REST, banco de dados, autenticação, lógica de negócio

### Banco de dados

Escolhi SQLite por enquanto. Por quê? Porque é perfeito para MVP. Uma single file, sem configurar PostgreSQL ou MySQL. Mas aqui tá a coisa: usei Prisma como ORM.

Na época pensei "por que não raw SQL?" e a resposta é: quando eu evoluir de SQLite pra PostgreSQL, Prisma cuida disso automaticamente. Sem mudar uma linha de código da lógica de negócio. Isso é importante pra escalabilidade.

### TypeScript

Poderia ter feito em JavaScript puro e ganho velocidade inicial. Mas tanto frontend quanto backend rodando TypeScript significa:
- Menos bugs em produção (tipos compilam)
- Refatorações seguras (mudar um tipo, o compilador avisa tudo que quebrou)
- Documentação que se valida (tipos são documentação)

É um trade-off: você gasta tempo definindo tipos, mas ganha muito depois.

### Estrutura das pastas

Backend organizado assim:
```
src/
  services/     (Lógica de negócio: ReviewService, SessionService)
  controllers/  (Recebem requisições HTTP, mapeiam, devolvem respostas)
  routes/       (Definem endpoints)
  middleware/   (Autenticação, tratamento de erros)
  utils/        (Helpers isolados)
```

Frontend:
```
src/
  pages/        (Componentes de página - Login, Reviews, Sessions)
  components/   (Componentes reutilizáveis - Button, Input, Alert)
  hooks/        (Lógica de estado - useAuth, useReviews, useSessions)
  services/     (Chamadas pra API)
  contexts/     (Context API pra compartilhar estado)
  utils/        (Helpers - tratamento de erro, comparação de data)
```

Separei bem porque vira caos se misturar tudo. Frontend com lógica espalhada é ruim. Backend com rotas bagunçadas é ruim.

### Sobre evoluções futuras

Deixei tudo pensado pra evoluir:
- Trocar SQLite por PostgreSQL sem alterar código de service
- Adicionar segundo fator de autenticação
- Adicionar notificações via email
- Criar app mobile consumindo a mesma API
- Adicionar algoritmo de spaced repetition smarter

Isso era importante. Não quis fazer uma solução que fosse fácil agora mas que depois ficasse presa.

---

## 5. Fluxo do Usuário

### Visão geral

```
1. Usuário entra (se novo, registra)
2. Login com email e senha
3. Vê dashboard (aqui não tem dashboard ainda, vai direto pra telas)
4. Navega pra "Sessões"
5. Cria uma nova sessão (Assunto, Tópico, Dificuldade, etc)
6. Sistema agenda revisões automaticamente
7. Usuário entra novamente em "Revisões", vê aba "Hoje"
8. Faz as revisões do dia (marca como concluído)
9. Próximas revisões aparecem baseadas em quantos dias ele definiu
```

### Detalhado

**Criação de sessão**:
- Usuário clica "Nova Sessão"
- Form pede: Assunto, Tópico, Dificuldade (1-10), Dias pra próxima revisão
- Ao clicar "Criar", a primeira revisão é agendada pra daqui X dias

**Ver revisões de hoje**:
- Dashboard mostra 4 abas: Todas, Hoje, Pendentes, Concluídas
- Aba "Hoje" mostra só revisões agendadas pra hoje
- Cada card mostra: qual sessão, qual tópico, há quanto tempo foi criada

**Completar revisão**:
- Usuário abre uma revisão
- Faz a revisão mental
- Clica "Concluir" e seleciona "você lembrou? (sim/não)"
- Isso calcula a próxima data de revisão

---

## 6. Possíveis Melhorias Futuras

Essas são ideias que pensei durante o desenvolvimento mas deixei de lado:

### Curto prazo
- Sistema de tags nas sessões
- Busca/filtro nas sessões
- Exportar dados pra CSV
- Dark mode (já tenho os estilos, faltou implementar toggle)

### Médio prazo
- Algoritmo inteligente de intervalos (SM2 ou similar)
- Estatísticas: "você estuda em média X horas por dia"
- Sistema de badges/progress (gamificação leve)
- Integração com calendário (Google Calendar, por exemplo)
- Notificações via email: "você tem revisões pendentes"

### Longo prazo
- App mobile (React Native ou Flutter)
- Sincronização entre dispositivos
- Estudar em grupo (compartilhar sessões)
- IA analisando teus padrões de aprendizado
- Integração com plataformas de conteúdo (Coursera, Udemy, etc)

Na verdade... essas ideias são infinitas. O importante agora é ter um MVP sólido funcionando bem.

---

## 7. Reflexão Pessoal

Construir o DeepStudy foi legal porque forcei a colocar em prática coisas que só via em tutorial:
- TypeScript real, não hello world
- Autenticação com JWT
- Prisma migrations
- Separação frontend/backend profissional
- Tratamento de erros em produção

Aprendi que simples é difícil. É fácil adicionar features. É difícil dizer não e manter foco.

Também percebi que quando você constrói pra resolver seu próprio problema, a motivação é diferente. Você testa com você mesmo primeiro.

E teve uma coisa que me fez pensar: quantas vezes eu esqueci de revisar as coisas porque não tinha ferramenta? Se o DeepStudy resolver isso, já vale a pena.

Quanto à evolução do código: ficou bem organizado. Não tá perfeito (qual código está?), mas dá pra evoluir sem dor de cabeça.

Se eu fosse fazer de novo, talvez começaria com testes automatizados desde o início. Depois de pronto, testes viraram chato de adicionar.

---

## Conclusão

DeepStudy é uma aposta em simplicidade. Não é o melhor sistema de Spaced Repetition do mundo - nem pretende ser. É uma ferramenta que resolve Um problema bem: saber o que revisar hoje.

E isso, pra mim, é suficiente.
