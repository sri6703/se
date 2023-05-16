const mongoose = require('mongoose');

const adminLoginSchema = new mongoose.Schema({
    name: {
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
    }
});

module.exports = mongoose.model('AdminLogin', adminLoginSchema);
