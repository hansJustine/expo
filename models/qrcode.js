const mongoose = require('mongoose');

const qrcodeSchema = new mongoose.Schema({
    code: {type: String, unique: true},
    firstName: String,
    surname: String,
    middleInitial: String,
    email: {type: String, unique: true, trim: true, lowercase: true},
    contactNumber: Number,
    relationshipToTheStudent: String,
    isUsed: Boolean,
});

module.exports = mongoose.model('Qrcode', qrcodeSchema);