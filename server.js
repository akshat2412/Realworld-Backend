const express = require('express')

const { db, User } = require('./db/dbconfig')
const userRouter = require('./routes/user')

const server = express()

// Set Request Parsers
server.use(express.json())
server.use(express.urlencoded({extended: true}))

// Set Routes
server.use('/users', userRouter)


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