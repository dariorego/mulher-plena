import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Station } from '@/types';
import { Pencil, Trash2, GripVertical, Eye } from 'lucide-react';

interface StationCardProps {
  station: Station;
  activityCount: number;
  onEdit: (station: Station) => void;
  onDelete: (station: Station) => void;
}

export function StationCard({ station, activityCount, onEdit, onDelete }: StationCardProps) {
  const navigate = useNavigate();

  const handleViewStation = () => {
    navigate(`/estacao/${station.id}`);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="flex flex-col">
        {/* Card Image - Clickable */}
        <div 
          className="relative bg-muted cursor-pointer"
          onClick={handleViewStation}
        >
          {station.card_image_url ? (
            <img
              src={station.card_image_url}
              alt={station.title}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center">
              <GripVertical className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
            #{station.order_index + 1}
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div 
            className="cursor-pointer"
            onClick={handleViewStation}
          >
            <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">{station.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">
              {activityCount} {activityCount === 1 ? 'atividade' : 'atividades'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewStation}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(station)}
              className="flex-1 sm:flex-none"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(station)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
