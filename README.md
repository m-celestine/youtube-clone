# YouTube Clone – Full-Stack Cloud Video Platform

A guided full-stack YouTube-style video platform built to learn how modern web applications connect with cloud infrastructure. This project uses a Next.js web client, Firebase, Google Cloud Storage, Pub/Sub, Cloud Run, Docker, and Firestore to support video upload, processing, storage, metadata tracking, and playback.

## Project Status

Currently completed:

1. User authentication flow with Firebase Auth
2. Video upload flow from the web client
3. Raw video storage in Google Cloud Storage
4. Pub/Sub-based event pipeline for video processing
5. Cloud Run video processing service
6. Processed video storage in a separate Cloud Storage bucket
7. Firestore metadata tracking for uploaded videos
8. Next.js UI for listing processed videos
9. Watch page for video playback
10. Dockerized web client deployment to Cloud Run

## Architecture Overview

The application follows an event-driven cloud architecture:

1. A user uploads a video through the Next.js web client.
2. The raw video is saved to a Google Cloud Storage bucket.
3. A Cloud Storage event publishes a message to Pub/Sub.
4. Pub/Sub triggers the Cloud Run video processing service.
5. The processing service converts/processes the video.
6. The processed video is saved to a processed videos bucket.
7. Firestore stores and updates video metadata.
8. The web client fetches processed video records and displays them as thumbnails.
9. Users can click a thumbnail to watch the processed video.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* CSS Modules
* Firebase Client SDK

### Backend / Cloud

* Firebase Auth
* Firebase Functions / Callable Functions
* Firestore
* Google Cloud Storage
* Pub/Sub
* Cloud Run
* Artifact Registry
* Docker

### DevOps / Deployment

* Docker containerization
* Google Artifact Registry image hosting
* Cloud Run deployment
* Environment variable configuration
* Production build troubleshooting

## Key Features

### Video Upload

Users can upload videos through the web client. Uploaded files are stored in a raw videos Cloud Storage bucket before being processed.

### Event-Driven Processing

Cloud Storage events publish messages to Pub/Sub, which triggers a Cloud Run video processing service. This helped me learn how cloud services communicate asynchronously.

### Video Metadata Tracking

Firestore is used to track video records, including filename, owner, status, title, and description.

### Processed Video Display

The web client fetches video metadata and displays processed videos as clickable thumbnails on the home page.

### Watch Page Playback

The watch page reads the video filename from the URL query parameter and loads the processed video from Cloud Storage using an HTML video player.

### Cloud Run Deployment

The Next.js web client was containerized with Docker, pushed to Google Artifact Registry, and deployed to Cloud Run.

## Problems Solved

### Fixed Next.js Build Error with `useSearchParams()`

The `/watch` page originally failed during `npm run build` because `useSearchParams()` needed to be handled correctly in a client component with a Suspense boundary. I split the watch page into a parent component and a `WatchClient` component to fix the prerender/build issue.

### Fixed Pub/Sub Retry Issue

Some videos were stuck in a `processing` state because old Pub/Sub messages were still being retried. After deleting the raw files and Firestore records, the records came back because Pub/Sub continued triggering the processing flow. I fixed this by purging the stuck Pub/Sub subscription messages and cleaning up the related Firestore records and storage objects.

### Fixed Docker Node Version Issue

The initial Dockerfile used Node 18, but Next.js 16 requires Node `>=20.9.0`. I updated the Docker base image to Node 20 so the production build could complete successfully.

### Fixed Cloud Run Image Architecture Issue

The first Cloud Run deployment failed because the Docker image was built for the wrong architecture on Apple Silicon. I fixed this by building and pushing a Linux AMD64-compatible image using Docker Buildx.

## What I Learned

* How a full-stack web application connects to cloud infrastructure
* How to use Firebase Auth and Firestore in a Next.js application
* How Cloud Storage, Pub/Sub, and Cloud Run work together in an event-driven pipeline
* How to containerize a Next.js application with Docker
* How to deploy a web client to Cloud Run
* How to troubleshoot production build errors, Pub/Sub retries, and Docker architecture issues
* How server-side rendering and caching behavior affect deployed Next.js applications

## Future Improvements

* Add unique shorter video IDs instead of using full filenames in the URL
* Add user-specific video pages
* Add real thumbnail generation during video processing
* Add upload progress indicators
* Add better error handling for failed video processing jobs
* Add GitHub Actions for automated build checks
* Add unit/integration tests for Firebase helper functions and UI components
* Improve the video player UI
* Add database cleanup tools for failed or abandoned uploads

## Notes

This project was built by following and adapting a guided neetcode full-stack cloud tutorial. My focus was on learning how the frontend, backend, cloud storage, Pub/Sub messaging, video processing, Docker, and Cloud Run deployment fit together in a production-style application.