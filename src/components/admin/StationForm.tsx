import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Station, Activity, SupplementaryType } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Loader2, Music, Image } from 'lucide-react';
import { ImageLibrary } from './ImageLibrary';
import { ActivityManager } from './ActivityManager';
import { Separator } from '@/components/ui/separator';

const stationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  order_index: z.number().min(0, 'Ordem deve ser maior ou igual a 0'),
});

type StationFormData = z.infer<typeof stationSchema>;

interface StationFormProps {
  journeyId: string;
  station?: Station;
  activities?: Activity[];
  onSubmit: (data: Omit<Station, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  onAddActivity?: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<Activity | null>;
  onUpdateActivity?: (id: string, activity: Partial<Activity>) => Promise<void>;
  onDeleteActivity?: (id: string) => Promise<void>;
}

export function StationForm({ journeyId, station, activities = [], onSubmit, onCancel, onAddActivity, onUpdateActivity, onDeleteActivity }: StationFormProps) {
  const [topImageUrl, setTopImageUrl] = useState<string>(station?.image_url || '');
  const [cardImageUrl, setCardImageUrl] = useState<string>(station?.card_image_url || '');
  const [videoUrl, setVideoUrl] = useState<string>(station?.video_url || '');
  const [audioUrl, setAudioUrl] = useState<string>(station?.audio_url || '');
  const [supplementaryUrl, setSupplementaryUrl] = useState<string>(station?.supplementary_url || '');
  const [supplementaryType, setSupplementaryType] = useState<SupplementaryType>(station?.supplementary_type || 'video');
  const [uploadingTop, setUploadingTop] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(station?.description || '');
  const [readingSuggestion, setReadingSuggestion] = useState(station?.reading_suggestion || '');
  const [isTopLibraryOpen, setIsTopLibraryOpen] = useState(false);
  const [isCardLibraryOpen, setIsCardLibraryOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      title: station?.title || '',
      order_index: station?.order_index || 0,
    },
  });

  const uploadImage = async (file: File, type: 'top' | 'card') => {
    const setUploading = type === 'top' ? setUploadingTop : setUploadingCard;
    const setImageUrl = type === 'top' ? setTopImageUrl : setCardImageUrl;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${journeyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('station-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('station-images')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleTopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'top');
  };

  const handleCardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'card');
  };

  const uploadAudio = async (file: File) => {
    setUploadingAudio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `audio-${Date.now()}.${fileExt}`;
      const filePath = `${journeyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('station-audios')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('station-audios')
        .getPublicUrl(filePath);

      setAudioUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAudio(file);
  };

  const onFormSubmit = async (data: StationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        journey_id: journeyId,
        title: data.title,
        description: description || undefined,
        image_url: topImageUrl || undefined,
        card_image_url: cardImageUrl || undefined,
        video_url: videoUrl || undefined,
        audio_url: audioUrl || undefined,
        supplementary_url: supplementaryUrl || undefined,
        supplementary_type: supplementaryUrl ? supplementaryType : undefined,
        reading_suggestion: readingSuggestion || undefined,
        order_index: data.order_index,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Digite o título da estação"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Descrição</Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Digite a descrição da estação..."
        />
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="order_index">Ordem de Exibição</Label>
        <Input
          id="order_index"
          type="number"
          {...register('order_index', { valueAsNumber: true })}
          placeholder="0"
          className="w-32"
        />
        {errors.order_index && (
          <p className="text-sm text-destructive">{errors.order_index.message}</p>
        )}
      </div>

      {/* Top Image (Banner) */}
      <div className="space-y-2">
        <Label>Imagem de Topo (Banner 1293x253)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {topImageUrl ? (
            <div className="relative">
              <img
                src={topImageUrl}
                alt="Preview do banner"
                className="w-full rounded-lg"
                style={{ aspectRatio: '1293/253' }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setTopImageUrl('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <label className="flex flex-col items-center justify-center h-24 w-full cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
                {uploadingTop ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para fazer upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTopImageChange}
                  disabled={uploadingTop}
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTopLibraryOpen(true)}
              >
                <Image className="h-4 w-4 mr-2" />
                Escolher da Galeria
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Top Image Library Modal */}
      <ImageLibrary
        open={isTopLibraryOpen}
        onOpenChange={setIsTopLibraryOpen}
        onSelect={(url) => {
          setTopImageUrl(url);
          setIsTopLibraryOpen(false);
        }}
        uploadBucket="station-images"
      />

      {/* Card Image */}
      <div className="space-y-2">
        <Label>Imagem do Card (mostrada na jornada)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {cardImageUrl ? (
            <div className="relative w-fit">
              <img
                src={cardImageUrl}
                alt="Preview do card"
                className="max-w-[200px] rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setCardImageUrl('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <label className="flex flex-col items-center justify-center h-32 w-48 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
                {uploadingCard ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Clique para fazer upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCardImageChange}
                  disabled={uploadingCard}
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCardLibraryOpen(true)}
              >
                <Image className="h-4 w-4 mr-2" />
                Escolher da Galeria
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Card Image Library Modal */}
      <ImageLibrary
        open={isCardLibraryOpen}
        onOpenChange={setIsCardLibraryOpen}
        onSelect={(url) => {
          setCardImageUrl(url);
          setIsCardLibraryOpen(false);
        }}
        uploadBucket="station-images"
      />

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="video_url">URL do Vídeo (YouTube/Vimeo)</Label>
        <Input
          id="video_url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Cole o link do YouTube ou Vimeo para exibir o vídeo da aula
        </p>
      </div>

      {/* Audio Upload */}
      <div className="space-y-2">
        <Label>Áudio da Estação</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {audioUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-accent" />
                <audio src={audioUrl} controls className="flex-1 h-10" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => setAudioUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
              {uploadingAudio ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Music className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Clique para fazer upload do áudio
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, OGG (máx. 20MB)
                  </span>
                </>
              )}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioChange}
                disabled={uploadingAudio}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Áudio que será exibido após a atividade
        </p>
      </div>

      {/* Supplementary Material URL */}
      <div className="space-y-2">
        <Label htmlFor="supplementary_url">Material Complementar (Link)</Label>
        <Input
          id="supplementary_url"
          value={supplementaryUrl}
          onChange={(e) => setSupplementaryUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Link para material complementar (vídeo adicional, artigo, etc.)
        </p>
        {supplementaryUrl && (
          <div className="mt-3 space-y-2">
            <Label>Tipo do Material</Label>
            <Select value={supplementaryType} onValueChange={(v) => setSupplementaryType(v as SupplementaryType)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                <SelectItem value="article">Artigo / Link Externo</SelectItem>
                <SelectItem value="podcast">Podcast (Spotify)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Reading Suggestion */}
      <div className="space-y-2">
        <Label htmlFor="reading_suggestion">Sugestão de Leitura</Label>
        <Input
          id="reading_suggestion"
          value={readingSuggestion}
          onChange={(e) => setReadingSuggestion(e.target.value)}
          placeholder="Ex: Livro Universo Feminino, pp. 15-22"
        />
        <p className="text-xs text-muted-foreground">
          Texto exibido como sugestão de leitura na página da estação
        </p>
      </div>

      {/* Activities Section - Only shown when editing an existing station */}
      {station && onAddActivity && onUpdateActivity && onDeleteActivity && (
        <>
          <Separator className="my-6" />
          <ActivityManager
            stationId={station.id}
            activities={activities}
            onAdd={onAddActivity}
            onUpdate={onUpdateActivity}
            onDelete={onDeleteActivity}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || uploadingTop || uploadingCard || uploadingAudio}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : station ? (
            'Atualizar Estação'
          ) : (
            'Criar Estação'
          )}
        </Button>
      </div>
    </form>
  );
}
