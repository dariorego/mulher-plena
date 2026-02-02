import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScheduledEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  event_date: z.date({ required_error: 'Data é obrigatória' }),
  event_time: z.string().min(1, 'Hora é obrigatória'),
  duration_minutes: z.number().min(15, 'Mínimo 15 minutos'),
  meeting_link: z.string().url('URL inválida').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: ScheduledEvent | null;
  onSubmit: (data: Omit<ScheduledEvent, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const durationOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
];

export function EventForm({ event, onSubmit, onCancel, isLoading }: EventFormProps) {
  const eventDate = event ? new Date(event.event_date) : undefined;
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      event_date: eventDate,
      event_time: eventDate ? format(eventDate, 'HH:mm') : '',
      duration_minutes: event?.duration_minutes || 60,
      meeting_link: event?.meeting_link || '',
    },
  });

  const handleSubmit = (data: EventFormData) => {
    const [hours, minutes] = data.event_time.split(':').map(Number);
    const eventDateTime = new Date(data.event_date);
    eventDateTime.setHours(hours, minutes, 0, 0);

    onSubmit({
      title: data.title,
      description: data.description || undefined,
      event_date: eventDateTime.toISOString(),
      duration_minutes: data.duration_minutes,
      meeting_link: data.meeting_link || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição do evento" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecionar data'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={ptBR}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração *</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meeting_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link de Acesso (Meet/Teams)</FormLabel>
              <FormControl>
                <Input placeholder="https://meet.google.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : event ? 'Atualizar' : 'Criar Evento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
