const express = require("express");
const jwt = require("jsonwebtoken");
const jwt_password = "karishmarawat12345567890!@#$%^7*";
const { UserModel, BlogModel } = require("./db");
const mongoose = require("mongoose");
const path = require("path")
mongoose.connect("mongodb+srv://admin:ieiDNs5hmV2mhVFL@cluster0.tp8kfsa.mongodb.net/blog");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Cloudinary config
cloudinary.config({
  cloud_name: "dijxdbgxy",
  api_key: "773163367135617",
  api_secret: "8v0RKk-E17T4sGMxr6pAHMf0Uks",
});

// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });


async function auth(req, res, next) {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    const decoded = jwt.verify(token, jwt_password);
    const userId = decoded.id;

    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return res.status(403).json({ msg: "Invalid credentials" });
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
}

app.use(express.static(path.join(__dirname, "public")));

app.post("/signup", async function (req, res) {
  const { email, password } = req.body;

  try {
    await UserModel.create({ email, password });
    res.status(200).json({ msg: "Signed up successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ msg: "Email already exists" });
    } else {
      res.status(500).json({ msg: "Server error" });
    }
  }
});


app.post("/signin", async function (req, res) {
  const { email, password } = req.body;
  const foundUser = await UserModel.findOne({ email, password });

  if (!foundUser) {
    res.status(403).json({ msg: "Please sign up first" });
  } else {
    const token = jwt.sign({ email: email, id: foundUser._id }, jwt_password);
    res.status(200).json({
      msg: "You are signed in",
      token: token
    });
    console.log(foundUser);
  }
});

app.post(
  "/blog",
  auth,
  upload.single("image"),
  async (req, res) => {

    console.log("FILE:", req.file); 

    if (!req.file) {
      return res.status(400).json({ msg: "NO FILE RECEIVED" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "blog-images" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    
    const blog = await BlogModel.create({
      headline: req.body.headline,
      discripation: req.body.discripation,
      userId: req.userId,
      image: result.secure_url,
    });

    res.json({ msg: "OK", blog });
  }
);

app.delete("/delete" ,auth ,async function(req,res){
  const id = req.headers.id;
  const userId = req.userId;
  await BlogModel.findByIdAndDelete({
    _id : id ,
    userId : userId
  });
  res.status(200).json({
    msg : "removed from your blog"
  });
});

app.get("/blogs" ,auth ,async function(req,res){
  const userId = req.userId;
  const foundblogs = await BlogModel.find({ userId: userId });
  res.status(200).json({
    blogs : foundblogs
  });
  console.log(foundblogs);
});

app.put("/update" ,auth ,async function(req,res){
  const id = req.headers.id;
  const userId = req.userId;
  const newheadline = req.body.newheadline;
  const newdiscripation = req.body.newdiscripation;
  await BlogModel.findByIdAndUpdate(
    { _id: id, userId: userId }, // filter
    { headline: newheadline, discripation: newdiscripation }, // update
    { new: true } // return updated document
  );
  res.status(200).json({
    msg : "updated from your blog"
  });
});

app.listen(3000);

