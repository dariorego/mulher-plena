import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ParsedMoment {
  year: string;
  title: string;
  description: string;
}

const TIMELINE_COLORS = [
  '#C9A84C', '#C94C6E', '#4C7BC9', '#9B59B6',
  '#27AE60', '#E67E22', '#E74C3C', '#1ABC9C',
];

function parseMarkdownTimeline(content: string): ParsedMoment[] {
  const moments: ParsedMoment[] = [];
  // Match pattern: **YEAR - TITLE**\nOptional description
  const regex = /\*\*(\d{4})\s*-\s*(.+?)\*\*(?:\n([^*]*?))?(?=\n\n\*\*|\s*$)/gs;
  let match;
  while ((match = regex.exec(content)) !== null) {
    moments.push({
      year: match[1],
      title: match[2].trim(),
      description: (match[3] || '').trim(),
    });
  }
  return moments;
}

export function SubmittedTimelineView({ content }: { content: string }) {
  const isMobile = useIsMobile();
  const moments = useMemo(() => parseMarkdownTimeline(content), [content]);
  const getColor = (i: number) => TIMELINE_COLORS[i % TIMELINE_COLORS.length];

  if (moments.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sua Linha do Tempo</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {isMobile ? (
        <div className="relative pl-8 py-2">
          <div className="absolute left-[14px] top-4 bottom-4 w-[3px] bg-accent/40 rounded-full" />
          <div className="space-y-5">
            {moments.map((m, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div
                  className="absolute left-[-22px] top-0.5 w-6 h-6 rounded-full border-[3px] border-background shadow-md z-10"
                  style={{ backgroundColor: getColor(i) }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-accent">{m.year}</span>
                  <p className="text-sm font-semibold text-foreground leading-tight">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative overflow-x-auto py-4">
          <div className="flex items-start gap-0 min-w-max px-4">
            {moments.map((m, i) => (
              <div key={i} className="flex flex-col items-center" style={{ minWidth: 140 }}>
                <span className="text-xs font-bold text-primary mb-2">{m.year}</span>
                <div className="relative flex items-center w-full justify-center">
                  {i > 0 && (
                    <div className="absolute right-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
                  )}
                  {i < moments.length - 1 && (
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
                  )}
                  <div
                    className="relative z-10 w-7 h-7 rounded-full border-[3px] border-white shadow-md"
                    style={{ backgroundColor: getColor(i) }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground mt-2 text-center max-w-[130px] truncate">
                  {m.title}
                </span>
                {m.description && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 text-center max-w-[130px] line-clamp-2">
                    {m.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
