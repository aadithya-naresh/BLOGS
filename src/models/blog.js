const mongoose = require('mongoose')
const validator = require('validator')

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    body:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref :'User'
    },
    images:[{
        type : String
    }]
},{
    timestamps:true
})

const Blog = mongoose.model('Blog',blogSchema)



module.exports = Blog