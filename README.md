# Audio Upload Backend

Simple Express server that accepts audio uploads from a frontend client and stores them on disk.

## Prerequisites
- Node.js 18+
- npm (ships with Node)

## Getting Started
```bash
npm install
node server.js
```
`server.js` starts on port `5001` (configurable via `PORT`) and uploads land in `uploads/`.

## Available Routes
- `GET /` – health check
- `POST /upload` – accepts `multipart/form-data` with `audio` file field

Detailed request/response examples live in `docs/api.md`.

## Project Layout
```
server.js             Entry point
src/app.js            Express app factory
src/controller/       Route handlers
src/routers/          Express routers
src/service/          Upload/storage services
uploads/              Saved audio files (git ignored)
package.json          Dependencies
```

## Development Tips
- Adjust destination directory in `server.js` if you need custom storage.
- Watch console output for generated filenames during manual testing.
- Ensure the target directory exists (`uploads/` is created on first write).
- CORS is open to all origins via `app.use(cors())`; tighten before deploying.
