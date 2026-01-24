import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StationForm } from '@/components/admin/StationForm';
import { StationCard } from '@/components/admin/StationCard';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useFontSize } from '@/contexts/FontSizeContext';
import { Station } from '@/types';
import { ArrowLeft, Play, CheckCircle, Circle, FileText, Upload, PenLine, Gamepad2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const activityIcons = {
  quiz: FileText,
  upload: Upload,
  essay: PenLine,
  gamified: Gamepad2,
};

const activityLabels = {
  quiz: 'Quiz',
  upload: 'Upload',
  essay: 'Dissertativo',
  gamified: 'Gamificado',
};

export default function JourneyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { journeys, stations, activities, submissions, getJourneyProgress, addStation, updateStation, deleteStation, addActivity, updateActivity, deleteActivity } = useData();
  const navigate = useNavigate();

  const [isStationFormOpen, setIsStationFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deletingStation, setDeletingStation] = useState<Station | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { sizeClass: fontSizeClass } = useFontSize();

  if (!user || !id) return null;

  const journey = journeys.find(j => j.id === id);
  if (!journey) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Jornada não encontrada</h2>
          <Link to="/jornadas">
            <Button variant="link">Voltar para jornadas</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const journeyStations = stations
    .filter(s => s.journey_id === journey.id)
    .sort((a, b) => a.order_index - b.order_index);

  const progress = user.role === 'aluno' ? getJourneyProgress(user.id, journey.id) : 0;

  const isActivityCompleted = (activityId: string) => {
    return submissions.some(s => s.activity_id === activityId && s.user_id === user.id);
  };

  const getActivityCount = (stationId: string) => {
    return activities.filter(a => a.station_id === stationId).length;
  };

  const handleCreateStation = async (data: Omit<Station, 'id' | 'created_at'>) => {
    const result = await addStation(data);
    if (result) {
      toast({ title: 'Estação criada com sucesso!' });
      setIsStationFormOpen(false);
    } else {
      toast({ title: 'Erro ao criar estação', variant: 'destructive' });
    }
  };

  const handleUpdateStation = async (data: Omit<Station, 'id' | 'created_at'>) => {
    if (!editingStation) return;
    await updateStation(editingStation.id, data);
    toast({ title: 'Estação atualizada com sucesso!' });
    setEditingStation(null);
  };

  const handleDeleteStation = async () => {
    if (!deletingStation) return;
    setIsDeleting(true);
    await deleteStation(deletingStation.id);
    toast({ title: 'Estação excluída com sucesso!' });
    setDeletingStation(null);
    setIsDeleting(false);
  };

  const isAdmin = user.role === 'admin';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/jornadas">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Cover Image - Full Width Banner */}
        <div className="w-full overflow-hidden rounded-xl">
          <img
            src={journey.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'}
            alt={journey.title}
            className="w-full h-auto object-cover"
            style={{ aspectRatio: '1293/253' }}
          />
        </div>

        {/* Title, Description & Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{journey.title}</h1>
              <FontSizeControl />
            </div>
            <div 
              className={`text-muted-foreground leading-relaxed prose prose-sm max-w-none ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: journey.description || '' }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estações</span>
                  <span className="font-medium">{journeyStations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Atividades</span>
                  <span className="font-medium">
                    {activities.filter(a => journeyStations.some(s => s.id === a.station_id)).length}
                  </span>
                </div>
              </div>

              {user.role === 'aluno' && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Seu Progresso</span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Estações</h2>
            {isAdmin && (
              <Button onClick={() => setIsStationFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Estação
              </Button>
            )}
          </div>

          {/* Admin Station Management View */}
          {isAdmin && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {journeyStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  activityCount={getActivityCount(station.id)}
                  onEdit={setEditingStation}
                  onDelete={setDeletingStation}
                />
              ))}
              {journeyStations.length === 0 && (
                <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Nenhuma estação cadastrada.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsStationFormOpen(true)}
                    className="mt-2"
                  >
                    Criar primeira estação
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Student/Professor View */}
          {!isAdmin && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {journeyStations.map((station, index) => {
                const stationActivities = activities.filter(a => a.station_id === station.id);

                return (
                  <Card 
                    key={station.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/estacao/${station.id}`)}
                  >
                    <div className="flex flex-col">
                      {/* Station Image - Complete */}
                      <div className="relative bg-muted">
                        {station.card_image_url ? (
                          <img
                            src={station.card_image_url}
                            alt={station.title}
                            className="w-full h-auto object-contain"
                          />
                        ) : station.image_url ? (
                          <img
                            src={station.image_url}
                            alt={station.title}
                            className="w-full h-auto object-contain"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <Play className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Content - Only title and activity count */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{station.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {stationActivities.length} {stationActivities.length === 1 ? 'atividade' : 'atividades'}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
              {journeyStations.length === 0 && (
                <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Nenhuma estação disponível.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Station Dialog */}
      <Dialog open={isStationFormOpen} onOpenChange={setIsStationFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Estação</DialogTitle>
          </DialogHeader>
          <StationForm
            journeyId={journey.id}
            onSubmit={handleCreateStation}
            onCancel={() => setIsStationFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Station Dialog */}
      <Dialog open={!!editingStation} onOpenChange={() => setEditingStation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Estação</DialogTitle>
          </DialogHeader>
          {editingStation && (
            <StationForm
              journeyId={journey.id}
              station={editingStation}
              activities={activities}
              onSubmit={handleUpdateStation}
              onCancel={() => setEditingStation(null)}
              onAddActivity={addActivity}
              onUpdateActivity={updateActivity}
              onDeleteActivity={deleteActivity}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Station Confirmation */}
      <AlertDialog open={!!deletingStation} onOpenChange={() => setDeletingStation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Estação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a estação "{deletingStation?.title}"? 
              Esta ação não pode ser desfeita e todas as atividades associadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
