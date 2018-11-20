const express = require('express')

const { db, User } = require('./db/dbconfig')
const userRouter = require('./routes/api/user')
const profileRouter = require('./routes/api/profile')
const articleRouter = require('./routes/api/articles')

const server = express()

// Set Request Parsers
server.use(express.json())
server.use(express.urlencoded({extended: true}))

// Set Routes
server.use('/api/users', userRouter)
server.use('/api/profile', profileRouter)
server.use('/api/articles', articleRouter)


//Default Error Handler
server.use(function(err, req, res, next) {
    res.status(403);
    res.json({'errors': {
      message: err,
    }});
});

db.sync()
    .then(() => {
        console.log('Database Synced')
        server.listen(2000, () => {
            console.log('Server started at http://localhost:2000')
        })
    })
    .catch(err => console.log(error))