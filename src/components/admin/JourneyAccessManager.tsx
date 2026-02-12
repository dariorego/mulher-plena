import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JourneyAccessManagerProps {
  userId: string;
  userName: string;
}

export function JourneyAccessManager({ userId, userName }: JourneyAccessManagerProps) {
  const { journeys, journeyAccess, grantJourneyAccess, revokeJourneyAccess } = useData();
  const [loadingJourneyId, setLoadingJourneyId] = useState<string | null>(null);

  const advancedJourneys = [...journeys]
    .filter(j => j.order_index > 3)
    .sort((a, b) => a.order_index - b.order_index);

  if (advancedJourneys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Nenhuma jornada avançada (4+) cadastrada.
      </p>
    );
  }

  const handleToggle = async (journeyId: string, currentlyGranted: boolean) => {
    setLoadingJourneyId(journeyId);
    try {
      if (currentlyGranted) {
        await revokeJourneyAccess(userId, journeyId);
        toast({ title: 'Acesso revogado com sucesso' });
      } else {
        await grantJourneyAccess(userId, journeyId);
        toast({ title: 'Acesso liberado com sucesso' });
      }
    } catch (error: any) {
      toast({ title: 'Erro ao alterar acesso', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingJourneyId(null);
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">Liberação de Jornadas</p>
      {advancedJourneys.map((journey) => {
        const isGranted = journeyAccess.some(a => a.user_id === userId && a.journey_id === journey.id);
        const isLoading = loadingJourneyId === journey.id;

        return (
          <div key={journey.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-background">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm truncate">{journey.title}</span>
              {isGranted && (
                <Badge variant="secondary" className="text-xs shrink-0">Liberada</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              <Switch
                checked={isGranted}
                onCheckedChange={() => handleToggle(journey.id, isGranted)}
                disabled={isLoading}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
