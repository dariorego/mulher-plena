import { useState, useEffect } from 'react';
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
import { CheckCircle, Clock, ExternalLink, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActivitySubmission } from '@/types';

export default function Evaluations() {
  const { user } = useAuth();
  const { activities, stations, journeys, submissions, evaluateSubmission } = useData();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [profiles, setProfiles] = useState<Record<string, string>>({});

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

  // Helper to get submission context (participant, journey, station)
  const getSubmissionContext = (submission: ActivitySubmission) => {
    const activity = activities.find(a => a.id === submission.activity_id);
    const station = activity ? stations.find(s => s.id === activity.station_id) : null;
    const journey = station ? journeys.find(j => j.id === station.journey_id) : null;
    
    return {
      participantName: profiles[submission.user_id] || 'Participante',
      journeyTitle: journey?.title || '',
      stationTitle: station?.title || '',
      activityTitle: activity?.title || '',
    };
  };

  const pendingSubmissions = submissions.filter(s => !s.evaluated_at);
  const evaluatedSubmissions = submissions.filter(s => s.evaluated_at);

  const handleEvaluate = () => {
    if (selectedSubmission && score) {
      evaluateSubmission(selectedSubmission, parseInt(score), feedback, user.id);
      toast.success('Avaliação enviada!');
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pendentes ({pendingSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma avaliação pendente</p>
              ) : (
                <div className="space-y-3">
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
                        <Button size="sm" onClick={() => setSelectedSubmission(sub.id)} className="flex-shrink-0 ml-3">
                          Avaliar
                        </Button>
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
                <p className="text-muted-foreground text-center py-4">Nenhuma avaliação realizada</p>
              ) : (
                <div className="space-y-3">
                  {evaluatedSubmissions.slice(-5).reverse().map(sub => {
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
                          <p className="font-medium text-sm">{context.activityTitle}</p>
                          <p className="text-xs text-muted-foreground">Nota: {sub.score}%</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 ml-3">Avaliado</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avaliar: {activity?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg max-h-48 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Resposta do aluno:</p>
                  <Link to={`/submissao/${selectedSubmission}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Ver completo
                    </Button>
                  </Link>
                </div>
                {submission?.content?.startsWith('data:image') ? (
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancelar</Button>
              <Button onClick={handleEvaluate} disabled={!score}>Enviar Avaliação</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
