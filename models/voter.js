const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const voterSchema = new mongoose.Schema({
    username: {type: String, trim: true},
    password: String,
    boothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth'
    },
    boothName: String,
    booth: Boolean,
    judge: Boolean,
    admin: Boolean,
    registrar: Boolean
});

voterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Voter", voterSchema);