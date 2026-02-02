import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useFontSize } from '@/contexts/FontSizeContext';
import { ArrowLeft, Play, Film, ChevronLeft, ChevronRight, Headphones } from 'lucide-react';
import videoAulaTitleImage from '@/assets/video-aula-title.png';
import activityButtonImage from '@/assets/activity-button.png';
import atividadeTitleImage from '@/assets/atividade-title.png';

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { stations, activities, journeys } = useData();
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

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
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
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '1293/253' }}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-cinzel font-bold text-primary">{station.title}</h1>

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
            <CardContent className="pt-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={videoEmbedUrl}
                  title={`Vídeo: ${station.title}`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
            <CardContent className="pt-4">
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
            <CardContent>
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
