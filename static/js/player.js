// models/Player.js

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.avatar = null;
        this.score = 0;
    }
    
    setName(name) {
        this.name = name;
    }

    // Method to set the player's avatar (can be updated later)
    setAvatar(avatarUrl) {
      this.avatar = avatarUrl;
    }
  
    // Method to update the player's score
    addScore(points) {
      this.score += points;
    }
  
    // Method to reset player's score (for new games)
    resetScore() {
      this.score = 0;
    }
  
    // Method to return player info in an object (for sending to clients)
    getPlayerInfo() {
      return {
        id: this.id,
        name: this.name,
        avatar: this.avatar,
        score: this.score
      };
    }
  }

  window.Player = Player;
