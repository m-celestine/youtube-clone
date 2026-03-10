// 1. GCS file interactions
// 2. Local file interactions (for testing)

// Import libraries/tools we need for this file
import { Storage } from '@google-cloud/storage'; // Tool to connect to Google Cloud Storage
import fs from 'fs'; // Tool to work with files on this computer
import ffmpeg from 'fluent-ffmpeg'; // Tool to convert/resize videos

// Connect to Google Cloud Storage so we can upload and download files
const storage = new Storage();

// Name of the cloud folder where ORIGINAL videos are stored
const rawVideoBucketName = "mc-yt-raw-videos";
// Name of the cloud folder where CONVERTED videos are stored
const processedVideoBucketName = "mc-yt-processed-videos";

console.log("Using raw bucket:", rawVideoBucketName);
console.log("Using processed bucket:", processedVideoBucketName);

// Path to the folder on THIS computer where original videos are saved
const localRawVideoPath = "./raw-videos";
// Path to the folder on THIS computer where converted videos are saved
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
  // Make sure the raw-videos folder exists (create it if it doesn't)
  ensureDirectoryExistence(localRawVideoPath);
  // Make sure the processed-videos folder exists (create it if it doesn't)
  ensureDirectoryExistence(localProcessedVideoPath);
}


/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  
  // Return a Promise so we can use .then() or await with this function
  return new Promise<void>((resolve, reject) => {

    // Start converting the video with FFmpeg
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)

      // Resize the video to 360p height (maintains width automatically)
      .outputOptions("-vf", "scale=-1:360") // 360p

      // What to do when the conversion is finished successfully
      .on("end", function () {
        console.log("Processing finished successfully");
        resolve(); // Tell the function that it worked!
      })

      // What to do if something goes wrong during conversion
      .on("error", function (err: any) {
        console.log("An error occurred: " + err.message);
        reject(err); // Tell the function that it failed
      })

      // Save the converted video to the processed-videos folder
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}


/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  // Start downloading the video from the cloud
  // - First: pick the cloud folder (bucket) named rawVideoBucketName
  // - Then: pick the file with the name we want
  // - Finally: download it to our computer at the path we specify
  await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`, // Save it to ./raw-videos folder
    });

  // Tell us that the download finished
  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
  );
}


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  // Get a reference to the cloud folder where processed videos go
  const bucket = storage.bucket(processedVideoBucketName);

  // Upload the converted video from this computer to the cloud
  await storage.bucket(processedVideoBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {
      destination: fileName, // Save it with the same name in the cloud
    });
  // Tell us the upload is done
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
  );

  // Set the video to be publicly readable (anyone can watch it)
  await bucket.file(fileName).makePublic();
}


/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}


/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  // Return a Promise so we can use await with this function
  return new Promise((resolve, reject) => {
    // Check if the file actually exists before trying to delete it
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlink(filePath, (err) => {
        // If there's an error while deleting
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
          reject(err); // Tell the function that deletion failed
        } else {
          // If deletion was successful
          console.log(`File deleted at ${filePath}`);
          resolve(); // Tell the function that it worked!
        }
      });
    } else {
      // If the file doesn't exist, that's okay - nothing to delete
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve(); // Tell the function we're done (no error)
    }
  });
}


/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  // Check if the folder does NOT exist
  if (!fs.existsSync(dirPath)) {
    // Create the folder (recursive: true means create parent folders too if needed)
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
  // If the folder already exists, do nothing
}