import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useFontSize } from '@/contexts/FontSizeContext';
import { ArrowLeft, Play, Film, ChevronLeft, ChevronRight, Headphones, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import videoAulaTitleImage from '@/assets/video-aula-title.png';
import activityButtonImage from '@/assets/activity-button.png';
import atividadeTitleImage from '@/assets/atividade-title.png';

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    stations, 
    activities, 
    journeys, 
    markStationStepComplete, 
    getStationProgress, 
    isStepCompleted 
  } = useData();
  const { videoPercentage, activityPercentage, supplementaryPercentage } = useSettings();
  const navigate = useNavigate();
  const { sizeClass: fontSizeClass } = useFontSize();

  if (!user || !id) return null;

  const station = stations.find(s => s.id === id);
  if (!station) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Estação não encontrada</h2>
          <Link to="/jornadas">
            <Button variant="link">Voltar para jornadas</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const journey = journeys.find(j => j.id === station.journey_id);
  const stationActivities = activities.filter(a => a.station_id === station.id);
  const firstActivity = stationActivities[0];

  // Progress tracking
  const stationProgress = getStationProgress(user.id, station.id);
  const videoCompleted = isStepCompleted(user.id, station.id, 'video');
  const activityCompleted = isStepCompleted(user.id, station.id, 'activity');
  const supplementaryCompleted = isStepCompleted(user.id, station.id, 'supplementary');

  // Navigation between stations
  const journeyStations = stations
    .filter(s => s.journey_id === station.journey_id)
    .sort((a, b) => a.order_index - b.order_index);
  
  const currentIndex = journeyStations.findIndex(s => s.id === station.id);
  const previousStation = currentIndex > 0 ? journeyStations[currentIndex - 1] : null;
  const nextStation = currentIndex < journeyStations.length - 1 ? journeyStations[currentIndex + 1] : null;

  // Extract video ID from YouTube URL for embedding
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    // If it's a Vimeo URL
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    // Return as-is if already an embed URL or other format
    return url;
  };

  const videoEmbedUrl = station.video_url ? getYouTubeEmbedUrl(station.video_url) : null;

  const handleActivityClick = () => {
    if (firstActivity) {
      navigate(`/atividade/${firstActivity.id}`);
    }
  };

  const handleVideoComplete = async (checked: boolean) => {
    await markStationStepComplete(station.id, 'video', checked);
    toast.success(checked ? 'Vídeo marcado como assistido' : 'Marcação do vídeo removida');
  };

  const handleSupplementaryComplete = async (checked: boolean) => {
    await markStationStepComplete(station.id, 'supplementary', checked);
    toast.success(checked ? 'Material complementar marcado como visto' : 'Marcação do material removida');
  };

  // Calculate which sections are present for percentage display
  const hasVideo = !!station.video_url;
  const hasActivity = stationActivities.length > 0;
  const hasSupplementary = !!station.supplementary_url;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link to={journey ? `/jornadas/${journey.id}` : '/jornadas'}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para {journey?.title || 'Jornadas'}
          </Button>
        </Link>

        {/* Top Image Banner */}
        {station.image_url && (
          <div className="w-full overflow-hidden rounded-xl">
            <img
              src={station.image_url}
              alt={station.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {/* Title - Only visible for admin */}
        {user.role === 'admin' && (
          <h1 className="text-3xl font-cinzel font-bold text-primary">{station.title}</h1>
        )}

        {/* Progress Bar */}
        <Card className="border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">Progresso da Estação</span>
              <span className="text-sm font-bold text-primary">{stationProgress}%</span>
            </div>
            <Progress value={stationProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Description */}
        {station.description && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-cinzel text-primary">Descrição</CardTitle>
                <FontSizeControl />
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`prose prose-sm max-w-none text-foreground ${fontSizeClass}`}
                dangerouslySetInnerHTML={{ __html: station.description }}
              />
            </CardContent>
          </Card>
        )}

        {/* Video Section */}
        {videoEmbedUrl && (
          <Card>
            <div className="w-full overflow-hidden rounded-t-lg">
              <img
                src={videoAulaTitleImage}
                alt="Vídeo Aula"
                className="w-full h-auto object-cover"
              />
            </div>
            <CardContent className="pt-4 space-y-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={videoEmbedUrl}
                  title={`Vídeo: ${station.title}`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Video Completion Checkbox */}
              <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${videoCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="video-complete"
                    checked={videoCompleted}
                    onCheckedChange={handleVideoComplete}
                  />
                  <label 
                    htmlFor="video-complete" 
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {videoCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    Marcar como assistido
                  </label>
                </div>
                <span className={`text-sm font-semibold ${videoCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                  +{videoPercentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Section - Only show if there are activities */}
        {firstActivity && (
          <Card>
            <div className="w-full overflow-hidden rounded-t-lg">
              <img
                src={atividadeTitleImage}
                alt="Atividade"
                className="w-full h-auto object-cover"
              />
            </div>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-center">
                <div 
                  onClick={handleActivityClick}
                  className="cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                >
                  <img
                    src={activityButtonImage}
                    alt="Acessar Atividade"
                    className="h-[150px] w-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              </div>
              
              {/* Activity Completion Status */}
              <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${activityCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="activity-complete"
                    checked={activityCompleted}
                    disabled
                  />
                  <label 
                    htmlFor="activity-complete" 
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    {activityCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {activityCompleted ? 'Atividade enviada' : 'Atividade pendente'}
                  </label>
                </div>
                <span className={`text-sm font-semibold ${activityCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                  +{activityPercentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Section - After Activity, Before Supplementary Material */}
        {station.audio_url && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
                <Headphones className="h-5 w-5 text-accent" />
                Áudio da Estação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ouça a reflexão desta estação
              </p>
              <audio 
                src={station.audio_url} 
                controls 
                className="w-full rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Supplementary Material - Video Modal */}
        {station.supplementary_url && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-cinzel text-primary">Material Complementar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Film className="h-5 w-5 text-accent" />
                <h3 className="font-medium text-primary">Vídeo Complementar</h3>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-medium">
                    <Play className="mr-2 h-4 w-4" />
                    Assistir Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="font-cinzel text-primary">
                      Material Complementar
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={getYouTubeEmbedUrl(station.supplementary_url)}
                        title="Material Complementar"
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Supplementary Completion Checkbox */}
              <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${supplementaryCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="supplementary-complete"
                    checked={supplementaryCompleted}
                    onCheckedChange={handleSupplementaryComplete}
                  />
                  <label 
                    htmlFor="supplementary-complete" 
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {supplementaryCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    Marcar como visto
                  </label>
                </div>
                <span className={`text-sm font-semibold ${supplementaryCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                  +{supplementaryPercentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation between Stations */}
        {(previousStation || nextStation) && (
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-primary/20">
            {previousStation ? (
              <Link to={`/estacao/${previousStation.id}`}>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/5 h-auto py-3 px-4">
                  <ChevronLeft className="mr-2 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block">Estação Anterior</span>
                    <span className="text-sm font-medium text-primary">
                      Estação {currentIndex}
                    </span>
                  </div>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextStation ? (
              <Link to={`/estacao/${nextStation.id}`}>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/5 h-auto py-3 px-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Próxima Estação</span>
                    <span className="text-sm font-medium text-primary">
                      Estação {currentIndex + 2}
                    </span>
                  </div>
                  <ChevronRight className="ml-2 h-5 w-5 text-primary" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
