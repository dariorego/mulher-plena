import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { EventCard } from '@/components/calendar/EventCard';
import { EventForm } from '@/components/calendar/EventForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Calendar } from 'lucide-react';
import { ScheduledEvent } from '@/types';
import { isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';

export default function CalendarPage() {
  const { user } = useAuth();
  const { scheduledEvents, journeys, addScheduledEvent, updateScheduledEvent, deleteScheduledEvent } = useData();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ScheduledEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredEvents = selectedDate
    ? scheduledEvents.filter((event) => isSameDay(new Date(event.event_date), selectedDate))
    : scheduledEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const handleSubmit = async (data: Omit<ScheduledEvent, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      if (editingEvent) {
        await updateScheduledEvent(editingEvent.id, data);
      } else {
        await addScheduledEvent(data);
      }
      setIsFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: ScheduledEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    
    try {
      await deleteScheduledEvent(deletingEvent.id);
      setDeletingEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleOpenNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              Calendário de Eventos
            </h1>
            <p className="text-muted-foreground">Gerencie os eventos e encontros agendados</p>
          </div>
          <Button onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <div>
            <EventCalendar
              events={scheduledEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            {selectedDate && (
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setSelectedDate(undefined)}
              >
                Limpar filtro
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Eventos em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                  : 'Todos os Eventos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {selectedDate ? 'Nenhum evento nesta data' : 'Nenhum evento agendado'}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      journeys={journeys}
                      showActions
                      onEdit={handleEdit}
                      onDelete={setDeletingEvent}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            journeys={journeys}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
            }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{deletingEvent?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
