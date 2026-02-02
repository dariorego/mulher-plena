import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings as SettingsIcon, Eye, MessageSquare, BarChart3, Film, FileText, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { 
    showScoreToStudents, 
    showFeedbackToStudents, 
    videoPercentage,
    activityPercentage,
    supplementaryPercentage,
    updateSettings 
  } = useSettings();

  const [localVideo, setLocalVideo] = useState(videoPercentage);
  const [localActivity, setLocalActivity] = useState(activityPercentage);
  const [localSupplementary, setLocalSupplementary] = useState(supplementaryPercentage);

  useEffect(() => {
    setLocalVideo(videoPercentage);
    setLocalActivity(activityPercentage);
    setLocalSupplementary(supplementaryPercentage);
  }, [videoPercentage, activityPercentage, supplementaryPercentage]);

  const total = localVideo + localActivity + localSupplementary;
  const isValid = total === 100;

  const handleScoreToggle = (checked: boolean) => {
    updateSettings({ showScoreToStudents: checked });
    toast.success(checked ? 'Notas visíveis para participantes' : 'Notas ocultas para participantes');
  };

  const handleFeedbackToggle = (checked: boolean) => {
    updateSettings({ showFeedbackToStudents: checked });
    toast.success(checked ? 'Feedback visível para participantes' : 'Feedback oculto para participantes');
  };

  const handlePercentageChange = (field: 'video' | 'activity' | 'supplementary', value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    
    if (field === 'video') setLocalVideo(numValue);
    if (field === 'activity') setLocalActivity(numValue);
    if (field === 'supplementary') setLocalSupplementary(numValue);
  };

  const handlePercentageBlur = () => {
    const newTotal = localVideo + localActivity + localSupplementary;
    if (newTotal === 100) {
      updateSettings({
        videoPercentage: localVideo,
        activityPercentage: localActivity,
        supplementaryPercentage: localSupplementary,
      });
      toast.success('Percentuais de conclusão salvos');
    }
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Percentual Conclusão Estações
            </CardTitle>
            <CardDescription>
              Defina o peso de cada etapa no cálculo do progresso da estação. A soma deve ser exatamente 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Film className="h-5 w-5 text-primary" />
                  <Label htmlFor="video-percentage" className="text-base font-medium">
                    Vídeo
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="video-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={localVideo}
                    onChange={(e) => handlePercentageChange('video', e.target.value)}
                    onBlur={handlePercentageBlur}
                    className="w-20 text-center"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label htmlFor="activity-percentage" className="text-base font-medium">
                    Atividade
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="activity-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={localActivity}
                    onChange={(e) => handlePercentageChange('activity', e.target.value)}
                    onBlur={handlePercentageBlur}
                    className="w-20 text-center"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Label htmlFor="supplementary-percentage" className="text-base font-medium">
                    Material Complementar
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="supplementary-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={localSupplementary}
                    onChange={(e) => handlePercentageChange('supplementary', e.target.value)}
                    onBlur={handlePercentageBlur}
                    className="w-20 text-center"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className={`flex items-center justify-between p-3 rounded-lg ${isValid ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2">
                {isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  Total: {total}%
                </span>
              </div>
              <span className={`text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isValid ? 'Configuração válida' : 'A soma deve ser 100%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
