

# Plano: Atividade "Carta de Compromisso" - Estacao 1, Jornada 4

## Objetivo

Criar a atividade "Carta de Compromisso" para a Estacao 1 ("Alma gemea e evolucao espiritual") da Jornada 4. A participante escreve uma carta ao conjuge expressando valores espirituais, transformada em um "jogo de fases" com 3 niveis/missoes.

---

## Como Funciona

A participante completa a atividade em etapas visuais:

1. **Carta principal** - Caixa de texto para escrever a carta de compromisso ao conjuge
2. **Nivel 1 - Memoria Especial** - Caixa de texto para reviver e descrever um momento marcante do namoro
3. **Nivel 2 - Acao de Amor** - Checkbox para validar que realizou um gesto de carinho (abraco, cafe, bilhete)
4. **Nivel 3 - Missao Secreta** - Checkbox para validar que planejou uma surpresa para o casal

Para enviar, a carta principal deve ter no minimo 100 caracteres. Os niveis sao complementares (pelo menos o Nivel 1 deve estar preenchido ou um dos checkboxes marcado).

---

## Estrutura da Interface

```text
+----------------------------------------------------------+
| CARTA DE COMPROMISSO                                      |
+----------------------------------------------------------+
| ORIENTACAO                                                |
| Escreva uma carta para o conjuge expressando os valores   |
| espirituais que deseja cultivar na relacao...              |
+----------------------------------------------------------+
|                                                           |
| SUA CARTA                                                 |
| +------------------------------------------------------+ |
| |  [Caixa de texto - min. 100 caracteres]              | |
| +------------------------------------------------------+ |
|                                                           |
| JOGO DE FASES                                             |
|                                                           |
| [*] NIVEL 1 - MEMORIA ESPECIAL                           |
| +------------------------------------------------------+ |
| |  [Caixa de texto]                                    | |
| +------------------------------------------------------+ |
|                                                           |
| [ ] NIVEL 2 - ACAO DE AMOR                               |
| Realize hoje um gesto simples que expresse carinho...     |
| [x] Missao cumprida!                                     |
|                                                           |
| [ ] NIVEL 3 - MISSAO SECRETA                             |
| Planeje uma surpresa: pode ser um passeio diferente...    |
| [x] Missao cumprida!                                     |
|                                                           |
| Progresso: [=====-----] 2/3 niveis completos             |
|                                                           |
| [============ Enviar Atividade ============]              |
+----------------------------------------------------------+
```

Cada nivel tera um visual de "fase de jogo" com icones tematicos, cores de progresso e badges de conclusao.

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/CommitmentLetterActivity.tsx`

Novo componente dedicado com:
- **Props:** `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- **Orientacao:** Renderizada com `dangerouslySetInnerHTML`
- **Carta principal:** Textarea (minimo 100 caracteres)
- **Nivel 1 - Memoria Especial:** Textarea para escrever sobre uma lembranca
- **Nivel 2 - Acao de Amor:** Checkbox "Missao cumprida!" com descricao da acao
- **Nivel 3 - Missao Secreta:** Checkbox "Missao cumprida!" com descricao da missao
- **Barra de progresso** visual mostrando niveis completos
- **Visual gamificado** com icones de estrela/coracao/trofeu para cada nivel
- **Validacao:** Carta principal com minimo 100 caracteres obrigatoria

### 2. Criar componente de visualizacao inline (SubmittedCommitmentLetterView)

Componente para exibir a submissao formatada:
- Mostra a carta principal
- Mostra cada nivel com indicacao de completude (check verde ou pendente)
- Nivel 1: exibe o texto da memoria
- Niveis 2 e 3: exibe se foram marcados como cumpridos

### 3. Modificar `src/pages/ActivityPage.tsx`

- Importar `CommitmentLetterActivity` e o view de submissao
- Adicionar funcao de deteccao: `isCommitmentLetter = (title) => title.toLowerCase().includes('carta de compromisso')`
- Adicionar bloco "Already Submitted" com visualizacao formatada
- Adicionar bloco de renderizacao do componente no formulario
- Excluir da orientacao generica e do footer de submit padrao
- Adicionar a funcao na lista de exclusoes dos blocos genericos

### 4. Modificar `src/pages/Evaluations.tsx`

- Adicionar deteccao e renderizacao formatada no modal de avaliacao

### 5. Modificar `src/pages/SubmissionView.tsx`

- Adicionar deteccao e renderizacao formatada na pagina

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Carta de Compromisso" na lista de titulos especiais

### 7. Migracao SQL - Inserir atividade no banco

- **station_id:** `617a29d5-88b6-4571-b999-83316135a5f9` (Estacao 1 - Alma gemea e evolucao espiritual)
- **title:** "Carta de Compromisso"
- **type:** `essay`
- **description:** Texto de orientacao com HTML formatado incluindo a descricao dos 3 niveis
- **points:** 10

---

## Detalhes Tecnicos

### Deteccao da Atividade

```typescript
const isCommitmentLetter = (title: string) =>
  title.toLowerCase().includes('carta de compromisso');
```

### Formato de Submissao (Markdown)

```
### Carta de Compromisso

[Texto da carta escrita pela participante]

---

**Nível 1 – Memória Especial:**
[Texto da memoria escrita pela participante]

---

**Nível 2 – Ação de Amor:**
✅ Missão cumprida!

---

**Nível 3 – Missão Secreta:**
✅ Missão cumprida!

---

**Progresso:** 3/3 níveis completos
```

Se um nivel nao foi completado, aparece "⬜ Pendente" em vez de "check Missao cumprida!".

### Visual Gamificado

- Cada nivel tem um icone tematico (Nivel 1: coracao, Nivel 2: estrela, Nivel 3: trofeu)
- Fundo com cor de gradiente quando o nivel esta completo (verde claro)
- Fundo neutro quando pendente
- Barra de progresso geral mostrando X/3 niveis completos
- Animacao sutil ao marcar um checkbox (transicao de cor)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/CommitmentLetterActivity.tsx` | Criar | Formulario com carta + 3 niveis gamificados |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar componente e blocos de submissao |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 1 da Jornada 4 |

---

## Resultado Esperado

- Ao acessar a Estacao 1 da Jornada 4, a aluna vera a atividade "Carta de Compromisso"
- A orientacao sera exibida formatada com a descricao dos 3 niveis
- Uma caixa de texto permitira escrever a carta principal (min. 100 caracteres)
- Tres niveis gamificados serao exibidos com visual interativo:
  - Nivel 1: caixa de texto para a memoria especial
  - Nivel 2: checkbox para validar a acao de amor
  - Nivel 3: checkbox para validar a missao secreta
- Barra de progresso visual mostrando quantos niveis foram completados
- Apos o envio, a submissao sera exibida com a carta e o status de cada nivel
- Administradores verao a mesma visualizacao nas paginas de avaliacao

