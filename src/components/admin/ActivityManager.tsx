import { useState } from 'react';
import { Activity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityForm } from './ActivityForm';
import { Plus, Edit2, Trash2, FileText, Upload, PenLine, Gamepad2, MessageSquare } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const activityIcons = {
  quiz: FileText,
  upload: Upload,
  essay: PenLine,
  gamified: Gamepad2,
  forum: MessageSquare,
};

const activityLabels = {
  quiz: 'Quiz',
  upload: 'Upload',
  essay: 'Dissertativo',
  gamified: 'Gamificado',
  forum: 'Fórum',
};

interface ActivityManagerProps {
  stationId: string;
  activities: Activity[];
  onAdd: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<Activity | null>;
  onUpdate: (id: string, activity: Partial<Activity>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ActivityManager({ stationId, activities, onAdd, onUpdate, onDelete }: ActivityManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async (data: Omit<Activity, 'id' | 'created_at'>) => {
    await onAdd(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: Omit<Activity, 'id' | 'created_at'>) => {
    if (!editingActivity) return;
    await onUpdate(editingActivity.id, data);
    setEditingActivity(null);
  };

  const handleDelete = async () => {
    if (!deletingActivity) return;
    setIsDeleting(true);
    await onDelete(deletingActivity.id);
    setDeletingActivity(null);
    setIsDeleting(false);
  };

  const stationActivities = activities.filter(a => a.station_id === stationId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Atividades da Estação</h3>
        {!showForm && !editingActivity && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="h-3 w-3" />
            Nova Atividade
          </Button>
        )}
      </div>

      {/* Activity List */}
      {stationActivities.length > 0 && (
        <div className="space-y-2">
          {stationActivities.map((activity) => {
            const Icon = activityIcons[activity.type] || PenLine;
            return (
              <Card key={activity.id} className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activityLabels[activity.type]} • {activity.points} pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingActivity(activity)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeletingActivity(activity)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {stationActivities.length === 0 && !showForm && (
        <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-sm text-muted-foreground mb-2">Nenhuma atividade cadastrada</p>
          <Button type="button" variant="link" size="sm" onClick={() => setShowForm(true)}>
            Adicionar primeira atividade
          </Button>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">Nova Atividade</h4>
            <ActivityForm
              stationId={stationId}
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingActivity && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">Editar Atividade</h4>
            <ActivityForm
              stationId={stationId}
              activity={editingActivity}
              onSubmit={handleUpdate}
              onCancel={() => setEditingActivity(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingActivity} onOpenChange={() => setDeletingActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Atividade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a atividade "{deletingActivity?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
