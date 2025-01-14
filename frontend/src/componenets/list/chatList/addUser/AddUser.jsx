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
      toast.error("Game lobby code not found for the current user.");
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

  const handlePlayersReady = async () => {
    try {
      const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);
      await updateDoc(gameLobbyDocRef, {
        gameState: "ready",
      });

      setAllPlayers(users);
      toast.success("All players are ready!");
      await assignRandomIsPlaying();

      const allUsersValid = users.every((user) => user.is_playing !== "");

      users.forEach((user) => {
        console.log(user);
      });

      if (!allUsersValid) {
        toast.error("Not all users have a valid 'is_playing' property.");
        return;
      }

      allUsersValid.map((user) => {
        console.log(user);
      });
    } catch (error) {
      toast.error("Failed to update game state.");
      console.error(error);
    }
  };

  const assignRandomIsPlaying = async () => {
    if (users.length < 2) {
      toast.error("Not enough users to assign is_playing.");
      return;
    }

    try {
      // Shuffle the user IDs
      let availableIds = [...users.map((user) => user.id)].sort(
        () => Math.random() - 0.5
      );

      console.log("Shuffled IDs for assignment:", availableIds);

      const updates = [];
      const updatedUsers = [];

      for (let i = 0; i < users.length; i++) {
        const currentUserId = users[i].id;

        // Find a valid ID (not the same as the current user's ID)
        let randomIdIndex = availableIds.findIndex(
          (id) => id !== currentUserId
        );
        if (randomIdIndex === -1) {
          toast.error("Unable to assign a valid is_playing ID.");
          return;
        }

        // Assign the ID and remove it from available IDs
        const randomId = availableIds[randomIdIndex];
        availableIds.splice(randomIdIndex, 1); // Remove the ID from the list
        console.log(`Assigning random ID ${randomId} to user ${currentUserId}`);

        const userDocRef = doc(db, "users", currentUserId);
        updates.push(updateDoc(userDocRef, { is_playing: randomId }));

        updatedUsers.push({
          ...users[i],
          is_playing: randomId,
        });

        if (currentUserId === currentUser.id) {
          setCurrentUser({ ...currentUser, is_playing: randomId });
        }
      }

      // Commit updates to Firestore
      await Promise.all(updates);
      setUsers(updatedUsers);
      toast.success("Random is_playing assignments completed!");
    } catch (error) {
      toast.error("Failed to assign is_playing properties.");
      console.error(error);
    }
  };

  console.log(
    " NeWWWWWWWWWWWWWWWWW allPlayers from the state in the adduser!",
    allPlayers
  );
  console.log(" NewWWWWWWWWWWWWWWWW users from the AddUser", users);

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
