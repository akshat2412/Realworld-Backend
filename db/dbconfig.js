const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { user, password } = require('./models')
const { secret } = require('../secret')

const db = new sequelize({
    dialect: 'sqlite',
    storage: __dirname + 'realworld.db'
})

const User = db.define('user', user);
const Password = db.define('password', password)

User.prototype.generateJWT = function() {
    var today = new Date();    
    return jwt.sign({
        id: this.id,
        date: today,
        username: this.username,
        email: this.email
    }, secret.privateKey)
}

User.prototype.authorizedUser = function () {  
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    }
}

User.prototype.createHash = async function(password) {
    var hash = await bcrypt.hash(password, 10)
    return hash
}

User.hasOne(Password)

module.exports = {
    db, 
    User,
    Password
}