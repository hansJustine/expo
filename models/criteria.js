const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
    criteriaName: {type: String, trim: true},
    decimalPercentage: Number,
    awardName: String,
    awardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Award'
    }
});

module.exports = mongoose.model('Criteria', criteriaSchema);