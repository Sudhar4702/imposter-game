const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://imposter-game-sudhar-45.onrender.com", // deployed frontend
      "http://localhost:5173" // local dev
    ],
    methods: ["GET", "POST"]
  }
});

// Word sets with subjects
const wordSets = [
  { subject: "Solar System", crewmateWord: "Sun", imposterWord: "Moon" },
  { subject: "Fruits", crewmateWord: "Apple", imposterWord: "Orange" },
  { subject: "Sports", crewmateWord: "Football", imposterWord: "Cricket" },
  { subject: "Animals", crewmateWord: "Lion", imposterWord: "Tiger" },
  { subject: "Colors", crewmateWord: "White", imposterWord: "Black" }
];

let rooms = {}; // { roomCode: { players: [], currentSet: null, admin: null } }

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], currentSet: null, admin: null };
    const room = rooms[roomCode];

    const existing = room.players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (existing) {
      existing.id = socket.id; // rejoin
      socket.join(roomCode);
      socket.emit("gameWord", existing.word ? { ...existing } : null);
      return;
    }

    const isAdmin = playerName === "Sudhar";
    if (isAdmin && !room.admin) room.admin = socket.id;

    const newPlayer = { id: socket.id, name: playerName, role: null, word: null };
    room.players.push(newPlayer);
    socket.join(roomCode);

    // resend room players
    io.to(roomCode).emit("roomUpdate", room.players);

    // if game already started, send existing roles/words
    if (room.currentSet) sendGameState(roomCode);
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.admin !== socket.id) return;
    assignRolesAndWords(room);
    sendGameState(roomCode);
  });

  socket.on("nextWord", (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.admin !== socket.id) return;
    assignRolesAndWords(room);
    sendGameState(roomCode);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
      if (rooms[roomCode].players.length === 0) delete rooms[roomCode];
    }
  });
});

// Assign roles & words
function assignRolesAndWords(room) {
  const set = wordSets[Math.floor(Math.random() * wordSets.length)];
  room.currentSet = set;

  const playersNoAdmin = room.players.filter(p => p.id !== room.admin);
  const imposterIndex = Math.floor(Math.random() * playersNoAdmin.length);

  room.players.forEach((p, i) => {
    if (p.id === room.admin) {
      p.role = "Admin";
      p.word = null;
    } else if (playersNoAdmin[imposterIndex].id === p.id) {
      p.role = "Imposter";
      p.word = set.imposterWord;
    } else {
      p.role = "Crewmate";
      p.word = set.crewmateWord;
    }
  });
}

// Send state to everyone
function sendGameState(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.players.forEach((p) => {
    if (p.id === room.admin) {
      io.to(p.id).emit("adminView", {
        subject: room.currentSet.subject,
        players: room.players
      });
    } else {
      io.to(p.id).emit("gameWord", {
        subject: room.currentSet.subject,
        role: p.role,
        word: p.word
      });
    }
  });

  io.to(roomCode).emit("roomUpdate", room.players);
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
