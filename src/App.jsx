import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = "https://imposter-game-sudhar-45.onrender.com"; // replace
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("1234");
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [adminView, setAdminView] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("player"));
    if (saved) {
      setPlayerName(saved.playerName);
      setRoomCode(saved.roomCode);
      socket.emit("joinRoom", saved);
      setIsJoined(true);
    }

    socket.on("roomUpdate", (players) => setPlayers(players));

    socket.on("gameWord", (data) => {
      if (data.role && data.word) setRoleInfo(data);
      setIsAdmin(data.isAdmin || false);
      localStorage.setItem(
        "player",
        JSON.stringify({ playerName, roomCode })
      );
    });

    socket.on("adminView", (data) => {
      setIsAdmin(true);
      setAdminView(data);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("gameWord");
      socket.off("adminView");
    };
  }, [playerName, roomCode]);

  const joinRoom = () => {
    if (!playerName) return alert("Enter name");
    socket.emit("joinRoom", { roomCode, playerName });
    localStorage.setItem("player", JSON.stringify({ playerName, roomCode }));
    setIsJoined(true);
  };

  const startGame = () => socket.emit("startGame", roomCode);
  const nextWord = () => socket.emit("nextWord", roomCode);

  return (
    <div className="game-container">
      <h1>ImposterWord Game</h1>

      {!isJoined && (
        <div>
          <input
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      )}

      <h3>Players in Room:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      {isAdmin && (
        <div className="admin-panel">
          <h2>Admin Dashboard</h2>
          <button onClick={startGame}>Start Game</button>
          <button onClick={nextWord}>Next Word</button>

          <h3>Assignments:</h3>
          <ul>
            {adminView.map((p, idx) => (
              <li key={idx}>
                {p.name} → {p.role} ({p.word})
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isAdmin && roleInfo && (
        <div
          className={`role-box ${
            roleInfo.role === "Imposter" ? "role-imposter" : "role-crewmate"
          }`}
        >
          <strong>Your Role:</strong> {roleInfo.role} <br />
          <strong>Your Word:</strong> {roleInfo.word}
        </div>
      )}
    </div>
  );
}
