const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//update user
router.put("/update/:id",async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                //hashing the user password if needed to update
                const salt = await bcrypt.genSalt(10); 
                req.body.password = await bcrypt.hash(req.body.password,salt);
            }catch(err){
                return res.status(500).json(err);
            }

        }
        //updating the user
        try{
            const user = await User.findByIdAndUpdate(req.params.id,{$set:req.body});
            res.status(200).json("Account has been updated");
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        return res.status(403).json("Not authorized");
    }
});

//delete user
router.delete("/delete/:id",async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        //deleting the user
        try{
            console.log("in delete");
            await User.findOneAndDelete({_id:req.params.id});
            res.status(200).json("Account has been deleted");
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        return res.status(403).json("Not authorized to delete");
    }
});

//get a user
router.get("/:id",async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(user){   
            const {password,isAdmin,updatedAt,...info}= user._doc;
            res.status(200).json({info});
        }else{
            res.status(404).json("User not found");
        }
    }catch(err){
        res.status(500).json(err);
    }
});

//follow a user
router.put("/:id/follow",async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                //updating the user to be followed by pushing our id in its followers list
                await user.updateOne({$push:{followers:req.body.userId}});

                //update the current user by pushing the person to be followed id into the following the list
                await currentUser.updateOne({$push:{followings:req.params.id}});

                res.status(200).json("you follow the user now");
            }else{
                res.status(403).json("You already follow this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You can't follow yourself");
    }
});


//unfollow a user
router.put("/:id/unfollow",async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                //updating the user to be followed by pushing our id in its followers list
                await user.updateOne({$pull:{followers:req.body.userId}});

                //update the current user by pushing the person to be followed id into the following the list
                await currentUser.updateOne({$pull:{followings:req.params.id}});

                res.status(200).json("you have unfollowed the user now");
            }else{
                res.status(403).json("you don't follow this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You can't unfollow yourself");
    }
});



module.exports = router;