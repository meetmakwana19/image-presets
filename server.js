import express from "express";
import bodyParser from "body-parser";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sharp from "sharp";

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
    fileFilter: (req, file, cb) => {
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
  app.post("/image-presets", upload.single("image"), async (req, res) => {
    console.log("Image route");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const transformationData = JSON.parse(req.body.transformations);

      const imagePath = path.join(__dirname, "uploads", req.file.filename);

      let image = sharp(imagePath);

      image
        .metadata()
        .then((metadata) => {
          console.log("Image width: ", metadata.width);
          console.log("Image height: ", metadata.height);
        })
        .catch((err) => {
          console.error("Error retrieving image metadata:", err);
        });

      const metadata = await image.metadata();

      console.log("rotating with -- ", transformationData.rotate);
      image.rotate(transformationData.rotate);
      image.flip(transformationData.flipHorizontal);
      image.flop(transformationData.flipVertical);

      const transformedMetadata = await image.metadata();
      console.log(
        "After transformations - Image width:",
        transformedMetadata.width
      );
      console.log(
        "After transformations - Image height:",
        transformedMetadata.height
      );

      console.log("cropping with ----- x ", transformationData.crop.x);
      console.log("cropping with ----- y ", transformationData.crop.y);
      console.log(
        "cropping with ----- width ",
        Math.round((transformationData.crop.width * metadata.width) / 350),
        " but got ",
        transformationData.crop.width
      );
      console.log(
        "cropping with ----- height ",
        Math.round((transformationData.crop.height * metadata.height) / 350),
        " but got ",
        transformationData.crop.height
      );

      // Crop the image
      image.extract({
        left: Math.round(transformationData.crop.x),
        top: Math.round(transformationData.crop.y),
        width: Math.round(transformationData.crop.width),
        height: Math.round(transformationData.crop.height),
        withoutEnlargement: true,
      });

      // Apply filters (brightness, grayscale, sepia, etc.)
      image = image
        .linear(
          // ref : https://github.com/lovell/sharp/issues/1958
          transformationData.contrast / 100,
          -((128 * transformationData.contrast) / 100) + 128
        )
        .modulate({
          brightness: transformationData.brightness / 100,
          saturation: transformationData.saturate / 100,
          hue: transformationData.hueRotate,
        })
        .grayscale(transformationData.grayscale > 0);

      if (transformationData.sepia > 0) {
        image = image
          .modulate({
            brightness: 1, // No change in brightness
            saturation: 0.3, // Reduce saturation to mimic the sepia effect
            hue: 30, // Adjust hue for the sepia tone
          })
          .tint({
            r: Math.min(112 + transformationData.sepia / 100, 255), // Adjust values as per sepia transformation
            g: Math.min(66 + transformationData.sepia / 100, 255), // Adjust values to balance green channel
            b: Math.min(20 + transformationData.sepia / 100, 255), // Adjust values to balance blue channel
          });
      }

      // Save the processed image
      image.toFile(`uploads/sharp-${req.file.filename}`, (err, info) => {
        if (err) {
          console.log("Error processing image: ", err);
          return res.status(500).json({
            message: "Failed to process image",
            error: err,
          });
        }
        res.json({
          message: "Image processed successfully",
          file: req.file,
          originalFile: req.file.filename,
          processedFile: "sharpProcessed-" + req.file.filename,
          info: info,
        });
      });
    } catch (error) {
      console.error("Error processing image: ", error);
      return res.status(500).json({ error: "Error processing image" });
    }
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
