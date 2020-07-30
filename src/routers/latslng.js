const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Blog = require('../models/blog')
const Like = require('../models/like')
const authDup = require('../middleware/authDup')
const Latslng = require('../models/latslng')

router.post('/location',auth,async (req,res) =>{
    const duplicate = await Latslng.findDuplicates(req.body.latitude,req.body.longitude)

    if(duplicate)
    return res.status(400).send()

    const latslng = new Latslng({
        registeredBy:req.user._id,
        latitude:req.body.latitude,
        longitude:req.body.longitude
    })
    try{
        await latslng.save()
        res.send(latslng)
    }catch(error){
        res.status(400).send()
    }
})

router.get('/location',async (req,res) =>{
    try{
        const locations = await Latslng.find({})

        res.status(200).send(locations)
    }catch(error){
        res.status(400).send()
    }
})

router.get('/location/remove/:id',async (req,res) =>{

    const location = await Latslng.findById(req.params.id)

    if(!location)
    return res.status(404).send()

    try{
        await location.remove()

        res.send()
    }catch(error){
        res.status(400).send()
    }
})

module.exports = router
