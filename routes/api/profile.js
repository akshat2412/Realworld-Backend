const { Router } = require('express')

const { User} = require('../../db/dbconfig')
const { authorizeRequest, authorizeRequestOptional } = require('../auth')

const router = Router()

// Preload the profile required in req.requestedProfile
router.param('username', function(req, res, next, username) {
    User.findByPk(username).then(user => {
        if(!user){
            return res.sendStatus(404)
        }
        req.requestedProfile = user
        next()
        return
    })
})

// GET: profile of :username
router.get('/:username', authorizeRequestOptional, function(req, res, next){
    if(req.payload){
        User.findByPk(req.payload.username).then(loggedUser => {
            if(!loggedUser) {return res.sendStatus(403)}
            req.requestedProfile.userToProfileJSON(loggedUser).then(profile => {
                return res.json({profile})
            })
        })
    } else {
        return req.requestedProfile.userToProfileJSON().then(profile => {
            return res.json({profile})
        })
    }
})

// POST: make current user follow :username
router.post('/:username/follow', authorizeRequest, async function(req, res, next){
    User.findByPk(req.payload.username).then(loggedUser => {
        if(!loggedUser) {return res.sendStatus(403)}
        else{
            loggedUser.follow(req.requestedProfile).then(() => {
                req.requestedProfile.userToProfileJSON(loggedUser).then(profile => {
                    return res.json({profile})
                })
            })
        }
    })
})

// DELETE: make current user unfollow :username
router.delete('/:username/follow', authorizeRequest, async function(req, res, next){
    User.findByPk(req.payload.username).then(loggedUser => {
        if(!loggedUser) {return res.sendStatus(403)}
        else{
            loggedUser.unFollow(req.requestedProfile).then(() => {
                req.requestedProfile.userToProfileJSON(loggedUser).then(profile => {
                    return res.json({profile})
                })
            })
        }
    })
})

    
module.exports = router