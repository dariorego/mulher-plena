import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BookOpen, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Journeys() {
  const { user } = useAuth();
  const { journeys, stations, activities, getJourneyProgress, isJourneyUnlocked } = useData();
  const { progressBarColor } = useSettings();

  if (!user) return null;

  const isAluno = user.role === 'aluno';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jornadas</h1>
          <p className="text-muted-foreground">
            Explore as jornadas de aprendizado disponíveis
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...journeys].sort((a, b) => a.order_index - b.order_index).map((journey) => {
            const journeyStations = stations.filter(s => s.journey_id === journey.id);
            const progress = isAluno ? getJourneyProgress(user.id, journey.id) : 0;
            const journeyActivities = activities.filter(a => 
              journeyStations.some(s => s.id === a.station_id)
            );
            const unlocked = !isAluno || isJourneyUnlocked(user.id, journey.id);

            const cardContent = (
              <Card className={`overflow-hidden transition-all duration-300 cursor-pointer group h-full ${!unlocked ? 'opacity-50 grayscale' : 'hover:shadow-lg'}`}>
                <div className="overflow-hidden rounded-t-lg relative">
                  <img
                    src={journey.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                    alt={journey.title}
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Lock className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-4">
                    {journey.title}
                  </h3>
                  
                  {isAluno && unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" indicatorColor={progressBarColor} />
                    </div>
                  )}

                  {isAluno && !unlocked && (
                    <p className="text-xs text-muted-foreground">
                      Complete as jornadas anteriores para desbloquear
                    </p>
                  )}

                  {!isAluno && (
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {journeyStations.length} estações
                      </Badge>
                      <Badge variant="outline">
                        {journeyActivities.length} atividades
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            if (!unlocked) {
              return (
                <TooltipProvider key={journey.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-not-allowed">
                        {cardContent}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Complete as jornadas anteriores para desbloquear</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return (
              <Link key={journey.id} to={`/jornadas/${journey.id}`}>
                {cardContent}
              </Link>
            );
          })}
        </div>

        {journeys.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma jornada disponível</h3>
            <p className="text-muted-foreground">
              Novas jornadas serão adicionadas em breve
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
