import React, { useState, useEffect } from "react";
import "./login.css";
import { avatars } from "../../../public/avatars";
import { signInAnonymously } from "firebase/auth";
import { db } from "../../lib/firebase";
import {
  setDoc,
  doc,
  getDoc,
  collection,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { useUserStore } from "../../lib/userStore";

const Login = () => {
  const [avatarJoin, setAvatarJoin] = useState(null);
  const [gameCode, setGameCode] = useState("");
  const [usernameJoin, setUsernameJoin] = useState("");
  const [hintNo1Join, setHintNo1Join] = useState("");
  const [hintNo2Join, setHintNo2Join] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);

  const [avatarCreate, setAvatarCreate] = useState(null);
  const [usernameCreate, setUsernameCreate] = useState("");
  const [hintNo1Create, setHintNo1Create] = useState("");
  const [hintNo2Create, setHintNo2Create] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [usedAvatars, setUsedAvatars] = useState([]);
  const resetUser = useUserStore((state) => state.resetUser);

  const getRandomAvatar = () => {
    const availableAvatars = avatars.filter(
      (avatar) => !usedAvatars.includes(avatar)
    );
    if (availableAvatars.length === 0) {
      alert("No avatars available! Please reset the game.");
      return null;
    }
    const randomAvatar =
      availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
    return randomAvatar;
  };

  const handleAvatarJoin = () => {
    const selectedAvatar = getRandomAvatar();
    if (selectedAvatar) {
      setAvatarJoin(selectedAvatar);
      setUsedAvatars([...usedAvatars, selectedAvatar]);
    }
  };
  const handleAvatarCreate = () => {
    const selectedAvatar = getRandomAvatar();
    if (selectedAvatar) {
      setAvatarCreate(selectedAvatar);
      setUsedAvatars([...usedAvatars, selectedAvatar]);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    await resetUser();
    setLoadingJoin(true);
    const formData = new FormData(e.target);
    const { username_join, game_code, hint_no1_join, hint_no2_join } =
      Object.fromEntries(formData);

    if (!username_join || !game_code || !hint_no1_join || !hint_no2_join) {
      toast.error("Please fill in all the fields.");
      setLoadingJoin(false);
      return;
    }

    try {
      const gameLobbyRef = doc(db, "gameLobby", game_code);
      const gameLobbySnap = await getDoc(gameLobbyRef);

      const gameLobbyData = gameLobbySnap.data();

      if (!gameLobbySnap.exists()) {
        toast.error("Invalid game code. Please try again.");
        setLoadingJoin(false);
        window.location.reload();
        return;
      }

      const userQuery = query(
        collection(db, "users"),
        where("username", "==", username_join),
        where("game_code", "==", game_code)
      );

      const userSnap = await getDocs(userQuery);
      let userId;

      if (!userSnap.empty) {
        const existingUser = userSnap.docs[0].data();
        userId = existingUser.id;

        useUserStore.getState().setCurrentUser({
          id: userId,
          username: existingUser.username,
          game_code: existingUser.game_code,
          hint_no1: existingUser.hint_no1,
          hint_no2: existingUser.hint_no2,
          avatar: existingUser.avatar,
          no_of_hints: existingUser.no_of_hints,
          points: existingUser.points,
          is_playing: existingUser.is_playing,
        });

        toast.success("Welcome back! You have joined the game.");
      } else {
        if (
          gameLobbyData.participants &&
          gameLobbyData.participants.length >= 6
        ) {
          toast.error("Sorry, the lobby is full. You cannot join.");
          setLoadingJoin(false);
          return;
        }
        userId = nanoid();
        useUserStore.getState().setCurrentUser({
          id: userId,
          username: username_join,
          game_code,
          hint_no1: hint_no1_join,
          hint_no2: hint_no2_join,
          avatar: avatarJoin,
          no_of_hints: 3,
          points: 0,
          is_playing: "",
        });

        await updateDoc(gameLobbyRef, {
          participants: [
            ...gameLobbyData.participants,
            {
              id: userId,
            },
          ],
        });

        await setDoc(
          doc(db, "users", userId),
          {
            id: userId,
            username: username_join,
            game_code,
            hint_no1: hint_no1_join,
            hint_no2: hint_no2_join,
            avatar: avatarJoin,
            no_of_hints: 3,
            points: 0,
            is_playing: "",
          },
          { merge: true }
        );

        await setDoc(
          doc(db, "userChats", userId),
          {
            chats: [],
          },
          { merge: true }
        );

        toast.success("You can join the game now!");
      }
    } catch (error) {
      toast.error(
        "An error occurred while joining the game. Please try again."
      );
      console.error(error);
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    await resetUser();
    setLoadingCreate(true);

    const formData = new FormData(e.target);
    const { username_create, hint_no1_create, hint_no2_create } =
      Object.fromEntries(formData);

    if (!username_create || !hint_no1_create || !hint_no2_create) {
      toast.error("Please fill in all the fields.");
      setLoadingCreate(false);
      return;
    }

    try {
      const userId = nanoid();

      const gameCode = nanoid(6);

      await useUserStore.getState().setCurrentUser({
        id: userId,
        username: username_create,
        game_code: gameCode,
        hint_no1: hint_no1_create,
        hint_no2: hint_no2_create,
        avatar: avatarCreate,
        no_of_hints: 3,
        points: 0,
        is_playing: "",
      });

      await setDoc(
        doc(db, "users", userId),
        {
          id: userId,
          username: username_create,
          game_code: gameCode,
          hint_no1: hint_no1_create,
          hint_no2: hint_no2_create,
          avatar: avatarCreate,
          no_of_hints: 3,
          points: 0,
          is_playing: "",
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "userChats", userId),
        {
          chats: [],
        },
        { merge: true }
      );

      const gameLobbyRef = doc(db, "gameLobby", gameCode);
      await setDoc(
        gameLobbyRef,
        {
          gameCode,
          createdBy: userId,
          createdAt: serverTimestamp(),
          participants: [{ id: userId }],
          gameState: "notReady",
        },
        { merge: true }
      );
      toast.success(
        `Game created successfully! Share this code with others: ${gameCode}`
      );
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game. Please try again.");
    } finally {
      setLoadingCreate(false);
    }
  };

  useEffect(() => {
    handleAvatarJoin();
    handleAvatarCreate();
  }, []);

  return (
    <div className="login">
      <div className="item">
        <h2>Join a Game</h2>
        <form onSubmit={handleJoinGame}>
          <img
            src={avatarJoin || "./avatar.png"}
            alt="Avatar"
            style={{ width: "100px", height: "100px" }}
          />
          <input
            type="text"
            placeholder="Game Code"
            name="game_code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Username"
            name="username_join"
            value={usernameJoin}
            onChange={(e) => setUsernameJoin(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hint No1"
            name="hint_no1_join"
            value={hintNo1Join}
            onChange={(e) => setHintNo1Join(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hint No2"
            name="hint_no2_join"
            value={hintNo2Join}
            onChange={(e) => setHintNo2Join(e.target.value)}
          />
          <button disabled={loadingJoin}>
            {loadingJoin ? "Loading..." : "Join a Lobby"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create a Game</h2>
        <form onSubmit={handleCreateGame}>
          <img
            src={avatarCreate || "./avatar.png"}
            alt="Avatar"
            style={{ width: "100px", height: "100px" }}
          />
          <input
            type="text"
            placeholder="Username"
            name="username_create"
            value={usernameCreate}
            onChange={(e) => setUsernameCreate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hint No1"
            name="hint_no1_create"
            value={hintNo1Create}
            onChange={(e) => setHintNo1Create(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hint No2"
            name="hint_no2_create"
            value={hintNo2Create}
            onChange={(e) => setHintNo2Create(e.target.value)}
          />
          <button disabled={loadingCreate}>
            {loadingCreate ? "Loading..." : "Create a Lobby"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
