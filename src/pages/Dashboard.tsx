import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Target, TrendingUp, Users, Lock, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentAccess {
  user_id: string;
  user_name: string;
  created_at: string;
}

interface AccessRanking {
  user_id: string;
  user_name: string;
  access_count: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { journeys, stations, activities, submissions, userBadges, badges, scheduledEvents, getJourneyProgress, getUserStats, refreshData, isJourneyUnlocked, getJourneyLockReason } = useData();
  const { progressBarColor, rewardsEnabled } = useSettings();
  const [userCounts, setUserCounts] = useState({ total: 0, alunos: 0, professores: 0, admins: 0 });
  const [recentAccesses, setRecentAccesses] = useState<RecentAccess[]>([]);
  const [accessRanking, setAccessRanking] = useState<AccessRanking[]>([]);
  const { logAction } = useActivityLogger();

  useEffect(() => {
    refreshData();
    logAction('view_dashboard', 'platform');
  }, [refreshData]);

  useEffect(() => {
    const fetchUserCounts = async () => {
      if (user?.role !== 'admin' && user?.role !== 'professor') return;
      const [totalRes, alunosRes, professoresRes, adminsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'aluno'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'professor'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      ]);
      setUserCounts({
        total: totalRes.count ?? 0,
        alunos: alunosRes.count ?? 0,
        professores: professoresRes.count ?? 0,
        admins: adminsRes.count ?? 0,
      });
    };
    fetchUserCounts();
  }, [user?.role]);

  useEffect(() => {
    const fetchAccessData = async () => {
      if (user?.role !== 'admin' && user?.role !== 'professor') return;

      // Últimos 10 acessos
      const { data: recentLogs } = await supabase
        .from('user_activity_logs')
        .select('user_id, created_at')
        .eq('action', 'login')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentLogs && recentLogs.length > 0) {
        const userIds = [...new Set(recentLogs.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);
        setRecentAccesses(recentLogs.map(l => ({
          user_id: l.user_id,
          user_name: profileMap.get(l.user_id) || 'Usuário',
          created_at: l.created_at,
        })));
      }

      // Ranking de acessos - buscar todos os logins e agrupar no client
      const { data: allLogins } = await supabase
        .from('user_activity_logs')
        .select('user_id')
        .eq('action', 'login');

      if (allLogins && allLogins.length > 0) {
        const countMap = new Map<string, number>();
        allLogins.forEach(l => {
          countMap.set(l.user_id, (countMap.get(l.user_id) || 0) + 1);
        });

        const sortedEntries = [...countMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        const rankUserIds = sortedEntries.map(e => e[0]);
        const { data: rankProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', rankUserIds);

        const rankProfileMap = new Map(rankProfiles?.map(p => [p.id, p.name]) || []);
        setAccessRanking(sortedEntries.map(([uid, count]) => ({
          user_id: uid,
          user_name: rankProfileMap.get(uid) || 'Usuário',
          access_count: count,
        })));
      }
    };
    fetchAccessData();
  }, [user?.role]);

  if (!user) return null;

  const stats = getUserStats(user.id);
  const earnedBadges = userBadges.filter(ub => ub.user_id === user.id);
  const pendingEvaluations = submissions.filter(s => !s.evaluated_at).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">
            {user.role === 'aluno' && 'Continue sua jornada de aprendizado'}
            {user.role === 'professor' && 'Acompanhe o progresso das participantes'}
            {user.role === 'admin' && 'Gerencie a plataforma de cursos'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {user.role === 'aluno' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jornadas em Progresso</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journeys.length}</div>
                  <p className="text-xs text-muted-foreground">jornadas disponíveis</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atividades Concluídas</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedActivities}</div>
                  <p className="text-xs text-muted-foreground">de {activities.length} atividades</p>
                </CardContent>
              </Card>
              {rewardsEnabled && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalPoints}</div>
                      <p className="text-xs text-muted-foreground">pontos acumulados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earnedBadges.length}</div>
                      <p className="text-xs text-muted-foreground">de {badges.length} badges</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {(user.role === 'professor' || user.role === 'admin') && (
            <>
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center gap-2 pb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Total cadastrados</span>
                      <span className="text-lg font-bold">{userCounts.total}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Participantes</span>
                      <span className="text-lg font-bold">{userCounts.alunos}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Tutores</span>
                      <span className="text-lg font-bold">{userCounts.professores}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Formadoras</span>
                      <span className="text-lg font-bold">{userCounts.admins}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center gap-2 pb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Jornadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Qde Jornadas</span>
                      <span className="text-lg font-bold">{journeys.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Jornadas Ativas</span>
                      <span className="text-lg font-bold">{journeys.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Qde Estações</span>
                      <span className="text-lg font-bold">{stations.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Avaliações Pendentes</span>
                      <span className="text-lg font-bold">{pendingEvaluations}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Access panels for admin/professor */}
        {(user.role === 'professor' || user.role === 'admin') && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Últimos Acessos</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAccesses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum acesso registrado.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentAccesses.map((access, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground truncate max-w-[60%]">{access.user_name}</span>
                        <span className="text-sm font-medium text-right">
                          {format(new Date(access.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Ranking de Acessos</CardTitle>
              </CardHeader>
              <CardContent>
                {accessRanking.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum acesso registrado.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {accessRanking.map((entry, idx) => (
                      <div key={entry.user_id} className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm font-bold w-6 text-center ${idx < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {idx + 1}º
                          </span>
                          <span className="text-sm text-muted-foreground truncate">{entry.user_name}</span>
                        </div>
                        <span className="text-lg font-bold">{entry.access_count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Events + Journey Progress (Students) */}
        {user.role === 'aluno' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Suas Jornadas</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[...journeys].sort((a, b) => a.order_index - b.order_index).map((journey) => {
                  const progress = getJourneyProgress(user.id, journey.id);
                  const unlocked = isJourneyUnlocked(user.id, journey.id);

                  const card = (
                    <Card className={`overflow-hidden transition-shadow cursor-pointer ${unlocked ? 'hover:shadow-lg' : 'opacity-50 grayscale'}`}>
                      <div className="bg-muted relative">
                        <img
                          src={journey.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                          alt={journey.title}
                          className="w-full h-auto object-contain"
                        />
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Lock className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg mb-3">{journey.title}</h3>
                        {unlocked ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" indicatorColor={progressBarColor} />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {getJourneyLockReason(user.id, journey.id) === 'prerequisites'
                              ? 'As Jornadas 1, 2 e 3 são pré-requisitos obrigatórios.'
                              : 'Esta jornada ainda não foi liberada.'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );

                  if (!unlocked) {
                    return (
                      <div key={journey.id} className="cursor-not-allowed">
                        {card}
                      </div>
                    );
                  }

                  return (
                    <Link key={journey.id} to={`/jornadas/${journey.id}`}>
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <UpcomingEvents events={scheduledEvents.filter(e => !e.journey_id)} maxEvents={5} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
