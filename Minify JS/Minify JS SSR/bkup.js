const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

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

// Function to add AngularJS dependency injection annotations
function annotateDependencies(code) {
  try {
    const annotatedCode = UglifyJS.minify(code, {
      compress: true,
      mangle: {
        reserved: ['$scope', '$rootScope', '$http', '$q', '$timeout', '$filter', '$compile', 'myeNovationConstant'] // Add dependencies to prevent mangling
      },
      output: {
        beautify: false, // Set to true if you want readable minified code
      },
    });

    if (annotatedCode.error) {
      throw new Error(annotatedCode.error.message);
    }

    return annotatedCode.code;
  } catch (error) {
    // console.error('Error during dependency annotation:', error.message);
    throw error;
  }
}

// Handle file upload and minification
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    // console.error('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  // Minify the uploaded file with dependency annotation
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
    //   console.error('Error reading the file:', err);
      return res.status(500).send('Error reading the file.');
    }

    try {
      // Add dependency annotations and minify the content
      const minifiedCode = annotateDependencies(data);

      // Write the minified content to a new file
      const minifiedFilePath = path.join(__dirname, 'uploads', Date.now() + '.min.js');
      fs.writeFile(minifiedFilePath, minifiedCode, 'utf8', (err) => {
        if (err) {
        //   console.error('Error saving the minified file:', err);
          return res.status(500).send('Error saving the minified file.');
        }

        // Automatically download the minified file
        res.download(minifiedFilePath, (err) => {
          if (err) {
            // console.error('Error during file download:', err);
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
