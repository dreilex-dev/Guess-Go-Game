import React, { useState } from "react";
import "./gameCode.css";

const GameCode = ({ gameCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(gameCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000); 
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };
  return (
    <div className="game-code-container" onClick={handleCopy} title="Click to copy">
      <span className="game-code">Code: {gameCode}</span>
      {copied && <span className="copy-feedback">Copied!</span>}
    </div>
  );
};

export default GameCode;
