-- YektaYar Database Schema
-- PostgreSQL 15+

-- Sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    user_id UUID DEFAULT NULL,
    is_logged_in BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Comments for documentation
COMMENT ON TABLE sessions IS 'Stores session information for anonymous and authenticated users';
COMMENT ON COLUMN sessions.token IS 'JWT token for the session';
COMMENT ON COLUMN sessions.user_id IS 'References the user if logged in, NULL for anonymous sessions';
COMMENT ON COLUMN sessions.is_logged_in IS 'Indicates if the session is authenticated';
COMMENT ON COLUMN sessions.metadata IS 'Additional metadata like device info, platform, etc.';
COMMENT ON COLUMN sessions.ip_address IS 'IP address of the client';
COMMENT ON COLUMN sessions.user_agent IS 'User agent string of the client';
