const { Router } = require('express')

const User = require('../../db/models/user')
const { Password }  = require('../../db/dbbuilder')
const { authorizeRequest } = require('../auth')

const router = Router()

// GET current user
router.get('/', authorizeRequest, function(req, res, next){
    User.findByPk(req.payload.username).then(user => {
        if(!user){ res.sendStatus(404); }
        
        return res.json({
            user: user.userToJSON()
        })
    }).catch(function(e) {
            next(`authorization failed or user doesn't exists`)
    });
});


// POST Create and save new user, return created user on success, call error handler on error
router.post('/', async (req, res, next) => {

    //Invalid format of the request
    if(!req.body.user){ 
        return res.status(422).json({errors: {format: 'Invalid Format'} })
    }
    if(!req.body.user.username){ 
        return res.status(422).json({errors: {username: `can't be blank`} })
    }
    if(!req.body.user.email){ 
        return res.status(422).json({errors: {email: `can't be blank`} })
    }
    if(!req.body.user.password){ 
        return res.status(422).json({errors: {password: `can't be blank`} })
    }


    await User.create({
        username: req.body.user.username,
        email: req.body.user.email,
    })
    .then(function(createdUser) {
        createdUser.createHash(req.body.user.password)
            .then( generatedHash => {
                Password.create({
                    hash: generatedHash,
                })
                .then( generatedPassword => {
                    createdUser.setPassword(generatedPassword)
                })
            })
            .then(function() {
                res.status(201).json({
                    user: createdUser.userToJSON()
                })
            })
    }).catch(function(e) {
        console.log(e)
        if(e.errors[0].type == 'unique violation'){
            next(e.errors[0].path + ' is already taken')
        }
        if(e.errors[0].type == 'Validation error'){
            next(e.errors[0].path + ' is not valid')
        }
    }) 
})

// PUT update user information
router.put('/', authorizeRequest, (req, res, next) => {
    User.findByPk(req.payload.username).then(user => {
        if(!user){ return res.sendStatus(404); }

        if(req.body.user.bio !== 'undefined'){
            user.bio = req.body.user.bio
        }
        if(req.body.user.image !== 'undefined'){
            user.image = req.body.user.image
        }
        if(req.body.user.email !== 'undefined'){
            user.email = req.body.user.email
        }
        if(req.body.user.username !== 'undefined'){
            user.username = req.body.user.username
        }
        if(req.body.user.password !== 'undefined'){
            user.createHash(req.body.user.password)
            .then( generatedHash => {
                user.getPassword()
                        .then(password => {
                            password.hash = generatedHash
                            password.save()
                        })
            })
        }

        user.save().then(() => {
            return res.json({
                user: user.userToJSON()
            })
        })

    })
})

// POST Login user
router.post('/login', (req, res, next) => {
    if(!req.body.user){
      return res.status(422).json({errors: {format: "Invalid Format"}});
    }

    if(!req.body.user.email){
      return res.status(422).json({errors: {email: "can't be blank"}});
    }
  
    if(!req.body.user.password){
      return res.status(422).json({errors: {password: "can't be blank"}});
    }

    User.findOne({where: {
        email: req.body.user.email
    }}).then(user => {
            user.validatePassword(req.body.user.password)
                .then(result => {
                    if(result){
                        return res.json({
                            user: user.userToJSON()
                        })
                    }
                    else {
                        return res.status(404).json({errors: {login: `invalid credentials`}});
                    }
                })
    }).catch((err) => {
            return res.status(404).json({errors: {login: `invalid credentials`}});
    })

});

module.exports = router