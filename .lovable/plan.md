
# Banco de Imagens Reutilizáveis

## Objetivo
Criar um sistema que permite selecionar imagens já existentes no repositório (tanto locais quanto do Supabase Storage) em vez de fazer upload repetido das mesmas imagens.

## Situação Atual

Atualmente existem:
- **Imagens locais** em `src/assets/`: `activity-button.png`, `atividade-title.png`, `bg-login.png`, `video-aula-title.png`
- **Imagens no Supabase Storage** em buckets: `journey-covers`, `station-images`, `landing-images`
- **Nenhuma interface** para reutilizar imagens existentes - sempre é necessário fazer novo upload

## Solução Proposta

### 1. Criar Componente de Seleção de Imagens

Criar um componente `ImageLibrary` que exibe:
- **Aba "Biblioteca"**: Lista imagens já enviadas ao Supabase Storage
- **Aba "Upload"**: Mantém a opção de enviar nova imagem
- Grid visual com miniaturas para seleção rápida

### 2. Arquivos a Criar

**`src/components/admin/ImageLibrary.tsx`**
- Modal/Dialog com duas abas: "Biblioteca" e "Upload Novo"
- Busca imagens de todos os buckets do Supabase
- Grid responsivo com preview das imagens
- Campo de busca/filtro por nome
- Callback `onSelect` para retornar a URL escolhida

**`src/hooks/useStorageImages.ts`**
- Hook para listar imagens de buckets do Supabase
- Cache das imagens para performance
- Função de refresh

### 3. Arquivos a Modificar

**`src/components/admin/JourneyForm.tsx`**
- Adicionar botão "Escolher da Biblioteca" ao lado do upload
- Integrar com o novo componente `ImageLibrary`

**`src/components/admin/StationForm.tsx`**
- Mesmo tratamento para imagens de topo e card

**`src/components/admin/LandingSectionForm.tsx`**
- Mesmo tratamento para imagens de seção

### 4. Fluxo de Uso

```text
┌─────────────────────────────────────────┐
│         Área de Imagem no Form          │
├─────────────────────────────────────────┤
│  [Fazer Upload]  [Escolher da Biblioteca]│
└─────────────────────────────────────────┘
              │
              ▼ (ao clicar "Escolher da Biblioteca")
┌─────────────────────────────────────────┐
│          Modal: Banco de Imagens        │
├─────────────────────────────────────────┤
│  [Biblioteca]  [Upload Novo]            │
├─────────────────────────────────────────┤
│  🔍 Buscar...                           │
├─────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │           │
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

## Detalhes Técnicos

### Hook useStorageImages

```typescript
// Busca imagens de múltiplos buckets
const buckets = ['journey-covers', 'station-images', 'landing-images'];

// Para cada bucket, lista os arquivos
const { data } = await supabase.storage.from(bucket).list();

// Gera URLs públicas
const publicUrl = supabase.storage.from(bucket).getPublicUrl(file.name);
```

### Componente ImageLibrary

- Usa `Dialog` do Radix UI
- `Tabs` para alternar entre Biblioteca e Upload
- Grid com `aspect-ratio` quadrado para miniaturas
- Indicador de seleção (borda colorida)
- Loading skeleton durante carregamento

### Integração nos Forms

```tsx
// Adicionar estado
const [isLibraryOpen, setIsLibraryOpen] = useState(false);

// Adicionar botões
<div className="flex gap-2">
  <Button onClick={() => fileInputRef.current?.click()}>
    Upload
  </Button>
  <Button variant="outline" onClick={() => setIsLibraryOpen(true)}>
    Biblioteca
  </Button>
</div>

// Adicionar modal
<ImageLibrary
  open={isLibraryOpen}
  onOpenChange={setIsLibraryOpen}
  onSelect={(url) => {
    setImageUrl(url);
    setIsLibraryOpen(false);
  }}
/>
```

## Resumo das Alterações

| Arquivo | Ação |
|---------|------|
| `src/hooks/useStorageImages.ts` | Criar |
| `src/components/admin/ImageLibrary.tsx` | Criar |
| `src/components/admin/JourneyForm.tsx` | Modificar |
| `src/components/admin/StationForm.tsx` | Modificar |
| `src/components/admin/LandingSectionForm.tsx` | Modificar |

## Benefícios

- Reutilização de imagens existentes sem upload duplicado
- Interface visual para navegar pelas imagens disponíveis
- Economia de espaço no storage
- Consistência visual ao usar mesmas imagens em diferentes lugares
