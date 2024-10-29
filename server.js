const Player = require('./models/player');  
const Lobby = require('./models/lobby');

const express = require('express');
const session = require('express-session');
const socketIoSession = require('express-socket.io-session');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up express-session middleware
const sessionMiddleware = session({
    secret: 'RustykelevTov1351',  // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000, httpOnly: true, path: '/' , sameSite: 'Lax' }
});


app.use(cookieParser());  // Ensure cookies are parsed

// Use session middleware in Express
app.use(sessionMiddleware);

// Middleware to log the session ID for every request
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        // console.log('Session ID:', req.sessionID);  // Logs the session ID for every HTML request
    }  
    next();  // Proceed to the next middleware or route handler
});

app.use(cors({
    origin: '*',  // or specify your client URL if not using "*"
    methods: ['GET', 'POST'],
    credentials: true
}));

// Bind the session middleware to Socket.io
io.use(socketIoSession(sessionMiddleware, {
    autoSave: true  // Automatically save session data
}));

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.get('/common.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/common.css'));
});

app.get('/lobby.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/lobby.html'));
});

app.get('/*.html', (req, res) => {
    const requestedPage = req.params[0] + '.html'; // This will capture the requested page name
    res.sendFile(path.join(__dirname, 'templates', requestedPage));
});

app.get('/', (req, res) => {
    console.log('Session ID in HTTP request:', req.sessionID);  // Log session ID
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});


// Store lobby data
let lobbies = {};


// Helper function to generate unique game codes
function generateGameCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();  // Generates a random 6-character code
}

// Store timeouts and disconnected players
const disconnectionTimeouts = {};  // { sessionId: timeoutID }
const disconnectedPlayers = {};     // { sessionId: true }


