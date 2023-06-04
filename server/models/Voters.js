const mongoose = require('mongoose');
const voters = mongoose.Schema({
    voterEmail : {type: String},
    votingId: { type: Array }
});

module.exports = mongoose.model('Voters', voters);
