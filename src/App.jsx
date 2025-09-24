import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = "https://imposter-game-sudhar-45.onrender.com"; // backend URL
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("1234");
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check localStorage on load
    const saved = JSON.parse(localStorage.getItem("player"));
    if (saved) {
      setPlayerName(saved.playerName);
      setRoomCode(saved.roomCode);
      socket.emit("joinRoom", saved);
      setIsJoined(true);
    }

    socket.on("roomUpdate", (players) => setPlayers(players));

    socket.on("gameWord", (data) => {
      setRoleInfo(data);
      if (data.isAdmin) setIsAdmin(true);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("gameWord");
    };
  }, []);

  const joinRoom = () => {
    if (!playerName) return alert("Enter name");
    const playerObj = { roomCode, playerName };
    localStorage.setItem("player", JSON.stringify(playerObj));
    socket.emit("joinRoom", playerObj);
    setIsJoined(true);
  };

  const startGame = () => {
    if (!isAdmin) return alert("Only Sudhar can start the game");
    socket.emit("startGame", roomCode);
  };

  const nextWord = () => {
    if (!isAdmin) return alert("Only Sudhar can give next word");
    socket.emit("nextWord", roomCode);
  };

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
          <input
            placeholder="Room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      )}

      {isJoined && (
        <div>
          <h3>
            Player: {playerName} {isAdmin && "(Admin)"}
          </h3>

          <h3>Players in Room:</h3>
          <ul>
            {players.map((p) => (
              <li key={p.id}>
                {p.name} {p.isAdmin && "(Admin)"}
              </li>
            ))}
          </ul>

          {/* Only Admin buttons */}
          {isAdmin && (
            <div>
              <button onClick={startGame}>Start Game</button>
              <button onClick={nextWord}>Next Word</button>
            </div>
          )}

          {/* Role/Word display */}
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
      )}
    </div>
  );
}
