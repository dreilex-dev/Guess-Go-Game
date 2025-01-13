import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [userChatsReady, setUserChatsReady] = useState(false);
  const { currentUser, allPlayers } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasCreatedChats, setHasCreatedChats] = useState(false);

  //console.log("All players from the store", allPlayers);

  const fetchGameAndUsers = async () => {
    if (!currentUser || !currentUser.game_code) {
      console.error("Invalid currentUser or game_code.");
      return;
    }

    setLoading(true);

    try {
      const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);
      const gameLobbyDoc = await getDoc(gameLobbyDocRef);

      if (gameLobbyDoc.exists()) {
        const lobbyData = gameLobbyDoc.data();

        if (lobbyData.participants && Array.isArray(lobbyData.participants)) {
          const filteredUsers = lobbyData.participants.filter(
            (user) => user.id !== currentUser.id
          );
          setUsers(filteredUsers);

          if (!hasCreatedChats) {
            await createChatsAndAddUsers(filteredUsers);
            setHasCreatedChats(true);
          }
        } else {
          toast.error("No participants found in the lobby.");
        }
      } else {
        console.error("Game lobby does not exist.");
      }
    } catch (error) {
      console.error("Error fetching game lobby:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChatsAndAddUsers = async (filteredUsers) => {
    if (!currentUser || !currentUser.id) {
      console.error("Current user is not defined or not loaded yet.");
      return;
    }

    try {
      for (const user of filteredUsers) {
        if (!user || !user.id) {
          console.error("User with ID ${user.id} does not exist.");
          continue;
        }

        const currentUserRef = doc(db, "users", currentUser.id);
        const userRef = doc(db, "users", user.id);

        const currentUserDoc = await getDoc(currentUserRef);
        const userDoc = await getDoc(userRef);

        if (!currentUserDoc.exists() || !userDoc.exists()) {
          console.error(
            "One or both users do not exist: ${currentUser.id}, ${user.id}"
          );
          continue;
        }

        const chatId = [currentUser.id, user.id].sort().join("_");

        const newChatRef = doc(db, "chats", chatId);

        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        const currentUserChatsRef = doc(db, "userChats", currentUser.id);
        const userChatsRef = doc(db, "userChats", user.id);

        const currentUserChatsSnap = await getDoc(currentUserChatsRef);
        const userChatsSnap = await getDoc(userChatsRef);

        if (currentUserChatsSnap.exists() && userChatsSnap.exists()) {
          const existingCurrentUserChats =
            currentUserChatsSnap.data().chats || [];
          const existingUserChats = userChatsSnap.data().chats || [];

          const chatCurrentUserExists = existingCurrentUserChats.some(
            (chat) => chat.id === newChatRef.id
          );
          const chatUserExists = existingUserChats.some(
            (chat) => chat.id === newChatRef.id
          );

          if (!chatCurrentUserExists) {
            await updateDoc(currentUserChatsRef, {
              chats: arrayUnion({
                id: newChatRef.id,
                lastMessage: "",
                receiverId: user.id,
                senderId: currentUser.id,
                updatedAt: Date.now(),
              }),
            });
          }
          if (!chatUserExists) {
            await updateDoc(userChatsRef, {
              chats: arrayUnion({
                id: newChatRef.id,
                lastMessage: "",
                receiverId: currentUser.id,
                senderId: user.id,
                updatedAt: Date.now(),
              }),
            });
          }
        }
      }

      toast.success("Chats created and users added!");
    } catch (err) {
      console.error("Error adding users to chat:", err);
      toast.error("Failed to create chats or add users.");
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchGameAndUsers();
    }
  }, [currentUser, hasCreatedChats]);

  useEffect(() => {
    if (currentUser?.id) {
      const unSub = onSnapshot(
        doc(db, "userChats", currentUser.id),
        async (res) => {
          if (res.exists()) {
            const items = res.data().chats || [];

            const uniqueItems = Array.from(
              new Map(items.map((item) => [item.id, item])).values()
            );

            const promises = uniqueItems.map(async (item) => {
              try {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                  const user = userDocSnap.data();

                  if (user?.game_code === currentUser.game_code) {
                    return { ...item, user };
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
              return null;
            });

            const chatData = (await Promise.all(promises)).filter(Boolean);

            console.log("chatData", chatData);

            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
          } else {
            console.error("User chats document does not exist.");
          }
        }
      );

      return () => {
        unSub();
      };
    } else {
      console.error("Current user is not defined.");
    }
  }, [currentUser.id]);

  useEffect(() => {
    const userCollectionRef = collection(db, "users");
    const q = query(userCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newUsers = [];
      snapshot.forEach((doc) => {
        newUsers.push(doc.data());
      });

      const filteredUsers = newUsers.filter(
        (user) => user.id !== currentUser.id
      );
      setUsers(filteredUsers);

      if (filteredUsers.length > 0 && !hasCreatedChats) {
        createChatsAndAddUsers(filteredUsers);
        setHasCreatedChats(true);
      }
    });

    return () => unsubscribe();
  }, [currentUser, hasCreatedChats]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.id === chat.id);
    userChats[chatIndex].isSeen = true;
    const userChatRef = doc(db, "userChats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.id, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/*<AddUser />*/}
      <div className="chatList">
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="" />
            <input type="text" placeholder="Search" onChange={() => {}} />
          </div>
        </div>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          chats.map((chat, index) => (
            <div
              key={index}
              className="item"
              onClick={() => handleSelect(chat)}
              style={{
                border: chat?.isSeen
                  ? "1px solid transparent"
                  : "2px solid #1B9AAA",
                borderRadius: "8px",
                padding: "20px",
                margin: "5px",
              }}
            >
              <img
                src={chat.user.avatar || "../../../../public/avatar.png"}
                alt={chat.user.username}
              />
              <div className="texts">
                <span>{chat.user.username}</span>
                <p>{chat.lastMessage}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ChatList;
