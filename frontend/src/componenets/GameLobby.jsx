import React from "react";
import { useNavigate } from "react-router-dom";

const GameLobby = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/chat_room");
  };

  return (
    <div>
      <h1>Game Lobby</h1>
      <button onClick={handleNavigate}>Go to Chat Room</button>
    </div>
  );
};

export default GameLobby;
