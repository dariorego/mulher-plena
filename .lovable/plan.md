

## Plano: Refazer Atividade — Exclusão Direta ou Solicitação

Alterar o componente `DeletionRequestButton` para ter dois comportamentos:

1. **Sem feedback** (`!submission.feedback`): Mostrar botão "Refazer Atividade" que exclui a submissão diretamente (com confirmação), sem precisar de aprovação.
2. **Com feedback** (`submission.feedback` preenchido): Manter o fluxo atual de "Solicitar Refazer" com justificativa e aprovação do tutor/admin.

### Mudança

**Arquivo:** `src/components/activities/DeletionRequestButton.tsx`

- Adicionar prop `hasFeedback: boolean` ao componente
- Se `hasFeedback === false`: renderizar botão "Refazer Atividade" com dialog de confirmação simples (sem campo de motivo). Ao confirmar, chamar `deleteSubmission` diretamente.
- Se `hasFeedback === true`: manter o fluxo atual (botão "Solicitar Refazer" → dialog com motivo → `createDeletionRequest`).

**Arquivo:** `src/pages/ActivityPage.tsx`

- Passar `hasFeedback={!!existingSubmission.feedback}` em todas as ocorrências de `<DeletionRequestButton>`.

### Visual

- Sem feedback: Botão "Refazer Atividade" → Dialog: "Tem certeza que deseja refazer? Sua resposta atual será excluída." → Confirmar/Cancelar
- Com feedback: Botão "Solicitar Refazer" → Dialog atual com campo de motivo

