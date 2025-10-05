const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cleanCSS = require('clean-css');
const sass = require('sass');

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

// Function to minify the SCSS or CSS content
function minifyCSS(content) {
  const minified = new cleanCSS().minify(content);
  return minified.styles;
}

// Function to compile and minify SCSS
function compileAndMinifySCSS(content) {
    try {
      const result = sass.compileString(content, {
        style: 'compressed', // compress the output
      });
      return result.css.toString();
    } catch (error) {
      throw new Error('Error during SCSS compilation: ' + error.message);
    }
  }

// Handle file upload and minification
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  // Minify the uploaded file (CSS/SCSS)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    let minifiedContent;
    const extname = path.extname(req.file.originalname).toLowerCase();

    try {
      if (extname === '.scss') {
        // Compile and minify SCSS file
        minifiedContent = compileAndMinifySCSS(data);
      } else if (extname === '.css') {
        // Minify CSS file
        minifiedContent = minifyCSS(data);
      } else {
        return res.status(400).send('Unsupported file type.');
      }

      // Write the minified content to a new file
      const minifiedFilePath = path.join(__dirname, 'uploads', Date.now() + '.min' + extname);
      fs.writeFile(minifiedFilePath, minifiedContent, 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error saving the minified file.');
        }

        // Return the path for download
        res.json({ filename: path.basename(minifiedFilePath) });
      });
    } catch (error) {
      return res.status(500).send('Error during minification process: ' + error.message);
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
