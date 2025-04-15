"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Room } from "@/types/api";

export default function RoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const rooms = await api.getRooms();
        const currentRoom = rooms.find((r) => r.id === roomId);
        if (!currentRoom) {
          setError("Room not found");
        } else {
          setRoom(currentRoom);
        }
      } catch {
        setError("Failed to load room");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  if (isLoading) {
    return <div>Loading room...</div>;
  }

  if (error || !room) {
    return (
      <div>
        <p>{error || "Room not found"}</p>
        <button onClick={() => router.push("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Room: {room.name}</h1>
      <button onClick={() => router.push("/")}>Leave Room</button>
    </div>
  );
}
