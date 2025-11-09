const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const user = new Schema({
    email : {type : String , unique : true} ,
    password : String
});

const blog = new Schema({
    headline : String ,
    discripation : String ,
    userId : ObjectId
});

const UserModel = mongoose.model("users" ,user);
const BlogModel = mongoose.model("blogs" , blog);

module.exports ={
    UserModel : UserModel ,
    BlogModel : BlogModel
}