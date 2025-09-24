const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-sudhar-45.onrender.com",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

const wordPairs = [
  { Imposter: "papaya", Crewmate: "mango" },
  { Imposter: "helmet", Crewmate: "cap" },
  { Imposter: "fork", Crewmate: "spoon" },
  { Imposter: "sofa", Crewmate: "chair" },
  { Imposter: "temple", Crewmate: "church" },
  { Imposter: "jeans", Crewmate: "pants" },
  { Imposter: "radio", Crewmate: "TV" },
  { Imposter: "train", Crewmate: "bus" },
  { Imposter: "milk", Crewmate: "water" },
  { Imposter: "banana", Crewmate: "apple" },
  { Imposter: "mirror", Crewmate: "glass" },
  { Imposter: "cricket", Crewmate: "football" },
  { Imposter: "festival", Crewmate: "party" },
  { Imposter: "idol", Crewmate: "statue" },
  { Imposter: "Ring", Crewmate: "Necklace" },
  { Imposter: "height", Crewmate: "weight" },
  { Imposter: "Fever", Crewmate: "Cold" },
  { Imposter: "Apple", Crewmate: "Banana" }
  // ... Add more pairs if needed
];

let rooms = {}; // { roomCode: { players: [], gameStarted: false } }

function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  const shuffled = [...room.players].sort(() => 0.5 - Math.random());
  const numImposters = Math.min(3, room.players.length - 1);

  shuffled.forEach((player, index) => {
    if (index < numImposters) {
      player.role = "Imposter";
      player.word = chosen.Imposter;
    } else {
      player.role = "Crewmate";
      player.word = chosen.Crewmate;
    }
    io.to(player.id).emit("gameWord", { word: player.word, role: player.role, isAdmin: player.isAdmin });
  });

  console.log(
    "🎲 Roles & Words:", room.players.map(p => ({ name: p.name, role: p.role, word: p.word }))
  );
}

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], gameStarted: false };

    let existing = rooms[roomCode].players.find(p => p.name === playerName);
    if (existing) {
      existing.id = socket.id;
      console.log(`♻️ ${playerName} rejoined room ${roomCode}`);
      if (existing.word && existing.role) {
        io.to(socket.id).emit("gameWord", { word: existing.word, role: existing.role, isAdmin: existing.isAdmin });
      }
    } else {
      const newPlayer = { id: socket.id, name: playerName, role: null, word: null, isAdmin: playerName === "Sudhar" };
      rooms[roomCode].players.push(newPlayer);
      io.to(socket.id).emit("gameWord", { word: null, role: null, isAdmin: newPlayer.isAdmin });
      console.log(`✅ ${playerName} added to room ${roomCode}`);
    }

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isAdmin) return; // Only admin can start
    room.gameStarted = true;
    assignRolesAndWords(roomCode);
  });

  socket.on("nextWord", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isAdmin) return; // Only admin can trigger nextWord
    assignRolesAndWords(roomCode);
  });

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
