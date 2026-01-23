

# Exclusao de Imagens da Galeria + Placeholder Padrao

## Objetivo
Adicionar a opcao de excluir imagens diretamente da galeria e mostrar um icone/placeholder padrao quando nao houver imagem selecionada nos formularios.

## O que sera implementado

### 1. Botao de Excluir na Galeria de Imagens

Cada imagem na galeria tera um botao de exclusao (X vermelho) que aparece ao passar o mouse. Ao clicar:
- Mostra dialogo de confirmacao para evitar exclusoes acidentais
- Remove a imagem do Supabase Storage
- Atualiza a lista automaticamente

### 2. Placeholder Padrao nos Formularios

Quando nao houver imagem selecionada, os formularios mostrarao um icone de imagem padrao em vez de apenas a area tracejada de upload.

## Arquivos a Modificar

### `src/components/admin/ImageLibrary.tsx`

Adicionar:
- Estado `deleting` para controlar loading da exclusao
- Estado `imageToDelete` para armazenar imagem selecionada para exclusao
- Botao de exclusao (X) em cada imagem no grid, visivel no hover
- Dialog de confirmacao antes de excluir
- Funcao `handleDelete` que:
  - Extrai o nome do arquivo e bucket da URL
  - Chama `supabase.storage.from(bucket).remove([fileName])`
  - Atualiza a lista com `refresh()`
  - Mostra toast de sucesso/erro

### `src/hooks/useStorageImages.ts`

Adicionar:
- Funcao `deleteImage` que recebe URL e bucket
- Extrai o path do arquivo da URL
- Remove do Supabase Storage

## Fluxo Visual

```text
┌────────────────────────────────────────────────────────┐
│                  Galeria de Imagens                    │
├────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   [X]        │  │              │  │              │ │
│  │              │  │              │  │              │ │
│  │   imagem1    │  │   imagem2    │  │   imagem3    │ │
│  │              │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                        │
│  O botao [X] aparece ao passar o mouse sobre a imagem  │
└────────────────────────────────────────────────────────┘
                         │
                         ▼ (ao clicar em [X])
┌────────────────────────────────────────────────────────┐
│              Confirmar Exclusao                        │
├────────────────────────────────────────────────────────┤
│  Tem certeza que deseja excluir esta imagem?           │
│                                                        │
│  Esta acao nao pode ser desfeita. A imagem sera        │
│  removida permanentemente do armazenamento.            │
│                                                        │
│                          [Cancelar]  [Excluir]         │
└────────────────────────────────────────────────────────┘
```

## Detalhes Tecnicos

### Funcao de Exclusao no Hook

```typescript
const deleteImage = async (imageUrl: string, bucket: string) => {
  // Extrai o path do arquivo da URL publica
  // Ex: https://xxx.supabase.co/storage/v1/object/public/bucket/file.jpg
  // -> file.jpg
  const urlParts = imageUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);
    
  if (error) throw error;
};
```

### Dialog de Confirmacao

Usar o componente `AlertDialog` ja existente no projeto para confirmar a exclusao:

```tsx
<AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir esta imagem? 
        Esta acao nao pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Botao de Exclusao no Grid

```tsx
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation(); // Evita selecionar a imagem
    setImageToDelete(image);
  }}
  className="absolute top-1 right-1 bg-destructive text-destructive-foreground 
             rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
             hover:bg-destructive/90"
>
  <Trash2 className="h-3 w-3" />
</button>
```

## Consideracoes de Seguranca

- A exclusao e permanente (nao ha lixeira)
- Dialog de confirmacao obrigatorio antes de excluir
- Toast de feedback apos exclusao (sucesso ou erro)
- Se a imagem excluida estava selecionada, limpa a selecao

## Resumo das Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/hooks/useStorageImages.ts` | Modificar | Adicionar funcao `deleteImage` |
| `src/components/admin/ImageLibrary.tsx` | Modificar | Adicionar botao de exclusao, dialog de confirmacao e logica de delete |

## Beneficios

- Gerenciamento completo das imagens diretamente na galeria
- Limpeza de imagens nao utilizadas para economizar espaco
- Interface intuitiva com confirmacao de seguranca
- Feedback visual claro do estado da operacao

