const mongoose = require('mongoose');
const candidates = mongoose.Schema({
    candidateAddress : {type: String},
    name: { type: String},
    email: {type: String, unique: true}
});

module.exports = mongoose.model('Candidates', candidates);
