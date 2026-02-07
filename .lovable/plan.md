

# Plano: Atividade "Acao de Amor Concreta" - Estacao 3, Jornada 3

## Objetivo
Criar a atividade "Acao de Amor Concreta" para a Estacao 3 ("Expressando o amor: o dever filial") da Jornada 3. A participante realiza uma acao de cuidado dirigida a um membro da familia e registra a experiencia em uma tabela com 3 colunas.

---

## Como Funciona

A participante preenche uma tabela interativa com os seguintes campos:
1. **Membro da familia** - A pessoa a quem a acao foi dirigida
2. **Acao realizada** - Descricao da acao de cuidado realizada
3. **Registre a sensacao ou sentimento** - O que sentiu ao realizar a acao

A interface segue o mesmo padrao visual ja utilizado na atividade "Mapa de Vida Equilibrada" (tabela responsiva com cartoes no mobile). Minimo de 1 entrada completa para enviar.

---

## Estrutura da Interface

```text
+----------------------------------------------------------+
| ACAO DE AMOR CONCRETA                                     |
+----------------------------------------------------------+
| ORIENTACAO                                                |
| Realize uma pequena acao de cuidado dirigida a um membro  |
| de sua familia e registre as sensacoes ou sentimentos que |
| essa experiencia lhe proporcionou. (atividade individual) |
+----------------------------------------------------------+
|                                                           |
| +----------------+------------------+-------------------+ |
| | MEMBRO DA      | ACAO REALIZADA   | SENSACAO OU       | |
| | FAMILIA        |                  | SENTIMENTO        | |
| +----------------+------------------+-------------------+ |
| | [____________] | [______________] | [_______________] | |
| +----------------+------------------+-------------------+ |
| | [____________] | [______________] | [_______________] | |
| +----------------+------------------+-------------------+ |
|                                                           |
| [+ Adicionar Registro]                                    |
|                                                           |
| [======= Enviar Atividade =======]                        |
+----------------------------------------------------------+
```

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/LoveActionActivity.tsx`

Componente de formulario seguindo o mesmo padrao do `BalancedLifeMapActivity`:
- Props: `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- Estado: lista de entradas `{ member: string, action: string, feeling: string }[]`
- Comeca com 2 linhas vazias
- Placeholders sugestivos (Ex: "Minha mae", "Preparei um cafe da manha especial", "Senti gratidao e alegria")
- Tabela responsiva: desktop como tabela, mobile como cartoes
- Minimo de 1 entrada completa para enviar
- Orientacao renderizada com `dangerouslySetInnerHTML`
- Formatacao em markdown para armazenamento

### 2. Criar `src/components/activities/SubmittedLoveActionView.tsx`

Componente para exibir a submissao formatada:
- Parser de markdown para extrair dados (Membro, Acao, Sentimento)
- Tabela estilizada (mesmo visual do SubmittedBalancedLifeMapView)
- Dialog popup ao clicar em uma linha para ver detalhes

### 3. Modificar `src/pages/ActivityPage.tsx`

- Importar `LoveActionActivity` e `SubmittedLoveActionView`
- Adicionar funcao de deteccao: `isLoveAction = (title) => title.toLowerCase().includes('acao de amor') || title.toLowerCase().includes('ação de amor')`
- Adicionar bloco de "Already Submitted" com `SubmittedLoveActionView`
- Adicionar bloco de renderizacao do componente no formulario
- Excluir da orientacao generica e do footer de submit padrao

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedLoveActionView`
- Adicionar deteccao e renderizacao formatada no modal de avaliacao

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedLoveActionView`
- Adicionar deteccao e renderizacao formatada na pagina

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Acao de Amor Concreta" na lista de titulos especiais

### 7. Migracao SQL - Inserir atividade no banco

- **station_id:** `acaba891-69d9-4d69-8b7f-5d0bb9f02927` (Estacao 3 - Expressando o amor: o dever filial)
- **title:** "Acao de Amor Concreta"
- **type:** `essay`
- **description:** Texto de orientacao com HTML formatado
- **points:** 10

---

## Detalhes Tecnicos

### Formato de Submissao (Markdown)

```
### Acao de Amor Concreta

---

**Membro da Familia:** Minha mae
**Acao Realizada:** Preparei um cafe da manha especial e levei ate ela
**Sensacao ou Sentimento:** Senti uma alegria profunda ao ver o sorriso dela

---

**Membro da Familia:** Meu irmao
**Acao Realizada:** Liguei para perguntar como ele estava
**Sensacao ou Sentimento:** Me senti mais conectada e grata pela nossa relacao
```

### Deteccao da Atividade

```typescript
const isLoveAction = (title: string) =>
  title.toLowerCase().includes('acao de amor') ||
  title.toLowerCase().includes('ação de amor');
```

Cobre tanto "Acao de Amor" quanto "Ação de Amor" (com ou sem acento e cedilha).

### Interface da Tabela

- Desktop: Tabela HTML com 3 colunas (Membro da Familia, Acao Realizada, Sensacao ou Sentimento) + coluna de remocao
- Mobile: Cartoes empilhados com os 3 campos
- Cabecalho em cor primaria
- Linhas alternadas com fundo suave
- Botao para adicionar/remover registros
- Minimo 1 registro completo para enviar

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/LoveActionActivity.tsx` | Criar | Formulario interativo com tabela de acoes de amor |
| `src/components/activities/SubmittedLoveActionView.tsx` | Criar | Visualizacao formatada como tabela |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar ambos componentes |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 3 da Jornada 3 |

---

## Resultado Esperado

- Ao acessar a Estacao 3 da Jornada 3, a aluna vera a atividade "Acao de Amor Concreta"
- A orientacao sera exibida formatada corretamente (sem tags HTML)
- Uma tabela interativa com 3 colunas permitira registrar as acoes de amor
- Minimo de 1 registro completo para enviar
- Apos o envio, a submissao sera exibida como tabela formatada
- Administradores e professores verao a mesma visualizacao nas paginas de avaliacao e submissao

