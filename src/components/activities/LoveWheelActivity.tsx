import { useState, useCallback } from 'react';
import { Heart, Flower2, Flame, Sun, Infinity, Users, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

// ─── Palette (scoped, not global) ───
const PALETTE = {
  roseburn: '#C9878F',
  gold: '#D4A574',
  lilac: '#B8A9C9',
  peach: '#F5D5C8',
  offwhite: '#FAF7F2',
  goldLight: '#E8C9A0',
  roseSoft: '#E3B5BA',
};

// ─── Houses definition ───
const HOUSES = [
  { label: 'Atitudes de amor que expresso com liberdade', icon: Heart, placeholder: 'Uma atitude de amor que já pratico…', color: PALETTE.roseburn },
  { label: 'Formas de cuidado que ofereço ao outro', icon: Flower2, placeholder: 'Uma forma de cuidado que ofereço…', color: PALETTE.lilac },
  { label: 'Desafios afetivos que já superei', icon: Flame, placeholder: 'Um desafio afetivo que superei…', color: PALETTE.gold },
  { label: 'Aprendizados das minhas relações', icon: Sun, placeholder: 'Um aprendizado das minhas relações…', color: PALETTE.peach },
  { label: 'Atitudes que desejo transformar', icon: Infinity, placeholder: 'Uma atitude que desejo transformar…', color: PALETTE.roseSoft },
  { label: 'Reconhecimento das minhas conquistas emocionais', icon: Users, placeholder: 'Uma conquista emocional que reconheço…', color: PALETTE.goldLight },
];

const MIN_CHARS = 30;

// ─── SVG Mandala Component ───
function MandalaSVG({ completed, size = 200, glow = false }: { completed: boolean[]; size?: number; glow?: boolean }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={PALETTE.peach} strokeWidth="2" opacity="0.5" />
      <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke={PALETTE.peach} strokeWidth="1" opacity="0.3" />

      {/* 6 arc segments */}
      {HOUSES.map((house, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const nextAngle = ((i + 1) * 60 - 90) * (Math.PI / 180);
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(nextAngle);
        const y2 = cy + r * Math.sin(nextAngle);
        const isComplete = completed[i];

        return (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={isComplete ? house.color : PALETTE.offwhite}
              stroke={isComplete ? PALETTE.gold : PALETTE.peach}
              strokeWidth={isComplete ? 2 : 1}
              opacity={isComplete ? 0.85 : 0.4}
              style={{
                transition: 'all 0.6s ease-in-out',
                filter: isComplete ? `drop-shadow(0 0 6px ${PALETTE.gold})` : 'none',
              }}
            />
            {/* Small icon circle at segment center */}
            {(() => {
              const midAngle = ((i * 60 + 30) - 90) * (Math.PI / 180);
              const iconR = r * 0.55;
              const ix = cx + iconR * Math.cos(midAngle);
              const iy = cy + iconR * Math.sin(midAngle);
              return (
                <circle
                  cx={ix}
                  cy={iy}
                  r={8}
                  fill={isComplete ? PALETTE.gold : '#e0d5cc'}
                  opacity={isComplete ? 1 : 0.5}
                  style={{ transition: 'all 0.6s ease-in-out' }}
                />
              );
            })()}
          </g>
        );
      })}

      {/* Center circle */}
      <circle
        cx={cx}
        cy={cy}
        r={18}
        fill={glow ? PALETTE.gold : PALETTE.peach}
        stroke={PALETTE.gold}
        strokeWidth={glow ? 3 : 1}
        style={{
          transition: 'all 0.6s ease-in-out',
          filter: glow ? `drop-shadow(0 0 12px ${PALETTE.gold})` : 'none',
        }}
      />
      {glow && (
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill={PALETTE.offwhite}>✦</text>
      )}
    </svg>
  );
}

// ─── Main Activity Component ───
interface LoveWheelActivityProps {
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass?: string;
}

