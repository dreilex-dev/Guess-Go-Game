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
  getDocs,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [searching, setSearching] = useState(false);

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
                    const updatedItem = { ...item, user };

                    const usersInChat = [user, ...(item.users || [])];
                    for (const chatUser of usersInChat) {
                      if (chatUser.is_playing) {
                        const opponentRef = doc(
                          db,
                          "users",
                          chatUser.is_playing
                        );
                        const opponentDoc = await getDoc(opponentRef);

                        if (opponentDoc.exists()) {
                          const opponentData = opponentDoc.data();
                          updatedItem.is_playing_as_avatar =
                            opponentData?.avatar;
                          updatedItem.is_playing_as_username =
                            opponentData?.username;
                        } else {
                          console.log("Opponent document does not exist");
                        }
                      }
                    }

                    console.log(
                      "Updated item with opponent data:",
                      updatedItem
                    );

                    return updatedItem;
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
              return null;
            });

            const chatData = (await Promise.all(promises)).filter(Boolean);
            console.log("Processed chat data with opponents:", chatData);

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
        const userData = doc.data();
        newUsers.push(userData);

        // Check if is_playing changed for this user
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (
              chat.receiverId === userData.id ||
              chat.senderId === userData.id
            ) {
              const updatedChat = { ...chat };

              if (userData.is_playing) {
                updatedChat.is_playing_as_avatar = userData.avatar;
                updatedChat.is_playing_as_username = userData.username;
              } else {
                updatedChat.is_playing_as_avatar = null;
                updatedChat.is_playing_as_username = null;
              }

              return updatedChat;
            }
            return chat;
          })
        );
      });

      // Update the users state for rendering or other operations
      setUsers(newUsers.filter((user) => user.id !== currentUser.id));
    });

    return () => unsubscribe();
  }, [currentUser]);

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
      setSearchTerm("");
      setFilteredChats([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRefresh = async () => {
    fetchGameAndUsers();
    toast.info("Refreshing user data...");
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      toast.error("Please enter a name to search.");
      handleRefresh();
      setSearching(false);
      return;
    }

    setLoading(true);
    try {
      const userCollectionRef = collection(db, "users");

      const usernameQuery = query(
        userCollectionRef,
        where("username", "==", searchTerm.toLowerCase())
      );

      const userSnapshot = await getDocs(usernameQuery);

      if (userSnapshot.empty) {
        setLoading(false);
        toast.info("No user found with the specified username.");
        return;
      }

      let fackIdentity = null;
      userSnapshot.forEach((doc) => {
        fackIdentity = { id: doc.id, ...doc.data() };
      });

      const isPlayingQuery = query(
        userCollectionRef,
        where("is_playing", "==", fackIdentity.id)
      );

      const isPlayingSnapshot = await getDocs(isPlayingQuery);

      if (isPlayingSnapshot.empty) {
        setLoading(false);
        toast.info("No users found with the specified is_playing ID.");
        return;
      }

      const users = [];
      isPlayingSnapshot.forEach((doc) => {
        const userData = doc.data();

        let matchedChat = null;

        chats.forEach((chat) => {
          if (
            chat.id.includes(currentUser.id) &&
            chat.id.includes(userData.id)
          ) {
            console.log(
              "Found matching chat:",
              chat.id,
              currentUser.id,
              userData.id
            );
            matchedChat = chat;
          }
        });

        if (matchedChat) {
          const chatData = {
            id: matchedChat.id,
            lastMessage: matchedChat.lastMessage,
            receiverId: userData.id,
            senderId: currentUser.id,
            updatedAt: Date.now(),
            is_playing_as_username: fackIdentity.username,
            is_playing_as_avatar: fackIdentity.avatar,
            user: userData,
          };

          users.push(chatData);
        } else {
          console.log("No matching chat found.");
        }
      });

      setFilteredChats(users);
      toast.success("Users found successfully!");
      setSearching(false);

      chats.forEach((chat) => {
        console.log("all chats", chat.id);
      });
    } catch (error) {
      console.error("Error in handleSearch:", error);
      toast.error("An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearching(true);
      handleSearch();
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredChats([]);
    }
  }, [searchTerm]);

  console.log("Chatssssssss", chats);
  console.log(filteredChats);

  return (
    <>
      <div className="chatList">
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="" onClick={handleSearch} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <img
            src={"refresh.png"}
            onClick={handleRefresh}
            className="refreshButton"
            alt="refresh"
          />
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          (filteredChats.length > 0 && searchTerm !== "" && !searching
            ? filteredChats
            : chats
          ).map((chat, index) => (
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
                src={
                  chat.is_playing_as_avatar || "../../../../public/avatar.png"
                }
                alt={chat.is_playing_as_username}
              />
              <div className="texts">
                <span>{chat.is_playing_as_username}</span>
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
