import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings as SettingsIcon, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { showScoreToStudents, showFeedbackToStudents, updateSettings } = useSettings();

  const handleScoreToggle = (checked: boolean) => {
    updateSettings({ showScoreToStudents: checked });
    toast.success(checked ? 'Notas visíveis para participantes' : 'Notas ocultas para participantes');
  };

  const handleFeedbackToggle = (checked: boolean) => {
    updateSettings({ showFeedbackToStudents: checked });
    toast.success(checked ? 'Feedback visível para participantes' : 'Feedback oculto para participantes');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Avaliação</CardTitle>
            <CardDescription>
              Controle o que os participantes podem visualizar após a correção das atividades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="show-score" className="text-base font-medium">
                    Exibir Nota para Participantes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando ativado, os participantes poderão ver suas notas após a avaliação
                  </p>
                </div>
              </div>
              <Switch
                id="show-score"
                checked={showScoreToStudents}
                onCheckedChange={handleScoreToggle}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="show-feedback" className="text-base font-medium">
                    Exibir Feedback para Participantes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando ativado, os participantes poderão ver o feedback do corretor
                  </p>
                </div>
              </div>
              <Switch
                id="show-feedback"
                checked={showFeedbackToStudents}
                onCheckedChange={handleFeedbackToggle}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
