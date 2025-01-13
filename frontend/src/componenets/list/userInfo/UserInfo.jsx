import { useUserStore } from "../../../lib/userStore";
import "./userInfo.css";
import React, { useEffect } from "react";

const UserInfo = () => {
  const { currentUser, fetchPlayingUserInfo, playingUser } = useUserStore();

  useEffect(() => {
    if (currentUser?.is_playing) {
      fetchPlayingUserInfo(currentUser.is_playing);
    }
  }, [currentUser, fetchPlayingUserInfo]);

  return (
    <>
      <div className="userInfo">
        {" "}
        {/**The player you are playing as! */}
        {playingUser ? (
          <div className="playingUser">
            <div className="user">
              <img
                src={playingUser.avatar || "./avatar.png"}
                alt="Playing User Avatar"
              />
              <h2>{playingUser.username}</h2>
              <div className="icons">
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
              </div>
            </div>
          </div>
        ) : (
          currentUser && (
            <>
              <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
              </div>
              <div className="icons">
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
              </div>
            </>
          )
        )}
      </div>
    </>
  );
};

export default UserInfo;
