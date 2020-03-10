const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    awardName: String,
    awardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Award'
    },
    boothName: String,
    boothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth'
    },
    totalScore: Number,
    judgeVote: Boolean
});

module.exports = mongoose.model('Result', resultSchema);