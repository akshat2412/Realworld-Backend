const db = require('./dbconfig');
const User = require('./models/user');
const Article = require('./models/article');
const Comment = require('./models/comment');
const {  password, follow, tags } = require('./schema')

// Create seperate files for below models if additional functionality needs to be added.
const Password = db.define('password', password);
const Follow = db.define('follows', follow);
const Tag = db.define('tag', tags);

// Create Associations
User.hasOne(Password, {foreignKey: 'username', as: 'Password'})
User.hasMany(Follow, {foreignKey: 'username', as: 'UsersFollowed'})
User.hasMany(Article, {foreignKey: 'username', as: 'Articles'})
Tag.belongsToMany(Article, {through: 'articleTag'})
Article.belongsToMany(Tag, {through: 'articletag'})
Article.hasMany(Comment)
User.hasMany(Comment, {foreignKey: 'username'})

module.exports = {
    db, 
    User,
    Password,
    Tag,
    Article,
    Comment
}