import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EvaluationSettings {
  showScoreToStudents: boolean;
  showFeedbackToStudents: boolean;
  videoPercentage: number;
  activityPercentage: number;
  supplementaryPercentage: number;
}

interface SettingsContextType extends EvaluationSettings {
  updateSettings: (settings: Partial<EvaluationSettings>) => void;
}

const SETTINGS_KEY = 'evaluation-settings';

const defaultSettings: EvaluationSettings = {
  showScoreToStudents: true,
  showFeedbackToStudents: true,
  videoPercentage: 40,
  activityPercentage: 40,
  supplementaryPercentage: 20,
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
