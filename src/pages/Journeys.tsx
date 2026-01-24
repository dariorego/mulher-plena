import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';

// Strip HTML tags for plain text preview
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function Journeys() {
  const { user } = useAuth();
  const { journeys, stations, activities, getJourneyProgress } = useData();

  if (!user) return null;

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
            const progress = user.role === 'aluno' ? getJourneyProgress(user.id, journey.id) : 0;
            const journeyActivities = activities.filter(a => 
              journeyStations.some(s => s.id === a.station_id)
            );
            const plainDescription = journey.description ? stripHtml(journey.description) : '';

            return (
              <Link key={journey.id} to={`/jornadas/${journey.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                  <div className="overflow-hidden rounded-t-lg">
                    <img
                      src={journey.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                      alt={journey.title}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg line-clamp-2 mb-4">
                      {journey.title}
                    </h3>
                    
                    {user.role === 'aluno' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {user.role !== 'aluno' && (
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
