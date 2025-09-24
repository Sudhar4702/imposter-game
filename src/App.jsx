import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

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
      setIsAdmin(true);
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
      if (playerName === "Sudhar") setIsAdmin(true);
    }
  };

  const handleStartGame = () => socket.emit("startGame", roomCode);
  const handleNextWord = () => socket.emit("nextWord", roomCode);

  return (
    <div className="game-container">
      <header>
        <h1>ImposterWord</h1>
      </header>

      {!joined ? (
        <div className="card">
          <h2 className="card-title">Join a Room</h2>
          <input
            className="input-field"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="classic-button blue-button" onClick={handleJoin}>
            Join Room
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="room-info">
            <h2 className="card-title">Room: {roomCode}</h2>
          </div>

          <div className="section">
            <h3 className="section-title">Players in Room</h3>
            <ul className="player-list">
              {players.map((p) => (
                <li key={p.id} className="player-item">
                  {p.name} {p.id === socket.id ? "(You)" : ""}
                </li>
              ))}
            </ul>
          </div>

          {isAdmin ? (
            <div className="section">
              <div className="button-group">
                <button className="classic-button green-button" onClick={handleStartGame}>
                  Start Game
                </button>
                <button className="classic-button red-button" onClick={handleNextWord}>
                  Next Word
                </button>
              </div>
              {subject && <div className="game-details">Current Subject: {subject}</div>}
              <div className="section">
                <h3 className="section-title">Admin View: Roles and Words</h3>
                <ul className="admin-player-list">
                  {players.map((p) => (
                    <li key={p.id} className="admin-player-item">
                      {p.name} - <span className={`role-${p.role?.toLowerCase()}`}>{p.role}</span> - <span className="word-text">{p.word || "N/A"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="game-display section">
              {subject ? (
                <div>
                  <div className="game-details">
                    <strong>Subject:</strong> {subject}
                  </div>
                  <div className="game-details">
                    <strong>Your Role:</strong> <span className={`role-${role?.toLowerCase()}`}>{role}</span>
                  </div>
                  <div className="game-details">
                    <strong>Your Word:</strong> <span className="word-text">{word}</span>
                  </div>
                </div>
              ) : (
                <div className="game-details">Waiting for the game to start...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
