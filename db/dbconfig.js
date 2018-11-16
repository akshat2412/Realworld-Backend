const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { user, password, follow } = require('./models')
const { secret } = require('../secret')

const db = new sequelize({
    dialect: 'sqlite',
    storage: __dirname + 'realworld.db'
})

// Define tables 
const User = db.define('user', user);
const Password = db.define('password', password)
const Follow = db.define('follows', follow)

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

// Create user object to be sent
User.prototype.authorizedUser = function () {  
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    }
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

// Create Associations
User.hasOne(Password, {foreignKey: 'username', as: 'Password'})
User.hasMany(Follow, {as: 'UsersFollowed'})

module.exports = {
    db, 
    User,
    Password
}