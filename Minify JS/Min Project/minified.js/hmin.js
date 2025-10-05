const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');

const app = express();
const port = 3000;

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // specify the folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // name the file with a timestamp
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public')); // Serve static files from 'public' folder

// Function to minify HTML content
function minifyHTML(code) {
  try {
    const minifiedCode = minify(code, {
      collapseWhitespace: true, // Remove unnecessary spaces
      removeComments: true,      // Remove comments
      minifyCSS: true,          // Minify inline CSS
      minifyJS: true,           // Minify inline JS
      removeEmptyAttributes: true, // Remove empty attributes
      removeScriptTypeAttributes: true, // Remove type="text/javascript" from <script> tags
      removeStyleLinkTypeAttributes: true // Remove type="text/css" from <style> and <link> tags
    });

    return minifiedCode;
  } catch (error) {
    throw error;
  }
}

// Handle file upload and minification
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  // Minify the uploaded HTML file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    try {
      // Minify the HTML content
      const minifiedCode = minifyHTML(data);

      // Write the minified content to a new file
      const minifiedFilePath = path.join(__dirname, 'uploads', Date.now() + '.min.html');
      fs.writeFile(minifiedFilePath, minifiedCode, 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error saving the minified file.');
        }

        // Automatically download the minified file
        res.download(minifiedFilePath, (err) => {
          if (err) {
            return res.status(500).send('Error downloading the file.');
          }

          console.log('Minified file sent for download:', minifiedFilePath);
        });
      });
    } catch (error) {
      res.status(500).send('Error during minification process.');
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
