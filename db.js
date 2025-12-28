const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const user = new Schema({
    email : {type : String , unique : true} ,
    password : String
});

const blog = new mongoose.Schema(
    {
      headline: { type: String, required: true },
      discripation: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
      image: {
        type: String, 
      },
    },
    { timestamps: true }
  );
  
const UserModel = mongoose.model("users" ,user);
const BlogModel = mongoose.model("blogs" , blog);

module.exports ={
    UserModel : UserModel ,
    BlogModel : BlogModel
}