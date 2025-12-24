-- Add order_index column to journeys table
ALTER TABLE public.journeys 
ADD COLUMN order_index integer NOT NULL DEFAULT 0;