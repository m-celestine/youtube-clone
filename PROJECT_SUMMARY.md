# YouTube Clone — Project Summary

This repository is a tutorial / demo YouTube-like application that implements an end-to-end video upload, processing, storage, and playback pipeline using a Next.js frontend, Firebase serverless functions, a Dockerized Node.js video processing service, and Google Cloud Storage.

## Architecture (high level)
- `yt-web-client/` — Next.js (app directory) React + TypeScript frontend with upload and watch UI, Firebase client integration.
- `yt-api-service/functions/` — Firebase Cloud Functions (TypeScript) exposing API endpoints for uploads, metadata, and auth.
- `video-processing-service/` — Dockerized Node.js + TypeScript service for media processing (transcoding, thumbnails, GCS interactions).
- `utils/` — configuration files such as `gcs-cors.json` for GCS CORS settings.

## Tech stack
- Frontend: Next.js, React, TypeScript, CSS Modules
- Serverless/backend: Firebase Cloud Functions (TypeScript)
- Processing: Node.js, TypeScript (Dockerfile provided for containerized workers)
- Storage: Google Cloud Storage (GCS)

## Key features
- Client-side upload UI and integration with Firebase for auth and metadata handling.
- Serverless API endpoints to create/manage uploads and serve metadata.
- Containerized processing worker that ingests uploaded videos, performs media processing (transcode, thumbnails, metadata extraction), and writes processed artifacts to GCS.
- GCS configuration (CORS) and cloud storage orchestration.

## Notable files to review
- `video-processing-service/Dockerfile` — containerization for the processing worker.
- `video-processing-service/src/storage.ts` — GCS interaction helpers.
- `yt-api-service/functions/src/index.ts` — Firebase Functions entrypoints.
- `yt-web-client/app/*` — frontend pages for upload and watch flows.

## Assumptions & unknowns (please verify)
- Upload flow may be implemented as direct-to-GCS with signed URLs or proxied through Firebase Functions. Inspect the frontend upload code and functions to confirm.
- The processing pipeline likely uses `ffmpeg` or similar; confirm exact steps (resolutions, codecs, HLS/DASH, thumbnail strategy).

## How to run / tips
1. Start by inspecting `yt-api-service/functions` for local Firebase emulation or deploy steps (see `firebase.json`).
2. The `video-processing-service` includes a `Dockerfile` — build and run the container locally for worker testing:

```bash
cd video-processing-service
docker build -t yt-processor .
docker run --env-file .env -v /tmp/media:/media yt-processor
```

3. Configure GCS credentials locally (via `GOOGLE_APPLICATION_CREDENTIALS`) before running processing or functions that interact with GCS.

## Suggested resume phrasing ideas
- Implemented a Next.js TypeScript frontend and Firebase-backed API for secure video uploads and playback.
- Built and Dockerized a Node/TypeScript video processing service to transcode uploads and generate thumbnails, storing artifacts in Google Cloud Storage.
