const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      // 🛑 The single, correct deployed URL for BOTH client and server
      "https://imposter-game-3456789.onrender.com", 
      
      // Keep this for local development
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
  { subject: "Colors", crewmateWord: "White", imposterWord: "Black" },
  { subject: "Vehicles", crewmateWord: "Car", imposterWord: "Bus" },
  { subject: "Birds", crewmateWord: "Parrot", imposterWord: "Crow" },
  { subject: "Vegetables", crewmateWord: "Potato", imposterWord: "Tomato" },
  { subject: "Flowers", crewmateWord: "Rose", imposterWord: "Lily" },
  { subject: "Drinks", crewmateWord: "Tea", imposterWord: "Coffee" },
  { subject: "Insects", crewmateWord: "Ant", imposterWord: "Bee" },
  { subject: "Jobs", crewmateWord: "Doctor", imposterWord: "Teacher" },
  { subject: "Shapes", crewmateWord: "Circle", imposterWord: "Square" },
  { subject: "Family", crewmateWord: "Father", imposterWord: "Mother" },
  { subject: "School", crewmateWord: "Book", imposterWord: "Pen" },
  { subject: "Weather", crewmateWord: "Rain", imposterWord: "Snow" },
  { subject: "Ocean", crewmateWord: "Shark", imposterWord: "Whale" },
  { subject: "Mountains", crewmateWord: "Everest", imposterWord: "Himalaya" },
  { subject: "Cities", crewmateWord: "Paris", imposterWord: "London" },
  { subject: "Foods", crewmateWord: "Rice", imposterWord: "Bread" },
  { subject: "Toys", crewmateWord: "Ball", imposterWord: "Doll" },
  { subject: "Musical", crewmateWord: "Guitar", imposterWord: "Piano" },
  { subject: "Cartoons", crewmateWord: "Mickey-Mouse", imposterWord: "Tom and Jerry" },
  { subject: "Clothes", crewmateWord: "Shirt", imposterWord: "Pant" },
  { subject: "Trees", crewmateWord: "Mango", imposterWord: "Neem" },
  { subject: "Technology", crewmateWord: "Mobile", imposterWord: "Laptop" },
  { subject: "Months", crewmateWord: "January", imposterWord: "December" },
  { subject: "Days", crewmateWord: "Monday", imposterWord: "Friday" },
  { subject: "Seasons", crewmateWord: "Summer", imposterWord: "Winter" },
  { subject: "Numbers", crewmateWord: "One", imposterWord: "Two" },
  { subject: "Games", crewmateWord: "Chess", imposterWord: "Ludo" },
  { subject: "Transport", crewmateWord: "Train", imposterWord: "Ship" },
  { subject: "Seafood", crewmateWord: "Fish", imposterWord: "Prawn" },
  { subject: "Reptiles", crewmateWord: "Snake", imposterWord: "Lizard" },
  { subject: "Desert", crewmateWord: "Camel", imposterWord: "Cactus" },
  { subject: "Planet", crewmateWord: "Earth", imposterWord: "Mars" },
  { subject: "Dance", crewmateWord: "Ballet", imposterWord: "Disco" },
  { subject: "Jobs", crewmateWord: "Police", imposterWord: "Nurse" },
  { subject: "Computer", crewmateWord: "Mouse", imposterWord: "Keyboard" },
  { subject: "Kitchen", crewmateWord: "Plate", imposterWord: "Spoon" },
  { subject: "Furniture", crewmateWord: "Table", imposterWord: "Chair" },
  { subject: "Ocean Animals", crewmateWord: "Dolphin", imposterWord: "Octopus" },
  { subject: "Books", crewmateWord: "Story", imposterWord: "Poem" },
  { subject: "Countries", crewmateWord: "USA", imposterWord: "INDIA" },
  { subject: "Festivals", crewmateWord: "Diwali", imposterWord: "Christmas" },
  { subject: "Stationery", crewmateWord: "Pencil", imposterWord: "Eraser" },
  { subject: "Feelings", crewmateWord: "Happy", imposterWord: "Sad" },
  { subject: "Music", crewmateWord: "Song", imposterWord: "Dance" },
  { subject: "Space", crewmateWord: "Star", imposterWord: "Planet" },
  { subject: "Fruits", crewmateWord: "Mango", imposterWord: "Banana" },
  { subject: "Sports", crewmateWord: "Hockey", imposterWord: "Tennis" },
  { subject: "Animals", crewmateWord: "Dog", imposterWord: "Cat" },
  { subject: "Colors", crewmateWord: "Blue", imposterWord: "Green" },
  { subject: "Vehicles", crewmateWord: "Bike", imposterWord: "Truck" },
  { subject: "Birds", crewmateWord: "Eagle", imposterWord: "Sparrow" },
  { subject: "Countries", crewmateWord: "Japan", imposterWord: "Korea" },
  { subject: "Vegetables", crewmateWord: "Onion", imposterWord: "Carrot" },
  { subject: "Flowers", crewmateWord: "Sunflower", imposterWord: "Lotus" },
  { subject: "Drinks", crewmateWord: "Juice", imposterWord: "Milk" },
  { subject: "Insects", crewmateWord: "Butterfly", imposterWord: "Mosquito" },
  { subject: "Jobs", crewmateWord: "Farmer", imposterWord: "Driver" },
  { subject: "Shapes", crewmateWord: "Triangle", imposterWord: "Rectangle" },
  { subject: "Family", crewmateWord: "Sister", imposterWord: "Brother" },
  { subject: "School", crewmateWord: "Teacher", imposterWord: "Student" },
  { subject: "Weather", crewmateWord: "Sunny", imposterWord: "Cloudy" },
  { subject: "Ocean", crewmateWord: "Coral", imposterWord: "Shell" },
  { subject: "Mountains", crewmateWord: "Alps", imposterWord: "Andes" },
  { subject: "Cities", crewmateWord: "Delhi", imposterWord: "Mumbai" },
  { subject: "Foods", crewmateWord: "Pizza", imposterWord: "Burger" },
  { subject: "Toys", crewmateWord: "Car", imposterWord: "Robot" },
  { subject: "Musical", crewmateWord: "Drum", imposterWord: "Flute" },
  { subject: "Cartoons", crewmateWord: "Tom", imposterWord: "Jerry" },
  { subject: "Clothes", crewmateWord: "Cap", imposterWord: "Jacket" },
  { subject: "Trees", crewmateWord: "Pine", imposterWord: "Oak" },
  { subject: "Technology", crewmateWord: "TV", imposterWord: "Radio" },
  { subject: "Months", crewmateWord: "March", imposterWord: "May" },
  { subject: "Days", crewmateWord: "Tuesday", imposterWord: "Sunday" },
  { subject: "Seasons", crewmateWord: "Rainy", imposterWord: "Autumn" },
  { subject: "Numbers", crewmateWord: "Ten", imposterWord: "Twenty" },
  { subject: "Games", crewmateWord: "Carrom", imposterWord: "Badminton" },
  { subject: "Transport", crewmateWord: "Plane", imposterWord: "Metro" },
  { subject: "Seafood", crewmateWord: "Crab", imposterWord: "Lobster" },
  { subject: "Reptiles", crewmateWord: "Crocodile", imposterWord: "Turtle" },
  { subject: "Desert", crewmateWord: "Sand", imposterWord: "Oasis" },
  { subject: "Planet", crewmateWord: "Venus", imposterWord: "Saturn" },
  { subject: "Language", crewmateWord: "French", imposterWord: "German" },
  { subject: "Dance", crewmateWord: "HipHop", imposterWord: "Jazz" },
  { subject: "Jobs", crewmateWord: "Pilot", imposterWord: "Chef" },
  { subject: "Computer", crewmateWord: "Screen", imposterWord: "CPU" },
  { subject: "Kitchen", crewmateWord: "Fork", imposterWord: "Knife" },
  { subject: "Furniture", crewmateWord: "Sofa", imposterWord: "Bed" },
  { subject: "Ocean Animals", crewmateWord: "Seal", imposterWord: "Penguin" },
  { subject: "Books", crewmateWord: "Novel", imposterWord: "Comic" },
  { subject: "Countries", crewmateWord: "Brazil", imposterWord: "Spain" },
  { subject: "Festivals", crewmateWord: "Christmas", imposterWord: "Eid" },
  { subject: "Stationery", crewmateWord: "Sharpener", imposterWord: "Marker" },
  { subject: "Feelings", crewmateWord: "Angry", imposterWord: "Calm" },
  { subject: "Music", crewmateWord: "Band", imposterWord: "Singer" }
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
