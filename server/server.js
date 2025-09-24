// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Word sets with subjects
const wordSets = [
  {
    subject: "Solar System",
    crewmateWord: "Sun",
    imposterWord: "Moon",
  },
  {
    subject: "Fruits",
    crewmateWord: "Apple",
    imposterWord: "Orange",
  },
  {
    subject: "Sports",
    crewmateWord: "Football",
    imposterWord: "Cricket",
  },
  {
    subject: "Animals",
    crewmateWord: "Lion",
    imposterWord: "Tiger",
  },
];

let rooms = {}; // { roomCode: { players: [], currentSet: null } }

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join Room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], currentSet: null, admin: null };
    }

    const existing = rooms[roomCode].players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (existing) {
      socket.emit("errorMessage", "Name already taken in this room.");
      return;
    }

    const isAdmin = playerName === "Sudhar"; // Sudhar = admin
    if (isAdmin && !rooms[roomCode].admin) {
      rooms[roomCode].admin = socket.id;
    }

    const newPlayer = { id: socket.id, name: playerName, role: null, word: null };
    rooms[roomCode].players.push(newPlayer);

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  // Start Game (Admin only)
  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.admin !== socket.id) return; // only admin

    assignRolesAndWords(room);
    sendGameState(roomCode);
  });

  // Next Word (Admin only)
  socket.on("nextWord", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.admin !== socket.id) return;

    assignRolesAndWords(room);
    sendGameState(roomCode);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (p) => p.id !== socket.id
      );
      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
      }
    }
  });
});

// Assign roles & words
function assignRolesAndWords(room) {
  const set = wordSets[Math.floor(Math.random() * wordSets.length)];
  room.currentSet = set;

  // Randomly pick one imposter
  const imposterIndex = Math.floor(Math.random() * room.players.length);
  room.players.forEach((player, i) => {
    if (room.admin === player.id) {
      // Admin doesn't play
      player.role = "Admin";
      player.word = null;
    } else if (i === imposterIndex) {
      player.role = "Imposter";
      player.word = set.imposterWord;
    } else {
      player.role = "Crewmate";
      player.word = set.crewmateWord;
    }
  });
}

// Send game state to everyone
function sendGameState(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.players.forEach((p) => {
    if (p.role === "Admin") {
      io.to(p.id).emit("adminView", {
        subject: room.currentSet.subject,
        players: room.players,
      });
    } else {
      io.to(p.id).emit("gameWord", {
        subject: room.currentSet.subject,
        role: p.role,
        word: p.word,
      });
    }
  });

  io.to(roomCode).emit("roomUpdate", room.players);
}

server.listen(4000, () => console.log("Server running on port 4000"));
