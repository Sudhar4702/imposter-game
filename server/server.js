// Assign new roles and words
function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  // Pick a new word pair
  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];

  // Shuffle players
  const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());

  // Max 3 imposters
  const numImposters = Math.min(3, room.players.length - 1);

  shuffledPlayers.forEach((player, index) => {
    if (index < numImposters) {
      player.role = "Imposter";
      io.to(player.id).emit("gameWord", { word: chosen.imposter, role: "Imposter" });
    } else {
      player.role = "Crewmate";
      io.to(player.id).emit("gameWord", { word: chosen.crewmate, role: "Crewmate" });
    }
  });

  console.log(
    "🎲 New Roles & Words:",
    room.players.map((p) => ({ name: p.name, role: p.role }))
  );
}

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [] };
    rooms[roomCode].players.push({ id: socket.id, name: playerName, role: null });
    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  // Start game
  socket.on("startGame", (roomCode) => assignRolesAndWords(roomCode));

  // Next word / next game
  socket.on("nextWord", (roomCode) => assignRolesAndWords(roomCode));

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter((p) => p.id !== socket.id);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
    }
  });
});
