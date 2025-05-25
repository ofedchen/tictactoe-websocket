const socket = io();

const formUser = document.querySelector('#formUser');
const inputUser = document.querySelector('#inputUser');
const userContainer = document.querySelector('#userContainer');

const formGame = document.querySelector('#formGame');
const inputGameName = document.querySelector('#gameName');

const formMessage = document.querySelector('#formMessage');
const inputMessage = document.querySelector('#inputMessage');
const messages = document.querySelector("#messages");

const playersDiv = document.querySelector("#players");
const playerList = document.querySelector("#playerList");

const board = document.getElementById("board");
const gameMessage = document.getElementById("gameMessage");
const resetButton = document.querySelector("#reset");

let myUser;
let gameName;
let players = [];
let currentPlayer;
let cells = Array(9).fill(null);
let gameActive = true;
let gameIndex;
let counter = 0;
let gameCreated = false;


function createBoard() {
    board.innerHTML = "";
    cells.forEach((_, i) => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.index = i;
        cell.style.backgroundColor = "";  // reset background
        cell.addEventListener("click", handleCellClick);
        board.appendChild(cell);
    });

    currentPlayer = players[0];
    console.log(currentPlayer);
    gameMessage.textContent = `Nu är det ${currentPlayer.name}s tur`;
    resetButton.style.display = 'block';

    if (myUser === players[0].name && !gameCreated){
        socket.emit('match', { gameName: gameName, player1: players[0].name, player2: players[1].name })
        gameCreated = true;
    }
}


function handleCellClick(e) {
    if (myUser !== currentPlayer.name) return;
    const index = e.target.dataset.index;
    socket.emit('move', index);
}

function updateBoard(index) {
    if (!gameActive || cells[index]) return;

    cells[index] = currentPlayer.symbol;
    document.querySelector(`[data-index = "${index}"]`).textContent = currentPlayer.symbol;

    const winPattern = checkWin();
    if (winPattern) {
        gameMessage.textContent = `Spelare ${currentPlayer.name} har vunnit!`;
        gameActive = false;

        if (myUser === currentPlayer.name)
            socket.emit('matchUpdate', { gameName: gameName, name: myUser });

        // Highlight winning cells
        winPattern.forEach(i => {
            const cell = board.children[i];
            cell.style.backgroundColor = "#a0e7a0";
        });
        return;
    }

    if (cells.every(cell => cell !== null)) {
        gameMessage.textContent = "Ingen vann";
        gameActive = false;
        if (myUser === players[0].name)
            socket.emit('matchEnd', gameName);
        return;
    }

    currentPlayer = currentPlayer.symbol === "X" ? players[1] : players[0];
    gameMessage.textContent = `Nu är det ${currentPlayer.name}s tur`;
}


function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
        [0, 4, 8], [2, 4, 6]           // diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return pattern;  // Return the winning combination
        }
    }

    return null; // No win
}

formUser.addEventListener("submit", (e) => {
    e.preventDefault();
    myUser = inputUser.value;
    console.log(myUser);
    userContainer.innerHTML = '<h2>Välkommen ' + myUser + '</h2>';
    document.getElementById('formUser').style.display = 'none';
    playersDiv.style.display = 'block';
    document.getElementById('message').style.display = 'block';
    socket.emit('player', myUser);
})

formGame.addEventListener("submit", (e) => {
    e.preventDefault();
    gameName = inputGameName.value;
    console.log(gameName);
    formGame.style.display = "none";

    socket.emit('gameCreated', gameName);
})

resetButton.addEventListener("click", () => {
    socket.emit('boardReset');
});

formMessage.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log()
    if (inputMessage.value) {
        socket.emit('chatMessage', { user: myUser, message: inputMessage.value });
        inputMessage.value = '';
    }
});


socket.on('newChatMessage', function (msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
});

socket.on('newPlayer', function (player) {
    const gameSymbol = players.length ? 'O' : 'X';
    players.push({ name: player, symbol: gameSymbol });
    console.log(players);
    // let index = players.length;
    let item = document.createElement('li');
    item.textContent = 'Spelare ' + gameSymbol + ': ' + player;
    playerList.appendChild(item);
    playersDiv.style.display = 'block';

    if (players.length === 2)
        // createBoard();
        formGame.style.display = "block";

});

socket.on('newGameCreated', gameName => {
    counter += 1;
    console.log(counter)
    inputGameName.value = gameName;
    document.getElementById('newGameName').textContent = gameName;

    if (counter === 2) {
        createBoard();
    }
})

socket.on('newMove', (index) => {
    updateBoard(index);
});

socket.on('resetBoard', () => {
    cells = Array(9).fill(null);
    gameActive = true;
    gameMessage.textContent = `Nu är det ${currentPlayer.name}s tur`;
    createBoard();
});
