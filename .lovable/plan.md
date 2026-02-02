
# Plano: Melhorar o Feedback de Exclusão de Atividade

## Resumo
A funcionalidade de exclusão de atividades já está implementada no código, mas pode estar faltando feedback visual adequado para o usuário. Vou adicionar mensagens de confirmação (toast) e garantir que o fluxo de exclusão funcione corretamente.

## O que já existe
- **Botão de excluir**: Presente no `ActivityManager.tsx` com ícone de lixeira
- **Diálogo de confirmação**: AlertDialog perguntando se deseja excluir
- **Função de exclusão**: `deleteActivity` no `DataContext.tsx` remove do Supabase e atualiza o estado
- **Políticas RLS**: Admins têm permissão total na tabela `activities`

## Alterações Propostas

### 1. Adicionar Toast de Confirmação no ActivityManager
Após a exclusão bem-sucedida, mostrar uma mensagem de sucesso para o usuário.

**Arquivo**: `src/components/admin/ActivityManager.tsx`
- Importar o hook `toast` de `@/hooks/use-toast`
- Adicionar toast de sucesso após `onDelete(deletingActivity.id)` com mensagem "Atividade excluída com sucesso!"
- Adicionar tratamento de erro com toast de falha

### 2. Melhorar Tratamento de Erros
Garantir que erros sejam capturados e exibidos ao usuário.

---

## Detalhes Técnicos

### Modificações no ActivityManager.tsx

```typescript
// Adicionar import
import { toast } from '@/hooks/use-toast';

// Modificar handleDelete
const handleDelete = async () => {
  if (!deletingActivity) return;
  setIsDeleting(true);
  try {
    await onDelete(deletingActivity.id);
    toast({ 
      title: 'Atividade excluída com sucesso!',
      description: `A atividade "${deletingActivity.title}" foi removida.`
    });
  } catch (error) {
    toast({ 
      title: 'Erro ao excluir atividade',
      variant: 'destructive'
    });
  } finally {
    setDeletingActivity(null);
    setIsDeleting(false);
  }
};
```

### Modificações no DataContext.tsx (Opcional)
Fazer a função `deleteActivity` lançar erro em caso de falha para permitir tratamento no componente.

```typescript
const deleteActivity = async (id: string) => {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting activity:', error);
    throw error; // Lançar erro para tratamento no componente
  }
  setActivities(prev => prev.filter(a => a.id !== id));
};
```

## Arquivos a Modificar
1. `src/components/admin/ActivityManager.tsx` - Adicionar toast de feedback
2. `src/contexts/DataContext.tsx` - Lançar erro em caso de falha (opcional)

## Teste Recomendado
1. Acesse como admin
2. Vá para uma jornada existente
3. Clique em "Editar" em uma estação
4. Na lista de atividades, clique no ícone de lixeira
5. Confirme no diálogo
6. Verifique se a atividade foi removida e o toast apareceu
