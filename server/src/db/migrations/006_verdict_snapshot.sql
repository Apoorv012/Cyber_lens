-- adding verdict, score to ioc_history

ALTER TABLE ioc_history
ADD COLUMN IF NOT EXISTS verdict TEXT;

ALTER TABLE ioc_history
ADD COLUMN IF NOT EXISTS score INT;
