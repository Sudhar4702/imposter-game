const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-sudhar-45.onrender.com", // frontend URL
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
  { Imposter: "sun", Crewmate: "moon" },
  { Imposter: "dog", Crewmate: "cat" },
  { Imposter: "salt", Crewmate: "sugar" },
  { Imposter: "car", Crewmate: "bus" }
];

let rooms = {}; // store room states

function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  room.currentWords = chosen;

  // pick imposters
  const shuffled = [...room.players].sort(() => 0.5 - Math.random());
  const numImposters = Math.min(1, room.players.length - 1); // 1 imposter
  shuffled.forEach((p, i) => {
    if (p.name === "Sudhar") {
      p.role = "Admin";
      p.word = "N/A";
    } else if (i < numImposters) {
      p.role = "Imposter";
      p.word = chosen.Imposter;
    } else {
      p.role = "Crewmate";
      p.word = chosen.Crewmate;
    }
    io.to(p.id).emit("gameWord", { role: p.role, word: p.word });
  });

  // send admin full info
  const admin = room.players.find((p) => p.name === "Sudhar");
  if (admin) {
    io.to(admin.id).emit("adminUpdate", {
      words: chosen,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        word: p.word
      }))
    });
  }

  io.to(roomCode).emit("roomUpdate", room.players);
}

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], currentWords: null };

    let room = rooms[roomCode];
    let existing = room.players.find((p) => p.name === playerName);

    if (existing) {
      existing.id = socket.id; // update id if reconnected
    } else {
      room.players.push({ id: socket.id, name: playerName, role: null, word: null });
    }

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", room.players);

    // if game already started → re-send old role/word
    if (room.currentWords) {
      let p = room.players.find((pl) => pl.id === socket.id);
      if (p) io.to(p.id).emit("gameWord", { role: p.role, word: p.word });
    }
  });

  socket.on("startGame", (roomCode) => assignRolesAndWords(roomCode));
  socket.on("nextWord", (roomCode) => assignRolesAndWords(roomCode));

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    for (const code in rooms) {
      rooms[code].players = rooms[code].players.filter((p) => p.id !== socket.id);
      io.to(code).emit("roomUpdate", rooms[code].players);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
