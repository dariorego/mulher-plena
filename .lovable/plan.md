

# Plano: Atividade "Diario de Papeis" - Estacao 3, Jornada 2

## Objetivo
Criar a atividade "Diario de Papeis" para a Estacao 3 ("Multiplicidade de papeis: impactos na rotina e nos projetos de vida") da Jornada 2. A participante registra os papeis que desempenha ao longo de um dia, o sentimento associado e como vivenciou cada experiencia, preenchendo uma tabela interativa.

---

## Como Funciona

A participante preenche uma tabela com no minimo 3 linhas contendo:
1. **Papel** - O papel desempenhado (ex: Mae/cuidadora, Profissional/Lider, Esposa)
2. **Sentimento** - Uma palavra que traduz o sentimento (ex: Amor, Confiante, Gratidao)
3. **Como vivenciei essa experiencia** - Descricao de como vivenciou aquele papel

Minimo de 3 papeis preenchidos para enviar.

---

## Estrutura da Interface

```text
+------------------------------------------------------+
| DIARIO DE PAPEIS                                      |
+------------------------------------------------------+
| ORIENTACAO                                            |
| Registre, ao longo de um dia, os papeis que voce      |
| desempenhou e como se sentiu ao realizar cada um...   |
+------------------------------------------------------+
|                                                       |
| +----------+-----------+----------------------------+ |
| | PAPEL    |SENTIMENTO | COMO VIVENCIEI...          | |
| +----------+-----------+----------------------------+ |
| | [______] | [_______] | [________________________] | |
| +----------+-----------+----------------------------+ |
| | [______] | [_______] | [________________________] | |
| +----------+-----------+----------------------------+ |
| | [______] | [_______] | [________________________] | |
| +----------+-----------+----------------------------+ |
|                                                       |
| [+ Adicionar Papel]                                   |
|                                                       |
| 3/3 papeis preenchidos                                |
| [======= Enviar Atividade =======]                    |
+------------------------------------------------------+
```

---

## Visualizacao da Submissao

Apos o envio, a submissao sera exibida como uma tabela formatada com os dados preenchidos, tanto para a aluna quanto para o avaliador.

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/RoleDiaryActivity.tsx`

Componente principal do formulario com:
- Props: `description`, `onSubmit`, `isSubmitting`, `fontSizeClass` (mesmo padrao)
- Estado interno: lista de entradas `{ role: string, feeling: string, experience: string }[]`
- Comeca com 3 linhas vazias
- Tabela responsiva: em desktop exibe como tabela real, em mobile exibe como cartoes empilhados
- Botao para adicionar/remover entradas
- Minimo de 3 entradas completas para habilitar envio
- Formatacao em markdown para armazenamento

### 2. Criar `src/components/activities/SubmittedRoleDiaryView.tsx`

Componente para exibir a submissao formatada:
- Parser de markdown para extrair dados dos papeis
- Exibicao como tabela estilizada
- Dialog popup ao clicar em uma linha para ver detalhes completos

### 3. Modificar `src/pages/ActivityPage.tsx`

- Adicionar import de `RoleDiaryActivity` e `SubmittedRoleDiaryView`
- Adicionar funcao de deteccao: `isDiaryActivity = (title) => title.toLowerCase().includes('diário de papéis') || title.toLowerCase().includes('diario de papeis')`
- Adicionar bloco de renderizacao para submissao existente (Already Submitted)
- Adicionar bloco de renderizacao do componente no formulario de preenchimento
- Excluir da orientacao generica e do footer de submit

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedRoleDiaryView`
- Adicionar deteccao e renderizacao formatada no modal de avaliacao

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedRoleDiaryView`
- Adicionar deteccao e renderizacao formatada

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Diario de Papeis" na lista de titulos especiais na dica do formulario de admin

### 7. Migracao SQL - Inserir atividade no banco

- station_id: `8d259d03-211f-40f3-8b0c-c0196ac13c9b` (Estacao 3 - Multiplicidade de papeis)
- title: "Diário de Papéis"
- type: `essay`
- description: texto de orientacao
- points: 10

---

## Detalhes Tecnicos

### Formato de Submissao (Markdown)

```
### Diario de Papeis

---

**Papel:** Mae / cuidadora
**Sentimento:** Amor
**Como vivenciei:** Senti-me amorosa e realizada por cuidar de quem amo, mas tambem um pouco cansada pela correria.

---

**Papel:** Profissional / Lider
**Sentimento:** Confiante
**Como vivenciei:** Me senti animada e inspirada ao perceber que minhas ideias contribuiram para o grupo.

---

**Papel:** Esposa
**Sentimento:** Gratidao
**Como vivenciei:** Acolhida e amada, me senti alegre por compartilhar momentos simples com o meu marido.
```

### Deteccao no ActivityPage

```typescript
const isDiaryActivity = (title: string) =>
  title.toLowerCase().includes('diário de papéis') ||
  title.toLowerCase().includes('diario de papeis');
```

### Interface da Tabela

- Desktop: Tabela HTML estilizada com 3 colunas (Papel, Sentimento, Como vivenciei)
- Mobile: Cartoes empilhados com os 3 campos
- Cabecalho da tabela em cor primaria
- Linhas alternadas com fundo suave
- Inputs/textareas inline na tabela

### Cores e Estilo

- Cabecalho: `bg-primary text-accent` (consistente com o restante da aplicacao)
- Linhas pares: `bg-cream/30`
- Linhas impares: `bg-background`
- Botao adicionar: tracejado, estilo outline

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/RoleDiaryActivity.tsx` | Criar | Formulario interativo com tabela |
| `src/components/activities/SubmittedRoleDiaryView.tsx` | Criar | Visualizacao formatada como tabela |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar ambos componentes |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 3 |

---

## Resultado Esperado

- Ao acessar a Estacao 3 da Jornada 2, a aluna vera a atividade "Diario de Papeis"
- A interface exibira uma tabela interativa com 3 colunas para preencher
- Minimo de 3 papeis completos para enviar
- Apos o envio, a submissao sera exibida como tabela formatada
- Administradores e professores verao a mesma visualizacao nas paginas de avaliacao e submissao

