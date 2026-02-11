import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Eye, MessageSquare, BarChart3, Film, FileText, BookOpen, Headphones, CheckCircle, AlertCircle, AlertTriangle, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Settings() {
  const { 
    showScoreToStudents, 
    showFeedbackToStudents, 
    videoPercentage,
    activityPercentage,
    supplementaryPercentage,
    podcastPercentage,
    sensitiveContentMessage,
    loginBackgroundUrl,
    updateSettings 
  } = useSettings();

  const [localVideo, setLocalVideo] = useState(videoPercentage);
  const [localActivity, setLocalActivity] = useState(activityPercentage);
  const [localSupplementary, setLocalSupplementary] = useState(supplementaryPercentage);
  const [localPodcast, setLocalPodcast] = useState(podcastPercentage);
  const [localSensitiveMessage, setLocalSensitiveMessage] = useState(sensitiveContentMessage);

  useEffect(() => {
    setLocalVideo(videoPercentage);
    setLocalActivity(activityPercentage);
    setLocalSupplementary(supplementaryPercentage);
    setLocalPodcast(podcastPercentage);
  }, [videoPercentage, activityPercentage, supplementaryPercentage, podcastPercentage]);

  useEffect(() => {
    setLocalSensitiveMessage(sensitiveContentMessage);
  }, [sensitiveContentMessage]);

  const total = localVideo + localActivity + localSupplementary + localPodcast;
  const isValid = total === 100;

  const handleScoreToggle = (checked: boolean) => {
    updateSettings({ showScoreToStudents: checked });
    toast.success(checked ? 'Notas visíveis para participantes' : 'Notas ocultas para participantes');
  };

  const handleFeedbackToggle = (checked: boolean) => {
    updateSettings({ showFeedbackToStudents: checked });
    toast.success(checked ? 'Feedback visível para participantes' : 'Feedback oculto para participantes');
  };

  const handlePercentageChange = (field: 'video' | 'activity' | 'supplementary' | 'podcast', value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    
    if (field === 'video') setLocalVideo(numValue);
    if (field === 'activity') setLocalActivity(numValue);
    if (field === 'supplementary') setLocalSupplementary(numValue);
    if (field === 'podcast') setLocalPodcast(numValue);
  };

  const handlePercentageBlur = () => {
    const newTotal = localVideo + localActivity + localSupplementary + localPodcast;
    if (newTotal === 100) {
      updateSettings({
        videoPercentage: localVideo,
        activityPercentage: localActivity,
        supplementaryPercentage: localSupplementary,
        podcastPercentage: localPodcast,
      });
      toast.success('Percentuais de conclusão salvos');
    }
  };

  const handleLoginBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateSettings({ loginBackgroundUrl: dataUrl });
      toast.success('Imagem de fundo do login atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const removeLoginBg = () => {
    updateSettings({ loginBackgroundUrl: '' });
    toast.success('Imagem de fundo restaurada para o padrão');
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Headphones className="h-5 w-5 text-primary" />
                  <Label htmlFor="podcast-percentage" className="text-base font-medium">
                    Podcast
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="podcast-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={localPodcast}
                    onChange={(e) => handlePercentageChange('podcast', e.target.value)}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Experiência Sensível
            </CardTitle>
            <CardDescription>
              Configure a mensagem exibida quando uma atividade é marcada como experiência sensível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sensitive-message">Mensagem do aviso</Label>
              <Textarea
                id="sensitive-message"
                value={localSensitiveMessage}
                onChange={(e) => setLocalSensitiveMessage(e.target.value)}
                onBlur={() => {
                  if (localSensitiveMessage.trim()) {
                    updateSettings({ sensitiveContentMessage: localSensitiveMessage.trim() });
                    toast.success('Mensagem de experiência sensível salva');
                  }
                }}
                rows={4}
                placeholder="Digite a mensagem de aviso para atividades sensíveis..."
              />
              <p className="text-xs text-muted-foreground">
                Este texto será exibido no pop-up quando o participante clicar no aviso de experiência sensível
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Imagem de Fundo do Login
            </CardTitle>
            <CardDescription>
              Escolha uma imagem da galeria do seu dispositivo para personalizar a tela de login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginBackgroundUrl && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={loginBackgroundUrl}
                  alt="Preview do fundo do login"
                  className="w-full h-40 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeLoginBg}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-bg-upload">
                {loginBackgroundUrl ? 'Trocar imagem' : 'Selecionar imagem'}
              </Label>
              <Input
                id="login-bg-upload"
                type="file"
                accept="image/*"
                onChange={handleLoginBgChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB.
              </p>
            </div>
            {!loginBackgroundUrl && (
              <p className="text-sm text-muted-foreground italic">
                Usando imagem padrão do sistema
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
