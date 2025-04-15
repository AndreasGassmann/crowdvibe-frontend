// components/game-display.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previousRoundId = useRef<string | null>(null);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    setIsLoading(true);
    isLoadingRef.current = true;

    // Check if this is a new round (different from the previous one)
    const isNewRound = currentRound?.id !== previousRoundId.current;

    // Update the previousRoundId ref
    if (currentRound?.id) {
      previousRoundId.current = currentRound.id;
    }

    if (currentRound?.id) {
      console.log("Loading game for round:", currentRound.id);
      // Build the URL for the game
      const gameEndpoint = `${API_BASE_URL}/rounds/${currentRound.id}/game/`;

      // Try to fetch the game
      fetch(gameEndpoint)
        .then((response) => {
          if (response.ok) {
            console.log("Game found at:", gameEndpoint);
            setGameUrl(gameEndpoint);
          } else {
            console.warn("Game not found, using placeholder");
            setGameUrl("/games/sample-game.html");
          }
        })
        .catch((error) => {
          console.error("Error fetching game:", error);
          setGameUrl("/games/sample-game.html");
        })
        .finally(() => {
          setIsLoading(false);
          isLoadingRef.current = false;

          // If this is a new round and we have an iframe reference, reload it
          if (isNewRound && iframeRef.current && !isLoadingRef.current) {
            console.log("Reloading iframe for new round:", currentRound.id);

            // We need to use setTimeout to ensure the src has been updated
            setTimeout(() => {
              if (iframeRef.current) {
                // Force reload by accessing the contentWindow
                const frame = iframeRef.current;
                frame.src = frame.src;
              }
            }, 100);
          }
        });
    } else {
      console.log("No round ID, using placeholder game");
      setGameUrl("/games/sample-game.html");
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentRound]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("handleMessage", event);

      try {
        console.log("event.data", event.data);
        const score = Number(event.data);
        console.log("score", score);
        if (typeof score === "number" && !isNaN(score) && currentRound) {
          // Create or update leaderboard entry via websocket
          console.log("Creating leaderboard entry:", score);
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
              ref={iframeRef}
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
