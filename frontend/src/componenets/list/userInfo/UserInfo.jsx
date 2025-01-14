import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore"; // Your custom user store
import { db } from "../../../lib/firebase";
import "./userInfo.css";

const UserInfo = () => {
  const { currentUser, setCurrentUser } = useUserStore(); // Assume setCurrentUser is available for updates
  const [userPlayingData, setUserPlayingData] = useState(null);

  // Listen for real-time updates to currentUser
  useEffect(() => {
    let unsubscribe;

    if (currentUser?.id) {
      const userDocRef = doc(db, "users", currentUser.id);

      unsubscribe = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const updatedUser = docSnapshot.data();
            setCurrentUser({ ...updatedUser, id: docSnapshot.id }); // Update currentUser in the store
          }
        },
        (error) => {
          console.error("Error listening to currentUser changes:", error);
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.id, setCurrentUser]);

  // Real-time listener for `is_playing` changes
  useEffect(() => {
    let unsubscribe;

    if (currentUser?.is_playing) {
      const playingDocRef = doc(db, "users", currentUser.is_playing);

      unsubscribe = onSnapshot(
        playingDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserPlayingData(docSnapshot.data());
          } else {
            setUserPlayingData(null);
          }
        },
        (error) => {
          console.error("Error listening to playing user changes:", error);
        }
      );
    } else {
      setUserPlayingData(null);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
          <div className="icons">
            <img src="./video.png" alt="Video" />
            <img src="./edit.png" alt="Edit" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
