import React, { useState,useEffect} from 'react';
import './login.css';
import { avatars } from '../../../public/avatars';
import { signInAnonymously } from "firebase/auth";
import { auth ,db} from '../../lib/firebase';
import { setDoc, doc,getDoc, collection, updateDoc,addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';

const Login = () => {
  
  const [avatarJoin, setAvatarJoin] = useState(null);
  const [gameCode, setGameCode] = useState('');
  const [usernameJoin, setUsernameJoin] = useState('');
  const [hintNo1Join, setHintNo1Join] = useState('');
  const [hintNo2Join, setHintNo2Join] = useState('');
  const [loadingJoin, setLoadingJoin] = useState(false);

  
  const [avatarCreate, setAvatarCreate] = useState(null);
  const [usernameCreate, setUsernameCreate] = useState('');
  const [hintNo1Create, setHintNo1Create] = useState('');
  const [hintNo2Create, setHintNo2Create] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);


  const [usedAvatars, setUsedAvatars] = useState([]);

  const getRandomAvatar = () => {
    const availableAvatars = avatars.filter((avatar) => !usedAvatars.includes(avatar));
    if (availableAvatars.length === 0) {
      alert("No avatars available! Please reset the game.");
      return null;
    }
    const randomAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
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
    setLoadingJoin(true);
    const formData= new FormData(e.target);
    const {username_join,game_code,hint_no1_join,hint_no2_join}=Object.fromEntries(formData);

    if (!username_join ||!game_code|| !hint_no1_join || !hint_no2_join) {
      toast.error("Please fill in all the fields.");
      setLoadingCreate(false); 
      return; 
    }
    
    try{
      const res =await signInAnonymously(auth);
      const userId = res.user.uid;

      const gameLobbyRef = doc(db, "gameLobby", game_code);
      const gameLobbySnap = await getDoc(gameLobbyRef);

      if (!gameLobbySnap.exists()) {
        toast.error("Invalid game code. Please try again.");
        return;
      }

      const gameLobbyData = gameLobbySnap.data();
      await updateDoc(gameLobbyRef, {
        participants: [...gameLobbyData.participants, { id: userId, username_join, avatar: avatarJoin }],
      });

      await addDoc(collection(db, "users"), {
        username:username_join,
        game_code,
        hint_no1:hint_no1_join,
        hint_no2:hint_no2_join,
        avatar:avatarJoin
      },{ merge: true });

      await addDoc(collection(db, "userChats",), {
        chats:[]
      },{ merge: true });
      toast.success('You can join the game now!')
    }catch(error){
      toast.error("An error occurred while joining the game. Please try again.");
      console.error(error);
    }finally{
      setLoadingJoin(false);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    

    const formData= new FormData(e.target);
    const {username_create,hint_no1_create,hint_no2_create}=Object.fromEntries(formData);

    if (!username_create || !hint_no1_create || !hint_no2_create) {
      toast.error("Please fill in all the fields.");
      setLoadingCreate(false); 
      return; 
    }

    try{
      const res =await signInAnonymously(auth);
      const userId = res.user.uid;

      const gameCode = nanoid(6); 

      await setDoc(doc(db, "users", userId ), {
        username:username_create,
        hint_no1:hint_no1_create,
        hint_no2:hint_no2_create,
        id:userId ,
        avatar:avatarCreate
      },{ merge: true });

      await setDoc(doc(db, "userChats", userId ), {
        chats:[],
      },{ merge: true });

      const gameLobbyRef = doc(db, "gameLobby", gameCode);
      await setDoc(gameLobbyRef, {
        gameCode,
        createdBy: userId,
        createdAt: serverTimestamp(),
        participants: [{ id: userId, username: username_create, avatar: avatarCreate }], // Add creator as first participant
      },{ merge: true });
      toast.success(`Game created successfully! Share this code with others: ${gameCode}`);
    }catch(error){
      console.error("Error creating game:", error);
      toast.error("Failed to create game. Please try again.");
    }finally{
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
        <img src={avatarJoin || './avatar.png'} alt="Avatar" style={{ width: '100px', height: '100px' }} />
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
            {loadingJoin ? 'Loading...' : 'Join a Lobby'}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create a Game</h2>
        <form onSubmit={handleCreateGame}>
        <img src={avatarCreate || './avatar.png'} alt="Avatar" style={{ width: '100px', height: '100px' }} />
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
            {loadingCreate ? 'Loading...' : 'Create a Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
