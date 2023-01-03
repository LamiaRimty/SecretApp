//jshint esversion
require('dotenv').config();
const express= require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
var findOrCreate = require('mongoose-findorcreate')


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
    password: String,
    googleId:String,
    facebookId: String,
    secret: String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User =new mongoose.model("User",userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/hushhush"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/hushhush"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/",function(req,res){
    res.render("home");
}); //user go to homepage


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/hushhush', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/hushhush',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    User.find({ "secret": { $ne :  null } }, function(err,foundUsers){
        if(err){
            console.log(err);
        }

        else{
            if(foundUsers){
                res.render("secrets",{ usersWithSecrets: foundUsers })
            }
        }
    });
});


app.get("/submit",function(req,res){
    if(req.isAuthenticated){
        res.render("submit");
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

app.post("/submit",function(req,res){
    const submittedSecret= req.body.secret;
    console.log(req.user.id);
    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                foundUser.secret=submittedSecret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    });
});


app.listen(3000,function(){
 console.log("Server is running on port 3000 ");
});