export function LoveWheelActivity({ description, onSubmit, isSubmitting, fontSizeClass = '' }: LoveWheelActivityProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [texts, setTexts] = useState<string[]>(Array(6).fill(''));

  const completed = texts.map(t => t.trim().length >= MIN_CHARS);
  const completedCount = completed.filter(Boolean).length;
  const allComplete = completedCount === 6;

  const handleStartJourney = useCallback(() => {
    navigator.vibrate?.(50);
    setPhase(1);
  }, []);

  const handleComplete = useCallback(() => {
    // Fire confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [PALETTE.gold, PALETTE.roseburn, PALETTE.lilac, PALETTE.peach],
    });
    setPhase(2);
  }, []);

  const handleSubmit = useCallback(async () => {
    const content = HOUSES.map((house, i) =>
      `**Casa ${i + 1} - ${house.label}:**\n${texts[i].trim()}`
    ).join('\n\n---\n\n');

    const markdown = `### Roda de Amor Consciente\n\n${content}\n\n---\n\n**Progresso:** ${completedCount}/6 casas completas`;
    await onSubmit(markdown);
  }, [texts, completedCount, onSubmit]);

  // ── Phase 0: Opening Screen ──
  if (phase === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 rounded-2xl space-y-8"
        style={{ background: `linear-gradient(135deg, ${PALETTE.offwhite} 0%, ${PALETTE.peach} 100%)` }}
      >
        <div className="animate-fade-in" style={{ animationDelay: '0s' }}>
          <MandalaSVG completed={Array(6).fill(false)} size={180} />
        </div>

        <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: PALETTE.roseburn }}>
            Roda de Amor Consciente
          </h2>
          <p className="text-base md:text-lg max-w-md mx-auto italic" style={{ color: PALETTE.lilac }}>
            "Amar com consciência é abraçar a jornada do coração com liberdade e respeito"
          </p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            onClick={handleStartJourney}
            className="w-full max-w-xs py-6 text-lg font-semibold rounded-xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.roseburn}, ${PALETTE.gold})`,
              color: PALETTE.offwhite,
              border: 'none',
            }}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Iniciar Jornada
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase 2: Celebration ──
  if (phase === 2) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 rounded-2xl space-y-8"
        style={{ background: `linear-gradient(135deg, ${PALETTE.offwhite} 0%, ${PALETTE.peach} 50%, ${PALETTE.roseSoft} 100%)` }}
      >
        <div className="animate-fade-in">
          <MandalaSVG completed={Array(6).fill(true)} size={220} glow />
        </div>

        <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: PALETTE.roseburn }}>
            Você completou a Roda de Amor Consciente!
          </h2>
          <p className="text-base md:text-lg max-w-md mx-auto" style={{ color: PALETTE.lilac }}>
            Sua jornada de amor e transformação é única. Cada passo dado ilumina o caminho para relações mais conscientes.
          </p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-xs py-6 text-lg font-semibold rounded-xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.gold}, ${PALETTE.roseburn})`,
              color: PALETTE.offwhite,
              border: 'none',
            }}
          >
            {isSubmitting ? 'Enviando…' : '✦ Reconhecer minhas conquistas'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase 1: Board ──
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: PALETTE.roseburn }}>
          Roda de Amor Consciente
        </h3>
        <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: PALETTE.peach, color: PALETTE.roseburn }}>
          {completedCount}/6
        </span>
      </div>

      {/* Mini mandala */}
      <MandalaSVG completed={completed} size={140} glow={allComplete} />

      {/* Houses */}
      <div className="space-y-5">
        {HOUSES.map((house, i) => {
          const Icon = house.icon;
          const isComplete = completed[i];

          return (
            <div
              key={i}
              className="rounded-xl p-4 space-y-3 border-2 transition-all duration-500 ease-in-out"
              style={{
                borderColor: isComplete ? PALETTE.gold : PALETTE.peach,
                backgroundColor: isComplete ? `${house.color}15` : PALETTE.offwhite,
                boxShadow: isComplete ? `0 0 16px ${PALETTE.gold}30` : 'none',
              }}
            >
              {/* House header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out"
                  style={{
                    background: isComplete ? PALETTE.gold : PALETTE.peach,
                    boxShadow: isComplete ? `0 0 10px ${PALETTE.gold}50` : 'none',
                  }}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5 transition-transform duration-300" style={{ color: PALETTE.offwhite }} />
                  ) : (
                    <Icon className="h-5 w-5" style={{ color: PALETTE.lilac }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${fontSizeClass}`} style={{ color: isComplete ? PALETTE.roseburn : '#7a6b6b' }}>
                    Casa {i + 1}
                  </p>
                  <p className={`text-xs leading-tight ${fontSizeClass}`} style={{ color: isComplete ? PALETTE.lilac : '#a8999a' }}>
                    {house.label}
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={texts[i]}
                onChange={(e) => {
                  const newTexts = [...texts];
                  newTexts[i] = e.target.value;
                  setTexts(newTexts);
                }}
                placeholder={house.placeholder}
                rows={4}
                className={`w-full min-h-[120px] rounded-lg border p-3 text-base resize-none focus:outline-none focus:ring-2 transition-all duration-300 ${fontSizeClass}`}
                style={{
                  borderColor: isComplete ? PALETTE.gold : PALETTE.peach,
                  backgroundColor: isComplete ? PALETTE.offwhite : '#fff',
                }}
              />

              {/* Character count */}
              <div className="flex justify-end">
                <span className="text-xs" style={{ color: isComplete ? '#6a9f6a' : '#b0a0a0' }}>
                  {texts[i].trim().length}/{MIN_CHARS} caracteres {isComplete && '✓'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      {allComplete && (
        <div className="animate-fade-in">
          <Button
            onClick={handleComplete}
            className="w-full py-5 text-lg font-semibold rounded-xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.roseburn}, ${PALETTE.gold})`,
              color: PALETTE.offwhite,
              border: 'none',
            }}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Completar a Roda
          </Button>
        </div>
      )}

      {/* Sticky progress bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3 z-40 border-t"
        style={{ background: PALETTE.offwhite, borderColor: PALETTE.peach }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Progress value={(completedCount / 6) * 100} className="flex-1 h-3" />
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: PALETTE.roseburn }}>
            {completedCount}/6
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Submitted View ───
interface SubmittedLoveWheelViewProps {
  content: string;
}

export function SubmittedLoveWheelView({ content }: SubmittedLoveWheelViewProps) {
  // Parse markdown content
  const sections = content.split('---').map(s => s.trim()).filter(Boolean);

  const houses: { label: string; text: string }[] = [];

  sections.forEach(section => {
    const match = section.match(/\*\*Casa \d+ - (.+?):\*\*\n([\s\S]*)/);
    if (match) {
      houses.push({ label: match[1].trim(), text: match[2].trim() });
    }
  });

  if (houses.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Mini mandala */}
      <MandalaSVG completed={houses.map(() => true)} size={120} glow />

      {houses.map((house, i) => {
        const Icon = HOUSES[i]?.icon || Heart;
        return (
          <div
            key={i}
            className="rounded-xl p-4 border space-y-2"
            style={{
              borderColor: PALETTE.gold,
              backgroundColor: `${HOUSES[i]?.color || PALETTE.peach}10`,
            }}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: PALETTE.gold }} />
              <span className="text-sm font-semibold" style={{ color: PALETTE.roseburn }}>
                Casa {i + 1} — {house.label}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#5a4a4a' }}>
              {house.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
