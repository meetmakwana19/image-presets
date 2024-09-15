import express from "express";
import bodyParser from "body-parser";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ref : https://dev.to/loujaybee/using-create-react-app-with-express
// ref: https://dev.to/deepakjaiswal/edit-image-in-nodejs-using-sharp-3fe7
try {
  console.log("Starting server...");

  const app = express();
  app.use(express.static(path.join(__dirname, "build")));

  // Set storage engine and destination for image uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  // Initialize multer with storage settings
  const upload = multer({
    storage: storage, // Storage settings
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFiler: (req, file, cb) => {
      // Check file type (accept only images)
      const filetypes = /jpeg|jpg|png|gif|webp/;

      const mimetype = filetypes.test(file.mimetype);

      const extensionName = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extensionName) {
        return cb(null, true);
      } else {
        cb("Error: Images Only!");
      }
    },
  });

  // ROUTES :------------------------------------
  app.post("/image-presets", upload.single("image"), (req, res) => {
    console.log("Image route");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      message: "Image uploaded successfully",
      file: req.file,
    });
  });

  app.get("/ping", function (req, res) {
    return res.send("pong");
  });

  app.get("/", function (req, res) {
    // res.sendFile(path.join(__dirname, "build", "index.html"));
    return res.send("Hello ! This is an Image Processing API.");
  });

  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server started on port ${process.env.PORT || 8000}`);
  });
} catch (error) {
  console.error("Error starting server: ", error);
}
