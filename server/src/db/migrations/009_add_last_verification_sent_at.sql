DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='users' AND column_name='last_verification_sent_at'
	) THEN
		ALTER TABLE users ADD COLUMN last_verification_sent_at TIMESTAMP;
	END IF;
END $$;
