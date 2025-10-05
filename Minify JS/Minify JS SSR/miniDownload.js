const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(js|txt|html|css)$/i;
    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error('Only .js, .txt, .html, or .css files are allowed!'));
    }
    cb(null, true);
  }
});

// Minification function
function annotateDependencies(code) {
  try {
    const annotatedCode = UglifyJS.minify(code, {
      compress: true,
      mangle: {
        reserved: ['$scope', '$http', '$q', '$timeout', '$filter', '$compile']
      },
    });

    if (annotatedCode.error) {
      throw new Error(annotatedCode.error.message);
    }

    return annotatedCode.code;
  } catch (error) {
    throw error;
  }
}

// File upload and processing endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading the uploaded file.' });
    }

    try {
      // Minify the file
      const minifiedCode = annotateDependencies(data);

      // Create the minified file
      const minifiedFileName = `${Date.now()}.min.js`;
      const minifiedFilePath = path.join(__dirname, 'uploads', minifiedFileName);

      fs.writeFile(minifiedFilePath, minifiedCode, 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error saving the minified file.' });
        }

        res.json({ filename: minifiedFileName });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error during file minification.' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
