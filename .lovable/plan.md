

# Plano: Atividade "Roda de Amor Consciente" - Estacao 3, Jornada 4

## Objetivo

Criar uma experiencia visual imersiva e transformadora para a atividade "Roda de Amor Consciente" na Estacao 3 ("Relacionamento Sexual: um ritual sagrado") da Jornada 4. A participante preenche um tabuleiro evolutivo com 6 casas progressivas que representam a jornada da vida afetiva, culminando em uma celebracao visual ao completar todas as etapas.

---

## Como Funciona

A participante vivencia a atividade em 3 fases:

1. **Tela de abertura** - Animacao suave com titulo da estacao, subtitulo inspirador e botao "Iniciar Jornada"
2. **Tabuleiro de 6 casas** - Cada casa com caixa de texto expansivel, icone simbolico e feedback visual progressivo
3. **Tela de celebracao** - Mandala iluminada, mensagem de reconhecimento e botao de envio

### As 6 Casas da Roda

| Casa | Tema | Icone | Placeholder |
|------|------|-------|-------------|
| 1 | Atitudes de amor que expresso com liberdade | Coracao | "Uma atitude de amor que ja pratico..." |
| 2 | Formas de cuidado que ofereco ao outro | Flor | "Uma forma de cuidado que ofereco..." |
| 3 | Desafios afetivos que ja superei | Chama | "Um desafio afetivo que superei..." |
| 4 | Aprendizados das minhas relacoes | Luz | "Um aprendizado das minhas relacoes..." |
| 5 | Atitudes que desejo transformar | Infinito | "Uma atitude que desejo transformar..." |
| 6 | Reconhecimento das minhas conquistas emocionais | Uniao | "Uma conquista emocional que reconheco..." |

Cada casa exige minimo de 30 caracteres. Ao preencher, a casa se ilumina com glow e check suave. A barra de progresso acompanha o preenchimento ate a mandala ficar completa.

---

## Estrutura da Interface

### Fase 1 - Tela de Abertura

```text
+----------------------------------------------------------+
|                                                           |
|          [Mandala decorativa com glow suave]               |
|                                                           |
|       Relacionamento Sexual: um ritual sagrado            |
|                                                           |
|    "Amar com consciencia e abracar a jornada              |
|     do coracao com liberdade e respeito"                   |
|                                                           |
|          [======= Iniciar Jornada =======]                |
|                                                           |
+----------------------------------------------------------+
```

### Fase 2 - Tabuleiro (scroll vertical mobile-first)

```text
+----------------------------------------------------------+
|  Roda de Amor Consciente       Progresso: 2/6             |
+----------------------------------------------------------+
|                                                           |
| [Coracao] Casa 1 - Atitudes de amor                       |
| +------------------------------------------------------+ |
| |  "Uma atitude de amor que ja pratico..."              | |
| +------------------------------------------------------+ |
|                                                           |
| [Flor] Casa 2 - Formas de cuidado                        |
| +------------------------------------------------------+ |
| |  [Caixa de texto]                                    | |
| +------------------------------------------------------+ |
|                                                           |
| ... (6 casas no total)                                    |
|                                                           |
| [===== Barra de Progresso fixa na base =====] 2/6        |
+----------------------------------------------------------+
```

### Fase 3 - Celebracao (apos preencher todas)

```text
+----------------------------------------------------------+
|                                                           |
|        [Mandala completa com glow dourado]                 |
|                                                           |
|    "Voce completou a Roda de Amor Consciente!"            |
|    "Sua jornada de amor e transformacao e unica"          |
|                                                           |
|      [==== Reconhecer minhas conquistas ====]             |
|                                                           |
+----------------------------------------------------------+
```

---

## Paleta Visual

A atividade utilizara uma paleta propria definida com CSS inline/Tailwind, sem alterar o tema global:

- **Rosa queimado:** `#C9878F` (backgrounds de casas ativas)
- **Dourado suave:** `#D4A574` (glow, destaques, mandala)
- **Lilas:** `#B8A9C9` (icones, bordas)
- **Pessego:** `#F5D5C8` (backgrounds suaves)
- **Off-white:** `#FAF7F2` (fundo geral)

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/LoveWheelActivity.tsx`

Componente principal com:

- **Props:** `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- **3 fases** controladas por estado local:
  - Fase 0: Tela de abertura com animacao fade-in + glow na mandala SVG
  - Fase 1: Tabuleiro com 6 casas em scroll vertical
  - Fase 2: Tela de celebracao com mandala completa e confetes (canvas-confetti)
- **6 casas** com:
  - Icones simbolicos (Heart, Flower2, Flame, Sun, Infinity, Users) do Lucide
  - Textarea expansivel com placeholder reflexivo
  - Feedback visual: borda com glow + cor de fundo + check ao completar (min. 30 chars)
  - Transicoes CSS ease-in-out de 0.5s
