const mongoose = require('mongoose');

const GameModel = new mongoose.Schema({
    players: {
        type: Array,
        required: true
    },
    winner: {
        type: String
    }
});

module.exports = mongoose.model('game', GameModel);