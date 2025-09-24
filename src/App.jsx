import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://imposter-game-sudhar-45.onrender.com", { transports: ['websocket'] });

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState(null);
  const [role, setRole] = useState(null);
  const [word, setWord] = useState(null);

  useEffect(() => {
    socket.on("roomUpdate", (players) => {
      setPlayers(players);
    });
    socket.on("adminView", (data) => {
      setSubject(data.subject);
      setRole("Admin");
      setPlayers(data.players);
      setIsAdmin(true); // Explicitly set isAdmin for the admin
    });
    socket.on("gameWord", (data) => {
      setSubject(data.subject);
      setRole(data.role);
      setWord(data.word);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("adminView");
      socket.off("gameWord");
    };
  }, [playerName]);

  const handleJoin = () => {
    if (roomCode && playerName) {
      socket.emit("joinRoom", { roomCode, playerName });
      setJoined(true);
      if (playerName === "Sudhar") setIsAdmin(true); // Set isAdmin on join for Sudhar
    }
  };

  const handleStartGame = () => socket.emit("startGame", roomCode);
  const handleNextWord = () => socket.emit("nextWord", roomCode);

  if (!joined) {
    return (
      <div>
        <h2>ImposterWord Game</h2>
        <input placeholder="Room Code" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
        <input placeholder="Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
        <button onClick={handleJoin}>Join Room</button>
      </div>
    );
  }

  return (
    <div>
      <h2>ImposterWord Game</h2>
      <div>
        <strong>Players in Room:</strong>
        <ul>
          {players.map(p => (
            <li key={p.id}>{p.name} {p.id === socket.id ? "(You)" : ""} {p.role && `(${p.role})`}</li>
          ))}
        </ul>
      </div>
      {isAdmin ? (
        <div>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={handleNextWord}>Next Word</button>
          {subject && <div>Current Subject: {subject}</div>}
          <h3>Admin View: Roles and Words</h3>
          <ul>
            {players.map(p => (
              <li key={p.id}>
                {p.name} - Role: {p.role} - Word: {p.word || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      ) : (subject && role) ? (
        <div>
          <strong>Subject:</strong> {subject} <br />
          <strong>Your Role:</strong> {role} <br />
          <strong>Your Word:</strong> {word}
        </div>
      ) : <div>Waiting for game to start...</div>}
    </div>
  );
}
