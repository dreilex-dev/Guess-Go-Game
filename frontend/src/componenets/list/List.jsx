import React from "react";
import "./list.css";
import UserInfo from "./userInfo/UserInfo";
import ChatList from "./chatList/ChatList";
import { useUserStore } from "./../../lib/userStore";

const List = () => {
  const { currentUser } = useUserStore();

  console.log("from list ", currentUser.is_playing);
  return (
    <div className="list">
      {
        <>
          <UserInfo />
          <ChatList />
        </>
      }
    </div>
  );
};

export default List;
