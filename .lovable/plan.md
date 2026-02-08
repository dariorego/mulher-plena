

# Plano: Atividade Final "Relato de Reconciliacao com a Historia Familiar" - Estacao de Integracao, Jornada 3

## Objetivo

Criar a atividade final da Jornada 3 na estacao de integracao (ID: `058ac9d6-9e47-4db2-9cc6-9a84f2729d93`), permitindo que a participante elabore um texto escrito OU produza um video (maximo 3 minutos), relatando como os conteudos da jornada contribuiram para ampliar sua compreensao das relacoes familiares.

---

## Como Funciona

A participante acessa a atividade e encontra:

1. **Orientacao formatada** (sem tags HTML visiveis)
2. **Caixa de texto** para escrever o relato (minimo 100 caracteres)
3. **Campo para anexar video** (opcional) - permite upload de arquivo de video (MP4, MOV, WEBM) ou inserir link do YouTube/Vimeo
4. A participante pode preencher apenas o texto, apenas o video, ou ambos
5. Ao enviar, o conteudo e salvo como uma submissao individual

---

## Estrutura da Interface

```text
+----------------------------------------------------------+
| RELATO DE RECONCILIACAO COM A HISTORIA FAMILIAR           |
+----------------------------------------------------------+
| ORIENTACAO                                                |
| Elabore um texto escrito ou produza um video, com duracao |
| maxima de tres minutos, relatando de que forma os         |
| conteudos abordados na jornada contribuiram para ampliar  |
| sua compreensao acerca das relacoes familiares e da       |
| maneira como voce percebe o passado.                      |
+----------------------------------------------------------+
|                                                           |
| SEU RELATO                                                |
| +------------------------------------------------------+ |
| |                                                      | |
| |  [Caixa de texto - min. 100 caracteres]              | |
| |                                                      | |
| +------------------------------------------------------+ |
|                                                           |
| VIDEO (OPCIONAL)                                          |
| +------------------------------------------------------+ |
| | [Inserir link do video (YouTube, Vimeo)]             | |
| |              --- ou ---                              | |
| | [Fazer upload de video (max 50MB)]   [Selecionar]    | |
| +------------------------------------------------------+ |
|                                                           |
| [============ Enviar Atividade ============]              |
+----------------------------------------------------------+
```

---

## Alteracoes Necessarias

### 1. Criar bucket de storage `activity-videos`

Migracao SQL para criar o bucket de armazenamento de videos de atividades, com politicas RLS permitindo que usuarios autenticados facam upload e visualizem seus proprios videos.

### 2. Criar `src/components/activities/ReconciliationReportActivity.tsx`

Novo componente dedicado com:
- **Props:** `description`, `onSubmit`, `isSubmitting`, `fontSizeClass`
- **Orientacao:** Renderizada com `dangerouslySetInnerHTML`
- **Campo de texto:** Textarea para o relato escrito (minimo 100 caracteres)
- **Secao de video (opcional):**
  - Input para colar link de video (YouTube, Vimeo, Google Drive)
  - Input de upload de arquivo de video (MP4, MOV, WEBM, max 50MB)
  - Preview do video quando link inserido (embed) ou nome do arquivo quando upload feito
- **Validacao:** Pelo menos um dos campos (texto OU video) deve estar preenchido
- **Formatacao markdown** para armazenamento:
  ```
  ### Relato de Reconciliacao com a Historia Familiar

  [texto do relato]

  ---

  **Video:** [URL do video]
  ```

### 3. Modificar `src/pages/ActivityPage.tsx`

- Importar `ReconciliationReportActivity`
- Adicionar funcao de deteccao: `isReconciliationReport = (title) => title.toLowerCase().includes('relato') && title.toLowerCase().includes('reconcilia')`
- Adicionar bloco de "Already Submitted" com exibicao do texto e do video (se houver)
- Adicionar bloco de renderizacao do componente no formulario
- Excluir da orientacao generica e do footer de submit padrao

### 4. Modificar `src/pages/Evaluations.tsx`

- Adicionar deteccao e renderizacao formatada no modal de avaliacao (texto + embed de video)

### 5. Modificar `src/pages/SubmissionView.tsx`

- Adicionar deteccao e renderizacao formatada na pagina

### 6. Modificar `src/components/admin/ActivityForm.tsx`

- Adicionar "Relato de Reconciliacao" na lista de titulos especiais

### 7. Migracao SQL - Inserir atividade no banco

- **station_id:** `058ac9d6-9e47-4db2-9cc6-9a84f2729d93` (Estacao de Integracao - Jornada 3)
- **title:** "Relato de Reconciliação com a História Familiar"
- **type:** `essay`
- **description:** Texto de orientacao com HTML formatado
- **points:** 15 (atividade final da jornada, peso maior)

---

## Detalhes Tecnicos

### Deteccao da Atividade

```typescript
const isReconciliationReport = (title: string) =>
  title.toLowerCase().includes('relato') &&
  title.toLowerCase().includes('reconcilia');
```

### Upload de Video

- Bucket: `activity-videos` (publico para leitura, autenticado para upload)
- Limite: 50MB por arquivo
- Formatos aceitos: `.mp4`, `.mov`, `.webm`
- Caminho no bucket: `{userId}/{activityId}/{filename}`
- Apos upload, URL publica e salva junto com o conteudo da submissao

### Link de Video Externo

- Suporta links do YouTube, Vimeo e Google Drive
- Detecta automaticamente o tipo para exibir embed adequado na visualizacao da submissao

### Formato de Submissao

```
### Relato de Reconciliação com a História Familiar

[Texto escrito pela participante]

---

**Vídeo anexado:** [URL do vídeo - link externo ou URL do storage]
```

Se nao houver video, a secao de video e omitida. Se nao houver texto (so video), o texto e substituido por "[Relato enviado em formato de vídeo]".

### Exibicao da Submissao (Admin/Professor)

- Texto exibido com formatacao
- Video embed (YouTube/Vimeo) ou link clicavel para download (arquivo enviado)

---

## Resumo das Alteracoes

| Arquivo / Recurso | Acao | Descricao |
|-------------------|------|-----------|
| Nova migracao SQL (bucket) | Criar | Bucket `activity-videos` com RLS |
| `src/components/activities/ReconciliationReportActivity.tsx` | Criar | Formulario com texto + video opcional |
| `src/pages/ActivityPage.tsx` | Modificar | Integrar componente e bloco de submissao |
| `src/pages/Evaluations.tsx` | Modificar | Exibir texto + video no modal |
| `src/pages/SubmissionView.tsx` | Modificar | Exibir texto + video na pagina |
| `src/components/admin/ActivityForm.tsx` | Modificar | Adicionar dica de titulo especial |
| Nova migracao SQL (atividade) | Criar | Inserir atividade na estacao de integracao |

---

## Resultado Esperado

- Ao acessar a Estacao de Integracao da Jornada 3, a aluna vera a atividade "Relato de Reconciliacao com a Historia Familiar"
- A orientacao sera exibida formatada corretamente
- Uma caixa de texto permitira escrever o relato
- Um campo opcional permitira anexar video (upload ou link externo)
- A participante pode enviar apenas texto, apenas video, ou ambos
- Apos o envio, administradores e professores verao o texto e o video na avaliacao
- A atividade vale 15 pontos (atividade final/integradora da jornada)
