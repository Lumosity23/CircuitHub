-- Initialize database for CircuitHub
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist
-- This is handled by the POSTGRES_DB environment variable

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE circuithub TO circuithub_user;
GRANT ALL PRIVILEGES ON ALL SCHEMAS IN DATABASE circuithub TO circuithub_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN DATABASE circuithub TO circuithub_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN DATABASE circuithub TO circuithub_user;

-- Set default search path
ALTER ROLE circuithub_user SET search_path TO public, circuithub;