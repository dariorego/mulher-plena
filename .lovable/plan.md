
## Alteração de Textos no Menu de Navegação

### Objetivo
Atualizar os labels do menu de navegação do administrador no grupo "Edição".

### Mudanças Necessárias

| Local | Texto Atual | Novo Texto |
|-------|-------------|------------|
| Edição → Jornadas | `Jornadas` | `Editar Conteúdo da Jornada` |
| Edição → Gerenciar Conteúdo | `Gerenciar Conteúdo` | `Editar a Jornada` |

### Arquivo a ser Modificado
- `src/components/layout/AppLayout.tsx`

### Detalhes Técnicos
Alteração nas linhas 74-75 do arquivo:

```typescript
// De:
{ path: '/jornadas', label: 'Jornadas', icon: BookOpen },
{ path: '/gerenciar', label: 'Gerenciar Conteúdo', icon: GraduationCap },

// Para:
{ path: '/jornadas', label: 'Editar Conteúdo da Jornada', icon: BookOpen },
{ path: '/gerenciar', label: 'Editar a Jornada', icon: GraduationCap },
```

### Impacto
- Menu desktop: dropdown "Edição" exibirá os novos textos
- Menu mobile: acordeão "Edição" exibirá os novos textos
- Nenhuma alteração em rotas ou funcionalidades

### Observação
Os labels para usuários "aluno" e "professor" permanecerão como "Jornadas" (linha 60 e 65), pois a alteração é apenas para o menu do administrador.
