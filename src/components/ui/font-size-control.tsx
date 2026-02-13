import { Button } from './button';
import { useFontSize } from '@/contexts/FontSizeContext';

interface FontSizeControlProps {
  className?: string;
}

export function FontSizeControl({ className = '' }: FontSizeControlProps) {
  // Componente oculto globalmente — retorna null para não renderizar em nenhuma página
  return null;
}
