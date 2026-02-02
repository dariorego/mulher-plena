import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { useFontSize } from '@/contexts/FontSizeContext';
import { ArrowLeft, FileText, Upload, PenLine, Gamepad2, Trophy, CheckCircle, MessageSquare, Heart, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { VisionBoardCanvas } from '@/components/activities/VisionBoardCanvas';
import { ForumBoard } from '@/components/activities/ForumBoard';
import { WordRoulette } from '@/components/activities/WordRoulette';
import { FamilyTreeActivity } from '@/components/activities/FamilyTreeActivity';
import { supabase } from '@/integrations/supabase/client';

const activityIcons = {
  quiz: FileText,
  upload: Upload,
  essay: PenLine,
  gamified: Gamepad2,
  forum: MessageSquare,
};

const activityLabels = {
  quiz: 'Quiz',
  upload: 'Upload de Arquivo',
  essay: 'Texto Dissertativo',
  gamified: 'Atividade Gamificada',
  forum: 'Fórum Colaborativo',
};

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities, stations, journeys, submissions, quizQuestions, submitActivity, awardBadge, userBadges, updateActivity, refreshData } = useData();
  const { showScoreToStudents, showFeedbackToStudents } = useSettings();
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [essayContent, setEssayContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const { sizeClass: fontSizeClass } = useFontSize();
  
  // Estado para Lista de Gratidão
  const [gratitudeItems, setGratitudeItems] = useState<Array<{aspect: string, meaning: string}>>([
    { aspect: '', meaning: '' },
    { aspect: '', meaning: '' },
    { aspect: '', meaning: '' },
    { aspect: '', meaning: '' },
    { aspect: '', meaning: '' },
  ]);

  const updateGratitudeItem = (index: number, field: 'aspect' | 'meaning', value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index][field] = value;
    setGratitudeItems(newItems);
  };

  const formatGratitudeContent = () => {
    return gratitudeItems
      .map((item, i) => 
        `**Aspecto ${i + 1}:** ${item.aspect}\n**Significado:** ${item.meaning}`
      )
      .join('\n\n---\n\n');
  };

  const isGratitudeActivity = (title: string) => title === 'Lista de Gratidão';
  const isAffirmationActivity = (title: string) => title === 'Afirmação de Potencial';
  const isManifestoActivity = (title: string) => title.toLowerCase().includes('manifesto');
  const isFamilyTreeActivity = (title: string) => title.toLowerCase().includes('árvore da gratidão') || title.toLowerCase().includes('arvore da gratidao');

  // Estado para compartilhar manifesto no mural
  const [shareManifesto, setShareManifesto] = useState(false);

  const isGratitudeComplete = gratitudeItems.every(item => item.aspect.trim() && item.meaning.trim());

  // Garante que a página de atividade sempre reflita o estado mais recente do banco
  // (ex: quando um professor/admin exclui a submissão para liberar reenvio)
  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;

    (async () => {
      try {
        setIsRefreshing(true);
        await refreshData();
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, id, refreshData]);

  if (!user || !id) return null;

  const activity = activities.find(a => a.id === id);
  if (!activity) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Atividade não encontrada</h2>
          <Link to="/jornadas">
            <Button variant="link">Voltar para jornadas</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const station = stations.find(s => s.id === activity.station_id);
  const journey = station ? journeys.find(j => j.id === station.journey_id) : null;
  const activityQuestions = quizQuestions.filter(q => q.activity_id === activity.id);

  const existingSubmission = submissions.find(
    s => s.activity_id === activity.id && s.user_id === user.id
  );

  const handleRefreshStatus = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      toast.success('Status atualizado.');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Não foi possível atualizar o status agora.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (canvasData?: string) => {
    setIsSubmitting(true);

    let content = '';
    let answers: number[] | undefined;
    let score: number | undefined;

    if (activity.type === 'quiz' && activityQuestions.length > 0) {
      answers = quizAnswers;
      const correctCount = activityQuestions.reduce((acc, q, i) => {
        return acc + (quizAnswers[i] === q.correct_answer ? 1 : 0);
      }, 0);
      score = Math.round((correctCount / activityQuestions.length) * 100);
      content = `Quiz completado com ${score}% de acertos`;
    } else if (activity.type === 'essay') {
      content = isGratitudeActivity(activity.title) ? formatGratitudeContent() : essayContent;
    } else if (activity.type === 'upload' && uploadFile) {
      content = `Arquivo: ${uploadFile.name}`;
    } else if (activity.type === 'gamified') {
      if (canvasData) {
        content = canvasData;
        score = 100;
      } else {
        score = Math.floor(Math.random() * 30) + 70;
        content = `Atividade gamificada completada com ${score} pontos!`;
      }
    }

    await submitActivity({
      activity_id: activity.id,
      user_id: user.id,
      content,
      answers,
      score: activity.type === 'quiz' ? score : undefined,
    });

    // Se é manifesto e a opção de compartilhar está marcada, postar no mural
    if (activity.type === 'essay' && isManifestoActivity(activity.title) && shareManifesto) {
      try {
        await supabase.from('forum_posts').insert({
          activity_id: activity.id,
          user_id: user.id,
          content: essayContent,
          color: 'bg-accent/10',
        });
        toast.success('Seu manifesto foi compartilhado no mural coletivo!');
      } catch (error) {
        console.error('Error sharing manifesto to forum:', error);
      }
    }

    // Check for first activity badge
    const userSubmissions = submissions.filter(s => s.user_id === user.id);
    if (userSubmissions.length === 0) {
      const firstActivityBadge = userBadges.find(ub => ub.user_id === user.id && ub.badge_id && ub.badge_id.includes('first'));
      if (!firstActivityBadge) {
        // Award badge logic would go here
        toast.success('🎯 Conquista desbloqueada: Primeira Atividade!');
      }
    }

    toast.success('Atividade enviada com sucesso!');
    setIsSubmitting(false);

    if (journey) {
      navigate(`/jornadas/${journey.id}`);
    }
  };

  const Icon = activityIcons[activity.type];

  // Parse description to highlight the main question
  const parseDescription = (desc: string) => {
    if (!desc) return { intro: '', question: '', outro: '' };
    
    // Look for text between ** markers (markdown bold)
    const match = desc.match(/^(.*?)\*\*(.*?)\*\*(.*?)$/s);
    if (match) {
      return {
        intro: match[1].trim(),
        question: match[2].trim(),
        outro: match[3].trim()
      };
    }
    return { intro: desc, question: '', outro: '' };
  };

  const parsedDescription = activity.description ? parseDescription(activity.description) : null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                <Icon className="h-3 w-3" />
                {activityLabels[activity.type]}
              </Badge>
              <Badge className="bg-accent text-primary hover:bg-accent/90">+{activity.points} pontos</Badge>
            </div>
            {station && (
              <p className="text-sm text-muted-foreground">
                {journey?.title} • {station.title}
              </p>
            )}
          </div>
        </div>

        {/* Already Submitted - Gamified with Mural */}
        {existingSubmission && activity.type === 'gamified' && existingSubmission.content?.startsWith('data:image/') && (
          <Card className="border-primary/20 overflow-hidden">
            <div className="bg-primary py-6 px-6">
              <h1 className="text-2xl md:text-3xl font-cinzel text-accent text-center tracking-wide">
                {activity.title}
              </h1>
            </div>
            
            <CardContent className="pt-6 space-y-6">
              {/* Success Badge */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Mural criado com sucesso!</p>
                  <p className="text-sm text-green-700">
                    Enviado em {new Date(existingSubmission.submitted_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {/* Mural Label */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Mural</span>
                <div className="flex-1 h-px bg-primary/20"></div>
              </div>
              
              {/* Mural Image */}
              <div className="border-2 border-primary/30 rounded-lg overflow-hidden bg-cream p-2">
                <img 
                  src={existingSubmission.content} 
                  alt="Meu Mural"
                  className="w-full h-auto rounded"
                />
              </div>
              
              {/* Feedback if exists - conditional visibility for students */}
              {existingSubmission.feedback && (user.role !== 'aluno' || showFeedbackToStudents) && (
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm font-medium text-primary mb-1">Feedback da Mentora:</p>
                  <p className="text-muted-foreground">{existingSubmission.feedback}</p>
                </div>
              )}

              {/* Allow student to refresh status after admin clears submission */}
              {user.role === 'aluno' && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleRefreshStatus} disabled={isRefreshing}>
                    {isRefreshing ? 'Atualizando...' : 'Atualizar status'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Already Submitted - Other types */}
        {existingSubmission && !(activity.type === 'gamified' && existingSubmission.content?.startsWith('data:image/')) && (
          <Card className="border-green-500/50 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Atividade já enviada</h3>
                  <p className="text-sm text-green-700">
                    Enviada em {new Date(existingSubmission.submitted_at).toLocaleDateString('pt-BR')}
                    {(user.role !== 'aluno' || showScoreToStudents) && existingSubmission.score !== undefined && ` • Nota: ${existingSubmission.score}%`}
                  </p>
                  {(user.role !== 'aluno' || showFeedbackToStudents) && existingSubmission.feedback && (
                    <p className="text-sm mt-2 p-2 bg-white rounded border border-green-200">
                      <span className="font-medium">Feedback:</span> {existingSubmission.feedback}
                    </p>
                  )}

                  {user.role === 'aluno' && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleRefreshStatus} disabled={isRefreshing}>
                        {isRefreshing ? 'Atualizando...' : 'Atualizar status'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Content - Forum always shows, others only if not submitted */}
        {((!existingSubmission || activity.type === 'forum') && user.role === 'aluno') && (
          <Card className="border-primary/20 overflow-hidden">
            {/* Activity Title Banner */}
            <div className="bg-primary py-6 px-6">
              <h1 className="text-2xl md:text-3xl font-cinzel text-accent text-center tracking-wide">
                {activity.title}
              </h1>
            </div>
            
            <CardContent className="pt-8 space-y-6">
              {/* Orientation Section - Skip for gamified, forum, Lista de Gratidão, Árvore da Gratidão, and Manifesto which handle their own */}
              {activity.description && activity.type !== 'gamified' && activity.type !== 'forum' && !isGratitudeActivity(activity.title) && !isManifestoActivity(activity.title) && !isFamilyTreeActivity(activity.title) && (
                <div className="space-y-6">
                  {/* Orientation Label with Font Size Control */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
                      <div className="flex-1 h-px bg-primary/20"></div>
                    </div>
                    <FontSizeControl />
                  </div>
                  
                  {/* Intro Text or Plain Description */}
                  {parsedDescription?.intro && (
                    <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                      {parsedDescription.intro}
                    </p>
                  )}
                  
                  {/* Highlighted Question (if markdown bold exists) */}
                  {parsedDescription?.question && (
                    <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
                      <p className={`text-primary font-medium italic leading-relaxed ${fontSizeClass}`}>
                        "{parsedDescription.question}"
                      </p>
                    </div>
                  )}
                  
                  {/* Outro Text */}
                  {parsedDescription?.outro && (
                    <p className={`text-muted-foreground leading-relaxed ${fontSizeClass}`}>
                      {parsedDescription.outro}
                    </p>
                  )}
                </div>
              )}

              {/* Quiz */}
              {activity.type === 'quiz' && activityQuestions.length > 0 && (
                <div className="space-y-6">
                  {activityQuestions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-3">
                      <Label className="text-base font-medium">
                        {qIndex + 1}. {question.question}
                      </Label>
                      <RadioGroup
                        value={quizAnswers[qIndex]?.toString()}
                        onValueChange={(value) => {
                          const newAnswers = [...quizAnswers];
                          newAnswers[qIndex] = parseInt(value);
                          setQuizAnswers(newAnswers);
                        }}
                      >
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                            <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}

              {/* Essay - Lista de Gratidão */}
              {activity.type === 'essay' && isGratitudeActivity(activity.title) && (
                <div className="space-y-6">
                  {/* Orientação específica para Lista de Gratidão */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
                        <div className="flex-1 h-px bg-primary/20"></div>
                      </div>
                      <FontSizeControl />
                    </div>
                    <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                      A gratidão nos conecta com o presente e nos permite reconhecer a abundância que já existe em nossas vidas. É um exercício de amor e consciência.
                    </p>
                    <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                      Liste cinco aspectos da sua vida pelos quais você se sente grata. Ao lado de cada um, escreva brevemente por que esse aspecto é significativo para você.
                    </p>
                    <p className={`text-muted-foreground leading-relaxed ${fontSizeClass}`}>
                      Pode ser algo simples ou profundo, recente ou antigo — o que importa é o sentimento verdadeiro que cada item desperta em você. Reserve um tempo para sentir essa gratidão florescer em seu coração enquanto escreve.
                    </p>
                  </div>

                  {/* Label dos campos */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Lista de Gratidão</span>
                    <div className="flex-1 h-px bg-primary/20"></div>
                  </div>
                  
                  {gratitudeItems.map((item, index) => (
                    <Card key={index} className="bg-cream/50 border-primary/10 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-cinzel text-accent flex items-center gap-2">
                          <Heart className="h-4 w-4 fill-accent/30" />
                          Aspecto {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-primary/80 font-medium">Pelo que você é grata?</Label>
                          <Input
                            value={item.aspect}
                            onChange={(e) => updateGratitudeItem(index, 'aspect', e.target.value)}
                            placeholder="Ex: Minha família, minha saúde, meu trabalho..."
                            className="border-primary/20 focus:border-primary bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-primary/80 font-medium">O que isso significa para você?</Label>
                          <Textarea
                            value={item.meaning}
                            onChange={(e) => updateGratitudeItem(index, 'meaning', e.target.value)}
                            placeholder="Explique brevemente por que esse aspecto é significativo para você..."
                            rows={2}
                            className="resize-none border-primary/20 focus:border-primary bg-background"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    {isGratitudeComplete ? (
                      <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Todos os 5 aspectos preenchidos
                      </span>
                    ) : (
                      `Preencha todos os 5 aspectos para enviar sua lista`
                    )}
                  </p>
                </div>
              )}

              {/* Essay - Manifesto Pessoal */}
              {activity.type === 'essay' && isManifestoActivity(activity.title) && (
                <div className="space-y-6">
                  {/* Orientação do Manifesto */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
                        <div className="flex-1 h-px bg-primary/20"></div>
                      </div>
                      <FontSizeControl />
                    </div>
                    
                    <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                      Nesta etapa, convidamos você a reunir as percepções, sentimentos e descobertas que floresceram ao longo das estações para dar forma ao seu <strong className="text-primary">Manifesto Pessoal do Ser Feminino</strong>.
                    </p>
                    
                    <div className="bg-accent/10 border-l-4 border-accent p-5 rounded-r-lg space-y-3">
                      <p className={`text-primary font-medium ${fontSizeClass}`}>
                        Escreva um pequeno texto no qual você compartilhe:
                      </p>
                      <ul className={`list-disc list-inside space-y-2 text-foreground ${fontSizeClass}`}>
                        <li>O que descobriu sobre sua <strong className="text-primary">essência feminina</strong> a partir das vivências e reflexões realizadas;</li>
                        <li>Como deseja <strong className="text-primary">expressar essa essência</strong> no mundo, em suas ações, escolhas e relações.</li>
                      </ul>
                    </div>
                    
                    <p className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                      Pense neste manifesto como uma <em>declaração viva</em> dos seus valores, da sua visão de mundo e da mulher que você está se tornando. Ele pode ser íntimo ou compartilhado, poético ou direto — <strong className="text-primary">o mais importante é que ele seja verdadeiro e alinhado com sua alma</strong>.
                    </p>
                    
                    <div className="flex items-start gap-3 bg-cream/50 border border-primary/10 p-4 rounded-lg">
                      <span className="text-xl">💡</span>
                      <p className={`text-muted-foreground italic ${fontSizeClass}`}>
                        <strong>Lembrete:</strong> Um manifesto pessoal é uma declaração escrita de suas ideias e valores, um texto argumentativo que delineia seus objetivos de vida e ajuda a focar no que realmente importa.
                      </p>
                    </div>
                  </div>

                  {/* Campo de texto do Manifesto */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Manifesto</span>
                      <div className="flex-1 h-px bg-primary/20"></div>
                    </div>
                    
                    <Textarea
                      placeholder="Eu sou uma mulher que..."
                      value={essayContent}
                      onChange={(e) => setEssayContent(e.target.value)}
                      rows={12}
                      className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-cream/30 text-base leading-relaxed"
                    />
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Mínimo de 150 caracteres. Atual: <span className={essayContent.length >= 150 ? 'text-green-600 font-medium' : ''}>{essayContent.length}</span>
                      </p>
                    </div>
                    
                    {/* Checkbox para compartilhar */}
                    <label className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={shareManifesto}
                        onChange={(e) => setShareManifesto(e.target.checked)}
                        className="w-5 h-5 rounded border-primary/30 text-accent focus:ring-accent/50"
                      />
                      <span className="text-sm text-foreground">
                        Compartilhar meu manifesto no <strong className="text-primary">mural coletivo</strong>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Essay - Árvore da Gratidão */}
              {activity.type === 'essay' && isFamilyTreeActivity(activity.title) && (
                <FamilyTreeActivity
                  description={activity.description}
                  onSubmit={async (content) => {
                    setIsSubmitting(true);
                    await submitActivity({
                      activity_id: activity.id,
                      user_id: user.id,
                      content,
                    });
                    toast.success('Árvore da Gratidão enviada com sucesso!');
                    setIsSubmitting(false);
                    if (journey) {
                      navigate(`/jornadas/${journey.id}`);
                    }
                  }}
                  isSubmitting={isSubmitting}
                  fontSizeClass={fontSizeClass}
                />
              )}

              {/* Essay - Genérico (não é Gratidão, Manifesto ou Árvore) */}
              {activity.type === 'essay' && !isGratitudeActivity(activity.title) && !isManifestoActivity(activity.title) && !isFamilyTreeActivity(activity.title) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Resposta</span>
                    <div className="flex-1 h-px bg-primary/20"></div>
                  </div>
                  <Textarea
                    placeholder="Escreva seu relato aqui..."
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    rows={10}
                    className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-cream/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 100 caracteres. Atual: <span className={essayContent.length >= 100 ? 'text-green-600 font-medium' : ''}>{essayContent.length}</span>
                  </p>
                </div>
              )}

              {/* Upload */}
              {activity.type === 'upload' && (
                <div className="space-y-2">
                  <Label className="text-primary font-semibold">Selecione o arquivo</Label>
                  <Input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="cursor-pointer border-primary/30 focus:border-primary"
                  />
                  {uploadFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {uploadFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Gamified - Afirmação de Potencial (Word Roulette) */}
              {activity.type === 'gamified' && isAffirmationActivity(activity.title) && (
                <div className="space-y-6">
                  {/* Orientação */}
                  {activity.description && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
                          <div className="flex-1 h-px bg-primary/20"></div>
                        </div>
                        <FontSizeControl />
                      </div>
                      {/* Parse and render orientation text */}
                      {activity.description.split('\n\n').map((paragraph, idx) => {
                        // Skip lines starting with "Orientação:"
                        const cleanParagraph = paragraph.replace(/^Orientação:\s*/i, '').trim();
                        if (!cleanParagraph) return null;
                        
                        // Check if it's the "Dica:" line
                        if (cleanParagraph.toLowerCase().startsWith('dica:')) {
                          return (
                            <p key={idx} className={`text-muted-foreground italic leading-relaxed ${fontSizeClass}`}>
                              💡 {cleanParagraph}
                            </p>
                          );
                        }
                        
                        return (
                          <p key={idx} className={`text-foreground leading-relaxed ${fontSizeClass}`}>
                            {cleanParagraph}
                          </p>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Word Roulette Component */}
                  <WordRoulette 
                    onSubmit={async (content, shareToForum) => {
                      // Submit the affirmation
                      await handleSubmit(content);
                      
                      // If share to forum is checked, also post to forum
                      if (shareToForum && user) {
                        try {
                          await supabase.from('forum_posts').insert({
                            activity_id: activity.id,
                            user_id: user.id,
                            content: content,
                            color: 'bg-accent/10',
                          });
                          toast.success('Sua afirmação foi compartilhada no mural coletivo!');
                        } catch (error) {
                          console.error('Error sharing to forum:', error);
                        }
                      }
                    }}
                    isSubmitting={isSubmitting}
                    fontSizeClass={fontSizeClass}
                  />
                </div>
              )}

              {/* Gamified - Vision Board (other gamified activities) */}
              {activity.type === 'gamified' && !isAffirmationActivity(activity.title) && (
                <div className="space-y-6">
                  {/* Display description as HTML */}
                  {activity.description && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
                          <div className="flex-1 h-px bg-primary/20"></div>
                        </div>
                        <FontSizeControl />
                      </div>
                      <div 
                        className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary [&_em]:italic [&_em]:text-muted-foreground ${fontSizeClass}`}
                        dangerouslySetInnerHTML={{ __html: activity.description }}
                      />
                    </div>
                  )}
                  
                  {/* Vision Board Canvas */}
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Mural</span>
                      <div className="flex-1 h-px bg-primary/20"></div>
                    </div>
                    <VisionBoardCanvas 
                      onSave={(imageData) => {
                        handleSubmit(imageData);
                      }}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Forum */}
              {activity.type === 'forum' && (
                <ForumBoard 
                  activityId={activity.id}
                  description={activity.description}
                />
              )}
            </CardContent>
            
            {/* Footer with submit button - hide for gamified, forum, and family tree since they have their own */}
            {activity.type !== 'gamified' && activity.type !== 'forum' && !isFamilyTreeActivity(activity.title) && (
              <CardFooter className="bg-cream/30 border-t border-primary/10 py-6">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || (
                    (activity.type === 'quiz' && quizAnswers.length !== activityQuestions.length) ||
                    (activity.type === 'essay' && isGratitudeActivity(activity.title) && !isGratitudeComplete) ||
                    (activity.type === 'essay' && isManifestoActivity(activity.title) && essayContent.length < 150) ||
                    (activity.type === 'essay' && !isGratitudeActivity(activity.title) && !isManifestoActivity(activity.title) && !isFamilyTreeActivity(activity.title) && essayContent.length < 100) ||
                    (activity.type === 'upload' && !uploadFile)
                  )}
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Atividade'}
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {/* View/Edit for Professors and Admins */}
        {user.role !== 'aluno' && (
          <Card className="border-primary/20">
            <div className="bg-primary py-4 px-6 flex items-center justify-between">
              <h2 className="text-xl font-cinzel text-accent">Detalhes da Atividade</h2>
              {!isEditingActivity ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditTitle(activity.title);
                    setEditDescription(activity.description || '');
                    setIsEditingActivity(true);
                  }}
                  className="text-accent hover:text-accent/80 hover:bg-accent/10"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingActivity(false)}
                    className="text-accent hover:text-accent/80 hover:bg-accent/10"
                    disabled={isSavingActivity}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      setIsSavingActivity(true);
                      await updateActivity(activity.id, {
                        title: editTitle,
                        description: editDescription,
                      });
                      setIsEditingActivity(false);
                      setIsSavingActivity(false);
                      toast.success('Atividade atualizada com sucesso!');
                    }}
                    className="bg-accent text-primary hover:bg-accent/90"
                    disabled={isSavingActivity}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSavingActivity ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>
            <CardHeader>
              {isEditingActivity ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-primary">Título</Label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="font-cinzel text-lg border-primary/30 focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-primary">Descrição / Orientação</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={12}
                      className="resize-none border-primary/30 focus:border-accent text-sm"
                      placeholder="Digite a orientação da atividade..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Dica: Use quebras de linha para separar parágrafos. O texto será exibido como orientação para as alunas.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="font-cinzel text-primary">{activity.title}</CardTitle>
                  {activity.description && (
                    <div 
                      className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line"
                    >
                      {activity.description}
                    </div>
                  )}
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-primary">Tipo</p>
                  <p className="text-muted-foreground">{activityLabels[activity.type]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Pontos</p>
                  <p className="text-muted-foreground">{activity.points}</p>
                </div>
                {activity.type === 'quiz' && activityQuestions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-primary mb-2">Questões ({activityQuestions.length})</p>
                    <div className="space-y-2">
                      {activityQuestions.map((q, i) => (
                        <div key={q.id} className="p-3 bg-cream/50 rounded-lg border border-primary/10">
                          <p className="font-medium">{i + 1}. {q.question}</p>
                          <p className="text-sm text-green-600 mt-1">
                            Resposta: {q.options[q.correct_answer]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activity.type === 'forum' && (
                  <ForumBoard 
                    activityId={activity.id}
                    description={activity.description}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Voltar no final da página */}
        <div className="pt-4 pb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
