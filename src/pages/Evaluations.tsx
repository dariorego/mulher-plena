import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, Clock, ExternalLink, User, Filter, CalendarIcon, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubmittedTimelineView } from '@/components/activities/SubmittedTimelineView';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActivitySubmission } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Evaluations() {
  const { user } = useAuth();
  const { activities, stations, journeys, submissions, evaluateSubmission, deleteSubmission, refreshData } = useData();
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

  const handleEvaluate = () => {
    if (selectedSubmission && score) {
      evaluateSubmission(selectedSubmission, parseInt(score), feedback, user.id);
      toast.success('Avaliação enviada!');
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
    }
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

  const submission = submissions.find(s => s.id === selectedSubmission);
  const activity = submission ? activities.find(a => a.id === submission.activity_id) : null;

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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pendentes ({pendingSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {hasActiveFilters ? 'Nenhuma avaliação pendente com os filtros aplicados' : 'Nenhuma avaliação pendente'}
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {pendingSubmissions.map(sub => {
                    const context = getSubmissionContext(sub);
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
                          <p className="font-medium text-sm text-primary">{context.activityTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Button size="sm" onClick={() => setSelectedSubmission(sub.id)}>
                            Avaliar
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Avaliadas ({evaluatedSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluatedSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {hasActiveFilters ? 'Nenhuma avaliação realizada com os filtros aplicados' : 'Nenhuma avaliação realizada'}
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
        </div>

        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className={cn(
            "max-h-[90vh] flex flex-col",
            activity?.title?.toLowerCase().includes('linha da vida') ? 'sm:max-w-4xl' : ''
          )}>
            <DialogHeader>
              <DialogTitle>Avaliar: {activity?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Resposta do aluno:</p>
                  <Link to={`/submissao/${selectedSubmission}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Ver completo
                    </Button>
                  </Link>
                </div>
                {activity?.title?.toLowerCase().includes('linha da vida') && submission?.content ? (
                  <SubmittedTimelineView content={submission.content} />
                ) : submission?.content?.startsWith('data:image') ? (
                  <img 
                    src={submission.content} 
                    alt="Resposta do aluno" 
                    className="max-w-full h-auto rounded-md max-h-32 object-contain"
                  />
                ) : (
                  <p className="text-sm break-all whitespace-pre-wrap line-clamp-6">{submission?.content}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nota (0-100)</Label>
                <Input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comentários..." />
              </div>
            </div>
            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancelar</Button>
              <Button onClick={handleEvaluate} disabled={!score}>Enviar Avaliação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
