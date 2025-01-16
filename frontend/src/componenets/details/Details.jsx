import React, { useState, useEffect } from "react";
import "./details.css";
import LogOutButton from "../LogOutButton";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

const Details = () => {
  const { currentUser, decrementHints } = useUserStore();
  const { chatId, user } = useChatStore();
  const [userPlayingData, setUserPlayingData] = useState(null);
  const [isHint1Hidden, setIsHint1Hidden] = useState(false);
  const [isHint2Hidden, setIsHint2Hidden] = useState(false);
  const navigate = useNavigate();

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

  const handleGoBack = () => {
    navigate("/");
  };

  const toggleHint1 = () => {
    if (currentUser?.no_of_hints > 0) {
      setIsHint1Hidden(true);
      toast.info(user.hint_no1);
      decrementHints();
    } else {
      toast.error("No hints left!");
    }
  };

  const toggleHint2 = () => {
    setIsHint2Hidden(!isHint2Hidden);
    if (!isHint2Hidden) {
      toast.info(user.hint_no2);
    }
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
          <div>
            <button
              onClick={toggleHint1}
              className={`btn btn-info ${isHint1Hidden ? "hidden" : ""}`}
            >
              {isHint1Hidden ? "Hide Hint 1" : "Show Hint 1"}
            </button>
          </div>
          <div>
            <button
              onClick={toggleHint2}
              className={`btn btn-info ${isHint2Hidden ? "hidden" : ""}`}
            >
              {isHint2Hidden ? "Hide Hint 2" : "Show Hint 2"}
            </button>
          </div>
        </div>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Did you figure out who is this?</span>
          </div>
        </div>
        <button className="btn btn-primary">Click here then</button>
        <button onClick={handleGoBack} className="btn btn-secondary">
          Go back
        </button>
        <LogOutButton />
      </div>
    </div>
  );
};

export default Details;
