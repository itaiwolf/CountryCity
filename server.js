const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'static')));

// Store lobby data
let lobbies = {};

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // When a player joins a lobby
    socket.on('joinLobby', ({ lobbyType, playerName, gameCode }) => {
        const lobbyId = gameCode ? gameCode : lobbyType === 'friends' ? 'friendsLobby' : 'anyoneLobby';

        // If the lobby doesn't exist, create it and assign the player as the host
        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = { players: [], host: socket.id };
        }

        // Add player to the lobby with their name and socket ID
        lobbies[lobbyId].players.push({ id: socket.id, name: playerName });
        socket.join(lobbyId);  // Make the player join the specific lobby room

        // Notify the new player if they are the host
        if (socket.id === lobbies[lobbyId].host) {
            socket.emit('isHost', true);  // Only the host receives true
        } else {
            socket.emit('isHost', false);  // Non-host players receive false
        }

        // Emit the updated player list to everyone in the lobby
        const playerNames = lobbies[lobbyId].players.map(player => player.name);  // Extract names to display
        io.to(lobbyId).emit('updatePlayerList', playerNames);  // Send only the names
        io.to(lobbyId).emit('updatePlayerCount', lobbies[lobbyId].players.length);

        console.log(`${playerName} (${socket.id}) joined ${lobbyId}, player count: ${lobbies[lobbyId].players.length}`);
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        removePlayer(socket.id);  // Remove the player and update the lobby
    });

    // Host starts the game (initiates countdown)
    socket.on('startGame', () => {
        const lobbyId = getLobbyBySocket(socket.id);
        if (lobbyId && lobbies[lobbyId].host === socket.id) {
            console.log(`Host ${socket.id} started the game in ${lobbyId}`);
            io.to(lobbyId).emit('startCountdown', 5);  // Broadcast a 5-second countdown to all players in the lobby
        }
    });

    // Host cancels the game initiation
    socket.on('cancelGame', () => {
        const lobbyId = getLobbyBySocket(socket.id);
        if (lobbyId && lobbies[lobbyId].host === socket.id) {
            console.log(`Host ${socket.id} canceled the game initiation in ${lobbyId}`);
            io.to(lobbyId).emit('cancelCountdown');  // Broadcast to cancel the countdown
        }
    });

    // When countdown ends, start the game for all players
    socket.on('endCountdown', () => {
        const lobbyId = getLobbyBySocket(socket.id);
        io.to(lobbyId).emit('redirectToGame');  // Redirect all players to the game page
    });
});

// Helper function to remove a player from the lobby when they disconnect
function removePlayer(socketId) {
    const lobbyId = getLobbyBySocket(socketId);
    if (lobbyId) {
        // Remove the player from the lobby's player list
        lobbies[lobbyId].players = lobbies[lobbyId].players.filter(player => player.id !== socketId);

        // If the host leaves, assign a new host
        if (lobbies[lobbyId].host === socketId && lobbies[lobbyId].players.length > 0) {
            lobbies[lobbyId].host = lobbies[lobbyId].players[0].id;  // Assign the next player's socket ID as host
            io.to(lobbies[lobbyId].host).emit('isHost', true);  // Notify the new host
            console.log(`New host for ${lobbyId}: ${lobbies[lobbyId].host}`);
        }

        // If no players are left, delete the lobby
        if (lobbies[lobbyId].players.length === 0) {
            console.log(`Lobby ${lobbyId} is now empty. Deleting lobby.`);
            delete lobbies[lobbyId];
        } else {
            // Update player count and player list for remaining players
            const playerNames = lobbies[lobbyId].players.map(player => player.name);  // Extract names to display
            io.to(lobbyId).emit('updatePlayerCount', lobbies[lobbyId].players.length);
            io.to(lobbyId).emit('updatePlayerList', playerNames);  // Send updated list of names
            console.log(`Updated player count in ${lobbyId}: ${lobbies[lobbyId].players.length}`);
        }
    }
}

// Helper function to get the lobby by a player's socket ID
function getLobbyBySocket(socketId) {
    return Object.keys(lobbies).find(lobbyId => lobbies[lobbyId].players.some(player => player.id === socketId));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
