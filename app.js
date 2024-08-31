if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// this .env file use only in development phase not in production phase 
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session =require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter =require("./routes/user.js");

require('dotenv').config();


const port=8080;
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
//   await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))



// cloud 
const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: "mysupersecretcode" ,
    },
    touchAfter: 24 * 3600,  
});

store.on("error",()=>{
    console.log("error in mongo session store ",err);
});


// using cookie 
const sessionOptions={
    store,
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// flash always use before routes 

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})


// demo user
// app.get("/demo",async(req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"aryan"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
//     // here register is a static method for save our user where second parameter is our password = helloworld in this case 
//     // register automatic checked whether username unique or not 
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter );
app.use("/",userRouter );

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

// middleware for error
app.use((err,req,res,next)=>{
    // res.send("something went wrong ");
    let {statusCode=500,message="Something went wrong !"}= err ; 
    // res.status(statusCode).send(message) ;
    // res.render("error.ejs",{message}) ; 
    // res.render("error.ejs",{err }) ; 

    res.status(statusCode).render("error.ejs",{err }) ; 
});

app.listen(port, () => {
    console.log("server is listening to port 8080");
});
