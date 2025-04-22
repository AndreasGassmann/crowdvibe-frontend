// components/game-display.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Round } from "@/types/api";
import { roomStateService } from "@/lib/room-state-service";
import { API_URL } from "@/lib/config";
import type { MultiplayerData } from "@/lib/room-state-service";

const API_BASE_URL = API_URL;

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
            setGameUrl("");
          }
        })
        .catch((error) => {
          console.error("Error fetching game:", error);
          setGameUrl("");
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
      setGameUrl("");
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentRound]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("Received message from game iframe:", event);

      try {
        // Handle score updates
        if (typeof event.data === "number" || typeof event.data === "string") {
          const score = Number(event.data);
          console.log("Received score update:", score);
          if (!isNaN(score) && currentRound) {
            roomStateService.createLeaderboardEntry(score);
          }
          return;
        }

        // Handle multiplayer broadcasts
        if (event.data && typeof event.data === "object") {
          // Handle score updates that come as objects
          if (
            typeof event.data.score === "number" ||
            typeof event.data.score === "string"
          ) {
            const score = Number(event.data.score);
            console.log("Received score update:", score);
            if (!isNaN(score) && currentRound) {
              roomStateService.createLeaderboardEntry(score);
            }
          }

          // Handle multiplayer broadcasts
          if (event.data.type === "multiplayer_broadcast" && event.data.data) {
            console.log(
              "Received multiplayer broadcast from game:",
              event.data.data
            );
            // Forward the data to other players via WebSocket
            roomStateService.sendMultiplayerBroadcast(
              event.data.data as MultiplayerData
            );
          }
        }
      } catch (error) {
        console.error("Failed to handle game message:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentRound]);

  // Handle incoming multiplayer events from WebSocket and forward to game iframe
  useEffect(() => {
    const handleMultiplayerEvent = (event: {
      type: string;
      data: MultiplayerData;
    }) => {
      console.log("Received multiplayer event from WebSocket:", event);
      if (
        event.type === "multiplayer_event" &&
        iframeRef.current?.contentWindow
      ) {
        // Forward the event data to the game iframe
        iframeRef.current.contentWindow.postMessage(
          {
            type: "multiplayer_event",
            data: event.data,
          },
          "*"
        ); // TODO: Replace with specific origin in production
      }
    };

    // Subscribe to multiplayer events
    roomStateService.subscribeToMultiplayerEvents(handleMultiplayerEvent);

    return () => {
      // Unsubscribe when component unmounts
      roomStateService.unsubscribeFromMultiplayerEvents(handleMultiplayerEvent);
    };
  }, []);

  return (
    <Card className="flex-1 flex flex-col h-full dark:border-gray-800">
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
          </div>
        ) : gameUrl ? (
          <div className="w-full h-full">
            <iframe
              ref={iframeRef}
              src={gameUrl}
              className="w-full h-full border-0"
              title="Game"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              The game will be available soon
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