// Handle Socket.io connections
io.on('connection', (socket) => {  
    const session = socket.handshake.session;
    const sessionId = session.id;
    console.log('A player connected. socketId: ', socket.id, 'sessionId: ', sessionId);

    socket.on('createGameRequest', async () => {
        let gameCode;
    
        // Generate a unique game code
        do {
            gameCode = generateGameCode();
        } while (lobbies[gameCode]);
    
        const hostId = sessionId;
        const host = new Player(hostId, null);
    
        // Create and store a new in-memory lobby (for real-time interactions)
        const newLobby = new Lobby(gameCode, host.id);
        newLobby.addPlayer(host);  // Add the host as a player (but don't save to DB yet)
        lobbies[gameCode] = newLobby;  // Store the lobby in-memory
    
        // Now, insert the lobby into the MongoDB (without players)
        try {
            const lobbyDocument = {
                gameCode: gameCode,
                hostId: hostId,
                isGameStarted: false,
                round: 1,
                categories: [
                    "Country", "City", "Animal", "Plant", "Object", 
                    "Boy Name", "Girl Name", "Profession", "Celebrity"
                ],
                players: []  // Players will be added later when the game starts
            };
    
            // await db.collection('lobbies').insertOne(lobbyDocument);  // Insert into MongoDB
            console.log(`Lobby created in MongoDB with code: ${gameCode}`);
            
            // Store gameCode and hostId in the session
            socket.handshake.session.gameCode = gameCode;
            socket.handshake.session.playerId = hostId;
            socket.handshake.session.save();

            // Send the game code and playerId back to the client
            socket.emit('gameCodeGenerated', { gameCode, hostId });
    
        } catch (err) {
            console.error("Error inserting lobby into DB:", err);
            socket.emit('errorMessage', 'Failed to create game.');
        }
    });
    

    // Event to handle player joining the lobby by game code without player name
    socket.on('joinGame', ({ gameCode }) => {
        // Find the lobby by gameCode
        const lobby = lobbies[gameCode];

        // Create a new player (without a name yet) and add to the lobby
        const newPlayer = new Player(sessionId, null);  // Name is null initially
        lobby.addPlayer(newPlayer);
                        
        // Confirm that the player has joined the lobby
        socket.join(gameCode);  // Add the player to the room
        // console.log(`Lobbies object: `, lobbies);
        console.log(`Player with ID ${sessionId} joined lobby ${gameCode}`); 
        socket.emit('joinedLobby', { success: true, gameCode });
              
    });
    
    socket.on('setPlayerName', ({ playerName, gameCode }) => {
        if (lobbies[gameCode]) {
            const lobby = lobbies[gameCode];
            console.log(`number of players in lobby: ${lobby.getPlayersCount()}`);
            // console.log(lobbies[gameCode].players);
            // Find the player in the lobby and set their name
            const player = lobby.players.find(p => p.id === sessionId);
            if (player) {
                player.setName(playerName);  // Set the player's name
                console.log(`Player ${sessionId} name set to ${playerName}`);

                socket.emit('playerNameWasSet');
            }
            
        } else {
            console.log(`Lobby ${gameCode} not found.`);
            socket.emit('errorMessage', 'Lobby not found.');   
        }
    });
   

    const classicalCategories = ['Country', 'City', 'Animal', 'Plant', 'Object', 'Boy Name', 'Girl Name', 'Profession', 'Celebrity'];

    socket.on('joinLobby', ({ gameCode }) => {
        console.log("trying to get player into the lobby");
        // Make the player join the lobby room
        socket.join(gameCode);

        // Check if the player is the host
        const isHost = lobbies[gameCode].isHost(sessionId);
        socket.emit('isHost', isHost);
        
        // Emit updated player list and player count to all players in the lobby
        io.to(gameCode).emit('updatePlayerCount', lobbies[gameCode].players.length);
        io.to(gameCode).emit('updatePlayerList', lobbies[gameCode].getPlayerNames());

        // If the player is the host, send the classical categories
        if (isHost) {
            console.log("player is host!");
            lobbies[gameCode].setCategories(classicalCategories);
            socket.emit('updateCategories', classicalCategories);

        } else {
            // Send the selected categories to the player who just joined
            console.log("player is not host");
            console.log(lobbies[gameCode].selectedCategories);
            socket.emit('updateCategories', lobbies[gameCode].selectedCategories);
        }    
    });

    // When a player tries to join a game with a code, check if the lobby exists
    socket.on('checkGameCode', (gameCode) => {
        if (lobbies[gameCode]) {
            // If the lobby exists, send back a confirmation
            socket.emit('gameCodeStatus', { valid: true, gameCode });
        } else {
            // If the lobby doesn't exist, inform the client
            socket.emit('gameCodeStatus', { valid: false });
        }
    });


    // Check if the sessionId was recently disconnected
    if (disconnectedPlayers[sessionId]) {
        // Cancel the disconnection timeout
        clearTimeout(disconnectionTimeouts[sessionId]);
        delete disconnectionTimeouts[sessionId];
        delete disconnectedPlayers[sessionId];
        console.log(`Player ${sessionId} reconnected (page switch) - timeout cleared`);
    }
    
    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${sessionId} disconnected`);

        const gameCode = getLobbyBySessionId(sessionId);  // Helper function to get the lobby
        if (gameCode) {
            // Add the player to disconnectedPlayers to track them
            disconnectedPlayers[sessionId] = true;
            console.log("player added to the disconnected list");
        }
        
        // Start a timeout for removal if they don’t reconnect in time
        disconnectionTimeouts[sessionId] = setTimeout(() => {
            if (gameCode) {
                const lobby = lobbies[gameCode];
                
                const wasHost = sessionId === lobby.hostId;

                // Remove player from the lobby
                lobby.removePlayer(sessionId);
                console.log(`Player ${sessionId} removed from lobby ${gameCode} due to timeout`);
                console.log(`now the lobby hostId is: ${lobby.hostId}`);
                if (lobby.players.length === 0) {
                    delete lobbies[gameCode];
                    console.log(`Lobby ${gameCode} deleted due to inactivity.`);
                } else if (wasHost) {
                    const room = io.sockets.adapter.rooms.get(gameCode);  // `gameCode` is the room name
                    if (room) {
                        // Convert the Set of socket IDs to an array to access the first one
                        const [newHostSocketId] = Array.from(room); 
                        lobby.hostId = newHostSocketId;  // Set the first player in the room as the new host
                        
                        // Emit isHost to the new host
                        io.to(newHostSocketId).emit('isHost', true);
                        console.log(`New host assigned in lobby ${gameCode}: ${newHostSocketId}`);
                    }
                }

                // Emit updated player list and count
                io.to(gameCode).emit('updatePlayerList', lobby.getPlayerNames());
                io.to(gameCode).emit('updatePlayerCount', lobby.players.length);
            }

            // Clean up the timeout and disconnected player tracking
            delete disconnectionTimeouts[sessionId];
            delete disconnectedPlayers[sessionId];
        }, 6000);  // 30-second grace period
    });



    socket.on('startGame', () => {
        const lobbyId = getLobbyBySessionId(sessionId);
        if (lobbyId && lobbies[lobbyId].host === sessionId) {
            console.log(`Host ${sessionId} started the game in ${lobbyId}`);
            io.to(lobbyId).emit('startCountdown', 5);  // Broadcast a 5-second countdown to all players in the lobby
        }
    });

    // Host cancels the game initiation
    socket.on('cancelGame', () => {
        const lobbyId = getLobbyBySessionId(sessionId);
        if (lobbyId && lobbies[lobbyId].host === sessionId) {
            console.log(`Host ${sessionId} canceled the game initiation in ${lobbyId}`);
            io.to(lobbyId).emit('cancelCountdown');  // Broadcast to cancel the countdown
        }
    });

    // When countdown ends, start the game for all players
    socket.on('endCountdown', () => {
        const lobbyId = getLobbyBySessionId(sessionId);
        io.to(lobbyId).emit('redirectToGame');  // Redirect all players to the game page
    });

    // Handle category selection changes from the host
    socket.on('categorySelectionChanged', ({ categories, gameCode }) => {
        console.log(`Category selection changed for lobby ${gameCode}. New categories: ${categories}`);
        
        const lobby = lobbies[gameCode];  // Get the lobby by gameCode
        if (lobby) {
            lobby.setCategories(categories);  // Update the selected categories in the lobby
            // Broadcast the updated categories to all players in the lobby
            io.to(gameCode).emit('updateCategories', categories);
        } else {
            console.log(`Lobby with gameCode ${gameCode} not found.`);
        }
    });
});


function getLobbyBySessionId(playerId) {
    return Object.keys(lobbies).find(lobbyId => lobbies[lobbyId].players.some(player => player.id === playerId));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
