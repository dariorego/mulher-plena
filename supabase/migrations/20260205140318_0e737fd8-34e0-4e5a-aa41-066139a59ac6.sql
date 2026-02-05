-- Adicionar colunas journey_id e station_id à tabela support_tickets
ALTER TABLE support_tickets 
ADD COLUMN journey_id uuid REFERENCES journeys(id) ON DELETE SET NULL,
ADD COLUMN station_id uuid REFERENCES stations(id) ON DELETE SET NULL;