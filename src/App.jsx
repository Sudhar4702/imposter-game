import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = "https://imposter-game-sudhar-45.onrender.com"; // backend URL
const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"]
});



export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("1234");
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);

  useEffect(() => {
    socket.on("roomUpdate", (players) => setPlayers(players));
    socket.on("gameWord", (data) => setRoleInfo(data));

    return () => {
      socket.off("roomUpdate");
      socket.off("gameWord");
    };
  }, []);

  const joinRoom = () => {
    if (!playerName) return alert("Enter name");
    socket.emit("joinRoom", { roomCode, playerName });
  };

  const startGame = () => {
    socket.emit("startGame", roomCode);
  };

  return (
    <div className="game-container">
      <h1>ImposterWord Game</h1>
      <input
        placeholder="Your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={joinRoom}>Join</button>

      <h3>Players in Room:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      <button onClick={startGame}>Start Game</button>
<button onClick={() => socket.emit("nextWord", roomCode)}>Next Word</button>


      {roleInfo && (
        <div
          className={`role-box ${
            roleInfo.role === "Imposter" ? "role-imposter" : "role-crewmate"
          }`}
        >
          Your Role: {roleInfo.role} <br />
          Your Word: {roleInfo.word}
        </div>
    
      )}

    </div>
  );
}
