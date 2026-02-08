

# Plano: Atividade "Diario do Bem-Estar" - Estacao 1, Jornada 6

## Objetivo

Criar a atividade "Diario do Bem-Estar" para a Estacao 1 ("Corpo saudavel, mente saudavel") da Jornada 6. A participante registra, por pelo menos 5 dias, uma pratica diaria relacionada a tres dimensoes do cuidado: Saude Fisica, Saude Mental e Saude Espiritual, usando uma tabela interativa.

---

## Como Funciona

Esta atividade utiliza uma **tabela interativa personalizada** com:

- **5 linhas** representando os dias (1 DIA a 5 DIA)
- **3 colunas** representando as dimensoes: Fisica, Mental e Espiritual
- Cada celula recebe um campo de texto editavel para a participante registrar sua pratica
- A tabela tera um layout responsivo (tabela no desktop, cartoes empilhados no mobile)
- O botao de envio so sera habilitado quando todos os 15 campos estiverem preenchidos

Como a interface requer uma tabela estruturada (conforme a imagem de referencia), sera necessario criar um componente customizado, seguindo o mesmo padrao do "Diario de Papeis" (RoleDiaryActivity) ja existente.

---

## Alteracoes Necessarias

### 1. Novo Componente: `WellBeingDiaryActivity.tsx`

Criar o arquivo `src/components/activities/WellBeingDiaryActivity.tsx` contendo:

- **WellBeingDiaryActivity** - Componente de preenchimento com tabela interativa:
  - Exibe a orientacao formatada em HTML
  - Tabela com 5 linhas (dias) e 3 colunas (Fisica, Mental, Espiritual)
  - Cada celula possui um campo Input para registrar a pratica do dia
  - Barra de progresso mostrando quantas celulas foram preenchidas (0/15)
  - Botao de envio habilitado apenas quando todas as 15 celulas estiverem preenchidas
  - Layout responsivo: tabela no desktop, cartoes empilhados no mobile

- **SubmittedWellBeingDiaryView** - Componente de visualizacao pos-envio:
  - Exibe os dados enviados em formato de tabela somente-leitura
  - Layout responsivo (tabela/cartoes)

### 2. Registrar no `ActivityPage.tsx`

Integrar o novo componente no fluxo de atividades:

- Adicionar funcao detectora `isWellBeingDiary` (verifica se o titulo contem "diario do bem-estar")
- Adicionar bloco de renderizacao para submissao ja enviada (secao "Already Submitted")
- Adicionar bloco de renderizacao para preenchimento (secao de componentes essay)
- Excluir da renderizacao generica de essay e do footer generico

### 3. Registrar no `SubmissionView.tsx`

Integrar a visualizacao de submissao para professores/admins:

- Importar o SubmittedWellBeingDiaryView
- Adicionar detectora e renderizacao condicional

### 4. Migracao SQL - Inserir atividade no banco

- **station_id:** `47b9b1c3-30ba-417a-9eb1-786df4f9d40e` (Estacao 1 - Corpo saudavel, mente saudavel)
- **title:** "Diario do Bem-Estar"
- **type:** `essay`
- **points:** 10
- **description:** Orientacao formatada em HTML com as instrucoes e as tres dimensoes do cuidado

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/WellBeingDiaryActivity.tsx` | Criar | Componente de tabela interativa + visualizacao pos-envio |
| `src/pages/ActivityPage.tsx` | Editar | Registrar o componente no fluxo de atividades |
| `src/pages/SubmissionView.tsx` | Editar | Registrar visualizacao para professores/admins |
| Nova migracao SQL | Criar | Inserir atividade essay na Estacao 1 da Jornada 6 |

---

## Resultado Esperado

- Ao acessar a Estacao 1 da Jornada 6, a aluna vera a atividade "Diario do Bem-Estar"
- A orientacao sera exibida com as tres dimensoes de cuidado (Fisica, Mental, Espiritual)
- Uma tabela interativa com 5 dias e 3 colunas permitira registrar as praticas diarias
- No mobile, a tabela sera exibida como cartoes empilhados por dia
- O progresso sera mostrado (ex: 12/15 campos preenchidos)
- O envio so sera possivel com todos os 15 campos preenchidos
- Apos o envio, a visualizacao mostrara os registros em formato de tabela
- Professores e admins poderao ver as submissoes formatadas corretamente
- A atividade vale 10 pontos

