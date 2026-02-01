
## Excluir Submissão de Atividade na Página de Avaliações

### Objetivo
Adicionar a funcionalidade para que professores e administradores possam excluir uma submissão de atividade, permitindo que o participante envie novamente.

### Mudanças Necessárias

#### 1. Backend - Nova Política RLS
Criar uma migração para permitir que professores e admins excluam submissões de qualquer usuário.

| Tabela | Ação | Permissão |
|--------|------|-----------|
| activity_submissions | DELETE | Professores e Admins podem excluir qualquer submissão |

#### 2. DataContext - Função de Exclusão
Adicionar uma função `deleteSubmission` no contexto de dados.

| Função | Parâmetros | Descrição |
|--------|------------|-----------|
| `deleteSubmission` | `id: string` | Remove a submissão do banco e atualiza o estado local |

#### 3. Interface - Página de Avaliações
Adicionar botões e confirmação de exclusão:

- **Botão de exclusão** nos cards de submissões (pendentes e avaliadas)
- **Modal de confirmação** usando AlertDialog antes de excluir
- **Feedback visual** com toast de sucesso/erro

### Arquivos a Modificar

```text
┌─────────────────────────────────────────────────────────────┐
│  1. Nova migração SQL                                       │
│     - Política RLS para DELETE por professores/admins       │
├─────────────────────────────────────────────────────────────┤
│  2. src/contexts/DataContext.tsx                            │
│     - Adicionar deleteSubmission na interface               │
│     - Implementar função de exclusão                        │
├─────────────────────────────────────────────────────────────┤
│  3. src/pages/Evaluations.tsx                               │
│     - Importar componentes AlertDialog e ícone Trash2       │
│     - Estado para controlar submissão sendo excluída        │
│     - Botão de excluir em cada card de submissão            │
│     - Modal de confirmação de exclusão                      │
│     - Função handleDelete com toast de feedback             │
└─────────────────────────────────────────────────────────────┘
```

### Detalhes Técnicos

**Nova política RLS:**
```sql
CREATE POLICY "Professors and admins can delete any submission"
ON public.activity_submissions
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'professor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);
```

**Função no DataContext:**
```typescript
const deleteSubmission = async (id: string) => {
  const { error } = await supabase
    .from('activity_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting submission:', error);
    throw error;
  }
  setSubmissions(prev => prev.filter(s => s.id !== id));
};
```

**Interface do botão (exemplo):**
- Ícone de lixeira (Trash2) com estilo destrutivo
- Ao clicar, abre AlertDialog com confirmação
- Exibe nome do participante e atividade para confirmar ação

### Fluxo de Uso

1. Professor/Admin acessa página de Avaliações
2. Visualiza submissão (pendente ou avaliada)
3. Clica no botão de excluir (ícone lixeira)
4. Modal de confirmação aparece com detalhes
5. Confirma exclusão
6. Submissão é removida e toast de sucesso é exibido
7. Participante pode enviar a atividade novamente

### Observações de Segurança
- A política RLS existente já permite que usuários excluam suas próprias submissões
- A nova política permite apenas professores e admins excluírem submissões de outros
- A função `has_role` é `SECURITY DEFINER`, evitando problemas de recursão RLS
