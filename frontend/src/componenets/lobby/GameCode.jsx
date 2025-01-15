import React from "react";
import "./gameCode.css";

const GameCode = ({ gameCode }) => {
  return (
    <div className="game-code-container">
      Lobby: {gameCode}
    </div>
  );
};

export default GameCode;
