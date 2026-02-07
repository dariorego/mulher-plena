

# Plano: Atividade "Farol das Acoes nos Relacionamentos" - Semaforo Interativo

## Objetivo
Criar uma atividade especial com interface de semaforo (vermelho/amarelo/verde) para a Estacao 2 da Jornada 2 ("Construindo relacionamentos saudaveis"). O participante reflete sobre seus relacionamentos mais importantes e, para cada um, preenche acoes associadas a cada cor do semaforo.

---

## Como Funciona

Para cada relacionamento importante (familia, amigos, colegas, etc.), o participante:
1. Nomeia o relacionamento (ex: "Familia", "Amigos do trabalho")
2. Escolhe uma palavra que traduz sua vivencia/sentimento naquele relacionamento
3. Preenche o semaforo:
   - **Vermelho** (Parar): algo que precisa parar de fazer
   - **Amarelo** (Atencao): algo para prestar mais atencao
   - **Verde** (Seguir): algo para continuar fazendo

Minimo de 3 relacionamentos para enviar.

---

## Estrutura da Interface

```text
+--------------------------------------------------+
| FAROL DAS ACOES NOS RELACIONAMENTOS              |
+--------------------------------------------------+
| ORIENTACAO                                        |
| Pense nos seus relacionamentos mais importantes.. |
+--------------------------------------------------+
|                                                   |
| RELACIONAMENTO 1                                  |
| Nome: [Familia__________]                         |
| Palavra-chave: [Amor___________]                  |
|                                                   |
|  [O] VERMELHO - Algo para PARAR                   |
|  [__________________________________]             |
|                                                   |
|  [O] AMARELO - Algo para PRESTAR ATENCAO          |
|  [__________________________________]             |
|                                                   |
|  [O] VERDE - Algo para SEGUIR                     |
|  [__________________________________]             |
|                                                   |
+--------------------------------------------------+
| [+ Adicionar Relacionamento]                      |
|                                                   |
| 3/3 relacionamentos preenchidos                   |
| [======= Enviar Atividade =======]                |
+--------------------------------------------------+
```

---

## Visualizacao da Submissao

Apos o envio, a visualizacao formatada mostrara cada relacionamento como um cartao com um semaforo visual (circulos vermelho, amarelo e verde) ao lado das respectivas acoes.

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/TrafficLightActivity.tsx`

Componente principal com:
- Props: `description`, `onSubmit`, `isSubmitting`, `fontSizeClass` (mesmo padrao das outras atividades especiais)
- Estado interno para lista de relacionamentos: `{ name: string, keyword: string, red: string, yellow: string, green: string }[]`
- Interface de semaforo visual com circulos coloridos (vermelho, amarelo, verde)
- Minimo de 3 relacionamentos preenchidos para habilitar envio
- Botao para adicionar/remover relacionamentos
- Formatacao do conteudo em markdown para submissao

### 2. Criar `src/components/activities/SubmittedTrafficLightView.tsx`

Componente para exibir a submissao formatada:
- Parser de markdown para extrair dados dos relacionamentos
- Exibicao visual com semaforo (circulos coloridos)
- Cartoes para cada relacionamento com a palavra-chave e as 3 acoes
- Dialog popup ao clicar em um cartao para ver detalhes (mesmo padrao da Linha da Vida)

### 3. Modificar `src/pages/ActivityPage.tsx`

- Adicionar import do `TrafficLightActivity` e `SubmittedTrafficLightView`
- Adicionar funcao de deteccao: `isTrafficLightActivity = (title) => title.toLowerCase().includes('farol')`
- Adicionar bloco de renderizacao para submissao existente (secao "Already Submitted")
- Adicionar bloco de renderizacao do componente no formulario
- Excluir da orientacao generica e do footer de submit

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedTrafficLightView`
- Adicionar deteccao do titulo "Farol" no modal de avaliacao
- Renderizar a view formatada no lugar de texto puro

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedTrafficLightView`
- Adicionar deteccao e renderizacao formatada

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Farol" na lista de titulos especiais na dica do formulario de admin

### 7. Migracao SQL - Inserir atividade no banco

- station_id: `a07699ad-ae70-4785-8f3e-a15192eb85a2` (Estacao 2 - Construindo relacionamentos saudaveis)
- title: "Farol das ações nos Relacionamentos"
- type: `essay` (padrao das atividades especiais)
- description: "Pense nos seus relacionamentos mais importantes, com a familia, amigos, colegas de trabalho... Para cada um, escolha uma palavra que traduza sua vivencia ou sentimento. Em seguida, preencha o semaforo: Vermelho (algo para parar), Amarelo (algo para prestar atencao) e Verde (algo para seguir)."
- points: 10

---

## Detalhes Tecnicos

### Formato de Submissao (Markdown)
```
### Farol das Acoes nos Relacionamentos

---

**Relacionamento: Familia**
**Palavra-chave:** Amor

- Vermelho (Parar): Deixar de ser impaciente nas conversas
- Amarelo (Atencao): Ouvir mais antes de responder
- Verde (Seguir): Continuar demonstrando carinho diariamente

---

**Relacionamento: Amigos**
**Palavra-chave:** Lealdade

- Vermelho (Parar): Cancelar encontros de ultima hora
- Amarelo (Atencao): Prestar mais atencao nas necessidades deles
- Verde (Seguir): Manter o habito de ligar toda semana
```

### Deteccao no ActivityPage
```typescript
const isTrafficLightActivity = (title: string) =>
  title.toLowerCase().includes('farol');
```

### Cores do Semaforo
- Vermelho: `#EF4444` (bg-red-500)
- Amarelo: `#EAB308` (bg-yellow-500)
- Verde: `#22C55E` (bg-green-500)

### Responsividade
- Desktop: Cartoes lado a lado em grid de 2 colunas
- Mobile: Cartoes empilhados em coluna unica

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/TrafficLightActivity.tsx` | Criar | Componente interativo do semaforo |
| `src/components/activities/SubmittedTrafficLightView.tsx` | Criar | Visualizacao formatada da submissao |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar ambos componentes |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal de avaliacao |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina de submissao |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar "Farol" na dica de titulos especiais |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 2 da Jornada 2 |

---

## Resultado Esperado

- Ao acessar a Estacao 2 da Jornada 2 ("Construindo relacionamentos saudaveis"), o aluno vera a atividade "Farol das acoes nos Relacionamentos"
- A interface exibira campos para nomear relacionamentos, escolher uma palavra-chave e preencher as 3 acoes do semaforo
- Minimo de 3 relacionamentos completos para enviar
- Apos o envio, a submissao sera exibida com semaforos visuais tanto para o aluno quanto para o avaliador
- Administradores e professores verao a mesma visualizacao formatada nas paginas de avaliacao e submissao

