const sequelize = require('sequelize')
const DT = sequelize.DataTypes

var user = {
    email: {
        type: DT.STRING,
        validate: {
            isEmail: true
        },
        allowNull: false,
        unique: true
    },
    username: {
        type: DT.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    bio: {
        type: DT.STRING,
        allowNull: true,
        defaultValue: null
    },
    image: {
        type: DT.STRING,
        allowNull: false,
        defaultValue: 'https://static.productionready.io/images/smiley-cyrus.jpg',
        validate: {
            isUrl: true
        }
    }
}

var password = {
    hash: {
        type: DT.STRING,
        allowNull: false,
    }
}

var follow = {
    followedUsername: {
        type: DT.STRING,
        allowNull: false,
    }
}

var article = {
    slug: {
        type: DT.STRING, 
        unique: true, 
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DT.STRING
    },
    description: {
        type: DT.STRING
    },
    body: {
        type: DT.STRING
    },
    favoritesCount: {
        type: DT.INTEGER,
        default: 0
    },
}

var tags = {
    name: {
        type: DT.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
    }
}

var comment = {
    body: {
        type: DT.STRING
    }
}

module.exports = {
    user,
    password,
    follow,
    article,
    tags,
    comment
};