import React from "react";

const GameCode = ({ gameCode }) => {
  return (
    <div className="position-fixed bottom-0 start-0 bg-light text-dark border rounded shadow-sm p-3 m-3">
      <p className="mb-1 text-center">Lobby Code</p>
      <strong className="d-block text-center">{gameCode}</strong>
    </div>
  );
};

export default GameCode;
