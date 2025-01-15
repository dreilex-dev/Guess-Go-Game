import { useEffect, useRef, useState } from "react";
import React from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const [chat, setChat] = useState();

  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();
  const [userPlayingData, setUserPlayingData] = useState(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.id === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && text.trim() !== "") {
      handleSend();
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
    <div className="chat">
      <div className="top">
        <div className="user">
          <img
            src={userPlayingData ? userPlayingData.avatar : "/avatar.png"}
            alt="avatar"
          />
          <div className="texts">
            <span>
              {userPlayingData ? userPlayingData.username : "Loading..."}
            </span>
            <p>Guess who am I ! </p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="phone" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={index}
          >
            <img src="./avatar.png" alt="" />
            <div className="texts">
              {message.img && <img src={message.img} alt="msg" />}
              <p>{message.text}</p>
              {/*<span>{message.createdAt}</span>*/}
            </div>
          </div>
        ))}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          value={text}
          placeholder="Type a mesage.."
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
