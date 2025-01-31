const {google} = require('googleapis');

// Load environment variables
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;

// Set up the Google API authentication using the service account
const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,   // Service account email
  null,                  // No client secrets
  GOOGLE_PRIVATE_KEY,    // Private key
  ['https://www.googleapis.com/auth/drive'],  // Required scopes for Google Drive
  null                   // No specific audience
);

// Authenticate the API client
google.options({auth});

// Example API route that lists files from Google Drive
module.exports = async (req, res) => {
  try {
    const drive = google.drive({version: 'v3', auth});
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });

    const files = response.data.files;
    if (files.length) {
      res.status(200).json({files});
    } else {
      res.status(404).json({message: 'No files found.'});
    }
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};
