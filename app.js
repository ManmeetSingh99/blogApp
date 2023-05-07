//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const homeStartingContent = {
  homeTitle: "Publish your passions, your way.",
  homeTitle2: "Create a unique and beautiful blog easily.",
};
const aboutContent =
  "My name is Manmeet Singh.I am 24 years old and Currently Persuing my B.Tech from Shri Shankaracharya Technical Campus, Bhilai.I have keen interest in Developing websites Using React,Javascript But Now I am Focussing more on my Backend Skills....";

mongoose.connect("mongodb://127.0.0.1:27017/blogDB");

//post Schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});

//User Schema
const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
});

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("register");
});
app.post("/", (req, res) => {

  bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
    const newUser = new User({
      fullName: req.body.name,
      username: _.lowerCase(req.body.email),
      password: hash,
    });
    newUser.save();
    res.render("login");
  })
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const loginEmail = _.lowerCase(req.body.email);
  const loginPassword = req.body.password;
  User.findOne({username:loginEmail})
      .then((foundUser)=>{
        bcrypt.compare(loginPassword,foundUser.password,(err,result)=>{
          console.log(result);
          if(result === true){
            res.redirect("/home");
          }
          else {
            res.render("register");
          }
      })
  })});

app.get("/home", (req, res) => {
  Post.find().then((posts) => {
    res.render("home", { homeContent: homeStartingContent, newPosts: posts });
  });
});

app.get("/home/about", (req, res) => {
  res.render("about", { aboutData: aboutContent });
});

app.get("/home/contact", (req, res) => {
  res.render("contact");
});

app.get("/home/compose", (req, res) => {
  res.render("compose");
});

app.post("/home/compose", (req, res) => {
  // const content = req.body.postBody;
  // const contentTruncated = content.substring(0,100);
  // const newPost = {
  //   title: req.body.postTitle,
  //   content: contentTruncated,
  // };
  // posts.push(newPost);
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save();
  res.redirect("/home");
});

app.get("/home/posts/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  // posts.forEach((post) => {
  //   const storedTitle = post.title;
  //   const storedTitleLowCase = _.lowerCase(storedTitle);

  Post.findOne({ _id: requestedPostId }).then((post) => {
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
})
