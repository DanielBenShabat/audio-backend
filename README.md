# Audio Upload Backend

Express server that handles audio file uploads to DigitalOcean Spaces and provides secure file retrieval via presigned URLs, with Neon database integration for metadata management.

## Features
- **Direct Cloud Storage**: Files upload directly to DigitalOcean Spaces (S3-compatible)
- **Database Integration**: Song metadata stored in Neon PostgreSQL database
- **Secure Access**: Private files with presigned URL access
- **Rich Metadata**: Artist, song name, file details stored in database
- **Random Discovery**: API to get random songs with full metadata
- **Admin Authentication**: Placeholder for admin-only endpoints
- **No Local Storage**: Files are stored only in the cloud

## Prerequisites
- Node.js 18+
- npm (ships with Node)
- DigitalOcean Spaces bucket with access credentials
- Neon PostgreSQL database (free tier available)

## Getting Started
```bash
npm install
npx ts-node server.ts
```
`server.ts` starts on port `5001` (configurable via `PORT`).

## Environment Variables
Create a `.env` file with your DigitalOcean Spaces and Neon database credentials:
```bash
# DigitalOcean Spaces Configuration
SONG_BUCKET_NAME=your-bucket-name
SONG_BUCKET_REGION=LON1
SONG_BUCKET_KEY=your-access-key
SONG_BUCKET_SECRET=your-secret-key
SONG_BUCKET_ENDPOINT=https://your-bucket.lon1.digitaloceanspaces.com

# Neon Database Configuration
NEON_DATABASE_URL=postgresql://neondb_owner:password@ep-purple-credit-abft5hvr-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_REST_API_URL=https://ep-purple-credit-abft5hvr.apirest.eu-west-2.aws.neon.tech/neondb/rest/v1
```

## Available Routes
- `GET /` – health check
- `POST /upload` – upload audio files to DigitalOcean Spaces (saves metadata to database)
- `GET /files/retrieve/:fileKey` – get presigned URL for file access
- `GET /files/random` – get single random song with metadata (admin auth placeholder)
- `GET /files/all` – list all songs with metadata and presigned URLs
- `GET /files/song/:songId` – download specific song by database ID (triggers automatic download)

Detailed request/response examples live in `docs/api.md`.

## Database Setup

1. **Create the songs table** in your Neon Console:
   - Go to your Neon Console → SQL Editor
   - Execute the SQL script in `sql/create_songs_table.sql`

2. **Verify the table** was created successfully:
   ```sql
   SELECT * FROM songs LIMIT 1;
   ```

## Project Layout
```
server.ts             Entry point
src/app.ts            Express app factory
src/config/           S3/DigitalOcean Spaces & Neon database configuration
src/controller/       Route handlers
src/routers/          Express routers
src/service/          Upload/storage/database services
src/middleware/       Authentication middleware (placeholder)
sql/                  Database migration scripts
docs/                 API documentation
package.json          Dependencies & scripts
```

## Development Tips
- Files are uploaded directly to DigitalOcean Spaces with private ACL
- Song metadata is automatically saved to Neon database after upload
- Use presigned URLs for secure, time-limited file access
- Random songs API returns rich metadata from database
- Admin authentication is placeholder - implement real auth later
- CORS is open to all origins via `app.use(cors())`; tighten before deploying
- To build JavaScript output for deployment run `npx tsc` (emits to `dist/`)
