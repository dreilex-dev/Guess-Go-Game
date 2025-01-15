import React from "react";

const PlayerCard = ({ avatar, onChat, onReveal }) => {
  return (
    <div className="card text-center shadow-sm">
      <img
        src={avatar}
        alt="Player avatar"
        className="card-img-top rounded-circle mx-auto d-block mt-3"
        style={{ width: "100px", height: "100px", objectFit: "cover" }}
      />
      <div className="card-body">
        <div className="d-flex justify-content-around">
          {/* <button className="btn btn-primary btn-sm" onClick={onChat}>
            Chat
          </button> */}
          <button className="btn btn-secondary btn-sm" onClick={onReveal}>
            Reveal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
