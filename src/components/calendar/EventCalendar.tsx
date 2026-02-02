import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ScheduledEvent } from '@/types';
import { isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCalendarProps {
  events: ScheduledEvent[];
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
}

export function EventCalendar({ events, onDateSelect, selectedDate }: EventCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  const eventDates = events.map((e) => new Date(e.event_date));

  const hasEventOnDate = (date: Date) => {
    return eventDates.some((eventDate) => isSameDay(eventDate, date));
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      month={month}
      onMonthChange={setMonth}
      locale={ptBR}
      className="rounded-md border pointer-events-auto"
      modifiers={{
        hasEvent: (date) => hasEventOnDate(date),
      }}
      modifiersStyles={{
        hasEvent: {
          fontWeight: 'bold',
          backgroundColor: 'hsl(var(--primary) / 0.15)',
          color: 'hsl(var(--primary))',
        },
      }}
    />
  );
}
