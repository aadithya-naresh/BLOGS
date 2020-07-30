const mongoose = require('mongoose')
const validator = require('validator')

const latslngSchema = new mongoose.Schema({
    latitude:{
        type: Number,
        required:true,
        trim:true
    },
    longitude:{
        type: Number,
        required: true
    },
    registeredBy:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
},{
    timestamps:true
})

latslngSchema.statics.findDuplicates = async (lat,lng) =>{
    const exists = await Latslng.findOne({latitude:lat,longitude:lng})

    return exists
}
const Latslng = mongoose.model('Latslng',latslngSchema)

module.exports = Latslng