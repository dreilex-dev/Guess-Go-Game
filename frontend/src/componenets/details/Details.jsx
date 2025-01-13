import React, { useState, useEffect } from "react";
import "./details.css";
import LogOutButton from "../LogOutButton";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { toast } from "react-toastify";

const Details = () => {
  const { currentUser, decrementHints } = useUserStore();
  const { chatId, user } = useChatStore();
  const [userHints, setUserHints] = useState({});

  useEffect(() => {
    setUserHints((prevHints) => ({
      ...prevHints,
      [user.id]: prevHints[user.id] || { hint1: false, hint2: false },
    }));
  }, [user.id]);

  const handleShowHint1 = () => {
    if (currentUser.no_of_hints > 0) {
      setUserHints((prev) => ({
        ...prev,
        [user.id]: { ...prev[user.id], hint1: true },
      }));
      decrementHints(currentUser.id);
    } else {
      toast.error("Sorry! You dont have hints left!");
    }
  };

  const handleShowHint2 = () => {
    if (currentUser.no_of_hints > 0) {
      setUserHints((prev) => ({
        ...prev,
        [user.id]: { ...prev[user.id], hint2: true },
      }));
      decrementHints(currentUser.id);
    } else {
      toast.error("Sorry! You dont have hints left!");
    }
  };

  console.log(currentUser.no_of_hints);
  return (
    <div className="detail">
      <div className="user">
        <img src="./avatar.png" alt="" />
        <h2>{user.username}</h2>
        <div className="hints_box">
          <div className="">
            {userHints[user.id]?.hint1 ? (
              <p className="hint">{user.hint_no1}</p>
            ) : (
              <button onClick={handleShowHint1} className="btn btn-info">
                Show Hint 1
              </button>
            )}
          </div>
          <div>
            {userHints[user.id]?.hint2 ? (
              <p className="hint">{user.hint_no2}</p>
            ) : (
              <button onClick={handleShowHint2} className="btn btn-info">
                Show Hint 2
              </button>
            )}
          </div>
        </div>
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
