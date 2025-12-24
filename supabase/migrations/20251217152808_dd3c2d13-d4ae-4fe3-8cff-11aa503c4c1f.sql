-- ==========================================
-- ETAPA 1: CRIAR ENUMS
-- ==========================================

-- Enum para tipos de papel (roles)
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'aluno');

-- Enum para tipos de atividade
CREATE TYPE public.activity_type AS ENUM ('quiz', 'upload', 'essay', 'gamified');

-- ==========================================
-- ETAPA 2: CRIAR TABELAS
-- ==========================================

-- 2.1 Profiles (perfis de usuários)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2.2 User Roles (papéis separados por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'aluno',
  UNIQUE (user_id, role)
);

-- 2.3 Journeys (jornadas)
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  intro_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2.4 Stations (estações)
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2.5 Activities (atividades)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type public.activity_type NOT NULL DEFAULT 'quiz',
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2.6 Quiz Questions (questões de quiz)
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- 2.7 Activity Submissions (submissões)
CREATE TABLE public.activity_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  answers INTEGER[],
  score INTEGER,
  feedback TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE
);

-- 2.8 User Progress (progresso)
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER NOT NULL DEFAULT 0
);

-- 2.9 Badges (conquistas)
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  criteria TEXT
);

-- 2.10 User Badges (conquistas ganhas)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, badge_id)
);

-- ==========================================
-- ETAPA 3: HABILITAR RLS EM TODAS AS TABELAS
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ETAPA 4: CRIAR FUNÇÃO has_role (SECURITY DEFINER)
-- ==========================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ==========================================
-- ETAPA 5: CRIAR FUNÇÃO E TRIGGER PARA NOVOS USUÁRIOS
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Atribuir role padrão 'aluno'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil ao registrar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ETAPA 6: POLÍTICAS RLS - PROFILES
-- ==========================================

-- Usuários podem ver todos os perfis (para exibir nomes)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Usuários podem atualizar próprio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- ETAPA 7: POLÍTICAS RLS - USER_ROLES
-- ==========================================

-- Usuários podem ver próprio role
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin pode ver todos os roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin pode gerenciar roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 8: POLÍTICAS RLS - JOURNEYS
-- ==========================================

-- Todos autenticados podem ver jornadas
CREATE POLICY "Journeys are viewable by authenticated users"
ON public.journeys FOR SELECT
TO authenticated
USING (true);

-- Admin pode gerenciar jornadas
CREATE POLICY "Admins can manage journeys"
ON public.journeys FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 9: POLÍTICAS RLS - STATIONS
-- ==========================================

-- Todos autenticados podem ver estações
CREATE POLICY "Stations are viewable by authenticated users"
ON public.stations FOR SELECT
TO authenticated
USING (true);

-- Admin pode gerenciar estações
CREATE POLICY "Admins can manage stations"
ON public.stations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 10: POLÍTICAS RLS - ACTIVITIES
-- ==========================================

-- Todos autenticados podem ver atividades
CREATE POLICY "Activities are viewable by authenticated users"
ON public.activities FOR SELECT
TO authenticated
USING (true);

-- Admin pode gerenciar atividades
CREATE POLICY "Admins can manage activities"
ON public.activities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 11: POLÍTICAS RLS - QUIZ_QUESTIONS
-- ==========================================

-- Todos autenticados podem ver questões
CREATE POLICY "Quiz questions are viewable by authenticated users"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (true);

-- Admin pode gerenciar questões
CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 12: POLÍTICAS RLS - ACTIVITY_SUBMISSIONS
-- ==========================================

-- Alunos podem ver próprias submissões
CREATE POLICY "Users can view own submissions"
ON public.activity_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Professores/Admin podem ver todas as submissões
CREATE POLICY "Professors and admins can view all submissions"
ON public.activity_submissions FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'professor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Alunos podem criar submissões
CREATE POLICY "Users can create own submissions"
ON public.activity_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Professores/Admin podem avaliar (atualizar) submissões
CREATE POLICY "Professors and admins can update submissions"
ON public.activity_submissions FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'professor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- ==========================================
-- ETAPA 13: POLÍTICAS RLS - USER_PROGRESS
-- ==========================================

-- Usuários podem ver próprio progresso
CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin/Professor podem ver todo progresso
CREATE POLICY "Admins and professors can view all progress"
ON public.user_progress FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'professor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Usuários podem gerenciar próprio progresso
CREATE POLICY "Users can manage own progress"
ON public.user_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- ETAPA 14: POLÍTICAS RLS - BADGES
-- ==========================================

-- Todos autenticados podem ver badges
CREATE POLICY "Badges are viewable by authenticated users"
ON public.badges FOR SELECT
TO authenticated
USING (true);

-- Admin pode gerenciar badges
CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ETAPA 15: POLÍTICAS RLS - USER_BADGES
-- ==========================================

-- Usuários podem ver próprias conquistas
CREATE POLICY "Users can view own badges"
ON public.user_badges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin/Professor podem ver todas as conquistas
CREATE POLICY "Admins and professors can view all user badges"
ON public.user_badges FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'professor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Sistema pode conceder badges (via service role ou trigger)
CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- ETAPA 16: FUNÇÃO PARA ATUALIZAR updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para journeys
CREATE TRIGGER update_journeys_updated_at
  BEFORE UPDATE ON public.journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- ETAPA 17: INSERIR BADGES PADRÃO
-- ==========================================

INSERT INTO public.badges (name, description, icon, criteria) VALUES
  ('Primeiro Passo', 'Complete sua primeira atividade', 'footprints', 'first_activity'),
  ('Explorador', 'Complete sua primeira jornada', 'compass', 'first_journey'),
  ('Dedicado', 'Complete 5 atividades', 'flame', 'five_activities'),
  ('Mestre', 'Alcance 100 pontos', 'trophy', 'hundred_points'),
  ('Perfeição', 'Obtenha nota máxima em uma atividade', 'star', 'perfect_score');