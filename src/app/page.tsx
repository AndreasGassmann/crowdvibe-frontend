// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import GameDisplay from "@/components/game-display";
import SidePanel from "@/components/side-panel";
import { api } from "@/lib/api";
import { Room, Round } from "@/types/api";

export default function Home() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rooms = await api.getRooms();
        if (rooms.length > 0) {
          setCurrentRoom(rooms[0]);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRounds = async () => {
      if (!currentRoom) return;
      try {
        const rounds = await api.getRounds(currentRoom.id);
        if (rounds.length > 0) {
          setCurrentRound(rounds[rounds.length - 1]);
        }
      } catch (error) {
        console.error("Failed to fetch rounds:", error);
      }
    };
    fetchRounds();
  }, [currentRoom]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Header currentRound={currentRound} />
      <main className="flex flex-1 flex-col md:flex-row p-4 gap-4 w-full overflow-hidden">
        <GameDisplay currentRound={currentRound} />
        <SidePanel />
      </main>
    </div>
  );
}
