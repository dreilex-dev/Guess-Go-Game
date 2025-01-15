import React from "react";
import "./chatButton.css";

const ChatButton = ({ onChatClick }) => {
  return (
    <button className="chat-button" onClick={onChatClick}>
      Open Chat
    </button>
  );
};

export default ChatButton;
