

# Centralizar Notificacoes e Adicionar Botao de Fechar

## Resumo

O projeto utiliza dois sistemas de notificacao que exibem mensagens no canto inferior direito, podendo sobrepor botoes e areas de acao. A proposta e centralizar todas as notificacoes na tela e adicionar um botao visivel de fechamento.

## Sistemas de notificacao encontrados

O projeto possui **dois sistemas distintos** de toast/notificacao:

1. **Sonner** (usado em 14 arquivos) -- exibe no canto inferior direito por padrao
   - Arquivos: Evaluations, StationDetail, ActivityPage, Settings, Login, Register, ManageLandingPage, ImageLibraryPage, ManageContent, UnsentLetterActivity, ForumBoard, ReconciliationReportActivity, DeletionRequestButton, LandingSectionForm, ImageLibrary, JourneyForm
   
2. **Shadcn/Radix Toast** (usado em 4 arquivos) -- exibe no canto inferior direito
   - Arquivos: JourneyDetail, UsersPage, SupportPage, ActivityManager

## Mudancas planejadas

### 1. Sonner -- `src/components/ui/sonner.tsx`
- Adicionar `position="top-center"` ao componente `<Sonner>` para centralizar na parte superior da tela
- Adicionar `closeButton={true}` para exibir botao de fechar visivel em cada notificacao

### 2. Shadcn Toaster -- `src/components/ui/toaster.tsx`
- Alterar as classes CSS do `<ToastViewport>` para posicionar centralizado no topo da tela em vez do canto inferior direito
- Substituir `sm:bottom-0 sm:right-0 sm:top-auto` por classes centralizadas como `top-0 left-1/2 -translate-x-1/2`

### Nenhuma alteracao necessaria nos 18 arquivos que chamam toast
As mudancas sao exclusivamente nos dois componentes de configuracao global. Todos os `toast.success()`, `toast.error()` e `toast({...})` espalhados pelo projeto continuarao funcionando normalmente, apenas com a nova posicao e botao de fechar.

