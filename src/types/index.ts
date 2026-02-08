export type UserRole = 'admin' | 'professor' | 'aluno';
export type ActivityType = 'quiz' | 'upload' | 'essay' | 'gamified' | 'forum';

export interface ForumPost {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  color: string;
  audio_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user_name?: string;
  user_avatar?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
}

export interface Journey {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Station {
  id: string;
  journey_id: string;
  title: string;
  description?: string;
  image_url?: string;
  card_image_url?: string;
  video_url?: string;
  audio_url?: string;
  supplementary_url?: string;
  order_index: number;
  created_at: string;
}

export interface Activity {
  id: string;
  station_id: string;
  title: string;
  description?: string;
  type: ActivityType;
  points: number;
  audio_url?: string;
  is_sensitive?: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  activity_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export interface ActivitySubmission {
  id: string;
  activity_id: string;
  user_id: string;
  content?: string;
  answers?: number[];
  score?: number;
  feedback?: string;
  evaluated_by?: string;
  submitted_at: string;
  evaluated_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  journey_id: string;
  station_id?: string;
  activity_id?: string;
  step_type?: 'video' | 'supplementary' | 'podcast' | null;
  completed: boolean;
  completed_at?: string;
  time_spent: number;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon: string;
  criteria?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface DashboardStats {
  totalJourneys: number;
  completedJourneys: number;
  totalActivities: number;
  completedActivities: number;
  totalPoints: number;
  badgesEarned: number;
  averageScore: number;
}

export interface LandingSection {
  id: string;
  title?: string;
  content?: string;
  image_url?: string;
  order_index: number;
  is_cta: boolean;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  duration_minutes: number;
  meeting_link?: string;
  journey_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type SupportTicketType = 'bug' | 'improvement';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  response?: string;
  responded_by?: string;
  responded_at?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}
