import React, { useEffect, useState } from "react";
import "./addUser.css";
import { useUserStore } from "../../../../lib/userStore";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, setAllPlayers } = useUserStore();

  const fetchUsersInLobby = async () => {
    if (!currentUser.game_code || !currentUser) {
      toast.error("Game lobby code not found for the current user.");
      return;
    }

    setLoading(true);
    try {
      const gameLobbyDocRef = doc(db, "gameLobby", currentUser.game_code);
      const gameLobbyDoc = await getDoc(gameLobbyDocRef);

      if (gameLobbyDoc.exists()) {
        const lobbyData = gameLobbyDoc.data();

        if (lobbyData.participants && Array.isArray(lobbyData.participants)) {
          const filteredUsersIDs = lobbyData.participants
            .filter((user) => user.id !== currentUser.id)
            .map((user) => user.id);
          const usersInLobby = [];

          for (const userId of filteredUsersIDs) {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.game_code === currentUser.game_code) {
                usersInLobby.push({ id: userDoc.id, ...userData });
              }
            }
          }

          setUsers(usersInLobby);
          setAllPlayers(usersInLobby);
          toast.success("Users fetched successfully!");
        } else {
          toast.error("No participants found in the lobby.");
        }
      } else {
        console.error("Game lobby does not exist.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (e) => {
    e.preventDefault();
    await fetchUsersInLobby();
  };

  console.log("users from the lobby", users);

  return (
    <div className="addUser">
      <form onSubmit={handleRefresh}>
        <button type="submit" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </form>
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
    </div>
  );
};

export default AddUser;
