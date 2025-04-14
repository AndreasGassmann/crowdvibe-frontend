// components/game-display.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Round } from "@/types/api";
import { roomStateService } from "@/lib/room-state-service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crowdvibe.lukeisontheroad.com/api/v1";

interface GameDisplayProps {
  currentRound: Round | null;
}

export default function GameDisplay({ currentRound }: GameDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [gameUrl, setGameUrl] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);

    if (currentRound?.game) {
      // Check if the game file exists
      fetch(`${API_BASE_URL}/rounds/${currentRound.id}/game/`)
        .then((response) => {
          if (response.ok) {
            setGameUrl(`${API_BASE_URL}/rounds/${currentRound.id}/game/`);
          } else {
            setGameUrl("/crowdvibe-frontend/games/sample-game.html");
          }
        })
        .catch(() => {
          setGameUrl("/crowdvibe-frontend/games/sample-game.html");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setGameUrl("/crowdvibe-frontend/games/sample-game.html");
      setIsLoading(false);
    }
  }, [currentRound]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("handleMessage", event);

      try {
        const score = Number(event.data);
        if (typeof score === "number" && score > 0 && currentRound) {
          // Create or update leaderboard entry via websocket
          roomStateService.createLeaderboardEntry(score);
        }
      } catch (error) {
        console.error("Failed to update leaderboard:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentRound]);

  return (
    <Card className="flex-1 flex flex-col h-full dark:border-gray-800">
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
          </div>
        ) : (
          <div className="w-full h-full">
            <iframe
              src={gameUrl}
              className="w-full h-full border-0"
              title="Game"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
