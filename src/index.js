const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const blogRouter = require('./routers/blog')
const likeRouter = require('./routers/like')
const newsRouter = require('./routers/news')
const commentRouter = require('./routers/comment')
const latslngRouter = require('./routers/latslng')
const app = express()
const port = process.env.PORT || 3000

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication");
    next();
});
app.options('*', cors())

app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(blogRouter)
app.use(likeRouter)
app.use(newsRouter)
app.use(commentRouter)
app.use(latslngRouter)

app.listen(port,() => {
    console.log('Server is connected on port '+port)
}) 

module.exports = app