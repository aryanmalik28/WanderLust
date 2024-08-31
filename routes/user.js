const express= require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl}=require("../middleware.js");

const userController=require("../controllers/users.js");

// signup combined 
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup))

// login combined 
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,
    passport.authenticate("local",{ 
        failureRedirect: "/login",failureFlash:true  }),userController.login)

// router.get("/signup",userController.renderSignupForm)
//signup
// router.post("/signup",wrapAsync(userController.signup));

// router.get("/login",userController.renderLoginForm)
// router.post("/login",saveRedirectUrl,passport.authenticate("local",{ failureRedirect: "/login",failureFlash:true  }),userController.login);


// logout
router.get("/logout",userController.logout)


module.exports=router;