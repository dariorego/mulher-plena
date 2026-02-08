
-- 1. Add image_url column to forum_posts
ALTER TABLE public.forum_posts ADD COLUMN image_url TEXT;

-- 2. Create forum-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true);

-- 3. RLS policies for forum-images bucket
CREATE POLICY "Anyone can view forum images"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own forum images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own forum images"
ON storage.objects FOR DELETE
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Insert "Caixa da Alegria" activity for Station 3, Journey 6
INSERT INTO public.activities (station_id, title, type, points, description)
VALUES (
  'e98d06e6-a832-44cd-b999-c34bdd418829',
  'Caixa da Alegria',
  'forum',
  10,
  '<p>Crie a sua <strong>"Caixa da Alegria"</strong>, que pode ser construída em formato físico ou digital. Esse será um espaço pessoal destinado a reunir elementos que despertem sentimentos positivos e fortaleçam o seu bem-estar emocional.</p>

<p>Inclua na sua caixa itens que tenham significado para você, como: imagens, músicas, frases inspiradoras, símbolos, recordações, mensagens ou qualquer outro recurso que represente alegria, gratidão e motivação.</p>

<p>Diariamente, escolha um dos elementos da sua caixa. Observe-o com atenção, reflita sobre o sentimento que ele desperta e mentalize o significado que possui em sua vida. Em seguida, transforme essa emoção em uma ação concreta ao longo do seu dia, expressando na prática a alegria, a gratidão ou o entusiasmo vivenciados.</p>

<p>Ao final do processo, registre a sua experiência, descrevendo como foi realizar a atividade e quais sentimentos foram despertados.</p>

<p><strong>Envio da atividade:</strong> Anexe uma foto da sua Caixa da Alegria (física ou representação da versão digital) para que possamos acompanhar e visualizar a construção da sua atividade.</p>'
);
