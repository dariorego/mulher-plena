

# Plano: Atividade "Inventario Emocional" - Estacao 2, Jornada 6

## Objetivo

Criar a atividade "Inventario Emocional" para a Estacao 2 ("Emocoes que adoecem - Ressignificando Emocoes") da Jornada 6. A participante lista 3 emocoes que a incomodam com frequencia e, para cada uma, uma acao pratica para ressignifica-la, usando uma tabela interativa.

---

## Como Funciona

Esta atividade utiliza uma **tabela interativa personalizada** com:

- **3 linhas** representando as emocoes
- **2 colunas**: Emocao + Acao pratica para ressignificar
- Cada celula recebe um campo de texto editavel
- Layout responsivo (tabela no desktop, cartoes empilhados no mobile)
- O botao de envio so sera habilitado quando todos os 6 campos estiverem preenchidos
- Um exemplo e mostrado acima da tabela para orientar a participante

Segue o mesmo padrao do "Diario do Bem-Estar" (WellBeingDiaryActivity) ja existente.

---

## Alteracoes Necessarias

### 1. Novo Componente: `EmotionalInventoryActivity.tsx`

Criar `src/components/activities/EmotionalInventoryActivity.tsx` contendo:

- **EmotionalInventoryActivity** - Componente de preenchimento:
  - Exibe a orientacao formatada em HTML
  - Mostra o exemplo (Tristeza -> Gratidao diaria)
  - Tabela com 3 linhas e 2 colunas (Emocao e Acao pratica)
  - Cada celula possui um campo de texto
  - Barra de progresso (0/6 campos preenchidos)
  - Botao de envio habilitado com todos os campos preenchidos
  - Layout responsivo: tabela no desktop, cartoes no mobile

- **SubmittedEmotionalInventoryView** - Componente de visualizacao pos-envio:
  - Exibe os dados em tabela somente-leitura
  - Layout responsivo

### 2. Registrar no `ActivityPage.tsx`

- Importar os novos componentes
- Adicionar funcao detectora `isEmotionalInventory` (verifica se o titulo contem "inventario emocional")
- Adicionar bloco "Already Submitted" com o SubmittedEmotionalInventoryView
- Adicionar exclusao nos filtros genericos (submitted, orientation, essay textarea, footer)
- Adicionar bloco de renderizacao do componente na secao essay

### 3. Registrar no `SubmissionView.tsx`

- Importar SubmittedEmotionalInventoryView
- Adicionar detectora e renderizacao condicional

### 4. Migracao SQL - Inserir atividade no banco

- **station_id:** `0dd4bf33-ece9-463d-8bb6-6c64497da8da` (Estacao 2 - Emocoes que adoecem)
- **title:** "Inventario Emocional"
- **type:** `essay`
- **points:** 10
- **description:** Orientacao formatada em HTML explicando que a participante deve listar 3 emocoes que a incomodam e uma acao pratica para ressignificar cada uma, incluindo o exemplo (Tristeza / Gratidao diaria)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/EmotionalInventoryActivity.tsx` | Criar | Componente de tabela interativa (3 emocoes x 2 colunas) + visualizacao pos-envio |
| `src/pages/ActivityPage.tsx` | Editar | Registrar o componente no fluxo de atividades |
| `src/pages/SubmissionView.tsx` | Editar | Registrar visualizacao para professores/admins |
| Nova migracao SQL | Criar | Inserir atividade essay na Estacao 2 da Jornada 6 |

---

## Nota sobre o nome

O titulo "Inventario Emocional" sera usado conforme especificado. Caso deseje alterar o nome posteriormente, basta editar o titulo da atividade pelo painel administrativo (Gerenciar -> Editar Estacao).

---

## Resultado Esperado

- Ao acessar a Estacao 2 da Jornada 6, a aluna vera a atividade "Inventario Emocional"
- A orientacao sera exibida com o exemplo (Tristeza / Gratidao diaria)
- Uma tabela interativa com 3 linhas e 2 colunas permitira registrar emocoes e acoes praticas
- No mobile, a tabela sera exibida como cartoes empilhados
- O progresso sera mostrado (ex: 4/6 campos preenchidos)
- O envio so sera possivel com todos os 6 campos preenchidos
- Apos o envio, a visualizacao mostrara os registros em formato de tabela
- Professores e admins poderao ver as submissoes formatadas corretamente
- A atividade vale 10 pontos