- **Barra de progresso** fixa na base (sticky) mostrando X/6 casas completas
- **Mandala SVG decorativa** construida com circulos e arcos que se iluminam progressivamente
- **Vibration API** opcional no botao "Iniciar Jornada" (`navigator.vibrate?.(50)`)
- **Validacao:** Todas as 6 casas devem ter minimo 30 caracteres

### 2. Componente `SubmittedLoveWheelView` (no mesmo arquivo)

Visualizacao da submissao formatada:
- Exibe cada casa com icone e texto preenchido
- Visual com a paleta rosa/dourado/lilas

### 3. Modificar `src/pages/ActivityPage.tsx`

- Importar `LoveWheelActivity` e `SubmittedLoveWheelView`
- Adicionar funcao de deteccao: `isLoveWheel = (title) => title.toLowerCase().includes('roda de amor')`
- Adicionar bloco "Already Submitted" com a visualizacao formatada
- Adicionar bloco de renderizacao do componente no formulario
- Adicionar a funcao em todas as listas de exclusao (orientacao generica, essay generico, "already submitted" generico, condicao de exibicao do formulario, footer de submit)

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedLoveWheelView`
- Adicionar deteccao e renderizacao formatada no modal de avaliacao
- Adicionar ao `cn()` do DialogContent para usar modal ampliado

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedLoveWheelView`
- Adicionar deteccao e renderizacao formatada na pagina

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Roda de Amor Consciente" na lista de titulos especiais

### 7. Migracao SQL - Inserir atividade no banco

- **station_id:** `537922bb-58f2-4b87-afcf-bc9fe579d1cd` (Estacao 3 - Relacionamento Sexual: um ritual sagrado)
- **title:** "Roda de Amor Consciente"
- **type:** `essay`
- **description:** Texto de orientacao formatado em HTML
- **points:** 10

---

## Detalhes Tecnicos

### Deteccao da Atividade

```typescript
const isLoveWheel = (title: string) =>
  title.toLowerCase().includes('roda de amor');
```

### Formato de Submissao (Markdown)

```
### Roda de Amor Consciente

**Casa 1 - Atitudes de amor que expresso com liberdade:**
[Texto da participante]

---

**Casa 2 - Formas de cuidado que ofereco ao outro:**
[Texto da participante]

---

**Casa 3 - Desafios afetivos que ja superei:**
[Texto da participante]

---

**Casa 4 - Aprendizados das minhas relacoes:**
[Texto da participante]

---

**Casa 5 - Atitudes que desejo transformar:**
[Texto da participante]

---

**Casa 6 - Reconhecimento das minhas conquistas emocionais:**
[Texto da participante]

---

**Progresso:** 6/6 casas completas
```

### Animacoes e Efeitos

- **Tela de abertura:** `animate-fade-in` com delay escalonado (titulo 0s, subtitulo 0.3s, botao 0.6s)
- **Mandala SVG:** CSS `@keyframes glow` com box-shadow dourado pulsante
- **Casas do tabuleiro:** Transicao `border-color`, `background-color` e `box-shadow` com `duration-500 ease-in-out`
- **Check de conclusao:** Scale-in com bounce (`transform: scale(0) -> scale(1.1) -> scale(1)`)
- **Celebracao final:** `canvas-confetti` (ja instalado) + mandala com todos os segmentos iluminados
- **Vibration API:** `navigator.vibrate?.(50)` no botao "Iniciar Jornada" (funciona em Android, ignorado silenciosamente em iOS/desktop)

### Mandala SVG

Construida programaticamente com 6 segmentos/arcos SVG. Cada segmento se ilumina (cor dourada + glow) conforme a casa correspondente e preenchida. Quando todas as 6 estao completas, a mandala inteira brilha.

### Responsividade Mobile-First

- Layout 100% vertical com `flex flex-col`
- Textareas com `min-h-[120px]` para conforto na digitacao mobile
- Botoes `w-full` com `py-4` para facil toque
- Barra de progresso `sticky bottom-0` para visibilidade constante
- Texto com `text-base` minimo para legibilidade
- Espacamento generoso entre casas (`gap-6`)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/LoveWheelActivity.tsx` | Criar | Componente imersivo com 3 fases, mandala SVG e 6 casas |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar componente e blocos de submissao |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 3 da Jornada 4 |

---

## Resultado Esperado

- Ao acessar a Estacao 3 da Jornada 4, a aluna vera a atividade "Roda de Amor Consciente"
- Uma tela de abertura com mandala decorativa e animacao suave a convida a iniciar
- O tabuleiro de 6 casas aparece em formato de jornada vertical, com paleta rosa/dourado/lilas
- Cada casa preenchida se ilumina progressivamente, formando a mandala
- Ao completar as 6 casas, surge tela de celebracao com confetes e mandala completa
- O botao "Reconhecer minhas conquistas" envia a atividade
- Administradores verao a submissao formatada nas paginas de avaliacao
- A atividade vale 10 pontos
- Experiencia totalmente otimizada para mobile com scroll, botoes full-width e feedback haptico

