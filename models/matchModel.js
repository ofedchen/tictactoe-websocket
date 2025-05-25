const mongoose = require('mongoose');

const MatchModel = new mongoose.Schema({
    gameName: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        name: String,
        wins: Number
    },
    player2: {
        name: String,
        wins: Number
    },
    numberOfGames: Number
});

module.exports = mongoose.model('match', MatchModel);