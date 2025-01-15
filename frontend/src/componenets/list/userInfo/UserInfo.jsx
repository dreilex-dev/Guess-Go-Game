import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import { db } from "../../../lib/firebase";
import "./userInfo.css";

const UserInfo = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const [userPlayingData, setUserPlayingData] = useState(null);

  console.log(currentUser.no_of_hints);
  useEffect(() => {
    if (!currentUser?.id) return;

    const userDocRef = doc(db, "users", currentUser.id);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setCurrentUser({ ...docSnapshot.data(), id: docSnapshot.id });
        }
      },
      (error) => console.error("Error listening to currentUser changes:", error)
    );

    return unsubscribe;
  }, [currentUser?.id, setCurrentUser]);

  useEffect(() => {
    if (!currentUser?.is_playing) {
      setUserPlayingData(null);
      return;
    }

    const playingDocRef = doc(db, "users", currentUser.is_playing);
    const unsubscribe = onSnapshot(
      playingDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserPlayingData(docSnapshot.data());
        } else {
          setUserPlayingData(null);
        }
      },
      (error) =>
        console.error("Error listening to playing user changes:", error)
    );

    return unsubscribe;
  }, [currentUser?.is_playing]);

  if (!userPlayingData) {
    return <div>Loading user info...</div>;
  }

  return (
    <div className="userInfo">
      <div className="playingUser">
        <div className="user">
          <img
            src={userPlayingData.avatar || "/avatar.png"}
            alt="Playing User Avatar"
          />
          <h2>{userPlayingData.username}</h2>
        </div>
      </div>
      <div className="icons">
        <p>
          {currentUser.no_of_hints === 3 ? (
            <>🤔🤔🤔</>
          ) : currentUser.no_of_hints === 2 ? (
            <>🤔🤔</>
          ) : currentUser.no_of_hints === 1 ? (
            <>🤔</>
          ) : (
            "❌"
          )}
        </p>
      </div>
    </div>
  );
};

export default UserInfo;
