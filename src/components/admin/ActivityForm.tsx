import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, ActivityType } from '@/types';
import { Loader2, Music, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const activitySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  points: z.number().min(0, 'Pontos deve ser maior ou igual a 0'),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  stationId: string;
  activity?: Activity;
  onSubmit: (data: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'essay', label: 'Texto Dissertativo' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'upload', label: 'Upload de Arquivo' },
  { value: 'forum', label: 'Fórum/Mural' },
  { value: 'gamified', label: 'Gamificado' },
];

export function ActivityForm({ stationId, activity, onSubmit, onCancel }: ActivityFormProps) {
  const [activityType, setActivityType] = useState<ActivityType>(activity?.type || 'essay');
  const [isSensitive, setIsSensitive] = useState(activity?.is_sensitive || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>(activity?.audio_url || '');
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: activity?.title || '',
      description: activity?.description || '',
      points: activity?.points || 10,
    },
  });

  const uploadAudio = async (file: File) => {
    setUploadingAudio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `audio-${Date.now()}.${fileExt}`;
      const filePath = `${stationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-audios')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('activity-audios')
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

  const onFormSubmit = async () => {
    const isValid = await handleSubmit(async (data: ActivityFormData) => {
      setIsSubmitting(true);
      try {
        await onSubmit({
          station_id: stationId,
          title: data.title,
          description: data.description,
          type: activityType,
          points: data.points,
          audio_url: audioUrl || undefined,
          is_sensitive: isSensitive,
        });
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="activity-title">Título *</Label>
        <Input
          id="activity-title"
          {...register('title')}
          placeholder="Digite o título da atividade"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipo de Atividade *</Label>
        <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activityType === 'essay' && (
          <p className="text-xs text-muted-foreground">
            💡 Títulos especiais: <strong>"Árvore da Gratidão"</strong>, <strong>"Lista de Gratidão"</strong>, <strong>"Linha da Vida"</strong>, <strong>"Farol"</strong>, <strong>"Diário de Papéis"</strong>, <strong>"Mapa de Vida Equilibrada"</strong>, <strong>"Ação de Amor Concreta"</strong>, <strong>"Manifesto"</strong>, <strong>"Relato de Reconciliação"</strong>, <strong>"Carta de Compromisso"</strong>, <strong>"Registro de Situação Real"</strong> ou <strong>"Roda de Amor Consciente"</strong> ativam interfaces interativas exclusivas.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="activity-description">Descrição/Orientação</Label>
        <Textarea
          id="activity-description"
          {...register('description')}
          placeholder="Descreva a atividade ou forneça orientações..."
          rows={3}
        />
      </div>

      {/* Audio Upload */}
      <div className="space-y-2">
        <Label>Áudio da Atividade</Label>
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
            <label className="flex flex-col items-center justify-center h-20 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
              {uploadingAudio ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Music className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    Clique para fazer upload do áudio
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
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
          Áudio que será exibido na página da atividade (ex: mentalização guiada)
        </p>
      </div>

      {/* Points */}
      <div className="space-y-2">
        <Label htmlFor="activity-points">Pontos</Label>
        <Input
          id="activity-points"
          type="number"
          {...register('points', { valueAsNumber: true })}
          placeholder="10"
          className="w-24"
        />
        {errors.points && (
          <p className="text-sm text-destructive">{errors.points.message}</p>
        )}
      </div>

      {/* Sensitive Experience Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <Label htmlFor="is-sensitive" className="text-base font-medium">
              Experiência Sensível
            </Label>
            <p className="text-sm text-muted-foreground">
              Marque se esta atividade aborda temas que exigem cuidado emocional
            </p>
          </div>
        </div>
        <Switch
          id="is-sensitive"
          checked={isSensitive}
          onCheckedChange={setIsSensitive}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" disabled={isSubmitting || uploadingAudio} onClick={onFormSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : activity ? (
            'Atualizar'
          ) : (
            'Adicionar'
          )}
        </Button>
      </div>
    </div>
  );
}
