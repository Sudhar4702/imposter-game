import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://imposter-game-sudhar-45.onrender.com", { transports: ['websocket'] });

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [role, setRole] = useState("");
  const [word, setWord] = useState("");

  useEffect(() => {
    socket.on("roomUpdate", (players) => {
      setPlayers(players);
      const user = players.find((p) => p.name === playerName);
      setIsAdmin(user && user.role === "Admin");
    });
    socket.on("adminView", (data) => {
      setSubject(data.subject);
      setRole("Admin");
      setWord(null);
      setPlayers(data.players); // Update full player list with roles and words
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
            <li key={p.id}>{p.name} {p.role && `(as ${p.role})`}</li>
          ))}
        </ul>
      </div>
      {isAdmin ? (
        <div>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={handleNextWord}>Next Word</button>
          {subject && <div>Current Subject: {subject}</div>}
          <h3>Admin View (All Players' Roles and Words)</h3>
          <ul>
            {players.map(p => (
              <li key={p.id}>
                {p.name} - Role: {p.role} - Word: {p.word || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      ) : subject ? (
        <div>
          <strong>Subject:</strong> {subject} <br />
          <strong>Your Role:</strong> {role} <br />
          <strong>Your Word:</strong> {word}
        </div>
      ) : null}
    </div>
  );
}
