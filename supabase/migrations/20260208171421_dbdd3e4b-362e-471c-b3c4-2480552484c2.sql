
-- Inserir atividade quiz "Manifestar o amor que liberta" na Estação 1 da Jornada 5
INSERT INTO public.activities (station_id, title, type, points, description)
VALUES (
  '941586e4-bbe4-464e-bb4d-41717fe5498b',
  'Manifestar o amor que liberta',
  'quiz',
  10,
  'Responda às perguntas abaixo sobre o tema "Os filhos são de Deus" e marque a alternativa correta.'
);

-- Inserir as 3 perguntas do quiz
INSERT INTO public.quiz_questions (activity_id, question, options, correct_answer, order_index)
VALUES
  (
    (SELECT id FROM public.activities WHERE station_id = '941586e4-bbe4-464e-bb4d-41717fe5498b' AND title = 'Manifestar o amor que liberta'),
    'O que significa reconhecer que os filhos são de Deus?',
    ARRAY['Que devemos controlar suas escolhas', 'Que devemos vê-los como seres espirituais perfeitos', 'Que pertencem à família humana'],
    1,
    0
  ),
  (
    (SELECT id FROM public.activities WHERE station_id = '941586e4-bbe4-464e-bb4d-41717fe5498b' AND title = 'Manifestar o amor que liberta'),
    'O amor verdadeiro é aquele que...',
    ARRAY['Impõe condições', 'Liberta e confia', 'Depende da reciprocidade'],
    1,
    1
  ),
  (
    (SELECT id FROM public.activities WHERE station_id = '941586e4-bbe4-464e-bb4d-41717fe5498b' AND title = 'Manifestar o amor que liberta'),
    'Quando vemos o outro como filho de Deus, o que muda em nós?',
    ARRAY['O medo cresce', 'O coração se ilumina', 'Ficamos indiferentes'],
    1,
    2
  );
