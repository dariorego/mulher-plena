import { ScheduledEvent, Journey } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink, Pencil, Trash2, Video, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: ScheduledEvent;
  journeys?: Journey[];
  showActions?: boolean;
  onEdit?: (event: ScheduledEvent) => void;
  onDelete?: (event: ScheduledEvent) => void;
}

export function EventCard({ event, journeys = [], showActions = false, onEdit, onDelete }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  
  const getDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getMeetingType = (link?: string) => {
    if (!link) return null;
    if (link.includes('meet.google')) return 'Google Meet';
    if (link.includes('teams.microsoft') || link.includes('teams.live')) return 'Microsoft Teams';
    if (link.includes('zoom')) return 'Zoom';
    return 'Link de Acesso';
  };

  const linkedJourney = event.journey_id 
    ? journeys.find(j => j.id === event.journey_id) 
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
              {linkedJourney && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {linkedJourney.title}
                </Badge>
              )}
            </div>
            
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(eventDate, 'HH:mm', { locale: ptBR })} ({getDurationLabel(event.duration_minutes)})</span>
              </div>
            </div>

            {event.meeting_link && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4" />
                  {getMeetingType(event.meeting_link)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onEdit?.(event)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete?.(event)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
