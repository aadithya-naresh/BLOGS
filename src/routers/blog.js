const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Blog = require('../models/blog')
const testBlog = require('../models/blogTest')
const User = require('../models/user')
const authDup = require('../middleware/authDup')
const Like = require('../models/like')
const Comment = require('../models/comment')

router.post('/blogs/test',auth,async (req,res) =>{
    try{
        const images = req.body.images
       console.log(images)
         const blog = new testBlog({
            title:req.body.title,
            body:req.body.body,
            owner:req.user._id,
            images
        })
         await blog.save()
        res.status(201).send(blog)
    }catch(error){
        res.status(400).send({error:error.message})
    }
})

router.get('/blogs/test/:id',async (req,res) =>{
    try{
        const blog = await testBlog.findById(req.params.id)
        if(!blog)
        res.status(404).send()

        res.send(blog)
    }catch(e){
        console.log(e)
        res.status(400).send()
    }
})
router.post('/blogs',auth,async (req,res) =>{
    try{
        const images = req.body.images
        const blog = new Blog({
            title:req.body.title,
            body:req.body.body,
            owner:req.user._id,
            images
        })

        await blog.save()
        res.status(201).send(blog)
    }catch(error){
        res.status(400).send({error:error.message})
    }
})
//1
router.get('/blogs',authDup,async (req,res) =>{
    try{
        const blogs = await Blog.find({}).sort({
            createdAt:-1
        })

        let objects  = []
        for(i=0;i<blogs.length;i++){
        const user = await User.findById(blogs[i].owner)
        const isLiked = await Like.findOne({likedBy:req.user._id,blog:blogs[i]._id})

        const likes = await Like.countDocuments({blog:blogs[i]._id})
        if(!blogs[i] || !user)
        res.status(404).send()

        const avatar = user.avatar
        const name = user.name
        
        if(!isLiked){
        objects = objects.concat({
            title:blogs[i].title,
            body:blogs[i].body,
            id:blogs[i]._id,
            name,
            createdAt:blogs[i].createdAt,
            owner:blogs[i].owner,
            likes,
            avatar,
            isLiked:false,
            images:blogs[i].images
        })
        }

        else{
            objects = objects.concat({
                title:blogs[i].title,
                body:blogs[i].body,
                id:blogs[i]._id,
                name,
                createdAt:blogs[i].createdAt,
                owner:blogs[i].owner,
                likes,
                avatar,
                isLiked:true,
                images:blogs[i].images
            })
        }
        
        }
        res.status(200).send(objects)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/blogs/find/:id',async (req,res) =>{
    try{
        const blog = await Blog.findById(req.params.id).sort({
            createdAt:-1
        })
        if(!blog)
        res.status(404).send()
        
        const likes = await Like.countDocuments({blog:blog._id})

        const comments = await Comment.find({blog:req.params.id})
        
        res.status(200).send({blog,likes,comments})
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

//3
router.get('/blogs/me',authDup,async (req,res) =>{
    try{
       const blogs = await Blog.find({owner:req.user._id}).sort({
           createdAt:-1
       })

       if(!blogs)
        return res.status(404).send()

        const user = await User.findById(req.user.id)
        let objects  = []
        for(i=0;i<blogs.length;i++){
        const isLiked = await Like.findOne({likedBy:req.user._id,blog:blogs[i]._id})

        const likes = await Like.countDocuments({blog:blogs[i]._id})

        const avatar = user.avatar
        const name = user.name

        if(!isLiked){
        objects = objects.concat({
            title:blogs[i].title,
            body:blogs[i].body,
            id:blogs[i]._id,
            createdAt:blogs[i].createdAt,
            owner:req.user._id,
            likes,
            avatar,
            name,
            isLiked:false,
            images:blogs[i].images
        })
         }

    else{
        objects = objects.concat({
            title:blogs[i].title,
            body:blogs[i].body,
            id:blogs[i]._id,
            createdAt:blogs[i].createdAt,
            owner:req.user._id,
            likes,
            avatar,
            name,
            isLiked:true,
            images:blogs[i].images
        })
      }
        }

        res.status(200).send(objects)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})
//2
router.get('/blogs/users/:id',authDup,async (req,res) =>{
    try{
        const blogs = await Blog.find({owner:req.params.id}).sort({
            createdAt:-1
        })
         if(!blogs)
        res.status(404).send()

        const user = await User.findById(req.params.id)
        if(!user)
        res.status(404).send()

    
        let objects  = []
        for(i=0;i<blogs.length;i++){
        const isLiked = await Like.findOne({likedBy:req.user._id,blog:blogs[i]._id})

        const likes = await Like.countDocuments({blog:blogs[i]._id})

        const avatar = user.avatar
        const name = user.name

        if(!isLiked){
        objects = objects.concat({
            title:blogs[i].title,
            body:blogs[i].body,
            id:blogs[i]._id,
            createdAt:blogs[i].createdAt,
            owner:req.params.id,
            likes,
            avatar,
            name,
            isLiked:false,
            images:blogs[i].images
        })
    }
    else{
        objects = objects.concat({
            title:blogs[i].title,
            body:blogs[i].body,
            id:blogs[i]._id,
            createdAt:blogs[i].createdAt,
            owner:req.params.id,
            likes,
            avatar,
            name,
            isLiked:true,
            images:blogs[i].images
        })
    }
        }

        res.send(objects)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/blogs/:id/image',async (req,res) =>{
    try{
      const blog = await testBlog.findById(req.params.id)
        if(!blog || !blog.image){
            throw new Error()
        }
        res.set('Content-type','image/png')
        res.send(blog.image)
    }catch(error){
        res.status(404).send()
    }
})

router.post('/blogs/remove/:id',auth,async (req,res) =>{

    try{
        const blog = await Blog.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if(!blog)
        return res.status(404).send()
        await Like.deleteMany({blog:blog._id})
        await Comment.deleteMany({blog:blog._id})


        res.send(blog)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

module.exports = router
  