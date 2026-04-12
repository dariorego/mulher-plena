import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Target, Clock, TrendingUp, Users, FileText, CheckCircle, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents';
import { useActivityLogger } from '@/hooks/useActivityLogger';

export default function Dashboard() {
  const { user } = useAuth();
  const { journeys, stations, activities, submissions, userBadges, badges, scheduledEvents, getJourneyProgress, getUserStats, refreshData, isJourneyUnlocked, getJourneyLockReason } = useData();
  const { progressBarColor } = useSettings();
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [userCounts, setUserCounts] = useState({ total: 0, alunos: 0, professores: 0, admins: 0 });
  const { logAction } = useActivityLogger();

  // Sincroniza dados do banco ao abrir o Dashboard
  useEffect(() => {
    refreshData();
    logAction('view_dashboard', 'platform');
  }, [refreshData]);

  // Fetch user counts for admin/professor dashboard
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

  // Fetch profiles for participant names
  useEffect(() => {
    const fetchProfiles = async () => {
      if (submissions.length === 0) return;
      
      const userIds = [...new Set(submissions.map(s => s.user_id))];
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      if (data) {
        const profileMap = data.reduce((acc, p) => {
          acc[p.id] = p.name;
          return acc;
        }, {} as Record<string, string>);
        setProfiles(profileMap);
      }
    };
    fetchProfiles();
  }, [submissions]);

  if (!user) return null;

  const stats = getUserStats(user.id);
  const earnedBadges = userBadges.filter(ub => ub.user_id === user.id);

  // Admin stats
  const totalUsers = 3; // Mock
  const pendingEvaluations = submissions.filter(s => !s.evaluated_at).length;

  // Professor stats
  const professorPendingEvaluations = submissions.filter(s => !s.evaluated_at).length;

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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Jornadas</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journeys.length}</div>
                  <p className="text-xs text-muted-foreground">jornadas ativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activities.length}</div>
                  <p className="text-xs text-muted-foreground">atividades cadastradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submissões</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                  <p className="text-xs text-muted-foreground">total de submissões</p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">usuários cadastrados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jornadas</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journeys.length}</div>
                  <p className="text-xs text-muted-foreground">jornadas ativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estações</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stations.length}</div>
                  <p className="text-xs text-muted-foreground">estações criadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingEvaluations}</div>
                  <p className="text-xs text-muted-foreground">aguardando avaliação</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

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

        {/* Recent Activity (Professors/Admins) */}
        {(user.role === 'professor' || user.role === 'admin') && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Submissões Recentes</h2>
            <Card>
              <CardContent className="pt-6">
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma submissão ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {submissions.slice(-5).reverse().map((submission) => {
                      const activity = activities.find(a => a.id === submission.activity_id);
                      const station = activity ? stations.find(s => s.id === activity.station_id) : null;
                      const journey = station ? journeys.find(j => j.id === station.journey_id) : null;
                      const participantName = profiles[submission.user_id] || 'Participante';
                      
                      return (
                        <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary flex-shrink-0" />
                              <p className="font-semibold text-foreground truncate">{participantName}</p>
                            </div>
                            {journey && (
                              <p className="text-xs text-muted-foreground truncate">
                                {journey.title}
                              </p>
                            )}
                            <p className="font-medium text-sm text-primary">{activity?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {submission.evaluated_at ? (
                              <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-700">
                                Avaliado: {submission.score}%
                              </span>
                            ) : (
                              <span className="text-sm px-2 py-1 rounded bg-amber-100 text-amber-700">
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
