import { ScheduledEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink, Video } from 'lucide-react';
import { format, isFuture, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingEventsProps {
  events: ScheduledEvent[];
  maxEvents?: number;
}

export function UpcomingEvents({ events, maxEvents = 5 }: UpcomingEventsProps) {
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.event_date);
      return isFuture(eventDate) || isToday(eventDate);
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, maxEvents);

  const getDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  };

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum evento agendado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => {
          const eventDate = new Date(event.event_date);
          const eventIsToday = isToday(eventDate);

          return (
            <div
              key={event.id}
              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
                <span className="text-xs text-muted-foreground uppercase">
                  {format(eventDate, 'MMM', { locale: ptBR })}
                </span>
                <span className={`text-2xl font-bold ${eventIsToday ? 'text-primary' : ''}`}>
                  {format(eventDate, 'dd')}
                </span>
                {eventIsToday && (
                  <span className="text-xs text-primary font-medium">Hoje</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold truncate">{event.title}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(eventDate, 'HH:mm')}
                  </span>
                  <span>({getDurationLabel(event.duration_minutes)})</span>
                </div>
                
                {event.meeting_link && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 gap-1 text-primary"
                    asChild
                  >
                    <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Video className="h-3 w-3" />
                      Acessar reunião
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
