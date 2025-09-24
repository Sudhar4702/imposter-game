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

const wordSets = [
  { subject: "Solar System", crewmateWord: "Sun", imposterWord: "Moon" },
  { subject: "Fruits", crewmateWord: "Apple", imposterWord: "Orange" },
  { subject: "Sports", crewmateWord: "Football", imposterWord: "Cricket" },
  { subject: "Animals", crewmateWord: "Lion", imposterWord: "Tiger" },
  { subject: "Colors", crewmateWord: "White", imposterWord: "Black" }
];

let rooms = {};

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], currentSet: null, admin: null };
    const room = rooms[roomCode];

    // Check if the player is already in the room
    const existing = room.players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (existing) {
      existing.id = socket.id;
      socket.join(roomCode);
      sendGameState(roomCode); // Update all players
      return;
    }

    const isAdmin = playerName === "Sudhar";
    if (isAdmin && !room.admin) room.admin = socket.id;

    const newPlayer = { id: socket.id, name: playerName, role: isAdmin ? "Admin" : null, word: null };
    room.players.push(newPlayer);
    socket.join(roomCode);

    io.to(roomCode).emit("roomUpdate", room.players);
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
      if (rooms[roomCode] && rooms[roomCode].admin === socket.id) rooms[roomCode].admin = null;
    }
  });
});

function assignRolesAndWords(room) {
  const set = wordSets[Math.floor(Math.random() * wordSets.length)];
  room.currentSet = set;

  // Reset roles for all players
  room.players.forEach((p) => {
    p.role = "Crewmate";
    p.word = set.crewmateWord;
  });

  // Assign Admin role back to Sudhar
  const adminPlayer = room.players.find(p => p.id === room.admin);
  if (adminPlayer) {
    adminPlayer.role = "Admin";
    adminPlayer.word = null;
  }

  // Randomly assign one non-admin as the Imposter
  const nonAdmins = room.players.filter(p => p.id !== room.admin);
  if (nonAdmins.length > 0) {
    const imposterPlayer = nonAdmins[Math.floor(Math.random() * nonAdmins.length)];
    imposterPlayer.role = "Imposter";
    imposterPlayer.word = set.imposterWord;
  }
}

function sendGameState(roomCode) {
  const room = rooms[roomCode];
  if (!room || !room.currentSet) return;
  room.players.forEach((p) => {
    if (p.id === room.admin) io.to(p.id).emit("adminView", { subject: room.currentSet.subject, players: room.players });
    else io.to(p.id).emit("gameWord", { subject: room.currentSet.subject, role: p.role, word: p.word });
  });
  io.to(roomCode).emit("roomUpdate", room.players);
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
