const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cleanCSS = require('clean-css');
const sass = require('sass');
const { minify } = require('html-minifier');
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

// Function to minify HTML content
function minifyHTML(code) {
  try {
    return minify(code, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    });
  } catch (error) {
    throw error;
  }
}

// Function to minify CSS content
function minifyCSSContent(content) {
  return new cleanCSS().minify(content).styles;
}

// Function to compile and minify SCSS content
function compileAndMinifySCSS(content) {
  try {
    const result = sass.compileString(content, { style: 'compressed' });
    return result.css.toString();
  } catch (error) {
    throw new Error('Error during SCSS compilation: ' + error.message);
  }
}

// Function to minify JS content with AngularJS dependency annotations
function annotateAndMinifyJS(code) {
  try {
    const minified = UglifyJS.minify(code, {
      compress: true,
      mangle: {
        reserved: ['$scope', '$rootScope', '$http', '$q', '$timeout', '$filter', '$compile']
      },
      output: { beautify: false },
    });

    if (minified.error) {
      throw new Error(minified.error.message);
    }

    return minified.code;
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
  const extname = path.extname(req.file.originalname).toLowerCase();

  // Read the uploaded file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    let minifiedContent;

    try {
      switch (extname) {
        case '.html':
          minifiedContent = minifyHTML(data);
          break;
        case '.css':
          minifiedContent = minifyCSSContent(data);
          break;
        case '.scss':
          minifiedContent = compileAndMinifySCSS(data);
          break;
        case '.js':
          minifiedContent = annotateAndMinifyJS(data);
          break;
        default:
          return res.status(400).send('Unsupported file type.');
      }

      // Save the minified content to a new file
      const minifiedFilePath = path.join(__dirname, 'uploads', Date.now() + '.min' + extname);
      fs.writeFile(minifiedFilePath, minifiedContent, 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error saving the minified file.');
        }

        // Send the minified file for download
        res.download(minifiedFilePath, (err) => {
          if (err) {
            return res.status(500).send('Error downloading the file.');
          }
          console.log('Minified file sent for download:', minifiedFilePath);
        });
      });
    } catch (error) {
      res.status(500).send('Error during minification process: ' + error.message);
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
