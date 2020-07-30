const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Blog = require('../models/blog')
const Like = require('../models/like')
const authDup = require('../middleware/authDup')
const Comment = require('../models/comment')
const User = require('../models/user')

//body-token and comment
router.post('/comment/:id',auth,async (req,res) =>{
    try{
        const user = await User.findById(req.user._id)

        if(!user)
        throw new Error()
    
     //   const duplicate = await Comment.findDuplicates(req.user._id,req.params.id)
    
        const comment = new Comment({
            commentedBy:req.user._id,
            body:req.body.comment,
            avatar:req.user.avatar,
            blog:req.params.id,
            name:req.user.name
        })

        await comment.save()
        res.send(comment)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/comment/:id',async (req,res) =>{
    try{
        const comments = await Comment.find({blog:req.params.id}).sort({
            createdAt:-1
        })

        res.status(200).send(comments)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.post('/comment/remove/:id',auth,async (req,res) =>{
    const comment = await Comment.findOne({_id:req.params.id,commentedBy:req.user._id})

    if(!comment)
    return res.status(404).send()

    try{
        await comment.remove()

        res.send()
    }catch(error){
        res.status(400).send()
    }
})

module.exports = router
