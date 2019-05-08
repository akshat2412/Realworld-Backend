# Realworld API Clone

This is a clone [Realworld API](https://github.com/gothinkster/realworld/tree/master/api) made in NodeJS.


### Authentication header
> Authorization: Token jwt.token.here

## JSON objects returned by the API
#### Users (for authentication)
```
{
  "user": {
    "email": "jake@jake.jake",
    "token": "jwt.token.here",
    "username": "jake",
    "bio": "I work at statefarm",
    "image": null
  }
}
```

#### Profile
```
{
  "profile": {
    "username": "jake",
    "bio": "I work at statefarm",
    "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
    "following": false
  }
}
```

## Endpoints
#### Authentication:
> POST /api/users/login

Example Request Body:
```
{
  "user":{
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```
No authentication required, returns a User

Required fields: **email**, **password**


#### Registration:
> POST /api/users

Example request body:
```
{
  "user":{
    "username": "Jacob",
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```
No authentication required, returns a User

Required fields:  **email**, **username**, **password**

#### Get Current User
> GET /api/user

Authentication required, returns a User that's the current user

#### Update User
> PUT /api/user

Example request body:
```
{
  "user":{
    "email": "jake@jake.jake",
    "bio": "I like to skateboard",
    "image": "https://i.stack.imgur.com/xHWG8.jpg"
  }
}
```
Authentication required, returns the User

Accepted fields: **email**, **username**, **password**, **image**, **bio**

#### Get Profile
> GET /api/profiles/:username

Authentication optional, returns a Profile

#### Follow user
> POST /api/profiles/:username/follow

Authentication required, returns a Profile

No additional parameters required

#### Unfollow user
> DELETE /api/profiles/:username/follow

Authentication required, returns a Profile

No additional parameters required

