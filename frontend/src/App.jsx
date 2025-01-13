import Details from "./componenets/details/Details";
import List from "./componenets/list/List";
import Chat from "./componenets/chat/Chat";
import Login from "./componenets/login/Login";
import Notification from "./componenets/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import AddUser from "./componenets/list/chatList/addUser/AddUser";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";

const App = () => {
  const {
    currentUser,
    isLoading,
    fetchUserInfo,
    incrementPoints,
    decrementHints,
    setIsPlaying,
    allPlayers,
    gameState,
    setGameState,
  } = useUserStore();

  const { chatId } = useChatStore();

  useEffect(() => {
    if (!currentUser) {
      fetchUserInfo(currentUser?.id);
    }
  }, [fetchUserInfo]);

  useEffect(() => {
    if (currentUser && currentUser.game_code) {
      const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);
      const unsubscribe = onSnapshot(gameLobbyDocRef, (gameLobbyDoc) => {
        if (gameLobbyDoc.exists()) {
          const lobbyData = gameLobbyDoc.data();
          if (lobbyData.gameState === "ready") {
            setGameState("ready");
          }
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser, currentUser?.game_code, setGameState]);

  if (isLoading) return <div className="loading">Loading..</div>;
  return (
    <div className="container">
      {currentUser ? (
        <>
          {gameState !== "ready" && <AddUser />}
          {gameState === "ready" && <List />}
          {chatId && <Chat />}
          {chatId && <Details />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
