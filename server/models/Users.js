const mongoose = require('mongoose');
const user = mongoose.Schema({
    email: {type: String, unique: true},
    password: { type: String },
    role: {type: String}
});

module.exports = mongoose.model('User', user);