const { Router } = require('express')
const slug = require('slug')
const sequelize = require('sequelize')
const Op = sequelize.Op

const { Article, User, Tag, Comment } = require('../../db/dbconfig')
const { authorizeRequest, authorizeRequestOptional } = require('../auth')

const router = Router()

// POST: article
router.post('/', authorizeRequest, function(req, res, next) {
    console.log(req.body)
    //Invalid format of the request
    if(!req.body.article){ 
        console.log('article')
        return res.status(422).json({errors: {format: 'Invalid Format'} })
    }
    if(!req.body.article.title){ 
        return res.status(422).json({errors: {title: `can't be blank`} })
    }
    if(!req.body.article.description){ 
        return res.status(422).json({errors: {description: `can't be blank`} })
    }
    if(!req.body.article.body){ 
        return res.status(422).json({errors: {body: `can't be blank`} })
    }

    User.findByPk(req.payload.username).then( async function(user){
        if (!user) { 
            console.log('no user')
            return res.sendStatus(401); }
        var articleSlug = slug(req.body.article.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
        await Article.create({
            slug: articleSlug,
            title: req.body.article.title,
            body: req.body.article.body,
            description: req.body.article.description
        }).then(async article => {
            await user.addArticles(article);  
            if(req.body.article.tagList) {
                var tags = req.body.article.tagList
                for(const tagName of tags) {
                    await Tag.findOrCreate({
                        where: {
                            name: tagName
                        }
                    }).then(tagInstance => {
                        article.addTag(tagInstance[0].dataValues.name)
                    })
                }
                var articleJson = await article.articleToJSON(req.body.article.tagList, user)
                return res.status(201).json({
                    article: articleJson
                })
            }
            
        }).catch(e => {
        console.log(e)
        })
    })
})

// GET: articles
router.get('/', authorizeRequestOptional, function(req, res, next) {
    var query = {}
    var limit = 20
    var offset = 0
  
    if(typeof req.query.limit !== 'undefined'){
      limit = req.query.limit
    }
  
    if(typeof req.query.offset !== 'undefined'){
      offset = req.query.offset
    }
  
    if( typeof req.query.tag !== 'undefined' ){
      query.tagList = [req.query.tag]
    }
    Promise.all([
      req.query.author ? User.findByPk(req.query.author) : null
    ]).then(function(userArray){
      var author = userArray ? userArray[0] : userArray
      if(author){
        return  author.getArticles({limit, offset, include: [{model: Tag, attributes: ['name']}]})  
        .then(function(results){
            Promise.all(results.map(obj => obj.articleToJSON(obj.tags, author))).then(articlesArray => {
                return res.status(200).json({
                    articles: articlesArray,
                    articlesCount: articlesArray.length
                })
            })
        }).catch(next);
    }
    else {
        return Article
    }})
})

// GET: article
router.get('/:article', authorizeRequestOptional, function(req, res, next) {
    Promise.all([
      req.payload ? User.findByPk(req.payload.username) : null,
      Article.findByPk(req.params['article'], {include: [{model: Tag, attributes: ['name']}]})
    ]).then(async function(results){
        if(!results[1]){
            return res.sendStatus(404)
        }
        if(results[0]){
            User.findByPk(results[1].username).then(async author => {
                return res.json({
                    article: await results[1].articleToJSON(results[1].tags, author, results[0])
                })
            })
        }
        else{
            User.findByPk(results[1].username).then(async author => {
                return res.json({
                    article: await results[1].articleToJSON(results[1].tags, author)
                })
            })
        }
    }).catch(next);
  });


// DELETE: article
router.delete('/:article', authorizeRequest, function(req, res, next) {
    User.findById(req.payload.username).then(function(user){
        if (!user) { return res.sendStatus(401) }
        Article.findByPk(req.params['article']).then(article => {
            if(!article) { return res.sendStatus(404)}
            if(article.username !== req.payload.username) { return res.sendStatus(403)}
            Article.destroy({where: {slug: req.params['article']}}).then(rowsDestroyed => {
                return res.sendStatus(204)
            })
        })
    })   
  });

// router.get('/feed', authorizeRequest, function(req, res, next) {
//     var limit = 20;
//     var offset = 0;
  
//     if(typeof req.query.limit !== 'undefined'){
//       limit = req.query.limit;
//     }
  
//     if(typeof req.query.offset !== 'undefined'){
//       offset = req.query.offset;
//     }
  
//     User.findByPk(req.payload.username).then(function(user){
//       if (!user) { return res.sendStatus(401); }
  
//       Promise.all([
//         user.getUsersFollowed({include: [{model: Articles}]})
//       ]).then(function(results){
//         console.log(results)
  
//         return res.json({
//           articles: articles.map(function(article){
//             return article.toJSONFor(user);
//           }),
//           articlesCount: articlesCount
//         });
//       }).catch(next);
//     });
//   });

// GET: article comments
router.get('/:article/comments', authorizeRequestOptional, function(req, res, next){
    Promise.resolve(req.payload ? User.findByPk(req.payload.username) : null).then(function(loggedUser){
      return Article.findByPk(req.params['article']).then(article => {
        if(!article){return res.sendStatus(403)}
        article.getComments().then(comments => {
            if(loggedUser){

                Promise.all(comments.map(async comment => {
                    var user = await User.findByPk(comment.dataValues.username)
                    return await comment.commentToJson(user, loggedUser)
                })).then(commentsJson => {
                    return res.json({
                        comments: commentsJson
                    })
                })
            }
            else{
                Promise.all(comments.map(async comment => {
                    var user = await User.findByPk(comment.dataValues.username)
                    return await comment.commentToJson(user)
                })).then(commentsJson => {
                    return res.json({
                        comments: commentsJson
                    })
                })
            }
        })
      })
    }).catch(next);
  });

// POST: new Comment
router.post('/:article/comments', authorizeRequest, function(req, res, next) {
    User.findByPk(req.payload.username).then(async user => {
        if(!user){ return res.sendStatus(401); }
        if(!req.body.comment){ 
            return res.status(422).json({errors: {format: 'Invalid Format'} })
        }
        if(!req.body.comment.body){ 
            return res.status(422).json({errors: {body: `can't be blank`} })
        }
        console.log(req.params['article'])
        Article.findByPk(req.params['article']).then(async article => {
            if(!article){return res.sendStatus(403)}
            await Comment.create({
                body: req.body.comment.body
            }).then(async createdComment => {
                await user.addComment(createdComment)
                await article.addComment(createdComment)
                var commentJson = await createdComment.commentToJson(user)
                return res.status(201).json({
                    comment: commentJson
                })
            })
        })
    }).catch(next);
});

// DELETE: comment
router.delete('/:article/comments/:comment', authorizeRequest, function(req, res, next) {
    Comment.findByPk(req.params['comment']).then(comment => {
        if(comment.username !== req.payload.username){
            res.sendStatus(403)
        }
        else(
            Comment.destroy({where: {id: comment.id}}).then((destroyedRows) => {
                res.sendStatus(204)
            })
        )
    })
  });
module.exports = router