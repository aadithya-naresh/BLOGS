const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Blog = require('../models/blog')
const Like = require('../models/like')
const authDup = require('../middleware/authDup')
const News = require('../models/news')
const callFunction = require('../scraping/scraping2')

router.get('/news',async (req,res) =>{
    try{
        const news = await News.find({}).sort({
            createdAt:-1
        })

    
        if(!news)
        res.status(404).send()

        res.status(200).send({news})

        if(news.length==0 || ((+ new Date())-news[0].createdAt)/(1000*60*60) >= 24){
        if(news.length ==0)
        callFunction(false)
        
        else
        callFunction(true)
    }
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})
module.exports = router
