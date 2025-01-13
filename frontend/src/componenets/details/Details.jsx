import React from "react";
import "./details.css";
import LogOutButton from "../LogOutButton";

const Details = () => {
  return (
    <div className="detail">
      <div className="user">
        <img src="./avatar.png" alt="" />
        <h2>Jane Doe</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Did you figure out who is this?</span>
          </div>
        </div>
        <button className=" btn btn-primary">Click here then</button>
        <button className="btn btn-secondary">Go back</button>
        <LogOutButton />
      </div>
    </div>
  );
};

export default Details;
