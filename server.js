const express = require('express');
const multer = require('multer');
const fluentFFmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Server setup
const app = express();
const port = 3000;

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory where the uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Add a timestamp to the filename
  },
});
const upload = multer({ storage });

// File conversion endpoint
app.post('/convertToWebm', upload.single('file'), (req, res) => {
  const inputFile = req.file.path;
  const outputFile = `uploads/${Date.now()}.webm`;

  fluentFFmpeg(inputFile)
    .output(outputFile)
    .audioCodec('libvorbis')  // Audio codec for WebM format
    .videoCodec('libvpx')     // Video codec for WebM format
    .on('end', () => {
      console.log('Conversion finished!');
      res.download(outputFile, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).send('Error during file download.');
        } else {
          // Delete the original and converted files after download
          fs.unlinkSync(inputFile);
          fs.unlinkSync(outputFile);
        }
      });
    })
    .on('error', (err) => {
      console.error('Error during conversion:', err);  // Log the error
      res.status(500).send('Error during conversion.');
    })
    .run();
});

app.get('/', (req, res) => res.send('node media converter running ...'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
