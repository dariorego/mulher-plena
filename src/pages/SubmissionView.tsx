import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { SubmittedTimelineView } from '@/components/activities/SubmittedTimelineView';
import { ArrowLeft } from 'lucide-react';

const isTimelineActivity = (title: string) => title.toLowerCase().includes('linha da vida');

export default function SubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submissions, activities } = useData();

  const submission = submissions.find(s => s.id === id);
  const activity = submission ? activities.find(a => a.id === submission.activity_id) : null;

  if (!submission) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Submissão não encontrada</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isTimeline = activity && isTimelineActivity(activity.title);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{activity?.title}</h1>
            <p className="text-sm text-muted-foreground">
              Enviado em {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-sm font-medium mb-4">Resposta do aluno:</p>
          {isTimeline && submission.content ? (
            <SubmittedTimelineView content={submission.content} />
          ) : submission.content?.startsWith('data:image') ? (
            <img 
              src={submission.content} 
              alt="Resposta do aluno" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          ) : (
            <p className="whitespace-pre-wrap">{submission.content}</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
