-- Create songs table for audio backend
-- Execute this in your Neon Console SQL Editor

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist VARCHAR(255) NOT NULL,
  song_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  compression_type VARCHAR(50), -- mp3, wav, flac, etc.
  created_by VARCHAR(255) NOT NULL, -- 'web-user' or 'manual-compression'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- Store audio tags, album info, etc.
  file_size BIGINT NOT NULL,
  s3_key VARCHAR(500) NOT NULL, -- The key in DigitalOcean Spaces
  mime_type VARCHAR(100)
);

-- Create indexes for performance
CREATE INDEX idx_artist ON songs(artist);
CREATE INDEX idx_song_name ON songs(song_name);
CREATE INDEX idx_created_by ON songs(created_by);
CREATE INDEX idx_created_at ON songs(created_at);
CREATE INDEX idx_metadata_gin ON songs USING GIN(metadata); -- For JSON queries

-- Add a comment to the table
COMMENT ON TABLE songs IS 'Stores metadata for audio files uploaded to DigitalOcean Spaces';
COMMENT ON COLUMN songs.created_by IS 'Source of the song: web-user (uploaded via API) or manual-compression (added by backend)';
COMMENT ON COLUMN songs.s3_key IS 'The key/path of the file in DigitalOcean Spaces bucket';
COMMENT ON COLUMN songs.metadata IS 'Additional metadata like audio tags, album info, etc.';
