import React from "react";
import "./leaveButton.css";

const LeaveButton = ({ onLeave }) => {
  return (
    <button className="leave-button btn btn-danger" onClick={onLeave}>
      Leave
    </button>
  );
};

export default LeaveButton;
