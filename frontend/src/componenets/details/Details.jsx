import React, { useState, useEffect } from "react";
import "./details.css";
import LogOutButton from "../LogOutButton";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { toast } from "react-toastify";

import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const Details = () => {
  const { currentUser, decrementHints } = useUserStore();
  const { chatId, user } = useChatStore();
  const [userHints, setUserHints] = useState({});
  const [userPlayingData, setUserPlayingData] = useState(null);

  console.log(user);

  useEffect(() => {
    setUserHints((prevHints) => ({
      ...prevHints,
      [user.id]: prevHints[user.id] || { hint1: false, hint2: false },
    }));
  }, [user.id]);

  console.log(currentUser);

  const handleShowHint1 = () => {
    if (currentUser.no_of_hints > 0) {
      setUserHints((prev) => ({
        ...prev,
        [user.id]: { ...prev[user.id], hint1: true },
      }));
      decrementHints(currentUser.id);
    } else {
      toast.error(` ${currentUser.username} Sorry! You dont have hints left!`);
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
      console.error(
        ` ${currentUser.username} Sorry! You dont have hints left!`
      );
    }
  };

  useEffect(() => {
    if (user?.is_playing) {
      const fetchUserData = async () => {
        const fetchedUser = await userIsPlayingAs(user.is_playing);
        setUserPlayingData(fetchedUser);
      };
      fetchUserData();
    }
  }, [user?.is_playing]);

  const userIsPlayingAs = async (id) => {
    if (id) {
      const userDocRef = doc(db, "users", id);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data();
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    }
    return null;
  };

  return (
    <div className="detail">
      <div className="user">
        <img
          src={userPlayingData ? userPlayingData.avatar : "/avatar.png"}
          alt=""
        />
        <h2>{userPlayingData ? userPlayingData.username : "Loading..."}</h2>
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
