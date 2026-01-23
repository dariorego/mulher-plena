import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BookOpen, Layers, FileText, Plus, Loader2 } from 'lucide-react';
import { Journey } from '@/types';
import { JourneyForm } from '@/components/admin/JourneyForm';
import { JourneyCard } from '@/components/admin/JourneyCard';
import { toast } from 'sonner';

export default function ManageContent() {
  const { user } = useAuth();
  const { journeys, stations, activities, addJourney, updateJourney, deleteJourney, isLoading } = useData();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [deletingJourney, setDeletingJourney] = useState<Journey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user || user.role !== 'admin') return null;

  const handleCreateJourney = async (data: { title: string; description?: string; cover_image?: string; order_index: number }) => {
    try {
      await addJourney(data);
      toast.success('Jornada criada com sucesso!');
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Erro ao criar jornada');
      throw error;
    }
  };

  const handleUpdateJourney = async (data: { title: string; description?: string; cover_image?: string; order_index: number }) => {
    if (!editingJourney) return;
    try {
      await updateJourney(editingJourney.id, data);
      toast.success('Jornada atualizada com sucesso!');
      setEditingJourney(null);
    } catch (error) {
      toast.error('Erro ao atualizar jornada');
      throw error;
    }
  };

  const handleDeleteJourney = async () => {
    if (!deletingJourney) return;
    setIsDeleting(true);
    try {
      await deleteJourney(deletingJourney.id);
      toast.success('Jornada excluída com sucesso!');
      setDeletingJourney(null);
    } catch (error) {
      toast.error('Erro ao excluir jornada');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStationCount = (journeyId: string) => {
    return stations.filter(s => s.journey_id === journeyId).length;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Conteúdo</h1>
            <p className="text-muted-foreground">Gerencie jornadas, estações e atividades</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Jornadas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journeys.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estações</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Journeys Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jornadas</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Jornada
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : journeys.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Nenhuma jornada cadastrada</p>
                <Button onClick={() => setIsFormOpen(true)} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira jornada
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...journeys].sort((a, b) => a.order_index - b.order_index).map(journey => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    stationCount={getStationCount(journey.id)}
                    onEdit={setEditingJourney}
                    onDelete={setDeletingJourney}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Journey Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Jornada</DialogTitle>
          </DialogHeader>
          <JourneyForm
            onSubmit={handleCreateJourney}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Journey Dialog */}
      <Dialog open={!!editingJourney} onOpenChange={(open) => !open && setEditingJourney(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Jornada</DialogTitle>
          </DialogHeader>
          {editingJourney && (
            <JourneyForm
              journey={editingJourney}
              onSubmit={handleUpdateJourney}
              onCancel={() => setEditingJourney(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingJourney} onOpenChange={(open) => !open && setDeletingJourney(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Jornada</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a jornada "{deletingJourney?.title}"? 
              Esta ação não pode ser desfeita e todas as estações e atividades vinculadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJourney}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
