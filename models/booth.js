const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
    boothName: {type: String, unique: true, trim: true},
    information: String,
    subInformation: String,
    image: String,
    color: String,
    code: String,
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voter'
    },
    vote: [
        {
            voteId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vote'
            },
            awardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Award'
            },
            voterId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Voter'
            },
            voteCount: Number,
            judgeVote: Boolean
        }
    ],
});

module.exports = mongoose.model('Booth', boothSchema);