const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    regno : {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    pwd: {
        type: String,
        required: true
    },
    phoneno: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    newpwd: {
        type: String,
        required: false
    },
    confpwd: {
        type: String,
        required: false
    },
    delpwd: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Login',loginSchema)

