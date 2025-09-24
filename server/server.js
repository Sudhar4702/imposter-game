const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Add Socket.io with CORS here
const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-production-d3f7.up.railway.app", // frontend URL
      "http://localhost:5173" // optional, for local dev
    ],
    methods: ["GET", "POST"]
  }
})

// Word sets for the game
const wordPairs = [
  { "Imposter": "papaya", "Crewmate": "mango" },
  { "Imposter": "helmet", "Crewmate": "cap" },
  { "Imposter": "fork", "Crewmate": "spoon" },
  { "Imposter": "sofa", "Crewmate": "chair" },
  { "Imposter": "temple", "Crewmate": "church" },
  { "Imposter": "jeans", "Crewmate": "pants" },
  { "Imposter": "radio", "Crewmate": "TV" },
  { "Imposter": "train", "Crewmate": "bus" },
  { "Imposter": "milk", "Crewmate": "water" },
  { "Imposter": "banana", "Crewmate": "apple" },
  { "Imposter": "mirror", "Crewmate": "glass" },
  { "Imposter": "cricket", "Crewmate": "football" },
  { "Imposter": "festival", "Crewmate": "party" },
  { "Imposter": "idol", "Crewmate": "statue" },
  { "Imposter": "Ring", "Crewmate": "Necklace" },
  { "Imposter": "height", "Crewmate": "weight" },
  { "Imposter": "Fever", "Crewmate": "Cold" },
  { "Imposter": "Apple", "Crewmate": "Banana" },
  { "Imposter": "Bat", "Crewmate": "Ball" },
  { "Imposter": "Jam", "Crewmate": "bread" },
  { "Imposter": "Chair", "Crewmate": "Sofa" },
  { "Imposter": "scooter", "Crewmate": "bike" },
  { "Imposter": "Bus", "Crewmate": "car" },
  { "Imposter": "fan", "Crewmate": "AC" },
  { "Imposter": "pen", "Crewmate": "pencil" },
  { "Imposter": "school", "Crewmate": "college" },
  { "Imposter": "teacher", "Crewmate": "student" },
  { "Imposter": "doctor", "Crewmate": "nurse" },
  { "Imposter": "driver", "Crewmate": "conductor" },
  { "Imposter": "cow", "Crewmate": "buffalo" },
  { "Imposter": "dog", "Crewmate": "cat" },
  { "Imposter": "sun", "Crewmate": "moon" },
  { "Imposter": "rain", "Crewmate": "cloud" },
  { "Imposter": "salt", "Crewmate": "sugar" },
  { "Imposter": "tea", "Crewmate": "coffee" },
  { "Imposter": "rice", "Crewmate": "wheat" },
  { "Imposter": "book", "Crewmate": "Note" },
  { "Imposter": "phone", "Crewmate": "call" },
  { "Imposter": "charger", "Crewmate": "cable" },
  { "Imposter": "mouse", "Crewmate": "keyboard" },
  { "Imposter": "remote", "Crewmate": "TV" },
  { "Imposter": "hotel", "Crewmate": "Lodge" },
  { "Imposter": "market", "Crewmate": "shop" },
  { "Imposter": "park", "Crewmate": "garden" },
  { "Imposter": "bridge", "Crewmate": "road" },
  { "Imposter": "laugh", "Crewmate": "smile" },
  { "Imposter": "cry", "Crewmate": "sad" },
  { "Imposter": "run", "Crewmate": "walk" },
  { "Imposter": "eat", "Crewmate": "drink" },
  { "Imposter": "think", "Crewmate": "talk" },
  { "Imposter": "Bathroom", "Crewmate": "Toilet" },
  { "Imposter": "Wallet", "Crewmate": "Purse" },
  { "Imposter": "White", "Crewmate": "Black" },
  { "Imposter": "Door", "Crewmate": "Window" },
  { "Imposter": "Employee", "Crewmate": "Contingent-Worker" },
  { "Imposter": "Pig", "Crewmate": "Horse" },
  { "Imposter": "SDM", "Crewmate": "Manager" },
  { "Imposter": "Outlook", "Crewmate": "Teams" },
  { "Imposter": "Bed", "Crewmate": "Cot" },
  { "Imposter": "Shoe", "Crewmate": "Socks" },
  { "Imposter": "Ginger", "Crewmate": "Garlic" },
  { "Imposter": "Shop", "Crewmate": "Shampoo" },
  { "Imposter": "shirt", "Crewmate": "t-shirt" },
  { "Imposter": "carrot", "Crewmate": "potato" },
  { "Imposter": "onion", "Crewmate": "tomato" },
  { "Imposter": "drum", "Crewmate": "guitar" },
  { "Imposter": "movie", "Crewmate": "song" },
  { "Imposter": "actor", "Crewmate": "hero" },
  { "Imposter": "queen", "Crewmate": "king" },
  { "Imposter": "baby", "Crewmate": "child" },
  { "Imposter": "uncle", "Crewmate": "aunt" },
  { "Imposter": "cloud", "Crewmate": "sky" },
  { "Imposter": "leaf", "Crewmate": "tree" },
  { "Imposter": "stone", "Crewmate": "rock" },
  { "Imposter": "gold", "Crewmate": "silver" },
  { "Imposter": "coin", "Crewmate": "note" },
  { "Imposter": "lock", "Crewmate": "key" }
];

let rooms = {}; // Store players in each room

// ✅ Assign roles and words
function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
  const numImposters = Math.min(3, room.players.length - 1);

  shuffledPlayers.forEach((player, index) => {
    if (index < numImposters) {
      player.role = "Imposter";
      io.to(player.id).emit("gameWord", { word: chosen.Imposter, role: "Imposter" });
    } else {
      player.role = "Crewmate";
      io.to(player.id).emit("gameWord", { word: chosen.Crewmate, role: "Crewmate" });
    }
  });

  console.log(
    "🎲 New Roles & Words:",
    room.players.map((p) => ({ name: p.name, role: p.role }))
  );
}

// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  // Player joins a room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], gameStarted: false };
    rooms[roomCode].players.push({ id: socket.id, name: playerName, role: null });
    socket.join(roomCode);

    // If game already started, assign role immediately
    if (rooms[roomCode].gameStarted) {
      assignRolesAndWords(roomCode);
    }

    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  // Start game
  socket.on("startGame", (roomCode) => {
    rooms[roomCode].gameStarted = true;
    assignRolesAndWords(roomCode);
  });

  // Next word / next round
  socket.on("nextWord", (roomCode) => assignRolesAndWords(roomCode));

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter((p) => p.id !== socket.id);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
