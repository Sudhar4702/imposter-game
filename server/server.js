const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Add Socket.io with CORS here
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend URL
    methods: ["GET", "POST"]
  }
});

// Word sets for the game
const wordPairs = [
  { crewmate: "Apple", imposter: "Orange" },
  { crewmate: "Dog", imposter: "Wolf" },
  { crewmate: "Car", imposter: "Bike" },
  { crewmate: "Sun", imposter: "Moon" },
  { crewmate: "Cat", imposter: "Tiger" },
  { crewmate: "Chair", imposter: "Stool" },
  { crewmate: "Table", imposter: "Desk" },
  { crewmate: "Pen", imposter: "Pencil" },
  { crewmate: "Cup", imposter: "Mug" },
  { crewmate: "Bread", imposter: "Bun" },
  { crewmate: "Milk", imposter: "Juice" },
  { crewmate: "Rose", imposter: "Tulip" },
  { crewmate: "Shirt", imposter: "T-shirt" },
  { crewmate: "Shoe", imposter: "Sandal" },
  { crewmate: "Boat", imposter: "Ship" },
  { crewmate: "Plane", imposter: "Helicopter" },
  { crewmate: "River", imposter: "Stream" },
  { crewmate: "Mountain", imposter: "Hill" },
  { crewmate: "Book", imposter: "Notebook" },
  { crewmate: "Phone", imposter: "Tablet" },
  { crewmate: "Clock", imposter: "Watch" },
  { crewmate: "Knife", imposter: "Spoon" },
  { crewmate: "Key", imposter: "Lock" },
  { crewmate: "Bread", imposter: "Toast" },
  { crewmate: "Rice", imposter: "Wheat" },
  { crewmate: "Lion", imposter: "Leopard" },
  { crewmate: "Elephant", imposter: "Rhino" },
  { crewmate: "Carrot", imposter: "Potato" },
  { crewmate: "Tomato", imposter: "Chili" },
  { crewmate: "Bottle", imposter: "Can" },
  { crewmate: "Paper", imposter: "Card" },
  { crewmate: "Glass", imposter: "Cup" },
  { crewmate: "Bed", imposter: "Sofa" },
  { crewmate: "Door", imposter: "Gate" },
  { crewmate: "Window", imposter: "Curtain" },
  { crewmate: "Brush", imposter: "Comb" },
  { crewmate: "Soap", imposter: "Shampoo" },
  { crewmate: "Car", imposter: "Van" },
  { crewmate: "Bus", imposter: "Truck" },
  { crewmate: "School", imposter: "College" },
  { crewmate: "Pen", imposter: "Marker" },
  { crewmate: "Pencil", imposter: "Crayon" },
  { crewmate: "Paint", imposter: "Ink" },
  { crewmate: "Chair", imposter: "Couch" },
  { crewmate: "Hat", imposter: "Cap" },
  { crewmate: "Ring", imposter: "Bracelet" },
  { crewmate: "Bag", imposter: "Backpack" },
  { crewmate: "Ball", imposter: "Frisbee" },
  { crewmate: "Bat", imposter: "Racket" },
  { crewmate: "Bike", imposter: "Scooter" },
  { crewmate: "Ship", imposter: "Submarine" },
  { crewmate: "Train", imposter: "Tram" },
  { crewmate: "Cupcake", imposter: "Muffin" },
  { crewmate: "Ice", imposter: "Snow" },
  { crewmate: "Rain", imposter: "Storm" },
  { crewmate: "Cloud", imposter: "Fog" },
  { crewmate: "Star", imposter: "Planet" },
  { crewmate: "Moon", imposter: "Comet" },
  { crewmate: "Sun", imposter: "Fire" },
  { crewmate: "Tree", imposter: "Bush" },
  { crewmate: "Flower", imposter: "Grass" },
  { crewmate: "Leaf", imposter: "Twig" },
  { crewmate: "Dog", imposter: "Fox" },
  { crewmate: "Cat", imposter: "Cheetah" },
  { crewmate: "Mouse", imposter: "Rat" },
  { crewmate: "Cow", imposter: "Bull" },
  { crewmate: "Sheep", imposter: "Goat" },
  { crewmate: "Pig", imposter: "Boar" },
  { crewmate: "Horse", imposter: "Donkey" },
  { crewmate: "Camel", imposter: "Llama" },
  { crewmate: "Boat", imposter: "Canoe" },
  { crewmate: "Plane", imposter: "Glider" },
  { crewmate: "Road", imposter: "Path" },
  { crewmate: "Bridge", imposter: "Tunnel" },
  { crewmate: "Chair", imposter: "Bench" },
  { crewmate: "Table", imposter: "Counter" },
  { crewmate: "Door", imposter: "Hatch" },
  { crewmate: "Window", imposter: "Skylight" },
  { crewmate: "Phone", imposter: "Walkie-talkie" },
  { crewmate: "Computer", imposter: "Laptop" },
  { crewmate: "Keyboard", imposter: "Mouse" },
  { crewmate: "Monitor", imposter: "TV" },
  { crewmate: "Chair", imposter: "Stool" },
  { crewmate: "Cup", imposter: "Glass" },
  { crewmate: "Bread", imposter: "Bagel" },
  { crewmate: "Milk", imposter: "Water" },
  { crewmate: "Cheese", imposter: "Butter" },
  { crewmate: "Rice", imposter: "Pasta" },
  { crewmate: "Apple", imposter: "Pear" },
  { crewmate: "Banana", imposter: "Mango" },
  { crewmate: "Orange", imposter: "Grapefruit" },
  { crewmate: "Car", imposter: "Truck" },
  { crewmate: "Bike", imposter: "Skateboard" },
  { crewmate: "Shoe", imposter: "Boot" },
  { crewmate: "Hat", imposter: "Helmet" },
  { crewmate: "Book", imposter: "Magazine" },
  { crewmate: "Pen", imposter: "Highlighter" },
  { crewmate: "Lamp", imposter: "Lantern" },
  { crewmate: "Fan", imposter: "AC" },
  { crewmate: "Bed", imposter: "Couch" },
  { crewmate: "Soap", imposter: "Detergent" },
  { crewmate: "Brush", imposter: "Comb" },
  { crewmate: "Ball", imposter: "Frisbee" },
  { crewmate: "Bat", imposter: "Stick" },
  { crewmate: "Ring", imposter: "Necklace" },
  { crewmate: "Bag", imposter: "Purse" },
  { crewmate: "Chair", imposter: "Beanbag" }
];


let rooms = {}; // Store players in each room

// ✅ Add this function here
function assignRolesAndWords(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.players.length < 2) return;

  const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
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

// ✅ Socket.io connection events
io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  // Player joins a room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) rooms[roomCode] = { players: [] };
    rooms[roomCode].players.push({ id: socket.id, name: playerName, role: null });
    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  // Start game
  socket.on("startGame", (roomCode) => assignRolesAndWords(roomCode));

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
