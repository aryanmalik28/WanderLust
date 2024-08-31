const express= require("express");
// const router=express.Router();
const router=express.Router({mergeParams:true});

const wrapAsync=require("../utils/wrapAsync.js");
const {validateReview,isLoggedIn,isreviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

// Reviews route 
// post route 
    router.post("/",isLoggedIn,validateReview,wrapAsync (reviewController.createReview));

// delete route ( review )
router.delete("/:reviewId", isLoggedIn,isreviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports=router;
