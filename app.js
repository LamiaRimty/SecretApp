//jshint esversion
require('dotenv').config();
const express= require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose.connect('mongodb://localhost:27017/userSecretDB',{useNewUrlParser: true});


const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema =new mongoose.Schema({
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

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser= new User({
            //req.body.(form-group names)
            email:req.body.username,
            password:hash
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
});


app.post("/login",function(req,res){

    const username=req.body.username;
    const password= req.body.password;

    User.findOne({ email: username},function(err,foundUser){
        if(err){
            console.log(err);
        }

        else{

            if(foundUser){
                if(foundUser.password=== password){
                    console.log(foundUser);
                    res.render("secrets");
                }
            }
        }
    });
    
});



app.listen(3000,function(){
 console.log("Server is running on port 3000 ");
});
