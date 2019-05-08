const db = require('./dbconfig');
const {  user, password, follow, tags, article, comment } = require('./schema')


// Create seperate files for models if additional functionality needs to be added.
const User = db.define('user', user);
const Password = db.define('password', password);
const Follow = db.define('follows', follow);
const Article = db.define('article', article);
const Tag = db.define('tag', tags);
const Comment = db.define('comment', comment);

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
    Comment,
    Follow
}