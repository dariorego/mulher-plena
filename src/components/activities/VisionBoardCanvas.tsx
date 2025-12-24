import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { Canvas as FabricCanvas, IText, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Trash2, RotateCcw, Download, Plus, ImagePlus } from 'lucide-react';

interface VisionBoardCanvasProps {
  onSave: (imageData: string) => void;
  isSubmitting: boolean;
}

// Palavras sugeridas
const WORDS = [
  'Força', 'Amor', 'Coragem', 'Essência', 'Beleza', 
  'Liberdade', 'Feminino', 'Poder', 'Graça', 'Luz',
  'Resiliência', 'Sabedoria', 'Intuição', 'Ternura', 'Conexão',
  'Autenticidade', 'Renascimento', 'Florescer', 'Ancestralidade', 'Acolhimento'
];

// Cores da paleta
const COLORS = [
  '#7B2D42', // burgundy
  '#C9A84C', // dourado
  '#E8B4BC', // rosa claro
  '#D4A574', // bege
  '#8B4557', // vinho
  '#9B7B4D', // bronze
  '#F5E6D3', // creme
  '#5D4E37', // marrom
  '#B8860B', // dark golden
  '#DDA0DD', // plum
];

export function VisionBoardCanvas({ onSave, isSubmitting }: VisionBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [canvasReady, setCanvasReady] = useState(false);
  const [customWord, setCustomWord] = useState('');

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 700,
      height: 500,
      backgroundColor: '#FDF8F0',
    });

    setFabricCanvas(canvas);
    setCanvasReady(true);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Add text element
  const addWord = (word: string) => {
    if (!fabricCanvas || !word.trim()) return;
    
    const text = new IText(word, {
      left: 50 + Math.random() * 300,
      top: 50 + Math.random() * 200,
      fontSize: 24,
      fill: selectedColor,
      fontFamily: 'Cinzel, serif',
      fontWeight: 'bold',
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  // Add custom word
  const addCustomWord = () => {
    if (!customWord.trim()) return;
    addWord(customWord.trim());
    setCustomWord('');
  };

  // Handle key press on custom word input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addCustomWord();
    }
  };

  // Add decorative elements
  const addDecorativeElement = (type: 'flower' | 'butterfly' | 'moon' | 'sun' | 'sparkle') => {
    if (!fabricCanvas) return;

    const emojis: Record<string, string> = {
      flower: '🌸',
      butterfly: '🦋',
      moon: '🌙',
      sun: '☀️',
      sparkle: '✨',
    };

    const element = new IText(emojis[type], {
      left: 100 + Math.random() * 300,
      top: 100 + Math.random() * 200,
      fontSize: 50,
      fontFamily: 'Arial',
    });

    fabricCanvas.add(element);
    fabricCanvas.setActiveObject(element);
    fabricCanvas.renderAll();
  };

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      
      try {
        const img = await FabricImage.fromURL(dataUrl);
        
        // Scale image to fit max 180x180
        const maxSize = 180;
        const scale = Math.min(maxSize / (img.width || maxSize), maxSize / (img.height || maxSize));
        img.scale(scale);
        
        img.set({
          left: 100 + Math.random() * 200,
          top: 100 + Math.random() * 150,
          shadow: {
            color: 'rgba(0,0,0,0.15)',
            blur: 8,
            offsetX: 2,
            offsetY: 2,
          } as any,
        });
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete selected object
  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.renderAll();
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#FDF8F0';
    fabricCanvas.renderAll();
  };

  // Save canvas as image
  const handleSave = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Color Palette */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-primary mr-2">Cor:</span>
        {COLORS.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              selectedColor === color ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Canvas Area */}
        <div className="flex-1 border-2 border-primary/30 rounded-lg overflow-hidden bg-[#FDF8F0]">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        {/* Resources Panel */}
        <div className="w-full lg:w-72 bg-primary/5 rounded-lg border border-primary/20 p-4">
          <h3 className="font-cinzel text-primary text-lg mb-4 text-center">Recursos</h3>
          
          <ScrollArea className="h-[450px] pr-2">
            {/* Custom Word Input */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-primary/80 mb-2 uppercase tracking-wide flex items-center gap-1">
                ✍️ Minha Palavra
              </h4>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite sua palavra..."
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-9 text-sm bg-white border-primary/20 focus:border-accent"
                />
                <Button
                  size="sm"
                  onClick={addCustomWord}
                  disabled={!customWord.trim()}
                  className="h-9 px-3 bg-accent hover:bg-accent/90 text-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-primary/80 mb-2 uppercase tracking-wide flex items-center gap-1">
                🖼️ Minha Imagem
              </h4>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <ImagePlus className="h-4 w-4" />
                Enviar Imagem
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-primary/80 mb-2 uppercase tracking-wide">✨ Elementos</h4>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => addDecorativeElement('flower')}
                  className="w-10 h-10 rounded-lg bg-white border border-primary/20 hover:bg-accent/20 flex items-center justify-center text-xl transition-colors"
                >
                  🌸
                </button>
                <button
                  onClick={() => addDecorativeElement('butterfly')}
                  className="w-10 h-10 rounded-lg bg-white border border-primary/20 hover:bg-accent/20 flex items-center justify-center text-xl transition-colors"
                >
                  🦋
                </button>
                <button
                  onClick={() => addDecorativeElement('moon')}
                  className="w-10 h-10 rounded-lg bg-white border border-primary/20 hover:bg-accent/20 flex items-center justify-center text-xl transition-colors"
                >
                  🌙
                </button>
                <button
                  onClick={() => addDecorativeElement('sun')}
                  className="w-10 h-10 rounded-lg bg-white border border-primary/20 hover:bg-accent/20 flex items-center justify-center text-xl transition-colors"
                >
                  ☀️
                </button>
                <button
                  onClick={() => addDecorativeElement('sparkle')}
                  className="w-10 h-10 rounded-lg bg-white border border-primary/20 hover:bg-accent/20 flex items-center justify-center text-xl transition-colors"
                >
                  ✨
                </button>
              </div>
            </div>

            {/* Suggested Words Section */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-primary/80 mb-2 uppercase tracking-wide">💫 Palavras Sugeridas</h4>
              <div className="flex flex-wrap gap-1.5">
                {WORDS.map((word) => (
                  <button
                    key={word}
                    onClick={() => addWord(word)}
                    className="px-2 py-1 text-xs rounded-full bg-white border border-primary/20 text-primary/80 hover:bg-accent hover:text-primary hover:border-accent transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={deleteSelected}
          className="gap-2 border-primary/30 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <Trash2 className="h-4 w-4" />
          Excluir Selecionado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="gap-2 border-primary/30 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar Tudo
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2 bg-accent hover:bg-accent/90 text-primary"
        >
          <Download className="h-4 w-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar Mural'}
        </Button>
      </div>
    </div>
  );
}
