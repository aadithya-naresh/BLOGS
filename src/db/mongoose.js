const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
})

//mongodb+srv://taskApp:Aadi0506@cluster0-xknel.mongodb.net/<dbname>?retryWrites=true&w=majority