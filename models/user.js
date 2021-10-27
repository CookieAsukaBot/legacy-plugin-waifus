const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const schema = new Schema({
    userID: {
        type: String,
        required: true
    },
    guild: {
        type: String,
        required: true
    },
    // waifu: {
    // },
    rolls: {
        type: Number,
        default: 10
    },
    usedRolls: {
        type: Number,
        default: 0
    },
    canClaim: {
        type: Boolean,
        default: true
    },
    // Custom
    // customColor: {
    //     type: String
    // },
}, {
    timestamps: true
});

module.exports = model('waifus_user', schema);
