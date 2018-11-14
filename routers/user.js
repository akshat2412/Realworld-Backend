const { Router } = require('express')
const { User, Password } = require('../db/dbconfig')

const route = Router()

route.get('/', async (req, res) => {
    try {
        const user = User.findAll()
        res.status(200).json(user)
    }
    catch (e) {
        console.error(e)
        res.status(500).json({
            message: 'Error accessing database'
        })
    }
})


// Create and save new user, return created user on success, call error handler on error
route.post('/', async (req, res, next) => {
    //Invalid format of the request
    if(!req.body.user){
        return next('Invalid Format')
    }


    await User.create({
        username: req.body.user.username,
        email: req.body.user.email,
    })
    .then(function(createdUser) {
        console.log(createdUser)
        createdUser.createHash(req.body.user.password)
            .then( generatedhash => {
                Password.create({
                    hash: generatedhash,
                    userId: createdUser.id
                })
            })
            .then(function() {
                res.status(201).json({
                    user: createdUser.authorizedUser()
                })
            })
    }).catch(function(e) {
        next(e.errors[0].message)
    }) 


})

module.exports = route