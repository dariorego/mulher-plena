import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EvaluationSettings {
  showScoreToStudents: boolean;
  showFeedbackToStudents: boolean;
  videoPercentage: number;
  activityPercentage: number;
  supplementaryPercentage: number;
  podcastPercentage: number;
  sensitiveContentMessage: string;
  loginBackgroundUrl: string;
  headerBorderColor: string;
  progressBarColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

interface SettingsContextType extends EvaluationSettings {
  updateSettings: (settings: Partial<EvaluationSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: EvaluationSettings = {
  showScoreToStudents: true,
  showFeedbackToStudents: true,
  videoPercentage: 35,
  activityPercentage: 35,
  supplementaryPercentage: 20,
  podcastPercentage: 10,
  sensitiveContentMessage: 'Esta atividade aborda temas que podem despertar emoções intensas. Sinta-se à vontade para fazer pausas, cuidar de si e buscar apoio se necessário. Você está em um espaço seguro.',
  loginBackgroundUrl: '',
  headerBorderColor: '#b46ebe',
  progressBarColor: '#2e6682',
  buttonBgColor: '#2D6582',
  buttonTextColor: '#FFFFFF',
};

// Maps frontend camelCase keys to DB snake_case columns
const toDbRow = (s: Partial<EvaluationSettings>): Record<string, unknown> => {
  const map: Record<string, string> = {
    showScoreToStudents: 'show_score_to_students',
    showFeedbackToStudents: 'show_feedback_to_students',
    videoPercentage: 'video_percentage',
    activityPercentage: 'activity_percentage',
    supplementaryPercentage: 'supplementary_percentage',
    podcastPercentage: 'podcast_percentage',
    sensitiveContentMessage: 'sensitive_content_message',
    loginBackgroundUrl: 'login_background_url',
    headerBorderColor: 'header_border_color',
    progressBarColor: 'progress_bar_color',
    buttonBgColor: 'button_bg_color',
    buttonTextColor: 'button_text_color',
  };
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(s)) {
    const col = map[key];
    if (col) row[col] = value;
  }
  return row;
};

const fromDbRow = (row: Record<string, unknown>): EvaluationSettings => ({
  showScoreToStudents: row.show_score_to_students as boolean,
  showFeedbackToStudents: row.show_feedback_to_students as boolean,
  videoPercentage: row.video_percentage as number,
  activityPercentage: row.activity_percentage as number,
  supplementaryPercentage: row.supplementary_percentage as number,
  podcastPercentage: row.podcast_percentage as number,
  sensitiveContentMessage: row.sensitive_content_message as string,
  loginBackgroundUrl: row.login_background_url as string,
  headerBorderColor: row.header_border_color as string,
  progressBarColor: row.progress_bar_color as string,
  buttonBgColor: row.button_bg_color as string,
  buttonTextColor: row.button_text_color as string,
});

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EvaluationSettings>(defaultSettings);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        if (data) {
          setSettingsId(data.id);
          setSettings(fromDbRow(data as Record<string, unknown>));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<EvaluationSettings>) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Persist to Supabase
    if (settingsId) {
      const dbData = toDbRow(newSettings);
      supabase
        .from('system_settings')
        .update({ ...dbData, updated_at: new Date().toISOString() })
        .eq('id', settingsId)
        .then(({ error }) => {
          if (error) {
            console.error('Error saving settings:', error);
          }
        });
    }
  }, [settingsId]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, isLoading }}>
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
