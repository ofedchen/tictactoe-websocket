const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

// mongoose
const MessageModel = require("./models/messageModel");
const GameModel = require("./models/gameModel");

const connectionMongoDB = require('./connectionMongoDB');
connectionMongoDB();

app.use(express.static('public'));

//get from mongodb
app.get("/messages", async (req, res) => {
    try {
        const allMessages = await MessageModel.find();
        return res.status(200).json(allMessages);
    }
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});


io.on('connection', (socket) => {
    console.log(`A client with id ${socket.id} connected to the chat!`);

    socket.on('chatMessage', msg => {
        console.log('Meddelanden: ' + msg.message);
        io.emit('newChatMessage', msg.user + ': ' + msg.message);
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date + ' ' + time;
        let user = msg.user;
        let message = msg.message;

        // Sparar till MongoDB med Mongoose
        const newMessage = new MessageModel({ message: message, user: user, date: dateTime });
        newMessage.save();
    });

    socket.on('game', game => {
        console.log(game)
        const newGame = new GameModel({players: game.players, winner: game.winner});
        const currentGame = newGame.save();
        // console.log(currentGame._id.toString());
    })

    socket.on('player', player => {
        console.log('got new player');
        io.emit('newPlayer', player);
    });

    socket.on('move', index => {
        console.log('cell ', index);
        io.emit('newMove', index);
    });

    socket.on('boardReset', () => {
        io.emit('resetBoard');
    });
});

server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});