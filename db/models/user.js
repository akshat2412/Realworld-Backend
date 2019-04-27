const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const db = require('../dbconfig');
const { secret } = require('../../secret');
const { user } = require('../schema');

const User = db.define('user', user);

// Generate JWT based on id, date, username and email, and private key
User.prototype.generateJWT = function() {
    var today = new Date();    
    return jwt.sign({
        id: this.id,
        date: today,
        username: this.username,
        email: this.email
    }, secret.privateKey)
}

// Create user json object to be sent to the client
User.prototype.userToJSON = function () {  
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    }
}

// Create profile json object to be sent to the client
User.prototype.userToProfileJSON = async function (loggedUser = false) {
    var following = loggedUser? await loggedUser.isFollowing(this.username) : false
    // console.log('building profile')
    return {
        username: this.username,
        bio: this.bio,
        image: this.image,
        following
      }
}

// Check if calling user follows passed user
User.prototype.isFollowing = async function (followedUsername) {
    var following = await this.getUsersFollowed({where: {followedUsername}})
    if(following.length !== 0){
        return true
    }
    return false
}

// Create hash
User.prototype.createHash = async function(password) {
    var hash = await bcrypt.hash(password, 10)
    return hash
}

// Validate Password
User.prototype.validatePassword = async function(textPassword) {
    var password = await this.getPassword()
    const result = await bcrypt.compare(textPassword, password.hash)
    return result
}

User.prototype.follow = async function(user) {
    var followedUserInstance = await Follow.findOne({where: {
        followedUsername: user.username,
        username: this.username
    }})
    if(followedUserInstance) {
        return
    }
    else {
        await Follow.create({
            followedUsername: user.username
        }).then(createdFollowedUser => {
            this.addUsersFollowed(createdFollowedUser)
        })
    }
    return
}

User.prototype.unFollow = async function(user) {
    var followedUserInstance = await Follow.findOne({where: {
        followedUsername: user.username,
        username: this.username
    }})
    if(!followedUserInstance) {
        return
    }
    else {
        followedUserInstance.destroy()
    }
    return
}

module.exports = User;