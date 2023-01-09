const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

//create a post
router.post("/",async(req,res)=>{
    const newPost = new Post(req.body);
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err);
    }
});

//update a post
router.put("/:postId",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.postId);
        if(post.userId === req.body.userId){
            await Post.findByIdAndUpdate(req.params.postId,{$set:req.body});
            res.status(200).json("Post has been Updated");
        }else{
            res.status(403).json("Not Authorized");
        }
    }catch(err){
        res.status(500).json(err);
    }
});

//delete a post
router.delete("/:postId",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.postId);
        if(post.userId === req.body.userId){
            await Post.findByIdAndDelete(req.params.postId,{$set:req.body});
            res.status(200).json("Post has been deleted");
        }else{
            res.status(403).json("Not Authorized");
        }
    }catch(err){
        res.status(500).json(err);
    }
});


//like / dislike a post
router.put("/:postId/like", async(req,res)=>{
    try{
        const post = await Post.findById(req.params.postId);

        //to check whether the person liking the post is already on the like list
        if(!post.likes.includes(req.body.userId)){
            //we can use updateone function on the found post from above
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("You Liked the Post");
        }else{
            //dislike post if already liked
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("You DisLiked the Post");
        }
    }catch(err){
        res.status(500).json(err);
    }
});


//get a post
router.get("/:postId",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.postId);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
});

//getAll posts from the followings of the user
router.get("/timeline/all",async(req,res)=>{
    try{
        console.log("finding all posts");
        const currentUser = await User.findById(req.body.userId);
        //finding all posts of the currentuser
        const userPosts = await Post.find({userId : currentUser._id});
        
        //finding all posts of the friends in the followings
        const friendPosts = await Promise.all(  //we used promise all cause we are using map function and await won't work while using map
            currentUser.followings.map((friendId)=>{
                return Post.find({userId:friendId});
            })
        );
        res.json(userPosts.concat(...friendPosts));
    }catch(err){
        res.status(500).json(err);
    }
});


module.exports = router;