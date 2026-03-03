import express from 'express';
import ffmpeg from "fluent-ffmpeg";


const app = express();
app.use(express.json());

// Accept POST so clients like Thunder Client can send a JSON body
app.post('/process-video', (req, res) => {

  // Get the path of the input video file from the request body
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  // Check if the input file path is defined
  if (!inputFilePath || !outputFilePath) {
    return res.status(400).send('Bad Request: Missing file path');
  }


  // find cause of error
  ffmpeg(inputFilePath)
  .outputOptions("-vf", "scale=-1:360")
  .on("end", () => {
    console.log("Processing finished successfully");
    return res.status(200).send("Processing finished successfully");
  })
  .on("error", (err: any) => {
    console.log("An error occurred: " + err.message);
    return res.status(500).send("An error occurred: " + err.message);
  })
  .save(outputFilePath);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});