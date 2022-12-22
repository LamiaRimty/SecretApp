//jshint esversion
const express= require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userSecretDB',{useNewUrlParser: true});


const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));




app.get("/",function(req,res){
    res.render("home");
}); //user go to homepage

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});


app.listen(3000,function(){
 console.log("Server is running on port 3000 ");
});
