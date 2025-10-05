const express = require('express');
const fs = require('fs');
const path = require('path');
const cleanCSS = require('clean-css');
const sass = require('sass');
const { minify } = require('html-minifier');
const UglifyJS = require('uglify-js');

const app = express();
const port = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));
app.use(express.json()); // For parsing application/json

// Get file structure from structure.json
app.get('/getFileDetails', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'structure.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading structure.json file.');
    }
    res.json(JSON.parse(data));
  });
});

// Function to minify HTML content
function minifyHTML(code) {
  return minify(code, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  });
}

// Function to minify CSS content
function minifyCSSContent(content) {
  return new cleanCSS().minify(content).styles;
}

// Function to compile and minify SCSS content
function compileAndMinifySCSS(content) {
  const result = sass.compileString(content, { style: 'compressed' });
  return result.css.toString();
}

// Function to minify JS content
function annotateAndMinifyJS(code) {
  const minified = UglifyJS.minify(code, {
    compress: true,
    mangle: { reserved: ['$scope', '$rootScope', '$http', '$q', '$timeout', '$filter', '$compile'] },
    output: { beautify: false }
  });
  return minified.code;
}

// Load structure.json to access the file paths
const structureFilePath = path.join(__dirname, 'public', 'structure.json');

app.post('/minifyFile', (req, res) => {
  const { index } = req.body;  // Assume index is sent in the request to identify the file

  // Validate that the index is provided
  if (typeof index === 'undefined') {
    return res.status(400).send('Index is required.');
  }

  // Log the received index to debug
  console.log('Received index:', index);

  // Read the structure.json to get the file details
  fs.readFile(structureFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading structure.json.');
    }

    const files = JSON.parse(data);

    // Log the structure to see the file details
    console.log('Structure file contents:', files);

    // Check if the file exists at the specified index
    const fileDetails = files.find(file => file.Index === index);

    if (!fileDetails) {
      return res.status(400).send('File not found for the given index.');
    }

    const filePath = fileDetails.FullPath;
    const extname = path.extname(filePath).toLowerCase();

    // Read the file content and proceed with minification
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

        // Save the minified content to the original file
        fs.writeFile(filePath, minifiedContent, 'utf8', (err) => {
          if (err) {
            return res.status(500).send('Error saving the minified file.');
          }

          res.send('File minified successfully.');
        });
      } catch (error) {
        res.status(500).send('Error during minification process: ' + error.message);
      }
    });
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
