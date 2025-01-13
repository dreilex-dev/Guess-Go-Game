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

const App = () => {
  const {
    currentUser,
    isLoading,
    fetchUserInfo,
    incrementPoints,
    decrementHints,
    setIsPlaying,
  } = useUserStore();

  const { chatId } = useChatStore();

  useEffect(() => {
    if (!currentUser) {
      fetchUserInfo(currentUser?.id);
    }
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading..</div>;
  return (
    <div className="container">
      {currentUser ? (
        <>
          {true && <List />}
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
