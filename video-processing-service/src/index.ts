import express from 'express';

import { 
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories
} from './storage';
import { isVideoNew, setVideo } from './firestore';

// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());


app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  next();
});


// Process a video file from Cloud Storage into 360p
app.post('/process-video', async (req, res) => {
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
  } catch (error) {
    console.error('ERROR: Failed to parse message:', error);
    return res.status(400).send('Bad Request: Invalid JSON or Base64.');
  }
  console.log('Received request body:', JSON.stringify(req.body)); // Log the entire request body for debugging


  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split('.')[0]; // Assuming filename is in the format "videoId.extension"

  if (!await isVideoNew(videoId)) {
    return res.status(400).send('Bad Request: video already processing or processed.');
  } else {
    // Mark the video as processing in Firestore
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split('-')[0], // Assuming videoId is in the format "uid-videoId"
      status: 'processing'
    })
  }

  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  // Process the video into 360p
  try { 
    await convertVideo(inputFileName, outputFileName)
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);
    return res.status(500).send('Processing failed');
  }
  
  // Upload the processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  await setVideo(videoId, { 
    status: 'processed',
    filename: outputFileName
  })

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ]);

  return res.status(200).send('Processing finished successfully');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});