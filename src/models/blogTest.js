const mongoose = require('mongoose')
const validator = require('validator')

const blogTestSchema = new mongoose.Schema({
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
    images:[{
            type : String,
            required:true
    }]
},{
    timestamps:true
})
const testBlog = mongoose.model('testBlog',blogTestSchema)

module.exports = testBlog