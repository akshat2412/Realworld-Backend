const sequelize = require('sequelize')

const db = new sequelize({
    dialect: 'sqlite',
    storage: __dirname + 'realworld.db'
})

module.exports = db;



