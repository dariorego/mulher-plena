import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface JourneyAccessManagerProps {
  userId: string;
  userName: string;
}

export function JourneyAccessManager({ userId, userName }: JourneyAccessManagerProps) {
  const { journeys, journeyAccess, grantJourneyAccess, revokeJourneyAccess, getJourneyProgress } = useData();
  const [loadingJourneyId, setLoadingJourneyId] = useState<string | null>(null);
  const [grantingAll, setGrantingAll] = useState(false);

  const sortedJourneys = [...journeys].sort((a, b) => a.order_index - b.order_index);

  if (sortedJourneys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Nenhuma jornada cadastrada.
      </p>
    );
  }

  // Check if journeys 1-3 are 100% complete
  const prereqJourneys = journeys.filter(j => j.order_index <= 3);
  const prerequisitesMet = prereqJourneys.every(j => getJourneyProgress(userId, j.id) >= 100);

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

  const handleGrantAll = async () => {
    setGrantingAll(true);
    try {
      const toGrant = sortedJourneys.filter((journey) => {
        const isGranted = journeyAccess.some(a => a.user_id === userId && a.journey_id === journey.id);
        const isAdvanced = journey.order_index > 3;
        const canToggle = !isAdvanced || prerequisitesMet;
        return !isGranted && canToggle;
      });
      for (const journey of toGrant) {
        await grantJourneyAccess(userId, journey.id);
      }
      if (toGrant.length > 0) {
        toast({ title: `${toGrant.length} jornada(s) liberada(s) para ${userName}` });
      } else {
        toast({ title: 'Todas as jornadas elegíveis já estão liberadas' });
      }
    } catch (error: any) {
      toast({ title: 'Erro ao liberar jornadas', description: error.message, variant: 'destructive' });
    } finally {
      setGrantingAll(false);
    }
  };

  const allEligibleGranted = sortedJourneys.every((j) => {
    const isGranted = journeyAccess.some(a => a.user_id === userId && a.journey_id === j.id);
    const isAdvanced = j.order_index > 3;
    const canToggle = !isAdvanced || prerequisitesMet;
    return isGranted || !canToggle;
  });

  return (
    <div className="space-y-2 pt-2 border-t">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">Liberação de Jornadas</p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={handleGrantAll}
          disabled={grantingAll || allEligibleGranted}
        >
          {grantingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
          Liberar todas
        </Button>
      </div>
      {sortedJourneys.map((journey) => {
        const isGranted = journeyAccess.some(a => a.user_id === userId && a.journey_id === journey.id);
        const isLoading = loadingJourneyId === journey.id;
        const isAdvanced = journey.order_index > 3;
        const canToggleAdvanced = !isAdvanced || prerequisitesMet;

        return (
          <div key={journey.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-background">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm truncate">{journey.title}</span>
              {isGranted && (
                <span className="text-xs text-primary font-medium shrink-0">Liberada</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isAdvanced && !canToggleAdvanced ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch checked={false} disabled />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Pré-requisitos não cumpridos. O aluno precisa concluir as Jornadas 1, 2 e 3.
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Switch
                  checked={isGranted}
                  onCheckedChange={() => handleToggle(journey.id, isGranted)}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
