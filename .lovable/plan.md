
# Galeria de Imagens - Implementação Completa

## Objetivo
Adicionar a opção de selecionar imagens da galeria (Supabase Storage) em **todos** os locais do sistema que possuem upload de fotos.

## Locais Identificados com Upload de Imagens

| Arquivo | Tipo de Imagem | Bucket |
|---------|----------------|--------|
| `JourneyForm.tsx` | Imagem de capa | `journey-covers` |
| `StationForm.tsx` | Imagem de topo (banner) | `station-images` |
| `StationForm.tsx` | Imagem do card | `station-images` |
| `LandingSectionForm.tsx` | Imagem da seção | `landing-images` |
| `VisionBoardCanvas.tsx` | Imagem do Vision Board | (atividade do aluno) |
| `ActivityPage.tsx` | Upload de atividade | (submissão do aluno) |

**Nota:** Os últimos dois são para uso dos alunos em atividades. A galeria administrativa será integrada nos 4 primeiros locais (formulários de admin).

## Arquivos a Criar

### 1. `src/hooks/useStorageImages.ts`
Hook para buscar imagens de múltiplos buckets do Supabase Storage:
- Lista arquivos dos buckets: `journey-covers`, `station-images`, `landing-images`
- Gera URLs públicas para cada imagem
- Retorna: lista de imagens, loading state, função de refresh

### 2. `src/components/admin/ImageLibrary.tsx`
Componente modal para seleção de imagens:
- Dialog com duas abas: "Biblioteca" e "Upload Novo"
- Grid responsivo com miniaturas das imagens
- Campo de busca/filtro por nome
- Indicador visual de seleção (borda colorida)
- Props: `open`, `onOpenChange`, `onSelect`, `bucket` (opcional para filtrar)

## Arquivos a Modificar

### 1. `src/components/admin/JourneyForm.tsx`
- Adicionar estado `isLibraryOpen`
- Adicionar botão "Galeria" ao lado da área de upload
- Integrar componente `ImageLibrary`
- Ao selecionar imagem: `setCoverImage(url)` e `setPreviewUrl(url)`

### 2. `src/components/admin/StationForm.tsx`
- Adicionar estados `isTopLibraryOpen` e `isCardLibraryOpen`
- Adicionar botão "Galeria" para **imagem de topo**
- Adicionar botão "Galeria" para **imagem do card**
- Integrar `ImageLibrary` para ambos os campos

### 3. `src/components/admin/LandingSectionForm.tsx`
- Adicionar estado `isLibraryOpen`
- Adicionar botão "Galeria" ao lado do upload
- Integrar componente `ImageLibrary`
- Ao selecionar: `setImageUrl(url)`

## Fluxo Visual

```text
┌─────────────────────────────────────────────────────┐
│              Área de Imagem no Form                 │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────┐                          │
│  │    [Preview/Upload]   │                          │
│  └──────────────────────┘                          │
│  [📷 Upload Novo]  [🖼️ Escolher da Galeria]        │
└─────────────────────────────────────────────────────┘
                    │
                    ▼ (ao clicar "Escolher da Galeria")
┌─────────────────────────────────────────────────────┐
│           Modal: Galeria de Imagens                 │
├─────────────────────────────────────────────────────┤
│  [Biblioteca]  [Upload Novo]                        │
├─────────────────────────────────────────────────────┤
│  🔍 Buscar por nome...                              │
├─────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │        │ │        │ │        │ │        │       │
│  │  img1  │ │  img2  │ │  img3  │ │  img4  │       │
│  │        │ │        │ │        │ │        │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │        │ │        │ │        │ │        │       │
│  │  img5  │ │  img6  │ │  img7  │ │  img8  │       │
│  │        │ │        │ │        │ │        │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────────────────┤
│                              [Cancelar] [Selecionar]│
└─────────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Hook useStorageImages

```typescript
const BUCKETS = ['journey-covers', 'station-images', 'landing-images'];

export function useStorageImages(bucketFilter?: string) {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = async () => {
    const allImages: StorageImage[] = [];
    const bucketsToFetch = bucketFilter ? [bucketFilter] : BUCKETS;
    
    for (const bucket of bucketsToFetch) {
      const { data, error } = await supabase.storage.from(bucket).list();
      if (data) {
        for (const file of data) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(file.name);
          allImages.push({ name: file.name, url: publicUrl, bucket });
        }
      }
    }
    setImages(allImages);
  };

  return { images, isLoading, refresh: fetchImages };
}
```

### Componente ImageLibrary

```typescript
interface ImageLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  bucket?: string; // Filtrar por bucket específico
}

// Estrutura:
// - Dialog com Tabs (Biblioteca / Upload)
// - Input de busca para filtrar por nome
// - Grid de imagens com hover e seleção
// - Botões Cancelar e Selecionar
```

### Integração nos Forms

```tsx
// Estado adicional
const [isLibraryOpen, setIsLibraryOpen] = useState(false);

// Botões lado a lado
<div className="flex gap-2 mt-2">
  <Button type="button" variant="outline" size="sm" onClick={triggerUpload}>
    <Upload className="h-4 w-4 mr-1" /> Upload
  </Button>
  <Button type="button" variant="outline" size="sm" onClick={() => setIsLibraryOpen(true)}>
    <Image className="h-4 w-4 mr-1" /> Galeria
  </Button>
</div>

// Modal no final do form
<ImageLibrary
  open={isLibraryOpen}
  onOpenChange={setIsLibraryOpen}
  onSelect={(url) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setIsLibraryOpen(false);
  }}
/>
```

## Resumo das Alterações

| Arquivo | Acao | Campos Afetados |
|---------|------|-----------------|
| `src/hooks/useStorageImages.ts` | **Criar** | - |
| `src/components/admin/ImageLibrary.tsx` | **Criar** | - |
| `src/components/admin/JourneyForm.tsx` | Modificar | Imagem de Capa |
| `src/components/admin/StationForm.tsx` | Modificar | Imagem de Topo, Imagem do Card |
| `src/components/admin/LandingSectionForm.tsx` | Modificar | Imagem da Secao |

## Beneficios

- Reutilizacao de imagens existentes sem upload duplicado
- Interface visual intuitiva para navegar pelas imagens
- Economia de espaco no storage
- Consistencia visual ao usar mesmas imagens em diferentes lugares
- Busca rapida por nome de arquivo
