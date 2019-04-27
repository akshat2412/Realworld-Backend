const db = require('../dbconfig');
const { comment } = require('../schema');

const Comment = db.define('comment', comment);

Comment.prototype.commentToJson = async function (user, loggedUser = false) {
    // console.log('building comment json')
    return {
        id: this.id,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: await user.userToProfileJSON(loggedUser)
      }
}

module.exports = Comment;