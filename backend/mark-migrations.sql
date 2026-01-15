-- Marcar migraciones como ejecutadas
INSERT INTO migrations (timestamp, name) 
VALUES (1704297600000, 'AddMultiplePdfUrls1704297600000')
ON CONFLICT DO NOTHING;
