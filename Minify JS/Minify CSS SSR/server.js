const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");
const cleanCSS = require("clean-css");
const sass = require("sass");

const app = express();
const port = 3000;

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage: storage });
app.use(express.static("public")); // Serve static files from the 'public' folder

// Function to optimize JS code
function optimizeJS(code) {
  try {
    const optimized = UglifyJS.minify(code, {
      compress: true,
      mangle: {
        reserved: [
          "$scope",
          "$rootScope",
          "$http",
          "$q",
          "$timeout",
          "$filter",
          "$compile",
          "myeNovationConstant",
        ], // Prevent mangling reserved dependencies
      },
    });
    if (optimized.error) {
      throw new Error(optimized.error.message);
    }
    return optimized.code;
  } catch (error) {
    throw new Error("Error optimizing JS: " + error.message);
  }
}

// Function to minify CSS
function optimizeCSS(content) {
  const minified = new cleanCSS().minify(content);
  if (minified.errors.length > 0) {
    throw new Error("Error optimizing CSS: " + minified.errors.join(", "));
  }
  return minified.styles;
}

// Function to compile and optimize SCSS
function optimizeSCSS(content) {
  try {
    const result = sass.compileString(content, {
      style: "compressed", // Compress the output
    });
    return result.css.toString();
  } catch (error) {
    throw new Error("Error optimizing SCSS: " + error.message);
  }
}

// Handle file upload and optimization
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join(__dirname, "uploads", req.file.originalname);
  const extname = path.extname(req.file.originalname).toLowerCase();

  // Optimize the uploaded file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading the file.");
    }

    let optimizedContent;
    try {
      if (extname === ".js") {
        // Optimize JS file
        optimizedContent = optimizeJS(data);
      } else if (extname === ".css") {
        // Optimize CSS file
        optimizedContent = optimizeCSS(data);
      } else if (extname === ".scss") {
        // Compile and optimize SCSS file
        optimizedContent = optimizeSCSS(data);
      } else {
        return res.status(400).send("Unsupported file type.");
      }

      // Save the optimized content to the same file
      fs.writeFile(filePath, optimizedContent, "utf8", (err) => {
        if (err) {
          return res.status(500).send("Error saving the optimized file.");
        }

        res.json({
          message: "File optimized successfully.",
          fileName: req.file.originalname,
          filePath: `/uploads/${req.file.originalname}`,
        });
      });
    } catch (error) {
      return res.status(500).send("Error optimizing the file: " + error.message);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
