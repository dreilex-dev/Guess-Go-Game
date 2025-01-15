import React, { useEffect, useState } from "react";
import "./addUser.css";
import { useUserStore } from "../../../../lib/userStore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, setAllPlayers, allPlayers, setCurrentUser } =
    useUserStore();

  useEffect(() => {
    if (!currentUser.game_code || !currentUser) {
      console.error("Game lobby code not found for the current user.");
      setLoading(false);
      return;
    }

    const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);

    const unsubscribeLobby = onSnapshot(gameLobbyDocRef, (gameLobbyDoc) => {
      if (gameLobbyDoc.exists()) {
        const lobbyData = gameLobbyDoc.data();

        if (lobbyData.participants && Array.isArray(lobbyData.participants)) {
          const filteredUsersIDs = lobbyData.participants.map(
            (user) => user.id
          );

          const usersInLobby = [];

          filteredUsersIDs.forEach((userId) => {
            const userDocRef = doc(db, "users", userId);
            onSnapshot(userDocRef, (userDoc) => {
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.game_code === currentUser.game_code) {
                  if (!usersInLobby.some((user) => user.id === userDoc.id)) {
                    usersInLobby.push({ id: userDoc.id, ...userData });
                  }
                  setUsers((prevUsers) => {
                    const updatedUsers = [...prevUsers, ...usersInLobby];

                    const uniqueUsers = updatedUsers.filter(
                      (value, index, self) =>
                        index === self.findIndex((t) => t.id === value.id)
                    );

                    return uniqueUsers;
                  });
                }
              }
            });
          });

          setAllPlayers(usersInLobby);
        } else {
          toast.error("No participants found in the lobby.");
        }
      } else {
        console.error("Game lobby does not exist.");
      }
    });

    return () => unsubscribeLobby();
  }, [currentUser, setAllPlayers]);

  useEffect(() => {
    if (users.length > 0) {
      setLoading(false);
    }
  }, [users]);

  useEffect(() => {
    if (users.length > 0) {
      const allUsersValid = users.every(
        (user) => user.is_playing && user.is_playing !== ""
      );
      if (!allUsersValid) {
        console.error("Not all users have a valid 'is_playing' property.");
        console.error(
          "Invalid users:",
          users.filter((user) => !user.is_playing)
        );
      }
    }
  }, [users]);

  const handlePlayersReady = async () => {
    try {
      await assignRandomIsPlaying();

      const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);
      await updateDoc(gameLobbyDocRef, { gameState: "ready" });

      setAllPlayers(users);
      toast.success("All players are ready!");
    } catch (error) {
      console.log("Failed to update game state or assign players.");
      console.error(error);
    }
  };

  const assignRandomIsPlaying = async () => {
    if (users.length < 2) {
      toast.error("Not enough players.");
      console.log("Not enough players to assign is_playing.");
      return;
    }

    try {
      let availableIds = [...users.map((user) => user.id)].sort(
        () => Math.random() - 0.5
      );
      let hasConflicts = true;

      while (hasConflicts) {
        hasConflicts = false;

        for (let i = 0; i < users.length; i++) {
          if (availableIds[i] === users[i].id) {
            hasConflicts = true;
            const swapIndex = (i + 1) % availableIds.length;
            [availableIds[i], availableIds[swapIndex]] = [
              availableIds[swapIndex],
              availableIds[i],
            ];
          }
        }
      }

      const updates = [];
      const updatedUsers = [];

      for (let i = 0; i < users.length; i++) {
        const currentUserId = users[i].id;
        const assignedId = availableIds[i];
        const userDocRef = doc(db, "users", currentUserId);
        updates.push(updateDoc(userDocRef, { is_playing: assignedId }));

        updatedUsers.push({
          ...users[i],
          is_playing: assignedId,
        });
      }

      await Promise.all(updates);
      setUsers(updatedUsers);
      console.log("Random is_playing assignments completed without conflicts!");
    } catch (error) {
      console.log("Failed to assign is_playing properties.");
      console.error(error);
    }
  };

  return (
    <div className="addUser">
      {loading ? (
        <p>Loading players...</p>
      ) : (
        <>
          {users.length > 0 ? (
            <div className="usersList">
              {users.map((user, index) => (
                <div key={index} className="user">
                  <div className="detail">
                    <img
                      src={user.avatar || "./avatar.png"}
                      alt={user.username || "user"}
                    />
                    <span>{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No player in this game lobby yet.</p>
          )}
        </>
      )}
      <button onClick={handlePlayersReady}>All Players Are Ready?</button>
    </div>
  );
};

export default AddUser;
