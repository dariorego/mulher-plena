import { useData } from '@/contexts/DataContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface JourneyStatusIconsProps {
  userId: string;
}

export function JourneyStatusIcons({ userId }: JourneyStatusIconsProps) {
  const { journeys, journeyAccess, getJourneyProgress } = useData();

  const sortedJourneys = [...journeys].sort((a, b) => a.order_index - b.order_index);

  const getStatus = (journeyId: string): { color: string; label: string; progress: number } => {
    const hasAccess = journeyAccess.some(a => a.user_id === userId && a.journey_id === journeyId);
    const progress = getJourneyProgress(userId, journeyId);

    if (!hasAccess) return { color: 'bg-muted-foreground/30', label: 'Não contratada', progress: 0 };
    if (progress >= 100) return { color: 'bg-green-500', label: 'Finalizada', progress: 100 };
    if (progress > 0) return { color: 'bg-yellow-500', label: 'Em andamento', progress };
    return { color: 'bg-red-500', label: 'Não iniciada', progress: 0 };
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {sortedJourneys.map((journey) => {
          const { color, label, progress } = getStatus(journey.id);
          return (
            <Tooltip key={journey.id}>
              <TooltipTrigger asChild>
                <div
                  className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-[11px] font-semibold text-white cursor-default select-none`}
                >
                  {journey.order_index}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{journey.title}</p>
                <p>{label} — {progress}%</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
