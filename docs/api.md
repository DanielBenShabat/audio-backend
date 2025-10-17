# API Reference

## Base URL
```
http://localhost:5001
```

## Health Check

### GET /
- **Purpose**: Quick health check for uptime monitors and dev sanity checks.
- **Response**
  ```json
  "Audio upload backend is running."
  ```

## File Upload

### POST /upload
- **Purpose**: Upload a single audio file directly to DigitalOcean Spaces.
- **Request**
  - Method: `POST`
  - Headers: `Content-Type: multipart/form-data`
  - Body field: `audio` (`.mp3`, `.wav`, etc.)
- **Sample**
  ```bash
  curl -X POST http://localhost:5001/upload \
    -F "audio=@/path/to/file.wav"
  ```
- **Success Response**
  ```json
  {
    "message": "File uploaded successfully",
    "file": {
      "fieldname": "audio",
      "originalname": "file.wav",
      "encoding": "7bit",
      "mimetype": "audio/wav",
      "bucket": "songs-for-enhancement",
      "key": "1717000000000-file.wav",
      "location": "https://songs-for-enhancement.lon1.digitaloceanspaces.com/1717000000000-file.wav",
      "size": 12345
    },
    "song": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "artist": "Unknown Artist",
      "song_name": "file",
      "file_name": "file.wav",
      "compression_type": "wav",
      "created_by": "web-user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "metadata": {
        "original_filename": "file.wav",
        "upload_timestamp": "2024-01-01T12:00:00.000Z"
      },
      "file_size": 12345,
      "s3_key": "1717000000000-file.wav",
      "mime_type": "audio/wav"
    }
  }
  ```
- **Notes**
  - Files are uploaded directly to DigitalOcean Spaces with private ACL
  - No local files are stored
  - Files use timestamp-prefixed keys for uniqueness

## File Retrieval

### GET /files/retrieve/:fileKey
- **Purpose**: Generate a presigned URL for accessing a private file from DigitalOcean Spaces.
- **Request**
  - Method: `GET`
  - Path parameter: `fileKey` - The key/name of the file in the bucket
  - Query parameter: `expiration` (optional) - URL expiration time in seconds (default: 3600)
- **Sample**
  ```bash
  # Get file with default 1-hour expiration
  curl http://localhost:5001/files/retrieve/1717000000000-file.wav
  
  # Get file with custom 2-hour expiration
  curl "http://localhost:5001/files/retrieve/1717000000000-file.wav?expiration=7200"
  ```
- **Success Response**
  ```json
  {
    "success": true,
    "fileKey": "1717000000000-file.wav",
    "presignedUrl": "https://songs-for-enhancement.lon1.digitaloceanspaces.com/1717000000000-file.wav?X-Amz-Algorithm=...",
    "expirationSeconds": 3600,
    "expiresAt": "2024-01-01T13:00:00.000Z"
  }
  ```
- **Error Responses**
  ```json
  // File not found
  {
    "error": "File not found",
    "message": "The requested file does not exist in the bucket"
  }
  
  // Invalid expiration time
  {
    "error": "Invalid expiration time",
    "message": "Expiration must be a positive number of seconds"
  }
  ```
- **Notes**
  - Presigned URLs provide temporary, secure access to private files
  - URLs expire after the specified time (default: 1 hour)
  - Files are not publicly accessible without presigned URLs

### GET /files/random
- **Purpose**: Get a single random song with full metadata and presigned URL (requires admin authentication).
- **Request**
  - Method: `GET`
  - Headers: `Authorization: Bearer <admin-token>` (placeholder for now)
- **Sample**
  ```bash
  # Get random song (admin auth placeholder)
  curl http://localhost:5001/files/random
  ```
