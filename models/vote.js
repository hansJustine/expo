const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    voteCount: Number,
    voter:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voter'
        },
        username: String
    },
    booth:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booth'
        }
    },
    award:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Award'
        }
    },
    judgeVote: Boolean
});

module.exports = mongoose.model('Vote', voteSchema);