import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, Clock, User, Filter, CalendarIcon, X, Trash2, RotateCcw } from 'lucide-react';
import { SubmittedTimelineView } from '@/components/activities/SubmittedTimelineView';
import { SubmittedTrafficLightView } from '@/components/activities/SubmittedTrafficLightView';
import { SubmittedRoleDiaryView } from '@/components/activities/SubmittedRoleDiaryView';
import { SubmittedBalancedLifeMapView } from '@/components/activities/SubmittedBalancedLifeMapView';
import { SubmittedLoveActionView } from '@/components/activities/SubmittedLoveActionView';
import { SubmittedReconciliationView } from '@/components/activities/ReconciliationReportActivity';
import { SubmittedCommitmentLetterView } from '@/components/activities/CommitmentLetterActivity';
import { SubmittedRealSituationView } from '@/components/activities/RealSituationActivity';
import { SubmittedLoveWheelView } from '@/components/activities/LoveWheelActivity';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';
import { ActivitySubmission } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Evaluations() {
  const { user } = useAuth();
  const { activities, stations, journeys, submissions, evaluateSubmission, deleteSubmission, refreshData, deletionRequests, reviewDeletionRequest } = useData();
  const { showScoreToStudents, showFeedbackToStudents } = useSettings();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  // Filter states
  const [filterParticipant, setFilterParticipant] = useState<string>('all');
  const [filterJourney, setFilterJourney] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterDateStart, setFilterDateStart] = useState<Date | undefined>();
  const [filterDateEnd, setFilterDateEnd] = useState<Date | undefined>();

  // Fetch profiles for participant names
  useEffect(() => {
    const fetchProfiles = async () => {
      if (submissions.length === 0) return;
      
      // Include both participants and evaluators
      const userIds = [...new Set([
        ...submissions.map(s => s.user_id),
        ...submissions.filter(s => s.evaluated_by).map(s => s.evaluated_by as string)
      ])];
      
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

  // Helper to get submission context (participant, journey, station)
  const getSubmissionContext = (submission: ActivitySubmission) => {
    const activity = activities.find(a => a.id === submission.activity_id);
    const station = activity ? stations.find(s => s.id === activity.station_id) : null;
    const journey = station ? journeys.find(j => j.id === station.journey_id) : null;
    
    return {
      participantId: submission.user_id,
      participantName: profiles[submission.user_id] || 'Participante',
      journeyId: journey?.id || '',
      journeyTitle: journey?.title || '',
      stationId: station?.id || '',
      stationTitle: station?.title || '',
      activityTitle: activity?.title || '',
    };
  };

  // Get unique participants for filter dropdown
  const uniqueParticipants = useMemo(() => {
    const participants = new Map<string, string>();
    submissions.forEach(sub => {
      if (profiles[sub.user_id]) {
        participants.set(sub.user_id, profiles[sub.user_id]);
      }
    });
    return Array.from(participants.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [submissions, profiles]);

  // Get stations filtered by selected journey
  const filteredStations = useMemo(() => {
    if (filterJourney === 'all') return stations;
    return stations.filter(s => s.journey_id === filterJourney);
  }, [stations, filterJourney]);

  // Reset station filter when journey changes
  useEffect(() => {
    if (filterJourney !== 'all' && filterStation !== 'all') {
      const stationBelongsToJourney = stations.find(s => s.id === filterStation)?.journey_id === filterJourney;
      if (!stationBelongsToJourney) {
        setFilterStation('all');
      }
    }
  }, [filterJourney, filterStation, stations]);

  // Filter submissions
  const filterSubmissions = (subs: ActivitySubmission[]) => {
    return subs.filter(sub => {
      const context = getSubmissionContext(sub);
      
      // Filter by participant
      if (filterParticipant !== 'all' && sub.user_id !== filterParticipant) {
        return false;
      }
      
      // Filter by journey
      if (filterJourney !== 'all' && context.journeyId !== filterJourney) {
        return false;
      }
      
      // Filter by station
      if (filterStation !== 'all' && context.stationId !== filterStation) {
        return false;
      }
      
      // Filter by date range
      const submittedDate = new Date(sub.submitted_at);
      if (filterDateStart && submittedDate < filterDateStart) {
        return false;
      }
      if (filterDateEnd) {
        const endOfDay = new Date(filterDateEnd);
        endOfDay.setHours(23, 59, 59, 999);
        if (submittedDate > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  };

  const pendingSubmissions = filterSubmissions(submissions.filter(s => !s.evaluated_at));
  const evaluatedSubmissions = filterSubmissions(submissions.filter(s => s.evaluated_at));

  const hasActiveFilters = filterParticipant !== 'all' || filterJourney !== 'all' || filterStation !== 'all' || filterDateStart || filterDateEnd;

  const clearFilters = () => {
    setFilterParticipant('all');
    setFilterJourney('all');
    setFilterStation('all');
    setFilterDateStart(undefined);
    setFilterDateEnd(undefined);
  };

  const handleEvaluate = async () => {
    if (!selectedSubmission) return;
    const finalScore = score ? parseInt(score) : 100;
    await evaluateSubmission(selectedSubmission, finalScore, feedback, user.id);
    toast.success(feedback ? 'Avaliação e feedback enviados!' : 'Avaliação enviada!');
    setSelectedSubmission(null);
    setScore('');
    setFeedback('');
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await deleteSubmission(submissionId);
      // Refresh data to ensure all components have updated state
      await refreshData();
      toast.success('Submissão excluída! O participante pode enviar novamente.');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Erro ao excluir submissão. Verifique suas permissões.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground">Avalie as atividades dos alunos</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Participant Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Participante</Label>
                <Select value={filterParticipant} onValueChange={setFilterParticipant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueParticipants.map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Journey Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Jornada</Label>
                <Select value={filterJourney} onValueChange={setFilterJourney}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {journeys.map(journey => (
                      <SelectItem key={journey.id} value={journey.id}>{journey.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Station Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Estação</Label>
                <Select value={filterStation} onValueChange={setFilterStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {filteredStations.map(station => (
                      <SelectItem key={station.id} value={station.id}>{station.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Start Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterDateStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDateStart ? format(filterDateStart, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDateStart}
                      onSelect={setFilterDateStart}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date End Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterDateEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDateEnd ? format(filterDateEnd, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDateEnd}
                      onSelect={setFilterDateEnd}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Requests Section */}
        {deletionRequests.filter(r => r.status === 'pending').length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <RotateCcw className="h-5 w-5 text-amber-600" />
                Solicitações de Refazer ({deletionRequests.filter(r => r.status === 'pending').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {deletionRequests
                  .filter(r => r.status === 'pending')
                  .map(request => {
                    const submission = submissions.find(s => s.id === request.submission_id);
                    const activity = submission ? activities.find(a => a.id === submission.activity_id) : null;
                    const station = activity ? stations.find(s => s.id === activity.station_id) : null;
                    const journey = station ? journeys.find(j => j.id === station.journey_id) : null;
                    const participantName = profiles[request.user_id] || 'Participante';

                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="font-semibold text-foreground truncate">{participantName}</p>
                          </div>
                          {journey && (
                            <p className="text-xs text-muted-foreground truncate">
                              {journey.title} &gt; {station?.title}
                            </p>
                          )}
                          <p className="font-medium text-sm text-primary">{activity?.title || 'Atividade'}</p>
                          <p className="text-xs text-muted-foreground">
                            Solicitado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {request.reason && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              Motivo: "{request.reason}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={async () => {
                              try {
                                await reviewDeletionRequest(request.id, 'rejected');
                                toast.success('Solicitação recusada.');
                              } catch {
                                toast.error('Erro ao recusar solicitação.');
                              }
                            }}
                          >
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await reviewDeletionRequest(request.id, 'approved');
                                await refreshData();
                                toast.success('Solicitação aprovada! Submissão excluída.');
                              } catch {
                                toast.error('Erro ao aprovar solicitação.');
                              }
                            }}
                          >
                            Aprovar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-4 w-4" /> Pendentes ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="evaluated" className="gap-1">
              <CheckCircle className="h-4 w-4" /> Avaliadas ({evaluatedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardContent className="pt-6">
                {pendingSubmissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {hasActiveFilters ? 'Nenhuma avaliação pendente com os filtros aplicados' : 'Nenhuma avaliação pendente'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingSubmissions.map(sub => {
                      const context = getSubmissionContext(sub);
                      const isExpanded = selectedSubmission === sub.id;
                      const subActivity = activities.find(a => a.id === sub.activity_id);
                      return (
                        <div key={sub.id} className="rounded-lg bg-muted/50 border border-border/50 overflow-hidden">
                          <div className="flex items-center justify-between p-4">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary flex-shrink-0" />
                                <p className="font-semibold text-foreground truncate">{context.participantName}</p>
                              </div>
                              {context.journeyTitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {context.journeyTitle} &gt; {context.stationTitle}
                                </p>
                              )}
                              <p className="font-medium text-sm text-primary">{context.activityTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              <Button size="sm" variant={isExpanded ? "secondary" : "default"} onClick={() => {
                                if (isExpanded) {
                                  setSelectedSubmission(null);
                                  setScore('');
                                  setFeedback('');
                                } else {
                                  setSelectedSubmission(sub.id);
                                  setScore('');
                                  setFeedback('');
                                }
                              }}>
                                {isExpanded ? 'Fechar' : 'Avaliar'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir submissão?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Você está prestes a excluir a submissão de <strong>{context.participantName}</strong> para a atividade <strong>"{context.activityTitle}"</strong>.
                                      <br /><br />
                                      Isso permitirá que o participante envie a atividade novamente. Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteSubmission(sub.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-border/50 p-4 space-y-4">
                              <div className="p-4 bg-background rounded-lg">
                                <p className="text-sm font-medium mb-3">Resposta do aluno:</p>
                                {subActivity?.title?.toLowerCase().includes('roda de amor') && sub.content ? (
                                  <SubmittedLoveWheelView content={sub.content} />
                                ) : subActivity?.title?.toLowerCase().includes('registro de situa') && sub.content ? (
                                  <SubmittedRealSituationView content={sub.content} />
                                ) : subActivity?.title?.toLowerCase().includes('carta de compromisso') && sub.content ? (
                                  <SubmittedCommitmentLetterView content={sub.content} />
                                ) : (subActivity?.title?.toLowerCase().includes('relato') && subActivity?.title?.toLowerCase().includes('reconcilia')) && sub.content ? (
                                  <SubmittedReconciliationView content={sub.content} />
                                ) : (subActivity?.title?.toLowerCase().includes('acao de amor') || subActivity?.title?.toLowerCase().includes('ação de amor')) && sub.content ? (
                                  <SubmittedLoveActionView content={sub.content} />
                                ) : subActivity?.title?.toLowerCase().includes('mapa de vida equilibrada') && sub.content ? (
                                  <SubmittedBalancedLifeMapView content={sub.content} />
                                ) : subActivity?.title?.toLowerCase().includes('farol') && sub.content ? (
                                  <SubmittedTrafficLightView content={sub.content} />
                                ) : (subActivity?.title?.toLowerCase().includes('diário de papéis') || subActivity?.title?.toLowerCase().includes('diario de papeis')) && sub.content ? (
                                  <SubmittedRoleDiaryView content={sub.content} />
                                ) : subActivity?.title?.toLowerCase().includes('linha da vida') && sub.content ? (
                                  <SubmittedTimelineView content={sub.content} />
                                ) : sub.content?.startsWith('data:image') ? (
                                  <img 
                                    src={sub.content} 
                                    alt="Resposta do aluno" 
                                    className="max-w-full h-auto rounded-md"
                                  />
                                ) : (
                                  <p className="text-sm break-all whitespace-pre-wrap">{sub.content}</p>
                                )}
                              </div>
                              {showScoreToStudents && (
                                <div className="space-y-2">
                                  <Label>Nota (0-100)</Label>
                                  <Input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} />
                                </div>
                              )}
                              {showFeedbackToStudents && (
                                <div className="space-y-2">
                                  <Label>Feedback</Label>
                                  <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comentários..." />
                                </div>
                              )}
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedSubmission(null); setScore(''); setFeedback(''); }}>Cancelar</Button>
                                <Button onClick={handleEvaluate} disabled={showScoreToStudents && !score}>Enviar Avaliação</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluated">
            <Card>
              <CardContent className="pt-6">
                {evaluatedSubmissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {hasActiveFilters ? 'Nenhuma avaliação realizada com os filtros aplicados' : 'Nenhuma avaliação realizada'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {evaluatedSubmissions.slice().reverse().map(sub => {
                      const context = getSubmissionContext(sub);
                      const evaluatorName = sub.evaluated_by ? profiles[sub.evaluated_by] : null;
                      return (
                        <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary flex-shrink-0" />
                              <p className="font-semibold text-foreground truncate">{context.participantName}</p>
                            </div>
                            {context.journeyTitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                {context.journeyTitle} &gt; {context.stationTitle}
                              </p>
                            )}
                            <p className="font-medium text-sm">{context.activityTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Nota: {sub.score}%
                              {evaluatorName && ` • Avaliado por: ${evaluatorName}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <Badge variant="secondary">Avaliado</Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir submissão avaliada?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Você está prestes a excluir a submissão avaliada de <strong>{context.participantName}</strong> para a atividade <strong>"{context.activityTitle}"</strong>.
                                    <br /><br />
                                    A nota ({sub.score}%) e feedback serão perdidos. O participante poderá enviar a atividade novamente. Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteSubmission(sub.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>
    </AppLayout>
  );
}
