import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Send, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
const WORDS = ['SABEDORIA', 'AMOR', 'VIDA', 'PROVISÃO', 'ALEGRIA', 'HARMONIA', 'ACOLHER', 'TRANSFORMAR', 'VERDADE', 'ESSÊNCIA', 'PLENITUDE', 'SUAVIDADE', 'FORÇA', 'DESPERTAR', 'LIBERTAÇÃO', 'JORNADA', 'CORAGEM', 'MATURIDADE', 'DECISÃO', 'CALMA', 'LEVEZA', 'PROPÓSITO', 'MISSÃO', 'SAGRADA'];

// Cores vibrantes para os segmentos da roleta
const SEGMENT_COLORS = ['#7B2D42',
// burgundy
'#C9A84C',
// dourado
'#2D5A7B',
// azul escuro
'#7B5A2D',
// marrom
'#5A2D7B',
// roxo
'#2D7B5A',
// verde escuro
'#C94C4C',
// vermelho
'#4C7BC9',
// azul
'#7B2D5A',
// magenta
'#5A7B2D',
// verde oliva
'#C97B4C',
// laranja
'#4CC9C9' // ciano
];
interface WordRouletteProps {
  onSubmit: (content: string, shareToForum: boolean) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  fontSizeClass?: string;
}
export function WordRoulette({
  onSubmit,
  isSubmitting,
  disabled,
  fontSizeClass = 'text-base'
}: WordRouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [drawnWords, setDrawnWords] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [shareToForum, setShareToForum] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const maxSpins = 5;
  const segmentAngle = 360 / WORDS.length;

  // Gerar SVG da roleta - tamanho maior
  const wheelSegments = useMemo(() => {
    const segments = [];
    const radius = 190;
    const centerX = 200;
    const centerY = 200;
    for (let i = 0; i < WORDS.length; i++) {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const pathData = [`M ${centerX} ${centerY}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, 'Z'].join(' ');

      // Texto posicionado radialmente na fatia (de dentro para fora)
      const textAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);
      const textRadius = radius * 0.62; // Posição do texto na fatia
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      // Rotação para texto ficar radial (apontando para fora)
      const textRotation = (i + 0.5) * segmentAngle + 90;
      segments.push({
        path: pathData,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        word: WORDS[i],
        textX,
        textY,
        textRotation
      });
    }
    return segments;
  }, []);
  const spinRoulette = useCallback(() => {
    if (isSpinning || spinCount >= maxSpins) return;
    setIsSpinning(true);
    setSpinCount(prev => prev + 1);

    // Número de rotações completas + ângulo aleatório final
    const fullRotations = 5 + Math.random() * 3; // 5-8 rotações
    const randomAngle = Math.random() * 360;
    const newRotation = rotation + fullRotations * 360 + randomAngle;
    setRotation(newRotation);

    // Após a animação terminar, determinar a palavra selecionada
    setTimeout(() => {
      // Normalizar a rotação para 0-360
      const normalizedRotation = newRotation % 360;
      // A seta está no topo. Quando a roleta gira X graus no sentido horário,
      // a palavra que fica sob a seta é a que estava em (360 - X) graus
      // Ajustar pelo fato de que o primeiro segmento começa em -90° (topo)
      const adjustedAngle = (360 - normalizedRotation + 360) % 360;
      const segmentIndex = Math.floor(adjustedAngle / segmentAngle) % WORDS.length;
      const word = WORDS[segmentIndex];
      setSelectedWord(word);
      if (!drawnWords.includes(word)) {
        setDrawnWords(prev => [...prev, word]);
      }
      setIsSpinning(false);
    }, 4000); // Tempo da animação
  }, [isSpinning, spinCount, rotation, drawnWords, segmentAngle]);
  const handleSubmit = () => {
    if (affirmation.trim()) {
      onSubmit(affirmation.trim(), shareToForum);
    }
  };
  const canSpin = spinCount < maxSpins && !isSpinning;
  return <div className="space-y-8">
      {/* Roleta de Palavras */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Roleta de Inspiração
          </span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>

        {/* Roda da Roleta */}
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative">
            {/* Ponteiro (seta) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-accent drop-shadow-lg" />
            </div>

            {/* SVG da Roleta */}
            <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-xl" style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}>
              {/* Segmentos */}
              {wheelSegments.map((segment, index) => <g key={index}>
                  <path d={segment.path} fill={segment.color} stroke="#fff" strokeWidth="2" />
                  <text x={segment.textX} y={segment.textY} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${segment.textRotation}, ${segment.textX}, ${segment.textY})`} style={{
                textShadow: '1px 1px 3px rgba(0,0,0,0.6)'
              }}>
                    {segment.word}
                  </text>
                </g>)}
              
              {/* Centro da roleta */}
              <circle cx="200" cy="200" r="50" fill="#FDF8F0" stroke="#7B2D42" strokeWidth="4" />
              <text x="200" y="193" fill="#7B2D42" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{
              fontFamily: 'Cinzel, serif'
            }}>
                Essência
              </text>
              <text x="200" y="210" fill="#7B2D42" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{
              fontFamily: 'Cinzel, serif'
            }}>
                Feminina
              </text>
            </svg>
          </div>

          {/* Palavra Selecionada */}
          {selectedWord && !isSpinning && <div className="animate-fade-in text-center space-y-3">
              <p className="text-sm text-muted-foreground">Palavra sorteada:

          </p>
              <span className="px-6 py-3 bg-accent text-primary rounded-full text-xl font-cinzel font-bold shadow-lg">
                {selectedWord}
              </span>
            </div>}

          {/* Botão Girar */}
          <Button onClick={spinRoulette} disabled={!canSpin || disabled} size="lg" className={cn("gap-2 px-10 py-6 text-lg transition-all", canSpin ? "bg-accent text-primary hover:bg-accent/90 shadow-lg hover:shadow-xl" : "opacity-50")}>
            {isSpinning ? <>
                <span className="animate-spin">🎡</span>
                Girando...
              </> : <>
                🎡 Girar Roleta
              </>}
          </Button>

          <p className="text-sm text-muted-foreground">
            {spinCount}/{maxSpins} giros utilizados
          </p>
        </div>

        {/* Palavras já sorteadas */}
        {drawnWords.length > 0 && <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suas palavras de inspiração:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {drawnWords.map((word, index) => <span key={index} className="px-4 py-2 bg-primary text-accent rounded-full text-sm font-semibold border-2 border-accent/30 shadow-sm">
                  ✨ {word}
                </span>)}
            </div>
          </div>}
      </div>

      {/* Campo de Afirmação */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Sua Afirmação
          </span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>

        <Textarea value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder='Escreva sua frase afirmativa... Ex: "Sou presença acolhedora e luz transformadora por onde passo."' className={cn("min-h-[120px] resize-none border-2 border-primary/20 focus:border-accent", fontSizeClass)} disabled={disabled} />

        <p className={cn("text-muted-foreground italic", fontSizeClass)}>
          💡 Dica: escreva no presente, como se essa verdade já estivesse plenamente viva em você.
        </p>
      </div>

      {/* Opção de Compartilhamento */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-primary/10">
        <Checkbox id="share-forum" checked={shareToForum} onCheckedChange={checked => setShareToForum(checked === true)} disabled={disabled} className="border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
        <Label htmlFor="share-forum" className={cn("cursor-pointer text-foreground", fontSizeClass)}>
          Quero compartilhar minha frase no mural coletivo e inspirar outras mulheres
        </Label>
      </div>

      {/* Botão de Envio */}
      <Button onClick={handleSubmit} disabled={!affirmation.trim() || isSubmitting || disabled} className="w-full py-6 text-lg gap-2 bg-accent text-primary hover:bg-accent/90">
        <Send className="h-5 w-5" />
        {isSubmitting ? 'Enviando...' : 'Enviar Minha Afirmação'}
      </Button>
    </div>;
}