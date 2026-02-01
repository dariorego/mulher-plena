import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Journey, Station, Activity, QuizQuestion, ActivitySubmission, UserProgress, Badge, UserBadge } from '@/types';

interface DataContextType {
  journeys: Journey[];
  stations: Station[];
  activities: Activity[];
  quizQuestions: QuizQuestion[];
  submissions: ActivitySubmission[];
  progress: UserProgress[];
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addJourney: (journey: Omit<Journey, 'id' | 'created_at' | 'updated_at'>) => Promise<Journey | null>;
  updateJourney: (id: string, journey: Partial<Journey>) => Promise<void>;
  deleteJourney: (id: string) => Promise<void>;
  addStation: (station: Omit<Station, 'id' | 'created_at'>) => Promise<Station | null>;
  updateStation: (id: string, station: Partial<Station>) => Promise<void>;
  deleteStation: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<Activity | null>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addQuizQuestion: (question: Omit<QuizQuestion, 'id'>) => Promise<QuizQuestion | null>;
  submitActivity: (submission: Omit<ActivitySubmission, 'id' | 'submitted_at'>) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  evaluateSubmission: (id: string, score: number, feedback: string, evaluatorId: string) => Promise<void>;
  updateProgress: (progressData: Omit<UserProgress, 'id'>) => Promise<void>;
  awardBadge: (userId: string, badgeId: string) => Promise<void>;
  getJourneyProgress: (userId: string, journeyId: string) => number;
  getUserStats: (userId: string) => { totalPoints: number; completedActivities: number; averageScore: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        journeysRes,
        stationsRes,
        activitiesRes,
        questionsRes,
        submissionsRes,
        progressRes,
        badgesRes,
        userBadgesRes,
      ] = await Promise.all([
        supabase.from('journeys').select('*').order('order_index'),
        supabase.from('stations').select('*').order('order_index'),
        supabase.from('activities').select('*').order('created_at'),
        supabase.from('quiz_questions').select('*').order('order_index'),
        supabase.from('activity_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('user_progress').select('*'),
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('*'),
      ]);

      if (journeysRes.data) setJourneys(journeysRes.data);
      if (stationsRes.data) setStations(stationsRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data as Activity[]);
      if (questionsRes.data) setQuizQuestions(questionsRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (userBadgesRes.data) setUserBadges(userBadgesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = async () => {
    await fetchData();
  };

  // Journey operations
  const addJourney = async (journey: Omit<Journey, 'id' | 'created_at' | 'updated_at'>): Promise<Journey | null> => {
    const { data, error } = await supabase
      .from('journeys')
      .insert(journey)
      .select()
      .single();

    if (error) {
      console.error('Error adding journey:', error);
      return null;
    }
    setJourneys(prev => [data, ...prev]);
    return data;
  };

  const updateJourney = async (id: string, journey: Partial<Journey>) => {
    const { error } = await supabase
      .from('journeys')
      .update(journey)
      .eq('id', id);

    if (error) {
      console.error('Error updating journey:', error);
      return;
    }
    setJourneys(prev => prev.map(j => j.id === id ? { ...j, ...journey } : j));
  };

  const deleteJourney = async (id: string) => {
    const { error } = await supabase
      .from('journeys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting journey:', error);
      return;
    }
    setJourneys(prev => prev.filter(j => j.id !== id));
  };

  // Station operations
  const addStation = async (station: Omit<Station, 'id' | 'created_at'>): Promise<Station | null> => {
    const { data, error } = await supabase
      .from('stations')
      .insert(station)
      .select()
      .single();

    if (error) {
      console.error('Error adding station:', error);
      return null;
    }
    setStations(prev => [...prev, data]);
    return data;
  };

  const updateStation = async (id: string, station: Partial<Station>) => {
    const { error } = await supabase
      .from('stations')
      .update(station)
      .eq('id', id);

    if (error) {
      console.error('Error updating station:', error);
      return;
    }
    setStations(prev => prev.map(s => s.id === id ? { ...s, ...station } : s));
  };

  const deleteStation = async (id: string) => {
    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting station:', error);
      return;
    }
    setStations(prev => prev.filter(s => s.id !== id));
  };

  // Activity operations
  const addActivity = async (activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> => {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      return null;
    }
    setActivities(prev => [...prev, data as Activity]);
    return data as Activity;
  };

  const updateActivity = async (id: string, activity: Partial<Activity>) => {
    const { error } = await supabase
      .from('activities')
      .update(activity)
      .eq('id', id);

    if (error) {
      console.error('Error updating activity:', error);
      return;
    }
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...activity } : a));
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity:', error);
      return;
    }
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Quiz question operations
  const addQuizQuestion = async (question: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion | null> => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(question)
      .select()
      .single();

    if (error) {
      console.error('Error adding quiz question:', error);
      return null;
    }
    setQuizQuestions(prev => [...prev, data]);
    return data;
  };

  // Submission operations
  const submitActivity = async (submission: Omit<ActivitySubmission, 'id' | 'submitted_at'>) => {
    const { data, error } = await supabase
      .from('activity_submissions')
      .insert(submission)
      .select()
      .single();

    if (error) {
      console.error('Error submitting activity:', error);
      return;
    }
    setSubmissions(prev => [data, ...prev]);
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase
      .from('activity_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  const evaluateSubmission = async (id: string, score: number, feedback: string, evaluatorId: string) => {
    const { error } = await supabase
      .from('activity_submissions')
      .update({
        score,
        feedback,
        evaluated_by: evaluatorId,
        evaluated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error evaluating submission:', error);
      return;
    }
    setSubmissions(prev => prev.map(s => s.id === id ? {
      ...s,
      score,
      feedback,
      evaluated_by: evaluatorId,
      evaluated_at: new Date().toISOString(),
    } : s));
  };

  // Progress operations
  const updateProgress = async (progressData: Omit<UserProgress, 'id'>) => {
    // Check if progress already exists
    const existing = progress.find(p =>
      p.user_id === progressData.user_id &&
      p.journey_id === progressData.journey_id &&
      p.station_id === progressData.station_id &&
      p.activity_id === progressData.activity_id
    );

    if (existing) {
      const { error } = await supabase
        .from('user_progress')
        .update(progressData)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating progress:', error);
        return;
      }
      setProgress(prev => prev.map(p => p.id === existing.id ? { ...p, ...progressData } : p));
    } else {
      const { data, error } = await supabase
        .from('user_progress')
        .insert(progressData)
        .select()
        .single();

      if (error) {
        console.error('Error adding progress:', error);
        return;
      }
      setProgress(prev => [...prev, data]);
    }
  };

  // Badge operations
  const awardBadge = async (userId: string, badgeId: string) => {
    const exists = userBadges.find(ub => ub.user_id === userId && ub.badge_id === badgeId);
    if (exists) return;

    const { data, error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return;
    }
    setUserBadges(prev => [...prev, data]);
  };

  // Computed values
  const getJourneyProgress = (userId: string, journeyId: string): number => {
    const journeyStations = stations.filter(s => s.journey_id === journeyId);
    const journeyActivities = activities.filter(a =>
      journeyStations.some(s => s.id === a.station_id)
    );
    
    if (journeyActivities.length === 0) return 0;

    const completedActivities = progress.filter(p =>
      p.user_id === userId &&
      p.journey_id === journeyId &&
      p.completed
    ).length;

    return Math.round((completedActivities / journeyActivities.length) * 100);
  };

  const getUserStats = (userId: string) => {
    const userSubmissions = submissions.filter(s => s.user_id === userId && s.score !== undefined);
    const totalPoints = userSubmissions.reduce((acc, s) => {
      const activity = activities.find(a => a.id === s.activity_id);
      return acc + (activity?.points || 0) * ((s.score || 0) / 100);
    }, 0);

    const completedActivities = userSubmissions.length;
    const averageScore = completedActivities > 0
      ? userSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / completedActivities
      : 0;

    return { totalPoints: Math.round(totalPoints), completedActivities, averageScore: Math.round(averageScore) };
  };

  return (
    <DataContext.Provider value={{
      journeys,
      stations,
      activities,
      quizQuestions,
      submissions,
      progress,
      badges,
      userBadges,
      isLoading,
      refreshData,
      addJourney,
      updateJourney,
      deleteJourney,
      addStation,
      updateStation,
      deleteStation,
      addActivity,
      updateActivity,
      deleteActivity,
      addQuizQuestion,
      submitActivity,
      deleteSubmission,
      evaluateSubmission,
      updateProgress,
      awardBadge,
      getJourneyProgress,
      getUserStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