- **Success Response**
  ```json
  {
    "success": true,
    "message": "Retrieved random song with metadata",
    "song": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "artist": "The Beatles",
      "song_name": "Hey Jude",
      "file_name": "Hey Jude.mp3",
      "compression_type": "mp3",
      "created_by": "web-user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "metadata": {
        "original_filename": "Hey Jude.mp3",
        "upload_timestamp": "2024-01-01T12:00:00.000Z"
      },
      "file_size": 4567890,
      "s3_key": "1717000000000-Hey Jude.mp3",
      "mime_type": "audio/mpeg",
      "presignedUrl": "https://songs-for-enhancement.lon1.digitaloceanspaces.com/1717000000000-Hey Jude.mp3?X-Amz-Algorithm=..."
    },
    "count": 1
  }
  ```
- **Empty Response** (when no songs found)
  ```json
  {
    "success": true,
    "message": "No songs found in the database",
    "song": null,
    "count": 0
  }
  ```
- **Notes**
  - Returns a single random song with full metadata from the database
  - Includes presigned URL for immediate access
  - Requires admin authentication (placeholder implementation)

### GET /files/all
- **Purpose**: List all songs with metadata and presigned URLs (public endpoint).
- **Request**
  - Method: `GET`
- **Sample**
  ```bash
  # Get all songs
  curl http://localhost:5001/files/all
  ```
- **Success Response**
  ```json
  {
    "success": true,
    "message": "Retrieved 2 song(s) with metadata",
    "songs": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "artist": "The Beatles",
        "song_name": "Hey Jude",
        "file_name": "Hey Jude.mp3",
        "compression_type": "mp3",
        "created_by": "web-user",
        "created_at": "2024-01-01T12:00:00.000Z",
        "metadata": {
          "original_filename": "Hey Jude.mp3",
          "upload_timestamp": "2024-01-01T12:00:00.000Z"
        },
        "file_size": 4567890,
        "s3_key": "1717000000000-Hey Jude.mp3",
        "mime_type": "audio/mpeg",
        "presignedUrl": "https://songs-for-enhancement.lon1.digitaloceanspaces.com/1717000000000-Hey Jude.mp3?X-Amz-Algorithm=..."
      }
    ],
    "count": 1
  }
  ```
- **Notes**
  - Public endpoint - no authentication required
  - Returns all songs from the database with presigned URLs

### GET /files/song/:songId
- **Purpose**: Download a specific song by its database ID (triggers automatic download).
- **Request**
  - Method: `GET`
  - Path parameter: `songId` - The UUID of the song in the database
- **Sample**
  ```bash
  # Download specific song by ID (triggers download)
  curl -L http://localhost:5001/files/song/123e4567-e89b-12d3-a456-426614174000 -o "Hey Jude.mp3"
  
  # Or simply open in browser to download
  # http://localhost:5001/files/song/123e4567-e89b-12d3-a456-426614174000
  ```
- **Success Response**
  - **HTTP 302 Redirect** to presigned URL
  - **Download Headers**:
    - `Content-Disposition: attachment; filename="Hey Jude.mp3"`
    - `Content-Type: audio/mpeg`
    - `Content-Length: 4567890`
  - **Behavior**: Browser automatically starts downloading the file
- **Error Responses**
  ```json
  // Invalid song ID format
  {
    "error": "Invalid song ID format",
    "message": "Song ID must be a valid UUID"
  }
  
  // Song not found
  {
    "error": "Song not found",
    "message": "No song found with the provided ID"
  }
  ```
- **Notes**
  - Public endpoint - no authentication required
  - **Triggers automatic download** when accessed in browser
  - Use the song ID from upload response or `/files/all` endpoint
  - File downloads with proper filename (Artist - Song Name.ext)

### GET /files/download/:songId
- **Purpose**: Download a specific song by streaming it through the backend (CORS-safe alternative).
- **Request**
  - Method: `GET`
  - Path parameter: `songId` - The UUID of the song in the database
- **Sample**
  ```bash
  # Download specific song by ID (CORS-safe, streams through backend)
  curl -L http://localhost:5001/files/download/123e4567-e89b-12d3-a456-426614174000 -o "Hey Jude.mp3"
  
  # Or simply open in browser to download
  # http://localhost:5001/files/download/123e4567-e89b-12d3-a456-426614174000
  ```
