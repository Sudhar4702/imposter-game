// App.jsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = "http://localhost:4000"; // change to your deployed backend
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

export default function App() {
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");
  const [roomCode] = useState("1234");
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    socket.on("roomUpdate", (players) => setPlayers(players));
    socket.on("gameWord", (data) => setRoleInfo(data));
    socket.on("adminView", (data) => setAdminData(data));

    return () => {
      socket.off("roomUpdate");
      socket.off("gameWord");
      socket.off("adminView");
    };
  }, []);

  const joinRoom = () => {
    if (!playerName) return alert("Enter name");
    localStorage.setItem("playerName", playerName);
    socket.emit("joinRoom", { roomCode, playerName });
  };

  const startGame = () => {
    socket.emit("startGame", roomCode);
  };

  const nextWord = () => {
    socket.emit("nextWord", roomCode);
  };

  return (
    <div className="game-container">
      <h1>ImposterWord Game</h1>

      {!roleInfo && !adminData && (
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
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      {/* Admin Controls */}
      {adminData && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <p>
            <strong>Subject:</strong> {adminData.subject}
          </p>
          <button onClick={startGame}>Start Game</button>
          <button onClick={nextWord}>Next Word</button>

          <h3>Player Roles:</h3>
          <ul>
            {adminData.players.map((p) => (
              <li key={p.id}>
                {p.name} → {p.role} {p.word && `(${p.word})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Player View */}
      {roleInfo && (
        <div
          className={`role-box ${
            roleInfo.role === "Imposter" ? "role-imposter" : "role-crewmate"
          }`}
        >
          <p><strong>Subject:</strong> {roleInfo.subject}</p>
          <p><strong>Your Role:</strong> {roleInfo.role}</p>
          <p><strong>Your Word:</strong> {roleInfo.word}</p>
        </div>
      )}
    </div>
  );
}
