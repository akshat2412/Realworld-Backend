const sequelize = require('sequelize')
const DT = sequelize.DataTypes


module.exports = {
    user: {
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
    },

    password: {
            hash: {
                type: DT.STRING,
                allowNull: false,
            }
    },

    follow: {
            username: {
                type: DT.STRING,
                allowNull: false,
            }
    }

};

// async function writeUser() {
//     const user = User.create({
//         email: 'akshat.g2412@gmail.com',
//         username: 'akshat',
//         bio: null,
//         image: 'www.doogle.com'
//     }).catch(err => console.log(err))
// }
// async function init() {
//     await db.authenticate()
//     await db.sync()
//     await writeUser()
// }

// init()