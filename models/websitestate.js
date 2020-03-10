const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    state: Boolean
});

module.exports = mongoose.model('State', stateSchema);