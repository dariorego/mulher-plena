

# Plano: Atividade "Registro de Situacao Real" - Estacao 2, Jornada 4

## Objetivo

Criar a atividade "Registro de Situacao Real" para a Estacao 2 ("Preparo para a formacao de um lar feliz") da Jornada 4. A participante reflete sobre um conflito real atraves de 3 niveis de escrita progressiva, transformando a experiencia em aprendizado espiritual.

---

## Como Funciona

A participante completa a atividade em 3 niveis de escrita:

1. **Nivel 1 - Portal da Memoria** - Caixa de texto para descrever um conflito real e como se sentiu
2. **Nivel 2 - Espelho da Sabedoria** - Caixa de texto para refletir: o que teria feito de diferente aplicando principios da Seicho-No-Ie (ver o outro como Filho de Deus, praticar gratidao, cultivar pensamentos positivos)
3. **Nivel 3 - Tesouro da Transformacao** - Caixa de texto para reescrever a historia mostrando como poderia ter resolvido de forma mais harmoniosa e positiva

Os 3 niveis sao obrigatorios e devem ter no minimo 50 caracteres cada.

---

## Estrutura da Interface

```text
+----------------------------------------------------------+
| REGISTRO DE SITUACAO REAL                                 |
+----------------------------------------------------------+
| ORIENTACAO (texto formatado com HTML)                     |
+----------------------------------------------------------+
|                                                           |
| [*] NIVEL 1 - PORTAL DA MEMORIA                          |
| Lembre-se de um conflito que ja aconteceu. Escreva, de   |
| forma simples, o que aconteceu e como voce se sentiu.     |
| +------------------------------------------------------+ |
| |  [Caixa de texto]                                    | |
| +------------------------------------------------------+ |
|                                                           |
| [ ] NIVEL 2 - ESPELHO DA SABEDORIA                       |
| Imagine como teria sido se voce tivesse aplicado um      |
| principio da Seicho-No-Ie...                             |
| +------------------------------------------------------+ |
| |  [Caixa de texto]                                    | |
| +------------------------------------------------------+ |
|                                                           |
| [ ] NIVEL 3 - TESOURO DA TRANSFORMACAO                   |
| Reescreva a historia, mostrando como VOCE poderia ter    |
| resolvido de forma mais harmoniosa e positiva.           |
| +------------------------------------------------------+ |
| |  [Caixa de texto]                                    | |
| +------------------------------------------------------+ |
|                                                           |
| Progresso: [=========-] 2/3 niveis completos             |
|                                                           |
| [============ Enviar Atividade ============]              |
+----------------------------------------------------------+
```

Cada nivel tera um visual gamificado com icones tematicos e cores de progresso, seguindo o mesmo padrao da "Carta de Compromisso".

---

## Alteracoes Necessarias

### 1. Criar `src/components/activities/RealSituationActivity.tsx`

Novo componente dedicado com:
- **Props:** `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- **Orientacao:** Renderizada com `dangerouslySetInnerHTML`
- **Nivel 1 - Portal da Memoria:** Textarea (min. 50 caracteres) para descrever o conflito
- **Nivel 2 - Espelho da Sabedoria:** Textarea (min. 50 caracteres) para reflexao com principios espirituais, incluindo lista de sugestoes (ver o outro como Filho de Deus, praticar gratidao, cultivar pensamentos positivos)
- **Nivel 3 - Tesouro da Transformacao:** Textarea (min. 50 caracteres) para reescrever a historia de forma positiva
- **Barra de progresso** visual mostrando niveis completos (X/3)
- **Visual gamificado** com icones: Nivel 1 (BookOpen), Nivel 2 (Eye/Lightbulb), Nivel 3 (Sparkles/Gem)
- **Validacao:** Todos os 3 niveis devem ter no minimo 50 caracteres para habilitar o envio

### 2. Componente de visualizacao inline (`SubmittedRealSituationView`)

No mesmo arquivo, componente para exibir a submissao formatada:
- Mostra cada nivel com indicacao de completude (verde quando preenchido)
- Exibe o texto de cada nivel formatado

### 3. Modificar `src/pages/ActivityPage.tsx`

- Importar `RealSituationActivity` e `SubmittedRealSituationView`
- Adicionar funcao de deteccao: `isRealSituation = (title) => title.toLowerCase().includes('registro de situa')`
- Adicionar bloco "Already Submitted" com visualizacao formatada (seguindo o padrao das demais atividades especiais)
- Adicionar bloco de renderizacao do componente no formulario
- Adicionar a funcao nas listas de exclusao (orientacao generica, essay generico, "already submitted" generico, condicao de exibicao do formulario)

### 4. Modificar `src/pages/Evaluations.tsx`

- Importar `SubmittedRealSituationView`
- Adicionar deteccao e renderizacao formatada no encadeamento de condicoes do modal de avaliacao

### 5. Modificar `src/pages/SubmissionView.tsx`

- Importar `SubmittedRealSituationView`
- Adicionar deteccao e renderizacao formatada na pagina de visualizacao completa

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Registro de Situacao Real" na lista de titulos especiais

### 7. Migracao SQL - Inserir atividade no banco

- **station_id:** `7888901f-aca7-4aaa-92a7-1f6da3786068` (Estacao 2 - Preparo para a formacao de um lar feliz)
- **title:** "Registro de Situacao Real"
- **type:** `essay`
- **description:** Texto de orientacao formatado em HTML
- **points:** 10

---

## Detalhes Tecnicos

### Deteccao da Atividade

```typescript
const isRealSituation = (title: string) =>
  title.toLowerCase().includes('registro de situa');
```

### Formato de Submissao (Markdown)

```
### Registro de Situacao Real

**Nivel 1 - Portal da Memoria:**
[Texto do conflito descrito pela participante]

---

**Nivel 2 - Espelho da Sabedoria:**
[Reflexao sobre o que teria feito diferente]

---

**Nivel 3 - Tesouro da Transformacao:**
[Historia reescrita de forma harmoniosa]

---

**Progresso:** 3/3 niveis completos
```

### Visual Gamificado

- Nivel 1: icone BookOpen (livro/memoria), fundo verde ao completar
- Nivel 2: icone Lightbulb (sabedoria/insight), fundo verde ao completar
- Nivel 3: icone Sparkles (transformacao/brilho), fundo verde ao completar
- Barra de progresso geral mostrando X/3 niveis completos
- Transicoes de cor suaves ao preencher cada nivel

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| `src/components/activities/RealSituationActivity.tsx` | Criar | Formulario com 3 niveis de texto progressivo |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar componente e blocos de submissao |
| `src/pages/Evaluations.tsx` | Modificar | Exibir view formatada no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir view formatada na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL | Criar | Inserir atividade na Estacao 2 da Jornada 4 |

---

## Resultado Esperado

- Ao acessar a Estacao 2 da Jornada 4, a aluna vera a atividade "Registro de Situacao Real"
- A orientacao sera exibida formatada com a descricao dos 3 niveis
- Tres niveis gamificados serao exibidos com caixas de texto:
  - Nivel 1 (Portal da Memoria): descrever o conflito e sentimentos
  - Nivel 2 (Espelho da Sabedoria): refletir com principios espirituais
  - Nivel 3 (Tesouro da Transformacao): reescrever a historia de forma positiva
- Barra de progresso visual mostrando quantos niveis foram completados
- Apos o envio, a submissao sera exibida com o conteudo de cada nivel formatado
- Administradores verao a mesma visualizacao nas paginas de avaliacao
- A atividade vale 10 pontos

