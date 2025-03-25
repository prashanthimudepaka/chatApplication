const { Schema, model } = require('mongoose')

const signUpSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    lastlogin: {
        type: Date,
        default: null
    },

})
const signUp = model("users", signUpSchema)
module.exports = signUp;