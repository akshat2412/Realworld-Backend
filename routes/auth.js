var jwt = require('jsonwebtoken');

const { secret } = require('../secret')

function getTokenFromHeaders(req) {
    if(req.headers && req.headers.authorization) {
        if(req.headers.authorization.split(' ')[0] === 'Token'){
            return req.headers.authorization.split(' ')[1]
        }
    }
    return null
}

function authorizeRequest(req, res, next) {
    var token = getTokenFromHeaders(req)
    console.log(token)
    var decodedToken = jwt.verify(token, secret.privateKey)
    req.payload = decodedToken
    next()
}

function authorizeRequestOptional(req, res, next) {
    var token = getTokenFromHeaders(req)
    if(!token){
        next()
        return
    }
    var decodedToken = jwt.verify(token, secret.privateKey)
    req.payload = decodedToken
    next()
}


module.exports = { authorizeRequest, authorizeRequestOptional }