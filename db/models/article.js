const db = require('../dbconfig');
const { Article } = require('../dbbuilder');

Article.prototype.articleToJSON = async function (tagList, user, loggedUser = false) {
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        tagList: typeof(tagList) == Array ? tagList : tagList.map(tag => tag.name),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        // favorited: false,
        // favoritesCount: 0,
        author: await user.userToProfileJSON(loggedUser)
      }
}

module.exports = Article;