import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { supabase } from '@/integrations/supabase/client';
import { Journey } from '@/types';
import { ImagePlus, Loader2, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { ImageLibrary } from './ImageLibrary';

const journeySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
  order_index: z.coerce.number().min(0, 'Ordem deve ser um número positivo'),
});

type JourneyFormData = z.infer<typeof journeySchema>;

interface JourneyFormProps {
  journey?: Journey | null;
  onSubmit: (data: { title: string; description?: string; cover_image?: string; order_index: number }) => Promise<void>;
  onCancel: () => void;
}

export function JourneyForm({ journey, onSubmit, onCancel }: JourneyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(journey?.cover_image || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(journey?.cover_image || null);
  const [description, setDescription] = useState(journey?.description || '');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JourneyFormData>({
    resolver: zodResolver(journeySchema),
    defaultValues: {
      title: journey?.title || '',
      order_index: journey?.order_index ?? 0,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('journey-covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('journey-covers')
        .getPublicUrl(fileName);

      setCoverImage(publicUrl);
      toast.success('Imagem carregada com sucesso');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar imagem');
      setPreviewUrl(journey?.cover_image || null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
  };

  const onFormSubmit = async (data: JourneyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: data.title,
        description: description || undefined,
        cover_image: coverImage || undefined,
        order_index: data.order_index,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Imagem de Capa</Label>
        <div className="flex items-start gap-4">
          {previewUrl ? (
            <div className="relative group w-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full object-cover rounded-lg border border-border"
                style={{ aspectRatio: '1293/253' }}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-1 rounded cursor-pointer hover:bg-background transition-colors">
                Alterar imagem
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <label 
                className="w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors py-6"
                style={{ aspectRatio: '1293/253' }}
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Adicionar capa (1293x253)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLibraryOpen(true)}
              >
                <Image className="h-4 w-4 mr-2" />
                Escolher da Galeria
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Library Modal */}
      <ImageLibrary
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelect={(url) => {
          setCoverImage(url);
          setPreviewUrl(url);
          setIsLibraryOpen(false);
        }}
        uploadBucket="journey-covers"
      />

      {/* Title and Order */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Nome da jornada"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="order_index">Ordem</Label>
          <Input
            id="order_index"
            type="number"
            min="0"
            {...register('order_index')}
            placeholder="0"
          />
          {errors.order_index && (
            <p className="text-sm text-destructive">{errors.order_index.message}</p>
          )}
        </div>
      </div>

      {/* Description with Rich Text Editor */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Descreva a jornada..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {journey ? 'Salvar Alterações' : 'Criar Jornada'}
        </Button>
      </div>
    </form>
  );
}