- **Success Response**
  - **HTTP 200** with file stream
  - **Download Headers**:
    - `Content-Type: audio/mpeg`
    - `Content-Length: 4567890`
    - `Content-Disposition: attachment; filename="Hey Jude.mp3"`
    - `Cache-Control: private, max-age=3600`
  - **Behavior**: Browser automatically starts downloading the file
- **Error Responses**
  ```json
  // Invalid song ID format
  {
    "error": "Invalid song ID format",
    "message": "Song ID must be a valid UUID"
  }
  
  // Song not found
  {
    "error": "Song not found",
    "message": "No song found with the provided ID"
  }
  
  // File stream unavailable
  {
    "error": "File stream unavailable",
    "message": "Unable to stream the requested file"
  }
  ```
- **Notes**
  - **CORS-safe alternative** to `/files/song/:songId`
  - Public endpoint - no authentication required
  - **Streams file through backend** instead of redirecting to S3
  - Solves CORS issues for frontend applications
  - Use this endpoint when experiencing CORS problems with the redirect endpoint
  - File downloads with proper filename (Artist - Song Name.ext)

### DELETE /files/song/:songId
- **Purpose**: Delete a specific song by its database ID from both database and S3 bucket.
- **Request**
  - Method: `DELETE`
  - Path parameter: `songId` - The UUID of the song in the database
  - Headers: `Authorization: Bearer <admin-token>` (requires admin authentication)
- **Sample**
  ```bash
  # Delete specific song by ID (requires admin auth)
  curl -X DELETE http://localhost:5001/files/song/123e4567-e89b-12d3-a456-426614174000 \
    -H "Authorization: Bearer <admin-token>"
  ```
- **Success Response**
  ```json
  {
    "success": true,
    "message": "Song deleted successfully",
    "songId": "123e4567-e89b-12d3-a456-426614174000",
    "deletedFromDatabase": true,
    "deletedFromS3": true,
    "song": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "artist": "The Beatles",
      "song_name": "Hey Jude",
      "file_name": "Hey Jude.mp3",
      "s3_key": "1717000000000-Hey Jude.mp3"
    }
  }
  ```
- **Error Responses**
  ```json
  // Invalid song ID format
  {
    "error": "Invalid song ID format",
    "message": "Song ID must be a valid UUID"
  }
  
  // Song not found
  {
    "error": "Song not found",
    "message": "No song found with the provided ID"
  }
  
  // Unauthorized (missing or invalid admin token)
  {
    "error": "Unauthorized",
    "message": "Admin authentication required"
  }
  ```
- **Notes**
  - **Requires admin authentication** - protected endpoint
  - Deletes song from both database and S3 bucket
  - If S3 deletion fails, the operation still succeeds (database deletion takes precedence)
  - Returns information about what was deleted for confirmation

## Environment Variables

The following environment variables are required for DigitalOcean Spaces and Neon database integration:

```bash
# DigitalOcean Spaces Configuration
SONG_BUCKET_NAME=songs-for-enhancement
SONG_BUCKET_REGION=LON1
SONG_BUCKET_KEY=your_access_key_here
SONG_BUCKET_SECRET=your_secret_key_here
SONG_BUCKET_ENDPOINT=https://songs-for-enhancement.lon1.digitaloceanspaces.com

# Neon Database Configuration
NEON_DATABASE_URL=postgresql://neondb_owner:password@ep-purple-credit-abft5hvr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_REST_API_URL=https://ep-purple-credit-abft5hvr.apirest.eu-west-2.aws.neon.tech/neondb/rest/v1
```

## Database Schema

The backend now uses a Neon PostgreSQL database to store song metadata. The `songs` table structure:

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist VARCHAR(255) NOT NULL,
  song_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  compression_type VARCHAR(50),
  created_by VARCHAR(255) NOT NULL, -- 'web-user' or 'manual-compression'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  file_size BIGINT NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100)
);
```

Execute the SQL script in `sql/create_songs_table.sql` in your Neon Console to create the table.
