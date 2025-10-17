# Audio Upload Backend

Express server that handles audio file uploads to DigitalOcean Spaces and provides secure file retrieval via presigned URLs.

## Features
- **Direct Cloud Storage**: Files upload directly to DigitalOcean Spaces (S3-compatible)
- **Secure Access**: Private files with presigned URL access
- **Random Discovery**: API to get random songs from your collection
- **No Local Storage**: Files are stored only in the cloud

## Prerequisites
- Node.js 18+
- npm (ships with Node)
- DigitalOcean Spaces bucket with access credentials

## Getting Started
```bash
npm install
npx ts-node server.ts
```
`server.ts` starts on port `5001` (configurable via `PORT`).

## Environment Variables
Create a `.env` file with your DigitalOcean Spaces credentials:
```bash
SONG_BUCKET_NAME=your-bucket-name
SONG_BUCKET_REGION=LON1
SONG_BUCKET_KEY=your-access-key
SONG_BUCKET_SECRET=your-secret-key
SONG_BUCKET_ENDPOINT=https://your-bucket.lon1.digitaloceanspaces.com
```

## Available Routes
- `GET /` – health check
- `POST /upload` – upload audio files to DigitalOcean Spaces
- `GET /files/retrieve/:fileKey` – get presigned URL for file access
- `GET /files/random` – list random songs from your collection

Detailed request/response examples live in `docs/api.md`.

## Project Layout
```
server.ts             Entry point
src/app.ts            Express app factory
src/config/           S3/DigitalOcean Spaces configuration
src/controller/       Route handlers
src/routers/          Express routers
src/service/          Upload/storage services
docs/                 API documentation
package.json          Dependencies & scripts
```

## Development Tips
- Files are uploaded directly to DigitalOcean Spaces with private ACL
- Use presigned URLs for secure, time-limited file access
- Random songs API helps with music discovery features
- CORS is open to all origins via `app.use(cors())`; tighten before deploying
- To build JavaScript output for deployment run `npx tsc` (emits to `dist/`)
