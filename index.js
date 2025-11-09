const express = require("express");
const jwt = require("jsonwebtoken");
const jwt_password = "karishmarawat12345567890!@#$%^7*";
const { UserModel, BlogModel } = require("./db");
const mongoose = require("mongoose");
const path = require("path")
mongoose.connect("mongodb+srv://admin:ieiDNs5hmV2mhVFL@cluster0.tp8kfsa.mongodb.net/blog");
const app = express();
app.use(express.json());

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

app.post("/blog" ,auth ,async function(req,res){
  const headline = req.body.headline;
  const discripation = req.body.discripation;
  const userId = req.userId;
  await BlogModel.create({
    headline : headline ,
    discripation : discripation ,
    userId : userId
  });
  res.status(200).json({
    msg : "added to your blog"
  });
  console.log(userId);
});

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

