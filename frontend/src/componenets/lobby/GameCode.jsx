import React from "react";

const GameCode = ({ gameCode }) => {
  return (
    <div className="bg-light text-dark border rounded shadow-lg p-3">
      <p className="mb-1 text-center">Lobby Code</p>
      <strong className="d-block text-center">{gameCode}</strong>
    </div>
  );
};

export default GameCode;
