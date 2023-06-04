const mongoose = require('mongoose');
const election = mongoose.Schema({
    votingId: {type: Number, unique: true},
    electionId: { type: Number },
    description: { type: String, max: 20 },
    stage: { type: Number },
    candidates: {type: Array}
});

module.exports = mongoose.model('Election', election);