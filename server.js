const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const upload = multer({ dest: 'uploads/' }); // Use 'uploads' folder for file storage (in memory or disk)

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Google Drive API setup with service account credentials
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_KEY_PATH = './credentials.json';
  // Replace with actual path to service account key

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle PDF uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { pages, printType, copies } = req.body;  // Retrieve form data

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Google Drive file metadata (with optional folder)
    const FOLDER_ID = '1N2y8WodHeYiqVkoWJYxTyeceKUtClynk';  // Replace with your folder ID

    const fileMetadata = {
      name: file.originalname,
      mimeType: file.mimetype,
      parents: [FOLDER_ID],  // Google Drive folder ID as an array
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    // Upload file to Google Drive
    const fileResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Log file metadata (can be saved to a DB or log for tracking)
    console.log(`File uploaded: ${fileResponse.data.id}`);
    console.log(`Pages: ${pages}`);
    console.log(`Print Type: ${printType}`);
    console.log(`Copies: ${copies}`);

    // Clean up the local file after upload
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

    // Send a success response
    res.json({ message: 'File uploaded and saved to Google Drive' });
  } catch (error) {
    console.error('Error uploading file:', error.response || error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

