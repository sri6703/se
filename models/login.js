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
        required: true
    }
})

module.exports = mongoose.model('Login',loginSchema)

