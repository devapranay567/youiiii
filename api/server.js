const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const upload = multer({ dest: '/tmp' }); // Use `/tmp` for serverless compatibility

app.use(cors({
  origin: '*',  // Allow requests from any frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_KEY_PATH = path.join(process.cwd(), 'credentials.json'); // Use process.cwd() to work with Vercel

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/upload', upload.single('file'), async (req, res) => {
  // API logic for handling file upload
});
 {
  try {
    const { file } = req;
    const { pages, printType, copies } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const FOLDER_ID = '1N2y8WodHeYiqVkoWJYxTyeceKUtClynk'; // Replace with your Google Drive folder ID

    const fileMetadata = {
      name: file.originalname,
      mimeType: file.mimetype,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const fileResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log(`File uploaded: ${fileResponse.data.id}`);
    res.json({ message: 'File uploaded and saved to Google Drive' });

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

module.exports = app;
