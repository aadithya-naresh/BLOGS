const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Blog = require('../models/blog')
const Like = require('../models/like')
const authDup = require('../middleware/authDup')



router.post('/like/:id',auth,async (req,res) =>{
   
    const duplicate = await Like.findDuplicates(req.user._id,req.params.id)

    
    if(duplicate)
    return res.status(400).send()

    const like = new Like({
        likedBy:req.user._id,
        blog:req.params.id
    })
    try{
        await like.save({name:req.user.name})
        res.send(like)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/like/:id',async (req,res) =>{
    try{
        const likes = await Like.countDocuments({blog:req.params.id})

        res.status(200).send({like:likes})
    }catch(error){
        res.status(400).send()
    }
})

router.post('/like/remove/:id',auth,async (req,res) =>{
    const like = await Like.findOne({likedBy:req.user.id,blog:req.params.id})

    if(!like)
    return res.status(404).send()
    try{
        await like.remove()

        res.send()
    }catch(error){
        res.status(400).send()
    }
})

module.exports = router
