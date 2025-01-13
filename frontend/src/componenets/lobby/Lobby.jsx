import React, { useEffect, useState } from "react";
import { useUserStore } from "../../lib/userStore";
import GameCode from "./GameCode";
import PlayerCard from "./PlayerCard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const Lobby = () => {
  const [players, setPlayers] = useState([]);
  const currentUser = useUserStore((state) => state.currentUser);

  const lobbyCode = currentUser?.game_code || "No Lobby Code";

  useEffect(() => {
    const fetchPlayersFromLobby = async () => {
      try {
        const lobbyRef = doc(db, "gameLobby", lobbyCode);
        const lobbySnap = await getDoc(lobbyRef);

        if (lobbySnap.exists()) {
          const lobbyData = lobbySnap.data();
          const participantIds = lobbyData.participants.map(
            (participant) => participant.id
          );

          const fetchedPlayers = [];
          for (const playerId of participantIds) {
            const playerRef = doc(db, "users", playerId);
            const playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
              fetchedPlayers.push(playerSnap.data());
            }
          }

          setPlayers(fetchedPlayers);
        } else {
          console.error("Lobby does not exist!");
        }
      } catch (error) {
        console.error("Error fetching lobby players:", error);
      }
    };

    fetchPlayersFromLobby();
  }, [lobbyCode]);

  const handleChat = (player) => {
    console.log(`Starting chat with player ID: ${player.id}`);
  };

  const handleReveal = (player) => {
    console.log(`Revealing information for player ID: ${player.id}`);
  };

  return (
    <div className="d-flex flex-column align-items-center py-4">
      <GameCode gameCode={lobbyCode} />
      <div className="row g-4">
        {players.map((player) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={player.id}>
            <PlayerCard
              avatar={player.avatar}
              onChat={() => handleChat(player)}
              onReveal={() => handleReveal(player)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
