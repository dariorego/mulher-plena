import { Button } from './button';
import { useFontSize } from '@/contexts/FontSizeContext';

interface FontSizeControlProps {
  className?: string;
}

export function FontSizeControl({ className = '' }: FontSizeControlProps) {
  const { sizeLabel, increase, decrease, canIncrease, canDecrease } = useFontSize();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={decrease}
        disabled={!canDecrease}
        className="h-8 w-8 p-0 border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-40"
        aria-label="Diminuir tamanho da fonte"
      >
        <span className="text-xs font-bold">A-</span>
      </Button>
      
      <span className="text-xs text-muted-foreground min-w-[70px] text-center">
        {sizeLabel}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={increase}
        disabled={!canIncrease}
        className="h-8 w-8 p-0 border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-40"
        aria-label="Aumentar tamanho da fonte"
      >
        <span className="text-sm font-bold">A+</span>
      </Button>
    </div>
  );
}
