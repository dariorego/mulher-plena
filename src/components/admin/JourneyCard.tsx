import { Journey, Station } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ImageOff, Layers } from 'lucide-react';

interface JourneyCardProps {
  journey: Journey;
  stationCount: number;
  onEdit: (journey: Journey) => void;
  onDelete: (journey: Journey) => void;
}

// Strip HTML tags for plain text preview
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function JourneyCard({ journey, stationCount, onEdit, onDelete }: JourneyCardProps) {
  const plainDescription = journey.description ? stripHtml(journey.description) : '';

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="relative bg-muted" style={{ aspectRatio: '1293/253' }}>
        {journey.cover_image ? (
          <img
            src={journey.cover_image}
            alt={journey.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(journey)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(journey)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{journey.title}</h3>
        {plainDescription && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {plainDescription}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="gap-1">
            <Layers className="h-3 w-3" />
            {stationCount} {stationCount === 1 ? 'estação' : 'estações'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
