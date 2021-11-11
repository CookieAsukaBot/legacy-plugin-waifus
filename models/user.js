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
    customization: {
        // waifu: {
        //     type: populate
        // },
        // art: {
        //     type: populate
        // },
        haremColor: {
            type: String,
            default: '#fb94ff'
        },
        haremTitle: {
            type: String,
            default: 'Mi harem'
        },
        // rate: {
        //     type: Number // preffer arts over characters
        // },
    },
    rolls: {
        type: Number,
        default: 10
    },
    // extraRolls: {
    //     type: Number,
    //     default: 0
    // },
    usedRolls: {
        type: Number,
        default: 0
    },
    canClaim: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = model('waifus_user', schema);
