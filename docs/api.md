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
- **Purpose**: List random songs from the DigitalOcean Spaces bucket.
- **Request**
  - Method: `GET`
  - Query parameter: `count` (optional) - Number of random songs to return (default: 3, max: 10)
- **Sample**
  ```bash
  # Get 3 random songs (default)
  curl http://localhost:5001/files/random
  
  # Get 5 random songs
  curl "http://localhost:5001/files/random?count=5"
  ```
- **Success Response**
  ```json
  {
    "success": true,
    "message": "Retrieved 3 random song(s)",
    "songs": [
      {
        "key": "1717000000000-song1.mp3",
        "size": 4567890,
        "lastModified": "2024-01-01T12:00:00.000Z"
      },
      {
        "key": "1717000000001-song2.wav",
        "size": 12345678,
        "lastModified": "2024-01-01T12:30:00.000Z"
      },
      {
        "key": "1717000000002-song3.flac",
        "size": 9876543,
        "lastModified": "2024-01-01T13:00:00.000Z"
      }
    ],
    "count": 3
  }
  ```
- **Empty Response** (when no audio files found)
  ```json
  {
    "success": true,
    "message": "No audio files found in the bucket",
    "songs": [],
    "count": 0
  }
  ```
- **Error Response**
  ```json
  {
    "error": "Invalid count parameter",
    "message": "Count must be a positive number between 1 and 10"
  }
  ```
- **Notes**
  - Only returns audio files (mp3, wav, flac, m4a, aac, ogg)
  - Songs are randomly selected from all available files in the bucket
  - Use the returned `key` values with `/files/retrieve/:fileKey` to get presigned URLs

## Environment Variables

The following environment variables are required for DigitalOcean Spaces integration:

```bash
SONG_BUCKET_NAME=songs-for-enhancement
SONG_BUCKET_REGION=LON1
SONG_BUCKET_KEY=your_access_key_here
SONG_BUCKET_SECRET=your_secret_key_here
SONG_BUCKET_ENDPOINT=https://songs-for-enhancement.lon1.digitaloceanspaces.com
```
