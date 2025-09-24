import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = "https://imposter-game-sudhar-45.onrender.com"; 
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

export default function App() {
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");
  const [roomCode, setRoomCode] = useState("1234");
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    socket.on("roomUpdate", (players) => setPlayers(players));
    socket.on("gameWord", (data) => {
      setRoleInfo(data);
      localStorage.setItem("roleInfo", JSON.stringify(data));
    });
    socket.on("adminUpdate", (data) => setAdminInfo(data));

    // restore roleInfo after refresh
    const savedRole = localStorage.getItem("roleInfo");
    if (savedRole) setRoleInfo(JSON.parse(savedRole));

    return () => {
      socket.off("roomUpdate");
      socket.off("gameWord");
      socket.off("adminUpdate");
    };
  }, []);

  const joinRoom = () => {
    if (!playerName) return alert("Enter name");
    localStorage.setItem("playerName", playerName);
    socket.emit("joinRoom", { roomCode, playerName });
  };

  const startGame = () => socket.emit("startGame", roomCode);
  const nextWord = () => socket.emit("nextWord", roomCode);

  const isAdmin = playerName === "Sudhar";

  return (
    <div className="game-container">
      <h1>ImposterWord Game</h1>

      {!roleInfo && (
        <>
          <input
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </>
      )}

      <h3>Players in Room:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} {p.name === "Sudhar" && "(Admin)"}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <>
          <button onClick={startGame}>Start Game</button>
          <button onClick={nextWord}>Next Word</button>
        </>
      )}

      {roleInfo && !isAdmin && (
        <div className={`role-box ${roleInfo.role}`}>
          <p>Your Role: {roleInfo.role}</p>
          <p>Your Word: {roleInfo.word}</p>
        </div>
      )}

      {isAdmin && adminInfo && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <p>Crewmate Word: {adminInfo.words.Crewmate}</p>
          <p>Imposter Word: {adminInfo.words.Imposter}</p>
          <h3>Players</h3>
          <ul>
            {adminInfo.players.map((p) => (
              <li key={p.id}>
                {p.name} → {p.role} ({p.word})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
