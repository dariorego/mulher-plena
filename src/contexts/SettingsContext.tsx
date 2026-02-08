import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EvaluationSettings {
  showScoreToStudents: boolean;
  showFeedbackToStudents: boolean;
  videoPercentage: number;
  activityPercentage: number;
  supplementaryPercentage: number;
  podcastPercentage: number;
  sensitiveContentMessage: string;
}

interface SettingsContextType extends EvaluationSettings {
  updateSettings: (settings: Partial<EvaluationSettings>) => void;
}

const SETTINGS_KEY = 'evaluation-settings';

const defaultSettings: EvaluationSettings = {
  showScoreToStudents: true,
  showFeedbackToStudents: true,
  videoPercentage: 35,
  activityPercentage: 35,
  supplementaryPercentage: 20,
  podcastPercentage: 10,
  sensitiveContentMessage: 'Esta atividade aborda temas que podem despertar emoções intensas. Sinta-se à vontade para fazer pausas, cuidar de si e buscar apoio se necessário. Você está em um espaço seguro.',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EvaluationSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<EvaluationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
