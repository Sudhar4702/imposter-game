const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-sudhar-45.onrender.com", // replace with frontend
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

const wordPairs = [
  { Imposter: "papaya", Crewmate: "mango" },
  { Imposter: "helmet", Crewmate: "cap" },
  { Imposter: "dog", Crewmate: "cat" },
  { Imposter: "sun", Crewmate: "moon" },
  { Imposter: "salt", Crewmate: "sugar" },
  { Imposter: "tea", Crewmate: "coffee" },
  { Imposter: "pen", Crewmate: "pencil" },
  { Imposter: "school", Crewmate: "college" }
];

let rooms = {};

// Assign roles and words
function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];

  // Exclude admin
  const nonAdminPlayers = room.players.filter((p) => !p.isAdmin);

  const shuffled = [...nonAdminPlayers].sort(() => 0.5 - Math.random());
  const numImposters = Math.min(1, nonAdminPlayers.length - 1);

  shuffled.forEach((player, index) => {
    if (index < numImposters) {
      player.role = "Imposter";
      player.word = chosen.Imposter;
    } else {
      player.role = "Crewmate";
      player.word = chosen.Crewmate;
    }

    // Send word+role only to player
    io.to(player.id).emit("gameWord", {
      word: player.word,
      role: player.role,
      isAdmin: false
    });
  });

  room.currentWord = chosen;

  // ✅ Send full mapping only to admin
  room.players
    .filter((p) => p.isAdmin)
    .forEach((admin) => {
      io.to(admin.id).emit(
        "adminView",
        nonAdminPlayers.map((p) => ({
          name: p.name,
          role: p.role,
          word: p.word
        }))
      );
    });

  console.log(
    "🎲 Roles & Words:",
    nonAdminPlayers.map((p) => ({ name: p.name, role: p.role }))
  );
}

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], currentWord: null };

    const room = rooms[roomCode];
    let existingPlayer = room.players.find((p) => p.name === playerName);

    if (existingPlayer) {
      existingPlayer.id = socket.id;

      if (!existingPlayer.isAdmin) {
        io.to(socket.id).emit("gameWord", {
          word: existingPlayer.word,
          role: existingPlayer.role,
          isAdmin: false
        });
      }
    } else {
      const newPlayer = {
        id: socket.id,
        name: playerName,
        role: null,
        word: null,
        isAdmin: playerName === "Sudhar"
      };
      room.players.push(newPlayer);

      if (newPlayer.isAdmin) {
        io.to(socket.id).emit("adminView", []);
      }
    }

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", room.players);
  });

  socket.on("startGame", (roomCode) => assignRolesAndWords(roomCode));
  socket.on("nextWord", (roomCode) => assignRolesAndWords(roomCode));

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
