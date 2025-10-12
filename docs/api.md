# API Reference

## Base URL
```
http://localhost:5000
```

## GET /
- **Purpose**: quick health check for uptime monitors and dev sanity checks.
- **Response**
  ```json
  "Audio upload backend is running."
  ```

## POST /upload
- **Purpose**: upload a single audio file.
- **Request**
  - Method: `POST`
  - Headers: `Content-Type: multipart/form-data`
  - Body field: `audio` (`.mp3`, `.wav`, etc.)
- **Sample**
  ```bash
  curl -X POST http://localhost:5000/upload \
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
      "destination": "uploads/",
      "filename": "1717000000000-file.wav",
      "path": "uploads/1717000000000-file.wav",
      "size": 12345
    }
  }
  ```
- **Notes**
  - Files persist to `uploads/` using timestamp-prefixed filenames.
  - Adjust storage logic in `server.js` if you need S3 or cloud storage.
