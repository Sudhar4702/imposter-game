const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-sudhar-45.onrender.com", // replace with your frontend URL
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

// Word sets for the game
const wordPairs = [
  { Imposter: "papaya", Crewmate: "mango" },
  { Imposter: "helmet", Crewmate: "cap" },
  { Imposter: "fork", Crewmate: "spoon" },
  { Imposter: "sofa", Crewmate: "chair" },
  { Imposter: "doctor", Crewmate: "nurse" },
  { Imposter: "dog", Crewmate: "cat" },
  { Imposter: "sun", Crewmate: "moon" },
  { Imposter: "salt", Crewmate: "sugar" },
  { Imposter: "tea", Crewmate: "coffee" },
  { Imposter: "pen", Crewmate: "pencil" },
  { Imposter: "school", Crewmate: "college" },
  { Imposter: "phone", Crewmate: "call" },
  { Imposter: "mouse", Crewmate: "keyboard" },
  { Imposter: "queen", Crewmate: "king" },
  { Imposter: "gold", Crewmate: "silver" },
  { Imposter: "lock", Crewmate: "key" }
];

let rooms = {}; // Store rooms

// Assign roles and words
function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
  const numImposters = Math.min(1, room.players.length - 1); // 1 imposter minimum

  shuffledPlayers.forEach((player, index) => {
    if (index < numImposters) {
      player.role = "Imposter";
      player.word = chosen.Imposter;
    } else {
      player.role = "Crewmate";
      player.word = chosen.Crewmate;
    }

    io.to(player.id).emit("gameWord", {
      word: player.word,
      role: player.role,
      isAdmin: player.isAdmin
    });
  });

  room.currentWord = chosen; // ✅ Save so refresh doesn’t reset

  console.log(
    "🎲 Roles & Words:",
    room.players.map((p) => ({ name: p.name, role: p.role }))
  );
}

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  // Player joins room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], currentWord: null };

    const room = rooms[roomCode];
    let existingPlayer = room.players.find((p) => p.name === playerName);

    if (existingPlayer) {
      // Refresh → update socket.id
      existingPlayer.id = socket.id;

      // Send back saved role & word
      io.to(socket.id).emit("gameWord", {
        word: existingPlayer.word,
        role: existingPlayer.role,
        isAdmin: existingPlayer.isAdmin
      });
    } else {
      // New player
      const newPlayer = {
        id: socket.id,
        name: playerName,
        role: null,
        word: null,
        isAdmin: playerName === "Sudhar"
      };
      room.players.push(newPlayer);

      io.to(socket.id).emit("gameWord", {
        word: null,
        role: null,
        isAdmin: newPlayer.isAdmin
      });
    }

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", room.players);
  });

  // Start game (only admin)
  socket.on("startGame", (roomCode) => {
    assignRolesAndWords(roomCode);
  });

  // Next word (only admin)
  socket.on("nextWord", (roomCode) => {
    assignRolesAndWords(roomCode);
  });

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (p) => p.id !== socket.id
      );
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
