const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const { Router } = require('express')
const authDup = require('../middleware/authDup')

router.post('/users', async (req,res) =>{
    try{
        await User.findDuplicates(req.body.email)

        if(!req.body.password)
        throw new Error('Password required')

        const user = new User(req.body)
        user.notifTokens = user.notifTokens.concat({
            notifToken: req.body.notifToken
        })
         await user.save()
         const token = await user.generateAuthToken()
         res.status(201).send({user,token})
    }catch(error){
        res.status(400).send({error : error.message})
    }
})

router.post('/users/google',async (req,res) =>{
    const checkUser = await User.findEmail(req.body.email)

    if(checkUser){

        try{
            if(req.body.notifToken){
                checkUser.notifTokens = checkUser.notifTokens.concat({
                    notifToken:req.body.notifToken       
                })
                await checkUser.save()
            }
            const token = await checkUser.generateAuthToken()
            return res.status(201).send({checkUser,token})
        }catch(error){
            return res.status(400).send({error : error.message})
        }
    }

    const user = new User(req.body)
    try{
         await user.save()
         const token = await user.generateAuthToken()
         res.status(201).send({user,token})
    }catch(error){
        res.status(400).send({error : error.message})
    }
})

//1
router.post('/users/me/avatar',auth,async (req,res) =>{
    console.log(req.body.avatar)
   req.user.avatar = req.body.avatar
    await req.user.save()
    res.send()
})

router.post('/users/login',async (req,res) =>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)

        if(req.body.notifToken){
            user.notifTokens = user.notifTokens.concat({
                notifToken:req.body.notifToken       
            })
            await user.save()
        }
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})
router.get('/users/me',authDup,async (req,res) =>{
    res.send({user:req.user,upvotes:req.user.upvotes.length})
})


router.post('/users/logout',auth,async (req,res) =>{
    try{  
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token != req.token
        })

        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})

//2
router.post('/users/logoutAll',auth,async (req,res) =>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})



//3
router.post('/users/upvote',auth,async (req,res) =>{
    try{
        const user = await User.findById(req.body.id)

        if(!user){
            res.status(404).send()
        }

        const check = user.upvotes.find((upvote) =>{
            return upvote.upvote.toString() == req.user._id.toString()
        })
        if(check){
            throw new Error()
        }
        user.upvotes = user.upvotes.concat({upvote:req.user._id})
        await user.save()

        res.status(200).send(user.upvotes)
    }catch(error){
        res.status(400).send()
    }
})

//4
router.post('/users/delete/upvote',auth,async (req,res) =>{
    try{
        const user = await User.findById(req.body.id)

        if(!user || !user.upvotes){
            res.status(404).send()
        }

        user.upvotes = user.upvotes.filter((upvote) =>{
            return upvote.upvote.toString() != req.user._id.toString()
        })

        await user.save()
        res.status(200).send(user.upvotes)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/users/upvote/:id',async (req,res) =>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.upvotes){
            res.status(404).send()
        }
        
        let objects = []

        for(i=0;i<user.upvotes.length;i++){
            const newUser = await User.findById(user.upvotes[i].upvote)

            if(!newUser)
            continue

            objects = objects.concat({
                user:newUser
            })
        }

        res.send(objects)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.get('/users/countUpvote',async (req,res) =>{
    try{
        const user = await User.findById(req.body.id)

        if(!user || !user.upvotes){
            res.status(404).send()
        }

        res.status(200).send({"size" : user.upvotes.length})
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})
router.post('/users/bookmarks',auth,async (req,res) =>{
    try{
        const user = req.user

        const check = user.bookmarks.find((bookmark) =>{
            return bookmark.bookmark == req.body.id
        })

        if(check){
            throw new Error()
        }

        user.bookmarks = user.bookmarks.concat({bookmark:req.body.id})
        await user.save()
         
        res.status(200).send(user.bookmarks)
    }catch(error){
        res.status(400).send()
    }
})

router.delete('/users/bookmarks',auth,async (req,res) =>{
    try{
        const user = req.user
        
        user.bookmarks = user.bookmarks.filter((bookmark) =>{
            return bookmark.bookmark != req.body.id
        })

        await user.save()
        res.status(200).send(user.bookmarks)
    }catch(error){
        res.status(400).send()
    }
})

router.get('/users/bookmarks',auth,async (req,res) =>{
    try{
        res.send(req.user.bookmarks)
    }catch(error){
        res.status(400).send()
    }
})
router.patch('/users/me',auth,async (req,res) =>{
    const updates = Object.keys(req.body)
    const allowed = ['name','age','password','email']

    const isPermitted = updates.every((update) =>{
        return allowed.includes(update)
    })

    if(!isPermitted)
    return res.status(400).send({error:'Invalid updates'})

    try{
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    }catch(error){
        res.status(400).send()
    }
})

router.delete('/users/me',auth,async (req,res) =>{

    try{
        await req.user.remove()
        res.send(req.user)
    }catch(error){
        res.status(500).send()
    }
})

router.get('/users/getAll',async (req,res) =>{
    try{
        const users = await User.find({})
        if(!users){
            res.status(404).send()
        }
        users.sort((a,b) =>{
            return a.upvotes.length < b.upvotes.length ?1 : -1
        })
        res.send(users)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.delete('/users/me/avatar',auth,async (req,res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id',authDup,async (req,res) =>{
    try{
        const user = req.user
        
        const newUser = await User.findById(req.params.id)

        if(!user || !newUser){
            throw new Error()
        }
          
        const isUpvoted = newUser.upvotes.find((upvote)  =>{
              return upvote.upvote.toString() == req.user._id.toString() 
          })

          if(isUpvoted)
          res.send({newUser,isUpvoted:true})

          else
          res.send({newUser,isUpvoted:false})

      }catch(error){
          res.status(404).send()
      }
})

router.get('/users/:id/avatar',async (req,res) =>{
    try{
      const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.send({"avatar" :user.avatar})
    }catch(error){
        res.status(400).send()
    }
})


module.exports = router