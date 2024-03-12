// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    // isAgent: {
    //     type: Boolean,
    //     default: false // Default is not an agent
    // },
    // agents: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
