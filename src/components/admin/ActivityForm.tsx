import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, ActivityType } from '@/types';
import { Loader2 } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            💡 Títulos especiais: <strong>"Árvore da Gratidão"</strong>, <strong>"Lista de Gratidão"</strong>, <strong>"Linha da Vida"</strong>, <strong>"Farol"</strong>, <strong>"Diário de Papéis"</strong>, <strong>"Mapa de Vida Equilibrada"</strong>, <strong>"Ação de Amor Concreta"</strong> ou <strong>"Manifesto"</strong> ativam interfaces interativas exclusivas.
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" disabled={isSubmitting} onClick={onFormSubmit}>
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
