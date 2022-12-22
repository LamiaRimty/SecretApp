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

const userSchema = mongoose.Schema({
    email:String,
    password: String
});

const User = mongoose.model("User",userSchema);



app.get("/",function(req,res){
    res.render("home");
}); //user go to homepage

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const newUser= new User({
        //req.body.(form-group names)
        email:req.body.username,
        password:req.body.password
    });
    newUser.save( function(err){
            if(err){
                console.log(err);
            }
            else{
                res.render("secrets");
            }
    });
});





app.listen(3000,function(){
 console.log("Server is running on port 3000 ");
});
