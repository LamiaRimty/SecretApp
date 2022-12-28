//jshint esversion
require('dotenv').config();
const express= require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
  }))

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/userSecretDB',{useNewUrlParser: true});



const userSchema =new mongoose.Schema({
    email:String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
}); //user go to homepage

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
   req.logout(function(err) {
    if (err) {
        console.log(err);
    }
        else{
            res.redirect("/");
        }
   })
});

app.post("/register",function(req,res){
 
    User.register({username: req.body.username, active: false}, req.body.password, function(err, user) {
        if (!err) { 
            res.redirect("register");
         }
      
         else{
            passport.authenticate("local")(req,res, function() {
            res.redirect("/secrets");
                // Value 'result' is set to false. The user could not be authenticated since the user is not active
              });
         }
      });
});

app.post("/login",function(req,res){
 const user = new User({
    username: req.body.username,
    password: req.body.password
 });

 req.login(user,function(err){
    if(err){
        console.log(err);
    }
    else{
        passport.authenticate("local")(req,res, function() {
        res.redirect("/secrets");
            // Value 'result' is set to false. The user could not be authenticated since the user is not active
          });
     }
 });
});



app.listen(3000,function(){
 console.log("Server is running on port 3000 ");
});
