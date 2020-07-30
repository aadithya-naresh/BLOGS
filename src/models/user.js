const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(value) {
            if(value < 0)
            {
                throw new Error('Age cannot be negative')
            }
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value))
            throw new Error('Not email')
        }
    },
    password:{
        type:String,
        required:false,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password'))
            throw new Error('Password cannot contain "Password"')
        }
    },
    tokens:[{
        token:{
            type : String,
            required:true
        }
    }],
    avatar:{
        type:String
    },
    Type:{
        type:String
    },
    upvotes:[{
        upvote:{
            type:mongoose.Schema.Types.ObjectId
        }
    }],
    bookmarks:[{
        bookmark:{
            type:mongoose.Schema.Types.ObjectId
        }
    }],
    notifTokens:[{
        notifToken:{
            type:String
        }
    }]
},{
    timestamps:true
})

// userSchema.virtual('blogs',{
//     ref:'Blog',
//     localField:'_id',
//     foreignField:'owner'
// })
userSchema.methods.toJSON = function (){
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.bookmarks
    // delete userObject.upvotes
    userObject.upvotes = userObject.upvotes.length
    delete userObject.notifTokens
    
    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user.id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    user.save()  
    return token
}
userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})

    if(!user)
    throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch)
    throw new Error('Unable to login')

    return user
}
userSchema.statics.findDuplicates = async (email) =>{
    const user = await User.findOne({email})

    if(user)
    throw new Error('Email is Duplicate')
}
userSchema.statics.findEmail = async (email) =>{
    const user = await User.findOne({email})

    if(user)
    return user
}
userSchema.pre('save',async function(next) {
        const user = this

        if(user.isModified('password')){
            user.password = await bcrypt.hash(user.password,8)
        }

        next()
})

// userSchema.pre('remove',async function(next) {
//     const user = this
//     await Task.deleteMany({owner:user._id})
//     next()
// })
const User = mongoose.model('User',userSchema)

module.exports = User