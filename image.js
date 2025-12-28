const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");


const app = express();

cloudinary.config({ 
        cloud_name: 'dijxdbgxy', 
        api_key: '773163367135617', 
        api_secret: '8v0RKk-E17T4sGMxr6pAHMf0Uks' // Click 'View API Keys' above to copy your API secret
    });


// Middleware
app.use(cors());
app.use(express.json());

// Static folder for serving uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://admin:ieiDNs5hmV2mhVFL@cluster0.tp8kfsa.mongodb.net/blog";

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("MongoDB error:", err.message);
  process.exit(1);
});

// Schema
const ImageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", ImageSchema);

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "images" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // OPTIONAL: optimized delivery URL
    const optimizedUrl = cloudinary.url(result.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // OPTIONAL: auto-cropped square image
    const croppedUrl = cloudinary.url(result.public_id, {
      crop: "auto",
      gravity: "auto",
      width: 100,
      height: 100,
    });

    // Save to DB (choose ONE you want)
    const newImage = new Image({
      name: req.file.originalname,
      path: optimizedUrl, // or result.secure_url or croppedUrl
    });

    await newImage.save();

    res.status(201).json({
      message: "Image uploaded directly to Cloudinary",
      image: newImage,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});


app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: " Failed to fetch images" });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));