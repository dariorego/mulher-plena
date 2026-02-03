import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSizeLevel = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const FONT_SIZE_KEY = 'app-font-size-level';

const sizeLabels: Record<FontSizeLevel, string> = {
  sm: 'Pequeno',
  md: 'Médio',
  lg: 'Grande',
  xl: 'Muito Grande',
  '2xl': 'Extra Grande',
};

// Valores em px para cada nível
const fontSizeValues: Record<FontSizeLevel, { size: string; lineHeight: string }> = {
  sm: { size: '8px', lineHeight: '1.4' },
  md: { size: '12px', lineHeight: '1.5' },
  lg: { size: '14px', lineHeight: '1.6' },
  xl: { size: '16px', lineHeight: '1.7' },
  '2xl': { size: '20px', lineHeight: '1.8' },
};

const sizeOrder: FontSizeLevel[] = ['sm', 'md', 'lg', 'xl', '2xl'];

interface FontSizeContextType {
  size: FontSizeLevel;
  sizeClass: string;
  sizeLabel: string;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<FontSizeLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      if (saved && sizeOrder.includes(saved as FontSizeLevel)) {
        return saved as FontSizeLevel;
      }
    }
    return 'md';
  });

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, size);
    
    // Aplicar variáveis CSS globais no :root
    const values = fontSizeValues[size];
    document.documentElement.style.setProperty('--app-font-size', values.size);
    document.documentElement.style.setProperty('--app-line-height', values.lineHeight);
  }, [size]);

  const increase = () => {
    const currentIndex = sizeOrder.indexOf(size);
    if (currentIndex < sizeOrder.length - 1) {
      setSize(sizeOrder[currentIndex + 1]);
    }
  };

  const decrease = () => {
    const currentIndex = sizeOrder.indexOf(size);
    if (currentIndex > 0) {
      setSize(sizeOrder[currentIndex - 1]);
    }
  };

  const reset = () => setSize('md');

  const canIncrease = sizeOrder.indexOf(size) < sizeOrder.length - 1;
  const canDecrease = sizeOrder.indexOf(size) > 0;

  return (
    <FontSizeContext.Provider
      value={{
        size,
        sizeClass: `text-size-${size}`,
        sizeLabel: sizeLabels[size],
        increase,
        decrease,
        reset,
        canIncrease,
        canDecrease,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
