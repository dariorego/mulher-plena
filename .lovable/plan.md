

## Ajustar a largura da página de Estação para usar toda a área disponível

A página de detalhes da Estação atualmente está limitada a uma largura máxima de `max-w-4xl` (896px), enquanto a página de Jornada usa toda a largura disponível.

### Alteração Necessária

**Arquivo: `src/pages/StationDetail.tsx`**

Remover a restrição de largura `max-w-4xl mx-auto` do container principal para que a estação ocupe toda a largura, igual à jornada.

**Linha 111 - Alterar de:**
```tsx
<div className="space-y-8 max-w-4xl mx-auto">
```

**Para:**
```tsx
<div className="space-y-8">
```

### Resultado

A página da Estação passará a ocupar toda a largura disponível, mantendo o mesmo comportamento visual da página da Jornada.

