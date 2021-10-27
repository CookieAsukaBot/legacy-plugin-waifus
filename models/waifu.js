const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const schema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    waifu: {
        domain: {
            type: String
        },
        id: {
            type: String
        },
        url: {
            type: String
        }
    },
    type: {
        type: String,
        default: 'ART', // ART, WAIFU
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    guild: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = model('waifus_claimed', schema);
