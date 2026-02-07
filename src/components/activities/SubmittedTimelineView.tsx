import { useMemo, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [selectedMoment, setSelectedMoment] = useState<{ moment: ParsedMoment; index: number } | null>(null);

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
        /* ── Mobile: vertical timeline ── */
        <div className="relative pl-8 py-2">
          <div className="absolute left-[14px] top-4 bottom-4 w-[3px] bg-accent/40 rounded-full" />
          <div className="space-y-5">
            {moments.map((m, i) => (
              <div
                key={i}
                className="relative flex items-start gap-4 cursor-pointer group"
                onClick={() => setSelectedMoment({ moment: m, index: i })}
              >
                <div
                  className="absolute left-[-22px] top-0.5 w-6 h-6 rounded-full border-[3px] border-background shadow-md z-10 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: getColor(i) }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-accent">{m.year}</span>
                  <p className="text-sm font-semibold text-foreground leading-tight">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Desktop: full-width horizontal timeline ── */
        <div className="relative py-6">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${moments.length}, 1fr)` }}>
            {moments.map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                {/* Year */}
                <span className="text-xs font-bold text-primary mb-3">{m.year}</span>

                {/* Circle + connector row */}
                <div className="relative flex items-center w-full justify-center h-8">
                  {/* Left connector */}
                  {i > 0 && (
                    <div className="absolute right-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
                  )}
                  {/* Right connector */}
                  {i < moments.length - 1 && (
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-1/2 bg-accent/60" />
                  )}

                  {/* Clickable circle */}
                  <button
                    type="button"
                    onClick={() => setSelectedMoment({ moment: m, index: i })}
                    className="relative z-10 w-8 h-8 rounded-full border-[3px] border-white shadow-md cursor-pointer transition-all hover:scale-125 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    style={{ backgroundColor: getColor(i) }}
                    title={`${m.year} – ${m.title}`}
                  />
                </div>

                {/* Title & description preview */}
                <span className="text-xs font-semibold text-foreground mt-3 text-center px-2 truncate max-w-full">
                  {m.title}
                </span>
                {m.description && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 text-center px-2 line-clamp-2 max-w-full">
                    {m.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Pop-up ── */}
      <Dialog open={!!selectedMoment} onOpenChange={() => setSelectedMoment(null)}>
        <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden p-0">
          {selectedMoment && (
            <>
              {/* Colored header */}
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ backgroundColor: getColor(selectedMoment.index) + '18' }}
              >
                <div
                  className="w-10 h-10 rounded-full border-[3px] border-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: getColor(selectedMoment.index) }}
                />
                <DialogHeader className="flex-1 space-y-0 text-left">
                  <p className="text-xs font-bold text-accent">{selectedMoment.moment.year}</p>
                  <DialogTitle className="text-lg font-semibold text-primary leading-tight">
                    {selectedMoment.moment.title}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Content body */}
              <div className="px-6 pb-6 pt-4">
                {selectedMoment.moment.description ? (
                  <p className="text-foreground leading-relaxed">{selectedMoment.moment.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma descrição adicionada para este momento.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
