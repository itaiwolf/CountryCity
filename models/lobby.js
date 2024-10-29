// models/Lobby.js

class Lobby {
    constructor(gameCode, hostId) {
        this.gameCode = gameCode;  // Unique game code for the lobby
        this.hostId = hostId;  // Host is the player who created the lobby (identified by socket.id)
        this.players = [];  // Array of Player objects
        this.selectedCategories = [];  // Categories selected for the game
        this.isGameStarted = false;  // To track if the game has started
        this.round = 1;  // Current round of the game
    }

    // Add a player to the lobby
    addPlayer(player) {
        this.players.push(player);
    }

    // Remove a player from the lobby by their ID
    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);

        // If the host leaves, assign a new host
        if (this.hostId === playerId && this.players.length > 0) {
            this.hostId = this.players[0].id;  // Reassign to the first player left
        }
    }

    // Update the selected categories for the lobby
    setCategories(categories) {
        this.selectedCategories = categories;
    }


    // Get the player list for the lobby
    getPlayerNames() {
        return this.players.map(player => player.name);
    }

    getPlayersCount(){
        return this.players.length;
    }

    getPlayerById(playerId){
        return this.players.find(p => p.id === playerId);
    }

    // Check if a player is the host
    isHost(playerId) {
        return this.hostId === playerId;
    }

    // Start the game
    startGame() {
        this.isGameStarted = true;
        this.round = 1;  // Reset round if needed
    }

    // Move to the next round
    nextRound() {
        this.round += 1;
    }

    // Get the current round
    getCurrentRound() {
        return this.round;
    }

    // Check if the game has started
    hasGameStarted() {
        return this.isGameStarted;
    }
}

module.exports = Lobby;
