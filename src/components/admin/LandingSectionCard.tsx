import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical, MousePointerClick } from "lucide-react";
import { LandingSection } from "@/types";

interface LandingSectionCardProps {
  section: LandingSection;
  onEdit: () => void;
  onDelete: () => void;
}

function stripHtml(html: string): string {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function LandingSectionCard({ section, onEdit, onDelete }: LandingSectionCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-muted">
        {section.image_url ? (
          <img
            src={section.image_url}
            alt={section.title || "Seção"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-muted-foreground text-sm">Sem imagem</span>
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            className="gap-1"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>

        {/* Order badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/90 rounded-md px-2 py-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{section.order_index}</span>
        </div>

        {/* CTA badge */}
        {section.is_cta && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
            <MousePointerClick className="h-3 w-3 mr-1" />
            CTA
          </Badge>
        )}

        {/* Inactive badge */}
        {!section.is_active && (
          <Badge variant="secondary" className="absolute bottom-2 right-2">
            Inativo
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-cinzel font-semibold text-primary truncate">
          {section.title || "Seção sem título"}
        </h3>
        {section.content && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {stripHtml(section.content)}
          </p>
        )}
        {section.is_cta && section.cta_text && (
          <p className="text-xs text-accent mt-2">
            Botão: "{section.cta_text}" → {section.cta_link}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
