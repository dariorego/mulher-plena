import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { SubmittedTimelineView } from '@/components/activities/SubmittedTimelineView';
import { SubmittedTrafficLightView } from '@/components/activities/SubmittedTrafficLightView';
import { SubmittedRoleDiaryView } from '@/components/activities/SubmittedRoleDiaryView';
import { SubmittedBalancedLifeMapView } from '@/components/activities/SubmittedBalancedLifeMapView';
import { SubmittedLoveActionView } from '@/components/activities/SubmittedLoveActionView';
import { SubmittedReconciliationView } from '@/components/activities/ReconciliationReportActivity';
import { SubmittedCommitmentLetterView } from '@/components/activities/CommitmentLetterActivity';
import { SubmittedRealSituationView } from '@/components/activities/RealSituationActivity';
import { SubmittedLoveWheelView } from '@/components/activities/LoveWheelActivity';
import { SubmittedWellBeingDiaryView } from '@/components/activities/WellBeingDiaryActivity';
import { ArrowLeft } from 'lucide-react';

const isTimelineActivity = (title: string) => title.toLowerCase().includes('linha da vida');
const isTrafficLightActivity = (title: string) => title.toLowerCase().includes('farol');
const isDiaryActivity = (title: string) => title.toLowerCase().includes('diário de papéis') || title.toLowerCase().includes('diario de papeis');
const isBalancedLifeMap = (title: string) => title.toLowerCase().includes('mapa de vida equilibrada');
const isLoveAction = (title: string) => title.toLowerCase().includes('acao de amor') || title.toLowerCase().includes('ação de amor');
const isReconciliationReport = (title: string) => title.toLowerCase().includes('relato') && title.toLowerCase().includes('reconcilia');
const isCommitmentLetter = (title: string) => title.toLowerCase().includes('carta de compromisso');
const isRealSituation = (title: string) => title.toLowerCase().includes('registro de situa');
const isLoveWheel = (title: string) => title.toLowerCase().includes('roda de amor');
const isWellBeingDiary = (title: string) => title.toLowerCase().includes('diário do bem-estar') || title.toLowerCase().includes('diario do bem-estar');

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
  const isTrafficLight = activity && isTrafficLightActivity(activity.title);
  const isDiary = activity && isDiaryActivity(activity.title);
  const isBalancedLife = activity && isBalancedLifeMap(activity.title);
  const isLoveAct = activity && isLoveAction(activity.title);
  const isReconciliation = activity && isReconciliationReport(activity.title);
  const isCommitment = activity && isCommitmentLetter(activity.title);
  const isRealSit = activity && isRealSituation(activity.title);
  const isLoveWh = activity && isLoveWheel(activity.title);
  const isWellBeing = activity && isWellBeingDiary(activity.title);

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
          {isWellBeing && submission.content ? (
            <SubmittedWellBeingDiaryView content={submission.content} />
          ) : isLoveWh && submission.content ? (
            <SubmittedLoveWheelView content={submission.content} />
          ) : isRealSit && submission.content ? (
            <SubmittedRealSituationView content={submission.content} />
          ) : isCommitment && submission.content ? (
            <SubmittedCommitmentLetterView content={submission.content} />
          ) : isReconciliation && submission.content ? (
            <SubmittedReconciliationView content={submission.content} />
          ) : isLoveAct && submission.content ? (
            <SubmittedLoveActionView content={submission.content} />
          ) : isBalancedLife && submission.content ? (
            <SubmittedBalancedLifeMapView content={submission.content} />
          ) : isTrafficLight && submission.content ? (
            <SubmittedTrafficLightView content={submission.content} />
          ) : isDiary && submission.content ? (
            <SubmittedRoleDiaryView content={submission.content} />
          ) : isTimeline && submission.content ? (
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
