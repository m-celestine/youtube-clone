"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("./storage");
const firestore_1 = require("./firestore");
// Create the local directories for videos
(0, storage_1.setupDirectories)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.path}`);
    next();
});
// Process a video file from Cloud Storage into 360p
app.post('/process-video', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Body received:', JSON.stringify(req.body)); // Log the raw body
    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        // Check if the message structure exists
        if (!req.body.message || !req.body.message.data) {
            console.error('ERROR: Payload is missing message.data');
            return res.status(400).send('Bad Request: Missing Pub/Sub message data.');
        }
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            console.error('ERROR: Decoded data is missing "name" field:', message);
            return res.status(400).send('Bad Request: Data missing filename.');
        }
    }
    catch (error) {
        console.error('ERROR: Failed to parse message:', error);
        return res.status(400).send('Bad Request: Invalid JSON or Base64.');
    }
    console.log('Received request body:', JSON.stringify(req.body)); // Log the entire request body for debugging
    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0]; // Assuming filename is in the format "videoId.extension"
    if (!(yield (0, firestore_1.isVideoNew)(videoId))) {
        return res.status(400).send('Bad Request: video already processing or processed.');
    }
    else {
        // Mark the video as processing in Firestore
        yield (0, firestore_1.setVideo)(videoId, {
            id: videoId,
            uid: videoId.split('-')[0], // Assuming videoId is in the format "uid-videoId"
            status: 'processing'
        });
    }
    // Download the raw video from Cloud Storage
    yield (0, storage_1.downloadRawVideo)(inputFileName);
    // Process the video into 360p
    try {
        yield (0, storage_1.convertVideo)(inputFileName, outputFileName);
    }
    catch (err) {
        yield Promise.all([
            (0, storage_1.deleteRawVideo)(inputFileName),
            (0, storage_1.deleteProcessedVideo)(outputFileName)
        ]);
        return res.status(500).send('Processing failed');
    }
    // Upload the processed video to Cloud Storage
    yield (0, storage_1.uploadProcessedVideo)(outputFileName);
    yield (0, firestore_1.setVideo)(videoId, {
        status: 'processed',
        filename: outputFileName
    });
    yield Promise.all([
        (0, storage_1.deleteRawVideo)(inputFileName),
        (0, storage_1.deleteProcessedVideo)(outputFileName)
    ]);
    return res.status(200).send('Processing finished successfully');
}));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
