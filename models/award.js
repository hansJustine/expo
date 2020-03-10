const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
    awardName: {type: String, unique: true, trim: true},
    forBooth: Boolean,
    forJudge: Boolean,
    booth:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booth'
        }
    ],
    voter:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voter'
        }
    ],
    criteria:[
        {
            criteriaId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Criteria'
            },
            criteriaName: String,
            decimalPercentage: Number,
        }
    ]
});

module.exports = mongoose.model('Award', awardSchema);