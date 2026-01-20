import { useState } from 'react';
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
import { CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Evaluations() {
  const { user } = useAuth();
  const { activities, submissions, evaluateSubmission } = useData();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!user) return null;

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
                <div className="space-y-2">
                  {pendingSubmissions.map(sub => {
                    const act = activities.find(a => a.id === sub.activity_id);
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{act?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setSelectedSubmission(sub.id)}>Avaliar</Button>
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
                <div className="space-y-2">
                  {evaluatedSubmissions.slice(-5).reverse().map(sub => {
                    const act = activities.find(a => a.id === sub.activity_id);
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{act?.title}</p>
                          <p className="text-xs text-muted-foreground">Nota: {sub.score}%</p>
                        </div>
                        <Badge variant="secondary">Avaliado</Badge>
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
                <p className="text-sm font-medium mb-1">Resposta do aluno:</p>
                <p className="text-sm break-all whitespace-pre-wrap">{submission?.content}</p>
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
