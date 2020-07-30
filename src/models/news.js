const mongoose = require('mongoose')
const validator = require('validator')

const newsSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
        trim:true
    },
    body:{
        type: String,
        required: true,
        trim:true
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


const News = mongoose.model('News',newsSchema)

module.exports = News