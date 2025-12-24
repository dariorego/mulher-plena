import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock } from 'lucide-react';

export default function Achievements() {
  const { user } = useAuth();
  const { badges, userBadges } = useData();

  if (!user) return null;

  const earnedBadgeIds = userBadges
    .filter(ub => ub.user_id === user.id)
    .map(ub => ub.badge_id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Conquistas</h1>
          <p className="text-muted-foreground">
            Seu progresso e badges conquistados
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            const earnedData = userBadges.find(ub => ub.badge_id === badge.id && ub.user_id === user.id);

            return (
              <Card
                key={badge.id}
                className={`transition-all ${
                  earned
                    ? 'border-primary/50 bg-primary/5'
                    : 'opacity-60 grayscale'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                        earned ? 'bg-primary/10' : 'bg-muted'
                      }`}
                    >
                      {earned ? badge.icon : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        {earned && (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            Conquistado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                      {earned && earnedData && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Conquistado em {new Date(earnedData.earned_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {badges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma conquista disponível</h3>
            <p className="text-muted-foreground">
              Continue aprendendo para desbloquear conquistas
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{earnedBadgeIds.length}</p>
                <p className="text-sm text-muted-foreground">Conquistados</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{badges.length - earnedBadgeIds.length}</p>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">
                  {Math.round((earnedBadgeIds.length / badges.length) * 100) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
